class Fly extends THREE.Object3D {
    constructor() {
        super();

        /** init geometry */
        const geometry = new THREE.SphereGeometry(0.01);

        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        const sphere = new THREE.Mesh(geometry, material);

        this.add(sphere);

        this.position.set(0, 0, -1);

        this.visible = true;


        /** init movement */
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
        const dy = velocity * Math.cos(tetha);

        this.position.set(x + dx, y + dy, z + dz);
    }

    updateMovement = () => {
        const { velocity, tetha, phi } = this.direction;

        const dtetha = Math.random() * 0.1 * Math.PI;

        const dphi = Math.random() * 0.2 * Math.PI;

        this.direction = { velocity, tetha: tetha + dtetha, phi: phi + dphi }
    }

}

class Laser extends THREE.Object3D {
    constructor(position, orientation) {
        super();

        /** init geometry */
        const geometry = new THREE.CylinderGeometry( 0.001, 0.001, 0.1, 32 );

        const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );

        const cylinder = new THREE.Mesh( geometry, material );

        this.add( cylinder );

        this.position.set(position.x, position.y, position.z);

        this.setRotationFromQuaternion(orientation); 

        this.rotateX(Math.PI / 2);

        this.direction = getCameraDirectionVector(orientation);

        this.visible = true;
    }

    update = () => {
        this.updatePosition();
        this.checkWorldBounds();
    }

    updatePosition = () => {
        const { x, y, z } = this.position;

        const velocity = this.direction.clone();

        velocity.multiplyScalar(0.1);

        this.position.set(x + velocity.x, y + velocity.y, z + velocity.z);
    }

    checkWorldBounds = () => {
        if (this.position.z < -3) {
            this.visible = false;
        }
    }

}