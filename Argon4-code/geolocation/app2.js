var app = Argon.init();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var cssRenderer = new THREE.CSS3DRenderer();
app.viewport.element.appendChild(cssRenderer.domElement);
// retrieve the immersive context and initialize Three.js rendering
// old Argon3 code:
// var context = Argon.immersiveContext;
// var options = THREE.Bootstrap.createArgonOptions( context )
// var three = THREE.Bootstrap( options )
// All geospatial objects need to have an Object3D linked to a Cesium Entity.
// We need to do this because Argon needs a mapping between Entities and Object3Ds.
//
// Here we create two objects, showing two slightly different approaches.
// 
// First, we position a cube near Georgia Tech using a known LLA.
//
// Second, we will position a cube near our starting location.  This geolocated object starts without a
// location, until our reality is set and we know the location.  Each time the reality changes, we update
// the cube position.
// create a 100m cube with a Buzz texture on it, that we will attach to a geospatial object at Georgia Tech
var buzz = new THREE.Object3D;
var loader = new THREE.TextureLoader();
loader.load('buzz.png', function (texture) {
    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(10, 10, 10);
    buzz.add(mesh);
});
// have our geolocated object start somewhere, in this case near Georgia Tech in Atlanta.
// you should probably adjust this to a spot closer to you (we found the lon/lat of Georgia Tech using Google Maps)
// Argon.Cesium.Entity is still there
/*
var gatechGeoEntity = new Argon.Cesium.Entity({
    name: "Georgia Tech",
    position: Argon.Cesium.Cartesian3.fromDegrees(-84.398881, 33.778463)
  })
*/
// create a three Object3D linked to a Cesium Entity.  Get's added to the scene for us.
// old Argon3 code:
// var gatechGeoTarget = three.argon.objectFromEntity(gatechGeoEntity)
// gatechGeoTarget.add(buzz)
// new Argon4 code:
/*
var gatechGeoTarget = new THREE.Object3D;
  scene.add(gatechGeoTarget);
 

app.updateEvent.addEventListener(function (frameState) {
      var geoState = app.context.getCurrentEntityState(gatechGeoEntity);
      gatechGeoEntity.position;
      if (geoState.poseStatus & Argon.PoseStatus.KNOWN) {
          gatechGeoTarget.position.copy(geoState.position);
          gatechGeoTarget.name.copy(geoState.orientation);
      }
      if (geoState.poseStatus & Argon.PoseStatus.FOUND) {
          gatechGeoTarget.add(buzz);
      }
      else if (geoState.poseStatus & Argon.PoseStatus.LOST) {
          gatechGeoTarget.remove(buzz);
      }
  });
  */
