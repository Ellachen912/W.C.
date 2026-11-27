/* Winston City：運動中心（2 格；家長 11-27 給的 Blender 檔「Winston_City_Park_Civic_Edition_26.blend」改成我們的風格）
   Lv1 運動公園（左格）：戶外游泳池（6 水道、木平台、木棚架、躺椅、跳台）、兩面網球場（綠色外圈、藍色場地、圍網）、
       兒童戲水池（會噴水）、兩台小推車（熱狗堡、紀念品）、步道、長椅、路燈、樹。右格先是草地和小樹。
   Lv2 木星棒球場（右格）：半開放圓頂球場：奶油色外牆＋拱窗、藍綠色環形屋頂（中間開口看得到球場）、
       藍色四層看台、內野紅土、外野條紋草皮、白線和壘包、休息區、背後的計分板、四座照明燈塔、
       正門（羅馬柱＋雨棚＋招牌＋屋頂上的大棒球放在短柱上）、門前球迷廣場（海報、市旗）。兩格中間的路也鋪起來。
   顏色沿用 Blender 檔：藍綠屋頂、奶油外牆、深藍、萬壽菊金邊、藍色座椅、紅土、綠草（只是調柔和一點）。
   英文字全部換成中文（家長：不要真實品牌）；大東西都放在六角格裡面。
   座標：兩格中間為原點，x 沿兩格排列方向，正門朝 +z；左格中心 (-4.44,0)、右格 (4.44,0)；尖頂朝前後（頂點 z=±4.2）。 */
import * as THREE from 'three';
import { kit } from './s1_kit.js';
import { cityTree } from './trees.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ROOT, add, cyl, mat, hexPad, canvasTex, anims, glassMat } from './lib.js';
/* 11-27 12:42 優化（家長：面數會不會太多）：這棟有幾百個小零件，lib.js 的 rbox 每個圓角方塊約 590 個三角形、sphere 每顆約 720 個。
   這裡改用省面版：小東西用一般方塊（12 個三角形），大一點的才做圓角而且只切 1 段（約 108 個）；小球只用 8×6 段。看起來差不多，面數少很多。 */
function rbox(w,h,d,c,x,y,z,r=.05,parent){ const big=Math.min(w,h,d)>=.12&&r>=.02;
  const geo=big?new RoundedBoxGeometry(w,h,d,1,Math.min(r,w/2-.001,h/2-.001,d/2-.001)):new THREE.BoxGeometry(w,h,d);
  const m=add(new THREE.Mesh(geo,c.isMaterial?c:mat(c)),parent); m.position.set(x,y+h/2,z); return m; }
function sphere(r,c,x,y,z,o={},parent){ const lo=r<.06; const m=add(new THREE.Mesh(new THREE.SphereGeometry(r,lo?8:16,lo?6:10),c.isMaterial?c:mat(c,o)),parent); m.position.set(x,y,z); return m; }

const CA=-4.44, CB=4.44;
const TEALD='#2f8579', CREAMW='#f3e6cc', NAVY='#4a4a61', MARI='#f0bd52', PADB='#4f84c4', CLAY='#c98a5e', SAND='#e3d6bd', WOOD='#b9875a', STEEL='#8d97a6';
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
const rnd=(s=7)=>()=>((s=s*16807%2147483647)/2147483647);

/* ---------- 地面 ---------- */
const paveTex=canvasTex((g,s)=>{ g.fillStyle='#d8cfbf'; g.fillRect(0,0,s,s); const R=rnd(11);   // 暖灰色方磚（人字交錯）
  for(let j=0;j<8;j++) for(let i=-1;i<5;i++){ const x=i*s/4+(j%2?s/8:0), y=j*s/8; g.fillStyle=['#e6dece','#ddd4c3','#e9e2d3','#d9cfbd'][(i*3+j*5+20)%4]; g.beginPath(); g.roundRect(x+2,y+2,s/4-4,s/8-4,3); g.fill(); }
  for(let i=0;i<500;i++){ g.fillStyle=`rgba(120,105,85,${R()*.1})`; g.fillRect(R()*s,R()*s,2,2); } },256);
const grassTex=canvasTex((g,s)=>{ g.fillStyle='#8fcf72'; g.fillRect(0,0,s,s); const R=rnd(5);
  for(let i=0;i<900;i++){ g.fillStyle=R()<.5?'rgba(60,130,50,.16)':'rgba(255,255,255,.12)'; g.fillRect(R()*s,R()*s,2,4); } },256);
