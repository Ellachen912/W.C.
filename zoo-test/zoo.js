import { buildZoo, zooHalfDistance as center } from './site.js?v=1';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bakeLot } from '../city-v1.3/perf.js';

const canvas=document.querySelector('canvas');
const status=document.querySelector('#status');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#e1ede5');
scene.add(new THREE.HemisphereLight('#f7fdff','#ccc197',2));
const sun=new THREE.DirectionalLight('#fff0d7',2.3);
sun.position.set(-8,13,8);
sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-12,right:12,top:9,bottom:-9,near:1,far:38});
sun.shadow.normalBias=.025;
scene.add(sun);

const site=new THREE.Group();
scene.add(site);
const zoo=buildZoo(site,center,{showRoutes:true});
const routeButton=document.querySelector('#routes');
const routeNote=document.querySelector('#route-note');
routeButton.onclick=()=>{
  zoo.routes.visible=!zoo.routes.visible;
  routeButton.setAttribute('aria-pressed',String(zoo.routes.visible));
  routeNote.hidden=!zoo.routes.visible;
};
bakeLot(site);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate=false;
const camera=new THREE.OrthographicCamera();
const orbit=new OrbitControls(camera,canvas);
orbit.minZoom=.65;
orbit.maxZoom=4.4;
orbit.maxPolarAngle=Math.PI*.49;
const views={
  all:{eye:[4.2,10,17],target:[0,.30,0],zoom:1},
  creek:{eye:[-center+.55,3.45,7.15],target:[-center-.18,.42,.30],zoom:2.55},
  forest:{eye:[center-.8,2.35,5.1],target:[2.35,.71,-.46],zoom:2.35},
};
function go(view){
  const {eye,target,zoom}=views[view];
  camera.position.set(...eye);
  camera.zoom=zoom;
  orbit.target.set(...target);
  camera.updateProjectionMatrix();
  orbit.update();
}
function resize(){
  const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
  const width=Math.max(17.8,10*w/h),height=width*h/w;
  Object.assign(camera,{left:-width/2,right:width/2,top:height/2,bottom:-height/2,near:.01,far:80});
  camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
}
for(const button of document.querySelectorAll('[data-view]')) button.onclick=()=>go(button.dataset.view);
new ResizeObserver(resize).observe(canvas);
go('all');
resize();
renderer.shadowMap.needsUpdate=true;
const motionToggle=document.querySelector('#motion');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let playing=!reducedMotion.matches;
let time=0;
function syncMotion(){
  motionToggle.textContent=playing?'暫停動作':'播放動作';
  motionToggle.setAttribute('aria-pressed',String(!playing));
}
syncMotion();
motionToggle.onclick=()=>{ playing=!playing; syncMotion(); };
reducedMotion.addEventListener('change',event=>{ playing=!event.matches; syncMotion(); });
const clock=new THREE.Clock();
renderer.setAnimationLoop(()=>{
  const dt=Math.min(.065,clock.getDelta());
  if(playing){
    time+=dt;
    zoo.update(time);
  }
  renderer.render(scene,camera);
});
try{
  await zoo.ready;
  motionToggle.disabled=false;
  renderer.shadowMap.needsUpdate=true;
  status.textContent='拖曳旋轉 · 雙指縮放';
  document.body.dataset.ready='true';
}catch(error){
  status.textContent='部分動物未能載入';
  console.error(error);
}
