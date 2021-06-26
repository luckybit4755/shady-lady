window.onload = () => {
	new ShadyLady();
};

class ShadyLady {
	constructor() {
		this.load();
	};

	getDefaultConfig() {
	   return {
			width:640, 
			height:480,
			fps: 50,
			reload:false,
			vertex:'#version 300 es\nlayout (location=0) in vec4 position;\nvoid main() {\n\tgl_Position = position;\n}\n',
			style: `
				* { background:#223; color:#aa9; tab-size: 4; } 
				#errorContainer { color:#f45; font-size:xx-large; }
				.codeContainer { 
					counter-reset: line;
					overflow-x: scroll;
					width:97%;
				}
				.toggle {
					user-select: none;
					-webkit-user-select: none;
				}
				code {
					counter-increment: line;
					width:100%;
					display:inline-block;
				}
				code:nth-child(odd) {
					background: #292939;
				}
				code:before {
					content: counter(line);
					text-align: right;
					padding-right: .5em;
					width:3em;
					-webkit-user-select: none;
					border-right: 1px solid #664;
					border-left: 1px solid #664;
					display:inline-block;
				}
			`,
		};
	}


	load() {
		const trimLastPathSection = ( url ) => url.replace( /\/[^\/]*$/, '/' );

		this.loca = document.location.toString();
		this.root = trimLastPathSection( this.loca );
		this.includeRoot = trimLastPathSection( trimLastPathSection( this.root.replace( /\/$/, '' ) ) ) + 'include/';

		let name = this.loca.substring( this.root.length ).replace(/^html/, '' ).replace(/\.html$/,'' );
		this.fragment = this.root + name + '.frag';

		console.log( 'root:' + this.root );
		console.log( 'name:' + name );
		console.log( 'frag:' + this.fragment );
		console.log( 'incl:' + this.includeRoot );

		// try to pull "SHADY" from the global scope...
		if( 'undefined' === typeof( SHADY ) ) {
			this.config = this.getDefaultConfig();
		} else {
			this.config = SHADY;
			let def = this.getDefaultConfig();
			Object.keys( def ).forEach( k=>{ 
				if( k in this.config ) return;
				this.config[ k ] = def[ k ];
			});
		}

		this.files = {};

		this.addFile( this.fragment );
		this.createUi();
		this.loadFiles();
	}


	addFile( file ) {
		if ( file in this.files) {
			console.log( `already tracking ${file}` );
		} else {
			console.log( `add file ${file} to the list` );
			this.files[ file ] = {
				loaded:false,
				hash:false,
				src:false,
				resolved:false,
				includes:{},
				resolutions:{}
			}
		}
	}

	loadFiles() {
		let toLoad = false;
		let files = Object.keys( this.files );
		for( let i = 0 ; i < files.length && !toLoad ; i++ ) {
			let file = files[ i ];
			if ( !this.files[ file ].loaded ) {
				toLoad = file;
			}
		}

		if ( toLoad ) {
			console.log( `toLoad: ${toLoad}` );
			this.loadFile( toLoad );
		} else {
			console.log( 'all loaded' );
			this.handleIncludes();
		}
	}

