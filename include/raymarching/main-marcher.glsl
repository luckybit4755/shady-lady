#include make-camera.glsl
#include marcher.glsl

vec3 colorHit(  vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n );
vec3 colorMiss( vec2 uv, vec3 eye, vec3 direction, vec2 d );

vec3 mainMarcher( vec2 uv ) {
	float cameraDistance = 2.;

	float angleF = 1.33;
	float angleX = iMouse.x * angleF;
	float angleY = iMouse.y * angleF;

	if ( .0 > iMouse.z ) {
		angleX = angleY = .0;
	}

	vec3 eye = vec3( cameraDistance * sin( angleX ) , cameraDistance * sin( angleY ),  cameraDistance * cos( angleX ) );

	vec3 target = vec3( 0 );
	vec3 direction = normalize( makeCamera( eye, target, .0 ) * vec3( uv, 1. ) );

	////////////////////////////////////////////////////////////////

	vec2 d = march( eye, direction );

	vec3 color;
	if ( d.y < MARCH.z ) {
		vec3 p = eye + d.y * direction;
		vec3 n = mapNormal(p,d.y);
		return colorHit( uv, eye, direction, d, p, n );
	} 

	return colorMiss( uv, eye, direction, d );
}

#ifndef GOT_MAIN
void main() {
	vec2 uv = ( gl_FragCoord.xy - .5 * iResolution.xy ) / iResolution.y;
	#ifdef AA
		vec2 o = AA * vec2( .07, .03 );
		fragColor = vec4( 
			( mainMarcher(uv) + mainMarcher(uv+o) + mainMarcher(uv+o.yx) ) / 3.,
			1.
		);
	#else
		fragColor = vec4( mainMarcher(uv),1.);
	#endif
}
#endif
