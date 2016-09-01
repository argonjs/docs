---
layout: page
title: 'Part 4: Vuforia'
---
> Download [Argon4](http://argonjs.io/argon-app) and the [Tutorial Source Code](https://github.com/argonjs/docs/tree/gh-pages/code). <br> This tutorial uses the *4-vuforia* and *resources* directories.<br> **[Live Demo](/code/4-vuforia)**


### What you should see
**Quick Demo:**
Download [Argon4](https://itunes.apple.com/us/app/Argon4/id944297993?ls=1&mt=8) and [Try Now](argon4:/argon4-code/vuforia)

1. When your camera captures the stones image, you should see a colorful, 3d box floating and spinning above the image.
{% include tutorial3Video1.html %}

2. When your camera captures the wood chips image, you should see an animated 3D graphic monster. (It looks something like a four-legged lizard walking in place.)
You can move your camera to view the 3d objects from different angles.
{% include tutorial3Video2.html %}

### Introduction
Vuforia is the image tracking system from Qualcomm Vuforia, which argon.js uses to recognize an image from a database and register graphics in relation to the image. This tutorial shows how to use an image from a database within argon.js. To use this feature effectively, you need to register with Vuforia and create your own database of images. When you register with Vuforia, you will receive a key to your database. This key guarantees that only the users of your applications can access your database. To use Vuforia in Argon4, you will need to insert an encrypted form of your key into your code.

For the purposes of this tutorial example, however, we can use the standard “stones and chips” images provided by Vuforia without a developer’s key. On top of the stones image, we will place a box that spins. On top of the chips images, we place an animated 3D graphic monster. (It looks something like a four-legged lizard walking in place.)

### Main file (index.html)
Here is the html that goes into the body. There is no "argon-immersive-context" div in this example. The body contains text that appears when the application is set to Page Mode: the text identifies the example for the user and provides a link to the stones and chips image.

{% highlight html %}
<body style="background-color:rgba(255,255,255,0.7)">
 <div>  
    <h2>Vuforia image tracking example</h2>
    <p>This example illustrates the use of Vuforia for image tracking. It is designed to work with the standard <a href="https://developer.vuforia.com/sites/default/files/sample-apps/targets/imagetargets_targets.pdf"> "stones and chips" Vuforia image</a>.</P>
 </div>
</body>
{% endhighlight %}

### Code file (app.ts and app.js)
We start with the standard setup. We are using the immersive context (the camera built into the device).

We use webgl to render the scene, including the 3D graphic object that we will present, and add the renderers to the app.

{% highlight js %}
const cssRenderer = new THREE.CSS3DRenderer();
const webglRenderer = new THREE.WebGLRenderer({ alpha: true, logarithmicDepthBuffer: true });
app.viewport.element.appendChild(cssRenderer.domElement);
app.viewport.element.appendChild(webglRenderer.domElement);
{% endhighlight %}

The following lines initialize Vuforia, the device camera, and the object tracker.

{% highlight js %}
app.vuforia.init();
app.vuforia.startCamera();
app.vuforia.startObjectTracker();
{% endhighlight %}

Then, we import the Stones and Chips image and subscribe to the stones trackable in order to start receiving updates.
{% highlight js %}
dataset.trackablesPromise.then((trackables) => {
const stonesEntity = app.context.subscribeToEntityById(trackables['stones'].id)
const stonesObject = new THREE.Object3D;
scene.add(stonesObject);
{% endhighlight %}

The following code sets up the content that will appear over the stones image. In this case we use three.js methods to construct and texture the box.

{% highlight js %}
var box = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), new THREE.MeshNormalMaterial())
box.position.z = 25
{% endhighlight %}

The app shows the box when the stones image is recognized by Argon and removes the box when the image is lost (i.e. if the user moves the phone so that the camera can no longer see the image). When the box is first recognized, it spins 10 times, then stops.
{% highlight js %}
app.updateEvent.addEventListener((frameState) => {
       const stonesState = app.context.getCurrentEntityState(stonesEntity);
       stonesEntity.position

       if (stonesState.poseStatus & Argon.PoseStatus.KNOWN) {
           stonesObject.position.copy(stonesState.position);
           stonesObject.quaternion.copy(stonesState.orientation);
       }

       if (stonesState.poseStatus & Argon.PoseStatus.FOUND) {
           stonesObject.add(box);
       } else if (stonesState.poseStatus & Argon.PoseStatus.LOST) {
           stonesObject.remove(box);
       }
   })

})

{% endhighlight %}
The remaining code activates the 3D objects that have been created, and allow the app to update the 3D objects’ position based on the camera input. This is explained in more depth in Tutorial 1.

{% highlight js %}

dataset.activate();

app.updateEvent.addEventListener(() => {
    const frustum = app.camera.currentFrustum;
    camera.fov = Argon.Cesium.CesiumMath.toDegrees(frustum.fovy);
    camera.aspect = frustum.aspectRatio;
    camera.projectionMatrix.fromArray(frustum.infiniteProjectionMatrix)

    const eyeState = app.context.getCurrentEntityState(app.context.eye);

    if (eyeState.poseStatus & Argon.PoseStatus.KNOWN) {
        camera.position.copy(eyeState.position);
        camera.quaternion.copy(eyeState.orientation);
    }
})

app.renderEvent.addEventListener(() => {
    const {width, height} = app.viewport.current;
    cssRenderer.setSize(width, height);
    webglRenderer.setSize(width, height);
    cssRenderer.render(scene, camera);
    webglRenderer.render(scene, camera);
})

{% endhighlight %}

### Going beyond this example…

While this tutorial provides a basic demonstration of Vuforia, the same principles can be used in conjunction with other Vuforia image targets to create various augmented reality content. The Vuforia Developer Library provides more information on the application and its capabilities.


### Please continue to [Tutorial 5 (DirectionsHTML)]({{ site.baseurl }}tutorials/tutorial5).


### For more details about the methods discussed above, please refer to [Argonjs documentation](http://argonjs.io/argon/index.html)


