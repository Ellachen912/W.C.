/* Winston City 一之一 7 棟（2026-11-12 22:45 家長同意的各級規劃）：圖書館（3 級）、醫院（3）、市場（3）整格；早餐店（2）、診所（1）、便利商店（1）、社區公園（2）半格。
   一級比一級明顯長高、長寬，只加東西、不換顏色。整格全部縮在六角格裡面（家長：醫院突出來）；半格是「上下切」的梯形：橫寬、前後淺，建築靠後、門口朝前面的路。
   座標：建地中心為原點，正門朝 +z。整格放大 1.3 倍（裡面約 ±2.3）；半格放大 1.25 倍，可用範圍約 x ±2.0（後面可到 ±3）、z -0.6～1.7。
   用到家長的模型：Fantasy Town（攤子、噴水池、樹籬、燈籠）、Commercial（遮陽棚、陽傘）、Furniture（桌椅、書櫃、書、盆栽）、市場包（蔬果箱、購物車、冷藏櫃、貨架）、Suburban（花台）。 */
import * as THREE from 'three';
import { ROOT, setRoot, add, M, rbox, cyl, sphere, mat, hip, prism, column, bunting, archWin, glassMat, tree, bush, lamp, bench, stoneTex, texMat, wallMat, GOLDM, canvasTex, grassTex, hexPad, animals, anims, puff, butterfly } from './lib.js';
import { block, win, door, awning, openBook, cross, ambulance, friedEgg, stripedRoof, lawnPad, disc, beam, fence, LIB, HOSP, BFAST, MARKET, CLINIC, CONV } from './stage1.js';
import { kit, FT, FUR, COM, SUB, MKT } from './s1_kit.js';
import { plasticStool as makeStool } from './stool.js';
const WHITE='#fbfaf6', DARK='#4d4a63', SOIL='#7a5a3a';
function scaled(k,fn){ const prev=ROOT, g=new THREE.Group(); g.scale.setScalar(k); prev.add(g); setRoot(g); fn(); setRoot(prev); }
const libStone=()=>texMat('lib',stoneTex(LIB.wall,'rgba(140,100,60,.3)'),4,2);
const crate=(name,x,z,w=.42,rot=0,y0=0)=>kit(MKT,x,z,{node:name,w,rot,y0});
const table=(x,z,s=1)=>{ kit(FUR('tableRound'),x,z,{w:.42*s}); for(const [dx,r] of [[-.32,Math.PI/2],[.32,-Math.PI/2]]) kit(FUR('chair'),x+dx*s,z,{h:.42*s,rot:r}); };

/* ---------- 圖書館（整格）：比照市長的家加細節（家長 23:37～23:41）
   屋頂瓦線、屋脊、屋簷齒飾、老虎窗、金色尖頂；牆角轉角石；拱窗加拱心石、窗台、墨綠百葉窗；兩柱門廊＋三角山牆（大書嵌在山牆）；步道、燈柱、花台、腳踏車架。
   Lv1 一層石造館 → Lv2 加二樓、左右兩翼、閱讀花園（陽傘桌、書櫃）→ Lv3 屋簷上一本打開的大書＋門口行動書車（家長：不要圓頂、不要台階、不要綠屋頂露台） ---------- */
const LT='#f6ead3', IRON='#3f4a4a';
function onY(y,fn){ const prev=ROOT, g=new THREE.Group(); g.position.y=y; prev.add(g); setRoot(g); fn(); setRoot(prev); }
function quoins(x0,x1,z0,z1,h){ for(const [x,z] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1]]) for(let y=.2,i=0;y<h;y+=.17,i++) rbox(i%2?.14:.2,.12,i%2?.2:.14,LT,x,y,z,.01); }
function libWin(x,y,z,rot=0,h=.55){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rot; ROOT.add(g);
  archWin(.22,h,g,0,0,0,0,LIB.trim); rbox(.1,.1,.05,LT,0,h+.13,.02,.01,g);                  // 拱心石
  rbox(.34,.05,.1,LT,0,-.07,.04,.01,g); for(const s of [-1,1]) rbox(.08,h+.08,.03,LIB.roof,s*.2,-.02,.02,.01,g); }   // 窗台、百葉窗
function libRoof(cx,cz,w,d,h,y){ hip(w,d,h,LIB.roof,cx,y,cz);
  const ang=Math.atan2(h,d/2), dark=mat('#255a47');
  for(let k=1;k<5;k++){ const t=k/5, ww=w-d*t; for(const s of [-1,1]){ const b=rbox(ww,.025,.035,dark,cx,y+h*t-.01,cz+s*d/2*(1-t)+s*.012,.005); b.rotation.x=-s*ang; } }   // 瓦片線
  rbox(w-d+.08,.07,.1,'#255a47',cx,y+h-.02,cz,.02); for(const s of [-1,1]) sphere(.05,GOLDM(),cx+s*(w-d)/2,y+h+.07,cz);   // 屋脊壓條＋金色尖頂
  for(let x=-w/2+.2;x<w/2-.1;x+=.13) for(const s of [-1,1]) rbox(.05,.05,.05,LT,cx+x,y-.13,cz+s*(d/2-.14),.005); }   // 屋簷齒飾
function dormer(x,y,z){ rbox(.32,.3,.3,LIB.wall,x,y,z,.02); prism(.4,.38,.2,LIB.roof,x,y+.3,z); archWin(.14,.18,null,x,y+.06,z+.155,0,LIB.trim); }
function lampPostL(x,z){ cyl(.03,.045,.95,IRON,x,0,z,10); sphere(.08,mat('#fff3c4',{emissive:0xffcf5a,emissiveIntensity:.45}),x,1.03,z); const c=add(new THREE.Mesh(new THREE.ConeGeometry(.1,.1,10),mat(IRON))); c.position.set(x,1.16,z); }
function planter(x,z,w,c){ rbox(w,.16,.2,'#d8ccb4',x,0,z,.02); rbox(w-.04,.04,.16,SOIL,x,.16,z,.01); for(let i=0;i<Math.round(w/.09);i++) sphere(.045,i%3?c:'#ffffff',x-w/2+.06+i*.09,.22,z); }
function bookshelf(x,z,rot=0){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; ROOT.add(g);   // 戶外書櫃：墨綠框、擺滿書
  rbox(.7,.72,.22,LIB.roof,0,0,0,.02,g); rbox(.78,.05,.28,'#255a47',0,.72,0,.01,g);
  const C=['#e5484d','#f2c230','#3d9ad1','#ffffff','#8fd36a','#c77dff','#ff8c3a'];
  for(let r=0;r<3;r++){ rbox(.62,.03,.18,'#d9b98a',0,.06+r*.22,.03,.005,g); for(let i=0;i<9;i++) rbox(.055,.15+(i%3)*.02,.14,C[(i+r*2)%7],-.26+i*.065,.09+r*.22,.05,.005,g); } }
