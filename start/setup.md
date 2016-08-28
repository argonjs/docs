---
layout: page
title: Quick Start
permalink: /start/setup
nav_order: 20
---

This quick start page is for:

* those who want to develop new Argon channels, using the existing Argon javascript code

* those who want to modify and extend the Argon typescript/javascript framework itself


### To develop Argon channels

Argon uses a client-server protocol. (The Argon browser for iOS is a modification and extension of the Webkit engine used by mobile Safari.) The Argon browser is the client; you provide the server and put all your files there, just as with any other web application. Then you server via any http server. The files you serve typically include: 


* index.html (imports the needed js frameworks and calls app.js),
* app.js (holding the developer's code),
* various media content files, css files, etc., 
* argon.umd.js (containing the Argon javascript framework), 
* three.js (a 3D graphcs framework),
* other javascript frameworks such as jquery. 

You can download the current distribution of Argon code here.

The tutorials (1-9) are designed to take you through the basics of coding in using the Argon framework: how to initialize Arong, who to create 3D objects and geolocate them, how to initialize custome Argon realities (such as panoramas and Streetview),how to create a database of images and track them using the Vuforia tracking system, and so on.  


### To modify and extend Argon 

The Typescript/Javascript code for the Argon browser and API are located in a github repository that you can download or clone:

Step 1: Go to Argonjs [Github repository] (https://github.com/argonjs/argon).

Step 2: Click the “download ZIP” button to the right of the Github page.

Step 3: Unzip these files and move them onto a personal server.

Step 4: Install [Argon4](https://itunes.apple.com/us/app/argon4/id944297993?ls=1&mt=8)  from the App Store onto an iOS device.

Step 5: Access your server from the Argon4 mobile browser and open the folder containing your newly unzipped files. <a href = "code.zip">Download</a> tutorials source files from this site.

Step 6: You should see an icon on the corner of your screen. This means you have completed the tutorial!

