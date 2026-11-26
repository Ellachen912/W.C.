/* Winston City 第二階段：美術館（文化區，整格，3 級）、銀行（商業與生活區，整格，3 級）（家長 2026-11-18 15:56「先接著畫」）
   美術館：白色現代建築＋紅黃藍三原色
     Lv1 小畫廊：一層白色方盒＋整面玻璃看得到牆上的畫，招牌「木星美術館」，草地上一座彩色積木雕塑，長椅
     Lv2 美術館：加一棟高的展覽館（正面是紅黃藍格子牆），雕塑花園多一顆大紅蘋果雕塑、兩個畫架
     Lv3 大美術館：加一座白色螺旋展覽塔（一圈一圈往上變大，像蝸牛殼），屋頂上的彩色風車雕塑會轉，門口彩色旗子
   （家長 11-18 16:11：美術館改兩級＝留現在的 Lv2、Lv3，門口雕塑、風車、旗子、單支路燈都要改，等家長找參考，先不要動；銀行改兩級＝留 Lv1、Lv2）
   銀行：米白石頭＋金色
     Lv1 小銀行：四根白柱子＋三角山牆的古典小銀行，山牆上金色錢幣徽章，招牌「木星銀行」，門口 ATM、台階
     Lv2 銀行：變兩層樓、兩側加翼樓、山牆上加時鐘，草地上一隻粉紅小豬撲滿雕塑
     Lv3 銀行大樓：後面加一棟玻璃高樓，樓頂一枚金色大錢幣會慢慢轉
   座標：格子中心為原點、正門朝 +z；平頂六角形，可用範圍約 x ±3.3、z ±2.9。 */
import * as THREE from 'three';
import { kit } from './s1_kit.js';
import { ROOT, add, rbox, cyl, sphere, mat, prism, tree, bush, lamp, bench, hexPad, anims, clock, puff } from './lib.js';

const em=(c,i=.6)=>mat(c,{emissive:new THREE.Color(c),emissiveIntensity:i});
const glass=mat('#a8dcf0',{roughness:.12,metalness:.15,emissive:0x1d4a5c,emissiveIntensity:.18});
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function textTex(txt,bg,fg,border){ return rectTex(1024,200,(g,W,H)=>{ g.fillStyle=bg; g.fillRect(0,0,W,H); if(border){ g.strokeStyle=border; g.lineWidth=12; g.strokeRect(6,6,W-12,H-12); }
  g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle'; g.font=`bold ${Math.min(H*.6,W*.9/txt.length)}px "PingFang TC","Noto Sans CJK TC","Noto Sans TC",sans-serif`; g.fillText(txt,W/2,H*.54); }); }
function plate(tex,w,h,x,y,z,ry=0,parent){ const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.7})); p.position.set(x,y,z); p.rotation.y=ry; add(p,parent); return p; }
const R3='#e5484d', Y3='#f2c230', B3='#3f7fd0', K='#2f3440', WH='#f7f6f2';

/* ======================= 美術館 ======================= */
const artSign=textTex('木星美術館',WH,K,null);
const paintTex=[0,1,2,3].map(k=>rectTex(128,96,(g,w,h)=>{ g.fillStyle=['#fff4d6','#e8f4ff','#fde8ef','#eef8e6'][k]; g.fillRect(0,0,w,h);   // 牆上的畫：簡單的太陽、山、花、彩色方塊
  if(k===0){ g.fillStyle='#ffb020'; g.beginPath(); g.arc(w*.7,h*.35,h*.2,0,7); g.fill(); g.fillStyle='#5bbf6a'; g.fillRect(0,h*.7,w,h*.3); }
  if(k===1){ g.fillStyle='#5b8fe0'; g.beginPath(); g.moveTo(0,h); g.lineTo(w*.35,h*.3); g.lineTo(w*.6,h*.7); g.lineTo(w*.8,h*.45); g.lineTo(w,h); g.fill(); }
  if(k===2){ for(let i=0;i<3;i++){ g.fillStyle=['#e5484d','#c79bff','#ff9ed2'][i]; g.beginPath(); g.arc(w*(.25+i*.25),h*.45,h*.16,0,7); g.fill(); } g.fillStyle='#4f9a4a'; g.fillRect(0,h*.75,w,h*.25); }
  if(k===3){ [[.1,.1,.35,.5,'#e5484d'],[.5,.1,.4,.3,'#f2c230'],[.5,.45,.4,.45,'#3f7fd0'],[.1,.65,.35,.25,'#2f3440']].forEach(([x,y,ww,hh,c])=>{ g.fillStyle=c; g.fillRect(x*w,y*h,ww*w,hh*h); }); }
  g.strokeStyle='#8a6a3a'; g.lineWidth=8; g.strokeRect(4,4,w-8,h-8); }));
