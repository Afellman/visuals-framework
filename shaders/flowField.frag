precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;


// our texture coming from p5
uniform sampler2D tex0;
uniform float u_opacity;
uniform float u_xOff;
uniform float u_yOff;

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;

  float color = (distance(uv.x, 0.5) <= 0.1) ? 1. : 0.;
  vec4 vecx = vec4(color, color,color ,1.0)
  // output to screen
    gl_FragColor = vecx;
}