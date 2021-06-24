const DEFAULT_CONFIG = {
	width:640, 
	height:480,
	fps: 50,
	reload:false,
};

const GLSL_ES_300 = '#version 300 es';

const DEFAULT_VERTEX_SHADER = `${GLSL_ES_300}
layout (location=0) in vec4 position;
void main() {
	gl_Position = position;
}
`;

const UNIFORM_PREAMBLE = `${GLSL_ES_300}
precision highp float;
/////////////////////////////////////////////////////////////////////////////
uniform vec2 iResolution;
uniform vec4 iMouse;
uniform float iTime;
/////////////////////////////////////////////////////////////////////////////
`;

window.onload = () => {
	let root = document.location.toString().split('/').slice(0,-2).join('/');
	let name = document.location.toString().replace( /.*\//, '' ).replace( /\.[^.]+$/, '' );
	let fragment = root + '/glsl/fragment/' + name + '.frag';

	let config = ( 'undefined' === typeof( SHADY ) ) ? DEFAULT_CONFIG : SHADY;
	Object.keys( DEFAULT_CONFIG ).forEach( k=>{if (!(k in config)) config[k]=DEFAULT_CONFIG[k]});

	config.files = {};

	config.root = root;
	config.fragment = fragment;
	addFile( config, fragment );

	config.ui = setupUI( config );

	loadFiles( config );
};

const setupUI = ( config ) => {
	let styleElement = document.createElement( 'style' );
	styleElement.innerHTML = '*, button { background:#334; text:#CCB; }';
	document.head.appendChild( styleElement );

	let canvasContainer = document.createElement( 'div' );
	document.body.appendChild( canvasContainer );

	let canvas = document.createElement( 'canvas' );
	canvas.setAttribute( 'width', config.width );
	canvas.setAttribute( 'height', config.height );
	canvasContainer.appendChild( canvas );

	let controlContainer = document.createElement( 'div' );
	document.body.appendChild( controlContainer );

	let fullscreen = document.createElement( 'button' );
	fullscreen.innerHTML = 'fullscreen';
	controlContainer.appendChild( fullscreen );

	let errorContainer = document.createElement( 'pre' );
	document.body.appendChild( errorContainer );

	return {
		canvas: canvas,
		fullscreen: fullscreen,
		errorContainer: errorContainer,
	}
};

const hashText = ( txt ) => {
	return sha256(txt);

	/* note window.crypto.subtle.digest only works for https hosting >_< */
	const data = new TextEncoder.encode(txt);
	window.crypto.subtle.digest('SHA-256', data).then(
		hash => {
			console.log( JSON.stringify(hash));
			hash = String.fromCharCode.apply(String,hash);
			console.log('frq hash is ' +  hash );
		}
	).catch(err => { console.log(err) });
};

const addFile = ( config, file ) => {
	if ( file in config ) {
		console.log( `already tracking ${file}` );
	} else {
		console.log( `add file ${file} to the list` );
		config.files[ file ] = {
			loaded:false,
			hash:false,
			contents:false,
			resolved:false,
			includes:{}
		}
	}
};

const loadFiles = ( config ) => {
	let toLoad = false;
	let files = Object.keys( config.files );
	for( let i = 0 ; i < files.length && !toLoad ; i++ ) {
		let file = files[ i ];
		if ( !config.files[ file ].loaded ) {
			toLoad = file;
		}
	}

	if ( toLoad ) {
		console.log( `toLoad: ${toLoad}` );
		loadFile( config, toLoad );
	} else {
		console.log( 'all loaded' );
		handleIncludes( config );
	}
};

const loadFile = ( config, file ) => {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if ( this.readyState == 4 ) {
			if ( this.status == 200) {
				let src = this.responseText;
				let entry = config.files[ file ];
				entry.loaded = true;
				entry.contents = this.responseText;
				entry.hash = hashText( this.responseText );

				let lines = src.split('\n');
				lines.forEach(line=>{
					if ( /^#include/.test(line)) {
						let include = config.root + '/glsl/include/' + line.trim().replace(/.*\s/,'');
						addFile( config, include );
						entry.includes[include]=1;
					}
				});

				if ( !Object.keys( entry.includes ).length ) {
					entry.resolved = src;
				}

				loadFiles( config );
			} else {
				console.error( 'ERROR: loading ' + file + ' -> ' + this.status );
			}
		}
	};
	xhttp.open('GET', file + '?' + new Date().getTime(), true );
	xhttp.send();
};

