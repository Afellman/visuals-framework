precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;


// our texture coming from p5
uniform float u_opacity;
uniform vec2 u_points[1];

float getDis(vec2 uv, vec2 points[3]) {
  float dis = 1.0;
  for(int i = 0; i < 3; i ++){
    dis *= distance(points[i], uv) * 10.0;
  }

  return dis;
}

void main() {
  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;
   // Each result will return 1.0 (white) or 0.0 (black).

  float dis = getDis(uv, u_points);

   
  vec3 color = vec3(1.0- dis);
  // output to screen
    gl_FragColor = vec4(color,u_opacity);

}