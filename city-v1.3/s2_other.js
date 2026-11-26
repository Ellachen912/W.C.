/* Winston City 第二階段：其他區的小建築（家長 2026-11-18 15:44「先繼續做其他」）
   派出所（半格、1 級、最多 3 間）：白牆藍腰帶兩層樓，藍底白字「木星派出所」，屋頂紅藍警示燈輪流閃，門口停 Kenney 警車，市旗，巡邏箱
   台灣傳統廟（最多 2 間）：Lv1 半格小廟（紅柱、橘黃屋頂、燕尾翹脊、龍珠、匾額「木星宮」、香爐冒煙、紅燈籠、石獅）；
                           Lv2 長大佔一整格（三川門＋廣場＋大香爐＋兩層屋頂正殿＋兩側廂房、一串紅燈籠、大榕樹）
   文具店（半格、1 級、最多 1 間）：奶油黃透天厝、騎樓下彩色貨架、門口筆記本和蠟筆展示台、兩台扭蛋機、屋頂一支大鉛筆，招牌「木星文具店」
   座標同 s1_more.js 的半格：建地中心為原點、正門朝 +z（朝外面的路）；半格是梯形，後面（z≈-1.55）寬約 ±4，前面（z≈1.7）寬約 ±1.9。
   廟 Lv2 佔整格：整格中心在半格中心往後 H*.24（OZ），用 grp(0,0,OZ) 包起來畫，可用範圍約半徑 3.3。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, tree, bush, bench, lamp, flag, puff, anims, prism, hexPad, roofUV, tileMat, texMat, stoneTex, wallMat, canvasTex } from './lib.js';
import { kit } from './s1_kit.js';

const WHITE='#f6f3ec', OZ=-Math.sqrt(3)*4.2*.24;
const em=(c,i=.6)=>mat(c,{emissive:new THREE.Color(c),emissiveIntensity:i});
const glass=mat('#a8dcf0',{roughness:.15,metalness:.1,emissive:0x1d4a5c,emissiveIntensity:.15});
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function textTex(txt,bg,fg,border,w=1024,h=200,vertical=false){ return rectTex(w,h,(g,W,H)=>{ g.fillStyle=bg; g.fillRect(0,0,W,H); if(border){ g.strokeStyle=border; g.lineWidth=Math.min(W,H)*.06; g.strokeRect(g.lineWidth/2,g.lineWidth/2,W-g.lineWidth,H-g.lineWidth); }
  g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle'; const F='"PingFang TC","Noto Sans CJK TC","Noto Sans TC",sans-serif';
  if(vertical){ const n=txt.length, fs=Math.min(W*.66,H*.86/n); g.font=`bold ${fs}px ${F}`; [...txt].forEach((ch,i)=>g.fillText(ch,W/2,H*(.5+(i-(n-1)/2)*.86/n))); }
  else { g.font=`bold ${Math.min(H*.6,W*.9/txt.length)}px ${F}`; g.fillText(txt,W/2,H*.54); } }); }
function plate(tex,w,h,x,y,z,ry=0,parent,o={}){ const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.7,...o})); p.position.set(x,y,z); p.rotation.y=ry; add(p,parent); return p; }
function halfPad(color,inset=.18,y=0,h=.09){ const R=4.2, Hh=Math.sqrt(3)*R, oz=-Hh*.24, s=new THREE.Shape(); const hw=z=>R-(z-oz)/(Hh/2)*(R/2);
  const z0=oz+inset, z1=oz+Hh/2-inset; [[-(hw(z0)-inset),z0],[hw(z0)-inset,z0],[hw(z1)-inset,z1],[-(hw(z1)-inset),z1]].forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z)); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2);
  const m=add(new THREE.Mesh(g,mat(color))); m.position.y=y; m.receiveShadow=true; return m; }
function win(x,y,z,w,h,frame=WHITE,parent){ rbox(w+.08,h+.08,.04,frame,x,y-.04,z,.01,parent); rbox(w,h,.03,glass,x,y,z+.015,.008,parent); rbox(.025,h,.04,frame,x,y,z+.03,.004,parent); }

/* ======================= 派出所 ======================= */
const PB={wall:'#f4f2ec', blue:'#2b5fa8', blueD:'#1f4680', pad:'#e2e0da'};
const pbSign=textTex('木星派出所',PB.blue,'#ffffff','#ffffff');
function policebox(){
  halfPad(PB.pad); const Y=.1, W=3.0, D=1.6, cx=.15, cz=-.6, fz=cz+D/2, gf=1.1, ff=.85;
  rbox(W,gf,D,wallMat(PB.wall,W,gf),cx,Y,cz,.03); rbox(W+.04,.18,D+.04,PB.blue,cx,Y,cz,.02);   /* 11-19 19:03：牆面加二丁掛紋路 */               // 一樓＋藍色牆腳
  // 正門：藍框玻璃門＋門口雨遮
  rbox(.86,.82,.05,PB.blue,cx,Y+.18,fz+.005,.01); rbox(.74,.74,.03,glass,cx,Y+.2,fz+.02,.006); rbox(.025,.74,.04,PB.blue,cx,Y+.2,fz+.035,.004);
  rbox(1.3,.06,.5,PB.blueD,cx,Y+1.0,fz+.24,.02); for(const sx of [-1,1]) cyl(.03,.03,.88,'#c9ced6',cx+sx*.6,Y+.12,fz+.45,8);
  for(const x of [cx-1.0,cx+1.0]) win(x,Y+.45,fz+.005,.5,.4,WHITE);
  rbox(.2,.24,.08,'#d23b30',cx+.6,Y+.5,fz+.04,.02); rbox(.22,.04,.1,'#a82a22',cx+.6,Y+.74,fz+.04,.01);   // 牆上的紅色巡邏箱
  rbox(W+.06,.12,D+.06,PB.blue,cx,Y+gf-.06,cz,.01);                                          // 一二樓中間的藍色腰帶
  // 二樓＋招牌
  const y2=Y+gf+.06; rbox(W,ff,D,wallMat(PB.wall,W,ff),cx,y2,cz,.03);
  plate(pbSign,1.9,.3,cx,y2+.2,fz+.02); for(const x of [cx-1.05,cx-.35,cx+.35,cx+1.05]) win(x,y2+.42,fz+.005,.4,.3,PB.blue);
  // 屋頂：女兒牆、紅藍警示燈（輪流閃）、天線
  const top=y2+ff; rbox(W+.08,.06,D+.08,WHITE,cx,top,cz,.01);
  for(const sz of [-1,1]) rbox(W+.08,.16,.07,PB.blue,cx,top+.06,cz+sz*(D/2),.01); for(const sx of [-1,1]) rbox(.07,.16,D,PB.blue,cx+sx*(W/2),top+.06,cz,.01);
  { const lr=em('#ff3b30',.3), lb=em('#2f7bff',.3); rbox(.7,.08,.18,'#2f3440',cx,top+.06,fz-.25,.02); rbox(.3,.12,.16,lr,cx-.17,top+.14,fz-.25,.03); rbox(.3,.12,.16,lb,cx+.17,top+.14,fz-.25,.03);
    anims.push(t=>{ const k=Math.floor(t*3)%2; lr.emissiveIntensity=k?1.2:.15; lb.emissiveIntensity=k?.15:1.2; }); }
  cyl(.02,.02,.8,'#9aa0ab',cx+1.1,top+.06,cz-.4,6); sphere(.04,'#ff3b30',cx+1.1,top+.88,cz-.4,{emissive:0xff3b30,emissiveIntensity:.5});
  // 門口：警車、市旗、長椅、花台
  kit('models/car3/police.glb',cx-2.05,fz+.55,{d:.95,rot:Math.PI/2,y0:Y});
  flag(cx+1.75,fz+.45,1.7,'city',Y);
  bench(cx+1.0,fz+.95,0); for(const x of [cx-.75,cx+.75]){ cyl(.16,.14,.2,'#c9ced6',x,Y,fz+.45,12); bush(x,fz+.45,.4,'#ffd166'); }
  for(const [x,z,k,c] of [[-3.1,-1.15,.6],[3.2,-1.15,.55,'#6fc463']]) tree(x,z,k,c);
}

