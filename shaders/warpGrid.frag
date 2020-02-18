precision mediump float;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our textures coming from p5



void main() {

  vec3 color = vec3(0.0);

  // render the output
  gl_FragColor = vec4(color, u_opacity);
}