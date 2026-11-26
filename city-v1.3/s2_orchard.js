/* Winston City 第二階段：果園（農業區，整格，2 級；家長 2026-11-18 23:48「先做看看」）
   Lv1 小果園：草地＋碎石路不規則石板步道；左後方兩排橘子樹、前面一排綠色芭樂樹、一排紅蘋果樹（家長 11-19 00:00：不要套袋）；
               右後方紅磚農舍（紅磚牆、紅瓦斜屋頂有瓦片線、綠色木窗、木門、斗笠、水缸、長板凳）；
               木梯靠在樹上、裝滿橘子的木箱、手推車；前面一圈矮竹籬笆；路口一疊水果箱上放一顆大橘子（不放門框招牌）
   Lv2 擴大果園：同一套顏色，加香蕉樹（家長 11-19 傳的 Sketchfab「Banana Tree」）、水果攤（Sketchfab「Vegetables shop」，CC-BY-4.0，
               作者 adamaysils，去掉底下草皮 `models/sk/fruitstand.glb`）、小拖拉機拉一車水果箱（Kenney tractor）
   家長 23:48：不要溫室（留給農產加工）、不要採果體驗。
   座標：格子中心為原點、正門朝 +z；平頂六角形，|x| ≤ 3.78 − |z|/√3。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, prism, tree, hexPad } from './lib.js';
import { kit, FOOD } from './s1_kit.js';

const WOOD='#a8703f', WOODD='#7a5236', LEAF='#4fae5a', LEAF2='#6cc46c', LEAF3='#3f9c50', ORANGE='#ff9a1f', GUAVA='#a6d05a', BAG='#f4f0e2',
      TERRA='#b4472a', TERRA2='#9a3a22', BAMBOO='#c9b46a', BAMBOO2='#a8944e', WINGREEN='#3f7a52';
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; }
let seed=11; const rnd=()=>((seed=seed*16807%2147483647)/2147483647);

/* 草地（一撮一撮的草紋）、紅磚牆 */
const grassTex=rectTex(256,256,(g,W,H)=>{ g.fillStyle='#8fcf6a'; g.fillRect(0,0,W,H); let r=3; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let i=0;i<60;i++){ g.fillStyle=`rgba(${R()<.5?'120,190,80':'160,220,110'},.35)`; g.beginPath(); g.ellipse(R()*W,R()*H,10+R()*26,6+R()*14,R()*3,0,7); g.fill(); }
  for(let i=0;i<700;i++){ const x=R()*W,y=R()*H; g.strokeStyle=R()<.5?'rgba(70,140,60,.55)':'rgba(190,235,140,.6)'; g.lineWidth=1.2; g.beginPath(); g.moveTo(x,y); g.lineTo(x+(R()-.5)*3,y-3-R()*4); g.stroke(); } });
const brickTex=rectTex(256,256,(g,W,H)=>{ g.fillStyle='#d8c2a2'; g.fillRect(0,0,W,H); const bw=32,bh=16; let r=5; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let j=0;j<H/bh;j++) for(let i=-1;i<W/bw+1;i++){ const x=i*bw+(j%2?bw/2:0); g.fillStyle=['#b5452e','#a83f2a','#c0553a','#9e3c28','#b84d34'][Math.floor(R()*5)]; g.fillRect(x+1.5,j*bh+1.5,bw-3,bh-3);
    g.fillStyle='rgba(255,220,190,.12)'; g.fillRect(x+2,j*bh+2,bw-5,3); } });
const brickMat=(w,h)=>{ const t=brickTex.clone(); t.needsUpdate=true; t.repeat.set(Math.max(1,w*1.6),Math.max(1,h*1.6)); return new THREE.MeshStandardMaterial({map:t,roughness:.9}); };

/* ---------- 果樹：樹幹＋三團樹冠＋樹下一圈土；果子用 InstancedMesh 一次畫 ---------- */
const FR={ orange:[], guava:[], apple:[] };
function fruitTree(x,z,s=1,kind='orange'){
  cyl(.3*s,.34*s,.02,'#6b4a2e',x,.09,z,20);                                    // 樹下的土圈
  cyl(.055*s,.085*s,.55*s,'#8a5a35',x,.1,z,8);
  for(const [a,dy,k] of [[0,0,1],[2.1,.12,.78],[4.2,.08,.72]]){ const r=.36*s*k, f=add(new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),mat([LEAF,LEAF2,LEAF3][Math.round(a)%3],{flatShading:true,roughness:.9})));
    f.position.set(x+Math.cos(a)*.16*s*(k<1?1:0),.1+.78*s+dy*s,z+Math.sin(a)*.16*s*(k<1?1:0)); f.castShadow=true; }
  const n=kind==='apple'?12:14;
  for(let i=0;i<n;i++){ const th=rnd()*Math.PI*2, ph=.35+rnd()*1.0, r=.4*s;               // 掛在樹冠外面、偏下半圈
    const p=[x+Math.cos(th)*Math.sin(ph)*r, .1+.8*s+Math.cos(ph)*r*.8, z+Math.sin(th)*Math.sin(ph)*r];
    FR[kind].push(p); } }