/* ======================= 台灣傳統廟 ======================= */
const TP={red:'#c62f25', redD:'#9c241c', roof:'#e3912c', roofD:'#c27420', green:'#2f9a6b', gold:'#f2c14e', stone:'#c9c2b4', stoneD:'#a99f8f', pad:'#ddd3c0'};
const tpPlaque=textTex('木星宮','#1f2a44',TP.gold,TP.gold,256,560,true);
/* ===== 廟的屋頂（家長 11-19 10:02：原本屋簷不好看 → 重做）=====
   內凹弧線的兩坡瓦頂、四個簷角往上翹；一排排細筒瓦＋簷口綠色瓦當；
   屋脊有彩色剪黏飾帶、兩端分叉上翹的燕尾、中間雙龍搶珠；垂脊尾端放仙人騎鳳（家長下載的模型） */
const tileColTex=(()=>{ const c=document.createElement('canvas'); c.width=128; c.height=128; const g=c.getContext('2d');
  g.fillStyle='#b8611c'; g.fillRect(0,0,128,128);
  for(let i=0;i<4;i++){ const x=i*32; const gr=g.createLinearGradient(x,0,x+32,0); gr.addColorStop(0,'#c86d22'); gr.addColorStop(.35,'#f2a54a'); gr.addColorStop(.6,'#e48c33'); gr.addColorStop(1,'#a55418');
    g.fillStyle=gr; g.fillRect(x+3,0,22,128); g.fillStyle='rgba(90,40,10,.55)'; g.fillRect(x+25,0,7,128);
    for(let y=0;y<128;y+=32){ g.fillStyle='rgba(80,35,8,.45)'; g.fillRect(x+3,y,22,2); } }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t; })();
const roofTileM=new THREE.MeshStandardMaterial({map:tileColTex,roughness:.6,side:THREE.DoubleSide});
const jianTex=rectTex(512,64,(g,W,H)=>{ g.fillStyle='#2f9a6b'; g.fillRect(0,0,W,H); g.fillStyle='#f2c14e'; g.fillRect(0,0,W,5); g.fillRect(0,H-5,W,5);   // 剪黏飾帶：綠底金邊＋彩色花朵、捲草
  const C=['#e5484d','#ffd23a','#5b8fe0','#ffffff','#ff8fa3','#9b6ad1']; for(let i=0;i<16;i++){ const x=16+i*32;
    g.strokeStyle='#f2c14e'; g.lineWidth=3; g.beginPath(); g.arc(x,H/2,12,Math.PI*.2,Math.PI*1.4); g.stroke();
    for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; g.fillStyle=C[(i+k)%6]; g.beginPath(); g.arc(x+Math.cos(a)*7,H/2+Math.sin(a)*7,5,0,7); g.fill(); }
    g.fillStyle='#ffd23a'; g.beginPath(); g.arc(x,H/2,4,0,7); g.fill(); } });