function bookmobile(x,z,rot=0,k=.72){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; g.scale.setScalar(k); ROOT.add(g);   // 行動書車：側邊打開是書架
  rbox(1.45,.62,.62,LIB.roof,-.12,.16,0,.07,g); rbox(.4,.52,.6,'#f6eee2',.75,.16,0,.06,g); rbox(.04,.22,.5,glassMat,.96,.42,0,.01,g);
  rbox(1.47,.06,.64,LIB.trim,-.12,.5,0,.01,g);
  rbox(1.15,.42,.03,'#f6eee2',-.15,.22,.315,.01,g); const C=['#e5484d','#f2c230','#3d9ad1','#8fd36a','#c77dff','#ff8c3a'];
  for(let r=0;r<2;r++) for(let i=0;i<14;i++) rbox(.06,.14,.04,C[(i+r)%6],-.66+i*.078,.25+r*.19,.33,.004,g);
  const fl=rbox(1.15,.03,.4,LIB.roof,-.15,.8,.5,.01,g); fl.rotation.x=-.25;                    // 掀起來的側板當遮雨棚
  for(const [wx,wz] of [[-.55,.31],[.55,.31],[-.55,-.31],[.55,-.31]]){ const w=add(new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.08,16),mat('#3b3550')),g); w.rotation.x=Math.PI/2; w.position.set(wx,.13,wz); }
}
/* 招牌字：都叫「木星XX」（家長 09:32） */
function woodNameTex(txt){ return rectTex(512,160,(g,w,h)=>{ g.fillStyle='#b07a4a'; g.fillRect(0,0,w,h); g.fillStyle='#8a5a32'; for(let i=0;i<5;i++) g.fillRect(0,i*h/5,w,4);
  g.fillStyle='#fff8e6'; g.font=`bold ${h*.55}px "Noto Sans CJK TC",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,w/2,h*.54); }); }
function library(lv){ hexPad('#e6dccb'); scaled(1.3,()=>{
  const P=LIB, H=lv>=2?2.15:1.35, cz=-.55, W=2.4, D=1.5, fz=cz+D/2;
  const top=block(0,cz,W,D,H,libStone(),{base:'#d8ccb4',trim:P.trim});
  quoins(-W/2,W/2,cz-D/2,fz,H+.1);
  for(const x of [-.8,.8]) libWin(x,.42,fz+.005);
  if(lv>=2){ for(const x of [-.8,.8]) libWin(x,1.32,fz+.005,0,.48); const o=add(new THREE.Mesh(new THREE.TorusGeometry(.14,.04,8,24),mat(LT))); o.position.set(0,1.62,fz+.02);
    const og=add(new THREE.Mesh(new THREE.CircleGeometry(.12,20),glassMat)); og.position.set(0,1.62,fz+.025); }
  for(const z of [cz-.35,cz+.35]){ libWin(W/2+.005,.42,z,Math.PI/2); libWin(-W/2-.005,.42,z,-Math.PI/2); }
  // 兩柱門廊＋三角山牆（大書嵌在山牆裡）、壁燈
  door(0,.16,fz+.005,.46,.78,P.roof,0,P.trim);
  rbox(1.0,.08,.55,'#e6dccb',0,.1,fz+.25,.02);
  for(const s of [-1,1]) column(s*.38,fz+.42,.95,P.trim,.07,.18);
  rbox(1.0,.12,.55,P.trim,0,1.13,fz+.25,.02); prism(1.04,.55,.38,P.trim,0,1.25,fz+.25); prism(.9,.04,.3,P.roof,0,1.27,fz+.53);
  openBook(0,1.29,fz+.56,.42);
  for(const s of [-1,1]){ rbox(.03,.03,.12,IRON,s*.6,1.0,fz+.06,.01); sphere(.06,mat('#fff3c4',{emissive:0xffcf5a,emissiveIntensity:.5}),s*.6,.98,fz+.12); }
  libRoof(0,cz,W+.3,D+.3,.75,top); bird(.25,cz,1.2,top+.75,'#9aa3b5',true);   /* 屋脊停一隻鴿子（家長 11-13） */ dormer(-.7,top+.12,cz+.35); dormer(.7,top+.12,cz+.35);   // Lv3 也用 Lv2 的屋頂（家長 23:44：不要綠屋頂露台）
  if(lv>=3){ rbox(1.1,.1,.16,P.trim,0,top-.12,fz+.1,.02); openBook(0,top-.02,fz+.18,1.1);
    { const bg=new THREE.Group(); bg.position.set(0,top-.02,fz+.18); bg.scale.setScalar(1.1); ROOT.add(bg); const pv=new THREE.Group(); pv.position.set(0,.04,.05); bg.add(pv);   /* 大書一頁一頁慢慢翻（家長 11-13） */
      const pg=rbox(.4,.52,.012,'#fffdf5',.2,0,0,.004,pv); for(let i=0;i<4;i++) rbox(.26,.016,.004,'#9aa6b8',.2,.13+i*.08,.008,.002,pv);
      anims.push(t=>{ const k=(t/6)%1; if(k<.4){ const e=k/.4, s=e*e*(3-2*e); pv.visible=true; pv.rotation.y=-.32-(Math.PI-.64)*s; } else pv.visible=false; }); } }   // Lv3：大書放在屋頂前面、屋簷上（像原本 Lv1 草稿那樣，家長 23:45）
  if(lv>=2) for(const s of [-1,1]){ const x=s*1.75, wd=1.1, wz=cz-.1, t=block(x,wz,.95,wd,1.05,libStone(),{base:'#d8ccb4',trim:P.trim});   // 左右兩翼
    quoins(x-.475,x+.475,wz-wd/2,wz+wd/2,1.15); libRoof(x,wz,1.2,wd+.25,.5,t); libWin(x,.4,wz+wd/2+.005,0,.48); }
  // 地面：步道、燈柱、花台、腳踏車架、還書箱
  const pz0=fz+.55, pz1=2.1; rbox(.72,.08,pz1-pz0,'#c9bda6',0,0,(pz0+pz1)/2,.02); rbox(.62,.1,pz1-pz0,'#ece4d4',0,0,(pz0+pz1)/2,.02);
  for(let z=pz0+.2;z<pz1;z+=.28) rbox(.62,.105,.025,'#c9bda6',0,0,z,.005);
  lampPostL(-.55,1.5); lampPostL(.55,1.5);
  planter(-.8,fz+.15,.55,'#ff8fa3'); planter(.8,fz+.15,.55,'#ffd166');
  for(let i=0;i<4;i++){ const x=-1.55+i*.18; beam([x,0,1.05],[x,.28,1.05],.015,IRON); beam([x+.1,0,1.05],[x+.1,.28,1.05],.015,IRON); beam([x,.28,1.05],[x+.1,.28,1.05],.015,IRON); }   // 腳踏車架
  rbox(.24,.4,.2,P.roof,1.05,0,.75,.04); rbox(.16,.03,.02,'#fff8ea',1.05,.3,.86,.01);    // 還書箱
  if(lv>=2){ bookshelf(-1.6,.55,.3); table(1.6,.55,1); kit(COM('detail-parasol-a'),1.6,.55,{h:.85}); }
  if(lv>=3) bookmobile(1.15,1.55,-.2);
  // 樹種在後面和兩側
  for(const [x,z,k,c] of [[-1.6,-1.75,.6],[1.6,-1.75,.6,'#6fc463'],[0,-2.0,.55],[-2.1,-.6,.5,'#6fc463'],[2.1,-.6,.5]].slice(0,lv>=2?5:3)) tree(x,z,k,c);
}); }

/* ---------- 醫院（整格）：Lv1 地區醫院（三層玻璃帶）→ Lv2 區域醫院（五層＋玻璃帶急診大樓、兩台救護車）→ Lv3 醫學中心（Kenney Commercial skyscraper-b 玻璃高樓、停機坪、風向袋、旗桿）
   家長 23:08～23:36：不要深灰色；拿掉氧氣槽、公車亭、輪椅坡道、Lv1 急診雨棚；Lv2、Lv3 正門不要紅雨棚；樹種在後面；正門步道連到前面的路。 ---------- */
const HMAP='models/com/Textures/colormap_hosp.png', CITY='models/city/city.glb';
function canopy(x,z,w,d,c){ rbox(w,.07,d,'#ffffff',x,.86,z,.02); rbox(w+.02,.05,d+.02,c,x,.93,z,.01); for(const s of [-1,1]) cyl(.03,.03,.7,'#d5d8de',x+s*(w/2-.08),.16,z+d/2-.08,8); }
function lightBox(x,y,z,w,txtC='#ffffff',bg=HOSP.main){ rbox(w,.22,.06,bg,x,y,z,.03); rbox(w*.6,.06,.02,txtC,x,y+.08,z+.035,.005); }
/* 玻璃帶大樓：照 Lv3 高樓（skyscraper-b）的樣子畫，四角淺灰框、每層一條藍玻璃（家長 23:29：Lv1、Lv2、急診大樓都要這種窗戶） */
const GL={frame:'#e3e7ee', glass:'#7ea6dd', line:'#5b7fb8', top:'#cfd5de'};
function glassBlock(x,z,w,d,floors,fh=.62){ const MUL=[];
  rbox(w+.12,.14,d+.12,'#d9d6ce',x,0,z,.03); const H=.14+floors*fh;
  rbox(w,H-.14,d,GL.frame,x,.14,z,.03);
  const gm=mat(GL.glass,{roughness:.2,metalness:.15,emissive:0x1d3f66,emissiveIntensity:.15});
  for(let f=0;f<floors;f++){ const y=.14+f*fh+.08, hh=fh-.16;
    rbox(w-.16,hh,d+.02,gm,x,y,z,.01); rbox(w+.02,hh,d-.16,gm,x,y,z,.01);              // 四面的玻璃帶（角落留淺灰框）
    rbox(w-.14,.035,d+.04,GL.line,x,y+hh-.02,z,.005); rbox(w+.04,.035,d-.14,GL.line,x,y+hh-.02,z,.005);
    rbox(w+.1,.03,d+.1,'#f4f5f7',x,y+hh+.02,z,.006);                                   // 每層窗上一條白色遮陽板
    rbox(w+.05,.02,d+.05,'#c9ced6',x,y-.02,z,.004);                                    // 窗台
    for(let k=1;k<4;k++) MUL.push([x,y+hh*k/4,z,w+.025,.012,d+.025]);                // 橫的細窗框（一格一格的窗）
    for(let xx=-w/2+.2;xx<w/2-.1;xx+=.2) for(const s of [-1,1]) MUL.push([x+xx,y+hh/2,z+s*(d/2+.012),.022,hh,.02]);   // 正面、背面直的窗框
    for(let zz=-d/2+.2;zz<d/2-.1;zz+=.2) for(const s of [-1,1]) MUL.push([x+s*(w/2+.012),y+hh/2,z+zz,.02,hh,.022]); }  // 兩側直的窗框
  { const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat('#e9ecf1',{roughness:.5}),MUL.length), o=new THREE.Object3D();   // 窗框一次畫（家長 11-18 23:38：玻璃太大、沒細節）
    MUL.forEach(([a,b,c,sx,sy,sz],i)=>{ o.position.set(a,b,c); o.scale.set(sx,sy,sz); o.updateMatrix(); im.setMatrixAt(i,o.matrix); }); ROOT.add(im); }
  rbox(w+.1,.12,d+.1,GL.top,x,H,z,.03); rbox(w-.1,.04,d-.1,'#eef0f3',x,H+.06,z,.01);   // 樓頂邊框
  return H+.12;
}
/* 急診側面懸掛招牌：從牆面伸出來，兩面都是紅底白字「急」（家長 09:22） */
let ER_TEX=null;
function erSign(x,y,z){ if(!ER_TEX){ const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d'); g.fillStyle='#d8343a'; g.fillRect(0,0,256,256); g.strokeStyle='#ffffff'; g.lineWidth=10; g.strokeRect(14,14,228,228);
    g.fillStyle='#ffffff'; g.font='bold 170px "Noto Sans CJK TC",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('急',128,140); ER_TEX=new THREE.CanvasTexture(c); ER_TEX.colorSpace=THREE.SRGBColorSpace; }
  const side=mat('#b82a30'), face=new THREE.MeshStandardMaterial({map:ER_TEX,roughness:.5,emissive:0x330000,emissiveIntensity:.3});
  const m=add(new THREE.Mesh(new THREE.BoxGeometry(.07,.38,.38),[face,face,side,side,side,side])); m.position.set(x,y,z);
  rbox(.03,.03,.22,'#9aa0ab',x,y+.17,z-.28,.005); rbox(.03,.03,.22,'#9aa0ab',x,y-.2,z-.28,.005); }
/* 機車停車格：一整排、車頭朝同一邊、藍色系深淺（家長 09:22） */
function scooterRow(x,z0,n,dz=.3){ rbox(.62,.09,n*dz+.1,'#d6d2c8',x,0,z0+(n-1)*dz/2,.01);
  for(let i=0;i<=n;i++) rbox(.6,.095,.02,'#ffffff',x,0,z0-dz/2+i*dz,.003);
  const C=['!#ece8df','!#b9bec6','!#c9473f','!#e2cfa3','!#8a8f98']; for(let i=0;i<n;i++) scooter(x,z0+i*dz,0,C[i%5]); }   // 醫院的機車不要藍色（家長 09:32）
/* 急診迴車廊：一條車道從前面的路開到急診門口（家長 09:47 改一條）；車道上面是一大片平頂雨庇（柱子撐著），前緣寫「急診室」（家長 09:32） */
let ERW_TEX=null;
function erwTex(){ return ERW_TEX||(ERW_TEX=rectTex(512,128,(g,W,H)=>{ g.fillStyle='#f4f2ee'; g.fillRect(0,0,W,H); g.fillStyle='#d8343a'; g.font=`bold ${H*.66}px "Noto Sans CJK TC",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText('急診室',W/2,H*.54); })); }
function porte(x,zd,w,zr){ erwTex();
  const L=zr-zd;                                                                                  // zd 急診門口、zr 前面的路
  rbox(.62,.085,L,'#7b808a',x,0,zd+L/2,.01); for(let z=zd+.2;z<zr-.1;z+=.3) rbox(.04,.09,.15,'#ffffff',x,0,z,.004);   // 一條車道（家長 09:47），中間白虛線
  rbox(.62,.09,.04,'#f2c230',x,0,zd+.62,.004);                                                    // 停車黃線
  for(const sx of [-1,1]) for(const dz of [.2,.95]) cyl(.05,.05,1.05,'#d5d8de',x+sx*(w/2+.05),.08,zd+dz,10);   // 柱子在車道外側
  rbox(w+.3,.1,1.0,'#eceae5',x,1.13,zd+.62,.02); rbox(w+.34,.04,1.04,'#cfd3da',x,1.1,zd+.62,.01);   // 雨庇從牆面前 .1 開始，不插進大樓（家長 09:57 破圖）   // 平頂雨庇
  const sm=mat('#eceae5'), f=new THREE.MeshStandardMaterial({map:ERW_TEX,roughness:.6}); const m=add(new THREE.Mesh(new THREE.BoxGeometry(w+.3,.22,.05),[sm,sm,sm,sm,f,sm])); m.position.set(x,1.3,zd+1.14); }
