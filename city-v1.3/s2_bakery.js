/* Winston City 第二階段：麵包店（美食區，半格，2 級；家長 2026-11-18 23:12 確認）
   兩級都是程式畫（同一組顏色：奶油牆、蜂蜜木框、藍綠門窗與條紋遮雨棚、紅陶瓦屋頂、石板地），升級像同一家店擴建
   Lv1 小麵包坊：單層小店，山牆屋頂上立一個大圓麵包；拱形窗＋窗台花箱＋藍綠門；圓弧波浪邊遮雨棚；門口小圓桌＋黑板立牌
   Lv2 麵包咖啡館：橫向加寬（左主屋＋右側翼），屋頂上大可頌與大麵包；右側大展示櫥窗；兩段遮雨棚；兩組圓桌
   黑板立牌：從 Sketchfab「杜松咖啡館」（CC-BY-4.0，Max／MiniCity Taiwan）切出的單一物件 `models/sk/aboard.glb`
   座標同 s1_more.js 的半格：建地中心為原點、正門朝 +z。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, prism, tree, bush } from './lib.js';
import { kit, FOOD } from './s1_kit.js';
import { food } from './food_mini.js';   // 家長 11-25：櫥窗食物改成自己畫的簡單形狀

const PLASTER='#f0dcae', WOOD='#8a4a1a', WOODL='#a4622a', TEAL='#0f5a52', TEAL2='#1b7a6c', TERRA='#b4472a', TERRA2='#9a3a22', CREAM='#fbf1d8', PAVE='#d6c9ad';
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
const signTex=rectTex(1024,220,(g,W,H)=>{ g.fillStyle=CREAM; g.fillRect(0,0,W,H); g.strokeStyle=WOOD; g.lineWidth=14; g.strokeRect(7,7,W-14,H-14); g.strokeStyle='#c9a35a'; g.lineWidth=4; g.strokeRect(24,24,W-48,H-48);
  g.fillStyle=TEAL; g.textAlign='center'; g.textBaseline='middle'; g.font=`bold ${H*.5}px "PingFang TC","Noto Sans CJK TC","Noto Sans TC",serif`; g.fillText('木星麵包店',W/2,H*.55);
  g.fillStyle='#c9a35a'; for(const x of [70,W-70]){ g.beginPath(); g.ellipse(x,H/2,26,16,.5,0,7); g.fill(); } });   // 兩邊各一個小麵包圖案
const paveTex=rectTex(256,256,(g,W,H)=>{ g.fillStyle='#cdbf9f'; g.fillRect(0,0,W,H); for(let j=0;j<8;j++) for(let i=0;i<8;i++){ g.fillStyle=['#dccfb2','#d4c6a7','#e2d6bb','#cfc19f'][(i*3+j*5)%4]; g.fillRect(i*32+1.5,j*32+1.5,29,29); } });
function plate(tex,w,h,x,y,z,ry=0,parent){ const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.7})); p.position.set(x,y,z); p.rotation.y=ry; add(p,parent); return p; }
function halfPad(inset=.18,y=0,h=.09){ const R=4.2, Hh=Math.sqrt(3)*R, oz=-Hh*.24, s=new THREE.Shape(); const hw=z=>R-(z-oz)/(Hh/2)*(R/2);
  const z0=oz+inset, z1=oz+Hh/2-inset; [[-(hw(z0)-inset),z0],[hw(z0)-inset,z0],[hw(z1)-inset,z1],[-(hw(z1)-inset),z1]].forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z)); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2);
  const t=paveTex.clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(.9,.9);   // 整塊半格鋪石板
  const m=add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:t,roughness:.85}))); m.position.y=y; m.receiveShadow=true; return m; }

/* 拱形窗：木框＋玻璃＋上面半圓＋兩片藍綠百葉窗＋窗台花箱 */
function archWin(x,y,z,w,h,parent,flowers=true){ const g=grp(x,y,z,0,parent);
  rbox(w+.08,h-w/2+.04,.05,WOOD,0,0,0,.008,g); const top=add(new THREE.Mesh(new THREE.CylinderGeometry(w/2+.04,w/2+.04,.05,18,1,false,Math.PI/2,Math.PI),mat(WOOD)),g); top.rotation.x=Math.PI/2; top.position.y=h-w/2+.04;
  const gl=mat('#ffd59a',{emissive:new THREE.Color('#ffb85a'),emissiveIntensity:.25,roughness:.2});
  rbox(w-.04,h-w/2,.02,gl,0,.02,.03,.004,g); const a=add(new THREE.Mesh(new THREE.CylinderGeometry(w/2-.02,w/2-.02,.02,18,1,false,Math.PI/2,Math.PI),gl),g); a.rotation.x=Math.PI/2; a.position.set(0,h-w/2+.02,.03);
  rbox(.02,h,.03,WOOD,0,.02,.045,.003,g); rbox(w-.04,.02,.03,WOOD,0,(h-w/2)*.55,.045,.003,g);
  for(const s of [-1,1]){ const sh=rbox(w*.5,h-w/2,.025,TEAL,s*(w*.5+.05),.02,.035,.006,g); for(let i=0;i<5;i++) rbox(w*.44,.012,.03,TEAL2,s*(w*.5+.05),.08+i*(h-w/2-.1)/5,.05,.002,g); }
  if(flowers){ rbox(w+.12,.1,.14,WOODL,0,-.1,.07,.01,g); for(let i=0;i<5;i++) sphere(.045,['#f5a21b','#b8293a','#f5a21b','#e8577a','#b8293a'][i],-w/2+.02+i*(w/4),.02,.08,{flatShading:true},g); }
  return g; }
