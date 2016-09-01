---
layout: page
title: 'Part 5: Directions CSS'
---
> Download [Argon4](http://argonjs.io/argon-app) and the [Tutorial Source Code](https://github.com/argonjs/docs/tree/gh-pages/code). <br> This tutorial uses the *5-directionsHTML* and *resources* directories. **[Live Demo](/code/5-directionsHTML)**

This part of the tutorial uses HTML elements to place labels at the compass points (east, west, north, south), as well as up and down. The purpose is to demonstrate how to place content near the user, such that it moves with them but has a fixed orientation relative to the earth, as well as demonstrating creating HTML content on the fly.

This example also demonstrates how to decouple the render update listener from Argon so that it runs in response to requestAnimationFrame() and shows how to leverage CSS to hide/show HTML content when the Argon-enabled web page looses/gains focus (i.e. another web page is selected and brought to the front or this page is selected again).

The structure of the code for this examples is very similar to previous parts of the tutorial, so most of the standard setup code is not repeated here. This example uses the CSS3D and HUD renderers and moves the "description" text in the `index.html` file into the HUD (as previous examples did).

## Focus and Blur 

One addition to the CSS embedded in the HTML file fades out the "description" text when the web page loses focus (referred to as *blur*) and fades it back in when the application gains focus.  To do this, the example leverages the `.argon-focus` and `.argon-no-focus` classes, which Argon adds and removes to its view element in response to blur and focus events. 

{% highlight html %}
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
{% endhighlight %}

You can also explicitly listen for the `app.focusEvent` and `app.blurEvent` similarly to the update and render events.

## Placing HTML Elements Around the User

The six directional objects are HTML elements rendered using the CSS3D renderer introduced in [part 2](../part2) of the tutorial. ([Part 6](../part6) places 3D text at these locations using WebGL, as part of demonstrating how to illuminate virtual content with light coming from the direction of the Sun and/or Moon). 

The elements are located relative to the user's location (where the phone is) by adding them to the `userLocation` object, rather than being absolutely located in the world. In previous parts of the tutorial, the user's current location was copied to the three.js `userLocation` object using code similar to this:

{% include code_highlight.html
tscode='
// get the position and orientation (the "pose") of the user
// in the local coordinate frame.
const userPose = app.context.getEntityPose(app.context.user);

// assuming we know the user pose, set the position of our 
// THREE user object to match it
if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
    userLocation.position.copy(<any>userPose.position);
}'
jscode='
// get the position and orientation (the "pose") of the user
// in the local coordinate frame.
var userPose = app.context.getEntityPose(app.context.user);

// assuming we know the user pose, set the position of our 
// THREE user object to match it
if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
    userLocation.position.copy(userPose.position);
}'
%}

Notice that only the position of the `userPose` is copied to `userLocation`, not the orientation.  The default orientation is the identity matrix, orienting the user with its parent frame, which in this case is the local reference frame.  The result is that the `userLocation` object is positioned where the user is, but does not rotate with the user.

The six direction elements are created on the fly:

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

These six HTML elements are used to create six `CSS3DObject`s, which are positioned along their respective axes, and attached to the `userLocation` object.  The objects are positioned in the local reference frame around the user location, using the EUS (east, up, south) system. Each object is also rotated, where necessary, to face the user. 

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
//no rotation need for this one

userLocation.add(cssObjectXpos)
userLocation.add(cssObjectXneg)
userLocation.add(cssObjectYpos)
userLocation.add(cssObjectYneg)
userLocation.add(cssObjectZpos)
userLocation.add(cssObjectZneg)'
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
// no rotation needed for z

userLocation.add(cssObjectXpos)
userLocation.add(cssObjectXneg)
userLocation.add(cssObjectYpos)
userLocation.add(cssObjectYneg)
userLocation.add(cssObjectZpos)
userLocation.add(cssObjectZneg)'
%}


## Decoupling Rendering from the Render Event Listener

The update and render event listeners are similar to those in the previous parts of the tutorial. 

One important change in this example is that the render event listener is decoupled from the actual rendering using `requestAnimationFrame(renderFunc)`.  This is useful in two ways.  First, the DOM will only be repaired once after `renderFunc()` completes (assuming you do not do anything to force a repair during rendering).  Applications with significant HTML content, especially content that changes frequently, will see better performance using this approach.  Second, while not applicable in this example, if the application has a slow render update listener, decoupling the renderer from the update callback can help the application degrade more gracefully.

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
}'
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
}'
%}

Notice that the render event listener will not call `requestAnimationFrame(renderFunc)` until the previous rending has completed and `rAFpending` is reset to `false`.