// https://www.iquilezles.org/www/articles/terrainmarching/terrainmarching.htm
// terrain casting 

// needs: float map( vec3 p )
float map( vec3 p );

vec4 mapTerrain( vec3 eye, vec3 direction, float maxDistance, float inc ) {
	vec3 p = eye;
	float ink = inc * .1;

	for( float t = .0 ; t < maxDistance ; t += inc ) {
		float h = map( p );
		if ( p.y < h ) {
			// backup and move forward slower
			// does not seem to make any difference
			for ( float s = t - inc ; s < t ; s += ink ) {
				p = eye + direction * s;
				h = map( p );
				if ( p.y < h ) break;
			}
			return vec4( p, t );
		}
		p = eye + direction * t;
	}

	return vec4( 2021.2022 );
}

vec4 mapTerrain( vec3 eye, vec3 direction ) {
	return mapTerrain( eye, direction, 33., .01 );
}

vec3 terrainNormal( vec3 p, float e ) {
    vec2 epsilon = vec2( e, .0 );
    return normalize(
        vec3(
            map( p - epsilon.xyy ) - map( p + epsilon.xyy ),
            2.  * epsilon.x,
            map( p - epsilon.yyx ) - map( p + epsilon.yyx )
        )
    );
}

vec3 terrainNormal( vec3 p ) {
	return terrainNormal( p, .01 );
}
