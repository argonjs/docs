---
layout: page
title: 'Part 1: Getting Started'
---

**Demo/needed files**
Download [Argon4](https://itunes.apple.com/us/app/argon4/id944297993?ls=1&mt=8) on your phone (if you haven't already done this) and [try Geolocated Cube](argon4://tutorials.argonjs.io/code/1-geopose)

If you download the zip of the example for this tutorial, you will find the follow files:

* index.html (the launch file, whichimports the needed js frameworks and calls app.js),
* app.js (holding the developer's code),
* app.ts (the typescript version of the code, explained below), 
* a resources folder including:
* argon.umd.js (containing the argon javascript framework), 
* three.js.min (a 3D graphcs framework) and other frameworks,
* a textures folder containing box.png (a texture used in the example)

These are all the assets you need to serve Geolocated Cube. If you upload the tutorial1 folder to your own server, then you can serve the example to any Argon4 browser on a iPhone or iPad. Let's examine the example in detail. 

In general, *argon.js* apps can be structured however you want. For this tutorial
we follow a [single-page app](https://en.wikipedia.org/wiki/Single-page_application)
structure, in which the entire app loads from one html page. As such, the first thing we
should examine is our html file:

```html
<html>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
  <head>
    <title>My Awesome argon.js App</title>
    <script src="./resources/lib/argon.umd.js"></script>
  </head>
  <body>
    <div id="argon"></div>
    <script src="./app.js"></script>   
  </body> 
</html>
```
> Note: Don't forget the meta viewport tag, it's important!
> Also, the simplest way to get started is to load the `argon.umd.js` library globally
by placing it directly in a script tag in your html as you see here. However, if you are comfortable 
with using a module loader such as `jspm`, `webpack`, `browserify`, etc., then feel free to 
import `argon.js` via your favorite javascript package manager (see the [Quick Start](/start/setup/) guide).

As you see here, the application code is not included in the html file. We recommend that you segregate the code into one or more external files. The main application file should be included just before the end-body tag.

In addition to offering AR features (such as geolocation, video of the surrounding world, 3D graphics and image tracking), the Argon4 browser is a standard web browser (i.e., on iOS, it uses Apple's Webkit engine) and can therefore render just about any web content. You can take advantage of these capabilities in two ways

* First, argon uses (or creates) a special div with the id "argon". Anything you put in this div (or in divs nested inside this one) will be rendered on the screen in 2D, in front of the 3D AR context (Argon creates a CSS 3D perspective div and/or WebGL canvas behind any other content in this div, into which the 3D AR content is rendered). 

* Second, because Webkit is a full-featured HTML5 engine (used by Safari), Argon can render most web pages (e.g., including those without any AR features). Just type the url into the text box.

### The application code (Typescript and Javascript)
Segregating the javascript code into a file separate from index.html allows for a cleaner workflow as well as the use of Javascript development tools to transcode, minify or otherwise manipulate your code. We name the file app.js in each of the tutorials.

The code for these tutorials was written in Typescript, [a typed superset of Javascript that compiles to plain Javascript](https://www.typescriptlang.org). The code snippets in these tutorials are given in both forms. Both an app.ts (typescript) and app.js (javascript) file are included in the example folders, but only the app.js file is actually downloaded and used in executing the channel. 

Note: These tutorials assume that you are already familiar with the fundamentals of computer graphics: the concept of the scene graph, creating and manipulating 3D objects and textures, the camera, etc. Argon currently uses the javascript graphics framework three.js to create and manage the scenegraph. See [threejs.org for a complete description](http://threejs.org).

In order to initialize Argon, this example, like most Argon channels, begins with:

{% include code_highlight.html
tscode='
declare const Argon:any;
const app = Argon.init();
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
app.view.element.appendChild(renderer.domElement);
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);'
jscode='
var app = Argon.init();
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
app.view.element.appendChild(renderer.domElement);
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);'
%}

To display graphics with [Three.js](http://threejs.org/docs/#Manual/Introduction/Creating_a_scene), we need three things: a scene, a camera, and a renderer.

* The first lines of the above code initialize Argon, then create a scene object and camera in three.js.
* userLocation is an object that defines the position of the user (normally the same as the camera. since the user is holding the camera in their hand). 
* Both camera and userlocation are added to the scene graph. 
* Line 3 indicates which renderer this web application will use. Here, the WebGL renderer is used. This renderer should be fast because its code is executed in the GPU hardware of the device. 

One current alternative (generally slower) renderer is the CSS3DRenderer:

{% include code_highlight.html
tscode='
const cssRenderer = new THREE.CSS3DRenderer();
app.viewport.element.appendChild(cssRenderer.domElement);'
jscode='
var cssRenderer = new THREE.CSS3DRenderer();
app.viewport.element.appendChild(cssRenderer.domElement);'
%}

Although slower than the WebGL renderer for 3D, the CSS renderer has the advantage that it is easier to manipulate html dom elements (divs etc.).  If you do use the CSSrenderer, you also need to include the appropriate script in the index.html file:

{% highlight html %}
  <head>
...
    <script src="./resources/lib/CSS3DRenderer.js"></script>
  </head>

{% endhighlight %}

After the above initialization, you then write additional code to create and manipulate the elements of your particular application, as the first example below illustrates. 


### Creating the cube
In this first example we create a simple box (cube) using methods provided by three.js and then position that box in the world. This code creates the box and adds a texture to it:
{% include code_highlight.html
tscode='
var boxGeoObject = new THREE.Object3D;
var box = new THREE.Object3D
var loader = new THREE.TextureLoader()
loader.load( "./resources/textures/box.png", function ( texture ) {
    var geometry = new THREE.BoxGeometry(2, 2, 2)
    var material = new THREE.MeshBasicMaterial( { map: texture } )
    var mesh = new THREE.Mesh( geometry, material )
    box.add( mesh )
})
'
jscode='
var boxGeoObject = new THREE.Object3D;
var box = new THREE.Object3D
var loader = new THREE.TextureLoader()
loader.load( "./resources/textures/box.png", function ( texture ) {
    var geometry = new THREE.BoxGeometry(2, 2, 2)
    var material = new THREE.MeshBasicMaterial( { map: texture } )
    var mesh = new THREE.Mesh( geometry, material )
    box.add( mesh )
})
'
%}

We have created two objects (the box itself and boxGeoObject to which to attach the box). In order to give the box a geolocation, we have to create a third object, boxGeoEntity. This complex object has elements for the position and orientation according the Cesium positioning system that Argon uses. ([Cesium](https://cesiumjs.org) is a javascript framework for creating globes and maps.) The default coordinate frame used by Argon is Cesium's FIXED frame, which is centered at the center of the earth and oriented with the earth's axes. Within this fixed Cesium reference frame, Argon defines a local coordinate frame that sits on a plane tangent to the earth near the user's current location.  This local frame automatically changes if the
user moves more than a few kilometers. 


{% include code_highlight.html
tscode='
var boxGeoEntity = new Argon.Cesium.Entity({
    name: "I have a box",
    position: Cartesian3.ZERO,
    orientation: Cesium.Quaternion.IDENTITY
});
boxGeoObject.add(box);
'
jscode='
var boxGeoEntity = new Argon.Cesium.Entity({
    name: "I have a box",
    position: Cartesian3.ZERO,
    orientation: Cesium.Quaternion.IDENTITY
});
boxGeoObject.add(box);
'
%}

Up to this point, we have the box (a textured cube) object attached it to a geoEntity.  We have not yet actually located that entity in the world. The position of boxGeoEntity is set to (0,0,0) by default. We geolocate the boxGeoEntity in the first of the two event listener described below.


### Two important event listeners

These two event listeners (updateEvent and renderEvent) should always be included in your code. 

The update event listener is called before the 3D world (the scene-graph) is rerendered. This is the event where your application should generally make changes to the scene (adding, manipulating, or deleting objects you have created). In this example, the first time the update event is called, we place the box in a geospatial position near (10 meters to the right of) the user.  After that, the update just changes the position and orientation of the box based on changes to the user's position and orientation. It also rotates the box each time through the loop for visual interest. 


{% include code_highlight.html
tscode='
var boxInit = false;
var lastTime = null;

app.updateEvent.addEventListener(() => {
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    } else {
        // user poser not known, then give up
        return;
    } 
    // set the box geoposition the first time through.
    // set it to the position of the user (phone) + 10 meters to the right (x pos)
    if (!boxInit) {
        const frame = app.context.getDefaultReferenceFrame();
        const boxPos = userPose.position.clone();
        boxPos.x += 10;
        boxGeoEntity.position.setValue(boxPos, frame);        
        boxGeoEntity.orientation.setValue(Cesium.Quaternion.IDENTITY);
        const boxPoseFIXED = app.context.getEntityPose(boxGeoEntity, ReferenceFrame.FIXED);

        if (boxPoseFIXED.poseStatus & Argon.PoseStatus.KNOWN) {
            boxInit = true;
            boxGeoEntity.position.setValue(boxPoseFIXED.position, ReferenceFrame.FIXED);
            boxGeoEntity.orientation.setValue(boxPoseFIXED.orientation);
            scene.add(boxGeoObject);
        }
    }

    // get the local coordinates of the box, and update the position and orientation of the boxobject
    var boxPose = app.context.getEntityPose(boxGeoEntity);
    boxGeoObject.position.copy(boxPose.position);        
    boxGeoObject.quaternion.copy(boxPose.orientation);

    // rotate the box at a constant speed, independent of frame rates
    var deltaTime = 0;
    if (lastTime) {
        deltaTime = JulianDate.secondsDifference(app.context.getTime(), lastTime);
    } else {
        lastTime = new JulianDate();
    }
    lastTime = app.context.getTime().clone(lastTime);
    box.rotateY( 3 * deltaTime);
})'
jscode='
var boxInit = false;
var lastTime = null;
app.updateEvent.addEventListener(function () {

    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }
    else {
        // user pose not known, then give up
        return;
    }
    // set the box geoposition the first time through.
    // set it to the position of the user (phone) + 10 meters to the right (x pos)    
    if (!boxInit) {
        var frame = app.context.getDefaultReferenceFrame();
        var boxPoseFIXED = app.context.getEntityPose(boxGeoEntity, ReferenceFrame.FIXED);
        if (boxPoseFIXED.poseStatus & Argon.PoseStatus.KNOWN) {
            boxInit = true;
            boxGeoEntity.position.setValue(boxPoseFIXED.position, ReferenceFrame.FIXED);
            boxGeoEntity.orientation.setValue(boxPoseFIXED.orientation);
            scene.add(boxGeoObject);
        }
    }
    var boxPose = app.context.getEntityPose(boxGeoEntity);
    boxGeoObject.position.copy(boxPose.position);
    boxGeoObject.quaternion.copy(boxPose.orientation);
    // rotate the box at a constant speed, independent of frame rates
    var deltaTime = 0;
    if (lastTime) {
        deltaTime = JulianDate.secondsDifference(app.context.getTime(), lastTime);
    }
    else {
        lastTime = new JulianDate();
    }
    lastTime = app.context.getTime().clone(lastTime);
    box.rotateY(3 * deltaTime);
});
'
%}



The other event is the render event itself, which is called each time the frame is redrawn. Argon now supports stereo viewing. So the render event calls the WebGL (or the CSS) renderer for 1 subview in the case of full screen viewing or 2 subviews in the case of stereoviewing. 


{% include code_highlight.html
tscode='
app.renderEvent.addEventListener(() => {
    // set the renderers to know the current size of the viewport.
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
})'
jscode='
app.renderEvent.addEventListener(function () {
    // set the renderers to know the current size of the viewport.
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
        // for the camera. 
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

With these two events, the code for the first example is complete. 


### Please continue to [Tutorial 4 (Vuforia)]({{ site.baseurl }}tutorial/part4).


### For more details about the methods discussed above, please refer to [Argonjs documentation](http://argonjs.io/argon/index.html)



