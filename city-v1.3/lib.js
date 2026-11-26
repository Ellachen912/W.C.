/* Winston City 共用小工具：形狀、材質、窗門、樹、旗子等。所有建築都用這些零件組合，風格才會一致。 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* ---------- 小工具 ---------- */
export let ROOT=null;
export function setRoot(g){ ROOT=g; }
export const mats={};
export function mat(c,o={}){ const k=c+JSON.stringify(o); return mats[k]||(mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:.78,metalness:0,...o})); }
export const M=c=> c.isMaterial?c:mat(c);
export function add(mesh,parent){ mesh.castShadow=true; mesh.receiveShadow=true; (parent||ROOT).add(mesh); return mesh; }
// 圓角方塊：(x,z) 是中心，y 是底部
export function rbox(w,h,d,c,x,y,z,r=.05,parent){ const m=add(new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/2-.001,h/2-.001,d/2-.001)),M(c)),parent); m.position.set(x,y+h/2,z); return m; }
export function cyl(rt,rb,h,c,x,y,z,seg=24,parent){ const m=add(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),M(c)),parent); m.position.set(x,y+h/2,z); return m; }
export function sphere(r,c,x,y,z,o={},parent){ const m=add(new THREE.Mesh(new THREE.SphereGeometry(r,24,16),c.isMaterial?c:mat(c,o)),parent); m.position.set(x,y,z); return m; }
export const GOLDM=()=>mat('#f2c14e',{metalness:.5,roughness:.3});
// 四坡屋頂（hip roof），w 沿 x、d 沿 z
export function hipGeom(w,d,h){
  const hw=w/2,hd=d/2, r=Math.min(hw,hd);
  const A=[-hw,0,-hd],B=[hw,0,-hd],C=[hw,0,hd],D=[-hw,0,hd];
  const R1=[-hw+r,h,0], R2=[hw-r,h,0];
  const tris=[D,C,R2, D,R2,R1, B,A,R1, B,R1,R2, C,B,R2, A,D,R1];
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(tris.flat(),3)); g.computeVertexNormals(); return g;
}
export function hip(w,d,h,c,x,y,z,parent){ const m=add(new THREE.Mesh(c.isMaterial?hipGeom(w,d,h):roofUV(hipGeom(w,d,h)),c.isMaterial?c:tileMat(c)),parent); m.position.set(x,y,z); return m; }   // 斜屋頂一律有瓦片（家長 11-18 23:28）
// 三角柱（山牆）：屋脊沿 z，三角形朝前（+z）
export function gableGeom(w,d,h,axis='z'){
  const hw=w/2,hd=d/2;
  const A=[-hw,0,-hd],B=[hw,0,-hd],C=[hw,0,hd],D=[-hw,0,hd],R1=[0,h,-hd],R2=[0,h,hd];
  const tris=[D,C,R2, B,A,R1, A,D,R2, A,R2,R1, C,B,R1, C,R1,R2];
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(tris.flat(),3)); g.computeVertexNormals(); return g;
}
export function prism(w,d,h,c,x,y,z,axis='z',parent){   // 山牆屋頂：兩個斜面有瓦片、前後三角形是素色（家長 11-18 23:28）；很薄的（山牆裝飾板）照舊
  if(c.isMaterial||w<.15||d<.15){ const m=add(new THREE.Mesh(gableGeom(w,d,h,axis),c.isMaterial?c:mat(c,{flatShading:true})),parent); m.position.set(x,y,z); return m; }
  const g=roofUV(gableGeom(w,d,h,axis)); g.clearGroups(); g.addGroup(0,6,1); g.addGroup(6,12,0);
  const m=add(new THREE.Mesh(g,[tileMat(c),mat(c,{flatShading:true})]),parent); m.position.set(x,y,z); return m; }

