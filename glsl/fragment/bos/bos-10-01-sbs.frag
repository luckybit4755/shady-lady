#ifdef GL_ES
precision mediump float;
#endif

#define PI  3.141592653589793
#define PI2 6.283185307179586

uniform vec2 u_resolution;
uniform float u_time;

float random( in vec2 xy ) {
	return fract( sin( dot( xy, vec2( 47.6869, 31.5479 ) ) ) * 76871.97673 );
}

float stepo( in float threshold, in float value ) {
	return smoothstep( threshold - 0.02, threshold + 0.02, value );
}

float inRange( in float min_, in float max_, in float value ) {
	// almost works: return step( min_, value ) * step( value, max_ );
	//return step( min
	return step( min_, value ) * ( 1.0 - step( max_, value ) );
}

vec2 roto( in vec2 xy, in vec2 rotation ) {
	vec2 delta = 1. - 2. * rotation;
	return rotation + xy * delta;
}

float diag( in vec2 xy, float thickness, float r ) {
	vec2 rotated = vec2( 0. );

	if ( true ) {
	rotated += inRange( 0.00, 0.25, r ) * roto( xy, vec2( 0., 0. ) );
	rotated += inRange( 0.25, 0.50, r ) * roto( xy, vec2( 0., 1. ) );
	rotated += inRange( 0.50, 0.75, r ) * roto( xy, vec2( 1., 1. ) );
	rotated += inRange( 0.75, 1.00, r ) * roto( xy, vec2( 1., 0. ) );
	} else {
	rotated += inRange( 0.00, 0.50, r ) * roto( xy, vec2( 0., 0. ) );
	rotated += inRange( 0.50, 1.50, r ) * roto( xy, vec2( 0., 1. ) );
	}

	xy = rotated;

	return stepo( xy.x - thickness, xy.y ) - stepo( xy.x + thickness, xy.y );
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

	st += u_time * 0.1;


	float scale = 13.;
	st *= scale;

	vec2 i = floor( st ); // same for the entire cell
	vec2 f = fract( st ); // varies from 0-1 in each cell

	float r = random( i );
	float g = diag( f, 0.1, r );

	color = vec3( g );

    gl_FragColor = vec4(color,1.0);
}
