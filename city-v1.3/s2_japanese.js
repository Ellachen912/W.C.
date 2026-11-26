/* Winston City 第二階段：日式料理店（美食區，半格，一級，6 顆；家長 11-19 11:26～13:00）
   日式老街的木造兩層町家：
   - 深褐木頭＋白灰泥牆、一樓木格子窗、二樓木格子窗＋小欄杆；深灰日式瓦屋頂（一樓上方一圈小屋簷＋頂上四坡屋頂），屋脊兩端魚形瓦飾。
   - 門口：藍染暖簾（三片，白色魚圖案，不寫字）、兩盞紅燈籠、捲起來的竹簾；屋簷下掛風鈴（家長傳的 Furin 模型，自己加擺動）。
   - 門邊玻璃食物樣品櫥窗（家長 11:26：日式料理店的樣品要放在玻璃櫥窗裡）：拉麵、壽司拼盤、鮭魚壽司盤（家長傳的模型）、握壽司（Food Pack）。
   - 二樓角落掛霓虹壽司招牌（Neon Sushi Sign，晚上會亮）。
   - 門前踏腳石、左邊一片竹林（花台＋矮竹籬）、松樹盆栽；（11-19 13:38 家長：白砂、石燈籠、竹筒流水拿掉）右邊日式販賣機；門邊一個草繩酒樽（自己畫）。
   尺寸照 11-19 的美食店規則：房子本體寬約 2.7、高約 2.3；半格建築背面收在 z≈-1.25，不跟另一半背靠背。
   座標同麵包店的半格：建地中心為原點、正門朝 +z。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, tiledHip, canvasTex, anims } from './lib.js';
import { kit, FOOD } from './s1_kit.js';
import { food } from './food_mini.js';   // 家長 11-25：櫥窗食物改成自己畫的簡單形狀（比模型省力）

const WOODD='#4a2f1f', WOOD='#7a4e30', WOODL='#a8784e', PLASTER='#efe9dc', TILE='#5d636b', INDIGO='#2c3e66', STONE='#b9b4aa', STONE2='#9d978c', SAND='#ece6d6';
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; }
const unmetal=o=>o.traverse(m=>{ if(!m.isMesh) return; if(!m.geometry.attributes.normal) m.geometry.computeVertexNormals(); const f=mm=>{ if(mm.isMeshBasicMaterial) return new THREE.MeshStandardMaterial({map:mm.map,color:mm.color,roughness:.6}); const c=mm.clone(); c.metalness=0; if('transmission' in c){ c.transmission=0; } if(c.transparent&&c.opacity<.3){ c.opacity=.85; } c.roughness=Math.max(.5,c.roughness||0); return c; }; m.material=Array.isArray(m.material)?m.material.map(f):f(m.material); });

/* 地面：深灰石板（大塊、深淺不同） */
const floorTex=rectTex(256,256,(g,W,H)=>{ g.fillStyle='#7f7c76'; g.fillRect(0,0,W,H); const C=['#a7a39b','#9d998f','#b2aea6','#959187'];
  for(let j=0;j<4;j++) for(let i=0;i<3;i++){ g.fillStyle=C[(i+j*2)%4]; const x=i*86+(j%2?43:0), y=j*64; g.fillRect(x+2,y+2,82,60); g.fillRect(x+2-258,y+2,82,60); } });
/* 白砂：一條條耙出來的波紋 */
const sandTex=rectTex(256,256,(g,W,H)=>{ g.fillStyle=SAND; g.fillRect(0,0,W,H); g.strokeStyle='rgba(150,140,120,.35)'; g.lineWidth=2;
  for(let y=6;y<H;y+=12){ g.beginPath(); g.moveTo(0,y); for(let x=0;x<=W;x+=8) g.lineTo(x,y+Math.sin(x/40)*2); g.stroke(); } });
