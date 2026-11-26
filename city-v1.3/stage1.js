/* Winston City 第一階段 14 棟建築（樣張：先畫 Lv1）。每棟一個主題色和一個招牌特徵，升級只加東西、不換顏色。
   座標：建地中心為原點，正門朝 +z。整格建地約 ±2.2；半格小店約 ±1.1（x）× ±1.4（z）。 */
import * as THREE from 'three';
import { kit, IND } from './s1_kit.js';
import { animals, ROOT, add, rbox, cyl, sphere, mat, hip, prism, archWin, GOLDM, flag, glassMat, tree, bush, lamp, bench, stoneTex, texMat, canvasTex, grassTex, spinners, shade, puff, wallMat } from './lib.js';

/* ---------- 共用零件 ---------- */
const WHITE='#fbfaf6', DARK='#4d4a63', WOOD='#c98d55', SOIL='#7a5a3a';
// 兩點之間的圓柱（電線、斜撐、桿子）
export function beam(a,b,r,c,seg=8){
  const A=new THREE.Vector3(...a), B=new THREE.Vector3(...b), d=B.clone().sub(A), len=d.length();
  const m=add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,seg),mat(c)));
  m.position.copy(A).add(B).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); return m;
}
// 牆：底座＋牆身＋飾帶，回傳牆頂高度
export function block(cx,cz,w,d,h,wall,{base='#d9d2c4',trim=WHITE,y0=0}={}){
  rbox(w+.16,.16,d+.16,base,cx,y0,cz,.04);
  rbox(w,h,d,typeof wall==='string'?wallMat(wall,Math.max(w,d),h):wall,cx,y0+.16,cz,.04);   // 牆面有小磁磚紋路（家長 11-18 23:28）
  rbox(w+.12,.1,d+.12,trim,cx,y0+.16+h,cz,.03);
  return y0+.26+h;
}
// 方形窗（rot：0 朝前、±π/2 朝側面）
export function win(x,y,z,w,h,rot=0,frame=WHITE){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rot; ROOT.add(g);
  rbox(w+.08,h+.08,.05,frame,0,-.04,0,.015,g);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(w,h),glassMat); gl.position.set(0,h/2,.03); g.add(gl);
  rbox(.03,h,.02,frame,0,0,.035,.008,g);
  rbox(w+.14,.04,.08,frame,0,-.07,.03,.015,g);
  return g;
}
export function door(x,y,z,w,h,c,rot=0,frame=WHITE){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rot; ROOT.add(g);
  rbox(w+.1,h+.05,.05,frame,0,0,0,.015,g); rbox(w,h,.07,c,0,0,0,.015,g);
  sphere(.028,GOLDM(),w*.32,h*.5,.05,{},g);
  return g;
}
// 條紋遮陽棚：寬 w，往前伸 d，兩色交錯
export function awning(cx,y,z,w,d,c1,c2,tilt=.38){
  const n=Math.max(3,Math.round(w/.16)), sw=w/n;
  for(let i=0;i<n;i++){ const s=rbox(sw,.035,d,i%2?c2:c1,cx-w/2+(i+.5)*sw,y,z+d/2*Math.cos(tilt),.008); s.rotation.x=tilt; }
  rbox(w,.07,.03,c1,cx,y-.05-d*Math.sin(tilt)*.5,z+d*Math.cos(tilt),.01);
}
export function smoke(x,y,z,o={}){ puff(x,y-.2,z,{r:.2,rise:1.2,...o}); }   // 會動的煙
// 程式畫的圓牌（招牌）
function discTex(draw){ return canvasTex(draw,256); }
export function disc(r,tex,x,y,z,rot=0,rim='#ffffff'){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rot; ROOT.add(g);
  const f=add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,.06,40),mat(rim)),g); f.rotation.x=Math.PI/2;
  const face=new THREE.Mesh(new THREE.CircleGeometry(r,40),new THREE.MeshStandardMaterial({map:tex,roughness:.7})); face.position.z=.032; g.add(face);
  const t=add(new THREE.Mesh(new THREE.TorusGeometry(r,.03,8,40),mat(rim)),g); return g;
}
// 小籬笆（沿 x 或 z）
export function fence(x0,z0,len,alongX,c='#ffffff',h=.3){
  const n=Math.max(2,Math.round(len/.22));
  for(let i=0;i<=n;i++){ const t=i/n*len; rbox(.05,h,.05,c,alongX?x0+t:x0,0,alongX?z0:z0+t,.01); }
  for(const y of [h*.4,h*.8]) rbox(alongX?len:.03,.035,alongX?.03:len,c,alongX?x0+len/2:x0,y,alongX?z0:z0+len/2,.008);
}
export function lawnPad(x,z,w,d,r=.1){ rbox(w,.1,d,new THREE.MeshStandardMaterial({map:grassTex,roughness:.95}),x,0,z,r); }

/* ========== 1 發電廠：淺灰廠房＋亮黃飾帶、黃色閃電標誌、黃白條紋煙囪、旁邊有電塔 ========== */
export const POWER={wall:'#e6e3dc', main:'#f2c230', roof:'#7b8191'};
function bolt(s){ const p=[[.05,.5],[-.22,-.02],[-.02,-.02],[-.1,-.5],[.24,.08],[.04,.08],[.18,.5]]; const sh=new THREE.Shape(); p.forEach(([x,y],i)=>i?sh.lineTo(x*s,y*s):sh.moveTo(x*s,y*s)); sh.closePath();
  return new THREE.ExtrudeGeometry(sh,{depth:.05,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:1}); }
