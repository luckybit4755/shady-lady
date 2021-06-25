#ifdef GL_ES
precision mediump float;
#endif

#define PI  3.141592653589793
#define PI2 6.283185307179586

uniform vec2  u_mouse;
uniform vec2  u_resolution;
uniform float u_time;

float random( in vec2 xy ) {
    return fract( sin( dot( xy, vec2( 47.6869, 31.5479 ) ) ) * 76871.97673 );
}

void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	vec2 ms = u_mouse / u_resolution.xy;

	/// 

	float x = 101.;
	float y = 88.;

	// from the mouse 

	float speed = 0.5 * x * ( 1. + ms.x );
	float threshold = ms.y;

	// scale and move x based on random from y value for row

	st *= vec2( x, y );
	vec2 f = floor( st );

	st.x += speed * random( vec2( f.y, f.y ) ) * u_time;
	f = floor( st );

	// do the thresholding

	float r = random( f );
	float c = step( threshold, r );

    gl_FragColor = vec4( vec3( c ), 1.0 );
}
