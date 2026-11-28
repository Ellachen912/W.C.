import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BUBBLETEA_LV } from '../city-v1.3/s2_bubbletea.js';
import { setRoot } from '../city-v1.3/lib.js';
import { backHedge } from '../city-v1.3/half-lot-hedge.js';
import { bakeLot } from '../city-v1.3/perf.js';

const canvas=document.querySelector('canvas');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#ece7e3');
scene.add(new THREE.HemisphereLight('#fffcf6','#c7adbc',2.15));
const key=new THREE.DirectionalLight('#fff2db',2.25);
key.position.set(-4,7,5);
key.castShadow=true;
Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5});
key.shadow.mapSize.set(1024,1024);
key.shadow.normalBias=.02;
scene.add(key);
const root=new THREE.Group();
scene.add(root);
setRoot(root);
try{BUBBLETEA_LV[0][2]();backHedge();}finally{setRoot(null);}
bakeLot(root);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate=false;
renderer.shadowMap.needsUpdate=true;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
const camera=new THREE.OrthographicCamera();
const orbit=new OrbitControls(camera,canvas);
orbit.minZoom=.73;
orbit.maxZoom=3.4;
orbit.maxPolarAngle=Math.PI*.49;
const views={front:[[0,2.6,9],1],angle:[[4.3,5.2,9],1],close:[[2.1,2.7,7],1.35],rear:[[3.4,3.7,-8],1.12]};
function show(view){
  const [eye,zoom]=views[view];
  camera.position.set(...eye);
  orbit.target.set(0,1.21,0);
  camera.zoom=zoom;
  camera.updateProjectionMatrix();
  orbit.update();
}
function resize(){
  const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
  const width=Math.max(8.55,5.3*w/h),height=width*h/w;
  Object.assign(camera,{left:-width/2,right:width/2,top:height/2,bottom:-height/2,near:.01,far:50});
  camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
}
new ResizeObserver(resize).observe(canvas);
for(const button of document.querySelectorAll('[data-view]')) button.onclick=()=>show(button.dataset.view);
show('angle');
resize();
renderer.setAnimationLoop(()=>renderer.render(scene,camera));
let triangles=0;
root.traverse(node=>{
  if(node.isMesh) triangles+=(node.geometry.index?.count??node.geometry.attributes.position.count)/3;
});
document.body.dataset.triangles=String(triangles);
document.body.dataset.ready='true';