function pylon(x,z,h=2.2){
  const leg=.28, top=.07;
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) beam([x+sx*leg,0,z+sz*leg],[x+sx*top,h,z+sz*top],.025,'#8d93a3',6);
  for(let k=1;k<4;k++){ const y=h*k/4, w=leg-(leg-top)*k/4; rbox(w*2+.06,.04,.04,'#8d93a3',x,y,z+w,.01); rbox(w*2+.06,.04,.04,'#8d93a3',x,y,z-w,.01); }
  for(const y of [h*.78,h]){ rbox(1.0,.06,.06,'#8d93a3',x,y,z,.01); for(const s of [-1,1]) cyl(.035,.035,.12,'#ffffff',x+s*.45,y-.12,z,8); }
  return [[x-.45,h-.12,z],[x+.45,h-.12,z],[x-.45,h*.78-.12,z],[x+.45,h*.78-.12,z]];
}
export function solar(cx,y,cz,nx,nz,s=.42){        // 太陽能板：一排排往前斜的深藍板子
  for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){ const x=cx+(i-(nx-1)/2)*s*1.05, z=cz+(j-(nz-1)/2)*s*.95;
    const p=rbox(s,.035,s*.62,'#2f4f8f',x,y+.12,z,.01); p.rotation.x=-.45; p.material=mat('#2f4f8f',{roughness:.25,metalness:.3});
    const l=rbox(s*.04,.04,s*.62,'#c9d6ee',x,y+.125,z,.004); l.rotation.x=-.45; cyl(.02,.02,.14,'#9a98a8',x,y,z+.05,6); }
}
export const rotors=[];                      // 風車葉片（遊戲裡繞 z 軸轉）
export function turbine(x,z,h=3.2,r=1.0,rot=0,y0=0){
  cyl(.06,.11,h,'#f7f7f4',x,y0,z,16);
  const g=new THREE.Group(); g.position.set(x,y0+h,z); g.rotation.y=rot; ROOT.add(g);
  rbox(.18,.18,.42,'#f7f7f4',0,-.09,-.08,.05,g); rbox(.19,.05,.43,POWER.main,0,-.03,-.08,.01,g);
  const hub=new THREE.Group(); hub.position.set(0,0,.16); g.add(hub); rotors.push(hub);
  sphere(.09,'#f7f7f4',0,0,0,{},hub);
  for(let k=0;k<3;k++){ const a=new THREE.Group(); a.rotation.z=k/3*Math.PI*2+.3; hub.add(a); rbox(.1,r,.03,'#f7f7f4',0,.05,0,.015,a); rbox(.1,r*.12,.035,'#e5484d',0,r*.93,0,.01,a); }
}
function coolingTower(x,z,r=.7,h=2.0,steam=true){
  const pts=[]; for(let i=0;i<=12;i++){ const t=i/12; pts.push(new THREE.Vector2(r*(.62+.38*Math.pow(2*t-1,2))*(t<.5?1.08:1)-(t>.5?.06*(t-.5):0),t*h)); }
  const m=add(new THREE.Mesh(new THREE.LatheGeometry(pts,32),mat('#f2f0ea',{side:THREE.DoubleSide}))); m.position.set(x,0,z);
  const band=add(new THREE.Mesh(new THREE.LatheGeometry(pts.slice(9,11),32),mat(POWER.main,{side:THREE.DoubleSide}))); band.position.set(x,.005,z); band.scale.set(1.01,1,1.01);
  const top=add(new THREE.Mesh(new THREE.CylinderGeometry(pts[12].x-.03,pts[12].x-.03,.02,32),mat('#b9bcc6'))); top.position.set(x,h-.05,z);
  for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; cyl(.03,.03,.22,'#d9d6ce',x+Math.cos(a)*r*1.02,0,z+Math.sin(a)*r*1.02,6); }
  const sm=new THREE.MeshStandardMaterial({color:'#ffffff',transparent:true,opacity:.7,roughness:1});
  if(steam) puff(x,h-.05,z,{r:.5,rise:1.4,drift:.3,n:4,speed:.22,sy:.7,op:.7});   // 冷卻塔的水蒸氣會往上飄
}
function battery(x,z){ rbox(.5,.62,.4,'#fbfaf6',x,0,z,.05); rbox(.18,.05,.1,'#cfd3da',x,.62,z,.02);
  for(let i=0;i<4;i++) rbox(.3,.08,.02,i<3?'#5bc46a':'#e3e6ea',x,.08+i*.12,z+.205,.01);
  const b=add(new THREE.Mesh(bolt(.32),mat(POWER.main))); b.position.set(x+.17,.5,z+.2); }
