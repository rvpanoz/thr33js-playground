import * as THREE from "three";
import Particle from "./lib/Particle";

const colors = ["#F7A541", "#F45D4C", "#FA2E59", "#4783c3", "#9c6cb7"];
const WINDOW_WIDTH = window.innerWidth;
const WINDOW_HEIGHT = window.innerHeight;
const TEXT = "hellooo :)";

const mouseVector = new THREE.Vector3(0, 0, 0);
const mousePos = new THREE.Vector3(0, 0, 0);
const cameraLookAt = new THREE.Vector3(0, 0, 0);
const cameraTarget = new THREE.Vector3(0, 0, 800);
const particles = [];
const textPixels = [];

let textCanvas, textCtx;

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
const nearPlane = 0.1;
const farPlane = 850;

const camera = new THREE.PerspectiveCamera(
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane
);

camera.position.z = 850;

function initStage() {
  window.addEventListener("resize", resize);
  container.addEventListener("mousemove", mousemove);
  container.appendChild(renderer.domElement);
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
      particle.init(textPixels[i]);
      scene.add(particle.particle);
      particles[i] = particle;
    }
  }

  for (let i = textPixels.length; i < particles.length; i++) {
    particles[i].setPosition();
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
  const pixels = textCtx.getImageData(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT).data;

  for (let i = pixels.length; i >= 0; i -= 4) {
    if (pixels[i] != 0) {
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
