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
   // Each result will return 1.0 (white) or 0.0 (black).
    float border = step(vec2(0.1),uv);   // Similar to ( X greater than 0.1 )

    vec3 color = vec3( left * bottom );

  // output to screen
    gl_FragColor = vec4(color,u_opacity);

}