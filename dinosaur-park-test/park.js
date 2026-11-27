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

function sculptedJaw(lot,rings,color){
  const section=[[1,0],[.67,1],[-.67,1],[-1,0],[-.76,-1],[.76,-1]];
  const points=[],indices=[];
  for(const [z,width,y,rise,drop] of rings){
    for(const [x,v] of section) points.push(width*x,y+(v<0?drop:rise)*v,z);
  }
  for(let row=0;row<rings.length-1;row++){
    for(let j=0;j<6;j++){
      const a=row*6+j,b=row*6+(j+1)%6;
      indices.push(a,b,b+6,a,b+6,a+6);
    }
  }
  const end=(rings.length-1)*6;
  for(let j=1;j<5;j++) indices.push(0,j+1,j,end,end+j,end+j+1);
  const mesh=new THREE.BufferGeometry();
  mesh.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  mesh.setIndex(indices);
  const faces=mesh.toNonIndexed();
  mesh.dispose();
  faces.computeVertexNormals();
  L.add(new THREE.Mesh(faces,L.mat(color)),lot);
}

function rexEntrance(lot){
  const hide='#638874', jaw='#af8d69', gums='#583934', teeth='#fff1d5';
  // The rear cheeks meet the façade, leaving the gap between jaws as the doorway.
  sculptedJaw(lot,[
    [1.34,1.29,2.53,.88,.53],[1.82,1.36,2.81,.67,.45],
    [2.13,1.15,2.88,.51,.42],[2.53,.94,2.89,.33,.32],
    [2.98,.85,2.80,.29,.23],[3.18,.70,2.77,.22,.18],
    [3.25,.48,2.76,.13,.14],
  ],hide);
  sculptedJaw(lot,[
    [1.40,1.21,.33,.23,.15],[1.90,1.25,.29,.16,.14],
    [2.50,1.08,.23,.11,.10],[2.97,.91,.19,.10,.08],
    [3.19,.72,.17,.09,.07],[3.27,.46,.17,.06,.06],
  ],jaw);
  L.rbox(1.25,.08,1.10,'#ba786b',0,.246,2.47,.035,lot);
  for(const side of [-1,1]){
    const x=side;
    rock(lot,x*1.09,1.36,1.57,.34,1.16,.42,hide);
    rock(lot,x*1.08,2.56,1.96,.28,.26,.38,'#769782');
    const eye=rock(lot,x*1.16,2.97,2.15,.16,.18,.24,'#efbd61');
    eye.rotation.y=x*.64;
    rock(lot,x*1.24,2.97,2.29,.065,.11,.058,'#252f2a');
    const brow=rock(lot,x*1.15,3.15,2.12,.27,.13,.35,'#496c5c');
    brow.rotation.z=-x*.28;
    rock(lot,x*.53,2.81,3.205,.13,.075,.056,'#304f43');
    for(const [z,w,y,len] of [[1.96,1.04,2.36,.20],[2.18,.91,2.45,.29],[2.43,.80,2.49,.31],[2.68,.71,2.54,.28],[2.93,.65,2.54,.23],[3.13,.55,2.56,.18]]){
      rock(lot,x*w,y+.045,z,.17,.084,.15,gums);
      L.cyl(.08,.011,len,teeth,x*w,y-len,z,5,lot);
    }
    for(const [z,w,y,len] of [[1.99,1.02,.35,.22],[2.24,.94,.31,.24],[2.50,.85,.30,.23],[2.74,.77,.28,.20],[2.97,.68,.26,.16],[3.15,.55,.24,.13]]){
      L.cyl(.011,.073,len,teeth,x*w,y,z,5,lot);
    }
  }
  for(const x of [-.33,-.11,.11,.33]){
    L.cyl(.069,.010,.15,teeth,x,2.43,3.17,5,lot);
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
  L.rbox(1.73,1.91,.17,'#503934',0,.265,1.29,.066,lot);
  for(const x of [-.36,.36]){
    L.rbox(.64,1.49,.09,'#613e36',x,.30,1.40,.043,lot);
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
  rexEntrance(lot);
  L.rbox(.92,.39,.09,'#8c6752',1.60,.29,1.44,.035,lot);
  L.textPlate('恐龍博物館',.82,.25,'#ffedc7','#574b3f',1.60,.493,1.498);
  L.setRoot(null);
}

async function mount(scene,name,x,z,yaw,length) {
  const {scene:model,animations}=await loader.loadAsync(new URL('./models/'+name+'.glb?v=4',import.meta.url).href);
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
