// https://www.shadertoy.com/view/wdcBz4

#define PI  		3.1415926
#define PI2 		6.2831952
#define R 			iResolution
#define M 			iMouse
#define T 			iTime

///////////////////////////////////////////////////////////////////////////////////////////

#define SPHERE_COUNT  9
#define SPHERE_RADIUS 0.5
#define LIGHT_POWER   1.0
#define LIGHT         vec3( 0.0, 0.5, -0.33 )
#define SHINE         0.22

///////////////////////////////////////////////////////////////////////////////////////////


// https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
vec2 sphereHit( in vec3 rayOrigin, in vec3 rayDirection, in vec3 center, float radius )
{
    vec3 originToCenter = rayOrigin - center;
    float b = dot( originToCenter, rayDirection );
    float c = dot( originToCenter, originToCenter ) - radius*radius;
    float h = b*b - c;
    if( h<0.0 ) return vec2(-1.0); // no intersection
    h = sqrt( h );
    return vec2( -b-h, -b+h );
}


// from https://www.shadertoy.com/view/4d2XWV ... magic
float iPlane( in vec3 ro, in vec3 rd )
{
    return (-1.0 - ro.y)/rd.y;
}

// https://www.iquilezles.org/www/articles/palettes/palettes.htm
vec3 colorOfT( vec3 a, vec3 b, vec3 c, vec3 d, float t ) {
    return a + b * cos( PI2 * ( c * t + d ) );
}

vec3 colorIt( float t ) {
    return colorOfT( 
		vec3( 0.5, 0.5, 0.5 ),
		vec3( 0.5, 0.5, 0.5 ),
		vec3( 1.0, 1.0, 1.0	), 
		vec3( 0.00, 0.33, 0.67 ),
		t
	);
}

float planeTest( in vec3 origin, in vec3 direction, out vec3 hit, out vec3 normal, out vec3 color ) {
    float t = iPlane( origin, direction );
    if ( t < 0.0 ) {
        return t;
    }
    
    hit = origin + t * direction * 0.99; // weak attempt to avoid self collisions;
    normal = vec3( 0.0, 1.0, 0.0 );
    color = vec3( 1.0 );
    return t;
}

float sphereTest( in vec3 origin, in vec3 direction, out vec3 hit, out vec3 normal, out vec3 color ) {
    // model information
    int count = SPHERE_COUNT;
    float radius = SPHERE_RADIUS;
 
    // collision information
    float closest = -1.0;
    
    for ( int i = 0 ; i < SPHERE_COUNT ; i++ ) {
        float ic = float( i ) / float ( count );
        float ingle = PI2 * ic;
    	float angle = T * 1.33 + ingle;
        float offset = abs( sin( angle * 1.0 ) ) * radius * 5.0;
        
        float x = offset * cos( angle );
        float y = offset * cos( angle + T );
        y = pow(0.1,abs(sin(angle*1.10+1.0)));
        float z = offset * sin( angle ) -1.0;
        
     	vec3 sphere = vec3( x, y, z );
        
        vec2 d = sphereHit( origin, direction, sphere, radius );
        if ( d.x < 0.0 ) continue;
        
        float h = min( d.x, d.y );
        if ( h < closest || closest < 0.0 ) {
            closest = h;
           	hit = origin + closest * direction * 0.99; // weak attempt to avoid self collisions
            normal = normalize( hit - sphere ); 
            color = colorIt( ic );
        }
    }
    
    return closest;
}


float hitTest( in vec3 origin, in vec3 direction, out vec3 hit, out vec3 normal, out vec3 color ) {
    float d = sphereTest( origin, direction, hit, normal, color );
    if ( d > 0.0 ) return d; // not sure this is ok..  
    
    d = planeTest( origin, direction, hit, normal, color );
    color = vec3(1.0);
    return d;
}

vec3 vec3_11_to_01( vec3 v ) {
    return 0.5 * ( v + 1.0 );
}

vec4 heckers( in vec3 origin, vec3 direction ) {
    vec3 hit;
    vec3 normal;
    vec3 color;
    float closest = hitTest( origin, direction, hit, normal, color );
    
    if ( closest < 0.0 ) {
        return vec4(vec3(0.11),1.0);
    }

    // normal on sphere where the ray hit
    vec3 hitDirection = normal;
    
    vec3 toLight = normalize( LIGHT - hit );
    float lightAngle = dot( normal, toLight );  
    float lightDistance = abs( length( LIGHT - hit ) );
    float lightStrength = LIGHT_POWER / pow( lightDistance, 2.0 ) * pow( lightAngle, 2.0 );
  
    // occlusion 
    vec3 occlusionHit; 
    vec3 occlusionNormal; 
    vec3 occlusionColor; // lol
    float occlusionClosest = hitTest(hit, toLight, occlusionHit, occlusionNormal, occlusionColor );
    if ( occlusionClosest >= 0.0 ) {
        // FIXME: some strange banding here. maybe due to self collisions...
        lightStrength = pow( lightStrength, 2.0 );
    }
    
    // reflection
    // FIXME: reflection or sphere in plane is flat and (worse) fake looking
    int reflected = 0;
    vec3 rHit = hit;
    vec3 rHitDirection = hitDirection;
    vec3 accumulateReflectColor = vec3( 0.0 );
    for ( int i = 0 ; i < 5 ; i++ ) {
        vec3 reflectHit; 
        vec3 reflectNormal; 
        vec3 reflectColor; 
        float reflectClosest = hitTest(rHit, rHitDirection, reflectHit, reflectNormal, reflectColor );
        if ( reflectClosest < 0.0 ) break;
		reflected = 1 + i;
        if ( 0 == i ) {
    		accumulateReflectColor = reflectColor;
        } else {
            accumulateReflectColor = accumulateReflectColor * 0.90 + 0.10 * reflectColor;
        }
    }
	if( 0 != reflected ) {
    	color = accumulateReflectColor * SHINE + ( 1.0 - SHINE ) * color;
    }
    //color=vec3(float(reflected)/5.0); // fun negaverse version

    
    float diffuse = 0.22;
    float environmental = 1.0 - diffuse;
    
    color = ( color * diffuse ) + ( environmental * color * lightStrength );
    
    return vec4( color, 1.0 );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 xy = (2.0*fragCoord.xy-iResolution.xy) / iResolution.y; 
    vec3 origin = vec3(0.0, 0.0, 4.0 );
    vec3 direction = normalize( vec3(xy,-2.0) );
    
    fragColor = heckers( origin, direction );
}
