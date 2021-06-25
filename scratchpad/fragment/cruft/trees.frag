/////////////////////////////////////////////////////////////////////////////
//
// "Marching with Camera" 
//
// by Val "valalalalala" GvM - 2020
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
//
// Big thanks to BigWings's awesome tutorial and video
// - https://www.shadertoy.com/view/XlGBW3
// - https://youtu.be/PGtv-dBi2wE
//
/////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////
// toggle camera controlled by the mouse or by time

#define CAMERA_MOUSE_

/////////////////////////////////////////////////////////////////////////////
// ray marching values

#define RAY_MARCH_STEPS    133
#define RAY_MARCH_TOO_FAR  float( RAY_MARCH_STEPS )
#define RAY_MARCH_CLOSE    0.01
#define RAY_EPSILON        vec2( RAY_MARCH_CLOSE, .0 )

/////////////////////////////////////////////////////////////////////////////
// useful constants and macros

#define PI2             6.283185307179586
#define PROJECT(a,b,p)  clamp( dot( p - a, b - a ) / dot( b - a, b - a ), 0., 1. )
#define TRIG(d, a)      ( d * vec2( cos( a ), sin( a ) ) )
#define RGB(r,g,b)      vec3( float(r)/255., float(g)/255., float(b)/255. )
#define MIN3(v)         min( v.x, min( v.y, v.z ) ) 
#define MAX3(v)         max( v.x, max( v.y, v.z ) ) 
#define ADD3(v)         ( v.x + v.y + v.z )
#define MUL3(v)         ( v.x * v.y * v.z )
#define POW2(v,p)       vec2( pow( v.x, p ), pow( v.y, p ) )

#define VEC123          vec3( .1, .2, .3 )
#define VEC3X(x)        vec3( x, .0, .0 )
#define VEC3Y(y)        vec3( .0, y, .0 )
#define VEC3Z(z)        vec3( .0, .0, z )

/////////////////////////////////////////////////////////////////////////////
// from https://www.shadertoy.com/view/4dsGRl

float noise( in vec3 x )
{
    vec3 p = floor(x.xzy);
    vec3 f = fract(x.xzy);
	f = f*f*(3.0-2.0*f);

	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
	vec2 rg = textureLod( iChannel0, (uv+0.5)/256.0, 0.0 ).ba;
	return mix( rg.y, rg.x, f.z )-.5;
}


/////////////////////////////////////////////////////////////////////////////
// signed distance functions for types

// https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm 
float capo( vec3 p, float h, float r )
{
  p.y -= clamp( p.y, 0.0, h );
  return length( p ) - r;
}

float capt( vec3 p, float h, float r )
{
  float q = clamp( p.y, 0.0, h );
  float i = clamp( h - p.y, .0, h * 1.1 );
  
  p.y -= q;
  
  return length( p ) - r * i;
}

float starSegmentSDF( vec3 point, vec3 a, vec3 center, float thickness ) {
    float h = PROJECT( a, center, point );
    vec3 q = a + ( center - a ) * h;
    h = pow( h, 0.7 ) * .8;      
    return length( point - q ) - thickness * h;
}

float starSDF( vec3 point, vec3 center, float len, float thickness ) {
    vec3 a0 = vec3( +0.000 * len, +1.000 * len, .0 ); // @ r:+1.570 , d:90
    vec3 a1 = vec3( -0.952 * len, +0.309 * len, .0 ); // @ r:+2.827 , d:162
    vec3 a2 = vec3( -0.588 * len, -0.810 * len, .0 ); // @ r:+4.084 , d:234
    vec3 a3 = vec3( +0.587 * len, -0.810 * len, .0 ); // @ r:+5.340 , d:306
    vec3 a4 = vec3( +0.951 * len, +0.309 * len, .0 ); // @ r:+6.597 , d:378
    
    float d0 = starSegmentSDF( point, a0 + center, center, thickness );
    float d1 = starSegmentSDF( point, a1 + center, center, thickness );
    float d2 = starSegmentSDF( point, a2 + center, center, thickness );
    float d3 = starSegmentSDF( point, a3 + center, center, thickness );
    float d4 = starSegmentSDF( point, a4 + center, center, thickness );

    return min( d0, min( d1, min( d2, min( d3, d4 ) ) ) );
}

