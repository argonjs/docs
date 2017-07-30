/// <reference types="@argonjs/argon" />
/// <reference types="three" />
/// <reference types="dat-gui" />
/// <reference types="stats" />

// set up Argon
const app = Argon.init();

// set up THREE.  Create a scene, a perspective camera and an object
// for the user's location
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const userLocation = new THREE.Object3D();
scene.add(camera);
scene.add(userLocation);

// We use the standard WebGLRenderer when we only need WebGL-based content
const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    logarithmicDepthBuffer: true
});
// account for the pixel density of the device
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.bottom = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
app.view.element.appendChild(renderer.domElement);

// to easily control stuff on the display
const hud = new (<any>THREE).CSS3DArgonHUD();

// We put some elements in the index.html, for convenience. 
// Here, we retrieve the description box and move it to the 
// the CSS3DArgonHUD hudElements[0].  We only put it in the left
// hud since we'll be hiding it in stereo
var description = document.getElementById( 'description' );
hud.hudElements[0].appendChild(description);
app.view.element.appendChild(hud.domElement);

// let's show the rendering stats
var stats = new Stats();
hud.hudElements[0].appendChild( stats.dom );

// create a bit of animated 3D text that says "argon.js" to display 
var uniforms = {
    amplitude: { type: "f", value: 0.0 }
}

var argonTextObject = new THREE.Object3D();
argonTextObject.position.z = -0.50;
userLocation.add(argonTextObject);