// Lv5 零件：觀景台、浮動太陽能板、海浪發電浮球、能源教室、大燈泡
function lookout(x,y,z){
  cyl(.5,.42,.1,'#f2e3c8',x,y,z,24);
  for(let k=0;k<16;k++){ const a=k/16*Math.PI*2; cyl(.012,.012,.26,'#ffffff',x+Math.cos(a)*.47,y+.1,z+Math.sin(a)*.47,5); }
  const r=add(new THREE.Mesh(new THREE.TorusGeometry(.47,.022,6,40),mat('#ffffff'))); r.rotation.x=Math.PI/2; r.position.set(x,y+.36,z);
  const dome=add(new THREE.Mesh(new THREE.SphereGeometry(.24,20,10,0,Math.PI*2,0,Math.PI/2),glassMat)); dome.position.set(x,y+.1,z);
  cyl(.03,.03,.3,'#d9d6ce',x,y+.34,z,8); flag(x,z,.45,'city',y+.6);
}
function floatSolar(cx,cz,nx,nz,y=-.42){
  for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){ const x=cx+(i-(nx-1)/2)*.62, z=cz+(j-(nz-1)/2)*.62;
    rbox(.56,.08,.56,'#f4f4f0',x,y,z,.03);
    kit(IND('solar-panel-landscape'),x,z,{w:.5,y0:y+.08,rot:Math.PI}); }   // Kenney 太陽能板
  for(let i=0;i<nx-1;i++) rbox(.08,.04,.62*nz,'#d9d6ce',cx+(i-(nx-2)/2)*.62,y+.02,cz,.01);
}
function waveBuoy(x,z,y=-.45){
  const b=sphere(.26,mat(POWER.main,{roughness:.4}),x,y+.12,z); b.scale.y=.75;
  cyl(.03,.03,.45,'#ffffff',x,y+.25,z,8); sphere(.05,'#ff6b6b',x,y+.75,z,{emissive:0xff4040,emissiveIntensity:.4});
  rbox(.36,.03,.04,'#ffffff',x,y+.3,z,.01);
}
function energyClass(x,z){
  rbox(1.2,.12,.8,'#e6e3dc',x,0,z,.03);
  rbox(1.1,.6,.7,glassMat,x,.12,z,.02);
  for(const dx of [-.55,0,.55]) rbox(.05,.6,.05,'#ffffff',x+dx,.12,z+.35,.01);
  rbox(1.22,.08,.82,P_MAIN(),x,.72,z,.02); rbox(1.3,.05,.9,'#ffffff',x,.8,z,.02);
  solar(x,.85,z,2,1,.4);
  for(const [dx,c] of [[-.25,'#5bc46a'],[.05,'#3d9ad1'],[.3,'#f2c230']]) rbox(.16,.22,.12,c,x+dx,.12,z,.02);
}
const P_MAIN=()=>POWER.main;
function bulb(x,z){
  rbox(.42,.3,.42,'#f4f2ea',x,0,z,.05); rbox(.46,.05,.46,POWER.main,x,.3,z,.02);
  for(let i=0;i<3;i++) cyl(.13-i*.01,.13-i*.01,.06,i%2?'#cfd3da':'#b9bcc6',x,.35+i*.06,z,20);
  const g=sphere(.3,mat('#fff6cf',{emissive:0xffd84a,emissiveIntensity:.9,roughness:.2,transparent:true,opacity:.85}),x,.8,z); g.scale.set(1,1.1,1);
  const fil=add(new THREE.Mesh(new THREE.TorusGeometry(.08,.012,6,16,Math.PI),mat('#ff9f2e',{emissive:0xff8a00,emissiveIntensity:.8}))); fil.position.set(x,.78,z); fil.rotation.z=Math.PI;
  cyl(.012,.012,.2,'#f2a93a',x-.08,.56,z,6); cyl(.012,.012,.2,'#f2a93a',x+.08,.56,z,6);
}
function power(lv){
  const P=POWER;
  const top=block(-.45,-.55,2.4,1.6,1.2,P.wall,{base:'#cfcabd',trim:P.main});
  rbox(2.4,.12,1.6,P.roof,-.45,top,-.55,.03);
  rbox(2.52,.08,.08,P.main,-.45,top+.12,.29,.02);
  // 正面：大鐵捲門、窗、閃電（Lv5 閃電發光）
  rbox(.9,.8,.05,'#b9bcc6',-.95,.16,.26,.02); for(let i=1;i<7;i++) rbox(.88,.015,.02,'#9fa3b0',-.95,.16+i*.11,.29,.005);
  rbox(1.0,.06,.07,P.main,-.95,.98,.27,.02);
  win(.1,.5,.26,.34,.38,0,WHITE); win(.55,.5,.26,.34,.38,0,WHITE);
  const b=add(new THREE.Mesh(bolt(lv>=4?1.25:1.0),lv>=4?mat(P.main,{emissive:0xffc21a,emissiveIntensity:.6,roughness:.4}):mat(P.main,{metalness:.2,roughness:.4}))); b.position.set(.33,1.08,.26);
  win(.75,.5,-.55,.3,.36,Math.PI/2,WHITE); win(-1.65,.5,-.55,.3,.36,-Math.PI/2,WHITE);
  // 煙囪：黃白條紋（Lv2 起兩根）
  // Lv5 煙囪退休：不冒煙，漆成淺色木星條紋；前面那根頂上加觀景台
  const JUP=['#fbf3e3','#e8c79c','#f8ecd6','#e3bd92','#faf0de','#ebcda6'];
  for(const cx of lv>=2?[-1.35,-.6]:[-1.35]){ const cz=-1.65; rbox(.7,.18,.7,'#cfcabd',cx,0,cz,.04);
    for(let i=0;i<6;i++) cyl(.27-i*.012,.28-i*.012,.4,lv>=5?JUP[(i+(cx<-1?1:0))%6]:(i%2?WHITE:P.main),cx,.18+i*.4,cz,20);
    if(lv>=5){ const spot=sphere(.11,'#e7987c',cx+.1,1.1,cz+.2); spot.scale.set(1.4,.65,.45);
      if(cx>-1) lookout(cx,2.58,cz); else cyl(.24,.24,.12,'#f2e3c8',cx,2.58,cz,20); }
    else { cyl(.24,.24,.12,P.roof,cx,2.58,cz,20); smoke(cx,2.95,cz); } }
  // 變電場：電塔＋變壓器＋圍籬（Lv2 起三個變壓器）
  rbox(1.5,.08,1.5,'#d8d2c4',1.35,0,.75,.03);
  for(const [x,z] of lv>=2?[[1.0,.4],[1.0,.85],[1.0,1.3]]:[[1.0,.45],[1.0,1.15]]){ rbox(.36,.36,.3,'#a7adbb',x,.08,z,.03); for(const dx of [-.1,0,.1]) cyl(.03,.03,.16,'#ffffff',x+dx,.44,z,6); rbox(.38,.05,.32,P.main,x,.28,z,.01); }
  const tips=pylon(1.6,.8,2.1);
  beam(tips[0],[.55,top+.02,-.1],.012,DARK,4); beam(tips[2],[.55,top-.3,-.1],.012,DARK,4);
  beam(tips[1],[2.3,1.6,.8],.012,DARK,4); beam(tips[3],[2.3,1.3,.8],.012,DARK,4);
  fence(.62,1.52,1.46,true,'#b9bcc6',.28);
  // Lv2：屋頂太陽能板、前面小控制室
  if(lv>=2){ for(const x of [-1.0,.1]) kit(IND('solar-panel-landscape-group'),x,-.55,{w:1.05,y0:top+.1,rot:Math.PI});   // Kenney 太陽能板
    const t2=block(-1.5,.95,1.0,.75,.7,P.wall,{base:'#cfcabd',trim:P.main}); rbox(1.0,.08,.75,P.roof,-1.5,t2,.95,.02);
    door(-1.75,.16,1.33,.28,.5,P.roof); win(-1.3,.4,1.33,.3,.26); }
  // Lv3：大冷卻塔
  if(lv>=3) coolingTower(1.35,-1.35,.72,2.1,lv<5);   // Lv5 不再燒燃料，冷卻塔也不冒煙
  // Lv4：兩座陸上風車、儲能電池、西邊外海三座海上風機（遊戲裡發電廠在西南角）
  if(lv>=4){ turbine(-2.45,.1,3.1,1.0); turbine(2.55,-.25,3.3,1.05);   // 風車用原本的（家長 16:01）
    for(const x of [-.45,.15]) battery(x,1.55);
    /* 海上風機（家長 11-20 08:17）：11-18 陸地放大之後，原本的位置變成陸地上，往西南外海移到新海岸線外面 */
    for(const [x,z,h] of [[-9.4,16.0,2.5],[-13.9,13.0,2.5],[-4.9,18.5,2.5]]){ cyl(.34,.38,1.2,'#f2c230',x,-1.05,z,16); turbine(x,z,h,.85,0,0); } }
  // Lv5：煙囪變觀景塔（上面）、海上浮動太陽能板、海浪發電浮球、能源教室和大燈泡
  if(lv>=5){ floatSolar(-6.0,15.5,5,3); for(const [x,z] of [[-2.5,16.5],[-1.2,17.7],[.2,16.8]]) waveBuoy(x,z);   // 浮動太陽能板和海浪浮球也移到外海
    energyClass(-.85,2.45); bulb(.55,2.45); }
  if(lv<2){ tree(-1.9,1.3,.75); bush(-1.1,1.1,.75,'#ffd166'); }
  else { tree(-2.1,1.75,.7); if(lv<5) bush(-.75,1.15,.6,'#ffd166'); }
  if(lv<3) bush(1.9,-1.6,.8); else bush(.45,-1.75,.6);
}
export const power1=()=>power(1), power2=()=>power(2), power3=()=>power(3), power4=()=>power(4), power5=()=>power(5);

/* ========== 2 自來水廠：白藍牆＋水藍屋頂、正面大水滴標誌、圓形淨水池和水塔 ========== */
export const WATER={wall:'#e4f3f9', main:'#3d9ad1', light:'#8fd3f0'};
export const waterTop=()=>mat('#6fd0ee',{roughness:.1,metalness:.1,emissive:0x2a8fb0,emissiveIntensity:.25});
export function drop(x,y,z,s=1,c=WATER.main){ sphere(.22*s,mat(c,{roughness:.35}),x,y,z); const cn=add(new THREE.Mesh(new THREE.ConeGeometry(.2*s,.34*s,24),mat(c,{roughness:.35}))); cn.position.set(x,y+.25*s,z); }
export function pool(x,z,r,water,rim='#eef1f3',h=.3){
  cyl(r,r+.03,h,rim,x,0,z,40);
  const w=add(new THREE.Mesh(new THREE.CylinderGeometry(r-.08,r-.08,.02,40),water)); w.position.set(x,h+.004,z);
  const rr=add(new THREE.Mesh(new THREE.TorusGeometry(r-.03,.05,8,48),mat(rim))); rr.rotation.x=Math.PI/2; rr.position.set(x,h+.01,z); return h;
}
export function water1(){
  const P=WATER;
  const top=block(-1.0,-.85,1.8,1.3,1.1,P.wall,{base:'#cfd9de'});
  hip(2.1,1.6,.6,P.main,-1.0,top,-.85);
  door(-1.0,.16,-.19,.42,.66,P.main);
  for(const x of [-1.6,-.4]) win(x,.45,-.19,.3,.38);
  win(-.09,.45,-.85,.3,.38,Math.PI/2); win(-1.91,.45,-.85,.3,.38,-Math.PI/2);
  // 屋頂前緣的大水滴
  rbox(.62,.62,.06,WHITE,-1.0,top+.02,-.08,.12); drop(-1.0,top+.25,-.02,1.05);
  // 淨水池（兩座）＋水管
  pool(.95,.65,.85,waterTop()); pool(1.05,-1.25,.6,waterTop());
  cyl(.05,.05,.3,'#cfd6dc',.95,.3,.65,10);
  beam([-.05,.35,-.5],[.25,.35,.2],.07,P.main,12); beam([.4,.35,-1.2],[-.05,.35,-1.0],.07,P.main,12);
  // 水塔：四支腳＋藍色水槽
  const tx=-1.55, tz=1.15;
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) beam([tx+sx*.3,0,tz+sz*.3],[tx+sx*.2,1.5,tz+sz*.2],.03,'#9fb3c0',8);
  rbox(.6,.06,.6,'#9fb3c0',tx,.8,tz,.02);
  cyl(.38,.38,.62,P.main,tx,1.5,tz,24); cyl(.42,.4,.06,WHITE,tx,1.5,tz,24); rbox(.05,.05,.05,WHITE,tx,1.86,tz,.01);
  const cap=add(new THREE.Mesh(new THREE.ConeGeometry(.42,.3,24),mat(shade(P.main,-.08)))); cap.position.set(tx,2.27,tz);
  for(let i=0;i<3;i++) rbox(.02,.02,.02,WHITE,tx,1.6+i*.15,tz+.39,.005);
  tree(1.95,1.85,.7); bush(-.1,1.8,.75,'#c77dff'); tree(-2.0,-1.8,.8);
}