const caiTex=rectTex(512,64,(g,W,H)=>{ g.fillStyle='#1f5aa6'; g.fillRect(0,0,W,H); g.fillStyle='#2f9a6b'; g.fillRect(0,8,W,H-16);   // 樑上彩繪：藍綠底＋金框＋中間包巾
  g.strokeStyle='#f2c14e'; g.lineWidth=3; g.strokeRect(3,3,W-6,H-6); g.fillStyle='#c62f25'; g.beginPath(); g.moveTo(W/2-70,8); g.lineTo(W/2+70,8); g.lineTo(W/2+40,H-8); g.lineTo(W/2-40,H-8); g.closePath(); g.fill();
  g.strokeStyle='#f2c14e'; g.stroke(); for(const x of [60,W-60]){ g.fillStyle='#ffffff'; g.beginPath(); g.arc(x,H/2,14,0,7); g.fill(); g.fillStyle='#e5484d'; g.beginPath(); g.arc(x,H/2,8,0,7); g.fill(); } });
function roofSurface(w,d,h,U){ const NX=28, NT=10, hw=w/2, hd=d/2, pos=[], uv=[], idx=[];
  const Y=(x,t)=>h*Math.pow(1-t,1.7)+U*Math.pow(Math.abs(x)/hw,4)*t*t;
  for(const s of [1,-1]){ const base=pos.length/3;
    for(let j=0;j<=NT;j++) for(let i=0;i<=NX;i++){ const t=j/NT, x=-hw+w*i/NX; pos.push(x,Y(x,t),s*hd*t); uv.push(x*7,t*d*3.2); }
    for(let j=0;j<NT;j++) for(let i=0;i<NX;i++){ const a=base+j*(NX+1)+i, b=a+1, c=a+NX+1, e=c+1; if(s>0) idx.push(a,c,b,b,c,e); else idx.push(a,b,c,b,e,c); } }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.setIndex(idx); geo.computeVertexNormals(); return {geo,Y}; }
function dragon(side,h,len,parent){ const pts=[]; for(let i=0;i<=8;i++){ const t=i/8; pts.push(new THREE.Vector3(side*(.13+t*len),h+.12+Math.sin(t*Math.PI*2.2)*.06,Math.sin(t*Math.PI*3)*.02)); }
  const cur=new THREE.CatmullRomCurve3(pts), body=add(new THREE.Mesh(new THREE.TubeGeometry(cur,32,.028,8),mat('#2f9a6b',{roughness:.5})),parent);
  for(let i=1;i<8;i++){ const p=cur.getPoint(i/8); const f=add(new THREE.Mesh(new THREE.ConeGeometry(.012,.04,4),mat('#f2c14e')),parent); f.position.set(p.x,p.y+.03,p.z); }   // 背鰭
  const hp=cur.getPoint(0), hd=sphere(.045,mat('#2f9a6b',{roughness:.5}),hp.x,hp.y+.01,hp.z,{},parent); hd.scale.set(1.3,.9,.9);
  const sn=rbox(.05,.03,.035,'#2f9a6b',hp.x-side*.05,hp.y-.01,hp.z,.01,parent);
  for(const zz of [-.02,.02]){ const hn=add(new THREE.Mesh(new THREE.ConeGeometry(.01,.07,4),mat('#f2c14e')),parent); hn.position.set(hp.x+side*.02,hp.y+.06,hp.z+zz); hn.rotation.z=side*.5;
    sphere(.009,'#ffffff',hp.x-side*.03,hp.y+.025,hp.z+zz*1.6,{},parent); }
  const tl=cur.getPoint(1); const tf=add(new THREE.Mesh(new THREE.ConeGeometry(.03,.08,5),mat('#f2c14e')),parent); tf.position.set(tl.x+side*.03,tl.y+.02,tl.z); tf.rotation.z=-side*1.2; }
