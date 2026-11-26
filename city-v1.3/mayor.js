/* Winston City 市長的家 M1–M5：西西里島海岸別墅（配色 B：粉橘牆、赤陶瓦，門窗和屋頂同色系）。
   拱形門窗、鑄鐵陽台、黃色彩磚、九重葛、檸檬樹；門口有一層的噴水池，越升越華麗。座標：大門朝 +z。 */
import * as THREE from 'three';
import { blockers, ROOT, setRoot, add, rbox, cyl, sphere, mat, hip, archWin, archDoor, GOLDM, column, palm, stoneTex, texMat, anims, tiledHip, tiledCone, ionicCol } from './lib.js';

let LOW=null, HONEY='#e8be72', PLINTH='#d3ab6a', TRIM='#fbf1d9', TERRA='#cf6a3e', TERRA2='#bd5a33', BLUE='#2d6cb5', YEL='#f5c93a';
export const PALETTES={
  A:{name:'奶油白牆＋青綠門＋赤陶瓦',wall:'#f3e6c8',plinth:'#d9c8a0',trim:'#ffffff',roof:'#d4733f',roof2:'#bd5a33',door:'#2a9d8f',tile:'#f4b942'},
  B:{name:'粉橘牆＋同色系門窗＋赤陶瓦（淺色版）',wall:'#f7d5b8',plinth:'#e6c3a2',trim:'#fffaf0',roof:'#d9765a',roof2:'#c45f43',door:'#c45f43',tile:'#f9de8c'},
  C:{name:'白牆＋藍屋頂＋藍門（地中海白藍）',wall:'#fbf8f0',plinth:'#dcd6c8',trim:'#ffffff',roof:'#3f78c4',roof2:'#2f5f9f',door:'#2f78c4',tile:'#f5c93a'},
  E:{name:'蜜桃牆＋黑色火山石一樓＋木門窗＋赤陶瓦',wall:'#f0b88a',low:'#6f6a72',plinth:'#55515a',trim:'#fff4e0',roof:'#c4633a',roof2:'#a9502d',door:'#6b4a33',tile:'#e9a23b'},
  F:{name:'陽光黃牆＋綠色百葉窗＋紅瓦（波西塔諾）',wall:'#f4cf63',plinth:'#d9ae55',trim:'#ffffff',roof:'#d0553a',roof2:'#b24229',door:'#4f8a5b',tile:'#e8603a'},
  D:{name:'淡黃牆＋橄欖綠門窗＋深棕瓦',wall:'#f1dc9a',plinth:'#cfb36f',trim:'#fffaf0',roof:'#9a5a3a',roof2:'#7f4529',door:'#5d8a4a',tile:'#e8803a'},
};
export function setPalette(k){ const p=PALETTES[k]; if(!p) return; LOW=p.low||null; HONEY=p.wall; PLINTH=p.plinth; TRIM=p.trim; TERRA=p.roof; TERRA2=p.roof2; BLUE=p.roof2; YEL=p.tile; }
const IRON='#38384a', BOUG='#d93a93', BOUG2='#f06bb4', LEMON='#ffd93a', LEAF='#5fae4e', STONE='#eadbb8', WHITE='#f7f3ea';
const hMat=(w,h,c)=>texMat('honey'+(c||HONEY),stoneTex(c||HONEY,c?'rgba(20,20,30,.45)':'rgba(110,80,40,.28)'),Math.max(1,Math.round(w*2)),Math.max(1,Math.round(h*2)));
const waterMat=()=>mat('#7fd0ea',{roughness:.1,metalness:.1,emissive:0x2a8fb0,emissiveIntensity:.25});

