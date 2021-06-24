// meh...

#ifdef GL_ES
precision mediump float;
#endif

#define PI  3.141592653589793
#define PI2 6.283185307179586

uniform vec2  u_mouse;
uniform vec2  u_resolution;
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
	float t = .6 + 0.5 * abs( cos( u_time * .33 ) );

    return t * mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
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

float splatter( in vec2 st, in float a, in float b, in float scale ) {
	float n = noise( st * scale );
	return 8.3 * ( smoothstep( a, b, n ) - smoothstep( a * 0.7, b * 1.3, n ) );
	return smoothstep( a, b, n ) - smoothstep( a * 2.2, b * 2., n );
}

float lines( in vec2 st, in float count, in float thickness ) {
    return smoothstep( thickness - 0.04, thickness, fract( st.y * count ) );
}

float ng( in vec2 st, in float min, in float max, in float scale ) {
	return min + ( max - min ) * noise( scale * st );
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec2 ms = u_mouse / u_resolution.xy;


	vec3 color = vec3(0.0);

	color += line( st, 0.38 * noise( st * 8. ), 4.1 * noise( st * 9.0 ), 1.2 * noise( st * 9. ), -0.4 );
	color += splatter( st +2.8, .18, .20, 10. );
	color += lines( st * noise( st * 8.2 ), ng( st, 1., 32., 7.2 ), ng( st, 0.9, 0.11, 17. ) );
	color += lines( st, ng( st, 1., 3., 7.2 ), ng( st, 0.6, 4.11, 9. ) );
	color -= lines( st, ng( st, 1., 3., 7.23 ), ng( st, 0.6, 4.19, 9.3 ) );

    gl_FragColor = vec4(1.-color,1.0);
}
