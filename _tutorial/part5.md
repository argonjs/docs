---
layout: page
title: 'Part 5: Directions CSS'
---


> Download [Argon4](http://argonjs.io/argon-app) and the [Tutorial Source Code](https://github.com/argonjs/docs/tree/gh-pages/code). <br> This tutorial uses the *5-directionsHTML* and *resources* directories. **[Live Demo](/code/5-directionsHTML)**


In this tutorial we locate markers at the compass points (east, west, north, south) as well as up and down. These objects are rendered using the CSS renderer, rather than WebGL. Tutorial 6 creates similar markers using the WebGL renderer. 

The markers are located relative to the user's location (where the phone is) rather than being absolutely located in the world. When the application starts, the user's current location is used to set up a local 3D frame of reference, which is geolocated relative to the Cesium FIXED frame (from the center of the earth). The markers are then position relative to this local frame and move along with the user.



### The launch file (index.html)

The launch file has the same structure as in Tutorial 1. Note that we load additional CSS renderers for this applicaiton. There is an div with text explaining the example that appears on the screen when the examples starts. The user clicks to make that div invisible. 

{% highlight html %}
<html>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
<head>
    <title>Directions</title>
    <script src="../resources/lib/three/three.min.js"></script>
    <script src="../resources/lib/CSS3DArgonHUD.js"></script>
    <script src="../resources/lib/CSS3DArgonRenderer.js"></script>
    <script src="../resources/lib/argon.umd.js"></script>
    <style>

#description {
  pointer-events:auto;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  padding: 10px;
  background-color:rgba(255,255,255,0.7);
  -webkit-backdrop-filter: blur(5px);
  position:absolute;
  bottom: 0px;
}

.argon-focus #description {
  transition: opacity 0.8s;
  visibility: visible;
  opacity: 1; 
}

.argon-no-focus #description {
  transition: visibility 0s linear 0.8s, opacity 0.8s;
  visibility: visible;
  opacity: 0;
}
    </style>
</head>
  <body>
    <div id="argon">
      <div onclick="hideMe(this)" id="description">
        <h2>Six directions in HTML</h2>
        <h5>(click to dismiss)</h5>
        <p>This example displays a directional reference frame around the camera in Cartesian coordinates, using the EastUpSouth orientation for positive (x, y, z). A userLocation geospatial entity is created and positioned at the position of the user, and updated when the user's position changes. It uses HTML elements to put a text label at 200 meters in each of the negative/positive directions: x is west/east; y is down/up; z is north/south.</p>  
      </div>
    </div>
  </body>
	<script>
		function hideMe(elem) {
		    elem.style.display = 'none';
		}	
	</script>
  <script src="app.js"></script>
</html>
{% endhighlight %}

As in Tutorial 1, a separate file, app.js (the Typescript is app.ts), contains the application code. 

### The application code (Typescript and Javascript)

The initializing code is very similar to Tutorial 1

{% include code_highlight.html
tscode='
/// <reference path="../../typings/index.d.ts"/>
// When we distribute Argon typings, we can get rid of this, but for now
// we need to shut up the Typescript compiler about missing Argon typings
declare const Argon:any;

// set up Argon
const app = Argon.init();

// set up THREE.  Create a scene, a perspective camera and an object
// for the users location
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const userLocation = new THREE.Object3D;
scene.add(camera);
scene.add(userLocation);

// The CSS3DArgonRenderer supports mono and stereo views, and 
// includes both 3D elements and a place to put things that appear 
// fixed to the screen (heads-up-display) 
const renderer = new (<any>THREE).CSS3DArgonRenderer();
app.view.element.appendChild(renderer.domElement);'
jscode='
/// <reference path="../../typings/index.d.ts"/>
// set up Argon
var app = Argon.init();
// set up THREE.  Create a scene, a perspective camera and an object
// for the user location
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var userLocation = new THREE.Object3D;
scene.add(camera);
scene.add(userLocation);
// The CSS3DArgonRenderer supports mono and stereo views, and 
// includes both 3D elements and a place to put things that appear 
// fixed to the screen (heads-up-display) 
var renderer = new THREE.CSS3DArgonRenderer();
app.view.element.appendChild(renderer.domElement);
// to easily control stuff on the display
var hud = new THREE.CSS3DArgonHUD();'
%}

This code  creates a HUD elements to hold text that describes the example, which appears on the screen when the user opens the application.