/* 灰泥牆：淡淡斑駁 */
const plasterTex=rectTex(256,256,(g,W,H)=>{ g.fillStyle=PLASTER; g.fillRect(0,0,W,H); let r=7; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let i=0;i<150;i++){ g.fillStyle=R()<.5?`rgba(150,140,120,${R()*.08})`:`rgba(255,255,250,${R()*.12})`; g.beginPath(); g.ellipse(R()*W,R()*H,6+R()*30,4+R()*14,R()*3,0,7); g.fill(); } });
const plasterMat=(w,h)=>{ const t=plasterTex.clone(); t.needsUpdate=true; t.repeat.set(Math.max(1,w/1.2),Math.max(1,h/1.2)); return new THREE.MeshStandardMaterial({map:t,roughness:.9}); };
/* 暖簾：靛藍布＋白色魚圖案＋下緣白邊 */
const norenTex=rectTex(128,256,(g,W,H)=>{ g.fillStyle=INDIGO; g.fillRect(0,0,W,H); g.fillStyle='rgba(255,255,255,.9)';
  g.beginPath(); g.ellipse(W/2,H*.42,W*.26,H*.08,0,0,7); g.fill(); g.beginPath(); g.moveTo(W*.78,H*.42); g.lineTo(W*.95,H*.34); g.lineTo(W*.95,H*.5); g.closePath(); g.fill();
  g.fillStyle=INDIGO; g.beginPath(); g.arc(W*.36,H*.41,4,0,7); g.fill(); g.fillStyle='rgba(255,255,255,.35)'; g.fillRect(0,H-10,W,4); });

function halfPad(inset=.18,y=0,h=.09){ const R=4.2, Hh=Math.sqrt(3)*R, oz=-Hh*.24, s=new THREE.Shape(); const hw=z=>R-(z-oz)/(Hh/2)*(R/2);
  const z0=oz+inset, z1=oz+Hh/2-inset; [[-(hw(z0)-inset),z0],[hw(z0)-inset,z0],[hw(z1)-inset,z1],[-(hw(z1)-inset),z1]].forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z)); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2);
  const t=floorTex.clone(); t.needsUpdate=true; t.repeat.set(1.2,1.2);
  const m=add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:t,roughness:.9}))); m.position.y=y; m.receiveShadow=true; return m; }

/* 木格子（縱向細木條） */
function koshi(w,h,x,y,z,n=null,parent){ const g=grp(x,y,z,0,parent); rbox(w,h,.02,mat('#ffe7c2',{emissive:new THREE.Color('#ffc98a'),emissiveIntensity:.25}),0,0,-.02,.002,g);
  const k=n||Math.round(w/.05); for(let i=0;i<=k;i++) rbox(.018,h,.03,WOODD,-w/2+i*w/k,0,.0,.002,g);
  rbox(w+.04,.035,.04,WOODD,0,0,.005,.003,g); rbox(w+.04,.035,.04,WOODD,0,h-.035,.005,.003,g); return g; }
/* 屋簷下的木椽：一排小方塊 */
function rafters(w,x,y,z){ for(let i=0;i<Math.round(w/.12);i++) rbox(.035,.035,.18,WOODD,x-w/2+.06+i*.12,y,z,.002); }
/* 魚形瓦飾（鯱）：一條往上翹的魚 */
function shachi(x,y,z,s){ const g=grp(x,y,z,0); const b=sphere(.07,mat('#3d4249',{roughness:.4}),0,.08,0,{},g); b.scale.set(.7,1.3,.7);
  const t=add(new THREE.Mesh(new THREE.ConeGeometry(.06,.12,4),mat('#3d4249')),g); t.position.set(s*.03,.2,0); t.rotation.z=-s*.5;
  sphere(.012,mat('#e9b949'),-s*.03,.1,.04,{},g); sphere(.012,mat('#e9b949'),-s*.03,.1,-.04,{},g); }