/* 程式畫的材質 */
export function canvasTex(draw,size=256){ const cv=document.createElement('canvas'); cv.width=cv.height=size; draw(cv.getContext('2d'),size); const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t; }
export const texCache={};
export function texMat(key,tex,rx,ry){ const k=key+rx+'x'+ry; if(texCache[k]) return texCache[k]; const t=tex.clone(); t.needsUpdate=true; t.repeat.set(rx,ry); return texCache[k]=new THREE.MeshStandardMaterial({map:t,roughness:.85}); }
export const brickTex=canvasTex((g,s)=>{ g.fillStyle='#e9d6c4'; g.fillRect(0,0,s,s); const bh=s/8,bw=s/4;
  for(let r=0;r<8;r++) for(let c=-1;c<5;c++){ const x=c*bw+(r%2?bw/2:0); const v=(r*7+c*13)%5; g.fillStyle=['#d9785e','#d26f56','#de8266','#cf6b52','#d97b60'][(v+5)%5]; g.beginPath(); g.roundRect(x+2,r*bh+2,bw-4,bh-4,3); g.fill(); } });
export function stoneTex(base,line){ return canvasTex((g,s)=>{ g.fillStyle=base; g.fillRect(0,0,s,s); g.strokeStyle=line; g.lineWidth=2; const bh=s/4,bw=s/2;
  for(let r=0;r<4;r++){ g.beginPath(); g.moveTo(0,r*bh); g.lineTo(s,r*bh); g.stroke(); for(let c=0;c<3;c++){ const x=c*bw+(r%2?bw/2:0); g.beginPath(); g.moveTo(x,r*bh); g.lineTo(x,r*bh+bh); g.stroke(); } } }); }
export const creamStone=stoneTex('#f1e2c4','rgba(170,140,100,.35)');
export const grassTex=canvasTex((g,s)=>{ const n=4,q=s/n; for(let i=0;i<n;i++)for(let j=0;j<n;j++){ g.fillStyle=(i+j)%2?'#8fd06a':'#9ad874'; g.fillRect(i*q,j*q,q,q); }
  for(let k=0;k<260;k++){ g.fillStyle=k%3?'rgba(70,140,50,.18)':'rgba(255,255,255,.18)'; g.fillRect((k*97)%s,(k*61)%s,2,3); } });

export const CREAM='#f7ecd8', ROOF='#5b8fd0', ROOF2='#4f83c4', GOLD='#f2c14e', GLASS='#a8dcf0', DOOR='#7a4a33';
export const glassMat=mat(GLASS,{roughness:.15,metalness:.1,emissive:0x1d4a5c,emissiveIntensity:.15});