{% include code_highlight.html
tscode='
// to easily control stuff on the display
const hud = new (<any>THREE).CSS3DArgonHUD();
// We put some elements in the index.html, for convenience. 
// Here, we retrieve the description box and move it to the 
// the CSS3DArgonHUD hudElements[0].  We only put it in the left
// hud since we will be hiding it in stereo
var description = document.getElementById( "description" );
hud.hudElements[0].appendChild(description);
app.view.element.appendChild(hud.domElement);
// Tell argon what local coordinate system you want. 
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);'
jscode='
// to easily control stuff on the display
var hud = new THREE.CSS3DArgonHUD();
// We put some elements in the index.html, for convenience. 
// Here, we retrieve the description box and move it to the 
// the CSS3DArgonHUD hudElements[0].  We only put it in the left
// hud since we will be hiding it in stereo
var description = document.getElementById("description");
hud.hudElements[0].appendChild(description);
app.view.element.appendChild(hud.domElement);
// Tell argon what local coordinate system you want. 
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);'
%}

The six markers are defined as divs with styled content.

{% include code_highlight.html
tscode='
// creating 6 divs to indicate the x y z positioning
var divXpos = document.createElement("div")
var divXneg = document.createElement("div")
var divYpos = document.createElement("div")
var divYneg = document.createElement("div")
var divZpos = document.createElement("div")
var divZneg = document.createElement("div")

// programatically create a stylesheet for our direction divs
// and add it to the document
const style = document.createElement("style");
style.type = "text/css";
document.head.appendChild(style);
const sheet = <CSSStyleSheet>style.sheet;
sheet.insertRule(`
    .cssContent {
        opacity: 0.5;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        line-height: 100px;
        fontSize: 20px;
        text-align: center;
    }
`, 0);

// Put content in each one  (should do this as a couple of functions)
// for X
divXpos.className = "cssContent"
divXpos.style.backgroundColor = "red"
divXpos.innerText = "Pos X = East"

divXneg.className = "cssContent"
divXneg.style.backgroundColor = "red"
divXneg.innerText = "Neg X = West"

// for Y
divYpos.className = "cssContent"
divYpos.style.backgroundColor = "blue"
divYpos.innerText = "Pos Y = Up"

divYneg.className = "cssContent"
divYneg.style.backgroundColor = "blue"
divYneg.innerText = "Neg Y = Down"

//for Z
divZpos.className = "cssContent"
divZpos.style.backgroundColor = "green"
divZpos.innerText = "Pos Z = South"

divZneg.className = "cssContent"
divZneg.style.backgroundColor = "green"
divZneg.innerText = "Neg Z = North"'
jscode='
// creating 6 divs to indicate the x y z positioning
var divXpos = document.createElement("div");
var divXneg = document.createElement("div");
var divYpos = document.createElement("div");
var divYneg = document.createElement("div");
var divZpos = document.createElement("div");
var divZneg = document.createElement("div");
// programatically create a stylesheet for our direction divs
// and add it to the document
var style = document.createElement("style");
style.type = "text/css";
document.head.appendChild(style);
var sheet = style.sheet;
sheet.insertRule("\n    .cssContent {\n        opacity: 0.5;\n        width: 100px;\n        height: 100px;\n        border-radius: 50%;\n        line-height: 100px;\n        fontSize: 20px;\n        text-align: center;\n    }\n", 0);
// Put content in each one  (should do this as a couple of functions)
// for X
divXpos.className = "cssContent";
divXpos.style.backgroundColor = "red";
divXpos.innerText = "Pos X = East";
divXneg.className = "cssContent";
divXneg.style.backgroundColor = "red";
divXneg.innerText = "Neg X = West";
// for Y
divYpos.className = "cssContent";
divYpos.style.backgroundColor = "blue";
divYpos.innerText = "Pos Y = Up";
divYneg.className = "cssContent";
divYneg.style.backgroundColor = "blue";
divYneg.innerText = "Neg Y = Down";
//for Z
divZpos.className = "cssContent";
divZpos.style.backgroundColor = "green";
divZpos.innerText = "Pos Z = South";
divZneg.className = "cssContent";
divZneg.style.backgroundColor = "green";
divZneg.innerText = "Neg Z = North";'
%}

6 CSS objects are created, one associated with each div. The CSS objects are positioned in the local reference frame around the user location, using the EUS (east, up, south) system. Each object is also rotated, where necessary, to face the user. 


