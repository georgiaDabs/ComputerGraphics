// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +        // Normal
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
  'varying vec4 v_Color;\n' +
  'uniform bool u_isLighting;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '  if(u_isLighting)\n' + 
  '  {\n' +
  '     vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
  '     float nDotL = max(dot(normal, u_LightDirection), 0.0);\n' +
        // Calculate the color due to diffuse reflection
  '     vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
  '     v_Color = vec4(diffuse, a_Color.a);\n' +  '  }\n' +
  '  else\n' +
  '  {\n' +
  '     v_Color = a_Color;\n' +
  '  }\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var modelMatrix = new Matrix4(); // The model matrix
var viewMatrix = new Matrix4();  // The view matrix
var projMatrix = new Matrix4();  // The projection matrix
var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals
var ANGLE_STEP_SIGN=3.0;
var ANGLE_STEP = 3.0;  // The increments of rotation angle (degrees)
var g_xAngle = 0.0;    // The rotation x angle (degrees)
var g_yAngle = 0.0;    // The rotation y angle (degrees)
var signRotate=180.0;
var carDrive=0.0;
var perspective=40;
var signClockwise=true;
var zoom=1.0;
var cubeColours=new Float32Array([]);
var colourInt=0;
var pyramidVertices = new Float32Array([
    // Front face
    0.0,  1.0,  0.0,
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    // Right face
    0.0,  1.0,  0.0,
    1.0, -1.0,  1.0,
    1.0, -1.0, -1.0,
    // Back face
    0.0,  1.0,  0.0,
    1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,
    // Left face
    0.0,  1.0,  0.0,
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0
  ]);
var xCentre=0.0;
var yCentre=0.0;
var zCentre=0.0;
var orangeOn=false;
var redOn=false;
var lorryY=-2.0;
var greenOn=true;
var blueColours=new Float32Array([
  0,0,1,0,0,1,0,0,1,0,0,1,
  0,0,1,0,0,1,0,0,1,0,0,1,
  0,0,1,0,0,1,0,0,1,0,0,1,
  0,0,1,0,0,1,0,0,1,0,0,1,
  0,0,1,0,0,1,0,0,1,0,0,1,
  0,0,1,0,0,1,0,0,1,0,0,1
  ]);
var orangeColours=new Float32Array([
1,0.645,0,1,0.645,0,1,0.645,0,1,0.645,0,
1,0.645,0,1,0.645,0,1,0.645,0,1,0.645,0,
1,0.645,0,1,0.645,0,1,0.645,0,1,0.645,0,
1,0.645,0,1,0.645,0,1,0.645,0,1,0.645,0,
1,0.645,0,1,0.645,0,1,0.645,0,1,0.645,0,
1,0.645,0,1,0.645,0,1,0.645,0,1,0.645,0
  ]);
var greenColours=new Float32Array([
  0,1,0,0,1,0,0,1,0,0,1,0,
  0,1,0,0,1,0,0,1,0,0,1,0,
  0,1,0,0,1,0,0,1,0,0,1,0,
  0,1,0,0,1,0,0,1,0,0,1,0,
  0,1,0,0,1,0,0,1,0,0,1,0,
  0,1,0,0,1,0,0,1,0,0,1,0
  ]);
var greenyBrownColours=new Float32Array([
  0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,
  0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,
  0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,
  0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,
  0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,
  0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,0.5977,0.3984,0.1992,
]);
var brownColours=new Float32Array([
  0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,
  0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,
  0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,
  0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,
  0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,
  0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875,0.4375,0.3125,0.21875
  ]);
var whiteColours = new Float32Array([    // Colors
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v0-v1-v2-v3 front
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v0-v3-v4-v5 right
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v0-v5-v6-v1 up
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v6-v7-v2 left
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v7-v4-v3-v2 down
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1　    // v4-v7-v6-v5 back
 ]);
var redColours=new Float32Array([
  1,0,0,1,0,0,1,0,0,1,0,0,
  1,0,0,1,0,0,1,0,0,1,0,0,
  1,0,0,1,0,0,1,0,0,1,0,0,
  1,0,0,1,0,0,1,0,0,1,0,0,
  1,0,0,1,0,0,1,0,0,1,0,0,
  1,0,0,1,0,0,1,0,0,1,0,0
  ]);
