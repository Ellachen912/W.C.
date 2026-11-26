/* Winston City 第二階段：果園、茶園（農業區，整格，各 2 級；家長 2026-11-18 14:19 定 2 級、16:03「繼續做」）
   果園 Lv1 小果園：三排橘子樹（樹上掛橘子）、木頭水果攤（一箱箱橘子＝Food Pack Orange）、靠在樹上的木梯、竹籃、小工具棚
   果園 Lv2 觀光果園：加一排蘋果樹、一排香蕉樹（香蕉串＝Food Pack Banana）、採果小路、木頭拱門招牌「木星果園」、果汁攤（遮陽傘）、
                     小拖拉機（Kenney tractor）拉著水果車在樹之間慢慢來回；橘子偶爾從樹上掉進籃子
   茶園 Lv1 小茶園：三層梯田、一排排圓圓的茶樹、石階小路、竹編茶簍、採茶小木屋、招牌「木星茶園」
   茶園 Lv2 觀光茶園：梯田多一層、加一間紅柱黑瓦的奉茶亭（桌上有茶壺茶杯，會冒熱氣）、竹架上曬茶葉的圓竹盤、小水池
   一般的裝飾樹照舊用程式畫（家長 11-18 15:27）；果樹＝程式畫的樹＋Food Pack 的水果。
   座標：格子中心為原點、正門朝 +z；平頂六角形，可用範圍約 x ±3.3、z ±2.9。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, prism, tree, bush, hexPad, anims, puff } from './lib.js';
import { kit, FOOD } from './s1_kit.js';

const SOIL='#b9946a', GRASS='#9fd67a', WOOD='#a8703f', WOODD='#7a5236', ORANGE='#ff9a1f', LEAF='#3f9a54', LEAF2='#58b06a';
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function textTex(txt,bg,fg){ return rectTex(1024,220,(g,W,H)=>{ g.fillStyle=bg; g.fillRect(0,0,W,H); g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle'; g.font=`bold ${Math.min(H*.62,W*.9/txt.length)}px "PingFang TC","Noto Sans CJK TC","Noto Sans TC",sans-serif`; g.fillText(txt,W/2,H*.55); }); }
function plate(tex,w,h,x,y,z,ry=0,parent){ const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.8})); p.position.set(x,y,z); p.rotation.y=ry; add(p,parent); return p; }
const sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);

/* ======================= 果園 ======================= */
/* 果樹：咖啡色樹幹＋圓圓的深綠樹冠＋外面一圈水果（程式畫的小球，比較輕） */
function fruitTree(x,z,fruit=ORANGE,s=1){ cyl(.06*s,.09*s,.5*s,'#8a6a4a',x,.09,z,8);
  const c=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.42*s,1),mat(LEAF,{flatShading:true}))); c.position.set(x,.09+.78*s,z); c.scale.set(1,.85,1);
  const c2=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.28*s,1),mat(LEAF2,{flatShading:true}))); c2.position.set(x+.12*s,.09+1.02*s,z+.05*s);
  const fm=mat(fruit,{roughness:.5}); for(let i=0;i<7;i++){ const a=i/7*Math.PI*2+x, yy=.62+(i%3)*.13; const f=new THREE.Mesh(new THREE.SphereGeometry(.065*s,10,8),fm); f.position.set(x+Math.cos(a)*.39*s,.09+yy*s,z+Math.sin(a)*.37*s); add(f); } }
/* 香蕉樹：細樹幹＋大片垂下的葉子＋一串香蕉（Food Pack Banana） */
function bananaTree(x,z,s=1){ cyl(.06*s,.08*s,.9*s,'#9a8a5a',x,.09,z,8);
  for(let i=0;i<6;i++){ const a=i/6*Math.PI*2, g=grp(x,.09+.9*s,z); g.rotation.y=a; const l=rbox(.45*s,.02,.16*s,'#5cbf4a',.2*s,0,0,.01,g); l.rotation.z=-.55; }
  kit(FOOD('Banana'),x+.12*s,z+.08,{h:.24*s,y0:.09+.52*s,rot:1.2}); }
