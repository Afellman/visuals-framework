#ifdef GL_ES
precision mediump float;
#endif
#define OCTAVES 6
#define PI 3.1415926535897932384626433832795

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;
uniform float u_time;
uniform float u_direction;
uniform float u_opacity;
uniform float u_xOff;
uniform float u_yOff;
uniform float u_amp;
uniform float u_noise;
uniform float u_freq;

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;

  uv = vec2((uv.x + u_xOff),uv.y + u_yOff); // u_params[0] is offsetting the y to create the lines

  vec4 tex = texture2D(tex0, uv);
  
  gl_FragColor = vec4(tex.rgb, u_opacity);
}
