#include es300-boilerplate.frag
#include uniforms.frag

#include main-marcher.glsl
#include example-map.glsl

const vec2 HILO = vec2( 1., .01 );
const vec3 COLORS[] = vec3[]( HILO.yyy, HILO.xyy, HILO.yxy, HILO.yyx, HILO.xyx);

vec3 getColor(const float f) {
	return COLORS[int(f)];
}

vec3 colorHit( vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n ) {
	return getColor( d.x );
	vec3 light = 1.2 * vec3( cos(iTime), 1., sin(iTime));

	vec3 lightDirection = normalize( light - p );
	float lighting = dot( lightDirection, n ) * .5 + .5;

	vec2 ld = march(p + n * .2, lightDirection );
	if ( ld.y < length( light - p ) ) {
		lighting *= .5;
	}

	return mix( getColor( d.x ), abs(n), .33 ) * lighting;
}

vec3 colorMiss( vec2 uv, vec3 eye, vec3 direction, vec2 d ) {
	return max( uv.xyx * .33 + abs(cos(iTime)) * .44, vec3( .1 ) );
}
