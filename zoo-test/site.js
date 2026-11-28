import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as L from '../city-v1.3/lib.js';
import { prepareZooAnimal, zooMotion, wideWalk } from './motion.js?v=5';

export const zooHalfDistance=(Math.sqrt(3)*4.2+1.6)/2;
const radius=4.2, apothem=Math.sqrt(3)*radius/2;
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
function umbrellaTree(g,x,z,height,spread,turn){
  const tree=group(g,'傘冠樹',x);
  tree.position.set(x,.09,z);
  tree.rotation.y=turn;
  const bark='#906444';
  const fork=[.10,height*.65,-.055];
  beam(tree,[0,0,0],fork,.066,bark);
  const branches=[
    [-.52,.03,.05,'#688344'],
    [-.15,-.29,.14,'#77934d'],
    [.43,-.08,.06,'#78924d'],
    [.39,.30,.02,'#668347'],
    [-.23,.28,.10,'#80994f'],
  ];
  for(const [dx,dz,lift,color] of branches){
    const top=[dx*spread,height+lift,dz*spread];
    beam(tree,fork,top,.034,bark);
    const crown=L.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),
      L.mat(color,{flatShading:true})),tree);
    crown.position.set(...top);
    crown.scale.set(.56*spread,.20*spread,.43*spread);
  }
}

