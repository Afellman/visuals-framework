precision mediump float;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our textures coming from p5
uniform float u_foobar[100];
uniform float u_opacity;

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;

  float point = floor(uv.x) * 100.0; 
  vec3 color = vec3(0.3 * distance(u_foobar[10], uv.x), 0.5, 0.99);

  // render the output
  gl_FragColor = vec4(color, u_opacity);
}