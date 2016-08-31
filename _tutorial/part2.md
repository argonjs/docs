---
layout: page
title: 'Part 2: Adding HTML Content'
---
> Download [Argon4](http://argonjs.io/argon-app) and the [Tutorial Source Code](https://github.com/argonjs/docs/tree/gh-pages/code). <br> This tutorial uses the *2-html* and *resources* directories.<br> **[Live Demo](/code/2-html)**

This tutorial will expand on the geospatial cube example developed in [part 1](../part1) of the tutorial to include HTML content, highlighting the issues programmers should be aware of when adding HTML elements to the 2D display and into the 3D scene. While the focus is on integrating HTML content with the [three.js](http://threejs.org) rendering framework used in the examples, the underlying issues will be similar for any rendering system.

Although more limited than WebGL for creating 3D content, any HTML elements (interactive DIVs, movies, etc.) can be placed in 3D, greatly simplifying certain kinds of application content.  The biggest limitation of using both WebGL and 3D HTML content is that they cannot be mixed seamlessly in 3D space: the WebGL `canvas` element and the HTML `perspective` element are separate DOM elements, and whichever is placed in front has all of it's content (regardless of 3D position) in front of all of the content of the other.  

Correctly handling HTML content in an Argon applications requires applications to deal with a number of issues:

1. The Argon `view` element is set to cover the screen: it it absolutely positioned and has it's size set to 100 percent width and height. To add 2D content to the view, it must be styled appropriately.
1. HTML elements are sized using a variety of CSS units that equate roughly to pixels on the display. 3D content, on the other hand, is expressed in real-world units. Argon uses meters as it's units. Items sizes need to be mapped between the two.  
2. All HTML content in the Argon div is set to not receive input by default, so that programmers can choose which elements receive input. Therefore, an element that wants to receive touch or mouse input needs to set the `pointer-events` attribute to `auto`. 
3. When Argon4 switches to *Viewer Mode*, any 2D and 3D HTML elements must be duplicated if they are to appear in both eyes.  A single DIV cannot be presented twice on the screen.  

[Part 3](../part3) of this tutorial discusses *Viewer Mode*.  This part of the tutorial address the first 3 concerns.

## Adding HTML Renderers to the Scene

[Part 1](../part1) of this tutorial created a textured cube and positioned it near the user.  In this part, an HTML element will be fixed to the display and another HTML element positioned above the cube, and their content will be updated each frame to give the user information about the state of the application.  For demonstration purposes, the 2D element attached to the display will show the user where their device thinks it is in the world, and the 2D label above the cube will tell them where the cube is. 

The Argon samples include two HTML "renderers", one for putting HTML content in 3D (`CSS3DArgonRenderer.js`, an extention of the [threejs.org](http://threejs.org) `CSS3DRenderer.js` created for Argon2) and one for adding HTML content to the the 2D display (`CSS3DArgonHUD.js`, for *heads-up display*). Both renderers mimic the relevant methods of the `WebGLRenderer` interface, making it easy to add them to the rendering event listener used in the samples.  

`CSS3DArgonRenderer.js` creates a CSS 3D `perspective` element for HTML content, and two new subclasses of `Object3D`: `CSS3DObject` allows an HTML/CSS object to be added to the three.js scene graph, and `CSS3DSprite` makes an object that is fixed size and always pointed toward the camera.  Similarly, `CSS3DArgonHUD.js` creates an absolutely positioned and sized HTML element as a container for the 2D content on the display.  (Both of these renderers support *Stereo Viewer Mode*, discussed in [part 3](../part3) of this tutorial.)

To add these two renderers to our example, initialize them immediately below where the `WebGLRenderer()` is initialized:

{% include code_highlight.html
tscode='
const cssRenderer = new (<any>THREE).CSS3DArgonRenderer();
const hud = new (<any>THREE).CSS3DArgonHUD();
app.view.element.appendChild(cssRenderer.domElement);
app.view.element.appendChild(hud.domElement);'
jscode='
var cssRenderer = new THREE.CSS3DArgonRenderer();
var hud = new THREE.CSS3DArgonHUD();
app.view.element.appendChild(cssRenderer.domElement);
app.view.element.appendChild(hud.domElement);'
%}

To use these renderers, you also need to include the scripts in the index.html file:

{% highlight html %}
<head>
    <script src="../resources/lib/CSS3DArgonRenderer.js"></script>
    <script src="../resources/lib/CSS3DArgonHUD.js"></script>
</head>
{% endhighlight %}

## Adding a HUD Element and Object Label

HTML elements can be created just as in any other web application before they are added to the the `hud` or three.js `scene`.  For simplicity, the needed elements are created in the HTML file, inside the "argon" div, where our "description" element was in [part 1](../part1) of the tutorial.

{% highlight html %}
<div id="argon">
  <div id="hud">
    <div id="menu" class="menu">
      <button class="location">lon (0) lat (0)</button>
    </div>
  </div>
  <button id="box-location" class="location">Box Location</button>
  <div onclick="hideMe(this)" id="description" >
    <h2>A Simple Geo example</h2>
    <h5>(click to dismiss)</h5>
    <p>This example takes the current location of the viewer, and positions a cube a small distance away from where the viewer was positioned when the example was loaded.  We do this by adding a small amount to our current east-west location, in the local Three.js cartesian coordinates.  This illustrates how to create geospatial content based on the current location, and update the internal geospatial location of the object.  It extends the example in part 1 by added 3D HTML content and proper handling of HTML in stereo Viewer Mode.</p>
  </div>
</div>
{% endhighlight %}

The "hud" and "description" DOM elements need to be moved to the `hud` renderer, and the "location" element from the DOM retrieved so it can be updated to contain information about the application.
 
{% include code_highlight.html
tscode="
// We put some elements in the index.html, for convenience. 
// Here, we retrieve them and move the information boxes to the 
// the CSS3DArgonHUD hudElement.
const hudContent = document.getElementById('hud');
hud.appendChild(hudContent);
var locationElements = hudContent.getElementsByClassName('location');

//  We also move the description box to the Argon HUD, but moving it inside the hud element
var hudDescription = document.getElementById( 'description' );
hudContent.appendChild(hudDescription);"
jscode="
// We put some elements in the index.html, for convenience. 
// Here, we retrieve them and move the information boxes to the 
// the CSS3DArgonHUD hudElement.
var hudContent = document.getElementById('hud');
hud.appendChild(hudContent);
var locationElements = hudContent.getElementsByClassName('location');
//  We also move the description box to the Argon HUD, but moving it inside the hud element
var hudDescription = document.getElementById('description');
hudContent.appendChild(hudDescription);"
%}

The "box-location" element is retrieved and used to create a `CSS3DSprite`, and the sprite added to the scene graph so it appears above the box.

{% include code_highlight.html
tscode='
// Create a DIV to use to label the position and distance of the cube
let boxLocDiv = document.getElementById("box-location");
const boxLabel = new THREE.CSS3DSprite(boxLocDiv);
boxLabel.scale.set(0.02, 0.02, 0.02);
boxLabel.position.set(0,1.25,0);
boxGeoObject.add(boxLabel);'
jscode='
// Create a DIV to use to label the position and distance of the cube
var boxLocDiv = document.getElementById("box-location");
var boxLabel = new THREE.CSS3DSprite(boxLocDiv);
boxLabel.scale.set(0.02, 0.02, 0.02);
boxLabel.position.set(0, 1.25, 0);
boxGeoObject.add(boxLabel);'
%}

The line `boxLabel.scale.set(0.02, 0.02, 0.02);` manages the relationship between CSS sizes and real-world sizes.  Based on the CSS styles in this example, "box-location" div is a few hundred pixels wide (depending on the exact content) and 36 pixels high. When placed in a 3D, these are the units that will be used for the CSS object, resulting in a 2D text object a few hundred *meters* wide and 36 *meters* tall.  The box, in contrast, is 1 meter on a side, and initially 10 meters away.  Scaling by 0.02 makes this label 0.72 meters high and a few meters wide, which is much more reasonable in this case.

At this point, there is a HTML element fixed to the display, and a second HTML element positioned above the cube in 3D.  The update event listener can now use the locations of the user and the cube to add some helpful text to the two HTML elements. 

First, some additional state variables are added above the update loop, along with a function to format floating point numbers for display.

{% include code_highlight.html
tscode="
var boxCartographicDeg = [0,0,0];
var lastInfoText = '';
var lastBoxText = '';

// make floating point output a little less ugly
function toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
}"
jscode="
var boxCartographicDeg = [0, 0, 0];
var lastInfoText = '';
var lastBoxText = '';
// make floating point output a little less ugly
function toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
}"
%}

Next, code is added to convert the geospatial coordinates of the cube to a more user-friendly logitude, latitude and altitude (LLA) representation.  (This conversion is somewhat expensive, so in a real application you would not want to use it carelessly;  here, for simplicity both the user and box location are computed each frame, even though the box location never changes.)

The distance between the box and the user can be computed directly in the three.js scene graph, as all objects are in the local coordinate frame, expressed in meters.

{% include code_highlight.html
tscode="
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
}"
jscode="
// stuff to print out the status message.
// It's fairly expensive to convert FIXED coordinates back to LLA, 
// but those coordinates probably make the most sense as
// something to show the user, so we'll do that computation.

// cartographicDegrees is a 3 element array containing 
// [longitude, latitude, height]
var gpsCartographicDeg = [0, 0, 0];
// get user position in global coordinates
var userPoseFIXED = app.context.getEntityPose(app.context.user, ReferenceFrame.FIXED);
var userLLA = Cesium.Ellipsoid.WGS84.cartesianToCartographic(userPoseFIXED.position);
if (userLLA) {
    gpsCartographicDeg = [
        CesiumMath.toDegrees(userLLA.longitude),
        CesiumMath.toDegrees(userLLA.latitude),
        userLLA.height
    ];
}
var boxPoseFIXED = app.context.getEntityPose(boxGeoEntity, ReferenceFrame.FIXED);
var boxLLA = Cesium.Ellipsoid.WGS84.cartesianToCartographic(boxPoseFIXED.position);
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
infoText += 'Your location is lla (' + toFixed(gpsCartographicDeg[0], 6) + ', ';
infoText += toFixed(gpsCartographicDeg[1], 6) + ', ' + toFixed(gpsCartographicDeg[2], 2) + ')';
infoText += 'box is ' + toFixed(distanceToBox, 2) + ' meters away';
var boxLabelText = 'a wooden box!<br>lla = ' + toFixed(boxCartographicDeg[0], 6) + ', ';
boxLabelText += toFixed(boxCartographicDeg[1], 6) + ', ' + toFixed(boxCartographicDeg[2], 2);
if (lastInfoText !== infoText) {
    locationElements[0].innerHTML = infoText;
    lastInfoText = infoText;
}
if (lastBoxText !== boxLabelText) {
    boxLocDiv.innerHTML = boxLabelText;
    lastBoxText = boxLabelText;
}"
%}

In this code, a HTML string is created and the innerHTML property of the appropriate DOM element is updated. To avoid unnecessary DOM repair, the property is only updated if the element changes.

Finally, the render event listerer has to update the two new renderers, in addition to the previously handled WebGL renderer:  the `cssRenderer` and `hud` have similar APIs and can therefore be added to the loop in a straightforward manner.  The entire new render update listener is shown here.

{% include code_highlight.html
tscode='
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
});'
jscode='
/ renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(function () {
    // set the renderers to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    var viewport = app.view.getViewport();
    renderer.setSize(viewport.width, viewport.height);
    cssRenderer.setSize(viewport.width, viewport.height);
    hud.setSize(viewport.width, viewport.height);
    // there is 1 subview in monocular mode, 2 in stereo mode    
    for (var _i = 0, _a = app.view.getSubviews(); _i < _a.length; _i++) {
        var subview = _a[_i];
        var frustum = subview.frustum;
        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);
        // the underlying system provide a full projection matrix
        // for the camera. 
        camera.projectionMatrix.fromArray(subview.projectionMatrix);
        // set the viewport for this view
        var _b = subview.viewport, x = _b.x, y = _b.y, width = _b.width, height = _b.height;
        // set the CSS rendering up, by computing the FOV, and render this view
        camera.fov = THREE.Math.radToDeg(frustum.fovy);
        cssRenderer.setViewport(x, y, width, height, subview.index);
        cssRenderer.render(scene, camera, subview.index);
        // set the webGL rendering parameters and render this view
        renderer.setViewport(x, y, width, height);
        renderer.setScissor(x, y, width, height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
        // adjust the hud
        hud.setViewport(x, y, width, height, subview.index);
        hud.render(subview.index);
    }
});'
%}

Notice how the two new renderers use analogous (although not exactly the same) calls as the WebGL renderer.  Two differences are notable.  First, both renderers take a `subview.index` parameter to their `render()` method; this is needed to support multiple viewports and will be discussed in more detail in [part 3](../part3) of this tutorial.  Second, the camera's perspective matrix is being set directly from the matrix provided by argon in this loop, but the `CSS3DArgonRenderer` also needs the `camera.fov` to be set as well, so it is set (in degrees) from the `frustum.fovy` value provided by Argon.

