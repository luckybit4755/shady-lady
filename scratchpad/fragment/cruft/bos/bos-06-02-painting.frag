#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 GOLD = vec3(0.149,0.141,0.912);
vec3 BLUE = vec3(1.000,0.833,0.224);

float plot (vec2 st, float pct){
  return  smoothstep( pct-0.01, pct, st.y) -
          smoothstep( pct, pct+0.01, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

	// val
	float q = st.x; st.x = st.y ; st.y = q;

    vec3 pct = vec3(st.x);

	bool myR = true;
	bool myG = !true;
	bool myB = !true;

	// uggh... idk...

	pct.r = smoothstep(0.0,1.0, st.x);; // original
	if ( myR ) {
    	pct.r = smoothstep(0.0,1.0, pow(st.x * 0.5 + st.y * 0.5,1.3));
	}

    pct.g = sin(st.x*PI); // original
	if ( myG ) {
		pct.g = sin(st.x*PI*1.4)* 1.3;
	}

	pct.b = pow(st.x,0.5); // original
	if ( myB ) {
    	pct.b = pow(st.x,0.9) * 0.5 + 0.5;
	}

    color = mix(GOLD, BLUE, pct);

    // Plot transition lines for each channel
    color = mix(color,vec3(1.0,0.0,0.0),plot(st,pct.r));
    color = mix(color,vec3(0.0,1.0,0.0),plot(st,pct.g));
    color = mix(color,vec3(0.0,0.0,1.0),plot(st,pct.b));

    gl_FragColor = vec4(color,1.0);
}
