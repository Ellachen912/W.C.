/* Winston City 第二階段：美食區的小店（半格、各 2 級；家長 2026-11-18 16:11「繼續做其他」）
   跟早餐店一樣：Lv1 小小一間，Lv2 店面變寬、門口加座位。每間屋頂都有一個大大的招牌食物（Ultimate Food Pack 模型），櫥窗裡擺真的食物模型。
   麵包店：奶油色牆＋咖啡色條紋遮雨棚，櫥窗擺麵包、可頌、杯子蛋糕；屋頂大可頌；Lv2 門口兩張小圓桌、麵包架
   冰淇淋店：粉紅牆＋粉紅白條紋棚，冰櫃裡一排彩色冰淇淋；屋頂大甜筒；Lv2 門口加粉藍遮陽傘座位、冰棒立牌
   漢堡店：紅牆＋黃白條紋棚，櫃台上漢堡、薯條、汽水；屋頂大漢堡；Lv2 加得來速小窗口和戶外座位
   日式料理店：深木色牆＋灰黑斜屋頂、藍色布簾（暖簾）、紅燈籠；櫥窗擺壽司；屋頂大壽司；Lv2 加小庭院（石燈籠、竹子）和戶外長椅
   座標同 s1_more.js 的半格：建地中心為原點、正門朝 +z；半格是梯形，後面（z≈-1.55）寬約 ±4，前面（z≈1.7）寬約 ±1.9。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, prism, tree, bush, anims, puff } from './lib.js';
import { kit, FOOD } from './s1_kit.js';

const glass=mat('#cfeaf5',{transparent:true,opacity:.5,roughness:.1});
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function textTex(txt,bg,fg,border){ return rectTex(1024,200,(g,W,H)=>{ g.fillStyle=bg; g.fillRect(0,0,W,H); if(border){ g.strokeStyle=border; g.lineWidth=12; g.strokeRect(6,6,W-12,H-12); }
  g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle'; g.font=`bold ${Math.min(H*.6,W*.9/txt.length)}px "PingFang TC","Noto Sans CJK TC","Noto Sans TC",sans-serif`; g.fillText(txt,W/2,H*.54); }); }
function plate(tex,w,h,x,y,z,ry=0,parent){ const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.7})); p.position.set(x,y,z); p.rotation.y=ry; add(p,parent); return p; }
function halfPad(color,inset=.18,y=0,h=.09){ const R=4.2, Hh=Math.sqrt(3)*R, oz=-Hh*.24, s=new THREE.Shape(); const hw=z=>R-(z-oz)/(Hh/2)*(R/2);
  const z0=oz+inset, z1=oz+Hh/2-inset; [[-(hw(z0)-inset),z0],[hw(z0)-inset,z0],[hw(z1)-inset,z1],[-(hw(z1)-inset),z1]].forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z)); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2);
  const m=add(new THREE.Mesh(g,mat(color))); m.position.y=y; m.receiveShadow=true; return m; }
function table(x,z,top='#ffffff',umb=null){ cyl(.22,.22,.03,top,x,.5,z,16); cyl(.025,.025,.42,'#9aa0ab',x,.09,z,6); cyl(.12,.12,.02,'#9aa0ab',x,.09,z,10);
  for(const s of [-1,1]){ cyl(.09,.09,.03,top,x+s*.36,.33,z,12); cyl(.02,.02,.24,'#9aa0ab',x+s*.36,.09,z,6); }
  if(umb){ cyl(.018,.018,1.1,'#9aa0ab',x,.53,z,6); const u=add(new THREE.Mesh(new THREE.ConeGeometry(.5,.2,8),mat(umb,{flatShading:true}))); u.position.set(x,1.6,z); } }

/* 一間小店：W 寬、D 深、h 高；左邊櫥窗、右邊門；條紋遮雨棚；女兒牆上招牌；屋頂大食物 */
function shop(o,lv){ halfPad(o.pad); const Y=.1, W=lv>=2?3.5:2.3, D=1.2, h=1.25, cx=lv>=2?0:-.35, cz=-.8, fz=cz+D/2;
  rbox(W,h,D,o.wall,cx,Y,cz,.03); rbox(W+.04,.14,D+.04,o.base,cx,Y,cz,.02);
  const dx=cx+W/2-.42; rbox(.5,.82,.04,o.door,dx,Y+.12,fz+.005,.01); rbox(.42,.72,.02,glass,dx,Y+.16,fz+.025,.004); rbox(.03,.12,.04,'#c9ced6',dx-.13,Y+.5,fz+.04,.004);   // 門
  const ww=W-1.05, wx=cx-W/2+.12+ww/2; rbox(ww+.08,.66,.04,o.trim,wx,Y+.3,fz+.005,.01); rbox(ww,.58,.02,'#3a3540',wx,Y+.34,fz+.01,.004);   // 櫥窗（裡面暗暗的）
  rbox(ww,.04,.18,o.trim,wx,Y+.36,fz-.06,.004); rbox(ww,.58,.02,glass,wx,Y+.34,fz+.04,.004);
  const n=lv>=2?6:3; for(let i=0;i<n;i++) kit(FOOD(o.items[i%o.items.length]),wx-ww/2+(i+.5)*ww/n,fz-.06,{h:.16,y0:Y+.4,rot:i*.9});   // 櫥窗裡的食物
  // 條紋遮雨棚（斜斜的）
  const aw=W+.1, k=Math.round(aw/.24); for(let i=0;i<k;i++){ const s=rbox(aw/k+.002,.03,.5,i%2?o.aw2:o.aw1,cx-aw/2+(i+.5)*aw/k,Y+1.0,fz+.22,.005); s.rotation.x=.35; }
  rbox(aw,.08,.04,o.aw1,cx,Y+.9,fz+.45,.01);
  // 女兒牆＋招牌＋屋頂大食物
  if(!o.jp){ rbox(W+.06,.25,D+.06,o.trim,cx,Y+h,cz,.02); plate(o.sign,Math.min(W-.2,2.0),.32,cx,Y+h+.15,fz+.04); }
  else { const sw=Math.min(W-.4,1.6); rbox(sw+.08,.4,.05,'#5a3a26',cx,Y+h+.08,fz+.42,.01); plate(o.sign,sw,.32,cx,Y+h+.28,fz+.45); for(const s of [-1,1]) rbox(.05,.5,.05,'#5a3a26',cx+s*(sw/2-.1),Y+h-.1,fz+.4,.01); }   // 日式：招牌立在屋簷前
  if(o.big) kit(FOOD(o.big),cx-W/2+.55,cz-.05,{h:o.bigH||.6,y0:Y+h+.25,rot:o.bigRot||.4});
  if(o.extra) o.extra(lv,{cx,cz,fz,W,Y,h});
  for(const [x,z,k2,c] of [[-3.1,-1.15,.55],[3.1,-1.15,.5,'#6fc463']]) tree(x,z,k2,c);
}

