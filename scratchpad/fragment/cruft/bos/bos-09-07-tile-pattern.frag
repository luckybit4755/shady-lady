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

	//6 7 8
	//3 4 5 
	//0 1 2 

	angle -= eq( i++, idx ) * PI * 0.25; // 0
	angle -= eq( i++, idx ) * PI * 0.50; // 1
	angle -= eq( i++, idx ) * PI * 0.75; // 2

	angle -= eq( i++, idx ) * PI * 0.00; // 3
	angle -= eq( i++, idx ) * PI * 0.00; // 4
	angle -= eq( i++, idx ) * PI * 1.00; // 5

	angle -= eq( i++, idx ) * PI * 1.75; // 6
	angle -= eq( i++, idx ) * PI * 1.50; // 7
	angle -= eq( i++, idx ) * PI * 1.25; // 8

	xy = fract( xy * count );
	xy -= 0.5;
	xy *= rotate2d( angle );
	xy += 0.5;

	return xy;
}

float makeRectangle( in vec2 size, in vec2 current ) {
    size = vec2( 0.5 ) - size * 0.5;
    vec2 uv = step( size, current );
    uv *= step( size, 1.0 - current );
    return uv.x*uv.y;
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;

	float t = 0.11 * u_time * (1.+ 0.002* cos( u_time ) );
	t = u_time * sign( cos( u_time * 0.33 ) );

	st += -0.5;
	st *= rotate2d( t );
	st += +0.5;

	st = fract( st * 9. );
	st = rotateCell( st, 3 );

	float x = 1.0;
	float y = 0.2;

	t = u_time;
	x = 0.1 + abs( sin( t ) );
	y = 0.1 + abs( cos( t ) );

	float f = makeRectangle( vec2( x, y ), st );

	vec3 color = vec3( st.x * f, st.y * f, f );

    gl_FragColor = vec4( color, 1.0 );
}

