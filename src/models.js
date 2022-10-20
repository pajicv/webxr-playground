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

class Fly extends THREE.Object3D {
    constructor() {
        super();

        const geometry = new THREE.SphereGeometry( 0.01 );

        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        
        const sphere = new THREE.Mesh( geometry, material );

        this.add(sphere);

        this.position.set(0, 1, 0);

        this.visible = true;
    }

    updatePosition = () => {
        const {x, y, z} = this.position;

        const dx = (Math.random() - 0.5) / 100;

        const dy = (Math.random() - 0.5) / 100;

        const dz = (Math.random() - 0.5) / 100;

        this.position.set(x + dx, y + dy, z + dz);
    }
}