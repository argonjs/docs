---
layout: page
title: 'Part 3: Stereo Viewer Mode'
---
> Download [Argon4](http://argonjs.io/argon-app) and the [Tutorial Source Code](https://github.com/argonjs/docs/tree/gh-pages/code). <br> This tutorial uses the *3-stereo* and *resources* directories.<br> **[Live Demo](/code/3-stereo)**

One of the features of the Argon4 browser is its support for *Viewer Mode*, allowing the user to switch into a stereo view suitable for Google Cardboard and similar phone-based 3D viewers. argon.js generalizes the idea of stereo viewing by supporting an arbitrary number of views within its main view. The goal is not just to support stereo head-worn displays, but eventually support other forms of AR, such as the multi-projector room mapping done by Microsoft's [RoomAlive](https://github.com/Kinect/RoomAliveToolkit) project.  

Revisiting the render update listener from [part 2](../part2), you can see how this manifests itself in your code.

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
        // the underlying system provides a full projection matrix
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
        // the underlying system provides a full projection matrix
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

The `getViewport()` method retrieves the current view specification from Argon, `{x, y, width, height}`. This viewport defines the location and size that the total view should cover. Argon's view element will already be sized and positioned appropriately, so the renderers only need to set their size.

The `getSubviews()` method returns an array of subview specifications.  Each subview contains

- `index`, an integer identifying this view, starting at 0.
- `type` of the subview: the only subview (`SINGULAR`), used for the left or right eye in stereo mode (`LEFTEYE`, `RIGHTEYE`) or some other subview (`OTHER`)
- `projectionMatrix` for the camera of the subview, a 16 element projection matrix.
- `frustum` of this camera, should match the `projectionMatrix`
- `pose` of the camera for this subview.
- `viewport` of this subview, relative to the main view.

You can see each of these used in the render update listener above.

In the for loop in the render event listener, the scene is rendered into each subview.  The `camera` object is reset each time through the loop, and each of the renderers are called to render the scene.  For the WebGL renderer, this is a straightforward operation: each render step completely re-renders the scene to the appropriate part of the view.

For the two HTML/CSS renderers, you are faced with the problem that "rendering" an HTML scene does not create an image in a canvas (like it does for WebGL). Rather, each of these renderers creates two HTML elements (one for the *left* and one for the *right* eye;  the *left* element is used for non-stereo views) and positions and sizes them appropriately based on the view specifications. To render, each of the HTML elements is positioned appropriately inside the HTML view elements created by the renderer.  The elements for the hud can be accessed as `hud.hudElements`; the elements for the 3D renderer can be accessed as `cssRenderer.domElements`.  Both are arrays.

For the CSS3D Renderer, each div reference by a `CSS3DObject` or `CSS3DSprite` is scaled, rotated and translated to the correct place based on the structure of the scene graph.  For the CSS3D HUD, you should already have placed the elements correctly: "rendering" simply positions and shows the HTML element corresponding to that subview.  

To support two subviews, however, the renderers must have two copies of each DOM element you want to display in stereo mode (and when argon.js eventually supports a system with more than two subviews, the renderers will need more than two copies, one for each subview.)  

These elements can be supplied by you, or a second copy can be made by the system. When the elements are added to the hud with `hud.appendChild()`, one or two elements can be supplied. If only one element is supplied, it is cloned.  Similarly, when a `CSS3DObject` or `CSS3DSprite` is created, either a single element or an array of elements can be provided.  If a single element is provided, it is cloned.

If the content of the HTML element will not change, providing one and allowing it to be cloned is the simplist approach.  But, if you want to update the contents of the element, you will likely need to provide two copies so that you can update both at the appropriate time.

## Handling HTML Elements in Stereo

The example in [part 2](../part2) did not handle the HTML elements correctly.  If you switch Argon to *Viewer Mode* while viewing the example, you'll see that the 2D "description" box is only in the left eye, the hud information element is only updating in the left eye, and the label over the box is also only updating in the left eye.

Dealing with these problems turns out to be fairly simple.  First, update the section of code where the elements are moved into the hud:

{% include code_highlight.html
tscode="
// We put some elements in the index.html, for convenience. 
// Here, we retrieve them and move the information boxes to the 
// the CSS3DArgonHUD hudElement.
const hudContent = document.getElementById('hud');
hud.appendChild(hudContent);
var locationElements = hud.domElement.getElementsByClassName('location');

// We also move the description box to the left Argon HUD.  
// We don't duplicate it because we only use it in mono mode, but will
// nest it inside another element that we can turn on and off
var holder = document.createElement( 'div' );
var hudDescription = document.getElementById( 'description' );
holder.appendChild(hudDescription);
hudContent.appendChild(holder);"
jscode="
// We put some elements in the index.html, for convenience. 
// Here, we retrieve them and move the information boxes to the 
// the CSS3DArgonHUD hudElement.
var hudContent = document.getElementById('hud');
hud.appendChild(hudContent);
var locationElements = hud.domElement.getElementsByClassName('location');
// We also move the description box to the left Argon HUD.  
// We don't duplicate it because we only use it in mono mode, but will
// nest it inside another element that we can turn on and off
var holder = document.createElement('div');
var hudDescription = document.getElementById('description');
holder.appendChild(hudDescription);
hudContent.appendChild(holder);"
%}
The first part, where `hudContent` is appended to the `hud`, does not need to change.  `appendChild()` already clones the element and adds the two copies to the two sides of the hud, and `getElementsByClassName()` will return both copies of the element with "location" as a class.

The second part is changed to create a new element, and nest the "description" box inside it.  The element is not duplicated because we want to hide this element in stereo mode.

Similarly, when the `CSS3DSprite` is created, two elements should be passed to it, so that you have a reference to both elements so the `innerHTML` of both can be updated.

{% include code_highlight.html
tscode='
// Create a DIV to use to label the position and distance of the cube
let boxLocDiv = document.getElementById("box-location");
let boxLocDiv2 = boxLocDiv.cloneNode(true) as HTMLElement;
const boxLabel = new THREE.CSS3DSprite([boxLocDiv, boxLocDiv2]); '
jscode='
// Create a DIV to use to label the position and distance of the cube
var boxLocDiv = document.getElementById("box-location");
var boxLocDiv2 = boxLocDiv.cloneNode(true);
var boxLabel = new THREE.CSS3DSprite([boxLocDiv, boxLocDiv2]);'
%}

Next, in the update event listener, both copies of the "location" element stored in `locationElements` should be updated, as well as both `boxLocDiv` and `boxLocDiv2`.
{% include code_highlight.html
tscode='
if (lastInfoText !== infoText) { 
    locationElements[0].innerHTML = infoText;
    locationElements[1].innerHTML = infoText;
    lastInfoText = infoText;
}

if (lastBoxText !== boxLabelText) { 
    boxLocDiv.innerHTML = boxLabelText;
    boxLocDiv2.innerHTML = boxLabelText;
    lastBoxText = boxLabelText;
}'
jscode='
if (lastInfoText !== infoText) {
    locationElements[0].innerHTML = infoText;
    locationElements[1].innerHTML = infoText;
    lastInfoText = infoText;
}
if (lastBoxText !== boxLabelText) {
    boxLocDiv.innerHTML = boxLabelText;
    boxLocDiv2.innerHTML = boxLabelText;
    lastBoxText = boxLabelText;
}'
%}

Lastly, in the render update listener, by checking if there is more than 1 subview you know if you are in stereo or non-stereo mode, and can show or hide the `holder` element appropriately. 
{% include code_highlight.html
tscode="
// There is 1 subview in monocular mode, 2 in stereo mode.
// If we are in mono view, show the description.  If not, hide it, 
if (app.view.getSubviews().length > 1) {
  holder.style.display = 'none';
} else {
  holder.style.display = 'block';
}"
jscode="
// There is 1 subview in monocular mode, 2 in stereo mode.
// If we are in mono view, show the description.  If not, hide it, 
if (app.view.getSubviews().length > 1) {
    holder.style.display = 'none';
}
else {
    holder.style.display = 'block';
}"
%}

A more elegant approach to hiding the description box in stereo mode might be to use CSS and add or remove a class to the element;  essentially, any of the approaches you might use to manipulate HTML content are perfectly fine when handling HTML elements in Argon.