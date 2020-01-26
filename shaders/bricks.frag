#ifdef GL_ES
precision mediump float;
#endif
#define OCTAVES 6
#define PI 3.1415926535897932384626433832795

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;
uniform float u_time;
uniform float u_direction;
uniform float u_opacity;
uniform float u_xOff;
uniform float u_yOff;
uniform float u_amp;
uniform float u_noise;
uniform float u_freq;


float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float random(in float x){
  return fract(sin(dot(x, 78.233)) * 43758.5453123);
}

float noise (in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +(c - a)* u.y * (1.0 - u.x) +(d - b) * u.x * u.y;
}


float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}


void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec2 center = vec2(0.5, 0.5);

  float ran = random(uv) * u_noise ; // Adds noise
  float amp = sin(u_amp * u_time) / 10.0;
  float y = sin(PI * 2.0 * uv.x * u_freq + u_time + ran ) * amp;

  uv = vec2((uv.x + u_xOff + y),uv.y + u_yOff); // u_params[0] is offsetting the y to create the lines

  vec4 tex = texture2D(tex0, uv);

  tex.r = sin(u_time);
  
  gl_FragColor = vec4(tex.rgb, u_opacity);
}
