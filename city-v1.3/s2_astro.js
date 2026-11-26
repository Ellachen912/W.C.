/* Winston City 第二階段：天文台（2 格，東北山頂；家長 2026-11-13 17:30 同意規劃）
   Lv1 小天文台：白色圓頂觀測室（開一條縫露出望遠鏡）、小木屋、步道、看星星的長椅
   Lv2 天文館：小木屋升級成高科技研究小屋、加大圓頂星象館（木星天文館）、碗形電波望遠鏡
   （家長 11-18 定案；發射台 launchPad、控制中心 control 已不用，保留程式不刪）
   Lv3 天文科學館：小屋再長高成研究塔、八大行星模型（點天文台行星就會轉）；電波望遠鏡慢慢轉、天線燈會閃
   家長 11-18：Lv1 拿掉一張長椅、小木屋做精緻（不要花）；Lv2 拿掉塔樓，改成小木屋升級成高科技研究小屋（不要露台和花）；Lv3 不要太空中心
   主題色：白色圓頂＋薰衣草紫 #8c7fd1＋一點金色星星。
   座標：兩格中間為原點，x 沿著兩格排列的方向（index.html 的 plotPos 會把群組轉過去），正門朝 +z。
   左格中心 (-4.44,0)、右格中心 (4.44,0)，中間隔一條路；兩格都是「尖頂朝前後」的六角形（頂點在 z=±4.2，左右平邊在中心 ±3.64）。 */
import * as THREE from 'three';
import { kit, IND } from './s1_kit.js';
import { ROOT, add, rbox, cyl, sphere, mat, prism, tree, bush, lamp, bench, hexPad, anims, GOLD, glassMat, jupiterTex, tiledGable, ionicCol } from './lib.js';

const WALL='#ece8f3', DOME='#efedf6', LAV='#8c7fd1', LAVD='#6f63b5', SLIT='#3b3550', STONE='#ddd7e4', CAB='#efe3cf';
const CA=-4.44, CB=4.44;   // 左、右兩格的中心 x（兩格中間隔一條 1.6 寬的路，x=-0.8～0.8）
const em=(c,i=.6)=>mat(c,{emissive:new THREE.Color(c),emissiveIntensity:i});

function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function ribbon(pts,w,c,y=0){   // 平滑彎曲的步道（同 s1_more.js）
  const cv=new THREE.CatmullRomCurve3(pts.map(([x,z])=>new THREE.Vector3(x,0,z))), P=cv.getPoints(64), pos=[], idx=[];
  P.forEach((p,i)=>{ const t=cv.getTangent(i/64), nx=-t.z, nz=t.x; pos.push(p.x+nx*w/2,y,p.z+nz*w/2, p.x-nx*w/2,y,p.z-nz*w/2); if(i) idx.push(2*i-2,2*i-1,2*i, 2*i-1,2*i+1,2*i); });
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
  const m=add(new THREE.Mesh(g,mat(c,{side:THREE.DoubleSide}))); m.castShadow=false; m.userData.noCheck=1; return m; }
function path(pts,w=.55){ ribbon(pts,w+.12,'#c9bfd4',.125); ribbon(pts,w,'#f6f1e6',.14); }   // 石地頂在 .11，步道要高過它才不會閃
function pad(cx){ const g=grp(cx,0,0,Math.PI/6), prev=ROOT; g.add(hexPad(STONE,.42,.09)); }   // 貼合六角格的淺紫灰石地（hexPad 是平頂，轉 30 度變尖頂）

/* 金色小星星（平面五角星，立著） */
function star(x,y,z,r=.16,ry=0,parent){ const s=new THREE.Shape(); for(let i=0;i<10;i++){ const a=Math.PI/2+i*Math.PI/5, rr=i%2?r*.45:r; i?s.lineTo(rr*Math.cos(a),rr*Math.sin(a)):s.moveTo(rr*Math.cos(a),rr*Math.sin(a)); } s.closePath();
  const m=add(new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.04,bevelEnabled:false}),mat(GOLD,{metalness:.5,roughness:.3})),parent); m.position.set(x,y,z); m.rotation.y=ry; return m; }

