#define STILL

mat2 rotate2( float a ) {
    float s = sin( a );
    mat2 m = mat2( cos(a), -s, s, s );
    m[1][1]=m[0][0];
    return m;
}

float hash21( vec2 id ) {
    vec3 v = fract( id.xyx * vec3( .1991, .234, .133 ) );
    v += dot( v, v.yzx + vec3( 8.12, 2.34, 9.23 ) );
    return fract( v.x * ( v.y + v.z ) );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 r = iResolution.xy;
    vec2 uv = ( fragCoord - .5 * r ) / r.y;
    
    #ifndef STILL
        uv *= rotate2( iTime * .05 );
        uv += iTime * .12;
    #endif
    
    vec3 color = uv.xyx;
    
    /////////////////////////////
    
    float scale = 13.;
    
    #ifdef STILL
        scale = 3.;
    #endif
    
    vec2 st = fract( uv * scale );
    vec2 id = floor( uv * scale );
    
    vec2 qr = st;
    
    #ifndef STILL
    float h = hash21( id );
    if ( h < .5 ) {
        qr.x = 1.-qr.x;
    }
    if ( h < .25 || h > .75 ) {
        qr.y = 1.-qr.y;
    }
    #else
    float h;
    #endif

    /////////////////////////////


    float d = .0;
    vec2 op = vec2( .0 );
    
    h = hash21( id  +33.44);
    if ( h < -6.5 ) {
        // straight
        d = abs( qr.x - qr.y );
    } else {
        // curved
        d = min( length( qr - 1. ), length( qr ) );
        
    }
    op.x = abs( d - .5 ) * 2.; // out to in
    
    float mask = smoothstep( .36, .42, d ) - smoothstep( .6, .62, d );
    color.rg = mask * op;
    ///color.b = mask;
    
    color = vec3( mask * op.x );
    
    //color.b = d;


    
    fragColor = vec4( color, 1. );
}
