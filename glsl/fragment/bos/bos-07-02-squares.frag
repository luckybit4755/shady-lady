#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

#define RED    vec3( 0.64, 0.0, 0.0 )
#define YELLOW vec3( 1.0, 0.75, 0.0 )
#define GREEN  vec3( 0.0, 1.0, 0.0 )
#define CYAN   vec3( 0.0, 1.0, 1.0 )
#define BLUE   vec3( 0.3, 0.3, 1.0 )
#define WHITE  vec3( 1.0, 1.0, 1.0 )

vec2 floor_step( vec2 a, vec2 b ) {
	return vec2(
		floor( a.x - b.x ),
		floor( a.y - b.y )
	);
}

float rectangle( vec2 position, vec2 size, vec2 current ) {
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

	vec2 idk = ( current - size );
	tmp = step( idk, position ); 
	f *= tmp.x * tmp.y;

	return f;
}

float frame( vec2 position, vec2 size, vec2 thickness, vec2 current ) {
	float inn = rectangle( position, size, current );
	float ott = rectangle( position + thickness * 0.5, size - thickness, current );
	return inn - ott;
}

void main(){
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

	// Mondrian

	// top row
	float gap_y = 0.027;
	float gap_x = 0.035;

	float y = 0.838;
	float h = 0.162;

	color += RED    * rectangle( vec2( 0.000, y ), vec2( 0.070, h ), st );
	color += RED    * rectangle( vec2( 0.090, y ), vec2( 0.100, h ), st );
	color += WHITE  * rectangle( vec2( 0.210, y ), vec2( 0.420, h ), st );
	color += WHITE  * rectangle( vec2( 0.655, y ), vec2( 0.160, h ), st );
	color += YELLOW * rectangle( vec2( 0.835, y ), vec2( 0.160, h ), st );

	y -= h + gap_y;
	color += RED    * rectangle( vec2( 0.000, y ), vec2( 0.070, h ), st );
	color += RED    * rectangle( vec2( 0.090, y ), vec2( 0.100, h ), st );
	color += WHITE  * rectangle( vec2( 0.210, y ), vec2( 0.420, h ), st );
	color += WHITE  * rectangle( vec2( 0.655, y ), vec2( 0.160, h ), st );
	color += YELLOW * rectangle( vec2( 0.835, y ), vec2( 0.160, h ), st );

	h = 0.524;
	y -= h + gap_y + 0.002;
	color += WHITE  * rectangle( vec2( 0.210, y ), vec2( 0.420, h ), st );
	color += WHITE  * rectangle( vec2( 0.655, y ), vec2( 0.160, h ), st );
	color += WHITE  * rectangle( vec2( 0.835, y ), vec2( 0.160, h ), st );

	h = y - gap_y + 0.008;
	y = 0.0;	
	color += WHITE  * rectangle( vec2( 0.210, y ), vec2( 0.420, h ), st );
	color += BLUE   * rectangle( vec2( 0.655, y ), vec2( 0.160, h ), st );
	color += BLUE   * rectangle( vec2( 0.835, y ), vec2( 0.160, h ), st );

	h = 0.620;
	color += WHITE  * rectangle( vec2( 0.000, y ), vec2( 0.190, h ), st );


	gl_FragColor = vec4(color,1.0);
}