/* 牆：底座＋蜂蜜黃石牆身＋白色飾帶，回傳牆頂高度 */
let WALLN=0;
function wall(cx,cz,w,d,h,y0=0){ const e=(WALLN++%4)*.006;   // 每面牆的牆腳、飾帶高度錯開一點點，疊在一起的地方才不會閃（家長 11-18 23:45）
  rbox(w+.14+e,.16+e,d+.14+e,PLINTH,cx,y0,cz,.04);
  rbox(w,h,d,hMat(w,h,LOW),cx,y0+.16,cz,.04);
  rbox(w+.14+e,.1+e,d+.14+e,TRIM,cx,y0+.16+h-e/2,cz,.03);
  return y0+.26+h;
}
const roof=(cx,cz,w,d,y,h=.55)=>tiledHip(w+.3,d+.3,h,TERRA,cx,y,cz);   // 有瓦片質地的屋頂（家長 11-18 23:28）
/* 有百葉窗的拱形窗（百葉窗和門同色） */
function sWin(x,y,z,rot=0,h=.46){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rot; ROOT.add(g);
  archWin(.26,h,g,0,0,0,0,TRIM);
  rbox(.09,h+.14,.03,BLUE,-.24,-.04,.02,.01,g); rbox(.09,h+.14,.03,BLUE,.24,-.04,.02,.01,g);
}
/* 彩磚飾帶 */
function tileBand(cx,y,z,w,skip=0){
  const n=Math.floor(w/.14);
  for(let i=0;i<n;i++){ const x=cx-w/2+(i+.5)*w/n; if(Math.abs(x-cx)<skip) continue; rbox(.115,.115,.025,i%2?YEL:BLUE,x,y,z,.01); }
}
/* 彩磚花盆＋檸檬小樹 */
function potLemon(x,z,s=1){
  cyl(.11*s,.08*s,.2*s,'#d98a4a',x,0,z,12); cyl(.115*s,.115*s,.04*s,BLUE,x,.12*s,z,12); cyl(.113*s,.113*s,.025*s,YEL,x,.17*s,z,12);
  const c=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.17*s,1),mat(LEAF,{flatShading:true,roughness:.9}))); c.position.set(x,.38*s,z);
  for(const [dx,dy,dz] of [[.1,.4,.08],[-.09,.33,.1],[.02,.5,-.05]]) sphere(.035*s,LEMON,x+dx*s,dy*s,z+dz*s);
}
function lemonTree(x,z,s=1){
  cyl(.06*s,.09*s,.5*s,'#a8744f',x,0,z,10);
  const f=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.45*s,1),mat(LEAF,{flatShading:true,roughness:.9}))); f.position.set(x,.88*s,z);
  const f2=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.3*s,1),mat('#6fbd5a',{flatShading:true,roughness:.9}))); f2.position.set(x+.12*s,1.2*s,z+.05*s);
  for(const [dx,dy,dz] of [[.3,.85,.2],[-.28,.95,.15],[.05,.75,.42],[-.1,1.15,-.3],[.28,1.1,-.15],[-.3,.7,-.12],[.15,1.28,.1]]) sphere(.06*s,LEMON,x+dx*s,dy*s,z+dz*s);
}
/* 九重葛：貼在牆上的一團團桃紅花 */
function bloom(r,c,x,y,z,up=false){
 const g=new THREE.Group();g.position.set(x,y,z);if(up)g.rotation.x=-Math.PI/2;ROOT.add(g);
 const geo=new THREE.SphereGeometry(1,7,5), pm=mat(c);
 for(let j=0;j<5;j++){const a=j*Math.PI*2/5;const p=new THREE.Mesh(geo,pm);p.position.set(Math.cos(a)*r*.57,Math.sin(a)*r*.57,0);p.scale.set(r*.68,r*.40,r*.24);p.rotation.z=a;g.add(p);}
 const core=new THREE.Mesh(geo,mat('#ffe5a0'));core.scale.set(r*.28,r*.28,r*.24);core.position.z=r*.17;g.add(core);
}
function boug(x,y,z,n,sx,sy){
  for(let i=0;i<n;i++){ const a=(i*2.399)%1, b=(i*1.618)%1;
    bloom(.065,i%3?BOUG:BOUG2,x+(a-.5)*sx,y+b*sy,z+((i*0.37)%1)*.05); if(i%2) sphere(.06,LEAF,x+(b-.5)*sx,y+a*sy,z-.01,{flatShading:true}); }
}
/* 鑄鐵欄杆：沿 x 或 z 方向 */
function rail(x0,z0,len,alongX,y=0,hh=.3){
  const n=Math.max(2,Math.round(len/.12));
  for(let i=0;i<=n;i++){ const t=i/n*len, px=alongX?x0+t:x0, pz=alongX?z0:z0+t; cyl(.012,.012,hh,IRON,px,y,pz,6); }
  if(alongX){ rbox(len+.03,.025,.03,IRON,x0+len/2,y+hh,z0,.01); rbox(len,.02,.02,IRON,x0+len/2,y+.02,z0,.005); }
  else { rbox(.03,.025,len+.03,IRON,x0,y+hh,z0+len/2,.01); rbox(.02,.02,len,IRON,x0,y+.02,z0+len/2,.005); }
}
function railRect(cx,cz,w,d,y,hh=.3){ rail(cx-w/2,cz-d/2,w,true,y,hh); rail(cx-w/2,cz+d/2,w,true,y,hh); rail(cx-w/2,cz-d/2,d,false,y,hh); rail(cx+w/2,cz-d/2,d,false,y,hh); }
function lantern(x,y,z){ rbox(.03,.03,.12,IRON,x,y+.1,z-.05,.01); sphere(.06,'#fff3c4',x,y+.05,z+.02,{emissive:0xffcf5a,emissiveIntensity:.5}); }
function lampPost(x,z){ cyl(.03,.04,.9,IRON,x,0,z,10); sphere(.075,'#fff3c4',x,.98,z,{emissive:0xffcf5a,emissiveIntensity:.45}); const c=add(new THREE.Mesh(new THREE.ConeGeometry(.09,.09,10),mat(IRON))); c.position.set(x,1.1,z); }
function archTop(x,y,z,r,c=TRIM,rot=0){ const m=add(new THREE.Mesh(new THREE.TorusGeometry(r,.05,8,18,Math.PI),mat(c))); m.position.set(x,y,z); m.rotation.y=rot; return m; }

