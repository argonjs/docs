---
layout: page
title: 'Part 1: Getting Started'
---

> Download [Argon4](http://argonjs.io/argon-app) and the [Tutorial Source Code](https://github.com/argonjs/docs/tree/gh-pages/code). <br> This tutorial uses the *1-geopose* and *resources* directories.<br> **[Live Demo](/code/1-geopose)**

In general, *argon.js* apps can be structured however you want. This tutorial
follows a [single-page app](https://en.wikipedia.org/wiki/Single-page_application)
structure, in which the entire app loads from one html page.

{% highlight html %}
<html>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
  <head>
    <title>My Awesome argon.js App</title>
    <script src="../resources/lib/three/three.min.js"></script>
    <script src="../resources/lib/argon.min.js"></script>
  </head>
  <body>
    <div id="argon"></div>
    <script src="./app.js"></script>   
  </body> 
</html>
{% endhighlight %}

> Note: One way to load `argon.js` is to download the 
[argon.min.js](https://github.com/argonjs/argon/raw/master/argon.min.js) library and
manually place it in a script tag in your html as you see here. However, if you are comfortable 
with using a module loader such as `jspm`, `webpack`, `browserify`, etc., then you can 
do that instead (see the [Quick Start](/start/setup/) guide). 

As you see here, the application code is not included in the html file, instead it is segregated into one or more external files. In order to ensure that the body is loaded by the time your script executes, it is convenient to load your application script just before the end-body tag.

In addition to offering AR features (such as geolocation, video of the surrounding world, 3D graphics and image tracking), the Argon4 browser is a standard web browser (i.e., on iOS, it uses Apple's Webkit engine) and can therefore render just about any web content. You can take advantage of these capabilities in two ways:

* First, argon uses (or creates) a special div with the id "argon" as its `view`. Anything you put in this div (or in divs nested inside this one) will be rendered on the screen in 2D, in front of the 3D AR content in the Argon view. See [part 2](../part2) of the tutorial for an in-depth discussion on including HTML content in Argon applications.

* Second, because Webkit is a full-featured HTML5 engine (used by Safari), Argon can render most web pages (e.g., including those without any AR features). Just type the url into the text box.

## The Application Code (TypeScript and JavaScript)
Segregating the JavaScript code into a separate file allows for a cleaner workflow as well as the use of Javascript development tools to transcode, minify or otherwise manipulate the code. For this tutorial, the application script is named `app.js`.

The code for this tutorial (and argon.js!) is written in Typescript, [a typed superset of Javascript that compiles to plain Javascript](https://www.typescriptlang.org). The code snippets in these tutorials are given in both forms. Both an `app.ts` (Typescript) and `app.js` (Javascript) file are included in the example folders, but only the `app.js` file is actually downloaded and used in executing the channel. 

Note: This tutorial assumes that you are already familiar with the fundamentals of computer graphics: the concept of a scene graph, creating and manipulating 3D objects and textures, the camera, etc. While Argon is agnostic as to what rendering system you use, the Argon samples and tutorials currently use the javascript graphics framework [three.js](http://threejs.org/) to create and manage the scene graph. See the [threejs.org](http://threejs.org) documentation for a complete description.  

In order to initialize Argon and [three.js](http://threejs.org/), this example (like most of the [Argon samples](http://argonjs.io/samples)) begins with:

{% include code_highlight.html
tscode='
// initialize Argon
const app = Argon.init();
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);

// initialize THREE
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const userLocation = new THREE.Object3D;
scene.add(camera);
scene.add(userLocation);
const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    logarithmicDepthBuffer: true
});
renderer.setPixelRatio(window.devicePixelRatio);
app.view.element.appendChild(renderer.domElement);'
jscode='
// initialize Argon
var app = Argon.init();
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);

// initialize THREE
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var userLocation = new THREE.Object3D;
scene.add(camera);
scene.add(userLocation);
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true
});
renderer.setPixelRatio(window.devicePixelRatio);
app.view.element.appendChild(renderer.domElement);'
%}

To display graphics with [three.js](http://threejs.org/docs/#Manual/Introduction/Creating_a_scene), we need three things: a scene, a camera, and a renderer.

* The first two lines of the above code initialize Argon and choose the local frame of reference.  Argon uses global coordinates, which are not convenient for rendering, so a local origin (app.context.localOriginEastUpSouth) is used instead.
* The next lines create a scene object and camera for [three.js](http://threejs.org/).
* userLocation is an object that will be located at the position of the user (normally the same as the camera).  It is not used in this example, but included in the code since it is often needed. 
* Both camera and userlocation are added to the scene graph. 
* A renderer is then created for this application to use: in this case, the WebGL renderer.  

## Creating the cube
A simple box (cube) is created using methods provided by [three.js](http://threejs.org/) and positioned in the world. This code creates the box and adds a texture to it:
{% include code_highlight.html
tscode='
var boxGeoObject = new THREE.Object3D();
var box = new THREE.Object3D();
var loader = new THREE.TextureLoader();
loader.load( "box.png", function ( texture ) {
    var geometry = new THREE.BoxGeometry(2, 2, 2);
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );
    box.add( mesh );
});
boxGeoObject.add(box);'
jscode='
var boxGeoObject = new THREE.Object3D();
var box = new THREE.Object3D();
var loader = new THREE.TextureLoader();
loader.load( "box.png", function ( texture ) {
    var geometry = new THREE.BoxGeometry(2, 2, 2);
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );
    box.add( mesh );
});
boxGeoObject.add(box);'
%}

The above code creates two objects (the box itself and boxGeoObject to which the box is attached). 

Next, in order to give the box a geolocation, a Cesium `Entity` will be created. Argon uses an enhanced set of the core libraries from [Cesium](http://cesiumjs.org) to represent and manipulate its frames of reference, using a single coordinate system for every object, from geospatial coordinates down to items tracked with the camera.

The Cesium `Entity` object has properties for the position and orientation of the entity. The default coordinate frame used by Argon is Cesium's `FIXED` reference frame, which is centered at the center of the earth and oriented with the earth's axes. Unfortunately, this reference frame is inconvenient to use directly, as any point on the earth is very far from the center of the earth, and the orientation of the surface of the earth is not intuitive (as "up" is aligned with the axes between the north and south poles).  Therefore, within the `FIXED` reference frame, Argon defines a local coordinate frame that sits on a plane tangent to the earth near the user's current location. `setDefaultReferenceFrame()` is used to set this local frame. (See the initialization code above for an example.)

Argon reports the position and orientation of entities relative to this local frame. While arbitrary (the programmer does not choose the origin of this coordinate system), this local reference frame has an intuitive orientation relative to the user's location on the surface of the earth. This example uses `localOriginEastUpSouth` as the default reference frame, so the positive x-axis is east, the positive y-axis is up and the positive z-axis is south.  If the user moves more than a few kilometers from the origin of this local frame, Argon updates the origin to the new location, ensuring that the local reference frame is a reasonable approximation to what the user (and programmer) perceive as their local coordinates (i.e., as you move around the earth, positive y will remain "up", positive x will point east and positive z will point south).

Since the local reference frame may change at any time, a programmer should not save and use the values in this frame for more than a single update and render step. If the values need to be saved and used over multiple frames, it is possible to be notified when the local frame of reference changes.

{% include code_highlight.html
tscode='
var boxGeoEntity = new Argon.Cesium.Entity({
    name: "I have a box",
    position: Cartesian3.ZERO,
    orientation: Cesium.Quaternion.IDENTITY
});'
jscode='
var boxGeoEntity = new Argon.Cesium.Entity({
    name: "I have a box",
    position: Cartesian3.ZERO,
    orientation: Cesium.Quaternion.IDENTITY
});'
%}

At this point, the box object (a textured cube) is attached to the scene and there is a Cesium Entity for it, but it is not yet actually located that in the world. The position of boxGeoEntity is set to (0,0,0) by default. The geolocation of the boxGeoEntity will be computed (in the Update Event code below) after Argon has determined the location of the user.

## The Argon Update and Rendering Events 

Argon is designed to work in a variety of browsers and leverage different approaches to AR. Since different setups have different update requirements, Argon controls the update loop of an application. This is in contrast to most web frameworks, such as [three.js](http://threejs.org/), that directly use `requestAnimationFrame()` to update their content. Internally, Argon may or may not use `requestAnimationFrame` to trigger updates.  For example, when live video is used as the background in the Argon4 browser, updates are triggered whenever a new video frame is available from the camera.  To ensure your app renders the scene at the right time, you should always use Argon's update methods.

Whenever the application should update and re-render the scene, two event listeners (`updateEvent` and `renderEvent`) are triggered in turn, allowing the application state to be updated separately from rendering. Your application (and support libraries) may subscribe to these events in multiple places, and all update event listeners will be called before all render event listeners.

An update event listener is where your application should generally make changes to the scene (adding, manipulating, or deleting objects you have created). In this example, the first time the update event listener is called, the box's geospatial position is set to be 10 meters to the east of the user (the local reference frame is `localOriginEastUpSouth` so positive `x` is east).  To position the box, a new position `boxPos` is created and its `x` value incremented by 10.  Next, the value of the `position` property on the Cesium.Entity `boxGeoEntity` is set to this new position.  

It is *very* important to pay attention to the frame of reference for this property, which is our default reference frame:  you do not want to leave the `boxGeoEntity` in this frame of reference because the default reference frame may get reset at any time (if the user moves away from the origin of the frame).  Therefore,  `convertEntityReferenceFrame()` is called to convert this entity to `ReferenceFrame.FIXED`, Cesium's earth-centered reference frame.  `convertEntityReferenceFrame` updates the `position` and `orientation` properties of the entity such that the entity appears to be in exactly the same position and orientation, but now these properties are expressed in the new reference frame.  If you looked at the values of the properties after this call, the position would be very large, and the orientation will have changed to an angle corresponding to the tangent plane of the earth at your current location.  At this point, the `boxGeoEntity` is expressed in geospatial coordinates, independent of the location of the user and the (arbitrary) local reference frame.

Next, the update listener sets the position and orientation of the [three.js](http://threejs.org/) `boxGeoObject` based on the pose of the `boxGeoEntity` in the local reference frame. It also rotates the box each time through the loop for visual interest (and so you have some indication the application is running when you look at it).

{% include code_highlight.html
tscode="
// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.
var boxInit = false;

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

    // rotate the box at a constant speed, independent of frame rates     
    // to make it a little less boring
    box.rotateY( 3 * frame.deltaTime/10000);
})"
jscode="
// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.
var boxInit = false;

app.updateEvent.addEventListener(function (frame) {
    // get the position and orientation (the 'pose') of the user
    // in the local coordinate frame.
    var userPose = app.context.getEntityPose(app.context.user);

    // assuming we know the user's pose, set the position of our 
    // THREE user object to match it
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }
    else {
        // if we don't know the user pose we can't do anything
        return;
    }
    // the first time through, we create a geospatial position for
    // the box somewhere near us 
    if (!boxInit) {
        var defaultFrame = app.context.getDefaultReferenceFrame();

        // set the box's position to 10 meters away from the user.
        // First, clone the userPose postion, and add 10 to the X
        var boxPos_1 = userPose.position.clone();
        boxPos_1.x += 10;

        // set the value of the box Entity to this local position, by
        // specifying the frame of reference to our local frame
        boxGeoEntity.position.setValue(boxPos_1, defaultFrame);

        // orient the box according to the local world frame
        boxGeoEntity.orientation.setValue(Cesium.Quaternion.IDENTITY);

        // now, we want to move the box's coordinates to the FIXED frame, so
        // the box doesn't move if the local coordinate system origin changes.
        if (Argon.convertEntityReferenceFrame(boxGeoEntity, frame.time, ReferenceFrame.FIXED)) {
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
    box.rotateY(3 * frame.deltaTime / 10000);
});"
%}

The renderEvent listeners are called after the updateEvent listeners. Argon supports multiple subviews within its view (currently, just single or stereo), so the render event needs to handle an arbitrary set of subviews, rendering the scene appropriately in each one. This is straightforward for the WebGL renderer, which supports rendering into subviews within the `canvas`.  Each subview can simply be rendererd independently. 

{% include code_highlight.html
tscode='
// renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(() => {
    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    const viewport = app.view.getViewport();
    renderer.setSize(viewport.width, viewport.height);

    // there is 1 subview in monocular mode, 2 in stereo mode    
    for (let subview of app.view.getSubviews()) {
        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);

        // the underlying system provide a full projection matrix
        // for the camera. 
        camera.projectionMatrix.fromArray(subview.projectionMatrix);

        // set the viewport for this view
        let {x,y,width,height} = subview.viewport;

        // set the webGL rendering parameters and render this view
        renderer.setViewport(x,y,width,height);
        renderer.setScissor(x,y,width,height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
    }
});'
jscode='
// renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(function () {
    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    var viewport = app.view.getViewport();
    renderer.setSize(viewport.width, viewport.height);

    // there is 1 subview in monocular mode, 2 in stereo mode    
    for (var _i = 0, _a = app.view.getSubviews(); _i < _a.length; _i++) {
        var subview = _a[_i];
        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);

        // the underlying system provide a full projection matrix
        // for the camera
        camera.projectionMatrix.fromArray(subview.projectionMatrix);

        // set the viewport for this view
        var _b = subview.viewport, x = _b.x, y = _b.y, width = _b.width, height = _b.height;

        // set the webGL rendering parameters and render this view
        renderer.setViewport(x, y, width, height);
        renderer.setScissor(x, y, width, height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
    }
});'
%}

