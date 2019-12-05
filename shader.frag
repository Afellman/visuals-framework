#ifdef GL_ES
precision mediump float;
#endif

#define pointsAmt 3


varying vec2 vTexCoord;

uniform vec2 u_mouse;
uniform vec2 u_resolution; 
uniform vec2 u_points[pointsAmt];
uniform float u_spread;

void main() {
  vec2 coord = vTexCoord;
  float dist = distance(u_points[0], coord);
  for(int i = 1; i < pointsAmt; i ++){
    if(u_points[i].x + u_points[i].y > 0.0){
      dist *=  distance(u_points[i], coord);
    }
  }
  // vec2 dist = vec2(distance(u_point, coord) * distance(u_point2, coord), distance(u_point3, coord) * distance(u_point4, coord)); 
  // vec2 color = 1.0 - dist.xy * 2.0;

    // float dist = distance(u_points[0], coord);
    float color = 1.0 - dist * 20.0;
    gl_FragColor = vec4(color, color, 1.0, 1.0 );
}

