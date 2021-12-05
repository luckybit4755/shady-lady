#include ../sdf/iq/sdBox.glsl
#include ../sdf/iq/sdTorus.glsl
#include ../functions/minnow.glsl

// this is a sample scene with a torus, a ball and cube sitting on a plane
vec2 map( vec3 p ) {
    float f = .22;
    vec4 offset = vec4(.0, 3. * f, -.7 * f, -3. * f );
    vec2 d = vec2( -1., 1e33 );
    d = minnow( d, 1., sdBox(  p - offset.yzx, vec3(f) *.9 ) -.077 ); // round off a bit
    d = minnow( d, 2., length( p - offset.xzx ) - f ); 
    d = minnow( d, 3., sdTorus( (p - offset.wzx ).xzy, vec2(f,f*.44)));
    d = minnow( d, 4., p.y - offset.z * 3.3 );
    return d;
}