function crate(x,z,fruit,ry=0,n=4,y=0){ const g=grp(x,y,z,ry); rbox(.42,.2,.3,WOOD,0,.09,0,.02,g); for(let i=0;i<3;i++) rbox(.43,.02,.31,WOODD,0,.13+i*.06,0,.005,g);
  for(let i=0;i<n;i++) kit(FOOD(fruit),x+(-.13+(i%2)*.26)*Math.cos(ry)+(-.07+Math.floor(i/2)*.14)*Math.sin(ry),z-(-.13+(i%2)*.26)*Math.sin(ry)+(-.07+Math.floor(i/2)*.14)*Math.cos(ry),{h:.11,y0:y+.27,rot:i*1.7}); }
function basket(x,z,c=ORANGE){ cyl(.15,.11,.18,'#c99a5a',x,.09,z,12); cyl(.155,.155,.03,'#a8783f',x,.27,z,12); for(let i=0;i<4;i++) sphere(.06,c,x-.05+(i%2)*.1,.29,z-.04+Math.floor(i/2)*.08,{roughness:.5}); }
function ladder(x,z,ry){ const g=grp(x,.09,z,ry); g.rotation.x=-.25; for(const s of [-1,1]) rbox(.04,1.1,.04,WOOD,s*.14,0,0,.01,g); for(let i=0;i<5;i++) rbox(.28,.03,.03,WOODD,0,.15+i*.2,0,.005,g); }
function shed(x,z){ rbox(.9,.7,.7,'#c98d55',x,.09,z,.02); prism(1.05,.85,.35,'#7a5236',x,.79,z,'x'); rbox(.36,.5,.03,'#6e4627',x,.09,z+.36,.01); }
function fruitStand(x,z){ const g=grp(x,0,z); rbox(1.1,.5,.45,WOOD,0,.09,0,.02,g); for(const s of [-1,1]) cyl(.03,.03,1.1,WOODD,s*.5,.09,-.15,6,g);
  rbox(1.25,.05,.6,'#ff9a1f',0,1.2,-.05,.01,g); rbox(1.25,.05,.6,'#ffffff',0,1.15,-.05,.01,g).scale.x=.98;
  plate(textTex('新鮮水果','#ffffff','#e0761a'),.7,.15,0,1.02,.1,0,g); crate(x-.25,z+.02,'Orange',0,4,.5); crate(x+.25,z+.02,'Orange',0,4,.5); }
