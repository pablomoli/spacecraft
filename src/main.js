import * as THREE from "three";
import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const basePath = "/";
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000,
);
camera.position.set(0, 5 * 1.5, 30);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

const canvas = document.querySelector(".bg");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(sizes.width, sizes.height);

const loader = new THREE.TextureLoader();
const geo = new THREE.SphereGeometry(3, 64, 64);

const earth = new THREE.Group();
scene.add(earth);

const mat = new THREE.MeshStandardMaterial({
  map: loader.load(basePath + "earth.jpg"),
});
const lights = new THREE.MeshStandardMaterial({
  map: loader.load(basePath + "earth_lights.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
});

const lightsMesh = new THREE.Mesh(geo, lights);
earth.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load(basePath + "earth_clouds.jpg"),
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending,
  roughness: 10,
});
const clouds = new THREE.Mesh(geo, cloudsMat);
clouds.scale.setScalar(1.01);
earth.add(clouds);

const ball = new THREE.Mesh(geo, mat);
earth.add(ball);

const fresnelMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(0x00aaff) }, // Soft blue glow
    intensity: { value: 0.1 },
    power: { value: 3.0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mvPosition.xyz);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float intensity;
    uniform float power;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      float fresnel = pow(1.0 - dot(vNormal, vViewDir), power);
      vec3 fresnelColor = fresnel * color * intensity;
      gl_FragColor = vec4(fresnelColor, fresnel);
    }
  `,
  transparent: true,
  side: THREE.BackSide,
});

const fresnelMesh = new THREE.Mesh(geo, fresnelMaterial);
fresnelMesh.scale.setScalar(1.03);
earth.add(fresnelMesh);

const sunPos = new THREE.Vector3(100, 0, -500);
const sunGroup = new THREE.Group();
scene.add(sunGroup);

const lightColor = 0xfffae5;
const dirLight = new THREE.DirectionalLight(lightColor, 1);
const ambLight = new THREE.AmbientLight(lightColor, 0.02);
dirLight.position.copy(sunPos);
sunGroup.add(dirLight, ambLight);

const sun = new THREE.Mesh(
  geo,
  new THREE.MeshBasicMaterial({ map: loader.load(basePath + "sun.jpg") }),
);
sun.position.copy(sunPos);
sun.scale.setScalar(2.3);
sunGroup.add(sun);

const trajectory = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([dirLight.position, ball.position]),
  new THREE.LineBasicMaterial({ color: 0x00ff00 }),
);
sunGroup.add(trajectory);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.1, 24, 24);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Changed to MeshBasicMaterial
  const star = new THREE.Mesh(geometry, material);
  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100) * 8);
  star.position.set(x, y, z);
  scene.add(star);
}
Array(200).fill().forEach(addStar);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = -0.573;

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
});

function animate() {
  requestAnimationFrame(animate);

  earth.rotation.y += 0.001;
  clouds.rotation.y += 0.0005;
  clouds.rotation.z += 0.0005;

  sunGroup.rotation.y += 0.001;
  sun.rotation.y += 0.005;
  sun.rotation.z += 0.005;

  controls.update();
  renderer.render(scene, camera);
}
animate();

const tl = gsap.timeline({ defaults: { duration: 1 } });
tl.fromTo(earth.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
tl.fromTo("nav", { y: "-100%" }, { y: "0%" });
tl.fromTo(".title", { y: "300%" }, { y: "100%" });