function hospital(lv){ hexPad('#e3e1da'); scaled(1.3,()=>{
  const P=HOSP;
  let H, M;
  if(lv<3){ M={x:-.55,z:-.7,w:lv===1?1.6:1.55,d:1.35}; H=glassBlock(M.x,M.z,M.w,M.d,lv===1?3:5); }
  else { M={x:-.8,z:-.65,w:1.45,d:1.45}; kit(COM('building-skyscraper-b'),M.x,M.z,{w:M.w,map:HMAP}); H=M.w*4.48/1.36; }
  const fz=M.z+M.d/2;
  rbox(.7,.55,.04,mat('#cfeaf5',{transparent:true,opacity:.5}),M.x,.14,fz+.02,.01); rbox(.03,.55,.05,GL.frame,M.x,.14,fz+.03,.005);   // 正門玻璃自動門
  if(lv===1) canopy(M.x,fz+.3,1.0,.6,P.main);                                          // 正門紅雨棚（Lv2、Lv3 不要，家長 23:29）
  if(lv<3){ cross(M.x,H+.75,M.z+.2,1.0,P.main); for(const sx of [-1,1]){ rbox(.05,.52,.05,'#9aa0ab',M.x+sx*.18,H,M.z+.15,.01); rbox(.14,.04,.14,'#9aa0ab',M.x+sx*.18,H,M.z+.15,.01); }   // 十字招牌用兩支腳撐在屋頂上（家長 09:57：不要懸空）
    for(const dx of [-.5,.5]) kit(CITY,M.x+dx,M.z-.42,{node:'1286_Air_Conditioner005',w:.3,y0:H}); }
  else { cross(M.x,H-.55,fz+.04,.8,P.main);                                             // Lv3：十字掛牆上，樓頂停機坪
    cyl(.62,.62,.08,'#5b6070',M.x,H,M.z,32); cyl(.52,.52,.02,'#f2c230',M.x,H+.08,M.z,32); cyl(.47,.47,.025,'#5b6070',M.x,H+.08,M.z,32);
    rbox(.07,.02,.38,'#ffffff',M.x-.12,H+.1,M.z,.005); rbox(.07,.02,.38,'#ffffff',M.x+.12,H+.1,M.z,.005); rbox(.24,.02,.07,'#ffffff',M.x,H+.1,M.z,.005);
    for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) sphere(.05,mat('#ff4a4a',{emissive:0xff2020,emissiveIntensity:.9}),M.x+sx*.66,H+.06,M.z+sz*.66);   // 四角紅燈
    const wx=M.x+.62, wz=M.z-.6; cyl(.015,.015,.5,'#d5d8de',wx,H,wz,6);                // 風向袋（橘白條紋）
    { const ws=new THREE.Group(); ws.position.set(wx,H+.485,wz); ROOT.add(ws);   /* 風向袋隨風擺（家長 11-13） */
      for(let i=0;i<4;i++){ const c=cyl(.06-i*.01,.07-i*.01,.09,i%2?'#ffffff':'#ff7a1a',.05+i*.09,-.045,0,10,ws); c.rotation.z=Math.PI/2; }
      anims.push(t=>{ ws.rotation.y=Math.sin(t*.7)*.45; ws.rotation.z=-.08+Math.sin(t*2.3)*.06; }); }
    cyl(.02,.02,1.6,'#d5d8de',-1.75,0,.55,8); rbox(.36,.24,.01,'#5b8fd0',-1.56,1.3,.55,.005); }   // 旗桿移到原本機車的位置（家長 11-18 23:38：原本插到救護車）
  { const ex=1.15, ez=-.45, ew=1.5, ed=.95, et=glassBlock(ex,ez,ew,ed,lv===1?1:2), efz=ez+ed/2;   // 急診大樓：Lv1 一層、Lv2 起兩層（家長 09:47：Lv1 只有後面的建築）
    rbox(.6,.55,.03,mat('#cfeaf5',{transparent:true,opacity:.5}),ex,.14,efz+.02,.005);            // 急診自動門
    erSign(ex+ew/2+.04,lv===1?.6:1.1,efz-.12);
    for(const dx of [-.45,.45]) kit(CITY,ex+dx,ez-.1,{node:'1286_Air_Conditioner005',w:.3,y0:et});
    if(lv>=2) porte(ex,efz+.05,1.4,1.7);                                                          // Lv2 起才有迴車廊
    else { const sm=mat('#eceae5'), f=new THREE.MeshStandardMaterial({map:erwTex(),roughness:.6}); const m=add(new THREE.Mesh(new THREE.BoxGeometry(1.0,.25,.05),[sm,sm,sm,sm,f,sm])); m.position.set(ex,.86,efz+.04); }   // Lv1：門上掛「急診室」招牌
    { const amb=kit('models/car3/ambulance.glb',.35,1.45,{d:1.0,y0:.11}); const par=ROOT; let L1=null;   /* 救護車頂紅燈一閃一閃（家長 11-13） */
      anims.push(t=>{ if(!L1){ if(!amb.children.length) return; const b=new THREE.Box3().setFromObject(amb); if(b.isEmpty()) return; const lo=par.worldToLocal(new THREE.Vector3(.35,0,1.45)).set(0,0,0);
          const tp=par.worldToLocal(new THREE.Vector3((b.min.x+b.max.x)/2,b.max.y,b.min.z+(b.max.z-b.min.z)*.6));
          L1=[-1,1].map(sd=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(.1,.06,.09),new THREE.MeshStandardMaterial({color:sd<0?'#ff3030':'#3070ff',emissive:sd<0?0xff2020:0x2050ff,emissiveIntensity:.2})); m.position.set(tp.x+sd*.055,tp.y-.03,tp.z); par.add(m); return m; }); }
        const on=Math.floor(t*4)%2; L1[0].material.emissiveIntensity=on?1.6:.15; L1[1].material.emissiveIntensity=on?.15:1.6; }); }   // 用遊戲裡已經有的 KayKit 救護車模型（家長 10:05：要像一點）   // 急診一台救護車，停在步道和急診車道中間（家長 09:57、10:00）                                         // 救護車位置三級都一樣（家長 09:47）
    if(lv>=2) rbox(.35,.35,.4,glassMat,(M.x+M.w/2+ex-ew/2)/2,1.0,ez,.02); }
  // 正門步道：從正門一路鋪到前面的路，兩邊小花（家長 23:34）
  const pz0=fz+.05, pz1=2.15; rbox(.72,.08,pz1-pz0,'#c9bda6',M.x,0,(pz0+pz1)/2,.02); rbox(.62,.1,pz1-pz0,'#ece4d4',M.x,0,(pz0+pz1)/2,.02);
  for(let z=pz0+.25;z<pz1;z+=.3) rbox(.62,.105,.025,'#c9bda6',M.x,0,z,.005);
  for(const s of [-1,1]) for(const z of [fz+.6,fz+1.3]) bush(M.x+s*.48,z,.35,s<0?'#ff8fa3':'#ffd166');
  /* 機車拿掉（家長 11-18 23:38） */
  tree(-1.9,-.55,.55); tree(-1.4,-.95,.5,'#6fc463'); tree(-1.25,1.35,.45,'#6fc463');            // 醫院左邊種樹（家長 09:57 畫的位置）                                                     // 左邊一整排機車
  // 樹種在後面（家長 23:34），一級比一級多
  const T=[[-1.75,-1.35,.6],[1.55,-1.7,.55,'#6fc463'],[-1.3,-1.85,.5],[-1.2,-1.95,.5,'#6fc463'],[.6,-2.05,.5],[2.0,-1.0,.45,'#6fc463']].slice(0,[0,3,5,6][lv]);
  for(const [x,z,k,c] of T) tree(x,z,k,c);
}); }

/* ---------- 市場（整格）：台灣菜市場（家長 23:58 選 A）
   棚子都是平的（從上面看得到菜）、招牌是素面木牌只寫「市場」、雜物排整齊（菜放在竹籃、紅色塑膠籃、蔬果箱）。
   Lv1 露天早市：一排平頂帆布棚攤子、吊秤、機車 → Lv2 加一座有屋頂的市場（前面開放、騎樓下也擺攤）→ Lv3 日治時期白色老市場建築（拱窗、拱門、騎樓、屋頂通風天窗），參考台北新富市場、南門市場 ---------- */
const BOXES=['FruitBox_Tomato','FruitBox_Apples','FruitBox_Banana','FruitBox_Eggplant','FruitBox_Lemon','FruitBox_Orange','FruitBox_Pineapple','FruitBox_Strawberry'];
const VEG=['#8fd36a','#ef4f43','#ff8c3a','#ffd23a','#c77dff','#5bb04f'];
let signTex=null;   // 木星市場（第一次用到才做，因為 rectTex 在後面）
function woodSign(x,y,z,w,h){ if(!signTex) signTex=woodNameTex('木星市場'); const m=add(new THREE.Mesh(new THREE.BoxGeometry(w,h,.06),[mat('#8a5a32'),mat('#8a5a32'),mat('#8a5a32'),mat('#8a5a32'),new THREE.MeshStandardMaterial({map:signTex,roughness:.8}),mat('#8a5a32')])); m.position.set(x,y,z); return m; }
function basket(x,y,z,c,red=false){ rbox(.26,.12,.2,'#3d7fd0',x,y,z,.01); for(let i=0;i<3;i++) rbox(.27,.015,.21,'#2f66ad',x,y+.03+i*.035,z,.003);   // 藍色塑膠菜籃（家長 09:23）
  for(let k=0;k<4;k++) sphere(.05,c,x-.05+(k%2)*.1,y+.13,z-.04+Math.floor(k/2)*.08); }
function hangScale(x,y,z){ const g=new THREE.Group(); g.position.set(x,y,z); ROOT.add(g);   /* 掛點當軸，秤輕輕晃（家長 11-13） */
  cyl(.005,.005,.25,'#9aa0ab',0,-.25,0,4,g); cyl(.07,.05,.02,'#cfd3da',0,-.28,0,12,g); rbox(.05,.08,.03,'#e9e9e6',0,-.12,0,.01,g);
  const ph=x*3+z; anims.push(t=>{ g.rotation.z=Math.sin(t*1.7+ph)*.12; g.rotation.x=Math.sin(t*1.3+ph)*.06; }); }
function tag(x,y,z){ rbox(.1,.07,.012,'#ffffff',x,y,z,.004); rbox(.06,.012,.013,'#3b3550',x,y+.01,z,.002); }
let SCN=0; const SCB=['#5b8fd0','#2f5f9e','#8fb6e6'];   // 機車都是藍色系、深淺不同（家長 09:02、09:17）
function scooter(x,z,rot,c){ c=(c&&c[0]==='!')?c.slice(1):SCB[SCN++%3]; const g=new THREE.Group(); g.position.set(x,.11,z); g.rotation.y=rot; ROOT.add(g);
  rbox(.5,.12,.16,c,0,.12,0,.04,g); rbox(.22,.07,.15,'#3b3550',-.08,.3,0,.03,g); rbox(.1,.32,.12,c,.2,.12,0,.03,g); rbox(.04,.03,.3,'#3b3550',.24,.46,0,.01,g);
  for(const wx of [-.2,.22]){ const w=add(new THREE.Mesh(new THREE.TorusGeometry(.08,.03,6,14),mat('#3b3550')),g); w.position.set(wx,.1,0); } rbox(.08,.06,.12,'#ffffff',.3,.36,0,.02,g); }
/* ground：沒有桌子，只有棚子，菜籃放地上（家長 09:19、09:23 全部都這樣） */
function flatStall(x,z,w,c1,c2,items,ground=true){ for(const sx of [-1,1]) for(const sz of [-1,1]){ cyl(.04,.04,1.05,'#8a8f98',x+sx*(w/2-.05),.08,z+sz*.33,8); cyl(.07,.07,.04,'#6f7680',x+sx*(w/2-.05),.08,z+sz*.33,8); }   // 平頂帆布棚：四支粗一點的桿子＋底座（棚子不能懸空）
  const n=Math.round(w/.2); for(let i=0;i<n;i++) rbox(w/n+.002,.03,.78,i%2?c2:c1,x-w/2+(i+.5)*w/n,1.13,z,.005);
  rbox(w,.06,.08,c1,x,1.08,z+.39,.01);
  const ty=ground?.08:.55; if(!ground){ rbox(w-.1,.05,.5,'#ece0c4',x,.5,z,.01); for(const sx of [-1,1]) rbox(.04,.42,.04,'#9aa0ab',x+sx*(w/2-.12),.08,z,.005); }   // 折疊桌
  items.forEach((it,i)=>{ const bx=x-w/2+.22+i*(w-.44)/Math.max(1,items.length-1); if(typeof it==='string'&&it.startsWith('FruitBox')) crate(it,bx,z,.34,0,ty); else basket(bx,ty,z,it[0],it[1]); tag(bx,ty+.07,z+.24); });
  hangScale(x+w/2-.15,1.1,z+.2); kit(FT('stall-stool'),x-w/2+.2,z-.5,{h:.22}); }
