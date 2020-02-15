precision mediump float;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our textures coming from p5
uniform sampler2D tex0;
uniform float u_time;
uniform float u_opacity;
uniform float u_displaceX;
uniform float u_displaceY;
uniform float u_red;
uniform float u_blue;
uniform float u_green;



void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;
  
  vec4 img1 = texture2D(tex0, uv);
  float avg = dot(img1.rgb, vec3(0.33333));

  // then spread it between -1 and 1
  avg = avg * 2.0 - 1.0;

  float disp = avg;

  vec4 img2 = texture2D(tex0,  vec2(uv.x + disp *u_displaceX, uv.y+ disp *u_displaceY));

  vec3 lum = vec3(0.299, 0.587, 0.114);

  vec3 color = vec3(dot( img2.rgb, lum));

  color.r += distance(0.5, uv.x) * u_red;
  color.g += distance(0.5, uv.x) * u_green;
  color.b += distance(0.5, uv.x) * u_blue;

  // render the output
  gl_FragColor = vec4(color, u_opacity);
}