function texM(tex,rx,ry,o={}){ const t=tex.clone(); t.needsUpdate=true; t.repeat.set(rx,ry); return new THREE.MeshStandardMaterial({map:t,roughness:.9,...o}); }
function pad(cx){ const g=grp(cx,0,0,Math.PI/6); g.add(hexPad(texM(paveTex,3,3),.42,.09)); }
/* 圓角草地（貼地、不會閃）：在 y 高度鋪一片 */
function lawn(x,z,w,d,r=.4,y=.125){ const s=new THREE.Shape(), hw=w/2, hd=d/2; s.moveTo(-hw+r,-hd); s.lineTo(hw-r,-hd); s.quadraticCurveTo(hw,-hd,hw,-hd+r); s.lineTo(hw,hd-r); s.quadraticCurveTo(hw,hd,hw-r,hd); s.lineTo(-hw+r,hd); s.quadraticCurveTo(-hw,hd,-hw,hd-r); s.lineTo(-hw,-hd+r); s.quadraticCurveTo(-hw,-hd,-hw+r,-hd);
  const geo=new THREE.ShapeGeometry(s); geo.rotateX(-Math.PI/2); const uv=geo.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)/1.5,uv.getY(i)/1.5);
  const m=add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:grassTex,roughness:.95}))); m.position.set(x,y,z); m.castShadow=false; m.userData.noCheck=1;
  rbox(w+.06,.03,d+.06,'#bfb39c',x,y-.04,z,.015).castShadow=false; return m; }

/* ---------- 小東西 ---------- */
function lampP(x,z){ cyl(.03,.045,1.0,NAVY,x,.1,z,10); rbox(.1,.04,.1,NAVY,x,1.08,z,.01); sphere(.075,'#fff3c4',x,1.18,z,{emissive:0xffd98a,emissiveIntensity:.45}); const c=add(new THREE.Mesh(new THREE.ConeGeometry(.11,.09,6),mat(NAVY))); c.position.set(x,1.29,z); }
function benchP(x,z,ry=0){ const g=grp(x,.1,z,ry); rbox(.62,.05,.2,'#b97a4c',0,.15,0,.02,g); rbox(.62,.15,.04,'#b97a4c',0,.22,-.09,.02,g); for(const s of [-1,1]) rbox(.05,.17,.18,NAVY,s*.25,0,0,.01,g); }

/* ================= 左格：運動公園（家長 11-27 11:01：不要攤販、不要擠、游泳池和網球場要現代化） =================
   後半：現代泳池（淺灰大石板平台、白色池緣、藍綠池水、池底深色水道線、白色薄板遮陽棚＋黑色細柱、白色躺椅、玻璃欄杆）
   前半：兩面網球場（藍色場地、灰綠外圈、黑色細框圍網、四支 LED 燈桿）
   中間：一條直直的步道接到中間的路；兩側草地、柱狀樹、清水模長椅、地燈。空間留開，不塞東西。 */
const CHAR='#33373d', WHITE='#f6f6f3', STONE='#e2e0da';
const slabTex=canvasTex((g,s)=>{ g.fillStyle='#cfccc4'; g.fillRect(0,0,s,s); const R=rnd(21);   // 大片淺灰石板
  for(let j=0;j<2;j++) for(let i=0;i<4;i++){ g.fillStyle=['#e6e4de','#e1dfd8','#e9e7e2','#dedcd5'][(i+j*3)%4]; g.fillRect(i*s/4+1.5,j*s/2+1.5,s/4-3,s/2-3); }
  for(let i=0;i<300;i++){ g.fillStyle=`rgba(140,135,125,${R()*.08})`; g.fillRect(R()*s,R()*s,2,2); } },256);
function waterTex(n){ return canvasTex((g,s)=>{ const gr=g.createLinearGradient(0,0,s,s); gr.addColorStop(0,'#5cc8e0'); gr.addColorStop(1,'#2fa5c8'); g.fillStyle=gr; g.fillRect(0,0,s,s); const R=rnd(9);
  for(let i=0;i<n;i++){ const y=(i+.5)*s/n; g.fillStyle='rgba(25,60,90,.5)'; g.fillRect(s*.08,y-2.5,s*.84,5); g.fillRect(s*.08,y-9,3,18); g.fillRect(s*.92-3,y-9,3,18); }
  g.strokeStyle='rgba(255,255,255,.3)'; g.lineWidth=2; for(let i=0;i<45;i++){ const x=R()*s,y=R()*s; g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+10,y-5,x+20,y); g.stroke(); }
  const q=s/64; for(let i=0;i<64;i++) for(const [xx,yy] of [[i*q,0],[i*q,s-q],[0,i*q],[s-q,i*q]]){ g.fillStyle=['#1f6fa8','#2a86c0','#3a9bd0'][(i*7+(xx+yy|0))%3]; g.fillRect(xx+.5,yy+.5,q-1,q-1); } },512); }   // 池邊一圈藍色馬賽克磚
