#define MAX_POINTS  
precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;


// our texture coming from p5
uniform float u_scale;
uniform float u_intervalX;
uniform float u_intervalY;

void main() {
  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;

  float r = 150. * mod(uv.x, u_intervalX) * mod(uv.y, u_intervalY);

  // output to screen
    gl_FragColor = vec4(r,r,r,0.3);

}