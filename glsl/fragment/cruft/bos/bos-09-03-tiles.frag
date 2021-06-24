#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

vec2 stepo( in vec2 cut, in vec2 value ) {
    return smoothstep( cut * 0.99, cut * 1.01, value );
}

float circle( in vec2 xy, float r ) {
    xy -= 0.5;
    return step( r * r, dot( xy, xy ) );
}

float makeRectangle( in vec2 size, in vec2 current ) {
    size = vec2( 0.5 ) - size * 0.5;
    vec2 uv = stepo( size, current );
    uv *= stepo( size, 1.0 - current );
    return uv.x*uv.y;
}

vec2 rotate2D(vec2 _st, float _angle){
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.);

	float f = 0.0;
	float t = -u_time;

	st = rotate2D( st, t );
	st = fract( st * 9. + 6. * sin( t * 0.2 ) );
	st = rotate2D( st, t );

	f = 1.-makeRectangle( vec2( 0.96 ), st );
	f += circle( st, 0.63 );
	color += vec3( f, f * 0.33, 0. );

	f = 0.;

	float s = 0.44;
	f += makeRectangle( vec2( s ), st );
	st = rotate2D( st, 3.14 * 0.25 );
	f += makeRectangle( vec2( s ), st );
	color += vec3( f * 0.33, f * 0.23, f );

	color += vec3( 0., 0.33 * circle( st, 0.13 ), 0. );

    gl_FragColor = vec4(color,1.0);
}