/* 牆上的拱形窗：group 朝 +z，放在牆面上 */
export function archWin(w,h,parent,x,y,z,rotY=0,frame=CREAM){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rotY; (parent||ROOT).add(g);
  rbox(w+.1,h+.06,.06,frame,0,-.03,0,.02,g);
  const top=new THREE.Mesh(new THREE.CircleGeometry(w/2+.05,20,0,Math.PI),mat(frame)); top.position.set(0,h,.031); g.add(top);
  const top2=new THREE.Mesh(new THREE.CircleGeometry(w/2,20,0,Math.PI),glassMat); top2.position.set(0,h,.035); g.add(top2);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(w,h),glassMat); gl.position.set(0,h/2,.035); g.add(gl);
  rbox(.035,h+w/2,.03,frame,0,0,.04,.01,g); rbox(w,.035,.03,frame,0,h*.5,.04,.01,g);
  rbox(w+.16,.05,.1,frame,0,-.06,.03,.02,g);
  return g;
}
export function archDoor(w,h,c,parent,x,y,z,rotY=0,frame=CREAM){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rotY; (parent||ROOT).add(g);
  rbox(w+.12,h+.02,.06,frame,0,0,0,.02,g);
  const t=new THREE.Mesh(new THREE.CircleGeometry(w/2+.06,20,0,Math.PI),mat(frame)); t.position.set(0,h,.031); g.add(t);
  rbox(w,h,.08,c,0,0,.0,.02,g);
  const t2=new THREE.Mesh(new THREE.CircleGeometry(w/2,20,0,Math.PI),mat(c)); t2.position.set(0,h,.041); g.add(t2);
  rbox(.02,h,.09,new THREE.Color(c).offsetHSL(0,0,-.12).getStyle(),0,0,.0,.005,g);
  sphere(.03,GOLDM(),.07,h*.5,.06,{},g); sphere(.03,GOLDM(),-.07,h*.5,.06,{},g);
  return g;
}
export function clock(r,parent,x,y,z,rotY=0){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rotY; (parent||ROOT).add(g);
  const face=add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,.05,40),mat('#fffaf0')),g); face.rotation.x=Math.PI/2;
  const rim=add(new THREE.Mesh(new THREE.TorusGeometry(r,.035,10,40),GOLDM()),g); rim.position.z=.02;
  for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; const m=new THREE.Mesh(new THREE.BoxGeometry(.025,.06,.01),mat('#3b3550')); m.position.set(Math.sin(a)*r*.8,Math.cos(a)*r*.8,.03); m.rotation.z=-a; g.add(m); }
  const hg=new THREE.Group(); hg.position.z=.04; g.add(hg); const hh=new THREE.Mesh(new THREE.BoxGeometry(.035,r*.5,.015),mat('#3b3550')); hh.position.y=r*.2; hg.add(hh);
  const mg=new THREE.Group(); mg.position.z=.045; g.add(mg); const mh=new THREE.Mesh(new THREE.BoxGeometry(.025,r*.75,.015),mat('#3b3550')); mh.position.y=r*.33; mg.add(mh);
  anims.push(()=>{ const d=new Date(), m=d.getMinutes()+d.getSeconds()/60, h=d.getHours()%12+m/60; mg.rotation.z=-m/60*Math.PI*2; hg.rotation.z=-h/12*Math.PI*2; });   // 時鐘指針照真的時間走
  sphere(.03,GOLDM(),0,0,.05,{},g);
  return g;
}
export function shade(c,l){ return new THREE.Color(c).offsetHSL(0,0,l).getStyle(); }
export function tree(x,z,s=1,c='#62b955'){
  cyl(.06*s,.09*s,.45*s,'#a8744f',x,0,z,10);
  const f1=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.42*s,1),mat(c,{flatShading:true,roughness:.9}))); f1.position.set(x,.75*s,z);
  const f2=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.3*s,1),mat(shade(c,.06),{flatShading:true,roughness:.9}))); f2.position.set(x+.08*s,1.08*s,z+.04*s);
}
export function bush(x,z,s=1,flower='#ff8fa3'){
  const b=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.24*s,1),mat('#5fb35a',{flatShading:true,roughness:.9}))); b.position.set(x,.16*s,z); b.scale.set(1.3,.8,1.1);
  if(flower) for(const [dx,dz] of [[.12,.18],[-.15,.12],[.2,-.05]]) sphere(.035*s,flower,x+dx*s,.3*s,z+dz*s);
}
export function lamp(x,z){
  cyl(.03,.04,1.1,'#4d4a63',x,0,z,10);
  sphere(.09,'#fff3c4',x,1.17,z,{emissive:0xffe08a,emissiveIntensity:.35});
  const cap=add(new THREE.Mesh(new THREE.ConeGeometry(.11,.1,12),mat('#4d4a63'))); cap.position.set(x,1.29,z);
}
export function bench(x,z,rotY=0){
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rotY; ROOT.add(g);
  rbox(.6,.05,.2,'#c98d55',0,.16,0,.02,g); rbox(.6,.16,.04,'#c98d55',0,.22,-.09,.02,g);
  rbox(.05,.16,.16,'#6d6a7d',-.24,0,0,.01,g); rbox(.05,.16,.16,'#6d6a7d',.24,0,0,.01,g);
}
export const flags=[], drops=[];
export const animals=[];   // 會動的動物：{g, kind, x0, z0, r}（life.js 讓牠們走動）
/* Winston City 市旗：淺藍底色，中間一顆木星（木星是這座城市的主題） */
export const CITY_BLUE='#7cc8f0';
export function drawJupiter(g,cx,cy,R){
  g.save(); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.clip();
  const bands=[['#f4e4c4',.0],['#d9a36a',.16],['#f0d6ab',.27],['#c98a55',.38],['#f6e8cc',.5],['#d39a62',.62],['#ecd0a3',.72],['#c7884f',.82],['#f1dcb5',.9]];
  bands.forEach(([c,t],i)=>{ const y0=cy-R+t*2*R; const y1=cy-R+((bands[i+1]||[0,1])[1])*2*R; g.fillStyle=c; g.beginPath(); g.moveTo(cx-R,y0);
    for(let x=0;x<=2*R;x+=8) g.lineTo(cx-R+x,y0+Math.sin(x*.05+i)*3); g.lineTo(cx+R,y1+4); g.lineTo(cx-R,y1+4); g.closePath(); g.fill(); });
  g.fillStyle='#c4573d'; g.beginPath(); g.ellipse(cx+R*.32,cy+R*.3,R*.22,R*.12,-.08,0,Math.PI*2); g.fill();
  g.fillStyle='#e48a6c'; g.beginPath(); g.ellipse(cx+R*.3,cy+R*.29,R*.12,R*.06,-.08,0,Math.PI*2); g.fill();
  const sh=g.createRadialGradient(cx-R*.4,cy-R*.45,R*.1,cx,cy,R*1.05); sh.addColorStop(0,'rgba(255,255,255,.35)'); sh.addColorStop(.6,'rgba(255,255,255,0)'); sh.addColorStop(1,'rgba(90,50,30,.35)');
  g.fillStyle=sh; g.fillRect(cx-R,cy-R,2*R,2*R); g.restore();
  g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.lineWidth=10; g.strokeStyle='#ffffff'; g.stroke();
}
export const cityFlagTex=(()=>{ const cv=document.createElement('canvas'); cv.width=550; cv.height=340; const g=cv.getContext('2d');
  g.fillStyle=CITY_BLUE; g.fillRect(0,0,550,340);
  g.strokeStyle='#ffffff'; g.lineWidth=14; g.strokeRect(7,7,536,326);
  drawJupiter(g,275,170,112);
  const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; })();
