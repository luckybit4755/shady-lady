const int CHARACTERS[14] = int[14](31599,9362,31183,31207,23524,29671,29679,30865,31727,31719,1488,448,2,32767);

float digitIsOn( int digit, vec2 id ) {    
    if ( id.x < .0 || id.y < .0 || id.x > 2. || id.y > 4. ) return .0;
    int n = CHARACTERS[ int( digit ) ];
    return floor( mod( float( n ) / pow( 2., id.x + id.y * 3. ), 2. ) );
}

float digitFirst1( vec2 uv, float scale, float v ) {
    vec2 id = floor( uv * scale );

    if ( .0 < digitIsOn( 10 - int( ( sign( v ) - 1. ) * .5), id ) ) return 1.;
    
    v = abs( v );
    int digits = int( floor( log( max( v, 1. ) ) / log( 10. ) ) );
    float power = pow( 10., float( digits ) );
    
    float qq = floor( .1 * scale );
    id.x -= qq;
    
    for ( int i = 0 ; i < 33 ; i++, id.x -= qq, power /= 10. ) {
        float x = floor( v / power );
        if ( .0 < digitIsOn( int( x ), id ) ) return 1.;
        
        if ( i == digits ) {
            id.x -= qq;
            if ( .0 < digitIsOn( int( 12 ), id ) ) return 1.;
        }
        
        if ( i >= digits + 2 ) return .0;
        
        v -= power * x;
    }
    
    return .0;
}

float digitFirst2( vec2 uv, float scale, float v ) {
    vec2 id = floor( uv * scale );

    float f = digitIsOn( 10 - int( ( sign( v ) - 1. ) * .5), id );
    
    v = abs( v );
    int digits = int( floor( log( max( v, 1. ) ) / log( 10. ) ) );
    float power = pow( 10., float( digits ) );
    
    float qq = floor( .1 * scale );
    id.x -= qq;
    
    for ( int i = 0 ; i < 33 ; i++, id.x -= qq, power /= 10. ) {
        float x = floor( v / power );
        f = max( f, digitIsOn( int( x ), id ) );
        
        if ( i == digits ) {
            id.x -= qq;
            f = max( f, digitIsOn( 12, id ) );   
        }
        
        if ( i >= digits + 2 ) break;
        
        v -= power * x;
    }
    
    return f;
}

float digitFirst( vec2 uv, float scale, float v ) {
    return digitFirst1( uv, scale, v );
}

vec3 digitIn( vec3 color, vec3 toMix, vec2 uv, float scale, float v ) {
    float f = digitFirst( uv, scale, v );
    return mix( color, vec3( 1., .0, .0 ), f );
}
