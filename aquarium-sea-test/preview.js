import { prepareMarineLife } from '../city-v1.3/aq_marine.js?v=1';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { stripAquariumGround, aquariumPad, aquariumLift, aquariumSign, aquariumInnerSign, whaleSpout } from '../city-v1.3/aq_fix.js';
import { setRoot } from '../city-v1.3/lib.js';

const canvas=document.querySelector('canvas');
const status=document.querySelector('#status');
const toggle=document.querySelector('#toggle');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#dcefeb');
scene.add(new THREE.HemisphereLight('#ecffff','#d2bb96',2));
const light=new THREE.DirectionalLight('#fff4de',2.05);
light.position.set(2,8,6);
scene.add(light);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.toneMapping=THREE.ACESFilmicToneMapping;
const camera=new THREE.OrthographicCamera();
const controls=new OrbitControls(camera,canvas);
controls.minZoom=.7;
controls.maxZoom=5;
controls.maxPolarAngle=Math.PI*.49;
function reset(){
  camera.position.set(3.35,4.35,10);
  camera.zoom=1;
  controls.target.set(-.18,2.35,-1);
  camera.updateProjectionMatrix();
  controls.update();
}
function resize(){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  const span=Math.max(6.05,5.15*h/w);
  Object.assign(camera,{left:-span*w/h/2,right:span*w/h/2,top:span/2,bottom:-span/2,near:.01,far:60});
  camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
}
document.querySelector('#reset').onclick=reset;
new ResizeObserver(resize).observe(canvas);
reset();
resize();

async function start(){
  const loader=new GLTFLoader();
  const gltf=await loader.loadAsync('../city-v1.3/models/aquarium-animated.glb?v=slim1');
  const aquarium=gltf.scene;
  const marine=await prepareMarineLife(aquarium,gltf.animations[0]);
  marine.mount();
  aquarium.traverse(node=>{
    if(!node.isMesh) return;
    for(const mat of [].concat(node.material)){
      if(mat.transmission>0){
        mat.transmission=0;
        mat.transparent=true;
        mat.opacity=Math.min(mat.opacity,.5);
        mat.depthWrite=false;
        mat.needsUpdate=true;
      }
    }
  });
  const mixer=new THREE.AnimationMixer(aquarium);
  mixer.clipAction(marine.clip).play();
  const {minY}=stripAquariumGround(aquarium);
  aquarium.position.y=aquariumLift(minY);
  aquarium.add(aquariumSign(),aquariumInnerSign());
  const splash=whaleSpout();
  aquarium.add(splash.group);
  scene.add(aquarium);
  setRoot(scene);
  try{ aquariumPad(); }finally{ setRoot(null); }

  function update(t){
    mixer.setTime(t%marine.clip.duration);
    splash.update(t);
    marine.update(t);
  }
  let playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  let time=0;
  const clock=new THREE.Clock();
  function sync(){toggle.textContent=playing?'暫停動畫':'播放動畫';}
  toggle.disabled=false;
  toggle.onclick=()=>{playing=!playing;sync();};
  sync();
  update(0);
  renderer.setAnimationLoop(()=>{
    const dt=Math.min(.08,clock.getDelta());
    if(playing){time+=dt;update(time);}
    renderer.render(scene,camera);
  });
  status.textContent='拖曳旋轉 · 雙指縮放';
  document.body.dataset.ready='true';
}
start().catch(error=>{status.textContent='模型載入失敗';console.error(error);});