function templeRoof(w,d,h,x,y,z,parent,{phoenix=true}={}){ const g=grp(x,y,z,0,parent), hw=w/2, hd=d/2, U=Math.min(.22,h*.45);
  const {geo,Y}=roofSurface(w,d,h,U); const r=add(new THREE.Mesh(geo,roofTileM),g); r.castShadow=true;
  // 兩側山牆（紅色）＋金色邊
  for(const sx of [-1,1]){ const sh=new THREE.Shape(); for(let j=0;j<=10;j++){ const t=j/10; const xx=-hd*t, yy=Y(hw*.97,t); j?sh.lineTo(xx,yy):sh.moveTo(xx,yy); } for(let j=10;j>=0;j--){ const t=j/10; sh.lineTo(hd*t,Y(hw*.97,t)); }
    const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),mat(TP.red,{side:THREE.DoubleSide})); m.rotation.y=Math.PI/2; m.position.x=sx*hw*.96; m.scale.set(.96,.96,1); g.add(m);
    // 垂脊：沿著山牆邊、尾端往上捲，放仙人騎鳳
    for(const sz of [-1,1]){ const pts=[]; for(let j=0;j<=10;j++){ const t=j/10; pts.push(new THREE.Vector3(sx*hw*(.97+.03*t),Y(hw,t)+.035,sz*hd*t)); }
      const last=pts[10]; pts.push(new THREE.Vector3(last.x+sx*.04,last.y+.1,last.z+sz*.05));
      add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.025,6),mat('#9c3f22',{roughness:.5})),g);
      if(phoenix) kit('models/sk/tp_phoenix.glb',last.x-sx*.08,last.z-sz*.12,{h:.12,y0:last.y-.02,rot:sz>0?0:Math.PI,parent:g,then:unmetal}); } }
  // 簷口瓦當（綠色小圓片）
  { const n=Math.floor(w/.075), im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.022,.022,.025,10),mat('#3f9a6b',{roughness:.4}),n*2), o=new THREE.Object3D(); let k=0;
    for(const sz of [-1,1]) for(let i=0;i<n;i++){ const xx=-hw+.04+i*(w-.08)/(n-1); o.position.set(xx,Y(xx,1)-.005,sz*(hd+.005)); o.rotation.set(Math.PI/2,0,0); o.updateMatrix(); im.setMatrixAt(k++,o.matrix); } g.add(im); }
  // 屋脊＋剪黏飾帶
  rbox(w*.9,.11,.12,'#9c3f22',0,h-.03,0,.02,g);
  for(const sz of [-1,1]) plate(jianTex,w*.86,.07,0,h+.025,sz*.062,sz>0?0:Math.PI,g);
  // 燕尾：屋脊兩端分叉往上翹
  for(const sx of [-1,1]) for(const zz of [-1,1]){ const pts=[new THREE.Vector3(sx*w*.43,h+.04,0),new THREE.Vector3(sx*(hw-.02),h+.06,zz*.02),new THREE.Vector3(sx*(hw+.07),h+.13,zz*.045),new THREE.Vector3(sx*(hw+.11),h+.24,zz*.06)];
    add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,.026,6),mat('#9c3f22',{roughness:.5})),g);
    const tip=add(new THREE.Mesh(new THREE.ConeGeometry(.03,.09,6),mat('#9c3f22')),g); tip.position.set(sx*(hw+.12),h+.28,zz*.06); tip.rotation.z=-sx*.5; }
  // 雙龍搶珠
  const ln=Math.min(.42,w*.2); dragon(-1,h,ln,g); dragon(1,h,ln,g);
  sphere(.065,em('#ff4a3a',.6),0,h+.2,0,{},g); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; const f=add(new THREE.Mesh(new THREE.ConeGeometry(.02,.08,4),em('#ffb02e',.5)),g); f.position.set(Math.cos(a)*.07,h+.2+Math.sin(a)*.07,0); f.rotation.z=a-Math.PI/2; }
  cyl(.035,.05,.12,TP.gold,0,h+.02,0,8,g);
  return g; }
/* 網路模型預設是「金屬」材質，沒有環境光時會很暗 → 關掉金屬感 */
function unmetal(o){ o.traverse(m=>{ if(!m.isMesh) return; if(!m.geometry.attributes.normal) m.geometry.computeVertexNormals(); const f=mm=>{ if(mm.isMeshBasicMaterial) return new THREE.MeshStandardMaterial({map:mm.map,color:mm.color,roughness:.55,side:mm.side});   /* 不受光的掃描模型換成會受光的材質 */ const c=mm.clone(); c.metalness=0; c.roughness=Math.max(.55,c.roughness||0); c.transparent=false; c.opacity=1; c.alphaTest=0; c.depthWrite=true; if('transmission' in c) c.transmission=0; return c; }; m.material=Array.isArray(m.material)?m.material.map(f):f(m.material); }); }
/* 簷下斗栱：一組一組紅、綠、藍三層的木頭托架，上面有金色小方塊 */
function dougong(w,y,z,parent){ for(let x=-w/2+.15;x<=w/2-.14;x+=.28){ rbox(.07,.05,.07,'#c62f25',x,y,z,.006,parent); rbox(.15,.04,.08,'#2f9a6b',x,y+.05,z+.01,.006,parent); rbox(.23,.04,.09,'#1f5aa6',x,y+.09,z+.02,.006,parent);
  for(const dx of [-.09,0,.09]) rbox(.04,.03,.04,'#f2c14e',x+dx,y+.13,z+.03,.004,parent); } }
function gableGeomX(w,d,h){ const g=new THREE.BufferGeometry(), hw=w/2, hd=d/2;   // 屋脊沿著 x（前後兩坡）
  const v=[[-hw,0,-hd],[hw,0,-hd],[hw,0,hd],[-hw,0,hd],[-hw*.98,h,0],[hw*.98,h,0]], tri=[[3,2,5],[3,5,4],[1,0,4],[1,4,5],[0,3,4],[2,1,5],[0,1,2],[0,2,3]], pos=[];
  for(const t of tri) for(const i of t) pos.push(...v[i]); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.computeVertexNormals(); return g; }
function lantern(x,y,z,s=1,parent){ cyl(.012,.012,.12*s,'#3b3550',x,y,z,4,parent); const b=sphere(.1*s,em('#e8322a',.35),x,y-.04*s,z,{},parent); b.scale.y=1.2;
  cyl(.06*s,.06*s,.03*s,TP.gold,x,y+.06*s,z,10,parent); cyl(.06*s,.06*s,.03*s,TP.gold,x,y-.18*s,z,10,parent); for(let i=0;i<3;i++) cyl(.008,.008,.08*s,TP.gold,x-.03*s+i*.03*s,y-.27*s,z,4,parent); }
/* 石獅（家長 11-19 00:05：用資源包）：Sketchfab「Old Chinese Guardian Lion」（CC-BY-4.0，作者 dlfitch；25 萬面減成 2 萬面、貼圖 512）
   左右一對，頭稍微朝外 */
