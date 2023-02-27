import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene, clock, camera, renderer;
let directionalLight, ambientLight;
let axesHelper, gridHelper, dLightHelper, dLightShadowHelper;
let listener;
let screen, circle, dummyCircle, spotlightHelper;
let spotLight, bulb, video, vidTexture, vidCanvasContext;
let chairMesh, dummy;
let instances = 30;
let globalRadius = 500;
// let sound;
let sound_0, sound_1;
const now = Date.now() / 600;

init();
update();

// tip re: global variables https://stackoverflow.com/questions/53141424/gltfloader-global-variable-undefined

//////////////////////////////////////////////
//////////////// initialize //////////////////
//////////////////////////////////////////////

function init() {
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  dummyCircle = getCircle(globalRadius, 0x333333, false);
  scene.add(dummyCircle);
  dummyCircle.position.set(0, 0, 0);
  dummyCircle.rotation.x = Math.PI / 2;

  circle = getCircle(globalRadius, 0x333333, true);
  dummyCircle.add(circle);
  //   scene.add(circle);
  circle.position.x = 0;
  circle.position.y = 0;
  circle.position.z = -600;
  circle.rotation.x = Math.PI / 8;
  //   circle.rotation.x = Math.PI / 4;

  getChairs();
  getSpotlight();

  //   getSpatialAudio();

  directionalLight = getDirectionalLight(1);
  directionalLight.position.set(-100, 100, 50);
  //   scene.add(directionalLight);
  // ambientLight = getAmbientLight(1);
  // scene.add(ambientLight);

  axesHelper = getAxesHelper(100);
  //   scene.add(axesHelper);
  gridHelper = getGridHelper(1000);
  //   scene.add(gridHelper);
  dLightHelper = getDLightHelper();
  //   scene.add(dLightHelper);
  dLightShadowHelper = getDLightShadowHelper();
  //   scene.add(dLightShadowHelper);

  camera = new THREE.OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    -window.innerHeight / 2,
    -1000,
    1000
  );
  scene.add(camera);
  camera.position.set(35, 20, 35);
  camera.lookAt(scene.position);

  getGlobalAudio();

  const gui = new GUI();
  //   gui.add(video, "volume", 0, 1).name("sentimentality");
  gui.add(screen.material, "opacity", 0, 1).name("realism");
  //   if (dummy) {
  //     console.log(dummy);
  //   gui.add(dummy.rotation, "y", -Math.PI * 2, Math.PI * 2).name("upward");
  //   }
  //   if (getGlobalAudio) {
  //     //   gui.add(sound_1, "volume", 0, 1).name("ours");
  //     //   gui.add(sound, "volume", 0, 1).name("mine");
  //     console.log("true");
  //     console.log(sound_1);
  //   }

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  update(renderer, scene, camera, clock);
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0xffffff, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

//////////////////////////////////////////////
////////////////// update  ///////////////////
//////////////////////////////////////////////

function update(renderer, scene, camera, clock) {
  let radius = 100;
  let speed = 0.5;

  circle.position.x = -radius * Math.cos(now * speed);
  circle.position.y = radius * Math.sin(now * speed);
  dummyCircle.rotation.z += 0.005;

  //   circle.rotation.x = Math.(now);
  //   circle.rotation.y = Math.sin(now);
  // circle.rotation.z += now * 0.005;
  // rig from https://stackoverflow.com/questions/15030078/three-js-rotate-camera-around-object-which-may-move

  //   tablecloth.rotateY(now * 0.005);
  // tablecloth.rotation._y += now * 0.005;

  if (chairMesh) {
    // chairMesh.rotation.y = now * 0.005;
    updateChairs();
  }

  window.requestAnimationFrame(
    // intentionally recursive
    function () {
      update(renderer, scene, camera, clock);
    }
  );

  render();
}

//////////////////////////////////////////////
///////////// render + resize ////////////////
//////////////////////////////////////////////

function render() {
  //check for vid data
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    //draw video to canvas starting from upper left corner
    vidCanvasContext.drawImage(video, 0, 0);
    //tell texture object it needs to be updated
    vidTexture.needsUpdate = true;
  }

  spotlightHelper.update();

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix;
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

//////////////////////////////////////////////
////////////////// helpers ///////////////////
//////////////////////////////////////////////

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

function getSpotlightHelper(light) {
  var helper = new THREE.SpotLightHelper(light);
  return helper;
}

//////////////////////////////////////////////
////////////////// lighting //////////////////
//////////////////////////////////////////////

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
  var light = new THREE.AmbientLight("rgb(10, 30, 50)", intensity);
  // ambient light does not cast shadows
  return light;
}

//////////////////////////////////////////////
////////////////// custom ////////////////////
//////////////////////////////////////////////

function getCircle(radius, col, visibility) {
  let geo = new THREE.CircleGeometry(radius, 48);
  let mat = new THREE.MeshStandardMaterial({
    color: col,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    wireframe: true,
    visible: visibility,
  });
  let mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}

