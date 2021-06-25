#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

/////////////////////////////////////////////////////////////////////////////

float font_difference( float a, float b ) {
	return a * ( 1.0 - b );
}

float font_step( float cutoff, float value ) {
	return smoothstep( cutoff - 0.003, cutoff + 0.003, value );
}

vec2 font_step( vec2 cutoff, vec2 value ) {
	return smoothstep( cutoff - 0.003, cutoff + 0.003, value );
}

float font_box( vec2 min, vec2 max, vec2 current ) {
	vec2 box = font_step( min, current ) - font_step( max, current );
	return box.x * box.y;
}

float font_circle( vec2 center, vec2 scale, vec2 range, vec2 current ) {
	vec2 tmp = scale * ( current - center );
	float f = dot( tmp, tmp );
	return font_step( range.x, f ) - font_step( range.y, f );
}

/////////////////////////////////////////////////////////////////////////////

float font_0( vec2 current ) {
	return font_circle( vec2( 0.5 ), vec2( 1.55, 1.00 ), vec2( 0.1, 0.2 ), current );
}

float font_1( vec2 current ) {
	return font_box( vec2( 0.44, 0.06 ), vec2( 0.56, 0.94 ), current );
}

float font_2( vec2 current ) {
 	vec2 topCenter = ( current - vec2( 0.5, 0.67 ) ) * 1.70;
	float f = dot( topCenter, topCenter );
	float top = ( font_step( 0.085, f ) - font_step( 0.210, f ) ) * font_step( -0.1, topCenter.y );

	float bottom_x = font_step( 0.26, current.x ) - font_step( 0.74, current.x );
	float bottom_y = font_step( 0.06, current.y ) - font_step( 0.17, current.y );
	float bottom = bottom_x * bottom_y;

	float diagonal = abs( current.x * 1.119 - current.y - 0.175 );
	diagonal  = 1.0 - font_step( 0.08, diagonal );
	diagonal -= font_step( 0.76, current.x ); // right side
	diagonal -= 1.0 - font_step( 0.22, current.x ); // left side
	diagonal -= 1.0 - font_step( 0.062, current.y ); // bottom 

	return max( top + bottom + diagonal, 0.0 );
}

float font_8( vec2 current ) {
	vec2 scale = vec2( 1.70, 1.90 );

 	vec2 topCenter = ( current - vec2( 0.5, 0.705 ) ) * scale;
	float f = dot( topCenter, topCenter );
	float top = ( font_step( 0.085, f ) - font_step( 0.210, f ) );

	scale = vec2( 1.58, 1.94 );
 	vec2 bottomCenter = ( current - vec2( 0.5, 0.3 ) ) * scale;
	f = dot( bottomCenter, bottomCenter );
	float bottom = ( font_step( 0.085, f ) - font_step( 0.210, f ) );

	return top + bottom;
}

float font_3( vec2 current ) {
	return font_difference( font_8( current ), font_box( vec2( 0.0, 0.3 ), vec2( 0.50, 0.65 ), current ) );
}

float font_4( vec2 current ) {
	float vertical   = font_box( vec2( 0.54, 0.06 ), vec2( 0.66, 0.94 ), current );
	float horizontal = font_box( vec2( 0.22, 0.35 ), vec2( 0.77, 0.47 ), current );
	float little     = font_box( vec2( 0.22, 0.35 ), vec2( 0.32, 0.67 ), current );
	return vertical + horizontal + little;
}

float font_5( vec2 current ) {
	float top = font_box( vec2( 0.22, 0.84 ), vec2( 0.77, 0.95 ), current );
	float side = font_box( vec2( 0.22, 0.46 ), vec2( 0.33, 0.95 ), current );
	float round = font_circle( vec2( 0.523, 0.40 ), vec2( 1.5, 1.3 ), vec2( 0.09, 0.21 ), current );

	float negative = font_box( vec2( 0.20, 0.22 ), vec2( 0.44, 0.44 ), current );
	round = font_difference( round, negative );

	return top + side + round;
}

float font_6( vec2 current ) {
	float big = font_circle( vec2( 0.5 ), vec2( 1.5, 1.0 ), vec2( 0.10, 0.19 ), current );
	float negative = font_box( vec2( 0.33, 0.02 ), vec2( 0.84, 0.64 ), current );
	big = font_difference( big, negative );

	float lil = font_circle( vec2( 0.518, 0.333 ), vec2( 1.7, 1.6 ), vec2( 0.10, 0.19 ), current );
	
	return big + lil;
}

float font_7( vec2 current ) {
	float diagonal = abs( current.x * 1.8 - current.y * 0.5 - 0.8 );
	diagonal = 1.0 - font_step( 0.13, diagonal ); // thickness

    float top = font_box( vec2( 0.22, 0.84 ), vec2( 0.750, 0.95 ), current );
    float mid = font_box( vec2( 0.42, 0.54 ), vec2( 0.750, 0.65 ), current );

	return ( diagonal + top + mid ) * font_box( vec2( 0.06 ), vec2( 0.94 ), current );
}

float font_9( vec2 current ) {
	return font_6( 1.0 - current ); // lol
}

float font_c_dash( vec2 current ) {
	return font_box( vec2( 0.22, 0.44 ), vec2( 0.750, 0.57 ), current );
}

float font_c_plus( vec2 current ) {
	return font_c_dash( current ) + font_c_dash( vec2( current.y, current.x ) );
}

float font_c_dot( vec2 current ) {
	return font_box( vec2( 0.45, 0.05 ), vec2( 0.55, 0.14 ), current );
}

vec3 whichOne( float value, int index, float current ) {
	value = min( value, 1.0 );
	float a = float( index );
	float z = a + 1.0;
	float weight = step( a, current ) * ( 1.0 - step( z, current ) );
	return vec3( weight * value );
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;

    vec2 translate = vec2(cos(u_time),sin(u_time));

	st += translate * 0.35;
	vec3 color = vec3(st.x,st.y,0.0);

	int i = 0;
	int max = 12;
	float q = floor( mod( u_time * 2.9, float( max + 1 ) ) );
//q=12.0;

	color += whichOne( font_0( st ), i++, q );
	color += whichOne( font_1( st ), i++, q );
	color += whichOne( font_2( st ), i++, q );
	color += whichOne( font_3( st ), i++, q );
	color += whichOne( font_4( st ), i++, q );
	color += whichOne( font_5( st ), i++, q );
	color += whichOne( font_6( st ), i++, q );
	color += whichOne( font_7( st ), i++, q );
	color += whichOne( font_8( st ), i++, q );
	color += whichOne( font_9( st ), i++, q );
	color += whichOne( font_c_dot( st ), i++, q );
	color += whichOne( font_c_dash( st ), i++, q );
	color += whichOne( font_c_plus( st ), i++, q );


    gl_FragColor = vec4(color,1.0);
}
