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

vec3 rgb( in int r, in int g, in int b ) {
    return vec3( float( r ) / 255., float( g ) / 255., float( b ) / 255. );
}

vec3 gray( in int v ) {
	return rgb( v, v, v );
}

float stepo( in float cut, in float value ) {
    return smoothstep( cut * 0.8, cut, value );
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.);

	color += hilo( 0.30, 2., 0.1, 99., st )  * gray( 222 );
	color -= stepo( 0.15, noise( st * 63. ) ) * gray( 33 );
	color += stepo( 0.27, noise( st * 73. + 43. ) ) * rgb( 63, 63, 23 );
	color += stepo( 0.20, noise( st * 99. - 43. ) ) * rgb( 53, 33, 43 );

    gl_FragColor = vec4(color,1.0);
}
