import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// all textures are from https://www.solarsystemscope.com/textures/

// for images
const basePath = "/";
const radii = {
  earth: 3,
  sun: 2,
  moon: 3 * 0.5,
  venus: 3 * 0.95, // Venus is slightly smaller than Earth
  mars: 3 * 0.53, // Mars is about half the size of Earth
};
const axis = 0;
const rotation = 1;

class Earth {
  constructor(scene, loader) {
    this.group = new THREE.Group();

    const earthRadius = radii.earth;

    const geo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "earth.jpg"),
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 1,
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

    // Initial position in case rotation is disabled
    this.initialPosition = new THREE.Vector3(40, 0, 0);
    this.group.position.copy(this.initialPosition);

    scene.add(this.group);
  }

  update(time) {
    // Planet rotation on its axis (always happens)
    this.group.rotation.y += 0.003;
    this.cloudsMesh.rotation.y += 0.0005;
    this.cloudsMesh.rotation.z += 0.0005;

    if (rotation) {
      // Only orbit around the sun if rotation is enabled
      const orbitRadius = 40;
      const orbitSpeed = 0.5;

      const x = Math.cos(time * orbitSpeed) * orbitRadius;
      const z = Math.sin(time * orbitSpeed) * orbitRadius;

      this.group.position.set(x, 0, z);
    } else {
      this.group.position.copy(this.initialPosition);
    }
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

    this.ambLight = new THREE.AmbientLight(lightColor, 0.05);
    this.pointLight = new THREE.PointLight(lightColor, 1, 100, 2);

    this.group.add(this.dirLight, this.ambLight, this.pointLight);
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
    const geometry = new THREE.SphereGeometry(0.3, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);

    // random position
    let x, y, z;
    do {
      [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(1000));
    } while (Math.sqrt(x * x + y * y + z * z) < 300);

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

    // Moon always orbits around Earth, even if Earth doesn't orbit the sun
    const moonOrbitX = Math.cos(time * this.orbitSpeed) * this.moonDistance;
    const moonOrbitZ = Math.sin(time * this.orbitSpeed) * this.moonDistance;

    // Position moon relative to Earth's current position
    this.group.position.x = this.earthGroup.position.x + moonOrbitX;
    this.group.position.y = Math.sin(time) * 2;
    this.group.position.z = this.earthGroup.position.z + moonOrbitZ;
  }
}

class Venus {
  constructor(scene, loader) {
    this.group = new THREE.Group();

    const venusRadius = radii.venus;

    const geo = new THREE.SphereGeometry(venusRadius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "venus.jpg"),
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 1,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);

    // Venus atmosphere (thick and yellowish)
    const atmosphere = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "venus_atmosphere.jpg"),
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      roughness: 10,
    });

    this.atmosphereMesh = new THREE.Mesh(geo, atmosphere);
    this.atmosphereMesh.scale.setScalar(1.03);
    this.group.add(this.atmosphereMesh);

    // Fresnel effect for the atmosphere glow
    const fresnel = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffd700) }, // Golden/yellow color
        intensity: { value: 0.15 },
        power: { value: 2.5 },
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
    this.fresnelMesh.scale.setScalar(1.05);
    this.group.add(this.fresnelMesh);

    // Initial position in case rotation is disabled
    this.initialPosition = new THREE.Vector3(28, 0, 0);
    this.group.position.copy(this.initialPosition);

    scene.add(this.group);
  }

  update(time) {
    // Venus rotates very slowly and in the opposite direction to Earth
    this.group.rotation.y -= 0.0001;
    this.atmosphereMesh.rotation.y -= 0.0008;
    this.atmosphereMesh.rotation.z -= 0.0003;

    if (rotation) {
      // Only orbit around the sun if rotation is enabled
      const orbitRadius = 28; // Closer to the sun than Earth
      const orbitSpeed = 0.7; // Faster than Earth

      const x = Math.cos(time * orbitSpeed) * orbitRadius;
      const z = Math.sin(time * orbitSpeed) * orbitRadius;

      this.group.position.set(x, 0, z);
    } else {
      // Keep at the initial position if rotation is disabled
      this.group.position.copy(this.initialPosition);
    }
  }
}

