precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;


// our texture coming from p5
uniform float u_opacity;
uniform float u_point1;
uniform float u_point2;
uniform float u_x;
uniform float u_y;


float random (float x) {
    return fract(sin(dot(x,u_point1))* u_point2);
}

float getDis2(vec2 uv) {
  float dis = 1.0;
  for(int i = 0; i < 10; i ++){
    dis *= distance(vec2(random(uv.x),random(uv.y)), uv) * 10.0;
  }

  return dis;
}



void main() {
  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;
   // Each result will return 1.0 (white) or 0.0 (black).

  uv.x *= u_x;
  uv.y *= u_y;
  float dis = getDis2(uv);
   
  vec3 color = vec3(1.0- dis);
  // output to screen
    gl_FragColor = vec4(color,u_opacity);

}