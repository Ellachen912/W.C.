import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ROOT, anims, setRoot, textPlate } from './lib.js';

const url = new URL('./models/aquarium-animated.glb?v=swim1', import.meta.url);
const loader = new GLTFLoader();
const mixers = new WeakMap();
let assetBytes;

function loadBytes() {
  if (!assetBytes) {
    assetBytes = fetch(url).then(response => {
      if (!response.ok) throw new Error(`Aquarium GLB returned HTTP ${response.status}`);
      return response.arrayBuffer();
    }).catch(error => {
      assetBytes = undefined;
      throw error;
    });
  }
  return assetBytes;
}

export function drawAquarium() {
  const lot = ROOT;
  const exhibit = new THREE.Group();
  exhibit.name = 'Tidepool 海生館';
  exhibit.userData.aquarium = 'loading';
  // The GLB is already batched. Preserve animated parents and separately sorted acrylic panes.
  exhibit.userData.moving = true;
  lot.add(exhibit);
  let mixer, duration = 0;
  let cancelled = false;
  mixers.set(exhibit, () => {
    cancelled = true;
    mixer?.stopAllAction();
    mixer?.uncacheRoot(exhibit);
  });
  anims.push(time => {
    if (mixer) mixer.setTime(time % duration);
  });

  loadBytes()
    .then(bytes => {
      if (!cancelled) return loader.parseAsync(bytes, new URL('.', url).href);
    })
    .then(gltf => {
      if (!gltf) return;
      if (cancelled) {
        const materials = new Set();
        gltf.scene.traverse(object => {
          object.geometry?.dispose();
          if (object.material) [].concat(object.material).forEach(material => materials.add(material));
        });
        materials.forEach(material => material.dispose());
        return;
      }
      const [clip] = gltf.animations;
      if (!clip || !clip.tracks.length || clip.duration <= 0) throw new Error('Aquarium animation is missing');
      gltf.scene.traverse(object => {
        if (!object.isMesh) return;
        object.castShadow = false;
        object.receiveShadow = true;
      });
      exhibit.add(gltf.scene);
      mixer = new THREE.AnimationMixer(exhibit);
      duration = clip.duration;
      mixer.clipAction(clip).play();
      exhibit.userData.aquarium = 'ready';
    })
    .catch(error => {
      if (cancelled) return;
      exhibit.userData.aquarium = 'error';
      const previous = ROOT;
      setRoot(exhibit);
      try { textPlate('海生館暫時無法載入', 2.2, .48, '#fff2d8', '#453d51', 0, 1, 0); }
      finally { setRoot(previous); }
      console.error('Aquarium model failed to load', error);
    });
}

export function disposeAquariums(lot) {
  lot.traverse(object => {
    mixers.get(object)?.();
    mixers.delete(object);
  });
}