function arcadeRow(x0,x1,z,h,c){ for(let x=x0;x<=x1+.01;x+=.6) rbox(.12,h,.12,c,x,.08,z,.01); }
/* 配色統一偏磚紅（家長 00:07：回到台灣菜市場第一版、不要紅牌樓）：磚紅＋奶油白＋木頭色 */
const MK={brick:'#b5533c', brick2:'#9e4532', cream:'#e6cc98', trim:'#d6b67c', wood:'#a8703f', win:'#f1e3c2'};   // 家長 00:09：白色太白，改土黃色
function inRot(x,z,rot,fn){ const prev=ROOT, g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; prev.add(g); setRoot(g); fn(); setRoot(prev); }
const brickMat=()=>texMat('mkbrick',stoneTex(MK.brick,'rgba(255,236,214,.38)'),5,3);
function market(lv){ hexPad('#ddd6c8',.38); scaled(1.3,()=>{                            // 水泥地改成貼合六角格
  const S=(x,z,w,items)=>flatStall(x,z,w,MK.brick,MK.cream,items);           // 帆布棚全部磚紅＋奶油白；g＝沒桌子、菜籃放地上
  if(lv===1){ // 露天早市
    S(-1.05,-.85,1.1,['FruitBox_Tomato',['#8fd36a',0],['#ff8c3a',1]]); S(.15,-.85,1.1,[['#ffd23a',0],'FruitBox_Banana',['#c77dff',1]]); S(1.3,-.85,1.0,['FruitBox_Apples','FruitBox_Lemon']);
    S(-.6,.45,1.1,[['#ef4f43',1],'FruitBox_Eggplant',['#8fd36a',0]]); S(.75,.45,1.1,['FruitBox_Orange',['#fff6e2',0],['#5bb04f',1]]);
    /* 門口的木頭門牌和兩根柱子拿掉（家長 11-19 00:05：不用木星市場的標示） */ }
  else if(lv===2){ // 有屋頂的市場：磚紅牆、奶油白飾帶、前面開放
    const W=3.4, D=1.6, z0=-.75; rbox(W+.08,.12,D+.08,'#ece0c4',0,.08,z0,.02);   /* 家長 11-13 破圖：地板比牆大一圈、牆蓋在地板上面，面不再重疊 */
    rbox(W,1.13,.12,brickMat(),0,.2,z0-D/2+.06,.02); for(const sx of [-1,1]) rbox(.12,1.13,D,brickMat(),sx*(W/2-.06),.2,z0,.02);
    arcadeRow(-W/2+.06,W/2-.06,z0+D/2-.06,1.25,MK.brick);
    rbox(W+.2,.14,D+.2,MK.cream,0,1.33,z0,.02); rbox(W+.24,.06,D+.24,MK.trim,0,1.47,z0,.01);
    for(const sx of [-1,1]) rbox(W+.24,.18,.08,MK.cream,0,1.53,z0+sx*(D/2+.08),.01); for(const sx of [-1,1]) rbox(.08,.18,D+.24,MK.cream,sx*(W/2+.08),1.53,z0,.01);   // 女兒牆
    woodSign(0,1.38,z0+D/2+.12,1.0,.32);
    ['FruitBox_Tomato','FruitBox_Apples','FruitBox_Banana','FruitBox_Eggplant','FruitBox_Orange'].forEach((b,i)=>{ crate(b,-1.15+i*.6,z0-.2,.34,0,.2); basket(-1.15+i*.6,.2,z0+.2,VEG[i%6]); });   // 沒有攤台，放地上
    for(const x of [-1.2,0,1.2]) sphere(.06,mat('#fff3c4',{emissive:0xffcf5a,emissiveIntensity:.6}),x,1.18,z0);
    for(const x of [-1.1,-.75]){ cyl(.16,.16,.36,MK.cream,x,1.53,z0-.35,16); cyl(.17,.17,.04,MK.trim,x,1.89,z0-.35,16); }   // 屋頂水塔
    for(const dx of [.8,1.25]) kit(CITY,dx,z0-.3,{node:'1286_Air_Conditioner005',w:.32,y0:1.53});
    for(const x of [-1.5,1.5]){ cyl(.1,.08,.18,MK.brick2,x,.08,z0+D/2+.25,10); bush(x,z0+D/2+.25,.35,'#ffd166'); }
    inRot(-1.15,.45,Math.PI/2,()=>S(0,0,1.1,[['#8fd36a',0],'FruitBox_Lemon',['#ef4f43',1]])); inRot(1.15,.45,-Math.PI/2,()=>S(0,0,1.1,['FruitBox_Pineapple',['#ffd23a',0],['#5bb04f',1]])); }   // 兩攤轉向，和市場排成ㄇ字（家長 00:09）
  else { // 日治時期紅磚老市場：兩層、拱窗、中間拱門、騎樓、屋頂通風天窗
    const W=3.6, D=1.7, z0=-.7, TR=MK.cream;
    const top=block(0,z0,W,D,2.0,brickMat(),{base:'#8f7a66',trim:TR});
    for(const sx of [-1,1]) for(let y=.25;y<2.1;y+=.3) rbox(.14,.16,.14,TR,sx*W/2,y,z0+D/2,.01);   // 牆角石
    rbox(W+.1,.08,.06,TR,0,1.08,z0+D/2+.01,.01);
    for(const x of [-1.3,-.65,.65,1.3]){ archWin(.26,.5,null,x,1.3,z0+D/2+.005,0,MK.win); rbox(.1,.1,.05,TR,x,1.93,z0+D/2+.02,.01); rbox(.36,.05,.1,TR,x,1.24,z0+D/2+.04,.01); }
    rbox(.8,.05,.2,TR,0,1.62,z0+D/2+.06,.01); const ar=add(new THREE.Mesh(new THREE.TorusGeometry(.4,.06,8,24,Math.PI),mat(TR))); ar.position.set(0,.95,z0+D/2+.04);
    rbox(.8,.8,.04,'#3b3550',0,.16,z0+D/2+.01,.01); woodSign(0,1.45,z0+D/2+.09,.9,.28);
    rbox(W+.12,.14,.14,TR,0,top-.02,z0+D/2+.02,.01);
    rbox(1.4,.3,.7,TR,0,top,z0,.02); for(const sz of [-1,1]){ const r=rbox(1.5,.04,.42,MK.brick2,0,top+.38,z0+sz*.18,.01); r.rotation.x=sz*.35; }   // 屋頂通風天窗
    for(let i=0;i<5;i++) rbox(.18,.12,.02,glassMat,-.5+i*.25,top+.1,z0+.36,.005);
    for(const dx of [-1.35,1.35]) kit(CITY,dx,z0-.3,{node:'1286_Air_Conditioner005',w:.32,y0:top});
    const az=z0+D/2+.55; arcadeRow(-1.65,1.65,az,1.0,MK.brick); rbox(W+.1,.12,.7,TR,0,1.08,az-.3,.02); rbox(W+.14,.05,.74,MK.trim,0,1.2,az-.3,.01);   // 騎樓
    ['FruitBox_Tomato','FruitBox_Banana','FruitBox_Orange','FruitBox_Eggplant'].forEach((b,i)=>{ const x=[-1.2,-.6,.6,1.2][i]; crate(b,x-.1,az-.3,.32,0,.08); basket(x+.18,.08,az-.25,VEG[(i+2)%6]); });   // 沒有攤台，放地上
    for(const x of [-1.2,1.2]) hangScale(x+.15,1.06,az-.15);
    S(-1.0,1.35,.9,[['#8fd36a',0],['#ef4f43',1]]); }
  scooter(-1.6,1.45,.4,MK.cream); if(lv>=2) scooter(1.65,1.3,-.5,MK.brick); if(lv>=3) scooter(1.35,1.6,-.4,MK.cream);
  for(let i=0;i<3;i++) rbox(.26,.12,.2,'#3d7fd0',1.55,.08+i*.125,lv>=2?.45:1.2,.01);   // 一疊空的藍色菜籃
  for(const [x,z,k,c] of [[-1.45,-1.75,.5],[1.5,-1.65,.5,'#6fc463'],[0,-1.95,.45]].slice(0,lv>=3?1:3)) tree(x,z,k,c);
  if(lv>=3){ tree(-2.0,.15,.45,'#6fc463'); tree(2.0,.15,.45); }
}); }

/* ---------- 早餐店（半格）：台灣街角早餐店（家長 11-13 07:54：只有一層、Lv1 小、Lv2 擴大；底盤貼合半格）
   奶油黃牆＋橘色＋木頭色；平頂遮雨棚；前檯不鏽鋼煎台、蒸籠、豆漿桶；菜單板（蛋、吐司、杯子）；屋頂大荷包蛋＋女兒牆＋冷氣機；折疊桌和塑膠椅 ---------- */
const BF={wall:'#e9d8b8', cream:'#f3ead8', orange:'#e98a2e', wood:'#a8703f', trim:'#e2bf7e', pad:'#e9dcc0', steel:'#c9ced6'};
/* 半格底盤：照下半梯形畫（建築中心在格子中心往外 H*.24），四周內縮 inset；在放大前的世界座標畫 */
function halfPad(color,inset=.18,y=0,h=.09){ const R=4.2, Hh=Math.sqrt(3)*R, oz=-Hh*.24, s=new THREE.Shape();
  const hw=z=>R-(z-oz)/(Hh/2)*(R/2);                                                     // z 是建築座標
  const z0=oz+inset, z1=oz+Hh/2-inset;
  [[-(hw(z0)-inset),z0],[hw(z0)-inset,z0],[hw(z1)-inset,z1],[-(hw(z1)-inset),z1]].forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z)); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2);
  const m=add(new THREE.Mesh(g,color&&color.isMaterial?color:mat(color))); m.position.y=y; m.receiveShadow=true; m.userData.noCheck=1; return m; }
/* 地面鋪面（家長 11-19 15:05：診所、便利商店、早餐店的地也要有鋪面）：方磚、紅磚 */
function paveMat(key,draw,rep=.8){ const t=canvasTex(draw); t.repeat.set(rep,rep); return texMat(key,t,rep,rep); }
const squareTiles=(base,joint,n=4)=>(g,S)=>{ g.fillStyle=joint; g.fillRect(0,0,S,S); const q=S/n; let r=3; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){ const c=new THREE.Color(base); c.offsetHSL(0,0,(R()-.5)*.05); g.fillStyle='#'+c.getHexString(); g.fillRect(i*q+2,j*q+2,q-4,q-4); } };
const brickTiles=(base,joint)=>(g,S)=>{ g.fillStyle=joint; g.fillRect(0,0,S,S); const bw=S/4, bh=S/8; let r=5; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let j=0;j<8;j++) for(let i=-1;i<5;i++){ const x=i*bw+(j%2?bw/2:0); const c=new THREE.Color(base); c.offsetHSL(0,0,(R()-.5)*.08); g.fillStyle='#'+c.getHexString(); g.fillRect(x+2,j*bh+2,bw-4,bh-4); } };
const terrazzoTex=canvasTex((g,S)=>{ g.fillStyle='#b9b3a8'; g.fillRect(0,0,S,S); let r=9; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let i=0;i<500;i++){ g.fillStyle=['#e9e4da','#8f8a80','#d2c6b0','#6f6a62'][i%4]; g.beginPath(); g.arc(R()*S,R()*S,1+R()*2.5,0,7); g.fill(); } });   // 磨石子
const metalRibTex=canvasTex((g,S)=>{ g.fillStyle='#d8dbdd'; g.fillRect(0,0,S,S); for(let x=0;x<S;x+=16){ g.fillStyle='#c4c8cc'; g.fillRect(x,0,5,S); g.fillStyle='#e8eaec'; g.fillRect(x+6,0,2,S); } });   // 直條紋金屬外牆
const menuTex=canvasTex((g,s)=>{ g.fillStyle='#8a5a32'; g.fillRect(0,0,s,s); g.fillStyle='#f6ecd2'; g.fillRect(12,16,s-24,s-32);
  g.fillStyle='#ffffff'; g.beginPath(); g.ellipse(s*.2,s*.5,s*.11,s*.17,0,0,7); g.fill(); g.fillStyle='#ffb020'; g.beginPath(); g.ellipse(s*.2,s*.5,s*.045,s*.08,0,0,7); g.fill();   // 荷包蛋
  g.fillStyle='#d9a45a'; g.fillRect(s*.41,s*.28,s*.18,s*.42); g.fillStyle='#f3dca6'; g.fillRect(s*.43,s*.32,s*.14,s*.34);                                              // 吐司
  g.fillStyle='#ffffff'; g.fillRect(s*.72,s*.32,s*.12,s*.4); g.fillStyle='#e98a2e'; g.fillRect(s*.72,s*.46,s*.12,s*.08); g.fillRect(s*.765,s*.16,s*.02,s*.16); },256);   // 杯子
