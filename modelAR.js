/**
* VisageAR
* <br/><br/>
* @constructor
*/
function VisageAR() {

	var v_width;
	var v_height;
	var v_renderer;
	var v_scene, v_backgroundScene, v_maskScene, v_candideScene;
	var v_camera, v_backgroundCamera, v_maskCamera, v_candideCamera;
	var v_time;

	var V_ppixels;
	var v_pixels;
	
	var v_video;
	var v_videoCanvas;
	var v_videoContext;
	var v_videoTexture;
	var v_frameCanvas ;
	var v_frameContext ;

	var v_nose0;
	var v_nose1;

	//var v_mask, v_candideMask;
	
	var v_z_offset;
	var v_z_increment;
	var v_scale_factor;
	var v_scale_increment;

	this.v_tracker_pom = 0;
	var v_tracker;
	var v_faceData;
	var v_trackingStatus;
	var v_tracking = false;

	/** 
	*	Initializes Visage AR and sets up rendering and tracking. The video resolution is used for the canvas resolution.
	*	@param {element}container - The HTML element in which to put the rendering canvas.
	*	@param {element}video - The HTML video element required for camera access.
	*/
	this.initialize = function(container, video) {

		console.log("On initialize");

		// get canvas size
		v_width = video.width;
		v_height = video.height;
		
		v_ppixels = Module._malloc(v_width*v_height*4);
		v_pixels = new Uint8Array(Module.HEAPU8.buffer, v_ppixels, v_width*v_height*4);

		// create webcam canvas
		v_video = video;
		v_videoCanvas = document.createElement('canvas');
		v_videoCanvas.width = v_width;
		v_videoCanvas.height = v_height;
		v_videoContext = v_videoCanvas.getContext('2d');
		v_videoCanvas.setAttribute('style', 'display: none');
		
		v_frameCanvas = document.createElement('canvas');
		v_frameCanvas.width = v_width;
		v_frameCanvas.height = v_height;
		v_frameContext = v_frameCanvas.getContext('2d');
		v_frameCanvas.setAttribute('style', 'display: none; z-index: 1');
		v_videoTexture = new THREE.Texture(v_frameCanvas);

		//Module.initializeLicenseManager("226-424-596-618-836-796-313-074-283-413-370.vlc");
		// init tracker
		this.v_tracker_pom = new Module.VisageTracker("../../lib/Head Tracker.cfg");
		//initialize licensing
		//example how to initialize license key
		v_faceData = new Module.FaceData();
		v_tracker = this.v_tracker_pom;
	

		// RENDERER

		// setup renderer
		v_renderer = new THREE.WebGLRenderer({antialias: true});
		v_renderer.setClearColor(0x0055FF, 1);
		v_renderer.autoClearDepth = false;
		v_renderer.autoClear = false;
		v_renderer.autoClearColor = false;
		v_renderer.setSize(v_width, v_height);
		v_renderer.sortObject = false;
		container.appendChild(v_renderer.domElement);

		// setup scenes
		v_scene = new THREE.Scene();
		v_backgroundScene = new THREE.Scene();
		//v_maskScene = new THREE.Scene();
		//v_candideScene = new THREE.Scene();
		v_time = new THREE.Clock(true);

		// CAMERA
		// setup video plane camera
		v_backgroundCamera = new THREE.OrthographicCamera(-v_width/2, v_width/2, v_height/2, -v_height/2, 0.1, 1000);
		v_backgroundCamera.lookAt(new THREE.Vector3(0, 0, -1));
		v_backgroundScene.add(v_backgroundCamera);

		// setup video plane
		var plane = new THREE.Mesh(new THREE.PlaneGeometry(v_width, v_height, 1, 1), new THREE.MeshBasicMaterial({color: 0xFFFFFF, map: v_videoTexture}));
		plane.position.set(0, 0, -500);
		v_backgroundScene.add(plane);

		// setup glasses camera
		v_camera = new THREE.PerspectiveCamera(36.869, v_width/v_height, 0.1, 1000);
		v_camera.lookAt(new THREE.Vector3(0, 0, 1));
		v_scene.add(v_camera);

		// SETUP LIGHTING

		// setup ambient light
		var ambientLight = new THREE.AmbientLight(0x808080);
		v_scene.add(ambientLight);

		// setup point light
		var pointLight = new THREE.PointLight(0xA0A0A0);
		pointLight.position.set(0, 0, 0);
		v_scene.add(pointLight);

	}



	this.loadObject = function(_index, url) {

		var v_oldNose;

		if (_index == 0) {

			v_oldNose = v_nose0;

			v_nose0 = new THREE.Object3D();
		
			var noseLoader = new THREE.OBJMTLLoader();
			noseLoader.addEventListener('load', function(event) {
			
				var object = event.content;
			

				console.log("Object : " + object);

				v_nose0.children.length = 0;
				v_nose0.add(object);
			
				//Remove old glasses
				v_scene.remove(v_oldNose);

			});

			console.log("url : " + url);

			noseLoader.load(url + ".obj", url + ".mtl");
			v_nose0.position.set(0, 1, -5);
			v_scene.add(v_nose0);

		} else {


			v_oldNose = v_nose1;

			v_nose1 = new THREE.Object3D();
		
			var noseLoader = new THREE.OBJMTLLoader();
			noseLoader.addEventListener('load', function(event) {
			
				var object = event.content;
			

				console.log("Object : " + object);

				v_nose1.children.length = 0;
				v_nose1.add(object);
			
				//Remove old glasses
				v_scene.remove(v_oldNose);

			});

			console.log("url : " + url);

			noseLoader.load(url + ".obj", url + ".mtl");
			v_nose1.position.set(0, 1, -5);
			v_scene.add(v_nose1);

		}
	}

	/**
	*	Starts tracking the face and displaying (rendering) any 3D objects loaded using loadObject(). Object is 
	*   overlayed on the face.
	*/
	this.startTracking = function() {
		v_tracking = true;
	}

	/**
	*	Stops tracking.
	*/
	this.stopTracking = function() {
		v_tracking = false;
	}
	
	/*
	this.setIPD = function(ipd) {
		if (v_tracking = true && v_tracker)
		{
			  //convert to meters
			  v_tracker.setIPD(ipd/1000);
		}
	}
	*/

	/*
	*	Updates the tracker with a new video image.
	*/
	var updateTracker = function() {

		// fetch image data from canvas
		var dataBuffer = v_videoContext.getImageData(0, 0, v_width, v_height);
		var imageData = dataBuffer.data;
		
		// 
		v_pixels.set(imageData);
		
		v_frameContext.putImageData(dataBuffer,0 ,0);

		// update video texture
		if (v_video.readyState === v_video.HAVE_ENOUGH_DATA) {
			v_videoContext.drawImage(v_video, 0, 0, v_width, v_height);
			v_videoTexture.needsUpdate = true;
		}

		if (!v_tracking)
			return;
		
		// fetch image data from canvas
		var dataBuffer = v_videoContext.getImageData(0, 0, v_width, v_height);
		var imageData = dataBuffer.data;
		
		// 
		v_pixels.set(imageData);
		
		v_frameContext.putImageData(dataBuffer,0 ,0);
		// 
		
		/*
		v_trackingStatus = v_tracker.track(
			v_width, 
			v_height, 
			v_ppixels, 
			v_faceData,
			Module.VisageTrackerImageFormat.VISAGE_FRAMEGRABBER_FMT_RGBA.value,
			Module.VisageTrackerOrigin.VISAGE_FRAMEGRABBER_ORIGIN_TL.value, 
			0,
			-1
		);
		*/

	}

	/*
	*	Updates the glasses model position and the face mask position.
	*/
	this.updateNose = function(_index, _faceDataInstance) {

			//Need to check if tracking

			console.log("updateNose");

			if (_index==0 && _initNose0)
			{
				console.log("pos 0 " + _faceDataInstance.getFaceTranslation()[0] + "," + _faceDataInstance.getFaceTranslation()[1] + "," + _faceDataInstance.getFaceTranslation()[2]);
				console.log("rot 0 " + -_faceDataInstance.getFaceRotation()[0] + "," + (_faceDataInstance.getFaceRotation()[1] + 3.14) + "," + _faceDataInstance.getFaceRotation()[2]);

				v_nose0.position.set(_faceDataInstance.getFaceTranslation()[0],_faceDataInstance.getFaceTranslation()[1],_faceDataInstance.getFaceTranslation()[2]);
				v_nose0.rotation.set(-_faceDataInstance.getFaceRotation()[0],(_faceDataInstance.getFaceRotation()[1] + 3.14),_faceDataInstance.getFaceRotation()[2]);
			}

			if (_index==1 && _initNose1)
			{
				console.log("pos 1 " + _faceDataInstance.getFaceTranslation()[0] + "," + _faceDataInstance.getFaceTranslation()[1] + "," + _faceDataInstance.getFaceTranslation()[2]);
				console.log("rot 1 " + -_faceDataInstance.getFaceRotation()[0] + "," + (_faceDataInstance.getFaceRotation()[1] + 3.14) + "," + _faceDataInstance.getFaceRotation()[2]);

				v_nose1.position.set(_faceDataInstance.getFaceTranslation()[0],_faceDataInstance.getFaceTranslation()[1],_faceDataInstance.getFaceTranslation()[2]);
				v_nose1.rotation.set(-_faceDataInstance.getFaceRotation()[0],(_faceDataInstance.getFaceRotation()[1] + 3.14),_faceDataInstance.getFaceRotation()[2]);
			}
/*
		if (v_tracking && v_trackingStatus === Module.VisageTrackerStatus.TRACK_STAT_OK.value) 
		{

			if (_init)
			{
				v_glasses.position.set(-0.24342264235019684,0.10348179191350937,0.8930136561393738);
				v_glasses.rotation.set(-0.19645783305168152,2.8179272556304933,-0.22859904170036316);

				
				// move glasses
				//console.log("pos " + v_faceData.getFaceTranslation()[0] + "," + v_faceData.getFaceTranslation()[1] + "," + v_faceData.getFaceTranslation()[2]);
				//v_glasses.position.set(v_faceData.getFaceTranslation()[0], v_faceData.getFaceTranslation()[1], v_faceData.getFaceTranslation()[2]);
				//console.log("rot " + -v_faceData.getFaceRotation()[0] + "," + (v_faceData.getFaceRotation()[1] + 3.14) + "," + v_faceData.getFaceRotation()[2]);
				//v_glasses.rotation.set(-v_faceData.getFaceRotation()[0], v_faceData.getFaceRotation()[1] + 3.14, v_faceData.getFaceRotation()[2]);
				

			}
				
		} else {

			//v_mask.position.set(0, 0, -5);
			if (_init)
				v_glasses.position.set(0, 0, -5);
		}
*/

	}


	/*
	*	Renders the scene.
	*/
	var render = function() {

		v_renderer.clear(1, 1, 1);
		v_renderer.render(v_backgroundScene, v_backgroundCamera);
		v_renderer.clear(0, 1, 1);

		//v_renderer.render(v_maskScene, v_maskCamera);
		v_renderer.render(v_scene, v_camera);
	}

	/*
	*	Main loop.
	*/
	var loop = function() {

		//console.log("here");


		var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
								  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		requestAnimationFrame(loop);
		
			if (!v_video)
				return;

			updateTracker();
			//update();
			render();
	};

	loop();
}