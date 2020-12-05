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

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	float color = 0.1;

	color += 0.60 * abs( noise( ( st + 0.1 ) * 222. ) );
	color += 0.55 * abs( noise( ( st + 0.1 ) * 103. ) );
	color += 0.40 * abs( noise( ( st + 0.1 ) *  79. ) );
	color += 0.12 * abs( noise( ( st + 0.1 ) *  38. ) );
	color += 0.30 * abs( noise( ( st + 0.1 ) *  23. ) );
	color += 0.39 * abs( noise( ( st + 0.1 ) *   7. ) );
	color += 0.09 * abs( noise( ( st + 0.4 ) *   6. ) );
	color += 0.19 * abs( noise( ( st + 0.9 ) *   3. ) );

    gl_FragColor = vec4(color * vec3( 0.7,0.6,0.5),1.0);
}