function flushFruit(){
  const mk=(geo,m,list)=>{ if(!list.length) return; const im=new THREE.InstancedMesh(geo,m,list.length), o=new THREE.Object3D();
    list.forEach((p,i)=>{ o.position.set(...p); o.rotation.set(rnd()*.4,rnd()*6,rnd()*.4); o.updateMatrix(); im.setMatrixAt(i,o.matrix); }); im.castShadow=true; add(im); };
  mk(new THREE.SphereGeometry(.055,10,8),mat(ORANGE,{roughness:.5}),FR.orange);
  mk(new THREE.SphereGeometry(.062,10,8),mat(GUAVA,{roughness:.6}),FR.guava);                         // 綠色芭樂
  mk(new THREE.SphereGeometry(.058,10,8),mat('#d8342a',{roughness:.45}),FR.apple);                    // 紅蘋果
  FR.orange=[]; FR.guava=[]; FR.apple=[]; }

/* ---------- 香蕉樹（Lv2）：假莖＋七片長葉子往外垂＋一串綠黃香蕉＋紫色花苞 ---------- */
function banana(x,z,s=1){ const g=grp(x,.09,z,rnd()*6);
  cyl(.07*s,.1*s,1.0*s,'#7d9a4a',0,0,0,8,g); for(let i=0;i<3;i++) cyl(.075*s-.005*i,.075*s,.02,'#5f7a36',0,.25*s+i*.25*s,0,8,g);
  const lm=mat('#4fae4a',{side:THREE.DoubleSide,flatShading:true,roughness:.8}), lm2=mat('#3d9440',{side:THREE.DoubleSide,flatShading:true,roughness:.8});
  for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, L=.75*s, sh=new THREE.Shape(); sh.moveTo(0,0); sh.quadraticCurveTo(.13*s,L*.5,0,L); sh.quadraticCurveTo(-.13*s,L*.5,0,0);
    const geo=new THREE.ShapeGeometry(sh,6); const pos=geo.attributes.position; for(let k=0;k<pos.count;k++){ const y=pos.getY(k); pos.setZ(k,-(y/L)*(y/L)*.35*s); } geo.computeVertexNormals();
    const piv=new THREE.Group(); piv.position.y=.98*s; piv.rotation.y=a; g.add(piv); const lf=new THREE.Mesh(geo,i%2?lm:lm2); lf.rotation.x=-(.55+((i*37)%5)*.08); lf.castShadow=true; piv.add(lf);
    const mid=rbox(.012*s,.012,L*.9,'#a6c86a',0,0,0,.002,lf); mid.rotation.x=Math.PI/2; mid.position.set(0,L*.45,.005); }
  const b=grp(.12*s,.62*s,0,0,g); for(let r=0;r<4;r++) for(let k=0;k<6;k++){ const a=k/6*Math.PI*2, c=add(new THREE.Mesh(new THREE.CapsuleGeometry(.018*s,.09*s,3,6),mat(r<2?'#b8d24a':'#e8d84a',{roughness:.6})),b);
    c.position.set(Math.cos(a)*.06*s,-r*.07*s,Math.sin(a)*.06*s); c.rotation.set(Math.sin(a)*.5,0,-Math.cos(a)*.5); }
  rbox(.012,.3*s,.012,'#6b8a3a',0,-.06*s,0,.002,b); const bud=sphere(.045*s,'#8a2f5a',0,-.34*s,0,{flatShading:true},b); bud.scale.set(.8,1.3,.8);
  return g; }

