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
const pathColor='#e4cc9e';
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
function ribbon(parent,points,w,color){
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
const forest=lot('林坡草地',center,'#b0c894');
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
label(creek,'象群溪谷',0,.71,3.02,1.03);

patch(forest,[[-2.39,-.82],[-1.73,-1.99],[-.71,-3.01],[.52,-3.41],[1.60,-2.46],[2.67,-1.27],[2.43,.42],[1.08,.9],[-.34,.42]],.087,.25,'#9eb787');
patch(forest,[[-1.63,-1.62],[-.76,-2.69],[.40,-3.22],[1.36,-2.41],[2.34,-1.28],[1.84,-.56],[.67,-.63],[-.37,-.92]],.332,.25,'#9fba86');
patch(forest,[[.45,-2.79],[1.08,-2.24],[1.89,-1.40],[1.65,-.90],[.91,-.97],[.59,-1.48]],.58,.18,'#8fa677');
stones(forest,[[-1.74,.40,-1.43,.51],[-.83,.48,-2.33,.76],[.63,.70,-2.69,.62],[1.88,.52,-1.54,.56],[2.38,.31,.01,.57],[.28,.19,1.04,.35]]);
trees(forest,[[-2.7,.96,.67],[-2.13,-1.84,.67],[.15,-3.47,.78],[1.65,-2.55,.69],[2.70,-1.07,.84],[2.39,.94,.75],[1.63,2.17,.62],[-1.78,2.28,.68],[.81,2.65,.63]]);
ribbon(forest,[[-apothem,.11,0],[-2.76,.11,.18],[-1.75,.112,1.06],[-.66,.113,1.8],[.62,.109,2.02],[.91,.105,2.78],[.75,.103,3.47]],.55,pathColor);
ribbon(forest,[[-1.75,.117,1.06],[-1.34,.13,.48],[-1.20,.27,-.23],[-1.15,.38,-.68],[-.77,.40,-.90]],.48,pathColor);
L.rbox(.71,.07,.56,'#e5cfa7',-.79,.335,-.86,.055,forest);
label(forest,'林坡近觀',-.57,.77,.36,1.03);

const plaza=group(site,'中央迎賓廣場');
const half=roadWidth/2, edge=radius/2;
patch(plaza,[[-half,-edge],[half,-edge],[half,edge],[-half,edge]],-.28,.33,'#c1ac89');
patch(plaza,[[-half,-edge],[half,-edge],[half,edge],[-half,edge]],.05,.042,'#ebd7b3');
ribbon(plaza,[[-half,.111,0],[0,.105,0],[half,.111,0]],.55,pathColor);
ribbon(plaza,[[0,.107,edge],[0,.107,1.27],[0,.108,0]],.88,pathColor);
for(const x of [-.55,.55]){
  L.cyl(.19,.22,.12,'#ae9474',x,.093,-.98,10,plaza);
  stones(plaza,[[x,.26,-.98,.15]]);
  L.rbox(.28,.07,.60,'#b1885d',x,.22,.65,.025,plaza);
  for(const z of [.46,.84]) L.rbox(.20,.13,.08,'#8b8268',x,.091,z,.014,plaza);
}
label(plaza,'溪谷動物園',0,.88,1.82,1.24);

const perimeter=group(site,'透明外圍格柵');
const fenceGlass=L.mat('#b2d9cb',{opacity:.19,transparent:true,depthWrite:false});
const metal='#64877a';
const left=-center, right=center;
const outline=[
  [-.62,edge],[-half,edge],[left, radius],[left-apothem,edge],[left-apothem,-edge],
  [left,-radius],[-half,-edge],[half,-edge],[right,-radius],
  [right+apothem,-edge],[right+apothem,edge],[right,radius],[half,edge],[.62,edge],
];
for(let i=1;i<outline.length;i++){
  const [x,z]=outline[i-1],[X,Z]=outline[i];
  const len=Math.hypot(X-x,Z-z);
  const panels=Math.ceil(len/.89);
  for(let j=0;j<panels;j++){
    const u=j/panels,v=(j+1)/panels;
    const a=x+(X-x)*u,b=z+(Z-z)*u,c=x+(X-x)*v,e=z+(Z-z)*v;
    L.cyl(.023,.026,.59,metal,a,.05,b,6,perimeter);
    const panel=L.rbox(len/panels-.038,.45,.023,fenceGlass,(a+c)/2,.106,(b+e)/2,.008,perimeter);
    panel.rotation.y=-Math.atan2(e-b,c-a);
    beam(perimeter,[a,.607,b],[c,.607,e],.012,metal);
    beam(perimeter,[a,.116,b],[c,.116,e],.010,metal);
  }
}
L.cyl(.023,.026,.59,metal,.62,.05,edge,6,perimeter);

const animals=[
  [creek,'elephant',-.69,.159,-.31,1.67,2.0],
  [creek,'elephant',.29,.159,-.49,.96,.75],
  [forest,'giraffe',.05,.337,-.22,1.89,-.60],
  [forest,'ostrich',-.69,.093,.79,1.02,-.40],
  [forest,'doe',1.44,.76,-1.54,.75,-.48],
  [forest,'stag',.91,.76,-2.34,.87,1.1],
];
const loader=new GLTFLoader();
const models=new Map();
function loadAnimal(id){
  if(!models.has(id)) models.set(id,loader.loadAsync('./models/'+id+'.glb'));
  return models.get(id);
}
async function addAnimal([parent,id,x,y,z,length,yaw]){
  const model=(await loadAnimal(id)).scene.clone();
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
  forest:{eye:[center-.8,2.35,5.1],target:[center+.12,.65,-.83],zoom:2.75},
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
