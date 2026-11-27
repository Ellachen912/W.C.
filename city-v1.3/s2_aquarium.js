import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ROOT, anims, setRoot, textPlate } from './lib.js';
import { stripAquariumGround, aquariumPad, aquariumLift, aquariumSign, aquariumInnerSign, whaleSpout } from './aq_fix.js';   // 家長 11-27 14:45：拿掉模型自帶地台、改鋪我們的石板地、模型墊高

const url = new URL('./models/aquarium-animated.glb?v=slim1', import.meta.url);
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
  aquariumPad();   // 我們自己的六角石板地（畫在 ROOT＝這塊地上，會被合併；海生館模型本身另外放、不合併）
  lot.add(exhibit);
  let mixer, duration = 0, spout = null;
  let cancelled = false;
  mixers.set(exhibit, () => {
    cancelled = true;
    mixer?.stopAllAction();
    mixer?.uncacheRoot(exhibit);
  });
  anims.push(time => {
    if (mixer) mixer.setTime(time % duration);
    spout?.update(time);   // 鯨魚偶爾噴水
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
      const { minY } = stripAquariumGround(gltf.scene);
      gltf.scene.position.y = aquariumLift(minY);
      gltf.scene.add(aquariumSign(), aquariumInnerSign());   // 英文招牌換中文
      spout = whaleSpout(); gltf.scene.add(spout.group);   // 家長 11-27：鯨魚頭頂偶爾噴水柱（不高）
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
