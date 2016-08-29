---
layout: page
title: 'Part 2: Adding Content'
---
This tutorial will expand on the cube example present in tutorial to include:

1. adding a hud element at the bottom showing user location and distance to the cube 
2. adding a css div above it to show its location
3. a discussion of the hud and the different renderers
4. pose to reader the question of how to change size of the cube as it moves. discussion of the way to calculate this (similar triangles). 



THIS TUTORIAL IS STILL UNDER CONSTRUCTION. AVAILABLE SOON.

<!---

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