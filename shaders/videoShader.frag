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


void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;
  
  // get the three webcam feeds
  vec4 cam = texture2D(tex0, uv);
  // lets get the average color of the rgb values
  float avg = dot(cam.rgb, vec3(0.33333));

  // then spread it between -1 and 1
  avg = avg * 2.0 - 1.0;

  float disp = avg * sin(u_time / 100.0) / 10.0;

  vec4 cam2 = texture2D(tex0,  uv + disp);
  // lets use one channel from each of the textures

  // render the output
  gl_FragColor = cam2;
}