function orchard(lv){ hexPad(SOIL,.42,.09,0);
  // 草地帶（樹下）
  for(const z of [-1.9,-.9,.1]) rbox(5.2,.012,.6,GRASS,-.2,.09,z,.004);
  // 三排橘子樹
  for(const z of [-1.9,-.9,.1]) for(let i=0;i<5;i++) fruitTree(-2.2+i*1.0,z,ORANGE,.95);
  ladder(-1.0,.42,.3); basket(-.65,.55); basket(.55,-.55); shed(2.65,-1.55); fruitStand(1.9,2.05);
  for(const [x,z] of [[-2.7,1.6],[-2.0,2.1]]) bush(x,z,.45,'#ffd166');
  // 橘子偶爾從樹上掉進籃子
  { const f=sphere(.065,ORANGE,-.62,1.0,.45,{roughness:.5}); anims.push(t=>{ const k=(t%6)/6; f.visible=k<.2; f.position.y=1.0-(.72*sm(k/.2)); }); }
  if(lv>=2){
    for(let i=0;i<4;i++) fruitTree(-1.7+i*1.0,.95,'#e5484d',.85);                              // 一排蘋果樹
    for(let i=0;i<3;i++) bananaTree(2.75,-.6+i*.75,.9);                                     // 右邊一排香蕉樹
    rbox(.6,.02,4.2,'#d9c29a',-2.75,.095,-.5,.004);                                         // 採果小路
    { const g=grp(-2.75,0,1.95); for(const s of [-1,1]) cyl(.06,.07,1.5,WOODD,s*.55,.09,0,8,g);   // 木頭拱門招牌
      const a=add(new THREE.Mesh(new THREE.TorusGeometry(.55,.06,8,20,Math.PI),mat(WOODD)),g); a.position.y=1.59; a.scale.y=.45;
      plate(textTex('木星果園','#f7ecd8','#7a4a1f'),1.0,.24,0,1.5,.07,0,g); for(const s of [-1,1]) sphere(.08,ORANGE,s*.4,1.72,.05,{},g); }
    { const jx=.8, jz=2.5; rbox(.8,.5,.4,'#ffd166',jx,.09,jz,.02); cyl(.03,.03,1.15,'#9aa0ab',jx,.09,jz-.05,6);   // 果汁攤＋遮陽傘
      const um=add(new THREE.Mesh(new THREE.ConeGeometry(.5,.22,8),mat('#ff9a1f',{flatShading:true}))); um.position.set(jx,1.32,jz-.05);
      for(let i=0;i<3;i++){ cyl(.05,.045,.14,['#ffb020','#ff6b6b','#ffe066'][i],jx-.22+i*.22,.6,jz+.05,10); cyl(.008,.008,.1,'#ffffff',jx-.2+i*.22,.74,jz+.05,4); } }
    // 小拖拉機拉水果車，在樹排之間慢慢來回
    { const g=grp(0,0,1.62); kit('models/car3/tractor.glb',0,0,{w:.75,rot:Math.PI/2,y0:.09,parent:g});
      const tr=grp(-.75,0,0,0,g); rbox(.55,.16,.36,WOOD,0,.2,0,.02,tr); for(const s of [-1,1]) cyl(.1,.1,.06,'#2f3440',s*.15,.12,.2,12,tr).rotation.x=Math.PI/2;
      for(let i=0;i<4;i++) sphere(.07,i%2?ORANGE:'#e5484d',-.18+i*.12,.45,0,{roughness:.5},tr);
      anims.push(t=>{ const k=(t*.06)%2, p=k<1?sm(k):1-sm(k-1); g.position.x=-1.6+p*1.55; g.rotation.y=k<1?0:Math.PI; }); }
  }
}

/* ======================= 茶園（家長 11-18 16:44 參考圖重做） =======================
   Lv1 小茶園：較小的梯田茶區（4 排），石板步道和石階上到右邊的製茶平台；平台上有茶架（圓竹盤曬茶葉）和茶席（矮桌、茶壺茶杯、小凳子）；不放烘茶機
   Lv2 觀光茶園：梯田擴大（7 排）＋前面一塊圓弧形茶區；平台上加烘焙茶的機器（滾筒烘茶機、煙囪）、揉茶機、第二個茶架；不加涼亭、不要池塘、不要小茶棚
   入口不做門框招牌，改成一塊刻字的石碑「木星茶園」。 */
const TEA_SOIL='#7a5236', TEA_SOIL2='#8f6a45', TEA_A='#3f8f4a', TEA_B='#4fa35a', TEA_C='#2f7a3f', STONEP='#cfc8b8', PLAT='#e2d3b2';
/* 一排茶樹：很多小葉團擠在一起變成一條圓圓的綠籬（用 InstancedMesh，iPad 才不會卡） */
const TEA_GEO=new THREE.IcosahedronGeometry(.16,1);
function teaHedge(pts,parent){ const cols=[TEA_A,TEA_B,TEA_C], ims=cols.map(c=>new THREE.InstancedMesh(TEA_GEO,mat(c,{flatShading:true}),pts.length)), cnt=[0,0,0], o=new THREE.Object3D();
  pts.forEach(([x,y,z],i)=>{ const k=(i*7)%3, sc=.85+((i*13)%5)*.07; o.position.set(x,y+.1*sc,z); o.scale.set(sc*1.2,sc*.8,sc); o.rotation.set(0,i,0); o.updateMatrix(); ims[k].setMatrixAt(cnt[k]++,o.matrix); });
  ims.forEach((im,k)=>{ im.count=cnt[k]; im.castShadow=true; im.receiveShadow=true; (parent||ROOT).add(im); }); }
