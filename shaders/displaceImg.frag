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

vec3 setBandW(vec3 color) {
    vec3 lum = vec3(0.299, 0.587, 0.114);
    vec3 bAndW = vec3(dot(color.rgb, lum));
    bAndW.r += distance(0.5, uv.x) * u_red * abs(sin(u_time) / 3.0);
    bAndW.g += distance(0.5, uv.x) * u_green *  abs(sin(u_time) / 3.0);
    bAndW.b += distance(0.5, uv.x) * u_blue *  abs(sin(u_time) / 3.0);
    return bAndW;
}

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;
  
  vec4 img1 = texture2D(tex0, uv);
  float avg = dot(img1.rgb, vec3(0.33333));

  // then spread it between -1 and 1
  avg = avg * 2.0 - 1.0;

  float disp = avg;

  vec4 img2 = texture2D(tex0,  vec2(uv.x + disp * u_displaceX, uv.y + disp * u_displaceY));

  vec3 color = img2.rgb;

  if(u_blackAndWhite){
    color = setBandW(color);
  }

  // render the output
  gl_FragColor = vec4(color, u_opacity);
}