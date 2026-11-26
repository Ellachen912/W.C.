/* Winston City 建築模型：市政廳 H1–H5、學校 S1–S3。每棟建築一組自己的零件，升級重複使用。 */
import * as THREE from 'three';
import { tiledHip, tiledGable, ionicCol } from './lib.js';
import { CREAM, DOOR, GOLDM, ROOF, ROOF2, ROOT, setRoot, add, archDoor, archWin, bell, bench, brickTex, bunting, bush, clock, column, creamStone, cyl, drops, flag, glassMat, grassTex, hip, jupiterTex, lamp, mat, plaza, prism, rbox, shade, sphere, spinners, texMat, textPlate, tree } from './lib.js';

/* ---------- 學校共用零件：紅磚牆＋米白飾帶＋藍色四坡屋頂（學校主題色），每一級都看得出是同一棟長大 ---------- */
export function brickHall(cx,cz,w,d,h,{floors=1,roofH=.7,over=.3,skip=0,sideWins=true}={}){
  const brick=texMat('brick',brickTex,Math.max(1,Math.round(w*2)),Math.max(1,Math.round(h*2)));
  rbox(w+.2,.18,d+.2,'#d8cfbf',cx,0,cz,.04);
  rbox(w,h,d,brick,cx,.18,cz,.04);
  rbox(w+.12,.12,d+.12,CREAM,cx,.18+h,cz,.04);
  tiledHip(w+over,d+over,roofH,ROOF,cx,.3+h,cz);
  const fh=h/floors;
  for(let f=0;f<floors;f++){
    const y=.18+f*fh, wh=Math.min(.48,fh*.42), wy=y+fh*.3;
    if(f>0) rbox(w+.06,.06,d+.06,CREAM,cx,y-.03,cz,.02);
    const n=Math.max(1,Math.round(w/.42));
    for(let i=0;i<n;i++){ const x=cx-w/2+(i+.5)*w/n; if(Math.abs(x)<skip) continue; archWin(.24,wh,null,x,wy,cz+d/2+.005); }
    if(sideWins){ const m=Math.max(1,Math.round(d/.6));
      for(let j=0;j<m;j++){ const z=cz-d/2+(j+.5)*d/m; archWin(.24,wh,null,cx+w/2+.005,wy,z,Math.PI/2); archWin(.24,wh,null,cx-w/2-.005,wy,z,-Math.PI/2); } }
  }
}
/* 學校鐘樓：紅磚塔身、兩面金框時鐘、藍色尖頂 */
export function clockTower(x,z,s,h,clockR=.3){
  const brick=texMat('brick',brickTex,2,Math.round(h*2));
  rbox(s+.12,.2,s+.12,'#d8cfbf',x,0,z,.04);
  rbox(s,h,s,brick,x,.2,z,.04);
  const ch=.2+h-clockR-.32;
  rbox(s+.12,.1,s+.12,CREAM,x,ch-clockR-.22,z,.03);
  rbox(s+.16,.14,s+.16,CREAM,x,.2+h-.02,z,.03);
  clock(clockR,null,x,ch,z+s/2+.01); clock(clockR,null,x+s/2+.01,ch,z,Math.PI/2);
  archDoor(.46,.76,DOOR,null,x,.2,z+s/2+.01);
  for(let wy=1.2; wy<ch-clockR-.75; wy+=.75) archWin(.26,.34,null,x,wy,z+s/2+.01);
  rbox(.86,.08,.3,'#ebe5d8',x,0,z+s/2+.2,.02); rbox(.7,.08,.18,'#f2ede2',x,.08,z+s/2+.12,.02);
  const ty=.2+h+.12;
  tiledHip(s+.3,s+.3,1.0,ROOF2,x,ty,z); sphere(.08,GOLDM(),x,ty+1.05,z); return ty+1.1;
}
export function flowerBed(x,z,w,d){ rbox(w,.12,d,'#d8cfbf',x,0,z,.03); rbox(w-.08,.06,d-.08,'#7a5a3a',x,.12,z,.02);
  const cols=['#ff8fa3','#ffd166','#c77dff','#ff6b6b'];
  for(let i=0;i<Math.round(w/.14);i++) for(let j=0;j<Math.round(d/.14);j++) sphere(.045,cols[(i+j)%4],x-w/2+.1+i*.14,.21,z-d/2+.1+j*.14); }
