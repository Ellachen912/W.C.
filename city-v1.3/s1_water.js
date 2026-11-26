/* Winston City 2 自來水廠 Lv1–5：白藍牆＋水藍屋頂、大水滴標誌。照真正的淨水步驟長大：
   Lv1 淨水池＋一根細水管 → Lv2 河邊抽水站＋圓筒沉澱槽 → Lv3 兩座透明過濾塔＋水質實驗室＋兩根水管 → Lv4 廠房加蓋二樓、加壓抽水機（會轉、會亮）
   → Lv5 玻璃淨水高塔、小水壩、水資源教室、發光水滴、粗大水管加閥門和流動藍光。（家長 11:51：不要噴泉廣場；12:11：不要水塔；12:11 定稿）
   自來水廠在西北上游，河在建地西邊（x≈-3.7）。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, hip, glassMat, tree, bush, bench, lamp, shade, drops, ripples } from './lib.js';
import { WATER, waterTop, drop, pool, block, win, door, beam, fence, rotors } from './stage1.js';
const WHITE='#fbfaf6';
function pumpHouse(x,z){                 // 取水口抽水站：河邊的小房子＋伸進河裡的取水管
  const t=block(x,z,.8,.7,.6,WATER.wall,{base:'#cfd9de'}); hip(1.0,.9,.35,WATER.main,x,t,z);
  door(x+.4+.005,.16,z,.24,.42,WATER.main,Math.PI/2);
  for(let i=0;i<2;i++){ const w=add(new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.12,20),mat('#6d7a88'))); w.rotation.z=Math.PI/2; w.position.set(x+.5,.24+i*.0,z+.2-i*.4); }
  beam([x-.4,.18,z],[x-1.1,.02,z],.07,WATER.main,12);
}
function lab(x,z){                      // 水質實驗室：白色小屋＋屋頂燒瓶標誌
  const t=block(x,z,.95,.7,.65,WHITE,{base:'#d9d6ce',trim:WATER.main}); rbox(.95,.06,.7,'#e6ecef',x,t,z,.02);
  door(x-.22,.16,z+.355,.24,.42,WATER.main); win(x+.2,.38,z+.355,.24,.22);
  const g=sphere(.14,mat('#bfeefa',{roughness:.1,transparent:true,opacity:.85}),x,t+.2,z); cyl(.04,.05,.18,'#e6f6fb',x,t+.3,z,10);
  sphere(.1,mat('#5fc6e8',{roughness:.2}),x,t+.17,z);
}
function dam(x,z){                      // 河上游的小水壩：白色壩體、三道洩洪的白色水花
  rbox(1.7,.9,.45,'#eceae4',x,0,z,.05); rbox(1.8,.1,.55,'#d9d6ce',x,.9,z,.03);
  for(const dx of [-.5,0,.5]){ rbox(.22,.5,.06,'#fbfaf6',x+dx,.3,z+.25,.02);
    const sp=new THREE.MeshStandardMaterial({color:'#ffffff',transparent:true,opacity:.85,roughness:.6}); [[0,.15,.12],[.05,.08,.1],[-.06,.06,.09]].forEach(([a,b,r])=>sphere(r,sp,x+dx+a,b,z+.4+b)); }
  rbox(1.6,.02,1.4,waterTop(),x,.08,z-.95,.01);               // 壩後面的水
  for(const s of [-1,1]) rbox(.2,.24,.2,'#d9d6ce',x+s*.95,.9,z,.03);
}
function classroom(x,z){
  rbox(1.2,.12,.8,'#e6ecef',x,0,z,.03); rbox(1.1,.6,.7,glassMat,x,.12,z,.02);
  for(const dx of [-.55,0,.55]) rbox(.05,.6,.05,WHITE,x+dx,.12,z+.35,.01);
  rbox(1.22,.08,.82,WATER.main,x,.72,z,.02); rbox(1.3,.05,.9,WHITE,x,.8,z,.02); drop(x,1.0,z,.5,WATER.light);
  for(const [dx,c] of [[-.25,'#8fd3f0'],[.05,'#3d9ad1'],[.3,'#bfeefa']]) cyl(.07,.07,.24,c,x+dx,.12,z,12);
}
function settleCyl(x,z){               // Lv2 高高的圓筒沉澱槽：中間一圈玻璃窗看得到混濁的水
  cyl(.58,.6,.16,'#d9d6ce',x,0,z,28); cyl(.55,.55,1.3,'#eef1f3',x,.16,z,28);
  cyl(.56,.56,.32,mat('#a9c7a3',{roughness:.2,transparent:true,opacity:.9}),x,.55,z,28);
  cyl(.6,.58,.08,WATER.main,x,1.46,z,28); const d=add(new THREE.Mesh(new THREE.SphereGeometry(.55,28,10,0,Math.PI*2,0,Math.PI/2),mat('#eef1f3'))); d.position.set(x,1.54,z); d.scale.y=.3;
  for(let i=0;i<7;i++) rbox(.16,.02,.03,'#9fb3c0',x+.58,.25+i*.18,z,.005); beam([x+.62,.2,z-.06],[x+.62,1.5,z-.06],.012,'#9fb3c0',4); beam([x+.62,.2,z+.06],[x+.62,1.5,z+.06],.012,'#9fb3c0',4);
}
function filterTower(x,z,h=1.6){       // Lv3 透明過濾塔：看得到砂石分層，水一滴一滴往下流
  cyl(.38,.4,.14,'#d9d6ce',x,0,z,24);
  cyl(.3,.3,.3,'#a99a85',x,.14,z,24); cyl(.3,.3,.38,'#e3cf9e',x,.44,z,24); cyl(.3,.3,.5,mat('#7fd0ea',{roughness:.15}),x,.82,z,24);
  cyl(.34,.34,h-.14,mat('#dff6fd',{roughness:.05,transparent:true,opacity:.35}),x,.14,z,24);
  cyl(.37,.37,.08,WATER.main,x,h,z,24); const cap=add(new THREE.Mesh(new THREE.ConeGeometry(.37,.22,24),mat(WATER.main))); cap.position.set(x,h+.19,z);
  for(const y of [.14,h*.5]) { const r=add(new THREE.Mesh(new THREE.TorusGeometry(.345,.02,6,28),mat(WHITE))); r.rotation.x=Math.PI/2; r.position.set(x,y,z); }
  const dm=new THREE.MeshStandardMaterial({color:'#bfeefa',transparent:true,opacity:.85,emissive:0x5bbfe0,emissiveIntensity:.4});
  for(let k=0;k<3;k++){ const dd=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),dm); ROOT.add(dd); dd.position.set(x+(k-1)*.1,1.1-k*.3,z+.22);
    drops.push({d:dd,curve:new THREE.LineCurve3(new THREE.Vector3(x+(k-1)*.1,1.3,z+.22),new THREE.Vector3(x+(k-1)*.1,.5,z+.22)),o:k/3}); }
}
function pressPump(x,z){               // Lv4 加壓抽水機：會轉的藍色輪子＋綠燈紅燈
  rbox(.7,.45,.5,'#dfe4e8',x,0,z,.05); rbox(.72,.06,.52,WATER.main,x,.45,z,.02);
  const g=new THREE.Group(); g.position.set(x-.12,.28,z+.27); ROOT.add(g); rotors.push(g);
  const w=add(new THREE.Mesh(new THREE.TorusGeometry(.15,.03,8,24),mat(WATER.main)),g);
  for(let k=0;k<3;k++){ const sp=rbox(.03,.28,.02,WATER.main,0,-.14,0,.005,g); sp.rotation.z=k/3*Math.PI; }
  blinkers.push(sphere(.04,mat('#5bdc6a',{emissive:0x3cff5a,emissiveIntensity:.8}),x+.18,.36,z+.26)); sphere(.04,mat('#ff6b6b',{emissive:0xff3030,emissiveIntensity:.5}),x+.28,.36,z+.26);
}
function cityPipes(lv){                 // 通往城市的水管：Lv1–2 一根細管 → Lv3–4 兩根 → Lv5 一根粗管＋閥門＋流動的藍光
  const z0=1.55, z1=3.35;
  if(lv<3){ beam([.95,.2,z0],[.95,.2,z1],.06,WATER.main,12); for(let z=z0+.4;z<z1;z+=.7) rbox(.16,.14,.08,'#cfd6dc',.95,0,z,.02); return; }
  if(lv<5){ for(const x of [.82,1.08]) beam([x,.22,z0],[x,.22,z1],.07,WATER.main,12); for(let z=z0+.4;z<z1;z+=.7) rbox(.46,.16,.1,'#cfd6dc',.95,0,z,.02); return; }
  beam([.95,.34,z0],[.95,.34,z1],.15,WATER.main,20);
  beam([.95,.49,z0],[.95,.49,z1],.025,mat('#bff3ff',{emissive:0x40d0ff,emissiveIntensity:.9}),8);
  for(let z=z0+.3;z<z1;z+=.6){ rbox(.36,.22,.12,'#cfd6dc',.95,0,z,.02); const r=add(new THREE.Mesh(new THREE.TorusGeometry(.17,.02,6,24),mat(WHITE))); r.position.set(.95,.34,z); }
  for(const z of [z0+.6,z0+1.5]){ cyl(.025,.025,.2,'#6d7a88',.95,.48,z,6); const vw=add(new THREE.Mesh(new THREE.TorusGeometry(.11,.025,6,20),mat('#e5484d'))); vw.rotation.x=Math.PI/2; vw.position.set(.95,.7,z); }
}
function glassTower(x,z){              // Lv5 玻璃淨水高塔：裡面一根發光的藍色水柱
  cyl(.58,.62,.18,'#d9d6ce',x,0,z,28);
  cyl(.22,.22,2.3,mat('#6fd8ff',{emissive:0x2fb8ff,emissiveIntensity:.55,roughness:.2}),x,.18,z,20);
  cyl(.5,.5,2.3,mat('#dff6fd',{roughness:.05,transparent:true,opacity:.3}),x,.18,z,28);
  for(const y of [.18,.95,1.7,2.45]){ const r=add(new THREE.Mesh(new THREE.TorusGeometry(.5,.03,6,32),mat(WHITE))); r.rotation.x=Math.PI/2; r.position.set(x,y,z); }
  const d=add(new THREE.Mesh(new THREE.SphereGeometry(.5,28,12,0,Math.PI*2,0,Math.PI/2),mat(WATER.main))); d.position.set(x,2.48,z); d.scale.y=.45;
  drop(x,2.78,z,.45,'#ffffff');
}
export const blinkers=[];
export function water(lv){
  const P=WATER;
  let top=block(-1.0,-.85,1.8,1.3,1.1,P.wall,{base:'#cfd9de'});
  win(-.09,.45,-.85,.3,.38,Math.PI/2); win(-1.91,.45,-.85,.3,.38,-Math.PI/2);
  if(lv>=4){ // Lv4 廠房加蓋二樓
    rbox(1.8,.9,1.3,P.wall,-1.0,top,-.85,.04); rbox(1.92,.1,1.42,WHITE,-1.0,top+.9,-.85,.03);
    for(const x of [-1.6,-1.0,-.4]) win(x,top+.25,-.195,.28,.34); win(-.09,top+.25,-.85,.28,.34,Math.PI/2); top+=1.0; }
  hip(2.1,1.6,.6,P.main,-1.0,top,-.85);
  door(-1.0,.16,-.19,.42,.66,P.main);
  for(const x of [-1.6,-.4]) win(x,.45,-.19,.3,.38);
  // 屋頂前緣的大水滴（Lv5 發光）
  rbox(.62,.62,.06,WHITE,-1.0,top+.02,-.08,.12);
  if(lv>=5){ const g=sphere(.24,mat(P.main,{emissive:0x3db8ff,emissiveIntensity:.6,roughness:.3}),-1.0,top+.25,-.02); const c=add(new THREE.Mesh(new THREE.ConeGeometry(.22,.36,24),g.material)); c.position.set(-1.0,top+.51,-.02); }
  else drop(-1.0,top+.25,-.02,1.05);
  // 淨水池（兩座）＋水管
  pool(.95,.65,.85,waterTop()); pool(1.05,-1.25,.6,waterTop()); ripples(.95,.322,.65,.72); ripples(1.05,.322,-1.25,.48);   // 水面波紋
  cyl(.05,.05,.3,'#cfd6dc',.95,.3,.65,10);
  beam([-.05,.35,-.5],[.25,.35,.2],.07,P.main,12); beam([.4,.35,-1.2],[-.05,.35,-1.0],.07,P.main,12);
  tree(-1.7,1.25,.8,'#6fc463');                       // 家長 12:11：不要水塔
  cityPipes(lv);
  // Lv2：河邊取水口抽水站、圓筒沉澱槽
  if(lv>=2){ pumpHouse(-2.8,.95); settleCyl(2.55,-1.1); beam([-2.4,.2,.95],[-1.9,.2,.95],.07,P.main,12); beam([1.97,.3,-1.15],[1.65,.3,-1.25],.07,P.main,12); }
  // Lv3：兩座透明過濾塔、水質實驗室
  if(lv>=3){ filterTower(2.35,.45); filterTower(2.75,1.25,1.4); lab(.15,1.95); beam([1.97,.4,.45],[1.8,.4,.55],.06,P.main,10); }
  // Lv4：二樓（上面）、加壓抽水機
  if(lv>=4) pressPump(1.85,2.4);
  // Lv5：玻璃淨水高塔、小水壩、水資源教室
  if(lv>=5){ glassTower(.6,-2.55); beam([.6,.3,-2.0],[.95,.3,-1.75],.07,P.main,10); dam(-3.75,-.55); classroom(-1.3,2.75); lamp(-.4,3.0); }
  if(lv<3) tree(1.95,1.85,.7); if(lv<5) bush(-.1,1.8,.75,'#c77dff'); tree(-2.0,-1.8,.8);
  tree(2.4,-2.4,.7,'#6fc463');
}
export const WATER_MAP=[0,1,3,5];   // 家長 2026-11-11 12:41 改成 3 級：新 Lv1＝舊 Lv1、新 Lv2＝舊 Lv3、新 Lv3＝舊 Lv5
export const WATER_LV=[1,2,3].map(l=>['water'+(l>1?l:''),'自來水廠 Lv'+l,()=>water(WATER_MAP[l]),'whole']);
