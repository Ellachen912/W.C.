import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as L from '../city-v1.3/lib.js';
import { bakeLot } from '../city-v1.3/perf.js';

const stage=document.getElementById('stage');
const status=document.getElementById('status');
const toggle=document.getElementById('toggle');
const loader=new GLTFLoader();

function group(parent,name) {
  const o=new THREE.Group(); o.name=name; parent.add(o); return o;
}
function slab(parent,points,height,y,color) {
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
  const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});
  geo.rotateX(-Math.PI/2);
  const o=L.add(new THREE.Mesh(geo,L.mat(color)),parent);o.position.y=y;return o;
}
const hex=r=>Array.from({length:6},(_,i)=>[r*Math.cos(i*Math.PI/3),r*Math.sin(i*Math.PI/3)]);
function branch(g,a,b,r,color) {
  const A=new THREE.Vector3(...a), B=new THREE.Vector3(...b), d=B.clone().sub(A);
  const o=L.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.79,r,d.length(),7),L.mat(color)),g);
  o.position.copy(A).lerp(B,.5);o.quaternion.setFromUnitVectors(THREE.Object3D.DEFAULT_UP,d.normalize());
}
function rock(g,x,y,z,a,b,c,color) {
  const o=L.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),L.mat(color,{flatShading:true})),g);
  o.position.set(x,y,z);o.scale.set(a,b,c);return o;
}
function trail(lot,points) {
  const result=[];
  for (const [side,order] of [[-1,points],[1,[...points].reverse()]]) {
    for (const [x,z,w] of order) result.push([x+w*side,z]);
  }
  slab(lot,result,.014,.063,'#ecd8aa');
}
function fenced(lot,points) {
  const c='#b58157';
  for(const [x,z] of points) {
    L.cyl(.046,.053,.35,c,x,.066,z,7,lot);
    L.cyl(.053,.053,.033,'#e0a873',x,.410,z,7,lot);
  }
  for(let i=0;i<points.length-1;i++){
    const [x,z]=points[i], [X,Z]=points[i+1];
    for(const y of [.20,.33]) branch(lot,[x,y,z],[X,y,Z],.025,c);
  }
}
function terrain(lot) {
  slab(lot,hex(4.2),.25,-.255,'#aa805e');
  slab(lot,hex(4.2),.055,-.005,'#e4cea4');
  slab(lot,hex(3.9),.025,.041,'#a9ca82');
  trail(lot,[[0,3.61,.36],[-.05,2.94,.36],[-.13,2.43,.48],[-.03,1.94,.48],[.18,1.39,.40],[.09,.86,.39],[.03,.32,.37],[.08,-.23,.38],[.09,-.78,.45],[.17,-1.20,.43]]);
  L.setRoot(lot);
  const sign='#ad7952';
  for(const x of [-.68,.68]) L.cyl(.068,.093,.92,sign,x,.067,2.74,8,lot);
  L.rbox(1.64,.16,.23,sign,0,.89,2.74,.033,lot);
  L.textPlate('恐龍公園',1.29,.242,'#ffedbf','#3e574e',0,.948,2.865);
  for(const [x,z,title] of [[-1.54,.76,'暴龍'],[1.47,.75,'三角龍'],[0,-1.47,'腕龍']]){
    const base=L.cyl(.91,.98,.11,'#c3a37a',x,.063,z,16,lot);base.scale.z=.83;
    const top=L.cyl(.897,.897,.035,'#dfca9e',x,.166,z,16,lot);top.scale.z=.82;
    L.cyl(.027,.039,.27,sign,x,.065,z+.79,8,lot);
    L.textPlate(title,.52,.18,'#fff1c9','#4b5545',x,.324,z+.812);
  }
  fenced(lot,[[-2.96,.53],[-2.73,1.04],[-2.48,1.47],[-2.18,1.72]]);
  fenced(lot,[[2.18,1.74],[2.49,1.51],[2.76,1.05],[2.96,.54]]);
  fenced(lot,[[-1.33,-2.18],[-.76,-2.32],[0,-2.40],[.69,-2.33],[1.31,-2.21]]);
  for(const [x,z,scale] of [[-2.14,-1.16,1.03],[-2.52,-.34,.75],[1.91,-1.29,1.02],[2.41,-.72,.81],[-1.37,-2.43,.69],[1.39,-2.47,.83]]){
    L.tree(x,z,scale,'#78a870');
  }
  for(const [x,z] of [[-2.8,.20],[-1.55,2.22],[1.57,2.25],[2.83,.16],[-.9,-2.81],[.67,-2.73],[-1.40,-.66],[1.62,-.55]]){
    rock(lot,x,.16,z,.20,.14,.15,'#8eaf72');
    rock(lot,x+.12,.12,z-.05,.13,.085,.095,'#a5bf80');
  }
  const fossil=group(lot,'Fossil dig table');
  L.rbox(.70,.10,.59,'#b6815c',1.47,.065,-.43,.04,fossil);
  L.rbox(.62,.037,.51,'#e5c78e',1.47,.161,-.43,.015,fossil);
  branch(fossil,[1.28,.204,-.49],[1.63,.204,-.38],.026,'#fff0cb');
  for(const [x,z] of [[1.28,-.49],[1.63,-.38]]){
    for(const dz of [-.030,.030]) rock(fossil,x,.206,z+dz,.043,.028,.034,'#fff0cb');
  }
  for(const s of [-1,1]){
    const z=1.92,x=s*.82;
    L.rbox(.51,.048,.19,'#c98d55',x,.205,z,.019,lot);
    for(const dx of [-.17,.17]) L.rbox(.048,.135,.15,'#727365',x+dx,.071,z,.016,lot);
  }
  L.setRoot(null);
}

