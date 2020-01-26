precision mediump float;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our textures coming from p5
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;


void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;
  
  // get the three webcam feeds
  vec4 cam = texture2D(tex0, uv);
  vec4 cam2 = texture2D(tex1,  uv);
  vec4 cam3 = texture2D(tex2,  uv);

  // lets get the average color of the rgb values
  float avg = dot(cam.rgb, cam2.rgb);

  // then spread it between -1 and 1
  avg = avg * 2.0 - 1.0;

  float disp = avg * sin(u_time);
  // lets use one channel from each of the textures
  // vec4 colOut = vec4(1.0-cam.r* sin(uv.y), cam2.g, cam3.b, 1.0);

  // render the output
  gl_FragColor = cam;
}