const glassPanel=new THREE.MeshStandardMaterial({color:'#cfe9f2',transparent:true,opacity:.35,roughness:.05,metalness:.1,side:THREE.DoubleSide});
function floatTex(alt){ return canvasTex((g,s)=>{ for(let i=0;i<16;i++){ g.fillStyle=(i<2||i>13)?'#e8524a':(i%2?'#ffffff':(alt?'#3d78bf':'#f2c14e')); g.fillRect(i*s/16,0,s/16,s); g.fillStyle='rgba(0,0,0,.12)'; g.fillRect(i*s/16,0,1.5,s); } },128); }
function signM(t,bg){ const cv=document.createElement('canvas'); cv.width=384; cv.height=128; const g=cv.getContext('2d'); g.fillStyle=bg; g.beginPath(); g.roundRect(0,0,384,128,24); g.fill();
  g.fillStyle='#ffffff'; g.font='bold 78px "PingFang TC","Noto Sans CJK TC",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(t,192,68); const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({map:tx,transparent:true,roughness:.7}); }
/* 救生員高椅：白色高腳椅＋橘色救生圈 */
/* 救生員椅（家長 11-27 12:29：放回來，但不要太高）：矮的白色高腳椅、紅色坐墊、小紅傘、橘色救生圈；ry 決定面向 */
function lifeguard(x,y,z,ry=0){ const g=grp(x,y,z,ry), H=.3;
  for(const sx of [-1,1]) for(const sz of [-1,1]){ const l=rbox(.022,H,.022,WHITE,sx*.07,0,sz*.07,.005,g); l.rotation.z=-sx*.06; }
  rbox(.18,.018,.018,WHITE,0,.12,.08,.004,g); rbox(.18,.018,.018,WHITE,0,.21,.08,.004,g);                       // 前面兩階踏板
  rbox(.19,.025,.18,WHITE,0,H,0,.006,g); rbox(.17,.05,.16,'#e8524a',0,H+.025,0,.008,g); rbox(.19,.15,.025,WHITE,0,H+.025,-.085,.005,g);   // 座位、坐墊、椅背
  const ring=add(new THREE.Mesh(new THREE.TorusGeometry(.055,.018,8,18),mat('#f08a3c')),g); ring.position.set(0,H*.55,-.09);
  cyl(.008,.008,.24,'#d9dde3',.07,H,-.07,6,g); const u=add(new THREE.Mesh(new THREE.ConeGeometry(.14,.06,8),mat('#e8524a')),g); u.position.set(.07,H+.27,-.07); }
/* 跳水台（家長 11-27 11:32：要真正的跳水台）：池子左端，一座白色跳水塔（兩層平台、藍色台面、欄杆、後面爬梯）＋一支低的彈跳板，都伸到水面上 */
/* 白色圓盆栽，裡面一顆可愛的圓灌木 */
/* 專業跳水＋游泳池（家長 11-27 11:43：基地架高、專業跳水游泳池、旁邊不要休息處）
   石材基座架高 0.3，正面中間一道階梯上去；台上右邊 8 水道標準泳池（出發台、浮球繩、仰式旗），左邊獨立的深藍跳水池，
   左邊緣立一座三層跳水塔（10 米、5 米、3 米平台）＋兩支彈跳板（1 米、3 米）。四周玻璃欄杆。 */
const podTex=canvasTex((g,s)=>{ g.fillStyle='#c9c4b8'; g.fillRect(0,0,s,s); for(let j=0;j<4;j++) for(let i=-1;i<3;i++){ const x=i*s/2+(j%2?s/4:0); g.fillStyle=['#dedad1','#d6d1c6','#e3dfd7','#d9d4ca'][(i+j*3+8)%4]; g.fillRect(x+2,j*s/4+2,s/2-4,s/4-4); } },256);
function diveTex(){ return canvasTex((g,s)=>{ const gr=g.createRadialGradient(s/2,s/2,10,s/2,s/2,s*.7); gr.addColorStop(0,'#2f8fc4'); gr.addColorStop(1,'#1f6aa0'); g.fillStyle=gr; g.fillRect(0,0,s,s); const R=rnd(4);
  g.strokeStyle='rgba(255,255,255,.28)'; g.lineWidth=2; for(let i=0;i<30;i++){ const x=R()*s,y=R()*s; g.beginPath(); g.arc(x,y,6+R()*10,0,Math.PI); g.stroke(); }
  g.fillStyle='rgba(10,40,70,.5)'; g.fillRect(s*.47,s*.2,s*.06,s*.6); g.fillRect(s*.35,s*.47,s*.3,s*.06);   // 池底十字
  const q=s/32; for(let i=0;i<32;i++) for(const [xx,yy] of [[i*q,0],[i*q,s-q],[0,i*q],[s-q,i*q]]){ g.fillStyle=['#1f6fa8','#2a86c0','#3a9bd0'][(i*5+(xx+yy|0))%3]; g.fillRect(xx+.5,yy+.5,q-1,q-1); } },256); }
function waterPlane(w,d,mtl,x,y,z){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mtl); m.rotation.x=-Math.PI/2; m.position.set(x,y,z); m.receiveShadow=true; m.userData.noCheck=1; ROOT.add(m); return m; }
function proPool(x,z){ const DW=3.3, DD=2.0, H=.3, Y=.1+H, pz=z-.28;
  rbox(DW,H,DD,texM(podTex,4,1),x,.1,z,.02);                                          // 架高的石材基座
  rbox(DW+.04,.05,DD+.04,texM(slabTex,3,2),x,Y,z,.015);                                // 台面淺灰大石板
  const T=Y+.05;
  // 正面中間的階梯
  for(let i=0;i<4;i++) rbox(.7,(i+1)*H/4,.12,'#e6e3dc',x+.45,.1,z+DD/2+.06+(3-i)*.12,.01);
  // 8 水道標準泳池（右邊）
  const LW=1.9, LD=1.15, lx=x+.42; rbox(LW+.1,.04,LD+.1,WHITE,lx,T-.02,pz,.01);
  waterPlane(LW,LD,new THREE.MeshStandardMaterial({map:waterTex(8),roughness:.06,metalness:.1}),lx,T+.034,pz);   // 水面比池緣高 1.4 公分（原本只差 2 毫米，手機會閃）
  for(let i=1;i<8;i++){ const r=add(new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,LW-.06,8),new THREE.MeshStandardMaterial({map:floatTex(i%2),roughness:.5}))); r.rotation.z=Math.PI/2; r.position.set(lx,T+.042,pz-LD/2+i*LD/8); r.castShadow=false; }
  for(let i=0;i<8;i++){ const bz=pz-LD/2+(i+.5)*LD/8, bx=lx+LW/2+.09; rbox(.1,.09,.1,WHITE,bx,T,bz,.015); rbox(.11,.02,.11,'#3d78bf',bx-.005,T+.09,bz,.006); }   // 出發台
  for(const ex of [-1,1]){ const fx=lx+ex*(LW/2-.28); for(const ez of [-1,1]) cyl(.01,.01,.5,'#d9dde3',fx,T,pz+ez*(LD/2+.07),6);   // 仰式旗
    for(let k=0;k<11;k++){ const t=add(new THREE.Mesh(new THREE.ConeGeometry(.028,.065,3),mat(['#f2777a','#ffffff','#5aa8e6'][k%3]))); t.rotation.x=Math.PI; t.position.set(fx,T+.46,pz-LD/2-.05+k*(LD+.1)/10); }
    const st=add(new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,LD+.16,4),mat('#9aa0aa'))); st.rotation.x=Math.PI/2; st.position.set(fx,T+.49,pz); }
  // 跳水池（左邊，深藍色）
  const DWl=.85, dx=x-1.03; rbox(DWl+.1,.04,LD+.1,WHITE,dx,T-.02,pz,.01);
  waterPlane(DWl,LD,new THREE.MeshStandardMaterial({map:diveTex(),roughness:.06,metalness:.1}),dx,T+.034,pz);
  for(const o of [-.06,.06]){ const r=add(new THREE.Mesh(new THREE.TorusGeometry(.06,.01,8,14,Math.PI),mat('#e4e8ee',{metalness:.7,roughness:.25}))); r.position.set(dx+.2+o,T+.04,pz+LD/2+.04); r.rotation.y=Math.PI/2; }
  diveTower(x-DW/2+.08,T,pz);
  lifeguard(x-1.05,T,z+.68,Math.PI);                                                  // 救生員椅：跳水池前面，面向池子
  // 四周玻璃欄杆（正面留階梯開口）
  const gr=(len,px,pz2,ry)=>glassRail(px,pz2,len,ry,T);
  gr(DW-.1,x,z-DD/2+.03,0); gr(DD-.1,x+DW/2-.03,z,Math.PI/2); gr(1.6,x-.8,z+DD/2-.03,0); gr(.62,x+1.33,z+DD/2-.03,0);
}
/* 跳水塔：白色混凝土塔身，三層平台（藍色止滑台面、欄杆）伸到跳水池上；旁邊兩支彈跳板（1 米、3 米） */
function diveTower(ex,y0,pz){ const g=grp(ex,y0,pz), B='#3d78bf', rail=(len,x,y,z)=>rbox(len,.014,.014,'#d9dde3',x,y,z,.003,g);
  const tz=-.18; rbox(.14,1.3,.34,WHITE,-.02,0,tz,.02,g); rbox(.15,1.3,.012,'#e6e3dc',-.02,0,tz-.13,.003,g);
  for(const [y,len] of [[.5,.36],[.88,.46],[1.28,.56]]){ rbox(len,.04,.26,WHITE,len/2-.02,y,tz,.008,g); rbox(len-.02,.012,.24,B,len/2-.02,y+.04,tz,.004,g);
    for(const sz of [-.12,.12]){ rail(len-.12,(len-.12)/2+.04,y+.17,tz+sz); for(let k=0;k<3;k++) rbox(.012,.17,.012,'#d9dde3',.05+k*(len-.16)/2,y+.04,tz+sz,.003,g); } }
  for(let k=0;k<13;k++) rbox(.012,.012,.16,'#d9dde3',-.11,.1+k*.1,tz,.003,g); for(const sz of [-.08,.08]) rbox(.014,1.32,.014,'#d9dde3',-.11,0,tz+sz,.003,g);   // 塔後爬梯
  const board=(bz,h,len)=>{ rbox(.14,h,.12,B,.03,0,bz,.015,g); const bd=rbox(len,.022,.1,WHITE,.03+len/2-.02,h,bz,.006,g); bd.rotation.z=.04; rbox(.04,.04,.1,'#e8524a',.06,h-.01,bz,.005,g); };
  board(.12,.12,.5); board(.36,.32,.55); }
