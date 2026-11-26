/* Winston City 4 污水處理廠 Lv1–5：灰藍牆＋石板藍屋頂、圓形沉澱池和會轉的刮泥橋（每一級都看得出是污水處理廠）。
   一級比一級高、往智慧化發展（家長 2026-11-11 12:17 定方向，不要無人機和機器人）：
   Lv1 控制房＋沉澱池＋乾淨水池＋放流管 → Lv2 兩層樓攔污柵機房＋沉砂池＋水質感測器 → Lv3 冒泡泡的曝氣池＋鼓風機房
   → Lv4 兩顆蛋形消化槽（沼氣發電、頂燈）＋屋頂太陽能板 → Lv5 智慧控制塔（亮燈帶，全場最高）＋膜過濾塔＋紫色再生水管。
   污水處理廠在西南河口，南邊是海。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, hip, glassMat, tree, bush, lamp, spinners } from './lib.js';
import { SEWAGE, waterTop, pool, block, win, door, beam, solar } from './stage1.js';
import { kit, IND } from './s1_kit.js';
const WHITE='#fbfaf6', P=SEWAGE, PURPLE='#9b72d0';
export const sewBlink=[];                 // 會閃的指示燈（遊戲迴圈裡讓它們亮暗）
const led=(c,hex)=>mat(c,{emissive:hex,emissiveIntensity:.8});
function sensor(x,z){                     // 水質感測器：藍色小柱子＋綠燈
  cyl(.05,.06,.5,P.roof,x,0,z,10); rbox(.16,.12,.1,WHITE,x,.42,z,.02); sewBlink.push(sphere(.04,led('#5bdc6a',0x3cff5a),x,.6,z));
}
function screenHouse(x,z){                // Lv2 兩層樓攔污柵機房（平屋頂）＋前面的沉砂池
  const t=block(x,z,1.0,.9,1.45,P.wall,{base:'#c4ccd6'}); rbox(1.0,.08,.9,'#c9d1dc',x,t,z,.02);
  rbox(1.06,.06,.96,WHITE,x,.86,z,.02);
  door(x-.25,.16,z+.455,.28,.5,P.roof); win(x+.22,.36,z+.455,.26,.3); win(x-.22,.98,z+.455,.26,.3); win(x+.22,.98,z+.455,.26,.3);
  win(x-.505,.98,z,.26,.3,-Math.PI/2);
  // 沉砂池：長長的水道，砂色的水；入口一排灰色攔污柵
  const cz=z+1.0; rbox(1.5,.28,.45,'#e6eaee',x-.1,0,cz,.03); rbox(1.38,.02,.33,mat('#c9b98a',{roughness:.3}),x-.1,.27,cz,.01);
  for(let i=0;i<7;i++) rbox(.02,.34,.02,'#7b8191',x+.5-i*.045,.1,cz,.004); rbox(.36,.04,.06,'#7b8191',x+.38,.44,cz,.01);
  beam([x+.7,.2,cz],[x+1.2,.2,cz],.08,P.roof,12);            // 從城市流進來的污水管
  return t;
}
function aeration(cx,cz,w,d){             // Lv3 曝氣池：長方形，水面一直冒泡泡
  rbox(w,.32,d,'#e6eaee',cx,0,cz,.04); rbox(w-.14,.02,d-.14,mat('#93a86a',{roughness:.25}),cx,.31,cz,.01);
  rbox(.05,.06,d-.1,'#dfe4e8',cx,.3,cz,.01);
  const bm=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.3});
  for(let i=0;i<40;i++){ const a=((i%10)+.5+.35*Math.sin(i*12.9898))/10, b=((Math.floor(i/10))+.5+.35*Math.sin(i*78.233))/4; const bb=sphere(.05+.05*((i*.37)%1),bm,cx-w/2+.14+a*(w-.28),.33,cz-d/2+.12+b*(d-.24)); bb.scale.y=.6; }
}
function blowerHouse(x,z,tx,tz){         // Lv3 鼓風機房：一層小樓＋兩根大風管接到曝氣池
  const t=block(x,z,.85,.7,.75,P.wall,{base:'#c4ccd6'}); rbox(.85,.08,.7,'#c9d1dc',x,t,z,.02);
  door(x-.15,.16,z+.355,.26,.46,P.roof); for(let i=0;i<3;i++) rbox(.04,.22,.02,'#7b8191',x+.22+i*.06,.4,z+.36,.005);
  for(const dz of [-.15,.15]){ beam([x+.42,.55,z+dz],[x+.7,.55,z+dz],.09,'#8fa3bf',12); beam([x+.7,.55,z+dz],[tx,.42,tz+dz],.09,'#8fa3bf',12); }
  return t;
}
function eggTank(x,z,h=2.2){              // Lv4 蛋形消化槽：銀白色的大蛋，頂上有走道和亮燈
  for(let k=0;k<4;k++){ const a=k/4*Math.PI*2+.4; beam([x+Math.cos(a)*.45,0,z+Math.sin(a)*.45],[x+Math.cos(a)*.3,.6,z+Math.sin(a)*.3],.05,'#9aa3b2',8); }
  cyl(.62,.66,.12,'#c4ccd6',x,0,z,24);
  const e=sphere(.62,mat('#e4e8ef',{metalness:.35,roughness:.35}),x,h*.52,z); e.scale.set(1,h/1.3,1);
  for(const y of [h*.35,h*.7]){ const r=add(new THREE.Mesh(new THREE.TorusGeometry(.6*Math.sin(Math.acos((y-h*.52)/(h*.62/1.3*1.3))||1)||.55,.02,6,32),mat(P.roof))); r.rotation.x=Math.PI/2; r.position.set(x,y,z); }
  cyl(.22,.22,.1,P.roof,x,h*.52+h*.47,z,16); sewBlink.push(sphere(.07,led('#ffd23a',0xffc21a),x,h+.12,z));
  return h+.1;
}
function controlTower(x,z){              // Lv5 智慧控制塔：全場最高，三圈亮藍燈帶，頂上玻璃控制室＋天線
  cyl(.6,.66,.2,'#c4ccd6',x,0,z,28);
  cyl(.38,.46,2.7,P.wall,x,.2,z,28);
  for(const y of [.8,1.6,2.4]){ const r=add(new THREE.Mesh(new THREE.TorusGeometry(.44-(y/2.7)*.07,.03,8,36),led('#7fe0ff',0x30c8ff))); r.rotation.x=Math.PI/2; r.position.set(x,y,z); }
  for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; const w=add(new THREE.Mesh(new THREE.PlaneGeometry(.12,.5),glassMat)); w.position.set(x+Math.sin(a)*.43,1.25,z+Math.cos(a)*.43); w.rotation.y=a; }
  cyl(.62,.5,.14,WHITE,x,2.9,z,28); cyl(.55,.55,.5,mat('#bfe6f5',{roughness:.1,transparent:true,opacity:.6}),x,3.04,z,28);
  cyl(.64,.6,.1,P.roof,x,3.54,z,28); cyl(.02,.02,.6,'#9aa3b2',x,3.64,z,6); sewBlink.push(sphere(.05,led('#ff6b6b',0xff3030),x,4.26,z));
}
function membraneTower(x,z){             // Lv5 膜過濾塔：透明外殼，裡面一排白色膜管，做出再生水
  cyl(.42,.45,.14,'#c4ccd6',x,0,z,24);
  for(let i=0;i<7;i++){ const a=i/7*Math.PI*2; cyl(.05,.05,1.5,'#f4f4f0',x+Math.cos(a)*.18,.14,z+Math.sin(a)*.18,10); }
  cyl(.08,.08,1.5,mat(PURPLE,{roughness:.3}),x,.14,z,10);
  cyl(.36,.36,1.55,mat('#e4f6fb',{roughness:.05,transparent:true,opacity:.3}),x,.14,z,24);
  cyl(.4,.38,.1,PURPLE,x,1.69,z,24); const d=add(new THREE.Mesh(new THREE.SphereGeometry(.38,24,10,0,Math.PI*2,0,Math.PI/2),mat(P.wall))); d.position.set(x,1.79,z); d.scale.y=.4;
}
export function sewage(lv){
  // 控制房（Lv1 起）
  const top=block(-1.35,-1.25,1.4,1.1,.95,P.wall,{base:'#c4ccd6'});
  hip(1.65,1.35,.5,P.roof,-1.35,top,-1.25);
  if(lv>=4) solar(-1.35,top+.18,-1.05,3,1,.36);              // Lv4 屋頂太陽能板（前面那片坡）
  door(-1.35,.16,-.69,.38,.6,P.roof);
  win(-1.85,.42,-.69,.24,.3); win(-.85,.42,-.69,.24,.3);
  // 沉澱池＋會轉的刮泥橋
  const dx=.75, dz=-.85, r=1.05;
  const h=pool(dx,dz,r,mat(P.dirty,{roughness:.3}),'#e6eaee',.32);
  cyl(.12,.12,.2,'#e6eaee',dx,h-.05,dz,16);
  const br=new THREE.Group(); br.position.set(dx,h+.15,dz); ROOT.add(br); spinners.push(br);
  rbox(r*2-.1,.06,.16,P.roof,0,0,0,.02,br); rbox(r*2-.1,.04,.03,'#f2c230',0,.12,.07,.01,br); rbox(r*2-.1,.04,.03,'#f2c230',0,.12,-.07,.01,br);
  // 乾淨水池＋放流管（往南邊海裡）
  pool(-.95,.85,.72,waterTop(),'#e6eaee',.28);
  beam([-.2,.25,.2],[.2,.25,-.3],.06,P.roof,10);
  beam([-1.6,.15,1.15],[-2.9,.15,1.75],.08,P.roof,12);
  // Lv2：攔污柵機房＋沉砂池、水質感測器
  if(lv>=2){ screenHouse(2.4,.95); for(const [x,z] of [[2.15,-.55],[-.05,.35],[-1.75,.4]]) sensor(x,z); }
  // Lv3：曝氣池＋鼓風機房
  if(lv>=3){ aeration(.45,2.3,1.9,.85); const t=blowerHouse(-1.45,2.35,-.5,2.3); if(lv>=4) kit(IND('solar-panel-landscape-group'),-1.45,2.35,{w:.85,y0:t+.02,rot:Math.PI}); }   // Kenney 太陽能板
  // Lv4：兩顆蛋形消化槽
  if(lv>=4){ eggTank(-2.75,-.35,2.3); eggTank(-2.65,-1.75,2.0); beam([-2.7,2.3,-.35],[-2.65,2.0,-1.75],.04,'#9aa3b2',6); beam([-2.2,.3,-.6],[-2.05,.3,-1.0],.06,P.roof,10); }
  // Lv5：智慧控制塔、膜過濾塔、紫色再生水管（送回城市澆花、洗街道）
  if(lv>=5){ controlTower(2.6,-1.3); membraneTower(1.55,-2.25);
    beam([1.95,.35,-2.25],[3.3,.35,-2.25],.08,PURPLE,12); beam([3.3,.35,-2.25],[3.3,.35,2.9],.08,PURPLE,12);
    for(let z=-1.8;z<2.9;z+=.7) rbox(.18,.28,.1,'#cfd6dc',3.3,0,z,.02); }
  if(lv<2) tree(1.95,1.4,.75); if(lv<3) bush(.4,1.6,.7,'#ffd166'); if(lv<4) tree(-2.0,.0,.7,'#6fc463');
  if(lv>=2&&lv<5) tree(2.6,-1.9,.7);
}
export const SEWAGE_MAP=[0,1,3,5];   // 家長 2026-11-11 12:41 改成 3 級：新 Lv1＝舊 Lv1、新 Lv2＝舊 Lv3、新 Lv3＝舊 Lv5
export const SEWAGE_LV=[1,2,3].map(l=>['sewage'+(l>1?l:''),'污水處理廠 Lv'+l,()=>sewage(SEWAGE_MAP[l]),'whole']);
