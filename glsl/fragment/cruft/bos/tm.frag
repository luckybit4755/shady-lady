        /////////////////////////////////////////////////////////////////
       //                                                            ////
      //  "simple marcher"                                          // //
     //                                                            //  //
    //  scene description goes here                               //   //
   //  scene description goes here                               //    //   
  //  scene description goes here                               //     //
 //                                                            //     //
////////////////////////////////////////////////////////////////     // 
//                                                            //    //
// Creative Commons Attribution-NonCommercial-ShareAlike      //   //
// 3.0 Unported License                                       //  //
//                                                            // //
// by Val "valalalalala" GvM 💃 2021                          ////
//                                                            ///
////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
// scene controls

#define TREE_2D_4U_

#define RED                 vec3( 1., .01, .01 )
#define GREEN               vec3( .01, 1., .01 )
#define MIXER               66.

////////////////////////////////////////////////////////////////
// handy constants

#define ZED   .0
#define PI    3.141592653589793 
#define PI2   6.283185307179586

////////////////////////////////////////////////////////////////
// ray marching

#define STEPS 99
#define CLOSE .001
#define FAR   99.
#define EPZ   vec2( ZED, CLOSE )

////////////////////////////////////////////////////////////////

#define FROM_SCREEN(uv)  ( ( 2. * uv - iResolution.xy ) / iResolution.y )
#define MAP_11_01(v)     ( v * .5 + .5 )

#define TRIG(a)    vec2( cos( a  * PI2 ), sin( a * PI2 ) )
#define MAX3(v)    max( v.x, max( v.y, v.z ) )
#define SUM3(v)    ( v.x + v.y + v.z )
#define MODO(v,f)  ( mod( v + .5 * f, f ) - .5 * f )

#define HASH21(v)  fract( 33433.44469 * sin( dot( v + vec2( 17.76, 20.21 ), vec2( 449.457, 359.367 ) ) ) )
#define HASH31(v)  fract( 33433.44469 * sin( dot( v + vec3( 17.76, 20.21, 19.99 ), vec3( 449.457, 359.367, 513.312 ) ) ) )

#define R_QUARTER  mat2( .7071, -.7071, .7071, .7071 )
#define R_HALF     mat2( .0, -1., .0, 1. )

////////////////////////////////////////////////////////////////

mat2 rotate2d( float angle ) {
    vec2 t = TRIG( angle );
    return mat2( t.x, -t.y, t.y, t.x ); // //c-ssc
}

////////////////////////////////////////////////////////////////


float getDistance2d( vec3 p ) {
    vec3 a = vec3( .0 );
    float angle = 1.57 + .04 * sin( iTime );
    float len = .15;
    vec2 radii = vec2( .030, .018 );
    float scale = .88;
    return reca0( p, a, angle, len, radii, scale, iTime );
}

float getDistance( vec3 p ) {
    p.y += .2;
    vec3 og = p;
    
    float d = getDistance2d( p );
    
    p = og; p.xz *= rotate2d( .250 ); d = min( d, getDistance2d( p ) );
    
#if 0
    p = og; p.xz *= rotate2d( .125 ); d = min( d, getDistance2d( p ) );
    p = og; p.xz *= rotate2d( .500 ); d = min( d, getDistance2d( p ) );
#endif

    return d;
}

vec4 tree2d( in vec2 fragCoord ) {
    vec2 uv = FROM_SCREEN( fragCoord );
    uv = fract( uv * 2.) - vec2( .5, .0 ); 
    vec3 p = vec3( uv.xy, .0 );
    
    float d = getDistance2d( p );
    float mask = smoothstep( .0, - .015, d );
    vec3 color = mix( GREEN, RED,  abs(d) * MIXER );

    return vec4( mask * color ,1.);
}

////////////////////////////////////////////////////////////////

float march( vec3 a, vec3 ab ) {
    float d = .0;
    for ( int i = 0 ; i < STEPS ; i++ ) {
        vec3 b = a + d * ab;
        float n = getDistance( b );
        d += n;
        if ( abs( n ) < CLOSE || d > FAR ) break;
    }
    return d;
}

vec3 getDistances( vec3 a, vec3 b, vec3 c ) {
    return vec3( getDistance( a ), getDistance( b ), getDistance( c ) );
}

vec3 getNormal( vec3 p ) {
    return normalize( getDistance( p ) - 
        getDistances( p - EPZ.yxx, p - EPZ.xyx, p - EPZ.xxy )
    );
}

////////////////////////////////////////////////////////////////

// zab,xZup,yXz | zxy:ab,zup,xz
mat3 makeCamera( vec3 a, vec3 b, float roll ) {
    vec3 up = vec3( TRIG( roll ).yx, ZED );
	vec3 z = normalize( b - a );
	vec3 x = normalize( cross( z, up ) );
	vec3 y = normalize( cross( x, z ) );
	return mat3( x, y, z );
}

vec2 getMouse() {
    return iMouse.z > .0
        ? FROM_SCREEN( iMouse.xy )
        : vec2( .44 * cos( iTime * .22 ), .33 )
    ;  
}

////////////////////////////////////////////////////////////////

float checked( vec2 uv, float scale ) {
    vec2 st = floor( uv * scale );
    return mod( st.x + st.y, 2. );
}

vec3 texaco( vec2 uv ) {
    return mix( vec3( .7, .7, .9 ), vec3( .9, .9, .7 ), checked( uv, 13. ) );
    // alternatives:
    return vec3( checked( uv, 13. ) );    
    return texture( iChannel0, uv ).xyz;
}

vec3 colorHit( vec3 p ) {
    // after watching https://www.youtube.com/watch?v=VaYyPTw0V84&ab_channel=TheArtofCode
    vec3 n = getNormal( p );
    float l = max( .2, pow( MAP_11_01( n.y ), 2. ) );
    
    n = pow( abs(n), vec3( 4. ) );
    n /= SUM3( n ); // pseudo normalize
    
    vec3 tX = texaco( MAP_11_01( p.yz ) );
    vec3 tY = texaco( MAP_11_01( p.xz ) );
    vec3 tZ = texaco( MAP_11_01( p.xy ) );

    return l * ( n.x * tX + n.y * tY + n.z * tZ );
}

vec3 colorMiss( in vec2 uv ) {
    return .4 * texaco( MAP_11_01( uv * .5 ) );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
#ifdef TREE_2D_4U
    fragColor = tree2d( fragCoord ); 
    return;
#endif

    vec2 uv = FROM_SCREEN( fragCoord );
    float view = 2.;
    float zoom = 4.;

#if 0
    vec3 a = vec3( ZED, ZED, view );
    vec3 ab = vec3( uv * rotate2d( iTime * .1 ), - 1. );
#else
    vec2 m = getMouse();  
    vec2 t = view * TRIG( m.x );
    
    vec3 a = vec3( t.x, view * TRIG( m.y ).y, t.y );       
    vec3 b = vec3( ZED );
    vec3 ab = normalize( makeCamera( a, b, .0 ) * vec3( uv, zoom ) );
#endif

    float d = march( a, ab );
    float hit = step( d, FAR );

    vec3 p = hit * ( a + ab * d );
    vec3 color = mix( colorMiss( uv ), colorHit( p ), hit );
    
    float foginess = pow( d / FAR, .33 ) * hit;
    vec3 fog = vec3( .22, .11, .4 );
    color = mix( color, fog, foginess );
    
    fragColor = vec4( color, 1. );
}
