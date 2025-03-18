import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// all textures are from https://www.solarsystemscope.com/textures/

// for images
const basePath = "/";
const radii = {
  earth: 3,
  sun: 2,
  moon: 3 * 0.5,
};
const axis = 0;

class Earth {
  constructor(scene, loader) {
    this.group = new THREE.Group();

    const earthRadius = radii.earth;

    const geo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "earth.jpg"),
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);

    // textures
    const lights = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "earth_lights.jpg"),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.lightsMesh = new THREE.Mesh(geo, lights);
    this.group.add(this.lightsMesh);

    const clouds = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "earth_clouds.jpg"),
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      roughness: 10,
    });

    this.cloudsMesh = new THREE.Mesh(geo, clouds);
    this.cloudsMesh.scale.setScalar(1.01);
    this.group.add(this.cloudsMesh);

    const fresnel = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x00aaff) },
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

    this.fresnelMesh = new THREE.Mesh(geo, fresnel);
    this.fresnelMesh.scale.setScalar(1.03);
    this.group.add(this.fresnelMesh);

    scene.add(this.group);
  }

  update(time) {
    this.group.rotation.y += 0.003;
    this.cloudsMesh.rotation.y += 0.0005;
    this.cloudsMesh.rotation.z += 0.0005;

    const orbitRadius = 50;
    const orbitSpeed = 1;

    const x = Math.cos(time * orbitSpeed) * orbitRadius;
    const z = Math.sin(time * orbitSpeed) * orbitRadius;

    this.group.position.set(x, 0, z);
  }
}

class Sun {
  constructor(scene, loader) {
    this.group = new THREE.Group();

    const sunRadius = radii.sun;
    this.pos = new THREE.Vector3(0, 0, 0);

    const geo = new THREE.SphereGeometry(sunRadius, 64, 64);
    const mat = new THREE.MeshBasicMaterial({
      map: loader.load(basePath + "sun.jpg"),
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.scale.setScalar(2.3);
    this.group.add(this.mesh);

    //Lights
    const lightColor = 0xfffae5;
    this.dirLight = new THREE.DirectionalLight(lightColor, 1);
    this.dirLight.position.set(0, 0, 0);

    this.dTarget = new THREE.Object3D();
    this.dTarget.position.set(100, 0, 0);
    scene.add(this.dTarget);

    this.dirLight.target = this.dTarget;

    this.ambLight = new THREE.AmbientLight(lightColor, 0.02);

    this.group.add(this.dirLight, this.ambLight);
    this.group.position.copy(this.pos);

    scene.add(this.group);
  }
  update(earthPos) {
    this.group.rotation.y += 0.002;
    this.group.rotation.z += 0.001;
    if (earthPos) {
      this.dTarget.position.copy(earthPos);
    }
  }
}

class Star {
  constructor(scene) {
    const geometry = new THREE.SphereGeometry(0.1, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);

    // random position
    const [x, y, z] = Array(3)
      .fill()
      .map(() => THREE.MathUtils.randFloatSpread(100) * 8);
    this.mesh.position.set(x, y, z);

    scene.add(this.mesh);
  }
}

class Axis {
  constructor(scene, size = 30) {
    this.group = new THREE.Group();

    // X axis - Red
    const xMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const xPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(size, 0, 0)];
    const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
    const xLine = new THREE.Line(xGeometry, xMaterial);
    this.group.add(xLine);

    // Y axis - Green
    const yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const yPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, size, 0)];
    const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
    const yLine = new THREE.Line(yGeometry, yMaterial);
    this.group.add(yLine);

    // Z axis - Blue
    const zMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const zPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, size)];
    const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
    const zLine = new THREE.Line(zGeometry, zMaterial);
    this.group.add(zLine);

    scene.add(this.group);
  }

  update(camera) {
    // Method left for compatibility, but not needed for simple lines
  }
}

class Moon {
  constructor(scene, loader, earthGroup) {
    this.group = new THREE.Group();
    this.earthGroup = earthGroup;
    // Reference to Earth's group to follow it

    const moonRadius = radii.moon;

    // Moon geometry and material
    const geo = new THREE.SphereGeometry(moonRadius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "moon.jpg"),
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);

    // Initial position
    this.moonDistance = 8; // Distance from Earth
    this.orbitSpeed = 2.5; // Faster than Earth's orbit around Sun

    // Add the moon group to the scene
    scene.add(this.group);
  }

  update(time) {
    // Rotate moon on its axis (slower than Earth)
    this.mesh.rotation.y += 0.001;

    // Moon orbits around Earth
    const moonOrbitX = Math.cos(time * this.orbitSpeed) * this.moonDistance;
    const moonOrbitZ = Math.sin(time * this.orbitSpeed) * this.moonDistance;

    // Position moon relative to Earth's current position
    this.group.position.x = this.earthGroup.position.x + moonOrbitX;
    this.group.position.y = Math.sin(time) * 2;
    this.group.position.z = this.earthGroup.position.z + moonOrbitZ;
  }
}

class SolarSystem {
  constructor() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      1000,
    );

    this.camera.position.set(0, 30, 100);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);

    // renderer
    const canvas = document.querySelector(".bg");
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // loader
    this.loader = new THREE.TextureLoader();

    // earth
    this.earth = new Earth(this.scene, this.loader);
    this.earth.group.position.set(20, 0, 0);

    // moon - add after Earth
    this.moon = new Moon(this.scene, this.loader, this.earth.group);

    // sun
    this.sun = new Sun(this.scene, this.loader);

    // controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    // this.controls.enablePan = false;
    // this.controls.enableZoom = false;

    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = -0.5;

    // stars
    this.stars = Array(200)
      .fill()
      .map(() => new Star(this.scene));

    // axes
    if (axis) this.axes = new Axis(this.scene, 300);

    // resize
    window.addEventListener("resize", () => this.onResize());
  }

  onResize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.sizes.width, this.sizes.height);
  }

  animate() {
    const t = performance.now() * 0.001;
    requestAnimationFrame(() => this.animate());

    this.controls.update();

    this.earth.update(t);
    this.moon.update(t);
    this.sun.update(this.earth.group.position);

    this.renderer.render(this.scene, this.camera);
  }

  start() {
    this.animate();
  }
}

export default SolarSystem;
