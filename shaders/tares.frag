#define MAX_POINTS  
precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;


// our texture coming from p5
uniform float u_opacity;
uniform vec2 u_point;

void main() {
  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;
  float dis = distance(vec2(u_point.x, u_point.y), vec2(uv.x , uv.y)) * 10.0;
  vec3 color = vec3(1.0-dis, 1.0-dis, 1.0-dis);
  // output to screen
    gl_FragColor = vec4(color,u_opacity);

}