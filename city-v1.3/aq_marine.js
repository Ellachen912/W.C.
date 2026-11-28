import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Parameters use the original tank's local coordinate system.
const population=[
  {id:'turtle',size:.72,y:2.34,x:.20,z:-1.09,rx:.74,rz:.35,period:11,phase:.7},
  {id:'ray',size:.69,y:1.78,x:-.25,z:-1.11,rx:.69,rz:.34,period:12,phase:3.8},
  {id:'angler',size:.35,y:1.56,x:.43,z:-1.20,rx:.40,rz:.25,period:10,phase:1.7},
  {id:'jelly',size:.37,y:2.35,x:-.88,z:-.64,rx:.08,rz:.09,period:8,phase:.8},
  {id:'jelly',size:.33,y:2.14,x:.95,z:-1.38,rx:.10,rz:.09,period:8,phase:2.5},
  ...[0,1,2].map(i=>({id:'clown',size:.21,y:1.93+i*.12,x:-.35,z:-1.03,rx:.67,rz:.31,period:8,phase:i*.72})),
  ...[0,1,2].map(i=>({id:'angel',size:.22,y:2.25+i*.12,x:.25,z:-1.15,rx:.68,rz:.35,period:9,phase:2.8+i*.70})),
];

export async function prepareMarineLife(aquarium,clip){
  const oldAnimals=[];
  aquarium.traverse(node=>{
    if(/^(Swimming_reef_fish|Drifting_anglerfish|Pulsing_jellyfish)/.test(node.name)) oldAnimals.push(node);
  });
  const removed=new Set();
  for(const node of oldAnimals) node.traverse(child=>removed.add(child.name));
  const tracks=clip.tracks.filter(track=>!removed.has(track.name.split('.')[0]));
  if(oldAnimals.length!==14||tracks.length!==9) throw new Error('Unexpected aquarium exhibit layout');

  const loader=new GLTFLoader();
  const names=[...new Set(population.map(fish=>fish.id))];
  const assets=new Map(await Promise.all(names.map(async id=>{
    const url=new URL('../aquarium-sea-test/models/'+id+'.glb?v=2',import.meta.url);
    return [id,await loader.loadAsync(url.href)];
  })));
  const displays=new THREE.Group();
  displays.name='Replacement marine life';
  const fish=population.map(config=>{
    const model=assets.get(config.id).scene.clone();
    model.scale.setScalar(config.size);
    const morphs=[];
    model.traverse(node=>{
      if(node.morphTargetInfluences?.length===2) morphs.push(node.morphTargetInfluences);
    });
    if(!morphs.length) throw new Error('Missing swimming morphs for '+config.id);
    model.name="Aquarium marine life: "+config.id;
    displays.add(model);
    return {config,model,morphs};
  });
  function update(t){
    for(const {config:c,model,morphs} of fish){
      const a=t*Math.PI*2/c.period+c.phase;
      const jelly=c.id==='jelly';
      const beat=Math.sin(t*(jelly?3.7:c.id==='turtle'?3.2:c.id==='ray'?4:10)+c.phase);
      model.position.set(c.x+c.rx*Math.cos(a),c.y+(jelly?.082:.042)*Math.sin(a*2),c.z+c.rz*Math.sin(a));
      model.rotation.set(jelly?0:.045*Math.cos(a*2),jelly?a*.18:Math.atan2(-c.rx*Math.sin(a),c.rz*Math.cos(a)),jelly?0:.085*beat);
      for(const weights of morphs){
        weights[0]=Math.max(0,beat);
        weights[1]=Math.max(0,-beat);
      }
    }
  }
  return {
    clip:new THREE.AnimationClip('Original shark loop',clip.duration,tracks),
    update,
    mount(){
      for(const node of oldAnimals) node.removeFromParent();
      oldAnimals.length=0;
      update(0);
      aquarium.add(displays);
    },
    dispose(){
      displays.traverse(node=>{
        if(!node.isMesh) return;
        node.geometry.dispose();
        for(const material of [].concat(node.material)) material.dispose();
      });
    },
  };
}