function glassRail(x,z,len,ry=0,y=.17){ const g=grp(x,y,z,ry); const p=new THREE.Mesh(new THREE.PlaneGeometry(len,.2),glassPanel); p.position.y=.1; g.add(p); rbox(len,.018,.022,CHAR,0,.2,0,.005,g); for(const s of [-1,1]) rbox(.022,.22,.022,CHAR,s*len/2,0,0,.005,g); }
/* 網球場（現代）：藍色場地、灰綠外圈、白線，黑色細框圍網，四支 LED 燈桿 */
const courtTex=canvasTex((g,s)=>{ g.fillStyle='#5f8d7f'; g.fillRect(0,0,s,s); const cx=s/2, L=s*.8, Wd=s*.4, x0=cx-Wd/2, y0=(s-L)/2;
  g.fillStyle='#3d78bf'; g.fillRect(x0,y0,Wd,L); g.strokeStyle='#ffffff'; g.lineWidth=5; g.strokeRect(x0,y0,Wd,L);
  const sx=Wd*.125; g.beginPath(); g.moveTo(x0+sx,y0); g.lineTo(x0+sx,y0+L); g.moveTo(x0+Wd-sx,y0); g.lineTo(x0+Wd-sx,y0+L);
  const sv=L*.23; g.moveTo(x0+sx,s/2-sv); g.lineTo(x0+Wd-sx,s/2-sv); g.moveTo(x0+sx,s/2+sv); g.lineTo(x0+Wd-sx,s/2+sv); g.moveTo(cx,s/2-sv); g.lineTo(cx,s/2+sv);
  g.moveTo(cx,y0); g.lineTo(cx,y0+12); g.moveTo(cx,y0+L); g.lineTo(cx,y0+L-12); g.stroke(); },512);