/* 牆面紋路（家長 23:28：牆面盡量要有紋路）：奶油色灰泥＋淡淡斑駁＋轉角下方露出幾塊紅磚 */
const plasterTex=rectTex(512,512,(g,W,H)=>{ g.fillStyle=PLASTER; g.fillRect(0,0,W,H);
  let r=7; const rnd=()=>((r=r*16807%2147483647)/2147483647);
  for(let i=0;i<260;i++){ const a=rnd()*.08; g.fillStyle=rnd()<.5?`rgba(150,110,60,${a})`:`rgba(255,250,235,${a*1.4})`; g.beginPath(); g.ellipse(rnd()*W,rnd()*H,6+rnd()*40,4+rnd()*22,rnd()*3,0,7); g.fill(); }
  for(let i=0;i<900;i++){ g.fillStyle=`rgba(120,90,50,${rnd()*.12})`; g.fillRect(rnd()*W,rnd()*H,2,2); }
  const brick=(x0,y0,cols,rows)=>{ for(let j=0;j<rows;j++) for(let i=0;i<cols-(j%2?1:0);i++){ const x=x0+i*34+(j%2?17:0), y=y0+j*16;
    g.fillStyle=['#b4553a','#a64a32','#c0644a','#9c452e'][(i+j*3)%4]; g.fillRect(x,y,31,13); } };
  brick(4,H-120,3,4); brick(W-110,H-90,3,3); brick(W*.45,40,2,2);
  g.strokeStyle='rgba(150,110,60,.25)'; g.lineWidth=2; g.strokeRect(1,1,W-2,H-2); });
