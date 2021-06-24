vec2 minnow( vec2 current, vec2 candidate ) {
  return current.y < candidate.y ? current : candidate;
}

vec2 minnow( vec2 current, float id, float distance ) {
  return minnow( current, vec2( id, distance ));
}
