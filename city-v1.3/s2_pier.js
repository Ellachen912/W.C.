/* Winston City 第二階段：碼頭（1 格，南邊海邊的交通區；家長 2026-11-18 10:40 同意規劃）
   Lv1 小漁港：木頭棧橋、小漁船、魚箱和漁網、繫船柱、漁具小倉庫
   Lv2 客運碼頭：加紅白燈塔、候船室（招牌「木星碼頭」）、白色渡輪靠岸
   Lv3 貨運港：加貨櫃起重機（吊車會慢慢來回）、一排彩色貨櫃、大貨輪；燈塔的燈會轉
   主題色：海軍藍＋白，加一點紅（燈塔、救生圈）。
   格子裡：後半是比地面高的碼頭石岸，前半挖成港池（海水），船停在港池裡。座標：格子中心為原點，正門朝 +z（前面）。
   六角格是平頂（左右尖），可用範圍約 ±3.4。 */
import * as THREE from 'three';
import { kit } from './s1_kit.js';
import { ROOT, add, rbox, cyl, sphere, mat, prism, tree, bush, anims, GOLD, glassMat, hexPad } from './lib.js';

const NAVY='#30598c', NAVYD='#244873', WHITE='#f4f1ea', RED='#d9483b', QUAY='#e3ddd1', QUAYE='#cfc6b6', WOOD='#b9875a', WOODD='#94673f', WATER='#4fb8e0';
const QH=.32;   // 碼頭石岸的高度（港池水面在 .1）
const WY=-.34;   /* 家長 11-20 07:40：港池打開和外面的海連成一片 → 水面就是海平面（index.html 的海在 y=-.7） */

function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function stick(A,B,r,c,parent){ const a=new THREE.Vector3(...A), b=new THREE.Vector3(...B), m=add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,1,8),mat(c)),parent);
  m.position.copy(a).add(b).multiplyScalar(.5); m.scale.y=a.distanceTo(b); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); return m; }