With these two events, the code for the first example is complete.  The code in the render event listener will be discussed in greater detail in [part 3](../part3) of this tutorial in conjunction with the discussion of how an Argon application should handle Argon4's *Stereo Viewer Mode*.

## Epiloge: Modern GPS and Location Technology

When you run the [Live Demo](/code/1-geopose) of this part of the tutorial on a modern phone or tablet, you will likely notice the cube moving around in a very erratic fashion.  The Global Positioning System (GPS) used in phones and (some) tablets is more than adequate for 2D mapping applications. However, when viewed from a first-person augmented reality perspective, its limitations become obviously.  On most devices, the location is updated once per second, and the accuracy is relatively poor (in the 2-5 meter range).  This means the position of the phone (the viewer) only changes once per second, no matter how the user is moving;  in this example, this manifests as the cube appearing to move once per second (the cube isn't moving;  the viewer's location is).

Worse, an accuracy of 2-5 meters means that the GPS system on the phone reports your position as being within 2-5 meters of your actual position, and that position could change each second *even if you aren't moving*.  Essentially, each second, the position of the phone is reported as being somewhere within a few meters of its true location, and it is impossible to predict whether that will be north or south, east or west, up or down from the true location.  Furthermore, anything that blocks your device's view of the GPS satellites in the sky will make these errors worse:  dense tree foliage or tall buildings could case the estimate of the device position to fall to only being within 10 or more meters of its true location.  And if you move inside a building, the GPS system stops working entirely, causing the device to fall back to the crude location estimate provided by the operating system (typically based on the signal strength of WIFI).

This is not meant as a criticism of the location tracking capabilities of modern mobile devices; the fact that a tiny chip with a small antenna can determine its location on the earth to within a few meters based on the extrememly low-power signals from a few dozen GPS satellites is amazing.  

However, as an AR developer, you must be aware of the limitations of the location tracking hardware in the devices if you are to create compelling experiences for your users.  

