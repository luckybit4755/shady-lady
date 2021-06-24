vec2 toPolar( vec2 center, vec2 current ) {
    vec2 offset = center - current;
    float r = length( offset ) * 2.0;
    float a = atan( offset.y, offset.x );
    return vec2( r, a );
}

mat2 rotate2d( in float angle ) {
    return mat2(
        cos( angle ), -sin( angle ), 
        sin( angle ),  cos( angle )
    );
}

mat2 scale(vec2 scale){
    return mat2(
        scale.x, 0.0,
        0.0,     scale.y
    );
}
