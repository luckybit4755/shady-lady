window.addEventListener('load', ()=>{
	new ShadyLady();
});



class ShadyLady {
	static UI_KEYS = 'canvas fullscreen sourceWrapper fragmentWrapper';
	static CONTEXT_KEYS = 'gl vertexShader fragmentShader program uniforms';
	static CONTROL_KEYS = 'mouse frameCount startTime currentTime';
	static BODY = 'body';

	constructor() {
		this.load();
	};

	getDefaultConfig() {
	   return {
			width:640, 
			height:480,
			fps: 50,
			reload:false,
			uniforms: {
				iTime:  ( shadyLady ) => shadyLady.controls.currentTime,
				iMouse: ( shadyLady ) => shadyLady.controls.mouse,
				iResolution: ( shadyLady ) => [ shadyLady.config.width, shadyLady.config.height ]
			},
			vertex:SHADY_LADY_VERTEX_SHADER_SRC,
			style: SHADY_LADY_CSS,
		};
	}

	load() {
		const trimLastPathSection = ( url ) => url.replace( /\/[^\/]*$/, '/' );

		this.loca = document.location.toString();
		this.root = trimLastPathSection( this.loca );
		this.includeRoot = trimLastPathSection( trimLastPathSection( this.root.replace( /\/$/, '' ) ) ) + 'include/';

		let name = this.loca.substring( this.root.length ).replace(/^html/, '' ).replace(/\.html$/,'' );
		this.fragment = this.root + name + '.frag';

		this.info( 'root:' + this.root );
		this.info( 'name:' + name );
		this.info( 'frag:' + this.fragment );
		this.info( 'incl:' + this.includeRoot );

		// try to pull "SHADY" from the global scope...
		if( 'undefined' === typeof( SHADY ) ) {
			this.config = this.getDefaultConfig();
		} else {
			this.config = SHADY;
			const def = this.getDefaultConfig();
			Object.keys( def ).forEach( k=>{ 
				if( k in this.config ) {
					const current = this.config[ k ];
					const previous = def[ k ];
					if ( Array.isArray( current ) ) {
						this.config[ k ] = [...previous,...current];
					} else {
						if ( 'object' === typeof( current ) ) {
							this.config[ k ] = {...previous,...current};
						} else {
							// keep new scalar value
						}
					}
				} else {
					this.config[ k ] = def[ k ];
				}
			});
		}

		if ( 'fragment' in this.config ) {
			this.fragment = this.config.fragment;

			// otherwise, should be a filename... I guess...
			if ( ShadyLadyUtil.isFunction( this.fragment ) ) {
				this.info( 'fragment contents are procedural, rather than file based' );
				this.body = this.fragment( this );
				this.fragment = ShadyLady.BODY;
			} else {
				this.info( 'fragment filename is ' + this.fragment );
			}
		}

		this.files = {};
		this.ui = ShadyLadyUtil.nullObject( ShadyLady.UI_KEYS );
		this.context = ShadyLadyUtil.nullObject( ShadyLady.CONTEXT_KEYS );
		this.controls = ShadyLadyUtil.nullObject( ShadyLady.CONTROL_KEYS );

		this.addFile( this.fragment );

		if ( this.config.canvas ) { 
			if ( ShadyLadyUtil.isFunction( this.config.canvas ) ) {
				this.ui.canvas = this.config.canvas( this );
			} else {
				this.ui.canvas = this.config.canvas;
			}
			this.debug( 'using user supplied canvas: ' + this.ui.canvas );
		} else {
			this.createUi();
			this.debug( 'creating default ui' );
		}

		this.loadFiles();
	}

	addFile( file ) {
		if ( file in this.files) {
			this.debug( `already tracking ${file}` );
		} else {
			this.info( `add file ${file} to the list` );
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
			this.info( `toLoad: ${toLoad}` );
			this.loadFile( toLoad );
		} else {
			this.info( 'all loaded' );
			this.handleIncludes();
		}
	}