function blockSculpture(x,z,s=1){ const g=grp(x,0,z); rbox(.5*s,.12*s,.5*s,'#d9d5cc',0,.08,0,.02,g);
  rbox(.36*s,.36*s,.36*s,B3,0,.2*s,0,.04,g); const c=cyl(.16*s,.16*s,.4*s,Y3,.02*s,.56*s,0,16,g); c.rotation.z=.25;
  const tri=add(new THREE.Mesh(new THREE.ConeGeometry(.2*s,.36*s,3),mat(R3,{flatShading:true})),g); tri.position.set(-.05*s,1.15*s,0); sphere(.09*s,'#69db7c',.12*s,1.4*s,0,{},g); }
function apple(x,z,s=1){ const g=grp(x,0,z); rbox(.6*s,.14*s,.6*s,'#d9d5cc',0,.08,0,.03,g); const a=sphere(.4*s,R3,0,.6*s,0,{},g); a.scale.set(1.05,.95,1.05);
  cyl(.03*s,.03*s,.22*s,'#7a5a3a',0,.95*s,0,8,g); const lf=sphere(.1*s,'#5bbf6a',.1*s,1.08*s,0,{},g); lf.scale.set(1.4,.4,.8); }
function easel(x,z,ry,k){ const g=grp(x,0,z,ry); for(const s of [-1,1]){ const l=cyl(.015,.015,.9,'#a8703f',s*.15,.08,0,5,g); l.rotation.z=s*.12; } const b=cyl(.015,.015,.85,'#a8703f',0,.08,-.15,5,g); b.rotation.x=-.25;
  rbox(.42,.32,.03,'#ffffff',0,.5,.04,.005,g); plate(paintTex[k],.38,.28,0,.66,.06,0,g); }
function spiralTower(x,z){ const g=grp(x,.1,z); let y=0; for(let i=0;i<4;i++){ const r=.6+i*.13, h=.4; cyl(r,r-.04,h,WH,0,y,0,32,g); const band=cyl(r-.01,r-.03,.12,'#a8dcf0',0,y+.16,0,32,g); band.material=glass; band.scale.set(1.012,1,1.012); y+=h; }   // 一圈一圈往上變大
  cyl(1.05,1.05,.06,'#d9d5cc',0,y,0,32,g); cyl(.3,.3,.3,'#a8dcf0',0,y+.06,0,16,g).material=glass; return y; }
function pinwheel(x,y,z){ const g=grp(x,y,z); cyl(.03,.03,.9,'#9aa0ab',0,0,0,6,g); const rot=new THREE.Group(); rot.position.set(0,.9,.06); g.add(rot);
  [R3,Y3,B3,'#69db7c'].forEach((c,i)=>{ const b=new THREE.Mesh(new THREE.ConeGeometry(.16,.4,3),mat(c,{side:THREE.DoubleSide,flatShading:true})); b.position.set(0,.17,0); const p=new THREE.Group(); p.rotation.z=i*Math.PI/2; p.add(b); b.scale.z=.15; rot.add(p); });
  sphere(.05,'#ffffff',0,0,.02,{},rot); anims.push(t=>{ rot.rotation.z=-t*1.6; }); }
/* 手掌雕像（Sketchfab「Hand Sculpture」，CC-BY-4.0，作者 re1monsen；貼圖縮成 512）：放在白色大理石底座上 */
function handSculpture(x,z){ const g=grp(x,.1,z); rbox(.62,.1,.62,'#d9d5cc',0,0,0,.02,g); rbox(.48,.42,.48,'#f4f2ec',0,.1,0,.02,g); rbox(.56,.06,.56,'#d9d5cc',0,.52,0,.015,g);
  kit('models/sk/hand.glb',0,0,{h:.95,y0:.58,rot:-.5,parent:g,then:o=>o.traverse(m=>{ if(m.isMesh){ m.material=new THREE.MeshStandardMaterial({color:'#f1e9da',roughness:.35}); } })}); }   // 原本太暗：關掉金屬感