const fenceTex=canvasTex((g,s)=>{ g.clearRect(0,0,s,s); g.strokeStyle='rgba(40,44,50,.8)'; g.lineWidth=2; for(let i=-s;i<s*2;i+=16){ g.beginPath(); g.moveTo(i,0); g.lineTo(i+s,s); g.stroke(); g.beginPath(); g.moveTo(i,s); g.lineTo(i+s,0); g.stroke(); } },128);
function fenceMat(w,h){ const t=fenceTex.clone(); t.needsUpdate=true; t.repeat.set(w*4,h*4); return new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.3,side:THREE.DoubleSide,roughness:.6}); }
function tennis(x,z){ const W=2.1, D=1.85, g=grp(x,.1,z);
  rbox(W+.08,.04,D+.08,'#d6d4ce',0,0,0,.02,g);
  for(const s of [-1,1]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(W/2-.03,D-.04),new THREE.MeshStandardMaterial({map:courtTex,roughness:.85})); p.rotation.x=-Math.PI/2; p.position.set(s*W/4,.055,0); p.receiveShadow=true; p.userData.noCheck=1; g.add(p);
    const net=new THREE.Mesh(new THREE.PlaneGeometry(.5,.06),fenceMat(.5,.06)); net.position.set(s*W/4,.085,0); g.add(net); rbox(.52,.012,.015,'#ffffff',s*W/4,.115,0,.003,g);
    for(const o of [-.27,.27]) cyl(.01,.01,.12,CHAR,s*W/4+o,.04,0,6,g); }
  const H=.4, side=(len,px,pz,ry,h)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(len,h),fenceMat(len,h)); m.position.set(px,.04+h/2,pz); m.rotation.y=ry; g.add(m); const t=rbox(len,.018,.018,CHAR,0,0,0,.004,g); t.position.set(px,.04+h,pz); t.rotation.y=ry; };
  side(W,0,-D/2,0,H); side(D,-W/2,0,Math.PI/2,H); side(D,W/2,0,Math.PI/2,H); side(W*.3,-W*.35,D/2,0,H*.45); side(W*.3,W*.35,D/2,0,H*.45);   // 前面矮、中間留入口
  const ws=(len,px,pz,ry)=>{ const m=rbox(len,H*.5,.008,'#2f5d4a',px,.04,pz,.003,g); m.rotation.y=ry; };   // 圍網下半部的深綠擋風布
  ws(W-.02,0,-D/2+.01,0); ws(D-.02,-W/2+.01,0,Math.PI/2); ws(D-.02,W/2-.01,0,Math.PI/2);
  { const m=new THREE.Mesh(new THREE.PlaneGeometry(.7,.13),signM('木星網球場','#2f5d4a')); m.position.set(0,.16,-D/2+.02); g.add(m); }
  { const u=grp(-W/2+.12,.04,0,0,g); for(const sz of [-1,1]) rbox(.02,.38,.02,WHITE,0,0,sz*.06,.004,u); rbox(.12,.02,.14,WHITE,0,.38,0,.005,u); rbox(.02,.12,.14,WHITE,-.05,.4,0,.004,u); rbox(.1,.04,.12,'#3d78bf',0,.4,0,.008,u); }   // 裁判椅
  for(const [bx,bz] of [[-.42,-.6],[-.3,-.7],[.62,.66],[.5,.75],[.7,-.55]]) sphere(.022,'#d8f25a',bx,.07,bz,{},g);   // 網球
  { const bk=grp(.9,.04,-.7,0,g); cyl(.07,.06,.12,'#9aa0aa',0,0,0,12,bk); for(let i=0;i<5;i++) sphere(.022,'#d8f25a',Math.cos(i*1.3)*.035,.12,Math.sin(i*1.3)*.035,{},bk); }   // 球籃
  for(let i=0;i<=4;i++) cyl(.014,.014,H+.02,CHAR,-W/2+i*W/4,.04,-D/2,6,g);
  for(let i=1;i<4;i++) for(const s of [-1,1]) cyl(.014,.014,H+.02,CHAR,s*W/2,.04,-D/2+i*D/4,6,g);
  for(const s of [-1,1]) cyl(.014,.014,H*.45+.02,CHAR,s*W/2,.04,D/2,6,g);
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const lx=sx*(W/2+.0), lz=sz*(D/2-.25); cyl(.016,.02,1.0,CHAR,lx,.04,lz,8,g); rbox(.2,.03,.08,CHAR,lx-sx*.06,1.04,lz,.006,g); rbox(.17,.01,.06,mat('#ffffff',{emissive:new THREE.Color('#fff6dc'),emissiveIntensity:.7}),lx-sx*.06,1.035,lz,.003,g); } }
/* 柱狀樹（現代感，跟美術館一樣）、清水模長椅、地燈 */
/* 可愛的樹（家長 11-27 11:27：柱狀樹太醜，要可愛的）：短短的圓樹幹＋三顆圓滾滾的光滑樹冠，有的開粉紅花、有的結橘色小果子 */
/* 樹：用共用的 trees.js（家長 11-27 12:39：公園四種樹＋Blender 城市樹混著種，可以改顏色，有粉紅花樹） */
function cuteBush(x,z,k=1,y0=.1){ const m=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.22*k,1),mat('#58b04d',{flatShading:true,roughness:.9}))); m.position.set(x,y0+.14*k,z); m.scale.y=.75;   // 灌木也改成同一種多面體
  for(let i=0;i<4;i++){ const a=i*1.57+.4; sphere(.03*k,['#ff8fab','#ffd166','#ffffff'][i%3],x+Math.cos(a)*.18*k,y0+.2*k,z+Math.sin(a)*.18*k); } }
