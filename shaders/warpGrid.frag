precision mediump float;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our textures coming from p5
uniform float u_opacity;
uniform float u_time;
uniform sampler2D tex0;

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;
  
  vec4 img = texture2D(tex0, uv);
  vec3 color = img.rgb;

  color += 1.0 * sin(uv.x * cos(u_time / 30.0) * 60.0) + sin(uv.y * cos(u_time / 15.0) * 10.0);

  // render the output
  gl_FragColor = vec4(color, u_opacity);
}