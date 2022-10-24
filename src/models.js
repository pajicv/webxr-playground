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

        this.position.set(0, 2, 0);

        this.visible = true;

        const tetha = Math.random() * Math.PI;

        const phi = Math.random() * Math.PI * 2;

        const velocity = 0.01;

        this.direction = {
            velocity,
            tetha,
            phi
        }
    }

    updatePosition = () => {
        const { x, y, z } = this.position;

        const { velocity, tetha, phi } = this.direction;

        /** forward/backward direction */
        const dz = velocity * Math.sin(tetha) * Math.cos(phi);

        /** left/right direction */
        const dx = velocity * Math.sin(tetha) * Math.sin(phi);

        /** up/down direction */
        // const dy = velocity * Math.cos(tetha);


        this.position.set(x + dx, y, z + dz);
    }
}