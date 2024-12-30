import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

// Core Setup
const gui = new GUI();
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const clock = new THREE.Clock();

// Sizes and Responsive Setup
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(1, 1, 2);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Texture Loading
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("/textures/matcaps/3.png");
matcapTexture.colorSpace = THREE.SRGBColorSpace;

const matcapTextures = Array.from({ length: 8 }, (_, i) => textureLoader.load(`/textures/matcaps/${i + 1}.png`));

// Background Setup
const bgTexture = textureLoader.load("/bkgd.png");
bgTexture.minFilter = THREE.LinearFilter;
bgTexture.generateMipmaps = false;
scene.background = bgTexture;

// Lighting Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(25, 30, 40);
scene.add(ambientLight, pointLight);

// Text Creation
const createText = (font) => {
  const textGeometry = new TextGeometry("GARRETT", {
    font,
    size: 1,
    depth: 0.3,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelOffset: 0,
    bevelSegments: 10,
  });
  textGeometry.center();

  // Main text
  const mainMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
  const mainText = new THREE.Mesh(textGeometry, mainMaterial);
  scene.add(mainText);

  // Additional text copies
  for (let i = 0; i < 200; i++) {
    const randomMatcap = matcapTextures[Math.floor(Math.random() * matcapTextures.length)];
    const material = new THREE.MeshMatcapMaterial({ matcap: randomMatcap });
    const text = new THREE.Mesh(textGeometry, material);

    text.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10);
    text.rotation.set(Math.random() * 50, Math.random(), (Math.random() * Math.PI) / 2);
    const scale = Math.random();
    text.scale.set(scale, scale, scale);

    scene.add(text);
  }
};

// Load Font
const fontLoader = new FontLoader();
fontLoader.load("/fonts/Sagewold_Italic.json", createText);

// Animation Loop
const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  controls.update();

  scene.children.forEach((child) => {
    if (child instanceof THREE.Mesh) {
      child.scale.z = Math.sin(elapsedTime) * 0.05 + 1;
      child.translateX(Math.cos(elapsedTime) * 0.0001);
      child.rotation.y = elapsedTime * 0.05;
    }
  });

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

animate();