/////////////////////////////////////////////////////////////////////////////
// create the scene

vec2 which( in vec2 current, in vec2 test ) {
    current.y = mix( current.y, test.y, step( test.x, current.x ) );
    current.x = min( current.x, test.x );
    return current;
}


float ground( in vec3 point ) {
    point *= 8.;
    point.y = .0;
    return 2. * (
        +4.50 * noise( point * .01 )
        +0.50 * noise( point * .1 )
        +0.15 * noise( point * .2 )
        +0.03 * noise( point * .4 )
    ) + 2.;
}

vec2 sceneDistance( in vec3 point ) {
    vec2 d = vec2( RAY_MARCH_TOO_FAR, 0. );
    
    
    float repeat = 1.5;  
    float halb = .5 * repeat;
    vec3 f = point;
    f.xz = mod( f.xz + halb, repeat ) - halb;
    
    vec3 i = point - f;
 
    float g = ground( point );
    float n = noise( i );
    
    
    f.y += ground( i );
    f.xz -=  n;
    
    /////////////    


    d = which( d, vec2( capo( f - VEC3Y( 0.0 ), .50, .04 ), 1. ) ); // trunk
    d = which( d, vec2( capt( f - VEC3Y( 0.6 ), .80, .31 ), 2. ) ); // bottom
    d = which( d, vec2( capt( f - VEC3Y( 0.8 ), .61, .37 ), 2. ) ); // middle
    d = which( d, vec2( capt( f - VEC3Y( 1.1 ), .43, .33 ), 2. ) ); // top
    
    d = which( d, vec2( starSDF( f - VEC3Y( 1.6 ), vec3(.0), .13, .04 ), 3. ) );    

    d = which( d, vec2( point.y + g , 4 ) ); // plane

    return d;
}

float eq( in float i, in float value ) {  
    return clamp(1.-step(0.3,abs(i-floor(value))),0.,1.);
}


vec3 sceneNormal( in vec3 point ) {
    return normalize( sceneDistance( point ).x - vec3(
        sceneDistance( point - RAY_EPSILON.xyy ).x,
        sceneDistance( point - RAY_EPSILON.yxy ).x,
        sceneDistance( point - RAY_EPSILON.yyx ).x
    ));
}

vec3 colorAt( in vec3 point, vec2 d ) {
    vec3 color = vec3( .0 );
    
    
    color += RGB( 100,  80,  33 ) * eq( d.y, 1. );
    color += RGB( 200, 255, 200 ) * eq( d.y, 2. );
    color += RGB( 255, 255, 122 ) * eq( d.y, 3. );
    color += RGB(  71,  94,  33 ) * eq( d.y, 4. );

    // lol... lame snow... is lame.. :-P
    color += mix( vec3(1.), color, step( .4, 1.-sceneNormal(point).y ) );
    
    return color;
}

/////////////////////////////////////////////////////////////////////////////
// the ray marching bits

vec2 rayMarch( in vec3 origin, in vec3 direction ) {
    vec2 total = vec2( .0 );
    for ( int i = 0 ; i < RAY_MARCH_STEPS ; i++ ) {
        vec3 point = origin + direction * total.x;
                
        vec2 current = sceneDistance( point );
        total.x += current.x;
        total.y = current.y;
        if ( total.x > RAY_MARCH_TOO_FAR || current.x < RAY_MARCH_CLOSE ) {
            break;
        }
    }
    return total;
}


/////////////////////////////////////////////////////////////////////////////
// lighting