function griddle(x,z,w){ rbox(w,.45,.4,BF.steel,x,0,z,.02); rbox(w,.03,.42,'#9aa0ab',x,.45,z,.005); rbox(w*.6,.02,.3,'#3b3550',x-w*.15,.48,z,.005);   // 前檯＋煎台
  for(const dx of [-.12,.05]){ const e=sphere(.06,'#ffffff',x-w*.15+dx,.5,z); e.scale.y=.25; sphere(.025,'#ffb020',x-w*.15+dx,.51,z); }
  { const fx=o=>o.traverse(m=>{ if(m.isMesh){ m.geometry.computeVertexNormals(); m.material=new THREE.MeshStandardMaterial({map:m.material.map,color:'#f3e2bf',roughness:.85,side:THREE.DoubleSide}); } });
    kit('models/sk/bf_steamer.glb',x+w*.27,z-.03,{h:.24,y0:.46,then:fx}); kit('models/sk/bf_steamer.glb',x+w*.27+.17,z+.05,{h:.17,y0:.46,rot:.8,then:fx}); }   // 竹蒸籠（家長下載的 Bamboo steamer baskets，CC-BY-NC-SA；11-19 取代原本畫的）
  puff(x+w*.3,.7,z,{r:.085,rise:.6,drift:.08,n:4,op:.6,speed:.4});   /* 蒸籠冒熱氣（家長 11-13：試試看） */
  cyl(.09,.09,.24,BF.steel,x+w/2+.15,.0,z,14); cyl(.095,.095,.03,'#9aa0ab',x+w/2+.15,.24,z,14); }   // 豆漿桶
function plasticStool(x,z){ const st=makeStool('#d9a14a'); st.position.set(x,0,z); st.rotation.y=x>0?Math.PI/2:-Math.PI/2; st.scale.setScalar(.62); ROOT.add(st); }   // 自己畫的台灣塑膠椅，淡橘色（家長 11-19 11:06；早餐店有 scaled(1.25)，所以縮小）
function foldTable(x,z){ rbox(.42,.03,.32,'#e2cfa3',x,.36,z,.005); for(const dx of [-.17,.17]) rbox(.03,.36,.03,'#9aa0ab',x+dx,0,z,.004);
  for(const [dx,dz] of [[-.32,0],[.32,0]]) plasticStool(x+dx,z+dz); }
/* A 字立牌：兩片木框板子上端用鉸鍊接在一起、下面往外撐開，中間一條鏈子（參考市售 A-frame 黑板：高約 78cm、寬 45cm、底部撐開約 40cm） */
function aSign(x,z,rot=0){ inRot(x,z,rot,()=>{ const h=.66, w=.46, a=Math.atan2(.2,h);
  for(const sd of [1,-1]){ const g=new THREE.Group(); g.position.set(0,h+.08,0); g.rotation.x=-sd*a; ROOT.add(g);
    for(const sx of [-1,1]) rbox(.04,h,.03,'#8a5a32',sx*(w/2-.02),-h,0,.006,g);                      // 兩支腳（框的左右）
    rbox(w,.04,.03,'#8a5a32',0,-.04,0,.006,g); rbox(w,.04,.03,'#8a5a32',0,-h+.1,0,.006,g);            // 上下橫框
    const f=new THREE.Mesh(new THREE.PlaneGeometry(w-.08,h-.2),new THREE.MeshStandardMaterial({map:menuTex,roughness:.85})); f.position.set(0,-h/2-.02,sd*.018); if(sd<0) f.rotation.y=Math.PI; g.add(f);
    rbox(w-.08,h-.2,.012,'#6e4627',0,-h+.12,0,.003,g); }
  rbox(w-.04,.035,.035,'#9aa0ab',0,h+.05,0,.01);                                // 上面的鉸鍊
  rbox(.008,.008,.3,'#9aa0ab',0,h*.45,0,.002); }); }
function breakfast(lv){
  halfPad(paveMat('bfbrick',brickTiles('#b8705a','#d9c8b0')));                          // 底盤貼合半格；用餐區鋪紅磚（11-19 15:05）
  scaled(1.25,()=>{
  const W=lv>=2?2.9:1.8, D=.85, cx=lv>=2?0:-.35, cz=-.75, fz=cz+D/2;
  const top=block(cx,cz,W,D,1.0,BF.wall,{base:'#d9bf8c',trim:BF.trim});
  { const tm=texMat('bfterr',terrazzoTex,3,.5); rbox(W+.02,.3,D+.02,tm,cx,.16,cz,.01); rbox(W+.05,.03,D+.05,'#a49d90',cx,.45,cz,.006); }   // 下半段一圈磨石子腰牆（11-19 15:05）
  rbox(W,.08,D,'#e8d3a2',cx,top,cz,.02); for(const sz of [-1,1]) rbox(W+.1,.14,.06,BF.trim,cx,top,cz+sz*(D/2+.02),.01); for(const sx of [-1,1]) rbox(.06,.14,D+.1,BF.trim,cx+sx*(W/2+.02),top,cz,.01);   // 女兒牆
  const dx=cx-W/2+.42, ow=W-.95; rbox(ow,.62,.03,'#3b3550',cx+W/2-.15-ow/2,.16,fz+.01,.01);  // 右邊是開放的店面（裡面暗，前面是煎台）
  rbox(.5,.7,.03,BF.orange,dx,.16,fz+.015,.01); rbox(.44,.62,.02,mat('#cfeaf5',{transparent:true,opacity:.55,roughness:.1}),dx,.2,fz+.03,.004);   // 左邊玻璃門（家長 08:39：要有門）
  rbox(.02,.62,.025,'#8a5a32',dx,.2,fz+.035,.004); for(const sx of [-1,1]) rbox(.02,.16,.03,'#c9ced6',dx+sx*.05,.4,fz+.05,.004);
  rbox(.6,.06,.05,BF.orange,dx,.86,fz+.03,.01); rbox(.5,.04,.06,'#d9bf8c',dx,.13,fz+.1,.01);   // 門楣、門口台階
  aSign(cx-W/2-.35,.2,.35);                                                          // 門口 A 字立牌（家長 08:37：兩片上面靠在一起、腳往外撐）
  { const mx=cx+W/2+.03, mz=cz+.05; rbox(.05,.5,.62,'#8a5a32',mx,.4,mz,.01);              // 菜單板：掛在店的右側牆上（家長 08:30：立牌很奇怪）
    const f=new THREE.Mesh(new THREE.PlaneGeometry(.54,.42),new THREE.MeshStandardMaterial({map:menuTex,roughness:.8})); f.position.set(mx+.03,.65,mz); f.rotation.y=Math.PI/2; add(f); }
  // 平頂遮雨棚：橘色＋奶油黃條紋，水平的
  const aw=W+.2, n=Math.round(aw/.22); for(let i=0;i<n;i++) rbox(aw/n+.002,.035,.75,i%2?BF.cream:BF.orange,cx-aw/2+(i+.5)*aw/n,1.18,fz+.36,.005);
  rbox(aw,.08,.05,BF.orange,cx,1.12,fz+.74,.01); for(const sx of [-1,1]) cyl(.025,.025,1.1,'#9aa0ab',cx+sx*(aw/2-.05),.08,fz+.7,6);
  griddle(cx+(lv>=2?.55:.2),fz+.25,.85);
  rbox(.08,.4,.08,'#d9c79a',cx+W/2-.35,top+.08,cz,.01); friedEgg(cx+W/2-.35,top+.68,cz+.05,.8,1.15);   // 屋頂大荷包蛋
  kit(CITY,cx-W/2+.4,cz-.1,{node:'1286_Air_Conditioner005',w:.3,y0:top+.08});
  // 座位、盆栽、機車
  const tables=lv>=2?[[-1.05,.95],[-.2,1.0],[1.2,.9]]:[[-.45,.95]];
  for(const [x,z] of tables) foldTable(x,z);
  for(const x of lv>=2?[-1.6,1.65]:[.75]){ cyl(.1,.08,.18,BF.wood,x,.08,.35,10); bush(x,.35,.35,'#8fd36a'); }
  scooter(lv>=2?.6:1.2,1.1,-1.2,BF.orange);
  for(const [x,z,k,c] of [[-2.3,-1.0,.55],[2.3,-1.0,.55,'#6fc463'],[-2.3,-.25,.45,'#6fc463']].slice(0,lv>=2?3:2)) tree(x,z,k,c);   // 種點樹（家長 08:23）
}); }

/* ---------- 診所（半格，1 級）：台灣巷口診所（家長 08:43）——三層透天厝，一樓診所有騎樓
   米色二丁掛磁磚；騎樓上方綠底大燈箱「診所」＋「內科 小兒科」、牆邊直立燈箱＋綠十字；二三樓住家（鐵窗、冷氣機、陽台盆栽）；屋頂水塔＋鐵皮小屋；騎樓停機車；半格底盤 ---------- */
const CL={tile:'#dcc6a2', tile2:'#c9ad84', green:'#2f9e6b', wood:'#a8703f', iron:'#6f7680', trim:'#cdb48a'};
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
const clSignTex=rectTex(1024,160,(g,w,h)=>{ g.fillStyle=CL.green; g.fillRect(0,0,w,h); g.strokeStyle='#ffffff'; g.lineWidth=6; g.strokeRect(10,10,w-20,h-20);
  g.fillStyle='#ffffff'; g.textAlign='center'; g.textBaseline='middle'; g.font=`bold ${h*.62}px "Noto Sans CJK TC",sans-serif`; g.fillText('木星小兒科',w/2,h*.54); });   // 家長 08:48：招牌寫「木星小兒科」
const clVertTex=rectTex(160,400,(g,w,h)=>{ g.fillStyle='#f6f1e4'; g.fillRect(0,0,w,h); g.fillStyle=CL.green; g.textAlign='center'; g.textBaseline='middle';
  g.font=`bold ${h*.16}px "Noto Sans CJK TC",sans-serif`; [...'木星小兒科'].forEach((ch,i)=>g.fillText(ch,w/2,h*(.11+i*.195))); });
function texBox(w,h,d,tex,side,x,y,z,ry=0){ const sm=mat(side), m=add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[sm,sm,sm,sm,new THREE.MeshStandardMaterial({map:tex,roughness:.6,emissive:0x222222,emissiveIntensity:.2}),sm])); m.position.set(x,y,z); m.rotation.y=ry; return m; }
function ironWin(x,y,z,w,h){ win(x,y,z,w,h,0,'#e9e1cf'); rbox(w+.12,h+.1,.1,CL.iron,x,y-.05,z+.07,.005).material=mat(CL.iron,{transparent:true,opacity:0});   // 鐵窗外框（看不到的盒子當位置）
  for(let i=0;i<=5;i++) rbox(.015,h+.06,.015,CL.iron,x-w/2-.03+i*(w+.06)/5,y-.03,z+.1,.002); for(const yy of [y-.03,y+h+.02]) rbox(w+.1,.02,.12,CL.iron,x,yy,z+.06,.003); }