/* 門口噴水池（只有一層）：Lv2 小石盆 → Lv3 加大、鑲彩磚 → Lv4 中央水盤和噴水 → Lv5 鍍金寶珠、一圈噴水、花圃 */
function fountain(lv,x,z){
  const r0=[0,0,.5,.62,.7,.8][lv];
  cyl(r0,r0+.04,.24,texMat('fstone',stoneTex(STONE,'rgba(120,90,50,.4)'),Math.round(r0*14),1),x,0,z,36);   // 池牆有石塊紋（家長 23:38）
  const wt=add(new THREE.Mesh(new THREE.CylinderGeometry(r0-.06,r0-.06,.012,36),waterMat())); wt.position.set(x,.245,z); wt.receiveShadow=false;   // 水面在盆口（原本在實心石盆裡看不到）
  { const rim=add(new THREE.Mesh(new THREE.TorusGeometry(r0-.03,.035,8,40),mat(STONE))); rim.rotation.x=Math.PI/2; rim.position.set(x,.25,z); }
  const jetMat=new THREE.MeshStandardMaterial({color:'#bfeefa',transparent:true,opacity:.75,roughness:.1,emissive:0x5bbfe0,emissiveIntensity:.3});
  const jets=(n,rA,yA,rB,yB,tube=.011)=>{ for(let k=0;k<n;k++){ const a=k/n*Math.PI*2+.3, c=Math.cos(a), s=Math.sin(a);
    const cv=new THREE.QuadraticBezierCurve3(new THREE.Vector3(x+c*rA,yA,z+s*rA),new THREE.Vector3(x+c*(rA+rB)/2,yA+.12,z+s*(rA+rB)/2),new THREE.Vector3(x+c*rB,yB,z+s*rB));
    ROOT.add(new THREE.Mesh(new THREE.TubeGeometry(cv,12,tube,6),jetMat)); } };
  if(lv>=3){ const n=lv>=5?18:14; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; rbox(.12,.05,.09,i%2?YEL:BLUE,x+Math.cos(a)*(r0+.01),.24,z+Math.sin(a)*(r0+.01),.012).rotation.y=-a; } }
  if(lv===2){ cyl(.07,.09,.3,STONE,x,.2,z,14); cyl(.17,.08,.07,STONE,x,.5,z,20); sphere(.04,'#bfeefa',x,.62,z,{emissive:0x5bbfe0,emissiveIntensity:.4}); jets(5,.1,.58,r0-.12,.22); return; }
  cyl(.08,.11,.42,STONE,x,.2,z,16);
  const rb=r0*.38; cyl(rb,.1,.09,STONE,x,.58,z,24);
  const wl=add(new THREE.Mesh(new THREE.CylinderGeometry(rb-.03,rb-.03,.01,24),waterMat())); wl.position.set(x,.675,z); wl.receiveShadow=false;
  if(lv===3){ sphere(.05,GOLDM(),x,.78,z); jets(7,rb*.5,.7,r0-.1,.22); }
  if(lv===4){ cyl(.03,.05,.28,STONE,x,.66,z,10); sphere(.055,'#bfeefa',x,.98,z,{emissive:0x5bbfe0,emissiveIntensity:.4}); jets(8,.07,.9,r0-.1,.22); jets(8,rb,.64,r0-.08,.22); }
  if(lv>=5){ cyl(.03,.05,.34,STONE,x,.66,z,10); sphere(.09,GOLDM(),x,1.06,z); jets(10,.08,1.0,r0-.1,.22); jets(12,rb,.64,r0-.06,.22); }
}
function path(z0,z1,w=.7){ rbox(w,.04,z1-z0,'#efe0bd',0,0,(z0+z1)/2,.015); for(let z=z0+.15;z<z1-.1;z+=.3) rbox(w-.08,.045,.02,'#e2cf9f',0,0,z,.005); }

