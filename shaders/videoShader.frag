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
  
  uv.y += 0.1
  // get the three webcam feeds
  vec4 cam = texture2D(tex0, vec2(uv.x, uv.y + 0.3));
  vec4 cam2 = texture2D(tex1,  vec2(uv.x, uv.y + 0.8));
  vec4 cam3 = texture2D(tex2,  vec2(uv.x, uv.y + 0.8));

  
  // lets use one channel from each of the textures
  vec4 colOut = vec4(cam.r* sin(uv.y), cam2.g, cam3.b, 1.0);

  // render the output
  gl_FragColor = colOut;
}