/* 紅燈籠（提燈）：上下黑框＋紅色發光 */
const chochinM=mat('#c8322a',{emissive:new THREE.Color('#ff4a2a'),emissiveIntensity:.45,roughness:.6});
function chochin(x,y,z){ const l=sphere(.09,chochinM,x,y,z); l.scale.set(1,1.35,1); cyl(.055,.055,.03,'#1f1f22',x,y+.1,z,10); cyl(.055,.055,.03,'#1f1f22',x,y-.13,z,10); cyl(.008,.008,.12,'#1f1f22',x,y+.13,z,4);
  for(let i=0;i<5;i++){ const r=add(new THREE.Mesh(new THREE.TorusGeometry(.085-Math.abs(i-2)*.012,.003,4,16),mat('#7a1a14'))); r.rotation.x=Math.PI/2; r.position.set(x,y-.06+i*.04,z); } }
/* 竹筒流水（鹿威し）：竹筒會慢慢往下點頭、倒水再彈回來 */
function shishiOdoshi(x,z){ const g=grp(x,.09,z,-.5); rbox(.34,.08,.22,STONE2,0,0,0,.03,g); rbox(.26,.02,.16,mat('#4b6f86',{roughness:.1}),0,.08,0,.003,g);
  for(const s of [-1,1]) cyl(.015,.015,.28,'#9a8a4a',.0,0,s*.09,6,g);
  const piv=grp(0,.27,0,0,g); const tube=add(new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.42,10),mat('#b9a85c',{roughness:.6})),piv); tube.rotation.z=Math.PI/2; tube.position.x=.05;
  for(const xx of [-.1,.12]){ const n=add(new THREE.Mesh(new THREE.TorusGeometry(.026,.005,4,10),mat('#8f7f3f')),piv); n.rotation.y=Math.PI/2; n.position.x=xx; }
  const sp=cyl(.015,.015,.3,'#b9a85c',-.25,.26,0,8,g); sp.rotation.z=1.2;   // 進水的細竹管
  anims.push(t=>{ const c=(t%4)/4; piv.rotation.z=c<.82?-.12+c*.25:(.09-(c-.82)*2.6); }); }
/* 石燈籠 */
function toro(x,z){ const g=grp(x,.09,z,0); rbox(.24,.05,.24,STONE2,0,0,0,.01,g); cyl(.05,.06,.3,STONE,0,.05,0,8,g); rbox(.2,.05,.2,STONE2,0,.35,0,.01,g);
  rbox(.15,.13,.15,STONE,0,.4,0,.01,g); rbox(.07,.07,.16,mat('#ffe7b0',{emissive:new THREE.Color('#ffc870'),emissiveIntensity:.6}),0,.43,.0,.004,g);
  const r=add(new THREE.Mesh(new THREE.ConeGeometry(.19,.1,4),mat(STONE2,{flatShading:true})),g); r.position.y=.58; r.rotation.y=Math.PI/4; sphere(.03,STONE,0,.65,0,{},g); }
/* 竹子：幾根有節的竹竿＋細葉 */
function bamboo(x,z){ for(let i=0;i<5;i++){ const bx=x+(i%3-1)*.08, bz=z+(i>2?.06:-.04), h=1.1+i*.12; cyl(.016,.018,h,'#7aa04a',bx,.09,bz,6);
    for(let k=1;k<5;k++) cyl(.02,.02,.01,'#5f8a38',bx,.09+k*h/5,bz,6);
    for(let k=0;k<3;k++){ const l=sphere(.09,mat('#6fa654',{flatShading:true}),bx+(k-1)*.06,.09+h-.05*k,bz+(k%2?.04:-.04)); l.scale.set(1.2,.35,.6); } } }
/* 松樹盆栽 */
function bonsai(x,z){ rbox(.26,.1,.18,'#3b4a5a',x,.09,z,.01); const tr=cyl(.02,.03,.24,'#6b4a2e',x,.19,z,6); tr.rotation.z=.3;
  for(const [dx,dy,r] of [[-.08,.38,.09],[.06,.32,.08],[-.02,.46,.07]]){ const p=sphere(r,mat('#3f6e3a',{flatShading:true}),x+dx,dy,z); p.scale.y=.45; } }