	loadFile( file ) {
		let thiz = this;
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if ( this.readyState == 4 ) {
				if ( this.status == 200) {
					let src = this.responseText;
					let entry = thiz.files[ file ];
					entry.loaded = true;
					entry.src = this.responseText;
					entry.hash = hashText( this.responseText );

					let lines = src.split('\n');
					lines.forEach(line=>{
						if ( /^#include/.test(line)) {
							let name = line.trim().replace(/.*\s/,'');
							let include = thiz.resolveIncludePath( file, name );
							thiz.addFile( include );
							entry.includes[ include ] = 1
							entry.resolutions[ name ] = include;
						}
					});

					if ( !Object.keys( entry.includes ).length ) {
						entry.resolved = src;
					}

					thiz.loadFiles();
				} else {
					console.error( 'ERROR: loading ' + file + ' -> ' + this.status );
				}
			}
		};
		xhttp.open('GET', file + '?' + new Date().getTime(), true );
		xhttp.send();
	}

	resolveIncludePath( file, include ) {
		if( '/' === include[ 0 ] || 0 != file.indexOf( this.includeRoot ) ) {
			return this.includeRoot + include;
		} else {
			return file.replace( new RegExp( '/[^/]+$' ), '/' + include );
		}
	}

	handleIncludes() {
		for ( let i = 0 ; i < 33 ; i++ ) {
			let resolved = 0;
			Object.keys( this.files ).forEach( file => {
				let entry = this.files[file];
				let includes = Object.keys( entry.includes );
				if ( !includes.length ) return;

				console.log( file + ' needs to have ' + includes.join( ', ' ) );
				let resolvable = true;
				includes.forEach( include => {
					let isResolved = ( false != this.files[include].resolved );
					resolvable = resolvable && isResolved;
				});

				if ( !resolvable ) return;
				resolved++;

				let nuLines = [];
				let lines = entry.src.split('\n');
				lines.forEach(line=>{
					if ( /^#include/.test(line)) {
						let name = line.trim().replace(/.*\s/,'');
						let include = entry.resolutions[ name ];

						this.files[include].resolved.split('\n').forEach((line,lineNumber)=>{
							line = line.replace( /\s*$/, '' );
							if ( line.length && !/\\/.test(line) ) {
								let length = ( '' + line ) .replace(/\t/g, '    ').length;
								for ( let i = 0 ; i < 80 - length ; i++ ) line += ' ';
							
								nuLines.push( line + ' // ' + name + '?' + (lineNumber + 1) );
							} else {
								nuLines.push( line );
							}
						});
					} else {
						nuLines.push( line );
					}
				});

				entry.resolved = nuLines.join('\n');
			});

			if ( 0 == resolved ) break;
		}
					
		this.fragmentSource = this.files[this.fragment].resolved;

		this.throwShade();
	};

	addCode( src, element ) {
		console.log(element);
		src.trim().split( '\n' ).forEach( line => {
			let code = document.createElement( 'code' );
			code.appendChild( document.createTextNode( line ) );
			element.appendChild( code );
			element.appendChild( document.createTextNode( '\n' ) );
		});
	}

	throwShade() {
		/* -------------------------------------------------------------- */

		let canvas = this.ui.canvas;
		let gl = canvas.getContext( 'webgl2' );

		canvas.addEventListener("contextmenu", (event) => event.preventDefault());

		/* -------------------------------------------------------------- */

		this.addCode( this.files[this.fragment].src, this.ui.sourceWrapper );
		this.addCode( this.fragmentSource, this.ui.fragmentWrapper );

		/* -------------------------------------------------------------- */

		let vertex_shader = gl.createShader( gl.VERTEX_SHADER );

		gl.shaderSource( vertex_shader, this.config.vertex );
		gl.compileShader( vertex_shader );
		console.log( gl.getShaderInfoLog( vertex_shader ));  

		let fragment_shader = gl.createShader( gl.FRAGMENT_SHADER );
		gl.shaderSource( fragment_shader, this.fragmentSource );
		gl.compileShader( fragment_shader );

		let compilerMessage = gl.getShaderInfoLog( fragment_shader );
		if ( compilerMessage ) {
			console.log( 'compiler info start:' );
			console.log( compilerMessage );
			console.log( 'compiler info end.' );
			this.ui.errorContainer.innerHTML = compilerMessage;
			canvas.style.display = 'none';

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

		let uz = {};
		'iResolution iMouse iTime'.split( ' ' ).forEach( v=>{
			uz[ v ] = gl.getUniformLocation( program, v );
			console.log( v, '->', uz[ v ] );
		});

		let iMouse = [.0,.0,-1.,.0];

		let iTime = 0.0;

		let w = this.config.width;
		let h = this.config.height;

		let w2 = w * 0.5;
		let h2 = h * 0.5;

		let draw = () => {
			if( this.config.draw ) {
				this.config.draw();
			}

			let iTime = new Date().getTime() / 1000.;
			gl.uniform1f( uz.iTime, iTime );

			gl.uniform2f( uz.iResolution, w, h );
			gl.uniform4f( uz.iMouse, iMouse[ 0 ], iMouse[ 1 ], iMouse[ 2 ], iMouse[ 3 ] );
			gl.drawArrays( gl.TRIANGLES, 0,  3 );
			setTimeout(
				() => { window.requestAnimationFrame( draw ) }
				, 1000 / this.config.fps
			);
		};

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

		this.ui.fullscreen.onclick = () => {
			canvas.requestFullscreen();
		};

		draw();
	}

	createUi() {
		this.ui = {}

		this.addElement( 'style', 'style', this.config.style, document.head );
		this.addElement( 'canvasContainer' );

		let canvas = this.addElement( 'canvas', 'canvas', false, this.ui.canvasContainer );
		canvas.setAttribute( 'width', this.config.width );
		canvas.setAttribute( 'height', this.config.height );

		this.addElement( 'controlContainer' );
		this.addElement( 'fullscreen', 'button', 'fullscreen', this.ui.controlContainer );

		this.addElement( 'errorContainer', 'pre' );

		'fragment source'.split( ' ' ).forEach( type => {
			let container = this.addElement( type + 'Container' );
			let toggle = this.addElement( type + 'Toggle', 'div', '['+type+']', container )
			let wrapper = this.addElement( type + 'Wrapper', 'pre', false, container )
		
			toggle.setAttribute( 'class', 'toggle' );
			toggle.onclick = () => {
				wrapper.style.display = ( 'none' === wrapper.style.display ) ? 'block' : 'none';
			};

			wrapper.style.display = 'none';
			wrapper.setAttribute( 'class', 'codeContainer' );
		});
	}

	addElement(name,type='div',text=false,parent=document.body) {
		let element = document.createElement( type );
		element.setAttribute( 'id', name );
		if ( text ) {
			element.appendChild( document.createTextNode( text ) );
		}
		parent.appendChild( element );
		return this.ui[ name ] = element;
	}
}

/*-----------------------------------------------------------------------*/

const hashText = ( txt ) => {
	return sha256(txt);

	/* note window.crypto.subtle.digest only works for https hosting >_< */
	const data = new TextEncoder.encode(txt);
	window.crypto.subtle.digest('SHA-256', data).then(
		hash => {
			console.log( JSON.stringify(hash));
			hash = String.fromCharCode.apply(String,hash);
			console.log('hash is ' +  hash );
		}
	).catch(err => { console.log(err) });
};

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
}
