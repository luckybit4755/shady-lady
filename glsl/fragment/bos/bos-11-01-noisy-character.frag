#ifdef GL_ES
precision mediump float;
#endif

#define PI  3.141592653589793
#define PI2 6.283185307179586

#define COLOR_DARKGOLDENROD  vec3( .7216, .5255, .0431 )
#define COLOR_CRIMSON        vec3( .8627, .0784, .2353 )
#define COLOR_DARK_BLUE      vec3( .0156, .1490, .4862 )
#define COLOR_BLUE           vec3( .0470, .4666, .6078 )
#define COLOR_HOTPINK        vec3( .9999, .4118, .7059 )
#define COLOR_MEDIUMORCHID   vec3( .7294, .3333, .8275 )

uniform vec2 u_resolution;
uniform float u_time;

float random( in float v ) {
    return fract( sin( v ) * 76871.97673 );
}

float random( in vec2 xy ) {
	return random( dot( xy, vec2( 47.6869, 31.5479 ) ) );
}

float noise( float v ) {
	float i = floor( v );
	float f = fract( v );

	float r0 = random( i + 0. );
	float r1 = random( i + 1. );
	float mx = smoothstep( 0., 1., f );
	//mx = f * f * (3.0 - 2.0 * f );
	//mx = pow( f, 3. ) + 3. * pow( f, 2. ) - 2. * f;
	//mx = f * 10. * f;

	return mix( r0, r1, mx );
}

vec2 noise( vec2 xy ) {
	vec2 i = floor( xy );
	vec2 f = fract( xy );

	float r0 = random( i + 0. );
	float r1 = random( i + 1. );
	float mx = smoothstep( 0., 1., f.x );
	float my = smoothstep( 0., 1., f.y );

	float nx = mix( r0, r1, mx );
	float ny = mix( r0, r1, my );
	return vec2( nx, ny );

	return vec2( noise( xy.x ), noise( xy.y ) );
}

float circle( vec2 xy, vec2 center, float radius ) {
	xy -= center;
	radius = pow( radius, 2. );
	//return smoothstep( radius - 0.01, radius + 0.01, dot( xy, xy ) );
	return smoothstep( radius * 0.96, radius, dot( xy, xy ) );
}

float wircle( vec2 xy, vec2 center, vec2 scale, float radius ) {
	float t = u_time * 3.10;
	float x = xy.x * scale.x + t;
	float y = xy.y * scale.y + t;

	float nx = noise( x );
	float ny = noise( y );
	float nt = noise( t );

	float r = radius;
	r += 0.08 * radius * nx;
	r += 0.10 * radius * ny;

	center += 0.1 * radius * ( nx - ny + nt );

	float c = circle( xy, center, r );

	return c + noise( c *83.3 );
}

float makeSmile( vec2 st ) {
	float c = 0. + wircle( st, vec2(  0.50, 0.50 ), vec2(   7., 41.1 ), 0.30 );
	float e = 1. - wircle( st, vec2(  0.40, 0.60 ), vec2(  33., 74.1 ), 0.04 );
	float i = 1. - wircle( st, vec2(  0.60, 0.60 ), vec2(  33., 74.1 ), 0.04 );

	float m = 0. + wircle( st, vec2(  0.50, 0.50 ), vec2(  41., 7.1 ), 0.20 );
	float o = 0. + wircle( st, vec2(  0.50, 0.60 ), vec2(  41., 7.1 ), 0.20 );
	float q = step( 1., o - m  );

	return 1. - ( c + e + i + q );
}

float makeBackground( vec2 st ) {
	st += vec2( 
		-.5 + 0.9 * noise( cos( u_time + st.y ) ),
		-.5 + 1.9 * noise( sin( u_time + st.x ) )
	);
	st.y += 0.00001 * u_time;
	return fract( 888. * dot( st, st ) * noise( st.y + st.x+ u_time ) );
}

float makeSquid( in vec2 st ) {
//float wircle( vec2 xy, vec2 center, vec2 scale, float radius ) {
	float f = 0.0;

	vec2 center = vec2( 0.5, 0.75 );

	f += wircle( st*vec2(1.0-0.2*abs(sin(u_time)),1.2+ 0.2*abs(cos(u_time))), center, vec2( 4.3, 5.2 ), 0.3 );

	vec2 arm;
	float angle;
	float distance = 0.22;

	center = vec2( 0.6, 0.9 );

	const int max = 8;
	for ( int i = 0 ; i < max ; i++ ) {
 		angle = PI2 * float( i ) / float( max ) + 1.3 * sin( u_time );
		arm = center + vec2( distance * cos( angle ), distance * sin( angle ) );
		f *= wircle( st*vec2(1.2,1.9), arm, vec2( 3.3, 2.2 ), 0.1 );
	}

	return 1.-f;
}

vec3 addColor( float threshold, in vec3 current, in vec3 new, float q ) {
	float neu = step( threshold, new.r + new.g + new.b );
	float old = 1. - neu;

	float p = (1.-q);

	return vec3(
		current.r * old + neu * ( current.r * q + new.r * p ),
		current.g * old + neu * ( current.g * q + new.g * p ),
		current.b * old + neu * ( current.b * q + new.b * p )
	);
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3( COLOR_DARK_BLUE );

	float threshold = 0.03344;
	color = addColor( threshold, color, COLOR_BLUE * makeBackground( st ), 0. );

	////
	float t;
	vec2 at;
	vec3 squid;
	vec3 squidColor = COLOR_MEDIUMORCHID;
	//COLOR_HOTPINK


	t = 0.25 * u_time;
	at = vec2( 0.1 + 0.1 * cos( t ), pow( abs( sin( t ) ), 2.0 ) );
	squidColor = mix( COLOR_MEDIUMORCHID, COLOR_HOTPINK, abs( cos( t ) ) );
	squid = squidColor * makeSquid( ( st - at ) * 6. );
	color = addColor( threshold, color, squid, 0.4 );

	t = 0.35 * u_time + 1.33;
	at = vec2( 0.5 + 0.1 * cos( t ), pow( abs( sin( t ) ), 2.0 ) );
	squidColor = mix( COLOR_MEDIUMORCHID, COLOR_HOTPINK, abs( sin( t ) ) );
	squid = squidColor * makeSquid( ( st - at ) * 8. );
	color = addColor( threshold, color, squid, 0.4 );

	t = 0.15 * u_time + 2.33;
	at = vec2( 0.8 + 0.1 * cos( t ), pow( abs( sin( t ) ), 2.0 ) );
	squidColor = mix( COLOR_MEDIUMORCHID, COLOR_HOTPINK, abs( sin( t +1.4 ) ) );
	squid = squidColor * makeSquid( ( st - at ) * 8. );
	color = addColor( threshold, color, squid, 0.4 );

	////

    gl_FragColor = vec4(color,1.0);
}
