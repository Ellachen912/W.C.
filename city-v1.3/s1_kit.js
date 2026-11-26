/* Winston City 共用：把 Kenney 模型（models/…/*.glb）放進場景。
   kit() 會馬上放一個空的群組，模型載好後再塞進去（遊戲不用等）；樣張頁用 await kitReady() 等全部載完再拍照。
   opts：w 寬度（x 方向）、h 高度、rot 轉向、y0 底部高度、map 換貼圖（例如改顏色的 colormap）、spin 'blades' 會把那個節點加進 rotors（遊戲裡轉）。 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { ROOT } from './lib.js';
const loader=new GLTFLoader(), cache={}, maps={}, PENDING=[];
/* 11-25：模型是之後才載進來的；index.html 等這一棟的模型都載好了才合併零件（原本合併時模型還沒到，下載的模型一個都沒合併到） */
export const pendingLen=()=>PENDING.length, pendingFrom=n=>PENDING.slice(n);
export const kitReady=async()=>{ let n; do{ n=PENDING.length; await Promise.all(PENDING); }while(PENDING.length>n); };   /* 模型載好後才換的貼圖也要等 */
export function kitMap(p){ if(maps[p]) return maps[p]; let done; PENDING.push(new Promise(r=>done=r)); const t=new THREE.TextureLoader().load(p,done,undefined,done); t.flipY=false; t.colorSpace=THREE.SRGBColorSpace; t.magFilter=THREE.NearestFilter; return maps[p]=t; }
/* Quaternius 的模型是 OBJ＋MTL：MTL 的顏色是線性值，換成不反光的 Standard 材質 */
const matCache={};
import { index } from './model_index.js';
const chunks=new Map();
export async function pack(...paths){const entries=await Promise.all(paths.filter(p=>Object.hasOwn(index,p)).map(async p=>{if(!chunks.has(p))chunks.set(p,import('./model_chunks/'+index[p]).then(m=>m.default).catch(e=>{chunks.delete(p);throw e;}));return [p,await chunks.get(p)];}));return Object.fromEntries(entries);}
async function loadObj(p){
  const mp=p.replace(/\.obj$/,'.mtl'), M=await pack(p,mp);
  const mats=M[mp]?new MTLLoader().parse(M[mp].slice(1),''):await new MTLLoader().loadAsync(mp); mats.preload();
  const o=M[p]?new OBJLoader().setMaterials(mats).parse(M[p].slice(1)):await new OBJLoader().setMaterials(mats).loadAsync(p);
  o.traverse(m=>{ if(!m.isMesh) return; const conv=mm=>{ const k=mm.name+'|'+p; if(!matCache[k]){ const c=mm.color.clone().convertLinearToSRGB(); if(p.includes('/food/')){ const h={}; c.getHSL(h); c.setHSL(h.h,Math.min(1,h.s*1.1),Math.min(.75,h.l*1.35+.04)); if((h.h<.03||h.h>.96)&&h.s>.35) c.setHSL(.005,.9,.55); /* 番茄、紅椒：鮮紅（家長 20:12） */ } matCache[k]=new THREE.MeshStandardMaterial({color:c,roughness:.85,flatShading:true}); } return matCache[k]; };
    m.material=Array.isArray(m.material)?m.material.map(conv):conv(m.material); });
  return {scene:o};
}
async function loadGlb(p){ const M=await pack(p); if(!M[p]) return loader.loadAsync(p);
  const bin=Uint8Array.from(atob(M[p].slice(1)),c=>c.charCodeAt(0)).buffer; return loader.parseAsync(bin,p.slice(0,p.lastIndexOf('/')+1)); }
function load(p){ if(!cache[p]) cache[p]=p.endsWith('.obj')?loadObj(p):loadGlb(p); return cache[p]; }
export const FARMB=n=>`models/farm/${n}.obj`, FOOD=n=>`models/food/${n}.obj`, ANIMAL=n=>`models/animals/${n}.obj`;
export const FT=n=>`models/ft/${n}.glb`, FUR=n=>`models/fur/${n}.glb`, MKT='models/mkt/market.glb';
export const IND=n=>`models/ind/${n}.glb`, SUB=n=>`models/sub/${n}.glb`, COM=n=>`models/com/${n}.glb`;
export function kit(path,x,z,{w=null,h=null,d=null,rot=0,y0=0,map=null,spin=null,rotors=null,parent=null,node=null,then=null}={}){
  const g=new THREE.Group(); g.position.set(x,y0,z); (parent||ROOT).add(g);
  const p=load(path).then(gl=>{
    let o; if(node){ const src=gl.scene.getObjectByName(node); if(!src){ console.warn('no node',node); return; }   // 一大包模型裡只拿其中一個（例如市場包的蔬果箱）
      gl.scene.updateMatrixWorld(true); o=src.clone(true); src.matrixWorld.decompose(o.position,o.quaternion,o.scale); o.position.set(0,0,0); }
    else o=gl.scene.clone(true);
    o.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; if(map&&m.material.map){ m.material=m.material.clone(); m.material.map=kitMap(map); } } });
    const wrap=new THREE.Group(); wrap.add(o); wrap.rotation.y=rot;
    const b=new THREE.Box3().setFromObject(wrap), sz=b.getSize(new THREE.Vector3());
    const k=w?w/sz.x:(h?h/sz.y:(d?d/sz.z:1)); wrap.scale.setScalar(k);
    const b2=new THREE.Box3().setFromObject(wrap), c=b2.getCenter(new THREE.Vector3());
    wrap.position.set(-c.x,-b2.min.y,-c.z); g.add(wrap); if(then) then(o);   // then：模型載好後再調（例如調暗顏色）
    if(spin&&rotors&&path.endsWith('.obj')){ o.traverse(n=>{ if(n.isMesh&&n.name.includes(spin)){ // OBJ 的葉片：把轉軸移到葉片中心，繞 z 轉
        n.geometry.computeBoundingBox(); const c=n.geometry.boundingBox.getCenter(new THREE.Vector3()); n.geometry=n.geometry.clone(); n.geometry.translate(-c.x,-c.y,-c.z);
        const piv=new THREE.Group(); piv.position.copy(c); n.parent.add(piv); piv.add(n); piv.userData.moving=1; rotors.push(piv); } }); }
    else if(spin&&rotors){ const n=o.getObjectByName(spin); if(n){ // 葉片朝 -x：外面包一層，讓遊戲裡轉 rotation.z 就是繞葉片軸轉
        const piv=new THREE.Group(); n.parent.add(piv); piv.position.copy(n.position); piv.rotation.y=Math.PI/2; n.position.set(0,0,0); n.rotation.y-=Math.PI/2; piv.add(n); piv.userData.moving=1; rotors.push(piv); } }
  });
  PENDING.push(p); return g;
}
