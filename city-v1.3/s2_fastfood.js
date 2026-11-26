/* Winston City 第二階段：漢堡披薩店（美食區，半格，一級，6 顆；家長 11-19 12:02 選 A：漢堡店、披薩店合成一個半格）
   底：Sketchfab「Low poly business buildings pack」（assetfactory，Sketchfab Standard 授權）的 BurgerBuilding、PizzaBuilding，
       各自抽出來放在 models/sk/ff_burger.glb、ff_pizza.glb（貼圖縮 512）。
   加工（家長：增加細緻度、顏色不要刺眼）：貼圖降低彩度；兩棟中間加一段紅磚連接牆＋同一片遮雨棚（圓弧波浪邊）；
       整塊半格鋪紅磚地；門口兩組小圓桌＋陽傘、盆栽、菜單立牌、路燈、腳踏車架。
   座標同麵包店的半格：建地中心為原點、正門朝 +z。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, tree } from './lib.js';
import { kit } from './s1_kit.js';

const BRICK='#a9543c', CREAM='#f3e6cc', DARK='#3a3a40', OLIVE='#6f7a4a';
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; }
/* 紅磚地（人字形）、紅磚牆 */
const floorTex=rectTex(256,256,(g,W,H)=>{ g.fillStyle='#b3a58c'; g.fillRect(0,0,W,H); const C=['#d9cdb5','#cfc2a8','#ddd2bc','#c9bca2'];   // 家長 12:16：紅磚地和紅色建築黏在一起 → 改淺灰米色石板
  for(let j=0;j<8;j++) for(let i=0;i<4;i++){ g.fillStyle=C[(i*3+j*5)%4]; const x=i*64+(j%2?32:0), y=j*32; g.fillRect(x+1.5,y+1.5,61,29); g.fillRect(x+1.5-256,y+1.5,61,29); } });
const brickTex=rectTex(256,256,(g,W,H)=>{ g.fillStyle='#d9c7b0'; g.fillRect(0,0,W,H); const C=['#a9543c','#9c4b35','#b45e45','#93452f'];
  for(let j=0;j<16;j++) for(let i=-1;i<9;i++){ g.fillStyle=C[(i*7+j*3+40)%4]; g.fillRect(i*32+(j%2?16:0)+1.5,j*16+1.5,29,13); } });
function halfPad(inset=.18,y=0,h=.09){ const R=4.2, Hh=Math.sqrt(3)*R, oz=-Hh*.24, s=new THREE.Shape(); const hw=z=>R-(z-oz)/(Hh/2)*(R/2);
  const z0=oz+inset, z1=oz+Hh/2-inset; [[-(hw(z0)-inset),z0],[hw(z0)-inset,z0],[hw(z1)-inset,z1],[-(hw(z1)-inset),z1]].forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z)); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2);
  const t=floorTex.clone(); t.needsUpdate=true; t.repeat.set(1.4,1.4);
  const m=add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:t,roughness:.85}))); m.position.y=y; m.receiveShadow=true; return m; }
/* 把模型貼圖的彩度、亮度降下來（家長：顏色不要刺眼） */
function soften(o,sat=.62,lum=.9){ o.traverse(m=>{ if(!m.isMesh||!m.material.map) return; const img=m.material.map.image; if(!img) return;
  const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; const g=c.getContext('2d'); g.drawImage(img,0,0); const d=g.getImageData(0,0,c.width,c.height), a=d.data;
  for(let i=0;i<a.length;i+=4){ const y=.3*a[i]+.59*a[i+1]+.11*a[i+2]; for(let k=0;k<3;k++) a[i+k]=Math.min(255,(y+(a[i+k]-y)*sat)*lum); }
  g.putImageData(d,0,0); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.flipY=m.material.map.flipY; t.anisotropy=4;
  m.material=new THREE.MeshStandardMaterial({map:t,roughness:.75}); }); }
/* 遮雨棚：同麵包店的圓弧波浪邊，這裡用磚紅＋奶油白條紋 */
function awning(w,x,y,z,depth=.4){ const g=grp(x,y,z), n=Math.max(2,Math.round(w/.18)), sw=w/n, drop=.16, vh=.05;
  for(let i=0;i<n;i++){ const c=i%2?CREAM:'#b5553e', x0=-w/2+i*sw, x1=x0+sw, m=mat(c,{side:THREE.DoubleSide,roughness:.8});
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([x0,0,0, x1,0,0, x1,-drop,depth, x0,-drop,depth],3)); geo.setIndex([0,2,1, 0,3,2]); geo.computeVertexNormals();
    add(new THREE.Mesh(geo,m),g).castShadow=true;
    const sh=new THREE.Shape(); sh.moveTo(-sw/2,0); sh.lineTo(sw/2,0); sh.lineTo(sw/2,-vh); sh.absarc(0,-vh,sw/2,0,-Math.PI,true); sh.closePath();
    const sc=new THREE.Mesh(new THREE.ShapeGeometry(sh,10),m); sc.position.set(x0+sw/2,-drop,depth); add(sc,g); }
  rbox(w+.04,.04,.05,DARK,0,-.02,0,.006,g); rbox(w+.02,.02,.03,DARK,0,-drop-.01,depth,.004,g); }
