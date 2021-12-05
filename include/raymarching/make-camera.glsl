// zab,xZup,yXz | zxy:ab,zup,xz
mat3 makeCamera( vec3 a, vec3 b, float roll ) {
    vec3 up = vec3( sin(roll),cos(roll), .0);
	vec3 z = normalize( b - a );
	vec3 x = normalize( cross( z, up ) );
	vec3 y = normalize( cross( x, z ) );
	return mat3( x, y, z );
}
