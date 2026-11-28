import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as L from '../city-v1.3/lib.js';
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

const radius=4.2, roadWidth=1.6, apothem=Math.sqrt(3)*radius/2;
const center=apothem+roadWidth/2;
const site=new THREE.Group();
scene.add(site);
const pathColor='#e4cc9e', deckColor='#c59465';
function group(parent,name,x=0){
  const item=new THREE.Group();
  item.name=name;
  item.position.x=x;
  parent.add(item);
  return item;
}
function patch(parent,points,y,depth,color,hole){
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
  if(hole) shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false});
  geometry.rotateX(-Math.PI/2);
  const mesh=L.add(new THREE.Mesh(geometry,L.mat(color)),parent);
  mesh.position.y=y;
  return mesh;
}
function hex(r){
  return Array.from({length:6},(_,i)=>[r*Math.cos(Math.PI/6+i*Math.PI/3),r*Math.sin(Math.PI/6+i*Math.PI/3)]);
}
function lot(name,x,grass,hole){
  const g=group(site,name,x);
  patch(g,hex(radius),-.28,.26,'#a48c6f',hole);
  patch(g,hex(radius),-.02,.07,'#d8c8a9',hole);
  patch(g,hex(radius-.22),.05,.04,grass,hole);
  return g;
}
function ribbon(parent,points,w,color,rail=false){
  const vertices=[],indices=[];
  for(let i=0;i<points.length;i++){
    const [x,y,z]=points[i], [ax,,az]=points[Math.max(i-1,0)], [bx,,bz]=points[Math.min(i+1,points.length-1)];
    const len=Math.hypot(bx-ax,bz-az),dx=(bz-az)/len*w/2,dz=(ax-bx)/len*w/2;
    vertices.push(x-dx,y,z-dz,x+dx,y,z+dz);
    if(i>0) indices.push(i*2-2,i*2,i*2-1,i*2-1,i*2,i*2+1);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  L.add(new THREE.Mesh(geometry,L.mat(color,{side:THREE.DoubleSide})),parent);
  if(rail){
    for(const side of [0,3]){
      for(let i=0;i<points.length;i++){
        const p=vertices.slice(i*6+side,i*6+side+3);
        L.cyl(.024,.030,.35,'#816747',p[0],p[1],p[2],6,parent);
        if(i>0){
          const a=vertices.slice((i-1)*6+side,(i-1)*6+side+3);
          beam(parent,[a[0],a[1]+.32,a[2]],[p[0],p[1]+.32,p[2]],.027,'#8d6b47');
        }
      }
    }
  }
}
function beam(parent,a,b,r,color){
  const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);
  const m=L.add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),6),L.mat(color)),parent);
  m.position.copy(A).lerp(B,.5);
  m.quaternion.setFromUnitVectors(THREE.Object3D.DEFAULT_UP,v.normalize());
}
function stones(g,points){
  for(const [x,y,z,s] of points){
    const m=L.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),L.mat('#9b9986',{flatShading:true})),g);
    m.position.set(x,y,z);
    m.scale.set(s,s*.59,s*.78);
  }
}
function trees(g,points){
  L.setRoot(g);
  for(const [x,z,s,color] of points) L.tree(x,z,s,color??'#7da26c');
  L.setRoot(null);
}
function label(g,text,x,y,z,width){
  L.setRoot(g);
  L.textPlate(text,width,.24,'#fff2d1','#4c604c',x,y,z);
  L.setRoot(null);
}

const viewingPocket=[[-2.25,1.02],[-1.10,1.0],[-.48,1.52],[-.42,2.19],[-1.12,2.12],[-2.25,1.67]];
const creek=lot('溪谷近觀',-center,'#acc795',viewingPocket);
patch(creek,viewingPocket,-.28,.045,'#d7bd91');
const forest=lot('林坡高架',center,'#b0c894');
const river=[[-2.68,.34],[-2.74,-.76],[-1.97,-1.52],[-.93,-1.42],[-.60,-.77],[-.89,.25],[-1.55,.92],[-2.27,.85]];
patch(creek,river,.092,.02,'#75adab');
patch(creek,[[-2.35,.31],[-2.42,-.63],[-1.89,-1.20],[-1.18,-1.15],[-.97,-.65],[-1.22,.02],[-1.65,.52]],.114,.014,'#66a3a1');
patch(creek,[[-.91,-1.18],[-.18,-1.62],[.45,-1.26],[.57,-.32],[-.03,.59],[-1.02,.58],[-1.38,.33]],.091,.068,'#d2c095');
patch(creek,[[-1.5,-1.67],[-1.28,-2.75],[-.14,-3.34],[.87,-2.69],[1.67,-1.65],[.95,-.98],[.17,-1.38]],.087,.22,'#9eae81');
stones(creek,[[-2.54,.25,.92,.42],[-1.72,.3,1.02,.51],[-2.72,.23,-.62,.40],[-.87,.35,-1.56,.62],[.32,.31,-1.37,.63],[1.48,.30,-1.55,.56],[-1.04,.30,-2.68,.43],[1.01,.22,-2.6,.34]]);
trees(creek,[[-2.71,-1.21,.72],[-1.91,-2.06,.78],[-.70,-3.09,.70],[.54,-3,.64],[1.79,-1.8,.81],[2.45,1.58,.70],[-1.68,2.21,.57],[1.71,2.34,.66]]);
ribbon(creek,[[0,.102,3.52],[0,.102,2.87],[.39,.103,2.18],[1.04,.105,1.55],[1.76,.11,.83],[2.61,.11,.32],[apothem,.11,0]],.56,pathColor);
ribbon(creek,[[.39,.111,2.18],[-.35,.11,1.93],[-.67,.04,1.70],[-1.05,-.15,1.49],[-1.40,-.215,1.32],[-2.05,-.215,1.34]],.51,'#e6d5ae');
const glass=L.mat('#93cfcc',{transparent:true,opacity:.40,depthWrite:false});
L.rbox(.92,.40,.045,glass,-1.64,-.21,1.015,.012,creek);
for(const x of [-2.09,-1.19]) L.cyl(.028,.034,.46,'#526e62',x,-.22,1.015,6,creek);
ribbon(creek,[[1.76,.114,.83],[1.48,.132,.08],[1.45,.19,-.54],[1.19,.24,-1.08]],.43,pathColor);
label(creek,'溪谷入口',0,.71,3.02,.98);

