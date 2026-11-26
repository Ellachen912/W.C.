/* Winston City 第二階段：冰淇淋店（美食區，半格，一級，6 顆；家長 11-19 12:40「好，注意細節」）
   自己畫（素材包的 cake shop 減面後破圖、偏暗，不用）。
   配色：淡粉灰泥牆（淡淡斑駁紋）＋薄荷綠門窗木框＋奶油白線腳；不刺眼的低彩度。
   造型：單層小店＋白色女兒牆平屋頂（屋頂上一支大甜筒：格紋餅乾杯、三球不同口味、滴下來的奶油、彩色糖粒、紅櫻桃）；
         左邊大展示櫥窗（裡面冰櫃一排 8 桶不同顏色的冰淇淋＋價格小牌）、右邊薄荷綠木門（上半玻璃）；
         粉白條紋圓弧波浪邊遮雨棚；壁燈、窗台花箱；門口兩組小圓桌、一台冰淇淋推車（陽傘）、立牌；淺色石板地。
   座標同麵包店的半格：建地中心為原點、正門朝 +z。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, tree, anims } from './lib.js';

const PINK='#e9c3c4', PINK2='#d9a3a6', MINT='#7fb8a4', MINT2='#5f9a86', CREAM='#f7efe0', TRIM='#fbf6ec', DARK='#3a3a40', CONE='#d6a15e', CONE2='#b7803f';
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; }
let seed=5; const rnd=()=>((seed=seed*16807%2147483647)/2147483647);
/* 粉色灰泥牆：淡淡斑駁＋細小顆粒，牆腳一圈淺色磁磚 */
const wallTex=rectTex(256,256,(g,W,H)=>{ g.fillStyle=PINK; g.fillRect(0,0,W,H); let r=3; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let i=0;i<180;i++){ g.fillStyle=R()<.5?`rgba(150,100,100,${R()*.07})`:`rgba(255,250,245,${R()*.12})`; g.beginPath(); g.ellipse(R()*W,R()*H,6+R()*30,4+R()*16,R()*3,0,7); g.fill(); }
  for(let i=0;i<700;i++){ g.fillStyle=`rgba(120,80,80,${R()*.1})`; g.fillRect(R()*W,R()*H,2,2); } });
const wallMat=(w,h)=>{ const t=wallTex.clone(); t.needsUpdate=true; t.repeat.set(Math.max(1,w/1.2),Math.max(1,h/1.2)); return new THREE.MeshStandardMaterial({map:t,roughness:.9}); };
const paveTex=rectTex(256,256,(g,W,H)=>{ g.fillStyle='#c9c0b2'; g.fillRect(0,0,W,H); const C=['#e6e0d6','#ded7cb','#ebe6dd','#d8d0c3'];
  for(let j=0;j<4;j++) for(let i=0;i<4;i++){ g.fillStyle=C[(i*3+j)%4]; g.fillRect(i*64+1.5,j*64+1.5,61,61); }
  g.fillStyle='rgba(233,195,196,.55)'; for(let j=0;j<4;j++) for(let i=0;i<4;i++) if((i+j)%2===0){ g.beginPath(); g.moveTo(i*64+32,j*64+22); g.lineTo(i*64+42,j*64+32); g.lineTo(i*64+32,j*64+42); g.lineTo(i*64+22,j*64+32); g.fill(); } });   // 淡粉色小菱形
const coneTex=rectTex(128,128,(g,W,H)=>{ g.fillStyle=CONE; g.fillRect(0,0,W,H); g.strokeStyle=CONE2; g.lineWidth=5;
  for(let i=-W;i<2*W;i+=22){ g.beginPath(); g.moveTo(i,0); g.lineTo(i+W,H); g.stroke(); g.beginPath(); g.moveTo(i,H); g.lineTo(i+W,0); g.stroke(); }
  g.fillStyle='rgba(255,230,180,.35)'; for(let i=-W;i<2*W;i+=22) for(let j=0;j<H;j+=22){} });