function rack(x,z,ry=0){ const g=grp(x,0,z,ry); for(const sx of [-1,1]) for(const sz of [-1,1]) cyl(.025,.025,1.25,'#c9a36a',sx*.42,.32,sz*.32,6,g);   // 茶架：竹架三層，每層兩個圓竹盤曬茶葉
  for(let i=0;i<3;i++){ const y=.55+i*.32; for(const sz of [-1,1]) rbox(.9,.02,.03,'#b8925a',0,y,sz*.32,.004,g);
    for(const sx of [-1,1]){ cyl(.2,.2,.04,'#d9b98a',sx*.2,y+.02,0,18,g); const l=cyl(.17,.17,.02,'#7a9a3a',sx*.2,y+.05,0,18,g); } }
  return g; }
function teaTable(x,z){ const g=grp(x,0,z); rbox(.9,.06,.45,'#8a5a32',0,.5,0,.01,g); for(const sx of [-1,1]) for(const sz of [-1,1]) rbox(.05,.18,.05,'#6e4627',sx*.38,.32,sz*.17,.005,g);   // 茶席
  const pot=sphere(.07,'#7a3a22',-.18,.62,0,{},g); pot.scale.y=.8; const sp=cyl(.012,.016,.07,'#7a3a22',-.1,.6,0,6,g); sp.rotation.z=-1; cyl(.02,.02,.02,'#7a3a22',-.18,.67,0,6,g);
  for(let i=0;i<4;i++) cyl(.028,.022,.04,'#f4efe4',.05+i*.08,.56,(i%2?.06:-.06),10,g); rbox(.3,.02,.18,'#c9a36a',.17,.56,0,.004,g);
  for(const sz of [-1,1]) cyl(.1,.1,.22,'#8a5a32',0,.32,sz*.42,10,g);
  puff(x-.18,.72+.32,z,{r:.035,rise:.4,drift:.03,n:3,op:.5,speed:.3}); return g; }
function roaster(x,z,ry=0){ const g=grp(x,0,z,ry);   // 烘茶機：火爐台座＋橫躺的滾筒＋前面的漏斗＋煙囪（會冒煙）
  rbox(1.0,.35,.55,'#6b6f78',0,.32,0,.02,g); rbox(.3,.16,.04,'#ff8a3a',-.2,.38,.28,.01,g).material=mat('#ff8a3a',{emissive:new THREE.Color('#ff6a1a'),emissiveIntensity:.6});
  const d=cyl(.26,.26,.85,'#5a4a3a',0,0,0,20,g); d.rotation.z=Math.PI/2; d.position.set(0,.88,0); for(const s of [-1,1]){ const r=add(new THREE.Mesh(new THREE.TorusGeometry(.27,.03,6,20),mat('#3b3f48')),g); r.rotation.y=Math.PI/2; r.position.set(s*.3,.88,0); }
  const hp=add(new THREE.Mesh(new THREE.ConeGeometry(.16,.22,4),mat('#8d939e')),g); hp.rotation.x=Math.PI; hp.position.set(.5,1.08,0);
  cyl(.06,.06,.9,'#3b3f48',-.35,.67,-.15,10,g); cyl(.08,.06,.06,'#3b3f48',-.35,1.57,-.15,10,g);
  for(const sx of [-1,1]) rbox(.06,.4,.06,'#3b3f48',sx*.42,.3,.2,.01,g);
  puff(x-.35*Math.cos(ry)-(-.15)*Math.sin(ry),1.7,z+.35*Math.sin(ry)-.15*Math.cos(ry),{color:'#e8e8e8',r:.07,rise:.7,drift:.08,n:4,op:.55,speed:.3}); return g; }
function roller(x,z){ const g=grp(x,0,z); rbox(.6,.3,.6,'#8a5a32',0,.32,0,.02,g); const b=cyl(.26,.2,.18,'#c9c2b4',0,.62,0,18,g);   // 揉茶機：木台座＋圓盆＋上面的壓桶＋手把
  const t=cyl(.16,.16,.3,'#e8e3d6',0,.82,0,14,g); for(const s of [-1,1]) rbox(.04,.55,.04,'#6e4627',s*.3,.62,0,.01,g); rbox(.64,.05,.06,'#6e4627',0,1.17,0,.01,g);
  const l=cyl(.21,.21,.02,'#7a9a3a',0,.81,0,16,g); return g; }
