import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as L from './lib.js';

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
function terrain(lot,displayBase) {
  if(displayBase) ground(lot);
  trail(lot,[[0,3.61,.36],[-.05,2.94,.36],[-.13,2.43,.48],[-.03,1.94,.48],[.18,1.39,.40],[.09,.86,.39],[.03,.32,.37],[.08,-.23,.38],[.09,-.78,.45],[.17,-1.20,.43]]);
  const previousRoot=L.ROOT;
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
  L.setRoot(previousRoot);
}

function fossilSign(lot) {
  const sign=group(lot,'Circular T. rex fossil sign');
  sign.position.set(0,2.63,1.56);
  const edge=L.add(new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.09,32),L.mat('#9a6448')),sign);
  edge.rotation.x=Math.PI/2;
  const texture=L.canvasTex((ctx,size)=>{
    ctx.scale(size/128,size/128);
    ctx.fillStyle='#563a31';
    ctx.fillRect(0,0,128,128);
    ctx.strokeStyle='#d6a26e';
    ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(64,64,60,0,Math.PI*2);ctx.stroke();
    function fossil(points){
      ctx.beginPath();
      for(const [x,y] of points) ctx.lineTo(x,y);
      ctx.closePath();ctx.fill();
    }
    ctx.fillStyle='#f4d9a6';
    // Side profile: blunt snout, deep brow, eye socket, and separate lower jaw.
    fossil([[24,44],[37,34],[59,34],[73,27],[92,29],[100,42],[96,58],[89,68],[80,73],
      [70,68],[62,65],[53,62],[35,65],[22,59],[20,51]]);
    fossil([[25,72],[42,77],[64,77],[77,72],[88,65],[92,73],[85,83],[73,89],[43,88],[28,82]]);
    for(const [x,y,h] of [[26,60,9],[35,64,8],[44,63,9],[53,62,9],[63,65,8],[73,69,6]]){
      fossil([[x,y],[x+7,y],[x+3,y+h]]);
    }
    ctx.fillStyle='#563a31';
    fossil([[70,43],[78,36],[89,39],[90,48],[83,55],[73,52]]);
    fossil([[29,46],[42,42],[47,46],[40,52],[28,52]]);
    fossil([[52,45],[61,40],[66,45],[62,53],[53,54]]);
  },256);
  const face=L.add(new THREE.Mesh(new THREE.CircleGeometry(.445,32),
    new THREE.MeshStandardMaterial({map:texture,roughness:.86})),sign);
  face.position.z=.046;
  L.rbox(.23,.33,.29,'#9a6448',0,2.33,1.44,.027,lot);
}

function pterosaur(lot) {
  const statue=group(lot,'Pteranodon sculpture');
  statue.position.set(1.53,.072,2.24);
  statue.rotation.y=-.34;
  const bronze='#9e4b3e', highlight='#d18054', membrane='#e7a469';
  L.cyl(.44,.52,.13,'#a98e70',0,0,0,12,statue);
  L.cyl(.34,.40,.30,L.wallMat('#c4a581',1,.4),0,.13,0,12,statue);
  L.cyl(.40,.36,.08,'#e1c8a2',0,.43,0,12,statue);
  branch(statue,[0,.50,0],[0,1.20,-.13],.047,bronze);
  rock(statue,0,1.26,-.08,.18,.18,.45,bronze);
  branch(statue,[0,1.27,.08],[0,1.51,.30],.116,bronze);
  rock(statue,0,1.54,.34,.137,.152,.19,highlight);
  function membraneMesh(parent,faces,color){
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(faces.flat(2),3));
    geometry.computeVertexNormals();
    L.add(new THREE.Mesh(geometry,L.mat(color,{side:THREE.DoubleSide})),parent);
  }
  const skull=[];
  const pivots=[];
  const beakTop=[0,1.58,.40],beakBottom=[0,1.46,.48],beakTip=[0,1.48,.92];
  for(const side of [-1,1]){
    const cheek=[side*.11,1.51,.46];
    skull.push([beakTop,cheek,beakTip],[cheek,beakBottom,beakTip]);
    rock(statue,side*.116,1.55,.43,.023,.028,.026,'#54302a');

    const pivot=group(statue,'Wing hinge');
    pivot.position.set(side*.12,1.34,.14);
    pivot.userData.moving=true;
    pivots.push({pivot,side});
    const root=[0,0,0], elbow=[side*.45,.17,.09];
    const wrist=[side*.80,.27,-.08], tip=[side*1.10,.36,-.60];
    const flank=[side*.01,-.12,-.50], fold=[side*.41,-.03,-.44];
    membraneMesh(pivot,[[root,elbow,fold],[elbow,wrist,fold],[wrist,tip,fold],[root,fold,flank]],membrane);
    branch(pivot,root,elbow,.042,bronze);
    branch(pivot,elbow,wrist,.032,bronze);
    branch(pivot,wrist,tip,.023,bronze);
  }
  const crest=[0,1.94,-.13];
  skull.push([[-.075,1.55,.24],crest,[0,1.70,.40]],
    [[.075,1.55,.24],[0,1.70,.40],crest]);
  membraneMesh(statue,skull,highlight);

  let elapsed=0;
  return delta=>{
    elapsed=(elapsed+delta)%5.8;
    const angle=.38*Math.sin(elapsed/5.8*Math.PI*2);
    for(const {pivot,side} of pivots) pivot.rotation.z=side*angle;
  };
}

