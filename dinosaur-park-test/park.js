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
const exhibits=[
  {name:'trex',title:'暴龍',x:-1.98,z:.48,yaw:.76,length:3.12},
  {name:'triceratops',title:'三角龍',x:1.99,z:.79,yaw:-.78,length:2.92},
  {name:'brachiosaurus',title:'腕龍',x:.12,z:-2.04,yaw:1.43,length:3.05},
];
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
  for(const {x,z,title,length,yaw} of exhibits){
    const base=L.cyl(.85,.91,.11,'#c3a37a',x,.063,z,16,lot);
    const top=L.cyl(.84,.84,.035,'#dfca9e',x,.166,z,16,lot);
    for(const pad of [base,top]){
      pad.scale.z=length*.50;
      pad.rotation.y=yaw;
    }
    L.cyl(.027,.039,.27,sign,x,.065,z+.93,8,lot);
    L.textPlate(title,.52,.18,'#fff1c9','#4b5545',x,.324,z+.956);
  }
  for(const [x,z,scale] of [[-2.64,-.99,.90],[-3.31,-.20,.57],[2.75,-.80,.71],[-1.62,-2.68,.54],[1.49,-2.46,.65]]){
    L.tree(x,z,scale,'#78a870');
  }
  for(const [x,z] of [[-3.43,.34],[-1.55,2.24],[1.57,2.27],[3.30,.06],[-.90,-3.09],[.66,-3.02],[-1.24,-.61]]){
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

function pterosaur(lot) {
  const statue=group(lot,'Pteranodon sculpture');
  statue.position.set(1.53,.072,2.24);
  statue.rotation.y=-.34;
  const bronze='#416e6b', highlight='#699690', membrane='#82aba0';
  L.cyl(.44,.52,.13,'#a98e70',0,0,0,12,statue);
  L.cyl(.34,.40,.30,L.wallMat('#c4a581',1,.4),0,.13,0,12,statue);
  L.cyl(.40,.36,.08,'#e1c8a2',0,.43,0,12,statue);
  branch(statue,[0,.50,0],[0,1.20,-.13],.047,bronze);
  rock(statue,0,1.26,-.08,.18,.18,.45,bronze);
  branch(statue,[0,1.27,.08],[0,1.51,.30],.116,bronze);
  rock(statue,0,1.54,.34,.137,.152,.19,highlight);
  const triangles=[];
  function face(a,b,c){triangles.push(...a,...b,...c);}
  const beakTop=[0,1.58,.40],beakBottom=[0,1.46,.48],beakTip=[0,1.48,.92];
  for(const side of [-1,1]){
    const cheek=[side*.11,1.51,.46];
    face(beakTop,cheek,beakTip);
    face(cheek,beakBottom,beakTip);
    rock(statue,side*.116,1.55,.43,.023,.028,.026,'#293e3a');
    const shoulder=[side*.12,1.34,.14], elbow=[side*.57,1.51,.23];
    const wrist=[side*.92,1.61,.06], tip=[side*1.22,1.70,-.46];
    const flank=[side*.13,1.22,-.36], fold=[side*.53,1.31,-.30];
    face(shoulder,elbow,fold);face(elbow,wrist,fold);
    face(wrist,tip,fold);face(shoulder,fold,flank);
    branch(statue,shoulder,elbow,.042,bronze);
    branch(statue,elbow,wrist,.032,bronze);
    branch(statue,wrist,tip,.023,bronze);
  }
  const crest=[0,1.94,-.13];
  face([-.075,1.55,.24],crest,[0,1.70,.40]);
  face([.075,1.55,.24],[0,1.70,.40],crest);
  const wings=new THREE.BufferGeometry();
  wings.setAttribute('position',new THREE.Float32BufferAttribute(triangles,3));
  wings.computeVertexNormals();
  L.add(new THREE.Mesh(wings,L.mat(membrane,{side:THREE.DoubleSide})),statue);
}

function museum(lot) {
  ground(lot);
  const plaster='#dcb783', trim='#8c6752', glass='#557b73';
  trail(lot,[[0,3.61,.47],[0,2.95,.56],[0,1.50,.83]]);
  L.setRoot(lot);
  L.rbox(4.20,.19,3.20,'#b99470',0,.062,-.21,.09,lot);
  L.rbox(4.04,2.07,3.02,L.wallMat(plaster,4.04,2.07),0,.23,-.22,.12,lot);
  L.rbox(4.14,.20,3.13,L.wallMat('#b59578',4.14,.55),0,.23,-.22,.055,lot);
  L.rbox(4.17,.075,3.14,'#ebcca2',0,.43,-.22,.022,lot);
  L.rbox(4.11,.085,3.10,'#efd1a8',0,1.92,-.22,.025,lot);
  L.rbox(4.41,.22,3.27,'#5a7163',0,2.22,-.25,.08,lot);
  L.tiledHip(4.38,3.24,.79,'#678575',0,2.42,-.25,lot);
  L.rbox(1.22,.095,.125,'#536e61',0,3.16,-.25,.038,lot);
  L.rbox(1.87,.12,.64,'#ddbf98',0,.25,1.48,.042,lot);
  L.rbox(1.96,.075,.78,'#edcfaa',0,.15,1.58,.031,lot);
  L.rbox(1.95,.14,.32,'#b79069',0,1.89,1.43,.035,lot);
  L.tiledHip(2.06,.55,.26,'#678575',0,2.02,1.49,lot);
  L.rbox(1.73,1.91,.17,'#4b5f57',0,.265,1.29,.066,lot);
  for(const x of [-.36,.36]){
    L.rbox(.64,1.49,.09,'#66897e',x,.30,1.40,.043,lot);
    L.rbox(.035,.22,.05,'#edcc8c',x*.42,.95,1.462,.014,lot);
  }
  for(const side of [-1,1]){
    const x=side*1.47;
    L.rbox(.13,1.51,.16,'#ebcca2',side*.94,.36,1.33,.035,lot);
    L.rbox(.12,1.48,.12,'#eac99f',side*1.87,.50,1.30,.026,lot);
    L.rbox(.69,1.12,.09,trim,x,.63,1.306,.044,lot);
    L.rbox(.58,.99,.085,glass,x,.699,1.36,.04,lot);
    L.rbox(.585,.042,.10,'#ead3a6',x,1.235,1.41,.016,lot);
    L.rbox(.040,.99,.041,'#ead3a6',x,.70,1.415,.012,lot);
    L.rbox(.78,.089,.25,'#eccb9f',x,.63,1.37,.026,lot);
    for(const z of [-1.20,-.23,.74]){
      L.rbox(.09,1.13,.68,trim,side*2.02,.65,z,.044,lot);
      L.rbox(.085,1.00,.56,glass,side*2.06,.72,z,.04,lot);
    }
    L.tree(side*2.46,-.48,.65,'#78a870');

  }
  pterosaur(lot);
  L.textPlate('恐龍博物館',1.46,.235,'#ffedc7','#574b3f',0,2.325,1.415);
  L.setRoot(null);
}

async function mount(scene,name,x,z,yaw,length) {
  const {scene:model,animations}=await loader.loadAsync(new URL('./models/'+name+'.glb?v=5',import.meta.url).href);
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
  const mixers=await Promise.all(exhibits.map(({name,x,z,yaw,length})=>mount(scene,name,x,z,yaw,length)));
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
    camera.position.set(museumX/2+5.0,7.9,museumZ/2+15);camera.zoom=1;camera.updateProjectionMatrix();orbit.update();
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
