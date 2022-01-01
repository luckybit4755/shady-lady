#include terrain.glsl
#include ../raymarching/make-camera.glsl

// returns {vec3 pt, float distance}
vec4 terrainCaster( vec2 uv, float maxDistance, float inc, float cameraDistance ) {
	float angleF = 1.33;
	float angleX = iMouse.x * angleF;
	float angleY = iMouse.y * angleF + .77;
	if ( .0 > iMouse.z ) {
		angleX = .0;
		angleY = .77;
	}

	angleY = max( .033, angleY );

	vec3 eye = vec3( 
		cameraDistance * sin( angleX ), 
		cameraDistance * sin( angleY ),
		cameraDistance * cos( angleX ) 
	);

	vec3 target = vec3( 0 );
	vec3 direction = normalize( makeCamera( eye, target, .0 ) * vec3( uv, 1. ) );

	return mapTerrain( eye, direction, maxDistance, inc );
}

vec4 terrainCaster( vec2 uv ) {
	return terrainCaster( uv, 33., .01, 2. );
}
