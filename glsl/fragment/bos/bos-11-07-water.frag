#ifdef GL_ES
precision mediump float;
#endif

#define PI  3.141592653589793
#define PI2 6.283185307179586

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

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

mat2 rotate2d( in float angle ) {
	angle *= PI2;
    return mat2(
        cos( angle ), -sin( angle ),
        sin( angle ),  cos( angle )
    );
}

mat2 scale(vec2 scale){
    return mat2(
        scale.x, 0.0,
        0.0,     scale.y
    );
}

float lwater( in vec2 st, in vec2 center, in float power ) {
	st     *= 1.0 + 0.2 * noise( st + u_time );
	center *= 0.8 + 0.4 * noise( st + u_time );
	power  *= 1.0 + 0.8 * cos( noise( st - u_time ) );
	return pow( dot( st - center, st - center ), power );
}


float line( in vec2 st, in float thickness, in float a, in float b, in float c ) {
    float f = st.x * a + c;
    float g = st.y * b;
    return
        smoothstep( f-thickness, f, g ) -
        smoothstep( f, f+thickness, g ) ;
}


float lines( in vec2 st, in float count, in float thickness ) {
	return smoothstep( thickness - 0.01, thickness, fract( st.y * count ) );
}

float lion( in vec2 st, in float thickness, in float a, in float b, in float c ) {
	vec2 xy = st * vec2( a, b );
	float f = xy.x + xy.y;
	return 
		smoothstep( c - thickness, c, f ) -
		smoothstep( c, c + thickness, f );
}

float lork( in vec2 st, in float thickness, in float slope, in float intersect ) {
	//y= mx +b;
	float f = st.x * slope + intersect;
	return 
		smoothstep( st.y - thickness, st.y, f ) -
		smoothstep( st.y, st.y + thickness, f );
}

float norgse( in vec2 st, in float value, in float scale, in float wiggle ) {
	return value * (1.-wiggle) + value * wiggle * value * noise( scale * st + u_time );
}//i0.01, 0.1a

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec2 mx = u_mouse.xy/u_resolution.xy;

	vec3 color = rgb( 44,99,255);
	vec3 blue = rgb( 88,200,255);
	blue = rgb( 133,200,255);
	//st *= 8.;

	//float thickness = 0.2;
	//color += blue * line( st, thickness, 0.2, 8.6, 0.5 );

	//float thickness = 0.999 - 0.2 * noise( 88.*st );
	//thickness = 1. * noise( st );


	//color += blue * lines( st, 8. , thickness );
	//color += blue * lines( st, 8. * noise( 99.*st + u_time ), thickness );

	int count = 8;
	for ( int i = 0 ; i < count ; i++ ) {
		break;
		float xo = 1.80 * float( i ) / float( count );

		float scale = 33.0;
		float thickness = norgse( st, 0.01, scale, 0.6 );
		float a = norgse( st, 0.02, scale, 0.4 );
		float b = norgse( st, xo, scale, 0.2 );

		color += lork( st, thickness, a, b );
	}

	float n;

	st -= 0.6;
	st *= rotate2d( 0.1 + 0.1 * noise( st + u_time * 0.4 ) );
	st += 0.5;
	st.x += 0.2 * noise( st + u_time * 0.6 );
	
	color += blue * lines( st, 18. * noise( 37.*st + u_time ), 0.8 );

	n = noise( st * 39. + u_time );
	color += blue * ( smoothstep( 0.15, 0.16, n ) - smoothstep( 0.20, 0.24, n ) );

	n = noise( st * 9. + u_time * 0.8 );
	color += blue * ( smoothstep( 0.0, 1., n ) - smoothstep( 0.30, 0.59, n ) );

    gl_FragColor = vec4( color, 1. );
}
