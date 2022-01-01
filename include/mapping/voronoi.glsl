
// needs: vec2 hash( vec2 ), see ../random/hash.glsl

struct VoroniMapping {
	vec2 id;
	float distance;
};

VoroniMapping voronoiClosest( VoroniMapping current, vec2 st, vec2 id, vec2 neighbor ) {
	vec2 vId = id + neighbor;

	vec2 point = hash( vId );
	st -= point + neighbor;
	float v = dot( st, st );

	if ( current.distance < v ) {
		return current;
	} else {
		return VoroniMapping( vId, v );
	}
}

VoroniMapping mapVoronoi( vec2 uv, float scale ) {
	uv *= scale;
	vec2 id = floor( uv );
	uv -= id;

	VoroniMapping current = VoroniMapping( vec2( 1e33 ), 1e33 );

	current = voronoiClosest( current, uv, id, vec2( -1., -1. ) );
	current = voronoiClosest( current, uv, id, vec2( -1., -0. ) );
	current = voronoiClosest( current, uv, id, vec2( -1., +1. ) );

	current = voronoiClosest( current, uv, id, vec2( -0., -1. ) );
	current = voronoiClosest( current, uv, id, vec2( -0., -0. ) );
	current = voronoiClosest( current, uv, id, vec2( -0., +1. ) );

	current = voronoiClosest( current, uv, id, vec2( +1., -1. ) );
	current = voronoiClosest( current, uv, id, vec2( +1., -0. ) );
	current = voronoiClosest( current, uv, id, vec2( +1., +1. ) );

	current.distance = sqrt( current.distance );

	return current;
}