	loadFile( file ) {
		let thiz = this;

		if ( ShadyLady.BODY === file ) {
			return thiz.parseFile( file, this.body );
		}

		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if ( this.readyState == 4 ) {
				if ( this.status == 200) {
					thiz.parseFile( file, this.responseText );
				} else {
					console.error( 'loading ' + file + ' -> ' + this.status );
				}
			}
		};

		this.debug( 'GET: ' + file );
		xhttp.open('GET', file + '?' + new Date().getTime(), true );
		try {
			xhttp.send();
		} catch( e ) {
			console.error( 'ERROR: when loading', file, e );
		}
	}

	parseFile( file, src ) {
		let entry = this.files[ file ];
		entry.loaded = true;
		entry.src = src;
		entry.hash = ShadyLadyUtil.hashText( src );

		let lines = src.split('\n');
		lines.forEach(line=>{
			if ( /^#include/.test(line)) {
				let name = line.trim().replace(/.*\s/,'');
				let include = this.resolveIncludePath( file, name );
				this.addFile( include );
				entry.includes[ include ] = 1
				entry.resolutions[ name ] = include;
			}
		});

		if ( !Object.keys( entry.includes ).length ) {
			entry.resolved = src;
		}

		this.loadFiles();
	};

	resolveIncludePath( file, include ) {
		let path = null;
		if( '/' === include[ 0 ] || 0 != file.indexOf( this.includeRoot ) ) {
			path = this.includeRoot + include;
		} else {
			path = file.replace( new RegExp( '/[^/]+$' ), '/' + include );
		}
		this.debug( `resolveIncludePath: "${file}" + "${include}" -> "${path}"` );
		return path;
	}

	handleIncludes() {
		for ( let i = 0 ; i < 33 ; i++ ) {
			let resolved = 0;
			Object.keys( this.files ).forEach( file => resolved = this.resolveInclude( file, resolved ) );
			if ( 0 == resolved ) break;
		}
		this.fragmentSource = this.files[this.fragment].resolved;
		this.throwShade();
	};

	resolveInclude( file, resolved ) {
		let entry = this.files[ file ];
		let includes = Object.keys( entry.includes );
		if ( !includes.length ) {
			return;
		}

		this.debug( file + ' needs to have ' + includes.join( ', ' ) );

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

		return resolved;
	}

	addCode( src, element ) {
		this.debug( 'addCode' + element );
		src.trim().split( '\n' ).forEach( line => {
			let code = document.createElement( 'code' );
			code.appendChild( document.createTextNode( line ) );
			element.appendChild( code );
			element.appendChild( document.createTextNode( '\n' ) );
		});
	}

	throwShade() {
		this.gloItUp();

		this.controls.mouse = [.0,.0,-1.,.0];
		this.mouseHandler( this.ui.canvas, this.controls.mouse );

		this.controls.frameCount = 0;
		this.controls.startTime = ShadyLadyUtil.now();

		if ( this.ui.fullscreen ) {
			this.ui.fullscreen.onclick = () => {
				canvas.requestFullscreen();
			};
		}

		const timeout = 1000 / this.config.fps;
		const redraw = () => { window.requestAnimationFrame( draw ) };
		const draw = () => {
			this.draw();
			setTimeout( redraw, timeout );
		};

		draw();
	}

	gloItUp() {
		/* -------------------------------------------------------------- */

		const canvas = this.ui.canvas;
		const gl = canvas.getContext( 'webgl2' );

		/* -------------------------------------------------------------- */

		if( this.ui.sourceWrapper ) {
			this.addCode( this.files[this.fragment].src, this.ui.sourceWrapper );
			this.addCode( this.fragmentSource, this.ui.fragmentWrapper );
		}

		/* -------------------------------------------------------------- */

		const vertex_shader = this.compileShader( gl, this.config.vertex, gl.VERTEX_SHADER );
		const fragment_shader = this.compileShader( gl, this.fragmentSource, gl.FRAGMENT_SHADER );
		const program = this.createProgram( gl, vertex_shader, fragment_shader );

		const vertex_buf = gl.createBuffer( gl.ARRAY_BUFFER );
		gl.bindBuffer( gl.ARRAY_BUFFER, vertex_buf );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW );
		  
		const position_attrib_location = gl.getAttribLocation( program, "position");
		gl.enableVertexAttribArray( position_attrib_location );
		gl.vertexAttribPointer( position_attrib_location, 2, gl.FLOAT, false, 0, 0);

		this.context.gl = gl;
		this.context.vertexShader = vertex_shader;
		this.context.fragmentShader = fragment_shader;
		this.context.program = program;

		// TODO: looking into "uniform blocks"
		// http://www.lighthouse3d.com/tutorials/glsl-tutorial/uniform-blocks/

		const uniforms = new Map();
		Object.keys( this.config.uniforms ).forEach( name => {
			const location = gl.getUniformLocation( program, name  );
			if ( location ) {
				uniforms.set( name , location );
				this.debug( `uniform "${name }" -> ${uniforms.get(name )}` );
			} else {
				this.debug( `uniform "${name }" not found, perhaps unused` );
			}
		});

		this.context.uniforms = uniforms;
	}

	compileShader( gl, src, type = null ) {
		const t = type == gl.VERTEX_SHADER ? 'vertex' : 'fragment';
		this.info( `${t} shader compilation begins` );
		let shader = gl.createShader( type || gl.VERTEX_SHADER );
		gl.shaderSource( shader, src );

		gl.compileShader( shader );
		let compilerMessage = gl.getShaderInfoLog( shader );
		if ( compilerMessage ) {
			this.debug( 'compiler info start:' );
			this.debug( compilerMessage );
			this.debug( 'compiler info end.' );
			this.ui.errorContainer.innerHTML = compilerMessage;
			canvas.style.display = 'none';

			if ( /ERROR:/.test( compilerMessage ) ) {
				throw compilerMessage;
			}
			this.warn( 'compilation issue' );
		}
		this.info( `${t} shader compilation end` );
		return shader;
	}

	createProgram( gl, vertex_shader, fragment_shader ) {
		const program = gl.createProgram();
		gl.attachShader( program, vertex_shader );
		gl.attachShader( program, fragment_shader );
		gl.linkProgram( program );
		gl.useProgram( program );
		return program;
	}

	draw() {
		this.controls.currentTime = ShadyLadyUtil.now();
		this.controls.frameCount++;

		if( this.config.draw && this.config.draw( this ) ) {
			return;
		}

		this.updateUniforms();

		const gl = this.context.gl;
		gl.drawArrays( gl.TRIANGLES, 0,  3 );
	}

	updateUniforms() {
		const gl = this.context.gl;
		for( const [name,uniform] of this.context.uniforms.entries() ) {
			const value = this.config.uniforms[ name ]( this );
			switch ( value.length ) {
				case 1:  gl.uniform1fv( uniform, value ); break;
				case 2:  gl.uniform2fv( uniform, value ); break;
				case 3:  gl.uniform3fv( uniform, value ); break;
				case 4:  gl.uniform4fv( uniform, value ); break;
				default: gl.uniform1f( uniform, value );
			}
		}
	}

	mouseHandler( canvas, mouse ) {
		let w = this.config.width;
		let h = this.config.height;

		let w2 = w * 0.5;
		let h2 = h * 0.5;

		canvas.addEventListener("contextmenu", (event) => event.preventDefault());

		canvas.onmousedown = ( e ) => {
			mouse[ 2 ] = e.buttons;
		};

		canvas.onmousemove = ( e ) => {
			let co = ShadyLadyUtil.cumulativeOffset(canvas);
			let x = e.clientX - co.left;
			let y = e.clientY - co.top;
			x = ( x - w2 ) / w2;
			y = ( y - h2 ) / h2;
			mouse[ 0 ] = x;
			mouse[ 1 ] = -y;
		};
		canvas.onmouseup = ( e ) => {
			mouse[ 2 ] = -1.;
		};

		canvas.onblur = ( e ) => {
			mouse.fill(.0);
			mouse[2]=-1.;
		};

	}

	createUi() {
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

	// TODO: maybe worth while to factor out logging...
	static DEBUG = 'DEBUG';
	static INFO = 'INFO';
	static WARN = 'WARN';
	static ERROR = 'ERROR';

	pad( n, length = 2, padding = '0' ) {
	   return String( n ).padStart( length, padding );
	}

	debug(message) {
		this.log(ShadyLady.DEBUG,message);
	}
	info(message) {
		this.log(ShadyLady.INFO,message);
	}
	warn(message) {
		this.log(ShadyLady.WARN,message);
	}
	error(message) {
		this.log(ShadyLady.ERROR,message);
	}
	log(level,message) {
		const d = new Date();
		const ts = [
			[d.getYear()+1900, d.getMonth(), d.getDay() ].map(n=>this.pad(n)).join( '-' ),
			[d.getHours(),d.getMinutes(),d.getSeconds(),this.pad(d.getMilliseconds(),4)].map(n=>this.pad(n)).join( ':' )
		].join( '_' );

		const msg = [ ts, level.padEnd( 5, ' ' ), ':', message ].join( ' ' );

		if ( level === ShadyLady.ERROR ) {
			console.error( msg );
		} else {
			console.log( msg );
		}
	}
}