export function smallFountain(x,z,r=.42){
  cyl(r,r+.02,.2,'#f1ede4',x,0,z,40);
  const water=add(new THREE.Mesh(new THREE.CylinderGeometry(r-.06,r-.06,.02,40),mat('#7fd0ea',{roughness:.1,metalness:.1,emissive:0x2a8fb0,emissiveIntensity:.25}))); water.position.set(x,.205,z); water.receiveShadow=false;   /* 水面放到盆口（原本在實心石盆裡看不到，家長 11-18 23:45） */
  cyl(.06,.08,.4,'#f8f5ee',x,.18,z,16); cyl(.18,.08,.08,'#f1ede4',x,.58,z,24); sphere(.045,GOLDM(),x,.7,z);
  const jetMat=new THREE.MeshStandardMaterial({color:'#bfeefa',transparent:true,opacity:.75,roughness:.1,emissive:0x5bbfe0,emissiveIntensity:.3});
  for(let k=0;k<6;k++){ const a=k/6*Math.PI*2, c=Math.cos(a), sn=Math.sin(a);
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(x+c*.16,.65,z+sn*.16),new THREE.Vector3(x+c*.3,.68,z+sn*.3),new THREE.Vector3(x+c*(r-.08),.2,z+sn*(r-.08)));
    ROOT.add(new THREE.Mesh(new THREE.TubeGeometry(curve,14,.011,6),jetMat));
    const dd=new THREE.Mesh(new THREE.SphereGeometry(.02,8,6),jetMat); ROOT.add(dd); drops.push({d:dd,curve,o:k*.17%1}); }
}

