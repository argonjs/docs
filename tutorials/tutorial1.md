---
layout: page
title: Tutorial 1 - Getting Started
permalink: /tutorials/tutorial1
nav_order: 51
nav_subpage: 1
---

### Welcome
**Quick Demo:**
Download [Argon4](https://itunes.apple.com/us/app/argon4/id944297993?ls=1&mt=8) and [Try Now](argon4://tutorials.argonjs.io/code/tutorials/tutorial1)

### Setting up

Step 1: Go to Argonjs [Github repository] (https://github.com/argonjs/argon).

Step 2: Click the “download ZIP” button to the right of the Github page.

Step 3: Unzip these files and move them onto a personal server.

Step 4: Install [Argon4](https://itunes.apple.com/us/app/argon4/id944297993?ls=1&mt=8)  from the App Store onto an iOS device.

Step 5: Access your server from the Argon4 mobile browser and open the folder containing your newly unzipped files. <a href = "code.zip">Download</a> tutorials source files from this site.

Step 6: You should see an icon on the corner of your screen. This means you have completed the tutorial!

### Introduction

An argon.js web application is created like any other web application; a server responds to http protocol requests and delivers an HTML5 web application to the browser. In the examples in these tutorials, we will use static HTML and Javascript files, but any dynamic web application server could be used. The files will include argon.js (as well other javascript libraries such as three.js, a 3D framework). The main or launch file (e.g. index.html) has the following structure:

{% highlight html %}
</html>
<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">

<script src="../resources/lib/three.min.js"></script>
<script src="../resources/lib/CSS3DRenderer.js"></script>
<script src="../resources/lib/argon.umd.js"></script>

<!-- style sheets for styling the elements in the body -->
<link rel="stylesheet" type="text/css" href="style.css">

<body>
    <div id="argon-immersive-context">
         <!--any html for interface elements etc.
          that will appear on the screen in AR mode-->
    </div>
    <div>
        <!--one or more divs that you want
        to appear in "page mode" described below-->
    </div>
<!--application javascript code-->
<script src="app.js"></script>
</body>
</html>
{% endhighlight %}

In all the examples, we follow a coding style that does not include any inline Javascript, but rather puts the main application code in an external javascript file included just before the end-body tag.

### The html page (index.html)

In addition to offering AR features (such as geolocation, video of the surrounding world, 3D graphics and image tracking), the Argon4 browser is a standard web browser (i.e., on iOS, it uses Apple's web renderer) and can therefore render any web content available on the platform. You can take advantage of these capabilities in three ways.

* First, argon uses (or creates) a special div with the id "argon-immersive-context". Anything you put in this div (or in divs nested inside this one) will be rendered on the screen in 2D, in front of the 3D AR context (Argon creates a CSS 3D perspective div and/or WebGL canvas behind any other content in this div, into which the 3D AR content is rendered). You can use this feature to create interface elements such as display boxes or button to provide information and interactivity for your application.

* Second, you can put any additional divs into the body that you wish. These will be visible when the user puts the Argon4 browser into "Page Mode" by touching the toggle button in the upper right hand corner of the interface. Argon4 will enable the "Page Mode" button when it sees non-AR content in the <body></body> of the document. Initially, this non-AR content is hidden. When the user activates Page Mode, the 3D content in that channel disappears (i.e., the content inserted into the argon-immersive-context), and the user sees the other HTML of the page (which is normally hidden). You can use this feature to add instructions, text, images, or any other multimedia content to your experience. For example, in tutorials 2-6, we add text that explains the purpose of the example.

* Third, because Webkit is a full-featured HTML5 engine (used by Safari), Argon can render most web pages (e.g., including those without any AR features). Just type the url into the text box.

### The application code (app.ts and app.js)
As noted, we place the application javascript in a separate file (you can create your web applications as you see fit, placing all content wherever you prefer, as with any web application). Segregating the javascript code into a file separate from index.html file allows for a cleaner workflow as well as the use of a wide variety of Javascript development tools to transcode, minify or otherwise manipulate your code. We name the file app.js in each of the tutorials.

The code for these tutorials was written in Typescript, [a typed superset of Javascript that compiles to plain Javascript](https://www.typescriptlang.org). The code snippets in these tutorials are given in both forms. And both a .ts and .js file are included in the example folders, but only the .js file is actually downloaded and used in executing the channel. 

Argon currently uses the javascript graphics framework three.js to create and manage the scenegraph. See [threejs.org for a complete description](http://threejs.org).

In order to initialize Argon, scripts typically begin with:

{% include code_highlight.html
tscode='
declare const THREE:any;
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

To actually be able to display anything with [Three.js](http://threejs.org/docs/#Manual/Introduction/Creating_a_scene), we need three things: a scene, a camera, and a renderer so we can render the scene with the camera.

* The first lines of the above code initiatlize Argon, then create a scene object and camera in three.js.
* userLocation is an object that defines the position of the user (normally the same as the camera) 
* Both camera and userlocation are added to the scene graph 
* Line 3 indicates which renderer this web application will use. Here, the three.js CSS renderer is used. Threejs’ CSS3DRenderer allows you to create HTML elements and control them via Threejs. Then, you are able to translate and rotate a 3D object relative to the coordinates within the Threejs canvas.
Alternatives include the WebGL renderer:

{% include code_highlight.html
tscode='
const webglRenderer = new THREE.WebGLRenderer({ alpha: true, logarithmicDepthBuffer: true });'
jscode='
var webglRenderer = new THREE.WebGLRenderer({ alpha: true, logarithmicDepthBuffer: true });'
%}

Together these lines initialize the argon.ts(argon.js) framework to use the device’s camera to display the world as an immersive background and create a scene graph to which the channel can attach 3D content.  You then add the javascript code that creates and manipulates that content. For a first example of how this works, continue to [Tutorial 2(Compass)]({{ site.baseurl }}tutorials/tutorial2).

### Typescript
All the tutorials include the code in Typescript and Javascript version. The default display setting is Typescript.
Typescript is prefered for development of Argon 4. Typescript has various advantages such as simple constructor, auto declaration feature, and ease of use. 

### Additional code
{% include code_highlight.html
tscode='
// set the local origin to EUS so that 
// +X is east, +Y is up, and +Z is south 
// (this is just an example, use whatever origin you prefer)
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);

app.updateEvent.addEventListener(() => {
    const frustum = app.camera.currentFrustum;
    camera.fov = Argon.Cesium.CesiumMath.toDegrees(frustum.fovy);
    camera.aspect = frustum.aspectRatio;
    camera.projectionMatrix.fromArray(frustum.infiniteProjectionMatrix);

    // We can optionally provide a second argument to getCurrentEntityState
    // with a desired reference frame. Otherwise, the implementation uses
    // the default origin as the reference frame. 
    const eyeState = app.context.getCurrentEntityState(app.context.eye);

    if (eyeState.poseStatus | Argon.PoseStatus.KNOWN) {
        camera.position.copy(eyeState.position);
        camera.quaternion.copy(eyeState.orientation);
        eyeOrigin.position.copy(eyeState.position);
    }
})


app.renderEvent.addEventListener(() => {
    const {width, height} = app.viewport.current;
    cssRenderer.setSize(width, height);
    cssRenderer.render(scene, camera);
})'
jscode='
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
});'
%}


The above code mentions important statements used in Argon 4:

* setDefaultReferenceFrame: lets you set the local origin to EUS so that +X is east, +Y is up, and +Z is  south.
* updateEvent: lets you update your scene-graph based on the current state of reality
* app.renderEvent: lets you render your scene-graph

### If you want to learn more, please refer to [Argonjs documentation](http://argonjs.io/argon/index.html)



