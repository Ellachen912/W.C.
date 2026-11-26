/* Winston City 第二階段：美術館（文化區，整格，2 級；家長 11-19 10:03 重新構思、10:18「好」）
   家長：原本紅黃藍方塊太像兒童館 → 改成現代美術館，要有設計感。
   配色：白色清水模、淺灰石材、暖木色、黑色細鋼框，只用香檳金當重點色。
   Lv1 美術館：高低錯開的白色量體、正面整片落地玻璃（黑鋼細框）、上層木格柵量體往外懸挑、很薄的懸挑大屋簷＋兩根細鋼柱、
               門前倒影水池、8 字形不鏽鋼雕像（Sketchfab「Figure 8 Sculpture」CC-BY-4.0）、矮樹籬、柱狀樹、對稱的地燈。
   Lv2 大美術館：左邊加一棟往上越來越寬的螺旋圓樓（像古根漢美術館）：白色環帶一圈圈疊上去、中間夾玻璃窗帶（晚上透光）、
               頂上圓形玻璃天窗；用玻璃空橋接到主館。
   座標：格子中心為原點、正門朝 +z；平頂六角形，|x| ≤ 3.78 − |z|/√3。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, hexPad, canvasTex, anims } from './lib.js';
import { kit } from './s1_kit.js';

const CONC='#efeee9', STONE='#d4d1c9', STONE2='#bcb8ae', WOOD='#b98a5a', STEEL='#26282d', GOLD='#c8a96a', HEDGE='#4f8f4a';
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
/* 清水模：淡淡的模板分割線＋小圓孔 */
const concTex=canvasTex((g,s)=>{ g.fillStyle=CONC; g.fillRect(0,0,s,s); let r=4; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let i=0;i<300;i++){ g.fillStyle=`rgba(${R()<.5?'150,148,140':'255,255,255'},${R()*.08})`; g.beginPath(); g.arc(R()*s,R()*s,4+R()*20,0,7); g.fill(); }
  g.strokeStyle='rgba(120,118,110,.28)'; g.lineWidth=1.5; for(let y=0;y<=s;y+=s/2){ g.beginPath(); g.moveTo(0,y); g.lineTo(s,y); g.stroke(); } for(let x=0;x<=s;x+=s/4){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,s); g.stroke(); }
  g.fillStyle='rgba(110,108,100,.45)'; for(let y=s/8;y<s;y+=s/4) for(let x=s/8;x<s;x+=s/8) { g.beginPath(); g.arc(x,y,2.2,0,7); g.fill(); } },256);
const concM=(w,h)=>{ const t=concTex.clone(); t.needsUpdate=true; t.repeat.set(Math.max(1,w*1.2),Math.max(1,h*1.2)); return new THREE.MeshStandardMaterial({map:t,roughness:.85}); };
/* 地面：淺灰大片石材鋪面 */
const paveTex=canvasTex((g,s)=>{ g.fillStyle=STONE; g.fillRect(0,0,s,s); let r=8; const R=()=>((r=r*16807%2147483647)/2147483647);
  for(let j=0;j<4;j++) for(let i=0;i<2;i++){ g.fillStyle=['#d6d3cb','#cfccc3','#dad7cf','#cbc8bf'][(i+j*3)%4]; g.fillRect(i*s/2+1.5,j*s/4+1.5,s/2-3,s/4-3); }
  for(let i=0;i<400;i++){ g.fillStyle=`rgba(120,115,105,${R()*.12})`; g.fillRect(R()*s,R()*s,2,2); } },256);
const glassM=new THREE.MeshStandardMaterial({color:'#9fc3d1',roughness:.08,metalness:.2,transparent:true,opacity:.55,emissive:new THREE.Color('#ffd9a0'),emissiveIntensity:.08});
const glassLit=new THREE.MeshStandardMaterial({color:'#cfe2ea',roughness:.1,metalness:.1,emissive:new THREE.Color('#ffd9a0'),emissiveIntensity:.35});   // 玻璃後面的室內光

/* 落地玻璃帷幕：黑鋼細框格子 */
function curtain(w,h,x,y,z,ry=0){ const g=grp(x,y,z,ry); rbox(w,h,.02,glassLit,0,0,0,.002,g);
  const n=Math.max(2,Math.round(w/.32)); for(let i=0;i<=n;i++) rbox(.025,h,.035,STEEL,-w/2+i*w/n,0,.02,.003,g);
  for(const yy of [0,h*.42,h-.025]) rbox(w,.025,.035,STEEL,0,yy,.02,.003,g); return g; }
