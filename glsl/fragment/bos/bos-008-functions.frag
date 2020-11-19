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

vec2 toPolar( vec2 center, vec2 current ) {
	vec2 offset = center - current;
    float r = length( offset ) * 2.0;
    float a = atan( offset.y, offset.x );
	return vec2( r, a );
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

vec2 addShape( in vec2 accumulator, in float value ) {
	return vec2(
		value * accumulator.y, 
		accumulator.y * ( 1.0 - step( 0.0001, value ) ) 
	);
}

mat2 rotate2d( in float angle ) {
    return mat2(
		cos( angle ), -sin( angle ), 
		sin( angle ),  cos( angle )
	);
}

mat2 scale(vec2 scale){
    return mat2(
		scale.x, 0.0,
		0.0,     scale.y
	);
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution;

	//////////////////////

	//vec2 translate = vec2(cos(u_time),sin(u_time));
	//st += translate*0.15;

	mat2 rotated = rotate2d( sin(u_time)*PI );
	mat2 scaled   = scale( vec2(sin(u_time)+1.0) );

	st -= vec2(0.5);

    //st *= rotated;
    //st *= scaled;
	st *= rotated * scaled;
	//st *= scaled * rotated;

    st += vec2(0.5);

	//////////////////////

	vec3 color = vec3(st.x,st.y,0.0);
	vec2 accumulator = vec2( 1.0 );

	float q = 0.2;

	vec2 rect = vec2( q, 0.0 );
		accumulator = addShape( accumulator, makeRectangle( vec2(0.05, 0.10 ), st + rect ) );
		color += RED * accumulator.x;

		accumulator = addShape( accumulator, makeFrame( vec2(0.13), vec2( 0.01 ), st + rect ) );
		color += BLUE * accumulator.x;

	vec2 flower = vec2( 0.0, q );
		accumulator = addShape( accumulator, makeCircle( 0.03, st + flower ) );
		color += COLOR_GOLDENROD * accumulator.x;

		accumulator = addShape( accumulator, makeFlower( 0.06, 0.08, u_time, 5., st + flower ) );
		color += COLOR_DARKORCHID * accumulator.x;

	vec2 gear = vec2( -q, 0.0 );	
		accumulator = addShape( accumulator, makeGear( 0.15, 0.05, u_time, 12., 0.04, st + gear ) );
		color += CYAN * accumulator.x;

		accumulator = addShape( accumulator, makeCircle( 0.02, st + gear ) );
		color += GREEN * accumulator.x;

	vec2 poly = vec2( 0.0, -q );
		float sides = 3.0 + abs( cos( u_time ) ) * 5.0;
		accumulator = addShape( accumulator, makePolygon( 0.1, u_time, sides, st + poly ) );
		color += BLUE * accumulator.x;

		accumulator = addShape( accumulator, makeCircle( 0.1, st + poly ) );
		color += GREEN * accumulator.x;

	vec2 spoke = vec2( q, q );
		float spokes = 2.0 + abs( sin( u_time ) ) * 5.0;
		accumulator = addShape( accumulator, makeSpokes( 0.08, spokes, st + spoke ) );
		color += WHITE * accumulator.x;

	gl_FragColor = vec4( color, 1.0 );
}
