/* Winston City 3 住宅區（3 級，1 格；家長 2026-11-11 15:45：改用 Kenney City Kit 模型，磚紅＋白（家長 15:49 改），美式獨棟分開蓋）。
   Lv1 兩棟獨棟（suburban q、o）＋前院草坪、白柵欄、車道 → Lv2 三棟兩層樓獨棟（l、p、o）各有前院
   → Lv3 拆掉透天，兩棟一樣的磚紅公寓（commercial h ×2），中間自然風庭院（石板小路、樹、草坡、石頭、長椅、花）。15:52 家長：房子往前移、車道變短、樹和花加多、不要木平台。15:54 定稿。
   模型：models/sub、models/com（Kenney，CC0）。綠屋頂換炭灰、黑牆換磚紅（colormap_brick.png）。座標：前面朝 +z。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, tree, butterfly } from './lib.js';
import { bird } from './s1_more.js';
import { kit as kit0 } from './s1_kit.js';
import { win } from './stage1.js';
const BRICK=p=>p.startsWith('models/com')?'models/com/Textures/colormap_brick.png':'models/sub/Textures/colormap_brick.png';
/* 放一個 Kenney 模型（同步放好位置，模型載好再出現）；dark＝換成磚紅貼圖 */
const kit=(path,x,z,o={})=>kit0(path,x,z,{w:o.w,rot:o.rot,map:o.dark?BRICK(path):null});
const SUB=n=>`models/sub/${n}.glb`, COM=n=>`models/com/${n}.glb`;
const lawn=(x,z,w,d,c='#8fcf6a')=>rbox(w,.05,d,mat(c,{roughness:.95}),x,.05,z,.03);
function hexLawn(r=3.75,c='#93d06c'){ const sh=new THREE.Shape(); for(let i=0;i<6;i++){ const a=i*Math.PI/3; i?sh.lineTo(r*Math.cos(a),r*Math.sin(a)):sh.moveTo(r*Math.cos(a),r*Math.sin(a)); }
  const g=new THREE.ExtrudeGeometry(sh,{depth:.04,bevelEnabled:false}); g.rotateX(-Math.PI/2); const m=add(new THREE.Mesh(g,mat(c,{roughness:.95}))); m.position.y=.03; }
function walk(x0,x1,z,d=.45){ rbox(x1-x0,.05,d,'#e6e0d4',(x0+x1)/2,.06,z,.02); }        // 路邊人行道
function picket(x0,x1,z){ const n=Math.round((x1-x0)/.12); for(let i=0;i<=n;i++){ const px=x0+i*(x1-x0)/n; rbox(.05,.3,.04,'#ffffff',px,0,z,.012); }
  rbox(x1-x0,.04,.03,'#ffffff',(x0+x1)/2,.2,z,.008); rbox(x1-x0,.04,.03,'#ffffff',(x0+x1)/2,.08,z,.008); }
function driveway(x,z0,z1,w=.7){ rbox(w,.05,z1-z0,'#b9b4ad',x,.07,(z0+z1)/2,.02); }
function mailbox(x,z){ cyl(.02,.02,.42,'#2f2f36',x,0,z,6); rbox(.12,.12,.2,'#2f2f36',x,.42,z,.04); }
function rock(x,z,s=1,c='#9a958c'){ const r=add(new THREE.Mesh(new THREE.DodecahedronGeometry(.16*s,0),mat(c,{flatShading:true,roughness:.9}))); r.position.set(x,.08*s,z); r.scale.y=.7; r.rotation.y=x*3; }
function bench(x,z,rot=0){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; ROOT.add(g);
  rbox(.55,.05,.18,'#b07a4c',0,.16,0,.01,g); rbox(.55,.14,.04,'#b07a4c',0,.22,-.08,.01,g); for(const s of [-1,1]) rbox(.04,.16,.16,'#2f2f36',s*.23,0,0,.005,g); }