/* 木格柵：一排直立木條 */
function louvers(w,h,x,y,z){ const n=Math.round(w/.07); for(let i=0;i<n;i++) rbox(.03,h,.05,WOOD,x-w/2+.035+i*w/n,y,z,.004); }
function cypress(x,z,k=1){ cyl(.03*k,.04*k,.25*k,'#6b4a2e',x,.1,z,6); const f=sphere(.22*k,mat('#3f7f4a',{flatShading:true}),x,.1+.75*k,z); f.scale.set(.75,2.2,.75); }
function hedge(w,d,x,z){ rbox(w,.26,d,mat(HEDGE,{roughness:.95}),x,.1,z,.06); }
function bollard(x,z){ rbox(.07,.32,.07,STEEL,x,.1,z,.01); rbox(.075,.06,.075,mat('#fff3d0',{emissive:new THREE.Color('#ffd98a'),emissiveIntensity:.8}),x,.36,z,.01); }
function bench(x,z,ry=0){ const g=grp(x,.1,z,ry); rbox(.9,.18,.3,STONE2,0,0,0,.02,g); rbox(.86,.04,.26,WOOD,0,.18,0,.01,g); }
/* 8 字形雕像：拋光不鏽鋼（亮銀色、很光滑）放在石台上 */
function fig8(x,z){ const g=grp(x,.1,z,0); rbox(.7,.12,.7,STONE2,0,0,0,.02,g); rbox(.56,.38,.56,'#e7e4dd',0,.12,0,.02,g); rbox(.6,.04,.6,GOLD,0,.5,0,.01,g);
  kit('models/sk/art_fig8.glb',0,0,{h:1.0,y0:.54,rot:.5,parent:g,then:o=>o.traverse(m=>{ if(m.isMesh){ if(!m.geometry.attributes.normal) m.geometry.computeVertexNormals(); m.material=new THREE.MeshStandardMaterial({color:'#e4e8ee',roughness:.12,metalness:.35}); } })}); }

function mainHall(){ const X=.6, Z=-1.3, W=3.3, D=1.7, H=1.3, Y=.1, fz=Z+D/2;
  rbox(W+.2,.08,D+.2,STONE2,X,Y,Z,.01);                                                     // 石材基座
  // 左右兩道清水模牆夾住中間的玻璃門廳
  rbox(.9,H,D,concM(.9,H),X-W/2+.45,Y+.08,Z,.01); rbox(.8,H+.35,D,concM(.8,H+.35),X+W/2-.4,Y+.08,Z,.01); rbox(.84,.04,D+.04,mat('#f6f5f1'),X+W/2-.4,Y+.08+H+.35,Z,.004);
  rbox(W-1.7,H,D-.3,concM(W-1.7,H),X-.05,Y+.08,Z-.15,.01);                                 // 門廳後牆
  curtain(W-1.7,H-.02,X-.05,Y+.08,fz-.02);                                                    // 正面整片落地玻璃
  rbox(.62,.82,.02,mat(GOLD,{roughness:.4}),X-.05,Y+.08,fz+.005,.004); rbox(.54,.76,.02,glassLit,X-.05,Y+.1,fz+.012,.003);   // 香檳金框的大門
  // 上層：木格柵量體往右懸挑
  rbox(2.4,.75,1.4,concM(2.4,.75),X+.8,Y+.08+H,Z-.1,.01); louvers(2.3,.62,X+.8,Y+.14+H,Z-.1+.71);
  rbox(2.46,.06,1.46,mat('#f6f5f1'),X+.8,Y+.08+H+.75,Z-.1,.005); rbox(2.48,.025,1.48,STEEL,X+.8,Y+.08+H+.73,Z-.1,.003);   // 上層屋頂：白色薄板＋黑鋼細邊
  // 很薄的懸挑大屋簷＋兩根細鋼柱
  rbox(2.0,.06,1.25,mat('#f6f5f1'),X-.55,Y+.08+H,fz+.45,.005); rbox(2.0,.02,1.25,STEEL,X-.55,Y+.08+H-.02,fz+.45,.003);
  for(const sx of [-1.35,.25]) cyl(.025,.025,H,STEEL,X+sx,Y,fz+.95,8);
  // 側面一道窄長窗、右邊高牆上香檳金的細線條
  rbox(.04,H*.8,.5,glassLit,X+W/2+.005,Y+.25,Z+.2,.003); for(let i=0;i<4;i++) rbox(.02,.02,D+.02,GOLD,X+W/2-.4,Y+.35+i*.3,Z,.002);
  return {X,Z,W,D,fz}; }
