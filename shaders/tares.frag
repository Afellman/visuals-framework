#define MAX_POINTS  
precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;


// our texture coming from p5
uniform float u_opacity;
uniform vec2 u_point;

float lineShape(vec2 point){
  return step(0.05, length(point));
}

void main() {
  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;
  float line = lineShape(u_point);
  vec3 color = vec3(1.0-dis, 1.0-dis, 1.0-dis);
  // output to screen
    gl_FragColor = vec4(color,u_opacity);

}