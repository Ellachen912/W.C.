/* Winston City 5 垃圾處理中心 Lv1–3（家長 2026-11-11 12:24 重新設計：Lv1 就有焚化爐）。
   白牆＋草綠圓弧屋頂、白綠條紋煙囪；一級比一級高：煙囪 Lv1 中等 → Lv2 加高 → Lv3 全場最高＋頂上綠燈圈。
   參考台灣焚化廠流程（地磅→貯坑→垃圾吊車→焚化爐→發電，底渣做消波塊）和清潔隊分格回收場。
   Lv1 焚化爐廠房（正面右邊的玻璃凸窗看得到貯坑和垃圾吊車抓斗）、地磅和柵欄、垃圾車、三色回收桶、發電機房和電桿（煙是灰色）
   → Lv2 洗煙塔（煙變白）、廠房右邊的分格回收場（紙、瓶、罐、玻璃，後面輸送帶的東西會動）、鋁罐磚、廚餘堆肥
   → Lv3 煙囪全場最高＋綠燈圈、發電機房綠屋頂、多種樹、底渣做的消波塊。（家長 12:52 版：不要再生工坊、教育館、游泳池；回收場不要放門口） */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, glassMat, tree, bush, shade, drops, grassTex, puff } from './lib.js';
import { TRASH, block, win, door, beam, smoke, solar } from './stage1.js';
import { kit, IND } from './s1_kit.js';
const WHITE='#fbfaf6', P=TRASH, DARK='#3b3550';
export const trashBlink=[], binLids=[];   // binLids：回收桶的蓋子（輪流掀開再蓋上）
let powerTop=0;
const led=(c,hex,i=.8)=>mat(c,{emissive:hex,emissiveIntensity:i});
function bin(x,z,c,s=1){                 // 回收桶：桶身＋白色標籤＋會掀開的蓋子（轉軸在後面）
  rbox(.26*s,.34*s,.26*s,c,x,0,z,.04); rbox(.12*s,.03*s,.04*s,'#ffffff',x,.2*s,z+.13*s,.01);
  const lid=new THREE.Group(); lid.position.set(x,.34*s,z-.145*s); ROOT.add(lid);
  rbox(.29*s,.05*s,.29*s,shade(c,-.1),0,0,.145*s,.02,lid); rbox(.1*s,.03*s,.04*s,shade(c,-.25),0,.05*s,.25*s,.01,lid);
  binLids.push(lid); }