// create a 1m cube with a wooden box texture on it, that we will attach to the geospatial object when we create it
// Box texture from https://www.flickr.com/photos/photoshoproadmap/8640003215/sizes/l/in/photostream/
//, licensed under https://creativecommons.org/licenses/by/2.0/legalcode
var box = new THREE.Object3D;
var loader = new THREE.TextureLoader();
loader.load('box.png', function (texture) {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    var mesh = new THREE.Mesh(geometry, material);
    box.add(mesh);
});
/* old argon3 code:
boxGeoObject.add(box)
three.scene.add(boxGeoObject);

// Now, EntityFromObject would have to be manually updated.
// Maybe not worry about it for now and simplify the example until there is an easier way.
var boxGeoEntity = three.argon.entityFromObject(boxGeoObject)
*/
// new argon4 code:
var boxGeoObject = new THREE.Object3D;
boxGeoObject.add(box);
scene.add(boxGeoObject);
// each time our context is assigned a new Reality, including the first time, we receive
// a "realityChange" event.  We should do initialization that is based on the state of the
// world here.
//
// The state parameter has the follow entries = {
//   reality: Argon.Reality,
//   previousReality: Argon.Reality
// }
// state.previousReality will be undefined the first time
//
var realityInit = false;
var boxCartographicDeg = [0, 0, 0];
/*

three.on("argon:realityChange", function(event) {
  realityInit = true;

  // set the position to be near the camera
  var cameraPosition = three.camera.getWorldPosition();
  cameraPosition.x += 5;
  boxGeoObject.position.copy(cameraPosition)
  
  // Now, EntityFromObject would have to be manually updated.
  // Maybe not worry about it for now and simplify the example until there is an easier way.
  //three.argon.updateEntityFromObject(boxGeoObject)

  // getCartographicDegreesFromEntity will return undefined if geoObject is not defined in geographic coordinates
  // which would happen if this Reality does not support geographic coordinates
  
  //boxCartographicDeg = three.argon.getCartographicDegreesFromEntity(boxGeoEntity) || [0,0,0]
})

*/
// Argon's update state is stored in the threestrap update event.argonState field.
// In general, this is only needed if you need to know lower-level information from Argon, such as the
// raw geolocation, which we grab and print in a div on the bottom of the screen
//
// The state parameter has the following entries = {
//    frameNumber: integer,
//    time: a Cesium time for the update,
//    referenceFrame: the root reference, either Cesium ReferenceFrame.FIXED or {id: frameId},
//    position: {
//       cartesian: Cesium.Cartesian,
//       cartographicDegrees: [longitude, latitude, height]
//    },
//    orientation: {
//       unitQuaternion: Cesium.Quaternion, // orientation in reference frame
//       unitQuaternionRelative: Cesium.Quaternion, // orientation relative to local origin
//    },
//    frustum: {
//       fov: number,
//       fovy: number,
//       aspectRatio: number
//    },
//    reality: {id: realityID}
//  }
/*
// in the threestrap update loop, update the screen feedback based on the world state.
var lastInfoText;
three.on('update', function(event) {
  var elem = document.getElementById('location');
  var state = event.argonState

  // ignore updates until we have a reality
  if (!realityInit) {
    elem.innerText = "No Reality Yet"
    return
  }
  // cartographicDegrees is a 3 element array containing [longitude, latitude, height]
  var gpsCartographicDeg = [0,0,0];
  if (state.position.cartographicDegrees) {
    gpsCartographicDeg = state.position.cartographicDegrees;
  }
  // ?
  // make it a little less boring
  //buzz.rotation.y += 2 * three.Time.delta
  //box.rotation.y += 3 * three.Time.delta

  // we'll compute the distance to the cube, just for fun. If the cube could be further away,
  // we'd want to use Cesium.EllipsoidGeodesic, rather than Euclidean distance, but this is fine here.
  var cameraPos = camera.getWorldPosition();
  var buzzPos = buzz.getWorldPosition();
  var boxPos = box.getWorldPosition();
  var distanceToGT = cameraPos.distanceTo( boxPos );
  var distanceToBuzz = cameraPos.distanceTo( buzzPos );

  // create some feedback text
  var infoText = "Geospatial Argon example:\n"
  // infoText = "frame: " + state.frameNumber;
  // infoText += " argon time (" + toFixed(three.argon.time.secondsOfDay, 1) + ")";
  // infoText += " three time (" + toFixed(three.Time.now, 1) + ")\n";
  infoText += "eye (" + toFixed(gpsCartographicDeg[0],6) + ", ";
  infoText += toFixed(gpsCartographicDeg[1], 6) + ", " + toFixed(gpsCartographicDeg[2], 2) + ")\n";
  infoText += "cube(" + toFixed(boxCartographicDeg[0], 6) + ", ";
  infoText += toFixed(boxCartographicDeg[1], 6) + ", " + toFixed(boxCartographicDeg[2], 2) + ")\n";
  infoText += "distance to GT (" + toFixed(distanceToGT,2) + ")";
  infoText += " distance to box (" + toFixed(distanceToBuzz,2) + ")";

  if (lastInfoText !== infoText) { // prevent unecessary DOM invalidations
    elem.innerText = infoText;
    lastInfoText = infoText;
  }
})
*/
// make floating point output a little less ugly
function toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
}
// new Argon4 code
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);
var lastInfoText;
app.updateEvent.addEventListener(function () {
    var frustum = app.camera.currentFrustum;
    camera.fov = Argon.Cesium.CesiumMath.toDegrees(frustum.fovy);
    camera.aspect = frustum.aspectRatio;
    camera.projectionMatrix.fromArray(frustum.infiniteProjectionMatrix);
    // We can optionally provide a second argument to getCurrentEntityState
    // with a desired reference frame. Otherwise, the implementation uses
    // the default origin as the reference frame. 
    var eyeState = app.context.getCurrentEntityState(app.context.eye);
    if (eyeState.poseStatus | Argon.PoseStatus.KNOWN) {
        camera.position.copy(eyeState.position);
        camera.quaternion.copy(eyeState.orientation);
    }
    /*
    var elem = document.getElementById('location');
    var state = event.argonState

    // ignore updates until we have a reality
    if (!realityInit) {
      elem.innerText = "No Reality Yet"
      return
    }
    // cartographicDegrees is a 3 element array containing [longitude, latitude, height]
    var gpsCartographicDeg = [0,0,0];
    if (state.position.cartographicDegrees) {
      gpsCartographicDeg = state.position.cartographicDegrees;
    }
    // ?
    // make it a little less boring
    //buzz.rotation.y += 2 * three.Time.delta
    //box.rotation.y += 3 * three.Time.delta
    
    app.context.eye.position
    cesium api ??

    // we'll compute the distance to the cube, just for fun. If the cube could be further away,
    // we'd want to use Cesium.EllipsoidGeodesic, rather than Euclidean distance, but this is fine here.
    var cameraPos = app.camera.getWorldPosition();
    var buzzPos = buzz.getWorldPosition();
    var boxPos = box.getWorldPosition();
    var distanceToGT = cameraPos.distanceTo( boxPos );
    var distanceToBuzz = cameraPos.distanceTo( buzzPos );

    // create some feedback text
    var infoText = "Geospatial Argon example:\n"
    // infoText = "frame: " + state.frameNumber;
    // infoText += " argon time (" + toFixed(three.argon.time.secondsOfDay, 1) + ")";
    // infoText += " three time (" + toFixed(three.Time.now, 1) + ")\n";
    infoText += "eye (" + toFixed(gpsCartographicDeg[0],6) + ", ";
    infoText += toFixed(gpsCartographicDeg[1], 6) + ", " + toFixed(gpsCartographicDeg[2], 2) + ")\n";
    infoText += "cube(" + toFixed(boxCartographicDeg[0], 6) + ", ";
    infoText += toFixed(boxCartographicDeg[1], 6) + ", " + toFixed(boxCartographicDeg[2], 2) + ")\n";
    infoText += "distance to GT (" + toFixed(distanceToGT,2) + ")";
    infoText += " distance to box (" + toFixed(distanceToBuzz,2) + ")";

    if (lastInfoText !== infoText) { // prevent unecessary DOM invalidations
      elem.innerText = infoText;
      lastInfoText = infoText;
    }
    
    var cameraPosition = app.camera.getWorldPosition();
    cameraPosition.x += 5;
    boxGeoObject.position.copy(cameraPosition)
    */
});
app.renderEvent.addEventListener(function () {
    var _a = app.viewport.current, width = _a.width, height = _a.height;
    cssRenderer.setSize(width, height);
    cssRenderer.render(scene, camera);
});