function bollard(x,z){ rbox(.07,.3,.07,CHAR,x,.1,z,.01); rbox(.075,.05,.075,mat('#fff3d0',{emissive:new THREE.Color('#ffd98a'),emissiveIntensity:.8}),x,.34,z,.01); }
function stripPath(x0,x1,z,w=.5){ rbox(Math.abs(x1-x0),.03,w,'#f1eee8',(x0+x1)/2,.11,z,.01).castShadow=false; }

function park(lv){ const x=CA;
  pad(x);
  proPool(x-.1,-1.75);
  tennis(x-.15,1.5);
  stripPath(x-1.9,lv>=2?.95:x+3.25,.05,.5);                                       // 一條直步道；Lv2 穿過中間的路，接到棒球場正門（家長 11-27 12:29）
  rbox(.4,.03,.5,'#f1eee8',x-.15,.11,.45,.01).castShadow=false;                    // 往網球場入口
  lawn(x-2.45,.95,.8,1.5,.25); lawn(x+2.3,1.15,.85,1.3,.25); lawn(x,3.05,.9,.7,.25);
  for(const [dx,dz,k,kind,tint] of [[-2.45,.7,1,'p12'],[2.3,.95,1,'city','pink'],[-2.35,-1.15,.85,'p04'],[2.4,-1.2,.85,'p06'],[0,3.15,.8,'p13','pink']]) cityTree(x+dx,dz,{k,kind,tint});
  for(const [dx,dz] of [[-2.55,1.5],[-2.2,1.6],[2.1,1.65],[2.6,1.45],[-.35,3.05],[.35,3.1]]) cuteBush(x+dx,dz,.75,.115);
  for(const dx of [-1.7,-.6,.6,1.7]) bollard(x+dx,.42);
}