function halfPad(inset=.18,y=0,h=.09){ const R=4.2, Hh=Math.sqrt(3)*R, oz=-Hh*.24, s=new THREE.Shape(); const hw=z=>R-(z-oz)/(Hh/2)*(R/2);
  const z0=oz+inset, z1=oz+Hh/2-inset; [[-(hw(z0)-inset),z0],[hw(z0)-inset,z0],[hw(z1)-inset,z1],[-(hw(z1)-inset),z1]].forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z)); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2);
  const t=paveTex.clone(); t.needsUpdate=true; t.repeat.set(1.3,1.3);
  const m=add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:t,roughness:.85}))); m.position.y=y; m.receiveShadow=true; return m; }
/* 圓弧波浪邊遮雨棚（同麵包店做法），淡粉＋奶油白 */
function awning(w,x,y,z,depth=.5){ const g=grp(x,y,z), n=Math.max(2,Math.round(w/.2)), sw=w/n, drop=.2, vh=.07;
  for(let i=0;i<n;i++){ const c=i%2?CREAM:PINK2, x0=-w/2+i*sw, x1=x0+sw, m=mat(c,{side:THREE.DoubleSide,roughness:.8});
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([x0,0,0, x1,0,0, x1,-drop,depth, x0,-drop,depth],3)); geo.setIndex([0,2,1, 0,3,2]); geo.computeVertexNormals();
    add(new THREE.Mesh(geo,m),g).castShadow=true;
    const sh=new THREE.Shape(); sh.moveTo(-sw/2,0); sh.lineTo(sw/2,0); sh.lineTo(sw/2,-vh); sh.absarc(0,-vh,sw/2,0,-Math.PI,true); sh.closePath();
    const sc=new THREE.Mesh(new THREE.ShapeGeometry(sh,10),m); sc.position.set(x0+sw/2,-drop,depth); add(sc,g); }
  rbox(w+.06,.05,.06,MINT2,0,-.03,-.01,.008,g); rbox(w+.02,.025,.03,MINT2,0,-drop-.015,depth+.005,.005,g);
  for(const s of [-1,1]){ const a=rbox(.018,.018,depth+.05,DARK,s*(w/2),-drop/2,depth/2,.002,g); a.rotation.x=Math.atan2(drop,depth); } }
/* 冰淇淋球：有一點不規則的球＋下緣一圈滴下來的奶油 */
const SCOOP=['#f4c6cf','#c9e3c8','#f1e3b8','#d9c2e6','#8a5a44','#f6efe2','#f2b8a0','#bfe0e8'];
function scoop(x,y,z,r,c,parent){ const s=sphere(r,mat(c,{roughness:.55}),x,y,z,{},parent); s.scale.set(1,.88,1);
  for(let i=0;i<9;i++){ const a=i/9*Math.PI*2+rnd()*.3, d=add(new THREE.Mesh(new THREE.CapsuleGeometry(r*.13,r*(.15+rnd()*.25),3,6),mat(c,{roughness:.55})),parent); d.position.set(x+Math.cos(a)*r*.9,y-r*.45,z+Math.sin(a)*r*.9); }
  const rim=add(new THREE.Mesh(new THREE.TorusGeometry(r*.9,r*.16,8,24),mat(c,{roughness:.55})),parent); rim.rotation.x=Math.PI/2; rim.position.set(x,y-r*.38,z); }