export function buildZoo(site,center=zooHalfDistance,{showRoutes=false,signal}={}){
  const half=center-apothem, edge=radius/2;
  const left=-center, right=center;
  const boundary=[
    [-half,edge],[left,radius],[left-apothem,edge],[left-apothem,-edge],
    [left,-radius],[-half,-edge],[half,-edge],[right,-radius],
    [right+apothem,-edge],[right+apothem,edge],[right,radius],[half,edge],
  ];
  patch(site,boundary,-.28,.28,'#a48c6f');
  patch(site,boundary,0,.09,'#aec897');
  const creek=group(site,'象群溪谷',left);
  const forest=group(site,'林坡草地',right);
  const savanna=group(site,'中央長頸鹿草地');
  const river=[[-2.68,.34],[-2.74,-.76],[-1.97,-1.52],[-.93,-1.42],[-.60,-.77],[-.89,.25],[-1.55,.92],[-2.27,.85]];
  patch(creek,river,.092,.02,'#75adab');
  patch(creek,[[-2.35,.31],[-2.42,-.63],[-1.89,-1.20],[-1.18,-1.15],[-.97,-.65],[-1.22,.02],[-1.65,.52]],.114,.014,'#66a3a1');
  patch(creek,[[-.99,-1.22],[-.57,-1.64],[.36,-1.60],[.72,-1.19],[.93,-.34],[1.01,.93],[.90,1.90],[.30,2.58],[-.57,2.64],[-1.46,2.06],[-1.56,1.37],[-1.32,.65],[-1.38,.33]],.091,.068,'#d2c095');
  patch(creek,[[-1.5,-1.67],[-1.28,-2.75],[-.14,-3.34],[.87,-2.69],[1.67,-1.65],[.95,-.98],[.17,-1.38]],.087,.22,'#9eae81');
  stones(creek,[[-2.72,.23,-.62,.40],[-1.55,.33,-1.79,.46],[-1.04,.30,-2.68,.43],[1.01,.22,-2.6,.34]]);
  trees(creek,[[-2.71,-1.21,.72],[-1.91,-2.06,.78],[-.70,-3.09,.70],[.54,-3,.64],[1.79,-1.8,.81],[2.45,1.58,.70],[2.52,1.92,.66]]);
  patch(forest,[[-2.39,-.82],[-1.73,-1.99],[-.71,-3.01],[.52,-3.41],[1.60,-2.46],[2.67,-1.27],[2.43,.42],[1.08,.9],[-.34,.42]],.087,.25,'#9eb787');
  patch(forest,[[-1.63,-1.62],[-.76,-2.69],[.40,-3.22],[1.36,-2.41],[2.34,-1.28],[1.84,-.56],[.67,-.63],[-.37,-.92]],.332,.25,'#9fba86');
  patch(forest,[[.45,-2.79],[1.08,-2.24],[1.89,-1.40],[1.65,-.90],[.91,-.97],[.59,-1.48]],.58,.18,'#8fa677');
  // The grass ramp bridges the terrace lips at the heights used by the deer.
  const deerRamp=[[-1.76,.763],[-.90,.763],[-.52,.584],[-.04,.337],[.65,.337]];
  function deerGround(z){
    for(let i=1;i<deerRamp.length;i++){
      const [a,low]=deerRamp[i-1], [b,high]=deerRamp[i];
      if(z<=b) return THREE.MathUtils.lerp(low,high,THREE.MathUtils.clamp((z-a)/(b-a),0,1));
    }
    return deerRamp.at(-1)[1];
  }
  ribbon(forest,deerRamp.map(([z,y])=>[1.26,y,z]),1.72,'#9bb785');
  for(const x of [.40,2.12]){
    const wall=new THREE.Shape(deerRamp.map(([z,y])=>new THREE.Vector2(z,y)));
    wall.lineTo(.65,.088);
    wall.lineTo(-1.76,.088);
    wall.closePath();
    const mesh=L.add(new THREE.Mesh(new THREE.ShapeGeometry(wall),
      L.mat('#8fa879',{side:THREE.DoubleSide})),forest);
    mesh.rotation.y=-Math.PI/2;
    mesh.position.x=x;
  }
  stones(forest,[[-1.74,.40,-1.43,.51],[-.83,.48,-2.33,.76],[.63,.70,-2.69,.62],[1.88,.52,-1.54,.56]]);
  trees(forest,[[-2.13,-1.84,.67],[.15,-3.47,.78],[1.65,-2.55,.69]]);
  umbrellaTree(savanna,-1.38,-1.48,1.91,.91,.35);
  umbrellaTree(savanna,.25,-1.50,2.23,.97,-.48);
  umbrellaTree(savanna,2.05,-1.44,1.99,1.02,.82);

  const gate=group(site,'疊石入口');
  ribbon(gate,[[0,.105,edge],[0,.105,1.50],[-.18,.107,1.10]],.67,pathColor);
  for(const side of [-1,1]){
    const x=side*.60;
    L.rbox(.46,.17,.50,'#998e7b',x,.09,1.97,.06,gate);
    L.rbox(.36,.24,.42,'#b0a592',x+side*.025,.23,1.97,.07,gate).rotation.y=side*.12;
    L.rbox(.32,.24,.37,'#a99b85',x,.45,1.97,.065,gate).rotation.y=-side*.11;
    L.rbox(.41,.19,.42,'#c5b79d',x,.67,1.97,.065,gate);
  }
  L.rbox(1.63,.27,.38,'#aa9c86',0,.83,1.97,.10,gate);
  L.rbox(1.17,.06,.25,'#c4b69a',-.08,1.095,1.95,.026,gate);
  const lettering=L.canvasTex((ctx,size)=>{
    ctx.fillStyle='#4f4840';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font='bold 42px system-ui, sans-serif';
    ctx.fillText('溪谷動物園',size/2,size/2);
  },256);
  const title=L.add(new THREE.Mesh(new THREE.PlaneGeometry(1.38,1.38),
    new THREE.MeshBasicMaterial({map:lettering,transparent:true,depthWrite:false})),gate);
  title.position.set(0,.964,2.163);
  title.castShadow=false;
  title.receiveShadow=false;

  const perimeter=group(site,'透明外圍格柵');
  const fenceGlass=L.mat('#b2d9cb',{opacity:.19,transparent:true,depthWrite:false});
  const metal='#64877a';
  const outline=[[-.62,edge],...boundary,[.62,edge]];
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
    [creek,'elephant',-1.02,.159,1.60,1.67,2.0],
    [creek,'elephant',1.31,.093,.21,.96,1.16],
    [savanna,'giraffe',1.05,.093,.13,1.89,-.60],
    [savanna,'giraffe',2.91,.093,.97,1.31,.28],
    [forest,'ostrich',.32,.093,2.29,1.02,-.40],
    [forest,'ostrich',1.63,.093,1.67,.98,.80],
    [forest,'doe',1.88,.763,-1.43,.75,-.48],
    [forest,'stag',.62,.763,-1.43,.87,1.1],
    [forest,'ostrich',-1.65,.093,2.26,1.00,-.72],
  ];

  // Routes are proposals in local habitat coordinates. Each starts at the displayed animal.
  const plans=[
    {animal:0,color:'#2d756a',stops:[[-.38,.53],[-.75,-.97]],arc:[.48,-1]},
    {animal:1,color:'#2d756a',stops:[[1.92,.43],[2.65,.17]],arc:[.39,1]},
    {animal:2,color:'#a2662b',stops:[[.73,-.23],[.52,-.68]],arc:[.50,-1]},
    {animal:3,color:'#a2662b',stops:[[2.98,.61],[2.99,.24]],arc:[.39,1]},
    {animal:4,color:'#8d5379',stops:[[.04,2.64],[-.25,2.82]]},
    {animal:5,color:'#8d5379',stops:[[1.96,1.46],[2.45,1.44]]},
    {animal:6,color:'#75653e',stops:[[1.91,-.63],[1.90,.30]],ground:deerGround,arc:[.19,-1],turnSlot:0},
    {animal:7,color:'#75653e',stops:[[.63,-.63],[.62,.29]],ground:deerGround,arc:[.19,1],turnSlot:1},
    {animal:8,color:'#8d5379',stops:[[-1.53,2.49],[-1.37,2.85]]},
  ];
  const routes=new THREE.Group();
  routes.name='動物短程路線';
  if(showRoutes) site.add(routes);
  if(showRoutes) for(const {animal,color,stops,ground,arc} of plans){
    const [habitat,,x,y,z]=animals[animal];
    const route=group(routes,'預定走路方向',habitat.position.x);
    const points=[[x,z],...stops];
    if(arc){
      const segments=wideWalk(points,...arc);
      for(const segment of segments){
        const line=Array.from({length:13},(_,i)=>{
          const p=segment.at(i/12);
          return [p.x,(ground?.(p.y)??y)+.035,p.y];
        });
        ribbon(route,line,.065,color);
      }
      continue;
    }
    ribbon(route,points.map(([px,pz])=>[px,(ground?.(pz)??y)+.035,pz]),.065,color);
    const [ax,az]=points.at(-2),[bx,bz]=points.at(-1);
    const len=Math.hypot(bx-ax,bz-az);
    const dx=(bx-ax)/len,dz=(bz-az)/len;
    const endY=ground?.(bz)??y;
    patch(route,[[bx+dx*.12,bz+dz*.12],[bx-dx*.09-dz*.10,bz-dz*.09+dx*.10],
      [bx-dx*.09+dz*.10,bz-dz*.09-dx*.10]],endY+.034,.006,color);
    L.cyl(.052,.052,.014,color,bx,endY+.035,bz,9,route);
  }
  routes.visible=false;
  const loader=new GLTFLoader();
  const models=new Map();
  function loadAnimal(id){
    if(!models.has(id)) models.set(id,loader.loadAsync(new URL('./models/'+id+'.glb',import.meta.url).href).then(({scene})=>({
      scene,anatomy:prepareZooAnimal(scene,id),
    })));
    return models.get(id);
  }
  async function addAnimal([parent,id,x,y,z,length,yaw],index){
    const {scene:source,anatomy}=await loadAnimal(id);
    if(signal?.aborted) return null;
    const model=source.clone();
    const size=new THREE.Box3().setFromObject(model,true).getSize(new THREE.Vector3());
    const animal=group(parent,id,x);
    animal.position.set(x,y,z);
    animal.rotation.y=yaw;
    animal.add(model);
    // Derive the original size from positions, excluding the morph culling margin.
    const scale=length/Math.max(size.x,size.y,size.z);
    model.scale.setScalar(scale);
    model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
    const plan=plans.find(plan=>plan.animal===index);
    const points=plan&&[[x,z],...plan.stops];
    return zooMotion(animal,model,id,anatomy,scale,points,index,plan?.ground,
      plan?.arc&&wideWalk(points,...plan.arc),plan?.turnSlot);
  }
  let ticks=[];
  const ready=Promise.all(animals.map(addAnimal)).then(steps=>{
    if(!signal?.aborted) ticks=steps;
  });
  return {
    ready,routes,
    update(time){ for(const tick of ticks) tick(time); },
  };
}