function signTex(txt,bg=NAVY){ const c=document.createElement('canvas'); c.width=512; c.height=128; const g=c.getContext('2d'); g.fillStyle=bg; g.fillRect(0,0,512,128);
  g.fillStyle='#ffffff'; const fs=Math.min(76,Math.floor(470/txt.length)); g.font=`bold ${fs}px "PingFang TC","Noto Sans CJK TC","Noto Sans TC",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,256,68);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function wallSign(txt,w,x,y,z,ry=0,parent){ const g=grp(x,y,z,ry,parent); rbox(w+.08,w/4+.08,.05,NAVYD,0,-w/8-.04,0,.02,g);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshStandardMaterial({map:signTex(txt),roughness:.8})); p.position.z=.03; g.add(p); return g; }

/* 地面：後半是碼頭石岸（高 QH），前半是港池 */
const R=4.2-.42;
function hexPts(r){ const p=[]; for(let i=0;i<6;i++){ const a=i*Math.PI/3; p.push([r*Math.cos(a),r*Math.sin(a)]); } return p; }
function ground(zEdge){   // zEdge：石岸的前緣（往前是港池）
  /* 港池不再自己畫一片水：前面整個打開，直接用地圖上的海（家長 11-20 07:40） */
  // 外圍一圈矮堤（港池邊）
  const hp1=hexPts(R-.11); for(let i=0;i<6;i++){ if(i>=3) continue;   /* 家長 11-18 12:20：前面三邊的矮堤都拿掉 */   // 前面那一邊不砌堤：港池往外開口（家長 11-18，海獅浮台延伸到格子外）
    const [ax,ay]=hp1[i], [bx,by]=hp1[(i+1)%6], A=[ax,-ay], B=[bx,-by], L=Math.hypot(B[0]-A[0],B[1]-A[1]);
    const m=rbox(L+.12,.2,.22,QUAYE,(A[0]+B[0])/2,0,(A[1]+B[1])/2,.03); m.rotation.y=-Math.atan2(B[1]-A[1],B[0]-A[0]); }
  // 碼頭石岸：六角形後半（z < zEdge）
  const q=new THREE.Shape(); const pts=[]; const hp2=hexPts(R);
  for(let i=0;i<6;i++){ const [x1,y1]=hp2[i], [x2,y2]=hp2[(i+1)%6]; const z1=-y1, z2=-y2;   // Shape 的 y＝-z
    if(z1<=zEdge) pts.push([x1,z1]); if((z1-zEdge)*(z2-zEdge)<0){ const t=(zEdge-z1)/(z2-z1); pts.push([x1+(x2-x1)*t,zEdge]); } }
  pts.forEach(([x,z],i)=>i?q.lineTo(x,-z):q.moveTo(x,-z)); q.closePath();
  const qg=new THREE.ExtrudeGeometry(q,{depth:QH,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:1}); qg.rotateX(-Math.PI/2);
  add(new THREE.Mesh(qg,mat(QUAY)));
  // 岸邊：深色岸壁＋黃色警示線＋橡膠防撞墊
  const xs=pts.filter(p=>Math.abs(p[1]-zEdge)<1e-6).map(p=>p[0]).sort((a,b)=>a-b), x0=xs[0]+.1, x1=xs[1]-.1;
  rbox(x1-x0,.025,.08,'#f2c230',(x0+x1)/2,QH+.02,zEdge-.12,.005);
  for(let x=x0+.3;x<x1-.1;x+=.7) rbox(.16,.2,.08,'#3b3550',x,QH-.24,zEdge+.04,.03);
  return {x0,x1}; }

/* 繫船柱、救生圈、路燈 */
function bollard(x,z){ cyl(.07,.08,.14,NAVYD,x,QH,z,12); cyl(.1,.1,.04,NAVYD,x,QH+.14,z,12); }
function lifeRing(x,z,ry=0){ const g=grp(x,QH,z,ry); rbox(.05,.62,.05,'#9d98ad',0,0,0,.01,g); rbox(.34,.05,.05,'#9d98ad',0,.62,0,.01,g);
  for(let i=0;i<8;i++){ const seg=add(new THREE.Mesh(new THREE.TorusGeometry(.13,.04,8,12,Math.PI/4+.02),mat(i%2?WHITE:RED)),g); seg.position.set(0,.4,.04); seg.rotation.z=i*Math.PI/4; } }
function lampQ(x,z){ cyl(.03,.045,1.0,NAVYD,x,QH,z,10); sphere(.09,'#fff3c4',x,QH+1.08,z,{emissive:0xffe08a,emissiveIntensity:.4}); const c=add(new THREE.Mesh(new THREE.ConeGeometry(.12,.1,12),mat(NAVY))); c.position.set(x,QH+1.2,z); }

/* 船殼：俯視是尖船頭的形狀，往上長；上緣一圈白邊 */
function hullGeom(L,W,H,bowK=.35){ const s=new THREE.Shape(), hl=L/2, hw=W/2, b=L*bowK;
  s.moveTo(-hl,-hw*.85); s.lineTo(hl-b,-hw); s.quadraticCurveTo(hl-b*.15,-hw*.8,hl,0); s.quadraticCurveTo(hl-b*.15,hw*.8,hl-b,hw); s.lineTo(-hl,hw*.85); s.quadraticCurveTo(-hl-.06,0,-hl,-hw*.85);
  const g=new THREE.ExtrudeGeometry(s,{depth:H,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2); return g; }
function hull(L,W,H,c,band,deck,parent){ const g=new THREE.Group(); parent.add(g);
  add(new THREE.Mesh(hullGeom(L,W,H*.55),mat(c)),g).position.y=-H*.25;
  const b=add(new THREE.Mesh(hullGeom(L,W,H*.45),mat(band)),g); b.position.y=H*.3;
  const d=add(new THREE.Mesh(hullGeom(L*.96,W*.9,.02),mat(deck)),g); d.position.set(-L*.01,H*.75+.02,0);
  return g; }
/* 讓船在水上輕輕上下晃 */
function bob(g,amp=.02,sp=1.3,ph=Math.random()*6){ const y0=g.position.y; anims.push(t=>{ g.position.y=y0+Math.sin(t*sp+ph)*amp; g.rotation.z=Math.sin(t*sp*.8+ph)*.025; }); }

/* 小漁船：藍船身、白邊、駕駛艙、桅桿掛燈泡、船上漁網 */
function fishingBoat(x,z,ry=0){ const g=grp(x,WY,z,ry); hull(1.3,.48,.32,NAVY,WHITE,'#d8c7a8',g);
  rbox(.36,.3,.34,WHITE,-.2,.2,0,.03,g); rbox(.4,.05,.38,RED,-.2,.5,0,.02,g); rbox(.3,.1,.02,'#a8dcf0',-.2,.38,.17,.01,g).material=glassMat;
  cyl(.018,.018,.75,'#e8e4dc',.12,.2,0,6,g); stick([.12,.95,0],[.55,.35,0],.006,'#e8e4dc',g); stick([.12,.95,0],[-.55,.35,0],.006,'#e8e4dc',g);
  for(let i=0;i<4;i++) sphere(.025,['#ffd25a','#ff7b7b','#7bd4ff','#9be38a'][i],.12+.1*(i+1)*.9,.95-(i+1)*.12,0,{emissive:0x553300,emissiveIntensity:.2},g);
  const net=sphere(.13,'#5a8f6a',.4,.22,0,{flatShading:true},g); net.scale.set(1.3,.5,1); rbox(.12,.06,.1,'#f2c230',.38,.3,.08,.01,g);
  bob(g,.015,1.6); return g; }
/* 魚箱：藍色塑膠箱裡放銀色的魚 */
function fishCrate(x,z,ry=0,stack=1){ const g=grp(x,QH,z,ry); for(let k=0;k<stack;k++){ rbox(.34,.14,.24,'#3d7fd0',0,k*.15,0,.02,g);
  if(k===stack-1) for(let i=0;i<3;i++){ const f=sphere(.05,'#c9d3dc',-.1+i*.1,k*.15+.14,0,{metalness:.4,roughness:.3},g); f.scale.set(1.8,.6,.8); } } }
function netPile(x,z){ const g=grp(x,QH,z); const a=sphere(.22,'#4e8a5f',0,.06,0,{flatShading:true},g); a.scale.set(1.3,.45,1); const b=sphere(.14,'#e9a23b',.18,.08,.05,{flatShading:true},g); b.scale.set(1,.5,1); for(let i=0;i<4;i++) sphere(.035,'#f2c230',-.2+i*.12,.15,.12,{},g); }
/* 漁具小倉庫：白牆、藍色斜屋頂、捲門 */
function gearShed(x,z,ry=0){ const g=grp(x,QH,z,ry);
  rbox(1.1,.7,.8,WHITE,0,0,0,.04,g); prism(1.24,.94,.36,NAVY,0,.7,0,'z',g); rbox(1.26,.05,.08,NAVYD,0,.68,.45,.01,g);
  rbox(.5,.5,.03,'#c3c8d0',-.15,0,.41,.01,g); for(let k=1;k<6;k++) rbox(.5,.012,.035,'#a7adb7',-.15,k*.085,.415,.002,g);
  rbox(.2,.2,.03,'#a8dcf0',.32,.35,.41,.01,g).material=glassMat; rbox(.26,.04,.06,NAVYD,.32,.31,.43,.01,g);
  wallSign('木星漁港',.62,.0,.62,.42,0,g); }
/* 木頭棧橋：從石岸伸進港池 */
function jetty(x,z0,len,w=.5){ for(let i=0;i<Math.round(len/.14);i++) rbox(w,.04,.12,i%2?WOOD:'#c49468',x,QH-.06,z0+.07+i*.14,.01);
  for(let k=0;k<=Math.floor(len/.7);k++) for(const s of [-1,1]) cyl(.04,.04,QH+.14-WY,WOODD,x+s*(w/2-.02),WY-.06,z0+.1+k*.7,8); }   // 橋墩一路插到水裡

/* 紅白燈塔（Lv2 起） */
function lighthouse(x,z,lv){ const g=grp(x,QH,z);
  cyl(.38,.42,.18,QUAYE,0,.025,0,24,g);   // 底座比平台（半徑 .64）小
  const H=2.2; for(let i=0;i<5;i++){ const r0=.3-.05*i/5*2, r1=.3-.05*(i+1)/5*2; cyl(r1,r0,H/5,i%2?WHITE:RED,0,.18+i*H/5,0,24,g); }
  rbox(.14,.24,.03,NAVYD,0,.2,.3,.02,g);
  cyl(.3,.3,.06,NAVYD,0,.18+H,0,24,g); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; cyl(.012,.012,.16,'#ffffff',Math.cos(a)*.27,.24+H,Math.sin(a)*.27,4,g); } cyl(.28,.28,.02,'#ffffff',0,.4+H,0,24,g);
  const lamp=cyl(.15,.15,.3,'#fff3c4',0,.24+H,0,16,g); lamp.material=mat('#fff3c4',{emissive:0xffd060,emissiveIntensity:lv>=3?.9:.5,transparent:true,opacity:.9});
  const cap=add(new THREE.Mesh(new THREE.ConeGeometry(.24,.26,20),mat(RED)),g); cap.position.y=.54+H+.13; sphere(.04,GOLD,0,.54+H+.3,0,{metalness:.5},g);
  if(lv>=3){ const beam=new THREE.Mesh(new THREE.ConeGeometry(.16,1.6,16,1,true),new THREE.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}));   // 會轉的光束
    const bg=new THREE.Group(); bg.position.y=.39+H; g.add(bg); beam.rotation.z=Math.PI/2; beam.position.x=.85; bg.add(beam); anims.push(t=>{ bg.rotation.y=t*1.2; }); }
  return g; }
/* 候船室（Lv2 起）：白牆、藍色屋頂、大玻璃、時鐘、招牌嵌在牆上；旁邊一道登船橋 */
function terminal(x,z){ const g=grp(x,QH,z);
  rbox(2.0,.95,1.0,WHITE,0,0,0,.05,g); rbox(1.6,.46,.03,'#a8dcf0',0,.22,.5,.02,g).material=glassMat; for(let k=-2;k<=2;k++) rbox(.03,.46,.04,NAVYD,k*.4,.22,.515,.005,g);
  rbox(2.16,.1,1.16,NAVY,0,.95,0,.03,g); const r=prism(2.1,1.1,.42,NAVY,0,1.05,0,'z',g); rbox(.5,.06,.4,NAVYD,0,.72,.68,.02,g); for(const s of [-1,1]) cyl(.025,.025,.72,'#d5d8de',s*.2,0,.86,8,g);
  wallSign('木星碼頭',1.0,0,.84,.52,0,g);
  const ck=add(new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.04,24),mat('#ffffff')),g); ck.rotation.x=Math.PI/2; ck.position.set(0,1.27,.56); const cr=add(new THREE.Mesh(new THREE.TorusGeometry(.16,.025,8,24),mat(GOLD,{metalness:.5})),g); cr.position.set(0,1.27,.57);
  rbox(.015,.1,.01,'#3b3550',0,1.26,.59,.003,g); rbox(.07,.015,.01,'#3b3550',.03,1.27,.59,.003,g);
  cyl(.03,.03,.5,'#9d98ad',.75,1.05,-.2,6,g); const fl=rbox(.3,.18,.01,NAVY,.9,1.38,-.2,.005,g); anims.push(t=>{ fl.rotation.y=Math.sin(t*2.2)*.25; });
  return g; }
/* 白色渡輪（Lv2 起）：兩層船艙、一排圓窗、藍色煙囪 */
function ferry(x,z,ry=0){ const g=grp(x,WY,z,ry); hull(2.4,.8,.42,NAVY,WHITE,'#e9e4da',g);
  rbox(1.5,.32,.62,WHITE,-.15,.33,0,.05,g); rbox(1.52,.1,.64,'#a8dcf0',-.15,.45,0,.03,g).material=glassMat;
  rbox(.9,.28,.5,WHITE,-.25,.65,0,.05,g); rbox(.92,.08,.52,'#a8dcf0',-.25,.75,0,.02,g).material=glassMat; rbox(.98,.04,.58,NAVY,-.25,.93,0,.01,g);
  cyl(.1,.12,.3,NAVY,-.55,.93,0,14,g); cyl(.115,.115,.07,RED,-.55,1.2,0,14,g); cyl(.08,.08,.012,'#2b2b33',-.55,1.27,0,14,g);   /* 家長 11-25：煙囪頂端紅色那圈原本和藍色煙囪頂面疊在同一個高度會閃 → 紅圈改成高出一點，頂上加黑色煙囪口 */
  for(let i=0;i<6;i++){ const w=add(new THREE.Mesh(new THREE.CircleGeometry(.04,12),mat('#3b3550')),g); w.position.set(-.9+i*.28,.14,.405); }
  rbox(.3,.08,.5,'#f2c230',.6,.33,0,.01,g).material=mat('#e8e4dc');
  bob(g,.012,1.1); return g; }
/* 貨櫃：一個長方塊加上直條紋 */
const CC=['#d9483b','#30598c','#f2c230','#4f9d6a','#3fb0a3','#e88a3a'];
function container(x,y,z,c,ry=0,parent){ const g=grp(x,y,z,ry,parent); rbox(.8,.3,.32,c,0,0,0,.015,g); for(let k=-4;k<=4;k++) rbox(.012,.28,.33,new THREE.Color(c).offsetHSL(0,0,-.08).getStyle(),k*.085,.01,0,.002,g); rbox(.02,.26,.3,'#ffffff',.405,.02,0,.004,g).material=mat(new THREE.Color(c).offsetHSL(0,0,.08).getStyle()); return g; }
/* 大貨輪（Lv3）：長船身、船尾白色駕駛樓、甲板上堆貨櫃 */
function cargoShip(x,z,ry=0){ const g=grp(x,WY,z,ry); hull(3.1,.82,.48,RED,NAVY,'#c9c3b8',g);
  rbox(.5,.62,.68,WHITE,-1.15,.36,0,.04,g); rbox(.52,.1,.7,'#a8dcf0',-1.15,.86,0,.02,g).material=glassMat; rbox(.6,.05,.78,NAVY,-1.15,.98,0,.01,g); cyl(.07,.08,.35,NAVY,-1.25,1.0,0,12,g);
  for(let i=0;i<3;i++) for(let k=0;k<(i===1?2:1);k++) for(const s of [-1,1]) container(-.5+i*.82,.36+k*.3,s*.17,CC[(i*3+k*2+(s>0?1:0))%6],0,g);
  bob(g,.008,.9); return g; }
/* 貨櫃起重機（Lv3）：藍色門形支架、長吊臂伸到港池上方，吊車小車來回移動 */
function gantry(x,z){ const g=grp(x,QH,z); const H=3.4, C=NAVY;
  for(const sx of [-.55,.55]) for(const sz of [-.75,.45]){ rbox(.12,H,.12,C,sx,0,sz,.02,g); rbox(.24,.1,.24,'#3b3550',sx,0,sz,.02,g); }
  for(const sz of [-.75,.45]) rbox(1.22,.12,.12,C,0,H*.45,sz,.02,g);
  for(const sx of [-.55,.55]){ rbox(.12,.12,1.32,C,sx,H*.45,-.15,.02,g); stick([sx,.2,-.75],[sx,H*.45,.45],.03,C,g); }
  rbox(1.3,.18,3.6,C,0,H,.5,.03,g); rbox(.6,.12,.6,'#f2c230',0,H+.18,-.95,.02,g);                    // 吊臂：往前伸到港池上方
  stick([0,H+.18,-.9],[0,H+.9,-.6],.03,C,g); stick([0,H+.9,-.6],[0,H+.12,2.2],.015,'#9d98ad',g); stick([0,H+.9,-.6],[0,H+.12,.3],.015,'#9d98ad',g);
  rbox(.42,.38,.4,WHITE,.45,H-.38,-.6,.03,g); rbox(.42,.12,.02,'#a8dcf0',.45,H-.22,-.39,.01,g).material=glassMat;
  const tr=grp(0,H-.12,1.0,0,g); rbox(.5,.14,.4,'#f2c230',0,0,0,.02,tr); const cab=[]; for(const s of [-.12,.12]) cab.push(stick([s,0,0],[s,-1.2,0],.01,'#3b3550',tr));
  const spr=rbox(.7,.06,.3,'#f2c230',0,-1.28,0,.01,tr); const box=container(0,-1.6,0,CC[2],Math.PI/2,tr); box.scale.setScalar(.85);
  anims.push(t=>{ const k=(Math.sin(t*.35)+1)/2; tr.position.z=-.2+k*2.0; });
  return g; }

/* 螃蟹圓招牌（家長 11-18：像舊金山漁人碼頭那樣，但圖案自己畫）：藍框白底紅螃蟹，下面一條招牌字 */
function crabTex(){ const c=document.createElement('canvas'); c.width=c.height=512; const g=c.getContext('2d');
  g.fillStyle=NAVY; g.beginPath(); g.arc(256,256,250,0,Math.PI*2); g.fill(); g.fillStyle='#ffffff'; g.beginPath(); g.arc(256,256,212,0,Math.PI*2); g.fill();
  g.strokeStyle='#f2c230'; g.lineWidth=10; g.beginPath(); g.arc(256,256,230,0,Math.PI*2); g.stroke();
  const red='#e0443a', dk='#a8281f'; g.lineCap='round'; g.strokeStyle=red; g.lineWidth=16;
  for(const s of [-1,1]) for(let k=0;k<3;k++){ g.beginPath(); g.moveTo(256+s*60,300+k*22); g.quadraticCurveTo(256+s*(120+k*8),300+k*30,256+s*(150+k*6),350+k*28); g.stroke(); }   // 腳
  for(const s of [-1,1]){ g.beginPath(); g.moveTo(256+s*70,260); g.quadraticCurveTo(256+s*120,200,256+s*120,160); g.stroke();   // 大螯
    g.fillStyle=red; g.beginPath(); g.ellipse(256+s*122,140,34,40,s*.3,0,Math.PI*2); g.fill(); g.fillStyle='#ffffff'; g.beginPath(); g.moveTo(256+s*122,140); g.lineTo(256+s*150,108); g.lineTo(256+s*112,104); g.closePath(); g.fill(); }
  g.fillStyle=red; g.beginPath(); g.ellipse(256,290,98,66,0,0,Math.PI*2); g.fill(); g.fillStyle=dk; g.beginPath(); g.ellipse(256,305,70,36,0,0,Math.PI); g.fill();
  for(const s of [-1,1]){ g.strokeStyle=red; g.lineWidth=8; g.beginPath(); g.moveTo(256+s*22,236); g.lineTo(256+s*28,206); g.stroke(); g.fillStyle='#ffffff'; g.beginPath(); g.arc(256+s*28,200,15,0,Math.PI*2); g.fill(); g.fillStyle='#3b3550'; g.beginPath(); g.arc(256+s*30,202,7,0,Math.PI*2); g.fill(); }
  g.strokeStyle='#ffffff'; g.lineWidth=6; g.beginPath(); g.arc(256,285,26,.2,Math.PI-.2); g.stroke();   // 笑臉
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function crabSign(x,z,txt,big){ const k=big?1:.8, g=grp(x,QH,z); g.scale.setScalar(k);
  for(const s of [-1,1]){ cyl(.05,.06,1.75,NAVYD,s*.55,0,0,10,g); cyl(.08,.08,.06,'#f2c230',s*.55,1.75,0,10,g); }
  const disk=add(new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.07,40),[mat(NAVY),new THREE.MeshStandardMaterial({map:crabTex(),roughness:.7}),mat(NAVY)]),g);
  disk.geometry.groups.length=0; disk.geometry.addGroup(0,Infinity,0); disk.material=mat(NAVY); disk.rotation.x=Math.PI/2; disk.position.set(0,1.85,0);
  const face=new THREE.Mesh(new THREE.CircleGeometry(.6,40),new THREE.MeshStandardMaterial({map:crabTex(),roughness:.7})); face.position.set(0,1.85,.04); g.add(face);
  const back=new THREE.Mesh(new THREE.CircleGeometry(.6,40),new THREE.MeshStandardMaterial({map:crabTex(),roughness:.7})); back.position.set(0,1.85,-.04); back.rotation.y=Math.PI; g.add(back);
  wallSign(txt,1.1,0,1.1,.03,0,g); const b2=wallSign(txt,1.1,0,1.1,-.03,Math.PI,g);
  return g; }
/* 海獅：躺在浮台上，頭會抬起來晃一晃 */
function seaLion(x,y,z,ry,parent,ph=Math.random()*6){ const g=grp(x,y,z,ry,parent), C='#7a5c46', C2='#8e6c52';
  const b=sphere(.13,C,0,.09,0,{roughness:.6},g); b.scale.set(1.9,.75,1);
  const tl=new THREE.Group(); tl.position.set(-.2,.06,0); g.add(tl);   // 尾巴＋後鰭：家長 11-18 要會拍動
  const tail=sphere(.07,C,-.07,0,0,{},tl); tail.scale.set(1.4,.5,1.2); for(const s of [-1,1]){ const f=sphere(.05,C2,-.16,-.02,s*.06,{},tl); f.scale.set(1.2,.3,.8); const fr=sphere(.05,C2,.1,.03,s*.13,{},g); fr.scale.set(1.3,.3,.8); }
  const hg=new THREE.Group(); hg.position.set(.2,.12,0); g.add(hg); const nk=sphere(.085,C,0,.05,0,{},hg); nk.scale.set(1,1.3,.9);
  const hd=sphere(.075,C2,.06,.15,0,{},hg); const sn=sphere(.04,'#6b4f3c',.13,.14,0,{},hg); sn.scale.set(1.2,.8,1);
  sphere(.012,'#2b2840',.1,.18,.045,{},hg); sphere(.012,'#2b2840',.1,.18,-.045,{},hg); sphere(.012,'#2b2840',.17,.15,0,{},hg);
  anims.push(t=>{ const k=Math.sin(t*.9+ph); hg.rotation.z=k>.3?(k-.3)*.9:0; hg.rotation.y=Math.sin(t*.5+ph)*.3; const f=Math.sin(t*1.7+ph*1.3); tl.rotation.z=f>.2?Math.sin(t*9)*.35*(f-.2):0; });   // 偶爾拍拍尾巴
  return g; }
function sealRaft(x,z,w,d,n){ const g=grp(x,WY,z); rbox(w,.08,d,'#b9875a',0,0,0,.02,g); for(let i=0;i<Math.round(w/.16);i++) rbox(.012,.085,d+.01,WOODD,-w/2+.08+i*.16,0,0,.003,g);
  for(const s of [-1,1]) rbox(w+.04,.06,.08,'#e8e4dc',0,-.03,s*(d/2-.02),.02,g);
  const P=[[-.18,.24,.15],[.2,-.24,Math.PI+.2],[.22,.26,-.3],[-.24,-.22,Math.PI-.25]]; for(let i=0;i<n;i++){ const [px,pz,r]=P[i]; seaLion(px*w,.08,pz*d,r,g); }   // 分兩排躺，不要擠在一起
  bob(g,.012,1.0); return g; }
/* 海鷗：白身、灰翅膀、黃嘴；停著的、在天上繞圈的 */
function gull(x,y,z,ry=0,parent){ const g=grp(x,y,z,ry,parent); const b=sphere(.045,'#ffffff',0,.05,0,{},g); b.scale.set(1.6,.9,.9);
  sphere(.03,'#ffffff',.06,.09,0,{},g); const bk=add(new THREE.Mesh(new THREE.ConeGeometry(.01,.04,6),mat('#f2b43a')),g); bk.rotation.z=-Math.PI/2; bk.position.set(.1,.09,0);
  for(const s of [-1,1]){ const w=rbox(.08,.012,.04,'#a9b0bc',-.01,.06,s*.035,.004,g); } rbox(.03,.012,.03,'#3b3550',-.07,.055,0,.003,g); return g; }
function flyingGulls(cx,cz,r,h,n){ const ring=grp(cx,h,cz); for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, g=new THREE.Group(); g.position.set(Math.cos(a)*r,Math.sin(i*2)*.15,Math.sin(a)*r); g.rotation.y=-a; ring.add(g);
    const b=sphere(.05,'#ffffff',0,0,0,{},g); b.scale.set(.9,.8,1.6); const ws=[]; for(const s of [-1,1]){ const wg=new THREE.Group(); wg.position.x=s*.03; g.add(wg); rbox(.16,.012,.06,'#c3c8d0',s*.08,0,0,.004,wg); ws.push([wg,s]); }
    anims.push(t=>{ for(const [wg,s] of ws) wg.rotation.z=s*Math.sin(t*6+i)*.5; }); }
  anims.push(t=>{ ring.rotation.y=t*.35; }); }

function pier(lv){
  const zE=-.15;                                // 石岸前緣（後半是石岸，前半是港池）
  ground(zE);
  // ── Lv1 小漁港 ──
  jetty(-1.6,zE,1.4,.5); fishingBoat(-1.05,.62,-Math.PI/2+.05);
  for(const x of [-2.4,-.5,.6,1.9]) bollard(x,zE-.25);
  gearShed(-.3,-2.2,0);
  fishCrate(-.95,-.7,0,2); fishCrate(-.55,-.75,.3,1); fishCrate(-.8,-1.15,-.2,1);
  if(lv<3) netPile(-2.35,-.7); else netPile(-1.25,-1.45);
  lifeRing(.2,-.5,0); lampQ(-.05,-1.3); lampQ(2.9,-.45); gull(2.9,QH+1.27,-.45,2);
  tree(-1.55,-2.55,.85,'#5aa957'); tree(1.85,-2.55,.9,'#62b955');
  crabSign(.75,-2.75,lv>=2?'木星碼頭':'木星漁港',lv>=2);   // 螃蟹圓招牌（家長 11-18）
  gull(-.5,QH+.18,zE-.25,.8); gull(1.9,QH+.18,zE-.25,-2.4); gull(-1.6,QH+.09,zE+.6,1.6);   // 停在繫船柱和棧橋上的海鷗
  flyingGulls(.3,1.4,1.4,lv>=2?3.2:2.4,lv>=2?3:2);
  // 海獅浮台（家長 11-18：像舊金山碼頭；木板要多，可以延伸到格子外一點）→ 港池往前開一個口，外面多一片水
  /* 浮台伸出格子外：外面本來就是海，不用再補水 */
  sealRaft(1.1,3.25,1.7,.95,2);
  if(lv>=2) sealRaft(-3.05,3.15,1.55,.9,2);   /* 家長 11-20 07:55：碼頭範圍變大了，Lv2 起再加一塊浮板、兩隻海獅 */
  // 消波塊（家長 11-19 00:05）：Sketchfab「Breakwater (Taiwan Taichung dumplings)」CC-BY-4.0，作者 outcast945，一組三顆，泡在港池邊
  const tp=(x,z,r)=>kit('models/sk/tetrapod.glb',x,z,{h:.42,rot:r,y0:WY-.05,then:o=>o.traverse(m=>{ if(m.isMesh){ m.material=new THREE.MeshStandardMaterial({color:'#cfcac0',roughness:.95,flatShading:true}); } })});   // 水泥灰（原本太暗）
  /* 家長 11-25 23:03：消波塊不要散在水中間，要沿著岸邊排成一排：貼著石岸前緣，從木棧橋左邊一路排到石岸左邊角落 */
  for(const [x,r] of [[-4.15,.1],[-3.35,-.08],[-2.55,.06]]) tp(x,zE+.8,r);   // 家長 11-18 12:15：只要一個浮台、各級都兩隻海獅，浮台大一點、伸出格子外一點
  if(lv===1){ const sm=fishingBoat(2.2,.95,Math.PI/2+.2); sm.scale.setScalar(.85); fishCrate(1.3,-1.1,0,1); tree(2.15,-1.5,.95,'#62b955'); bush(2.3,-.75,.8,'#ffffff'); }
  // ── Lv2 客運碼頭 ──
  if(lv>=2){ terminal(1.55,-1.35); ferry(.85,.8,0);
    /* 家長 11-25 23:02：燈塔原本放在防波堤尾端外面，底座比堤寬，看起來浮在水上 → 防波堤再往外伸，尾端做一個圓形平台，燈塔放在平台中間，底座比平台小 */
    rbox(.6,QH,1.95,QUAY,2.6,0,zE+.95,.03); rbox(.62,.025,1.95,'#f2c230',2.6,QH,zE+.95,.005).material=mat(QUAYE);   // 石頭防波堤
    cyl(.62,.66,QH+.36,QUAY,2.6,-.36,1.85,28); cyl(.64,.64,.025,QUAYE,2.6,QH,1.85,28);   // 尾端圓形平台（泡進水裡）
    lighthouse(2.6,1.85,lv);
    for(let i=0;i<5;i++) rbox(.34,.04,.14,'#d5d8de',1.3,QH-.02,zE+.05+i*.1,.01);   // 登船橋
    rbox(.03,.24,.55,'#9d98ad',1.12,QH,zE+.25,.01); rbox(.03,.24,.55,'#9d98ad',1.48,QH,zE+.25,.01); }
  // ── Lv3 貨運港 ──
  if(lv>=3){ gantry(-2.25,-.95).scale.setScalar(.72); const cs=cargoShip(-.95,2.1,0); cs.scale.setScalar(.8);
    [[-2.15,-2.1],[-1.3,-2.6]].forEach(([x,z],i)=>{ for(let a=0;a<2;a++) for(let k=0;k<2-(a&i);k++) container(x,QH+k*.31,z+a*.34,CC[(i*4+a*2+k)%6]); }); }
}

const LV=(id,name,fn,n)=>Array.from({length:n},(_,i)=>[id+(i?i+1:''),name+' Lv'+(i+1),()=>fn(i+1),'whole']);
export const PIER_LV=LV('pier','碼頭',pier,3);
export const PIER_TOP=[0,2.0,3.4,4.6];
