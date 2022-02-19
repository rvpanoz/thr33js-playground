import * as THREE from "three";

const WINDOW_WIDTH = window.innerWidth;
const WINDOW_HEIGHT = window.innerHeight;
const colors = ["#F7A541", "#F45D4C", "#FA2E59", "#4783c3", "#9c6cb7"];

class Particle {
  particle = null;
  geometryCore = null;
  materialCore = null;
  box = null;

  constructor() {
    this.vx = Math.random() * 0.05;
    this.vy = Math.random() * 0.05;

    this.particle = new THREE.Object3D();
    this.geometryCore = new THREE.BoxBufferGeometry(20, 20, 20);
    this.materialCore = new THREE.MeshLambertMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      shading: THREE.FlatShading,
    });
    this.box = new THREE.Mesh(this.geometryCore, this.materialCore);
  }

  setPosition() {
    const radius = WINDOW_WIDTH * 3;
    const centerX = 0;
    const centerY = 0;

    // ensure that p(r) ~ r instead of p(r) ~ constant
    const r = WINDOW_WIDTH + radius * Math.random();
    const angle = Math.random() * Math.PI * 2;

    // compute desired coordinates
    this.particle.position.x = centerX + r * Math.cos(angle);
    this.particle.position.y = centerY + r * Math.sin(angle);
  }

  updateRotation() {
    this.particle.rotation.x += this.vx;
    this.particle.rotation.y += this.vy;
  }

  updatePosition() {
    this.particle.position.lerp(this.particle.targetPosition, 0.02);
  }

  init(pixel) {
    this.box.geometry.__dirtyVertices = true;
    this.box.geometry.dynamic = true;

    this.particle.targetPosition = new THREE.Vector3(
      (pixel.x - WINDOW_WIDTH / 2) * 4,
      pixel.y * 5,
      -10 * Math.random() + 20
    );

    this.particle.position.set(
      WINDOW_WIDTH * 0.5,
      WINDOW_HEIGHT * 0.5,
      -10 * Math.random() + 20
    );

    this.setPosition(this.position);
    this.particle.add(this.box);
  }
}

export default Particle;
