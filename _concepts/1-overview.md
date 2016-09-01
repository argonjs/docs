---
layout: page
title: Overview
permalink: /concepts/overview/
---

On this page, we provide an overview of the design of *argon.js*, introducing the terminology and concepts used by the framework.

The goal of the *argon.js* framework and associated [Argon Browser](http://argonjs.io/argon-app) (currently on iOS) is to use web technologies to create fully-registered 3D Augmented Reality (AR) applications that leverage 3D graphics, geo-spatial-positioning, and computer-vision tracking (currently using the [Vuforia](https://www.vuforia.com) vision engine). While some of these capabilities are currently available only in the **Argon Browser**, *argon.js* was designed to help developers create platform-independent AR web content that will eventually run fully-featured on other platforms as the necessary features for 3D AR on the web become available. Therefore, the central design goal of *argon.js* is to provide an abstraction layer for AR between the web-app and the browser.

## Core Abstractions

<figure>
<a href="/concepts/argonjs-framework.png"><img src="/concepts/argonjs-framework.png" /></a>
<figurecaption><sub>Fig. 1 The argon.js framework</sub></figurecaption>
</figure>

There are 3 core abstractions that are defined by the *argon.js* framework:

* **Reality Augmentor** - responsible for *augmenting* a view of reality
* **Reality View** - responsible for *presenting* a view of reality
* **Reality Manager** - responsible for *blending* a particular **Reality View** with one or more **Reality Augmentors**

These **abstractions** are based on a broad view of Augmented Reality, enabling any 3D view of reality to be augmented. The framework anticipates a future in which AR-enabled browsers may give users control over the way they interact with AR content, and let the user (not the applications) control how they are displayed by allowing the user to change their view of reality. For example, a user may want to switch from live video, to remote video, to a virtual flyover of their location—all while an AR application is running. Moreso, in these future browsers, users may want to run multiple AR applications simultaneously, and different application requirements may cause the browser to use different views of reality for the different applications. We are exploring these ideas within the [Argon Browser](http://argonjs.io/argon-app/) (which already allows multiple apps to run and be visible at the same time, for example), and these use-cases have informed the design of *argon.js*.

Traditionally, Augmented Reality (AR) apps have had to take on all three of these roles at once. However, by separating these concerns out, each role can be easily swapped out with another implementation, allowing for a much more flexible and adaptive AR application ecosystem.

## Separation of Concerns

Unlike traditional AR frameworks and toolkits, applications written with *argon.js* are *not* responsible for managing their own views of reality. Rather, AR applications built with argon.js are inherently decoupled from the responsibility of "presenting" a view of reality, allowing them to focus only on "augmenting" a view of reality (i.e, functioning exclusively in the role of a **Reality Augmentor**). Instead of configuraing and loading it's own view of reality, an application is able to make a request to a **Reality Manager** by specifying either a particular desired **Reality View** (e.g., one that displays a certain kind of panoramic image) or expressing the specific capabilities needed for the application to function (e.g., geolocation, Vuforia vision tracking). The **Reality Manager** then supplies a **Reality View** to the application based on the capabilities of the platform and/or user preferences. By encouraging developers to develop applications based on the capabilities they need rather than requesting specific **Reality View**s, *argon.js* applications are more likely to run on new platforms as they become available.

A second reason for this inversion of control in *argon.js* is to support situations where the **Reality View** may need to change while the app is running. The *argon.js* framework anticipates a future in which AR-enabled browsers may give users control over the way they interact with AR content, and let the user (not the applications) control how they are displayed by allowing them to change their view of reality. For example, a user may want to switch from live video, to remote video, to a virtual flyover of their area—while an AR application is running. Similarly, in these future browsers, users may want to run multiple AR applications simultaneously, and different application requirements may cause the browser to use different views of reality for the different applications. We are exploring these ideas within the **Argon browser** (which already allows multiple apps to run and be visible at the same time, for example), and these use-cases have informed the design of *argon.js*.
    
The *argon.js* framework does not prescribe or support any particular rendering or content library. Rather, it provides a uniform view of the data necessary for a real-time 3D AR application to the web developer. In our work, we have been using the [three.js](http://threejs.org) rendering library for 3D content. We have also adapted Mozilla's A-Frame to simplify the creation of web-based AR experiences (http://argonjs.io/argon-aframe).

## Geospatial Frames of Reference

One of Argon's main features is providing geospatial **Reference Frames** for all AR content and making it simple to render content relative to those **Reference Frames**. Programmers must therefore be aware of the relationship between the *argon.js* **Reference Frames** and the coordinate system used by a rendering library such as *three.js*. In Argon, all objects are represented in geospatial coordinates, using [cesium.js](http://cesiumjs.org) **Entities**. This allows accurate representation and manipulation of frames of reference anywhere on the Earth, and (using Cesium's INERTIAL reference frames) anywhere in celestial coordinates relative to the earth.

The geospatial coordinate system used for these reference frames is not convenient for rendering with a typical 3D graphics library: it is centered at the center of the earth, with z being the line between the north and south poles and the xy plane going through the equator. The pose values of objects on the surface of the earth in this frame make no intuitive sense to a developer, and the size of the numbers used in this frame can present problems to some rendering systems. Therefore, *argon.js* defines a "local origin", which is an arbitrary location on the surface of the earth near the ```user``` **Reference Frame**. This "local origin" is exposed through several **Reference Frame**s, with orientation defined accoridng various conventions (such East-North-Up or East-Up-South), with the deciding factor between these frames generally being how the developer wishes to define the "up" direction in their scene. (By default, the local origin is initialized to the location of the user when the web application is launched, and reset when user moves more than 5km away from the current local origin, although this implementation detail may change). 

In general, the origin of the rendering scene should represent the local origin **Reference Frame**. By keeping the rendering camera near the origin of the scene, floating point accuracy is maximized close to the user, and objects far from the origin (which may suffer floating point artifacts) are also far from the camera (minimizing the impact of those artifacts).

The implications of using an arbitrary local origin:

1. All content in the 3D scene (i.e., all 3D content in the world) should be positioned according to some Cesium **Entity**. Placing objects directly in the scene without reference to a Cesium **Entity** *will* cause unpredictable behavior. 
1. The absolute 3D position and orientation of content in the 3D world can change over time and has no pre-defined relationship to geospatial coordinates. To calculate the geospatial location of an object in the scene (e.g., of an ```Object3D``` in the *three.js* scene graph), the programmer can first get the geospatial coordinates of the local origin, and then add the absolute position of the desired object in the scene graph (all units are in meters).