/* 望遠鏡：白色鏡筒、深色鏡頭和遮光罩、黑色目鏡、旁邊的小尋星鏡，三腳架 */
function telescope(x,y,z){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=-.5; ROOT.add(g);
  const dark=mat('#3a3d4a',{roughness:.6}), white=mat('#f4f4f2',{roughness:.35}), lens=mat('#243a5e',{roughness:.1,metalness:.3});
  const part=(geo,m,px,py,pz,parent)=>{ const o=new THREE.Mesh(geo,m); o.position.set(px,py,pz); o.castShadow=true; o.receiveShadow=true; (parent||g).add(o); return o; };
  for(let k=0;k<3;k++){ const a=k/3*Math.PI*2+.4; const leg=part(new THREE.CylinderGeometry(.014,.018,.5,6),dark,Math.cos(a)*.1,.22,Math.sin(a)*.1); leg.rotation.z=Math.cos(a)*.38; leg.rotation.x=-Math.sin(a)*.38; }
  part(new THREE.CylinderGeometry(.04,.05,.07,10),dark,0,.46,0);
  part(new THREE.BoxGeometry(.12,.05,.06),dark,0,.51,0);
  const t=new THREE.Group(); t.position.set(0,.56,0); t.rotation.z=.95; g.add(t);
  part(new THREE.CylinderGeometry(.055,.055,.62,18),white,0,.22,0,t);        // 鏡筒
  part(new THREE.CylinderGeometry(.075,.075,.14,18),white,0,.58,0,t);        // 遮光罩
  part(new THREE.CylinderGeometry(.06,.06,.02,18),lens,0,.65,0,t);            // 鏡頭
  part(new THREE.CylinderGeometry(.03,.03,.14,10),dark,0,-.18,0,t);          // 目鏡
  part(new THREE.CylinderGeometry(.045,.045,.03,10),dark,0,-.26,0,t);
  const f=part(new THREE.CylinderGeometry(.018,.018,.24,8),dark,.085,.3,0,t); // 尋星鏡
}
/* ---------- 一個函式畫出 Lv1–5（每一級都是上一級加東西） ---------- */
function villa(lv){
  const W=lv>=5?2.8:2.4, D=1.7, cz=-.9, front=cz+D/2;
  path(front-.02,2.7);
  cat(.3,front+.5,.35); walkDog(0,2.0,lv>=5?1.0:lv>=2?[0,0,.5,.62,.7,.8][lv]+.32:.85);   /* 移交 11-26：Lv5 狗的圈子往內收到 1.0，讓出 1.2 的步道給市長和 Avery 繞水池 */   // 門口的貓；狗繞著噴水池（Lv1 繞著前院）慢慢走（家長 23:45）
  // 主樓
  const top1=wall(0,cz,W,D,1.0);
  let topM=top1;
  if(lv>=3){ // 二樓
    const w2=W-.3, d2=1.5; rbox(w2,.8,d2,hMat(w2,.8),0,top1,cz,.04); rbox(w2+.14,.1,d2+.14,TRIM,0,top1+.8,cz,.03); topM=top1+.9;
    sWin(-.62,top1+.28,cz+d2/2+.005,0,.4); sWin(.62,top1+.28,cz+d2/2+.005,0,.4);
    sWin(-w2/2-.005,top1+.28,cz,-Math.PI/2,.4); sWin(w2/2+.005,top1+.28,cz,Math.PI/2,.4);
    // 鑄鐵陽台＋拱形落地門
    rbox(1.2,.07,.42,TRIM,0,top1,front+.12,.02); rail(-.58,front+.31,1.16,true,top1+.07,.3); rail(-.58,front-.08,.39,false,top1+.07,.3); rail(.58,front-.08,.39,false,top1+.07,.3);
    archDoor(.34,.6,BLUE,null,0,top1+.07,cz+d2/2+.01);
    boug(-1.0,.3,front+.07,34,.75,1.1); boug(-.45,top1+.08,front+.31,7,.8,.1);
  }
  roof(0,cz,lv>=3?W-.3:W,lv>=3?1.5:D,topM,.55);
  rbox(.2,.5,.2,PLINTH,W/2-.5,topM+.12,cz-.2,.02); rbox(.26,.06,.26,TRIM,W/2-.5,topM+.62,cz-.2,.02);
  // 大門＋窗＋彩磚
  archDoor(.46,.78,BLUE,null,0,.16,front+.005);
  for(const sx of [-1,1]) { sWin(sx*.78,.4,front+.005,0); if(lv>=5) sWin(sx*1.12,.4,front+.005,0); }
  tileBand(0,.23,front+.015,W-.1,.34);
  sWin(-W/2-.005,.4,cz,-Math.PI/2); sWin(W/2+.005,.4,cz,Math.PI/2);
  rbox(.9,.06,.4,TRIM,0,0,front+.2,.02); rbox(.7,.06,.3,'#f2e6c6',0,.06,front+.17,.02);
  if(lv>=3){ lantern(-.45,.62,front+.01); lantern(.45,.62,front+.01); }
  potLemon(-.62,front+.3,1); potLemon(.62,front+.3,1);
  if(lv<2) lemonTree(2.0,front+.9,1.05);
  if(lv>=4){ for(const sx of [-1,1]) ionicCol(sx*.55,0,front+.4,.95,.06); /* 羅馬柱（家長 23:38） */ rbox(1.4,.1,.5,TRIM,0,.95,front+.2,.03); rbox(1.5,.05,.6,TERRA2,0,1.05,front+.2,.02); }

  // 左翼＋拱廊（Lv2 起）；Lv4 屋頂變露台
  if(lv>=2){
    const wx=-(W/2+.55), wz=-.75, topW=wall(wx,wz,1.3,1.3,.8);
    if(lv>=4){ rbox(1.5,.1,1.5,TERRA2,wx,topW,wz,.03); railRect(wx,wz,1.45,1.45,topW+.1,.3); cyl(.03,.03,.7,IRON,wx-.2,topW+.1,wz,8);
      const um=add(new THREE.Mesh(new THREE.ConeGeometry(.42,.22,12),mat(BLUE))); um.position.set(wx-.2,topW+.92,wz); cyl(.12,.12,.03,TRIM,wx+.25,topW+.1,wz+.2,10); }
    else roof(wx,wz,1.3,1.3,topW,.45);
    sWin(wx,.3,wz+.655,0);
    sWin(wx-.655,.3,wz,-Math.PI/2);
    // 拱廊：四根柱、三個拱、彩磚地
    const ax0=wx-.65, ax1=wx+.65, ap=4;
    rbox(1.4,.04,.75,'#efe0bd',wx,0,.3,.01);
    for(let i=0;i<5;i++) for(let j=0;j<3;j++) rbox(.12,.012,.12,(i+j)%2?YEL:BLUE,wx-.54+i*.27,.04,.1+j*.2,.004);
    for(let i=0;i<ap;i++) ionicCol(ax0+.1+i*(ax1-ax0-.2)/(ap-1),0,.62,.78,.05);
    for(let i=0;i<ap-1;i++){ const xa=ax0+.1+(i+.5)*(ax1-ax0-.2)/(ap-1); archTop(xa,.78,.62,.17); }
    rbox(1.4,.12,.2,TRIM,wx,.95,.62,.03);
    const lr=rbox(1.5,.07,.85,TERRA,wx,1.03,.3,.02); lr.rotation.x=-.12;
    potLemon(wx-.45,.98,.9); potLemon(wx+.45,.98,.9);
    fountain(lv,0,2.0);   // 水池往外移，離房子遠一點（家長 11-19 00:20）
  }
  // 右翼（Lv5）
  if(lv>=5){
    const wx=W/2+.55, wz=-.75, topW=wall(wx,wz,1.3,1.3,.8); roof(wx,wz,1.3,1.3,topW,.45);
    sWin(wx,.3,wz+.655,0); sWin(wx+.655,.3,wz,Math.PI/2);
    boug(wx,.3,wz+.67,12,1.0,.6);
  }
  // 塔樓（Lv4 起，後方右側）
  if(lv>=4){
    const tx=W/2-.1, tz=-1.95, th=lv>=5?2.75:2.45, ts=.85;
    rbox(ts+.17,.175,ts+.17,PLINTH,tx,0,tz,.04); rbox(ts,th,ts,hMat(ts,th),tx,.16,tz,.04); rbox(ts+.14,.1,ts+.14,TRIM,tx,.16+th,tz,.03);
    for(const k of [.65,1.35,2.0]) { if(k<th-.2){ sWin(tx,k,tz+ts/2+.005,0,.34); sWin(tx+ts/2+.005,k,tz,Math.PI/2,.34); sWin(tx-ts/2-.005,k,tz,-Math.PI/2,.34); } }
    // 遮陽棚（藍白條紋）
    for(let i=0;i<5;i++){ const s=rbox(.14,.04,.4,i%2?'#ffffff':BLUE,tx-.28+i*.14,1.55,tz+ts/2+.2,.01); s.rotation.x=.35; }
    if(lv>=5){ railRect(tx,tz,ts+.1,ts+.1,.26+th,.28); const topY=.26+th;
      telescope(tx,topY+.05,tz);
    } else { tiledHip(ts+.3,ts+.3,.75,TERRA,tx,.26+th,tz); sphere(.06,GOLDM(),tx,.26+th+.78,tz); }
  }
  // 檸檬園（Lv4 起）、其他樹
  if(lv>=4){ lemonTree(W/2+.8,front+.7,1); lemonTree(W/2+1.15,front+1.45,.85); if(lv>=5) lemonTree(W/2+.45,front+1.95,.9); }
  if(lv>=5){ palm(W/2+.3,-1.6,.85); palm(-W/2-.85,-1.7,.95); palm(W/2+1.15,-.2,.95);
    // 涼亭
    const gx=-2.1, gz2=1.6; cyl(.58,.6,.07,'#efe0bd',gx,0,gz2,16);   /* 涼亭往內收，不超出六角格（家長 11-13）；之前註解吃掉了涼亭地板，補回 */
    for(const [dx,dz] of [[-.38,-.38],[.38,-.38],[-.38,.38],[.38,.38]]) ionicCol(gx+dx,.07,gz2+dz,1.0,.05);
    cyl(.62,.62,.08,TRIM,gx,1.07,gz2,8);                                         // 柱頂一圈橫樑
    tiledCone(.72,.45,8,TERRA,gx,1.15+.225,gz2); sphere(.06,GOLDM(),gx,1.62,gz2);   // 涼亭屋頂貼在柱子上（原本飄在上面）
    /* 涼亭裡的白色羅馬風雙人石椅（移交 11-26，取自戶外互動 V2）：座面、椅背、兩側渦卷扶手。市長和 Avery 會一起坐這裡（座位 x±.17，見 life.js COURT） */
    { const bx=gx, bz=1.48, SC='#f5f0e4'; rbox(.78,.055,.24,SC,bx,.2,bz,.025); rbox(.78,.19,.045,SC,bx,.255,bz-.105,.018);   // 在 onGround(+.06) 裡：座面頂 = .315（和 V2 相同）
      for(const d of [-.29,.29]){ cyl(.055,.075,.18,SC,bx+d,.07,bz,12); rbox(.15,.035,.24,SC,bx+d,.035,bz,.012); rbox(.15,.035,.24,SC,bx+d,.165,bz,.012); } }
    // 噴水旁的花圃
    for(const s of [-1,1]){ rbox(.5,.1,.5,STONE,s*1.55,0,1.9,.03); rbox(.42,.06,.42,'#7a5a3a',s*1.55,.1,1.9,.02);
      const cols=[BOUG,YEL,BOUG2,'#ff8f5a']; for(let i=0;i<4;i++) for(let j=0;j<4;j++) bloom(.043,cols[(i+j)%4],s*1.55-.15+i*.1,.2,1.9-.15+j*.1,true); }
  }
  if(lv===2||lv===3){ lemonTree(W/2+.9,front+.9,1.05); }
}