const handleIncludes = ( config ) => {
	//console.log( JSON.stringify( config.files, false, '\t' ));//.files );
	for ( let i = 0 ; i < 33 ; i++ ) {
		let resolved = 0;
		Object.keys( config.files ).forEach( file => {
			let entry = config.files[file];
			let includes = Object.keys( entry.includes );
			if ( !includes.length ) return;

			console.log( file + ' needs to have ' + includes.join( ', ' ) );
			let resolvable = true;
			includes.forEach( include => {
				let isResolved = ( false != config.files[include].resolved );
				resolvable = resolvable && isResolved;
			});

			if ( !resolvable ) return;
			resolved++;

			let nuLines = [];
			let lines = entry.contents.split('\n');
			lines.forEach(line=>{
				if ( /^#include/.test(line)) {
					let name = line.trim().replace(/.*\s/,'');
					let include = config.root + '/glsl/include/' + name;

					config.files[include].resolved.split('\n').forEach((line,lineNumber)=>{
						if ( line.trim().length && !/\\/.test(line) ) {
							nuLines.push( line + '        // ' + name + '#' + (lineNumber + 1) );
						} else {
							nuLines.push( line );
						}
					});
					//nuLines.push.apply(nuLines, config.files[include].resolved.split('\n') );
				} else {
					nuLines.push( line );
				}
			});

			entry.resolved = nuLines.join('\n');
		});

		if ( 0 == resolved ) break;
	}

				
	//let fragment = UNIFORM_PREAMBLE + '\n' + config.files[config.fragment].resolved;
	let fragment = config.files[config.fragment].resolved;
	console.log( '\n' + fragment + '\n' );
	throwShade( fragment, DEFAULT_VERTEX_SHADER, config );
};

