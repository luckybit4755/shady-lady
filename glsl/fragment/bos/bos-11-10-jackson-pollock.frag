#ifdef GL_ES
precision mediump float;
#endif

#define PI  3.141592653589793
#define PI2 6.283185307179586

uniform vec2 u_resolution;
uniform float u_time;

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// https://thebookofshaders.com/edit.php#11/2d-gnoise.frag
vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)), dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}
// Gradient Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/XdXGW8
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

///

float noize( in float weight, in float scale, in vec2 value ) {
	return 1.-weight + weight * noise( value * scale );
}

float hilo( in float hiWeight, in float hiScale, in float loWeight, in float loScale, vec2 xy ) {
	return noize( hiWeight, hiScale, xy ) * noize( loWeight, loScale, xy );
}

float line( in vec2 st, in float thickness, in float a, in float b, in float c ) {
        float f = st.x * a + c;
        float g = st.y * b;
        return
                smoothstep( f-thickness, f, g ) -
                smoothstep( f, f+thickness, g ) ;
}

float idk( in vec2 st, in vec2 a, in vec2 b, in vec2 c, in float q  ) {
	return line( st, a.x * noise( st * a.y ), b.x * noise( st * b.y ), c.x * noise( st * c.y ), q );
}

// finally broke down and watched the video
float sdSegment( in vec2 p, in vec2 a, in vec2 b, in float thickness ) {
	vec2 l = b - a;
	vec2 o = p - a;
	float t = dot( o, l ) / dot( l, l ); // projection of o onto l
	t = min( 1., max( 0., t ) );
	//t = clamp( t, 0., 1. );

	vec2 q = a + l * t;
	return length( p - q ) - thickness;
	return length( o - l * t ) - thickness;
}

float segment( in vec2 st, in vec2 a, in vec2 b, in float thickness ) {
	return smoothstep( 0.995, 1., 1.-sdSegment( st, a, b, thickness ) );
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

	uvec3 p;

	color += line( st, 0.38 * noise( st * 8. ), 4.1 * noise( st * 9.0 ), 1.2 * noise( st * 9. ), -0.4 );

	//color += step( 0.999, 1.-sdSegment( st, vec2( 0.1, 0.9 ), vec2( 0.4 ), 0.002 ) );
	//color += segment( st, vec2( 0.1, 0.9 ), vec2( 0.4 ), 0.001 );
	color += segment( st, vec2( 0. ) * noise( st * 8. ), vec2( 1. ) * noise( st * 40. ), 0.01 * noise( st * 9. ) );

    gl_FragColor = vec4(1.-color,1.0);
}
