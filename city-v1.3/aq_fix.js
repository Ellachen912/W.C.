/* 海生館模型整合時的地面處理（家長 11-27 14:45：整合時移除模型自帶的地台，或調整高度，避免兩個地面疊在同一位置）
   模型自己帶了一整塊六角地：City soil（土，-0.26～-0.12）、City sidewalk（人行道，-0.12～0）、City sports zone（綠色地，0～0.02）。
   遊戲裡每塊地本來就有分區地面和道路，兩層地面疊在 y=0 附近會一直閃 → 這三塊拿掉，改鋪我們自己的六角石板地，
   模型整個往上墊，最低的零件（海洋鋅色飾帶，0.018）剛好落在石板地上面。 */
import * as THREE from 'three';
import { hexPad, canvasTex } from './lib.js';

export const AQ_GROUND=/^City[ _](soil|sidewalk|sports[ _]zone)/;   // three.js 會把名字裡的空格換成底線
export const AQ_PAD_TOP=.11;                                 // hexPad(…, .42, .09) 的頂面（含倒角）
/* 拿掉模型自帶的地台，回傳剩下零件最低的高度 */
export function stripAquariumGround(scene){
  const drop=[]; scene.traverse(o=>{ if(AQ_GROUND.test(o.name)) drop.push(o); });
  for(const o of drop){ o.traverse(m=>m.geometry&&m.geometry.dispose()); o.parent.remove(o); }
  scene.updateMatrixWorld(true); const b=new THREE.Box3();
  scene.traverse(o=>{ if(o.isMesh) b.expandByObject(o); });   // 只算靜態外框；魚在動不影響最低點
  return {removed:drop.map(o=>o.name), minY:b.min.y};
}
/* 家長 11-27 14:50：一樓外牆底部（紅線那圈）會閃 → 模型裡好幾組面疊在同一個位置。瘦身版模型（aq_slim.py）已經把該露出來的那層往外推 1.5 毫米，不用再處理。 */
/* 招牌：原本英文「TIDEPOOL AQUARIUM」，瘦身版拿掉了，這裡貼中文（家長規則：不要英文招牌）。位置照原本的字（模型座標） */
export function aquariumSign(text='木星海生館',pos=[-.655,.985,.437+.006],w=.98,h=.105,color='#2f5f68'){ const cv=document.createElement('canvas'); cv.width=1024; cv.height=110; const g=cv.getContext('2d');
  g.fillStyle=color; g.font='bold 84px "PingFang TC","Noto Sans CJK TC","Noto Sans TC",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(text,512,58);
  const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));
  m.position.set(...pos); m.name='Aquarium sign 中文'; return m; }
/* 大廳裡面那面牆原本也有英文「TIDEPOOL」，一樣拿掉換中文 */
export const aquariumInnerSign=()=>aquariumSign('海生館',[-.175,.815,-.04+.006],.62,.12,'#3d7c80');
/* 我們自己的地：暖米色大石板（跟模型的 Warm quartz paving 同一個色系，但不一樣深，才分得出來） */
const paveTex=canvasTex((g,s)=>{ g.fillStyle='#d6cbb8'; g.fillRect(0,0,s,s); let r=5; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let j=0;j<4;j++) for(let i=0;i<2;i++){ g.fillStyle=['#e9e1d2','#e4dbca','#ede6d8','#e0d6c4'][(i+j*3)%4]; g.fillRect(i*s/2+1.5,j*s/4+1.5,s/2-3,s/4-3); }
  for(let i=0;i<400;i++){ g.fillStyle=`rgba(130,115,95,${R()*.1})`; g.fillRect(R()*s,R()*s,2,2); } },256);
export function aquariumPad(){ const t=paveTex.clone(); t.needsUpdate=true; t.repeat.set(3,3); return hexPad(new THREE.MeshStandardMaterial({map:t,roughness:.9}),.42,.09,0); }
/* 墊高多少：最低零件放在石板地頂面上（再高 2 毫米，免得貼在一起閃） */
export const aquariumLift=minY=>AQ_PAD_TOP+.002-minY;

/* 鯨魚噴水（家長 11-27 15:16：鯨魚頭頂偶爾噴水柱，不要太高）
   位置：鯨魚雕像頭頂的噴氣孔（模型座標）。每 7 秒噴一次、噴 1.8 秒：一柱細細的水往上衝、頂端散開成小水花，最高約 0.3（大概半個鯨魚頭高）。
   用法：const sp=whaleSpout(); gltf.scene.add(sp.group); anims.push(t=>sp.update(t)); */
export const WHALE_BLOWHOLE=[.36,1.385,1.06];
export function whaleSpout(pos=WHALE_BLOWHOLE,{period=7,dur=1.8,height=.3}={}){
  const g=new THREE.Group(); g.position.set(...pos); g.name='Whale spout';
  const mt=new THREE.MeshStandardMaterial({color:'#eaf8ff',transparent:true,opacity:.85,roughness:.15,emissive:new THREE.Color('#cfefff'),emissiveIntensity:.25,depthWrite:false});
  const col=new THREE.Mesh(new THREE.CylinderGeometry(.012,.022,1,8,1,true),mt); g.add(col);              // 水柱
  const dropGeo=new THREE.SphereGeometry(1,8,6), drops=[];
  for(let i=0;i<14;i++){ const m=new THREE.Mesh(dropGeo,mt.clone()); g.add(m); drops.push({m,a:i*2.4,ph:i/14,sp:.6+((i*37)%10)/20}); }   // 頂端水花
  g.visible=false;
  function update(t){ const k=(t%period)/dur; if(k>=1){ g.visible=false; return; } g.visible=true;
    const up=Math.min(1,k*4), down=k>.7?(1-(k-.7)/.3):1, h=height*up*down;                                   // 很快衝上去、最後慢慢落下
    col.scale.set(1,Math.max(.001,h),1); col.position.y=h/2;
    for(const d of drops){ const q=((k*2.2+d.ph)%1), r=.035+q*.09*d.sp;
      d.m.position.set(Math.cos(d.a)*r,h*(.85+.25*Math.sin(q*Math.PI))-q*q*.12,Math.sin(d.a)*r);
      const s=(.012+.01*(1-q))*Math.min(1,h/height*1.5); d.m.scale.setScalar(Math.max(.0001,s)); d.m.material.opacity=.8*(1-q)*down; } }
  return {group:g,update}; }