const throwShade = ( fragment, vertex, config = {} ) => {
	/* -------------------------------------------------------------- */

	let canvas = config.ui.canvas;
	let gl = canvas.getContext( 'webgl2' );

	canvas.addEventListener("contextmenu", (event) => event.preventDefault());

	/* -------------------------------------------------------------- */

	let vertex_shader = gl.createShader( gl.VERTEX_SHADER );

	gl.shaderSource( vertex_shader, vertex );
	gl.compileShader( vertex_shader );
	console.log( gl.getShaderInfoLog( vertex_shader ));  

	let fragment_shader = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( fragment_shader, fragment );
	gl.compileShader( fragment_shader );

	let compilerMessage = gl.getShaderInfoLog( fragment_shader );
	if ( compilerMessage ) {
		console.log( 'compiler info start:' );
		console.log( compilerMessage );
		console.log( 'compiler info end.' );
		errorContainer.innerHTML = compilerMessage;

		if ( /ERROR:/.test( compilerMessage ) ) {
			throw compilerMessage;
		}
	}

	let program = gl.createProgram();
	gl.attachShader( program, vertex_shader );
	gl.attachShader( program, fragment_shader );
	gl.linkProgram( program );
	gl.useProgram( program );

	let vertex_buf = gl.createBuffer( gl.ARRAY_BUFFER );
	gl.bindBuffer( gl.ARRAY_BUFFER, vertex_buf );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW );
	  
	let position_attrib_location = gl.getAttribLocation( program, "position");
	gl.enableVertexAttribArray( position_attrib_location );
	gl.vertexAttribPointer( position_attrib_location, 2, gl.FLOAT, false, 0, 0);

	uz = {};
	'iResolution iMouse iTime'.split( ' ' ).forEach( v=>{
		uz[ v ] = gl.getUniformLocation( program, v );
		console.log( v, '->', uz[ v ] );
	});

	let iMouse = [.0,.0,-1.,.0];  // see https://editor.p5js.org/luckybit4755/sketches/y9X6tABEx

	let iTime = 0.0;

	let draw = () => {
		if ( !uz ) return;

		let iTime = new Date().getTime() / 1000.;
		gl.uniform1f( uz.iTime, iTime );

		gl.uniform2f( uz.iResolution, config.width, config.height );
		gl.uniform4f( uz.iMouse, iMouse[ 0 ], iMouse[ 1 ], iMouse[ 2 ], iMouse[ 3 ] );
		gl.drawArrays( gl.TRIANGLES, 0,  3 );
		setTimeout(
			() => { window.requestAnimationFrame( draw ) }
			, 1000 / config.fps
		);
	};

	let w2 = config.width * 0.5;
	let h2 = config.height * 0.5;

	canvas.onmousedown = ( e ) => {
		iMouse[ 2 ] = e.buttons;
	};
	canvas.onmousemove = ( e ) => {
		let co = cumulativeOffset(canvas);
		let x = e.clientX - co.left;
		let y = e.clientY - co.top;
		x = ( x - w2 ) / w2;
  		y = ( y - h2 ) / h2;
		iMouse[ 0 ] = x;
		iMouse[ 1 ] = -y;
	};
	canvas.onmouseup = ( e ) => {
		iMouse[ 2 ] = -1.;
	};

	canvas.onblur = ( e ) => {
		iMouse.fill(.0);
		iMouse[2]=-1.;
	};

	config.ui.fullscreen.onclick = () => {
		canvas.requestFullscreen();
	}

	draw();
};

/*-----------------------------------------------------------------------*/
/* from https://geraintluff.github.io/sha256/ */
const sha256 = (ascii) => {
	function rightRotate(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};

	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length'
	var i, j; // Used as a counter across the whole file
	var result = ''

	var words = [];
	var asciiBitLength = ascii[lengthProperty]*8;

	//* caching results is optional - remove/add slash from front of this line to toggle
	// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
	// (we actually calculate the first 64, but extra values are just ignored)
	var hash = sha256.h = sha256.h || [];
	// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
	var k = sha256.k = sha256.k || [];
	var primeCounter = k[lengthProperty];
	/*/
	var hash = [], k = [];
	var primeCounter = 0;
	//*/

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
			k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
		}
	}

	ascii += '\x80' // Append Ƈ' bit (plus zero padding)
	while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j>>8) return; // ASCII check: only accept characters in range 0-255
		words[i>>2] |= j << ((3 - i)%4)*8;
	}
	words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
	words[words[lengthProperty]] = (asciiBitLength)

	// process each chunk
	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
		var oldHash = hash;
		// This is now the undefinedworking hash", often labelled as variables a...g
		// (we have to truncate as well, otherwise extra entries at the end accumulate
		hash = hash.slice(0, 8);

		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			// Expand the message into 64 words
			// Used below if
			var w15 = w[i - 15], w2 = w[i - 2];

			// Iterate
			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
				+ ((e&hash[5])^((~e)&hash[6])) // ch
				+ k[i]
				// Expand the message schedule if needed
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
					)|0
				);
			// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
				+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj

			hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
			hash[4] = (hash[4] + temp1)|0;
		}

		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i])|0;
		}
	}

	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i]>>(j*8))&255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}
	return result;
};

// https://stackoverflow.com/questions/1480133/how-can-i-get-an-objects-absolute-position-on-the-page-in-javascript
const cumulativeOffset = (element) => {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};