/* ========== 3 住宅區：白牆＋咖啡色屋頂的三間小房子，白窗框、花盆、白色籬笆 ========== */
export const HOME={wall:'#f8f4ec', roof:'#7a5236', door:'#8f6343', base:'#ddd2c0'};
export function house(x,z,w,d,h,P,{chimney=false,flower='#ff8fa3'}={}){
  const top=block(x,z,w,d,h,P.wall,{base:P.base});
  prism(w+.24,d+.24,.6,P.roof,x,top,z);
  prism(w-.08,.04,.46,mat('#efe4d2',{flatShading:true}),x,top+.03,z+d/2+.1);
  const rw=add(new THREE.Mesh(new THREE.CircleGeometry(.1,20),glassMat)); rw.position.set(x,top+.2,z+d/2+.125);
  door(x-.2,.16,z+d/2+.005,.26,.5,P.door);
  win(x+.22,.38,z+d/2+.005,.24,.28);
  rbox(.32,.08,.1,'#b97a55',x+.22,.24,z+d/2+.07,.02); for(let i=0;i<4;i++) sphere(.035,flower,x+.11+i*.075,.35,z+d/2+.07);
  win(x+w/2+.005,.38,z-.1,.22,.28,Math.PI/2); win(x-w/2-.005,.38,z-.1,.22,.28,-Math.PI/2);
  if(chimney){ rbox(.18,.5,.18,'#d9785e',x+w*.25,top+.1,z-.25,.02); }
  rbox(.3,.04,.6,'#efe5cf',x-.2,0,z+d/2+.35,.015);
}
export function home1(){
  const P=HOME;
  house(-1.4,-.55,1.0,1.1,.8,P,{flower:'#ff8fa3'});
  house(0,-.85,1.0,1.1,.95,P,{chimney:true,flower:'#ffd166'});
  house(1.4,-.55,1.0,1.1,.8,P,{flower:'#c77dff'});
  fence(-2.05,.75,1.25,true); fence(-.55,.75,1.1,true); fence(.85,.75,1.2,true);
  rbox(4.4,.04,.5,'#ece4d4',0,0,1.25,.02);
  // 信箱、樹、晾衣繩
  cyl(.025,.025,.42,WOOD,.65,0,1.0,8); rbox(.16,.12,.22,P.door,.65,.42,1.0,.04);
  tree(-1.95,-1.65,.75); tree(1.95,-1.7,.8,'#6fc463'); bush(-.7,.45,.6,'#ff8fa3'); bush(.7,.2,.6,'#ffd166');
  beam([-.7,0,-1.75],[-.7,.75,-1.75],.02,WOOD); beam([.7,0,-1.75],[.7,.75,-1.75],.02,WOOD); beam([-.7,.72,-1.75],[.7,.72,-1.75],.008,'#ffffff');
  [['#ff8fa3',-.4],['#8fd3f0',-.05],['#ffd166',.3]].forEach(([c,x])=>rbox(.2,.24,.02,c,x,.46,-1.75,.01));
}

/* ========== 4 污水處理廠：灰藍牆＋石板藍屋頂、兩座圓池（髒水→乾淨水）、會轉的刮泥橋 ========== */
export const SEWAGE={wall:'#d7e0ea', roof:'#5b7194', dirty:'#9fae6e'};
export function sewage1(){
  const P=SEWAGE;
  const top=block(-1.35,-1.25,1.4,1.1,.95,P.wall,{base:'#c4ccd6'});
  hip(1.65,1.35,.5,P.roof,-1.35,top,-1.25);
  door(-1.35,.16,-.69,.38,.6,P.roof);
  win(-1.85,.42,-.69,.24,.3); win(-.85,.42,-.69,.24,.3);
  // 第一座：沉澱池（黃綠色的水）＋會轉的刮泥橋
  const dx=.75, dz=-.85, r=1.05;
  const h=pool(dx,dz,r,mat(P.dirty,{roughness:.3}),'#e6eaee',.32);
  cyl(.12,.12,.2,'#e6eaee',dx,h-.05,dz,16);
  const br=new THREE.Group(); br.position.set(dx,h+.15,dz); ROOT.add(br); spinners.push(br);
  rbox(r*2-.1,.06,.16,P.roof,0,0,0,.02,br); rbox(r*2-.1,.04,.03,'#f2c230',0,.12,.07,.01,br); rbox(r*2-.1,.04,.03,'#f2c230',0,.12,-.07,.01,br);
  // 第二座：乾淨的水
  pool(-.95,.85,.72,waterTop(),'#e6eaee',.28);
  beam([-.2,.25,.2],[.2,.25,-.3],.06,P.roof,10);
  // 放流管（往海邊）
  beam([-.95,.15,1.55],[-.95,.15,2.15],.08,P.roof,12);
  tree(1.95,1.4,.75); bush(.4,1.6,.7,'#ffd166'); tree(-2.0,.0,.7,'#6fc463');
}