class Mars {
  constructor(scene, loader) {
    this.group = new THREE.Group();

    const marsRadius = radii.mars;

    const geo = new THREE.SphereGeometry(marsRadius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "mars.jpg"),
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 1,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);

    // Mars dust storms/thin atmosphere
    const atmosphere = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "mars_atmosphere.jpg"),
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      roughness: 10,
    });

    this.atmosphereMesh = new THREE.Mesh(geo, atmosphere);
    this.atmosphereMesh.scale.setScalar(1.02);
    this.group.add(this.atmosphereMesh);

    // Phobos and Deimos (Mars' moons)
    // Phobos - larger moon
    const phobosGeo = new THREE.SphereGeometry(marsRadius * 0.1, 16, 16);
    const phobosMat = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "moon.jpg"),
      roughness: 1,
    });

    this.phobosMesh = new THREE.Mesh(phobosGeo, phobosMat);
    this.phobosOrbit = new THREE.Group();
    this.phobosOrbit.add(this.phobosMesh);
    this.group.add(this.phobosOrbit);
    this.phobosMesh.position.set(marsRadius * 1.5, 0, 0);

    // Deimos - smaller moon
    const deimosGeo = new THREE.SphereGeometry(marsRadius * 0.05, 16, 16);
    const deimosMat = new THREE.MeshStandardMaterial({
      map: loader.load(basePath + "moon.jpg"),
      roughness: 1,
    });

    this.deimosMesh = new THREE.Mesh(deimosGeo, deimosMat);
    this.deimosOrbit = new THREE.Group();
    this.deimosOrbit.add(this.deimosMesh);
    this.group.add(this.deimosOrbit);
    this.deimosMesh.position.set(marsRadius * 2.5, 0, 0);

    // Fresnel effect for the reddish Mars atmosphere
    const fresnel = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xff4500) }, // Red-orange color
        intensity: { value: 0.08 },
        power: { value: 2.0 },
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
    this.fresnelMesh.scale.setScalar(1.04);
    this.group.add(this.fresnelMesh);

    // Initial position in case rotation is disabled
    this.initialPosition = new THREE.Vector3(55, 0, 0);
    this.group.position.copy(this.initialPosition);

    scene.add(this.group);
  }

  update(time) {
    // Mars rotation (similar speed to Earth)
    this.group.rotation.y += 0.0025;
    this.atmosphereMesh.rotation.y += 0.001;

    // Phobos orbits quickly (around Mars)
    this.phobosOrbit.rotation.y += 0.01;

    // Deimos orbits more slowly (around Mars)
    this.deimosOrbit.rotation.y += 0.005;

    if (rotation) {
      // Only orbit around the sun if rotation is enabled
      const orbitRadius = 55; // Further from the sun than Earth
      const orbitSpeed = 0.4; // Slower than Earth

      const x = Math.cos(time * orbitSpeed) * orbitRadius;
      const z = Math.sin(time * orbitSpeed) * orbitRadius;

      this.group.position.set(x, 0, z);
    } else {
      // Keep at the initial position if rotation is disabled
      this.group.position.copy(this.initialPosition);
    }
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

    this.camera.position.set(50, 20, 0);
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

    // venus
    this.venus = new Venus(this.scene, this.loader);

    // earth
    this.earth = new Earth(this.scene, this.loader);

    // moon - add after Earth
    this.moon = new Moon(this.scene, this.loader, this.earth.group);

    // mars
    this.mars = new Mars(this.scene, this.loader);

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
    this.stars = Array(1000)
      .fill()
      .map(() => new Star(this.scene));

    // axes
    if (axis) this.axes = new Axis(this.scene, 300);

    // resize
    window.addEventListener("resize", () => this.onResize());
  }

  // Update the animate method to include Venus and Mars
  animate() {
    const t = performance.now() * 0.001;
    requestAnimationFrame(() => this.animate());

    this.controls.update();

    this.venus.update(t + 100);
    this.earth.update(t);
    this.moon.update(t);
    this.mars.update(t + 500);
    this.sun.update(this.earth.group.position);

    this.renderer.render(this.scene, this.camera);
  }

  // The rest of the class remains unchanged
  onResize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.sizes.width, this.sizes.height);
  }

  start() {
    this.animate();
  }
}

export default SolarSystem;
