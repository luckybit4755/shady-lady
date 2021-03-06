#ifdef GL_ES
precision mediump float;
#endif

#define PI  3.141592653589793
#define PI2 6.283185307179586

uniform vec2 u_resolution;
uniform float u_time;

#define A vec2( 0., 0. )
#define B vec2( 1., 0. )
#define C vec2( 0., 1. )
#define D vec2( 1., 1. )

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float weird( in vec2 st ) {
	vec2 i = floor(st);
	vec2 f = fract(st);

	// Four corners in 2D of a tile
	float a = random(i + A);
	float b = random(i + B);
	float c = random(i + C);
	float d = random(i + D);

	vec2 u = smoothstep(0.,1.,f);

	vec2 d_a = u - A;
	vec2 d_b = u - B;
	vec2 d_c = u - C;
	vec2 d_d = u - D;

	float w_a = d_a.x * d_a.y * 0.999 + 0.001;
	float w_b = d_b.x * d_b.y * 0.999 + 0.001;
	float w_c = d_c.x * d_c.y * 0.999 + 0.001;
	float w_d = d_d.x * d_d.y * 0.999 + 0.001;

	float q = 0.;
	q += a / w_a;
	q += b / w_b;
	q += c / w_c;
	q += d / w_d;

	return q;
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

	gl_FragColor = vec4(vec3(weird(st*5.+sin(u_time))), 1.0);
}