function truck(x,z,rot=0){                // 綠色垃圾車：車頭在 +x
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; ROOT.add(g);
  rbox(.9,.5,.5,P.main,-.15,.14,0,.06,g); rbox(.38,.42,.5,WHITE,.52,.14,0,.06,g);
  const ws=new THREE.Mesh(new THREE.PlaneGeometry(.4,.18),glassMat); ws.rotation.y=Math.PI/2; ws.position.set(.715,.42,0); g.add(ws);
  for(const [wx,wz] of [[-.4,.26],[.1,.26],[.5,.26],[-.4,-.26],[.1,-.26],[.5,-.26]]){ const w=add(new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.08,16),mat(DARK)),g); w.rotation.x=Math.PI/2; w.position.set(wx,.11,wz); }
  rbox(.6,.04,.02,'#ffffff',-.15,.4,.255,.01,g); rbox(.6,.04,.02,'#ffffff',-.15,.4,-.255,.01,g);
}
function chimney(x,z,h,lv){              // 白綠條紋煙囪：一級比一級高；Lv3 頂上一圈綠燈
  rbox(.8,.2,.8,'#d9d2c4',x,0,z,.04);
  const n=Math.round(h/.4);
  for(let i=0;i<n;i++) cyl(.3-i*.008,.31-i*.008,h/n,i%2?P.main:WHITE,x,.2+i*h/n,z,22);
  const top=.2+h; cyl(.28-n*.008,.28-n*.008,.1,'#9aa3b2',x,top,z,22);
  if(lv>=3){ const r=add(new THREE.Mesh(new THREE.TorusGeometry(.3-n*.008,.035,8,32),led('#7dff8a',0x3cff5a))); r.rotation.x=Math.PI/2; r.position.set(x,top-.15,z); trashBlink.push(r); }
  puff(x,top+.1,z,{color:lv>=2?'#ffffff':'#8f9096',op:lv>=2?.72:.85,r:.2,rise:1.3});   // 會動的煙：Lv1 灰、Lv2 起洗過變白
}
function hall(cx,cz,W,D,H){               // 焚化爐廠房：白牆＋草綠圓弧屋頂，正面大卸料門
  rbox(W+.16,.16,D+.16,'#d9d2c4',cx,0,cz,.04); rbox(W,H,D,P.wall,cx,.16,cz,.04);
  const rg=new THREE.CylinderGeometry(W/2+.1,W/2+.1,D+.2,32,1,false,0,Math.PI); rg.rotateZ(Math.PI/2); rg.rotateY(Math.PI/2);
  const roof=add(new THREE.Mesh(rg,mat(P.main,{roughness:.6,side:THREE.DoubleSide}))); roof.position.set(cx,.16+H,cz); roof.scale.y=.45;
  const fm=add(new THREE.Mesh(new THREE.CircleGeometry(W/2,32,0,Math.PI),mat(P.wall))); fm.position.set(cx,.16+H,cz+D/2+.005); fm.scale.y=.45;
  // 卸料大門（灰色鐵捲門）＋上方綠色飾帶
  rbox(1.1,.8,.05,'#c8ccc4',cx-.35,.16,cz+D/2+.01,.02); for(let i=1;i<7;i++) rbox(1.08,.015,.02,'#aeb3a9',cx-.35,.16+i*.11,cz+D/2+.04,.005);
  rbox(1.2,.07,.07,P.main,cx-.35,.98,cz+D/2+.02,.02);
  // 正面右邊的玻璃凸窗：看得到裡面的垃圾貯坑和黃色垃圾吊車抓斗
  const wx=cx+.78, wz=cz+D/2, wy=.22, ww=.9, wd=.38, wh=.8;
  rbox(ww,.06,wd,'#d9d2c4',wx,wy-.06,wz+wd/2,.02); rbox(ww,.06,wd,'#d9d2c4',wx,wy+wh,wz+wd/2,.02);   // 上下框
  for(const dx of [-ww/2+.03,ww/2-.03]) rbox(.05,wh,.05,'#d9d2c4',wx+dx,wy,wz+wd-.02,.01);           // 前面兩根框
  rbox(ww-.04,wh,.03,'#4d4a63',wx,wy,wz+.02,.01);                                                    // 裡面暗暗的牆
  rbox(ww-.1,.18,wd-.08,'#8a7a5a',wx,wy,wz+wd/2,.02);                                                // 貯坑裡的垃圾
  for(let i=0;i<10;i++) sphere(.045,['#8fd3f0','#d9b77a','#c97a5a','#9fd68f'][i%4],wx-.3+(i%5)*.15,wy+.2,wz+.1+Math.floor(i/5)*.14);
  rbox(ww-.06,.05,.05,'#f2c230',wx,wy+wh-.12,wz+.1,.01); rbox(ww-.06,.05,.05,'#f2c230',wx,wy+wh-.12,wz+wd-.1,.01);  // 吊車軌道
  rbox(.08,.06,wd-.1,'#f2c230',wx+.12,wy+wh-.18,wz+wd/2,.01);
  cyl(.012,.012,.22,'#4d4a63',wx+.12,wy+wh-.4,wz+wd/2,6); rbox(.12,.08,.12,'#f2c230',wx+.12,wy+wh-.48,wz+wd/2,.02);
  for(let k=0;k<4;k++){ const a=k/4*Math.PI*2+.4; const c=rbox(.03,.16,.03,'#f2c230',wx+.12+Math.cos(a)*.06,wy+wh-.62,wz+wd/2+Math.sin(a)*.06,.01); c.rotation.z=Math.cos(a)*.4; c.rotation.x=-Math.sin(a)*.4; }
  rbox(ww-.08,wh,.02,mat('#e6f8ff',{roughness:.05,transparent:true,opacity:.18}),wx,wy,wz+wd-.01,.005);   // 透明玻璃
  rbox(.03,wh,wd,mat('#e6f8ff',{roughness:.05,transparent:true,opacity:.18}),wx+ww/2-.02,wy,wz+wd/2,.005);
  win(cx+W/2+.005,.5,cz,.3,.34,Math.PI/2);
  // 回收標誌（山牆上）
  const sy=.16+H+.32, sz=cz+D/2+.03; const c=add(new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.05,32),mat('#ffffff'))); c.rotation.x=Math.PI/2; c.position.set(cx,sy,sz);
  const tri=add(new THREE.Mesh(new THREE.TorusGeometry(.13,.04,6,3),mat(P.main))); tri.position.set(cx,sy-.02,sz+.03); tri.rotation.z=Math.PI/2;
  // 卸料平台（門前的灰色斜坡平台）
  rbox(1.4,.1,.9,'#cfd3cc',cx-.35,0,cz+D/2+.45,.03); rbox(1.4,.04,.04,'#f2c230',cx-.35,.1,cz+D/2+.88,.01);
}
function scrubber(x,z,tx,tz){            // Lv2 洗煙塔：白色高圓塔，把煙洗乾淨
  cyl(.42,.45,.14,'#d9d2c4',x,0,z,24); cyl(.34,.34,2.2,WHITE,x,.14,z,24);
  for(const y of [.6,1.5]) cyl(.36,.36,.1,P.main,x,y,z,24);
  const d=add(new THREE.Mesh(new THREE.SphereGeometry(.34,24,10,0,Math.PI*2,0,Math.PI/2),mat(WHITE))); d.position.set(x,2.34,z); d.scale.y=.5;
  for(let i=0;i<8;i++) rbox(.14,.02,.03,'#9aa3b2',x+.36,.3+i*.22,z,.005);
  beam([x,1.9,z],[tx,1.9,tz],.08,'#cfd3da',10);
}
function recycleSign(x,y,z,r=.32){       // 回收標誌：白色圓牌＋三個綠色箭頭繞成三角形
  const g=new THREE.Group(); g.position.set(x,y,z); ROOT.add(g);
  const c=add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,.05,32),mat('#ffffff')),g); c.rotation.x=Math.PI/2;
  for(let k=0;k<3;k++){ const a=k/3*Math.PI*2+Math.PI/2, b=a+Math.PI*2/3;
    const p1=[Math.cos(a)*r*.55,Math.sin(a)*r*.55], p2=[Math.cos(b)*r*.55,Math.sin(b)*r*.55], len=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]);
    const bar=add(new THREE.Mesh(new THREE.BoxGeometry(len*.62,r*.16,.03),mat(P.main)),g); bar.position.set(p1[0]+(p2[0]-p1[0])*.42,p1[1]+(p2[1]-p1[1])*.42,.035); bar.rotation.z=Math.atan2(p2[1]-p1[1],p2[0]-p1[0]);
    const head=add(new THREE.Mesh(new THREE.ConeGeometry(r*.17,r*.28,3),mat(P.main)),g); head.position.set(p1[0]+(p2[0]-p1[0])*.8,p1[1]+(p2[1]-p1[1])*.8,.035); head.rotation.z=Math.atan2(p2[1]-p1[1],p2[0]-p1[0])-Math.PI/2; }
  return g;
}
function recycleYard(cx,cz){              // Lv2 回收場（在廠房右邊）：一排分格棚子，紙、寶特瓶、鐵鋁罐、玻璃各一格；後面的輸送帶把東西送進來
  const W=2.0, D=1.25;
  rbox(W+.1,.08,D+.1,'#d9d6ce',cx,0,cz,.02);
  rbox(W,.95,.06,P.wall,cx,.08,cz-D/2+.03,.02);                                // 後牆
  for(const dx of [-W/2,W/2]) cyl(.045,.045,1.25,'#9aa3b2',cx+dx,.08,cz+D/2-.05,8);
  const r=rbox(W+.2,.07,D*.55,P.main,cx,1.35,cz-D*.22,.02); r.rotation.x=-.2;  // 半邊屋頂，前面露出來看得到分格
  rbox(W,.07,.07,'#9aa3b2',cx,1.28,cz+D/2-.05,.01); cyl(.03,.03,.3,'#9aa3b2',cx,1.33,cz+D/2-.05,6); recycleSign(cx,1.85,cz+D/2-.03,.3);
  // 四格（低隔牆）＋回收物
  const bays=[['紙','#d9b77a'],['瓶','#8fd3f0'],['罐','#c8ccd4'],['玻璃','#9fd68f']], bw=W/4;
  for(let i=0;i<=4;i++) rbox(.05,.3,D*.6,'#e8e4da',cx-W/2+i*bw,.08,cz+.05,.01);
  bays.forEach(([n,c],i)=>{ const x=cx-W/2+(i+.5)*bw;
    rbox(bw-.1,.04,.12,c,x,.38,cz+D*.35+.02,.01);                               // 每格前面的顏色牌
    for(let k=0;k<7;k++){ const px=x-.14+(k%3)*.14, pz=cz-.12+Math.floor(k/3)*.16;
      if(i===0) rbox(.13,.07,.11,['#d9b77a','#e9dcc0','#c9a46a'][k%3],px,.08+(k%2)*.07,pz,.01);
      else if(i===1){ const b=cyl(.04,.04,.15,mat('#8fd3f0',{transparent:true,opacity:.85}),px,.1,pz,10); b.rotation.z=1.4; }
      else if(i===2) cyl(.045,.045,.1,['#c8ccd4','#e5484d','#9aa3b2'][k%3],px,.08+(k%2)*.1,pz,12);
      else sphere(.05,['#ffffff','#9b6a3c','#5bb04f'][k%3],px,.13,pz,{roughness:.15}); } });
  // 後面的輸送帶（沿著後牆，比分格高一點），上面的東西會往右走
  const y=.62, x0=cx-W/2+.1, x1=cx+W/2-.1, bz=cz-D/2+.22;
  rbox(x1-x0,.05,.24,'#4d4a63',(x0+x1)/2,y,bz,.02);
  for(const x of [x0+.1,cx,x1-.1]) cyl(.02,.02,y,'#9aa3b2',x,0,bz,6);
  [['#d9b77a','box'],['#8fd3f0','bottle'],['#c8ccd4','can'],['#ffffff','glass']].forEach(([c,k],i)=>{ const m=k==='box'?rbox(.12,.07,.1,c,0,0,0,.02):sphere(.05,c,0,0,0);
    m.position.set(x0+.1+i*(x1-x0-.2)/4,y+.1,bz); drops.push({d:m,curve:new THREE.LineCurve3(new THREE.Vector3(x0+.1,y+.1,bz),new THREE.Vector3(x1-.1,y+.1,bz)),o:i/4}); });
  beam([cx-W/2-.35,.9,cz-.9],[x0,y+.05,bz],.06,'#9aa3b2',8);                   // 從廠房接過來的輸送帶
}
function canBricks(x,z){                   // 壓好的鋁罐磚
  for(let i=0;i<3;i++) for(let k=0;k<2+(i%2);k++) rbox(.24,.16,.2,'#c8ccd4',x+i*.27,k*.165,z,.02);
  rbox(.86,.04,.26,'#9aa3b2',x+.27,0,z,.01);
}
function weighbridge(x,z){                 // Lv1 地磅：地上的秤台＋小亭子＋紅白柵欄
  rbox(.9,.04,.7,'#9aa3b2',x,0,z,.01); rbox(.94,.02,.04,'#f2c230',x,.04,z-.35,.005); rbox(.94,.02,.04,'#f2c230',x,.04,z+.35,.005);
  const bx=x+.8; rbox(.42,.55,.42,WHITE,bx,0,z,.04); rbox(.48,.06,.48,P.main,bx,.55,z,.02); win(bx,.22,z+.215,.24,.2);
  cyl(.04,.04,.4,'#9aa3b2',bx-.3,0,z+.3,8);
  for(let i=0;i<5;i++) rbox(.18,.05,.05,i%2?'#ffffff':'#e5484d',bx-.3-.09-i*.18,.37,z+.3,.01);
}
function bales(x,z){                     // 壓好的回收物：紙捆、寶特瓶捆、鐵罐捆
  [['#d9b77a',0,0],['#d9b77a',.36,0],['#8fd3f0',0,.36],['#8fd3f0',.36,.36],['#c8ccd4',.18,.18,.3]].forEach(([c,dx,dz,y=0])=>{
    rbox(.32,.28,.32,c,x+dx,y,z+dz,.03); rbox(.33,.02,.33,'#6d6a7d',x+dx,y+.14,z+dz,.005); });
}
function compost(x,z){                    // 廚餘堆肥區：三格木框，裡面褐色堆肥
  for(let i=0;i<3;i++){ const bx=x+i*.5;
    for(const [w,d,dx,dz] of [[.46,.05,0,-.2],[.46,.05,0,.2],[.05,.42,-.21,0],[.05,.42,.21,0]]) rbox(w,.22,d,'#b58a5c',bx+dx,0,z+dz,.01);
    const p=sphere(.2,mat(['#7a5a3a','#8a6a42','#6b4e30'][i],{flatShading:true}),bx,.12,z); p.scale.set(1,.55,1);
    if(i===2) for(let k=0;k<3;k++) sphere(.03,'#8fd36a',bx-.08+k*.08,.24,z+.05); }
}
function powerHouse(x,z){                 // Lv3 發電機房：燒垃圾的熱拿來發電；屋頂黃色閃電
  const t=block(x,z,1.0,.85,.95,P.wall,{base:'#d9d2c4',trim:P.main}); rbox(1.0,.08,.85,'#dfe2dc',x,t,z,.02); powerTop=t;
  door(x-.25,.16,z+.43,.28,.5,P.main); win(x+.22,.42,z+.43,.28,.28);
  rbox(.36,.36,.05,'#ffffff',x,t+.06,z+.3,.06); const s=new THREE.Shape(); [[.03,.13],[-.07,-.01],[0,-.01],[-.04,-.13],[.08,.02],[.01,.02],[.06,.13]].forEach(([a,b],i)=>i?s.lineTo(a,b):s.moveTo(a,b));
  const b=add(new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.04,bevelEnabled:false}),mat('#f2c230'))); b.position.set(x,t+.24,z+.33);
  // 電桿＋電線
  const px=x+1.0, pz=z+.6; cyl(.04,.05,1.9,'#9b7650',px,0,pz,8); rbox(.7,.06,.06,'#9b7650',px,1.75,pz,.01);
  for(const s2 of [-1,1]){ cyl(.03,.03,.1,'#ffffff',px+s2*.28,1.81,pz,6); beam([px+s2*.28,1.88,pz],[x+s2*.2,t+.05,z],.01,DARK,4); }
}
function workshop(x,z){                  // Lv3 再生工坊：大玻璃櫥窗，看得到寶特瓶做的衣服和再生紙筆記本
  const t=block(x,z,1.3,.85,1.0,P.wall,{base:'#d9d2c4',trim:P.main});
  const rg=prismRoof(x,t,z,1.5,1.05);
  rbox(1.0,.62,.04,glassMat,x+.05,.22,z+.435,.01); rbox(1.06,.05,.06,P.main,x+.05,.86,z+.44,.01);
  // 櫥窗裡：三件彩色 T 恤、一疊筆記本、一捲再生紙
  [['#5bc4d8',-.28],['#8fd36a',0],['#ffd166',.28]].forEach(([c,dx])=>{ rbox(.2,.22,.03,c,x+dx+.05,.5,z+.36,.01); rbox(.32,.07,.03,c,x+dx+.05,.66,z+.36,.01); });
  rbox(.03,.03,.9,'#9aa3b2',x+.05,.8,z+.36,.005).rotation.y=Math.PI/2;
  for(let i=0;i<3;i++) rbox(.18,.04,.14,['#e9dcc0','#d9b77a','#f2e6c9'][i],x-.48,.24+i*.045,z+.3,.01);
  door(x+.6,.16,z+.43,.2,.5,P.main);
  recycleSign(x,t+.55,z+.3,.2);
}
function prismRoof(x,y,z,w,d){ const g=new THREE.BufferGeometry(); const hw=w/2,hd=d/2,h=.35;
  const v=[[-hw,0,-hd],[hw,0,-hd],[hw,0,hd],[-hw,0,hd],[-hw,h,0],[hw,h,0]];
  const idx=[3,2,5, 3,5,4, 1,0,4, 1,4,5, 0,3,4, 2,1,5]; g.setAttribute('position',new THREE.Float32BufferAttribute(idx.flatMap(i=>v[i]),3)); g.computeVertexNormals();
  const m=add(new THREE.Mesh(g,mat(P.main,{flatShading:true}))); m.position.set(x,y,z); return m; }