function deck(x,z,w,d){ rbox(w,.08,d,'#b98a5c',x,.07,z,.01); for(let i=0;i<Math.round(w/.12);i++) rbox(.01,.085,d,'#9c7048',x-w/2+i*.12,.07,z,.003); }
function shrubs(x0,x1,z){ for(let x=x0;x<=x1;x+=.22){ const b=sphere(.13,mat('#4f9a48',{flatShading:true,roughness:.9}),x,.15,z); b.scale.y=.8; if(Math.round(x*10)%3===0) sphere(.04,'#ffffff',x+.05,.27,z+.08); } }
function bed(x0,x1,z){ for(let x=x0;x<=x1;x+=.16){ const i=Math.round(x*7); sphere(.075,['#ffffff','#ffd166','#c99be8','#ff9fb6','#ff7a7a'][((i%5)+5)%5],x,.16,z+((i%2)*.08-.04),{flatShading:true}); sphere(.06,'#5fae4e',x+.08,.09,z-.06,{flatShading:true}); } }
function flowers(x,z,n=6){ const C=['#ffffff','#ffd166','#c99be8','#ff9fb6']; for(let i=0;i<n;i++) sphere(.07,i%2?'#5fae4e':C[i%4],x+((i*.37)%1-.5)*.5,.12,z+((i*.61)%1-.5)*.3,{flatShading:true}); }
function stones(pts){ for(let i=0;i<pts.length-1;i++){ const [a,b]=[pts[i],pts[i+1]]; for(let t=0;t<1;t+=.22){ const s=rbox(.24,.05,.2,'#e2dccf',a[0]+(b[0]-a[0])*t,.07,a[1]+(b[1]-a[1])*t,.03); s.rotation.y=t*2+i; } } }
/* 一家的前院：草坪、車道、白柵欄、信箱 */
function yard(x,zHouse,zFront,w,dx){ lawn(x,(zHouse+zFront)/2,w-.15,zFront-zHouse,'#9ad874'); driveway(x+dx,zHouse,zFront+.25);
  picket(x-w/2+.05,x+dx-.4,zFront); picket(x+dx+.4,x+w/2-.05,zFront); mailbox(x+dx-.5,zFront+.15); }