function lion(x,z,ry,s=1,parent){ const g=grp(x,.09,z,ry,parent); kit('models/sk/lion2.glb',0,0,{h:.66*s,rot:(x<0?.25:-.25),parent:g,then:o=>{ unmetal(o); o.traverse(m=>{ if(m.isMesh) m.material=new THREE.MeshStandardMaterial({color:'#cfc8bb',roughness:.85,normalMap:null}); }); }}); }   /* 家長 10:51：太深 → 淺灰石色（拿掉深綠貼圖，改成淺灰石材） */   // 11-19 換成 Stone lion（CC-BY-NC，表面比較平滑）
/* 香爐（家長下載的 Bronze Dragon Incense Urn，CC-BY-4.0；21 萬面減到 1 萬）＋三炷香冒煙 */
function censer(x,z,s=1,parent){ const g=grp(x,.09,z,0,parent); kit('models/sk/tp_urn.glb',0,0,{h:.42*s,parent:g,then:o=>{ unmetal(o); o.traverse(m=>{ if(m.isMesh){ m.material.color.setRGB(.62,.5,.36); m.material.roughness=.7; } }); }});   // 家長 10:51：太亮 → 調成暗銅色
  puff(x,.62*s,z,{r:.06*s,rise:.9*s,drift:.06,n:4,op:.45,speed:.25},parent); }

/* ===== 水泥質感＋龍柱（家長 11-19 19:05：「這個龍柱感覺龍盤旋在上面沒有在下面」「廟的柱子希望有水泥的感覺」）
   原本下載的 Dragon Pillar 模型，龍只盤在柱子上半段，下半段是空的；改成自己畫：
   水泥柱身（洗石子顆粒貼圖）＋ 從柱底一路盤到柱頂的龍身（沿線漸縮的管）＋ 龍頭咬龍珠 ＋ 兩對爪子 ＋ 祥雲 */
const cemTex=canvasTex((g,s)=>{ g.fillStyle='#cdc6b8'; g.fillRect(0,0,s,s);
  for(let i=0;i<2400;i++){ const r=Math.random()*2.1+.5; g.fillStyle=`rgba(${118+Math.random()*92|0},${112+Math.random()*88|0},${98+Math.random()*82|0},${.06+Math.random()*.15})`; g.beginPath(); g.arc(Math.random()*s,Math.random()*s,r,0,7); g.fill(); }
  g.strokeStyle='rgba(118,110,96,.16)'; g.lineWidth=2; for(let i=1;i<4;i++){ g.beginPath(); g.moveTo(0,i*s/4); g.lineTo(s,i*s/4); g.stroke(); } },256);
const cem=(rx=1,ry=2)=>texMat('cement',cemTex,rx,ry);
/* 把模型的貼圖轉成灰白（家長：廟的柱子要水泥的感覺） */
const _grey={};
function greyMap(t,bright=1.22){ if(!t||!t.image) return t; const k=t.uuid+bright; if(_grey[k]) return _grey[k];
  const im=t.image, c=document.createElement('canvas'); c.width=im.width||512; c.height=im.height||512; const g=c.getContext('2d');
  g.filter=`grayscale(1) brightness(${bright}) contrast(.9)`; try{ g.drawImage(im,0,0,c.width,c.height); }catch(e){ return t; }
  const n=new THREE.CanvasTexture(c); n.colorSpace=t.colorSpace; n.wrapS=t.wrapS; n.wrapT=t.wrapT; n.flipY=t.flipY; n.needsUpdate=true; n.anisotropy=4; return _grey[k]=n; }
/* 龍柱（家長 11-19 22:23：不要自己畫，用原本下載的 Dragon Pillar 模型，把上半段的龍身切一圈下來補到中間、下面）
   作法：載好之後量出「乾淨的一圈龍身」（不含龍頭、不含柱身），整圈複製往下平移 + 繞柱子轉同樣的角度（螺旋平移對稱），
         所以接得起來；下面那一圈略縮一點點，看起來像尾巴變細。 */