function clinic(){
  halfPad(paveMat('clpave',squareTiles('#e6e2da','#c9c3b8')));   // 灰白方磚人行道（11-19 15:05）
  scaled(1.25,()=>{
  const W=2.1, D=1.0, cx=-.15, cz=-.7, fz=cz+D/2, gf=.95, fh=.72, nf=2, arc=.45;   // gf 一樓高、騎樓深 arc
  const wall=wallMat(CL.tile,W,nf*fh+gf), pil=texMat('clpil',stoneTex('#d2cdc3','rgba(90,85,80,.4)'),1,3);   // 米色二丁掛（紋路明顯一點）；騎樓柱淺灰切石（11-19 15:05）
  // 一樓：退後的店面（玻璃拉門、看得到候診椅）、騎樓柱子、騎樓地磚
  rbox(W,.1,D,'#cfc3ad',cx,0,cz,.02);
  rbox(W-.04,gf,D-arc,wall,cx,.1,cz-arc/2,.02);
  const sf=fz-arc; rbox(W-.3,.7,.02,'#3b3550',cx,.12,sf+.005,.004);
  for(let i=0;i<5;i++){ const x=cx-.65+i*.3; rbox(.16,.18,.14,'#4a8fd0',x,.12,sf-.15,.01); rbox(.16,.14,.03,'#4a8fd0',x,.3,sf-.22,.005); }   // 候診椅
  rbox(W-.3,.7,.025,mat('#cfeaf5',{transparent:true,opacity:.45,roughness:.1}),cx,.12,sf+.02,.004); for(const x of [cx-.45,cx,cx+.45]) rbox(.025,.7,.035,'#c9ced6',x,.12,sf+.03,.004);   // 玻璃拉門
  for(const sx of [-1,1]) rbox(.16,gf,.16,pil,cx+sx*(W/2-.08),.1,fz-.08,.01);             // 騎樓柱
  // 二、三樓（蓋在騎樓上面）
  const y0=.1+gf; rbox(W+.04,.1,D+.04,CL.trim,cx,y0-.05,cz,.01);
  rbox(W,nf*fh,D,wall,cx,y0+.05,cz,.02); const top=y0+.05+nf*fh;
  texBox(W-.1,.32,.08,clSignTex,'#257f56',cx,y0+.2,fz+.06);                               // 騎樓上方大燈箱
  // 二樓陽台＋盆栽；三樓鐵窗；牆上冷氣機
  const y2=y0+.05, y3=y0+.05+fh;
  rbox(W-.2,.05,.3,CL.trim,cx,y2+.38,fz+.14,.01); for(let i=0;i<=10;i++) rbox(.02,.24,.02,CL.iron,cx-(W-.2)/2+i*(W-.2)/10,y2+.43,fz+.28,.003); rbox(W-.2,.03,.03,CL.iron,cx,y2+.67,fz+.28,.003);
  win(cx-.45,y2+.43,fz+.005,.5,.42,0,'#e9e1cf'); rbox(.4,.55,.02,'#8a5a32',cx+.4,y2+.43,fz+.005,.005);   // 二樓窗和陽台門
  for(const x of [cx-.75,cx+.05,cx+.75]){ cyl(.07,.06,.12,'#b5533c',x,y2+.43,fz+.18,10); onY(y2+.5,()=>bush(x,fz+.18,.25,'#8fd36a')); }
  /* 家長 11-13 12:35：三樓窗戶不要、牆上冷氣機拿掉 */
  // 牆邊直立燈箱＋綠十字
  const vx=cx+W/2+.055;
  { /* 家長 11-13 12:54：直立招牌從正面牆伸出來，用兩支黑鐵桿接到牆上（像參考圖的招牌燈） */
    const sx=cx+W/2-.03, sz=fz+.3, IRON='#2f2f36';
    texBox(.34,.8,.08,clVertTex,'#e6dfcf',sx,y2+.75,sz,Math.PI/2);   /* texBox 的 y 是中心 */
    for(const y of [y2+.48,y2+.98]) rbox(.05,.05,.24,IRON,sx,y,fz+.12,.008);            // 兩支橫桿：從牆一路插進招牌側邊（家長 11-13 14:04 沒接好）
    rbox(.1,.7,.04,IRON,sx,y2+.4,fz+.02,.008); }                                        // 牆上的固定鐵板
  { const gm=new THREE.MeshStandardMaterial({color:CL.green,emissive:CL.green,emissiveIntensity:.1}); rbox(.08,.26,.26,'#ffffff',vx,y3+.38,fz-.05,.02); rbox(.1,.07,.2,gm,vx,y3+.47,fz-.05,.004); rbox(.1,.2,.07,gm,vx,y3+.4,fz-.05,.004);
    anims.push(t=>{ gm.emissiveIntensity=.1+.9*Math.max(0,Math.sin(t*2.2)); }); }   /* 綠十字燈一閃一閃（家長 11-13） */
  // 屋頂：女兒牆、水塔、鐵皮小屋
  for(const sz of [-1,1]) rbox(W+.08,.18,.06,CL.trim,cx,top,cz+sz*(D/2+.01),.01); for(const sx of [-1,1]) rbox(.06,.18,D+.08,CL.trim,cx+sx*(W/2+.01),top,cz,.01);
  rbox(.8,.42,.6,'#b9c3cc',cx-.45,top,cz-.15,.01); const r=rbox(.92,.04,.72,'#8fa3b5',cx-.45,top+.47,cz-.15,.01); r.rotation.x=.12;
  for(let i=0;i<6;i++) rbox(.02,.43,.61,'#a7b3bf',cx-.8+i*.14,top,cz-.15,.002);
  for(const [dx,dz] of [[-.12,-.12],[.12,-.12],[-.12,.12],[.12,.12]]) cyl(.015,.015,.25,CL.iron,cx+.55+dx,top,cz-.1+dz,5);
  cyl(.2,.2,.38,'#d7dce2',cx+.55,top+.25,cz-.1,16); cyl(.21,.21,.03,'#b9c0c8',cx+.55,top+.63,cz-.1,16);
  // 騎樓下停機車、門口長椅和花
  scooter(cx-.55,fz-.15,Math.PI/2+.1,'#e5484d'); scooter(cx+.6,fz-.15,Math.PI/2-.1,'#5b8fd0');
  bench(cx+1.35,fz+.75,0); for(const x of [cx-.95,cx+.6]) kit(SUB('planter'),x,fz+.55,{w:.3});
  rbox(.55,.11,.6,paveMat('clmat',squareTiles('#b9b3a8','#9d978c',6),1),cx,0,fz+.5,.02);   // 門口深一點的止滑磚
  for(const [x,z,k,c] of [[-2.3,-1.0,.55],[2.25,-1.0,.55,'#6fc463'],[-1.8,.35,.42,'#6fc463']]) tree(x,z,k,c);
}); }

/* ---------- 便利商店（半格，1 級）：台灣巷口便利商店（家長 11-13 10:01）——兩層透天厝，一樓店面有騎樓
   淺咖啡二丁掛；騎樓上方三色條紋燈箱「木星商店」；整面玻璃看得到冷藏櫃和貨架；騎樓下 ATM、垃圾桶和回收桶、機車；旁邊公共腳踏車站（橘黃配白，不放商標）；二樓住家（窗台、冷氣機、陽台曬衣服）；屋頂水塔和鐵皮小屋；半格底盤 ---------- */
const CV={tile:'#cdb08a', trim:'#b99a72', iron:'#6f7680'};
const cvSignTex=rectTex(1024,160,(g,w,h)=>{ const C=['#2fa36b','#f39a2b','#e04848']; for(let i=0;i<3;i++){ g.fillStyle=C[i]; g.fillRect(0,i*h/3,w,h/3+1); }
  g.fillStyle='rgba(255,255,255,.92)'; g.fillRect(w*.2,h*.12,w*.6,h*.76); g.fillStyle='#2b6b4a'; g.textAlign='center'; g.textBaseline='middle'; g.font=`bold ${h*.56}px "Noto Sans CJK TC",sans-serif`; g.fillText('木星商店',w/2,h*.53); });
function pubBike(x,z,rot){ const g=new THREE.Group(); g.position.set(x,.11,z); g.rotation.y=rot; ROOT.add(g);   // 公共腳踏車：橘黃車架、白籃子，不放商標
  for(const dx of [-.2,.2]){ const w=add(new THREE.Mesh(new THREE.TorusGeometry(.12,.018,6,20),mat('#3b3550')),g); w.position.set(dx,.13,0); }
  beam([x-.2*Math.cos(rot),.24,z+.2*Math.sin(rot)],[x,.41,z],.018,'#f2a51a'); beam([x+.2*Math.cos(rot),.24,z-.2*Math.sin(rot)],[x,.41,z],.018,'#f2a51a');
  rbox(.4,.03,.03,'#f2a51a',0,.3,0,.006,g); rbox(.03,.18,.03,'#f2a51a',.18,.3,0,.006,g); rbox(.03,.03,.24,'#3b3550',.18,.48,0,.004,g);
  rbox(.12,.08,.14,'#f4f2ee',.27,.36,0,.01,g); rbox(.1,.03,.07,'#3b3550',-.12,.34,0,.01,g); }
function bikeDock(x0,z,n){ rbox(.35,.13,n*.32+.1,'#d6d2c8',x0,0,z+(n-1)*.16,.01);
  for(let i=0;i<n;i++){ const zz=z+i*.32; rbox(.06,.32,.06,'#f2a51a',x0-.1,.09,zz,.01); rbox(.07,.05,.07,'#3b3550',x0-.1,.36,zz,.005); pubBike(x0+.12,zz,0); }
  rbox(.1,.55,.12,'#f2a51a',x0-.1,.09,z-.35,.01); rbox(.08,.18,.02,'#3b3550',x0-.1,.4,z-.28,.004); }   // 站牌機台
/* 木星商店 logo（家長 10:11 選 A）：薄荷綠圓形，中間米色＋橘色條紋的木星和紅色大紅斑 */
function drawJupLogo(g,cx,cy,r,text=true){ g.fillStyle='#7fcfb0'; g.beginPath(); g.arc(cx,cy,r,0,7); g.fill();
  g.save(); g.beginPath(); g.arc(cx,cy-r*.16,r*.51,0,7); g.clip(); g.fillStyle='#fff8ea'; g.fillRect(cx-r,cy-r,2*r,2*r);
  for(const [y,h,c] of [[-.48,.1,'#f2c38a'],[-.27,.14,'#e9a66a'],[0,.09,'#f2c38a'],[.19,.07,'#e9a66a']]){ g.fillStyle=c; g.fillRect(cx-r,cy-r*.16+y*r,2*r,h*r); }
  g.fillStyle='#d9603e'; g.beginPath(); g.ellipse(cx+r*.2,cy-r*.07,r*.13,r*.07,0,0,7); g.fill(); g.restore();
  if(text){ g.fillStyle='#ffffff'; g.textAlign='center'; g.textBaseline='middle'; g.font=`bold ${r*.28}px "Noto Sans CJK TC",sans-serif`; g.fillText('木星商店',cx,cy+r*.6); } }
