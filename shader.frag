#ifdef GL_ES
precision mediump float;
#endif

#define pointsAmt 4

varying vec2 vTexCoord;

uniform int u_pointsAmt; 
uniform vec2 u_mouse;
uniform vec2 u_resolution; 
uniform vec2 u_points[4];


void main() {
  vec2 coord = vTexCoord;
  float dist = 1.0;
  for(int i = 0; i < 4; i ++){
    dist = dist * distance(u_points[i], coord); 
  }
  // vec2 dist = vec2(distance(u_point, coord) * distance(u_point2, coord), distance(u_point3, coord) * distance(u_point4, coord)); 
  // vec2 color = 1.0 - dist.xy * 2.0;

    float color = 1.0 - dist;
    gl_FragColor = vec4(color, color, color, 1.0 );
}