function stele(x,z,ry=0){ const g=grp(x,0,z,ry); rbox(.7,.1,.4,STONEP,0,.09,0,.02,g); rbox(.55,.85,.18,'#d8d2c4',0,.19,0,.04,g);   // 刻字石碑
  const vt=rectTex(160,560,(c,W,H)=>{ c.fillStyle='#d8d2c4'; c.fillRect(0,0,W,H); c.fillStyle='#3b4a3a'; c.textAlign='center'; c.textBaseline='middle'; c.font='bold 112px "PingFang TC","Noto Sans CJK TC",sans-serif'; [...'木星茶園'].forEach((ch,i)=>c.fillText(ch,W/2,H*(.13+i*.25))); });
  plate(vt,.24,.74,0,.6,.095,0,g); return g; }
/* 石板步道（家長 18:13 要精緻一點）：底下一條米色碎石路，上面鋪大小不一、不規則多邊形的石板（灰色深淺不同、邊角有斜面），兩旁一排小卵石 */
function flagPath(pts,Y){ const curve=new THREE.CatmullRomCurve3(pts.map(([x,z])=>new THREE.Vector3(x,0,z))), N=26;
  for(let i=0;i<N;i++){ const t=i/(N-1), p=curve.getPoint(t), d=curve.getTangent(t); const g=rbox(.62,.02,.2,'#d9cdb5',p.x,Y,p.z,.008); g.rotation.y=Math.atan2(-d.z,d.x); }   // 碎石路底
  const cols=['#cfc8b8','#bfb7a6','#d9d3c4','#c6bfae','#b3ab9a'];
  for(let i=0;i<9;i++){ const t=(i+.5)/9, p=curve.getPoint(t), d=curve.getTangent(t), nx=-d.z, nz=d.x;
    for(const side of (i%2?[-1,1]:[0])){ const r=side?.12:.17, n=6+((i*3+side+5)%3), sh=new THREE.Shape();
      for(let k=0;k<n;k++){ const a=k/n*Math.PI*2+i, rr=r*(.8+((i*7+k*5)%5)*.06); k?sh.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):sh.moveTo(Math.cos(a)*rr,Math.sin(a)*rr); } sh.closePath();
      const gg=new THREE.ExtrudeGeometry(sh,{depth:.035,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1}); gg.rotateX(-Math.PI/2);
      const m=add(new THREE.Mesh(gg,mat(cols[(i+side+2)%cols.length],{flatShading:true}))); m.position.set(p.x+nx*side*.15,Y+.02,p.z+nz*side*.15); m.receiveShadow=true; } }
  for(let i=0;i<22;i++){ const t=i/21, p=curve.getPoint(t), d=curve.getTangent(t), nx=-d.z, nz=d.x; for(const s of [-1,1]){ const b=sphere(.035+((i+s)%3)*.008,['#a8a090','#8f887a','#bdb5a4'][(i+s+3)%3],p.x+nx*s*.33,Y+.02,p.z+nz*s*.33,{flatShading:true}); b.scale.y=.6; } } }