/* ========== 5 垃圾處理中心：白牆＋草綠圓弧屋頂、回收標誌、三色回收桶、綠色垃圾車 ========== */
export const TRASH={wall:'#f4f2ea', main:'#5bb04f'};
function bin(x,z,c,s=1){ rbox(.26*s,.34*s,.26*s,c,x,0,z,.04); rbox(.29*s,.05*s,.29*s,shade(c,-.1),x,.34*s,z,.02); rbox(.12*s,.03*s,.04*s,'#ffffff',x,.2*s,z+.13*s,.01); }
function truck(x,z,c,rot=0){
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; ROOT.add(g);
  const P=[[.0,'#3b3550']];
  rbox(.9,.5,.5,c,-.15,.14,0,.06,g); rbox(.38,.42,.5,WHITE,.52,.14,0,.06,g);
  const ws=new THREE.Mesh(new THREE.PlaneGeometry(.4,.18),glassMat); ws.rotation.y=Math.PI/2; ws.position.set(.715,.42,0); g.add(ws);
  for(const [wx,wz] of [[-.4,.26],[.1,.26],[.5,.26],[-.4,-.26],[.1,-.26],[.5,-.26]]){ const w=add(new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.08,16),mat('#3b3550')),g); w.rotation.x=Math.PI/2; w.position.set(wx,.11,wz); }
  rbox(.6,.04,.02,'#ffffff',-.15,.4,.255,.01,g);
  return g;
}
export function trash1(){
  const P=TRASH;
  const W=2.6, D=1.7, cx=-.3, cz=-.8;
  rbox(W+.16,.16,D+.16,'#d9d2c4',cx,0,cz,.04);
  rbox(W,.8,D,P.wall,cx,.16,cz,.04);
  const rg=new THREE.CylinderGeometry(W/2+.1,W/2+.1,D+.2,32,1,false,0,Math.PI); rg.rotateZ(Math.PI/2); rg.rotateY(Math.PI/2);
  const roof=add(new THREE.Mesh(rg,mat(P.main,{roughness:.6,side:THREE.DoubleSide}))); roof.position.set(cx,.96,cz); roof.scale.y=.5;
  // 半圓山牆（正面）
  const fg=new THREE.CircleGeometry(W/2,32,0,Math.PI); const fm=add(new THREE.Mesh(fg,mat(P.wall))); fm.position.set(cx,.96,cz+D/2+.005); fm.scale.y=.5;
  rbox(1.0,.7,.05,'#c8ccc4',cx-.5,.16,cz+D/2+.01,.02); for(let i=1;i<6;i++) rbox(.98,.015,.02,'#aeb3a9',cx-.5,.16+i*.12,cz+D/2+.04,.005);
  win(cx+.65,.4,cz+D/2+.005,.34,.32);
  // 回收標誌：綠色圓牌＋白色三角形
  const sx=cx, sy=1.3, sz=cz+D/2+.04;
  const c=add(new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.05,32),mat('#ffffff'))); c.rotation.x=Math.PI/2; c.position.set(sx,sy,sz);
  const tri=add(new THREE.Mesh(new THREE.TorusGeometry(.14,.04,6,3),mat(P.main))); tri.position.set(sx,sy-.02,sz+.03); tri.rotation.z=Math.PI/2;
  // 三色回收桶、垃圾車
  [['#4a8fd8',.9],['#f2c230',1.25],[P.main,1.6]].forEach(([col,x])=>bin(x,.55,col));
  truck(.5,1.55,P.main,0);
  tree(-1.95,1.4,.75,'#6fc463'); bush(1.9,-1.5,.8); tree(1.85,-.3,.7);
}

/* ========== 6 圖書館：奶茶色石牆＋墨綠屋頂、高高的拱形窗、門上一本打開的大書 ========== */
export const LIB={wall:'#ead3ae', roof:'#2e6b55', trim:'#fff8ea'};
const libStone=()=>texMat('lib',stoneTex(LIB.wall,'rgba(140,100,60,.3)'),4,2);
export function openBook(x,y,z,s=1){
  const g=new THREE.Group(); g.position.set(x,y,z); g.scale.setScalar(s); ROOT.add(g);
  for(const sd of [-1,1]){
    const cover=rbox(.46,.62,.03,LIB.roof,sd*.23,0,-.01,.01,g); cover.rotation.y=-sd*.32;
    const pg=rbox(.42,.56,.04,'#fffdf5',sd*.22,.03,.02,.01,g); pg.rotation.y=-sd*.32;
    for(let i=0;i<5;i++){ const l=rbox(.28,.018,.01,'#9aa6b8',sd*.22,.16+i*.08,.05,.004,g); l.rotation.y=-sd*.32; }
  }
  rbox(.04,.6,.06,shade(LIB.roof,-.08),0,0,0,.01,g);
}
export function lib1(){
  const P=LIB;
  const top=block(0,-.6,2.6,1.6,1.35,libStone(),{base:'#d8ccb4',trim:P.trim});
  hip(2.9,1.9,.72,P.roof,0,top,-.6);
  for(const x of [-.95,-.55,.55,.95]) archWin(.24,.62,null,x,.42,.205,0,P.trim);
  for(const z of [-1.05,-.15]){ archWin(.24,.62,null,1.305,.42,z,Math.PI/2,P.trim); archWin(.24,.62,null,-1.305,.42,z,-Math.PI/2,P.trim); }
  // 大門＋台階＋大書
  door(0,.16,.205,.5,.8,P.roof,0,P.trim);
  rbox(1.0,.08,.34,'#ebe5d8',0,0,.38,.02); rbox(.82,.08,.2,'#f2ede2',0,.08,.3,.02);
  rbox(1.0,.1,.12,P.trim,0,1.07,.24,.02);
  openBook(0,1.2,.27,.95);
  // 還書箱、長椅、樹
  rbox(.26,.42,.22,P.roof,.95,0,.9,.04); rbox(.18,.03,.02,'#fff8ea',.95,.32,1.02,.01);
  bench(-1.0,1.05); tree(-1.95,1.3,.8); tree(1.95,-1.7,.8,'#6fc463'); bush(1.6,.75,.7,'#ffd166'); bush(-1.75,-1.9,.75);
}

/* ========== 7 診所（半格）：白牆＋薄荷綠遮雨棚、屋頂綠色十字燈箱 ========== */
export const CLINIC={wall:WHITE, main:'#41b98f'};
export function cross(x,y,z,s,c,bg='#ffffff'){ rbox(.5*s,.5*s,.06,bg,x,y-.25*s,z,.06*s); rbox(.36*s,.12*s,.04,c,x,y-.06*s,z+.04,.01); rbox(.12*s,.36*s,.04,c,x,y-.18*s,z+.04,.01); }
export function clinic1(){
  const P=CLINIC;
  const top=block(0,-.35,1.7,1.25,1.0,P.wall,{base:'#d9d5cc',trim:P.main});
  rbox(1.7,.08,1.25,'#e8ebe8',0,top,-.35,.02);
  // 玻璃門＋窗＋綠色雨棚
  rbox(.62,.66,.04,glassMat,-.3,.16,.28,.01); rbox(.03,.66,.05,WHITE,-.3,.16,.29,.005);
  win(.45,.45,.275,.38,.36);
  awning(-.3,.92,.3,.8,.4,P.main,'#ffffff');
  cross(.4,top+.62,-.1,.95,P.main);
  rbox(.08,.18,.08,'#d9d5cc',.4,top,-.13,.01);
  // 小盆栽、小坡道
  for(const x of [-.82,.82]){ cyl(.1,.08,.16,'#d9a07a',x,0,.55,12); bush(x,.55,.45,null); }
  rbox(.62,.05,.4,'#ebe5d8',-.3,0,.48,.02);
  tree(.7,-1.25,.6,'#6fc463');
}