plasterTex.wrapS=plasterTex.wrapT=THREE.RepeatWrapping;
const wallMat=(w,h)=>{ const t=plasterTex.clone(); t.needsUpdate=true; t.repeat.set(Math.max(1,Math.round(w/1.4)),1); return new THREE.MeshStandardMaterial({map:t,roughness:.9}); };
/* 圓弧波浪邊遮雨棚（家長 16:40／23:13）：每一條都是一整片——斜面條紋＋同色垂下來的圓弧波浪，中間沒有縫 */
function awning(w,x,y,z,depth=.55,parent){ const g=grp(x,y,z,0,parent), n=Math.max(2,Math.round(w/.2)), sw=w/n, drop=.2, vh=.07;
  for(let i=0;i<n;i++){ const c=i%2?CREAM:TEAL2, x0=-w/2+i*sw, x1=x0+sw, m=mat(c,{side:THREE.DoubleSide,roughness:.8});
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([x0,0,0, x1,0,0, x1,-drop,depth, x0,-drop,depth],3)); geo.setIndex([0,2,1, 0,3,2]); geo.computeVertexNormals();
    const sl=new THREE.Mesh(geo,m); sl.castShadow=true; add(sl,g);
    const sh=new THREE.Shape(); sh.moveTo(-sw/2,0); sh.lineTo(sw/2,0); sh.lineTo(sw/2,-vh); sh.absarc(0,-vh,sw/2,0,-Math.PI,true); sh.closePath();
    const sc=new THREE.Mesh(new THREE.ShapeGeometry(sh,10),m); sc.position.set(x0+sw/2,-drop,depth); sc.castShadow=true; add(sc,g); }
  rbox(w+.06,.05,.06,WOOD,0,-.03,-.01,.008,g);                                                                      // 牆上的木橫樑
  rbox(w+.02,.025,.03,WOOD,0,-drop-.015,depth+.005,.005,g);                                                          // 前緣細木條（把斜面和波浪接起來）
  for(const s of [-1,1]){ const a=rbox(.02,.02,depth+.05,'#2b2b2b',s*(w/2),-drop,depth/2,.002,g); a.rotation.x=Math.atan2(drop,depth); a.position.y=-drop/2; }
  return g; }
function bistro(x,z){ cyl(.17,.17,.02,'#2b2b2b',x,.52,z,16); cyl(.02,.02,.43,'#2b2b2b',x,.09,z,6); cyl(.1,.1,.015,'#2b2b2b',x,.09,z,10);
  for(const s of [-1,1]){ const cx=x+s*.3; cyl(.1,.1,.02,WOODL,cx,.35,z,12); for(const k of [-1,1]) cyl(.01,.01,.26,'#2b2b2b',cx+k*.06,.09,z,4); rbox(.18,.18,.02,WOODL,cx+s*.08,.38,z,.004).rotation.y=Math.PI/2; }
  cyl(.04,.035,.06,'#ffffff',x+.05,.54,z,10); food(('Croissant'),x-.06,z,{h:.05,y0:.54}); }


/* 屋頂上的大麵包（程式畫，金黃色）：圓麵包＝壓扁的球＋三道割紋；可頌＝彎的一節一節 */
const CRUST='#d98f3a', CRUST2='#b8702a', SCORE='#f6dca2';
function bigLoaf(x,y,z,s=1){ const g=grp(x,y,z,0); const b=sphere(.5*s,mat(CRUST,{roughness:.6}),0,.24*s,0,{},g); b.scale.set(1,.55,.66);
  for(const k of [-1,0,1]){ const c=add(new THREE.Mesh(new THREE.CapsuleGeometry(.025*s,.22*s,4,8),mat(SCORE)),g); c.position.set(k*.2*s,.5*s,.08*s); c.rotation.set(-.35,0,Math.PI/2-.6); }
  rbox(.06*s,.2*s,.06*s,'#2b2b2b',0,-.05*s,-.05*s,.004,g); return g; }
function bigCroissant(x,y,z,s=1){ const g=grp(x,y,z,0); const n=7;
  for(let i=0;i<n;i++){ const t=i/(n-1), a=Math.PI*(.15+.7*t), r=.42*s, k=1-Math.abs(t-.5)*1.3;
    const seg=sphere(.17*s*k+.05*s,mat(i%2?CRUST:CRUST2,{roughness:.6}),Math.cos(a)*r*-1,.2*s,Math.sin(a)*r*-.55+.15*s,{},g); seg.scale.set(.75,.8,1); }
  return g; }
