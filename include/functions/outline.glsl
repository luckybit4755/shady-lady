float outline( float d, float t, float v ) {
	float q = .01;
	float a = smoothstep( d + t * 1. , d + t * 1. + q, v );
	float b = smoothstep( d + t * 2. , d + t * 2. + q, v );
	return a - b;

	// idk...
	float i = smoothstep( d, d - t * 1., v );
	float o = smoothstep( d, d - t * 2., v );
	return i - o;
}   
