import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { stripAquariumGround, aquariumPad, aquariumLift, aquariumSign, aquariumInnerSign, whaleSpout } from '../city-v1.3/aq_fix.js';
import { setRoot } from '../city-v1.3/lib.js';

const canvas=document.querySelector('canvas');
const status=document.querySelector('#status');
const toggle=document.querySelector('#toggle');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#dcefeb');
scene.add(new THREE.HemisphereLight('#ecffff','#d2bb96',2));
const light=new THREE.DirectionalLight('#fff4de',2.05);
light.position.set(2,8,6);
scene.add(light);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.toneMapping=THREE.ACESFilmicToneMapping;
const camera=new THREE.OrthographicCamera();
const controls=new OrbitControls(camera,canvas);
controls.minZoom=.7;
controls.maxZoom=5;
controls.maxPolarAngle=Math.PI*.49;
function reset(){
  camera.position.set(3.35,4.35,10);
  camera.zoom=1;
  controls.target.set(-.18,2.35,-1);
  camera.updateProjectionMatrix();
  controls.update();
}
function resize(){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  const span=Math.max(6.05,5.15*h/w);
  Object.assign(camera,{left:-span*w/h/2,right:span*w/h/2,top:span/2,bottom:-span/2,near:.01,far:60});
  camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
}
document.querySelector('#reset').onclick=reset;
new ResizeObserver(resize).observe(canvas);
reset();
resize();

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

async function start(){
  const loader=new GLTFLoader();
  const names=[...new Set(population.map(fish=>fish.id))];
  const [gltf,...assets]=await Promise.all([
    loader.loadAsync('../city-v1.3/models/aquarium-animated.glb?v=slim1'),
    ...names.map(id=>loader.loadAsync('./models/'+id+'.glb?v=2')),
  ]);
  const aquarium=gltf.scene;
  const removed=new Set();
  const takeOut=[];
  aquarium.traverse(node=>{
    if(/^(Swimming_reef_fish|Drifting_anglerfish|Pulsing_jellyfish)/.test(node.name)) takeOut.push(node);
    if(!node.isMesh) return;
    for(const mat of [].concat(node.material)){
      if(mat.transmission>0){
        mat.transmission=0;
        mat.transparent=true;
        mat.opacity=Math.min(mat.opacity,.5);
        mat.depthWrite=false;
        mat.needsUpdate=true;
      }
    }
  });
  if(takeOut.length!==14) throw new Error('Unexpected aquarium exhibit layout');
  for(const node of takeOut){
    node.traverse(child=>removed.add(child.name));
    node.removeFromParent();
  }
  const clip=gltf.animations[0];
  const sharkClip=new THREE.AnimationClip('Original shark loop',clip.duration,
    clip.tracks.filter(track=>!removed.has(track.name.split('.')[0])));
  if(sharkClip.tracks.length!==9) throw new Error('Unexpected shark animation tracks');
  const mixer=new THREE.AnimationMixer(aquarium);
  mixer.clipAction(sharkClip).play();
  const {minY}=stripAquariumGround(aquarium);
  aquarium.position.y=aquariumLift(minY);
  aquarium.add(aquariumSign(),aquariumInnerSign());
  const splash=whaleSpout();
  aquarium.add(splash.group);
  scene.add(aquarium);
  setRoot(scene);
  try{ aquariumPad(); }finally{ setRoot(null); }

  const fish=population.map(config=>{
    const model=assets[names.indexOf(config.id)].scene.clone();
    model.scale.setScalar(config.size);
    const morphs=[];
    model.traverse(node=>{
      if(node.morphTargetInfluences?.length===2) morphs.push(node.morphTargetInfluences);
    });
    if(!morphs.length) throw new Error('Missing swimming morphs for '+config.id);
    aquarium.add(model);
    return {config,model,morphs};
  });
  function update(t){
    mixer.setTime(t%clip.duration);
    splash.update(t);
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
  let playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  let time=0;
  const clock=new THREE.Clock();
  function sync(){toggle.textContent=playing?'暫停動畫':'播放動畫';}
  toggle.disabled=false;
  toggle.onclick=()=>{playing=!playing;sync();};
  sync();
  update(0);
  renderer.setAnimationLoop(()=>{
    const dt=Math.min(.08,clock.getDelta());
    if(playing){time+=dt;update(time);}
    renderer.render(scene,camera);
  });
  status.textContent='拖曳旋轉 · 雙指縮放';
  document.body.dataset.ready='true';
}
start().catch(error=>{status.textContent='模型載入失敗';console.error(error);});
