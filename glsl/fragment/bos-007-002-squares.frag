uniform vec2 u_resolution;

#define RED    vec3( 1.0, 0.0, 0.0 )
#define YELLOW vec3( 1.0, 1.0, 0.0 )

float rect1( float v, vec2 st ) {
	vec2 bl = step( vec2(v), st );
	return ( bl.x * bl.y );
}

float rect2( float v, vec2 st ) {
	if ( true ) {
		// very odd
		vec2 bl = v * floor( st / v );
		return 1.0 - ( bl.x * bl.y );
	} 


	// not working yet... https://thebookofshaders.com/glossary/?search=floor
	float f = 1000.0;
	vec2 bl = v * floor( st / v );
	return ( bl.x * bl.y );
}

float rect( float v, vec2 st ) {
	return rect1( v, st );
}

float blurry_rect( float blur, float v, vec2 st ) {
	vec2 bl = smoothstep( blur * vec2(v),vec2(v), st );
	return ( bl.x * bl.y );
}

float side( float blur, float v, vec2 st ) {
	return rect( v, st );
	return blurry_rect( blur, v, st * blur );
}

vec3 square( vec3 color, float blur, float x, float y, vec2 st ) {
	float pct = 1.0;
	/* multiplication is and */
	pct *= side( blur, x, st );
	pct *= side( blur, y, 1.0 - st );
	return pct * color;
}

vec3 rectangle( vec3 color, vec2 position, vec2 size, vec2 current ) {
	vec2 tmp;
	float pct = 1.0;

	// really weird:
	position *= 0.5;
	size *= 0.5;
	current *= 0.5;

	/* weird L
	tmp = step( position, current );
	pct *= tmp.x * tmp.y;

	tmp = step( position + size, current );
	pct *= 1.0 - ( tmp.x * tmp.y);
	*/

	// cut off bottom and left (good)
	tmp = step( position, current ); pct *= tmp.x * tmp.y;
	tmp = step( position, 1.0 - current ); pct *= tmp.x * tmp.y;

	vec2 idk = ( current - size );
	tmp = step( idk, position ); pct *= tmp.x * tmp.y;




	return pct * color;
}


void main(){
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);
/*
	// Each result will return 1.0 (white) or 0.0 (black).
	float left = step(0.1,st.x);   // Similar to ( X greater than 0.1 )
	float bottom = step(0.1,st.y); // Similar to ( Y greater than 0.1 )

	// The multiplication of left*bottom will be similar to the logical AND.
	color = vec3( left * bottom );
*/
/*
	vec2 bl = step( vec2(0.1), st );
	float pct = ( bl.x * bl.y );

	vec2 tr = step( vec2(0.1), 1.0 - st );
	pct *= ( tr.x * tr.y );
*/
	//float pct = square( 0.8, 0.4, 0.2, st );
	//float pct = square( 1.0, 0.4, 0.2, st );

	//color += square( RED,    1.0, 0.4, 0.2, st );
//	color += square( YELLOW, 1.0, 0.15, 0.40, st );

	color += rectangle( RED, vec2( 0.1, 0.1 ), vec2( 0.8, 0.5 ), st );
	color += rectangle( YELLOW, vec2( 0.4, 0.4 ), vec2( 0.2, 0.4 ), st );// only in bottom quadrant?!

	//color += rectangle( YELLOW, vec2( 0.75, 0.8 )*0.5, vec2( 0.2, 0.1 )*0.5, st * 0.5 );// only in bottom quadrant?!

	//color = vec3( pct );
	gl_FragColor = vec4(color,1.0);
}
