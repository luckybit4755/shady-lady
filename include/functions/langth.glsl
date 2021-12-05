#include order.glsl

float langth( vec2 v ) {
    return dot( vec2( .423, .987 ), order( abs( v ) ) );
}

float langth( vec3 v ) {
    return dot( vec3( .2, .4, .9 ), order( abs( v ) ) );
}

