#ifdef GL_ES
precision mediump float;
#endif

#define PI  3.141592653589793
#define PI2 6.283185307179586

uniform vec2 u_resolution;
uniform float u_time;

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

float stepo( in float a, in float v ) {
	return smoothstep( a * .96, a, v );
}

float circle( in vec2 xy ) {
	xy -= vec2( 0.5 );
	float f = dot( xy, xy );
	float r = 0.5 * 0.5 * 0.66;

	f *= (1.-0.3*noise(xy-u_time));
	r *= (1.-0.9*noise(xy+u_time));
  	return stepo( r, f );
}

float saltire( in vec2 xy ) {
    vec2 og = vec2( xy );
    xy -= vec2( 0.5 );
    float q = 0.15;

    float f = 0.0;

    // bottom left, top right
    float top = stepo( q, xy.x - xy.y );
//top *= (1.0-.2*noise(xy+u_time));

    float bot = stepo( q, xy.y - xy.x );
//bot *= (1.0-.2*noise(xy+u_time));

    f += top + bot;

	//f *= (1.0-.9*noise(xy+u_time));

    xy *= vec2(-1.,1);
    top = stepo( q, xy.x - xy.y );
    bot = stepo( q, xy.y - xy.x );
    f *= top + bot;

	//f *= (1.0-.3*noise(xy-u_time));

    f += circle( og );

    return f;
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	vec3 color = vec3(0.0);

//	st -= 0.5;
//	st *= 1.4 * rotate2d( 0.03*noise( st * u_time ) );
//	st += 0.5;


	float scale = 3.0;

	st *= scale;
	vec2 translate = vec2(cos(u_time),sin(u_time));
	translate *= noise( translate );
    st += translate*3. - scale * 0.4;

	float s1 = saltire( st );
	float s2 = saltire( st * 1.3 - 0.15 );

	color += s1;
	//color += vec3( .9, .0, .0 ) * ( 1.-saltire( st ) );
	//color += vec3( .0, .0, .9 ) * ( 1.-saltire( st * 1.3 - 0.15) );

    gl_FragColor = vec4(color,1.0);
}