function art(lv0){ const lv=lv0+1;   // 家長 11-18 16:11：美術館改兩級＝舊的 Lv2、Lv3
  hexPad('#e9e6f1',.42,.09,0); pave(.1); const Y=.1;   // 地面鋪石板（家長 11-18：地面要有鋪面）
  // Lv1 小畫廊：白色方盒＋整面玻璃
  { const cx=-.6, cz=-.8, W=3.0, D=1.8, h=1.15, fz=cz+D/2;
    rbox(W,h,D,WH,cx,Y,cz,.04); rbox(W-.5,.85,.04,glass,cx,Y+.12,fz+.01,.01);
    for(let i=0;i<3;i++) plate(paintTex[i],.5,.38,cx-.85+i*.85,Y+.55,fz-.28,0);                     // 玻璃裡看得到牆上的畫
    for(let i=0;i<4;i++) rbox(.05,.85,.06,'#d9d5cc',cx-1.25+i*.833,Y+.12,fz+.03,.01);
    rbox(W+.2,.1,D+.2,'#d9d5cc',cx,Y+h,cz,.02); rbox(.5,.06,.4,R3,cx-1.2,Y+h+.1,cz+.3,.01); rbox(.5,.06,.4,B3,cx-.6,Y+h+.1,cz+.3,.01);   // 屋頂彩色天窗
    plate(artSign,1.6,.3,cx+.35,Y+h-.05,fz+.12); rbox(1.7,.38,.06,K,cx+.35,Y+h-.24,fz+.08,.01);
    rbox(1.0,.04,.9,'#e0dcd2',cx+.9,Y-.02,fz+.45,.01); }
  handSculpture(2.15,1.95); bench(.3,1.85,0); for(const x of [-.9,-.2]) bush(x,1.5,.5,['#ffd166','#ff8fa3'][x<-.5?0:1]);   // 門口只放一座手掌雕像（家長 11-19 00:05），其他雕像拿掉
  if(lv>=2){ // 高的展覽館：正面紅黃藍格子牆
    const gx=1.9, gz=-1.0, W=1.8, D=1.6, h=2.3, fz=gz+D/2; rbox(W,h,D,WH,gx,Y,gz,.04);
    [[.0,.0,.55,.9,R3],[.6,.0,.6,.5,WH],[.6,.55,.6,.35,Y3],[.0,.95,.9,.55,B3],[.95,.95,.25,.55,Y3],[.0,1.55,.45,.6,WH],[.5,1.55,.7,.6,R3]].forEach(([x,y,w,hh,c])=>rbox(w*W/1.25-.04,hh-.04,.04,c,gx-W/2+.05+(x+w/2)*W/1.25,Y+.08+y,fz+.02,.01));
    for(const x of [0,.6,.95].map(v=>gx-W/2+.05+v*W/1.25)) rbox(.05,h-.1,.05,K,x,Y+.05,fz+.05,.005);
    rbox(W+.1,.08,D+.1,K,gx,Y+h,gz,.01);
    easel(.9,.9,-.3,3); easel(-.1,1.1,.2,1); }
  if(lv>=3){ spiralTower(-2.1,1.25); }   // 白色螺旋展覽塔（風車、門口彩色旗子拿掉，家長 11-18 16:11）
  for(const [x,z,k] of [[3.0,.9,.55],[-2.9,.15,.5]]) if(!(lv>=3&&x<0)) tree(x,z,k,'#6fc463');
  lamp(-.6,2.15); lamp(1.2,2.15); }   // 路燈左右對稱（家長 11-18 16:11）

/* ======================= 銀行 ======================= */
const STONE='#efe6d2', STONE2='#dcd0b6', GOLD='#e9b93a';
const bankSign=textTex('木星銀行','#1f3a5f','#f2d06b','#f2d06b');
const goldM=()=>mat(GOLD,{metalness:.55,roughness:.3});
function coin(r,x,y,z,parent){ const g=grp(x,y,z,0,parent); const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,r*.18,40),goldM()); c.rotation.x=Math.PI/2; add(c,g);
  const t=new THREE.Mesh(new THREE.TorusGeometry(r*.78,r*.06,8,40),mat('#c9962a',{metalness:.5,roughness:.35})); t.position.z=r*.1; add(t,g); const t2=t.clone(); t2.position.z=-r*.1; add(t2,g);
  const st=new THREE.Shape(); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+Math.PI/2, rr=(i%2?.22:.5)*r; i?st.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):st.moveTo(Math.cos(a)*rr,Math.sin(a)*rr); }
  for(const s of [1,-1]){ const sm=new THREE.Mesh(new THREE.ExtrudeGeometry(st,{depth:r*.04,bevelEnabled:false}),mat('#c9962a',{metalness:.5,roughness:.35})); sm.position.z=s*r*.09; if(s<0) sm.rotation.y=Math.PI; add(sm,g); }
  return g; }
