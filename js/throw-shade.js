const FPS = 50;

const UNIFORM_PREAMBLE = `
/////////////////////////////////////////////////////////////////////////////
precision highp float;

uniform vec2 iResolution;
uniform vec4 iMouse;
uniform float iTime;
/////////////////////////////////////////////////////////////////////////////
`;

window.onload = () => {
	let name = document.location.toString().replace( /.*\//, '' ).replace( /\.[^.]+$/, '' );
	let fragged = '../glsl/fragment/' + name + '.frag';

	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if ( this.readyState == 4 && this.status == 200) {
			let src = this.responseText
				.replace( /fragColor/g, 'gl_FragColor' )
				.replace( /fragCoord/g, 'gl_FragCoord' )
				.replace( /void mainImage.*{.*/, 'void main( void ) {' )
				.replace( /void mainImage.*/, 'void main( void )' )
			;
			let fragment = UNIFORM_PREAMBLE + '\n' + src;

			let x2 = new XMLHttpRequest();
			x2.onreadystatechange = function() {
				if ( this.readyState == 4 && this.status == 200) {
					throwShade( fragment, this.responseText );
				}
			}
			x2.open('GET', '../glsl/vertex/basic.vert', true );
			x2.send();

		}
	};
	xhttp.open('GET', fragged, true );
	xhttp.send();
};

const throwShade = ( fragment, vertex ) => {
	let canvas = document.createElement( 'canvas' );
	canvas.setAttribute( 'width', 512 );
	canvas.setAttribute( 'height', 512 );
	document.body.appendChild( canvas );

	let textarea = document.createElement( 'textarea' );
	textarea.setAttribute( 'rows', 33 );
	textarea.setAttribute( 'cols', 99 );
	textarea.innerHTML = fragment;
	document.body.appendChild( textarea );

	let button = document.createElement( 'button' );
	button.innerHTML = 'button!';
	document.body.appendChild( button );

	let gl = canvas.getContext( 'webgl' );
	let program = false;
	let uz = false;

	button.onclick = () => {
		let vertex_shader = gl.createShader( gl.VERTEX_SHADER );

		gl.shaderSource( vertex_shader, vertex );
		gl.compileShader( vertex_shader );
		console.log( gl.getShaderInfoLog( vertex_shader ));  

		let fragment_shader = gl.createShader( gl.FRAGMENT_SHADER );
		gl.shaderSource( fragment_shader, textarea.value );
		gl.compileShader( fragment_shader );
		console.log( gl.getShaderInfoLog( fragment_shader ));  

		let program = gl.createProgram();
		gl.attachShader( program, vertex_shader );
		gl.attachShader( program, fragment_shader );
		gl.linkProgram( program );
		gl.useProgram( program );

		let vertex_buf = gl.createBuffer( gl.ARRAY_BUFFER );
		gl.bindBuffer( gl.ARRAY_BUFFER, vertex_buf );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW );

		  
		let position_attrib_location = gl.getAttribLocation( program, "aPosition");
		gl.enableVertexAttribArray( position_attrib_location );
		gl.vertexAttribPointer( position_attrib_location, 2, gl.FLOAT, false, 0, 0);

		uz = {};
		'iResolution iMouse iTime'.split( ' ' ).forEach( v=>{
			uz[ v ] = gl.getUniformLocation( program, v );
			console.log( v, '->', uz[ v ] );
		});
	};
	button.click();

	let iMouse = [0.0,0.0,0.0,0.0];

	let iTime = 0.0;

	let draw = function() {
		iTime += 0.04;
		gl.uniform1f( uz.iTime, iTime );
		gl.uniform2f( uz.iResolution, 512, 512 );
		gl.uniform4f( uz.iMouse, iMouse[ 0 ], iMouse[ 1 ], iMouse[ 2 ], iMouse[ 3 ] );
		gl.drawArrays( gl.TRIANGLES, 0,  3 );
		setTimeout(
			() => { window.requestAnimationFrame( draw ) }
			, 1000 / FPS
		);
	};

	let down = false;
	canvas.onmousedown = function( e ) {
		down = true;
	};
	canvas.onmousemove = function( e ) {
		if ( down ) {
			iMouse[ 0 ] = e.clientX;
			iMouse[ 1 ] = e.clientY;
			iMouse[ 2 ] = 33.44;
			iMouse[ 3 ] = 44.33;
		}
	};
	canvas.onmouseup = function( e ) {
		down = false();
	};

	draw();
};
