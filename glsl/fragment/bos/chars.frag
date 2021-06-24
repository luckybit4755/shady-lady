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

////////////////////////////////////////////////////////////////
// scene settings

const vec3 BLUE = vec3( .7, .7, .9 );
const vec3 YLLO = vec3( .9, .9, .8 );

#define WALK

////////////////////////////////////////////////////////////////
// scene definition

vec2 minnow( vec2 current, float candidate, float value ) {
    return current.x < candidate ? current : vec2( candidate, value ); // hope for the best...
}

vec2 minnow( vec2 current, vec2 candidate ) {
    return current.x < candidate.x ? current : candidate; // hope for the best...
}

vec2 wizard( float time, vec3 p ) {
    #ifdef WALK
        p.y += time * .015;
    #endif

    vec2 d = vec2( 1e33, -1. );
    d = minnow( d, fCone( p, .14, .5 ) - .008, 10. ); // body 
    
    
    d = minnow( d, fCone( p - vec3(.0,.7,.0), .07, .2 ) - .006, 10. ); // hat    
    d = minnow( d, fSphere( p - vec3( .0, .6, .0 ), .08 ), 11. ); // head
    
    d = minnow( d, sdCappedCylinder( p - vec3( -.2, .3, .08 ), .013, .3 ), 12. ); // staff
    return d;
}

vec2 tank( float time, vec3 p ) {
    #ifdef WALK
        p.y += time * .020;
        float itime = ( 1. - time );
        float angleF = 1.7;
        float rightAngle = angleF * .22 * time  - .05;
        float leftAngle  = angleF * .22 * itime - .05;
    #endif

    vec3 og = p;
    vec3 q = p;
    vec2 d = vec2( 1e33, -1. );
   
    /////////////////////
    // head
    
    q = p;
    #ifdef WALK
    float headPivot = .02;
    q.xz *= rotate2d( time * headPivot * 2. - headPivot );
    #endif
    float helmet = sdCappedCylinder( q - vec3( +.0, .6, -.05 ), .1, .1 );
    helmet = max( helmet, -sdBox( q - vec3( +.0, .58, .0 ), .06 ) );
    d = minnow( d, helmet, 20. );
    
    d = minnow( d, sdCappedCylinder( q - vec3( +.0, .6, -.05 ), .09, .09 ), 21. );
    
    /////////////////////
    // body
    
    d = minnow( d, sdCappedCylinder( p - vec3( -.0, .32, .0 ), .2, .16 ), 20. ); 
    
#ifdef WALK
    // note: this will change the rotation for the limbs too...
    float torsoPivot = -.07;
    p.xz *= rotate2d( time * torsoPivot * 2. - torsoPivot );
#endif
    
    /////////////////////
    // right leg
    
    vec3 rightLegAt = -vec3( -.1, .08, -.05 );
    rightLegAt = -vec3( -.1, .08, -.03 );
#ifdef WALK
    float legAngleDampening = .8;
    q = p + rightLegAt;
    q.y += rightLegAt.y;
    q.yz *= rotate2d( rightAngle * legAngleDampening );
    q.y -= rightLegAt.y;
    d = minnow( d, sdCappedCylinder( q, .07, .08 ), 20. );
#else    
    d = minnow( d, sdCappedCylinder( p + rightLegAt, .07, .08 ), 20. ); // right leg
#endif

    /////////////////////
    // left leg
    
    vec3 leftLegAt = rightLegAt;
    leftLegAt.x = -leftLegAt.x;
#ifdef WALK
    q = p + leftLegAt;
    q.y += leftLegAt.y;
    q.yz *= rotate2d( leftAngle * legAngleDampening );
    q.y -= leftLegAt.y;
    d = minnow( d, sdCappedCylinder( q, .07, .08 ), 20. );
#else 
    d = minnow( d, sdCappedCylinder( p + leftLegAt, .07, .08 ), 20. ); // left leg
#endif
   
    /////////////////////
    // right arm
    
    vec3 rightArmAt = -vec3( -.23, .36, -.05 );
#ifdef WALK
    q = p + rightArmAt;
    q.y -= .1;
    q.yz *= rotate2d( leftAngle );
    q.y += .1;
    d = minnow( d, sdCappedCylinder( q, .07, .14 ), 20. ); 
#else    
    d = minnow( d, sdCappedCylinder( p + rightArmAt, .07, .14 ), 20. ); 
#endif

    /////////////////////
    // left arm
    
    vec3 leftArmAt = rightArmAt;
    leftArmAt.x = -leftArmAt.x;
#ifdef WALK
    q = p + leftArmAt;
    q.y -= .1;
    q.yz *= rotate2d( rightAngle );
    q.y += .1;
    d = minnow( d, sdCappedCylinder( q, .07, .14 ), 20. ); 
#else      
    d = minnow( d, sdCappedCylinder( p + leftArmAt, .07, .14 ), 20. ); 
#endif

#ifdef WALK
    vec3 shieldAt = -vec3( -.05, -.1, -.05 );
    vec3 shieldAt2 = shieldAt;
    shieldAt2.x += .1;

    float shield = fSphere( q + shieldAt, .2 ); 
    shield = max( shield, -sdBox( q + shieldAt2, .23 ) );
    d = minnow( d, shield, 22. );
#else   
    float shield = fSphere( p - vec3( .18, .24, -.05 ), .2 ); 
    shield = max( shield, -sdBox( p - vec3( .08, .24, -.05 ), .23 ) );
    d = minnow( d, shield, 22. );
#endif

    /////////////////////
    
    return d;
}

