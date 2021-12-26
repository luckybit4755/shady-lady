const SHADY_MANUAL = true;
window.addEventListener('load', () => new FaceMeshDemo() );

/* currently only supporting 1 face... */
class FaceMesher {
	static DEFAULT_SETTINGS = {
		pointCount: 468,
		confidenceThreshold: .10,
		xScale:  +.0022,
		xOffset: -.7105,
		yScale:  +.0021,
		yOffset: +.4931,
	};

	constructor( shadyLady, settings = FaceMesher.DEFAULT_SETTINGS ) {
		this.shadyLady = shadyLady;
		this.settings = settings;

		const arraySize = 3 * settings.pointCount;
		this.data = new Float32Array( arraySize );
		this.video = null;
		this.model = null;
		this.last = 0;

		shadyLady.logger.info( 'loading the facemesh model' );
		const x = faceLandmarksDetection.SupportedPackages.mediapipeFacemesh;
		faceLandmarksDetection.load( x ).then( ( model ) => {
			shadyLady.logger.info( 'loaded the facemesh model' );
			this.onModel( model ) 
		});

		shadyLady.config.draw = ( shadyLady ) => {
			const webcam = shadyLady.context.textures.get( 'webcam' );
			if ( webcam ) {
				shadyLady.config.draw = () => null; // just once...

				shadyLady.logger.info( 'connect the webcam to the facemesher' );
				this.onVideo( webcam.element );

				shadyLady.config.uniforms.facemesh = ( shadyLady, uniform ) => {
					shadyLady.context.gl.uniform3fv( 
						uniform, 
						this.data,
						this.settings.pointCount
					);
				};
			}
		}
	}

	onModel( model ) {
		this.model = model;
		this.readyCheck();
	}

	onVideo( video ) {
		this.video = video;
		this.readyCheck();
	}

	readyCheck() {
		if ( this.model && this.video ) {
			this.shadyLady.logger.info( 'facemesher has both the model and video' );
			this.predict();
		}
	}

	predict() {
		this.model.estimateFaces({input:this.video})
		.then( ( predictions ) => this.onPredictions( predictions ) );
		setTimeout( () => { window.requestAnimationFrame( () => this.predict() ) }, 1000 / 33 );
	}

	onPredictions( predictions ) {
		let justOne = false;
		predictions.forEach( prediction => {
			if ( justOne ) return;
			if ( prediction.faceInViewConfidence >= this.settings.confidenceThreshold ) {
				this.updateMesh( prediction.scaledMesh );
				justOne = true;
			}
		});
	}

	updateMesh( mesh ) {
		const xScale  = this.settings.xScale;
		const xOffset = this.settings.xOffset;
		const yScale  = this.settings.yScale;
		const yOffset = this.settings.yOffset;

		let index = 0;

		mesh.forEach( point => {
			this.data[ index++ ] = xOffset + xScale * point[ 0 ];
			this.data[ index++ ] = 1. - ( yOffset + yScale * point[ 1 ] );
			this.data[ index++ ] = point[ 2 ];
		});
	}
}

class FaceMeshDemo {
	constructor() {
		const shadyLadyConfig = {
			uniforms: { facemesh: ( shadyLady, uniform ) => null },
			textures: { webcam: 'webcam' },
			draw: ( shadyLady ) => false
		};

		const shadyLady = new ShadyLady( shadyLadyConfig );
		const faceMesher = new FaceMesher( shadyLady );
	}
}
