
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float circle( in vec2 xy ) {
    xy -= vec2( 0.5 );
    return step( 0.5 * 0.5 * 0.66, dot( xy, xy ) );
}

float saltire( in vec2 xy ) {
	vec2 og = vec2( xy );
    xy -= vec2( 0.5 );
	float q = 0.15;

	float f = 0.0;

	// bottom left, top right
	float top = step( q, xy.x - xy.y );
	float bot = step( q, xy.y - xy.x );
	f += top + bot;

	xy *= vec2(-1.,1);
	top = step( q, xy.x - xy.y );
	bot = step( q, xy.y - xy.x );
	f *= top + bot;

	f += circle( og );

	return f;
}

// when i == floor( value ), return 1, else return 0
float equalWeight( int i, float value ) {
	float a = float( i );
	float z = a + 1.0;
	return step( a, value ) * ( 1.0 - step( z, value ) );
}

float eq( int i, float value ) {
	return equalWeight( i, value );
}

float gt( int i, float value ) {
	return step( float( i ), value );
}

vec3 ttt( in vec2 st, in vec2 xy ) {
	// where are we?
	float row = floor( st.x * 3. ); // 0-3
	float col = floor( st.y * 3. ); // 0-3
	float idx = 3. * col + row; // 0 - 8
	// create the shapes
	float z = 0.0;

	float o = circle( 2. * xy  - 0.5 ) - circle( xy );
	float x = 1.0 - saltire( xy );

	float f = 0.;

	// moves: 
	float t = floor( mod( u_time, float( 8 + 1 ) ) );
	vec3 move3 = vec3( gt( 1, t ), gt( 7, t ), gt( 2, t ) ); // 6,7,8
	vec3 move2 = vec3( gt( 4, t ), gt( 0, t ), gt( 5, t ) ); // 3,4,5
	vec3 move1 = vec3( gt( 3, t ), gt( 6, t ), gt( 8, t ) ); // 0,1,2

	// board:
	vec3 row3 = vec3( o, o, x ); // 6,7,8
	vec3 row2 = vec3( x, x, o ); // 3,4,5
	vec3 row1 = vec3( o, x, x ); // 0,1,2

	vec3 red1 = vec3( 0., 1., 1. );
	vec3 red2 = vec3( 1., 1., 0. );
	vec3 red3 = vec3( 0., 0., 1. );

	// which cell is drawn here?
	int i = 0;
	vec3 hot1 = vec3( eq( i++, idx ), eq( i++, idx ), eq( i++, idx ) );
	vec3 hot2 = vec3( eq( i++, idx ), eq( i++, idx ), eq( i++, idx ) );
	vec3 hot3 = vec3( eq( i++, idx ), eq( i++, idx ), eq( i++, idx ) );

	// draw the board

	vec3 red = vec3( 1., 0., 0. );
	vec3 grn = vec3( 0., 1., 0. );

	vec3 color = vec3( 0. );

	color += move1.x * hot1.x * row1.x * ( red * red1.x + grn * ( 1. - red1.x ) );
	color += move1.y * hot1.y * row1.y * ( red * red1.y + grn * ( 1. - red1.y ) );
	color += move1.z * hot1.z * row1.z * ( red * red1.z + grn * ( 1. - red1.z ) );

	color += move2.x * hot2.x * row2.x * ( red * red2.x + grn * ( 1. - red2.x ) );
	color += move2.y * hot2.y * row2.y * ( red * red2.y + grn * ( 1. - red2.y ) );
	color += move2.z * hot2.z * row2.z * ( red * red2.z + grn * ( 1. - red2.z ) );

	color += move3.x * hot3.x * row3.x * ( red * red3.x + grn * ( 1. - red3.x ) );
	color += move3.y * hot3.y * row3.y * ( red * red3.y + grn * ( 1. - red3.y ) );
	color += move3.z * hot3.z * row3.z * ( red * red3.z + grn * ( 1. - red3.z ) );

	return color;
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

	vec2 xy = fract( 3.0 * st );
	color += ttt( st, xy );

    gl_FragColor = vec4(color,1.0);
}
