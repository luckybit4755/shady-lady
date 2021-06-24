#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define PI      3.14159265359
#define TWO_PI  (2.0*3.14159265359)


#define RED    vec3( 0.64, 0.0, 0.0 )
#define YELLOW vec3( 1.0, 0.75, 0.0 )
#define GREEN  vec3( 0.0, 1.0, 0.0 )
#define CYAN   vec3( 0.0, 1.0, 1.0 )
#define BLUE   vec3( 0.3, 0.3, 1.0 )
#define WHITE  vec3( 1.0, 1.0, 1.0 )

#define COLOR_DARKORCHID           vec3( 0.6000, 0.1961, 0.8000 )
#define COLOR_GOLDENROD            vec3( 0.8549, 0.6471, 0.1255 )

float makeRectangle( vec2 position, vec2 size, vec2 current ) {
    vec2 tmp;
    float f = 1.0;

    // really weird:
    position *= 0.5;
    size *= 0.5;
    current *= 0.5;

    tmp = step( position, current ); 
    f *= tmp.x * tmp.y;

    tmp = step( position, 1.0 - current ); 
    f *= tmp.x * tmp.y;

    vec2 other = ( current - size );
    tmp = step( other, position ); 
    f *= tmp.x * tmp.y;

    return f;
}

float makeFrame( vec2 position, vec2 size, vec2 thickness, vec2 current ) {
    float inn = makeRectangle( position, size, current );
    float ott = makeRectangle( position + thickness * 0.5, size - thickness, current );
    return inn - ott;
}

float makeCircle( vec2 center, float radius, vec2 current ) {
    vec2 t = current - center;
    float f = dot( t, t );
    radius = pow( radius, 2.0 );
    //return 1.0 - step( radius, f );
    return 1.0 - smoothstep( radius * 0.90, radius * 1.1, f );
}

vec2 toPolar( vec2 center, vec2 current ) {
	vec2 offset = center - current;
    float r = length( offset ) * 2.0;
    float a = atan( offset.y, offset.x );
	return vec2( r, a );
}

float makeGear( vec2 center, float radius, float inner, float angle, float teeth, float length, vec2 current ) {
	vec2 polar = toPolar( center, current );
	float r = polar.x;
	float a = polar.y + angle;
	float f = smoothstep( -0.5, 1.0, cos( a *teeth ) ) * length + radius;
	f = 1.0 - smoothstep( f, f + 0.02, r );
	return min( f, 1.0 - makeCircle( center, inner, current ) );
}

float makeFlower( vec2 center, float inner, float outer, float angle, float petals, vec2 current ) {
	vec2 polar = toPolar( center, current );
	float r = polar.x;
	float a = polar.y + angle;

	float f = abs( cos( a * petals * 0.5 ) )* inner + outer;
	return 1.0 - smoothstep( f, f + 0.02, r );
}

float makePolygon( vec2 center, float radius, float angle, float sides, vec2 current ) {
	vec2 diff = center - current;
	float a = atan( diff.x, diff.y ) + angle;
	float r = length( diff );

	float q = TWO_PI / floor( sides );
	float d = cos(floor(.5+a/q)*q-a) * r;

	radius *= sides * 0.1; // idk...
	return 1.0 - smoothstep( radius, radius + 0.01, d );
}

float makeSpokes( vec2 center, float radius, float spokes, vec2 current ) {
	vec2 polar = toPolar( center, current );
	float r = radius + 2.0 * cos( spokes * polar.y  );
	return step( 1.0, r - polar.x * 6.6 );
}

vec2 addShape( vec2 accumulator, float value ) {
	return vec2(
		value * accumulator.y, 
		accumulator.y * ( 1.0 - step( 0.0001, value ) ) 
	);
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution;

	vec3 color = vec3( 0.0 );
	vec2 accumulator = vec2( 1.0 );

	accumulator = addShape( accumulator, makeRectangle( vec2(0.7), vec2(0.2), st ) );
	color += RED * accumulator.x;

	accumulator = addShape( accumulator, makeFrame( vec2(0.65), vec2(0.3), vec2( 0.01 ), st ) );
	color += BLUE * accumulator.x;

	accumulator = addShape( accumulator, makeCircle( vec2( 0.8, 0.2 ), 0.03, st ) );
	color += COLOR_GOLDENROD * accumulator.x;

	accumulator = addShape( accumulator, makeFlower( vec2( 0.8, 0.2 ), 0.06, 0.08, u_time, 5., st ) );
	color += COLOR_DARKORCHID * accumulator.x;

	accumulator = addShape( accumulator, makeCircle( vec2( 0.5 ), 0.1, st ) );
	color += GREEN * accumulator.x;

	accumulator = addShape( accumulator, makeGear( vec2( 0.2 ), 0.15, 0.05, u_time, 12., 0.04, st ) );
	color += CYAN * accumulator.x;

	float sides = 3.0 + abs( cos( u_time ) ) * 5.0;
	accumulator = addShape( accumulator, makePolygon( vec2( 0.2, 0.8 ), 0.1, u_time, sides, st ) );
	color += BLUE * accumulator.x;

	accumulator = addShape( accumulator, makeCircle( vec2( 0.2, 0.8 ), 0.1, st ) );
	color += GREEN * accumulator.x;

	float spokes = 2.0 + abs( sin( u_time ) ) * 5.0;
	accumulator = addShape( accumulator, makeSpokes( vec2( 0.2, 0.5 ), 0.08, spokes, st ) );
	color += WHITE * accumulator.x;

	gl_FragColor = vec4( color, 1.0 );
}
