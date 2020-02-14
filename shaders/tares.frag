precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;


// our texture coming from p5
uniform float u_opacity;
uniform vec2 u_point1;
uniform vec2 u_point2;
uniform vec2 u_point3;
uniform vec2 u_point4;
uniform vec2 u_point5;
uniform vec2 u_point6;
uniform vec2 u_point7;
uniform vec2 u_point8;
uniform vec2 u_point9;
uniform vec2 u_point10;

float getDis(vec2 uv) {
  float dis = 1.0;
  dis *= distance(u_point1, uv) * 10.0;
  dis *= distance(u_point2, uv) * 10.0;
  dis *= distance(u_point3, uv) * 10.0;
  dis *= distance(u_point4, uv) * 10.0;
  dis *= distance(u_point5, uv) * 10.0;
  dis *= distance(u_point6, uv) * 10.0;
  dis *= distance(u_point7, uv) * 10.0;
  dis *= distance(u_point8, uv) * 10.0;
  dis *= distance(u_point9, uv) * 10.0;
  dis *= distance(u_point10, uv) * 10.0;

  return dis;
}

float getDis2(vec2 uv) {
  float dis = 1.0;
  for(int i = 0; i < 10; i ++){
    dis *= distance(random(uv), uv) * 10.0;
  }

  return dis;
}

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main() {
  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;
   // Each result will return 1.0 (white) or 0.0 (black).

  // float dis = getDis(uv);

  float dis = getDis2(uv);

   
  vec3 color = vec3(1.0- dis);
  // output to screen
    gl_FragColor = vec4(color,u_opacity);

}