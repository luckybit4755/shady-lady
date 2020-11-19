#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define PI      3.14159265359
#define TWO_PI  6.28318530718

// size: inner, outer, smooth
float ring( in vec3 size, in vec2 xy ) {
	float f = dot( xy, xy );
	float x = pow( size.x, 2.0 );
	float y = pow( size.y, 2.0 );
	float a = 1. - size.z;
	float b = 1. + size.z;
	return min(
		1.0,
		+ smoothstep( x * a, x * b, f )
		- smoothstep( y * a, y * b, f )
	); 
}

float thinRing( float outer, vec2 xy ) {
	return 4.0 * ring( vec3( outer * 0.997, outer, 0.02 ), xy );
}

float cutOut( float f, int count, float offset, float distance, vec2 xy ) {
    float angle = atan( xy.y, xy.x ) + offset;

	float m = TWO_PI / float( count );
	float q = mod( angle, m ) / m;

	//return f * step( distance, q );
	//return f * step( distance * 0.5, q - distance * 0.5);

	float q1 = step( distance, q );      // 0.1 -> 0.1
	float q2 = step( distance, 1. - q ); // 0.9 -> 0.1
	return f * min( q1, q2 );

	return f * ( 1.0 - (
		step( distance, q ) // 0.1 -> 0.1
		-
		step( distance, 1. - q ) // 0.9 -> 0.1
	) );
	return f * ( 1.0 - (
		step( distance, q ) // 0.1 -> 0.1
		-
		step( distance, 1. - q ) // 0.9 -> 0.1
	) );

}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec2 xy = ( st - 0.5 ) * 1.33;

	vec3 color = vec3(0.0);

	vec3 white = vec3( 1.0 );
	vec3 pale_blue = vec3( 0.6, 0.8, 1.0 );
	vec3 paler_blue = pale_blue * 2.2;

	// dynamic rings

	float r = ring( vec3( 0.63, 0.637, 0.02 ), xy );
	r = cutOut( r, 8, 0.0, 0.04, xy );
	color += paler_blue * r;

	r = ring( vec3( 0.530, 0.532, 0.02 ), xy );
	r = cutOut( r, 2, 0.00, 0.10 + 0.17 * abs( cos(u_time) ), xy );
	color += pale_blue * r;

	// static rings 

	color += white     * thinRing( 0.478, xy );
	color += pale_blue * thinRing( 0.33, xy );
	color += pale_blue * thinRing( 0.20, xy );
	color += pale_blue * ring( vec3( 0.0185, 0.022, 0.04 ), xy );

    gl_FragColor = vec4(color,1.0);
}
