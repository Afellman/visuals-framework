precision mediump float;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our textures coming from p5
uniform float u_opacity;


void main() {

  vec3 color = vec3(0.0);

  color += sin(uv.x,= * cos(u_time / 30.0) * 60.0) + sin(uv.y * cos(u_time / 15.0) * 10.0);

  // render the output
  gl_FragColor = vec4(color, u_opacity);
}