var loader = new THREE.FontLoader();
loader.load( '../resources/fonts/helvetiker_bold.typeface.js', function ( font ) {
    var textGeometry = new THREE.TextGeometry( "argon.js", {
        font: <any>font,
        size: 40,
        height: 5,
        curveSegments: 3,
        bevelThickness: 2,
        bevelSize: 1,
        bevelEnabled: true
    });
    textGeometry.center();
    var tessellateModifier = new (<any>THREE).TessellateModifier( 8 );
    for ( var i = 0; i < 6; i ++ ) {
        tessellateModifier.modify( textGeometry );
    }
    var explodeModifier = new (<any>THREE).ExplodeModifier();
    explodeModifier.modify( textGeometry );
    var numFaces = textGeometry.faces.length;
    
    var bufferGeometry = new THREE.BufferGeometry().fromGeometry( textGeometry );
    var colors = new Float32Array( numFaces * 3 * 3 );
    var displacement = new Float32Array( numFaces * 3 * 3 );
    var color = new THREE.Color();
    for ( var f = 0; f < numFaces; f ++ ) {
        var index = 9 * f;
        var h = 0.07 + 0.1 * Math.random();
        var s = 0.5 + 0.5 * Math.random();
        var l = 0.6 + 0.4 * Math.random();
        color.setHSL( h, s, l );
        var d = 5 + 20 * ( 0.5 - Math.random() );
        for ( var i = 0; i < 3; i ++ ) {
            colors[ index + ( 3 * i )     ] = color.r;
            colors[ index + ( 3 * i ) + 1 ] = color.g;
            colors[ index + ( 3 * i ) + 2 ] = color.b;
            displacement[ index + ( 3 * i )     ] = d;
            displacement[ index + ( 3 * i ) + 1 ] = d;
            displacement[ index + ( 3 * i ) + 2 ] = d;
        }
    }
    bufferGeometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
    bufferGeometry.addAttribute( 'displacement', new THREE.BufferAttribute( displacement, 3 ) );
    
    var shaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
            uniform float amplitude;
            attribute vec3 customColor;
            attribute vec3 displacement;
            varying vec3 vNormal;
            varying vec3 vColor;
            void main() {
                vNormal = normal;
                vColor = customColor;
                vec3 newPosition = position + normal * amplitude * displacement;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vColor;
            void main() {
                const float ambient = 0.4;
                vec3 light = vec3( 1.0 );
                light = normalize( light );
                float directional = max( dot( vNormal, light ), 0.0 );
                gl_FragColor = vec4( ( directional + ambient ) * vColor, 1.0 );
            }
        `
    });
    
    var textMesh = new THREE.Mesh( bufferGeometry, shaderMaterial );
    argonTextObject.add( textMesh );
    argonTextObject.scale.set (0.001,0.001,0.001);
    // add an argon updateEvent listener to slowly change the text over time.
    // we don't have to pack all our logic into one listener.
    app.context.updateEvent.addEventListener(() => {
        uniforms.amplitude.value = 1.0 + Math.sin( Date.now() * 0.001 * 0.5 );
    });
});

app.vuforia.isAvailable().then(function(available) {
    // vuforia not available on this platform
    if (!available) {
        console.warn("vuforia not available on this platform.");
        return;
    } 

    // tell argon to initialize vuforia for our app, using our license information.
    app.vuforia.init({
        encryptedLicenseData: 
`-----BEGIN PGP MESSAGE-----
Version: OpenPGP.js v2.3.2
Comment: http://openpgpjs.org

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
CDjUbY1FxwlVJ4UZ7lz+8jWHO5jYY99adPoATpUaWYxm9oPxz/QR4kvgvLjl
9Ti8379Y8qihzqsRmf6YLYyggknlt9Uyl2HjA+1zcwbDnb3I6g/XjTFUPy1D
xZqqSEuCNDLh7m1+GDA3KXQnLIqOdcxOVzyFCDtKI9c6b0D0ezNkxUjgkoIp
mxSSLDjzmHuPLsQVwqxP4KNU1gT7mXTnhlhsG2Vll/WZD+tuzGK8h9anf6/p
4pCk61Dhj1hmb9msTaK4FGhmBMtJ6kQ4SzGOfFKG5IElAHidYgd0iz7AqEzX
GttDkcHGM9iPIYUBY2r/538M/kxeVx5fBiWEkmWz5FMzqPRs3GZWYiAb2tnp
WSDXW3B1mwznwcCkyUP6OP/c6FFmb6Rag/ZaItVAvVjmA7tXICLJPhYIs9hE
I6zJSVZ81YtKg9Nb6Rx49qf18pQ1SWZNGrZrWaTJTLu4cu4c5v/czY5kyT0Y
8RqNUlI5hwWU8G9LpJ5jv8dssrgcweTG/PEbCkzqz0R6W6VgDUyqo6WSGgoS
B9or791lGcDazNT6CJ4/2Z1wBd4BSHkhSwfcPovGOleZFE24gLiG6puHyVjk
WEIir2WXzhypwLkG/dn+ZJW1ezOvTb4gVVILHrWhNh8=
=LoZg
-----END PGP MESSAGE-----`
    }).then((api)=>{
        // the vuforia API is ready, so we can start using it.

        // tell argon to download a vuforia dataset.  The .xml and .dat file must be together
        // in the web directory, even though we just provide the .xml file url here 
        api.objectTracker.createDataSetFromURL("../resources/datasets/ArgonTutorial.xml").then( (dataSetID)=>{
            // the data set has been succesfully downloaded

            // tell vuforia to load the dataset.  
            api.objectTracker.loadDataSet(dataSetID).then( (trackables)=>{
                // when it is loaded, we retrieve a list of trackables defined in the
                // dataset and set up the content for the target

                // tell argon we want to track a specific trackable.  Each trackable
                // has a Cesium entity associated with it, and is expressed in a 
                // coordinate frame relative to the camera.  Because they are Cesium
                // entities, we can ask for their pose in any coordinate frame we know
                // about.
                app.entity.subscribe(trackables["GVUBrochure"].id).then( (gvuBrochureEntity)=> {
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
                            argonTextObject.position.z = -0.50;
                            userLocation.add(argonTextObject);
                        }
                    })
                })

                // create a THREE object to put on the trackable
                const gvuBrochureObject = new THREE.Object3D;
                scene.add(gvuBrochureObject);

            }).then(() =>api.objectTracker.activateDataSet(dataSetID))
                .catch(function(err) {
                console.log("could not load dataset: " + err.message);
            });
            
            // activate the dataset.
            
        });
    }).catch(function(err) {
        console.log("vuforia failed to initialize: " + err.message);
    });
});


// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.
app.context.updateEvent.addEventListener(() => {
    // get the position and orientation (the "pose") of the user
    // in the local coordinate frame.
    const userPose = app.context.getEntityPose(app.context.user);

    // assuming we know the user pose, set the position of our 
    // THREE user object to match it
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(<any>userPose.position);
    }
});
    
// renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(() => {
    // update the rendering stats
    stats.update();
    
    // get the subviews for the current frame
    const subviews = app.view.subviews;

    // if we have 1 subView, we're in mono mode.  If more, stereo.
    var monoMode = subviews.length == 1;

    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    const view = app.view;
    renderer.setSize(view.renderWidth, view.renderHeight, false); 
    renderer.setPixelRatio(app.suggestedPixelRatio);

    const viewport = view.viewport;
    hud.setSize(viewport.width, viewport.height);

    // there is 1 subview in monocular mode, 2 in stereo mode    
    for (let subview of subviews) {
        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(<any>subview.pose.position);
        camera.quaternion.copy(<any>subview.pose.orientation);
        // the underlying system provide a full projection matrix
        // for the camera. 
        camera.projectionMatrix.fromArray(<any>subview.frustum.projectionMatrix);

        // set the viewport for this view
        var {x,y,width,height} = subview.renderViewport;
        renderer.setViewport(x,y,width,height);

        // set the webGL rendering parameters and render this view
        renderer.setScissor(x,y,width,height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);

        // adjust the hud, but only in mono
        if (monoMode) {
            var {x,y,width,height} = subview.viewport;
            hud.setViewport(x,y,width,height, subview.index);
            hud.render(subview.index);
        }
    }
})