/* ========== 8 醫院（Lv1 地區醫院）：白牆＋紅色十字、淺藍玻璃窗帶、急診門口紅色雨棚和救護車 ========== */
export const HOSP={wall:'#fbfbf8', main:'#e5484d', band:'#cfe3f2'};
export function ambulance(x,z,rot=0){
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; ROOT.add(g);
  rbox(.95,.46,.48,'#ffffff',0,.12,0,.07,g); rbox(.3,.3,.46,'#ffffff',.55,.12,0,.06,g);
  const ws=new THREE.Mesh(new THREE.PlaneGeometry(.38,.15),glassMat); ws.rotation.y=Math.PI/2; ws.position.set(.705,.34,0); g.add(ws);
  rbox(.96,.07,.49,HOSP.main,0,.3,0,.01,g);
  rbox(.2,.06,.14,'#ff6b6b',.1,.58,0,.02,g); rbox(.12,.06,.14,'#5b8def',-.12,.58,0,.02,g);
  for(const s of [-1,1]){ rbox(.16,.05,.02,HOSP.main,-.15,.42,s*.245,.005,g); rbox(.05,.16,.02,HOSP.main,-.15,.37,s*.245,.005,g); }
  for(const [wx,wz] of [[-.3,.25],[.42,.25],[-.3,-.25],[.42,-.25]]){ const w=add(new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.07,16),mat('#3b3550')),g); w.rotation.x=Math.PI/2; w.position.set(wx,.1,wz); }
}
export function hosp1(){
  const P=HOSP;
  const W=2.8, D=1.6, cz=-.75;
  const top=block(0,cz,W,D,1.9,P.wall,{base:'#d9d6ce',trim:'#e9e9e6'});
  rbox(W,.1,D,'#d5d8de',0,top,cz,.02);
  // 兩樓的窗帶
  for(const y of [.5,1.3]){ rbox(W+.02,.36,D+.02,P.band,0,y,cz,.02); for(let i=0;i<8;i++) rbox(.04,.36,D+.05,'#ffffff',-W/2+.18+i*(W-.36)/7,y,cz,.005); }
  // 大門（中間玻璃）＋雨棚
  rbox(.8,.5,.06,glassMat,0,.16,cz+D/2+.02,.01);
  rbox(1.2,.08,.6,'#ffffff',0,.78,cz+D/2+.3,.02); for(const s of [-1,1]) cyl(.035,.035,.62,'#d5d8de',s*.52,.16,cz+D/2+.52,10);
  rbox(1.22,.05,.62,P.main,0,.86,cz+D/2+.3,.01);
  // 屋頂紅十字
  cross(0,top+.95,cz+.1,1.3,P.main);
  rbox(.12,.25,.12,'#d5d8de',0,top,cz+.07,.01);
  // 側邊急診：紅色雨棚＋救護車
  rbox(.7,.08,.7,P.main,W/2+.3,.95,cz+.35,.02); for(const z of [cz+.05,cz+.65]) cyl(.03,.03,.8,'#d5d8de',W/2+.6,.16,z,10);
  rbox(.08,.24,.38,'#ffffff',W/2+.65,.98,cz+.35,.02); rbox(.06,.06,.2,P.main,W/2+.69,1.07,cz+.35,.01); rbox(.06,.2,.06,P.main,W/2+.69,1.0,cz+.35,.01);
  ambulance(1.4,1.25,-Math.PI/2+.2);
  rbox(.7,.04,1.2,'#ece4d4',0,0,1.0,.02);
  tree(-1.95,1.4,.75); bush(-1.0,.9,.7,'#ff8fa3'); bush(.95,.55,.6,'#ffd166'); tree(-1.95,-1.9,.75,'#6fc463');
}

/* ========== 9 菜園：木頭工具小屋、一畦一畦的菜（高麗菜、紅蘿蔔、番茄）、稻草人 ========== */
export const GARDEN={wood:'#c8955f', roof:'#8c5a3a', soil:'#8a6142'};
function cabbage(x,z,s=1){ const m=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.11*s,1),mat('#8fd36a',{flatShading:true}))); m.position.set(x,.22,z); m.scale.y=.8; }
function carrot(x,z){ for(const a of [-.4,0,.4]){ const l=rbox(.03,.14,.03,'#4faa4a',x+a*.05,.2,z,.01); l.rotation.z=a; } sphere(.035,'#ff8c3a',x,.19,z); }
function tomato(x,z){ cyl(.012,.012,.42,'#9b7650',x,.18,z,5); const b=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.1,1),mat('#4f9f4a',{flatShading:true}))); b.position.set(x,.42,z); for(const [dx,dy] of [[.07,.36],[-.06,.46],[.02,.5]]) sphere(.04,'#ef4f43',x+dx,dy,z+.06); }
export function scarecrow(x,z,s=1){
  cyl(.025*s,.025*s,1.1*s,'#9b7650',x,0,z,6); rbox(.7*s,.035*s,.035*s,'#9b7650',x,.8*s,z,.01);
  rbox(.36*s,.4*s,.16*s,'#5b8fd0',x,.48*s,z,.04); rbox(.7*s,.1*s,.1*s,'#5b8fd0',x,.78*s,z,.03);
  for(const sd of [-1,1]) sphere(.05*s,'#f2d36b',x+sd*.38*s,.83*s,z);
  sphere(.13*s,'#efd9a8',x,1.0*s,z); sphere(.02*s,'#3b3550',x-.05*s,1.02*s,z+.12*s); sphere(.02*s,'#3b3550',x+.05*s,1.02*s,z+.12*s);
  cyl(.24*s,.24*s,.025*s,'#e8c66a',x,1.08*s,z,20); cyl(.09*s,.13*s,.14*s,'#e8c66a',x,1.1*s,z,16); cyl(.135*s,.135*s,.03*s,'#e5484d',x,1.11*s,z,16);
}
export function garden1(){
  const P=GARDEN;
  // 工具小屋（後面左邊）
  const top=block(-1.45,-1.45,1.0,.85,.75,texMat('plank',canvasTex((g,s)=>{ g.fillStyle=P.wood; g.fillRect(0,0,s,s); g.fillStyle='rgba(120,70,30,.28)'; for(let i=0;i<8;i++) g.fillRect(0,i*s/8,s,3); }),1,2),{base:'#b9a586',trim:'#efe2c6'});
  prism(1.2,1.05,.48,P.roof,-1.45,top,-1.45);
  door(-1.45,.16,-1.015,.32,.52,P.roof,0,'#efe2c6');
  // 菜畦：三排（高麗菜、紅蘿蔔、番茄）
  const beds=[[-.65,cabbage],[.05,carrot],[.75,tomato]];
  for(const [z,fn] of beds){ rbox(3.0,.14,.5,P.soil,.35,0,z,.06); for(let i=0;i<7;i++) fn(-.85+i*.4,z); }
  rbox(3.0,.03,.15,'#d9c6a0',.35,0,-.3,.01); rbox(3.0,.03,.15,'#d9c6a0',.35,0,.4,.01);
  scarecrow(-1.65,.05,1.0);
  // 澆水桶、木籬笆
  cyl(.12,.1,.22,'#4a8fd8',1.95,0,-1.05,14); beam([1.95,.22,-1.05],[2.1,.3,-.95],.02,'#4a8fd8',6);
  fence(-2.1,1.3,4.2,true,P.wood,.32);
  tree(1.6,-1.7,.75,'#6fc463'); bush(-.4,-1.6,.6,'#ffd166');
}