/* ===== 市政廳：米白石牆＋青綠圓頂和山牆＋白柱門廊（高等級加金邊）；升級＝柱子變多、圓頂變大、加翼樓和樓層 ===== */
export const STONE_TRIM='#fff6e6', TEAL='#3fb0a3';
export function stoneHall(cx,cz,w,d,h,{floors=1,skip=0,sideWins=true,gold=false}={}){
  const stone=texMat('cream',creamStone,Math.max(1,Math.round(w*1.4)),Math.max(1,Math.round(h*1.4)));
  rbox(w+.2,.2,d+.2,'#d9d0bf',cx,0,cz,.04);
  rbox(w,h,d,stone,cx,.2,cz,.04);
  rbox(w+.16,.14,d+.16,STONE_TRIM,cx,.2+h,cz,.04);
  let top=.34+h;
  if(gold) rbox(w+.05,.07,d+.05,GOLDM(),cx,.2+h-.08,cz,.02);   // 金邊藏在屋簷下方，屋頂不會變金色
  const fh=h/floors;
  for(let f=0;f<floors;f++){
    const y=.2+f*fh, wh=Math.min(.55,fh*.45), wy=y+fh*.28;
    if(f>0) rbox(w+.06,.06,d+.06,STONE_TRIM,cx,y-.03,cz,.02);
    const n=Math.max(1,Math.round(w/.4));
    for(let i=0;i<n;i++){ const x=cx-w/2+(i+.5)*w/n; if(Math.abs(x)<skip) continue; archWin(.22,wh,null,x,wy,cz+d/2+.005,0,STONE_TRIM); }
    if(sideWins){ const m=Math.max(1,Math.round(d/.55));
      for(let j=0;j<m;j++){ const z=cz-d/2+(j+.5)*d/m; archWin(.22,wh,null,cx+w/2+.005,wy,z,Math.PI/2,STONE_TRIM); archWin(.22,wh,null,cx-w/2-.005,wy,z,-Math.PI/2,STONE_TRIM); } }
  }
  return top;
}
// 正面柱廊：台階、n 根白柱、橫樑、青綠三角山牆＋金色徽章
export function portico(w,zWall,n,colH,{depth=.6,gold=false}={}){
  rbox(w+.3,.08,depth+.35,'#ebe5d8',0,0,zWall+(depth+.35)/2,.02);
  rbox(w+.2,.08,depth+.25,'#f2ede2',0,.08,zWall+(depth+.25)/2,.02);
  rbox(w+.1,.06,depth+.15,'#f7f3ea',0,.16,zWall+(depth+.15)/2,.02);
  const zc=zWall+depth-.12;
  for(let i=0;i<n;i++) ionicCol(-w/2+.12+i*(w-.24)/(n-1),.22,zc,colH,.085);   // 羅馬柱（家長 11-18 23:38：市政廳柱子要像銀行）
  const ey=.22+colH;
  rbox(w+.06,.16,depth+.06,STONE_TRIM,0,ey,zWall+depth/2,.03);
  let py=ey+.16;
  if(gold){ rbox(w+.08,.04,depth+.08,GOLDM(),0,py,zWall+depth/2,.02); py+=.04; }
  const ph=.18+w*.12;
  tiledGable(w+.16,depth+.04,ph,TEAL,0,py,zWall+depth/2);   // 門廊屋頂斜面也有瓦片（家長 23:28）
  prism(w-.04,depth+.08,ph*.8,mat(STONE_TRIM,{flatShading:true}),0,py+.01,zWall+depth/2+.01);
  const em=add(new THREE.Mesh(new THREE.CylinderGeometry(.06+w*.025,.06+w*.025,.03,24),GOLDM())); em.rotation.x=Math.PI/2; em.position.set(0,py+ph*.33,zWall+depth+.07);
}
// 屋頂圓頂：鼓座＋青綠圓頂；top='finial' 金球、'flag' 頂上小亭加市旗、'jupiter' 頂上小亭加自轉木星
export function civicDome(x,z,y,r,{drumH=.4,ribs=0,colRing=false,top='flag',goldRibs=false}={}){
  cyl(r+.05,r+.07,.1,STONE_TRIM,x,y,z,40);
  const dy=y+.1;
  cyl(r,r,drumH,'#f6ead2',x,dy,z,40);
  if(colRing){ for(let k=0;k<16;k++){ const a=k/16*Math.PI*2; cyl(.03,.03,drumH,STONE_TRIM,x+Math.sin(a)*(r+.04),dy,z+Math.cos(a)*(r+.04),8); } }
  else { const nw=Math.max(6,Math.round(r*12)); for(let k=0;k<nw;k++){ const a=k/nw*Math.PI*2; const w=add(new THREE.Mesh(new THREE.CircleGeometry(Math.min(.07,drumH*.25),16),glassMat)); w.position.set(x+Math.sin(a)*(r+.005),dy+drumH/2,z+Math.cos(a)*(r+.005)); w.rotation.y=a; } }
  const ring=add(new THREE.Mesh(new THREE.TorusGeometry(r+.02,.035,8,48),GOLDM())); ring.rotation.x=Math.PI/2; ring.position.set(x,dy+drumH,z);
  const dome=add(new THREE.Mesh(new THREE.SphereGeometry(r-.02,40,20,0,Math.PI*2,0,Math.PI/2),mat(TEAL,{roughness:.55}))); dome.position.set(x,dy+drumH,z); dome.scale.y=1.05;
  for(let k=0;k<ribs;k++){ const rib=add(new THREE.Mesh(new THREE.TorusGeometry(r-.01,goldRibs?.015:.012,6,24,Math.PI/2),goldRibs?GOLDM():mat(shade(TEAL,-.08)))); rib.position.set(x,dy+drumH,z); rib.rotation.y=k/ribs*Math.PI*2; rib.scale.y=1.05; }
  let t=dy+drumH+(r-.02)*1.05;
  if(top==='finial'){ cyl(.03,.05,.12,GOLDM(),x,t-.02,z,10); sphere(.07,GOLDM(),x,t+.15,z); return t+.22; }
  cyl(.12+r*.04,.12+r*.04,.26,STONE_TRIM,x,t-.04,z,16);
  const sd=add(new THREE.Mesh(new THREE.SphereGeometry(.15+r*.04,20,10,0,Math.PI*2,0,Math.PI/2),GOLDM())); sd.position.set(x,t+.22,z);
  t+=.22+.15+r*.04;
  if(top==='flag'){ flag(x,z,.7,'city',t-.02); return t+.7; }
  cyl(.05,.09,.36,GOLDM(),x,t-.04,z,16);
  const jy=t+.32+.36;
  const J=add(new THREE.Mesh(new THREE.SphereGeometry(.36,48,32),new THREE.MeshStandardMaterial({map:jupiterTex,roughness:.7}))); J.position.set(x,jy,z); spinners.push(J);
  const orbit=add(new THREE.Mesh(new THREE.TorusGeometry(.54,.018,8,64),GOLDM())); orbit.position.set(x,jy,z); orbit.rotation.x=Math.PI/2-.35;
  for(const a of [0,2.1,4.2]) sphere(.04,'#fff3c4',x+Math.cos(a)*.54,jy+Math.sin(a)*.54*Math.sin(.35),z+Math.sin(a)*.54*Math.cos(.35),{emissive:0xffe08a,emissiveIntensity:.4});
  return jy+.4;
}

