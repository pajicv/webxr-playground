class Reticle extends THREE.Object3D {
    constructor() {
        super();

        this.loader = new THREE.GLTFLoader();

        this.loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", (gltf) => {
            this.add(gltf.scene);
        })

        this.visible = false;
    }
}

const createMeasurementPoint = (position) =>{
    const geometry = new THREE.SphereGeometry( 0.01 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.copy(position);
    sphere.visible = true;
    return sphere;
}