function conv(){   // 家長 10:06：要有現代感、用一開始診所的薄荷綠色調、不用太多台灣特色——一層樓的現代店面
  const MINT='#7fcfb0', MINT2='#5fb894', WALL='#efe3c8';
  halfPad(paveMat('cvpave',squareTiles('#e6e2da','#c9c3b8')));   // 門口灰白方磚（11-19 15:05）
  scaled(1.25,()=>{
  const W=2.6, D=1.05, cx=-.3, cz=-.7, fz=cz+D/2, h=1.1;
  rbox(W+.12,.1,D+.12,'#d9d2c4',cx,0,cz,.02); rbox(W,.04,D,'#f4f1ea',cx,.1,cz,.005);          // 地基、店內地板
  { const mw=texMat('cvrib',metalRibTex,W*2,1), ms=texMat('cvribs',metalRibTex,D*2,1); rbox(W,h,.1,mw,cx,.1,cz-D/2+.05,.02); for(const sx of [-1,1]) rbox(.1,h,D,ms,cx+sx*(W/2-.05),.1,cz,.02); }   // 後牆、兩邊牆：淺灰直條紋金屬外牆（11-19 15:05）
  /* 家長 11-13 14:04：店裡的櫃子穿出後牆——改用深度 d 定大小，貼著後牆內側放 */
  kit(MKT,cx-.75,cz-.24,{node:'Freezer_tall_grocery',d:.3,y0:.14}); kit(MKT,cx-.05,cz-.2,{node:'Grocery_Stagger',d:.4,y0:.14}); kit(MKT,cx+.75,cz-.25,{node:'SodaDispenser',d:.28,y0:.14});
  // 整面玻璃（細框）＋中間自動門
  rbox(W-.2,.82,.025,mat('#d6f0f2',{transparent:true,opacity:.3,roughness:.05}),cx,.14,fz-.02,.004);
  for(const x of [cx-1.05,cx-.55,cx+.55,cx+1.05]) rbox(.025,.82,.035,'#d5d8de',x,.14,fz-.01,.004);
  for(const x of [cx-.25,cx+.25]) rbox(.03,.82,.04,MINT2,x,.14,fz,.004); rbox(.5,.03,.04,MINT2,cx,.95,fz,.004);
  // 薄荷綠招牌帶：繞前面和兩側，正面白字「木星商店」
  const band=rectTex(1024,128,(g,w,hh)=>{ g.fillStyle=MINT; g.fillRect(0,0,w,hh); g.fillStyle='#ffffff'; g.textAlign='center'; g.textBaseline='middle'; g.font=`bold ${hh*.6}px "Noto Sans CJK TC",sans-serif`; g.fillText('木星商店',w*.55,hh*.54); g.fillStyle='#fff8ea'; g.beginPath(); g.arc(w*.2,hh/2,hh*.46,0,7); g.fill(); drawJupLogo(g,w*.2,hh/2,hh*.42,false); });
  texBox(W+.08,.3,.08,band,MINT,cx,h+.1,fz+.01); for(const sx of [-1,1]) rbox(.08,.3,D+.06,MINT,cx+sx*(W/2+.0),h-.05,cz,.01);
  rbox(W+.12,.06,D+.12,'#f4f1ea',cx,h+.25,cz,.01);                                            // 白色屋簷線
  rbox(1.2,.04,.45,'#f4f1ea',cx,.98,fz+.22,.01); rbox(1.22,.03,.47,MINT,cx,1.02,fz+.22,.005);   // 門口薄雨庇
  for(const dx of [-.6,.6]) kit(CITY,cx+dx,cz-.15,{node:'1286_Air_Conditioner005',w:.3,y0:h+.28});
  // 參考日本便利商店（家長 10:08 說參考 LAWSON；只學格局，不用它的商標和藍色）：門口不放桌椅；分類垃圾桶有標示；前面畫停車格；路邊一支立柱招牌；店裡亮燈
  rbox(W-.3,.03,D-.3,mat('#fffbe8',{emissive:0xfff2c0,emissiveIntensity:.8}),cx,1.06,cz,.005);   // 天花板燈（從玻璃看進去是亮的）
  const BIN=[['一般垃圾','#9aa0ab'],['資源回收',MINT2],['瓶罐','#4a8fd8']];
  BIN.forEach(([t,c],i)=>{ const x=cx+.62+i*.24, z=fz+.18; rbox(.2,.34,.2,c,x,.1,z,.03); rbox(.22,.04,.22,'#6f7680',x,.44,z,.01); rbox(.1,.02,.03,'#3b3550',x,.38,z+.1,.003);   // 投入口
    const tx=rectTex(128,128,(g,w,h)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); g.fillStyle=c; g.fillRect(0,0,w,h*.18); g.fillStyle='#3b3550'; g.textAlign='center'; g.textBaseline='middle';
      g.font=`bold ${t.length>2?28:36}px "Noto Sans CJK TC",sans-serif`; g.fillText(t,w/2,h*.42); g.strokeStyle=c; g.lineWidth=7; g.beginPath(); for(let k=0;k<3;k++){ const a=k*2*Math.PI/3-Math.PI/2; g.moveTo(w/2+Math.cos(a)*16,h*.76+Math.sin(a)*16); g.lineTo(w/2+Math.cos(a+2*Math.PI/3)*16,h*.76+Math.sin(a+2*Math.PI/3)*16); } g.stroke(); });   // 標示：名稱＋回收三角
    const m=new THREE.Mesh(new THREE.PlaneGeometry(.17,.17),new THREE.MeshStandardMaterial({map:tx,roughness:.7})); m.position.set(x,.24,z+.101); add(m); });
  rbox(1.62,.092,.82,mat('#a9a8a4',{roughness:.95}),cx-.2,0,fz+.98,.01);   // 停車格那塊淺灰柏油
  for(let i=0;i<=3;i++) rbox(.03,.095,.6,'#ffffff',cx-.95+i*.5,0,fz+1.0,.004); for(let i=0;i<3;i++) rbox(.3,.1,.07,'#c9ced6',cx-.7+i*.5,0,fz+.78,.01);   // 停車格＋車擋
  { const px=-1.75, pz=.75; cyl(.05,.05,1.6,'#d5d8de',px,0,pz,10);                                 // 路邊立柱招牌
    texBox(.62,.62,.1,rectTex(256,256,(g,w,hh)=>{ g.fillStyle='#fff8ea'; g.fillRect(0,0,w,hh); drawJupLogo(g,w/2,hh/2,w*.46); }),MINT2,px,1.6,pz); }
  bikeDock(1.55,-.6,3);
  for(const [x,z,k,c] of [[-2.3,-1.0,.55],[2.3,-1.05,.55,'#6fc463'],[-1.9,.3,.42,'#6fc463']]) tree(x,z,k,c);
}); }

/* ---------- 社區公園（家長 11-13 10:21～10:33：改一整格、2 級；松鼠和小鳥會動；不要垃圾桶、不要長輩健身器材、要沙坑；補充包的花不要用）
   Lv1 草地底盤＋石邊、前面橫向石板步道、大榕樹＋樹下長椅、圓形花圃、後面矮樹籬、兩盞燈、長椅、松鼠和小鳥
   Lv2 右邊遊戲區（橘色軟墊、溜滑梯、盪鞦韆、沙坑）、中間花圃換小噴水池、多兩棵樹和一張長椅、更多松鼠小鳥 ---------- */
function squirrel(x,z,rot=0,y=0,r=.5){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rot; g.scale.setScalar(.75); ROOT.add(g); animals.push({g,kind:'squirrel',x0:x,z0:z,y0:y,r,ph:Math.random()*9}); const C='#a8693c';
  const b=sphere(.07,C,0,.08,0,{},g); b.scale.set(1,1.15,.9); sphere(.05,C,.04,.18,0,{},g); sphere(.012,'#2a2230',.085,.19,.025,{},g); sphere(.012,'#2a2230',.085,.19,-.025,{},g);
  for(const sz of [-1,1]) sphere(.018,C,.03,.24,sz*.025,{},g); sphere(.03,'#f3dcc0',.05,.06,0,{},g);
  for(let i=0;i<5;i++){ const t=i/4; sphere(.045-.004*i,'#b8774a',-.08-.03*Math.sin(t*2.6),.06+.2*t,0,{},g); } }   // 大尾巴往上捲
export function bird(x,z,rot=0,y=0,c='#7a6a5a',perch=false,r=.7){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rot; ROOT.add(g); animals.push({g,kind:'bird',x0:x,z0:z,y0:y,r,perch,ph:Math.random()*9});
  const b=sphere(.045,c,0,.05,0,{},g); b.scale.set(1.3,.9,.9); sphere(.03,c,.05,.09,0,{},g); sphere(.02,'#f3e3c8',.02,.035,0,{},g);
  const k=add(new THREE.Mesh(new THREE.ConeGeometry(.012,.035,6),mat('#f2b43a')),g); k.rotation.z=-Math.PI/2; k.position.set(.09,.09,0);
  rbox(.05,.012,.03,c,-.06,.06,0,.004,g); for(const sz of [-1,1]) cyl(.004,.004,.03,'#e09a3a',0,0,sz*.015,4,g); }
const PARK_T='models/park/trees.glb', PARK_F='models/park/flowers.glb';   // 家長補充包：low_poly_tree_set、Quaternius Flowers
const ptree=(id,x,z,h)=>kit(PARK_T,x,z,{node:'Lowpoly_Tree_'+id,h});
/* ── 社區公園小零件 ── */
function stick(A,B,r,c,parent){ const a=new THREE.Vector3(...A), b=new THREE.Vector3(...B), L=a.distanceTo(b);   // 兩點之間的圓桿
  const m=add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,8),M(c)),parent); m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); return m; }
function ribbon(pts,w,c,y=0){ // 平滑彎曲的步道（鋪在地上的帶子）
  const cv=new THREE.CatmullRomCurve3(pts.map(([x,z])=>new THREE.Vector3(x,0,z))), P=cv.getPoints(64), pos=[], idx=[];
  P.forEach((p,i)=>{ const t=cv.getTangent(i/64), nx=-t.z, nz=t.x; pos.push(p.x+nx*w/2,y,p.z+nz*w/2, p.x-nx*w/2,y,p.z-nz*w/2); if(i) idx.push(2*i-2,2*i-1,2*i, 2*i-1,2*i+1,2*i); });
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
  const m=add(new THREE.Mesh(g,mat(c,{side:THREE.DoubleSide}))); m.castShadow=false; m.userData.noCheck=1; return m; }
function path(pts,w=.5){ ribbon(pts,w+.1,'#c9bfa8',.012); ribbon(pts,w,'#efe7d6',.02); }          // 步道＋邊石
function disk(r1,r2,c,x,y,z){ const m=add(new THREE.Mesh(new THREE.RingGeometry(r1,r2,48),mat(c,{side:THREE.DoubleSide}))); m.rotation.x=-Math.PI/2; m.position.set(x,y,z); m.castShadow=false; return m; }
function hedgeRing(Rh,gate){ // 圓頂矮樹籬，角落用圓柱接起來，前面留入口
  const V=[...Array(6)].map((_,i)=>[Rh*Math.cos(i*Math.PI/3),Rh*Math.sin(i*Math.PI/3)]);
  for(let i=0;i<6;i++){ const A=V[i], B=V[(i+1)%6]; cyl(.15,.15,.3,'#4c9a50',A[0],0,A[1],14); sphere(.15,'#4c9a50',A[0],.3,A[1]).scale.y=.5;
    const segs=i===1?[[A,[gate,A[1]]],[[-gate,A[1]],B]]:[[A,B]];
    for(const [P,Q] of segs){ const m=rbox(Math.hypot(Q[0]-P[0],Q[1]-P[1]),.3,.28,'#56a85a',(P[0]+Q[0])/2,0,(P[1]+Q[1])/2,.12); m.rotation.y=-Math.atan2(Q[1]-P[1],Q[0]-P[0]); } }
  for(const sx of [-1,1]){ cyl(.08,.09,.42,'#d9d2c2',sx*gate,0,Rh*Math.sin(Math.PI/3),12); sphere(.09,'#d9d2c2',sx*gate,.45,Rh*Math.sin(Math.PI/3)); } }
/* 搖搖樂：鴨子或小馬，坐在彈簧上（家長 10:39 參考圖） */
function springRider(x,z,rot,kind,c1,c2,k=1){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; g.scale.setScalar(k); ROOT.add(g);
  cyl(.12,.13,.03,'#6f7680',0,0,0,16,g);
  for(let i=0;i<5;i++){ const t=add(new THREE.Mesh(new THREE.TorusGeometry(.05,.014,6,14),mat('#c7ccd4',{metalness:.4,roughness:.4})),g); t.rotation.x=Math.PI/2; t.position.y=.05+i*.032; }
  const body=sphere(.15,c1,0,.33,0,{},g); body.scale.set(1.45,.75,.95);
  rbox(.16,.04,.16,c2,-.04,.42,0,.02,g);                                                           // 椅墊
  for(const sz of [-1,1]){ rbox(.07,.03,.04,'#3b3550',.02,.24,sz*.15,.015,g); }                    // 踏腳
  if(kind==='duck'){ sphere(.1,c1,.17,.5,0,{},g); const bk=add(new THREE.Mesh(new THREE.ConeGeometry(.04,.1,10),mat('#f39a2b')),g); bk.rotation.z=-Math.PI/2; bk.position.set(.29,.49,0);
    const tail=add(new THREE.Mesh(new THREE.ConeGeometry(.06,.12,10),M(c1)),g); tail.rotation.z=Math.PI/2.6; tail.position.set(-.23,.4,0); }
  else { const n=rbox(.1,.16,.1,c1,.15,.36,0,.04,g); n.rotation.z=-.35; rbox(.18,.1,.1,c1,.23,.48,0,.045,g); rbox(.06,.06,.08,'#f4f2ee',.31,.47,0,.02,g);
    for(const sz of [-1,1]){ const e=add(new THREE.Mesh(new THREE.ConeGeometry(.022,.06,6),M(c1)),g); e.position.set(.18,.58,sz*.03); }
    rbox(.05,.12,.03,c2,.12,.47,0,.02,g); const tl=rbox(.04,.12,.04,c2,-.22,.3,0,.02,g); tl.rotation.z=.6; }
  for(const sz of [-1,1]){ sphere(.016,'#222',kind==='duck'?.24:.27,kind==='duck'?.53:.51,sz*.06,{},g); }
  stick([.1,.5,-.1],[.1,.5,.1],.012,'#3b3550',g); for(const sz of [-1,1]) sphere(.022,c2,.1,.5,sz*.11,{},g); }   // 把手