export function H1(){
  for(let i=0;i<4;i++) for(const s of [-1,1]) rbox(.36,.05,.32,(i+(s>0?1:0))%2?'#f0eadc':'#e4dccc',s*.19,0,1.0+i*.34,.03);
  const top=stoneHall(0,-.45,2.2,1.4,1.15,{skip:.55});
  portico(1.2,.25,4,.95,{depth:.5});
  archDoor(.4,.72,'#3f8f86',null,0,.2,.255,0,STONE_TRIM);
  civicDome(0,-.45,top,.42,{drumH:.25,top:'finial'});
  flag(-1.35,1.25,2.0,'city');
  lamp(.75,1.35);
  tree(-1.8,-1.7,.85); tree(1.8,-1.75,.85,'#6fc463'); tree(1.75,.55,.7,'#5aaf50');
  bush(-1.6,.45,.8); bush(1.2,1.6,.8,'#ffd166'); bush(-.9,1.75,.75);
}
export function H2(){
  plaza('#f3ede1','#e8dfcf',10,3,-1.7,1.15);
  const top=stoneHall(0,-.5,2.7,1.5,1.35,{skip:.75});
  portico(1.7,.25,4,1.12,{depth:.58});
  archDoor(.44,.8,'#3f8f86',null,0,.2,.255,0,STONE_TRIM);
  civicDome(0,-.5,top,.6,{drumH:.35,top:'flag'});
  lamp(-1.1,1.3); lamp(1.1,1.3);
  bench(-1.2,1.95); bench(1.2,1.95);
  flag(-1.95,1.3,1.9,'city');
  bush(1.85,1.3,.8);
  tree(-1.9,-1.8,.85); tree(1.9,-1.8,.85,'#6fc463'); tree(1.95,.3,.7,'#5aaf50');
}
export function H3(){
  plaza('#f3ede1','#e8dfcf',10,3,-1.7,1.15);
  const top=stoneHall(0,-.55,3.0,1.6,1.4,{skip:1.0});
  for(const s of [-1,1]){ stoneHall(s*1.8,-.45,.7,1.3,1.05,{sideWins:false,skip:9}); archWin(.22,.42,null,s*1.8,.5,.205,0,STONE_TRIM); }
  portico(2.1,.25,5,1.2,{depth:.62});
  archDoor(.48,.85,'#3f8f86',null,0,.2,.255,0,STONE_TRIM);
  civicDome(0,-.6,top,.75,{drumH:.45,ribs:8,top:'flag'});
  const P=[[-1.95,1.25],[-1.95,2.05],[1.95,1.25],[1.95,2.05]];
  P.forEach(([x,z],i)=>i%2?cyl(.025,.03,1.75,'#8c8aa0',x,0,z,10):flag(x,z,1.75,'city'));
  const H=1.7;
  bunting([-1.95,H,1.25],[-1.95,H,2.05],5,.2); bunting([1.95,H,1.25],[1.95,H,2.05],5,.2);
  bunting([-1.95,H,2.05],[1.95,H,2.05],14,.45); bunting([-1.95,H,1.25],[1.95,H,1.25],14,.5);
  bench(-1.1,1.75); bench(1.1,1.75);
  bush(-.5,1.95,.75,'#ffd166'); bush(.5,1.95,.75);
  tree(-1.9,-1.85,.8); tree(1.9,-1.85,.8,'#6fc463');
}
/* 草叢圍牆（市政廳 Lv4 起）：圓角綠色樹籬＋一顆顆葉團＋小花；只做橫向或縱向的直線 */
export function hedge(x1,z1,x2,z2,{h=.34,t=.28,flower='#ffd166'}={}){
  const cx=(x1+x2)/2, cz=(z1+z2)/2, w=Math.abs(x2-x1)+t, d=Math.abs(z2-z1)+t;
  rbox(w,h,d,'#4f9f55',cx,0,cz,.1);
  const alongX=Math.abs(x2-x1)>=Math.abs(z2-z1), len=alongX?w:d, n=Math.max(2,Math.round(len/.2));
  for(let i=0;i<n;i++){ const u=-len/2+(i+.5)*len/n, px=alongX?cx+u:cx, pz=alongX?cz:cz+u;
    const b=add(new THREE.Mesh(new THREE.IcosahedronGeometry(t*.62,1),mat(i%2?'#5fb35a':'#6cc064',{flatShading:true,roughness:.9}))); b.position.set(px,h-.02,pz); b.scale.set(1,.7,1);
    if(flower&&i%3===1) sphere(.032,flower,px+(alongX?0:t*.5),h+.06,pz+(alongX?t*.5:0)); }
}
/* 六角形樹籬：沿著六角格內縮的邊排，前面（+z）中間留大門（家長 11-13：底盤要貼合六角格） */
function hexHedge(Rh,gate,o={}){ const h=o.h||.34, t=o.t||.28;
  for(let i=0;i<6;i++){ const a1=i*Math.PI/3, a2=(i+1)*Math.PI/3, p1=[Rh*Math.cos(a1),Rh*Math.sin(a1)], p2=[Rh*Math.cos(a2),Rh*Math.sin(a2)];
    const segs=(i===1)?[[p1,[gate,p1[1]]],[[-gate,p1[1]],p2]]:[[p1,p2]];                // i=1 是前面那條邊（60°～120°）
    for(const [A,B] of segs){ const cx=(A[0]+B[0])/2, cz=(A[1]+B[1])/2, len=Math.hypot(B[0]-A[0],B[1]-A[1])+t*.6; const m=rbox(len,h,t,'#4f9f55',cx,0,cz,.1); m.rotation.y=-Math.atan2(B[1]-A[1],B[0]-A[0]); } } }
