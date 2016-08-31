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

[Part 3](../part3) of this tutorial discusses *Viewer Mode*, so we will not address it here.  

## Adding HTML Renderers to the Scene

In [Part 1](../part1) of this tutorial, we created a textured cube and positioned it near the user.  In this part, lets add some text fixed to the display and some above the cube, giving the user some more information about the state of the application.  For demonstration purposes, the 2D element attached to the display will show the user where their device thinks it is in the world, and a small 2D label above the cube will tell them where the cube is. 

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


<!---


The renderEvent listeners are called after the updateEvent listeners. Argon supports multiple subviews within its view (currently, just single or stereo), so the render event needs to handle an arbitrary set of subviews, rendering the scene appropriately in each one. This is straightforward for the WebGL renderer, but the CSS renderer needs to have a separate HTML element for each content element for each subview.  The `CSS3DArgonRender` and `CSS3DArgonHUD` help you manage this, allowing you to provide multiple elements, or simply cloning the element you provide if you only provide one.   As you can see, the `CSS3DArgonRender` and `CSS3DArgonHUD` renderers mimic the interface of the normal [three.js](http://threejs.org/) `WebGLRenderer`, simplifying the code.






Revisit in detail the ideas of argon frames-of-reference in geospatial coordinates, vs local 3D coordinates.

Want to spend a bit of time here talking about DOM repair, since we have a dynamic DIV, and how we want to be very careful.  Everything driven by the "reality".


## Dynamic Cube

In this tutorial we expand on the example in [Tutorial 1(Geolocated Cube)]({{ site.baseurl }}tutorial/part1) by adding information above the cube itself and at the bottom of the screen (in a so-called HUD element, which is rendered in the 2D plane of the screen itself). These elements show you how Argon uses different renderers to combine WebGL with CSS.

**Demo/needed files**
Download [Argon4](https://itunes.apple.com/us/app/argon4/id944297993?ls=1&mt=8) on your phone (if you haven't already done this) and [try Dynamic Cube](argon4://tutorials.argonjs.io/code/tutorial/part2)

If you download the zip of the example for this tutorial, you will find the follow files:

* index.html (the launch file, whichimports the needed js frameworks and calls app.js),
* app.js (holding the developer's code),
* app.ts (the typescript version of the code, explained below), 
* a resources folder including:
* argon.umd.js (containing the argon javascript framework), 
* three.js.min (a 3D graphcs framework) and other frameworks,
* a textures folder containing box.png (a texture used in the example)

These are all the assets you need to serve Dynamic Cube. If you upload the tutorial1 folder to your own server, then you can serve the example to any Argon4 browser on a iPhone or iPad. 

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

The code below is similar to Tutorial 1. The extra code creates the css div element above the cube indicating location and the the element at the bottom of the screen. 

{% include code_highlight.html
tscode='
var boxGeoObject = new THREE.Object3D;
'
jscode='
var boxGeoObject = new THREE.Object3D;
'
%}


### Please continue to [Tutorial 3 (Stereo Mode)]({{ site.baseurl }}tutorial/part3).

### For more details about the methods discussed above, please refer to [Argonjs documentation](http://argonjs.io/argon/index.html)
-->