vec2 archer( float time, vec3 p ) {
    #ifdef WALK
        p.y += time * .022;
        float itime = ( 1. - time );
        float angleF = .8;
        float rightAngle = angleF * .22 * time  - .1;
        float leftAngle  = angleF * .22 * itime - .1;
    #endif

    vec2 d = vec2( 1e33, -1. );
    
    /////////////////////
    // legs
    
    vec3 q;
    
    float legHeight = .23;
    float legInAngle = .02;

    vec3 rightLegAt = -vec3( -.03, -legHeight -.02, .0 );
    #ifdef WALK
        q = p - rightLegAt;
        q.yz *= rotate2d( leftAngle );
        q.xy *= rotate2d(-legInAngle);
        q.y = -q.y;
        q.x += rightLegAt.x * 2.;
        float rightLeg = fCone( q, .04, legHeight ) - .005;  
    #else
        float rightLeg = fCone( q + rightLegAt, .04, legHeight ) - .005;  
    #endif
    d = minnow( d, rightLeg, 30. );
    
    ///////
    // left leg

    vec3 leftLegAt = rightLegAt;
    leftLegAt.x = -leftLegAt.x;
    
    #ifdef WALK
        q = p - leftLegAt;
        q.yz *= rotate2d( rightAngle );
        q.xy *= rotate2d( legInAngle);

        q.y = -q.y;
        q.x += leftLegAt.x * 2.;
        float leftLeg = fCone( q, .04, legHeight ) - .005;  
    #else
        q = p;
        q.y = -q.y;
        float leftLeg = fCone( q + leftLegAt, .04, legHeight ) - .005;
    #endif
    d = minnow( d, leftLeg, 30. );

    /////////////////////
    // skirt
    
    float skirtWidth = .1;
    vec3 skirtAt = -vec3( .0, .22, .0 );
    q = p + skirtAt;
    
    #ifdef WALK
        float sashay = -.01;
        q.y += skirtAt.y;
        q.xy *= rotate2d( time * sashay * 2. - sashay );
        q.yz *= rotate2d( -.01 - time * .01);
        q.y -= skirtAt.y;
    #endif
    
    //d = minnow( d, fCone( q , skirtWidth, .15 ) - .01, 31. ); 
    
    /////////////////////
    // head & cap
    
    vec3 hh = p;
    #ifdef WALK
        float headPivot = -.07;
        hh.xz *= rotate2d( time * headPivot * 2. - headPivot );
    #endif
    
    d = minnow( d, fSphere( hh - vec3( .0, .5, .0 ), .06 ), 30. ); // head
    
    vec3 capAt = -vec3( -.022, -.53, .0 );
    q = hh - capAt;
    q.xy *= rotate2d( .12 );
    q.yz *= rotate2d( .05 );
    d = minnow( d, fCone( q, .03, .1 ) - .02, 31. ); // cap
    
    /////////////////////
    // top
    
    #ifdef WALK
        // note: this will change the rotation for the arms too...
        float torsoPivot = .07;
        p.xz *= rotate2d( time * torsoPivot * 2. - torsoPivot );
    #endif
        
    q = p;
    q.y /= .82;
    d = minnow( d, fSphere( q - vec3( .0, .46, .015 ), .06 ), 31. ); // top
    
    ////
    
    float armLength = .16;
    float armGirth = .01;
    float armPad = .002;
    
    vec3 rightArmAt = -vec3( +.06, -.39, .0 );
    float rightArmOutAngle = .1;
    
    q = p - rightArmAt;
    q.xy *= rotate2d( rightArmOutAngle );
    #ifdef WALK
        q.yz *= rotate2d( rightAngle );
    #endif
    q.y = -q.y;
    d = minnow( d, fCone( q, armGirth, armLength ) - armPad, 30. ); // right arm
    
    vec3 leftArmAt = rightArmAt; 
    float leftArmOutAngle = .15;
    
    leftArmAt.x *= -1.;
    q = p - leftArmAt;
    q.xy *= rotate2d( -leftArmOutAngle );
    #ifdef WALK
        q.yz *= rotate2d( leftAngle );
    #endif
    q.y = -q.y;
    d = minnow( d, fCone( q, armGirth, armLength ) - armPad, 30. ); // left arm
    
    // bow
    
    vec3 bowAt = vec3( .03, .33, .0 );
    q = p - bowAt;
    q.xy *= rotate2d( .04 );
    q = q.xzy;
    float bow = sdCappedCylinder( q, .2, .01 );
    bow = max( bow, -sdCappedCylinder( q + vec3( .02, .0, .0 ), .21, .02 ) );
    // TODO: "need" string
    d = minnow( d, bow, 32. ); // bow
    
    return d;
}