function gatePost(x,z,tall=.55,gold=false){ rbox(.22,tall,.22,STONE_TRIM,x,0,z,.04); rbox(.28,.06,.28,'#ebe5d8',x,tall,z,.02); sphere(.07,gold?GOLDM():'#fff3c4',x,tall+.12,z,gold?{}:{emissive:0xffe08a,emissiveIntensity:.35}); }
export function H4(){
  plaza('#f5f0e6','#e9e1d2',12,3,-2.04,1.15);
  const top=stoneHall(0,-.6,3.0,1.6,2.0,{floors:2,skip:1.05,gold:true});
  for(const s of [-1,1]){ stoneHall(s*1.8,-.5,.7,1.4,1.6,{floors:2,sideWins:false,skip:9,gold:true}); for(const wy of [.45,1.25]) archWin(.22,.36,null,s*1.8,wy,.205,0,STONE_TRIM); }
  portico(2.2,.2,6,1.75,{depth:.64,gold:true});
  archDoor(.5,.95,'#3f8f86',null,0,.2,.205,0,STONE_TRIM);
  civicDome(0,-.65,top,.78,{drumH:.5,ribs:12,colRing:true,goldRibs:true,top:'flag'});
  smallFountain(0,1.8,.42);
  lamp(-1.0,1.35); lamp(1.0,1.35);
  flowerBed(-1.55,1.85,.6,.4); flowerBed(1.55,1.85,.6,.4);
  flag(-1.95,1.25,1.9,'city'); flag(1.95,1.25,1.9,'city');
  tree(-1.95,-1.9,.75); tree(1.95,-1.9,.75,'#6fc463');
  hexHedge(3.45,.95); const gz=3.45*Math.sin(Math.PI/3); gatePost(-.85,gz); gatePost(.85,gz);
}
// 雙層噴水池：大水池＋中層水盤＋頂層小水盤，水從上往下一層一層流
export function grandFountain(x,z,r=.68){
  cyl(r,r+.03,.26,'#f3efe6',x,0,z,48);
  const rim=add(new THREE.Mesh(new THREE.TorusGeometry(r,.035,8,48),GOLDM())); rim.rotation.x=Math.PI/2; rim.position.set(x,.26,z);
  const wm=mat('#7fd0ea',{roughness:.08,metalness:.1,emissive:0x2a8fb0,emissiveIntensity:.28});
  const w1=add(new THREE.Mesh(new THREE.CylinderGeometry(r-.04,r-.04,.01,48),wm)); w1.position.set(x,.262,z); w1.receiveShadow=false;
  cyl(.1,.14,.5,'#f8f5ee',x,.24,z,20);
  cyl(.42,.16,.14,'#f3efe6',x,.74,z,32);
  const rim2=add(new THREE.Mesh(new THREE.TorusGeometry(.42,.025,8,40),GOLDM())); rim2.rotation.x=Math.PI/2; rim2.position.set(x,.88,z);
  const w2=add(new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.01,32),wm)); w2.position.set(x,.882,z); w2.receiveShadow=false;
  cyl(.06,.09,.32,'#f8f5ee',x,.87,z,16);
  cyl(.2,.08,.08,'#f3efe6',x,1.19,z,24);
  const w3=add(new THREE.Mesh(new THREE.CylinderGeometry(.185,.185,.01,24),wm)); w3.position.set(x,1.272,z); w3.receiveShadow=false;
  sphere(.06,GOLDM(),x,1.33,z);
  const jetMat=new THREE.MeshStandardMaterial({color:'#bfeefa',transparent:true,opacity:.75,roughness:.1,emissive:0x5bbfe0,emissiveIntensity:.3});
  const jets=(n,r0,y0,rm,ym,r1,y1,off)=>{ for(let k=0;k<n;k++){ const a=k/n*Math.PI*2+off, c=Math.cos(a), sn=Math.sin(a);
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(x+c*r0,y0,z+sn*r0),new THREE.Vector3(x+c*rm,ym,z+sn*rm),new THREE.Vector3(x+c*r1,y1,z+sn*r1));
    ROOT.add(new THREE.Mesh(new THREE.TubeGeometry(curve,14,.011,6),jetMat));
    for(let j=0;j<2;j++){ const dd=new THREE.Mesh(new THREE.SphereGeometry(.02,8,6),jetMat); ROOT.add(dd); drops.push({d:dd,curve,o:(k*.13+j*.5)%1}); } } };
  jets(6,.04,1.38,.2,1.52,.3,.88,0);          // 頂層往中層噴
  jets(10,.42,.88,.52,.86,.58,.25,.3);        // 中層邊緣流到大水池
}
export function lawn(x,z,w,d){                         // 市政廳前面的小草皮：石邊框＋草地＋矮樹籬
  rbox(w,.08,d,'#e5e0d6',x,0,z,.03);
  rbox(w-.1,.1,d-.1,new THREE.MeshStandardMaterial({map:grassTex,roughness:.95}),x,.02,z,.03);
  for(const [dx,dz] of [[-w/2+.2,-d/2+.18],[w/2-.2,-d/2+.18]]) bush(x+dx,z+dz,.6,'#ffd166');
  for(let i=0;i<Math.round(w/.18);i++) sphere(.035,['#ff8fa3','#c77dff','#ffffff'][i%3],x-w/2+.14+i*.18,.15,z+d/2-.12);
}
export function H5(){
  // 地基加大到 5.2（其他等級 4.4），前面放得下雙層噴水池和草皮
  plaza('#f7f3ea','#ebe4d6',14,4,-2.38,1.0);
  const top=stoneHall(0,-.9,3.1,1.7,2.2,{floors:2,skip:1.1,gold:true});
  for(const s of [-1,1]){ const wt=stoneHall(s*1.8,-.8,.72,1.45,1.8,{floors:2,sideWins:false,skip:9,gold:true}); for(const wy of [.5,1.4]) archWin(.22,.4,null,s*1.8,wy,-.07,0,STONE_TRIM); flag(s*1.8,-.8,.9,'city',wt); }
  portico(2.3,-.05,6,1.95,{depth:.66,gold:true});
  archDoor(.56,1.05,'#c99a3a',null,0,.2,-.045,0,STONE_TRIM);
  civicDome(0,-.95,top,.8,{drumH:.55,ribs:12,colRing:true,goldRibs:true,top:'jupiter'});
  lawn(-1.75,.48,1.0,.72); lawn(1.75,.48,1.0,.72);
  grandFountain(0,1.72,.68);
  lamp(-1.25,1.2); lamp(1.25,1.2);
  bench(-1.55,2.2,.35); bench(1.55,2.2,-.35);
  flag(-2.35,1.2,2.0,'city'); flag(2.35,1.2,2.0,'city');
  tree(-2.2,-2.0,.8); tree(2.2,-2.0,.8,'#6fc463');
  const o={h:.42,t:.26,flower:'#ff8fa3'};
  hexHedge(3.45,1.95,o); { const gz=3.45*Math.sin(Math.PI/3); gatePost(-1.85,gz,.7,true); gatePost(1.85,gz,.7,true); }
}

