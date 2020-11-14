#ifdef GL_ES
precision mediump float;
#endif

#define COLOR_PEACHPUFF            vec3( 1.0000, 0.8549, 0.7255 )
#define COLOR_PERU                 vec3( 0.8039, 0.5216, 0.2471 )
#define COLOR_ROYALBLUE            vec3( 0.2549, 0.4118, 0.8824 )
#define COLOR_SEAGREEN             vec3( 0.1804, 0.5451, 0.3412 )

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float circle1( vec2 center, float radius, float smooth, vec2 current ) {
	float f = distance( current, center );
	return 1.0 - smoothstep( radius - smooth, radius, f );
}

float circle2( vec2 center, float radius, float smooth, vec2 current ) {
	vec2 t = current - center;
	float f = dot( t, t );
	radius = pow( radius, 2.0 );
	return 1.0 - smoothstep( radius * smooth, radius, f );
}

float circle( vec2 center, float radius, float smooth, vec2 current ) {
	return circle2( center, radius, smooth, current );
}

void main(){
	vec2 st = gl_FragCoord.xy/u_resolution;
	float f = 0.0;

	//f = distance(st,vec2(0.5));
	//f = 1.0 - step( 0.5, f );
	//f = smoothstep( 0.18, 0.20, f );
	//f = smoothstep( 0.48, 0.5, f );

	float t = u_time * 1.0;

	vec2 center = vec2( 0.5 + cos( t * 3.0 ) * 0.25 );
	float radius = 0.15 + 0.18 * abs( sin( t * 0.33 ) );
	float smooth = 0.80 + 0.2 * sin( t + 4.4 );

	float c1 = circle( center, radius, 0.80, st );
	float c2 = circle( vec2( 1.0 ), radius, 0.80, st );
	//f = c1 + c2; // 2 circles, colors add on intersection
	//f = c1 * c2; // intersection
	f = max( c1, c2 ); // 2 circles
	//f = min( c1, c2 ); // intersection
	//f = pow( c1, c2 ); // c2 negative on solid bg, goes c1
	//f = pow( c2, c1 ); // c1 negative on solid bg, goes behind c2

	if ( false ) {
		f = distance(st,vec2(0.4)) + distance(st,vec2(0.6)); // elipse
		//f = distance(st,vec2(0.4)) * distance(st,vec2(0.6)); // 2 circles that merge together
		//f = min(distance(st,vec2(0.4)),distance(st,vec2(0.6))); // 2 circles 
		//f = max(distance(st,vec2(0.4)),distance(st,vec2(0.6))); // intersection
		//f = pow(distance(st,vec2(0.4)),distance(st,vec2(0.6)));

		radius = 0.5 + 0.5 * cos( t );
		f = 1.0 - step( radius, f );
	}

	vec3 color = f * COLOR_PERU;
	gl_FragColor = vec4( color, 1.0 );
}