function museum(lot,displayBase) {
  if(displayBase) ground(lot);
  const plaster='#dcb783', trim='#8c6752', glass='#557b73';
  trail(lot,[[0,3.61,.47],[0,2.95,.56],[0,1.50,.83]]);
  const previousRoot=L.ROOT;
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
  fossilSign(lot);
  L.setRoot(previousRoot);
  return pterosaur(lot);
}

async function mount(scene,name,x,z,yaw,length,signal) {
  const {scene:model,animations}=await loader.loadAsync(new URL('../dinosaur-park-test/models/'+name+'.glb?v='+(name==='trex'?8:7),import.meta.url).href);
  if(signal?.aborted){
    model.traverse(o=>{
      if(!o.isMesh) return;
      o.geometry.dispose();
      for(const material of [].concat(o.material)) material.dispose();
      o.skeleton?.dispose();
    });
    return null;
  }
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
  actor.userData.idleMixer=mixer;
  return mixer;
}

// End each forecourt at the city pavement, leaving the public road clear.
function roadApproach(lot,dx,dz,startZ){
  const distance=Math.hypot(dx,dz);
  const nx=dx/distance, nz=dz/distance;
  const edge=Math.sqrt(3)*4.2/2;
  const side=Math.sign(nx)||1;
  const approach=[0,startZ];
  const end=[nx*(edge-.21),nz*(edge-.21)];
  const points=[approach];
  if(nz<.95){
    points.push([side*2.16,2.04],[side*2.63,.66]);
    if(nz<0) points.push([side*2.48,-1.56]);
  }
  points.push(end);
  const strip=[];
  for(const sign of [-1,1]){
    for(const i of (sign===-1?points.map((_,i)=>i):points.map((_,i)=>i).reverse())){
      const [x,z]=points[i], [ax,az]=points[Math.max(0,i-1)], [bx,bz]=points[Math.min(points.length-1,i+1)];
      const len=Math.hypot(bx-ax,bz-az);
      strip.push([x+(bz-az)/len*.23*sign,z-(bx-ax)/len*.23*sign]);
    }
  }
  slab(lot,strip,.012,.079,'#ecd8aa');
}

export function buildDinosaurPair(root,dx,dz,{displayBase=false,signal}={}){
  const park=group(root,'Dinosaur park hex');
  const hall=group(root,'Dinosaur museum hex');
  hall.position.set(dx,0,dz);
  terrain(park,displayBase);
  const flap=museum(hall,displayBase);

  if(displayBase){
    trail(root,[[dx,dz+2.98,.47],[5.53,-.78,.45],[4.44,-1.36,.43],
      [3.15,dz/2,.40],[2.68,-1.03,.33],[2.20,-.26,.35],[.91,-.23,.35],[.06,-.22,.37]],.069);
  }else{
    roadApproach(park,dx,dz,2.94);
    roadApproach(hall,-dx,-dz,2.95);
  }

  const mixers=[];
  const ready=Promise.all(exhibits.map(async ({name,x,z,yaw,length})=>{
    const mixer=await mount(park,name,x,z,yaw,length,signal);
    if(mixer) mixers.push(mixer);
  }));
  return {
    ready,
    update(delta){
      mixers.forEach(mixer=>mixer.update(delta));
      flap(delta);
    },
    stop(){
      for(const mixer of mixers){
        mixer.stopAllAction();
        mixer.uncacheRoot(mixer.getRoot());
      }
      mixers.length=0;
    }
  };
}