/* ---- 家長 11-13：市長家門口的貓和狗。身體不動（不會在地上滑），只有尾巴會擺 ---- */
function cat(x,z,rot=0){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; ROOT.add(g);
  const O='#e89a52', W='#fbf3e6', D='#c97a36';
  const b=sphere(.1,O,0,.1,-.01,{},g); b.scale.set(.85,1.05,1.05);                       // 坐著的身體
  const ch=sphere(.065,W,0,.11,.06,{},g); ch.scale.set(.9,1.2,.7);                        // 白胸口
  for(const sx of [-1,1]){ const p=sphere(.035,W,sx*.045,.025,.08,{},g); p.scale.set(.9,.7,1.3); const h=sphere(.045,O,sx*.06,.05,-.03,{},g); h.scale.set(.8,.9,1.3); }   // 前腳、後腿
  const hd=new THREE.Group(); hd.position.set(0,.235,.02); g.add(hd);
  const hs=sphere(.075,O,0,0,0,{},hd); hs.scale.set(1.1,.95,.95); const mz=sphere(.035,W,0,-.025,.06,{},hd); mz.scale.set(1.2,.8,.7);
  sphere(.01,'#e58b9a',0,-.01,.088,{},hd);
  for(const sx of [-1,1]){ const e=add(new THREE.Mesh(new THREE.ConeGeometry(.03,.065,4),mat(O,{flatShading:true})),hd); e.position.set(sx*.045,.07,-.005); e.rotation.z=-sx*.25;
    const ei=add(new THREE.Mesh(new THREE.ConeGeometry(.017,.04,4),mat('#f2b9b0')),hd); ei.position.set(sx*.045,.065,.008); ei.rotation.z=-sx*.25;
    sphere(.013,'#3b3550',sx*.03,.012,.066,{},hd); }
  const tl=new THREE.Group(); tl.position.set(0,.04,-.1); g.add(tl);                       // 尾巴：從屁股往後、往上翹，左右擺
  let prev=tl; for(let i=0;i<4;i++){ const sg=new THREE.Group(); sg.position.set(0,i?.05:0,i?0:0); prev.add(sg); const c=cyl(.016-i*.002,.018-i*.002,.055,i===3?D:O,0,0,0,8,sg); sg.rotation.x=i?.4:-1.25; prev=sg; }
  anims.push(t=>{ tl.rotation.y=Math.sin(t*1.6)*.6; hd.rotation.y=Math.sin(t*.4)*.25; });
}
/* 會走路的狗（家長 11-18 23:45：原本趴著的狗看起來卡住）：繞一圈慢慢走，四條腿前後擺、尾巴搖、頭上下點 */
function walkDog(cx,cz,R){ const C='#d99a5b', W='#fbf3e6', N='#3b3550';
  const g=new THREE.Group(); ROOT.add(g); const body=new THREE.Group(); g.add(body);
  const b=rbox(.13,.12,.3,C,0,.13,0,.05,body); rbox(.09,.04,.2,W,0,.12,.02,.02,body);
  const legs=[]; for(const [sx,sz] of [[-1,1],[1,1],[-1,-1],[1,-1]]){ const pv=new THREE.Group(); pv.position.set(sx*.045,.16,sz*.1); body.add(pv);
    cyl(.022,.02,.14,C,0,-.15,0,8,pv); sphere(.026,W,0,-.15,.01,{},pv); legs.push([pv,sx*sz]); }
  const hd=new THREE.Group(); hd.position.set(0,.29,.17); body.add(hd);
  const hs=sphere(.07,C,0,0,0,{},hd); hs.scale.set(1.05,.95,1); rbox(.07,.05,.08,W,0,-.04,.05,.022,hd); sphere(.015,N,0,-.01,.095,{},hd);
  for(const sx of [-1,1]){ sphere(.011,N,sx*.033,.022,.062,{},hd); const e=add(new THREE.Mesh(new THREE.ConeGeometry(.03,.07,4),mat(C,{flatShading:true})),hd); e.position.set(sx*.045,.07,-.01); e.rotation.z=-sx*.25; }
  { const n=new THREE.Mesh(new THREE.TorusGeometry(.05,.012,6,14),mat('#e5484d')); n.rotation.x=Math.PI/2-.3; n.position.set(0,.235,.13); body.add(n); }   // 紅色項圈
  const tl=new THREE.Group(); tl.position.set(0,.22,-.15); body.add(tl); const tc=cyl(.016,.022,.1,C,0,0,0,8,tl); tc.rotation.x=-.7; sphere(.02,W,0,.075,-.06,{},tl);
  const sp=.18/R;   // 每秒走 0.18
  const place=t=>{ const a=t*sp; g.position.set(cx+Math.cos(a)*R,0,cz+Math.sin(a)*R); g.rotation.y=-a; };   // 逆時針走，頭朝前進方向
  place(1.2);
  let tt=1.2; const wp=new THREE.Vector3();
  anims.push((t,dt)=>{ g.getWorldPosition(wp); const hold=blockers.some(b=>Math.hypot(b.x-wp.x,b.z-wp.z)<.42);   /* 有人在旁邊：停下來讓路（尾巴照搖） */
    if(!hold) tt+=Math.min(dt||0,.1); place(tt); const w=hold?0:Math.sin(tt*7); for(const [pv,k] of legs) pv.rotation.x=w*.5*k; body.position.y=hold?0:Math.abs(Math.cos(tt*7))*.012; tl.rotation.y=Math.sin(t*10)*.6; hd.rotation.x=hold?0:Math.sin(tt*7)*.05; });
}
function dog(x,z,rot=0){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; ROOT.add(g);
  const C='#d99a5b', W='#fbf3e6', N='#3b3550';
  const b=rbox(.17,.11,.34,C,0,0,-.02,.05,g);                                               // 趴著的身體
  rbox(.1,.05,.18,W,0,0,.02,.02,g);
  for(const sx of [-1,1]){ rbox(.045,.04,.15,C,sx*.05,0,.2,.018,g); rbox(.05,.035,.05,W,sx*.05,0,.27,.015,g);   // 往前伸的前腳＋白腳掌
    const h=sphere(.06,C,sx*.07,.05,-.12,{},g); h.scale.set(.7,.8,1.2); }                   // 後腿
  const hd=new THREE.Group(); hd.position.set(0,.15,.17); g.add(hd);
  const hs=sphere(.075,C,0,0,0,{},hd); hs.scale.set(1.05,.95,1);
  rbox(.075,.055,.08,W,0,-.045,.05,.025,hd); sphere(.016,N,0,-.005,.095,{},hd);           // 白嘴巴、黑鼻子
  for(const sx of [-1,1]){ sphere(.012,N,sx*.035,.025,.065,{},hd); const e=add(new THREE.Mesh(new THREE.ConeGeometry(.032,.06,4),mat(C,{flatShading:true})),hd); e.position.set(sx*.05,.08,-.01); e.rotation.z=-sx*.2; }
  const tl=new THREE.Group(); tl.position.set(0,.09,-.19); g.add(tl); const tc=cyl(.018,.026,.1,C,0,0,0,8,tl); tc.rotation.x=-.8; sphere(.022,W,0,.075,-.06,{},tl);
  anims.push(t=>{ tl.rotation.y=Math.sin(t*9)*.55; hd.rotation.y=Math.sin(t*.35)*.3; hd.rotation.z=Math.sin(t*.5)*.08; });   // 尾巴快速搖、頭偶爾轉
}
function onGround(fn){ const prev=ROOT, g=new THREE.Group(); g.position.y=.06; prev.add(g); setRoot(g); WALLN=0; fn(); setRoot(prev); }   // 抬到各區地面上（原本陷進地面，家長 23:45）
const M1=()=>onGround(()=>villa(1)), M2=()=>onGround(()=>villa(2)), M3=()=>onGround(()=>villa(3)), M4=()=>onGround(()=>villa(4)), M5=()=>onGround(()=>villa(5));

