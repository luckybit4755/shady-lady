/*

https://shadertoyunofficial.wordpress.com/2016/07/20/special-shadertoy-features/

This special texture encodes 256  characters in tiles.

It contains 16×16 tiles of 64×64 pixels.
  int c=#ascii   is found at vec2( c % 16, 15-c / 16 )/16.
  a reminder that #ascii = 64+#letter and lowercase = 64+32+#letter
.x provides an anti-aliased mask of the characters.
.w gives the signed distance to the character border.
.yz gives the distance gradient.

super useful: https://www.shadertoy.com/view/ldSBzd



*/

#define FONT_DEMO

#define ASCII_0    48
#define ASCII_DASH 45
#define ASCII_DOT  46
#define ASCII_T    84
#define ASCII_e    101
#define ASCII_s    115
#define ASCII_t    116

#define FONT_STRIDE(n)  ((n)*vec2( .5, .0 ))

float characterDistance( vec2 point, int character ) {
    vec2 charAt = vec2( character % 16, 15 - character / 16 ) / 16. + 1./32.;    
    vec2 pointAt = point / 16.;
    float w = textureLod( iChannel0, charAt + pointAt, .0 ).w;
    vec2 box = abs( point / 1. );
    return max( w, max( box.x, box.y ) );
}

float characterLength( int value ) {
    value = ( value == 0 ) ? 1 : value;
    float digitCount = floor( 1. + log2( float( abs( value ) ) ) / log2( 10.) );
    return digitCount;
    return digitCount + step( float( sign( value ) ), .0 );
}

float characterize( vec2 point, int value ) {
    point -= FONT_STRIDE( characterLength( value ) - 1. );
    float d = 0 == value ? characterDistance( point, ASCII_0 ) : 1e33;  
    for( int v = abs( value ) ; 0 != v ; v /= 10, point += FONT_STRIDE( 1. ) ) {
        d = min( d, characterDistance( point, ASCII_0 + v % 10 ) );
    }  
    return min( d, value < 0 ? characterDistance( point, ASCII_DASH ) : 1e33 );
}

float characterize( in vec2 point, in float value, int decimals ) {
    int vi = int( sign( value ) * floor( abs( value ) ) );
    float d = characterize( point, vi );  
    
    point -= FONT_STRIDE( characterLength( vi ) );
    d = min( d, characterDistance( point, ASCII_DOT ) );

    point -= FONT_STRIDE(1.);
    
    float vf = fract( abs( value ) ) * 10.;
    int max = int( pow( 10., float( decimals ) ) );
    for ( int i = 1 ; i <= decimals ; i++, vf *=10. , point -= FONT_STRIDE( 1. ) ) {
        int n = int( vf ) % 10;
        d = min( d, characterDistance( point, ASCII_0 + n % 10 ) );
    }

    return d;
}

float characterize( in vec2 point, in float value ) {
    return characterize( point, value, 4 );
}

float stringDistance( vec2 point, int string ) {
    return min(characterDistance( point, ( string >> 0 ) & 0xFF ),
        min( characterDistance( point - FONT_STRIDE( 1. ), ( string >> 8 ) & 0xFF ),
            min( characterDistance( point - FONT_STRIDE( 2. ), ( string >> 16 ) & 0xFF ),
                characterDistance( point - FONT_STRIDE( 3. ), ( string >> 24 ) & 0xFF ) )));
    return 0.;
}

float stringDistance( vec2 point, ivec4 string) {
    float d = 1e33;
    d = min( d, stringDistance( point - FONT_STRIDE( 0. * 4. ), string[ 0 ] ) );
    d = min( d, stringDistance( point - FONT_STRIDE( 1. * 4. ), string[ 1 ] ) );
    d = min( d, stringDistance( point - FONT_STRIDE( 2. * 4. ), string[ 2 ] ) );
    d = min( d, stringDistance( point - FONT_STRIDE( 3. * 4. ), string[ 3 ] ) );
    return d;  
}

#ifdef FONT_DEMO

float distanceToShape( float d ) {
    return smoothstep( .499, .51, 1.-d );
}

float characterLoop( in vec2 uv,  int character ) {
    float t = iTime * 2.;
    vec2 offset = 
    uv -= vec2( .5 * vec2( cos( t ), sin( t ) ) );
    return min( characterDistance( uv / .3, character ),
        characterize( ( uv - .15 ) / .2, character ) );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = ( 2. * fragCoord - iResolution.xy ) / iResolution.y;
    
    int character = int( mod( iTime, 256. ) ); 
    
    float d = characterLoop( uv, character );
    d = min( d, characterize( ( uv - vec2( -.8 ) ) / .22, character ) );
    
    d = min( d, characterize( ( uv - vec2( .7, .8 ) )/ .13, 10. * sin( iTime * 2. ) ) );
    d = min( d, characterize( ( uv - vec2( .7, .7 ) )/ .13, 10. * cos( iTime * 2. ) ) );

    
    // https://luckybit4755.github.io/shady-lady/html/text-to-ivec4.html
    ivec4 text1 = ivec4( 543516756, 1667855729, 1919033451, 544110447 ); /* "The quick brown " */
    ivec4 text2 = ivec4( 544763750, 1886221674, 1986994291, 538997349 ); /* "fox jumps over  " */
    ivec4 text3 = ivec4( 543516788, 2038063468, 1735353376, 538976288 ); /* "the lazy dog    " */
    d = min( d, stringDistance( ( uv - vec2( -1.7, .7 ) ) / .1, text1 ) );
    d = min( d, stringDistance( ( uv - vec2( -1.7, .6 ) ) / .1, text2 ) );
    d = min( d, stringDistance( ( uv - vec2( -1.7, .5 ) ) / .1, text3 ) );
    
    int test = ASCII_T << 0 | ASCII_e << 8 | ASCII_s << 16 | ASCII_t << 24;

    d = min( d, stringDistance( ( uv - vec2( .9, .0 ) ) / .1, test ) );
    d = min( d, characterize( ( uv - vec2( .9, -.1 ) ) / .1, test ) );
    d = min( d, characterize( ( uv - vec2( .9, -.2 ) ) / .1, -1*test ) );
    d = min( d, characterize( ( uv - vec2( .9, -.3 ) ) / .1, 0*test ) );



    //d = min( d, characterize( ( uv + vec2( .5, .5
        
    fragColor = vec4( vec3( distanceToShape( d ) ), 1. );
    
    if ( dot( uv, uv ) < .0001  ) {
        fragColor = vec4( vec3( 1., .0, .0 ), 1. );
    }
}

#endif