/* ================= 右格：木星棒球場 ================= */
/* 球場本體用家長給的 Blender 模型（家長 11-27 10:49：「棒球球場盡量用他的」）：
   只拿球場那一格（01～06、08、09 圖層），同材質的零件合併、座椅和燈泡減面，匯出 models/ballpark.glb。
   模型上原本的英文字（WINSTON CITY、PLAY BALL…）匯出時拿掉，改用下面的中文字貼回原本的位置。 */
const BP_CY=4.305, BP_Z0=.02;   // Blender 檔裡模型範圍的中心（y）和最低點（z）：用來把 Blender 座標換成這裡的座標
const BP_TXT=[   // [中文, Blender x, y, z（字的位置）, 字高, 寬, 顏色, 底色]
  ['木星棒球場',0,7.03,.47,.075,.62,'#fff8ea'],
  ['木星棒球場',0,.9,.34,.075,.62,'#fff8ea'],
  ['開幕夜',-1.29,6.55,.36,.06,.5,'#fbf6ec'], ['木星城',1.29,6.55,.36,.06,.5,'#fbf6ec'],
  ['比賽開始',-.77,1.03,.39,.06,.34,'#fbf6ec'], ['夜間比賽',.77,1.03,.39,.06,.34,'#fbf6ec'], ['全壘打',-1.36,1.59,.39,.06,.34,'#fbf6ec'], ['木星加油',1.36,1.59,.39,.06,.34,'#fbf6ec'],
  ['木星城',-.77,1.03,.16,.035,.3,'#fbf6ec'], ['開球',.77,1.03,.16,.035,.3,'#fbf6ec'], ['球迷廣場',-1.36,1.59,.16,.035,.3,'#fbf6ec'], ['主隊',1.36,1.59,.16,.035,.3,'#fbf6ec'],
];
function txtPlane(t,h,w,c){ const cv=document.createElement('canvas'); cv.width=512; cv.height=Math.max(32,Math.round(512*h/w)); const g=cv.getContext('2d');
  g.fillStyle=c; const fs=Math.min(cv.height*.9,cv.width/t.length*.95); g.font=`bold ${fs}px "PingFang TC","Noto Sans CJK TC","Noto Sans TC",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText(t,cv.width/2,cv.height/2);
  const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=4; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false})); m.userData.noCheck=1; return m; }
/* 計分板的比分（一樣照 Blender 檔：客隊 0 0 1 0 0 0、主隊 0 1 0 2 0 0） */
function scoreRows(){ const cv=document.createElement('canvas'); cv.width=1024; cv.height=300; const g=cv.getContext('2d'); g.textAlign='center'; g.textBaseline='middle';
  g.font='bold 60px "PingFang TC","Noto Sans CJK TC",sans-serif'; const X=i=>250+i*66+(i>8?36:0);
  g.fillStyle='#bfe3ef'; ['1','2','3','4','5','6','7','8','9','分','安','失'].forEach((h,i)=>g.fillText(h,X(i),52));
  [['客隊',[0,0,1,0,0,0,'•','•','•',1,4,0]],['主隊',[0,1,0,2,0,0,'•','•','•',3,6,0]]].forEach(([n,v],j)=>{ const yy=150+j*100; g.fillStyle='#fff8ea'; g.fillText(n,110,yy); v.forEach((t,i)=>{ g.fillStyle=i>8?MARI:'#bfe3ef'; g.fillText(String(t),X(i),yy); }); });
  const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=4; const m=new THREE.Mesh(new THREE.PlaneGeometry(.98,.29),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false})); m.userData.noCheck=1; return m; }
export const BP={face:'side'};   // 'side'：跟家長的檔一樣正門朝中間的路；'front'：正門朝前（縮小成 0.9 倍才塞得進尖頂）
function ballpark(){ const x=CB, Y=.1, front=BP.face==='front', S=front?.9:1, R=front?0:-Math.PI/2, OFF=.135*S;   // OFF：模型範圍中心和球場圓心差 0.135
  pad(x);
  rbox(1.6,.09,3.9,texM(paveTex,1,3),0,0,0,.03);                         // 兩格中間的路也鋪起來
  kit('models/ballpark.glb',front?x:x-OFF,0,{y0:Y,rot:R,w:front?6.58*S:null,then:o=>o.traverse(m=>{ if(m.isMesh&&/seams|transom|stitch|Chalk|Scoreboard|padding/.test(m.material.name)){ m.material.polygonOffset=true; m.material.polygonOffsetFactor=-2; m.material.polygonOffsetUnits=-4; m.material.userData.keep=true; } })});   // 貼在別的面上的細條（屋頂接縫、白線…）往前推一點，手機上不閃
  // Blender 座標 → 這裡：先換成模型自己的座標（lx, lz），縮放、轉向，再移到格子上
  const P=(bx,by,bz)=>{ const lx=bx*S, lz=-(by-BP_CY)*S, y=Y+(bz-BP_Z0)*S; return front?[x+lx,y,lz]:[x-OFF-lz,y,lx]; };
  const put=(m,px,py,pz)=>{ if(front) m.position.set(px,py,pz+.012); else { m.position.set(px-.012,py,pz); m.rotation.y=-Math.PI/2; } m.scale.setScalar(S); ROOT.add(m); };
  for(const [t,bx,by,bz,h,w,c] of BP_TXT){ const [px,py,pz]=P(bx,by,bz); put(txtPlane(t,h*1.5,w,c),px,py+h*.35*S,pz); }
  { const [px,py,pz]=P(.05,7.03,.35); put(scoreRows(),px,py,pz); }
}
/* Lv1 時右格：草地、小樹、長椅（之後長成棒球場） */
function rightLawn(){ const x=CB; pad(x); lawn(x,-.2,4.2,4.0,.8);
  for(const [dx,dz,k,kind,tint] of [[-1.3,-1.6,1.0,'p12'],[1.0,-2.3,.9,'city','pink'],[2.1,-.3,.95,'p13'],[-.3,1.4,.85,'p04'],[-2.2,.4,.8,'city'],[1.4,1.8,.75,'p06','lime']]) cityTree(x+dx,dz,{k,kind,tint});
  cuteBush(x+.6,.4,.85,.115); cuteBush(x-1.0,-.2,.8,.115); benchP(x-1.0,1.9,.3); benchP(x+.4,-.6,-.6); lampP(x-.2,2.6); }

function gym(lv){ park(lv); if(lv>=2) ballpark(); else rightLawn(); }
const LV=(id,name,fn,n)=>Array.from({length:n},(_,i)=>[id+(i?i+1:''),name+' Lv'+(i+1),()=>fn(i+1),'double']);
export const GYM_LV=LV('gym','運動中心',gym,2);
export const GYM_TOP=[0,1.6,3.4];