{% include code_highlight.html
tscode='
// create 6 CSS3DObjects in the scene graph.  The CSS3DObject object 
// is used by the CSS3DArgonRenderer. Because an HTML element can only
// appear once in the DOM, we need two elements to create a stereo view.
// The CSS3DArgonRenderer manages these for you, using the CSS3DObject.
// You can pass a single DIV to the CSS3DObject, which
// will be cloned to create a second matching DIV in stereo mode, or you
// can pass in two DIVs in an array (one for the left and one for the 
// right eyes).  If the content of the DIV does not change as the 
// application runs, letting the CSS3DArgonRenderer clone them is 
// simplest.  If it is changing, passing in two and updating both
// yourself is simplest.
var cssObjectXpos = new (<any>THREE).CSS3DObject(divXpos)
var cssObjectXneg = new (<any>THREE).CSS3DObject(divXneg)
var cssObjectYpos = new (<any>THREE).CSS3DObject(divYpos)
var cssObjectYneg = new (<any>THREE).CSS3DObject(divYneg)
var cssObjectZpos = new (<any>THREE).CSS3DObject(divZpos)
var cssObjectZneg = new (<any>THREE).CSS3DObject(divZneg)

// the width and height is used to align things.
cssObjectXpos.position.x = 200.0
cssObjectXpos.position.y = 0.0
cssObjectXpos.position.z = 0.0
cssObjectXpos.rotation.y = - Math.PI / 2

cssObjectXneg.position.x = -200.0
cssObjectXneg.position.y = 0.0
cssObjectXneg.position.z = 0.0
cssObjectXneg.rotation.y =  Math.PI / 2

// for Y
cssObjectYpos.position.x = 0.0
cssObjectYpos.position.y = 200.0
cssObjectYpos.position.z = 0.0
cssObjectYpos.rotation.x = Math.PI / 2

cssObjectYneg.position.x = 0.0
cssObjectYneg.position.y = - 200.0
cssObjectYneg.position.z = 0.0
cssObjectYneg.rotation.x = - Math.PI / 2

// for Z
cssObjectZpos.position.x = 0.0
cssObjectZpos.position.y = 0.0
cssObjectZpos.position.z = 200.0
cssObjectZpos.rotation.y = Math.PI

cssObjectZneg.position.x = 0.0
cssObjectZneg.position.y = 0.0
cssObjectZneg.position.z = -200.0
//no rotation need for this one'
jscode='
// create 6 CSS3DObjects in the scene graph.  The CSS3DObject object 
// is used by the CSS3DArgonRenderer. Because an HTML element can only
// appear once in the DOM, we need two elements to create a stereo view.
// The CSS3DArgonRenderer manages these for you, using the CSS3DObject.
// You can pass a single DIV to the CSS3DObject, which
// will be cloned to create a second matching DIV in stereo mode, or you
// can pass in two DIVs in an array (one for the left and one for the 
// right eyes).  If the content of the DIV does not change as the 
// application runs, letting the CSS3DArgonRenderer clone them is 
// simplest.  If it is changing, passing in two and updating both
// yourself is simplest.
var cssObjectXpos = new THREE.CSS3DObject(divXpos);
var cssObjectXneg = new THREE.CSS3DObject(divXneg);
var cssObjectYpos = new THREE.CSS3DObject(divYpos);
var cssObjectYneg = new THREE.CSS3DObject(divYneg);
var cssObjectZpos = new THREE.CSS3DObject(divZpos);
var cssObjectZneg = new THREE.CSS3DObject(divZneg);
// the width and height is used to align things.
cssObjectXpos.position.x = 200.0;
cssObjectXpos.position.y = 0.0;
cssObjectXpos.position.z = 0.0;
cssObjectXpos.rotation.y = -Math.PI / 2;
cssObjectXneg.position.x = -200.0;
cssObjectXneg.position.y = 0.0;
cssObjectXneg.position.z = 0.0;
cssObjectXneg.rotation.y = Math.PI / 2;
// for Y
cssObjectYpos.position.x = 0.0;
cssObjectYpos.position.y = 200.0;
cssObjectYpos.position.z = 0.0;
cssObjectYpos.rotation.x = Math.PI / 2;
cssObjectYneg.position.x = 0.0;
cssObjectYneg.position.y = -200.0;
cssObjectYneg.position.z = 0.0;
cssObjectYneg.rotation.x = -Math.PI / 2;
// for Z
cssObjectZpos.position.x = 0.0;
cssObjectZpos.position.y = 0.0;
cssObjectZpos.position.z = 200.0;
cssObjectZpos.rotation.y = Math.PI;
cssObjectZneg.position.x = 0.0;
cssObjectZneg.position.y = 0.0;
cssObjectZneg.position.z = -200.0;
// no rotation needed for z'
%}


Then the six CSS objects are added to the user location object, which is already in the scene graph. 

{% include code_highlight.html
tscode='
userLocation.add(cssObjectXpos)
userLocation.add(cssObjectXneg)
userLocation.add(cssObjectYpos)
userLocation.add(cssObjectYneg)
userLocation.add(cssObjectZpos)
userLocation.add(cssObjectZneg)

'
jscode='
userLocation.add(cssObjectXpos)
userLocation.add(cssObjectXneg)
userLocation.add(cssObjectYpos)
userLocation.add(cssObjectYneg)
userLocation.add(cssObjectZpos)
userLocation.add(cssObjectZneg)

'
%}

