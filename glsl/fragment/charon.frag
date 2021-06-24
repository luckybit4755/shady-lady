
float charonBox( in vec2 uv, in vec2 size ) {
    uv = abs( uv ) - size;
    return max( uv.x, uv.y );
}

float charonLoop( in vec2 uv, in vec2 radii ) {
    float d = length( uv );
    float qi = d - radii.x;
    float qo = d - radii.y;
    return max( qo, -qi );
}

float charonCapsule( in vec2 uv, in vec2 a, in vec2 b ) {
    vec2 ab = b - a;
    float t = clamp( dot( uv - a, ab ) / dot( ab, ab ), .0, 1. );
    return distance( uv, a + t * ab );
}

float charon0( in vec2 uv ) {   
    uv.x /= .7;
    return charonLoop( uv , vec2( .48, .8 ) );
}

float charon1( in vec2 uv ) {
    return charonBox( uv, vec2( .14, .8 ) );
}

float charon2( in vec2 uv ) {
    vec2 st = uv;
    st.x /= .7;
    float top_d = max( charonLoop( st , vec2( .45, .8 ) ), -uv.y+.16);
    float mid_d = charonCapsule( uv, vec2( -.368, -.55 ), vec2( +.41, .18 ) ) -.135;
    float bot_d = charonBox( uv + vec2( .0, .66 ), vec2( .5, .14 ) );
    return min( bot_d, min( mid_d, top_d ) );
}

float charon8( in vec2 uv ) {
    float top = charonLoop( uv -vec2( .0, .42 ) , vec2( .2, .4 ) );
    float bot = charonLoop( uv -vec2( .0, -.32 ) , vec2( .3, .5 ) );
    return min( top, bot );
    float d = min( top, bot);
}

float charon3( in vec2 uv ) {
    return max( charon8( uv ), -charonBox( uv + vec2( .6, .0 ), vec2( .6, .4 ) ) );
}

float charon4( in vec2 uv ) {
    float h = charon1( uv - vec2( .2, .0 ) );
    float v = charonBox( uv + vec2( .0, .1 ), vec2( .5, .14 ) );
    float l = charonCapsule( uv, vec2( -.368, .0 ), vec2( .09, .666 ) ) - .135;
    return min( v, min( l, h ) );
}

// also rotten :-P
float charon5( in vec2 uv ) {
    float top = charonBox( uv - vec2( .0, .67 ), vec2( .5, .135 ) );
    float side = charonBox( uv - vec2( -.35, .32 ), vec2( .15, .44 ) );
    float circ = charonLoop( uv + vec2( .02, .29 ) , vec2( .25, .52 ) );
    circ = max( circ, -charonBox( uv + vec2( 1.05, .23 ), vec2( .84, .15 ) ) );
    return min( top, min( side, circ ) );
}

float charon6( in vec2 uv ) {
    vec2 st = uv;
    st.x /= .7;
    
    float big = charonLoop( st , vec2( .48, .8 ) );
    big = max( big,  -charonBox( uv -vec2(.4, -.05), vec2( .3, .4 ) ) );
    float lil = charonLoop( uv + vec2( .0, .3 ), vec2( .2, .48 ) );
    return min( big, lil );
}

float charon7( in vec2 uv ) {
    float top = charonBox( uv - vec2( .0, .67 ), vec2( .5, .135 ) );

    float diag = charonCapsule( uv, vec2( -.25, -.67 ), vec2( .37, .57 ) ) - .132;
    float mid = charonBox( uv - vec2( .05, .0 ), vec2( .33, .12 ) );
    
    return min( top, min( mid, diag ) );
}

float charon9( in vec2 uv ) {
    return charon6( uv * vec2( -1. ) );
}

float charonDot( in vec2 uv ) {
    return charonBox( uv + vec2( .0, .66 ), vec2( .14, .14 ) );
}

float charonDash( in vec2 uv ) {
    return charonBox( uv, vec2( .6, .14 ) );
}

