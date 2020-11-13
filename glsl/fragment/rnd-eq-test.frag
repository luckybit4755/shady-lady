#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec3 color = vec3(0.0);


	vec2 st = gl_FragCoord.xy/u_resolution.xy;
    float aspect = u_resolution.x/u_resolution.y;
    st.x *= aspect;

	float x = st.x;

	float f = 4.0;
	//x = mod( u_time, f ) / f;

	float y = abs(sin(x));
	y = pow( x * 2.0, 5.0 );
	if ( x > 0.5 ) y = pow( sin( ( 1.0 - x ) * 0.5 * 6.28 ), 0.7 );

	y = st.x * 0.5 + 0.5;
	y = 1.0 - 2.0 * abs( st.x - 0.5 );

	bool k = abs( y - st.y ) < 0.001;

	if ( k ) gl_FragColor = vec4( 0.0, 1.0, 0.0, 1.0 );
	else gl_FragColor = vec4( y,y,y, 1.0 );
}


