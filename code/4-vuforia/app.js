/// <reference types="@argonjs/argon" />
/// <reference types="three" />
/// <reference types="dat-gui" />
/// <reference types="stats" />
// set up Argon
var app = Argon.init();
// set up THREE.  Create a scene, a perspective camera and an object
// for the user's location
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var userLocation = new THREE.Object3D();
scene.add(camera);
scene.add(userLocation);
// We use the standard WebGLRenderer when we only need WebGL-based content
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true
});
// account for the pixel density of the device
renderer.setPixelRatio(window.devicePixelRatio);
app.view.element.appendChild(renderer.domElement);
// to easily control stuff on the display
var hud = new THREE.CSS3DArgonHUD();
// We put some elements in the index.html, for convenience. 
// Here, we retrieve the description box and move it to the 
// the CSS3DArgonHUD hudElements[0].  We only put it in the left
// hud since we'll be hiding it in stereo
var description = document.getElementById('description');
hud.hudElements[0].appendChild(description);
app.view.element.appendChild(hud.domElement);
// let's show the rendering stats
var stats = new Stats();
hud.hudElements[0].appendChild(stats.dom);
// Tell argon what local coordinate system you want.  The default coordinate
// frame used by Argon is Cesium's FIXED frame, which is centered at the center
// of the earth and oriented with the earth's axes.  
// The FIXED frame is inconvenient for a number of reasons: the numbers used are
// large and cause issues with rendering, and the orientation of the user's "local
// view of the world" is different that the FIXED orientation (my perception of "up"
// does not correspond to one of the FIXED axes).  
// Therefore, Argon uses a local coordinate frame that sits on a plane tangent to 
// the earth near the user's current location.  This frame automatically changes if the
// user moves more than a few kilometers.
// The EUS frame cooresponds to the typical 3D computer graphics coordinate frame, so we use
// that here.  The other option Argon supports is localOriginEastNorthUp, which is
// more similar to what is used in the geospatial industry
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);
// create a bit of animated 3D text that says "argon.js" to display 
var uniforms = {
    amplitude: { type: "f", value: 0.0 }
};
var argonTextObject = new THREE.Object3D();
argonTextObject.position.z = -250;
userLocation.add(argonTextObject);
var loader = new THREE.FontLoader();
loader.load('../resources/fonts/helvetiker_bold.typeface.js', function (font) {
    var textGeometry = new THREE.TextGeometry("argon.js", {
        font: font,
        size: 40,
        height: 5,
        curveSegments: 3,
        bevelThickness: 2,
        bevelSize: 1,
        bevelEnabled: true
    });
    textGeometry.center();
    var tessellateModifier = new THREE.TessellateModifier(8);
    for (var i = 0; i < 6; i++) {
        tessellateModifier.modify(textGeometry);
    }
    var explodeModifier = new THREE.ExplodeModifier();
    explodeModifier.modify(textGeometry);
    var numFaces = textGeometry.faces.length;
    var bufferGeometry = new THREE.BufferGeometry().fromGeometry(textGeometry);
    var colors = new Float32Array(numFaces * 3 * 3);
    var displacement = new Float32Array(numFaces * 3 * 3);
    var color = new THREE.Color();
    for (var f = 0; f < numFaces; f++) {
        var index = 9 * f;
        var h = 0.07 + 0.1 * Math.random();
        var s = 0.5 + 0.5 * Math.random();
        var l = 0.6 + 0.4 * Math.random();
        color.setHSL(h, s, l);
        var d = 5 + 20 * (0.5 - Math.random());
        for (var i = 0; i < 3; i++) {
            colors[index + (3 * i)] = color.r;
            colors[index + (3 * i) + 1] = color.g;
            colors[index + (3 * i) + 2] = color.b;
            displacement[index + (3 * i)] = d;
            displacement[index + (3 * i) + 1] = d;
            displacement[index + (3 * i) + 2] = d;
        }
    }
    bufferGeometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    bufferGeometry.addAttribute('displacement', new THREE.BufferAttribute(displacement, 3));
    var shaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: "\n            uniform float amplitude;\n            attribute vec3 customColor;\n            attribute vec3 displacement;\n            varying vec3 vNormal;\n            varying vec3 vColor;\n            void main() {\n                vNormal = normal;\n                vColor = customColor;\n                vec3 newPosition = position + normal * amplitude * displacement;\n                gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );\n            }\n        ",
        fragmentShader: "\n            varying vec3 vNormal;\n            varying vec3 vColor;\n            void main() {\n                const float ambient = 0.4;\n                vec3 light = vec3( 1.0 );\n                light = normalize( light );\n                float directional = max( dot( vNormal, light ), 0.0 );\n                gl_FragColor = vec4( ( directional + ambient ) * vColor, 1.0 );\n            }\n        "
    });
    var textMesh = new THREE.Mesh(bufferGeometry, shaderMaterial);
    argonTextObject.add(textMesh);
    // add an argon updateEvent listener to slowly change the text over time.
    // we don't have to pack all our logic into one listener.
    app.context.updateEvent.addEventListener(function () {
        uniforms.amplitude.value = 1.0 + Math.sin(Date.now() * 0.001 * 0.5);
    });
});
// tell argon to initialize vuforia for our app, using our license information.
app.vuforia.init({
    encryptedLicenseData: "-----BEGIN PGP MESSAGE-----\nVersion: OpenPGP.js v2.3.2\nComment: http://openpgpjs.org\n\n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\n=uYu7\n-----END PGP MESSAGE-----"
}).then(function (api) {
    // the vuforia API is ready, so we can start using it.
    // tell argon to download a vuforia dataset.  The .xml and .dat file must be together
    // in the web directory, even though we just provide the .xml file url here 
    api.objectTracker.createDataSet('../resources/datasets/StonesAndChips.xml').then(function (dataSet) {
        // the data set has been succesfully downloaded
        // tell vuforia to load the dataset.  
        dataSet.load().then(function () {
            // when it is loaded, we retrieve a list of trackables defined in the
            // dataset and set up the content for the target
            var trackables = dataSet.getTrackables();
            // tell argon we want to track a specific trackable.  Each trackable
            // has a Cesium entity associated with it, and is expressed in a 
            // coordinate frame relative to the camera.  Because they are Cesium
            // entities, we can ask for their pose in any coordinate frame we know
            // about.
            var stonesEntity = app.context.subscribeToEntityById(trackables['stones'].id);
            // create a THREE object to put on the trackable
            var stonesObject = new THREE.Object3D;
            scene.add(stonesObject);
            // the updateEvent is called each time the 3D world should be
            // rendered, before the renderEvent.  The state of your application
            // should be updated here.
            app.context.updateEvent.addEventListener(function () {
                // get the pose (in local coordinates) of the stones target
                var stonesPose = app.context.getEntityPose(stonesEntity);
                // if the pose is known the target is visible, so set the
                // THREE object to it's location and orientation
                if (stonesPose.poseStatus & Argon.PoseStatus.KNOWN) {
                    stonesObject.position.copy(stonesPose.position);
                    stonesObject.quaternion.copy(stonesPose.orientation);
                }
                // when the target is first seen after not being seen, the 
                // status is FOUND.  Here, we move the 3D text object from the
                // world to the target.
                // when the target is first lost after being seen, the status 
                // is LOST.  Here, we move the 3D text object back to the world
                if (stonesPose.poseStatus & Argon.PoseStatus.FOUND) {
                    stonesObject.add(argonTextObject);
                    argonTextObject.position.z = 0;
                }
                else if (stonesPose.poseStatus & Argon.PoseStatus.LOST) {
                    argonTextObject.position.z = -250;
                    userLocation.add(argonTextObject);
                }
            });
        });
        // activate the dataset.
        api.objectTracker.activateDataSet(dataSet);
    });
});
// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.
app.context.updateEvent.addEventListener(function () {
    // get the position and orientation (the "pose") of the user
    // in the local coordinate frame.
    var userPose = app.context.getEntityPose(app.context.user);
    // assuming we know the user's pose, set the position of our 
    // THREE user object to match it
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }
});
// renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(function () {
    // update the rendering stats
    stats.update();
    // if we have 1 subView, we're in mono mode.  If more, stereo.
    var monoMode = (app.view.getSubviews()).length == 1;
    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    var viewport = app.view.getViewport();
    renderer.setSize(viewport.width, viewport.height);
    hud.setSize(viewport.width, viewport.height);
    // there is 1 subview in monocular mode, 2 in stereo mode    
    for (var _i = 0, _a = app.view.getSubviews(); _i < _a.length; _i++) {
        var subview = _a[_i];
        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);
        // the underlying system provide a full projection matrix
        // for the camera. 
        camera.projectionMatrix.fromArray(subview.projectionMatrix);
        // set the viewport for this view
        var _b = subview.viewport, x = _b.x, y = _b.y, width = _b.width, height = _b.height;
        renderer.setViewport(x, y, width, height);
        // set the webGL rendering parameters and render this view
        renderer.setScissor(x, y, width, height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
        // adjust the hud, but only in mono
        if (monoMode) {
            hud.setViewport(x, y, width, height, subview.index);
            hud.render(subview.index);
        }
    }
});
