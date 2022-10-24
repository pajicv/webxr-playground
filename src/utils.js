function toScreenPosition(point, camera) {
    let vector = new THREE.Vector3();

    vector.copy(point);

    vector.project(camera);

    vector.x = (vector.x + 1) * window.innerWidth / 2;
    vector.y = (-vector.y + 1) * window.innerHeight / 2;
    vector.z = 0;

    return vector;
}


function getCameraDirectionVector(quaternion) {
    const vector = new THREE.Vector3(0, 0, -1);

    vector.applyQuaternion(quaternion);

    return vector;
}