const BAKERY={wall:'#f6e6c8',base:'#c49a6c',trim:'#8a5a32',door:'#8a5a32',pad:'#ece2cf',aw1:'#8a5a32',aw2:'#f6e6c8',items:['Bread','Croissant','Cupcake'],big:'Croissant',bigH:.45,
  sign:textTex('木星麵包店','#fff7e6','#8a5a32','#8a5a32'),
  extra:(lv,{cx,fz,W,Y})=>{ if(lv<2) { bush(cx+W/2+.4,fz+.5,.4,'#ffd166'); return; }
    table(-.9,fz+.95,'#f6e6c8'); table(.35,fz+1.0,'#f6e6c8');
    const rx=cx+W/2-.2; rbox(.5,.7,.25,'#a8703f',rx+.3,Y,fz+.55,.02); for(let i=0;i<2;i++) kit(FOOD(i?'Bread':'Croissant'),rx+.3,fz+.55,{h:.12,y0:Y+.3+i*.25}); } };
const ICE={wall:'#ffd1e0',base:'#f38fb0',trim:'#ffffff',door:'#f38fb0',pad:'#f3e6ea',aw1:'#f38fb0',aw2:'#ffffff',items:['IceCream_2','IceCream_3','Popsicle_Strawberry','IceCream_4'],big:'IceCream_2',bigH:.8,bigRot:0,
  sign:textTex('木星冰淇淋','#ffffff','#e0477a','#f38fb0'),
  extra:(lv,{cx,fz,W,Y})=>{ const px=cx-W/2-.35; cyl(.03,.03,.7,'#9aa0ab',px,Y,fz+.4,6); kit(FOOD('Popsicle_Chocolate'),px,fz+.4,{h:.45,y0:Y+.6});   // 門口的冰棒立牌
    if(lv>=2){ table(-.6,fz+1.0,'#ffffff','#7cc8f0'); table(1.0,fz+.95,'#ffffff','#f38fb0'); } } };
