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

float bitten( in vec2 st, in float a, in float b, in float x, in float y ) {
	float f = noise( st );
	return smoothstep( a, b, f ) - smoothstep( x, y, f );
}

float mitten( in vec2 st, in float scale, in float angle, in float a, in float b, in float x, in float y ) {
	st *= scale;
	st -= scale * 0.5;
	st *= rotate2d( angle );
	st += scale * 0.5;

	return bitten( st, a, b, x, y );
} 

float ritten( in vec2 st, in float scale, in float angle, in float a, float x ) {
	float q = 0.1;

	float f = mitten( st, scale, angle, a, a + q, x, + q );

	scale += q;
	angle += 0.01;
	return f + mitten( st, scale, angle, a, a + q, x, + q );
}

float fitten( in vec2 st, in float scale, in float angle, in float a, float x ) {
	return 
		ritten( st, scale + 0.00, angle + 0.00, a, x ) +
		ritten( st - 0.02, scale + 0.01, angle + 0.0030, a, x );
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

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec2 mx = u_mouse.xy/u_resolution.xy;
	vec3 color = vec3(0.);

	float scale;
	float c = 0.26;

	//color += c * lines( st * noise( st * 0.10 ), 30., 0.9 );
	//color -= c * lines( st * noise( st * 0.15 ), 30., 0.9 );
	//color += c * lines( st * noise( st * 1.15 ), 30., 0.9 );
	color += c * lines( st * (1.+0.2*noise( st * 4.25 )), 4., 0.98 );
	color += c * lines( st * (1.+0.2*noise( st * 8.25 )) * rotate2d( 0.01 ), 4.3, 0.96 );


	if ( false ) {
		c = 0.06;
		color += c * fitten( st +  3.50, 1.15, 0.00, 0.00, 0.10 );
		color += c * fitten( st +  8.40, 2.20, 0.82, 0.00, 0.10 );
		color += c * fitten( st +  8.00, 2.20, 0.84, 0.00, 0.10 );
		color += c * fitten( st + 4.00, 2.80, 1.84, 0.01, 0.08 );
	}


	if ( !false ) {
		c = 0.3;

		//color += line( st, 0.08 , 1.1 , 1.2 , 0. );
		color += c * line( st, 0.28 * noise( st * 3. ), 1.1 * noise( st * 7.0 ), 1.2 * noise( st * 9. ), 0. );
		color -= c * line( st, 0.09 * noise( st * 3. ), 1.1 * noise( st * 7.0 ), 1.2 * noise( st * 9. ), 0. );
		color += c * line( st, 0.38 * noise( st * 8. ), 4.1 * noise( st * 9.0 ), 1.2 * noise( st * 9. ), -0.2 );

		vec2 xy = st * rotate2d( 0.77 );
		color += c * line( xy, 0.01 + 0.2 * noise( st * 5. ), 4.1 * noise( st * 7. ), 1.2 * noise( st * 7. ), .1 );
		color -= c * line( xy, 0.01 + 0.1 * noise( st * 5. ), 4.1 * noise( st * 7. ), 1.2 * noise( st * 7. ), .1 );

		c = 0.2;
		color += c * ritten( st + 0.3, 4.30, 0.50, 0.00, 0.10 );
	}

    gl_FragColor = vec4(1.-color,1.0);
}
