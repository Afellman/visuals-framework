#ifdef GL_ES
precision mediump float;
#endif

#define pointsAmt 10


varying vec2 vTexCoord;

uniform vec2 u_mouse;
uniform vec2 u_resolution; 
uniform vec2 u_points[pointsAmt];
uniform vec2 u_point0;
uniform float u_spread;

void main() {
  vec2 coord = vTexCoord;
  vec2 dist = vec2(distance(u_points[0], coord), distance(u_points[1], coord));
  for(int i = 2; i < pointsAmt - 1; i ++){
    if(u_points[i].x + u_points[i].y > 0.0){
      dist *=  vec2(distance(u_points[i], coord),distance(u_points[i+1], coord));
    }
  }
  // vec2 dist = vec2(distance(u_point, coord) * distance(u_point2, coord), distance(u_point3, coord) * distance(u_point4, coord)); 
  // vec2 color = 1.0 - dist.xy * 2.0;

    // float dist = distance(u_points[0], coord);
    vec2 color = 1.0 - dist * u_spread;
    gl_FragColor = vec4(color.x, color.y, (color.x + color.y), 1.0 );
}