## The Argon Update and Rendering Events 
The Argon Update and Rendering Events complete the code. For an explanation of these two events, see parts 1 and 3 of the tutorials.

The Update Event is simple here because the six markers are fixed relative to the user object. It is only necessary to update the user object's position relative to the local coordinate frame. 

{% include code_highlight.html
tscode='
// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.
app.updateEvent.addEventListener(() => {
    // get the position and orientation (the "pose") of the user
    // in the local coordinate frame.
    const userPose = app.context.getEntityPose(app.context.user);

    // assuming we know the user pose, set the position of our 
    // THREE user object to match it
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }
})

'
jscode='
// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.
app.updateEvent.addEventListener(function () {
    // get the position and orientation (the "pose") of the user
    // in the local coordinate frame.
    var userPose = app.context.getEntityPose(app.context.user);
    // assuming we know the user pose, set the position of our 
    // THREE user object to match it
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }
});
'
%}

The renderEvent listeners are called after the updateEvent listeners. This code can handle mono  or stereo mode. See parts 1 and 3 of this tutorial for an explanation. 

{% include code_highlight.html
tscode='
/// for the CSS renderer, we want to use requestAnimationFrame to 
// limit the number of repairs of the DOM.  Otherwise, as the 
// DOM elements are updated, extra repairs of the DOM could be 
// initiated.  Extra repairs do not appear to happen within the 
// animation callback.
var viewport = null;
var subViews = null;
var rAFpending = false;

app.renderEvent.addEventListener(() => {
    // only schedule a new callback if the old one has completed
    if (!rAFpending) {
        rAFpending = true;
        viewport = app.view.getViewport();
        subViews = app.view.getSubviews();
        window.requestAnimationFrame(renderFunc);
    }
});

// the animation callback.  
function renderFunc() {
    // if we have 1 subView, we are in mono mode.  If more, stereo.
    var monoMode = subViews.length == 1;

    rAFpending = false;

    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    renderer.setSize(viewport.width, viewport.height);
    hud.setSize(viewport.width, viewport.height);

    // there is 1 subview in monocular mode, 2 in stereo mode
    for (let subview of subViews) {
        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);
        // the underlying system provide a full projection matrix
        // for the camera.  Use it, and then update the FOV of the 
        // camera from it (needed by the CSS Perspective DIV)
        camera.projectionMatrix.fromArray(subview.projectionMatrix);
        camera.fov = subview.frustum.fovy * 180 / Math.PI;

        // set the viewport for this view
        let {x,y,width,height} = subview.viewport;
        renderer.setViewport(x,y,width,height, subview.index);

        // render this view.
        renderer.render(scene, camera, subview.index);

        // adjust the hud, but only in mono
        if (monoMode) {
            hud.setViewport(x,y,width,height, subview.index);
            hud.render(subview.index);
        }
    }
}

'
jscode='
// for the CSS renderer, we want to use requestAnimationFrame to 
// limit the number of repairs of the DOM.  Otherwise, as the 
// DOM elements are updated, extra repairs of the DOM could be 
// initiated.  Extra repairs do not appear to happen within the 
// animation callback.
var viewport = null;
var subViews = null;
var rAFpending = false;
app.renderEvent.addEventListener(function () {
    // only schedule a new callback if the old one has completed
    if (!rAFpending) {
        rAFpending = true;
        viewport = app.view.getViewport();
        subViews = app.view.getSubviews();
        window.requestAnimationFrame(renderFunc);
    }
});
// the animation callback.  
function renderFunc() {
    // if we have 1 subView, we are in mono mode.  If more, stereo.
    var monoMode = subViews.length == 1;
    rAFpending = false;
    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    renderer.setSize(viewport.width, viewport.height);
    hud.setSize(viewport.width, viewport.height);
    // there is 1 subview in monocular mode, 2 in stereo mode
    for (var _i = 0, subViews_1 = subViews; _i < subViews_1.length; _i++) {
        var subview = subViews_1[_i];
        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);
        // the underlying system provide a full projection matrix
        // for the camera.  Use it, and then update the FOV of the 
        // camera from it (needed by the CSS Perspective DIV)
        camera.projectionMatrix.fromArray(subview.projectionMatrix);
        camera.fov = subview.frustum.fovy * 180 / Math.PI;
        // set the viewport for this view
        var _a = subview.viewport, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        renderer.setViewport(x, y, width, height, subview.index);
        // render this view.
        renderer.render(scene, camera, subview.index);
        // adjust the hud, but only in mono
        if (monoMode) {
            hud.setViewport(x, y, width, height, subview.index);
            hud.render(subview.index);
        }
    }
}

'
%}

This completes the Directions CSS tutorial. 