/* ========== 10 養雞場：紅色穀倉＋白色 X 門、深紅屋頂、雞舍圍欄裡的小雞、大雞蛋招牌 ========== */
export const FARM={wall:'#cf5546', roof:'#8e3b32', trim:'#ffffff'};
export function chicken(x,z,rot=0,c='#ffffff'){
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; ROOT.add(g); animals.push({g,kind:'chicken',x0:x,z0:z,r:.14,ph:Math.random()*9});
  const b=sphere(.1,c,0,.15,0,{},g); b.scale.set(1.15,.9,.9); sphere(.06,c,.09,.27,0,{},g);
  rbox(.03,.05,.02,'#e5484d',.09,.32,0,.01,g); const bk=add(new THREE.Mesh(new THREE.ConeGeometry(.02,.05,6),mat('#f2b43a')),g); bk.rotation.z=-Math.PI/2; bk.position.set(.16,.26,0);
  const t=sphere(.05,c,-.11,.2,0,{},g); t.scale.set(.7,1.2,.7);
  for(const s of [-1,1]) cyl(.008,.008,.08,'#f2b43a',0,.02,s*.04,4,g);
}
export function farm1(){
  const P=FARM;
  const cx=-.65, cz=-.9, W=1.7, D=1.5;
  const top=block(cx,cz,W,D,1.0,P.wall,{base:'#d9cdb8',trim:P.trim});
  prism(W+.25,D+.25,.75,P.roof,cx,top,cz);
  prism(W-.2,.04,.6,mat(P.wall,{flatShading:true}),cx,top+.02,cz+D/2+.12);
  // 白色 X 大門＋閣樓小窗
  const dz=cz+D/2+.01; rbox(.8,.72,.05,P.wall,cx,.16,dz,.02);
  rbox(.86,.06,.06,P.trim,cx,.88,dz+.01,.01); rbox(.06,.74,.06,P.trim,cx-.4,.16,dz+.01,.01); rbox(.06,.74,.06,P.trim,cx+.4,.16,dz+.01,.01); rbox(.04,.74,.06,P.trim,cx,.16,dz+.01,.01);
  for(const sd of [-1,1]){ const s=rbox(.05,.9,.04,P.trim,cx+sd*.2,.12,dz+.03,.01); s.position.y=.52; s.rotation.z=sd*.5; }
  win(cx,top+.12,dz+.06,.24,.22);
  // 雞舍圍欄＋小雞
  const fx=1.2, fz=.55;
  rbox(1.6,.08,1.5,'#e9d9a8',fx,0,fz,.03);
  fence(fx-.8,fz-.75,1.6,true,P.trim,.3); fence(fx-.8,fz+.75,1.6,true,P.trim,.3); fence(fx-.8,fz-.75,1.5,false,P.trim,.3); fence(fx+.8,fz-.75,1.5,false,P.trim,.3);
  // 小雞舍
  rbox(.55,.4,.45,P.wall,fx+.35,.08,fz-.4,.03); prism(.65,.55,.28,P.roof,fx+.35,.48,fz-.4); rbox(.14,.18,.02,'#3b3550',fx+.35,.1,fz-.17,.01);
  [[fx-.4,fz-.2,.5],[fx-.1,fz+.3,2.2],[fx+.4,fz+.35,-1],[fx-.5,fz+.45,1.2,'#e9a66a']].forEach(([x,z,r,c])=>chicken(x,z,r,c));
  // 大雞蛋招牌
  cyl(.03,.03,1.1,'#9b7650',-1.75,0,.9,8);
  const egg=sphere(.26,'#fff6e2',-1.75,1.38,.9); egg.scale.set(.85,1.15,.85);
  rbox(.6,.24,.05,P.wall,-1.75,.78,.9,.04);
  tree(1.9,-1.7,.75); bush(-1.9,-.2,.7,'#ffd166'); tree(.55,-1.9,.6,'#6fc463');
}

/* ========== 11 早餐店（半格）：奶油黃牆＋橘白條紋遮陽棚、屋頂一顆大荷包蛋 ========== */
export const BFAST={wall:'#fff0b8', main:'#f08a24'};
export function friedEgg(x,y,z,s=1,tilt=1.05){
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.x=tilt; g.scale.setScalar(s); ROOT.add(g);
  const sh=new THREE.Shape(); for(let i=0;i<=40;i++){ const a=i/40*Math.PI*2, r=.42+.05*Math.sin(a*5)+.03*Math.sin(a*3+1); const px=Math.cos(a)*r, py=Math.sin(a)*r; i?sh.lineTo(px,py):sh.moveTo(px,py); }
  const wg=new THREE.ExtrudeGeometry(sh,{depth:.05,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:3});
  const w=add(new THREE.Mesh(wg,mat('#ffffff',{roughness:.4})),g); w.rotation.x=-Math.PI/2;
  const yk=add(new THREE.Mesh(new THREE.SphereGeometry(.17,24,12,0,Math.PI*2,0,Math.PI/2),mat('#ffb020',{roughness:.3})),g); yk.position.set(.05,.07,.04);
  return g;
}
export function bfast1(){
  const P=BFAST;
  const top=block(0,-.4,1.8,1.3,1.0,P.wall,{base:'#e6d6a6',trim:'#ffffff'});
  rbox(1.8,.08,1.3,'#f3e3a8',0,top,-.4,.02);
  // 大玻璃窗＋門＋遮陽棚
  rbox(.9,.55,.04,glassMat,-.3,.4,.27,.01); rbox(.03,.55,.05,'#ffffff',-.3,.4,.28,.005);
  door(.55,.16,.26,.36,.62,P.main);
  awning(0,1.02,.3,1.9,.42,P.main,'#ffffff');
  // 大荷包蛋（立在屋頂上）
  rbox(.08,.4,.08,'#d9c79a',0,top,-.4,.01);
  friedEgg(0,top+.62,-.35,1.0,1.15);
  // 門口小桌椅
  for(const x of [-.55,.55]){ cyl(.2,.2,.04,'#ffffff',x,.42,.85,16); cyl(.025,.025,.42,DARK,x,0,.85,6); for(const s of [-1,1]) cyl(.08,.08,.24,P.main,x+s*.28,0,.85,12); }
  bush(-.95,-1.15,.55,'#ff8fa3');
}

