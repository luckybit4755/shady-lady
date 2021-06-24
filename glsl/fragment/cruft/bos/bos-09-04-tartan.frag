#ifdef GL_ES
precision mediump float;
#endif

#define GREEN vec3( 0., 0.27, 0.00 )
#define BLUE  vec3( 0., 0.00, 0.33 )
#define BLACK vec3( 0., 0.00, 0.00 )
#define WHITE vec3( 1., 1.00, 1.00 )

uniform vec2 u_resolution;
uniform float u_time;

float diag( float thickness, float count, vec2 xy ) {
	//thickness = 0.5 / count;
	float a = thickness * 0.98;
	float b = thickness * 1.02;

	return smoothstep( a, b, fract( (xy.x - xy.y) * count ) );
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

	float sections = 4.;
	float invs = 1. / sections;
	float idk = 1.4;

	////

	float green_horizontal = step( invs / idk, mod( st.y, invs ) );
	float green_vertical   = step( invs / idk, mod( st.x, invs ) );

	float blue_horizontal = step( invs / idk, mod( st.y + invs * 0.5, invs ) );
	float blue_vertical   = step( invs / idk, mod( st.x + invs * 0.5, invs ) );

	////

	float big = 25.;

	float green = diag( 0.5, big, fract( st * sections ) );
	color += green_horizontal * GREEN * green;
	color += green_vertical   * GREEN * (1.-green);

	float blue = diag( 0.5, big, fract( st * sections ) );
	color += blue_horizontal * BLUE * blue;
	color += blue_vertical   * BLUE * (1.-blue);

	// 

	st -= vec2( invs*0.387, invs * 0.387 );
	sections *=9.;
	invs = 0.5 / sections;
	invs = 5. / sections; // how many segments (lower is more)
	invs = 4. / sections; // how many segments (lower is more)
	idk = 1.08; // thickness of the segment

	float black_horizontal = step( invs / idk, mod( st.y * 0.9, invs ) );
	float black_vertical   = step( invs / idk, mod( st.x * 0.9, invs ) );

	color -= black_horizontal * WHITE * diag( 0.5, big, fract( st * sections * 7. ) );
	color -= black_vertical   * WHITE * diag( 0.5, big, fract( st * sections * 7. ) );

    gl_FragColor = vec4(color,1.0);
}