export let WX=1.45, WY=0.98, WZ=.8;   // 二樓
export function home(lv){
  const F=2.55;                                                       // 前院柵欄的 z
  hexLawn();
  butterfly(-1.1,.75,1.75,{c:'#f6a8c9',r:.45}); butterfly(1.2,.85,1.7,{c:'#f2c230',r:.5});   /* 家長 11-13：住宅區加蝴蝶和小鳥 */
  bird(-.25,2.05,1,0,'#7a6a5a'); bird(.45,1.95,-2,0,'#6b8fb5');
  if(lv===1){
    const Fz=2.35; walk(-1.95,1.95,Fz+.4);
    yard(-1.3,.75,Fz,2.4,.6); yard(1.3,.75,Fz,2.4,-.6);
    kit(SUB('building-type-q'),-1.3,-.05,{w:2.4,dark:true});
    kit(SUB('building-type-o'),1.3,-.1,{w:2.4,dark:true});
    win(WX,WY,WZ,.42,.36,0,'#ffffff');   // 一之一：右邊房子二樓白牆加一個窗戶
    shrubs(-2.3,-1.05,.95); shrubs(1.0,2.3,.95); stones([[-1.6,1.0],[-1.7,Fz]]); stones([[1.6,1.0],[1.7,Fz]]);
    bed(-2.3,-1.2,Fz-.2); bed(1.2,2.3,Fz-.2);
    for(const [x,z,w] of [[-2.2,-1.7,.6],[-.7,-1.9,.55],[.6,-2.1,.6],[2.0,-1.8,.55],[-2.9,.3,.45],[2.9,.4,.45],[0,-2.9,.5]]) kit(SUB('tree-large'),x,z,{w});
    for(const [x,z] of [[-1.4,-2.7],[1.4,-2.8],[-2.6,-.9],[2.6,-.8]]) kit(SUB('tree-small'),x,z,{w:.4});
    flowers(-1.0,1.6); flowers(1.0,1.6); flowers(-2.6,-2.0,8); flowers(2.6,-2.0,8);
  }
  if(lv===2){
    const Fz=2.4; walk(-2.0,2.0,Fz+.4);
    const xs=[-2.1,0,2.1];
    for(const [i,x] of xs.entries()) yard(x,.55,Fz,2.0,i===1?.55:(i===0?.5:-.5));
    kit(SUB('building-type-l'),-2.1,-.25,{w:1.95,dark:true});
    kit(SUB('building-type-p'),0,-.4,{w:2.05,dark:true});
    kit(SUB('building-type-o'),2.1,-.25,{w:1.95,dark:true});
    shrubs(-2.9,-1.9,.75); shrubs(-.85,-.1,.75); shrubs(1.9,2.9,.75);
    bed(-2.8,-1.9,Fz-.2); bed(-.8,.0,Fz-.2); bed(1.9,2.8,Fz-.2);
    for(const [x,z,w] of [[-2.0,-1.8,.55],[-.8,-2.2,.5],[.9,-2.2,.55],[2.1,-1.9,.5],[0,-3.0,.5],[-2.9,1.2,.42],[2.9,1.3,.42]]) kit(SUB('tree-large'),x,z,{w});
    for(const [x,z] of [[-1.4,-2.8],[1.5,-2.8],[-2.7,-1.0],[2.8,-1.0]]) kit(SUB('tree-small'),x,z,{w:.4});
    flowers(-2.3,1.5); flowers(.3,1.5); flowers(2.3,1.5); flowers(-2.4,-2.4,8); flowers(2.4,-2.4,8);
  }
  if(lv===3){
    kit(COM('building-h'),-1.6,-1.6,{w:2.3,dark:true,rot:Math.PI});   // 轉 180°，門朝前（家長 11-18 23:38：門在背面）
    kit(COM('building-h'),1.65,-1.3,{w:2.3,dark:true,rot:Math.PI});
    // 自然風庭院：彎彎的石板路、草坡、樹、石頭、長椅、野花（家長 15:52：不要木平台）
    stones([[0,3.3],[.45,2.3],[-.2,1.3],[.25,.25],[-.05,-.6]]); stones([[-.2,1.3],[-1.5,.7]]); stones([[.25,.25],[1.6,.3]]);
    const hill=add(new THREE.Mesh(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),mat('#7fbf58',{roughness:.95}))); hill.position.set(-1.5,0,2.0); hill.scale.set(1.0,.32,.75);
    bench(1.6,.65,Math.PI); bench(-1.6,.55,Math.PI);
    for(const [x,z,s] of [[-.6,-.25,1.6],[.85,2.6,1.2],[-2.5,.4,1.1],[2.6,.1,1.0],[.9,-.15,.9],[-.4,1.9,.8]]) rock(x,z,s);
    for(const [x,z,w] of [[-.75,2.6,.6],[.6,-.5,.6],[-2.4,1.3,.55],[1.5,1.7,.6],[2.4,2.3,.5],[-.1,-2.9,.55],[-3.0,-.6,.45],[3.0,-.4,.45]]) kit(SUB('tree-large'),x,z,{w});
    for(const [x,z] of [[2.6,1.2],[-1.9,2.7],[1.0,2.0],[-1.2,-.1],[2.2,.9]]) kit(SUB('tree-small'),x,z,{w:.4});
    flowers(-1.2,2.75,8); flowers(1.0,.75,8); flowers(-.9,-.1,8); flowers(2.3,2.0,8); flowers(-2.6,-.2,8); flowers(1.9,1.2,8); flowers(-.3,2.9,8);
    bed(-2.3,-.9,-.35); bed(.6,2.6,-.1);
  }
}
export const HOME_LV=[1,2,3].map(l=>['home'+(l>1?l:''),'住宅區 Lv'+l,()=>home(l),'whole']);