/* 小圓桌＋兩張椅子＋陽傘 */
function cafeSet(x,z,c='#b5553e'){ cyl(.16,.16,.02,'#f2efe8',x,.48,z,16); cyl(.02,.02,.4,DARK,x,.09,z,6); cyl(.09,.09,.015,DARK,x,.09,z,10);
  for(const s of [-1,1]){ const cx=x+s*.28; cyl(.09,.09,.02,'#c9a36a',cx,.33,z,12); for(const k of [-1,1]) cyl(.01,.01,.24,DARK,cx+k*.05,.09,z,4); }
  cyl(.012,.012,.85,'#d9d5cc',x,.5,z,6); const top=add(new THREE.Mesh(new THREE.ConeGeometry(.42,.18,8,1,true),mat(c,{side:THREE.DoubleSide,roughness:.7}))); top.position.set(x,1.38,z);
  cyl(.02,.02,.04,DARK,x,1.47,z,6);
  cyl(.06,.045,.06,'#f2efe8',x+.06,.5,z+.02,10); cyl(.03,.026,.1,'#c9563f',x-.06,.5,z-.02,8); }
function planter(x,z){ rbox(.34,.26,.2,'#7a4a32',x,.09,z,.02); for(let i=0;i<3;i++) sphere(.09,mat(i%2?'#4f8f4a':'#5f9e55',{flatShading:true}),x-.1+i*.1,.42,z); }
function lampPost(x,z){ cyl(.025,.035,1.3,DARK,x,.09,z,8); rbox(.12,.16,.12,mat('#fff1c8',{emissive:new THREE.Color('#ffd98a'),emissiveIntensity:.6}),x,1.4,z,.02); rbox(.16,.03,.16,DARK,x,1.56,z,.01); }
function menuBoard(x,z,ry=0){ const g=grp(x,.09,z,ry); for(const s of [1,-1]){ const p=new THREE.Group(); p.position.y=.5; p.rotation.x=-s*.18; g.add(p);
  rbox(.32,.46,.02,'#7a4a32',0,-.46,s*.02,.004,p); rbox(.27,.38,.01,'#2f3a33',0,-.42,s*.032,.002,p);
  for(let i=0;i<4;i++) rbox(.18-i*.02,.012,.003,'#f2efe8',0,-.18-i*.07,s*.04,.001,p); } }
function bikeRack(x,z){ for(let i=0;i<3;i++){ const r=add(new THREE.Mesh(new THREE.TorusGeometry(.12,.012,6,12,Math.PI),mat(DARK))); r.position.set(x+i*.18,.1,z); } }

function fastfood(){ halfPad();
  // 左：漢堡店、右：披薩店（模型朝 +z、縮小後並排）
  kit('models/sk/ff_pizza.glb',-1.68,-.8,{w:2.65,y0:.1,then:o=>soften(o)});   // 家長 12:16：披薩放左、漢堡放右
  kit('models/sk/ff_burger.glb',1.6,-.7,{w:2.45,y0:.1,then:o=>soften(o)});
  // 中間的紅磚連接牆、小門、遮雨棚拿掉（家長 12:28）
  // 門口：兩組陽傘桌、盆栽、立牌、路燈、腳踏車架
  cafeSet(-1.15,1.2,'#b5553e'); cafeSet(1.0,1.2,'#b5553e');   // 兩把陽傘同色、紅色（家長 12:16、12:28）   // 漢堡店模型左邊自帶戶外長椅區，陽傘桌放前面一點
  for(const x of [-.2,.17]) planter(x,-1.3);   // 兩個盆栽並排（家長 12:47）   // 盆栽在兩棟中間（家長 12:43）
  menuBoard(-.15,-.25,-.6);   /* 斜斜朝向街道（家長 12:47） */   // 立牌在披薩店右前方、正面朝前 lampPost(-2.4,1.0); lampPost(2.55,.75); bikeRack(.35,1.95);
  for(const [x,z,k,c] of [[-3.1,-1.15,.5],[3.1,-1.15,.5,'#6fc463']]) tree(x,z,k,c);
}
export const FASTFOOD_LV=[['fastfood','漢堡披薩店',fastfood,'half']], FASTFOOD_TOP=[0,2.6];