/* 屋頂上的大甜筒：格紋餅乾杯＋三球＋糖粒＋櫻桃 */
function bigCone(x,y,z){ const g=grp(x,y,z);
  rbox(.22,.06,.22,TRIM,0,0,0,.01,g); rbox(.06,.18,.06,DARK,0,.06,0,.004,g);   // 底座＋支柱
  const c=add(new THREE.Mesh(new THREE.ConeGeometry(.3,.95,24,1,true),new THREE.MeshStandardMaterial({map:coneTex,roughness:.75,side:THREE.DoubleSide})),g); c.rotation.x=Math.PI; c.position.y=.18+.475;
  const lip=add(new THREE.Mesh(new THREE.TorusGeometry(.3,.04,8,28),mat(CONE2)),g); lip.rotation.x=Math.PI/2; lip.position.y=1.13;
  scoop(-.12,1.27,.04,.24,'#f4c6cf',g); scoop(.14,1.26,-.04,.23,'#c9e3c8',g); scoop(.01,1.56,.0,.23,'#f1e3b8',g);
  const SC=['#e5484d','#5b8fe0','#ffd23a','#5bbf6a','#ffffff','#9b6ad1'];
  for(let i=0;i<40;i++){ const th=rnd()*Math.PI*2, ph=rnd()*1.1, r=.23, cx=0, cy=1.56, cz=0; const sp=add(new THREE.Mesh(new THREE.CapsuleGeometry(.008,.025,2,4),mat(SC[i%6])),g);
    sp.position.set(cx+Math.cos(th)*Math.sin(ph)*r,cy+Math.cos(ph)*r*.88,cz+Math.sin(th)*Math.sin(ph)*r); sp.rotation.set(rnd()*3,rnd()*3,rnd()*3); }
  sphere(.06,mat('#c8242c',{roughness:.3}),0,1.82,0,{},g); const st=cyl(.006,.006,.12,'#5a7a3a',.02,1.86,0,4,g); st.rotation.z=-.4;
  return g; }
/* 大展示櫥窗：木框＋玻璃＋裡面冰櫃一排 8 桶 */
function showcase(x,y,z,w,h){ const g=grp(x,y,z);   // 往外凸出的展示窗：後面暖光、中間冰櫃、前面透明玻璃、四邊薄荷綠木框
  const D=.3; rbox(w,h,.02,mat('#fff3e6',{emissive:new THREE.Color('#ffe2c4'),emissiveIntensity:.35}),0,.05,.01,.004,g);
  for(const s of [-1,1]) rbox(.02,h,D,mat('#fff3e6',{emissive:new THREE.Color('#ffe2c4'),emissiveIntensity:.2}),s*(w/2-.01),.05,D/2,.003,g);
  rbox(w+.12,.08,D+.02,MINT2,0,h,D/2-.02,.008,g);   /* 11-19 19:05：上框降低、縮短，不要戳出遮雨棚變成一條綠線 */ rbox(w+.12,.06,D+.06,MINT2,0,-.01,D/2,.008,g);
  for(const s of [-1,1]) rbox(.06,h+.1,.06,MINT2,s*(w/2+.03),-.01,D,.006,g);
  for(const k of [-1,1]) rbox(.025,h,.025,MINT2,k*w/6,.05,D+.01,.003,g); rbox(w,.025,.025,MINT2,0,.05+h*.66,D+.01,.003,g);
  rbox(w,h,.01,new THREE.MeshStandardMaterial({color:'#e8f4f6',transparent:true,opacity:.22,roughness:.05}),0,.05,D,.002,g);
  // 冰櫃：白色櫃身＋斜玻璃＋一排 8 桶＋價格小牌
  rbox(w-.08,.28,.17,'#f4f4f2',0,.05,.12,.01,g); rbox(w-.08,.03,.18,'#d9d5cc',0,.33,.12,.004,g);
  for(let i=0;i<8;i++){ const tx=-w/2+.12+i*(w-.24)/7; rbox(.12,.03,.11,'#c9ced6',tx,.33,.12,.004,g); const t=sphere(.052,mat(SCOOP[i],{roughness:.6}),tx,.37,.12,{},g); t.scale.set(1.1,.5,1);
    rbox(.06,.035,.005,'#ffffff',tx,.22,.21,.001,g); }
  const gl=rbox(w-.1,.01,.16,new THREE.MeshStandardMaterial({color:'#d8eef2',transparent:true,opacity:.35,roughness:.1}),0,.47,.15,.002,g); gl.rotation.x=-.55;
  // 上層：甜筒和杯子展示
  for(let i=0;i<5;i++){ const tx=-w/2+.2+i*(w-.4)/4; const c=add(new THREE.Mesh(new THREE.ConeGeometry(.035,.1,10),mat(CONE)),g); c.rotation.x=Math.PI; c.position.set(tx,.64,.1); sphere(.035,SCOOP[(i*3)%8],tx,.7,.1,{},g); }
  // 窗台花箱
  rbox(w,.12,.14,MINT2,0,-.14,D+.08,.01,g); for(let i=0;i<7;i++) sphere(.055,mat(i%2?'#7cae6a':'#8dbb78',{flatShading:true}),-w/2+.12+i*(w-.24)/6,-.02,D+.09,{},g);
  for(let i=0;i<6;i++) sphere(.025,['#f4c6cf','#ffffff','#f1e3b8'][i%3],-w/2+.2+i*(w-.4)/5,.03,D+.13,{},g); }
