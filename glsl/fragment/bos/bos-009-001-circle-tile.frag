#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float circle( in vec2 xy ) {
	xy -= vec2( 0.5 );
	return step( 0.5 * 0.5 * 0.77, dot( xy, xy ) );
}

float tile( in vec2 xy, float scale ) {
	return circle( fract( xy * scale ) );
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3( 0. );
		
	color += vec3( st * tile( st, 1. + 555. * abs( sin( u_time * 0.11 ) ) ), 0.3 );

    gl_FragColor = vec4(color,1.);
}
