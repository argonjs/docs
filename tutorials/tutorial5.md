---
layout: page
title: Tutorial 5 - Directions CSS
permalink: /tutorials/tutorial5
nav_order: 55
nav_subpage: 1
---

This tutorial explains the CSS version of the directions example in Samples. The text below will be changed to match the sample

Critical here is to contextualize why you would want to "put stuff around the user but not attached to the world.".

Reiterate the relationship between geospatial coordinates and local, 3D coordinates.

---


## Directions CSS

Intro text here

**Demo/needed files**
Download [Argon4](https://itunes.apple.com/us/app/argon4/id944297993?ls=1&mt=8) on your phone (if you haven't already done this) and [try Directions CSS](argon4://tutorials.argonjs.io/code/5-directionsHTML)

If you download the zip of the example for this tutorial, you will find the follow files:

* index.html (the launch file, whichimports the needed js frameworks and calls app.js),
* app.js (holding the developer's code),
* app.ts (the typescript version of the code, explained below), 
* a resources folder including:
* argon.umd.js (containing the argon javascript framework), 
* three.js.min (a 3D graphcs framework) and other frameworks,
* a textures folder containing box.png (a texture used in the example)

These are all the assets you need to serve Directions CSS. If you upload the tutorial1 folder to your own server, then you can serve the example to any Argon4 browser on a iPhone or iPad. 

### The launch file (index.html)

The launch file has the same structure as in Tutorial 1. 

{% highlight html %}
<html>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
  <head>
    <title>Tutorial 2 - Simple Argon Application</title>
    <script src="./resources/lib/three/three.min.js"></script>
    <script src="./resources/lib/argon.umd.js"></script>
  </head>
  <body>
    <div id="argon"></div>
    <script src="./app.js"></script>   
  </body>

</html>
{% endhighlight %}

As in Tutorial 1, a separate file, app.js (the Typescript version is app.ts), contains the application code. 

### The application code (Typescript and Javascript)

The code below is similar to Tutorial 1. 

{% include code_highlight.html
tscode='
var boxGeoObject = new THREE.Object3D;
'
jscode='
var boxGeoObject = new THREE.Object3D;
'
%}


### Please continue to [Tutorial 6 (Directions WebGL)]({{ site.baseurl }}tutorials/tutorial6).

### For more details about the methods discussed above, please refer to [Argonjs documentation](http://argonjs.io/argon/index.html)


---OLD VERSION

### Before you start
Make sure you have completed [tutorial 1](/tutorials/tutorial1)

### What you should see
**Quick Demo:**
Download [Argon4](https://itunes.apple.com/us/app/Argon4/id944297993?ls=1&mt=8) and [Try Now](argon4://argon4-code/directions)

As you move your camera around, you should see direction markers (north, east, south, west, up and down) positioned in space.
{% include tutorial2Video.html %}

### Introduction
This example demonstrates how to position content in space relative to the camera, which the user can view around her when she loads the application into Argon4.

### Main file (index.html)
In the index.html file, we explain what the example does in the body tag: this will appear when the user enters Page Mode.

{% highlight html %}
<body style="background-color:rgba(255,255,255,0.7)">
    <h2>Six directions example</h2>
    <p>This example displays the reference frame around the camera in Cartesian coordinates (x, y, x). It puts a image in the negative and positive directions: x is left/right; y is up/down; z is back/front. A div is created in each of these directions and converted to cssObject (in three.js) at 200 units from the origin. These cssObjects are then added to the eyeOrigin. The eyeOrigin is the position of the camera: the cssObjects will always appear in the same locations relative to the camera. </p>   
  </body>
{% endhighlight %}

### Code file (app.ts and app.js)
This example (like the next one, Periodic table) is adapted and simplified from the three.js periodic table example. For the original version, see http://threejs.org/examples/#css3d_periodictable.

We start by initializing (see [1-Getting Started]({{ site.baseurl }}tutorials/tutorial1)).

{% highlight js %}
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);
{% endhighlight %}

Since we are creating a compass, we set the local origin to EUS so that +X is east, +Y is up, and +Z is south . This is just an example, use whatever origin you prefer.

{% include code_highlight.html
tscode='
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

    const eyeOrigin = new THREE.Object3D;
    scene.add(eyeOrigin);
})'
jscode='
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

    var eyeOrigin = new THREE.Object3D;
    scene.add(eyeOrigin);
});'
%}



eyeOrigin is linked to the entity that contains the position of the camera. Since we made eyeOrigin the root object in three.js, all 6 directional signs will be positioned relative to eyeOrigin.


### Creating and placing the 6 directional signs around the camera / user

First, we create 6 divs to indicate the x y z positioning
{% include code_highlight.html
tscode="
const divXpos = document.createElement('div')
const divXneg = document.createElement('div')
const divYpos = document.createElement('div')
const divYneg = document.createElement('div')
const divZpos = document.createElement('div')
const divZneg = document.createElement('div')"
jscode="
var divXpos = document.createElement('div');
var divXneg = document.createElement('div');
var divYpos = document.createElement('div');
var divYneg = document.createElement('div');
var divZpos = document.createElement('div');
var divZneg = document.createElement('div');"
%}

