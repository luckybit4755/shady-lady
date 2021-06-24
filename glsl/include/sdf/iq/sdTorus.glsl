// The MIT License ; Copyright © 2013 Inigo Quilez ; see COPYRIGHT file in this directory
float sdTorus( vec3 p, vec2 t ) {
    return length( vec2(length(p.xz)-t.x,p.y) )-t.y;
}