function pool(x,z,w,d){ rbox(w+.16,.08,d+.16,STONE2,x,.1,z,.01); const wm=new THREE.Mesh(new THREE.BoxGeometry(w,.01,d),mat('#3d5f73',{roughness:.05,metalness:.3})); wm.position.set(x,.185,z); wm.receiveShadow=true; add(wm);
  for(let i=0;i<5;i++) rbox(.12,.014,.12,mat('#fff3d0',{emissive:new THREE.Color('#ffd98a'),emissiveIntensity:.6}),x-w/2+.2+i*(w-.4)/4,.142,z+d/2+.05,.002);   // 池邊地燈：放在石邊上，不要埋在水面裡（11-19 18:58 家長說燈會閃）
  // 一排簡單的直立噴泉（家長 11-19 10:51）：細水柱上下起伏，頂端一點水花
  const jm=new THREE.MeshStandardMaterial({color:'#dff3ff',transparent:true,opacity:.75,roughness:.1,emissive:new THREE.Color('#bfe6ff'),emissiveIntensity:.25});
  const jets=[]; for(let i=0;i<5;i++){ const jx=x-w/2+.2+i*(w-.4)/4, jz=z-.05;
    cyl(.025,.025,.02,'#9aa0aa',jx,.18,jz,10);
    const col=new THREE.Mesh(new THREE.CylinderGeometry(.012,.02,1,8),jm); col.position.set(jx,.19,jz); add(col);
    const top=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),jm); add(top); jets.push([col,top,jx,jz,i]); }
  anims.push(t=>{ for(const [col,top,jx,jz,i] of jets){ const h=.38+.1*Math.sin(t*1.6+i*.9); col.scale.y=h; col.position.y=.19+h/2; top.position.set(jx,.19+h,jz); } }); }
/* 古根漢式螺旋圓樓：白色環帶一圈比一圈寬，中間夾玻璃窗帶，頂上玻璃天窗 */
function rotunda(x,z){ const g=grp(x,.1,z,0); let y=.06; rbox(2.3,.06,2.3,STONE2,0,0,0,.02,g);
  for(let i=0;i<4;i++){ const r=.7+i*.1, h=.34; const band=add(new THREE.Mesh(new THREE.CylinderGeometry(r,r-.06,h,40,1,false),concM(2,.4)),g); band.position.y=y+h/2; band.castShadow=true;
    const gl=add(new THREE.Mesh(new THREE.CylinderGeometry(r-.1,r-.12,.1,40,1,true),glassLit),g); gl.position.y=y+h+.05; y+=h+.1; }
  const cap=add(new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.0,.05,40),mat('#f6f5f1')),g); cap.position.y=y+.02;
  const dome=add(new THREE.Mesh(new THREE.SphereGeometry(.62,32,12,0,Math.PI*2,0,Math.PI*.32),glassM),g); dome.position.y=y-.33; dome.scale.y=1;
  for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, rib=add(new THREE.Mesh(new THREE.TorusGeometry(.62,.008,4,24,Math.PI*.32),mat(STEEL)),g); rib.position.y=y-.33; rib.rotation.set(0,a,Math.PI/2); rib.rotation.order='YZX'; }
  rbox(.5,.62,.02,glassLit,0,.06,.72,.003,g); rbox(.56,.04,.06,GOLD,0,.68,.72,.004,g);    // 圓樓入口
  return y; }

function art(lv){ const pt=paveTex.clone(); pt.needsUpdate=true; pt.repeat.set(3,3); hexPad(new THREE.MeshStandardMaterial({map:pt,roughness:.9}),.42,.07,0);
  const M=mainHall();
  // 步道兩旁：矮樹籬、對稱的地燈；倒影水池在右前方，雕像在左前方
  for(const s of [-1,1]){ hedge(.22,1.6,.1+s*.62,2.05); bollard(.1+s*.5,1.45); bollard(.1+s*.5,2.65); }
  pool(1.55,.75,1.5,.75); fig8(-1.05,1.35);
  bench(1.55,1.55,0); for(const [x,z] of [[2.6,.2],[2.75,-.6],[-.55,-.05]]) cypress(x,z,.9);
  if(lv>=2){ const top=rotunda(-2.15,-.45);
    // 玻璃空橋：圓樓接到主館
    rbox(.45,.36,.42,glassLit,-1.27,.7,-.8,.003); rbox(.47,.03,.44,STEEL,-1.27,.69,-.8,.003); rbox(.47,.03,.44,STEEL,-1.27,1.06,-.8,.003);
    for(const [x,z] of [[-3.0,.8],[-1.35,.95]]) cypress(x,z,.8); }
  else { for(const [x,z] of [[-2.4,-.9],[-1.8,-1.6],[-2.8,.1]]) cypress(x,z,1); hedge(1.2,.22,-2.1,.75); bench(-2.1,.35,0); }
}
export const ART_LV=[['art','美術館',()=>art(2),'whole']], ART_TOP=[0,3.0];   // 家長 11-19 10:51：只要一級（原本的 Lv2 樣子）