const BURGER={wall:'#e5484d',base:'#b5302f',trim:'#f2c230',door:'#b5302f',pad:'#efe4d6',aw1:'#f2c230',aw2:'#ffffff',items:['Burger','Fries','Soda','Cheeseburger'],big:'Burger',bigH:.5,
  sign:textTex('木星漢堡','#f2c230','#b5302f',null),
  extra:(lv,{cx,cz,fz,W,Y})=>{ if(lv<2) return; const sx=cx+W/2+.02; rbox(.04,.5,.6,'#3a3540',sx,Y+.45,cz+.1,.01); rbox(.08,.06,.7,'#f2c230',sx,Y+.95,cz+.1,.01);   // 得來速小窗口
    rbox(.5,1.0,.08,'#f2c230',sx+.9,Y,cz+.35,.02); plate(textTex('得來速','#f2c230','#b5302f'),.42,.14,sx+.9,Y+.82,cz+.4,0);
    table(-1.0,fz+.95,'#ffffff','#e5484d'); table(.4,fz+1.0,'#ffffff','#f2c230'); } };
function jpExtra(lv,{cx,cz,fz,W,Y,h}){ // 日式：灰黑斜屋頂、藍色暖簾、紅燈籠；Lv2 小庭院
  prism(W+.3,1.5,.45,'#3b3f48',cx,Y+h,cz,'x');
  const dx=cx+W/2-.42; for(let i=0;i<3;i++) rbox(.15,.32,.015,'#2b4f8a',dx-.16+i*.16,Y+.6,fz+.06,.003); rbox(.52,.04,.03,'#7a5236',dx,Y+.92,fz+.06,.005);
  for(const x of [cx-W/2-.15]){ cyl(.012,.012,.1,'#3b3550',x,Y+.98,fz+.15,4); const l=sphere(.12,mat('#e8322a',{emissive:new THREE.Color('#e8322a'),emissiveIntensity:.35}),x,Y+.85,fz+.15); l.scale.y=1.35; }
  if(lv>=2){ const gx=cx-1.0, gz=fz+.95; rbox(1.4,.03,.7,'#d9d2c0',gx,Y,gz,.01); for(let i=0;i<6;i++) sphere(.08,'#c9c2b4',gx-.6+i*.24,Y+.04,gz+.3,{flatShading:true});
    cyl(.05,.07,.3,'#9a9488',gx-.4,Y,gz,6); rbox(.22,.16,.22,'#b8b2a6',gx-.4,Y+.3,gz,.02); prism(.3,.3,.12,'#8a847a',gx-.4,Y+.46,gz,'x');   // 石燈籠
    for(let i=0;i<4;i++){ const bx=gx+.3+i*.1, bz=gz-.12+(i%2)*.12; cyl(.02,.02,1.0+i*.08,'#5aa83f',bx,Y,bz,6); for(let j=0;j<3;j++){ const lf=rbox(.24,.015,.06,'#6fc463',bx+.08,Y+.55+j*.18+i*.04,bz,.005); lf.rotation.set(0,i+j,-.4); } }   // 竹子（細竹竿＋小葉片）
    rbox(.9,.06,.3,'#7a5236',1.0,Y+.35,fz+.95,.01); for(const s of [-1,1]) rbox(.06,.35,.25,'#5a3a26',1.0+s*.38,Y,fz+.95,.01); } }
const JP={wall:'#8a6244',base:'#5a3a26',trim:'#e9dcc4',door:'#5a3a26',pad:'#e4dccb',aw1:'#3b3f48',aw2:'#3b3f48',items:['Sushi_Roll1','Sushi_Nigiri1','Sushi_Nigiri2'],big:null,jp:1,
  sign:textTex('木星壽司','#f4efe4','#2b2b33','#2b4f8a'), extra:jpExtra};

const LV2=(id,name,o)=>[1,2].map(l=>[id+(l>1?l:''),name+' Lv'+l,()=>shop(o,l),'half']);
export const BAKERY_LV=LV2('bakery','麵包店',BAKERY), ICE_LV=LV2('icecream','冰淇淋店',ICE), BURGER_LV=LV2('burger','漢堡店',BURGER), JP_LV=LV2('japanese','日式料理店',JP);
export const FOOD2_TOP=[0,2.4,2.4];