float charonPlus( in vec2 uv ) {
    return min(
        charonBox( uv, vec2( .14, .6 ) ),
        charonBox( uv, vec2( .6, .14 ) )
    );
}

float charonFor( in vec2 uv, float v ) {
    float i = .0;
    float d = .0;
    d += step( i, v ) * step( v, i ) * charon0( uv ); i++;
    d += step( i, v ) * step( v, i ) * charon1( uv ); i++;
    d += step( i, v ) * step( v, i ) * charon2( uv ); i++;
    d += step( i, v ) * step( v, i ) * charon3( uv ); i++;
    d += step( i, v ) * step( v, i ) * charon4( uv ); i++;
    d += step( i, v ) * step( v, i ) * charon5( uv ); i++;
    d += step( i, v ) * step( v, i ) * charon6( uv ); i++;
    d += step( i, v ) * step( v, i ) * charon7( uv ); i++;
    d += step( i, v ) * step( v, i ) * charon8( uv ); i++;
    d += step( i, v ) * step( v, i ) * charon9( uv ); i++;
    d += step( i, v ) * step( v, i ) * charonDot( uv ); i++;  // 10
    d += step( i, v ) * step( v, i ) * charonDash( uv ); i++; // 11
    d += step( i, v ) * step( v, i ) * charonPlus( uv ); i++; // 12
    return d;
}



////////////////////////

#define FROM_SCREEN(uv)  ( ( uv - iResolution.xy *.5 ) / iResolution.y * 2. )
#define MAP_11_01(v)     ( v * .5 + .5 )

#define MS  (iMouse.xy / iResolution.xy)

float charon( vec2 uv, float v, int tmi  ) {
v =  -123.45678 ;

    float d = charonFor( uv, 11. + round( sign( v ) * .5 + .5 ) );
    v = abs( v );
    float q = 1.2;


    float digits = log( max( v, 1. ) ) / log( 10. );
    float power = pow( 10., 2. );
    
    
    //power = 100.;
    
    
    uv.x -= q;
    for ( int i = 0 ; i < 33 ; i++ ) {
        float x = floor( v / power );
        //x = 1.;
        d = min( d, charonFor( uv, x ) );
        break;
    
    
    }
    
  /*
  
  Math.round( ( v + 1 ) * .5 )
  
  
      d += step( i, v ) * step( v, i ) * charonDash( uv ); i++; // 11
    d += step( i, v ) * step( v, i ) * charonPlus( uv ); i++; // 12
    */
    
    
    
//> n = -10; n = max( abs( n ), 1. ); log( n ) / log( 10. );
//> n = -10; n = Math.max( Math.abs( n ), 1. ); Math.log( n ) / Math.log( 10. );

    //floor( 1. + log2( float( abs( ( v == 0 ) ? 1 : v ) ) ) / log2( 10.) );
    
    //return charonFor( uv, 3. );
    
    return d;
}

float charon( vec2 uv, float v  ) {
    return charon( uv, v, 4 );
}

vec3 showSDF( in vec2 uv ) {  
    float v = floor( MS.y * 13. );
    float d = charonFor( uv, v );
 
    ////////
    // coloring from iq's https://www.shadertoy.com/view/3t33WH
    vec3 color = (d<0.0) ? vec3(0.6,0.8,1.0) : vec3(0.9,0.6,0.3);
    color *= 1.0 - exp(-9.0*abs(d));
	color *= 1.0 + 0.2*cos(128.0*abs(d));
	color = mix( color, vec3(1.0), 1.0-smoothstep(0.0,0.015,abs(d)) );
    
    return color;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = FROM_SCREEN( fragCoord );
    
    vec3 color = showSDF( uv );
    
    
    float scale = .13;
    float d = charon( ( uv + vec2( 1.6, -.8 ) ) / scale, -123.45678 );
    if ( d < scale ) {
        color.r = smoothstep( 1e-4, scale, abs( d ) );
        color.g = smoothstep( 1e-4, scale, d );
        color.b = smoothstep( -scale, scale, d );
    }
    
  
    fragColor = vec4( color, 1. );
}
