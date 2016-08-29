---
layout: page
title: 'Part 8: Custom Realities'
---

Tutorial on panoramas

1. how to create panoramas
2. links to a discussion of custom realities 



## Panoramas (Custom Realities)

Intro text here

**Demo/needed files**
Download [Argon4](https://itunes.apple.com/us/app/argon4/id944297993?ls=1&mt=8) on your phone (if you haven't already done this) and [try Panoramas](argon4://tutorials.argonjs.io/code/8-panoramas)

If you download the zip of the example for this tutorial, you will find the follow files:

* index.html (the launch file, whichimports the needed js frameworks and calls app.js),
* app.js (holding the developer's code),
* app.ts (the typescript version of the code, explained below), 
* a resources folder including:
* argon.umd.js (containing the argon javascript framework), 
* three.js.min (a 3D graphcs framework) and other frameworks,
* a textures folder containing box.png (a texture used in the example)

These are all the assets you need to serve Panoramas. If you upload the tutorial1 folder to your own server, then you can serve the example to any Argon4 browser on a iPhone or iPad. 

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


### Please continue to [Tutorial 9 (Argon in other browsers)]({{ site.baseurl }}tutorial/part9).

### For more details about the methods discussed above, please refer to [Argonjs documentation](http://argonjs.io/argon/index.html)
