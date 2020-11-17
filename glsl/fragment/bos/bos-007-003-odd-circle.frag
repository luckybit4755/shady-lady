uniform float u_time;
uniform vec2 u_resolution;

void main(){
	vec2 st = gl_FragCoord.xy/u_resolution;

	float cs = cos( u_time );
	float sn = sin( u_time );

	float fp = 22.0 + 222.0 * abs( cs ); //99
	float gp = 22.0 + 222.0 * abs( sn ); //99
	float gg = 2.0 + 50.0 * abs( cs );

	vec2 center = vec2( 0.5 + 0.15 * cs, 0.5 + 0.15 * sn );

	float f = pow( distance( st, center ) + 1.0, fp );
	float g = pow( distance( st, center ) * gg, gp );

	vec3 a = vec3( f, 0.0, 0.0 );
	vec3 b = vec3( 0.0, g, 0.0 );

	gl_FragColor = vec4( a + b, 1.0 );
}