vec2 map( vec3 p ) {
    //p.y += .5;
    //p.y += cos( iTime * 12. ) * .02; // walkin'
    vec2 d = vec2( 1e33, -1. );
    
    float tWizard = MAP_11_01( cos( iTime * 12. + 0. ) );
    float tTank   = MAP_11_01( cos( iTime * 5. + 1. ) );
    float tArcher = MAP_11_01( cos( iTime * 12. + 2. ) );
    
    p.y += .5;
    d = minnow( d, wizard( tWizard, p + vec3( .6, .0, .0 ) ) );
    d = minnow( d, tank(   tTank,   p - vec3( .0, .0, .0 ) ) );
    d = minnow( d, archer( tArcher, p - vec3( .6, .0, .0 ) ) );
 /*   
    vec3 pWizard = p + vec3( .0, .5 + tWizard * .015, .0 );
    vec3 pTank   = p + vec3( .0, .5 + tTank * .020, .0 );
    vec3 pArcher = p + vec3( .0, .5 + tArcher * .022, .0 );
    
    d = minnow( d, wizard( tWizard, pWizard + vec3( .6, .0, .0 ) ) );
    d = minnow( d, tank(   tTank, pTank - vec3( .0, .0, .0 ) ) );
    d = minnow( d, rogue(  tArcher,pArcher - vec3( .6, .0, .0 ) ) );
*/
    return d;
}

////////////////////////////////////////////////////////////////

vec4 triplanarSampler( vec2 uv ) {
    return vec4( mix( BLUE, YLLO, checked( uv, 13. ) ), 1. );
}

vec3 colorHit( vec3 eye, vec3 direction, vec2 d ) {
    vec3 p = eye + direction * d.x;
    vec3 n = mapNormal( p, d.x );
    
    float light = max( .2, pow( MAP_11_01( n.y ), 2. ) );
    vec3 color;
    switch( int( d.y ) ) {
        case 10: color = vec3( .8, .1, .8 ); break;
        case 11: color = vec3( .8, .8, .5 ); break;
        case 12: color = vec3( .8, .6, .2 ); break;
        case 20: color = vec3( .8 ); break;
        case 21: color = vec3( 1.8, .6, .6 ); break;
        case 22: color = vec3( 1., .8, .1 ); break;
        case 30: color = vec3( 1., .6, .6 ); break;
        case 31: color = vec3( .4, .7, .4 ); break;
        case 32: color = vec3( .6, .3, .1 ); break;
        default:
            color =  mapTriplanarTexture( p, n );
    }
    
    // color = vec3(.0); // silhouette test 

    return light * color;
}

vec3 colorMiss( in vec2 uv ) {
    return .4 * triplanarSampler( MAP_11_01( uv * .5 ) ).xyz;
}

////////////////////////////////////////////////////////////////

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    fragColor = boilerPlateMain( fragCoord, iMouse, iResolution, iTime );
}

// EOF
////////////////////////////////////////////////////////////////
