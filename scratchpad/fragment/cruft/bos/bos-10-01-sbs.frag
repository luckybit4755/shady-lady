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

float testBetween( in float a, in float b, in float value ) {
	return step( a, value ) - step( b, value );
}

float testFrom( in float from, in float size, float value ) {
	return testBetween( from, from + size, value );
}

float testCenter( in float center, in float thickness, float value ) {
	return testBetween( center - thickness, center + thickness, value );
}

vec2 roto( in vec2 xy, in vec2 rotation ) {
	vec2 delta = 1. - 2. * rotation;
	return rotation + xy * delta;
}

vec2 rotater( in vec2 xy, float r ) {
	vec2 rotated = vec2( 0. );
	rotated += testFrom( 0.00, 0.25, r ) * roto( xy, vec2( 0., 0. ) );
	rotated += testFrom( 0.25, 0.25, r ) * roto( xy, vec2( 0., 1. ) );
	rotated += testFrom( 0.50, 0.25, r ) * roto( xy, vec2( 1., 1. ) );
	rotated += testFrom( 0.75, 0.25, r ) * roto( xy, vec2( 1., 0. ) );
	return rotated;
}

// connect vertex to vertex
float diag( in vec2 xy, float thickness ) {
	return testBetween( xy.x - thickness, xy.x + thickness, xy.y );
}

// connect edge to edge
float circ( in vec2 xy, float thickness ) {
	float toOrigin = length( xy );
	float toNeg1   = length( xy - vec2( 1. ) );
	return testCenter( 0.5, thickness, toOrigin ) + testCenter( 0.5, thickness, toNeg1 );
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

	// scale the space and take pieces of it

	float scale = 22.;
	st *= scale;

	// put some motion in the ocean	
	//st = ( st - scale * 0.5 ) * 0.5 * scale * abs(sin(u_time*0.2) ); // zoom
	st += u_time * scale * 0.11; // pan

	vec2 i = floor( st ); // same for the entire cell
	vec2 f = fract( st ); // varies from 0-1 in each cell

	// randomly rotate the space f by i

	float r = random( i );
	vec2 xy = rotater( f, r );

	// create shapes

	float d = diag( xy, 0.1 );
	float c = circ( xy, 0.1 );

	// change between them
	float which = step( 0., cos( u_time * 0.5 ) );
	float s = which * d + c * ( 1. - which );

	// set the color

	f *= s;
	color = vec3( f.x, f.y, 0. );
	color = vec3( s );

    gl_FragColor = vec4(color,1.0);
}