function piggy(x,z,ry){ const g=grp(x,0,z,ry); rbox(.7,.14,.5,STONE2,0,.08,0,.03,g); const P='#f6a8c0';
  const b=sphere(.32,P,0,.58,0,{},g); b.scale.set(1.25,1,1); const sn=cyl(.11,.11,.1,'#f38fb0',.4,.55,0,16,g); sn.rotation.z=Math.PI/2; for(const dz of [-.04,.04]) sphere(.02,'#c25f80',.46,.56,dz,{},g);
  for(const dz of [-.15,.15]){ const e=add(new THREE.Mesh(new THREE.ConeGeometry(.08,.14,4),mat(P)),g); e.position.set(.22,.88,dz); sphere(.03,K,.33,.68,dz*.8,{},g); }
  for(const [dx,dz] of [[-.2,-.15],[-.2,.15],[.2,-.15],[.2,.15]]) cyl(.07,.07,.2,P,dx,.22,dz,10,g);
  rbox(.2,.02,.04,'#8a3a55',0,.9,0,.01,g); coin(.12,0,1.02,0,g); }
/* ---- 古典建築零件（家長 11-18 16:56：羅馬柱要細緻、要有石板地磚、要精緻華麗；不要 ATM 藍箱子） ---- */
const MARBLE='#f4efe4', MARBLE2='#e3dac6', MARBLE3='#cfc3a8', BRONZE='#8a6a3a';
const pavingTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=512; const g=c.getContext('2d');   // 石板地磚：大塊米色石板＋細縫，中間菱形拼花
  g.fillStyle='#e9e1cf'; g.fillRect(0,0,512,512); const n=8, q=512/n;
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){ const v=(i*7+j*13)%4; g.fillStyle=['#ece4d2','#e4dbc6','#efe8d8','#e0d6bf'][v]; g.fillRect(i*q+2,j*q+2,q-4,q-4); }
  g.strokeStyle='rgba(150,130,100,.55)'; g.lineWidth=3; for(let i=0;i<=n;i++){ g.beginPath(); g.moveTo(i*q,0); g.lineTo(i*q,512); g.stroke(); g.beginPath(); g.moveTo(0,i*q); g.lineTo(512,i*q); g.stroke(); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t; })();
const rusticTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d'); g.fillStyle=MARBLE; g.fillRect(0,0,256,256);   // 牆面：一層層切石（橫縫深、直縫錯開）
  for(let r=0;r<6;r++){ const y=r*256/6; g.fillStyle='rgba(120,100,70,.35)'; g.fillRect(0,y,256,3); for(let k=0;k<3;k++){ const x=(k*256/3+(r%2?256/6:0))%256; g.fillRect(x,y,2,256/6); } }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; })();
const wallMat=(rx,ry)=>{ const t=rusticTex.clone(); t.needsUpdate=true; t.repeat.set(rx,ry); return new THREE.MeshStandardMaterial({map:t,roughness:.75}); };
function pave(y=.1,inset=.55){ const R=4.2-inset, sh=new THREE.Shape(); for(let i=0;i<6;i++){ const a=i*Math.PI/3; i?sh.lineTo(R*Math.cos(a),R*Math.sin(a)):sh.moveTo(R*Math.cos(a),R*Math.sin(a)); } sh.closePath();   // 整格鋪石板地磚（六角形，不超出格子）
  const t=pavingTex.clone(); t.needsUpdate=true; t.repeat.set(1/1.6,1/1.6); const g=new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI/2);
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:t,roughness:.8})); m.position.y=y+.012; m.receiveShadow=true; ROOT.add(m); return m; }
/* 愛奧尼克式羅馬柱：方形柱礎＋兩圈圓環柱腳＋有凹槽的柱身（16 條溝）＋柱頭渦卷＋方形頂板 */
function ionic(x,y,z,h,r=.1,parent){ const g=grp(x,y,z,0,parent);
  rbox(r*2.8,.06,r*2.8,MARBLE2,0,0,0,.01,g); const t1=add(new THREE.Mesh(new THREE.TorusGeometry(r*1.15,r*.22,8,24),mat(MARBLE)),g); t1.rotation.x=Math.PI/2; t1.position.y=.09;
  const t2=add(new THREE.Mesh(new THREE.TorusGeometry(r*1.05,r*.16,8,24),mat(MARBLE)),g); t2.rotation.x=Math.PI/2; t2.position.y=.15;
  const sh=h-.42; cyl(r*.92,r,sh,MARBLE,0,.17,0,24,g);
  for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; const f=add(new THREE.Mesh(new THREE.BoxGeometry(r*.1,sh*.94,r*.12),mat(MARBLE3)),g); f.position.set(Math.cos(a)*r*.93,.17+sh/2,Math.sin(a)*r*.93); f.rotation.y=-a; }   // 柱身凹槽
  const ec=add(new THREE.Mesh(new THREE.TorusGeometry(r*.95,r*.18,8,24),mat(MARBLE)),g); ec.rotation.x=Math.PI/2; ec.position.y=.17+sh+.02;
  rbox(r*2.3,.07,r*1.4,MARBLE,0,.17+sh+.03,0,.01,g);
  for(const s of [-1,1]) for(const zz of [-1,1]){ const v=add(new THREE.Mesh(new THREE.TorusGeometry(r*.32,r*.12,8,16),mat(MARBLE2)),g); v.position.set(s*r*1.05,.17+sh+.02,zz*r*.62); }   // 渦卷
  rbox(r*2.7,.06,r*2.7,MARBLE2,0,.17+sh+.1,0,.01,g); return g; }