export const MAYOR={name:'市長的家', theme:'西西里海岸別墅：粉橘牆、赤陶瓦屋頂和同色系門窗、拱形窗、鑄鐵陽台、黃色彩磚', levels:[
  {lv:1, stage:'第 1 級', desc:'粉橘色牆的一層樓小別墅，赤陶色的大門和百葉窗，門前一棵檸檬樹', fn:M1, cam:[1.3,1]},
  {lv:2, stage:'第 2 級', desc:'加蓋側翼和拱廊中庭，彩磚花盆，門口出現一座小石頭水池', fn:M2, cam:[1.3,1]},
  {lv:3, stage:'第 3 級', desc:'加蓋二樓和鑄鐵陽台，牆上開滿九重葛，門口燈籠，水池加大、邊緣鑲黃藍彩磚', fn:M3, cam:[1.5,1.05]},
  {lv:4, stage:'第 4 級', desc:'屋頂露台和遮陽傘、帶遮陽棚的小塔樓，門口有柱子門廊，檸檬園，水池中央多了水盤和高高的噴水', fn:M4, cam:[1.8,1.14]},
  {lv:5, stage:'第 5 級', desc:'整座莊園：兩側翼樓、棕櫚花園、涼亭，塔樓頂有木星望遠鏡，水池頂上是一顆金色寶珠，噴出一圈水柱，旁邊有花圃', fn:M5, cam:[2.1,1.4], ground:5.4},
]};

setPalette('B');