function tetrapod(x,y,z,s=1,rot=0){       // 消波塊：四隻腳的灰色水泥塊（燒剩的底渣做的）
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.set(rot*.7,rot,rot*.4); ROOT.add(g);
  const dirs=[[0,1,0],[.943,-.333,0],[-.471,-.333,.816],[-.471,-.333,-.816]];
  for(const d of dirs){ const m=add(new THREE.Mesh(new THREE.CylinderGeometry(.05*s,.11*s,.3*s,8),mat('#b9b6ae',{flatShading:true})),g);
    m.position.set(d[0]*.14*s,d[1]*.14*s,d[2]*.14*s); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),new THREE.Vector3(...d)); }
  sphere(.1*s,mat('#c4c1b9',{flatShading:true}),0,0,0,{},g);
}
function tetraPile(x,z){
  rbox(1.3,.04,.9,'#cfc9bd',x,0,z,.02);
  [[-.35,.18,-.2,0],[.05,.18,-.22,1.1],[.42,.18,-.18,2.3],[-.2,.18,.2,.6],[.25,.18,.2,1.7],[0,.42,0,.9]].forEach(([dx,y,dz,r])=>tetrapod(x+dx,y,z+dz,1,r));
}
function roofGarden(x,y,z,w,d){            // 綠屋頂：屋頂鋪草、種小樹叢
  rbox(w,.06,d,new THREE.MeshStandardMaterial({map:grassTex,roughness:.95}),x,y,z,.02);
  for(const [dx,dz] of [[-w*.3,-d*.25],[w*.3,-d*.2],[0,d*.25]]){ const b=sphere(.16,mat('#5fb35a',{flatShading:true,roughness:.9}),x+dx,y+.14,z+dz); b.scale.set(1.3,.8,1.1); sphere(.03,'#ffd166',x+dx+.06,y+.24,z+dz+.08); }
}
function bricks(x,z){                     // 灰渣做的鋪路磚：一疊一疊
  for(let s=0;s<3;s++) for(let k=0;k<3+(s%2);k++){ const c=s===1?'#b9a99a':'#c97a5a'; rbox(.3,.08,.16,c,x+s*.36,k*.085,z+(k%2)*.04,.015); }
  rbox(1.1,.06,.4,'#cfc9bd',x+.36,0,z+.02,.02);
}
function aqBoard(x,z){                    // 空氣品質看板：深色螢幕，亮綠燈和綠色長條
  for(const dx of [-.42,.42]) cyl(.035,.035,1.1,'#9aa3b2',x+dx,0,z,8);
  rbox(1.0,.62,.07,'#2f3446',x,.85,z,.04); rbox(1.06,.06,.1,P.main,x,1.47,z,.02);
  trashBlink.push(sphere(.07,led('#7dff8a',0x3cff5a,1.0),x-.32,1.2,z+.05));
  for(let i=0;i<4;i++) rbox(.12+i*.08,.06,.02,led('#7dff8a',0x3cff5a,.6),x+.05+(.12+i*.08)/2-.06,1.25-i*.11,z+.045,.01);
}
export function trash(lv){
  const cx=-.35, cz=-.95, W=2.5, D=1.5, H=1.15;
  hall(cx,cz,W,D,H);
  chimney(-2.15,-1.55,[0,2.3,3.1,4.0][lv],lv);                 // Lv1 灰煙；Lv2 起有洗煙塔，冒白煙；Lv3 全場最高＋綠燈圈
  beam([-1.6,1.0,-1.4],[-1.92,1.0,-1.5],.1,'#cfd3da',10);
  truck(-.7,1.3,Math.PI/2);                                   // 開向卸料門
  weighbridge(-.7,2.45);
  [['#5b8fe0',-2.4],['#f08a3c',-1.98],['#5bbf6a',-1.56]].forEach(([c,x])=>bin(x,.7,c,1.35));   // 家長 20:10：換回原本的藍、橘、綠回收桶，蓋子會輪流掀開
  powerHouse(1.95,-1.75);                                     // 燒垃圾的熱拿來發電（家長 12:41 放到 Lv1）
  if(lv>=2){ scrubber(-2.35,-.35,-2.15,-1.3); recycleYard(2.0,.45); canBricks(1.2,1.65); compost(-2.45,1.95); }
  if(lv>=3){ roofGarden(1.95,powerTop+.08,-1.75,.9,.75); tetraPile(2.45,2.45);
    tree(-2.6,-2.4,.8); tree(2.9,-.9,.7,'#6fc463'); tree(-1.1,3.05,.65); tree(2.95,1.45,.65,'#6fc463'); bush(.3,3.1,.6,'#ff8fa3'); }
  if(lv<2){ tree(1.6,.6,.75,'#6fc463'); tree(-2.3,2.0,.7); bush(2.3,1.6,.7,'#ffd166'); }
  if(lv===2) tree(2.6,2.5,.7);
}
export const TRASH_MAP=[0,1,3];   // 家長 2026-11-11 12:58 改成 2 級：新 Lv1＝舊 Lv1、新 Lv2＝舊 Lv3（舊 Lv2 刪掉，內容併進新 Lv2）
export const TRASH_LV=[1,2].map(l=>['trash'+(l>1?l:''),'垃圾處理中心 Lv'+l,()=>trash(TRASH_MAP[l]),'whole']);
