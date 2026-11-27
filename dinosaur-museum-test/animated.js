import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as L from '../city-v1.3/lib.js';
import { drawDinosaurMuseum } from '../city-v1.3/s2_dino.js';
import { bakeLot } from '../city-v1.3/perf.js';

const stage = document.getElementById('stage');
const status = document.getElementById('status');
const toggle = document.getElementById('toggle');

try {
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('view'), antialias: true, powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dcece4');
  scene.add(new THREE.HemisphereLight('#ecfaff', '#c7bc91', 1.65));
  const sun = new THREE.DirectionalLight('#fff1d9', 2.45);
  sun.position.set(-5, 9, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {left:-7, right:7, top:7, bottom:-7, near:1, far:30});
  sun.shadow.normalBias = .018;
  scene.add(sun);

  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .03, 70);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI*.49;
  controls.minZoom = .68;
  controls.maxZoom = 3.2;

  const lot = new THREE.Group();
  scene.add(lot);
  L.setRoot(lot);
  L.hexPad('#a78663', 0, .22, -.29);
  L.hexPad('#ebd3a6', 0, .076, -.075);
  drawDinosaurMuseum();
  L.setRoot(null);
  bakeLot(lot, {anims:L.anims});
  renderer.shadowMap.needsUpdate = true;

  function resize() {
    const {clientWidth:w, clientHeight:h} = stage;
    const aspect = w / Math.max(1,h);
    const height = Math.max(8.7, 9.05 / aspect);
    Object.assign(camera, {left:-height*aspect/2, right:height*aspect/2, top:height/2, bottom:-height/2});
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }
  function reset() {
    camera.position.set(5.5, 6.9, 12);
    controls.target.set(0,.72,.18);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.update();
  }
  new ResizeObserver(resize).observe(stage);
  document.getElementById('reset').onclick = reset;
  reset();
  resize();
  let animate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const syncButton = () => {
    toggle.textContent = animate ? '暫停動畫' : '播放動畫';
    toggle.setAttribute('aria-pressed', String(animate));
  };
  toggle.onclick = () => { animate = !animate; syncButton(); };
  syncButton();

  const clock = new THREE.Clock();
  let time = 0;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(),.06);
    if (animate) {
      time += dt;
      for (const fn of L.anims) fn(time,dt);
    }
    renderer.render(scene,camera);
  });
  status.hidden = true;
  stage.dataset.state = 'ready';
} catch (error) {
  console.error(error);
  status.textContent = '這個裝置無法載入 3D 展示。';
}
