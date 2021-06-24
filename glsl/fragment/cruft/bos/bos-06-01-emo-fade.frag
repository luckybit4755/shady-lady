#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

vec3 colorA = vec3(0.912,0.794,0.636);
vec3 colorB = vec3(0.912,0.389,0.442);

void main() {
    vec3 color = vec3(0.0);

    float percentage = abs(sin(u_time));

	float f = 5.0;
	float x = mod( u_time, f ) / f;

	float y = 0.0; 
    if ( x > 0.5 ) {
		y = pow( sin( ( 1.0 - x ) * 0.5 * 6.28 ), 0.7 );
	} else {
		y = pow( x * 2.0, 7.0 );
	}




	percentage = y;

    // Mix uses percentage (a value from 0-1) to
    // mix the two colors
    color = mix(colorA, colorB, percentage);

    gl_FragColor = vec4(color,1.0);
}
