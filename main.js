init();
animate();

var renderer, scene, camera, controls;

function init () {
	
	// width and height of the window
	var width = window.innerWidth;
	var height = window.innerHeight;

	// WebGl render's options is set to antialias (smooth edges)
	renderer = new THREE.WebGLRenderer({ antialias: true });

	// set render's size to the window size
	renderer.setSize(width, height);

	// add the render's canvas to the document
	/*
		document.body is the element that contains the content for 
		the document. In documents with <body> contents, returns the 
		<body> element, and in frameset documents, this returns the o
		utermost <frameset> element.
	*/
	document.body.appendChild(renderer.domElement);
	 
	// defines the scene
	scene = new THREE.Scene;

	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/floor_tile.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 100, 100 );
	var floorMaterial = new THREE.MeshPhongMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	
	floor.position.y = -5.5;
	floor.rotation.x = Math.PI / 2;
	floor.receiveShadow = true;
	scene.add(floor);

	var axes = new THREE.AxisHelper(200);
	scene.add(axes);

	// cubegeometry width, height and depth is 100
	var cubeGeometry = new THREE.CubeGeometry(7.625*2,11*2,2.75*2);

	// the material of the cube is Lambert because of the lighting use
	// later in this program, and the color of the cube is black.
	var cubeMaterial = new THREE.MeshLambertMaterial({ color: "red" });

	// In Three.js the objects that are being drawn on the screen 
	// are called meshes.
	var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	cube.position.set(0,37,0);
	scene.add(cube);
	/*
	var materialArray = [
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/cereal_right.jpg' ) } ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/cereal_top.jpg' ) } ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/cereal_front.jpg' ) } ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/cereal_back.jpg' ) } ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/cereal_bottom.jpg' ) } ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/cereal_left.jpg' ) } )
	];

	var DiceBlue = new THREE.Mesh(cube, new THREE.MeshFaceMaterial(materialArray));
	scene.add( DiceBlue );
	*/
	/*
	var materials = [
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_left.jpg') } ),
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_right.jpg') } ),
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_top.jpg') } ),
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_bottom.jpg') } ),
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_front.jpg') } ),
	    new THREE.MeshPhongMaterial( { map: loadAndRender('images/cereal_back.jpg') } ) 
	];

	var cubeMesh = new THREE.Mesh(cube, new THREE.MeshFaceMaterial(materials));
	cubeMesh.castShadow = true;
	cubeMesh.receiveShadow = true;
	scene.add(cubeMesh);
*/

	// "To render something, first we need to add the camera to the scene,
	// so the renderer knows from which point of view it should render stuff."
	// Args: (field of view, aspect ratio, near, far)
	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

	// objects created in Three.js have their position set in the 
	// middle of the scene (x: 0, y: 0, z: 0) by default.
	// we have to move the camera back and up a little.
	camera.position.y = 70;
	camera.position.z = 400;

	// Controls
	controls = new THREE.OrbitControls(camera, renderer.domElement);

	// add the camera to the scene and render the scene using this camera. 
	scene.add(camera);
	
	// camera looks at the cube
	camera.lookAt(cube.position);
	
	var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
	var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
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
	loader.load( '1865_Bookcase.dae', function ( collada ) {
		var dae = collada.scene;
	    var skin = collada.skins[0];
		dae.position.set(-10,90,85);	//x,z,y- if you think in blender dimensions ;)
		dae.scale.set(70,70,70);
		scene.add(dae);
	});

	renderer.render(scene, camera);
}

// Renders the scene and updates the render as needed.
function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
    controls.update();
}

