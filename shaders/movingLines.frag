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
uniform float u_speed;
uniform float u_direction;
uniform vec4 u_params;


float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
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

float pattern( in vec2 p )
{
    vec2 q = vec2(fbm( p + vec2(0.0,0.0)), fbm( p + vec2(5.2,1.3) ) );

    vec2 r = vec2(fbm( p + 4.0*q + vec2(1.7,9.2)),fbm( p + 4.0*q + vec2(8.3,2.8)));

    return fbm(p + 4.0*r);
}

float swirl(float x){
  float r = pattern(vec2(x, x + u_direction * (u_time * 0.1 * u_speed)));
  return r;
}

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec2 center = vec2(0.5, 0.5);

  // float swirlz = swirl(uv.x); // Applying the swirl effect to the image.
  float y = sin(PI * 2.0 * uv.x * 2.0 +  u_time * 10.0) / 10.0;
  // float swirlz = uv.x * distance(uv.x, 0.5 + sin(u_time)) + distance(uv.x, 0.1);
  uv = vec2((uv.x + u_params[1] + y),uv.y + y + u_params[0]); // u_params[0] is offsetting the y to create the lines

  vec4 tex = texture2D(tex0, uv);

  gl_FragColor = vec4(tex);
}