function dragonFill(o){
  o.updateMatrixWorld(true);
  const inv=new THREE.Matrix4().copy(o.matrixWorld).invert(), M=new THREE.Matrix4(), v=new THREE.Vector3();
  const tri=[], tuv=[];                            // 每個三角形：9 個座標（o 的本地座標）＋ 6 個 uv
  let mat0=null;
  o.traverse(m=>{ if(!m.isMesh) return; if(!mat0) mat0=m.material;
    M.multiplyMatrices(inv,m.matrixWorld); let gm=m.geometry; if(gm.index) gm=gm.toNonIndexed();
    const pa=gm.attributes.position, ua=gm.attributes.uv;
    for(let i=0;i<pa.count;i+=3){ const t=[], u=[];
      for(let k=0;k<3;k++){ v.fromBufferAttribute(pa,i+k).applyMatrix4(M); t.push(v.x,v.y,v.z); if(ua) u.push(ua.getX(i+k),ua.getY(i+k)); else u.push(0,0); } tri.push(t); tuv.push(u); } });
  if(!tri.length) return;
  let y0=1e9,y1=-1e9,cx=0,cz=0,n=0;
  for(const t of tri) for(let k=0;k<3;k++){ const x=t[k*3],y=t[k*3+1],z=t[k*3+2]; if(y<y0)y0=y; if(y>y1)y1=y; cx+=x; cz+=z; n++; }
  cx/=n; cz/=n; const H=y1-y0, RM=.27*H*(1.781/5.594);            // 比柱身粗的才算龍身
  const T0=.465, T1=.685;                                          // 乾淨的一圈（0.47~0.69 是純龍身，0.7 以上開始有頭和手）
  const keep=[], ang=(y,w)=>{ let sx=0,sz2=0; for(const t of tri){ for(let k=0;k<3;k++){ const yy=(t[k*3+1]-y0)/H; if(Math.abs(yy-y)>w) continue;
      const dx=t[k*3]-cx, dz=t[k*3+2]-cz; if(Math.hypot(dx,dz)<RM) continue; const a=Math.atan2(dz,dx); sx+=Math.cos(a); sz2+=Math.sin(a); } } return Math.atan2(sz2,sx); };
  const keepU=[];
  tri.forEach((t,i)=>{ let my=0,mr=0; for(let k=0;k<3;k++){ my+=(t[k*3+1]-y0)/H/3; mr=Math.max(mr,Math.hypot(t[k*3]-cx,t[k*3+2]-cz)); }
    if(my>=T0&&my<=T1&&mr>=RM){ keep.push(t); keepU.push(tuv[i]); } });
  if(keep.length<20) return;
  const dy=(T1-T0)*H, dth=ang(T1,.02)-ang(T0,.02);                 // 一圈的高度差和轉角
  const pos=new Float32Array(keep.length*9); keep.forEach((t,i)=>pos.set(t,i*9));
  const uvs=new Float32Array(keep.length*6); keepU.forEach((u,i)=>uvs.set(u,i*6));
  for(const [s,shrink] of [[1,.95]]){
    const gm=new THREE.BufferGeometry(); gm.setAttribute('position',new THREE.Float32BufferAttribute(pos.slice(),3)); gm.setAttribute('uv',new THREE.Float32BufferAttribute(uvs.slice(),2));
    gm.translate(-cx,0,-cz); gm.computeVertexNormals();
    const mesh=new THREE.Mesh(gm,mat0); mesh.castShadow=mesh.receiveShadow=true;
    const g=new THREE.Group(); g.add(mesh); g.position.set(cx,-dy*s,cz); g.rotation.y=dth*s; g.scale.set(shrink,1,shrink); o.add(g); }
}
/* 一間小廟殿：w 寬、d 深、高 h；正面兩根紅柱、三扇門（中間大門畫門神色塊）、匾額 */
function hall(cx,cz,w,d,h,parent,{plaque=true,roofH=null,double=false}={}){ const g=grp(cx,0,cz,0,parent);
  rbox(w+.3,.18,d+.35,cem(Math.max(2,Math.round(w)),1),0,0,.05,.02,g); for(let i=0;i<2;i++) rbox(.8,.06,.14,cem(2,1),0,.0+i*.06,d/2+.2+.12*(1-i),.01,g);   // 台基、台階
  rbox(w,h,d,texMat('tpwall',stoneTex(TP.red,'rgba(60,0,0,.35)'),Math.max(1,Math.round(w*2)),Math.max(1,Math.round(h*2))),0,.18,0,.03,g);   // 紅牆有磚紋（家長 11-18 23:28）
  const fz=d/2; rbox(w*.36,h*.72,.04,TP.redD,0,.18,fz+.005,.01,g);                           // 中門
  for(const s of [-1,1]){ rbox(w*.15,h*.6,.04,TP.redD,s*w*.32,.18,fz+.005,.01,g); rbox(w*.1,h*.36,.03,'#2a8fb0',s*.09*w,.3,fz+.03,.01,g); }   // 側門、門神（藍綠色塊）
  for(let i=0;i<5;i++) sphere(.03,TP.gold,-.1*w+i*.05*w,.18+h*.36,fz+.03,{},g);              // 門釘
  for(const s of [-1,1]) kit('models/sk/tp_pillar.glb',s*(w/2-.1),fz+.2,{h:h+.02,y0:.18,parent:g,then:o=>{ unmetal(o); o.traverse(m=>{ if(m.isMesh){ m.material=m.material.clone(); m.material.map=greyMap(m.material.map); m.material.color.setRGB(1.25,1.23,1.18); m.material.roughness=.95; } }); dragonFill(o); }});   /* 龍柱：家長下載的 Dragon Pillar；11-19 22:23 把上半段的龍身複製一圈補到中下段 */
  rbox(w+.1,.12,.3,TP.green,0,.18+h,fz+.08,.02,g); plate(caiTex,w+.08,.11,0,.18+h+.06,fz+.235,0,g); rbox(w+.12,.03,.32,TP.gold,0,.18+h-.02,fz+.08,.01,g);   // 簷下彩繪樑
  dougong(w+.1,.18+h+.12,fz+.12,g);                                                           // 斗栱
  for(const s of [-1,1]) kit('models/sk/tp_relief.glb',s*w*.32,fz+.025,{w:.28,y0:.18+h*.66,parent:g,then:unmetal});   // 石雕龍（龍堵）
  if(plaque) plate(tpPlaque,.2,.44,0,.18+h*.82,fz+.24,0,g);
  templeRoof(w+.45,d+.6,(roofH||h*.55),0,.18+h+.24,0,g).position.z=.08;
  if(double){ const ry=.18+h+.24+(roofH||h*.55)*.62; rbox(w*.55,.32,d*.35,TP.red,0,ry-.1,.04,.02,g); plate(caiTex,w*.55,.08,0,ry+.06,.04+d*.175+.005,0,g); templeRoof(w*.78,d*.55,(roofH||h*.55)*.75,0,ry+.2,.04,g); }   // 重簷
  for(const s of [-1,1]) lantern(s*(w/2-.22),.18+h-.02,fz+.3,1,g);
  return g; }