/* 柱子上面的橫樑：三層線腳的楣樑＋飾帶（金色小圓花）＋齒狀飛簷 */
function entablature(w,d,x,y,z,parent,skip=0){ const g=grp(x,y,z,0,parent);
  for(let i=0;i<3;i++) rbox(w-.06+i*.03,.06,d-.04+i*.02,MARBLE,0,i*.06,0,.005,g);
  rbox(w,.18,d,MARBLE2,0,.18,0,.01,g); for(let i=0;i<Math.floor(w/.38);i++){ const bx=-w/2+.25+i*.38; if(Math.abs(bx)<skip) continue; sphere(.035,mat(GOLD,{metalness:.5,roughness:.3}),bx,.27,d/2+.005,{},g); }   /* 11-19 18:58：招牌那一段不放小圓花，不然會疊在字上面 */
  rbox(w+.12,.05,d+.1,MARBLE,0,.36,0,.005,g); for(let i=0;i<Math.floor((w+.1)/.1);i++) rbox(.05,.05,.05,MARBLE3,-(w+.1)/2+.05+i*.1,.41,d/2+.06,.004,g);   // 齒飾
  rbox(w+.24,.08,d+.2,MARBLE,0,.46,0,.01,g); return .54; }
/* 三角山牆：外框線腳＋裡面一枚金幣和兩條月桂葉 */
function pediment(w,x,y,z,parent){ const g=grp(x,y,z,0,parent), h=w*.24, sh=new THREE.Shape(); sh.moveTo(-w/2,0); sh.lineTo(w/2,0); sh.lineTo(0,h); sh.closePath();
  const tri=add(new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.4,bevelEnabled:false}),mat(MARBLE2)),g); tri.position.z=-.3;
  const L=Math.hypot(w/2,h); for(const s of [-1,1]){ const r=rbox(L+.1,.08,.12,MARBLE,0,0,0,.01,g); r.position.set(s*w/4,h/2,.12); r.rotation.z=-s*Math.atan2(h,w/2); }
  coin(h*.28,0,h*.4,.12,g);
  /* 11-19 18:58 家長：金幣外圍的綠色月桂葉拿掉 */
  return h; }
function archWindow(x,y,z,w,h,parent){ const g=grp(x,y,z,0,parent); rbox(w+.12,h+.06,.05,MARBLE,0,0,0,.01,g);
  rbox(w,h-w/2,.04,glass,0,.03,.02,.006,g); const a=add(new THREE.Mesh(new THREE.CylinderGeometry(w/2,w/2,.04,20,1,false,Math.PI/2,Math.PI),glass),g); a.rotation.x=Math.PI/2; a.position.set(0,.03+h-w/2,.02);
  rbox(.08,.1,.07,MARBLE2,0,h+.0,.02,.01,g); rbox(w+.2,.05,.1,MARBLE2,0,-.04,.04,.01,g); rbox(.02,h-.1,.05,MARBLE2,0,.05,.04,.003,g); return g; }
function lampPost(x,z){ rbox(.26,.4,.26,MARBLE2,x,.1,z,.02); cyl(.035,.045,1.2,'#2f2f36',x,.5,z,10);
  for(const s of [-1,1]){ const arm=rbox(.3,.03,.03,'#2f2f36',x+s*.14,1.55,z,.005); sphere(.08,mat('#fff3c4',{emissive:0xffe08a,emissiveIntensity:.4}),x+s*.28,1.5,z); cyl(.09,.06,.06,'#2f2f36',x+s*.28,1.58,z,8); }
  sphere(.05,mat(GOLD,{metalness:.5,roughness:.3}),x,1.78,z); }
