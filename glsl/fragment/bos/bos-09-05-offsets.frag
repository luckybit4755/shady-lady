#ifdef GL_ES
precision mediump float;
#endif

#define COUNT  21.
#define RADIUS 0.3

uniform vec2 u_resolution;
uniform float u_time;

vec2 offset( vec2 xy, float scale, vec3 xOffset, vec3 yOffset ) {
	xy *= scale;

	float fx = step( 1., mod( xy.y, xOffset.x ) );
	float fy = step( 1., mod( xy.x, yOffset.x ) );

	xy.x += ( 0. + fx ) * xOffset.y;
	xy.x -= ( 1. - fx ) * xOffset.z;

	xy.y += ( 0. + fy ) * yOffset.y;
	xy.y -= ( 1. - fy ) * yOffset.z;

	return fract( xy );
}

float circle( vec2 xy, float r ) {
	xy -= 0.5;
	r = pow( r, 2. );
	float smoothness = 0.02;
	return smoothstep( r - smoothness, r + smoothness, dot( xy, xy ) );
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

	float full = u_time * 2.;
	float halb = full * 0.5;

	float f = full;
	float which = step( 1., mod( halb, 2. ) );

	float fx = f * ( 0. -which );
	float fy = f * ( 1. -which );

	st = offset( st, COUNT, vec3( 2., fx, fx ), vec3( 2., fy, fy ) );
	color += circle( st, RADIUS );

    gl_FragColor = vec4(color,1.0);
}