/*-----------------------------------------------------------------------*/

class ShadyLadyUtil {
	static nullObject( keys, delimiter = ' ' ) {
		const obj = {};
		keys.split( delimiter ).forEach( key => obj[ key ] = null );
		return obj;
	}

	static fromHtmlElement( element = document.body, clear = true ) {
		const body = ShadyLadyUtil.htmlDecode( element.innerHTML );
		if ( clear ) {
			element.innerHTML = '';
		}
		return body;
	}

	/* from https://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript */
	static htmlDecode(input){
		const e = document.createElement('textarea');
		e.innerHTML = input;
		// handle case of empty input
		return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue.trim();
	}

	static byId( id ) {
		return document.getElementById( id );
	}
	static byTag( tag ) {
		return document.getElementsByTagName( tag );
	}
	static firstTag( tag ) {
		return ShadyLadyUtil.byTag( tag )[ 0 ];
	}
	static firstCanvas() {
		return ShadyLadyUtil.byTag( 'canvas' )[ 0 ];
	}

	static cumulativeOffset( element ) {
		var top = 0, left = 0;
		do {
			top += element.offsetTop  || 0;
			left += element.offsetLeft || 0;
			element = element.offsetParent;
		} while(element);

		return { top: top, left: left };
	}

	static now() {
		return new Date().getTime() / 1000.;
	}

