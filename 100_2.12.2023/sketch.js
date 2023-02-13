import * as THREE from "three"
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

var scene, clock, camera, renderer
var directionalLight, ambientLight, pointLightL, pointLightR, effect
var axesHelper, gridHelper, dLightHelper, dLightShadowHelper

const start = Date.now();

init();
update();


////////////////////////////////////////////////////////////////////////////////////////////////
/******* initialize *******/

function init() {
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  const stlLoader = new STLLoader();
  var ganesha;
  stlLoader.load("assets/g1-mqor.stl", function (geo) {
    var mat = new THREE.MeshPhongMaterial({ color: "white", specular: 0x111111, shininess: 100 });
    ganesha = new THREE.Mesh(geo, mat);
    ganesha.name = "ganesha";
    ganesha.scale.set(0.5, 0.5, 0.5);
    ganesha.rotation.x = -Math.PI / 2;
    ganesha.position.set(0, -20, 0);
    scene.add(ganesha);

    ganesha.castShadow = true;
  });
  // model from Scan the World: https://www.myminifactory.com/object/3d-print-ganesha-lover-of-sweets-251260

  directionalLight = getDirectionalLight(1);
  directionalLight.position.set(-13, 100, 50);
  scene.add(directionalLight);
  ambientLight = getAmbientLight(0.6);
  scene.add(ambientLight);

  pointLightL = new THREE.PointLight(0xffffff, 1, 100);
  pointLightL.position.set(-50, 50, 50);
  // scene.add(pointLightL);

  pointLightR = new THREE.PointLight(0xffffff, 1, 100);
  pointLightR.position.set(40, 50, 0);
  scene.add(pointLightR);

  var pointLightLHelper = new THREE.PointLightHelper(pointLightL, 1);
  // scene.add(pointLightLHelper);
  var pointLightRHelper = new THREE.PointLightHelper(pointLightR, 1);
  // scene.add(pointLightRHelper);

  axesHelper = getAxesHelper(5);
  // scene.add(axesHelper);
  gridHelper = getGridHelper(30);
  // scene.add(gridHelper);
  dLightHelper = getDLightHelper();
  // scene.add(dLightHelper);
  dLightShadowHelper = getDLightShadowHelper();
  // scene.add(dLightShadowHelper);

  const gui = new GUI();
  gui.add(directionalLight.position, "x", -100, 100);
  gui.add(directionalLight, "intensity", 0.1, 2);
  // gui.add(pointLightL.position, "x", -100, 100);
  // gui.add(pointLightL.position, "z", -100, 100);
  gui.add(pointLightR.position, "x", -100, 100);
  gui.add(pointLightR.position, "z", -100, 100);
  // gui.add(ganesha.rotation, "y", -Math.PI*2, Math.PI*2);

  camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    1000);

  scene.background = new THREE.Color(0x000000);
  // scene.add(camera);
  // camera.position.set(-50, 0, 35);
  // camera.lookAt(scene.position);

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

  cameraYPos.position.y = 10;
  cameraZPos.position.z = 60;
  cameraYRot.rotation.y = 180;
  // cameraXRot.rotation.x = Math.PI/2 * 0.05;

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  effect = new AsciiEffect(renderer, ' /.:-+*=%@#!•~', { invert: true, resolution: 0.3 });
  effect.setSize(window.innerWidth, window.innerHeight);
  effect.domElement.style.color = "white";
  effect.domElement.style.backgroundColor = "black";

  // document.body.appendChild(renderer.domElement);
  document.body.appendChild(effect.domElement); // special case for ASCII effect!
  update(renderer, scene, camera, clock);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ASCII demo from https://github.com/mrdoob/three.js/blob/master/examples/webgl_effects_ascii.html

  const controls = new OrbitControls(camera, effect.domElement);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}


////////////////////////////////////////////////////////////////////////////////////////////////
/******* helpers *******/

function getAxesHelper(size) {
  var helper = new THREE.AxesHelper(size);
  return helper;
}

function getGridHelper(size) {
  var helper = new THREE.GridHelper(size, 60);
  return helper;
}

function getDLightHelper() {
  var helper = new THREE.DirectionalLightHelper(directionalLight);
  return helper;
}

function getDLightShadowHelper() {
  var helper = new THREE.CameraHelper(directionalLight.shadow.camera);
  return helper;
}


////////////////////////////////////////////////////////////////////////////////////////////////
/******* lighting *******/

function getDirectionalLight(intensity) {
  var light = new THREE.DirectionalLight(0xffffff, intensity);
  // directional light produces rays that are all parallel to each other
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 500;
  var scale = 1.75;
  return light;
}

function getAmbientLight(intensity) {
  var light = new THREE.AmbientLight('rgb(10, 30, 50)', intensity);
  // ambient light does not cast shadows
  return light;
}


////////////////////////////////////////////////////////////////////////////////////////////////
/******* update *******/

function update(renderer, scene, camera, clock) {

  window.requestAnimationFrame( // intentionally recursive
    function () {
      update(renderer, scene, camera, clock);
    }
  );

  render();
}


////////////////////////////////////////////////////////////////////////////////////////////////
/******* render *******/
function render() {
  // var timeElapsed = clock.getElapsedTime();
  // kept getting "TypeError: Cannot read properties of undefined (reading 'getElapsedTime')"

  // pointLightL.position.y += Math.sin(timeElapsed) + 50;
  // pointLightL.position.z += Math.sin(timeElapsed) + 50;

  // pointLightL.position.y = speed;
  // pointLightL.position.z = speed;
  // pointLightR.position.y = speed;
  // pointLightR.position.z = speed;

  // const timer = Date.now() - start;

  // var speed = Math.sin(timer * 5) / 2;
  // var ganesha = scene.getObjectByName("ganesha");
  // ganesha.rotation.y = speed;

  var cameraZPos = scene.getObjectByName("cameraZPos");
  var cameraXRot = scene.getObjectByName("cameraXRot");
  var cameraYRot = scene.getObjectByName("cameraYRot");
  // cameraYRot.rotation.y = Math.sin(timeElapsed + 50) * 1.2;
  cameraYRot.rotation.y += 0.01;
  /* camera rig from https://www.linkedin.com/learning/learning-3d-graphics-on-the-web-with-three-js/add-more-objects-to-the-scene?autoSkip=true&autoplay=true&resume=false&u=2131553 */
  
  // renderer.render(scene, camera);
  effect.render(scene, camera);
}


////////////////////////////////////////////////////////////////////////////////////////////////
/******* responsiveness *******/
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix;
  renderer.setSize(window.innerWidth, window.innerHeight);
  effect.setSize(window.innerWidth, window.innerHeight);
  render();
}
