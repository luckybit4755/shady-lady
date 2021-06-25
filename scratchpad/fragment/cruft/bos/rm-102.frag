/*

A little starting point to write fragment shaders over here...

TODO: look more into: 
https://www.shadertoy.com/view/XllGW4
https://en.wikipedia.org/wiki/Fresnel_equations
https://en.wikipedia.org/wiki/Schlick's_approximation
https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model
https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model

TODO: make a js for IQ's shaders

FIXME: AA is badly broken
FIXME: black artifacts are annoying

*/

const CONTEXT = { size: 512, width: 640, height: 480 };

CONTEXT.varying = `
    precision highp float; 
    varying vec2 vPosition;
`;

CONTEXT.fragment = `
  ${CONTEXT.varying}
  const vec3 MARCH = vec3( .0, .001, 88. );
  #define AA .1

  ${SHADY.mainMarcher}

  ////////////////////////////////////////////////////////////////
  // signed distance fields
  // https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
  // https://www.shadertoy.com/view/Xds3zN
  // https://mercury.sexy/hg_sdf/

  float sdBox( vec3 p, vec3 b ) {
      vec3 d = abs(p) - b;
      return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
  }

  float sdTorus( vec3 p, vec2 t ) {
    return length( vec2(length(p.xz)-t.x,p.y) )-t.y;
  }

  vec2 map( vec3 p ) {
    float f = .44;
    vec4 offset = vec4(.0, 3. * f, -.7 * f, -3. * f );
    vec2 d = vec2( -1., 1e33 );

    d = minnow( d, 1., sdBox(  p - offset.yzx, vec3(f) ));
    d = minnow( d, 2., length( p - offset.xzx ) - f );
    d = minnow( d, 3., sdTorus( (p - offset.wzx ).xzy, vec2(f,f*.44)));
    d = minnow( d, 4., p.y - offset.z * 3.3 );
    return d;
  }

  vec3 getColor(const float f) { 
    const vec2 ol = vec2(1.,.01);
    if ( f < 2. ) return ol.xyy;
    if ( f < 3. ) return ol.yxy;
    if ( f < 4. ) return ol.yyx;
    return ol.xyx;
  } 

  vec3 nonReflectColor( vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n ) {
      vec3 color = getColor( d.x );

      vec3 light = 1.2 * vec3( cos(uTime), 1., sin(uTime));

      vec3 lightDirection = normalize( light - p );
      float lighting = dot( lightDirection, n ) * .5 + .5;

      vec2 ld = march(p + n * .2, lightDirection );
      if ( ld.y < length( light - p ) ) {
        lighting *= .5;
      }

      return mix( color, abs(n), .33 ) * lighting;
  }

  vec3 reflectionColorCopyPastaIsBadOK( vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n ) {
    vec3 reflectionDirection = reflect( direction, n );
    vec2 reflection = march(p + n * .2, reflectionDirection );
    if ( reflection.x > .0 ) {
      vec3 r = p + reflection.y * reflectionDirection;
      vec3 m = mapNormal( r, reflection.y );
      m = reflect( reflectionDirection, m );
      return nonReflectColor( uv, p, reflectionDirection, reflection, r, m );
    }
    return colorMiss( uv, eye, direction, d);
  }

  vec3 reflectionColor( vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n ) {
    vec3 reflectionDirection = reflect( direction, n );
    vec2 reflection = march(p + n * .2, reflectionDirection );
    if ( reflection.x > .0 ) {
      vec3 r = p + reflection.y * reflectionDirection;
      vec3 m = mapNormal( r, reflection.y );
      m = reflect( reflectionDirection, m );
      return reflectionColorCopyPastaIsBadOK( uv, p, reflectionDirection, reflection, r, m );
    }
    return colorMiss( uv, eye, direction, d);
  }

  vec3 colorHit( vec2 uv, vec3 eye, vec3 direction, vec2 d, vec3 p, vec3 n ) {
    vec3 color = nonReflectColor( uv, eye, direction, d, p, n );
    color = mix( color, reflectionColor( uv, eye, direction, d, p, n ), .44 );
    return color;
  }

  vec3 colorMiss( vec2 uv, vec3 eye, vec3 direction, vec2 d ) {
    return max( uv.xyx * .33 + abs(cos(uTime)) * .44, vec3( .1 ) );
  }
`;

CONTEXT.vertex = `
  ${CONTEXT.varying}
  attribute vec3 aPosition;

  void main() {
      vPosition = ( gl_Position = vec4( aPosition,1. ) ).xy; 
  }
`;

////////////////////////////////////////////////////////////////////////////////////

function setup() {
  //createCanvas(CONTEXT.size, CONTEXT.size, WEBGL);
  //TODO: fix aspect ratio.....
  CONTEXT.aspect = CONTEXT.width / CONTEXT.height;
  createCanvas(CONTEXT.width, CONTEXT.height, WEBGL);

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  shader((CONTEXT.shader = createShader(CONTEXT.vertex, CONTEXT.fragment)));
  createButton("fullscreen").mousePressed(() => {
    // FIXME: this messes up the aspect mouse coordinates
    canvas.requestFullscreen();
  });
}

function draw() {
  const now = millis() / 1000;
  CONTEXT.shader.setUniform("uTime", now);
  CONTEXT.shader.setUniform("uFrame", frameCount);
  CONTEXT.shader.setUniform("uResolution", [
    CONTEXT.width,
    CONTEXT.height,
    CONTEXT.aspect,
  ]);

  let w = CONTEXT.width * 0.5;
  let h = CONTEXT.height * 0.5;

  let x = (mouseX - w) / w;
  let y = (mouseY - h) / h;
  CONTEXT.shader.setUniform("uMouse", [x * CONTEXT.aspect, -y, mapMouseButton()]);

  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function mapMouseButton() {
  if (!mouseIsPressed) return -1;
  switch (mouseButton) {
    case LEFT:
      return 0;
    case CENTER:
      return 1;
    case RIGHT:
      return 2;
  }
}