var blackColours=new Float32Array([
0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,
0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,
0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,
0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,
0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,
0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1
    ]);
var pyramidColours=new Float32Array([
    1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,
    1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,
    1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,
    1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0
    ]);
var lightGreyColours=new Float32Array([
0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,
0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,
0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,
0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,
0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,
0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7,0.8,0.8,0.7
  ]);
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set clear color and enable hidden surface removal
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Get the storage locations of uniform attributes
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');

  // Trigger using lighting or not
  var u_isLighting = gl.getUniformLocation(gl.program, 'u_isLighting'); 

  if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix ||
      !u_ProjMatrix || !u_LightColor || !u_LightDirection ||
      !u_isLighting ) { 
    console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.5, 3.0, 4.0]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  // Calculate the view matrix and the projection matrix
  viewMatrix.setLookAt(0, 0, 15, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(perspective, canvas.width/canvas.height, 1, 100);
  // Pass the model, view, and projection matrix to the uniform variable respectively
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);


  document.onkeydown = function(ev){
    keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting,u_ProjMatrix);
  };

  draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
}

function keydown(ev, gl, u_ModelMatrix, u_NormalMatrix, u_isLighting,u_ProjMatrix) {
  switch (ev.keyCode) {
    case 40: // Up arrow key -> the positive rotation of arm1 around the y-axis
      g_xAngle = (g_xAngle + ANGLE_STEP) % 360;
      break;
    case 38: // Down arrow key -> the negative rotation of arm1 around the y-axis
      g_xAngle = (g_xAngle - ANGLE_STEP) % 360;
      break;
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_yAngle = (g_yAngle + ANGLE_STEP) % 360;
      break;
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_yAngle = (g_yAngle - ANGLE_STEP) % 360;
      break;
    case 71: //rotate signs g
      if(signRotate>235){
        signClockwise=true;

      }else if(signRotate<135){
        signClockwise=false;
      }
      if(signClockwise){
        signRotate=(signRotate-ANGLE_STEP)%360;
      }else{
        signRotate=(signRotate+ANGLE_STEP)%360;
      }
      break;
    case 82:
    if((lorryY>-2.5)||(greenOn==true)||(lorryY<-3.5)){
      lorryY=(lorryY+0.1);
    }
      break;
    case 69:
      lorryY=lorryY-0.1;
      break;
    case 72://opposit rotate signs h
      if(signRotate>235){
        signClockwise=true;

      }else if(signRotate<135){
        signClockwise=false;
      }
      if(signClockwise){
        signRotate=(signRotate+ANGLE_STEP)%360;
      }else{
        signRotate=(signRotate-ANGLE_STEP)%360;
      }
      break;
    case 68://drive car backwards D

      carDrive=(carDrive+0.1);
      break;
    case 67://drive car forwards C
    
      if((greenOn==true)||(carDrive<0)||(carDrive>0.5)){
    
      carDrive=(carDrive-0.1);
    }
      break;
    case 73:
      xCentre=(xCentre+0.1);
      break;
    case 75:
      xCentre=(xCentre-0.1);
      break;
    case 74:
      yCentre=(yCentre+0.1);
      break;
    case 76:
      yCentre=(yCentre-0.1);
      break;
    case 77:
      zCentre=(zCentre+0.1);
      break;
    case 188:
      zCentre=(zCentre-0.1);
      break;
    case 81:
      if(greenOn==true){
        orangeOn=true;
        greenOn=false;
      }else if(redOn&&orangeOn){
        redOn=false;
        orangeOn=false;
        greenOn=true;
      }else if(redOn){
        redOn=true;
        orangeOn=true;
      }else{
        redOn=true;
        orangeOn=false;
      }
      break;
    default: return; // Skip drawing at no effective action
  }

  // Draw the scene
  draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting);
}
function roofVertexBuffer(gl){
  var vertices =new Float32Array([
    -2.0,-0.5,1.0,  -1.0,2.0,0.0,   1.0,2.0,0.0,    2.0,-0.5,1.0,
    -1.0,0.0,2.0, -1.0,1.0,1.0, 1.0,1.0,1.0,2.0,-0.5,1.0
    ]);
  var colours=new Float32Array([
    0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0
    ]);
   if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var cubeVertices = new Float32Array([   // Coordinates
     0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
     0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
     0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
    -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
    -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
     0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5  // v4-v7-v6-v5 back
  ]);

  var cubeNormals = new Float32Array([    // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);


  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);
if(colourInt==0){
  cubeColours=whiteColours;
}else if(colourInt==1){
  cubeColours=blackColours;

}
  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', cubeVertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', cubeColours, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', cubeNormals, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer (gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

function initAxesVertexBuffers(gl) {

  var verticesColors = new Float32Array([
    // Vertex coordinates and color (for axes)
    -20.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // (x,y,z), (r,g,b) 
     20.0,  0.0,   0.0,  1.0,  1.0,  1.0,
     0.0,  20.0,   0.0,  1.0,  1.0,  1.0, 
     0.0, -20.0,   0.0,  1.0,  1.0,  1.0,
     0.0,   0.0, -20.0,  1.0,  1.0,  1.0, 
     0.0,   0.0,  20.0,  1.0,  1.0,  1.0 
  ]);
  var n = 6;

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

function draw(gl, u_ModelMatrix, u_NormalMatrix, u_isLighting) {

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform1i(u_isLighting, false); // Will not apply lighting

  // Set the vertex coordinates and color (for the x, y axes)

  var n = initAxesVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  var m=
  // Calculate the view matrix and the projection matrix
  modelMatrix.setTranslate(0, 0, 0);  // No Translation
  // Pass the model matrix to the uniform variable
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Draw x and y axes
  gl.drawArrays(gl.LINES, 0, n);

  gl.uniform1i(u_isLighting, true); // Will apply lighting

  // Set the vertex coordinates and color (for the cube)
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Rotate, and then translate
  modelMatrix.setTranslate(xCentre, yCentre, zCentre);  // Translation (No translation is supported here)
  modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
  modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

  // Main block
  pushMatrix(modelMatrix);
    modelMatrix.scale(4.0, 3.0, 2.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // left block
  pushMatrix(modelMatrix);
    modelMatrix.translate(-1.0, 0.5, -2.0);  // Translation
    
    modelMatrix.scale(6.0, 4.0, 2.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();


 // first diagonal
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', whiteColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(-3.38, 0.0, -0.7);  // Translation
    modelMatrix.rotate(20,0,1,0);
    modelMatrix.scale(1.0, 3.0, 1.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //black beam
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(-3.88, 0.5, -0.5);  // Translation
    modelMatrix.rotate(20,0,1,0);
    modelMatrix.scale(0.2,0.2,1.2);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // second diagonal
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', whiteColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(-3.0, 0.0, 0.04);  // Translation
    modelMatrix.rotate(40,0.0,1.0,0.0);
    modelMatrix.scale(1.0, 3.0, 1.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //black beam
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.rotate(40,0.0,1.0,0.0);
    
    modelMatrix.translate(-2.9 ,0.5,-1.9);
    modelMatrix.scale(0.2,0.2,1.2);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // third diagonal
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', whiteColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(-2.45, 0.0, 0.4);  // Translation
    modelMatrix.rotate(70,0.0,1.0,0.0);
    modelMatrix.scale(1.0, 3.0, 1.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
//black beam
pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(-2.6, 0.5, 0.9);  // Translation
    modelMatrix.rotate(70,0.0,1.0,0.0);
    modelMatrix.scale(0.2,0.2,1.2); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
var centreY=1.01;
var centreX=-0.5;
var centreZ=0.0;
//big window
pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX, centreZ-0.3, centreY);  // Translation
    
    modelMatrix.scale(0.5,0.5,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //top left window
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX-0.15, centreZ+0.1, centreY);  // Translation
    
    modelMatrix.scale(0.2,0.2,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //top right window
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX+0.15, centreZ+0.1, centreY);  // Translation
    
    modelMatrix.scale(0.2,0.2,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
centreX=centreX+2.0;
  //big window
pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX, centreZ-0.3, centreY);  // Translation
    
    modelMatrix.scale(0.5,0.5,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //top left window
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX-0.15, centreZ+0.1, centreY);  // Translation
    
    modelMatrix.scale(0.2,0.2,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //top right window
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX+0.15, centreZ+0.1, centreY);  // Translation
    
    modelMatrix.scale(0.2,0.2,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
centreY=1.7;
centreX=-2.1;
var windowRotation=-20;
  //big window
pushMatrix(modelMatrix);
  modelMatrix.rotate(windowRotation, 0,1,0);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX, centreZ-0.3, centreY);  // Translation
    
    modelMatrix.scale(0.5,0.5,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //top left window
  pushMatrix(modelMatrix);
  modelMatrix.rotate(windowRotation, 0,1,0);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX-0.15, centreZ+0.1, centreY);  // Translation
    
    modelMatrix.scale(0.2,0.2,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //top right window
  pushMatrix(modelMatrix);

  modelMatrix.rotate(windowRotation, 0,1,0);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX+0.15, centreZ+0.1, centreY);  // Translation
    
    modelMatrix.scale(0.2,0.2,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  centreY=3.8;
centreX=-0.8;
windowRotation=-80;
  //big window
pushMatrix(modelMatrix);
  modelMatrix.rotate(windowRotation, 0,1,0);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX, centreZ-0.3, centreY);  // Translation
    
    modelMatrix.scale(0.5,0.5,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //top left window
  pushMatrix(modelMatrix);
  modelMatrix.rotate(windowRotation, 0,1,0);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX-0.15, centreZ+0.1, centreY);  // Translation
    
    modelMatrix.scale(0.2,0.2,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //top right window
  pushMatrix(modelMatrix);
  
  modelMatrix.rotate(windowRotation, 0,1,0);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(centreX+0.15, centreZ+0.1, centreY);  // Translation
    
    modelMatrix.scale(0.2,0.2,0.05); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //flatroad
  pushMatrix(modelMatrix);
    modelMatrix.translate(-7.0, -1.0, 0.0);  
    modelMatrix.scale(5.0, 0.2, 9.0); // Scale

    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  // flat curb closest to paddys
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', brownColours, 3, gl.FLOAT)) return -1;
  
    modelMatrix.translate(-3.9, -1.25, -1.5);  
    modelMatrix.scale(1.5, 1.0, 6.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //nonflatroad
  pushMatrix(modelMatrix);
    if (!initArrayBuffer(gl, 'a_Color', greenyBrownColours, 3, gl.FLOAT)) return -1;
    modelMatrix.rotate(4,0.0,0.0,1.0);
    modelMatrix.translate(0.5, -1.2, 2.5);  
    modelMatrix.scale(11.0, 1.0, 3.0); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //non flat curb closest to paddys
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', brownColours, 3, gl.FLOAT)) return -1;
  modelMatrix.rotate(4,0.0,0.0,1.0);
    modelMatrix.translate(0.5, -1.0, 1.25);  
    modelMatrix.scale(10.0, 1.0, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //non flat curb futher from paddys
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', brownColours, 3, gl.FLOAT)) return -1;
  modelMatrix.rotate(4,0.0,0.0,1.0);
    modelMatrix.translate(0.5, -1.0, 3.75);  
    modelMatrix.scale(11.0, 1.0, 0.5); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //front sign
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', greenColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(0.0,0.5,0.0);
    modelMatrix.rotate(signRotate, 0.0,0.0,1.0);
    modelMatrix.translate(0.0, 0.3, 1.5);  
    modelMatrix.scale(0.1, 0.4, 0.4); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //side sign
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', greenColours, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(0.0,0.6,-1.0);
    modelMatrix.rotate(signRotate-90.0, 1.0,0.0,0.0);
    modelMatrix.translate(-4.3, 0.0, 0.5);  
    modelMatrix.scale(0.4, 0.1, 0.4); // Scale
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //wood for side sign
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', brownColours, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(-4.0,0.5,-1.0);
    modelMatrix.scale(1.0,0.05,0.05);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //wood for front sign
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', brownColours, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(0.0,0.5,1.5);
    modelMatrix.scale(0.05,0.05,1.0);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //traffic light 1 stand
  var trafficX=-4.5;
  var trafficZ=0.0;
  var trafficY=0.5;
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(trafficX,trafficZ,trafficY);
    modelMatrix.scale(0.2,2.0,0.2);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //trffic light 1 body
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(trafficX,trafficZ+0.5,trafficY);
    modelMatrix.scale(0.4,1.0,0.4);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //red light
  pushMatrix(modelMatrix);
    var redTraffic=new Float32Array([]);
    if(redOn){
      redTraffic=redColours;
    } else{
      redTraffic=blackColours;
    }
  if (!initArrayBuffer(gl, 'a_Color', redTraffic, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(trafficX,trafficZ+0.8,trafficY+0.2);
    modelMatrix.scale(0.25,0.25,0.05);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //red light
  pushMatrix(modelMatrix);
    var redTraffic=new Float32Array([]);
    if(redOn){
      redTraffic=redColours;
    } else{
      redTraffic=blackColours;
    }
  if (!initArrayBuffer(gl, 'a_Color', redTraffic, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(trafficX,trafficZ+0.8,trafficY-0.2);
    modelMatrix.scale(0.25,0.25,0.05);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();

  //orange light
  pushMatrix(modelMatrix);
  var orangeTraffic=new Float32Array([]);
    if(orangeOn){
      orangeTraffic=orangeColours;
    } else{
      orangeTraffic=blackColours;
    }
  if (!initArrayBuffer(gl, 'a_Color', orangeTraffic, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(trafficX,trafficZ+0.5,trafficY+0.2);
    modelMatrix.scale(0.25,0.25,0.05);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //orange light
  pushMatrix(modelMatrix);
  var orangeTraffic=new Float32Array([]);
    if(orangeOn){
      orangeTraffic=orangeColours;
    } else{
      orangeTraffic=blackColours;
    }
  if (!initArrayBuffer(gl, 'a_Color', orangeTraffic, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(trafficX,trafficZ+0.5,trafficY-0.2);
    modelMatrix.scale(0.25,0.25,0.05);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //green light
  pushMatrix(modelMatrix);
  var greenTraffic=new Float32Array([]);
    if(greenOn){
      greenTraffic=greenColours;
    } else{
      greenTraffic=blackColours;
    }
  if (!initArrayBuffer(gl, 'a_Color', greenTraffic, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(trafficX,trafficZ+0.2,trafficY+0.2);
    modelMatrix.scale(0.25,0.25,0.05);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //green light
  pushMatrix(modelMatrix);
  var greenTraffic=new Float32Array([]);
    if(greenOn){
      greenTraffic=greenColours;
    } else{
      greenTraffic=blackColours;
    }
  if (!initArrayBuffer(gl, 'a_Color', greenTraffic, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(trafficX,trafficZ+0.2,trafficY-0.2);
    modelMatrix.scale(0.25,0.25,0.05);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //traffic light 2 stand
  /*pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(-5.0,0.0,1.8);
    modelMatrix.scale(0.2,2.0,0.2);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();
  //traffic light 2 body
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    
    modelMatrix.translate(-5.0,0.5,1.8);
    modelMatrix.scale(0.4,1.0,0.4);
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);

  modelMatrix = popMatrix();*/
  //car body
  var carXPos=-7.5;
  var carYPos=4.5+carDrive;
  var carZPos=-0.4;
  pushMatrix(modelMatrix);
    if (!initArrayBuffer(gl, 'a_Color', redColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(carXPos, carZPos, carYPos); 
    modelMatrix.scale(1.0, 0.5, 1.6); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //top right wheel
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(carXPos+0.35,carZPos-0.35, carYPos-0.65); 
    modelMatrix.scale(0.15, 0.3, 0.3); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //top left
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(carXPos-0.35,carZPos-0.35, carYPos-0.65); 
    modelMatrix.scale(0.15, 0.3, 0.3); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //bottom left
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(carXPos-0.35,carZPos-0.35, carYPos+0.65); 
    modelMatrix.scale(0.15, 0.3, 0.3); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //bottom right
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(carXPos+0.35,carZPos-0.35, carYPos+0.65); 
    modelMatrix.scale(0.15, 0.3, 0.3); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //car roof
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', redColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(carXPos,carZPos+0.4, carYPos+0.2); 
    modelMatrix.scale(1.0, 0.4, 0.8); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  var lorryX=-5.5;
  
  var lorryZ=0.0;
  //lorryboddy
pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', lightGreyColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX,lorryZ, lorryY); 
    
    modelMatrix.scale(0.8, 1.5, 3.0); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //lorry front bit
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', redColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX,lorryZ-0.25, lorryY+1.9); 
    
    modelMatrix.scale(0.8, 1.0, 0.8); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //lorry left window
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blueColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX-0.41,lorryZ, lorryY+1.9); 
    
    modelMatrix.scale(0.05, 0.3, 0.6); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //lorry right window
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blueColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX+0.41,lorryZ, lorryY+1.9); 
    
    modelMatrix.scale(0.05, 0.3, 0.6); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //lorry front room
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blueColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX,lorryZ, lorryY+2.3); 
    
    modelMatrix.scale(0.7, 0.3, 0.05); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //lorry 1st back right tire
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX-0.31,lorryZ-0.75, lorryY-1.2); 
    
    modelMatrix.scale(0.2, 0.5, 0.5); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //lorry 2nd back tire
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX-0.31,lorryZ-0.75, lorryY-0.5); 
    
    modelMatrix.scale(0.2, 0.5, 0.5); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //lorry 1st back left tire
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX+0.31,lorryZ-0.75, lorryY-1.2); 
    
    modelMatrix.scale(0.2, 0.5, 0.5); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //lorry 2nd back right tire
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX+0.31,lorryZ-0.75, lorryY-0.5); 
    
    modelMatrix.scale(0.2, 0.5, 0.5); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //lorry front left tire
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX-0.31,lorryZ-0.75, lorryY+1.5); 
    
    modelMatrix.scale(0.2, 0.5, 0.5); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //lorry front left tire
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(lorryX+0.31,lorryZ-0.75, lorryY+1.5); 
    
    modelMatrix.scale(0.2, 0.5, 0.5); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //left window
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blueColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(carXPos-0.505,carZPos+0.4, carYPos+0.2); 
    
    modelMatrix.scale(0.01, 0.2, 0.6); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

//right window
pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blueColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(carXPos+0.505,carZPos+0.4, carYPos+0.2); 
    
    modelMatrix.scale(0.01, 0.2, 0.6); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //front window
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blueColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(carXPos,carZPos+0.4, carYPos-0.205); 
    
    modelMatrix.scale(0.8, 0.2, 0.01); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //black pillar
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(-2.05,-0.25, 1.0); 
    
    modelMatrix.scale(0.2, 1.5, 0.2); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //black pillar
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(-3.05,-0.25, 0.8); 
    
    modelMatrix.scale(0.2, 1.5, 0.2); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //black pillar
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(-3.75,-0.25, 0.0); 
    
    modelMatrix.scale(0.2, 1.5, 0.2); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //black pillar
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(-1.0,-0.25, 1.0); 
    
    modelMatrix.scale(0.2, 1.5, 0.2); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //black pillar
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(0.0,-0.25, 1.0); 
    
    modelMatrix.scale(0.2, 1.5, 0.2); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //black pillar
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(1.0,-0.25, 1.0); 
    
    modelMatrix.scale(0.2, 1.5, 0.2); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //black pillar
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(2.0,-0.25, 1.0); 
    
    modelMatrix.scale(0.2, 1.5, 0.2); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //black beam
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(0.0,0.5, 1.0); 
    
    modelMatrix.scale(4.0, 0.2, 0.2); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  //roof of paddys
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Color', blackColours, 3, gl.FLOAT)) return -1;
    modelMatrix.rotate(45,1.0,0.0,0.0);
    modelMatrix.translate(-0.2,1.1,-1.1); 

    modelMatrix.scale(4.5, 1.5, 1.5); // Scale
    
    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
 //roof of paddys
  pushMatrix(modelMatrix);
  if (!initArrayBuffer(gl, 'a_Position', pyramidVertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', pyramidColours, 3, gl.FLOAT)) return -1;
    modelMatrix.translate(-2.45,2.0,0.0); 
    modelMatrix.scale(0.75, 0.5, 0.75);
    
    modelMatrix.rotate(-135,0.0,1.0,0.0);
   

    drawbox(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
   
}

function drawbox(gl, u_ModelMatrix, u_NormalMatrix, n) {
  pushMatrix(modelMatrix);

    // Pass the model matrix to the uniform variable
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  modelMatrix = popMatrix();
}
function drawTriangle(gl, u_modelMatrix, u_NormalMatrix, n){


}