/* Lv2 右屋頂的大咖啡杯（家長 23:25）：奶油色杯子＋藍綠杯緣＋把手＋杯盤＋咖啡＋三縷白煙 */
/* 屋脊上的小底座（家長 11-19 13:09：麵包、咖啡杯不要直接黏在屋頂上，比照冰淇淋店有底座＋短柱） */
function plinth(x,y,z,h=.24){ rbox(.3,.07,.22,CREAM,x,y-.02,z,.01); rbox(.24,.03,.16,WOOD,x,y+.05,z,.006); rbox(.06,h-.08,.06,'#2b2b2b',x,y+.08,z,.004); rbox(.2,.03,.14,WOOD,x,y+h-.03,z,.004); }
function bigCup(x,y,z,s=1){ const g=grp(x,y,z,0);
  cyl(.36*s,.36*s,.04*s,CREAM,0,0,0,28,g); const rm=add(new THREE.Mesh(new THREE.TorusGeometry(.36*s,.02*s,8,32),mat(TEAL2)),g); rm.rotation.x=Math.PI/2; rm.position.y=.04*s;
  cyl(.24*s,.18*s,.4*s,CREAM,0,.04*s,0,28,g);
  const lip=add(new THREE.Mesh(new THREE.TorusGeometry(.24*s,.025*s,8,32),mat(TEAL2)),g); lip.rotation.x=Math.PI/2; lip.position.y=.44*s;
  cyl(.225*s,.225*s,.01*s,'#6b3a1e',0,.41*s,0,28,g);
  const hd=add(new THREE.Mesh(new THREE.TorusGeometry(.1*s,.03*s,8,16,Math.PI*1.2),mat(CREAM)),g); hd.position.set(.25*s,.25*s,0); hd.rotation.z=-Math.PI*.6;
  const steam=mat('#ffffff',{transparent:true,opacity:.75,roughness:1});
  for(const [dx,dz] of [[-.09,0],[.05,.04],[.1,-.06]]) for(let k=0;k<3;k++) sphere((.06-k*.012)*s,steam,(dx+Math.sin(k*1.7+dx*20)*.04)*s,(.52+k*.13)*s,dz*s,{},g);
  return g; }
/* 黑板立牌（從咖啡店模型切出來的單一物件，原高 1.22 → 縮成約 .5） */
function board(x,z,rot=0){ kit('models/sk/aboard.glb',x,z,{h:.5,y0:.1,rot}); }
/* 山牆紅瓦屋頂：瓦片線＋屋脊＋奶油色山牆（前面） */
function roof(cx,cz,ry,RW,RD,RH,{window=true}={}){ const hw=RW/2; prism(RW,RD,RH,TERRA,cx,ry,cz);
  const sl=Math.atan2(RH,hw);
  /* 家長 11-26 還是會閃：屋頂本身已經有瓦片貼圖，上面再貼一條條很細的瓦片線，遠看會一直閃 → 細線拿掉，只留瓦片貼圖 */
  rbox(.1,.07,RD+.04,TERRA2,cx,ry+RH-.04,cz,.02);
  const fw=RW-.3, fh=RH*fw/RW, sh=new THREE.Shape(); sh.moveTo(-fw/2,0); sh.lineTo(fw/2,0); sh.lineTo(0,fh); sh.closePath();
  const gm=add(new THREE.Mesh(new THREE.ShapeGeometry(sh),mat(PLASTER))); gm.position.set(cx,ry+.005,cz+RD/2+.015);
  if(window){ const rw=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,8,24),mat(WOOD)); rw.position.set(cx,ry+.27,cz+RD/2+.02); add(rw);
    const gl=new THREE.Mesh(new THREE.CircleGeometry(.12,24),mat('#ffd59a',{emissive:new THREE.Color('#ffb85a'),emissiveIntensity:.25})); gl.position.set(cx,ry+.27,cz+RD/2+.012); add(gl);
    for(const a of [0,Math.PI/2]){ const b=rbox(.24,.02,.01,WOOD,cx,ry+.26,cz+RD/2+.022,.003); b.rotation.z=a; } }
  else { for(let i=-1;i<=1;i++) rbox(.03,.14,.01,WOOD,cx+i*.09,ry+.14,cz+RD/2+.015,.003); } }
