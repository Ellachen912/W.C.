/* Winston City 第二階段：夜市（美食區，整格，2 級；家長 2026-11-19 07:03「好，直接兩級就好」）
   台灣夜市：柏油地面＋白色停車格線、紅燈籠、一串串小燈泡、紅色塑膠板凳和折疊桌；不放門框招牌，入口兩排紅燈籠。
   攤子用家長 11-18 傳的 Sketchfab「MiniCity Taiwan」夜市攤（CC-BY-4.0，作者 Max｜MiniCity Taiwan），
   減面＋貼圖縮 512，放在 models/sk/nm_*.glb：
     nm_crepe 捲樂思可麗餅、nm_sausage 老六大腸包小腸、nm_squid 魷魚王、nm_rice 方家雞肉飯、nm_ball 地瓜球、
     nm_balloon 射氣球攤、nm_nine 九宮格、nm_food 一桌台灣小吃（Taiwanese Food 01）
   Lv1 小夜市：一條走道，左右 4 攤吃的＋後面射氣球攤；前面兩組桌椅；頭上燈泡串和紅燈籠。
   Lv2 大夜市：再加雞肉飯攤、九宮格、撈金魚池（小魚會游）、中間長桌擺滿小吃、更多燈籠。
   座標：格子中心為原點、正門朝 +z；平頂六角形，|x| ≤ 3.78 − |z|/√3。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, hexPad, canvasTex, anims, tree } from './lib.js';
import { kit } from './s1_kit.js';
import { plasticStool } from './stool.js';

const RED='#d8322a', GOLD='#e9b949', POLE='#4a4f5a', S=.55;   // S：攤子模型統一縮放（攤子寬約 1.2）
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
/* 網路模型預設是「金屬」材質，沒有環境光時會很暗 → 關掉金屬感 */
const unmetal=o=>o.traverse(m=>{ if(!m.isMesh) return; m.castShadow=false;   /* 11-25 家長：夜市太卡，下載的攤位模型不投影子（地上還是收得到影子） */ const f=mm=>{ const c=mm.clone(); c.metalness=0; c.roughness=Math.max(.6,c.roughness||0); return c; }; m.material=Array.isArray(m.material)?m.material.map(f):f(m.material); });
const H={ chicken:2.39, crepe:3.16, sausage:2.92, squid:2.50, rice:2.62, ball:2.50, nine:1.93, balloon:2.03 };   // 原始高度
function game(k,x,z,rot){ kit(`models/sk/nm_${k}.glb`,x,z,{h:H[k]*S,rot,y0:.1,then:unmetal}); }   /* 遊戲攤（射氣球、九宮格）維持原本的模型 */
/* 家長 11-26 14:26：吃的攤子（下載模型）拿掉，自己畫台灣夜市的不鏽鋼推車，盡量像原本的：
   四個輪子、不鏽鋼櫃子、正面彩色大字招牌、上面玻璃展示櫃、檯面擺吃的、頂上遮棚和招牌、小燈泡。射氣球、九宮格、撈魚還是原本的 */
const CART={ crepe:['可麗餅','#e57aa0','#fff4f7'], sausage:['烤香腸','#c8282c','#fff4e0'], squid:['炸魷魚','#e8792b','#fff6e6'],
  ball:['地瓜球','#f2c230','#7a3a10'], rice:['雞肉飯','#2f8a4a','#fffbe8'], chicken:['鹽水雞','#2b7fa3','#ffffff'] };