/* ========== 12 市場：木柱大棚＋番茄紅白條紋屋頂、一攤一攤的菜和蛋、門口拱牌 ========== */
export const MARKET={main:'#e4573d', post:'#b07a4a'};
export function stripedRoof(cx,y,cz,w,d,h,c1,c2){
  const n=Math.round(w/.25), sw=w/n, half=d/2, L=Math.hypot(half,h), ang=Math.atan2(h,half);
  for(const s of [-1,1]) for(let i=0;i<n;i++){ const b=rbox(sw+.002,.05,L+.06,i%2?c2:c1,cx-w/2+(i+.5)*sw,0,0,.01); b.position.set(cx-w/2+(i+.5)*sw,y+h/2,cz+s*half/2); b.rotation.x=s*ang; }
  rbox(w+.04,.06,.08,c1,cx,y+h-.02,cz,.02);
}
export function stall(x,z,w,items){
  rbox(w,.06,.5,'#d9a46a',x,.5,z,.02); rbox(w-.06,.5,.44,'#b07a4a',x,0,z,.02);
  items.forEach((it,i)=>{ const bx=x-w/2+.22+i*(w-.44)/Math.max(1,items.length-1); rbox(.3,.1,.3,'#e9c48f',bx,.56,z,.02);
    for(let k=0;k<5;k++) sphere(.055,it,bx-.07+(k%3)*.07,.7+(k>2?.05:0),z-.04+(k>2?.06:0)); });
}
export function market1(){
  const P=MARKET;
  const W=3.4, D=2.2, cz=-.45;
  rbox(W+.2,.12,D+.2,'#e2d7c3',0,0,cz,.03);
  for(const x of [-W/2+.1,0,W/2-.1]) for(const z of [cz-D/2+.1,cz+D/2-.1]) cyl(.07,.08,1.25,P.post,x,.12,z,12);
  for(const z of [cz-D/2+.1,cz+D/2-.1]) rbox(W,.1,.1,P.post,0,1.32,z,.02);
  stripedRoof(0,1.4,cz,W+.3,D+.4,.75,P.main,'#ffffff');
  // 攤子：菜、蛋、水果
  stall(-.95,cz-.45,1.1,['#8fd36a','#ff8c3a','#ef4f43']);
  stall(.95,cz-.45,1.1,['#fff6e2','#f2e0b8','#fff6e2']);
  stall(0,cz+.5,1.2,['#ffd23a','#c77dff','#8fd36a']);
  // 門口小拱牌
  for(const s of [-1,1]) cyl(.05,.05,1.2,P.post,s*.75,0,1.4,10);
  rbox(1.7,.3,.08,P.main,0,1.1,1.4,.05); for(let i=0;i<5;i++) sphere(.06,['#8fd36a','#ffd23a','#fff6e2','#ff8c3a','#ef4f43'][i],-.5+i*.25,1.25,1.46);
  // 木箱、推車
  for(const [x,z] of [[1.85,.4],[1.85,.8],[-1.85,.6]]){ rbox(.32,.24,.28,'#d9a46a',x,0,z,.02); for(let k=0;k<3;k++) sphere(.06,'#8fd36a',x-.08+k*.08,.28,z); }
  tree(-1.95,-1.85,.75,'#6fc463'); tree(1.95,-1.85,.75); bush(-1.3,1.6,.6,'#ffd166');
}

/* ========== 13 便利商店（半格）：白牆＋桃紅色橫帶、大片玻璃、太陽月亮「24」圓牌 ========== */
export const CONV={wall:WHITE, main:'#e2508c'};
const sunMoonTex=discTex((g,s)=>{ g.fillStyle='#ffd23a'; g.fillRect(0,0,s/2,s); g.fillStyle='#3b4a8c'; g.fillRect(s/2,0,s/2,s);
  g.fillStyle='#ff9f2e'; g.beginPath(); g.arc(s*.28,s*.5,s*.11,0,Math.PI*2); g.fill();
  g.fillStyle='#fff3c4'; g.beginPath(); g.arc(s*.72,s*.5,s*.12,0,Math.PI*2); g.fill(); g.fillStyle='#3b4a8c'; g.beginPath(); g.arc(s*.77,s*.46,s*.11,0,Math.PI*2); g.fill();
  g.fillStyle='#ffffff'; g.font=`bold ${s*.26}px sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.strokeStyle=CONV.main; g.lineWidth=8; g.strokeText('24',s/2,s*.8); g.fillText('24',s/2,s*.8); });
export function conv1(){
  const P=CONV;
  const top=block(0,-.4,1.8,1.3,1.0,P.wall,{base:'#d9d6d0',trim:'#ffffff'});
  rbox(1.84,.22,1.34,P.main,0,.88,-.4,.02);
  rbox(1.8,.08,1.3,'#e6e6e2',0,top,-.4,.02);
  // 整面玻璃＋自動門
  rbox(1.5,.6,.04,glassMat,0,.2,.27,.01); for(const x of [-.5,0,.5]) rbox(.03,.6,.05,'#d9d6d0',x,.2,.28,.005);
  for(let i=0;i<3;i++) rbox(.32,.04,.02,['#ffd23a','#8fd36a','#5b8def'][i],-.55+i*.04,.5-i*.12,.25,.005);
  // 圓牌立柱
  cyl(.04,.04,1.6,'#9a98a8',.75,0,.7,10);
  disc(.32,sunMoonTex,.75,1.85,.7);
  // 腳踏車、垃圾桶
  bin(-.75,.65,'#9a98a8',.8); const bk=new THREE.Group(); bk.position.set(-.25,0,.8); ROOT.add(bk);
  for(const x of [-.2,.2]){ const w=add(new THREE.Mesh(new THREE.TorusGeometry(.13,.02,6,20),mat('#3b3550')),bk); w.position.set(x,.14,0); }
  beam([-.2,.14,0],[0,.3,0],.015,P.main); beam([.2,.14,0],[0,.3,0],.015,P.main); beam([-.05,.36,0],[.12,.36,0],.03,'#3b3550');
  bush(-.95,-1.15,.55,'#ffd166');
}

/* ========== 14 社區公園（半格）：草地、一棵大樹、粉紅圓形花圃、原木長椅和小路 ========== */
export const PARK={grass:'#8fd06a', flower:'#ff8fb1', wood:WOOD};
export function park1(){
  const P=PARK;
  lawnPad(0,0,2.3,3.0,.25);
  // 彎彎的小路
  for(let i=0;i<8;i++){ const t=i/7, x=Math.sin(t*3)*.35, z=1.3-t*2.5; rbox(.34,.05,.3,'#efe5cf',x,.08,z,.06); }
  // 圓形花圃
  cyl(.42,.44,.14,'#e5dccb',.55,.08,-.25,24); cyl(.36,.36,.06,SOIL,.55,.2,-.25,24);
  for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; sphere(.05,i%2?P.flower:'#ffffff',.55+Math.cos(a)*.24,.3,-.25+Math.sin(a)*.24); } sphere(.07,'#ffd23a',.55,.3,-.25);
  // 大樹、長椅、路燈
  tree(-.6,-.85,1.25,'#5fb84f');
  bench(-.65,.45,.4); bench(.75,.8,-.5);
  lamp(.85,-1.15);
  bush(-.75,1.25,.55,P.flower); bush(.8,1.3,.5,'#ffd166');
}

export const STAGE1=[
  ['power','發電廠',power1,'whole'], ['power2','發電廠 Lv2',power2,'whole'], ['power3','發電廠 Lv3',power3,'whole'], ['power4','發電廠 Lv4',power4,'whole'], ['power5','發電廠 Lv5',power5,'whole'], ['water','自來水廠',water1,'whole'], ['home','住宅區',home1,'whole'], ['sewage','污水處理廠',sewage1,'whole'],
  ['trash','垃圾處理中心',trash1,'whole'], ['lib','圖書館',lib1,'whole'], ['clinic','診所',clinic1,'half'], ['hosp','醫院',hosp1,'whole'],
  ['garden','菜園',garden1,'whole'], ['farm','養雞場',farm1,'whole'], ['bfast','早餐店',bfast1,'half'], ['market','市場',market1,'whole'],
  ['conv','便利商店',conv1,'half'], ['park','社區公園',park1,'half'],
];
