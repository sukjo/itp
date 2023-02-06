import * as THREE from "three"
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js'
// import { GUI } from '/Users/joannesuk/Documents/NYU ITP/100 days of making/100_2.02.2023/node_modules/dat.gui'
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

var scene, clock, camera, renderer, plane, lampHead, lampPole, rightBuilding, leftBuilding, rightBoxGrid1, rightBoxGrid2, rightBoxGrid3, rightBoxGrid4, leftBoxGrid1, leftBoxGrid2, leftBoxGrid3, leftBoxGrid4, directionalLight, pointLight, ambientLight, mirrorSphere, mirrorSphereCamera

function init() {
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512);
  mirrorSphereCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
  scene.add(mirrorSphereCamera);
  const mirrorSphereMaterial = new THREE.MeshBasicMaterial({
    envMap: cubeRenderTarget.texture
  });
  var sphereGeo = new THREE.SphereGeometry(4, 32, 16);
  mirrorSphere = new THREE.Mesh(sphereGeo, mirrorSphereMaterial);
  mirrorSphere.position.set(10, 10, mirrorSphere.geometry.parameters.radius);
  // mirrorSphereCamera.position.copy(mirrorSphere.position);
  // based on mirror sphere example from https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_ik.html

  plane = getPlane(90);
  plane.name = 'floor-plane';
  plane.position.set(0, 0, 0);
  plane.rotation.x = Math.PI / 2;

  const frontLeft = {
    x: plane.geometry.parameters.width,
    z: plane.geometry.parameters.width
  };
  const frontRight = {
    x: -1 * plane.geometry.parameters.width,
    z: plane.geometry.parameters.width
  };
  const rearRight = {
    x: -1 * plane.geometry.parameters.width,
    z: -1 * plane.geometry.parameters.width
  };
  const rearLeft = {
    x: plane.geometry.parameters.width,
    z: -1 * plane.geometry.parameters.width
  };

  pointLight = getPointLight(1);
  pointLight.position.set(25, -5, 25);

  lampHead = getCylinder(0.75, 3, 0x16191D);
  lampPole = getCylinder(0.2, 6, 0x16191D);
  lampHead.position.set(0, 0, 0);
  lampPole.position.set(0, 2, 0);

  rightBuilding = getBox(30, 50, 30, 0x554235);
  rightBuilding.position.x = rearRight.x / 2 + rightBuilding.geometry.parameters.width / 2;
  rightBuilding.position.y = -rightBuilding.geometry.parameters.height / 2;
  rightBuilding.position.z = rearRight.z / 2 + rightBuilding.geometry.parameters.width + 20;

  leftBuilding = getBox(30, 50, 30, 0x554235);
  leftBuilding.position.x = rearLeft.x / 2 - leftBuilding.geometry.parameters.width / 2;
  leftBuilding.position.y = -leftBuilding.geometry.parameters.height / 2;
  leftBuilding.position.z = rearLeft.z / 2 + leftBuilding.geometry.parameters.width / 2;

  rightBoxGrid1 = getBoxGrid(25, //rows
    24, //cols
    27.5, //offsetX
    0, //offsetZ
    Math.PI / 2, //rotZ
    0); // rotY
  leftBoxGrid1 = getBoxGrid(25,
    24,
    27.5,
    0,
    Math.PI / 2,
    0);
  rightBoxGrid2 = getBoxGrid(25,
    24,
    24,
    27,
    Math.PI / 2,
    -Math.PI / 2);
  leftBoxGrid2 = getBoxGrid(25,
    24,
    24,
    27,
    Math.PI / 2,
    -Math.PI / 2);
  rightBoxGrid3 = getBoxGrid(25,
    24,
    -3,
    0,
    Math.PI / 2,
    0);
  leftBoxGrid3 = getBoxGrid(25,
    24,
    -3,
    0,
    Math.PI / 2,
    0);
  rightBoxGrid4 = getBoxGrid(25,
    24,
    24,
    -3.5,
    Math.PI / 2,
    -Math.PI / 2);
  leftBoxGrid4 = getBoxGrid(25,
    24,
    24,
    -3.5,
    Math.PI / 2,
    -Math.PI / 2);


  directionalLight = getDirectionalLight(0.75);
  directionalLight.position.set(20, -50, 50);

  // ambientLight = getAmbientLight(1);

  scene.add(plane);
  plane.add(mirrorSphere);
  scene.add(rightBuilding);
  scene.add(leftBuilding);
  rightBuilding.add(rightBoxGrid1);
  leftBuilding.add(leftBoxGrid1);
  rightBuilding.add(rightBoxGrid2);
  leftBuilding.add(leftBoxGrid2);
  rightBuilding.add(rightBoxGrid3);
  leftBuilding.add(leftBoxGrid3);
  rightBuilding.add(rightBoxGrid4);
  leftBuilding.add(leftBoxGrid4);
  scene.add(pointLight);
  scene.add(directionalLight);
  // scene.add(ambientLight);
  pointLight.add(lampHead);
  pointLight.add(lampPole);


  camera = new THREE.PerspectiveCamera(
    -100,
    window.innerWidth / window.innerHeight,
    0.1,
    1000);

  var cameraYPos = new THREE.Group();
  var cameraZPos = new THREE.Group();
  var cameraXRot = new THREE.Group();
  var cameraYRot = new THREE.Group();

  cameraYPos.name = "cameraYPos";
  cameraZPos.name = "cameraZPos";
  cameraXRot.name = "cameraXRot";
  cameraYRot.name = "cameraYRot";

  cameraYPos.add(camera)
  cameraZPos.add(cameraYPos);
  cameraXRot.add(cameraZPos);
  cameraYRot.add(cameraXRot);
  scene.add(cameraYRot);

  cameraYPos.position.y = -20;
  cameraZPos.position.z = 95;
  cameraYRot.rotation.y = 0;
  cameraXRot.rotation.x = Math.PI/2 * 0.05;

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  update(renderer, scene, camera, clock);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.setClearColor(0xffffff, 0);

  // scene.add(camera);
  // camera.position.set(30, -20, 50);
  // camera.lookAt(scene.position);

  let orbit = new OrbitControls(camera, renderer.domElement);
  orbit.update();

  clock.start();

}