function urn(x,y,z,s=1){ cyl(.07*s,.1*s,.06*s,MARBLE2,x,y,z,12); const b=sphere(.1*s,MARBLE,x,y+.15*s,z,{}); b.scale.y=1.1; cyl(.09*s,.06*s,.05*s,MARBLE2,x,y+.25*s,z,12); }
function topiary(x,z){ rbox(.36,.3,.36,MARBLE2,x,.1,z,.02); const b=sphere(.2,'#4f9a4a',x,.62,z,{flatShading:true}); b.scale.y=1.15; sphere(.12,'#5aa84f',x,.86,z,{flatShading:true}); }
function balustrade(w,x,y,z,ry=0,parent){ const g=grp(x,y,z,ry,parent); rbox(w,.04,.12,MARBLE,0,0,0,.005,g); for(let i=0;i<Math.floor(w/.1);i++){ const bx=-w/2+.05+i*.1; const b=sphere(.03,MARBLE,bx,.07,0,{},g); b.scale.y=1.6; } rbox(w,.04,.14,MARBLE,0,.13,0,.005,g); }
/* 不規則淺水池：腰果形曲線、水面幾乎跟地面一樣高、細細米白石邊、藍灰池底、一排簡潔直立水柱（14:44） */
/* 14:47 家長：階梯照「等高線」的感覺——每一圈自己的曲線、寬窄不同（靠中間步道和銀行那側拉開很緩，外側比較密），不是同一個形狀放大 */
const POND={x:-1.25};
const POND_BASE=[[-.7,.05],[-.55,-.3],[-.15,-.38],[.25,-.28],[.62,-.36],[.75,-.05],[.55,.3],[.15,.38],[-.2,.25],[-.5,.36]].map(([x,z])=>[x*1.03,z*1.03]);
function pondLevel(lv){ /* lv 0＝水面，1~3＝往外一圈一圈的階 */
  return POND_BASE.map(([x,z],j)=>{ const L=Math.hypot(x,z), dx=x/L, dz=z/L; let r=0;
    for(let i=1;i<=lv;i++){ const toward=Math.max(0,dx*.75-dz*.66), n=.75+.5*((Math.sin(j*12.9898+i*78.233)*43758.5453)%1+1)%1; r+=(.045+.1*toward)*n; }
    return [x+dx*r, z+dz*r]; }); }
function pondPts(cx,cz,lv){ const v=pondLevel(lv).map(([x,z])=>new THREE.Vector2(cx+x,-(cz+z))); return new THREE.SplineCurve([...v,v[0]]).getPoints(80); }
function pondShape(cx,cz,lv){ return new THREE.Shape(pondPts(cx,cz,lv)); }
function hexHole(R,hole){ const s=new THREE.Shape(); for(let i=0;i<6;i++){ const a=i*Math.PI/3; i?s.lineTo(R*Math.cos(a),R*Math.sin(a)):s.moveTo(R*Math.cos(a),R*Math.sin(a)); } s.closePath(); if(hole) s.holes.push(new THREE.Path(hole)); return s; }
function ringGeo(cx,cz,outer,inner,dOut=0){ const sh=new THREE.Shape(pondPts(cx,cz,outer)); sh.holes.push(new THREE.Path(pondPts(cx,cz,inner))); return sh; }
function mirrorPool(cx,cz,Y){ const flat=(sh,y,m)=>{ const g=new THREE.ShapeGeometry(sh,4); g.rotateX(-Math.PI/2); const o=add(new THREE.Mesh(g,m)); o.position.y=y; o.castShadow=false; return o; };
  const tops={3:.1,2:.088,1:.076};   /* 地面色塊大約在 .05，水池不能比它低 */   // 每階只低 2.4 公分左右，不陡
  for(const lv of [3,2,1]){ const g=new THREE.ExtrudeGeometry(ringGeo(cx,cz,lv,lv-1),{depth:tops[lv],bevelEnabled:false,curveSegments:4}); g.rotateX(-Math.PI/2); const m=add(new THREE.Mesh(g,mat({3:'#ece5d4',2:'#dccfb4',1:'#c9b997'}[lv],{roughness:.85})));   /* 14:57 越往下越深一點，凹下去比較明顯 */ m.castShadow=false; }
  for(const lv of [2,1,0]){ const pts=pondPts(cx,cz,lv).map(v=>new THREE.Vector3(v.x,(tops[lv+1])+.002,-v.y)); const ln=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),120,.007,4,true),mat('#a8987a')); add(ln).castShadow=false; }   // 每一階前緣一條細細的深一點石線（像等高線）
  flat(pondShape(cx,cz,0),.056,mat('#56747f',{roughness:.8}));                                   // 池底藍灰
  const w=flat(pondShape(cx,cz,0),.066,new THREE.MeshStandardMaterial({color:'#7db4c4',roughness:.05,metalness:.15,transparent:true,opacity:.7})); w.receiveShadow=false; Y=.01;
  /* 14:44 家長：不要圓石，改成像美術館那樣簡潔的直立水柱（沿著水池的曲線排一排，上下起伏） */
  const jm=new THREE.MeshStandardMaterial({color:'#dff3ff',transparent:true,opacity:.75,roughness:.1,emissive:new THREE.Color('#bfe6ff'),emissiveIntensity:.25});
  const jets=[[-.62,.04],[-.32,-.02],[0,0],[.32,-.06],[.62,-.02]].map(([dx,dz],i)=>{ const jx=cx+dx*.9, jz=cz+dz*.9;
    cyl(.022,.022,.012,'#9aa0aa',jx,Y+.045,jz,10);
    const col=new THREE.Mesh(new THREE.CylinderGeometry(.011,.018,1,8),jm); col.position.set(jx,Y+.05,jz); add(col).castShadow=false;
    const top=new THREE.Mesh(new THREE.SphereGeometry(.026,8,6),jm); add(top).castShadow=false; return [col,top,jx,jz,i]; });
  anims.push(t=>{ for(const [col,top,jx,jz,i] of jets){ const h=.32+.09*Math.sin(t*1.6+i*.9); col.scale.y=h; col.position.y=Y+.057+h/2; top.position.set(jx,Y+.057+h,jz); } }); }
