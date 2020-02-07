#define MAX_POINTS  
precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;


// our texture coming from p5
uniform float u_scale;
uniform float u_rows;
uniform float u_cols;

void main() {
  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;

  float r = mod(uv.x, 0.056) + mod(uv.y, 0.1);

  // output to screen
    gl_FragColor = vec4(r,0.0,0.0,0.8);

}