function sandbox(x,z,w,d,big){ // 木框沙坑：粗木框、沙丘、小城堡、水桶和鏟子
  for(const sz of [-1,1]) rbox(w,.14,.12,'#b07a46',x,0,z+sz*(d/2-.06),.035); for(const sx of [-1,1]) rbox(.12,.14,d-.2,'#b07a46',x+sx*(w/2-.06),0,z,.035);
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) rbox(.2,.15,.2,'#c58c55',x+sx*(w/2-.1),0,z+sz*(d/2-.1),.04);
  rbox(w-.2,.1,d-.2,'#f2dca6',x,0,z,.02); const dune=sphere(.22,'#ead09a',x-w*.22,.08,z+.02); dune.scale.set(1.3,.35,1);
  const cx=x+w*.18, cz=z-.03; rbox(.22,.08,.18,'#e6c88d',cx,.1,cz,.01); for(const [dx,dz] of [[-.1,-.08],[.1,-.08],[-.1,.08],[.1,.08]]){ cyl(.035,.035,.13,'#e6c88d',cx+dx,.1,cz+dz,10); const c=add(new THREE.Mesh(new THREE.ConeGeometry(.045,.07,10),mat('#e5484d'))); c.position.set(cx+dx,.27,cz+dz); }
  const bx=x-w*.32, bz=z+d*.2; cyl(.055,.04,.09,'#4a8fd8',bx,.1,bz,14); const hd=add(new THREE.Mesh(new THREE.TorusGeometry(.05,.006,4,14,Math.PI),mat('#2d5f9c'))); hd.position.set(bx,.19,bz);
  const sh=new THREE.Group(); sh.position.set(x+w*.02,.12,z+d*.22); sh.rotation.y=.7; ROOT.add(sh); rbox(.17,.015,.02,'#f2c230',-.07,0,0,.006,sh); rbox(.08,.012,.07,'#f2c230',.06,0,0,.006,sh);
  if(big){ cyl(.05,.04,.08,'#e5484d',x+w*.36,.1,z+d*.22,14); const t2=add(new THREE.Mesh(new THREE.ConeGeometry(.05,.1,10),mat('#41b98f'))); t2.position.set(x-w*.05,.16,z-d*.2); t2.rotation.z=1.4; } }
function playMat(x,z,w,d){ rbox(w+.08,.03,d+.08,'#b8452c',x,0,z,.03); rbox(w,.045,d,'#e0603e',x,0,z,.03); }   // 橘紅軟墊（家長 10:39）
function slideTower(x,z,rot){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; ROOT.add(g); const Y=.55, s=.2, BL='#4a8fd8';
  for(const [dx,dz] of [[-s,-s],[s,-s],[-s,s],[s,s]]) cyl(.025,.025,1.02,BL,dx,.04,dz,10,g);
  rbox(.46,.05,.46,'#f2c230',0,Y,0,.015,g);
  const roof=add(new THREE.Mesh(new THREE.ConeGeometry(.36,.22,4),mat('#e5484d',{flatShading:true})),g); roof.rotation.y=Math.PI/4; roof.position.y=1.17;
  for(const dz of [-s,s]) stick([-s,Y+.25,dz],[s,Y+.25,dz],.015,BL,g); stick([-s,Y+.25,-s],[-s,Y+.25,s],.015,BL,g);   // 欄杆
  for(const dz of [-.11,.11]) stick([-s-.32,.04,dz],[-s,Y+.05,dz],.017,'#f2c230',g);                                    // 梯子
  for(let i=1;i<5;i++){ const t=i/5; stick([-s-.32+.32*t,.04+(Y)*t,-.11],[-s-.32+.32*t,.04+(Y)*t,.11],.011,'#f2c230',g); }
  const sl=new THREE.Group(); sl.position.set(s+.02,Y+.03,0); sl.rotation.z=-.62; g.add(sl);                            // 溜滑梯
  rbox(.78,.025,.24,'#41b98f',.39,0,0,.01,sl); for(const sz of [-1,1]) rbox(.78,.07,.025,'#2f9a76',.39,0,sz*.12,.01,sl);
  const ex=s+.02+.78*Math.cos(.62), ey=Y+.03-.78*Math.sin(.62);                                     /* 家長 11-13：出口接在滑道尾端，用腳撐到地面 */
  rbox(.24,.025,.24,'#41b98f',ex+.11,ey-.025,0,.01,g); for(const sz of [-1,1]) rbox(.24,.07,.025,'#2f9a76',ex+.11,ey-.025,sz*.12,.01,g);
  for(const sz of [-.09,.09]) cyl(.02,.02,ey-.05,'#4a8fd8',ex+.18,.045,sz,8,g); }
function swings(x,z,rot){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; ROOT.add(g); const W=.42, Y=.82, C='#e5484d';
  for(const sx of [-1,1]){ stick([sx*W,.04,-.25],[sx*W,Y,0],.024,C,g); stick([sx*W,.04,.25],[sx*W,Y,0],.024,C,g); }
  stick([-W-.04,Y,0],[W+.04,Y,0],.026,C,g);
  for(const [x0,c] of [[-.18,'#f2c230'],[.18,'#4a8fd8']]){ const pv=new THREE.Group(); pv.position.set(x0,Y,0); g.add(pv);   /* 鞦韆前後盪（家長 11-13） */
    for(const dx of [-.07,.07]) stick([dx,0,0],[dx,.26-Y,0],.005,'#6f7680',pv); rbox(.19,.025,.09,c,0,.25-Y,0,.01,pv);
    anims.push(t=>{ pv.rotation.x=Math.sin(t*1.9+x0*9)*.38; }); } }
function park(lv){
  hexPad('#ddd6c8',.3,.06); hexPad('#9fd27a',.48,.09);                                              // 石邊＋草地底盤（貼合六角格）
  scaled(1.3,()=>onY(.085,()=>{
  /* hedgeRing(2.6,.42);  家長 11-13 13:38：外圈樹籬太拘束，拿掉（函式保留） */
  const G=2.6*Math.sin(Math.PI/3);
  if(lv<2){ // Lv1：S 形步道從入口彎到後面、左邊小水池、右後沙坑、右前搖搖樂
    path([[0,G+.1],[.3,1.3],[-.15,.45],[-.55,-.35],[-.25,-1.15],[.25,-1.75]]);
    const px=-1.3, pz=.5; cyl(.56,.6,.1,'#d6cfc0',px,0,pz,36); add(new THREE.Mesh(new THREE.TorusGeometry(.5,.07,8,36),mat('#e8e2d4'))).rotation.x=-Math.PI/2; ROOT.children.at(-1).position.set(px,.12,pz);
    cyl(.48,.48,.03,mat('#62c6e8',{roughness:.08,metalness:.1}),px,.09,pz,36); for(const [dx,dz] of [[.22,-.1],[-.1,.2]]){ const l=cyl(.06,.06,.01,'#5fb35a',px+dx,.125,pz+dz,12); }
    sandbox(1.05,-.8,1.05,.75,false);
    playMat(1.05,.85,1.0,.8); springRider(.8,.85,.3,'duck','#f2c230','#e5484d',0.80); springRider(1.3,.9,-.2,'horse','#e5484d','#f2c230',0.77);
    bench(-1.45,-.6,.7); bench(-.95,-1.45,.35);
    bush(-1.9,-.2,1.1,''); bush(.65,1.85,1,''); bush(1.75,-.1,1,''); bush(-.6,1.6,.9,'');
    ptree('12',-1.4,-1.3,1.35); ptree('13',.5,-1.95,1.15); ptree('04',-2.05,1.05,1.0); }
  else { // Lv2：中間噴水池廣場、後面大沙坑、右邊遊戲區（溜滑梯、盪鞦韆、搖搖樂）
    const fx=-.75, fz=.25; path([[0,G+.1],[-.15,1.6],[fx+.3,fz+.9]]); 
    disk(0,1.0,'#c9bfa8',fx,.014,fz); disk(0,.94,'#efe7d6',fx,.022,fz); disk(.6,.63,'#d8cfbb',fx,.026,fz);    // 圓形廣場
    cyl(.6,.64,.14,'#d6d2c8',fx,0,fz,40); add(new THREE.Mesh(new THREE.TorusGeometry(.6,.06,8,40),mat('#ebe7de'))).rotation.x=-Math.PI/2; ROOT.children.at(-1).position.set(fx,.15,fz);
    cyl(.55,.55,.03,mat('#62c6e8',{roughness:.08,metalness:.1}),fx,.125,fz,40);
    cyl(.07,.09,.4,'#e3dfd6',fx,.12,fz,14); cyl(.28,.12,.1,'#ebe7de',fx,.5,fz,24); cyl(.25,.25,.02,mat('#62c6e8',{roughness:.08}),fx,.585,fz,24);
    cyl(.04,.05,.18,'#e3dfd6',fx,.58,fz,10); cyl(.12,.06,.06,'#ebe7de',fx,.74,fz,16); sphere(.06,mat('#bfe9f7',{transparent:true,opacity:.75}),fx,.84,fz);
    { const dm=mat('#cfefff',{transparent:true,opacity:.85}); const ds=[...Array(10)].map(()=>sphere(.022,dm,fx,.84,fz));   /* 噴水池頂端噴水：水珠往外拋、落回水盤（家長 11-13） */
      anims.push(t=>ds.forEach((d,i)=>{ const k=(t*.9+i/10)%1, a=i/10*Math.PI*2+.3; d.position.set(fx+Math.cos(a)*.2*k,.86+Math.sin(Math.PI*k)*.16-.26*k,fz+Math.sin(a)*.2*k); })); }
    sandbox(.3,-1.3,1.35,.8,true);
    const mx=1.07, mz=.36; playMat(mx,mz,1.5,1.36);
    slideTower(mx-.46,mz-.4,-Math.PI/2); swings(mx+.5,mz-.05,Math.PI/2);
    springRider(mx-.04,mz-.12,.5,'horse','#4a8fd8','#f2c230',0.63); springRider(mx-.02,mz+.43,.2,'duck','#f2c230','#e5484d',0.66);
    bench(-1.55,-.75,.85); bench(-1.0,-1.05,.45);   /* 家長 11-13：長椅不要壓在沙坑框上 */
    bush(-1.9,-.05,1.1,''); bush(.55,1.9,1,''); bush(-.75,1.75,.9,'');
    ptree('12',-1.4,-1.3,1.35); ptree('13',-.55,-2.0,1.2); ptree('06',1.5,-1.35,1.1); ptree('04',-2.05,1.05,1.0); }
  for(const x of [-.75,.75]) kit(FT('lantern'),x,1.8,{h:.95});
  butterfly(-1.0,.55,.9,{c:'#f6a8c9',r:.45}); butterfly(.4,.6,-1.2,{c:'#f2c230',r:.5});   // 蝴蝶（家長 11-13）
  // 松鼠、小鳥（遊戲裡會動）
  squirrel(-1.15,-1.1,0,0,.45); squirrel(.2,-1.55,1,0,.4); bird(.15,.95,2,0,'#7a6a5a'); bird(-.45,1.15,-2,0,'#6b8fb5'); onY(.97,()=>bird(-.75,1.8,1.2,0,'#8a6a4a',true));
  if(lv>=2){ squirrel(-1.75,.35,2,0,.4); bird(.35,-.35,.5,0,'#7a6a5a'); }
})); }

const LV=(id,name,fn,n,half)=>Array.from({length:n},(_,i)=>[id+(i?i+1:''),name+' Lv'+(i+1),()=>fn(i+1),half?'half':'whole']);
export const LIBRARY_LV=LV('library','圖書館',library,3), CLINIC_LV=LV('clinic','診所',clinic,1,1), HOSPITAL_LV=LV('hospital','醫院',hospital,3),
  BREAKFAST_LV=LV('breakfast','早餐店',breakfast,2,1), MARKET_LV=LV('market','市場',market,3), CONV_LV=LV('conv','便利商店',conv,1,1), PARK_LV=LV('park','社區公園',park,2);   // 一整格（家長 10:21）