const STEEL=mat('#c9ced6',{metalness:.35,roughness:.4}), STEEL2=mat('#9aa1ab',{metalness:.3,roughness:.5}), TIRE=mat('#24262b'), GLASS=new THREE.MeshStandardMaterial({color:'#dff3ff',transparent:true,opacity:.28,roughness:.1,depthWrite:false});
const signTex=(txt,bg,fg,w=512,h=160)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.fillStyle=bg; g.fillRect(0,0,w,h);
  g.strokeStyle=fg; g.globalAlpha=.5; g.lineWidth=8; g.strokeRect(10,10,w-20,h-20); g.globalAlpha=1; g.fillStyle=fg; g.font=`900 ${Math.round(h*.62)}px "PingFang TC","Noto Sans TC",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,w/2,h/2+4);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
function plate(tex,w,h,x,y,z,parent,ry=0){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.8})); m.position.set(x,y,z); m.rotation.y=ry; parent.add(m); return m; }
function cartFood(k,g,W){ const y=.62;
  if(k==='sausage'){ rbox(W*.5,.03,.3,'#2a2a2e',-W*.18,y,.05,.005,g); for(let i=0;i<7;i++){ const c=cyl(.025,.025,.2,'#8a3a22',-W*.38+i*.065,y+.05,.05,8,g); c.rotation.x=Math.PI/2; } }
  if(k==='squid'){ rbox(W*.5,.02,.3,'#b9bec6',-W*.18,y,.05,.005,g); for(let i=0;i<5;i++){ const q=rbox(.08,.015,.2,'#f0a040',-W*.36+i*.09,y+.025,.05,.005,g); q.rotation.y=(i%2?.25:-.2); } }
  if(k==='ball'){ rbox(W*.42,.05,.3,'#d8c49a',-W*.18,y,.05,.01,g); for(let i=0;i<14;i++) sphere(.035,'#f0b23a',-W*.36+(i%7)*.06,y+.08+(i>6?.03:0),.05+((i%2)-.5)*.1,{},g); }
  if(k==='crepe'){ rbox(W*.42,.12,.12,'#b9bec6',-W*.18,y,.1,.01,g); for(let i=0;i<5;i++){ const c=cyl(.04,.005,.18,'#e2b06a',-W*.34+i*.08,y+.1,.1,10,g); c.rotation.x=Math.PI; c.position.y=y+.22; sphere(.042,i%2?'#f6f0e4':'#e57aa0',-W*.34+i*.08,y+.3,.1,{},g); } }
  if(k==='rice'){ for(let i=0;i<4;i++){ const x=-W*.36+i*.12; cyl(.05,.035,.04,'#f4f4f0',x,y,.08,14,g); cyl(.045,.045,.012,'#fbf8ee',x,y+.04,.08,14,g); rbox(.05,.012,.03,'#e0a050',x,y+.05,.08,.004,g); } }
  if(k==='chicken'){ for(const [i,c] of [[0,'#7cc24a'],[1,'#f2d7a0'],[2,'#e8b45a'],[3,'#5fae3a']]){ const x=-W*.36+i*.12; rbox(.1,.03,.16,'#b9bec6',x,y,.05,.005,g); for(let j=0;j<3;j++) sphere(.022,c,x+(j-1)*.03,y+.045,.05+(j%2)*.03,{},g); } } }
function stall(k,x,z,rot){ const [nm,bg,fg]=CART[k]||CART.ball, W=1.15, D=.55, g=grp(x,.1,z,rot);
  for(const sx of [-1,1]) for(const sz of [-1,1]){ const w=cyl(.07,.07,.05,TIRE,sx*(W/2-.12),.07,sz*(D/2-.08),14,g); w.rotation.z=Math.PI/2; }   // 輪子
  rbox(W,.48,D,STEEL,0,.1,0,.015,g); rbox(W+.04,.03,D+.04,STEEL2,0,.58,0,.006,g);   // 不鏽鋼櫃子、檯面
  plate(signTex(nm,bg,fg),W-.06,.36,0,.34,D/2+.004,g);                               // 正面大字招牌
  { const gw=W*.48, gx=W/2-gw/2-.04, gz=-.05; rbox(gw,.02,D*.8,STEEL2,gx,.61,gz,.004,g);   // 玻璃展示櫃
    const gl=new THREE.Mesh(new THREE.BoxGeometry(gw,.3,D*.8),GLASS); gl.position.set(gx,.78,gz); g.add(gl);
    for(const sx of [-1,1]) for(const sz of [-1,1]) cyl(.01,.01,.3,STEEL2,gx+sx*(gw/2),.63,gz+sz*(D*.4),6,g);
    rbox(gw,.015,D*.8,STEEL2,gx,.93,gz,.004,g);
    const cs=[bg,'#f0b23a','#7cc24a','#e8792b']; for(let i=0;i<6;i++) rbox(.09,.05,.09,cs[i%4],gx-gw/2+.1+(i%3)*.15,.63+(i>2?.15:0),gz+(i%2?.05:-.05),.01,g); }
  cartFood(k,g,W);
  for(const sx of [-1,1]) cyl(.018,.018,.8,STEEL2,sx*(W/2-.03),.6,-D/2+.04,8,g);           // 遮棚柱子
  rbox(W+.12,.04,D+.1,bg,0,1.4,0,.01,g);                                                     // 遮棚
  { const sg=plate(signTex(nm,'#fff8e8',bg,512,140),W*.8,.22,0,1.56,-D/2+.06,g); rbox(W*.82,.25,.03,bg,0,1.43,-D/2+.04,.006,g); }   // 頂上招牌
  for(let i=0;i<4;i++) sphere(.03,mat('#fff3c4',{emissive:new THREE.Color('#ffd27a'),emissiveIntensity:.6}),-W/2+.15+i*(W-.3)/3,1.37,D/2,{},g);   // 小燈泡
  cyl(.06,.06,.22,'#d8322a',-W/2-.1,.1,-D/2+.1,12,g);                                        // 瓦斯桶
}

/* 地面：深灰柏油＋白色停車格線＋外圈紅磚 */
const asphalt=canvasTex((g,s)=>{ g.fillStyle='#55585e'; g.fillRect(0,0,s,s); let r=9; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let i=0;i<2500;i++){ g.fillStyle=`rgba(${R()<.5?'30,30,34':'140,140,145'},${R()*.35})`; g.fillRect(R()*s,R()*s,2,2); } },256);
function ground(){ const t=asphalt.clone(); t.needsUpdate=true; t.repeat.set(4,4); hexPad(new THREE.MeshStandardMaterial({map:t,roughness:.95}),.42,.07,0);
  const W=mat('#f2f0e8',{roughness:.8});
  for(const [x,z,w,d] of [[0,-1.65,1.9,.04],[-.95,-1.9,.04,.5],[.95,-1.9,.04,.5],[0,2.75,1.8,.04]]) { const m=add(new THREE.Mesh(new THREE.BoxGeometry(w,.006,d),W)); m.position.set(x,.1,z); }
  for(let k=-3;k<=3;k++){ const m=add(new THREE.Mesh(new THREE.BoxGeometry(.09,.006,.3),mat('#f6d24a'))); m.position.set(0,.1,k*.7+.1); }   // 走道中間黃色虛線
}
/* 紅色塑膠板凳、折疊桌（台灣路邊攤的那種） */
/* 圓凳：家長下載的「乒乓球杯靶｜圓凳」（CC-BY-4.0，MiniCity Taiwan；減到約 800 面），以粉紅為主、混幾張藍色 */
const STOOLC={pink:'#c7798c', blue:'#6b87a6'};   // 家長 11-19 10:56：原本太刺眼 → 降低彩度和亮度；不要黃色
function stool(x,z,c='pink',ry=0){ kit('models/sk/nm_stool.glb',x,z,{h:.22,y0:.1,rot:ry,then:o=>o.traverse(m=>{ if(!m.isMesh) return; m.material=m.material.clone(); m.material.metalness=0; if(STOOLC[c]) m.material.color.set(STOOLC[c]); })}); }
/* 塑膠椅：自己畫的（stool.js，家長 11-19 11:06 同意，不用網路上 ND 授權的模型） */
function pchair(x,z,ry=0){ const st=plasticStool('#2f9a4a'); st.position.set(x,.1,z); st.rotation.y=ry; st.scale.setScalar(.8); ROOT.add(st); }
function table(x,z,w=.7,d=.45,ry=0,n=4,chairs=false){ const g=grp(x,.1,z,ry); rbox(w,.03,d,'#eef0f2',0,.32,0,.006,g); rbox(w+.02,.025,d+.02,'#c9ced6',0,.3,0,.004,g);
  for(const sx of [-1,1]) for(const sz of [-1,1]) cyl(.012,.012,.3,'#9aa0aa',sx*(w/2-.05),0,sz*(d/2-.05),6,g);
  const spots=n>=6?[[-w/3,-1],[0,-1],[w/3,-1],[-w/3,1],[0,1],[w/3,1]]:[[-w/4,-1],[w/4,-1],[-w/4,1],[w/4,1]];
  spots.forEach(([sx,s],i)=>{ const p=new THREE.Vector3(sx,0,s*(d/2+.16)).applyAxisAngle(new THREE.Vector3(0,1,0),ry); pchair(x+p.x,z+p.z,ry+(s>0?Math.PI:0)); /* 用餐區全部用綠色塑膠椅（家長 10:56） */ });
  // 桌上：一碗麵、一杯飲料
  cyl(.06,.04,.05,'#f5efe2',x,.42,z,12); cyl(.055,.055,.005,'#d99a4a',x,.465,z,12); cyl(.025,.022,.09,'#f2b24a',x+.15,.42,z+.06,8); }
/* 紅燈籠：發光的紅球＋金色上下蓋＋流蘇 */
const lanternM=mat(RED,{emissive:new THREE.Color('#ff3a1a'),emissiveIntensity:.55,roughness:.6}), capM=mat(GOLD,{roughness:.4});
function lantern(x,y,z,s=1){ const l=add(new THREE.Mesh(new THREE.SphereGeometry(.1*s,12,10),lanternM)); l.position.set(x,y,z); l.scale.set(1,.85,1);
  for(const k of [-1,1]){ const c=add(new THREE.Mesh(new THREE.CylinderGeometry(.05*s,.06*s,.025*s,10),capM)); c.position.set(x,y+k*.085*s,z); }
  const t=add(new THREE.Mesh(new THREE.CylinderGeometry(.008*s,.02*s,.09*s,6),capM)); t.position.set(x,y-.14*s,z); }
/* 燈泡串：兩根竿子之間垂下來的電線＋一顆顆暖黃燈泡（遊戲裡會一閃一閃） */
const bulbMs=[0,1,2].map(()=>mat('#fff1b8',{emissive:new THREE.Color('#ffd36a'),emissiveIntensity:.9})), wireM=mat('#2b2b2b');
const BULBS=[];
function lights(a,b,sag=.25,n=10,lant=0){ const A=new THREE.Vector3(...a), B=new THREE.Vector3(...b), pts=[];
  for(let i=0;i<=16;i++){ const t=i/16, p=A.clone().lerp(B,t); p.y-=Math.sin(t*Math.PI)*sag; pts.push(p); }
  const w=add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.006,4),wireM));
  for(let i=1;i<n;i++){ const t=i/n, p=A.clone().lerp(B,t); p.y-=Math.sin(t*Math.PI)*sag;
    if(lant&&i%lant===0) lantern(p.x,p.y-.13,p.z,.8); else { const m=add(new THREE.Mesh(new THREE.SphereGeometry(.028,8,6),bulbMs[i%3])); m.position.copy(p); m.position.y-=.03; BULBS.push(m); } } }
function pole(x,z,h=1.9){ cyl(.03,.035,h,POLE,x,.1,z,8); cyl(.07,.08,.04,POLE,x,.1,z,10); return [x,.1+h,z]; }
/* 撈魚攤：家長下載的「撈魚攤｜水台」＋「水桶」（CC-BY-4.0，MiniCity Taiwan），旁邊幾張圓凳 */
function goldfish(x,z){ kit('models/sk/nm_fish.glb',x,z,{w:1.31*S*1.15,y0:.1,then:unmetal});
  kit('models/sk/nm_bucket.glb',x+.52,z+.1,{h:.14,y0:.1,then:unmetal}); kit('models/sk/nm_bucket.glb',x+.55,z-.15,{h:.14,y0:.1,rot:1,then:unmetal});
  for(const [dx,dz,c] of [[-.25,.42,'pink'],[.05,.44,'blue'],[.33,.42,'pink'],[-.25,-.42,'blue'],[.15,-.43,'pink']]) stool(x+dx,z+dz,c); }
function nightmarket(lv){ BULBS.length=0;
  ground();
  // 兩旁的攤子（左邊朝右、右邊朝左），後面是遊戲攤（朝前）
  stall('crepe',-2.0,-1.05,Math.PI/2); stall('sausage',-2.0,.5,Math.PI/2);
  stall('squid',2.0,-1.05,-Math.PI/2); stall('ball',2.0,.5,-Math.PI/2);
  game('balloon',lv>=2?-.65:0,-2.35,0);
  table(-.45,1.75,.7,.45,0); table(.55,2.35,.7,.45,0);
  if(lv>=2){
    game('nine',.45,-2.35,0);
    stall('rice',-1.95,1.95,Math.PI/2);                                       // 雞肉飯攤（自己帶兩張紅板凳）
    goldfish(0,-1.2);                                                         // 撈魚攤放在走道中間
    stall('chicken',1.95,1.95,-Math.PI/2);                                   // 鹽水雞攤（家長下載）
    // 中間長桌擺滿小吃
    { const g=grp(0,.1,.55,0); rbox(1.5,.035,.5,'#eef0f2',0,.34,0,.006,g); for(const sx of [-.68,.68]) for(const sz of [-.2,.2]) cyl(.014,.014,.33,'#9aa0aa',sx,0,sz,6,g);
      for(let i=0;i<4;i++) for(const s of [-1,1]) pchair(-.55+i*.37,.55+s*.42,s>0?Math.PI:0);
      kit('models/sk/nm_food.glb',0,0,{w:1.35,y0:.375,parent:g,then:unmetal}); }
  }
  // 燈泡串、紅燈籠（入口兩排燈籠代替招牌）
  const P=[pole(-1.15,2.85),pole(1.15,2.85),pole(-1.15,-1.85),pole(1.15,-1.85)];
  lights(P[0],P[2],.3,14,2); lights(P[1],P[3],.3,14,2);
  lights(P[0],P[1],.15,8,2); lights(P[2],P[3],.15,8,2);
  if(lv>=2){ lights(P[0],P[3],.35,16,3); lights(P[1],P[2],.35,16,3); const Q=[pole(-2.6,-.3,1.7),pole(2.6,-.3,1.7)]; lights(Q[0],P[0],.25,10,2); lights(Q[1],P[1],.25,10,2); lights(Q[0],P[2],.25,10,2); lights(Q[1],P[3],.25,10,2); }
  anims.push(t=>{ bulbMs.forEach((m,i)=>{ m.emissiveIntensity=.6+.35*Math.sin(t*2+i*2.1); }); });   // 燈泡一閃一閃
  for(const [x,z] of [[-2.9,-1.3],[2.9,-1.3]]) tree(x,z,.5);
}

export const NIGHT_LV=[['nightmarket','夜市 Lv1 小夜市',()=>nightmarket(1),'whole'],['nightmarket2','夜市 Lv2 大夜市',()=>nightmarket(2),'whole']], NIGHT_TOP=[0,2.4,2.6];