function temple(lv){
  if(lv<2){ halfPad(TP.pad);
    hall(0,-.55,2.0,1.4,1.0,null);
    censer(0,1.0,1); for(const s of [-1,1]) lion(s*1.5,1.15,0,.9);   /* 11-19 22:2x：石獅原本壓在龍柱上，往外往前移開 */
    for(const s of [-1,1]) cyl(.025,.025,1.5,'#7a5a3a',s*1.5,.1,.95,6); { const pts=[]; }   // 兩根竹竿掛燈籠串
    for(let i=0;i<5;i++){ const x=-1.2+i*.6; lantern(x,1.48-Math.sin(i/4*Math.PI)*.18,.95,.75); } rbox(3.0,.012,.012,'#3b3550',0,1.6,.95,.002);
    for(const [x,z,k,c] of [[-2.9,-1.15,.65],[2.9,-1.15,.6,'#4fa86a'],[-2.1,.6,.45,'#6fc463']]) tree(x,z,k,c);
    bush(1.9,.75,.5,'#ff8fa3'); return; }
  // Lv2：長大佔一整格（三川門＋廣場＋大香爐＋兩層屋頂正殿＋兩側廂房）
  const G=grp(0,0,OZ); const prev=ROOT;
  hexPad(TP.pad,.42,.09,0).position.z=OZ;
  rbox(4.6,.03,2.6,'#e6dccb',0,.11,OZ+.3,.01);   /* 11-19 18:59：石板原本和地基同高會閃，抬高一點 */                                                // 廣場石板
  hall(0,-1.85,2.4,1.3,1.15,G,{double:true});                                                 // 正殿（兩層屋頂）
  for(const s of [-1,1]){ const w=hall(s*2.5,-.15,1.3,.9,.8,G,{plaque:false}); w.rotation.y=-s*Math.PI/2; }   // 兩側廂房（正面朝廣場）
  // 三川門（前面的大門）：三個門洞的牌樓
  { const g=grp(0,0,2.25,0,G); for(const x of [-1.35,-.45,.45,1.35]) cyl(.08,.09,1.15,TP.red,x,.09,0,12,g);
    rbox(3.0,.18,.3,TP.green,0,1.24,0,.02,g); rbox(3.02,.06,.32,TP.gold,0,1.2,0,.01,g); plate(textTex('木星宮',TP.red,TP.gold,TP.gold,512,160),.9,.28,0,1.0,.17,0,g);
    templeRoof(3.1,.7,.42,0,1.42,0,g); templeRoof(1.1,.5,.28,0,1.9,0,g); for(const s of [-1,1]) lion(s*1.75,.15,0,1.0,g); }
  censer(0,.35+OZ+.5,1.6);
  // 一串紅燈籠：大門到正殿兩邊各一排
  for(const s of [-1,1]){ for(let i=0;i<4;i++) lantern(s*1.25,1.35-(i%2)*.08,OZ+1.9-i*.7,.85); }
  for(const s of [-1,1]) for(const zz of [OZ+1.9,OZ-.2]) cyl(.025,.025,1.45,'#7a5a3a',s*1.25,.09,zz,6);
  for(const s of [-1,1]) rbox(.012,.012,2.1,'#3b3550',s*1.25,1.5,OZ+.85,.002);
  // 大榕樹＋小樹
  { const bx=-2.6, bz=OZ+1.75; cyl(.16,.24,.9,'#8a6a4a',bx,.09,bz,10); for(const [dx,dy,dz,r] of [[0,1.25,0,.7],[.45,1.1,.25,.5],[-.4,1.15,-.2,.55],[.1,1.55,-.1,.5]]){ const f=add(new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),mat('#3f9a54',{flatShading:true}))); f.position.set(bx+dx,dy,bz+dz); }
    for(let i=0;i<4;i++) cyl(.015,.015,.6,'#8a6a4a',bx-.4+i*.25,.5,bz+.3,4); }
  kit('models/sk/tp_bixi.glb',2.55,OZ+1.55,{h:.85,rot:-.6,y0:.09,then:unmetal}); bush(2.2,OZ+2.25,.45,'#ff8fa3');   // 贔屭碑（家長下載的 BiXi，CC-BY-4.0）
}

/* ======================= 文具店 ======================= */
const ST={wall:'#e7dcc6', wall2:'#d2c4a8',   /* 11-19 23:2x：原本是淺黃色，家長規定不用淺黃 → 改柔和米色 */ blue:'#3f7fd0', red:'#e5484d', pad:'#e8e0cf'};
const stSign=textTex('木星文具店','#ffffff',ST.red,ST.blue);
function pencil(x,y,z,len,rz,parent){ const g=grp(x,y,z,0,parent); g.rotation.z=rz;
  const b=cyl(.11,.11,len,'#f2c230',0,0,0,6,g); b.material=mat('#f2c230',{flatShading:true});
  cyl(.115,.115,.1,'#c9ced6',0,len,0,12,g); cyl(.11,.11,.16,'#f38fb0',0,len+.1,0,12,g);   // 金屬圈、粉紅橡皮擦
  const tip=add(new THREE.Mesh(new THREE.ConeGeometry(.11,.3,6),mat('#e9c99a',{flatShading:true})),g); tip.position.y=-.15; tip.rotation.x=Math.PI;
  const lead=add(new THREE.Mesh(new THREE.ConeGeometry(.035,.1,6),mat('#3b3550')),g); lead.position.y=-.27; lead.rotation.x=Math.PI; return g; }
