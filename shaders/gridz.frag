precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;


// our texture coming from p5
uniform vec2 points;

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;

  // this line will make our uvs mirrored
  // it will convert it into a number that goes 0 to 1 to 0
  // abs() will turn our negative numbers positive

  // output to screen
    gl_FragColor = vec4(0.0,0.0,0.0,0.0);

}