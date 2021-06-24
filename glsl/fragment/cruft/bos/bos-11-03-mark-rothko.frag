// glslViewer -w 857 -h 590 bos-11-03-mark-rothko.frag

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

float noise( in vec2 st ) {
	vec2 i = floor(st);
	vec2 f = fract(st);

	// Four corners in 2D of a tile
	float a = random(i + A); // C------D
	float b = random(i + B); // |      |
	float c = random(i + C); // |      |
	float d = random(i + D); // A------B

	vec2 u = smoothstep(0.,1.,f);

	float inx = 1. - u.x;

	// I don't understand this...
	return
		mix( a, b, u.x       ) +
		mix( a, c, inx * u.y ) +
		mix( b, d, u.x * u.y )
		-a -b 
	;

	// these are equivalent...
	return
		a +
		(b - a) * u.x +
		(c - a) * inx * u.y +
		(d - b) * u.x * u.y
    ;

	// the original
	return
		mix(a, b, u.x) +
		(c - a) * inx * u.y +
		(d - b) * u.x * u.y
	;
}

vec2 stepo( in vec2 cut, in vec2 value ) {
    return smoothstep( cut - 0.02, cut, value );
}

float makeRectangle( in vec2 size, in vec2 current ) {
    size = vec2( 0.5 ) - size * 0.5;
    vec2 uv = stepo( size, current );
    uv *= stepo( size, 1.0 - current );
    return uv.x*uv.y;
}

float noize( in float weight, in float scale, in vec2 value ) {
	return 1.-weight + weight * noise( value * scale );
}

float hilo( in float hiWeight, in float hiScale, in float loWeight, in float loScale, vec2 xy ) {
	return noize( hiWeight, hiScale, xy ) * noize( loWeight, loScale, xy );
}

float rectoid( in vec2 size, in vec2 current ) {
	float n = hilo( 0.06, 43.47, 0.02, 137.33, current );
	return makeRectangle( n * size, current );
}

vec3 rgb( in int r, in int g, in int b ) {
	return vec3( float( r ) / 255., float( g ) / 255., float( b ) / 255. );
}

void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	vec2 xy = st * vec2( 3., 1. );

	vec3 color = vec3( 0. );
	color += hilo( 0.6, 2., 0.1, 99., xy ) * rgb(94,39,18);
	color += hilo( 0.6, 2., 0.1, 37., xy ) * rgb(176,  7,  1) * rectoid( vec2( 0.88, 0.95 ), xy - vec2( 0.01, 0.00 ) );
	color += hilo( 0.6, 2., 0.1, 28., xy ) * rgb(133,  7,  1) * rectoid( vec2( 1.05, 0.98 ), xy - vec2( 0.99, 0.00 ) );
	color += hilo( 0.6, 2., 0.1, 35., xy ) * rgb(235,181,107) * rectoid( vec2( 0.88, 0.82 ), xy - vec2( 1.96, -0.02 ) );

	gl_FragColor = vec4( color, 1. );
}
