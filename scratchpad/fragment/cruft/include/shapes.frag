vec2 stepo( in vec2 cut, in vec2 value ) {
	return smoothstep( cut * 0.99, cut * 1.01, value );
}

float makeRectangle( in vec2 size, in vec2 current ) {
	size = vec2( 0.5 ) - size * 0.5;
	vec2 uv = stepo( size, current );
    uv *= stepo( size, 1.0 - current );
    return uv.x*uv.y;
}

float makeFrame( in vec2 size, in vec2 thickness, in vec2 current ) {
	float inn = makeRectangle( size, current );
	float ott = makeRectangle( size - thickness, current );
    return inn - ott;
}

float makeCircle( in float radius, in vec2 current ) {
    vec2 t = current - vec2( 0.5 );
    float f = dot( t, t );
    radius = pow( radius, 2.0 );
    //return 1.0 - step( radius, f );
    return 1.0 - smoothstep( radius * 0.90, radius * 1.1, f );
}

float makeGear( in float radius, in float inner, in float angle, in float teeth, in float length, in vec2 current ) {
	vec2 polar = toPolar( vec2( 0.5 ), current );
	float r = polar.x;
	float a = polar.y + angle;
	float f = smoothstep( -0.5, 1.0, cos( a *teeth ) ) * length + radius;
	f = 1.0 - smoothstep( f, f + 0.02, r );
	return min( f, 1.0 - makeCircle( inner, current ) );
}

float makeFlower( in float inner, in float outer, in float angle, in float petals, in vec2 current ) {
	vec2 polar = toPolar( vec2( 0.5 ), current );
	float r = polar.x;
	float a = polar.y + angle;

	float f = abs( cos( a * petals * 0.5 ) )* inner + outer;
	return 1.0 - smoothstep( f, f + 0.02, r );
}

float makePolygon( in float radius, in float angle, in float sides, in vec2 current ) {
	vec2 diff = vec2( 0.5 ) - current;
	float a = atan( diff.x, diff.y ) + angle;
	float r = length( diff );

	float q = TWO_PI / floor( sides );
	float d = cos(floor(.5+a/q)*q-a) * r;

	radius *= sides * 0.1; // idk...
	return 1.0 - smoothstep( radius, radius + 0.01, d );
}

float makeSpokes( in float radius, in float spokes, in vec2 current ) {
	vec2 polar = toPolar( vec2( 0.5 ), current );
	float r = radius + 2.0 * cos( spokes * polar.y  );
	return step( 1.0, r - polar.x * 6.6 );
}

// initially: vec2 accumulator = vec2( 1.0 );
// usage: accumulator = addShape( accumulator, f ); color += RED * accumulator.x;
vec2 addShape( in vec2 accumulator, in float value ) {
	return vec2(
		value * accumulator.y, 
		accumulator.y * ( 1.0 - step( 0.0001, value ) ) 
	);
}
