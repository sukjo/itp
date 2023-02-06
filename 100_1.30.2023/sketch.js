// import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';

var scene, camera, renderer, knot, rect
var basket = [];

function init() {
  scene = new THREE.Scene();

  for (i = 0; i < 16; i++) {
    knot = getKnot(0.8, 0.4, 100, 12, 16, 6);
    // knot.position.x = i * 1.5;
    // knot.position.y = i * 1.8;
    // knot.position.z = 0;
    knot.position.x = Math.random(-2000,2000);
    knot.position.y = Math.random(-2000,2000);
    knot.position.z = Math.random(-2000,2000);
    knot.name = 'knotty';

    rect = getRect(0.25, 0.25, 5, 32);
    rect.position.x = 0;
    rect.position.y = -1.5;
    rect.position.z = 0;

    knot.add(rect);
    scene.add(knot);
    basket.push(knot);

  }

  camera = new THREE.PerspectiveCamera(
    125, 
    window.innerWidth/window.innerHeight, 
    0.1, 
    1000);


  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  update(renderer, scene, camera);

  renderer.shadowMap.enabled = true;

  renderer.setClearColor(0xF2F2F2);


  camera.position.set(3, 2, 5);
  camera.lookAt(0, 0, 0);

  // let orbit = new OrbitControls(camera, renderer.domElement);
  // orbit.update();

}

init();


/******* geometries *******/
function getKnot (radius, tube, tubSeg, radSeg, p, q) {
  var geo = new THREE.TorusKnotGeometry(radius, tube, tubSeg, radSeg, p, q);
  var mat = new THREE.MeshNormalMaterial(
  //   {color: 0xb9e3b0,
  // wireframe: false}
  );
  var mesh = new THREE.Mesh(geo, mat);

  return mesh;
  mesh.castShadow = true;
  mesh.position.set(0, 0, 0);

}

function getRect (radTop, radBot, height, radSeg) {
  var geo = new THREE.CylinderGeometry(radTop, radBot, height, radSeg);
  var mat = new THREE.MeshPhongMaterial(
  {
    color: 0xb9e3b0
  });
  var mesh = new THREE.Mesh(geo, mat);

  return mesh;
  mesh.castShadow = true;
  mesh.position.set(0, 0, 0);
}


/******* light *******/
let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

let directionalLight = new THREE.DirectionalLight(0xb9e3b0, 0.6);
scene.add(directionalLight);
directionalLight.position.set(12, 35, 50);
directionalLight.castShadow = true;


/******* helpers *******/
// let axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// let gridHelper = new THREE.GridHelper(30, 60);
// scene.add(gridHelper);

// let dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
// scene.add(dLightHelper);

// let dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);


function update(renderer, scene, camera) {

  renderer.render(scene, camera);

  for (i = 0; i < basket.length; i++) {
    basket[i].rotation.y += 0.005;
  }
  
  window.requestAnimationFrame(
    function() {
    update(renderer, scene, camera);
  }
  );
}

update();