/* ---------- 紅磚農舍：紅磚牆、紅瓦斜屋頂（瓦片線＋屋脊）、綠色木窗、雙開木門、斗笠、水缸、長板凳 ---------- */
function farmhouse(hx,hz){ const W=1.7, D=1.05, h=.95, Y=.09, fz=hz+D/2;
  rbox(W+.1,.1,D+.1,'#a8a092',hx,Y,hz,.02);                                     // 石頭牆腳
  rbox(W,h,D,brickMat(W,h),hx,Y+.1,hz,.015);
  for(const x of [hx-W/2,hx+W/2]) rbox(.08,h,.08,'#e8dcc4',x,Y+.1,fz,.01);       // 白色轉角
  rbox(W+.06,.06,.06,'#e8dcc4',hx,Y+.1+h-.06,fz+.01,.01);
  // 雙開木門＋門楣
  { const dx=hx+.25; rbox(.5,.68,.04,WOODD,dx,Y+.1,fz+.01,.008); for(const s of [-1,1]){ rbox(.2,.6,.03,'#8a5a32',dx+s*.11,Y+.13,fz+.03,.006); for(const y of [.28,.55]) rbox(.15,.18,.02,'#9c6a3c',dx+s*.11,Y+.1+y-.1,fz+.045,.004); sphere(.018,'#d8b45a',dx+s*.025,Y+.48,fz+.06); }
    rbox(.6,.07,.08,'#e8dcc4',dx,Y+.78,fz+.02,.01); rbox(.62,.03,.12,WOODD,dx,Y+.1,fz+.04,.004); }
  // 綠色木窗（木框＋鐵條＋窗台）
  const win=(x,y,z,ry=0)=>{ const g=grp(x,y,z,ry); rbox(.42,.36,.03,WINGREEN,0,0,0,.006,g); rbox(.34,.28,.02,mat('#ffe2a6',{emissive:new THREE.Color('#ffb85a'),emissiveIntensity:.2}),0,.04,.015,.003,g);
    for(let i=-2;i<=2;i++) rbox(.015,.28,.015,'#3a3a3a',i*.065,.04,.03,.002,g); rbox(.48,.04,.09,'#e8dcc4',0,-.03,.03,.006,g); };
  win(hx-.45,Y+.42,fz+.01); win(hx+W/2+.01,Y+.42,hz,Math.PI/2);
  // 紅瓦斜屋頂（屋脊左右走向）：group 轉 90°，裡面照山牆屋頂的做法
  const ry=Y+.1+h, RD=D+.32, RW=W+.32, RH=.55; const g=grp(hx,ry,hz,Math.PI/2);
  prism(RD,RW,RH,TERRA,0,0,0,'z',g); const hw=RD/2, sl=Math.atan2(RH,hw);
  for(const s of [-1,1]) for(let i=1;i<6;i++){ const t=i/6, r=rbox(.035,.025,RW+.02,TERRA2,s*hw*t,RH*(1-t)-.01,0,.004,g); r.rotation.z=-s*sl; }
  for(const s of [-1,1]) for(let k=-6;k<=6;k++){ const L=Math.hypot(hw,RH), r=rbox(.014,.014,L,TERRA2,s*hw/2,RH/2,k*(RW/13),.002,g); r.rotation.order='YXZ'; r.rotation.y=Math.PI/2; r.rotation.x=s*sl; r.position.y=RH/2-.005; }
  rbox(.1,.08,RW+.06,TERRA2,0,RH-.05,0,.02,g);                                   // 屋脊
  for(const s of [-1,1]){ const sh=new THREE.Shape(); sh.moveTo(-hw+.12,0); sh.lineTo(hw-.12,0); sh.lineTo(0,RH*(hw-.12)/hw); sh.closePath();
    const gm=new THREE.Mesh(new THREE.ShapeGeometry(sh),brickMat(.8,.4)); gm.position.set(0,.003,s*(RW/2-.15)); if(s<0) gm.rotation.y=Math.PI; g.add(gm); }
  for(const s of [-1,1]) for(const t of [-1,1]){ const b=rbox(.04,.05,Math.hypot(hw,RH)+.04,'#7a3a28',t*hw/2,RH/2-.02,s*(RW/2+.01),.006,g); b.rotation.order='YXZ'; b.rotation.y=Math.PI/2; b.rotation.x=t*sl; }
  // 斗笠、水缸、長板凳、煙囪
  { const hat=cyl(.005,.15,.06,'#d9bf7a',hx-.82,Y+.66,fz+.03,16); hat.rotation.x=Math.PI/2-.2; }
  { const j=sphere(.15,mat('#6b3a22',{roughness:.35}),hx-.75,Y+.15,fz+.25); j.scale.set(1,.95,1); const rim=add(new THREE.Mesh(new THREE.TorusGeometry(.11,.025,6,16),mat('#5a2f1a'))); rim.rotation.x=Math.PI/2; rim.position.set(hx-.75,Y+.29,fz+.25); cyl(.1,.1,.01,'#4a8ac0',hx-.75,Y+.27,fz+.25,16); }
  { const bx=hx+.85, bz=fz+.22; rbox(.5,.04,.14,WOOD,bx,Y+.22,bz,.008); for(const s of [-1,1]) rbox(.04,.22,.12,WOODD,bx+s*.2,Y,bz,.006); }
  rbox(.18,.45,.18,'#9e3c28',hx+.55,ry+.15,hz-.2,.01); rbox(.22,.05,.22,'#e8dcc4',hx+.55,ry+.6,hz-.2,.01); }