function bank(lv){ const Y=.1, fz0=-1.0+1.9/2, hole=pondPts(POND.x,fz0+2.15,3);   // 地基和石板地磚在水池那裡挖一個洞，水池才能往下凹
  { const g=new THREE.ExtrudeGeometry(hexHole(4.2-.42,hole),{depth:.09,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2); const m=add(new THREE.Mesh(g,mat('#d9cfbb'))); m.userData.noCheck=1; }
  { const t=pavingTex.clone(); t.needsUpdate=true; t.repeat.set(1/1.6,1/1.6); const g=new THREE.ShapeGeometry(hexHole(4.2-.55,hole)); g.rotateX(-Math.PI/2); const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:t,roughness:.8})); m.position.y=Y+.012; m.receiveShadow=true; ROOT.add(m); }                                                                                    // 整格鋪石板地磚
  const W=2.8, D=1.9, cz=-1.0, fz=cz+D/2, podH=.3, h=1.55;
  // 台基＋寬大的台階
  rbox(W+.5,podH,D+.9,MARBLE2,0,Y,cz+.2,.02); rbox(W+.56,.05,D+.96,MARBLE,0,Y+podH-.04,cz+.2,.01);
  for(let i=0;i<4;i++) rbox(1.9-i*.0,.075,.2,MARBLE2,0,Y+i*.075,fz+.85-i*.17,.008);
  // 主體牆（切石紋）＋拱窗＋銅門
  const wm=wallMat(3,2.5); const body=rbox(W,h,D,wm,0,Y+podH,cz,.02);
  for(const s of [-1,1]) archWindow(s*.95,Y+podH+.35,fz+.01,.38,.85);
  { const dg=grp(0,Y+podH,fz+.02); rbox(.82,1.12,.06,MARBLE2,0,0,0,.01,dg); rbox(.66,1.0,.04,BRONZE,0,.02,.03,.01,dg); for(const s of [-1,1]) for(let r=0;r<3;r++) rbox(.24,.24,.02,'#a8823f',s*.15,.12+r*.3,.06,.005,dg);
    for(const s of [-1,1]) sphere(.025,mat(GOLD,{metalness:.5,roughness:.3}),s*.05,.5,.08,{},dg); }
  // 前面的柱廊：六根羅馬柱＋橫樑＋三角山牆
  const ch=h, py=Y+podH, pz=fz+.48; for(const cx0 of [-(W/2-.12),-(W/2-.12)*.42,(W/2-.12)*.42,W/2-.12]) ionic(cx0,py,pz,ch,.1);   /* 11-19 18:58：原本 6 根有兩根擋在門口，改成 4 根、中間讓出走道 */
  rbox(W+.1,.05,.75,MARBLE2,0,py-.01,fz+.3,.005);
  const eh=entablature(W+.2,.85,0,py+ch,fz+.2,null,.78); pediment(W+.4,0,py+ch+eh,fz+.55);
  plate(bankSign,1.35,.17,0,py+ch+.27,fz+.63);
  rbox(W,.06,D,MARBLE,0,Y+podH+h,cz,.01); balustrade(W-.2,0,Y+podH+h+.06,cz-D/2+.1); for(const s of [-1,1]){ balustrade(D-.3,s*(W/2-.1),Y+podH+h+.06,cz,Math.PI/2); urn(s*(W/2-.1),Y+podH+h+.06,cz-D/2+.1); }
  // 廣場上的銅牛（家長 11-19 13:41 已取得授權；13:45 牛頭朝向銀行）：矮的深灰石台座＋霧面古銅色
  { const bx=1.55, bz=fz+2.25, bd=.88, ry=-Math.PI/2-.3, sY=Y+.2;   /* 14:19 牛頭往右轉，從前面看得到牛臉（斜斜朝水池和大門之間） */   /* 13:59 往水池移一點（臉不要被路燈擋住）、牛頭看向銀行大門；13:50 牛是亮銀白；底座改高級青銅色 */
    const pg=grp(bx,Y,bz,ry), BZ=mat('#94703f',{metalness:.6,roughness:.3}), BZD=mat('#6f5130',{metalness:.5,roughness:.4}), TRIM=mat('#c9a14a',{metalness:.6,roughness:.28});
    rbox(.62,.05,bd+.16,MARBLE2,0,0,0,.012,pg);                                  // 最下面一層米白大理石
    rbox(.54,.12,bd+.06,BZ,0,.05,0,.02,pg);                                      // 青銅台身
    rbox(.56,.02,bd+.08,TRIM,0,.068,0,.004,pg); rbox(.57,.02,bd+.09,TRIM,0,.155,0,.004,pg);   // 上下兩條金色細邊
    rbox(.5,.03,bd+.02,BZD,0,.17,0,.006,pg);                                     // 頂面深一點的青銅
    for(const s of [-1,1]) rbox(.004,.06,.3,TRIM,s*.272,.08,0,.002,pg);           // 兩側金色小名牌
    kit('models/sk/bank_bull.glb',bx,bz,{d:bd,y0:sY,rot:Math.PI,then:o=>o.traverse(m=>{ if(!m.isMesh) return; m.material=new THREE.MeshStandardMaterial({color:'#e4e8ee',roughness:.12,metalness:.35,normalMap:m.material.normalMap}); })}).rotation.y=ry-Math.PI; }
  // 左前方不規則淺水池（家長 14:30：參考台中勤美術館，曲線、貼著地面、像鏡子；不噴水，只有很淡的漣漪）
  mirrorPool(POND.x,fz+2.15,Y);
  // 門口對稱：兩盞雙頭古典路燈、兩盆修剪成圓球的樹
  for(const s of [-1,1]){ lampPost(s*1.2,fz+.85); topiary(s*2.3,fz+.9); }   /* 14:14 路燈移到台階兩邊，不擋銅牛 */
  if(lv>=2){ // 兩側翼樓（壁柱＋拱窗＋欄杆）＋中央金頂圓頂＋廣場噴水池
    for(const s of [-1,1]){ const wx=s*(W/2+.75); rbox(1.4,h*.82,1.6,wallMat(1.5,2),wx,Y+podH-.15,cz-.1,.02); rbox(1.5,.08,1.7,MARBLE,wx,Y+podH-.15+h*.82,cz-.1,.01);
      archWindow(wx,Y+podH+.2,cz+.71,.34,.72); for(const dx of [-.62,.62]) rbox(.1,h*.82,.06,MARBLE2,wx+dx,Y+podH-.15,cz+.71,.01);
      balustrade(1.3,wx,Y+podH-.07+h*.82,cz+.62); urn(wx+s*.65,Y+podH-.07+h*.82,cz+.62,.9); }
    const dy=Y+podH+h+.06; cyl(.62,.66,.35,MARBLE,0,dy,cz-.1,32); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; rbox(.05,.3,.05,MARBLE2,Math.cos(a)*.64,dy+.02,cz-.1+Math.sin(a)*.64,.005); }
    const dome=sphere(.6,mat('#c9a14a',{metalness:.45,roughness:.35}),0,dy+.35,cz-.1); dome.scale.y=.8; cyl(.08,.1,.22,MARBLE,0,dy+.8,cz-.1,12); sphere(.07,mat(GOLD,{metalness:.5,roughness:.3}),0,dy+1.07,cz-.1);
    clock(.16,null,0,py+ch+eh+.32,fz+.6);
    /* 14:35 中間的圓形噴水池拿掉（城市裡水池太多），改成左前方的不規則淺水池 */ }
}

const LVS=(id,name,fn,names)=>names.map((n,i)=>[id+(i?i+1:''),name+' Lv'+(i+1)+' '+n,()=>fn(i+1),'whole']);
export const ART_LV=LVS('art','美術館',art,['美術館','大美術館']), ART_TOP=[0,3.0,4.6];
export const BANK_LV=LVS('bank','銀行',bank,['小銀行','銀行']), BANK_TOP=[0,2.4,3.1];   /* 家長 11-18 16:11：銀行只要兩級（Lv3 玻璃高樓不用，程式保留） */