patch(forest,[[-2.39,-.82],[-1.73,-1.99],[-.71,-3.01],[.52,-3.41],[1.60,-2.46],[2.67,-1.27],[2.43,.42],[1.08,.9],[-.34,.42]],.087,.25,'#9eb787');
patch(forest,[[-1.63,-1.62],[-.76,-2.69],[.40,-3.22],[1.36,-2.41],[2.34,-1.28],[1.84,-.56],[.67,-.63],[-.37,-.92]],.332,.25,'#9fba86');
patch(forest,[[.45,-2.79],[1.08,-2.24],[1.89,-1.40],[1.65,-.90],[.91,-.97],[.59,-1.48]],.58,.18,'#8fa677');
stones(forest,[[-1.74,.40,-1.43,.51],[-.83,.48,-2.33,.76],[.63,.70,-2.69,.62],[1.88,.52,-1.54,.56],[2.38,.31,.01,.57],[.28,.19,1.04,.35]]);
trees(forest,[[-2.7,.96,.67],[-2.13,-1.84,.67],[.15,-3.47,.78],[1.65,-2.55,.69],[2.70,-1.07,.84],[2.39,.94,.75],[1.63,2.17,.62],[-1.78,2.28,.68],[.81,2.65,.63]]);
ribbon(forest,[[-apothem,.11,0],[-2.76,.11,.18],[-1.75,.112,1.06],[-.66,.113,1.8],[.62,.109,2.02],[.91,.105,2.78],[.75,.103,3.47]],.55,pathColor);
const canopy=[[-2.76,.116,.18],[-2.55,.28,-.44],[-2.29,.53,-1.06],[-1.69,.86,-1.55],[-.99,1.18,-1.50],[-.19,1.20,-1.18],[.62,1.20,-.75],[1.24,.95,-.14],[1.60,.70,.65],[1.49,.40,1.31],[.62,.114,2.02]];
ribbon(forest,canopy,.57,deckColor,true);
for(const i of [2,3,4,5,6,7,8,9]){
  const [x,y,z]=canopy[i];
  L.cyl(.058,.078,y-.086,'#7e6b4e',x,.086,z,7,forest);
}
L.rbox(1.04,.075,.83,deckColor,-.19,1.13,-1.18,.045,forest);
label(forest,'樹冠看台',-.12,1.56,-.75,1.02);

const road=group(site,'城市道路');
L.rbox(roadWidth,.22,7.26,'#a9aaa0',0,-.235,0,.035,road);
for(const z of [-2.9,-1.95,-1.0,1.0,1.95,2.9]) L.rbox(.034,.006,.40,'#ded4ad',0,-.012,z,.002,road);
for(let i=0;i<7;i++) L.rbox(.102,.007,.56,'#fff3d8',-.65+i*.217,-.01,0,.003,road);

const animals=[
  [creek,'elephant',-.69,.159,-.31,1.67,2.0],
  [creek,'rhino',-.30,.307,-2.22,1.26,1.85],
  [forest,'giraffe',.05,.337,-.22,1.89,-.60],
  [forest,'ostrich',-.69,.093,.79,1.02,-.40],
  [forest,'doe',1.44,.76,-1.54,.75,-.48],
  [forest,'stag',.91,.76,-2.34,.87,1.1],
];
const loader=new GLTFLoader();
async function addAnimal([parent,id,x,y,z,length,yaw]){
  const {scene:model}=await loader.loadAsync('./models/'+id+'.glb');
  const size=new THREE.Box3().setFromObject(model,true).getSize(new THREE.Vector3());
  const animal=group(parent,id,x);
  animal.position.set(x,y,z);
  animal.rotation.y=yaw;
  animal.add(model);
  model.scale.setScalar(length/Math.max(size.x,size.y,size.z));
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
}
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
  creek:{eye:[-center+.6,1.12,5.6],target:[-center-1.16,.42,-.12],zoom:3.0},
  canopy:{eye:[center-.6,2.55,5.1],target:[center+.12,1.12,-.92],zoom:2.75},
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
renderer.setAnimationLoop(()=>renderer.render(scene,camera));
try{
  await Promise.all(animals.map(addAnimal));
  renderer.shadowMap.needsUpdate=true;
  status.textContent='拖曳旋轉 · 雙指縮放';
  document.body.dataset.ready='true';
}catch(error){
  status.textContent='部分動物未能載入';
  console.error(error);
}