/* ---------- 小物：木梯、水果箱、手推車、竹籬笆、大橘子路標、石板步道 ---------- */
function ladder(x,z,ry){ const g=grp(x,.09,z,ry); const p=grp(0,0,0,0,g); p.rotation.x=-.32;
  for(const s of [-1,1]) rbox(.03,1.0,.03,'#c49a5a',s*.12,0,0,.004,p); for(let i=1;i<7;i++) rbox(.24,.022,.022,'#b88a4a',0,i*.14,0,.003,p); }
function crate(x,y,z,ry=0,fruit=ORANGE){ const g=grp(x,y,z,ry); rbox(.34,.18,.24,'#c49a5a',0,0,0,.008,g);
  for(const yy of [.04,.1]) for(const s of [-1,1]) rbox(.35,.03,.005,'#9c7442',0,yy,s*.122,.002,g);
  for(let i=0;i<4;i++) for(let j=0;j<3;j++) FR.orange.push(fruit===ORANGE?[x+(i-1.5)*.075*Math.cos(ry),y+.19,z+(j-1)*.07]:[0,-9,0]);
  return g; }
function cart(x,z,ry){ const g=grp(x,.09,z,ry); const tr=rbox(.42,.14,.3,'#4a7ab0',0,.16,0,.02,g);
  const w=add(new THREE.Mesh(new THREE.TorusGeometry(.08,.025,8,16),mat('#2b2b2b')),g); w.position.set(.26,.09,0); w.rotation.y=Math.PI/2;
  for(const s of [-1,1]){ const hd=rbox(.42,.025,.025,WOODD,-.32,.2,s*.11,.004,g); hd.rotation.z=-.25; rbox(.025,.14,.025,'#555',-.12,.02,s*.11,.003,g); }
  for(let i=0;i<5;i++) FR.orange.push([x+Math.cos(ry)*(-.08+i*.04),.39,z+(i%2?-.05:.05)]); }
function fenceSeg(x0,z0,x1,z1){ const L=Math.hypot(x1-x0,z1-z0), a=Math.atan2(z1-z0,x1-x0), n=Math.max(1,Math.round(L/.32));
  for(let i=0;i<=n;i++){ const t=i/n; cyl(.025,.028,.36,i%2?BAMBOO:BAMBOO2,x0+(x1-x0)*t,.09,z0+(z1-z0)*t,6); sphere(.026,BAMBOO2,x0+(x1-x0)*t,.45,z0+(z1-z0)*t); }
  for(const y of [.2,.36]){ const r=add(new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,L,6),mat(BAMBOO))); r.position.set((x0+x1)/2,y,(z0+z1)/2); r.rotation.order='YXZ'; r.rotation.y=-a; r.rotation.z=Math.PI/2; } }
function fence(){ const R=3.5, c=R/2, zz=R*Math.sqrt(3)/2;
  fenceSeg(-R,0,-c,zz); fenceSeg(-c,zz,-.45,zz); fenceSeg(.55,zz,c,zz); fenceSeg(c,zz,R,0); }
function bigOrange(x,z){ crate(x,.09,z,.2); crate(x+.05,.27,z-.02,-.15); const o=sphere(.26,mat(ORANGE,{roughness:.45}),x+.03,.72,z-.01); o.scale.set(1,.93,1);
  for(let i=0;i<40;i++){ const th=rnd()*6.28, ph=rnd()*3.1; sphere(.012,'#e8861a',x+.03+Math.cos(th)*Math.sin(ph)*.255,.72+Math.cos(ph)*.24,z-.01+Math.sin(th)*Math.sin(ph)*.255); }
  cyl(.015,.02,.06,'#6b4a2e',x+.03,.95,z-.01,6); const lf=sphere(.07,LEAF2,x+.1,.98,z-.01,{flatShading:true}); lf.scale.set(1.3,.35,.7); }
