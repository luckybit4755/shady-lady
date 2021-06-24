#include es300-boilerplate.frag
#include uniforms.frag

const vec3 MARCH = vec3( .0, .001, 88. );
#include main-marcher.glsl

////////////////////////////////////////////////////////////////
// signed distance fields
// https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
// https://www.shadertoy.com/view/Xds3zN
// https://mercury.sexy/hg_sdf/

float sdBox( vec3 p, vec3 b ) {
	vec3 d = abs(p) - b;
	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdTorus( vec3 p, vec2 t ) {
	return length( vec2(length(p.xz)-t.x,p.y) )-t.y;
}

vec2 map( vec3 p ) {
	float f = .22;
	vec4 offset = vec4(.0, 3. * f, -.7 * f, -3. * f );
	vec2 d = vec2( -1., 1e33 );
	d = minnow( d, 1., sdBox(  p - offset.yzx, vec3(f) *.9 ) -.077 ); // round off a bit
	d = minnow( d, 2., length( p - offset.xzx ) - f );
	d = minnow( d, 3., sdTorus( (p - offset.wzx ).xzy, vec2(f,f*.44)));
	d = minnow( d, 4., p.y - offset.z * 3.3 );
	return d;
}

const vec2 HILO = vec2( 1., .01 );
const vec3 COLORS[] = vec3[]( HILO.yyy, HILO.xyy, HILO.yxy, HILO.yyx, HILO.xyx);

vec3 getColor(const float f) {
	return COLORS[int(f)];
}

vec3 nonReflectColor( vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n ) {
	vec3 color = getColor( d.x );

	vec3 light = 1.2 * vec3( cos(iTime), 1., sin(iTime));

	vec3 lightDirection = normalize( light - p );
	float lighting = dot( lightDirection, n ) * .5 + .5;

	vec2 ld = march(p + n * .2, lightDirection );
	if ( ld.y < length( light - p ) ) {
		lighting *= .5;
	}

	return mix( color, abs(n), .33 ) * lighting;
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