function door(x,y,z){ const g=grp(x,y,z); rbox(.52,.9,.06,MINT2,0,0,0,.01,g); rbox(.42,.84,.04,MINT,0,.02,.02,.008,g);
  rbox(.32,.36,.02,mat('#fff3e6',{emissive:new THREE.Color('#ffe2c4'),emissiveIntensity:.3}),0,.42,.045,.003,g); rbox(.3,.2,.02,MINT2,0,.12,.045,.004,g);
  sphere(.025,'#c9a35a',.15,.42,.06,{},g); rbox(.6,.05,.14,TRIM,0,.93,.03,.01,g); rbox(.62,.03,.2,'#cfc6b6',0,-.02,.08,.004,g);
  const sign=rbox(.2,.06,.01,'#ffffff',0,.68,.055,.002,g); }   // 門上掛「營業中」小牌
function wallLamp(x,y,z){ rbox(.03,.12,.03,DARK,x,y,z,.004); const l=sphere(.05,mat('#fff3d0',{emissive:new THREE.Color('#ffd98a'),emissiveIntensity:.6}),x,y-.02,z+.06); cyl(.06,.03,.04,DARK,x,y+.03,z+.06,10); }
function bistro(x,z){ cyl(.16,.16,.02,'#f7f4ee',x,.5,z,16); cyl(.02,.02,.41,'#d9d5cc',x,.09,z,6); cyl(.1,.1,.015,'#d9d5cc',x,.09,z,10);
  for(const s of [-1,1]){ const cx=x+s*.29; cyl(.09,.09,.02,MINT,cx,.33,z,12); for(const k of [-1,1]) cyl(.01,.01,.24,'#d9d5cc',cx+k*.05,.09,z,4); rbox(.16,.18,.02,MINT,cx+s*.08,.36,z,.004).rotation.y=Math.PI/2; }
  // 桌上一杯冰淇淋聖代
  cyl(.03,.045,.08,mat('#ffffff',{transparent:true,opacity:.7}),x,.52,z,10); scoop(x,.63,z,.04,'#f4c6cf'); }
/* 冰淇淋推車：小車身＋兩個輪子＋把手＋陽傘＋車上的冰桶 */
function cart(x,z,ry){ const g=grp(x,.09,z,ry);
  rbox(.62,.4,.3,TRIM,0,.16,0,.03,g); rbox(.64,.06,.36,PINK2,0,.56,0,.01,g); rbox(.58,.08,.02,PINK2,0,.35,.18,.004,g);
  for(const s of [-1,1]) for(const zz of [-1,1]){ const w=add(new THREE.Mesh(new THREE.TorusGeometry(.075,.02,8,18),mat(DARK)),g); w.position.set(s*.2,.08,zz*.16); cyl(.03,.03,.02,'#c9ced6',s*.2,.07,zz*.165,8,g).rotation.x=Math.PI/2; }
  const h=rbox(.025,.025,.3,DARK,-.42,.5,0,.004,g); h.rotation.z=.3; cyl(.02,.02,.32,DARK,-.48,.55,0,6,g).rotation.x=Math.PI/2;
  for(let i=0;i<3;i++){ cyl(.06,.06,.05,'#c9ced6',-.18+i*.18,.62,0,12,g); const t=sphere(.06,mat(SCOOP[i*2],{roughness:.6}),-.18+i*.18,.67,0,{},g); t.scale.y=.5; }
  cyl(.012,.012,.9,'#d9d5cc',.2,.6,0,6,g); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, p=add(new THREE.Mesh(new THREE.ConeGeometry(.42,.16,8,1,true,a,Math.PI/4),mat(i%2?CREAM:PINK2,{side:THREE.DoubleSide,roughness:.7})),g); p.position.set(.2,1.55,0); } }
