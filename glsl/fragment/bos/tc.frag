
#define ANGULAR_DIFFERENCE  .6
#define SCALE_DROP_OFF      1.03
#define RATIO_FACTOR        .01
#define SWAY                .02 

float dCapo( vec3 p, vec3 a, vec3 b, vec2 radii ) {
    vec3 ba = b - a;
    float t = clamp( dot( p - a, ba ) / dot( ba, ba ), .0, 1. );
    return distance( p, a + t * ba ) - mix( radii.x, radii.y, smoothstep( .0, 1., t ) );
}

vec4 dCapa( vec3 p, vec3 a, float angle, float len, vec2 radii ) {
    vec3 b = a;
    b.xy += len * vec2( cos( angle ), sin( angle ) );
    return vec4( dCapo( p, a, b, radii ), b );
}

vec4 dCapa( vec3 p, vec3 a, float angle, float len, vec2 radii, float ignored, float ignored2 ) {
    return dCapa( p, a, angle, len, radii );
}

#define RECA_P    vec3 p, vec3 a, float angle, float len, vec2 radii, float scale, float time

#define RECA_STEP \
    vec4 l0 = dCapa( p, a, angle, len, radii ); \
    a = l0.yzw;   \
    float f = scale - RATIO_FACTOR * radii.y / radii.x ;\
    radii.x = radii.y;\
    radii.y *= f;\
    len *= scale;\
    float q = ANGULAR_DIFFERENCE  + SWAY * cos( time / scale * 2. ); \
    float angleA = angle - scale * q; \
    float angleB = angle + scale * q; \
    scale = pow( scale, SCALE_DROP_OFF ); \
    
#define RECA_A         p, a, angleA, len, radii, scale, time
#define RECA_B         p, a, angleB, len, radii, scale, time
#define RECA_FUN(b,c)  RECA_STEP return min( l0.x, min( b, c ) )
#define RECA_DUN(b,c)  RECA_STEP return min( l0.x, min( b.x, c.x ) )

// better gpu can push this back...
float recaZ( RECA_P ) { RECA_DUN( dCapa( RECA_A ), dCapa( RECA_B ) ); }  
float reca6( RECA_P ) { RECA_FUN( recaZ( RECA_A ), recaZ( RECA_B ) ); }
float reca5( RECA_P ) { RECA_FUN( reca6( RECA_A ), reca6( RECA_B ) ); }
float reca4( RECA_P ) { RECA_FUN( reca5( RECA_A ), reca5( RECA_B ) ); }
float reca3( RECA_P ) { RECA_FUN( recaZ( RECA_A ), recaZ( RECA_B ) ); } // :-P
float reca2( RECA_P ) { RECA_FUN( reca3( RECA_A ), reca3( RECA_B ) ); }
float reca1( RECA_P ) { RECA_FUN( reca2( RECA_A ), reca2( RECA_B ) ); }
float reca0( RECA_P ) { RECA_FUN( reca1( RECA_A ), reca1( RECA_B ) ); }
