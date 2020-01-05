// USE THIS SHADER WITH THIS IMAGE ** https://images.unsplash.com/photo-1459478309853-2c33a60058e7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80
#ifdef GL_ES
precision mediump float;
#endif

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;
uniform float u_time;
uniform float u_speed;
uniform float u_direction;


vec3 colorize(vec4 tex){
  float gray = (tex.r + tex.g + tex.b) / 3.0;

  float res = 20.0;
  float scl = res / (10.0);

  float threshR = (fract(floor(tex.r*res)/scl)*scl) * gray ;
  float threshG = (fract(floor(tex.g*res)/scl)*scl) * gray ;
  float threshB = (fract(floor(tex.b*res)/scl)*scl) * gray ;
  vec3 thresh = vec3(threshR, threshG, threshB);
  return thresh;
}

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

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

float pattern( in vec2 p )
{
    vec2 q = vec2( fbm( p + vec2(0.0,0.0) ),
                   fbm( p + vec2(5.2,1.3) ) );

    vec2 r = vec2( fbm( p + 4.0*q + vec2(1.7,9.2) ),
                   fbm( p + 4.0*q + vec2(8.3,2.8) ) );

    return fbm( p + 4.0*r );
}

void main() {
  vec2 uv = vTexCoord;

  // the texture is loaded upside down and backwards by default so  lets flip it
  uv.y = 1.0 - uv.y;

  vec4 tex = texture2D(tex0, vec2(uv.x * distance(uv.y, sin(u_time)),  uv.y * cos(uv.y) * distance(uv.y, u_time)));
  // vec4 tex = texture2D(tex0, vec2(uv.x , uv.y));
  float r = pattern(vec2(tex.r, uv.x + u_direction * (u_time * 0.8 * u_speed)));
  float g = pattern(vec2(tex.g, uv.x * uv.y + u_direction * (u_time * 0.6 * u_speed)));
  float b = pattern(vec2(tex.b, uv.y + u_direction * (u_time * 0.75 * u_speed)));
  
  // render the output
  gl_FragColor = vec4(r, g, b, 1.0);
}
