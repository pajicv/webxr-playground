function toScreenPosition(point, camera) {
    let vector = new THREE.Vector3();

    console.log(point);

    vector.copy(point);

    vector.project(camera);

    vector.x = (vector.x + 1) * window.innerWidth / 2;
    vector.y = (-vector.y + 1) * window.innerHeight / 2;
    vector.z = 0;

    console.log(vector);

    return vector;
}
