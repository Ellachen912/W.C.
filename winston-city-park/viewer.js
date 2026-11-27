import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const stage = document.getElementById('stage');
const status = document.getElementById('status');
const buttons = [...document.querySelectorAll('[data-view]')];

try {
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('view'),
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e3f6fd');
  scene.add(new THREE.HemisphereLight('#ffffff', '#d6c5a7', 1.85));
  const sun = new THREE.DirectionalLight('#fff6e5', 2.1);
  sun.position.set(-8, 12, 6);
  scene.add(sun);

  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, .05, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = true;
  controls.maxPolarAngle = Math.PI * .48;
  controls.minZoom = .55;
  controls.maxZoom = 3.6;
  let span = 19;
  const views = {
    overview: { target: [0, .15, 0], offset: [11, 22, 16], span: 19.6 },
    stadium: { target: [0, .25, -4.44], offset: [7, 13, 9], span: 10.7 },
    park: { target: [0, .15, 4.44], offset: [6, 12, 9], span: 10.6 },
  };

  function draw() {
    renderer.render(scene, camera);
  }

  function resize() {
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false);
    const aspect = w / h;
    const vertical = span * Math.max(1, .68 / aspect);
    camera.top = vertical / 2;
    camera.bottom = -vertical / 2;
    camera.left = -vertical * aspect / 2;
    camera.right = vertical * aspect / 2;
    camera.updateProjectionMatrix();
    draw();
  }

  function choose(name) {
    const view = views[name];
    span = view.span;
    camera.zoom = 1;
    controls.target.fromArray(view.target);
    camera.position.fromArray(view.offset).add(controls.target);
    controls.update();
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === name)));
    resize();
  }

  let pending = false;
  controls.addEventListener('change', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      draw();
    });
  });
  buttons.forEach(button => button.addEventListener('click', () => choose(button.dataset.view)));
  new ResizeObserver(resize).observe(stage);
  choose('overview');

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  let gltf;
  try {
    gltf = await loader.loadAsync('./park-mobile.glb');
  } catch (error) {
    console.warn('Mobile model failed; loading the standard GLB.', error);
    gltf = await loader.loadAsync('./park.glb');
  }
  scene.add(gltf.scene);
  draw();
  status.hidden = true;
  stage.dataset.state = 'ready';
  stage.dataset.triangles = String(renderer.info.render.triangles);
  stage.dataset.drawCalls = String(renderer.info.render.calls);
} catch (error) {
  console.error(error);
  status.textContent = '無法載入 3D 模型。可使用下方連結下載 GLB。';
  stage.dataset.state = 'error';
}