/* 嵌在牆上的招牌（底色紫、白字、金星） */
function signTex(txt){ const c=document.createElement('canvas'); c.width=512; c.height=128; const g=c.getContext('2d'); g.fillStyle=LAV; g.fillRect(0,0,512,128);
  g.fillStyle='#ffffff'; const fs=Math.min(76,Math.floor(470/txt.length)); g.font=`bold ${fs}px "PingFang TC","Noto Sans CJK TC","Noto Sans TC",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,256,68);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function wallSign(txt,w,x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g);
  rbox(w+.08,w/4+.08,.05,LAVD,0,-w/8-.04,0,.02,g); const p=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshStandardMaterial({map:signTex(txt),roughness:.8})); p.position.z=.03; g.add(p); return g; }
/* 前面的石頭立牌：矮石牆上嵌招牌 */
function monument(txt,x,z,w=1.5){ rbox(w+.3,.42,.32,'#d9d2e2',x,.09,z,.04); rbox(w+.36,.06,.38,LAVD,x,.51,z,.02); wallSign(txt,w,x,.31,z+.17); star(x+w/2+.02,.62,z+.02,.12); }

/* 觀測圓頂：圓筒牆＋半球頂，圓頂開一條縫、望遠鏡從縫裡伸出來 */
function obsDome(x,y,z,r,h,ry=0,door=true,parent){ const g=grp(x,y,z,ry,parent);
  cyl(r+.07,r+.09,.12,LAVD,0,0,0,40,g); cyl(r,r,h,WALL,0,.12,0,40,g); cyl(r+.03,r+.03,.1,LAV,0,.12+h-.12,0,40,g);
  const dg=new THREE.Group(); dg.position.y=.12+h; g.add(dg);
  const dome=add(new THREE.Mesh(new THREE.SphereGeometry(r,40,20,0,Math.PI*2,0,Math.PI/2),mat(DOME,{roughness:.45})),dg);
  const sl=add(new THREE.Mesh(new THREE.SphereGeometry(r+.012,24,16,Math.PI/2-.16,.32,.05,Math.PI/2-.05),mat(SLIT,{side:THREE.DoubleSide})),dg);   // 開縫（朝 +z）
  for(const s of [-1,1]){ const rail=add(new THREE.Mesh(new THREE.TorusGeometry(r+.02,.025,6,40,Math.PI/2),mat(LAV)),dg); rail.rotation.y=-Math.PI/2+s*.17; }   // 開縫兩邊的紫色滑軌
  const tg=new THREE.Group(); tg.position.set(0,.05,0); tg.rotation.x=.75; dg.add(tg);   // 望遠鏡（白色鏡筒、紫色環、金色鏡口）
  const tl=r*1.3; cyl(r*.15,r*.19,tl,'#fbfaf6',0,0,0,20,tg); cyl(r*.2,r*.2,.07,LAV,0,tl*.55,0,20,tg); cyl(r*.17,r*.17,.05,LAVD,0,tl,0,20,tg); cyl(r*.12,r*.12,.02,'#2b2840',0,tl+.04,0,20,tg);
  sphere(.06,GOLD,0,r+.04,0,{metalness:.5,roughness:.3},dg);
  if(door){ rbox(.42,.62,.12,LAVD,0,.12,r-.02,.03,g); rbox(.34,.54,.04,LAV,0,.14,r+.04,.02,g); sphere(.025,GOLD,.11,.42,r+.07,{},g); star(0,.86,r+.03,.1,0,g); }
  for(const a of [-.9,.9,Math.PI-.6,Math.PI+.6]){ const w=rbox(.22,.26,.05,'#a8dcf0',Math.sin(a)*(r-.01),.12+h*.42,Math.cos(a)*(r-.01),.02,g); w.material=glassMat; w.rotation.y=a; const f=rbox(.3,.05,.08,LAV,Math.sin(a)*(r+.01),.12+h*.42-.04,Math.cos(a)*(r+.01),.01,g); f.rotation.y=a; }
  return {g,dg,tg};
}
/* 小屋：Lv1 精緻小木屋（瓦片屋頂、圓窗、小門廊、百葉窗、轉角石、門燈）→ Lv2 高科技研究小屋（二樓玻璃帶、金屬板、屋頂小圓頂、碟形天線、太陽能板、紫色燈條）→ Lv3 研究塔（再加一層、大一點的圓頂、更高的天線） */
const METAL='#d6d2e2', TRIM='#f7f2e8', glow=()=>mat('#b9adff',{emissive:0x8c7fd1,emissiveIntensity:.9});
function shutters(g,x,y,z,w,h){ win(g,x,y,z,w,h); for(const s of [-1,1]){ const sh=rbox(w*.48,h,.03,LAVD,x+s*(w*.74),y,z+.01,.01,g); for(let k=1;k<4;k++) rbox(w*.4,.012,.035,LAV,x+s*(w*.74),y+k*h/4,z+.012,.003,g); } }
function win(g,x,y,z,w,h){ rbox(w+.06,h+.06,.03,TRIM,x,y-.03,z-.005,.01,g); rbox(w,h,.03,'#a8dcf0',x,y,z+.005,.01,g).material=glassMat; rbox(.018,h,.035,TRIM,x,y,z+.01,.003,g); rbox(w+.12,.04,.08,TRIM,x,y-.06,z+.03,.01,g); }
function solar(g,x,y,z,w,d,tilt=.25){ const p=new THREE.Group(); p.position.set(x,y,z); p.rotation.x=-tilt; g.add(p); rbox(w+.04,.03,d+.04,'#c8c4d4',0,0,0,.01,p); rbox(w,.02,d,'#2f4a8a',0,.03,0,.005,p).material=mat('#2f4a8a',{roughness:.3,metalness:.3});
  for(let i=1;i<4;i++) rbox(.008,.025,d,'#9fb6e8',-w/2+i*w/4,.035,0,.002,p); for(let k=1;k<3;k++) rbox(w,.025,.008,'#9fb6e8',0,.035,-d/2+k*d/3,.002,p); }
function hut(x,z,ry,lv){ const g=grp(x,0,z,ry);
  if(lv===1){
    rbox(1.3,.14,1.08,'#cfc8d8',0,.09,0,.03,g); rbox(1.14,.7,.92,CAB,0,.23,0,.04,g);                                          // 石頭台基、奶油色牆
    for(const sx of [-1,1]) for(const sz of [-1,1]) for(let k=0;k<4;k++) rbox(k%2?.1:.14,.13,k%2?.14:.1,TRIM,sx*.56,.27+k*.16,sz*.45,.01,g);   // 轉角石
    rbox(1.2,.05,.98,TRIM,0,.92,0,.01,g);                                                                                 // 屋簷下飾條
    tiledGable(1.4,1.18,.6,LAVD,0,.97,0,g);                                                                                // 有瓦片質地的屋頂（家長 11-18 23:28）
    for(const s of [-1,1]) rbox(.06,.06,1.24,LAV,s*.7,.95,0,.02,g);
    cyl(.045,.045,1.24,LAV,0,0,0,10,g).geometry.rotateX(Math.PI/2); g.children[g.children.length-1].position.set(0,1.58,0);   // 屋脊壓條
    const ow=add(new THREE.Mesh(new THREE.CircleGeometry(.12,24),glassMat),g); ow.position.set(0,1.18,.6); const of=add(new THREE.Mesh(new THREE.TorusGeometry(.13,.03,8,24),mat(LAV)),g); of.position.set(0,1.18,.6); star(0,1.13,.62,.06,0,g);   // 山牆圓窗＋金星
    rbox(.3,.5,.05,'#a8744f',-.22,.23,.47,.02,g); rbox(.36,.06,.06,TRIM,-.22,.73,.48,.01,g); sphere(.022,GOLD,-.13,.47,.51,{},g);   // 木門
    rbox(.5,.04,.3,LAVD,-.22,.86,.62,.02,g); for(const s of [-1,1]) ionicCol(-.22+s*.21,.23,.74,.63,.032,g); rbox(.46,.06,.24,'#d9d2e2',-.22,.17,.6,.02,g);   // 小門廊：平的雨棚、兩根白柱、石階
    const lt=sphere(.05,'#fff3c4',.02,.64,.52,{emissive:0xffcf5a,emissiveIntensity:.5},g); rbox(.02,.08,.04,'#4d4a63',.02,.68,.49,.005,g);   // 門燈
    shutters(g,.3,.42,.47,.22,.24);
    const side=new THREE.Group(); side.position.set(.575,0,-.1); side.rotation.y=Math.PI/2; g.add(side); shutters(side,0,.42,0,.22,.24);   // 側面窗
    cyl(.07,.07,.32,'#b5aec2',.38,1.2,-.25,10,g); cyl(.1,.1,.04,LAVD,.38,1.52,-.25,10,g);                                  // 煙囪＋帽蓋
    return g; }
  // Lv2、Lv3：高科技研究小屋／研究塔
  const W=1.5, D=1.15, F=lv>=3?3:2;
  rbox(W+.16,.14,D+.16,'#cfc8d8',0,.09,0,.03,g); rbox(W,.72,D,CAB,0,.23,0,.04,g);                                           // 一樓延續奶油色牆
  for(const sx of [-1,1]) for(const sz of [-1,1]) for(let k=0;k<4;k++) rbox(k%2?.1:.14,.13,k%2?.14:.1,TRIM,sx*W/2,.27+k*.16,sz*D/2,.01,g);
  rbox(.62,.56,.04,'#a8dcf0',-.3,.23,D/2+.01,.02,g).material=glassMat; rbox(.02,.56,.05,LAVD,-.3,.23,D/2+.02,.005,g); rbox(.7,.05,.06,LAVD,-.3,.79,D/2+.02,.01,g);   // 玻璃自動門
  rbox(.26,.18,.03,'#2b2840',.3,.5,D/2+.02,.01,g).material=mat('#5fe0ff',{emissive:0x3fb8e0,emissiveIntensity:.5}); rbox(.3,.22,.02,LAVD,.3,.48,D/2+.005,.01,g);   // 門邊小螢幕
  rbox(.26,.24,.03,'#a8dcf0',.32,.52,-D/2-.01,.01,g).material=glassMat;
  let y=.95; rbox(W+.06,.06,D+.06,LAV,0,y,0,.02,g); rbox(W+.08,.025,D+.08,'#b9adff',0,y+.06,0,.01,g).material=glow();          // 一樓頂：紫色帶＋發光燈條
  for(let f=2;f<=F;f++){ const w=f===3?W-.3:W, d=f===3?D-.2:D;
    rbox(w,.66,d,METAL,0,y+.09,0,.04,g); for(let k=1;k<5;k++) rbox(.015,.66,d+.01,'#c3bed2',-w/2+k*w/5,y+.09,0,.003,g);   // 金屬板接縫
    rbox(w+.01,.28,d+.01,'#a8dcf0',0,y+.28,0,.02,g).material=glassMat;                                                      // 一整圈玻璃帶窗
    y+=.75; rbox(w+.06,.06,d+.06,LAV,0,y,0,.02,g); rbox(w+.08,.025,d+.08,'#b9adff',0,y+.06,0,.01,g).material=glow(); }
  const top=y+.09, w=F===3?W-.3:W, d=F===3?D-.2:D;
  for(const s of [-1,1]){ rbox(w,.1,.05,METAL,0,top,s*(d/2-.02),.01,g); rbox(.05,.1,d,METAL,s*(w/2-.02),top,0,.01,g); }       // 女兒牆
  const dr=F===3?.42:.32; obsDome(-w/2+dr+.08,top-.12,-d/2+dr+.06,dr,.16,.3,false,g);                                          // 屋頂小觀測圓頂（Lv3 大一點）
  kit(IND('solar-panel-landscape'),w/2-.33,d/2-.28,{w:.5,y0:top+.02,parent:g});                                                 // 太陽能板換成跟發電廠一樣的 Kenney 模型（家長 11-18 15:27）
  const dg=new THREE.Group(); dg.position.set(w/2-.25,top,-d/2+.25); g.add(dg); cyl(.03,.04,.25,'#9d98ad',0,0,0,8,dg);
  const bw=add(new THREE.Mesh(new THREE.SphereGeometry(.2,20,8,0,Math.PI*2,Math.PI-.7,.7),mat('#f6f5fa',{side:THREE.DoubleSide})),dg); bw.position.y=.45; bw.rotation.x=.5; sphere(.025,LAV,0,.42,.08,{},dg);   // 小碟形天線
  const mh=F===3?1.5:1.0; cyl(.018,.03,mh,'#9d98ad',.0,top,-d/2+.15,8,g); for(let k=1;k<4;k++) cyl(.06-.012*k,.06-.012*k,.02,'#9d98ad',0,top+mh*k/4,-d/2+.15,8,g);
  const bl=sphere(.05,'#ff6b6b',0,top+mh+.04,-d/2+.15,{emissive:0xff3a3a,emissiveIntensity:1},g); anims.push(t=>{ bl.material.emissiveIntensity=(t*1.1%1)<.5?1.5:.1; });   // 天線頂燈會閃
  return g; }
/* 院子裡的小望遠鏡（三腳架） */
function tripodScope(x,z,ry=0){ const g=grp(x,.09,z,ry);
  for(let i=0;i<3;i++){ const a=i*Math.PI*2/3, A=new THREE.Vector3(Math.sin(a)*.2,0,Math.cos(a)*.2), B=new THREE.Vector3(0,.72,0), l=add(new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1,6),mat('#4d4a63')),g); l.position.copy(A).add(B).multiplyScalar(.5); l.scale.y=A.distanceTo(B); l.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize()); }
  const t=new THREE.Group(); t.position.y=.72; t.rotation.x=.7; g.add(t); cyl(.06,.075,.62,'#fbfaf6',0,-.2,0,14,t); cyl(.08,.08,.05,LAV,0,.32,0,14,t); cyl(.07,.07,.03,GOLD,0,.4,0,14,t); }
/* 電波望遠鏡：底座、叉架、碗形天線、中間的接收器（Lv3 會慢慢轉） */
function radioDish(x,z,r=.95,spin=false){ const g=grp(x,0,z);
  cyl(.5,.6,.2,'#d9d2e2',0,.09,0,24,g); cyl(.16,.22,1.25,WALL,0,.29,0,16,g); cyl(.24,.24,.1,LAV,0,1.5,0,16,g);
  const yaw=new THREE.Group(); yaw.position.y=1.6; g.add(yaw);
  for(const s of [-1,1]) rbox(.1,.6,.18,'#dcd8e4',s*.32,0,0,.03,yaw);
  const pit=new THREE.Group(); pit.position.y=.48; pit.rotation.x=.65; yaw.add(pit);
  const bowl=new THREE.Mesh(new THREE.SphereGeometry(r*1.6,40,12,0,Math.PI*2,Math.PI-.68,.68),mat('#f6f5fa',{side:THREE.DoubleSide,roughness:.4})); add(bowl,pit); bowl.position.y=r*1.6-.05;   // 淺碗朝上
  const rim=add(new THREE.Mesh(new THREE.TorusGeometry(r*1.6*Math.sin(.68),.035,8,48),mat(LAV)),pit); rim.rotation.x=Math.PI/2; rim.position.y=r*1.6-.05-r*1.6*Math.cos(.68);
  for(let i=0;i<3;i++){ const a=i*Math.PI*2/3, R0=r*1.6*Math.sin(.68)*.95, y0=rim.position.y; const st=add(new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,1,6),mat('#9d98ad')),pit);
    const A=new THREE.Vector3(Math.cos(a)*R0,y0,Math.sin(a)*R0), B=new THREE.Vector3(0,y0+r*.85,0); st.position.copy(A).add(B).multiplyScalar(.5); st.scale.y=A.distanceTo(B); st.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize()); }
  sphere(.09,LAV,0,rim.position.y+r*.85,0,{},pit); cyl(.05,.05,.12,GOLD,0,rim.position.y+r*.85-.16,0,10,pit);
  if(spin) anims.push(t=>{ yaw.rotation.y=Math.sin(t*.25)*1.1; pit.rotation.x=.65+Math.sin(t*.17)*.15; });
  else yaw.rotation.y=.5;
  return g; }

/* 星象館：大圓頂、矮圓牆、前面有入口大廳和招牌 */
function planetarium(x,z,r){ const g=grp(x,0,z);
  cyl(r+.12,r+.16,.14,LAVD,0,.09,0,48,g); cyl(r,r,.85,WALL,0,.23,0,48,g); cyl(r+.03,r+.03,.12,LAV,0,.96,0,48,g);
  for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.6) continue; rbox(.36,.4,.04,'#a8dcf0',Math.sin(a)*(r+.01),.45,Math.cos(a)*(r+.01),.02,g).rotation.y=a; }
  const d=add(new THREE.Mesh(new THREE.SphereGeometry(r,48,24,0,Math.PI*2,0,Math.PI/2),mat(DOME,{roughness:.4})),g); d.position.y=1.08; d.scale.y=.82;
  for(let i=0;i<8;i++){ const rib=add(new THREE.Mesh(new THREE.TorusGeometry(r+.005,.022,6,40,Math.PI/2),mat('#e2deeb')),g); rib.position.y=1.08; rib.scale.y=.82; rib.rotation.y=i*Math.PI/4; }
  sphere(.12,GOLD,0,1.08+r*.82+.06,0,{metalness:.5,roughness:.3},g); star(0,1.08+r*.82+.18,0,.16,0,g);
  // 入口大廳：玻璃門、紫色雨棚、招牌嵌在大廳牆上
  const lz=r-.15; rbox(2.1,1.15,1.0,WALL,0,.23,lz+.35,.05,g); rbox(2.2,.12,1.1,LAV,0,1.38,lz+.35,.03,g);
  rbox(1.0,.62,.04,'#a8dcf0',0,.25,lz+.86,.02,g).material=glassMat; rbox(.04,.62,.05,LAVD,0,.25,lz+.87,.01,g); rbox(1.08,.05,.06,LAVD,0,.86,lz+.87,.01,g);
  rbox(1.3,.06,.45,LAVD,0,.78,lz+1.07,.02,g); for(const s of [-1,1]) cyl(.035,.035,.55,'#d5d0de',s*.58,.23,lz+1.24,8,g);
  wallSign('木星天文館',1.3,0,1.08,lz+.86,0,g);   // 招牌嵌在雨棚上方的牆上
  for(const s of [-1,1]) star(s*.82,1.04,lz+.87,.1,0,g);
  return g; }

/* 發射台＋直立火箭＋發射塔（Lv3） */
function launchPad(x,z,ry=0){ const g=grp(x,0,z,ry);
  cyl(.95,1.05,.2,'#cfcad8',0,.09,0,32,g); cyl(.6,.6,.18,'#9d98ad',0,.29,0,24,g);
  for(let i=0;i<4;i++){ const a=i*Math.PI/2+Math.PI/4; rbox(.12,.35,.12,'#7b7590',Math.cos(a)*.42,.47,Math.sin(a)*.42,.02,g); }
  const rk=new THREE.Group(); rk.position.y=.47; g.add(rk);   // 火箭：白身、紫色腰帶、金色窗框、紅尖頂不用（主題色）→ 紫色尖頂
  cyl(.3,.3,3.0,'#fbfaf6',0,.3,0,28,rk); cyl(.31,.31,.18,LAV,0,1.1,0,28,rk); cyl(.31,.31,.18,LAV,0,2.6,0,28,rk);
  const nose=add(new THREE.Mesh(new THREE.ConeGeometry(.3,.85,28),mat(LAVD)),rk); nose.position.y=3.3+.42; sphere(.05,GOLD,0,4.18,0,{metalness:.5},rk);
  const win=add(new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.05,20),glassMat),rk); win.rotation.x=Math.PI/2; win.position.set(0,2.95,.3); const wf=add(new THREE.Mesh(new THREE.TorusGeometry(.11,.025,6,20),mat(GOLD,{metalness:.5})),rk); wf.position.set(0,2.95,.31);
  star(0,1.75,.3,.13,0,rk);
  for(let i=0;i<4;i++){ const a=i*Math.PI/2+Math.PI/4, s=new THREE.Shape(); s.moveTo(0,0); s.lineTo(.42,-.1); s.lineTo(.42,-.35); s.lineTo(0,.55); s.closePath();
    const f=add(new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.05,bevelEnabled:false}),mat(LAVD)),rk); f.position.set(Math.cos(a)*.28,.42,Math.sin(a)*.28); f.rotation.y=-a; f.translateZ(-.025); }
  for(const s of [-1,1]){ cyl(.13,.13,1.5,'#f1eff6',s*.43,.25,0,16,rk); const bn=add(new THREE.Mesh(new THREE.ConeGeometry(.13,.35,16),mat(LAV)),rk); bn.position.set(s*.43,1.92,0); cyl(.1,.14,.16,'#7b7590',s*.43,.1,0,12,rk); }
  cyl(.2,.26,.2,'#7b7590',0,.12,0,16,rk);
  // 發射塔：紫灰鐵架，伸出一支手臂靠著火箭
  const tx=1.0, tw=.5, H=4.4; for(const sx of [-1,1]) for(const sz of [-1,1]) rbox(.07,H,.07,'#8f88a8',tx+sx*tw/2,.29,sz*tw/2,.01,g);
  for(let y=.6;y<H;y+=.5){ for(const sz of [-1,1]) rbox(tw,.05,.05,'#8f88a8',tx,.29+y,sz*tw/2,.01,g); for(const sx of [-1,1]) rbox(.05,.05,tw,'#8f88a8',tx+sx*tw/2,.29+y,0,.01,g);
    const d=rbox(.04,.66,.04,'#a49dbb',tx,.29+y-.5+.05,tw/2,.01,g); d.rotation.z=.78; }
  rbox(.75,.08,.16,'#8f88a8',tx-.45,.29+3.2,0,.02,g); rbox(.75,.08,.16,'#8f88a8',tx-.45,.29+2.0,0,.02,g);
  rbox(.62,.1,.62,LAVD,tx,.29+H,0,.02,g); const bl=sphere(.09,'#ff5a5a',tx,.29+H+.18,0,{emissive:0xff2a2a,emissiveIntensity:.8},g);
  anims.push(t=>{ bl.material.emissiveIntensity=(t*1.3%1)<.5?1.4:.1; });
  return g; }

/* 控制中心：長長的一層半、玻璃帶窗、屋頂小天線（Lv3） */
function control(x,z,ry=0){ const g=grp(x,0,z,ry);
  rbox(2.2,.12,1.05,'#d9d2e2',0,.09,0,.03,g); rbox(2.0,.95,.85,WALL,0,.21,0,.05,g); rbox(2.04,.32,.04,'#a8dcf0',0,.5,.43,.02,g).material=glassMat;
  rbox(2.08,.08,.92,LAV,0,1.16,0,.03,g); rbox(.5,.55,.04,'#a8dcf0',0,.21,.44,.02,g).material=glassMat; rbox(.62,.06,.3,LAVD,0,.8,.55,.02,g);
  wallSign('木星太空中心',1.2,.0,1.05,.45,0,g);
  cyl(.03,.03,.7,'#9d98ad',.7,1.24,-.15,8,g); const bb=sphere(.06,'#ffd36a',.7,1.98,-.15,{emissive:0xffb020,emissiveIntensity:.6},g);
  const sd=add(new THREE.Mesh(new THREE.SphereGeometry(.28,20,8,0,Math.PI*2,Math.PI-.7,.7),mat('#f6f5fa',{side:THREE.DoubleSide})),g); sd.position.set(-.55,1.86,-.1); sd.rotation.x=.45; cyl(.04,.05,.36,'#9d98ad',-.55,1.24,-.1,8,g);
  anims.push(t=>{ bb.material.emissiveIntensity=.3+.6*(Math.sin(t*3)+1)/2; });
  return g; }
/* 看星星的長椅、路燈、樹 */
function lampV(x,z){ cyl(.03,.045,1.0,'#5b5577',x,.09,z,10); sphere(.09,'#fff3c4',x,1.17,z,{emissive:0xffe08a,emissiveIntensity:.4}); const c=add(new THREE.Mesh(new THREE.ConeGeometry(.12,.1,12),mat(LAVD))); c.position.set(x,1.29,z); }
function benchOn(x,z,ry){ const g=grp(x,.09,z); const prev=ROOT; g.rotation.y=ry; rbox(.6,.05,.2,'#c98d55',0,.16,0,.02,g); rbox(.6,.16,.04,'#c98d55',0,.22,-.09,.02,g); rbox(.05,.16,.16,'#6d6a7d',-.24,0,0,.01,g); rbox(.05,.16,.16,'#6d6a7d',.24,0,0,.01,g); }

/* 八大行星模型（Lv3）：中間發光的太陽，八顆行星照順序排在細軌道上；點天文台時繞著太陽轉一陣子，再慢慢停下來 */
let kickAt=-1e9; export function astroTap(){ kickAt=performance.now()/1000; }
const PLANETS=[['水星','#b5a8a0',.045],['金星','#e8c98a',.06],['地球','#4f9ad8',.065],['火星','#d9704a',.055],['木星',null,.13],['土星','#e6cf94',.105],['天王星','#9fdde6',.08],['海王星','#5a7fe0',.078]];
function orrery(x,z){ const g=grp(x,0,z);
  cyl(1.02,1.08,.16,'#d6cfc4',0,.09,0,48,g); cyl(1.0,1.0,.04,'#ece7de',0,.25,0,48,g); cyl(.16,.22,.45,WALL,0,.29,0,20,g); cyl(.24,.24,.06,LAV,0,.74,0,20,g);   // 圓台座、中柱（家長 11-18：底盤不要紫色）
  const H=.95, sun=sphere(.2,'#ffd25a',0,H,0,{emissive:0xffb020,emissiveIntensity:.9},g); cyl(.035,.035,.2,'#9d98ad',0,.8,0,8,g);
  const arms=[];
  PLANETS.forEach(([n,c,r],i)=>{ const R=.3+i*.085, hy=H-.02-i*.012;
    const ring=add(new THREE.Mesh(new THREE.TorusGeometry(R,.006,4,64),mat('#b9adff',{transparent:true,opacity:.7})),g); ring.rotation.x=Math.PI/2; ring.position.y=hy; ring.castShadow=false;
    const a=new THREE.Group(); a.position.y=hy; a.rotation.y=i*.83+.4; g.add(a);
    const rod=rbox(R,.012,.012,'#cfc8dc',R/2,-.006,0,.004,a);
    const pm=c?mat(c,{roughness:.6}):new THREE.MeshStandardMaterial({map:jupiterTex,roughness:.7}); const pl=add(new THREE.Mesh(new THREE.SphereGeometry(r,20,14),pm),a); pl.position.set(R,0,0);
    if(n==='土星'){ const rg=add(new THREE.Mesh(new THREE.RingGeometry(r*1.35,r*2.0,32),mat('#d9c08a',{side:THREE.DoubleSide})),a); rg.position.set(R,0,0); rg.rotation.x=-Math.PI/2+.4; }
    arms.push([a,1/Math.pow(R,1.5)]); });
  let ang=0; anims.push((t,dt)=>{ const now=performance.now()/1000, k=now-kickAt, sp=k<0?0:k<6?1:k<9?1-(k-6)/3:0;   // 轉 6 秒，再 3 秒慢慢停
    if(sp<=0) return; const d=(dt||.016)*sp*.9; for(const [a,w] of arms) a.rotation.y+=d*w; sun.rotation.y+=d; });
  return g; }

function astro(lv){
  // 地面：Lv1 只鋪左格，Lv2 起兩格都鋪
  pad(CA); if(lv>=2){ pad(CB); rbox(2.0,.09,4.0,STONE,0,0,0,.03); }   // Lv2 起把兩格中間那段路也鋪起來，變成同一個園區
  // ── 左格：觀測圓頂＋小屋（小屋跟著升級） ──
  obsDome(CA+.35,.09,-.55,1.0,1.05);
  hut(CA-1.75,.55,.35,lv);
  path([[CA+.35,3.5],[CA+.25,2.4],[CA+.4,1.4],[CA+.35,.62]]);
  path([[CA+.25,1.95],[CA-.5,1.6],[CA-1.4,1.35]],.4);
  benchOn(CA+1.45,1.55,-.5); tripodScope(CA+1.95,.95,-.6);
  lampV(CA-.25,2.8); lampV(CA+1.0,2.8);
  monument(lv>=3?'木星天文科學館':'木星天文台',CA-1.05,2.35,1.25);   // 家長 11-18：石牌往內收，不要太出來
  tree(CA-1.4,-1.9,1.05,'#5aa957'); tree(CA+2.15,-1.4,.95,'#62b955'); tree(CA-2.55,-.6,.9,'#5aa957'); bush(CA+2.4,.15,.9,'#c9b6f0');
  if(lv===1){   // 右格先是草地和小樹，之後長成天文館
    tree(CB-1.2,-1.6,1.1,'#62b955'); tree(CB+.9,-2.3,.95,'#5aa957'); tree(CB+2.2,-.4,1.0,'#62b955'); tree(CB-.2,1.5,.85,'#5aa957'); bush(CB+1.3,1.6,.9,'#c9b6f0');
    benchOn(CB-1.4,.35,-1.2); }
  if(lv>=2){
    planetarium(CB-.15,-.9,1.75);   // 家長 11-18：往內、往後收，入口大廳不要跑到路上                       // 星象館（右格）
    path([[CB-.15,3.5],[CB-.15,2.3]],.8);
    path([[CA+.6,2.25],[-1.2,2.0],[0,2.15],[CB-1.3,2.35],[CB-.2,2.55]],.45);
    lampV(CB-1.05,2.75); lampV(CB+.75,2.75);
    radioDish(0,-1.15,lv>=3?1.05:.9,lv>=3);             // 電波望遠鏡：兩格中間偏後（Lv3 變大、會慢慢轉）
    tree(CB+2.3,.9,.9,'#62b955'); bush(CB+1.7,1.95,.8,'#c9b6f0');
    tree(CB-.6,-2.75,1.0,'#5aa957'); if(lv<3) bush(CB-1.85,1.7,.85,'#c9b6f0');
  }
  if(lv>=3) orrery(.5,.8);                             // 八大行星模型：家長 11-18 換到電波望遠鏡前面的空地
}

const LV=(id,name,fn,n)=>Array.from({length:n},(_,i)=>[id+(i?i+1:''),name+' Lv'+(i+1),()=>fn(i+1),'double']);
export const ASTRO_LV=LV('observatory','天文台',astro,3);
export const ASTRO_TOP=[0,2.6,3.2,3.9];