float pointLight( vec3 point, vec4 light ) {
    vec3 normal = sceneNormal( point );
    
    vec3 towardLight = light.xyz - point;
    float toLight = length( towardLight );
    towardLight = normalize( light.xyz - point );

    float diffuse = clamp( dot( normal, towardLight ), 0., 1. );
    
    vec3 lightStart = point + normal * RAY_MARCH_CLOSE * 2.;
    float d = rayMarch( lightStart, towardLight ).x;
    diffuse *= 1. - 0.5 * smoothstep( d * 0.9, d, toLight );

    float lightStrength = .2 + .8 * light.w / dot( toLight, toLight );  
    return diffuse * lightStrength;
}

vec3 colorPoint( vec3 point, vec3 eye, vec2 d ) {
    vec4 light    = vec4( eye + vec3(.0,.0,-1.), 1. );
    float ambient = 0.007;
    float gamma   = 1.3;
    
    float lighting = pointLight( point, light );
    lighting = ( 1. -  ambient ) * gamma * lighting;

    vec3 color = colorAt( point, d );
	return vec3( color * ambient + color * lighting );
}

/////////////////////////////////////////////////////////////////////////////
// simple camera

struct Ray {
    vec3 eye;
    vec3 direction;
};

// from https://github.com/glslify/glsl-look-at
mat3 makeCamera( vec3 origin, vec3 target, float roll ) {
	vec3 up = vec3( sin( roll ), cos( roll ), .0 );
	vec3 zz = normalize( target - origin );
	vec3 xx = normalize( cross( zz, up ) );
	vec3 yy = normalize( cross( xx, zz ) );
	return mat3( xx, yy, zz );
}

Ray cameraRay( in vec2 uv ) {
#ifdef CAMERA_MOUSE
    vec2 mx = ( iMouse.xy / iResolution.xy ) -.5;
    vec2 T = TRIG( 4., mx.x * PI2 );
    vec2 V = TRIG( 4., mx.y * PI2 * .5 );
        
    vec3 eye  = vec3( T.x, mx.y * 4. +2. , T.y );
    vec3 look = vec3( 0. );
    
    float zoom = 1.;
    float roll = .0;
#else
    vec2 T = TRIG( 1., iTime );
    
	vec3  eye  = vec3( 6. * T.x, 2., 6. * T.y );
	vec3  look = vec3( .0, 0, .0 );
    
    eye = vec3( .3 * T.x, 4. , iTime * 3.);
    
    float g = ground( eye );
    eye.y = 3. - g;
    
    look = vec3( .0, eye.y, eye.z + 2. );
    
	float roll = 0.0002 * T.x; // TODO: stars need to match..
    float zoom = 1.2;
    
    //roll = .0;
#endif
    
	mat3 camera = makeCamera( eye, look, roll );
    vec3 direction = normalize( camera * vec3( uv.xy, zoom ) );

    return Ray( eye, direction );
}

/////////////////////////////////////////////////////////////////////////////
// main function

vec3 mainly( in vec2 fragCoord ) {
	vec2 uv = ( 2. * gl_FragCoord.xy - iResolution.xy ) / iResolution.y; 
    Ray ray = cameraRay( uv );

    vec2 d = rayMarch( ray.eye, ray.direction );
    
    float tooFar = step( RAY_MARCH_TOO_FAR, d.x );
    vec3 point = ray.eye + ray.direction * d.x;
    
	// the end
    
    float star = .5 + noise( 333.444 * vec3( uv, 0. ) );
    float twinkle = 5. * ( .5 + noise( 22.22 * vec3( uv, 0. ) ) );
    star = smoothstep( .9 + .05 * sin( iTime * twinkle ), 1., star );
    
    vec3 background = vec3( star );
    
    
    return mix( colorPoint( point, ray.eye, d ), background, tooFar );   
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    fragColor = vec4( mainly( fragCoord ), 1. );
}

// EOF
/////////////////////////////////////////////////////////////////////////////