function aBoard(x,z,ry=-.4){ const g=grp(x,.09,z,ry); for(const s of [1,-1]){ const p=new THREE.Group(); p.position.y=.52; p.rotation.x=-s*.18; g.add(p);
  rbox(.34,.48,.02,MINT2,0,-.48,s*.02,.004,p); rbox(.28,.4,.01,'#2f3a33',0,-.44,s*.032,.002,p);
  const c=add(new THREE.Mesh(new THREE.ConeGeometry(.05,.13,10),mat(CONE)),p); c.rotation.x=Math.PI; c.position.set(0,-.36,s*.045); sphere(.05,'#f4c6cf',0,-.27,s*.045,{},p); } }

function icecream(){ seed=5; halfPad();
  const Y=.1, W=2.7, D=1.4, h=1.45, cx=-.15, cz=-.85, fz=cz+D/2;
  rbox(W+.12,.14,D+.1,'#e7ddd0',cx,Y,cz,.02);                                                   // 淺色牆腳
  rbox(W,h,D,wallMat(W,h),cx,Y+.14,cz,.02);
  for(const x of [cx-W/2+.04,cx+W/2-.04]) rbox(.09,h,.09,TRIM,x,Y+.14,fz+.01,.01);                 // 白色轉角線腳
  // 平屋頂：奶油白女兒牆＋一圈線腳＋屋頂上的大甜筒
  const top=Y+.14+h; rbox(W+.16,.08,D+.16,TRIM,cx,top,cz,.01); rbox(W+.06,.22,D+.06,wallMat(W,.3),cx,top+.08,cz,.01); rbox(W+.14,.06,D+.14,TRIM,cx,top+.3,cz,.01);
  for(let i=0;i<12;i++) rbox(.06,.04,.04,TRIM,cx-W/2+.12+i*(W-.24)/11,top+.04,fz+.1,.004);         // 簷下小齒飾
  bigCone(cx+.35,top+.36,cz+.05).scale.setScalar(.62);
  showcase(cx-.45,Y+.42,fz+.01,1.35,.78);
  door(cx+.85,Y+.14,fz+.01);
  awning(W-.1,cx,Y+1.42,fz+.04,.62);
  wallLamp(cx+.4,Y+1.0,fz+.02); wallLamp(cx+1.3,Y+1.0,fz+.02);
  // 側面一扇小圓窗
  { const r=add(new THREE.Mesh(new THREE.TorusGeometry(.16,.03,8,24),mat(MINT2))); r.position.set(cx+W/2+.005,Y+.85,cz); r.rotation.y=Math.PI/2;
    const gl=add(new THREE.Mesh(new THREE.CircleGeometry(.15,24),mat('#fff3e6',{emissive:new THREE.Color('#ffe2c4'),emissiveIntensity:.25}))); gl.position.set(cx+W/2+.003,Y+.85,cz); gl.rotation.y=Math.PI/2; }
  // 門口
  bistro(-1.4,1.1); bistro(.15,1.1); cart(1.65,.75,-.5); aBoard(-1.6,.3,.35);   // 家長 12:47：兩組座位同一條橫線；立牌移到店左前方、斜斜朝街道
  for(const [x,z] of [[-2.35,.35],[2.55,.0]]){ cyl(.13,.1,.22,'#d9cfc0',x,.09,z,12); sphere(.16,mat('#7cae6a',{flatShading:true}),x,.42,z); for(let i=0;i<4;i++) sphere(.035,'#f4c6cf',x+Math.cos(i*1.6)*.12,.48,z+Math.sin(i*1.6)*.12); }
  for(const [x,z,k,c] of [[-3.1,-1.15,.5],[3.1,-1.15,.5,'#6fc463']]) tree(x,z,k,c);
}
export const ICECREAM_LV=[['icecream','冰淇淋店',icecream,'half']], ICECREAM_TOP=[0,3.2];