/* 上平台的石階：三階，每階前緣一條深色線 */
function stair(x,Y,z,i){ const h=(i+1)*.075; rbox(.24,h,.62,i%2?'#cfc8b8':'#d9d3c4',x+i*.2-.2,Y,z,.012); rbox(.02,.012,.62,'#a8a090',x+i*.2-.31,Y+h-.006,z,.003); }
function teaBasket(x,z){ cyl(.13,.1,.22,'#c9a36a',x,.34,z,10); for(let i=0;i<3;i++) cyl(.135,.135,.015,'#a8823f',x,.38+i*.06,z,10); sphere(.08,TEA_B,x,.55,z); }   // 竹編茶簍（放在平台上）
function tea(lv){ hexPad(TEA_SOIL2,.42,.09,0); const Y=.1;
  // 右邊：草地上的製茶平台
  // 家長 18:13：平台和草地收進六角形裡面（不能凸出格子）
  const ext=(pts,h,y,c,bev=.02)=>{ const sh=new THREE.Shape(); pts.forEach(([x,z],k)=>k?sh.lineTo(x,-z):sh.moveTo(x,-z)); sh.closePath(); const gg=new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:bev>0,bevelThickness:bev,bevelSize:bev,bevelSegments:1}); gg.rotateX(-Math.PI/2); const m=add(new THREE.Mesh(gg,mat(c))); m.position.y=y; m.receiveShadow=true; m.castShadow=true; return m; };
  ext([[.6,-2.55],[2.15,-2.55],[3.15,-.9],[3.15,.3],[2.15,2.05],[.6,2.05]],.14,Y-.06,'#9fcf7a');
  const PP=[[.95,-2.15],[2.15,-2.15],[2.85,-.9],[2.85,.05],[2.35,.85],[.95,.85]]; ext(PP,.18,Y+.06,PLAT,.03);
  ext(PP.map(([x,z])=>[x+(x>1.9?-.06:.06),z+(z<-1?.06:-.06)]),.02,Y+.27,'#d2c19c',0);
  // 左邊：梯田茶區（斜斜的一排排），越後面越高
  const rows=lv>=2?7:4, TG=grp(lv>=2?-1.45:-1.4,Y,lv>=2?-.35:-.75,.5);   // 家長 18:13：茶區往左移
  for(let i=0;i<rows;i++){ const z=-1.45+i*.55*(lv>=2?1:1.05), h=(rows-i)*.1, len=lv>=2?3.3-Math.abs(i-3)*.18:2.7;
    rbox(len,h,.55,i%2?TEA_SOIL:'#84603e',0,0,z,.02,TG); rbox(len,.02,.18,'#a07a52',0,h,z+.2,.005,TG);
    const pts=[]; for(let k=0;k<Math.floor(len/.2);k++) pts.push([-len/2+.12+k*.2+(i%2?.06:0),h,z-.06]); teaHedge(pts,TG); }
  if(lv<2) for(let i=0;i<3;i++){ const z=.85+i*.5; rbox(2.6,.04,.32,'#6e4a2c',0,0,z,.01,TG); for(let k=0;k<11;k++){ const sp=sphere(.05,TEA_B,-1.15+k*.21,.08,z,{flatShading:true},TG); sp.scale.y=.7; } }   // Lv1：前面三排剛種下的小茶苗（Lv2 會長成茶樹）
  if(lv>=2){ // 前面一塊圓弧形的低矮茶區
    const pts=[]; for(let r=0;r<3;r++){ const rr=.45+r*.3; for(let a=.35;a<Math.PI-.05;a+=.2/rr) pts.push([-1.45+Math.cos(a)*rr*1.3,Y,1.9-Math.sin(a)*rr*.6]); } teaHedge(pts); }
  // 石板步道：左前方入口 → 平台的石階
  flagPath([[-.9,2.95],[-.45,2.7],[-.05,2.35],[.2,1.9],[.25,1.35],[.22,.75]],Y); for(let i=0;i<3;i++) stair(.58,Y,.45,i);   // 步道接到石階、石階接上平台西邊
  // 平台上：茶架、茶席、竹簍
  rack(1.45,-1.45,.2); teaTable(2.1,.25); for(const [x,z] of [[2.55,-.35],[2.5,-.75]]) teaBasket(x,z);
  if(lv>=2){ roaster(2.15,-1.3,.15); roller(1.3,.35); rack(1.3,-.4,-.2); for(const [x,z] of [[1.25,-1.95],[1.6,-1.95]]) teaBasket(x,z); }
  stele(1.55,1.85,.35);
  for(const [x,z,k,c] of [[2.75,1.2,.5,'#58b06a']]) tree(x,z,k,c); bush(2.1,1.7,.42,'#ffd166');
}
export const ORCHARD_LV=[1,2].map(l=>['orchard'+(l>1?l:''),'果園 Lv'+l+(l>1?' 觀光果園':' 小果園'),()=>orchard(l),'whole']), ORCHARD_TOP=[0,2.2,2.6];
export const TEA_LV=[1,2].map(l=>['tea'+(l>1?l:''),'茶園 Lv'+l+(l>1?' 觀光茶園':' 小茶園'),()=>tea(l),'whole']), TEA_TOP=[0,1.8,2.2];
