import * as THREE from "three";

const colors = ["#F7A541", "#F45D4C", "#FA2E59", "#4783c3", "#9c6cb7"];
const WINDOW_WIDTH = window.innerWidth;
const WINDOW_HEIGHT = window.innerHeight;
const TEXT = "GfK :)";

const mouseVector = new THREE.Vector3(0, 0, 0);
const mousePos = new THREE.Vector3(0, 0, 0);
const cameraLookAt = new THREE.Vector3(0, 0, 0);
const cameraTarget = new THREE.Vector3(0, 0, 800);
const particles = [];
let textCanvas,
  textCtx,
  textPixels = [];

// Scene
const scene = new THREE.Scene();
const container = document.querySelector("#stage");

// Renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);
renderer.setClearColor(new THREE.Color(0x000000));

// Camera
const fieldOfView = 75;
const aspectRatio = WINDOW_WIDTH / WINDOW_HEIGHT;
const nearPlane = 1;
const farPlane = 850;

const camera = new THREE.PerspectiveCamera(
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane
);

camera.position.z = 1100;

function initStage() {
  window.addEventListener("resize", resize);
  // container.addEventListener("mousemove", mousemove);
  container.appendChild(renderer.domElement);
}

function randomPos(vector) {
  const radius = WINDOW_WIDTH * 3;
  const centerX = 0;
  const centerY = 0;

  // ensure that p(r) ~ r instead of p(r) ~ constant
  const r = WINDOW_WIDTH + radius * Math.random();
  const angle = Math.random() * Math.PI * 2;

  // compute desired coordinates
  vector.x = centerX + r * Math.cos(angle);
  vector.y = centerY + r * Math.sin(angle);
}

function createLights() {
  const shadowLight = new THREE.DirectionalLight(0xffffff, 2);

  shadowLight.position.set(20, 0, 10);
  shadowLight.castShadow = true;
  shadowLight.shadowDarkness = 0.01;
  scene.add(shadowLight);

  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(-20, 0, 20);
  scene.add(light);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
  backLight.position.set(0, 0, -20);
  scene.add(backLight);
}

function Particle() {
  this.vx = Math.random() * 0.05;
  this.vy = Math.random() * 0.05;
}

Particle.prototype.init = function (i) {
  const particle = new THREE.Object3D();
  const geometryCore = new THREE.BoxBufferGeometry(20, 20, 20);
  const materialCore = new THREE.MeshLambertMaterial({
    color: colors[i % colors.length],
    shading: THREE.FlatShading,
  });

  const box = new THREE.Mesh(geometryCore, materialCore);
  box.geometry.__dirtyVertices = true;
  box.geometry.dynamic = true;
  particle.targetPosition = new THREE.Vector3(
    (textPixels[i].x - WINDOW_WIDTH / 2) * 4,
    textPixels[i].y * 5,
    -10 * Math.random() + 20
  );

  particle.position.set(
    WINDOW_WIDTH * 0.5,
    WINDOW_HEIGHT * 0.5,
    -10 * Math.random() + 20
  );

  randomPos(particle.position);

  // for (let i = 0; i < box.geometry.vertices.length; i++) {
  //   box.geometry.vertices[i].x += -10 + Math.random() * 20;
  //   box.geometry.vertices[i].y += -10 + Math.random() * 20;
  //   box.geometry.vertices[i].z += -10 + Math.random() * 20;
  // }

  particle.add(box);
  this.particle = particle;
};

Particle.prototype.updateRotation = function () {
  this.particle.rotation.x += this.vx;
  this.particle.rotation.y += this.vy;
};

Particle.prototype.updatePosition = function () {
  this.particle.position.lerp(this.particle.targetPosition, 0.02);
};

function render() {
  renderer.render(scene, camera);
}

function updateParticles() {
  for (let i = 0, l = particles.length; i < l; i++) {
    particles[i].updateRotation();
    particles[i].updatePosition();
  }
}

function setParticles() {
  for (let i = 0; i < textPixels.length; i++) {
    if (particles[i]) {
      particles[i].particle.targetPosition.x =
        (textPixels[i].x - WINDOW_WIDTH / 2) * 4;
      particles[i].particle.targetPosition.y = textPixels[i].y * 5;
      particles[i].particle.targetPosition.z = -10 * Math.random() + 20;
    } else {
      const particle = new Particle();
      particle.init(i);
      scene.add(particle.particle);
      particles[i] = particle;
    }
  }

  for (let i = textPixels.length; i < particles.length; i++) {
    randomPos(particles[i].particle.targetPosition);
  }
}

function initCanvas() {
  textCanvas = document.getElementById("web-gl");
  textCanvas.width = WINDOW_WIDTH;
  textCanvas.height = WINDOW_HEIGHT;

  textCtx = textCanvas.getContext("2d");

  let fontSize = WINDOW_WIDTH / (TEXT.length * 1.3); // 3 = text.length (Gfk)
  if (fontSize > 120) fontSize = 120;

  textCtx.font = "700 " + fontSize + "px Arial";
  textCtx.clearRect(0, 0, WINDOW_WIDTH, 200);
  textCtx.textAlign = "center";
  textCtx.textBaseline = "middle";
  textCtx.fillStyle = "#555";
  textCtx.fillText(TEXT, WINDOW_WIDTH / 2, 50);
}

function updateText() {
  const pix = textCtx.getImageData(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT).data;
  textPixels = [];

  for (let i = pix.length; i >= 0; i -= 4) {
    if (pix[i] != 0) {
      const x = (i / 4) % WINDOW_WIDTH;
      const y = Math.floor(Math.floor(i / WINDOW_WIDTH) / 4);

      if (x && x % 6 == 0 && y && y % 6 == 0)
        textPixels.push({
          x: x,
          y: 200 - y + -120,
        });
    }
  }

  setParticles();
}

function animate() {
  requestAnimationFrame(animate);
  updateParticles();
  camera.position.lerp(cameraTarget, 0.2);
  camera.lookAt(cameraLookAt);
  render();
}

function resize() {
  camera.aspect = WINDOW_WIDTH / WINDOW_HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);

  updateText();
}

function mousemove(e) {
  var x = e.pageX - WINDOW_WIDTH / 2;
  var y = e.pageY - WINDOW_HEIGHT / 2;

  cameraTarget.x = x * -1;
  cameraTarget.y = y;
}

initStage();
initCanvas();
createLights();
animate();
updateText();
