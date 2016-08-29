---
layout: page
title: 'Part 3: Stereo mode'
---

This tutorial explains how to set up for stereo viewing including:

1. how to deal with stereo in WebGL renderer.  
2. in the CSS renderer. Point out previous example doesn't work properly in HUD (we would not have set up the two left/right CSS elements to support stereo properly)  
3. in the HUD renderer.  Ditto
4. the same cube and the dynamic information from tutorial 2 will be used

---THIS TUTORIAL IS STILL UNDER CONSTRUCTION. AVAILABLE SOON.

<!---

## Stereo Mode

Intro text here

**Demo/needed files**
Download [Argon4](https://itunes.apple.com/us/app/argon4/id944297993?ls=1&mt=8) on your phone (if you haven't already done this) and [try Stereo Mode](argon4://tutorials.argonjs.io/code/tutorial/part3)

If you download the zip of the example for this tutorial, you will find the follow files:

* index.html (the launch file, whichimports the needed js frameworks and calls app.js),
* app.js (holding the developer's code),
* app.ts (the typescript version of the code, explained below), 
* a resources folder including:
* argon.umd.js (containing the argon javascript framework), 
* three.js.min (a 3D graphcs framework) and other frameworks,
* a textures folder containing box.png (a texture used in the example)

These are all the assets you need to serve Stereo Mode. If you upload the tutorial1 folder to your own server, then you can serve the example to any Argon4 browser on a iPhone or iPad. 

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


### Please continue to [Tutorial 4 (Vuforia)]({{ site.baseurl }}tutorial/part4).

### For more details about the methods discussed above, please refer to [Argonjs documentation](http://argonjs.io/argon/index.html)
-->