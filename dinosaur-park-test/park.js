import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildDinosaurPair } from '../city-v1.3/dinosaur-park.js?v=1';
import { bakeLot } from '../city-v1.3/perf.js';

const stage=document.getElementById('stage');
const status=document.getElementById('status');
const toggle=document.getElementById('toggle');

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
  const lot=new THREE.Group();
  scene.add(lot);
  const exhibits=buildDinosaurPair(lot,museumX,museumZ,{displayBase:true});
  bakeLot(lot);
  await exhibits.ready;
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
    if(animate) exhibits.update(dt);
    renderer.render(scene,camera);
  });
  stage.dataset.state='ready';
  status.hidden=true;
}catch(error){
  stage.dataset.state='error';
  status.textContent='恐龍園區暫時無法載入。';
  console.error(error);
}