function path(pts){ // 米色碎石路底＋不規則多邊形石板（深淺不同）＋兩旁小卵石
  for(let i=0;i<pts.length-1;i++){ const [x0,z0]=pts[i],[x1,z1]=pts[i+1], L=Math.hypot(x1-x0,z1-z0), a=Math.atan2(x1-x0,z1-z0);
    const b=rbox(.66,.015,L+.3,'#d9cba8',(x0+x1)/2,.09,(z0+z1)/2,.006); b.rotation.y=a;
    const n=Math.round(L/.3); for(let k=0;k<n;k++){ const t=(k+.5)/n, cx=x0+(x1-x0)*t+(rnd()-.5)*.1, cz=z0+(z1-z0)*t+(rnd()-.5)*.08;
      const sh=new THREE.Shape(), m=5+Math.floor(rnd()*3), rr=.1+rnd()*.05; for(let j=0;j<m;j++){ const an=j/m*6.28+rnd()*.5, r=rr*(.75+rnd()*.4); j?sh.lineTo(Math.cos(an)*r,Math.sin(an)*r):sh.moveTo(Math.cos(an)*r,Math.sin(an)*r); } sh.closePath();
      const geo=new THREE.ExtrudeGeometry(sh,{depth:.025,bevelEnabled:true,bevelThickness:.008,bevelSize:.01,bevelSegments:1}); geo.rotateX(-Math.PI/2);
      const st=add(new THREE.Mesh(geo,mat(['#b8b2a6','#a49e92','#c6c0b2','#9a958a'][Math.floor(rnd()*4)],{roughness:.9,flatShading:true}))); st.position.set(cx,.1,cz); st.rotation.y=rnd()*6; st.receiveShadow=true;
      for(const s of [-1,1]) sphere(.025+rnd()*.015,['#cfc7b8','#a8a094','#e2dccf'][Math.floor(rnd()*3)],cx+Math.cos(a)*s*.36,.1,cz-Math.sin(a)*s*.36,{flatShading:true}); } } }

function orchard(lv){ seed=11;
  const gt=grassTex.clone(); gt.needsUpdate=true; gt.repeat.set(3,3); hexPad(new THREE.MeshStandardMaterial({map:gt,roughness:.95}),.42,.07,0);
  path([[0,2.95],[.15,1.9],[.9,.5],[1.4,-.55]]);
  // 果樹：後面兩排橘子、前面兩排套袋芭樂
  for(const x of [-1.9,-.9,.1]) fruitTree(x,-2.05,.95,'orange');
  for(const x of [-2.4,-1.4,-.4]) fruitTree(x,-1.0,1.0,'orange');
  for(const x of [-2.6,-1.6,-.6]) fruitTree(x,.1,.95,'guava');
  for(const x of [-2.1,-1.1]) fruitTree(x,1.2,.9,'apple');
  ladder(-.4,-.6,0.2);
  farmhouse(1.5,-1.35);
  crate(2.05,.09,-.4,.3); crate(2.35,.09,-.25,-.2); crate(2.15,.27,-.33,.1);
  cart(1.75,.75,-.6);
  fence(); bigOrange(-.68,2.82);
  if(lv>=2){
    for(const [x,z,r] of [[2.65,.3,.4],[2.9,-.35,2.2],[2.15,.9,4.1]]) kit('models/sk/banana.glb',x,z,{h:1.45,rot:r,y0:.09});   // 香蕉樹（Sketchfab「Banana Tree」，CC-BY-4.0，作者 Duznot；拿掉花盆、貼圖縮成 512）
    kit('models/sk/fruitstand.glb',1.25,1.75,{h:1.3,rot:-Math.PI/2,y0:.09,then:o=>o.traverse(m=>{ if(!m.isMesh) return; if(!m.geometry.attributes.normal) m.geometry.computeVertexNormals(); m.material=new THREE.MeshStandardMaterial({map:m.material.map,side:THREE.DoubleSide,roughness:.85}); })});   // 家長 00:00：原本太亮——模型是「不受光」材質，換成會吃燈光、有陰影的材質      // 水果攤（Sketchfab，CC-BY-4.0）
    kit('models/car3/tractor.glb',-1.95,2.0,{w:.75,rot:Math.PI/2,y0:.09});        // 小拖拉機
    { const g=grp(-1.3,.09,2.0,0); rbox(.55,.06,.42,WOODD,0,.12,0,.01,g); for(const s of [-1,1]){ const w=add(new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.05,14),mat('#2b2b2b')),g); w.rotation.x=Math.PI/2; w.position.set(0,.09,s*.23); }
      for(const [dx,dz,y] of [[-.13,-.1,.18],[.13,-.1,.18],[0,.1,.18],[0,-.02,.36]]) crate(-1.3+dx,.09+y,2.0+dz,0); }
  }
  flushFruit();
}

export const ORCHARD_LV=[1,2].map(l=>['orchard'+(l>1?l:''),'果園 Lv'+l+(l>1?' 擴大果園':' 小果園'),()=>orchard(l),'whole']), ORCHARD_TOP=[0,2.0,2.2];