/* 草繩酒樽（自己畫）：米色樽身＋草繩紋＋紅色標籤 */
function sakeBarrel(x,z){ cyl(.11,.11,.2,'#d9c79a',x,.09,z,14); for(const y of [.12,.2,.27]){ const r=add(new THREE.Mesh(new THREE.TorusGeometry(.112,.008,4,18),mat('#a8925a'))); r.rotation.x=Math.PI/2; r.position.set(x,y,z); }
  cyl(.112,.112,.01,'#c9b680',x,.29,z,14); rbox(.07,.1,.005,'#b4332a',x,.14,z+.11,.002); }

function japanese(){ halfPad();
  const Y=.1, W=2.7, D=1.3, h1=1.0, h2=.78, cx=-.15, cz=-.45, fz=cz+D/2;   // 牆背面 -1.1，屋頂背緣約 -1.26（半格背面留空，不跟另一半背靠背）
  // 石頭基座
  rbox(W+.1,.1,D+.08,STONE2,cx,Y,cz,.02);
  // 一樓：下半木板腰牆＋上半灰泥
  rbox(W,h1,D,plasterMat(W,h1),cx,Y+.1,cz,.01);
  rbox(W+.01,.32,D+.01,WOOD,cx,Y+.1,cz,.005); for(let i=0;i<Math.round(W/.09);i++) rbox(.012,.3,.012,WOODD,cx-W/2+.05+i*.09,Y+.11,fz+.006,.001);
  for(const x of [cx-W/2+.03,cx+W/2-.03,cx-.2,cx+.62]) rbox(.07,h1,.07,WOODD,x,Y+.1,fz+.01,.005);    // 柱子
  rbox(W+.04,.07,.07,WOODD,cx,Y+.1+h1-.07,fz+.01,.005);                                             // 樑
  // 一樓左：食物樣品玻璃櫥窗
  { const sx=cx-.85, sw=1.05, sh=.62, sy=Y+.38; const g=grp(sx,sy,fz+.02);
    rbox(sw+.08,.06,.26,WOODD,0,-.06,.1,.005,g); rbox(sw+.08,.06,.26,WOODD,0,sh,.1,.005,g); for(const s of [-1,1]) rbox(.05,sh+.06,.26,WOODD,s*(sw/2+.015),-.03,.1,.005,g);   /* 只有木框，裡面看得到 */ rbox(sw,sh,.02,mat('#fff3e0',{emissive:new THREE.Color('#ffdcaa'),emissiveIntensity:.6}),0,0,-.0,.003,g);
    rbox(sw,.03,.2,WOODL,0,.02,.1,.003,g); rbox(sw,.03,.2,WOODL,0,.3,.1,.003,g);
    rbox(sw,sh,.01,new THREE.MeshStandardMaterial({color:'#e8f4f6',transparent:true,opacity:.2,roughness:.05}),0,0,.21,.002,g);
    rbox(.025,sh,.025,WOODD,0,0,.21,.002,g);
    food('ramen',-.3,.1,{w:.3,y0:.05,parent:g}); food('platter',.25,.08,{w:.36,y0:.05,parent:g});
    food('sushiPlate',-.28,.1,{w:.24,y0:.33,parent:g}); food('nigiri',.1,.1,{w:.12,y0:.33,parent:g}); food('roll',.32,.1,{w:.1,y0:.33,parent:g});
    for(const [x,y] of [[-.3,.05],[.25,.05],[-.28,.33],[.2,.33]]) rbox(.07,.03,.005,'#ffffff',x,y+.01,.2,.001,g); }   // 白色小價格牌
  // 一樓中：入口（拉門＋暖簾）
  { const dx=cx+.21; rbox(.7,.82,.03,WOODD,dx,Y+.1,fz+.005,.004); koshi(.6,.74,dx,Y+.13,fz+.045,10);
    for(let i=0;i<3;i++){ const n=new THREE.Mesh(new THREE.PlaneGeometry(.21,.4),new THREE.MeshStandardMaterial({map:norenTex,side:THREE.DoubleSide,roughness:.9})); n.position.set(dx-.22+i*.22,Y+.86,fz+.12); add(n); }
    rbox(.74,.025,.025,WOODL,dx,Y+1.06,fz+.12,.002);   // 暖簾的橫桿
    rbox(.74,.04,.2,STONE,dx,Y+.06,fz+.14,.004); }
  // 一樓右：木格子窗＋捲起來的竹簾
  koshi(.42,.5,cx+1.0,Y+.42,fz+.02,9); cyl(.03,.03,.46,'#c9a86a',cx+1.0,Y+.88,fz+.06,8).rotation.z=Math.PI/2;
  chochin(cx-.18,Y+.82,fz+.2); chochin(cx+.6,Y+.82,fz+.2);
  // 一樓上方的小屋簷（瓦）＋木椽
  { const eg=new THREE.BufferGeometry(), ew=W+.3, ez0=fz-.02, ez1=fz+.42, ey0=Y+.1+h1+.12, ey1=Y+.1+h1-.04;
    eg.setAttribute('position',new THREE.Float32BufferAttribute([-ew/2,ey0,ez0, ew/2,ey0,ez0, ew/2,ey1,ez1, -ew/2,ey1,ez1],3)); eg.setAttribute('uv',new THREE.Float32BufferAttribute([0,0, ew*2,0, ew*2,.9, 0,.9],2)); eg.setIndex([0,2,1,0,3,2]); eg.computeVertexNormals();
    const tm=tiledHip(.01,.01,.01,TILE,0,-9,0).material; const e=add(new THREE.Mesh(eg,tm)); e.position.x=cx; e.castShadow=true;
    rbox(ew,.04,.05,'#3d4249',cx,ey1-.02,ez1,.004); rafters(ew-.1,cx,ey1-.06,ez1-.12); }
  // 二樓（稍微往後縮）：灰泥＋木格子窗＋小欄杆
  const y2=Y+.1+h1, D2=D-.25, cz2=cz-.1, fz2=cz2+D2/2;
  rbox(W-.1,h2,D2,plasterMat(W,h2),cx,y2,cz2,.01);
  for(const x of [cx-W/2+.08,cx+W/2-.08]) rbox(.06,h2,.06,WOODD,x,y2,fz2+.01,.004);
  koshi(.9,.42,cx-.55,y2+.2,fz2+.02,14); koshi(.9,.42,cx+.6,y2+.2,fz2+.02,14);
  rbox(W-.2,.03,.08,WOODD,cx,y2+.16,fz2+.12,.003); for(let i=0;i<Math.round((W-.2)/.1);i++) rbox(.015,.12,.015,WOODD,cx-(W-.2)/2+.05+i*.1,y2+.04,fz2+.14,.001);   // 欄杆
  // 頂上四坡瓦屋頂＋屋脊＋鯱
  const ry=y2+h2; tiledHip(W+.35,D2+.36,.5,TILE,cx,ry,cz2);
  rbox(W*.55,.07,.08,'#3d4249',cx,ry+.47,cz2,.01); for(const s of [-1,1]) shachi(cx+s*W*.27,ry+.5,cz2,s);
  rafters(W+.2,cx,ry-.03,fz2+.18);
  // 霓虹壽司招牌：二樓右邊角落，直立掛在牆外
  { const nx=cx+W/2+.08; rbox(.04,.04,.18,'#2b2b2b',nx-.03,y2+.62,fz2-.05,.004); kit('models/sk/jp_neon.glb',nx+.02,fz2-.05,{h:.72,y0:y2-.08,rot:0,then:o=>o.traverse(m=>{ if(m.isMesh&&m.material.emissive) m.material.emissiveIntensity=Math.max(.6,m.material.emissiveIntensity||0); })}); }
  // 風鈴：掛在一樓屋簷下，自己加擺動
  [cx-.9,cx+1.0].forEach((xx,i)=>{ const piv=grp(xx,Y+1.1,fz+.3);
    cyl(.004,.004,.1,'#555',0,-.1,0,4,piv);   /* 風鈴：家長給的模型太細又是骨架動畫，遊戲縮小後看不到，改成自己畫 */
    const bell=sphere(.055,new THREE.MeshStandardMaterial({color:'#cfe8f2',transparent:true,opacity:.8,roughness:.15}),0,-.15,0,{},piv); bell.scale.y=.85;
    for(const k of [0,1,2]){ const d=sphere(.012,['#c8322a','#2c5f8a','#c8322a'][k],Math.cos(k*2.1)*.05,-.15,Math.sin(k*2.1)*.05,{},piv); }
    cyl(.003,.003,.12,'#888',0,-.32,0,4,piv); const tz=rbox(.05,.12,.004,'#e8e2d0',0,-.44,0,.002,piv); rbox(.02,.08,.005,'#c8322a',0,-.42,0,.001,piv);
    anims.push(t=>{ piv.rotation.z=Math.sin(t*1.7+i*2)*.12; piv.rotation.x=Math.sin(t*1.3+i)*.06; }); });
  /* 家長 11-19 13:38：水池造景（白砂、石燈籠、竹筒流水）拿掉，多放竹子 */
  for(const [x,z] of [[cx+.21,fz+.45],[cx+.15,fz+.8],[cx+.25,fz+1.15]]){ const s=cyl(.15,.15,.04,STONE,x,.1,z,8); s.scale.set(1,1,.75); s.rotation.y=x; }   // 到門口的踏腳石
  { const bx=cx-2.1, bz=-.5, bw=1.0, bd=1.45;   /* 家長 13:40：竹林往左後方移到房子左邊，不擋櫥窗 */
    rbox(bw,.08,bd,'#4b3b2c',bx,.09,bz,.01); rbox(bw+.06,.05,bd+.06,STONE2,bx,.09,bz,.01);
    for(let i=0;i<8;i++) cyl(.012,.012,.22,'#b9a85c',bx-bw/2+.07+i*bw/7.6,.09,bz+bd/2+.02,5);   // 矮竹籬在面街那邊
    for(const y of [.17,.26]) rbox(bw,.02,.02,'#9a8a4a',bx,y,bz+bd/2+.02,.004);
    for(const [x,z] of [[-.25,-.5],[.2,-.35],[-.2,-.05],[.22,.05],[-.2,.42],[.18,.5]]) bamboo(bx+x,bz+z); }
  bamboo(cx+1.95,fz-.45);   /* 13:40 松樹盆栽拿掉 */
  // 右邊：日式販賣機、酒樽、長板凳
  kit('models/sk/jp_vend.glb',cx+1.66,fz-.05,{h:.74,y0:.09,rot:0,then:o=>{ unmetal(o); o.traverse(m=>{ if(m.isMesh) m.material.color.multiplyScalar(.85); }); }});
  sakeBarrel(cx+1.05,fz+.3); sakeBarrel(cx+1.28,fz+.26);
  { const bx=cx+1.15, bz=fz+.95; rbox(.6,.04,.18,'#c8322a',bx,.33,bz,.004); rbox(.62,.03,.2,WOOD,bx,.3,bz,.004); for(const s of [-1,1]) rbox(.04,.22,.16,WOODD,bx+s*.25,.09,bz,.004);
    const um=cyl(.012,.012,.95,'#8a5a3a',bx+.42,.09,bz-.05,6); const top=add(new THREE.Mesh(new THREE.ConeGeometry(.42,.16,16,1,true),mat('#c8322a',{side:THREE.DoubleSide,roughness:.8}))); top.position.set(bx+.42,1.1,bz-.05); }   // 紅布長板凳＋野點傘
}
export const JAPANESE_LV=[['japanese','日式料理店',japanese,'half']], JAPANESE_TOP=[0,3.0];
