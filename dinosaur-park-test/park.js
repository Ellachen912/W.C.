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
function trail(lot,points,y=.063) {
  const result=[];
  for (const [side,order] of [[-1,points],[1,[...points].reverse()]]) {
    for (const [x,z,w] of order) result.push([x+w*side,z]);
  }
  slab(lot,result,.014,y,'#ecd8aa');
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
function ground(lot) {
  slab(lot,hex(4.2),.25,-.255,'#aa805e');
  slab(lot,hex(4.2),.055,-.005,'#e4cea4');
  slab(lot,hex(3.9),.025,.041,'#a9ca82');
}
function terrain(lot) {
  ground(lot);
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

// Rings taper the fossil from the broad brow to the narrow snout.
function skull(lot) {
  const bone='#f1d4a4', jaw='#c4986e', socket='#58483b';
  const rings=[
    [1.45,.82,3.05,.48],
    [1.95,1.09,3.11,.54],
    [2.29,.84,2.91,.37],
    [2.79,.69,2.69,.29],
    [3.04,.56,2.63,.22],
  ];
  const points=[],indices=[];
  for(const [z,w,y,h] of rings){
    for(const [u,v] of [[1,0],[.72,.8],[-.72,.8],[-1,0],[-.78,-1],[.78,-1]]){
      points.push(w*u,y+h*v,z);
    }
  }
  for(let row=0;row<rings.length-1;row++){
    for(let j=0;j<6;j++){
      const a=row*6+j,b=row*6+(j+1)%6;
      indices.push(a,b,b+6,a,b+6,a+6);
    }
  }
  for(let j=1;j<5;j++){
    const end=(rings.length-1)*6;
    indices.push(0,j+1,j,end,end+j,end+j+1);
  }
  const mesh=new THREE.BufferGeometry();
  mesh.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  mesh.setIndex(indices);
  const faces=mesh.toNonIndexed();
  faces.computeVertexNormals();
  L.add(new THREE.Mesh(faces,L.mat(bone)),lot);
  for(const side of [-1,1]){
    const x=side*.98;
    branch(lot,[x,.16,2.34],[side*1.04,2.44,1.99],.145,jaw);
    rock(lot,x,.13,2.34,.28,.105,.23,jaw);
    rock(lot,side*.96,2.72,2.08,.23,.38,.26,bone);
    const eye=rock(lot,side*.91,3.17,2.17,.20,.21,.19,socket);
    eye.rotation.y=side*.36;
    const brow=rock(lot,side*.92,3.34,2.11,.23,.105,.24,bone);
    brow.rotation.z=-side*.27;
    rock(lot,side*.30,2.70,3.051,.111,.072,.041,socket);
    for(let i=0;i<5;i++){
      const z=2.01+i*.205;
      const tooth=1-.13*i;
      L.cyl(.106*tooth,.021,.23*tooth,'#fff3d9',side*(.83-i*.075),2.35-i*.028,z,5,lot);
    }
  }
  for(const x of [-.36,-.13,.13,.36]){
    L.cyl(.092,.022,.176,'#fff3d9',x,2.28,2.98,5,lot);
  }
}

function museum(lot) {
  ground(lot);
  const plaster='#dcb783', trim='#8c6752', glass='#557b73';
  trail(lot,[[0,3.61,.47],[0,2.95,.56],[0,1.50,.83]]);
  L.setRoot(lot);
  L.rbox(4.20,.19,3.20,'#b99470',0,.062,-.21,.09,lot);
  L.rbox(4.04,2.07,3.02,plaster,0,.23,-.22,.16,lot);
  L.rbox(4.41,.22,3.27,'#5a7163',0,2.22,-.25,.08,lot);
  L.rbox(3.77,.24,2.69,'#7b8d72',0,2.42,-.43,.11,lot);
  L.rbox(1.60,1.91,.17,'#365955',0,.265,1.29,.066,lot);
  for(const x of [-.36,.36]){
    L.rbox(.64,1.49,.09,glass,x,.30,1.40,.043,lot);
    L.rbox(.035,.22,.05,'#edcc8c',x*.42,.95,1.462,.014,lot);
  }
  for(const side of [-1,1]){
    const x=side*1.47;
    L.rbox(.69,1.12,.09,trim,x,.63,1.306,.044,lot);
    L.rbox(.58,.99,.085,glass,x,.699,1.36,.04,lot);
    L.rbox(.585,.042,.10,'#ead3a6',x,1.235,1.41,.016,lot);
    for(const z of [-1.20,-.23,.74]){
      L.rbox(.09,1.13,.68,trim,side*2.02,.65,z,.044,lot);
      L.rbox(.085,1.00,.56,glass,side*2.06,.72,z,.04,lot);
    }
    L.tree(side*2.46,-.48,.65,'#78a870');
    rock(lot,side*1.64,.18,2.33,.25,.14,.19,'#98b67c');
  }
  skull(lot);
  L.textPlate('恐龍博物館',1.23,.22,'#ffedc7','#574b3f',0,2.03,1.497);
  L.setRoot(null);
}

async function mount(scene,name,x,z,yaw,length) {
  const {scene:model,animations}=await loader.loadAsync(new URL('./models/'+name+'.glb?v=2',import.meta.url).href);
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
  const clip=animations[0];
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
  Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:1,far:32});
  sun.shadow.normalBias=.020;scene.add(sun);
  const spacing=4.2;
  const museumX=spacing*1.5;
  const museumZ=-spacing*Math.sqrt(3)/2;
  const lot=group(scene,'Dinosaur park hex');
  const museumLot=group(scene,'Dinosaur museum hex');
  museumLot.position.set(museumX,0,museumZ);
  terrain(lot);
  museum(museumLot);
  const connector=group(scene,'Shared pedestrian path');
  trail(connector,[[museumX,museumZ+2.98,.47],[5.53,-.78,.45],[4.44,-1.36,.43],[3.15,museumZ/2,.40],[2.68,-1.03,.33],[2.20,-.26,.35],[.91,-.23,.35],[.06,-.22,.37]],.069);
  bakeLot(lot);
  bakeLot(museumLot);
  bakeLot(connector);
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
    const span=Math.max(10,15.4/a);
    Object.assign(camera,{left:-span*a/2,right:span*a/2,top:span/2,bottom:-span/2});
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }
  function reset(){
    orbit.target.set(museumX/2,.83,museumZ/2);
    camera.position.set(museumX/2+3.2,8.4,museumZ/2+15);camera.zoom=1;camera.updateProjectionMatrix();orbit.update();
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
  status.textContent='恐龍園區暫時無法載入。';
  console.error(error);
}
