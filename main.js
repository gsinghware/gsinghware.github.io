var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var renderer, scene, camera, controls;
var objects = [];
var projector = new THREE.Projector();
var isMove = true;
var cubeMesh;
var floor;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();
addFloor();

function init () {

	var width = window.innerWidth;								// width of the window
	var height = window.innerHeight;							// height of the window

	renderer = new THREE.WebGLRenderer({ antialias: true });	// WebGl render's options is set to antialias (smooth edges)
	renderer.setSize(width, height);							// set render's size to the window size
	
	// add the render's canvas to the document
	
	/*
		document.body is the element that contains the content for 
		the document. In documents with <body> contents, returns the 
		<body> element, and in frameset documents, this returns the o
		utermost <frameset> element.
	*/

	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene;									// define a scene
	scene.fog = new THREE.FogExp2( 0xffffff, 0.0000 );			// no fog yet	

	addFloor();

	var axes = new THREE.AxisHelper(200);
	scene.add(axes);

	var cereal = new THREE.Geometry();
	
	var cubeGeometry = new THREE.CubeGeometry(7.625*2,11*2,2.75*2);	// cubegeometry width, height and depth is 100
	var cube = new THREE.Mesh(cubeGeometry);
	cube.position.set(0,37,0);
	THREE.GeometryUtils.merge(cereal, cube );

	var cereal_images = ['images/cereal_left.jpg', 'images/cereal_right.jpg', 'images/cereal_top.jpg', 
						 'images/cereal_bottom.jpg', 'images/cereal_front.jpg', 'images/cereal_back.jpg'];
	var materials = [];
	for (var a = 0; a < 6; a++) {
		materials[a] = new THREE.MeshPhongMaterial( {map: loadAndRender(cereal_images[a])} );
	}

	cubeMesh = new THREE.Mesh(cereal, new THREE.MeshFaceMaterial(materials));
	cubeMesh.castShadow = true;
	cubeMesh.receiveShadow = true;

	objects.push(cubeMesh);
	scene.add(cubeMesh);

	var pointLight = new THREE.PointLight("white");
	pointLight.position.set(0, 0, 0);
	scene.add(pointLight);

	document.addEventListener( 'mousedown', aonDocumentMouseDown, false);
	
	var flag = false;

	cubeMesh.callback = function() { 
		console.log( "this.name" );
		if (cubeMesh.position.x == 0 && cubeMesh.position.y == 0 && cubeMesh.position.z == 0) {
    		cubeMesh.position.x = camera.position.x;
		    cubeMesh.position.y = 53;
		    cubeMesh.position.z = 190;
		    scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0015 );
		    pointLight.position.set(camera.position.x, 40, 250);
		    isMove = false;
		    	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'touchstart', onDocumentTouchStart, false );
				document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    	} /*else if (cubeMesh.position.x == camera.position.x && cubeMesh.position.y == 53 && cubeMesh.position.z == 180) {
			cubeMesh.position.x = 0;
	        cubeMesh.position.z = 0;
	        cubeMesh.position.y = 0;
	        scene.fog = new THREE.FogExp2( 0xffffff, 0.0000 );
	        pointLight.position.set(0, 0, 0);
	        isMove = true;
		} */
	}

	var cereals = new THREE.Geometry();

	for (var i = 1; i < 3; i++) {
		cube.position.set(0,37,-i*7);
		THREE.GeometryUtils.merge(cereals, cube );
	}

	var cubeMeshs = new THREE.Mesh(cereals, new THREE.MeshFaceMaterial(materials));
	cubeMeshs.castShadow = true;
	cubeMeshs.receiveShadow = true;

	cubeMeshs.callback = function () {
			cubeMesh.position.x = 0;
	        cubeMesh.position.z = 0;
	        cubeMesh.position.y = 0;
	        scene.fog = new THREE.FogExp2( 0xffffff, 0.0000 );
	        pointLight.position.set(0, 0, 0);
	}

	objects.push(cubeMeshs);
	scene.add(cubeMeshs);

	// "To render something, first we need to add the camera to the scene,
	// so the renderer knows from which point of view it should render stuff."
	// Args: (field of view, aspect ratio, near, far)
	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

	// objects created in Three.js have their position set in the 
	// middle of the scene (x: 0, y: 0, z: 0) by default.
	// we have to move the camera back and up a little.
	camera.position.set(120,90,230);
	camera.rotation.set(0,0,0);

	// Controls
	//controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	// add the camera to the scene and render the scene using this camera. 
	scene.add(camera);
	
	// camera looks at the cube
	camera.lookAt(camera.position);
	
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	
	// The bigger cube around the smaller cube
	var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
	var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.BackSide });
	var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
	scene.add(skybox);
	
	// lighting for the scene
    var pointLight = new THREE.PointLight("white");
	pointLight.position.set(0, 300, 200);
	scene.add(pointLight);

	pointLight = new THREE.PointLight("white");
	pointLight.position.set(0, -300, -200);
	scene.add(pointLight);

	pointLight = new THREE.PointLight("white");
	pointLight.position.set(200, 300, 0);
	scene.add(pointLight);

	pointLight = new THREE.PointLight("white");
	pointLight.position.set(200, -300, 0);
	scene.add(pointLight);
	
	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load('1865_Bookcase.dae', function ( collada ) {
		var dae = collada.scene;
	    var skin = collada.skins[0];
		dae.position.set(-10,90,85);	//x,z,y- if you think in blender dimensions ;)
		dae.scale.set(70,70,70);
		scene.add(dae);
	});

	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;

	loader.load('1865_Bookcase.dae', function ( collada ) {
		var dae = collada.scene;
	    var skin = collada.skins[0];
		dae.position.set(140,90,85);	//x,z,y- if you think in blender dimensions ;)
		dae.scale.set(70,70,70);
		scene.add(dae);
	});

	var texture = THREE.ImageUtils.loadTexture('redbullnutritionfactlabel.png');
    var patchMaterial = new THREE.MeshLambertMaterial({map: texture });
    var cylinder = new THREE.Mesh(new THREE.CylinderGeometry( 3, 3, 15, 80, 80, true ), patchMaterial );
    cylinder.position.set(30,50,0);
    cylinder.rotation.y = 90;
    cylinder.overdraw = true;
    
    var redBull = new THREE.CylinderGeometry( 3, 3, 15, 80, 80, true );

	for (var i = 1; i < 5; i++) {
		for (var j = 1; j < 5; j++) {
			cylinder.position.set(i*7+20,35,-j*4);
			THREE.GeometryUtils.merge(redBull, cylinder );
		}
	}

	var cylinderMesh = new THREE.Mesh(redBull, patchMaterial);
	cylinderMesh.castShadow = true;
	cylinderMesh.receiveShadow = true;

	cylinderMesh.callback = function () {
		console.log("helo");
	}

	scene.add(cylinderMesh);
	renderer.render(scene, camera);

}

