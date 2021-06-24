//define: const vec3 MARCH = vec3( .0, .001, 99. );

vec2 map( vec3 p );

vec2 march( vec3 eye, vec3 direction ) { 
    vec2 total = vec2(.0), now;
    vec3 current = eye;
    for( int i = 0 ; i < int( MARCH.z ) ; i++ ) {
        total.y += ( now = map( current ) ).y;
        total.x = now.x;
        if ( abs( now.y ) < MARCH.y || total.y > MARCH.z ) break;
        current += now.y * direction;
    }
    return total + MARCH.z * step( MARCH.z, total );
}

float map1( vec3 p ) {
  return map(p).y;
}

// https://suricrasia.online/demoscene/functions/
vec3 mapNormal(vec3 p,float d) {
    mat3 k = mat3(p,p,p) - mat3(MARCH.y*d);
    return normalize(map1(p) - vec3(  map1(k[0]),  map1(k[1]),  map1(k[2])) );
}

vec2 minnow( vec2 current, vec2 candidate ) {
  return current.y < candidate.y ? current : candidate;
  return mix( current, candidate, step( candidate.y, current.y ) ); // idk, why this doesn't work 
}

vec2 minnow( vec2 current, float id, float distance ) {
  return minnow( current, vec2( id, distance ));
}