export const jupiterTex=(()=>{ const cv=document.createElement('canvas'); cv.width=512; cv.height=256; const g=cv.getContext('2d');
  const bands=[['#f4e4c4',0],['#d9a36a',.14],['#f0d6ab',.26],['#c98a55',.37],['#f6e8cc',.48],['#d39a62',.6],['#ecd0a3',.71],['#c7884f',.81],['#f1dcb5',.9]];
  bands.forEach(([c,t],i)=>{ const y0=t*256, y1=((bands[i+1]||[0,1])[1])*256; g.fillStyle=c; g.beginPath(); g.moveTo(0,y0);
    for(let x=0;x<=512;x+=8) g.lineTo(x,y0+Math.sin(x*.04+i*1.7)*3); g.lineTo(512,y1+4); g.lineTo(0,y1+4); g.closePath(); g.fill(); });
  g.fillStyle='#c4573d'; g.beginPath(); g.ellipse(330,168,34,16,0,0,Math.PI*2); g.fill();
  g.fillStyle='#e48a6c'; g.beginPath(); g.ellipse(328,167,18,8,0,0,Math.PI*2); g.fill();
  const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; })();
export const spinners=[];
export const blockers=[];   /* 移交 11-26：市長、Avery 的位置（Vector3）；市長家的狗走到他們旁邊會停下來讓路 */
export const anims=[];   /* 家長 11-13 17:46：建築裡會動的小東西，每一格畫面呼叫 f(t,dt) */
export const cityFlagMat=new THREE.MeshStandardMaterial({map:cityFlagTex,side:THREE.DoubleSide,roughness:.8});
export function flag(x,z,h,c,y0=0){
  cyl(.025,.03,h,'#8c8aa0',x,y0,z,10); sphere(.05,GOLDM(),x,y0+h+.03,z);
  const geo=new THREE.PlaneGeometry(.55,.34,12,2); geo.translate(.275,0,0);
  const m=add(new THREE.Mesh(geo,c==='city'?cityFlagMat:mat(c,{side:THREE.DoubleSide}))); m.position.set(x+.02,y0+h-.2,z); // 'city' = 市旗
  flags.push({m,base:geo.attributes.position.array.slice()});
}
/* 彩旗串：兩點之間下垂的繩子掛三角小旗 */
export function bunting(a,b,n,sag=.35){
  const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),Mid=A.clone().add(B).multiplyScalar(.5); Mid.y-=sag;
  const curve=new THREE.QuadraticBezierCurve3(A,Mid,B);
  add(new THREE.Mesh(new THREE.TubeGeometry(curve,20,.008,5),mat('#7d7a92')));
  const cols=['#ff6b6b','#ffd166','#4ecdc4','#5b8def','#c77dff'];
  const tri=new THREE.BufferGeometry(); tri.setAttribute('position',new THREE.Float32BufferAttribute([-.07,0,0, .07,0,0, 0,-.16,0],3)); tri.computeVertexNormals();
  const ang=Math.atan2(B.z-A.z,B.x-A.x);
  for(let i=1;i<n;i++){ const p=curve.getPoint(i/n); const m=add(new THREE.Mesh(tri,mat(cols[i%5],{side:THREE.DoubleSide}))); m.position.copy(p); m.rotation.y=-ang; }
}
/* 廣場鋪石 */
export function plaza(c1,c2,nx=10,nz=4,x0=-1.7,z0=.85,s=.34){
  for(let i=0;i<nx;i++) for(let j=0;j<nz;j++) rbox(s-.03,.05,s-.03,(i+j)%2?c1:c2,x0+s*i+s/2,0,z0+s*j+s/2,.03);
}
export function textPlate(text,w,h,bg,fg,x,y,z){
  const cv=document.createElement('canvas'); cv.width=512; cv.height=Math.round(512*h/w);
  const g=cv.getContext('2d'); g.fillStyle=bg; g.fillRect(0,0,cv.width,cv.height); g.fillStyle=fg;
  g.font=`bold ${Math.round(cv.height*.72)}px "PingFang TC","Noto Sans TC",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText(text,cv.width/2,cv.height/2+4);
  const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace;
  rbox(w+.06,h+.06,.05,'#8b5a3c',x,y-.03,z,.02);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.9})); p.position.set(x,y+h/2,z+.03); ROOT.add(p);
}
export function bell(x,y,z){
  const pts=[[0,0],[.17,0],[.16,.04],[.12,.12],[.1,.22],[.07,.28],[0,.29]].map(([a,b])=>new THREE.Vector2(a,b));
  const g=new THREE.Group(); g.position.set(x,y+.29,z); ROOT.add(g);                 // 掛點在鐘頂，整個鐘左右搖
  const m=add(new THREE.Mesh(new THREE.LatheGeometry(pts,24),mat(GOLD,{metalness:.55,roughness:.3,side:THREE.DoubleSide})),g); m.position.y=-.29;
  sphere(.04,'#c9962a',0,-.31,0,{},g);
  anims.push(t=>{ const k=t%9; g.rotation.z=k<2.6?Math.sin(k*7)*.38*(1-k/2.6):0; });   // 每 9 秒噹噹搖一陣
}
export function column(x,z,h,c='#fffaf0',r=.085,y0=.22){
  rbox(r*2.6,.06,r*2.6,c,x,y0,z,.02);
  cyl(r*.92,r,h-.12,c,x,y0+.06,z,16);
  rbox(r*2.6,.06,r*2.6,c,x,y0+h-.06,z,.02);
}

export function palm(x,z,s=1){
  let px=x,py=0;
  for(let i=0;i<7;i++){ cyl(.07*s,.085*s,.25*s,i%2?'#b98a5a':'#c79a68',px,py,z,8); py+=.23*s; px+=.025*s*i; }
  const top=new THREE.Group(); top.position.set(px,py+.02,z); ROOT.add(top);
  for(let k=0;k<7;k++){ const arm=new THREE.Group(); arm.rotation.y=k/7*Math.PI*2+.3; top.add(arm);
    const leaf=rbox(.16*s,.02,.75*s,k%2?'#4fae4f':'#5cbc58',0,0,.3*s,.01,arm); leaf.rotation.x=.5; leaf.position.y=-.1*s; }
  for(let k=0;k<3;k++){ const a=k/3*Math.PI*2; sphere(.07*s,'#7a5232',px+Math.cos(a)*.09*s,py-.06*s,z+Math.sin(a)*.09*s); }
}
/* 會動的煙（家長 2026-11-11 20:11）：一團一團從煙囪口冒出來，往上飄、變大、變淡，消失後下一團接著冒 */
export const puffs=[];
export function puff(x,y,z,{color='#ffffff',op=.75,r=.18,rise=1.1,drift=.35,n=4,speed=.32,sy=1}={},parent){
  for(let i=0;i<n;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshStandardMaterial({color,transparent:true,opacity:op,roughness:1,depthWrite:false}));
    m.position.set(x,y,z); (parent||ROOT).add(m); puffs.push({m,x,y,z,r,rise,drift,op,ph:i/n,speed,sy}); }
}
export function animPuffs(t){ for(const p of puffs){ const k=(t*p.speed+p.ph)%1, s=p.r*(.55+1.1*k);
  p.m.position.set(p.x+p.drift*k,p.y+p.rise*k,p.z); p.m.scale.set(s,s*p.sy,s); p.m.material.opacity=p.op*Math.min(1,k*5)*(1-k); } }

/* 整格底盤：貼合六角格（內縮 inset），在放大前的世界座標畫 */
export function hexPad(color,inset=.42,h=.09,y=0){ const R=4.2-inset, s=new THREE.Shape(); for(let i=0;i<6;i++){ const a=i*Math.PI/3; i?s.lineTo(R*Math.cos(a),R*Math.sin(a)):s.moveTo(R*Math.cos(a),R*Math.sin(a)); } s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2);
  const m=add(new THREE.Mesh(g,color&&color.isMaterial?color:mat(color))); m.position.y=y; m.receiveShadow=true; m.userData.noCheck=1; return m; }

/* 水面波紋：一圈一圈往外擴散、變淡（自來水廠淨水池） */
export function ripples(x,y,z,r,parent){ const ms=[];
  for(let i=0;i<3;i++){ const m=new THREE.Mesh(new THREE.RingGeometry(.88,1,48),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false})); m.rotation.x=-Math.PI/2; m.position.set(x,y,z); m.userData.noCheck=1; (parent||ROOT).add(m); ms.push(m); }
  anims.push(t=>ms.forEach((m,i)=>{ const k=(t*.3+i/3)%1, s=r*(.15+.85*k); m.scale.set(s,s,1); m.material.opacity=.5*(1-k)*Math.min(1,k*5); })); }
/* 蝴蝶：在空中畫 8 字飛，翅膀一直拍（空中的東西不會有「在地上滑」的問題） */
export function butterfly(x,y,z,{c='#f6a8c9',c2='#ffffff',r=.6,sp=.55,ph=Math.random()*6}={},parent){
  const g=new THREE.Group(); (parent||ROOT).add(g); const s=new THREE.Shape(); s.moveTo(0,0); s.bezierCurveTo(.05,.09,.12,.08,.11,.02); s.bezierCurveTo(.12,-.03,.07,-.08,0,0);
  const wm=new THREE.MeshStandardMaterial({color:c,side:THREE.DoubleSide,roughness:.7}), dot=new THREE.MeshStandardMaterial({color:c2,side:THREE.DoubleSide});
  const wings=[]; for(const sd of [-1,1]){ const pv=new THREE.Group(); g.add(pv); const w=new THREE.Mesh(new THREE.ShapeGeometry(s),wm); w.rotation.x=-Math.PI/2; w.scale.x=sd; pv.add(w);
    const d=new THREE.Mesh(new THREE.CircleGeometry(.018,10),dot); d.rotation.x=-Math.PI/2; d.position.set(sd*.07,.002,-.03); pv.add(d); wings.push([pv,sd]); }
  const b=new THREE.Mesh(new THREE.CapsuleGeometry(.012,.07,4,8),mat('#3b3550')); b.rotation.x=Math.PI/2; g.add(b);
  anims.push(t=>{ const a=t*sp+ph, px=x+Math.cos(a)*r, pz=z+Math.sin(2*a)*r*.5, nx=-Math.sin(a), nz=Math.cos(2*a);
    g.position.set(px,y+Math.sin(t*1.7+ph)*.12,pz); g.rotation.y=Math.atan2(nx,nz);
    const f=.15+1.0*Math.abs(Math.sin(t*13+ph)); for(const [pv,sd] of wings) pv.rotation.z=sd*f; });
  return g; }

/* ===== 家長 11-18 23:28 的規則：斜屋頂要有磚瓦質地、柱子要羅馬柱（共用） ===== */
/* 瓦片貼圖：一排排有圓弧下緣的筒瓦，深淺略有不同；每 0.5 單位 4×4 片 */
const _tileTex={};
export function roofTileTex(base){ if(_tileTex[base]) return _tileTex[base]; const c=new THREE.Color(base);
  const sh=(k)=>{ const t=c.clone(); t.offsetHSL(0,0,k); return '#'+t.getHexString(); };
  return _tileTex[base]=canvasTex((g,s)=>{ g.fillStyle=sh(-.12); g.fillRect(0,0,s,s); const n=4, q=s/n;
    for(let j=0;j<n;j++) for(let i=-1;i<=n;i++){ const x=i*q+(j%2?q/2:0), y=j*q;
      g.fillStyle=sh([0,.03,-.03,.05,-.05][(i*7+j*3+20)%5]); g.beginPath(); g.moveTo(x+2,y); g.lineTo(x+q-2,y); g.lineTo(x+q-2,y+q*.72); g.quadraticCurveTo(x+q/2,y+q*1.02,x+2,y+q*.72); g.closePath(); g.fill();
      g.fillStyle='rgba(255,255,255,.16)'; g.fillRect(x+q*.22,y+2,q*.14,q*.6);                       // 筒瓦亮面
      g.fillStyle='rgba(0,0,0,.18)'; g.fillRect(x+q-5,y,3,q*.75); }                                   // 瓦縫
  },256); }
const _tileMat={};
export function tileMat(base){ return _tileMat[base]||(_tileMat[base]=new THREE.MeshStandardMaterial({map:roofTileTex(base),roughness:.75,flatShading:true})); }
/* 幾何加瓦片 UV：每個三角形依朝向，u＝沿屋簷方向、v＝往上（每 0.5 單位重複一次） */
export function roofUV(geo,k=2){ geo=geo.index?geo.toNonIndexed():geo; const p=geo.attributes.position, uv=new Float32Array(p.count*2), a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3();
  for(let i=0;i<p.count;i+=3){ a.fromBufferAttribute(p,i); b.fromBufferAttribute(p,i+1); c.fromBufferAttribute(p,i+2); n.subVectors(c,b).cross(new THREE.Vector3().subVectors(a,b)).normalize();
    const hz=Math.hypot(n.x,n.z)||1, sl=Math.max(.3,hz);
    for(let j=0;j<3;j++){ const v=[a,b,c][j]; const u=Math.abs(n.z)>=Math.abs(n.x)?v.x*Math.sign(n.z||1):-v.z*Math.sign(n.x||1); uv[(i+j)*2]=u*k; uv[(i+j)*2+1]=-(v.y/sl)*k; } }
  geo.setAttribute('uv',new THREE.BufferAttribute(uv,2)); geo.computeVertexNormals(); return geo; }
export function tiledHip(w,d,h,c,x,y,z,parent){ const m=add(new THREE.Mesh(roofUV(hipGeom(w,d,h)),tileMat(c)),parent); m.position.set(x,y,z); return m; }
export function tiledGable(w,d,h,c,x,y,z,parent){ return prism(w,d,h,c,x,y,z,'z',parent); }
export function tiledCone(r,h,seg,c,x,y,z,parent){ const g=roofUV(new THREE.ConeGeometry(r,h,seg).toNonIndexed(),2); const m=add(new THREE.Mesh(g,tileMat(c)),parent); m.position.set(x,y,z); return m; }
/* 愛奧尼克式羅馬柱（跟銀行同一種）：方形柱礎＋兩圈圓環＋16 條凹槽柱身＋柱頭渦卷＋頂板。高度 h 從 y 算起 */
export function ionicCol(x,y,z,h,r=.08,parent,{c1='#fbf5e8',c2='#efe5cf',c3='#dccfb2'}={}){ const g=new THREE.Group(); g.position.set(x,y,z); (parent||ROOT).add(g);
  const k=Math.min(1,r/.1), b0=.06*k, t1y=.09*k, t2y=.15*k, s0=.17*k, sh=Math.max(.1,h-s0-.16*k);
  rbox(r*2.8,b0,r*2.8,c2,0,0,0,.008,g);
  const T1=add(new THREE.Mesh(new THREE.TorusGeometry(r*1.15,r*.22,8,20),mat(c1)),g); T1.rotation.x=Math.PI/2; T1.position.y=t1y;
  const T2=add(new THREE.Mesh(new THREE.TorusGeometry(r*1.05,r*.16,8,20),mat(c1)),g); T2.rotation.x=Math.PI/2; T2.position.y=t2y;
  cyl(r*.92,r,sh,c1,0,s0,0,20,g);
  const fm=mat(c3); for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, f=add(new THREE.Mesh(new THREE.BoxGeometry(r*.1,sh*.94,r*.12),fm),g); f.position.set(Math.cos(a)*r*.93,s0+sh/2,Math.sin(a)*r*.93); f.rotation.y=-a; }
  const ec=add(new THREE.Mesh(new THREE.TorusGeometry(r*.95,r*.18,8,20),mat(c1)),g); ec.rotation.x=Math.PI/2; ec.position.y=s0+sh+.02*k;
  rbox(r*2.3,.07*k,r*1.4,c1,0,s0+sh+.03*k,0,.006,g);
  for(const s of [-1,1]) for(const zz of [-1,1]){ const v=add(new THREE.Mesh(new THREE.TorusGeometry(r*.32,r*.12,8,14),mat(c2)),g); v.position.set(s*r*1.05,s0+sh+.02*k,zz*r*.62); }
  rbox(r*2.7,.06*k,r*2.7,c2,0,s0+sh+.1*k,0,.006,g); return g; }
/* 牆面紋路（家長 11-18 23:28：牆面盡量要有紋路）：用牆的顏色做「二丁掛」小磁磚（台灣常見），磚縫淡淡的、磚面深淺略不同 */
const _wallTex={};
export function wallTileTex(base){ if(_wallTex[base]) return _wallTex[base]; const c=new THREE.Color(base);
  const sh=k=>{ const t=c.clone(); t.offsetHSL(0,0,k); return '#'+t.getHexString(); };
  return _wallTex[base]=canvasTex((g,s)=>{ g.fillStyle=sh(-.06); g.fillRect(0,0,s,s); const rows=8, bh=s/rows, bw=s/4;
    for(let j=0;j<rows;j++) for(let i=-1;i<=4;i++){ const x=i*bw+(j%2?bw/2:0); g.fillStyle=sh([0,.015,-.015,.025,-.01][(i*3+j*7+20)%5]); g.fillRect(x+1.5,j*bh+1.5,bw-3,bh-3); } },256); }
const _wallMat={};
export function wallMat(base,w,h){ const k=base+'|'+Math.round(w*2)+'x'+Math.round(h*2); if(_wallMat[k]) return _wallMat[k];
  const t=wallTileTex(base).clone(); t.needsUpdate=true; t.repeat.set(Math.max(1,Math.round(w*1.5)),Math.max(1,Math.round(h*1.5))); return _wallMat[k]=new THREE.MeshStandardMaterial({map:t,roughness:.85}); }
