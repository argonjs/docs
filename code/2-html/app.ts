/// <reference types="@argonjs/argon" />
/// <reference types="three" />

// grab some handles on APIs we use
const Cesium = Argon.Cesium;
const Cartesian3 = Argon.Cesium.Cartesian3;
const ReferenceFrame = Argon.Cesium.ReferenceFrame;
const JulianDate = Argon.Cesium.JulianDate;
const CesiumMath = Argon.Cesium.CesiumMath;

// set up Argon
const app = Argon.init();

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

// set up THREE.  Create a scene, a perspective camera and an object
// for the user's location
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const userLocation = new THREE.Object3D;
scene.add(camera);
scene.add(userLocation);

// The CSS3DArgonRenderer supports mono and stereo views.  Currently
// not using it in this example, but left it in the code in case we
// want to add an HTML element near the geo object. 
// The CSS3DArgonHUD is a place to put things that appear 
// fixed to the screen (heads-up-display).  
// In this demo, we are  rendering the 3D graphics with WebGL, 
// using the standard WebGLRenderer, and using the CSS3DArgonHUD
// to manage the 2D display fixed content
const cssRenderer = new (<any>THREE).CSS3DArgonRenderer();
const hud = new (<any>THREE).CSS3DArgonHUD();
const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    logarithmicDepthBuffer: true
});
renderer.setPixelRatio(window.devicePixelRatio);

// Assuming the z-orders are the same, the order of sibling elements
// in the DOM determines which content is in front (top->bottom = back->front)
app.view.element.appendChild(renderer.domElement);
app.view.element.appendChild(cssRenderer.domElement);
app.view.element.appendChild(hud.domElement);

// We put some elements in the index.html, for convenience. 
// Here, we retrieve them and move the information boxes to the 
// the CSS3DArgonHUD hudElement.
const hudContent = document.getElementById('hud');
hud.appendChild(hudContent);
var locationElements = hudContent.getElementsByClassName('location');

//  We also move the description box to the Argon HUD, but moving it inside the 'hud' element
var hudDescription = document.getElementById( 'description' );
hudContent.appendChild(hudDescription);

// All geospatial objects need to have an Object3D linked to a Cesium Entity.
// We need to do this because Argon needs a mapping between Entities and Object3Ds.
//
// Here, we will position a cube near our starting location.  This geolocated object starts without a
// location, until our reality is set and we know the location.  Each time the reality changes, we update
// the cube position.

// create a 1m cube with a wooden box texture on it, that we will attach to the geospatial object when we create it
// Box texture from https://www.flickr.com/photos/photoshoproadmap/8640003215/sizes/l/in/photostream/
// licensed under https://creativecommons.org/licenses/by/2.0/legalcode
var boxGeoObject = new THREE.Object3D();

var box = new THREE.Object3D();
var loader = new THREE.TextureLoader();
loader.load( 'box.png', function ( texture ) {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );
    box.add( mesh );
});
boxGeoObject.add(box);

var boxGeoEntity = new Argon.Cesium.Entity({
    name: "I have a box",
    position: Cartesian3.ZERO,
    orientation: Cesium.Quaternion.IDENTITY
});

// Create a DIV to use to label the position and distance of the cube
let boxLocDiv = document.getElementById("box-location");
const boxLabel = new THREE.CSS3DSprite(boxLocDiv);
boxLabel.scale.set(0.02, 0.02, 0.02);
boxLabel.position.set(0,1.25,0);
boxGeoObject.add(boxLabel);

var boxInit = false;
var boxCartographicDeg = [0,0,0];
var lastInfoText = '';
var lastBoxText = '';

// make floating point output a little less ugly
function toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
}

// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.
app.updateEvent.addEventListener((frame) => {
    // get the position and orientation (the 'pose') of the user
    // in the local coordinate frame.
    const userPose = app.context.getEntityPose(app.context.user);
    // assuming we know the user's pose, set the position of our 
    // THREE user object to match it
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    } else {
        // if we don't know the user pose we can't do anything
        return;
    }

    // the first time through, we create a geospatial position for
    // the box somewhere near us 
    if (!boxInit) {
        const defaultFrame = app.context.getDefaultReferenceFrame();

        // set the box's position to 10 meters away from the user.
        // First, clone the userPose postion, and add 10 to the X
        const boxPos = userPose.position.clone();
        boxPos.x += 10;
        // set the value of the box Entity to this local position, by
        // specifying the frame of reference to our local frame
        boxGeoEntity.position.setValue(boxPos, defaultFrame);        

        // orient the box according to the local world frame
        boxGeoEntity.orientation.setValue(Cesium.Quaternion.IDENTITY);

        // now, we want to move the box's coordinates to the FIXED frame, so
        // the box doesn't move if the local coordinate system origin changes.
        if (Argon.convertEntityReferenceFrame(boxGeoEntity, frame.time, 
                                              ReferenceFrame.FIXED)) {
            scene.add(boxGeoObject);            
            boxInit = true;
        }
    }

    // get the local coordinates of the local box, and set the THREE object
    var boxPose = app.context.getEntityPose(boxGeoEntity);
    boxGeoObject.position.copy(boxPose.position);        
    boxGeoObject.quaternion.copy(boxPose.orientation);

    // rotate the boxes at a constant speed, independent of frame rates     
    // to make it a little less boring
    box.rotateY( 3 * frame.deltaTime/10000);

    // stuff to print out the status message.
    // It's fairly expensive to convert FIXED coordinates back to LLA, 
    // but those coordinates probably make the most sense as
    // something to show the user, so we'll do that computation.

    // cartographicDegrees is a 3 element array containing 
    // [longitude, latitude, height]
    var gpsCartographicDeg = [0,0,0];

    // get user position in global coordinates
    const userPoseFIXED = app.context.getEntityPose(app.context.user, ReferenceFrame.FIXED);
    const userLLA = Cesium.Ellipsoid.WGS84.cartesianToCartographic(userPoseFIXED.position);
    if (userLLA) {
        gpsCartographicDeg = [
            CesiumMath.toDegrees(userLLA.longitude),
            CesiumMath.toDegrees(userLLA.latitude),
            userLLA.height
        ];
    }

    const boxPoseFIXED = app.context.getEntityPose(boxGeoEntity, ReferenceFrame.FIXED);
    const boxLLA = Cesium.Ellipsoid.WGS84.cartesianToCartographic(boxPoseFIXED.position);
    if (boxLLA) {
        boxCartographicDeg = [
            CesiumMath.toDegrees(boxLLA.longitude),
            CesiumMath.toDegrees(boxLLA.latitude),
            boxLLA.height
        ];
    }

    // we'll compute the distance to the cube, just for fun. 
    // If the cube could be further away, we'd want to use 
    // Cesium.EllipsoidGeodesic, rather than Euclidean distance, 
    // but this is fine here.
	var userPos = userLocation.getWorldPosition();
    var boxPos = box.getWorldPosition();
    var distanceToBox = userPos.distanceTo( boxPos );

    // create some feedback text
    var infoText = 'Geospatial Argon example:<br>';
    infoText += 'Your location is lla (' + toFixed(gpsCartographicDeg[0],6) + ', ';
    infoText += toFixed(gpsCartographicDeg[1], 6) + ', ' + toFixed(gpsCartographicDeg[2], 2) + ')';
    infoText += 'box is ' + toFixed(distanceToBox,2) + ' meters away';

    var boxLabelText = 'a wooden box!<br>lla = ' + toFixed(boxCartographicDeg[0], 6) + ', ';
    boxLabelText += toFixed(boxCartographicDeg[1], 6) + ', ' + toFixed(boxCartographicDeg[2], 2);

    if (lastInfoText !== infoText) { // prevent unecessary DOM invalidations
        locationElements[0].innerHTML = infoText;
        lastInfoText = infoText;
    }

    if (lastBoxText !== boxLabelText) { // prevent unecessary DOM invalidations
        boxLocDiv.innerHTML = boxLabelText;
        lastBoxText = boxLabelText;
    }
});
    
// renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(() => {
    // set the renderers to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    const viewport = app.view.getViewport();
    renderer.setSize(viewport.width, viewport.height);
    cssRenderer.setSize(viewport.width, viewport.height);
    hud.setSize(viewport.width, viewport.height);

    // there is 1 subview in monocular mode, 2 in stereo mode    
    for (let subview of app.view.getSubviews()) {
        var frustum = subview.frustum;
        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);
        // the underlying system provide a full projection matrix
        // for the camera. 
        camera.projectionMatrix.fromArray(subview.projectionMatrix);

        // set the viewport for this view
        let {x,y,width,height} = subview.viewport;

        // set the CSS rendering up, by computing the FOV, and render this view
        camera.fov = THREE.Math.radToDeg(frustum.fovy);

        cssRenderer.setViewport(x,y,width,height, subview.index);
        cssRenderer.render(scene, camera, subview.index);

        // set the webGL rendering parameters and render this view
        renderer.setViewport(x,y,width,height);
        renderer.setScissor(x,y,width,height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);

        // adjust the hud
        hud.setViewport(x,y,width,height, subview.index);
        hud.render(subview.index);
    }
});