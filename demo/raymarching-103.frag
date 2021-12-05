#include es300-boilerplate.frag
#include uniforms.frag

#include raymarching/main-marcher.glsl
#include raymarching/example-map.glsl

const vec2 HILO = vec2( 1., .01 );
const vec3 COLORS[] = vec3[]( HILO.yyy, HILO.xyy, HILO.yxy, HILO.yyx, HILO.xyx);

vec3 nonReflectColor( vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n ) {
	vec3 light = 1.2 * vec3( cos(iTime), 1., sin(iTime));

	vec3 lightDirection = normalize( light - p );
	float lighting = dot( lightDirection, n ) * .5 + .5;

	vec2 ld = march(p + n * .2, lightDirection );
	if ( ld.y < length( light - p ) ) {
		lighting *= .5;
	}

	return mix( COLORS[int(d.x)], abs(n), .33 ) * lighting;
}

vec3 reflectionColorCopyPastaIsBadOK( vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n ) {
	vec3 reflectionDirection = reflect( direction, n );
	vec2 reflection = march(p + n * .2, reflectionDirection );
	if ( reflection.x > .0 ) {
		vec3 r = p + reflection.y * reflectionDirection;
		vec3 m = mapNormal( r, reflection.y );
		m = reflect( reflectionDirection, m );
		return nonReflectColor( uv, p, reflectionDirection, reflection, r, m );
	}
	return colorMiss( uv, eye, direction, d);
}

vec3 reflectionColor( vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n ) {
	vec3 reflectionDirection = reflect( direction, n );
	vec2 reflection = march(p + n * .2, reflectionDirection );
	if ( reflection.x > .0 ) {
		vec3 r = p + reflection.y * reflectionDirection;
		vec3 m = mapNormal( r, reflection.y );
		m = reflect( reflectionDirection, m );
		return reflectionColorCopyPastaIsBadOK( uv, p, reflectionDirection, reflection, r, m );
	}
	return colorMiss( uv, eye, direction, d);
}

vec3 colorHit( vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n ) {
	vec3 color = nonReflectColor( uv, eye, direction, d, p, n );
	color = mix( color, reflectionColor( uv, eye, direction, d, p, n ), .44 );
	return color;
}

vec3 colorMiss( vec2 uv, vec3 eye, vec3 direction, vec2 d ) {
	return max( uv.xyx * .33 + abs(cos(iTime)) * .44, vec3( .1 ) );
}