async function mount(scene,name,x,z,yaw,length) {
  const {scene:model,animations}=await loader.loadAsync(new URL('./models/'+name+'.glb',import.meta.url).href);
  const actor=group(scene,name);
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model,true);
  const size=bounds.getSize(new THREE.Vector3());
  const center=bounds.getCenter(new THREE.Vector3());
  const scale=length/Math.max(size.x,size.z);
  actor.position.set(x,.201,z);
  actor.rotation.y=yaw;
  actor.scale.setScalar(scale);
  model.position.sub(new THREE.Vector3(center.x,bounds.min.y,center.z));
  actor.add(model);
  model.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } });
  const clip=animations.find(a=>a.name.includes('Look and sway'))??animations[0];
  if(!clip)throw new Error(name+' has no animated exhibit');
  const mixer=new THREE.AnimationMixer(model);
  mixer.clipAction(clip).play();
  return mixer;
}

try {
  const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('view'),antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.1;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#dcece4');
  scene.add(new THREE.HemisphereLight('#e9faff','#cec49a',1.85));
  const sun=new THREE.DirectionalLight('#fff0d8',2.45);
  sun.position.set(-6,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:32});
  sun.shadow.normalBias=.020;scene.add(sun);
  const lot=group(scene,'single hex dinosaur park');
  terrain(lot);
  bakeLot(lot);
  const mixers=await Promise.all([
    mount(scene,'trex',-1.54,.76,.99,2.52),
    mount(scene,'triceratops',1.47,.75,-.85,2.30),
    mount(scene,'brachiosaurus',0,-1.47,.94,2.52),
  ]);
  const camera=new THREE.OrthographicCamera(-5,5,5,-5,.03,70);
  const orbit=new OrbitControls(camera,renderer.domElement);
  orbit.maxPolarAngle=Math.PI*.48;orbit.minZoom=.68;orbit.maxZoom=3.3;
  function resize(){
    const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight),a=w/h;
    const span=Math.max(8,9.0/a);
    Object.assign(camera,{left:-span*a/2,right:span*a/2,top:span/2,bottom:-span/2});
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }
  function reset(){
    orbit.target.set(0,.77,.15);
    camera.position.set(4.5,7.2,11.8);camera.zoom=1;camera.updateProjectionMatrix();orbit.update();
  }
  new ResizeObserver(resize).observe(stage);
  document.getElementById('reset').onclick=reset;
  reset();resize();
  let animate=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sync=()=>{toggle.textContent=animate?'暫停動畫':'播放動畫';toggle.setAttribute('aria-pressed',String(animate));};
  toggle.onclick=()=>{animate=!animate;sync();};
  sync();
  const clock=new THREE.Clock();
  renderer.shadowMap.needsUpdate=true;
  renderer.setAnimationLoop(()=>{
    const dt=Math.min(clock.getDelta(),.06);
    if(animate) mixers.forEach(m=>m.update(dt));
    renderer.render(scene,camera);
  });
  stage.dataset.state='ready';
  status.hidden=true;
}catch(error){
  stage.dataset.state='error';
  status.textContent='恐龍公園暫時無法載入。';
  console.error(error);
}