function addFloor () {
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/floor_tile.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 100, 100 );
	
	var floorMaterial = new THREE.MeshPhongMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
	floor = new THREE.Mesh(floorGeometry, floorMaterial);
	
	floor.position.y = -5.5;
	floor.rotation.x = Math.PI / 2;
	floor.receiveShadow = true;
	scene.add(floor);
}


// Renders the scene and updates the render as needed.
function animate() {
	var clock = new THREE.Clock();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	cubeMesh.rotation.y += ( targetRotation - cubeMesh.rotation.y ) * 0.05;
    //controls.update();
    cam_update();
}

function loadAndRender(filename) {
	return THREE.ImageUtils.loadTexture(filename, {}, renderer);
}

function cam_update () {
	if (isMove) {
		var delta = clock.getDelta(); // seconds.
		var moveDistance = 200 * delta; // 200 pixels per second
		var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

		// local transformations

		// move forwards/backwards/left/right
		if ( keyboard.pressed("W") )
			camera.translateZ( -moveDistance );
		if ( keyboard.pressed("S") )
			camera.translateZ(  moveDistance );
		if ( keyboard.pressed("Q") )
			camera.translateX( -moveDistance );
		if ( keyboard.pressed("E") )
			camera.translateX(  moveDistance );	
		
		var rotation_matrix = new THREE.Matrix4().identity();
		if ( keyboard.pressed("A") )
			camera.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
		if ( keyboard.pressed("D") )
			camera.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
		if ( keyboard.pressed("R") )
			camera.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
		if ( keyboard.pressed("F") )
			camera.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);

		if ( keyboard.pressed("Z") )
		{
			camera.position.set(0,100,0);
			camera.rotation.set(0,0,0);
		}
	}
}

function aonDocumentMouseDown( event ) {
    event.preventDefault();

    var vector = new THREE.Vector3( 
        ( event.clientX / window.innerWidth ) * 2 - 1, 
        - ( event.clientY / window.innerHeight ) * 2 + 1, 
        0.5 );

    projector.unprojectVector( vector, camera );

    var ray = new THREE.Raycaster(camera.position, vector.sub( camera.position ).normalize() );
    var intersects = ray.intersectObjects(objects);    

    if ( intersects.length > 0 ) {
        intersects[0].object.callback();
    }
}


function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	mouseXOnMouseDown = event.clientX - windowHalfX;
	targetRotationOnMouseDown = targetRotation;
}

function onDocumentMouseMove( event ) {
	mouseX = event.clientX - windowHalfX;
	targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
}

function onDocumentMouseUp( event ) {
	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentMouseOut( event ) {
	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentTouchStart( event ) {
	if ( event.touches.length === 1 ) {
		event.preventDefault();

		mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
		targetRotationOnMouseDown = targetRotation;
	}
}

function onDocumentTouchMove( event ) {
	if ( event.touches.length === 1 ) {
		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
	}
}
