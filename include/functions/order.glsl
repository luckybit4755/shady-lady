vec3 order( vec3 p )  {
    vec3 q = vec3( min( p.x, min( p.y, p.z ) ), .0, max( p.x, max( p.y, p.z ) ) );
    q.y = ( p.x + p.y + p.z ) - ( q.x + q.z );
    return q;
}

vec2 order( vec2 v ) {
    return vec2( min( v.x, v.y ), max( v.x, v.y ) );
}
