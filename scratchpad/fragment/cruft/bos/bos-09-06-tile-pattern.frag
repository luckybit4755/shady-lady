#ifdef GL_ES
precision mediump float;
#endif

#define PI  3.141592653589793
#define PI2 6.283185307179586

uniform vec2 u_resolution;
uniform float u_time;

mat2 rotate2d( in float angle ) {
    return mat2(
        cos( angle ), -sin( angle ),
        sin( angle ),  cos( angle )
    );
}

float eq( int i, float value ) {
    float a = float( i );
    float z = a + 1.0;
    return step( a, value ) * ( 1.0 - step( z, value ) );
}

vec2 rotateCell( vec2 xy, int count_ ) {
	float count = float( count_ );

	float row = floor( xy.x * count ); // 0-count
	float col = floor( xy.y * count ); // 0-count
	float idx = count * col + row;   // 0 - pow(count,2)-1

	float angle = PI2 * idx / pow( count, 2. );

	int i = 0;
	angle = 0.;
	angle += eq( i++, idx ) * PI * 0.0;
	angle += eq( i++, idx ) * PI * 0.5;
	angle += eq( i++, idx ) * PI * -0.5;
	angle += eq( i++, idx ) * PI * 1.0;

	xy = fract( xy * count );
	xy -= 0.5;
	xy *= rotate2d( angle );
	xy += 0.5;

	return xy;
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

    gl_FragColor = vec4(color,1.0);

	float t = 0.11 * u_time * (1.+ 0.002* cos( u_time ) );

	st += -0.5;
	st *= rotate2d( t );
	st += +0.5;

	st = fract( st * 9. );
	st = rotateCell( st, 2 );

	float r = 0.9999 * abs( sin( t ) );
	float g = pow(r,2.);
	float f = smoothstep( g-0.1, g+0.1, st.x*st.y * 1. -st.x*st.x + st.y*st.y );

    gl_FragColor = vec4(vec3(f*0.4),1.0);
}
