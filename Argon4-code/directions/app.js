var app = Argon.init();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var cssRenderer = new THREE.CSS3DRenderer();
app.viewport.element.appendChild(cssRenderer.domElement);
// set the local origin to EUS so that 
// +X is east, +Y is up, and +Z is south 
// (this is just an example, use whatever origin you prefer)
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);
app.updateEvent.addEventListener(function () {
    var frustum = app.camera.currentFrustum;
    camera.fov = Argon.Cesium.CesiumMath.toDegrees(frustum.fovy);
    camera.aspect = frustum.aspectRatio;
    camera.projectionMatrix.fromArray(frustum.infiniteProjectionMatrix);
    // We can optionally provide a second argument to getCurrentEntityState
    // with a desired reference frame. Otherwise, the implementation uses
    // the default origin as the reference frame. 
    var eyeState = app.context.getCurrentEntityState(app.context.eye);
    if (eyeState.poseStatus | Argon.PoseStatus.KNOWN) {
        camera.position.copy(eyeState.position);
        camera.quaternion.copy(eyeState.orientation);
        eyeOrigin.position.copy(eyeState.position);
    }
});
app.renderEvent.addEventListener(function () {
    var _a = app.viewport.current, width = _a.width, height = _a.height;
    cssRenderer.setSize(width, height);
    cssRenderer.render(scene, camera);
});
var eyeOrigin = new THREE.Object3D;
scene.add(eyeOrigin);
// creating 6 divs to indicate the x y z positioning
var divXpos = document.createElement('div');
var divXneg = document.createElement('div');
var divYpos = document.createElement('div');
var divYneg = document.createElement('div');
var divZpos = document.createElement('div');
var divZneg = document.createElement('div');
// programatically create a stylesheet for our direction divs
// and add it to the document
var style = document.createElement("style");
style.type = 'text/css';
document.head.appendChild(style);
var sheet = style.sheet;
sheet.insertRule("\n    .direction {\n        opacity: 0.5;\n        width: 100px;\n        height: 100px;\n        border-radius: 50%;\n        line-height: 100px;\n        fontSize: 20px;\n        text-align: center;\n    }\n", 0);
// Put content in each one  (should do this as a couple of functions)
// for X
divXpos.className = 'direction';
divXpos.style.backgroundColor = "red";
divXpos.innerText = "East (+X)";
divXneg.className = 'direction';
divXneg.style.backgroundColor = "red";
divXneg.innerText = "West (-X)";
// for Y
divYpos.className = 'direction';
divYpos.style.backgroundColor = "blue";
divYpos.innerText = "Up (+Y)";
divYneg.className = 'direction';
divYneg.style.backgroundColor = "blue";
divYneg.innerText = "Down (-Y)";
//for Z
divZpos.className = 'direction';
divZpos.style.backgroundColor = "green";
divZpos.innerText = "South (+Z)";
divZneg.className = 'direction';
divZneg.style.backgroundColor = "green";
divZneg.innerText = "North (-Z)";
// create 6 CSS3DObjects in the scene graph
var cssObjectXpos = new THREE.CSS3DObject(divXpos);
var cssObjectXneg = new THREE.CSS3DObject(divXneg);
var cssObjectYpos = new THREE.CSS3DObject(divYpos);
var cssObjectYneg = new THREE.CSS3DObject(divYneg);
var cssObjectZpos = new THREE.CSS3DObject(divZpos);
var cssObjectZneg = new THREE.CSS3DObject(divZneg);
// the width and height is used to align things.
cssObjectXpos.position.x = 200.0;
cssObjectXpos.rotation.y = -Math.PI / 2;
cssObjectXneg.position.x = -200.0;
cssObjectXneg.rotation.y = Math.PI / 2;
// for Y
cssObjectYpos.position.y = 200.0;
cssObjectYpos.rotation.x = Math.PI / 2;
cssObjectYneg.position.y = -200.0;
cssObjectYneg.rotation.x = -Math.PI / 2;
// for Z
cssObjectZpos.position.z = 200.0;
cssObjectZpos.rotation.y = Math.PI;
cssObjectZneg.position.z = -200.0;
//no rotation need for this one
eyeOrigin.add(cssObjectXpos);
eyeOrigin.add(cssObjectXneg);
eyeOrigin.add(cssObjectYpos);
eyeOrigin.add(cssObjectYneg);
eyeOrigin.add(cssObjectZpos);
eyeOrigin.add(cssObjectZneg);
