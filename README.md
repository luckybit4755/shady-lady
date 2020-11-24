# shaders

This repository is a place to keep my 

## [Book of Shades](https://thebookofshaders.com/)

Locally, working with https://github.com/patriciogonzalezvivo/glslViewer

For demo / testing: [bos.html](glsl/fragment/bos/bos.html)

## shadertoy 

Had a lot of fun on https://www.shadertoy.com/ and wanted to try to do some stuff locally.

The goal was to have minimal html and javascript boilerplate:

	<HTML>
		<HEAD>
			<script type="text/javascript" src="../js/throw-shade.js"></script>
		</HEAD>
		<BODY></BODY>
	</HTML>

This is the contents of a simple-spheres.html, based on which, it picks up the shader 
../glsl/fragment/simple-spheres.frag 

There is some slight translation to make the shaderToy shader work, and it probly isn't really enough 
except for cautious use.

So far there is support for iResolution, iTime and (partially) iMouse via uniforms

Demo: https://luckybit4755.github.io/shady-lady/html/simple-spheres.html

Somewhat related:

* https://github.com/SebastienGravel/ShaderToyTouchdesigner
* https://nvoid.gitbooks.io/introduction-to-touchdesigner/content/GLSL/12-6-Importing-Shadertoy.html

Unrelated:

![](https://www.398th.org/Images/Images_Aircraft_B-17/Images/42-97385_3O-X_SHADY_LADY.jpg)
