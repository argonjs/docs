/// <reference path="../../typings/index.d.ts"/>

// When we distribute Argon typings, we can get rid of this, but for now
// we need to shut up the Typescript compiler about missing Argon typings
declare const Argon:any;

// set up Argon
const app = Argon.init();

// set up THREE.  Create a scene, a perspective camera and an object
// for the user's location
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const userLocation = new THREE.Object3D;
scene.add(camera);
scene.add(userLocation);

// We use the standard WebGLRenderer when we only need WebGL-based content
const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    logarithmicDepthBuffer: true
});

// account for the pixel density of the device
renderer.setPixelRatio(window.devicePixelRatio);
app.view.element.appendChild(renderer.domElement);

// Tell argon what local coordinate system you want.  The default coordinate
// frame used by Argon is Cesium's FIXED frame, which is centered at the center
// of the earth and oriented with the earth's axes.  
// The FIXED frame is inconvenient for a number of reasons: the numbers used are
// large and cause issues with rendering, and the orientation of the user's "local
// view of the world" is different that the FIXED orientation (my perception of "up"
// does not correspond to one of the FIXED axes).  
// Therefore, Argon uses a local coordinate frame that sits on a plane tangent to 
// the earth near the user's current location.  This frame automatically changes if the
// user moves more than a few kilometers.
// The EUS frame cooresponds to the typical 3D computer graphics coordinate frame, so we use
// that here.  The other option Argon supports is localOriginEastNorthUp, which is
// more similar to what is used in the geospatial industry
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);

// add some ambient so things aren't so harshly illuminated
var ambientlight = new THREE.AmbientLight( 0x404040 ); // soft white ambient light 
scene.add(ambientlight);

// set our desired reality 
app.reality.setDesired({
    type:'hosted',
    name: 'My Panorama Tour',
    url: Argon.resolveURL('../panorama-reality/index.html')
})

// the information needed for each panorama to be used.  Panoramas need to be geolocated to be
// used with the Reality, since a Reality must provide the position and orientation of the camera
interface PanoramaInfo {
    name: string,
    url: string,
    longitude?: number,
    latitude?: number,
    height?: number,
    offsetDegrees?: number
}

let panoRealitySession:Argon.SessionPort;

// list our panoramas
const panoramas:PanoramaInfo[] = [{
    name: 'Georgia Aquarium',
    url: Argon.resolveURL('images/aqui.jpg'),
    longitude: -84.3951,
    latitude: 33.7634,
    height: 206
},
{
    name: 'Centennial Park',
    url: Argon.resolveURL('images/cent.jpg'),    
    longitude: -84.3931,
    latitude: 33.7608,
    height: 309
},
{    
    name: 'High Museum',
    url: Argon.resolveURL('images/high.jpg'),    
    longitude: -84.38584,
    latitude: 33.79035,
    height: 289
},
{    
    name: 'Piedmont Park',
    url: Argon.resolveURL('images/pied.jpg'),    
    longitude: -84.37427,
    latitude: 33.78577,
    height: 271
}
];
let currentPanorama:PanoramaInfo;

// get the menu element
var menu = document.getElementById('menu');

// add buttons to the menu for each panorama
panoramas.forEach((p)=>{
    var button = document.createElement('button');
    button.textContent = p.name;
    menu.appendChild(button);
    // when a button is tapped, have the reality fade in the corresponding panorama
    button.addEventListener('click', ()=>{
        if (panoRealitySession) {
            panoRealitySession.request('edu.gatech.ael.panorama.showPanorama', {
                url: p.url,
                transition: {
                    easing: 'Quadratic.InOut',
                    duration: 1000
                }
            }).then(()=>{
                currentPanorama = p;
            })
        }
    })
})

app.focusEvent.addEventListener(()=>{
    document.getElementById('menu').style.display = 'block';
})
app.blurEvent.addEventListener(()=>{
    document.getElementById('menu').style.display = 'none';
})

// start listening for connections to a reality
app.reality.connectEvent.addEventListener((session)=>{
    // check if the connected supports our panorama protocol
    if (session.supportsProtocol('edu.gatech.ael.panorama')) {
        // save a reference to this session so our buttons can send messages
        panoRealitySession = session
        // show the menu
        document.getElementById('menu').style.visibility = 'visible';
        // load our panoramas
        panoramas.forEach((p)=>{
            panoRealitySession.request('edu.gatech.ael.panorama.loadPanorama', p);
        })
        // fade in the first panorama slowly
        panoRealitySession.request('edu.gatech.ael.panorama.showPanorama', {
            url: panoramas[0].url,
            transition: {
                easing: 'Quadratic.InOut',
                duration: 2000
            }
        }).then(()=>{
            currentPanorama = panoramas[0];
        })
        // hide the menu when the reality session closes
        session.closeEvent.addEventListener(()=>{
            document.getElementById('menu').style.visibility = 'collapse';
            panoRealitySession = undefined;
            currentPanorama = undefined;
        })
    }
})

const myMysteriousLabel = new THREE.Object3D();

// create a label  
var loader = new THREE.FontLoader();
loader.load( '../resources/fonts/helvetiker_regular.typeface.js', function ( font:THREE.Font ) {    
    const textOptions = {
        font: font,
        size: 15,
        height: 10,
        curveSegments: 10,
        bevelThickness: 1,
        bevelSize: 1,
        bevelEnabled: true
    }
    
    var textMaterial = new THREE.MeshStandardMaterial({
        color: 0x5588ff
    })
    
    function createDirectionLabel(text, position, rotation) {
        var textGeometry = new THREE.TextGeometry(text, textOptions);
        textGeometry.center();
        var textMesh = new THREE.Mesh(textGeometry, textMaterial);
        if (position.x) textMesh.position.x = position.x;
        if (position.y) textMesh.position.y = position.y;
        if (position.z) textMesh.position.z = position.z;
        if (rotation.x) textMesh.rotation.x = rotation.x;
        if (rotation.y) textMesh.rotation.y = rotation.y;
        if (rotation.z) textMesh.rotation.z = rotation.z;
        return textMesh;
    }
    
    var textMesh = createDirectionLabel("Pears!?", {x:-300}, {y:Math.PI/2});
    myMysteriousLabel.add(textMesh);
})


// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.
app.updateEvent.addEventListener(() => {
    // get the position and orientation (the "pose") of the user
    // in the local coordinate frame.
    const userPose = app.context.getEntityPose(app.context.user);
    
    // show a 3d label when displaying a particular panorama
    if (currentPanorama && currentPanorama.name === 'High Museum') {
        userLocation.add(myMysteriousLabel);
    } else {
        userLocation.remove(myMysteriousLabel);
    }

    // assuming we know the user's pose, set the position of our 
    // THREE user object to match it
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }
})

// renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(() => {
    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    const viewport = app.view.getViewport();
    renderer.setSize(viewport.width, viewport.height);
    
    // there is 1 subview in monocular mode, 2 in stereo mode    
    for (let subview of app.view.getSubviews()) {
        // set the position and orientation of the camera for 
        // this subview
        camera.position.copy(subview.pose.position);
        camera.quaternion.copy(subview.pose.orientation);
        // the underlying system provide a full projection matrix
        // for the camera. 
        camera.projectionMatrix.fromArray(subview.projectionMatrix);

        // set the viewport for this view
        let {x,y,width,height} = subview.viewport;
        renderer.setViewport(x,y,width,height);

        // set the webGL rendering parameters and render this view
        renderer.setScissor(x,y,width,height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
    }
})