Then, we programmatically create a stylesheet for our direction divs and add it to the document
{% include code_highlight.html
tscode="
const style = document.createElement('style');
style.type = 'text/css';
document.head.appendChild(style);
const sheet = <CSSStyleSheet>style.sheet;
sheet.insertRule('
  .direction {
      opacity: 0.5;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      line-height: 100px;
      fontSize: 20px;
      text-align: center;
  }', 0);"
jscode='
var style = document.createElement("style");
style.type = "text/css";
document.head.appendChild(style);
var sheet = style.sheet;
sheet.insertRule("
\n    .direction 
{\n        opacity: 0.5;\n        width: 100px;\n        height: 100px;\n        border-radius: 50%;\n        line-height: 100px;\n        fontSize: 20px;\n        text-align: center;\n    }\n", 0);'
%}

Meanwhile, we put content in each one, by using a couple of functions.
{% include code_highlight.html
tscode='
// for X
divXpos.className = "direction"
divXpos.style.backgroundColor = "red"
divXpos.innerText = "East (+X)"

divXneg.className = "direction"
divXneg.style.backgroundColor = "red"
divXneg.innerText = "West (-X)"

// for Y
divYpos.className = "direction"
divYpos.style.backgroundColor = "blue"+
divYpos.innerText = "Up (+Y)"

divYneg.className = "direction"
divYneg.style.backgroundColor = "blue"
divYneg.innerText = "Down (-Y)"

//for Z
divZpos.className = "direction"
divZpos.style.backgroundColor = "green"
divZpos.innerText = "South (+Z)"

divZneg.className = "direction"
divZneg.style.backgroundColor = "green"
divZneg.innerText = "North (-Z)" '
jscode='
// for X
divXpos.className = "direction";
divXpos.style.backgroundColor = "red";
divXpos.innerText = "East (+X)";
divXneg.className = "direction";
divXneg.style.backgroundColor = "red";
divXneg.innerText = "West (-X)";
// for Y
divYpos.className = "direction";
divYpos.style.backgroundColor = "blue";
divYpos.innerText = "Up (+Y)";
divYneg.className = "direction";
divYneg.style.backgroundColor = "blue";
divYneg.innerText = "Down (-Y)";
//for Z
divZpos.className = "direction";
divZpos.style.backgroundColor = "green";
divZpos.innerText = "South (+Z)";
divZneg.className = "direction";
divZneg.style.backgroundColor = "green";
divZneg.innerText = "North (-Z)";'
%}


Here, we create 6 CSS3DObjects in the scene graph:
{% include code_highlight.html
tscode='
var cssObjectXpos = new THREE.CSS3DObject(divXpos)
var cssObjectXneg = new THREE.CSS3DObject(divXneg)
var cssObjectYpos = new THREE.CSS3DObject(divYpos)
var cssObjectYneg = new THREE.CSS3DObject(divYneg)
var cssObjectZpos = new THREE.CSS3DObject(divZpos)
var cssObjectZneg = new THREE.CSS3DObject(divZneg)

// the width and height is used to align these objects.
cssObjectXpos.position.x = 200.0
cssObjectXpos.rotation.y = - Math.PI / 2

cssObjectXneg.position.x = -200.0
cssObjectXneg.rotation.y = Math.PI / 2

// for Y
cssObjectYpos.position.y = 200.0
cssObjectYpos.rotation.x = Math.PI / 2

cssObjectYneg.position.y = - 200.0
cssObjectYneg.rotation.x = - Math.PI / 2

// for Z
cssObjectZpos.position.z = 200.0
cssObjectZpos.rotation.y = Math.PI

cssObjectZneg.position.z = -200.0'
jscode='
var cssObjectXpos = new THREE.CSS3DObject(divXpos)
var cssObjectXneg = new THREE.CSS3DObject(divXneg)
var cssObjectYpos = new THREE.CSS3DObject(divYpos)
var cssObjectYneg = new THREE.CSS3DObject(divYneg)
var cssObjectZpos = new THREE.CSS3DObject(divZpos)
var cssObjectZneg = new THREE.CSS3DObject(divZneg)

// the width and height is used to align these objects.
cssObjectXpos.position.x = 200.0
cssObjectXpos.rotation.y = - Math.PI / 2

cssObjectXneg.position.x = -200.0
cssObjectXneg.rotation.y = Math.PI / 2

// for Y
cssObjectYpos.position.y = 200.0
cssObjectYpos.rotation.x = Math.PI / 2

cssObjectYneg.position.y = - 200.0
cssObjectYneg.rotation.x = - Math.PI / 2

// for Z
cssObjectZpos.position.z = 200.0
cssObjectZpos.rotation.y = Math.PI

cssObjectZneg.position.z = -200.0'
%}

Finally, we attach all six of the signs to the eyeOrigin.
{% include code_highlight.html
tscode='
eyeOrigin.add(cssObjectXpos)
eyeOrigin.add(cssObjectXneg)
eyeOrigin.add(cssObjectYpos)
eyeOrigin.add(cssObjectYneg)
eyeOrigin.add(cssObjectZpos)
eyeOrigin.add(cssObjectZneg)'
jscode='
eyeOrigin.add(cssObjectXpos)
eyeOrigin.add(cssObjectXneg)
eyeOrigin.add(cssObjectYpos)
eyeOrigin.add(cssObjectYneg)
eyeOrigin.add(cssObjectZpos)
eyeOrigin.add(cssObjectZneg)'
%}

 Because all the objects are placed relative to the eyeOrigin, they will move with the user/camera. In the next tutorial [Tutorial 3 - Periodic Table]({{ site.baseurl }}tutorials/tutorial3)), we show a more elaborate version of this same idea and also illustrate how the user can interact with 3D objects through the use of buttons on the screen.
