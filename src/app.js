function onNoXRDevice() {
    document.body.classList.add('unsupported');
}

/**
 * Query for WebXR support. If there's no support for the `immersive-ar` mode,
 * show an error.
 */
(async function() {
    const isArSessionSupported =
        navigator.xr &&
        navigator.xr.isSessionSupported &&
        await navigator.xr.isSessionSupported("immersive-ar");
    if (isArSessionSupported) {
        document.getElementById("enter-ar").addEventListener("click", window.app.activateXR)
    } else {
        onNoXRDevice();
    }
})();

/**
 * Container class to manage connecting to the WebXR Device API
 * and handle rendering on every frame.
 */
class App {
    constructor() {
        this.pointCount = 1;

        this.labels = [];

        this.measurementPoint = null;

        /** Create overlay container. */
        this.initLabelContainer();

        document.getElementById("move-back").addEventListener("click", this.movePointBackward)

        document.getElementById("move-forward").addEventListener("click", this.movePointForward)

        document.getElementById("place-point").addEventListener("click", this.onSelect)
    }

    /**
     * Run when the Start AR button is pressed.
     */
    activateXR = async () => {
        try {
            this.xrSession = await navigator.xr.requestSession("immersive-ar", {
              requiredFeatures: ['hit-test', 'dom-overlay'],
              domOverlay: { root: document.body }
            });

            /** Create the canvas that will contain our camera's background and our virtual scene. */
            this.createXRCanvas();

            /** With everything set up, start the app. */
            await this.onSessionStarted();
        } catch(e) {
            console.log(e);
            onNoXRDevice();
        }
    }

    /**
     * Add a canvas element and initialize a WebGL context that is compatible with WebXR.
     */
    createXRCanvas() {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.gl = this.canvas.getContext("webgl", {xrCompatible: true});

        this.xrSession.updateRenderState({
            baseLayer: new XRWebGLLayer(this.xrSession, this.gl)
        });
    }

    /**
     * Called when the XRSession has begun. Here we set up our three.js
     * renderer, scene, and camera and attach our XRWebGLLayer to the
     * XRSession and kick off the render loop.
     */
    onSessionStarted = async () => {
        /** Add the `ar` class to our body, which will hide our 2D components. */
        document.body.classList.add('ar');

        /** To help with working with 3D on the web, we'll use three.js. */
        this.setupThreeJs();

        /** Setup an XRReferenceSpace using the "local" coordinate system. */
        this.localReferenceSpace = await this.xrSession.requestReferenceSpace('local');

        /** Create another XRReferenceSpace that has the viewer as the origin. */
        this.viewerSpace = await this.xrSession.requestReferenceSpace('viewer');

        /** Perform hit testing using the viewer as origin. */
        this.hitTestSource = await this.xrSession.requestHitTestSource({ space: this.viewerSpace });

        /** Start a rendering loop using this.onXRFrame. */
        this.xrSession.requestAnimationFrame(this.onXRFrame);

        // this.xrSession.addEventListener("select", this.onSelect);
    }

    /**
     * Called on the XRSession's requestAnimationFrame.
     * Called with the time and XRPresentationFrame.
     */
    onXRFrame = (time, frame) => {
        /** Queue up the next draw request. */
        this.xrSession.requestAnimationFrame(this.onXRFrame);

        /** Bind the graphics framebuffer to the baseLayer's framebuffer. */
        const framebuffer = this.xrSession.renderState.baseLayer.framebuffer;

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
        // this.renderer.setFramebuffer(framebuffer);

        /** Retrieve the pose of the device.
         * XRFrame.getViewerPose can return null while the session attempts to establish tracking. */
        const pose = frame.getViewerPose(this.localReferenceSpace);

        if (pose) {
          /** In mobile AR, we only have one view. */
          const view = pose.views[0];

          const viewport = this.xrSession.renderState.baseLayer.getViewport(view);
          this.renderer.setSize(viewport.width, viewport.height)

          /** Use the view's transform matrix and projection matrix to configure the THREE.camera. */
          this.camera.matrix.fromArray(view.transform.matrix)
          this.camera.projectionMatrix.fromArray(view.projectionMatrix);
          this.camera.updateMatrixWorld(true);

          /** Conduct hit test. */
          const hitTestResults = frame.getHitTestResults(this.hitTestSource);

          /** If we have results, consider the environment stabilized. */
          if (!this.stabilized && hitTestResults.length > 0) {
            this.stabilized = true;
            document.body.classList.add('stabilized');
          }
          if (hitTestResults.length > 0) {
            const hitPose = hitTestResults[0].getPose(this.localReferenceSpace);

            /** Update the reticle position. */
            this.reticle.visible = true;
            this.reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
            this.reticle.updateMatrixWorld(true);
        }

            this.labels.map((label) => {
                let pos = toScreenPosition(label.point, this.camera);
                let x = pos.x;
                let y = pos.y;
                label.div.style.transform = "translate(-50%, -50%) translate(" + x + "px," + y + "px)";
            })


        if (this.fly) {
             this.fly.updatePosition();
        }  
    
          /** Render the scene with THREE.WebGLRenderer. */
          this.renderer.render(this.scene, this.camera)
    }

    }

    /**
     * Initialize three.js specific rendering code, including a WebGLRenderer,
     * a demo scene, and a camera for viewing the 3D content.
     */
    setupThreeJs() {
        /** To help with working with 3D on the web, we'll use three.js.
         * Set up the WebGLRenderer, which handles rendering to our session's base layer. */
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            preserveDrawingBuffer: true,
            canvas: this.canvas,
            context: this.gl
        });

        this.renderer.autoClear = false;
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        /** Initialize our demo scene. */
        this.scene = new THREE.Scene();

        this.reticle = new Reticle();

        this.fly = new Fly();

        this.scene.add(this.fly);

        this.scene.add(this.reticle);

        /** We'll update the camera matrices directly from API, so
         * disable matrix auto updates so three.js doesn't attempt
         * to handle the matrices independently. */
        this.camera = new THREE.PerspectiveCamera();

        this.camera.matrixAutoUpdate = false;
    }

    /** Place a ... when the screen is tapped. */
    onSelect = () => {
        if (this.reticle.visible) {
            // let text = document.createElement('div');

            // text.className = 'label';

            // text.style.color = 'rgb(255,255,255)';

            // text.style.position = 'absolute';

            // text.style.top = 0;

            // text.textContent = `Point ${this.pointCount}`;

            // document.querySelector('#container').appendChild(text);

            // this.pointCount++;

            // let point = new THREE.Vector3();

            // point.copy(this.reticle.position);

            // this.labels.push({div: text, point})

            // const measurementPoint = createMeasurementPoint(point);

            // this.measurementPoint = measurementPoint;

            // this.scene.add(measurementPoint);

        }
    }

    initLabelContainer = () => {
        const labelContainer = document.createElement('div');

        labelContainer.style.position = 'absolute';

        labelContainer.style.top = '0px';

        labelContainer.style.pointerEvents = 'none';

        labelContainer.setAttribute('id', 'container');

        document.body.appendChild(labelContainer);
    }

    movePointBackward = () => {
        const {x, y, z} = this.measurementPoint.position;
        this.measurementPoint.position.set(x, y, z - 0.1);
    }

    movePointForward = () => {
        const {x, y, z} = this.measurementPoint.position;
        this.measurementPoint.position.set(x, y, z + 0.1);
    }
}

window.app = new App();