/* ===== 學校：紅磚牆＋藍色四坡屋頂＋米白飾帶，屋頂上課鐘；Lv2 加操場（跑道＋籃球場），Lv3 加鐘樓、翼樓和看台 ===== */
export function bellCupola(x,y,z){
  rbox(.8,.1,.8,CREAM,x,y,z,.03);
  for(const [dx,dz] of [[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]]) rbox(.11,.6,.11,CREAM,x+dx,y+.1,z+dz,.03);
  rbox(.86,.1,.86,CREAM,x,y+.7,z,.03);
  bell(x,y+.28,z); cyl(.012,.012,.14,'#6d6a7d',x,y+.56,z,6);
  tiledHip(.95,.95,.5,ROOF2,x,y+.8,z); sphere(.07,GOLDM(),x,y+1.36,z);
}
export function hoop(x,z,face){      // 籃球架：灰色立柱、白色籃板、橘色籃框、白色球網
  cyl(.03,.03,1.0,'#6d6a7d',x,0,z,8);
  const g=new THREE.Group(); g.position.set(x+face*.06,.95,z); g.rotation.y=face*Math.PI/2; ROOT.add(g);
  rbox(.4,.28,.03,'#ffffff',0,0,0,.01,g);
  rbox(.16,.11,.032,'#e9825a',0,-.02,0,.005,g);
  const r=add(new THREE.Mesh(new THREE.TorusGeometry(.09,.012,6,20),mat('#ff7a3d')),g); r.rotation.x=Math.PI/2; r.position.set(0,.02,.1);
  const net=add(new THREE.Mesh(new THREE.CylinderGeometry(.088,.05,.12,10,1,true),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true})),g); net.position.set(0,-.04,.1);
}
export function stadiumShape(L,R){ const s=new THREE.Shape(); s.moveTo(-L,-R); s.lineTo(L,-R); s.absarc(L,0,R,-Math.PI/2,Math.PI/2,false); s.lineTo(-L,R); s.absarc(-L,0,R,Math.PI/2,Math.PI*1.5,false); return s; }
export function ringFlat(L,R1,R2,c,x,z,y=0,h=.03){
  const sh=stadiumShape(L,R2); if(R1>0) sh.holes.push(stadiumShape(L,R1));
  const g=new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false,curveSegments:24}); g.rotateX(-Math.PI/2);
  const m=add(new THREE.Mesh(g,mat(c))); m.position.set(x,y,z); return m;
}
// 平貼地面的圓弧線（角度 0 = +x 方向）
function arcLine(x,z,r1,r2,start,len,c,y){
  const m=add(new THREE.Mesh(new THREE.RingGeometry(r1,r2,40,1,start,len),new THREE.MeshStandardMaterial({color:c,roughness:.8,side:THREE.DoubleSide})));
  m.rotation.x=-Math.PI/2; m.position.set(x,y,z); m.castShadow=false; return m;
}
/* 籃球場：淺灰外框、藍色場地、白線、中圈、兩邊橘色禁區＋罰球圈＋三分線、兩個籃球架（長邊沿 x） */
export function court(cx,cz,L=2.4,W=1.2){
  rbox(L+.34,.03,W+.34,'#cfd8e3',cx,.0,cz,.02);
  rbox(L,.04,W,'#5f9fd6',cx,.03,cz,.01);
  const y=.072, ln=(w,d,x,z)=>rbox(w,.008,d,'#ffffff',cx+x,y,cz+z,.003);
  ln(L,.025,0,-W/2+.012); ln(L,.025,0,W/2-.012); ln(.025,W,-L/2+.012,0); ln(.025,W,L/2-.012,0); ln(.025,W,0,0);
  arcLine(cx,cz,.2,.225,0,Math.PI*2,'#ffffff',y);
  for(const s of [-1,1]){
    const kx=s*(L/2-.31);
    rbox(.6,.006,.5,'#e9825a',cx+kx,y-.002,cz,.002);
    ln(.6,.02,kx*1+0,-.25); ln(.6,.02,kx,.25); ln(.02,.5,s*(L/2-.61),0);
    arcLine(cx+s*(L/2-.61),cz,.16,.18,0,Math.PI*2,'#ffffff',y);
    const hx=s*(L/2-.1), a=.95;
    arcLine(cx+hx,cz,.6,.62,s>0?Math.PI-a:-a,2*a,'#ffffff',y);
    const zz=.6*Math.sin(a), xx=hx-s*.6*Math.cos(a), len=Math.abs(L/2-Math.abs(xx));
    for(const t of [-1,1]) ln(len,.02,s*(L/2-len/2),t*zz);
    hoop(cx+s*(L/2+.1),cz,-s);
  }
}
// 跑道：紅色三條跑道、白色分道線、中間綠草地（外圈是半圓頭的長圓形）
export function track(cx,cz,L=1.1,R1=.85,R2=1.1){      // 地面板的頂面約在 y=.06，所以跑道要疊得比它高
  ringFlat(L,0,R1,'#7cc35e',cx,cz,0,.08);
  ringFlat(L,R1,R2,'#d9785e',cx,cz,0,.09);
  const w=(R2-R1)/3;
  ringFlat(L,R1+w-.008,R1+w+.008,'#ffffff',cx,cz,0,.096);
  ringFlat(L,R1+2*w-.008,R1+2*w+.008,'#ffffff',cx,cz,0,.096);
  ringFlat(L,R2-.012,R2,'#ffffff',cx,cz,0,.096);
  rbox(.04,.008,R2-R1,'#ffffff',cx+L*.6,.092,cz+(R1+R2)/2,.003);       // 起跑線
}
function courtOnGrass(cx,cz){ const prev=ROOT, g=new THREE.Group(); g.position.y=.08; prev.add(g); setRoot(g); court(cx,cz); setRoot(prev); }
const SZ=-1.95;     // 操場（球場／跑道）中心：永遠在校舍後面
export function S1(){
  const prev=ROOT, g=new THREE.Group(); g.position.z=1.25; prev.add(g); setRoot(g);   // 校舍整體往前移，留出後面的操場空地
  const brick=(rx,ry)=>texMat('brick',brickTex,rx,ry);
  for(let i=0;i<4;i++) for(const s of [-1,1]) rbox(.36,.05,.32,(i+(s>0?1:0))%2?'#ece6da':'#e0d8c9',s*.19,0,.78+i*.36,.03);
  rbox(3.0,.18,1.8,'#d8cfbf',0,0,-.3,.04);
  rbox(2.8,1.32,1.6,brick(6,3),0,.18,-.3,.04);
  rbox(2.92,.12,1.72,CREAM,0,1.5,-.3,.04);
  tiledHip(3.15,1.95,.72,ROOF,0,1.62,-.3);
  for(const x of [-1.15,-.7,.7,1.15]) archWin(.26,.48,null,x,.55,.505);
  archDoor(.46,.78,DOOR,null,0,.18,.505);
  rbox(.8,.09,.3,'#ebe5d8',0,0,.62,.02); rbox(.64,.09,.18,'#f2ede2',0,.09,.56,.02);
  for(const z of [-.75,.1]) archWin(.26,.48,null,1.405,.55,z,Math.PI/2);
  for(const z of [-.75,.1]) archWin(.26,.48,null,-1.405,.55,z,-Math.PI/2);
  bellCupola(0,2.0,-.3);
  tree(-1.9,1.3,.85); tree(1.95,-1.5,.85,'#6fc463'); tree(-1.95,-1.5,.75,'#5aaf50');
  bush(1.85,1.2,.8); bush(-1.15,1.65,.8,'#ffd166');
  flag(-.75,1.55,2.2,'city');
  setRoot(prev);
}
export function S2(){
  brickHall(0,1.0,2.8,1.4,1.35,{skip:.3});
  archDoor(.46,.78,DOOR,null,0,.18,1.705);
  rbox(.8,.09,.3,'#ebe5d8',0,0,1.82,.02); rbox(.64,.09,.18,'#f2ede2',0,.09,1.76,.02);
  bellCupola(0,2.03,1.0);
  track(0,SZ);
  courtOnGrass(0,SZ);
  tree(-1.75,-2.75,.75); tree(1.75,-2.75,.75,'#6fc463'); tree(-2.1,2.2,.85); tree(2.1,2.2,.85,'#5aaf50');
  bush(-1.65,2.3,.8,'#ffd166');
  flag(1.65,2.3,2.0,'city');
}
export function S3(){
  brickHall(0,1.0,2.6,1.3,1.5,{skip:.5});
  for(const s of [-1,1]){ brickHall(s*1.75,1.1,.7,1.15,1.15,{roofH:.55,over:.2,sideWins:false}); archWin(.24,.42,null,s*1.75,.55,1.68); }
  clockTower(0,1.85,.9,3.0);
  track(0,SZ);
  courtOnGrass(0,SZ);
  for(let i=0;i<3;i++){ rbox(2.2,.1+i*.1,.2,'#5b8fd0',0,0,-.66+i*.2,.02); } rbox(2.3,.09,.7,'#e9e4d8',0,0,-.45,.02); for(const x of [-1.1,1.1]) rbox(.06,.4,.64,'#ffffff',x,0,-.45,.01);   // 看台
  tree(-1.75,-2.75,.7); tree(1.75,-2.75,.7,'#6fc463'); tree(-2.3,2.0,.8); tree(2.3,2.0,.8,'#5aaf50');
  flag(-1.95,2.45,2.0,'city');
}

