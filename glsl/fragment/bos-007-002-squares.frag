uniform vec2 u_resolution;

#define RED    vec3( 1.0, 0.0, 0.0 )
#define YELLOW vec3( 1.0, 1.0, 0.0 )
#define GREEN  vec3( 0.0, 1.0, 0.0 )
#define CYAN   vec3( 0.0, 1.0, 1.0 )
#define BLUE   vec3( 0.0, 0.0, 1.0 )

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

	color += RED    * rectangle( vec2( 0.1, 0.1 ), vec2( 0.8, 0.5 ), st );
	color += YELLOW * rectangle( vec2( 0.4, 0.4 ), vec2( 0.2, 0.4 ), st );
	color += GREEN  * frame(    vec2( 0.12, 0.7 ), vec2( 0.1, 0.2 ), vec2( 0.01 ), st );

	gl_FragColor = vec4(color,1.0);
}
