#ifdef GL_ES
precision mediump float;
#endif

#define pointsAmt 3


varying vec2 vTexCoord;

uniform vec2 u_mouse;
uniform vec2 u_resolution; 
uniform vec2 u_points[pointsAmt];
uniform float u_spread;
uniform float u_time;
uniform vec4 u_color;

void main() {
  vec2 coord = vTexCoord;
  // float dist = distance(vTexCoord.y, 0.5) * 0.6 * 3.0;

  // for(int i = 1; i < pointsAmt; i ++){
  //   if(u_points[i].x + u_points[i].y > 0.0){
  //     dist *=  distance(u_points[i], coord);
  //   }
  // }
  //   float color = dist * 200.0;

  // gl_FragColor = vec4(1.0+dist, 1.0-dist, 0.2, 1.0);


  // Using for global background color
  gl_FragColor = u_color;
}