function getSpotlight() {
  video = document.createElement("video");
  video.src = "assets/video/VID00619.MP4";
  video.load();
  video.muted = true;
  video.loop = true;
  video.volume = 0.1;
  video.play();
  //   video.autoplay = true;

  var vidCanvas = document.createElement("canvas");
  vidCanvas.width = 640;
  vidCanvas.height = 480;

  vidCanvasContext = vidCanvas.getContext("2d");
  vidCanvasContext.fillStyle = "#000000";
  vidCanvasContext.fillRect(0, 0, vidCanvas.width, vidCanvas.height);
  vidTexture = new THREE.Texture(vidCanvas);

  vidTexture.minFilter = THREE.LinearFilter;
  vidTexture.magFilter = THREE.LinearFilter;
  vidTexture.encoding = THREE.sRGBEncoding;
  // https://stackoverflow.com/questions/37884013/adding-video-as-texture-in-three-js
  // https://stackoverflow.com/questions/69962432/when-do-we-need-to-use-renderer-outputencoding-three-srgbencoding

  let screengeo = new THREE.CircleGeometry(globalRadius, 48);
  let screenmat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });
  screen = new THREE.Mesh(screengeo, screenmat);
  scene.add(screen);
  screen.position.set(0, 0, 0);
  screen.rotation.x = Math.PI / 2;
  screen.receiveShadow = true;

  let bulbGeo = new THREE.SphereGeometry(3);
  let bulbMat = new THREE.MeshBasicMaterial({
    color: 0xdb45de,
    visible: false,
  });
  bulb = new THREE.Mesh(bulbGeo, bulbMat);
  circle.add(bulb);

  spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.position.set(0, 0, 0);
  spotLight.angle = Math.PI / 6;
  spotLight.penumbra = 1;
  spotLight.decay = 0;
  spotLight.distance = 2000;
  spotLight.target = screen;
  // https://stackoverflow.com/questions/11143544/spotlight-rotation-in-three-js
  spotLight.castShadow = true;
  // If set to true light will cast dynamic shadows. Warning: This is expensive and requires tweaking to get shadows looking right. See the SpotLightShadow for details. The default is false.
  // Warning: map : SpotLight is disabled if castShadow : SpotLight is false.
  spotLight.map = vidTexture;
  spotLight.shadow.mapSize.width = 1048;
  spotLight.shadow.mapSize.height = 1048;
  spotLight.shadow.camera.near = 10;
  spotLight.shadow.camera.far = 1000;
  spotLight.shadow.camera.fov = 1;
  // spotlight projection example: https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_spotlight.html
  bulb.add(spotLight);

  spotlightHelper = getSpotlightHelper(spotLight);
  //   scene.add(spotlightHelper);
}

function getChairs() {
  let gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "assets/free3d/folding_chair/folding_chair.glb",
    function (gltf) {
      var radius = 300;
      const distAngle = Math.PI * 2;
      const startAngle = 0;
      var angleBetween = distAngle / instances;

      const mesh = gltf.scene.getObjectByName("13494_Folding_Chairs_v1_L3");
      const geo = mesh.geometry.clone();
      const mat = mesh.material;
      chairMesh = new THREE.InstancedMesh(geo, mat, instances);

      scene.add(chairMesh);
      chairMesh.castShadow = true;

      dummy = new THREE.Object3D();
      for (let i = 0; i < instances; i++) {
        // for (let j = 0; j < instances; j++) {
        dummy.position.x = Math.cos(i * 100) * radius;
        // dummy.position.y = (800 / instances) * i;
        dummy.position.y = 30 + Math.random() * 40;
        dummy.position.z = Math.sin(i * 100) * radius;
        dummy.rotation.y = i * angleBetween;
        dummy.scale.x = dummy.scale.y = dummy.scale.z = 1.2;
        // }
        dummy.updateMatrix();
        chairMesh.setMatrixAt(i, dummy.matrix);
        // console.log(dummy);
      }
    },
    function (xhr) {
      //   console.log("Chair " + (xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.log("An error happened with chair");
    }
  );
  // folding chair asset from free3D
  // converted OBJ+MTL to GLTF in Blender thanks to: https://blender.stackexchange.com/questions/237164/how-to-combine-png-mtl-and-obj-files-and-then-export-them-as-a-gltf
}

function updateChairs() {
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < instances; i++) {
    chairMesh.getMatrixAt(i, matrix);
    matrix.decompose(dummy.position, dummy.rotation, dummy.scale);

    let speedQuotient = 0.05;

    dummy.position.y += Math.random() * speedQuotient;

    // if (dummy.position.y <= 0) {
    //   dummy.position.y += Math.random() * speedQuotient * now;
    // } else if (dummy.position.y >= 75) {
    //   speedQuotient *= -1;
    // }
    // dummy.rotation.y += (i / instances) * now;

    dummy.updateMatrix();
    chairMesh.setMatrixAt(i, dummy.matrix);
  }
  chairMesh.instanceMatrix.needsUpdate = true;
}

function getGlobalAudio() {
  // create listener + add to camera
  listener = new THREE.AudioListener();
  camera.add(listener);
  //   console.log(camera);

  // create global audio source
  let sound_0 = new THREE.Audio(listener);
  let sound_1 = new THREE.Audio(listener);

  // load sound and set it as object buffer
  const audioLoader = new THREE.AudioLoader();
  //   for (let i = 0; i < 1; i++) {
  //     audioLoader.load("/assets/audio/" + i + ".m4a", function (buffer) {
  //       sound.setBuffer(buffer);
  //       sound.setLoop(true);
  //       sound.setVolume(0.5);
  //       sound.play();
  //     });
  //   }

  audioLoader.load("/assets/audio/0.m4a", function (buffer) {
    sound_0.setBuffer(buffer);
    sound_0.setLoop(true);
    sound_0.setVolume(1);
    // sound_0.play();
  });

  audioLoader.load("/assets/audio/1.m4a", function (buffer) {
    sound_1.setBuffer(buffer);
    sound_1.setLoop(true);
    sound_1.setVolume(0.5);
    sound_1.play();
  });
  console.log(sound_1);
}
// choir surround sound by Bigvegie on freesound.org: https://freesound.org/people/Bigvegie/sounds/614141/
// Aidan's spatial sound example: https://github.com/AidanNelson/real-time-social-spaces/tree/main/examples
