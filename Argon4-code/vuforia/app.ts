declare const THREE: any;
declare const Argon: any;

const app = Argon.init();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();

const cssRenderer = new THREE.CSS3DRenderer();
const webglRenderer = new THREE.WebGLRenderer({ alpha: true, logarithmicDepthBuffer: true });

app.viewport.element.appendChild(cssRenderer.domElement);
app.viewport.element.appendChild(webglRenderer.domElement);

app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);

app.vuforia.init();
app.vuforia.startCamera();
app.vuforia.startObjectTracker();

const dataset = app.vuforia.createDataSet('../resources/datasets/StonesAndChips.xml');

dataset.trackablesPromise.then((trackables) => {

    // We subscribe to the stones trackable in order to start receiving updates for it
    const stonesEntity = app.context.subscribeToEntityById(trackables['stones'].id)
    const stonesObject = new THREE.Object3D;
    scene.add(stonesObject);

    var box = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), new THREE.MeshNormalMaterial())
    box.position.z = 25

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