import { MAYOR } from './mayor.js';
export const BUILDINGS={
  hall:{name:'市政廳', theme:'米白石牆、青綠圓頂和山牆、白色柱廊', levels:[
    {lv:1, stage:'啟航灣', desc:'石造小廳，四根柱子的門廊，屋頂小圓頂', fn:H1, cam:[1.3,1]},
    {lv:2, stage:'微風港', desc:'大廳變寬，圓頂變大、頂上掛市旗，前面一座廣場', fn:H2, cam:[1.3,1]},
    {lv:3, stage:'珊瑚島', desc:'兩側加蓋翼樓，五根柱子，圓頂加稜線，廣場掛滿彩旗', fn:H3, cam:[1.5,1.05]},
    {lv:4, stage:'星潮城', desc:'主樓和翼樓加到兩層、加金邊，六根高柱，圓頂一圈小柱子，廣場噴水池', fn:H4, cam:[1.8,1.14]},
    {lv:5, stage:'木星都', desc:'最高最華麗，圓頂頂上托著一顆自轉的木星；地基加大，前面有雙層噴水池和兩塊小草皮', fn:H5, cam:[2.1,1.4], ground:5.2},
  ]},
  school:{name:'學校', theme:'紅磚牆、藍色屋頂、米白飾帶、屋頂上課鐘', levels:[
    {lv:1, stage:'第 1 級', desc:'紅磚校舍，屋頂鐘亭掛著上課鐘', fn:S1, cam:[1.3,1]},
    {lv:2, stage:'第 2 級', desc:'校舍變大，後面加操場：紅色跑道、綠草地和藍色籃球場', fn:S2, cam:[1.3,1]},
    {lv:3, stage:'第 3 級', desc:'加蓋翼樓和鐘樓，操場旁邊加一排藍色看台', fn:S3, cam:[1.5,1.05]},
  ]},
};
BUILDINGS.mayor=MAYOR;
