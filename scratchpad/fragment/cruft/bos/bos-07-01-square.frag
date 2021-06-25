
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

	// spin
	if ( true ) {
		float square = 1.0;
		// square = 0.0; // circle...
		float l = length(st-0.5);
		vec2 toCenter = vec2(0.5)-st;
		float angle = atan(toCenter.y,toCenter.x) * square + u_time;

		st.x = cos( angle ) * l + 0.5;
		st.y = sin( angle ) * l + 0.5;
	}

	float f = 0.11 + 0.33 * pow( cos( u_time ), 2.0 );
	float g = 1.0 - f;

	if ( st.x > f && st.y > f && st.x < g && st.y < g ) {
		color = vec3( 1.0 );
	}

    gl_FragColor = vec4(color,1.0);
}