function door(dx,fz,Y){ rbox(.42,.78,.05,TEAL,dx,Y+.14,fz+.01,.01); rbox(.3,.36,.02,mat('#ffd59a',{emissive:new THREE.Color('#ffb85a'),emissiveIntensity:.25}),dx,Y+.5,fz+.04,.004); sphere(.025,'#c9a35a',dx+.13,Y+.46,fz+.05);
  rbox(.5,.06,.12,WOOD,dx,Y+.92,fz+.04,.01); }
function pot(x,z,Y){ cyl(.13,.1,.22,'#b4472a',x,Y,z,12); sphere(.15,'#58b06a',x,Y+.32,z,{flatShading:true}); for(const [a,b] of [[.07,.05],[-.06,.08],[.02,-.08]]) sphere(.035,'#ff8fa3',x+a,Y+.42,z+b); }
function lamp(lx,Y,fz){ rbox(.03,.25,.03,'#2b2b2b',lx,Y+.85,fz+.12,.004); sphere(.06,mat('#fff3c4',{emissive:new THREE.Color('#ffe08a'),emissiveIntensity:.5}),lx,Y+.82,fz+.18); }

function lv1(){ halfPad(); const Y=.1, W=2.5, D=1.35, h=1.5, cx=-.25, cz=-.85, fz=cz+D/2;
  rbox(W+.12,.12,D+.1,'#b9a98a',cx,Y,cz,.02);                                                    // 石頭牆腳
  rbox(W,h,D,wallMat(W,h),cx,Y+.12,cz,.02);
  for(const x of [cx-W/2+.04,cx+W/2-.04]) rbox(.08,h,.08,WOOD,x,Y+.12,fz+.01,.01);                  // 蜂蜜色木框（轉角柱、上下樑）
  rbox(W+.04,.08,.08,WOOD,cx,Y+.12+h-.08,fz+.01,.01); rbox(W+.04,.06,.06,WOOD,cx,Y+.14,fz+.01,.01);
  archWin(cx-.75,Y+.32,fz+.01,.46,.7); archWin(cx+.2,Y+.32,fz+.01,.46,.7);
  for(let i=0;i<3;i++) food((['Bread','Croissant','Cupcake'][i]),cx-.9+i*.15,fz-.02,{h:.08,y0:Y+.4,rot:i});   // 窗台花箱旁的麵包
  door(cx+.88,fz,Y);
  awning(W-.1,cx,Y+1.2,fz+.03);
  const ry=Y+.12+h, RW=W+.3, RD=D+.35, RH=.75; roof(cx,cz,ry,RW,RD,RH);
  bigLoaf(cx-.05,ry+RH-.02,cz+.25,.9);                                         // 屋頂上的大麵包
  rbox(.24,.75,.24,'#a5523a',cx+.8,ry+.1,cz-.3,.01); rbox(.3,.06,.3,'#7a3a28',cx+.8,ry+.85,cz-.3,.01);
  bistro(cx+.2,fz+.95); board(cx-1.0,fz+.55,.25);
  pot(cx-1.35,fz+.35,Y); pot(cx+1.45,fz+.35,Y); lamp(cx-W/2-.1,Y,fz);
  for(const [x,z,k,c] of [[-3.1,-1.15,.55],[3.1,-1.15,.5,'#6fc463']]) tree(x,z,k,c);
}
function lv2(){ halfPad(); const Y=.1, D=1.5, cz=-.9, fz=cz+D/2;
  // 左：主屋（二樓高度、山牆＋圓窗）；右：側翼（矮一點、大展示櫥窗）
  const W1=2.1, c1=-.8, h1=1.5, W2=1.75, c2=1.1, h2=1.2;
  rbox(W1+W2+.12,.12,D+.1,'#b9a98a',(c1+c2)/2,Y,cz,.02);
  rbox(W1,h1,D,wallMat(W1,h1),c1,Y+.12,cz,.02); rbox(W2,h2,D,wallMat(W2,h2),c2,Y+.12,cz+.02,.02);
  for(const x of [c1-W1/2+.04,c1+W1/2-.02,c2+W2/2-.04]) rbox(.08,x===c2+W2/2-.04?h2:h1,.08,WOOD,x,Y+.12,fz+.01,.01);
  rbox(W1+.04,.08,.08,WOOD,c1,Y+.12+h1-.08,fz+.01,.01); rbox(W2+.04,.08,.08,WOOD,c2,Y+.12+h2-.08,fz+.01,.01); rbox(W1+W2,.06,.06,WOOD,(c1+c2)/2,Y+.14,fz+.01,.01);
  archWin(c1-.55,Y+.32,fz+.01,.5,.75); door(c1+.5,fz,Y);                                           // 左：拱形窗＋藍綠門
  // 右側翼：大展示櫥窗（木框＋暖光玻璃＋三層架子上擺麵包、蛋糕）
  { const gx=c2+.03, gw=1.3; rbox(gw+.1,.78,.05,WOOD,gx,Y+.28,fz+.01,.01); rbox(gw-.06,.7,.02,mat('#ffd59a',{emissive:new THREE.Color('#ffb85a'),emissiveIntensity:.3,roughness:.2}),gx,Y+.32,fz+.04,.004);
    for(const k of [-1,0,1]) rbox(.03,.7,.03,WOOD,gx+k*gw/3,Y+.32,fz+.06,.004);
    rbox(gw+.1,.05,.16,WOODL,gx,Y+.22,fz+.08,.01); rbox(gw-.1,.03,.12,WOODL,gx,Y+.52,fz+.06,.006);
    const items=['Bread','Croissant','Donut1','Cupcake','Donut2','Croissant'];
    items.forEach((n,i)=>food((n),gx-.55+i*.22,fz+.085,{h:.1,y0:Y+.27,rot:i}));
    items.slice().reverse().forEach((n,i)=>food((n),gx-.5+i*.2,fz+.065,{h:.08,y0:Y+.55,rot:i+1}));
    for(const i of [-1,1]){ const f=rbox(.06,.34,.06,TEAL,gx+i*(gw/2+.1),Y+.2,fz+.04,.01); } }
  awning(W1-.05,c1,Y+1.18,fz+.03); awning(W2-.05,c2,Y+1.0,fz+.03,.5);
  const ry1=Y+.12+h1, ry2=Y+.12+h2;
  roof(c1,cz,ry1,W1+.3,D+.35,.75); roof(c2,cz-.04,ry2,W2+.3,D+.15,.62,{window:false});   /* 家長 11-26：右邊屋頂原本和左邊屋頂前後面只差 2 毫米（還會閃）→ 右邊屋頂深度縮短、整個往後退，兩片不再貼在一起 */
  plinth(c1-.05,ry1+.75,cz); bigCroissant(c1-.05,ry1+.75+.24,cz+.12,1);                                  // 左屋頂：大可頌
  plinth(c2,ry2+.62,cz+.02); bigCup(c2,ry2+.62+.24+.13*.85,cz+.02,.85);                                              // 右屋頂：大咖啡杯                                           // 右屋頂：大麵包
  rbox(.24,.75,.24,'#a5523a',c1-.6,ry1+.1,cz-.3,.01); rbox(.3,.06,.3,'#7a3a28',c1-.6,ry1+.85,cz-.3,.01);
  bistro(c1+.05,fz+.95); bistro(c2+.15,fz+.95); board(c1+1.15,fz+.5,-.2);
  pot(c1-W1/2-.15,fz+.3,Y); pot(c2+W2/2+.2,fz+.3,Y); lamp(c1-W1/2-.1,Y,fz); lamp(c2+W2/2+.1,Y,fz);
  for(const [x,z,k,c] of [[-3.2,-1.15,.55],[3.2,-1.15,.5,'#6fc463']]) tree(x,z,k,c);
}

export const BAKERY_LV=[['bakery','麵包店 Lv1 小麵包坊',lv1,'half'],['bakery2','麵包店 Lv2 麵包咖啡館',lv2,'half']], BAKERY_TOP=[0,2.6,2.9];
