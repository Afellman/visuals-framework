#define MAX_POINTS  
precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;


// our texture coming from p5
uniform float u_opacity;
uniform vec2 u_point;

float getDis(points) {
  float dis = 1.0;
  for(int i =0 ; i < points.length; i ++){
    dis *= distance(points[i], uv);
  }

  return dis;
}

void main() {
  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;
   // Each result will return 1.0 (white) or 0.0 (black).

    vec2 points[3];
    points[0] = u_point;
    points[1] = u_point * 1.1;
    points[2] = u_point * 1.2;
   float dis = getDis(uv, u_points);

   
  vec3 color = vec3(1.0- dis);
  // output to screen
    gl_FragColor = vec4(color,u_opacity);

}