//https://www.shadertoy.com/view/7slGDN
vec2 hash( in vec2 uv ) {
	vec3 q = fract( uv.xyx * vec3( 19.191, 53.733, 73.761 ) );
	q += dot( q, q + vec3( 41.557, 23.929, 37.983 ) );
	return fract( vec2( q.x * q.y, q.y * q.z ) );
}
