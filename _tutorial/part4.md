---
layout: page
title: 'Part 4: Reference Frames and Vuforia Tracking'
---
> Download [Argon4](http://argonjs.io/argon-app) and the [Tutorial Source Code](https://github.com/argonjs/docs/tree/gh-pages/code). <br> This tutorial uses the *4-vuforia* and *resources* directories.<br> **[Live Demo](/code/4-vuforia)**

In the first three parts of this tutorial, we showed how to set up an Argon web application, use Argon's geospatial reference frames, include both WebGL and HTML content in the 3D scene, and properly support stereo views.

## Frames of Reference
The examples in those previous parts relied on absolute geospatial tracking: the frames of reference were based on the location of the viewer and objects in the world. However, the exact same approach would work with any *external* reference frames: if you could track the user inside a room or building and specify the location of the AR content relative to that same room or building, the exact same approach would work.  

Internally, Argon frames of reference can be expressed relative to any other frames of reference, and as long as the following two conditions are met, the content can be displayed:

1. The user's pose (position and orientation) must be known relative to the `setDefaultReferenceFrame`. 
2. There must be a path connecting the user to the object (e.g., the user is in this *room*, the *room* this *building*, and the AR content is in this *building*) 

The user's pose is determined by the current *reality*. The default view of reality in the Argon Browser is the live video view of the camera, and the pose is reported relative to the world using the location and orientation sensors on the device running Argon. ([Part 8](../part8) of this tutorial discusses building and using custom representations of reality). Therefore, if you can determine the pose of an object relative to the world or to the user, Argon can determine the pose of the content relative to the user, and the application will be able to display content relative to it.  

## Vision-based Tracking and Vuforia
The Argon Browser includes a computer-vision tracking system called [Vuforia](http://www.vuforia.com). Vuforia is a platform native SDK that can find and precisely track where images and objects are relative to the camera.  argon.js can represents these tracked *targets* as frames of reference expressed relative to the camera on the device (which is what we also use as the location of the user).  This means that anything tracked by Vuforia can have its pose computed relative to any other frame of reference Argon knows about, and attaching content to objects tracked by Vuforia is done in exactly the same way that content was attached to the world in the first parts of this tutorial.

To use Vuforia with Argon, you must create an account on the [Vuforia Developer Portal](https://developer.vuforia.com) and use the tools there to get a license key and create target datasets. (Currently, argon.js does not support all of the features of the Vuforia Native SDK, such as cloud recognition and VuMarks, but we hope to soon.)

In the Vuforia Portal's *License Manager* you should obtain a copy of your license key.  It will look something like this:
<pre>
AYVDMl7/////AAAAGUNYbWe+HkCjrn65cBM7Lm0Z6OHGozSF6sPHjCvjp3LhFIlirezFjpIqp0Xtg0ObkDmyTdJj1Yqb8VB9zeFu29cUBWe1fEBAHT//B74Urf2vcDCjyk7l92MUcwCq1xMRruzTVyXkIiQO8XrPTfjGA0KCCJjeBMj9HLvsH+POXBuKPOpnAEkptjZ/qNa4lEpSmZnr43Vg8wJZsQtzFBL8KDT8RGxzSZbuIh800dLzWmJOOjUDlac2qmnBWia7F7QymO1ig5WXgbDGb3CoOsFAZOgUsqXqk2ycrmV9BnebjesdVWmYKazrreiH021fq4rT1EmW5zgo4jR5pfLnjlXhofobPnCsq3zJZda6N13zpabc
</pre>

In the Vuforia Portal's *Target Manager* you should create and download a target database. 

> Please pay attention to the sizes you enter for the various targets: argon.js will use these sizes as if they are expressed in meters.  

Select the SDK option when asked, and you should receive two files with the same name, one with a `.dat` extension and one with a `.xml` extension.  

In the remainder of this part of the tutorial, you will learn how to use this key and target database to do vision-based tracking with Argon.

## The Vuforia License Data File
To use Vuforia, the native library must be initialized with a valid license key.  The Argon Browser requires each web app to provide this key in an encrypted format, so that programmers are not making their license key visible to others. This also means that only the users of your applications can access Vuforia functionality that is tied to your key, especially services that cost money to use. 

To create an encrypted license key file, you need to use [PGP](https://en.wikipedia.org/wiki/Pretty_Good_Privacy) to encrypt an JSON file with the Argon Browser's public key (available in the public PGP key store as `secure@argonjs.io`).  To simplify the process and ensure a valid JSON file is encrypted, you should use the [Vuforia PGP Encryptor](/start/vuforia-pgp-encryptor) page on this site.

The JSON file contains two things, which you enter in the first two boxes on the web page.  The first box is for your Vuforia license key, which you should paste in exactly as it appears on the Vuforia web site.  Do not add extra spaces or line breaks. 

> If you are using a public computer, you should empty the browser cache after using the vuforia-pgp-encryptor page, to ensure your license key is not available after you are done.

> **IMPORTANT: You are responsible for complying with the Vuforia Terms of Service**. Vuforia requires each separate application to have its own key, and distributed applications cannot use a developer key. The free developer key cannot be used for commercial, published applications. 

In the second box, you should enter a list of domains and URL patterns specifying what URLs this license key and corresponding tracking database can be used from (the website shows you documentation on how to specify these patterns). The encrypted key used with the samples includes these patterns (among others):
<pre>
?(*.)argonjs.io/**
argon.gatech.edu/**
ael.gatech.edu/**
</pre>
You will notice that if you try to run the code for this example from your own computer or any website aside from those, Vuforia it will not work.

The website runs entirely in the web client. No information you enter is sent out of your browser, and the JSON file and encrypted license data are generated as you type and appear in the remaining two text boxes on the web page. You do not need to do anything with the *License Data (JSON)* box, it is shown so you can see what the JSON file looks like.  

When you are done, copy the contents of the *License Data (encrypted)* box.  You will need to add that to the web application so it can be passed to Argon to initialize Vuforia for your web page.

## Application Setup

The code in the example to initialize and set up argon.js and three.js is similar to our previous examples. The WebGL and `CSS3DArgonHUD` renderers are used, `localOriginEastUpSouth` is set as the local frame of reference, and the update and render event listeners at the bottom of the application code are almost identical to those in the previous example.

The three.js `Stats()` display is added to the HUD, and then the `stats` object is used just as in any other three.js example:
{% include code_highlight.html
tscode='
// show the rendering stats
var stats = new Stats();
hud.hudElements[0].appendChild( stats.dom );'
jscode='
// show the rendering stats
var stats = new Stats();
hud.hudElements[0].appendChild(stats.dom);'
%}

The 3D graphics (a 3D version of the text "argon.js" that explodes and reforms) displayed on the target are set up using standard three.js objects.  The one difference is the use of an argon.js update event listener to do the time-based animation.  Near the bottom of the setup code for the text object, you'll see this code:
{% include code_highlight.html
tscode='
/// add an argon updateEvent listener to slowly change the text over time.
// we do not have to pack all our logic into one listener.
app.context.updateEvent.addEventListener(() => {
    uniforms.amplitude.value = 1.0 + Math.sin( Date.now() * 0.001 * 0.5 );
});'
jscode='
// add an argon updateEvent listener to slowly change the text over time.
// we do not have to pack all our logic into one listener.
app.context.updateEvent.addEventListener(function () {
    uniforms.amplitude.value = 1.0 + Math.sin(Date.now() * 0.001 * 0.5);
});'
%}
As the comment in the code points out, you are free to have as many listeners set up for any of Argon's events.  All of them will be called at the appropriate time, although no guarantees are made about the order that each of the listeners for one event will be called.  

## Initializing and Using Vuforia

To set up and use Vuforia, you need to 

1. Initialize vuforia using the encrypted license data file.
2. Download one or more tracking datasets.
3. Load a tracking dataset into Vuforia for use.
4. Set up your application to use the frames of reference corresponding to the targets in the dataset. For example, you will probably want to set up listeners to find out when targets are found or lost, attach content to three.js objects corresponding to those frames of reference, etc.

Let's go through each of these steps in turn.  But before we dive in, you should make sure you understand the concept of the web programming pattern called the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), since the Vuforia APIs in argon.js are based on them.  Promises are used to add structure to asynchronous programming, which dominates so much of what gets done in web applications.   Promises are extremely popular, and you can find many web resources to explain them (such as the [promisejs.org](https://www.promisejs.org) site or this [Overview of Javascript Promises](https://www.sitepoint.com/overview-javascript-promises/)). There is even a short [Udacity course](https://www.udacity.com/course/javascript-promises--ud898) devoted to Promises.

All of the commands and communication between your web application and the Vuforia APIs are asynchronous, for a number of reasons:

1. Each web page in the Argon Browser runs in a separate thread and asynchronously from the native code. Each request you make will receive a reply at some point in the future, similarly to how requests to servers in web applications are asynchronous.
2. Some of the Vuforia commands, especially the ones involved in initialization and setup, take time to complete, so cannot be handled synchronously because the web applications would appear to freeze while the command was executing.  Downloading datasets, in particular, can be slow depending on the size of the dataset and the speed of the network.
3. The Argon Browser must mediate between different web applications that want to use Vuforia.  There is nothing to stop a user from loading two web applications at the same time, both of which want to use Vuforia.  These applications may use different licenses and configure Vuforia in different ways.  Therefore, argon.js *virtualizes* Vuforia, keeping track of the configuration of each web page, and chooses which pages gets control of Vuforia (typically, that would be the foreground page).  argon.js applications do not need to manage this process.

### Initializing Vuforia
An Argon application can get to see if the platform the web application is running on supports Vuforia using `app.vuforia.isAvailable()`, which returns a Promise that passes a boolean to the success function (`true` if Vuforia is available). To initialize Vuforia, an application calls `app.vuforia.init()` and passes in an object with the encrypted license key data in the `encryptedLicenseData` property. A Promise is returned here, on success; otherwise, an error is raised. `catch` can be used to see why Vuforia failed to initialize.  The initialization process is shown in the code below.

{% include code_highlight.html
tscode='
// tell argon to initialize vuforia for our app, using our license information.
app.vuforia.isAvailable().then(function(available) {
    // vuforia not available on this platform
    if (!available) {
        console.warn("vuforia not available on this platform.");
        return;
    } 

    app.vuforia.init({
        encryptedLicenseData: 
`-----BEGIN PGP MESSAGE-----
Version: OpenPGP.js v2.3.2
Comment: http://openpgpjs.org

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
=uYu7
-----END PGP MESSAGE-----`
    }).then((api)=>{
       //
       // the vuforia API is ready, so we can start using it here ....
       //
    }).catch(function(err) {
        console.log("vuforia failed to initialize: " + err.message);
    });
});'
jscode='
app.vuforia.isAvailable().then(function (available) {
    // vuforia not available on this platform
    if (!available) {
        console.warn("vuforia not available on this platform.");
        return;
    }
    // tell argon to initialize vuforia for our app, using our license information.
    app.vuforia.init({
        encryptedLicenseData: "-----BEGIN PGP MESSAGE-----\nVersion: OpenPGP.js v2.3.2\nComment: http://openpgpjs.org\n\n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\n=uYu7\n-----END PGP MESSAGE-----"
    }).then(function (api) {
        //
        // the vuforia API is ready, so we can start using it.
        //
    }).catch(function (err) {
        console.log("vuforia failed to initialize: " + err.message);
    });
});'
%}

If Vuforia initializes successfully, the function passed to `then()` is run with the Vuforia API object as a parameter.  Inside this function, an application would typically finish setting up Vuforia using its API object, by creating one or more datasets, loading one of them, and setting up whatever application logic is needed to deal with the tracked targets.

{% include code_highlight.html
tscode='
//
// the vuforia API is ready, so we can start using it.
//

// tell argon to download a vuforia dataset.  The .xml and .dat file must be together
// in the web directory, even though we just provide the .xml file url here 
api.objectTracker.createDataSet("../resources/datasets/ArgonTutorial.xml").then( (dataSet)=>{
    // the data set has been succesfully downloaded

    // tell vuforia to load the dataset.  
    dataSet.load().then(()=>{
        // when it is loaded, we retrieve a list of trackables defined in the
        // dataset and set up the content for the target
        const trackables = dataSet.getTrackables();

        // tell argon we want to track a specific trackable.  Each trackable
        // has a Cesium entity associated with it, and is expressed in a 
        // coordinate frame relative to the camera.  Because they are Cesium
        // entities, we can ask for their pose in any coordinate frame we know
        // about.
        const gvuBrochureEntity = app.context.subscribeToEntityById(trackables["GVUBrochure"].id)

        // create a THREE object to put on the trackable
        const gvuBrochureObject = new THREE.Object3D;
        scene.add(gvuBrochureObject);

        // the updateEvent is called each time the 3D world should be
        // rendered, before the renderEvent.  The state of your application
        // should be updated here.
        app.context.updateEvent.addEventListener(() => {
            // get the pose (in local coordinates) of the gvuBrochure target
            const gvuBrochurePose = app.context.getEntityPose(gvuBrochureEntity);

            // if the pose is known the target is visible, so set the
            // THREE object to the location and orientation
            if (gvuBrochurePose.poseStatus & Argon.PoseStatus.KNOWN) {
                gvuBrochureObject.position.copy(<any>gvuBrochurePose.position);
                gvuBrochureObject.quaternion.copy(<any>gvuBrochurePose.orientation);
            }

            // when the target is first seen after not being seen, the 
            // status is FOUND.  Here, we move the 3D text object from the
            // world to the target.
            // when the target is first lost after being seen, the status 
            // is LOST.  Here, we move the 3D text object back to the world
            if (gvuBrochurePose.poseStatus & Argon.PoseStatus.FOUND) {
                gvuBrochureObject.add(argonTextObject);
                argonTextObject.position.z = 0;
            } else if (gvuBrochurePose.poseStatus & Argon.PoseStatus.LOST) {
                argonTextObject.position.z = -0.5;
                userLocation.add(argonTextObject);
            }
        })
    }).catch(function(err) {
        console.log("could not load dataset: " + err.message);
    });
        
    // activate the dataset.
    api.objectTracker.activateDataSet(dataSet);
});'
jscode='
//
// the vuforia API is ready, so we can start using it.
//
// tell argon to download a vuforia dataset.  The .xml and .dat file must be together
// in the web directory, even though we just provide the .xml file url here 
api.objectTracker.createDataSet("../resources/datasets/ArgonTutorial.xml").then(function (dataSet) {
    // the data set has been succesfully downloaded
    // tell vuforia to load the dataset.  
    dataSet.load().then(function () {
        // when it is loaded, we retrieve a list of trackables defined in the
        // dataset and set up the content for the target
        var trackables = dataSet.getTrackables();
        // tell argon we want to track a specific trackable.  Each trackable
        // has a Cesium entity associated with it, and is expressed in a 
        // coordinate frame relative to the camera.  Because they are Cesium
        // entities, we can ask for their pose in any coordinate frame we know
        // about.
        var gvuBrochureEntity = app.context.subscribeToEntityById(trackables["gvuBrochure"].id);
        // create a THREE object to put on the trackable
        var gvuBrochureObject = new THREE.Object3D;
        scene.add(gvuBrochureObject);
        // the updateEvent is called each time the 3D world should be
        // rendered, before the renderEvent.  The state of your application
        // should be updated here.
        app.context.updateEvent.addEventListener(function () {
            // get the pose (in local coordinates) of the gvuBrochure target
            var gvuBrochurePose = app.context.getEntityPose(gvuBrochureEntity);
            // if the pose is known the target is visible, so set the
            // THREE object to the location and orientation
            if (gvuBrochurePose.poseStatus & Argon.PoseStatus.KNOWN) {
                gvuBrochureObject.position.copy(gvuBrochurePose.position);
                gvuBrochureObject.quaternion.copy(gvuBrochurePose.orientation);
            }
            // when the target is first seen after not being seen, the 
            // status is FOUND.  Here, we move the 3D text object from the
            // world to the target.
            // when the target is first lost after being seen, the status 
            // is LOST.  Here, we move the 3D text object back to the world
            if (gvuBrochurePose.poseStatus & Argon.PoseStatus.FOUND) {
                gvuBrochureObject.add(argonTextObject);
                argonTextObject.position.z = 0;
            }
            else if (gvuBrochurePose.poseStatus & Argon.PoseStatus.LOST) {
                argonTextObject.position.z = -0.5;
                userLocation.add(argonTextObject);
            }
        });
    }).catch(function (err) {
        console.log("could not load dataset: " + err.message);
    });
    // activate the dataset.
    api.objectTracker.activateDataSet(dataSet);
});'
%}

The two files downloaded as part of the dataset from the Vuforia developer site need to be placed on the web somewhere that your application can access, and the URL to the `xml` file passed to `api.objectTracker.createDataSet(url)`. This call sets up the internal data structures for this dataset, but it is not downloaded until either `fetch()` or `load()` are called on the object passed into the Promise function.  `fetch()` downloads the dataset files (or finds them in the local cache); load will fetch the dataset if it hasn't been fetched, and then load it into the Vuforia tracker and activate it for tracking.

`dataset.getTrackables()` can be called after the dataset has been downloaded, and returns a list of the trackable objects and targets in that dataset. (This information is actually contained in the `xml` file, if you want to look at the one you downloaded).

Each trackable has a Cesium `Entity` created for it inside argon.js. argon.js applications only receive information for trackables that they have asked for, which is done using `app.context.subcribeToEntityById()` (where the trackable `id` is contained in `trackables["targetname"].id`).  The `targetname` is the name you gave the target when you created it in the Vuforia developer portal, and can also be seen in the `xml` file.

At this point, the tracking of the targets is communicated to an application in the same way as any other Argon Entity. Each frame, `app.context.getEntityPose(targetEntity)` will return a pose object for the entity.  `pose.poseStatus` is a bit mask that can be checked to see the status of the entity:

*   `KNOWN` - the pose of the entity state is defined. 
*   `KNOWN & FOUND` - the pose was undefined when the entity state was last queried, and is now defined.
*   `LOST` - the pose was defined when the entity state was last queried, and is now undefined

In other words, if the target is currently seen and being tracked, the `KNOWN` bit will be set, and `LOST` and `FOUND` can be checked to see when a target is first seen or is no longer being seen.   In the code above, `LOST` and `FOUND` are used to move the "argon.js" 3D text object from the target (when `FOUND`) to sitting in the world (0.5 meters north of the user, facing them).  Why 0.5 meters?  In this sample, we are using the cover of [Georgia Tech's GVU Center Research Brochure](../../code/resources/GVUBrochure.pdf) printed on a letter sized piece of paper.  On that paper, the image is approximately 8.5x11 inches in size (depending on your printer), so the "argon.js" 3D text is scaled to be slightly smaller than that.  By putting it at 0.5 meters away, it appears at a reasonable size in the physical world. 