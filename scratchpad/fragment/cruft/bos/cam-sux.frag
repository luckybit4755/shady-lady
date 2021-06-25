#define RAY_MARCH_STEPS    129
#define RAY_MARCH_TOO_FAR  float( RAY_MARCH_STEPS )
#define RAY_MARCH_CLOSE    0.01

#define RED    vec3(1.,0.,0.)
#define GREEN  vec3(0.,1.,0.)
#define BLUE   vec3(0.,0.,1.)

struct Camera {
    // from user
    vec3 eye;
    vec3 lookAt;
    vec3 up;
    vec2 resolution;
    float fieldOfView;
    // from makeCamera
    vec3 o; vec3 x; vec3 y;
};

//https://github.com/glslify/glsl-look-at
mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(target - origin);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));

  return mat3(uu, vv, ww);
}


// https://steveharveynz.wordpress.com/2012/12/20/ray-tracer-part-two-creating-the-camera/
Camera makeCamera( in Camera camera ) {
    camera.up = normalize( camera.up );
    vec3 direction = normalize( camera.lookAt - camera.eye );
    vec3 U = cross( direction, camera.up );
    vec3 V = cross( U, direction );

    float viewPlaneHalfWidth= tan( camera.fieldOfView / 2. );
    float aspectRatio = camera.resolution.y / camera.resolution.x;

    float viewPlaneHalfHeight = aspectRatio * viewPlaneHalfWidth;

    vec3 viewPlaneBottomLeftPoint = (
        camera.lookAt
        - V * viewPlaneHalfHeight
        - U * viewPlaneHalfWidth
    );

    vec3 xIncVector = ( U * 2. * viewPlaneHalfWidth  ) / iResolution.x;
    vec3 yIncVector = ( V * 2. * viewPlaneHalfHeight ) / iResolution.y;

    camera.o = viewPlaneBottomLeftPoint;
    camera.x = xIncVector;
    camera.y = yIncVector;


    return camera;
}

float getDistanceToScene( vec3 point ) {
    vec4 s = vec4(0., 0., 0., 1.);
    return length(point-s.xyz)-s.w;
}


float rayMarch( in vec3 origin, in vec3 direction ) {
    float distance_ = 0.;

    for ( int i = 0 ; i < RAY_MARCH_STEPS ; i++ ) {
        vec3 point = origin + direction * distance_;
        float distanceToScene = getDistanceToScene( point );
        distance_ += distanceToScene;
        if ( distance_ > RAY_MARCH_TOO_FAR || distanceToScene < distanceToScene ) {
            break;
        }
    }

    return distance_;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

    Camera camera = makeCamera( Camera(
        vec3( 0., 0., 4. ), // eye
        vec3( 0., 0., 0. ), // lookAt
        vec3( 0., 1., 0. ), // up
        iResolution.xy,      // resolution
        0.52,                // fieldOfView
        vec3(0.), vec3(0.), vec3(0.) // from makeCamera
    ) );
    
    vec2 uv = (2.0*gl_FragCoord.xy-iResolution.xy)/iResolution.y;
    //vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 origin = camera.o + uv.x * camera.x + uv.y * camera.y;
    
    float xx = fragCoord.x * 3. - iResolution.x;
    float yy = fragCoord.y * 3. - iResolution.y;

    origin = camera.o + xx * camera.x + yy * camera.y;
    
    vec3 direction = origin - camera.eye * 1.4;
    
    
    vec3 oo = origin;
    vec3 dd = direction;

    if ( true || 0. != step( 0., cos( iTime * 2.) ) ) {
        origin = vec3(uv,4.0);
        direction = origin - camera.eye * 1.4;
        direction = normalize( direction );
    }
    direction = origin - camera.eye * 1.4;
    direction = normalize( direction );
    //fragColor = vec4( vec3( abs(direction.x) ), 1. );return;
    
    
    //https://github.com/glslify/glsl-look-at
    if ( true ) {
		// kind of working...
        vec3 eye    = vec3( 2. * cos( iTime), 2. * cos( iTime ), 4. );
        float t = iTime;
        t = 4.806346;
        eye    = vec3( 2. * cos( t ), 2. * cos( t ), 4. );
        eye = vec3( .17, .17, 4. );
        eye = vec3( 0., 2., 4. );
        //eye = vec3( .10000001, .100001, 4. );

        
    	vec3 target = vec3( 0. );
    	float roll  = 0.;
    	mat3 camMat = calcLookAtMatrix( eye, target, roll );
		direction = normalize( camMat * vec3( uv.xy, 1.0 ) );
    	origin = eye;
    }
    //fragColor = vec4(vec3( origin ), 1. );return;
    if ( !true ) {
        // also doesn't work....
		vec2 p  = (2.0*gl_FragCoord.xy-iResolution.xy)/iResolution.y;
		vec3 ro = vec3(3.5*sin(0.0),3.0,3.5*cos(0.0));
		vec3 ta = vec3(0.0,0.0,0.0);

		mat3 camMat = calcLookAtMatrix(ro, ta, 0.0);
		vec3 rd = normalize(camMat * vec3(p, 2.0));
        
        origin = ro;
        direction = rd;
    }
    
    float info = uv.x * 3. + 2.8;
    int which = int( floor( info ) );
    vec3 c = vec3( 0. );

    if ( uv.y > 0. ) {
    	switch( which ) {
    	    case 0: c = vec3( abs( uv.x        * 1. ) ); break;
			case 1: c = vec3( abs( origin.x    * 1. ) ); break;
			case 2: c = vec3( abs( direction.x * 1. ) ); break;
      	  	case 3: c = vec3( abs( uv.y     * 1. ) ); break;
      	  	case 4: c = vec3( abs( origin.y * 1. ) ); break;
      	  	case 5: c = vec3( abs( direction.y * 1. ) ); break;
		}
    } else {
		switch( which ) {
           	case 0: c = vec3( abs( uv.x        * 1. ) ); break;
			case 1: c = vec3( abs( oo.x    * 1. ) ); break;
			case 2: c = vec3( abs( dd.x * 1. ) ); break;
      	  	case 3: c = vec3( abs( uv.y     * 1. ) ); break;
      	  	case 4: c = vec3( abs( oo.y * 1. ) ); break;
      	  	case 5: c = vec3( abs( dd.y * 1. ) ); break;
        }
    }
   
    float distance_ = rayMarch( origin, direction );
    float diz = pow( 1. - distance_ / RAY_MARCH_TOO_FAR, 2. );

    float tooFar = 1. - step( RAY_MARCH_TOO_FAR, distance_ );
    vec3 p = origin * direction * distance_;
    c = mix( c, p * diz * 33., tooFar );

    
    float r = step( 0.98, fract( info ) );
    c = c * (1.-r) + RED * r;

    fragColor = vec4( c , 1. );
}

