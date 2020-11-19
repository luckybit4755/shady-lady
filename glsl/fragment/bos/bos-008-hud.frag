#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define PI      3.14159265359
#define TWO_PI  6.28318530718

// size: (inner, outer, smooth, glow)
float ring( in vec4 size, in vec2 xy ) {
	float f = dot( xy, xy );
	float x = pow( size.x, 2.0 );
	float y = pow( size.y, 2.0 );

	return min(
		1.0,
		+ smoothstep( x - size.z - size.w , x + size.z + size.w , f )
		- smoothstep( y - size.z,           y + size.z          , f )
	); 
}

float ring( in vec3 size, in vec2 xy ) {
	return ring( vec4( size, 0.0 ), xy );
}

float thinRing( float outer, vec2 xy ) {
	return 6.0 * ring( vec3( outer * 0.999, outer, 0.004 ), xy );
}

float cutOut( float f, int count, float offset, float distance, vec2 xy ) {
    float angle = atan( xy.y, xy.x ) + offset;

	float m = TWO_PI / float( count );
	float q = mod( angle, m ) / m;

	float q1 = step( distance, q );      // 0.1 -> 0.1
	float q2 = step( distance, 1. - q ); // 0.9 -> 0.1
	return f * min( q1, q2 );
}

float line( vec2 start, vec2 stop, float thickness, vec2 xy ) {
	// https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Vector_formulation
	vec2 n = normalize( stop - start );
	vec2 q = start - xy;
	vec2 pq = q - dot( n, q ) * n; // projection of q onto the line
	float d = length( pq );

	return 1. - smoothstep( thickness - 0.01, thickness + 0.01, d );

	// be nice to check t is in 0:1....

	// 0-1 is on the line... 
	vec2 t = ( pq - start ) / n;
	//d *= t.x / t.y;
	//d = 1. - d;

	//float t = length( pq - start ) / length( stop - start );
	//f *= step( 0.0001, t ) - step( 0.999, t );
	//f = step( 0.0001, t );

	//float f = 1. - step( thickness, d );
	float f = step( thickness, d );
	return f;
}

vec2 normal( vec2 v ) {
	return vec2( -v.y, v.x );
}

float sweeper( vec2 xy ) {
	float t = u_time;

	vec2 sweepy = normalize( vec2( cos( t ), sin( t ) ) );
	vec2 sweepy_normal = normal( sweepy );
	vec2 nxy = normalize( xy );

	float vd = dot( nxy, sweepy );
	float vs = smoothstep( 0.00, 1.0, vd );
	float vr = dot( nxy, sweepy_normal );
	
	return max(0.0,vs * 1.-step( 0., vr ));
}

float triangle( float x, vec2 xy ) {
	vec2 nxy = normalize( xy );
	return step( 0.7, dot( nxy, vec2( 1.0, 0.0 ) ) ) * (1.-step( x, xy.x ));
}

vec3 hud( vec2 xy ) {
	vec3 color = vec3(0.0);

	vec3 white = vec3( 1.0 );
	vec3 pale_blue = vec3( 0.6, 0.8, 1.0 ) * 1.4;
	vec3 paler_blue = pale_blue * 2.2;
	vec3 gray = vec3( 0.8 );

	// gapped rings

	float r = ring( vec3( 0.63, 0.633, 0.01 ), xy );
	r = cutOut( r, 8, 0.0, 0.04, xy );
	color += paler_blue * r * 1.7;

	r = ring( vec3( 0.530, 0.5328, 0.00294 ), xy );
	r = cutOut( r, 2, 0.00, 0.10 + 0.17 * abs( cos(u_time) ), xy );
	color += pale_blue * r;

	// static rings 

	color += white     * thinRing( 0.478, xy );
	color += pale_blue * thinRing( 0.330, xy );
	color += pale_blue * thinRing( 0.200, xy ) * 2.0;
	color += pale_blue * ring( vec3( 0.025, 0.028, 0.0002 ), xy );

	// static lines

	float line = 0.009;
	float thickness = 0.0000001;
	float inside = ring( vec3( 0.0, 0.478, 0.0 ), xy );

	color += gray * inside * line( vec2( -line, + line ), vec2( +line, -line ), thickness, xy );
	color += gray * inside * line( vec2( +line, + line ), vec2( -line, -line ), thickness, xy );

	// orange thing

	float t = u_time * 0.3;

	vec2 charlie = xy + vec2(
		0.25 * cos( t ) + 0.11 * sin( t ),
		0.25 * sin( t ) + 0.11 * cos( t )
	);

	vec3 orange = vec3( 1.0, 0.3, 0.1 );

	float blink = step( 0.5, abs( sin( u_time * 13.0 ) ) );

	color += orange * ring( vec3( 0.0165, 0.022, 0.0002 ), charlie );
	color += orange * ring( vec3( 0.0, 0.012, 0.0001 ), charlie ) * blink;

	float charles = 0.25;
	float stepo = pow( mod( u_time * 8., 5.0 ) / 5.0, 1.3 );
	charles = 0.08 + 0.17 * stepo;
	color += orange * ring( vec4( charles * 0.9, charles, 0.001, 0.01 ), charlie ) * 1.5;

	// white blips

	t = u_time * 0.20 + 33.0;

	vec2 blip = vec2(
		0.23 * cos( t ) + 0.11 * sin( t + 1.3 ) ,
		0.23 * sin( t ) + 0.11 * cos( t + 1.3 ) 
	);
	vec2 tango  = xy + blip * 0.9 + 0.2;
	vec2 vector = xy - blip * 1.1;

	color += white * ring( vec3( 0.0, 0.0055, 0.00001 ), tango )  * 95.8;
	color += white * ring( vec3( 0.0, 0.0035, 0.00001 ), vector ) * 95.8;

	// cool sweepy radar line

	color += pale_blue * sweeper( xy ) * inside * 0.3;

	// little triangles

	t = u_time * 0.77;
	float t_off = 0.55 + 0.1 * abs( cos( t ) );
	color += white * triangle( 0.016, +xy + vec2( -t_off,0. ));
	color += white * triangle( 0.016, -xy - vec2( +t_off,0. ));

	///

	return color;
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec2 xy = ( st - 0.5 ) * 1.33;

	vec3 color = hud( xy * 1.22 + vec2( -0.15, 0.15 ) );
	color += hud(-xy * 3.0 -vec2( 1.3, -1.3 ) );

    gl_FragColor = vec4(color,1.0);
}