init();


/******* geometries *******/
// mesh basic material does not respond to light sources

function getPlane(size) {
  var geo = new THREE.PlaneGeometry(size, size);
  var mat = new THREE.MeshLambertMaterial({
    color: 0xBAADA1,
    side: THREE.DoubleSide
  })

  var loader = new THREE.TextureLoader();
  mat.map = loader.load('/assets/snow-texture.jpg');
  mat.bumpMap = loader.load('/assets/snow-texture.jpg'); // changes how the light interacts w the surface to create illusion of height
  mat.bumpScale = 0.01;

  var maps = ['map', 'bumpMap'];
  maps.forEach(function (mapName) {
    var texture = mat[mapName];
    // texture.wrapS = THREE.RepeatWrapping; // x direction
    // texture.wrapT = THREE.RepeatWrapping // y direction
    // texture.repeat.set(1.5, 1.5);
  })


  var mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;

  return mesh;
}

function getCylinder(rad, height, col) {
  var geo = new THREE.CylinderGeometry(rad, rad, height, 32, 1, false, 0, Math.PI * 2);
  var mat = new THREE.MeshPhongMaterial({ color: col });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function getBox(w, h, d, col) {
  var geo = new THREE.BoxGeometry(w, h, d, 1, 1, 1);
  var mat = new THREE.MeshPhongMaterial({ color: col });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}


function getBoxGrid(rows, cols, offsetX, offsetZ, rotZ, rotY) {
  var group = new THREE.Group();
  /* a group is a non-geometric object used to organize other objects */

  // var separationMultiplier = 1;
  var separationMultiplier = (rightBuilding.geometry.parameters.width / cols) - 0.25;

  for (let i = 0; i < cols; i++) {
    var obj = getBox(1.5, 0.5, 0.5, 0xffdd99);
    obj.position.x = i * separationMultiplier * 2;
    obj.position.y = obj.geometry.parameters.height / 2;
    group.add(obj);
    for (let j = 1; j < rows; j++) {
      var obj = getBox(1.5, 0.5, 0.5, 0xffdd99);
      obj.position.x = i * separationMultiplier * 2;
      obj.position.y = obj.geometry.parameters.height / 2;
      obj.position.z = j * separationMultiplier;
      group.add(obj);
    }
  }

  group.position.x = -(separationMultiplier * (rows - 1)) / 2 + offsetX;
  group.position.z = -(separationMultiplier * (cols - 1)) / 2 + offsetZ;
  group.position.y = -23.5;
  group.rotation.z = rotZ;
  group.rotation.y = rotY;

  return group;
}
/* box grid formula from https://www.linkedin.com/learning/learning-3d-graphics-on-the-web-with-three-js/add-more-objects-to-the-scene?autoSkip=true&autoplay=true&resume=false&u=2131553 */



/******* lighting *******/
function getPointLight(intensity) {
  var light = new THREE.PointLight(0xffffff, intensity);
  light.castShadow = true;
  return light;
}

function getDirectionalLight(intensity) {
  var light = new THREE.DirectionalLight(0xffffff, intensity);
  // directional light produces rays that are all parallel to each other
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;

  light.shadow.camera.near = 1;
  light.shadow.camera.far = 500;

  var scale = 1.75;
  light.shadow.camera.left = -plane.geometry.parameters.width / 2 * scale;
  light.shadow.camera.bottom = -plane.geometry.parameters.width / 2 * scale;
  light.shadow.camera.right = plane.geometry.parameters.width / 2 * scale;
  light.shadow.camera.top = plane.geometry.parameters.width / 2 * scale;
  return light;
}

function getAmbientLight(intensity) {
  var light = new THREE.AmbientLight('rgb(10, 30, 50)', intensity);
  // ambient light does not cast shadows
  return light;
}


/******* helpers *******/
// let axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// let gridHelper = new THREE.GridHelper(30, 60);
// scene.add(gridHelper);

// let dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
// scene.add(dLightHelper);

// let dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);

// let sphereSize = 5;
// let pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize );
// scene.add( pointLightHelper );


/******* GUI *******/
// const gui = new GUI();
// gui.add(plane.rotation, "x", 0, Math.PI*2);


function update(renderer, scene, camera, clock) {

  mirrorSphere.visible = false;
  mirrorSphereCamera.update(renderer, scene);
  mirrorSphere.visible = true;

  renderer.render(scene, camera);

  var timeElapsed = clock.getElapsedTime();

  // var timer = Date.now() * 0.0005;
  // camera.position.x = Math.cos( timer ) * 25;
  // camera.position.y = -9;
  // camera.position.z = Math.sin( timer ) * 25;

  // camera positioning code from https://www.youtube.com/watch?v=g8SYYvyOs8c 

  // camera.lookAt( scene.position );

  var cameraZPos = scene.getObjectByName("cameraZPos");
  var cameraXRot = scene.getObjectByName("cameraXRot");
  var cameraYRot = scene.getObjectByName("cameraYRot");
  cameraYRot.rotation.y = Math.sin(timeElapsed + 50) * 1.2;
  /* camera rig from https://www.linkedin.com/learning/learning-3d-graphics-on-the-web-with-three-js/add-more-objects-to-the-scene?autoSkip=true&autoplay=true&resume=false&u=2131553 */

  window.requestAnimationFrame( // intentionally recursive
    function () {
      update(renderer, scene, camera, clock);
    }
  );
}

update();