function gacha(x,z,c,parent){ const g=grp(x,0,z,0,parent); rbox(.34,.42,.3,c,0,.1,0,.03,g); rbox(.1,.06,.04,'#ffffff',0,.3,.16,.01,g); sphere(.03,'#c9ced6',.08,.33,.17,{},g);
  const dome=rbox(.32,.36,.28,mat('#e8f6ff',{transparent:true,opacity:.45,roughness:.1}),0,.52,0,.06,g);
  ['#ff6b6b','#ffd166','#6fd3ff','#9be38a','#c79bff','#ff9ed2'].forEach((cc,i)=>sphere(.055,cc,-.08+(i%3)*.08,.6+Math.floor(i/3)*.09,(i%2?.04:-.04),{},g));
  rbox(.36,.05,.32,c,0,.88,0,.02,g); }
function stationery(){
  halfPad(ST.pad); const Y=.1, W=2.6, D=1.5, cx=-.2, cz=-.6, fz=cz+D/2, gf=1.05, arc=.45, ff=.8;
  // 一樓：退後的店面（騎樓），裡面彩色貨架
  rbox(W,.05,D,'#d9cdb3',cx,Y,cz,.01); rbox(W-.04,gf,D-arc,wallMat(ST.wall,W,gf),cx,Y,cz-arc/2,.02);   /* 11-19 19:03：牆面加紋路 */
  const sf=fz-arc; rbox(W-.3,.82,.02,'#f8f4ea',cx,Y+.05,sf+.005,.004);
  for(let r=0;r<3;r++) for(let i=0;i<9;i++) rbox(.2,.18,.06,['#ff6b6b','#ffd166','#6fd3ff','#9be38a','#c79bff','#ff9ed2','#ffa94d','#4dabf7','#69db7c'][(i+r*2)%9],cx-1.0+i*.25,Y+.1+r*.24,sf+.04,.02);   // 貨架上一格一格的文具
  for(const sx of [-1,1]) rbox(.14,gf,.14,ST.wall2,cx+sx*(W/2-.07),Y,fz-.07,.01);           // 騎樓柱
  // 騎樓下：展示台（筆記本、蠟筆）＋扭蛋機
  { const tx=cx-.45, tz=fz-.2; rbox(1.0,.4,.36,'#a8703f',tx,Y,tz,.02);
    ['#ff6b6b','#4dabf7','#69db7c','#ffd166','#c79bff'].forEach((c,i)=>{ const m=rbox(.15,.03+i*.008,.22,c,tx-.38+i*.19,Y+.4,tz,.01); m.rotation.y=(i%2?.12:-.1); });
    for(let i=0;i<6;i++) cyl(.02,.02,.14,['#ff6b6b','#ffd166','#6fd3ff','#9be38a','#c79bff','#ffa94d'][i],tx+.25+(i%3)*.06,Y+.4,tz+.1-(i>2?.08:0),6); }
  gacha(cx+.65,fz-.2,ST.red); gacha(cx+1.05,fz-.2,ST.blue);
  // 騎樓上方招牌＋二樓
  const y2=Y+gf; rbox(W+.04,.08,D+.04,ST.wall2,cx,y2-.04,cz,.01);
  rbox(W,ff,D,wallMat(ST.wall,W,ff),cx,y2+.04,cz,.03); plate(stSign,2.1,.34,cx,y2+.24,fz+.03);
  for(const x of [cx-.75,cx+.05,cx+.85]) win(x,y2+.47,fz+.005,.42,.28,'#ffffff');
  // 二樓陽台小花盆、屋頂女兒牆＋大鉛筆
  const top=y2+.04+ff; rbox(W+.08,.06,D+.08,'#ffffff',cx,top,cz,.01);
  for(const sz of [-1,1]) rbox(W+.08,.14,.07,ST.blue,cx,top+.06,cz+sz*(D/2),.01); for(const sx of [-1,1]) rbox(.07,.14,D,ST.blue,cx+sx*(W/2),top+.06,cz,.01);
  pencil(cx+.9,top+.5,cz+.1,1.5,Math.PI/2);                                                   // 屋頂橫躺的大鉛筆（架在兩個支架上）
  for(const x of [cx+.45,cx-.45]){ rbox(.08,.34,.08,'#9aa0ab',x,top+.06,cz+.1,.01); rbox(.26,.05,.12,'#9aa0ab',x,top+.36,cz+.1,.01); }
  // 門口：腳踏車停車架、長椅、花、樹
  for(let i=0;i<3;i++){ const r=add(new THREE.Mesh(new THREE.TorusGeometry(.14,.02,6,14,Math.PI),mat('#9aa0ab'))); r.position.set(cx-1.55+i*.22,Y,fz+.45); r.rotation.y=Math.PI/2; }
  bench(cx+1.75,fz+.6,0); bush(cx-1.0,fz+.65,.4,'#ffd166'); bush(cx+.6,fz+.7,.4,'#ff8fa3');
  for(const [x,z,k,c] of [[-3.1,-1.15,.6],[3.05,-1.15,.55,'#6fc463']]) tree(x,z,k,c);
}

export const POLICE_LV=[['policebox','派出所 Lv1',policebox,'half']], POLICE_TOP=[0,3.2];
export const TEMPLE_LV=[['temple','台灣傳統廟 Lv1',()=>temple(1),'half'],['temple2','台灣傳統廟 Lv2',()=>temple(2),'whole']], TEMPLE_TOP=[0,2.6,3.8];
export const STATIONERY_LV=[['stationery','文具店 Lv1',stationery,'half']], STATIONERY_TOP=[0,3.6];