	static isFunction( f ) {
		return 'function' === typeof( f );
	}

	static hashText = ( txt ) => {
		return ShadyLadyUtil.sha256(txt);

		/* note window.crypto.subtle.digest only works for https hosting >_< */
		const data = new TextEncoder.encode(txt);
		window.crypto.subtle.digest('SHA-256', data).then(
			hash => {
				console.log( JSON.stringify(hash));
				hash = String.fromCharCode.apply(String,hash);
				console.log('hash is ' +  hash );
			}
		).catch(err => { console.log(err) });
	}

	/* from https://geraintluff.github.io/sha256/ */
	static sha256 = (ascii) => {
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
		var hash = ShadyLadyUtil.sha256.h = ShadyLadyUtil.sha256.h || [];
		// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
		var k = ShadyLadyUtil.sha256.k = ShadyLadyUtil.sha256.k || [];
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
	}
}

/* almost unspeakably boring... */

const SHADY_LADY_VERTEX_SHADER_SRC = `#version 300 es
	layout (location=0) in vec4 position;

	void main() {
		gl_Position = position;
	}
`;

const SHADY_LADY_CSS = `
	* { 
		background:#223; 
		color:#aa9; 
		tab-size: 4; 
	} 

	#errorContainer { 
		color:#f45; 
		font-size:xx-large; 
	}

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
`;

/* EOF */
