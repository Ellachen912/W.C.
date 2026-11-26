/* Winston City 櫥窗食物（家長 11-25 17:14：櫥窗食物自己換一換）
   原本櫥窗裡的拉麵、壽司、麵包、甜甜圈是外面下載的模型，每一個都有很多零件、材質各不相同，畫面很吃力。
   改成用簡單形狀自己畫，顏色一看就認得出是什麼食物；全部用共用材質，蓋好後會跟建築一起合併，幾乎不花力氣。
   用法和 kit() 一樣：food(種類, x, z, {h 或 w, y0 底部高度, rot, parent}) */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat } from './lib.js';

const RICE='#fbf8ef', SALMON='#f08a5d', TUNA='#d9404a', EGG='#f2d04a', SHRIMP='#f7a58a', NORI='#1f2a1f';
function nigiri(g,x,z,top,ry=0){ const n=new THREE.Group(); n.position.set(x,0,z); n.rotation.y=ry; g.add(n);
  rbox(.22,.1,.13,RICE,0,0,0,.04,n); rbox(.26,.05,.15,top,0,.09,0,.02,n); if(top===EGG) rbox(.04,.11,.152,NORI,0,.02,0,.005,n); }
function maki(g,x,z){ cyl(.1,.1,.14,NORI,x,0,z,14,g); cyl(.085,.085,.01,RICE,x,.14,z,14,g); cyl(.035,.035,.012,SALMON,x,.145,z,10,g); }
/* 每一種：[原本的大小（決定縮放）, 'h' 或 'w', 畫法] */
const KINDS={
  Bread:[.5,'h',g=>{ rbox(1.0,.45,.55,'#c98a45',0,0,0,.2,g); for(const x of [-.25,0,.25]){ const c=rbox(.06,.03,.4,'#e8b775',x,.43,0,.015,g); c.rotation.y=.5; } }],
  Croissant:[.32,'h',g=>{ const t=add(new THREE.Mesh(new THREE.TorusGeometry(.34,.15,8,14,Math.PI*1.25),mat('#d99a4a',{roughness:.6})),g); t.rotation.x=-Math.PI/2; t.rotation.z=-Math.PI*.12; t.position.y=.15; t.scale.z=1.4;
    for(const a of [.3,.8,1.3,1.8,2.3,2.8,3.3]){ const s=sphere(.07,'#c07e35',Math.cos(a)*.34,.27,-Math.sin(a)*.34,{},g); s.scale.set(1,.4,1); } }],
  Cupcake:[.7,'h',g=>{ cyl(.28,.22,.3,'#f6c6d4',0,0,0,16,g); const f=sphere(.3,'#ff9fbf',0,.36,0,{},g); f.scale.y=.7; sphere(.07,'#d9304a',0,.58,0,{},g); }],
  Donut1:[.3,'h',g=>{ const d=add(new THREE.Mesh(new THREE.TorusGeometry(.3,.13,8,18),mat('#c98a45')),g); d.rotation.x=-Math.PI/2; d.position.y=.13;
    const ic=add(new THREE.Mesh(new THREE.TorusGeometry(.3,.11,6,18,Math.PI*2),mat('#ff9fbf')),g); ic.rotation.x=-Math.PI/2; ic.position.y=.17; ic.scale.z=.6; }],
  Donut2:[.3,'h',g=>{ const d=add(new THREE.Mesh(new THREE.TorusGeometry(.3,.13,8,18),mat('#c98a45')),g); d.rotation.x=-Math.PI/2; d.position.y=.13;
    const ic=add(new THREE.Mesh(new THREE.TorusGeometry(.3,.11,6,18),mat('#6b3e26')),g); ic.rotation.x=-Math.PI/2; ic.position.y=.17; ic.scale.z=.6;
    for(const [x,z,c] of [[.25,.1,'#ffd166'],[-.2,.18,'#4ecdc4'],[-.1,-.28,'#ffffff'],[.15,-.22,'#ff6b6b']]) rbox(.06,.02,.025,c,x,.25,z,.008,g); }],
  /* 日式料理店櫥窗 */
  ramen:[1.0,'w',g=>{ cyl(.5,.32,.32,'#c8322a',0,0,0,20,g); cyl(.5,.5,.02,'#f6efe2',0,.32,0,20,g); cyl(.45,.45,.02,'#f0c070',0,.31,0,20,g);
    for(const [x,z] of [[-.18,.08],[.06,-.2]]){ const e=sphere(.11,'#ffffff',x,.34,z,{},g); e.scale.y=.45; const y=sphere(.055,'#f2b230',x,.37,z,{},g); y.scale.y=.4; }
    cyl(.1,.1,.03,'#ffffff',.2,.33,.12,12,g); cyl(.05,.05,.032,'#ff8fa3',.2,.335,.12,10,g); rbox(.22,.04,.18,'#8c5a3c',-.05,.32,.25,.01,g);
    for(const [x,z] of [[.05,.05],[-.05,-.05],[.12,-.02],[0,.15]]) cyl(.02,.02,.02,'#5bbf6a',x,.34,z,6,g); }],
  platter:[1.6,'w',g=>{ rbox(1.6,.08,.7,'#a8784e',0,0,0,.02,g); const tops=[SALMON,TUNA,EGG,SHRIMP];
    for(let i=0;i<4;i++) for(const z of [-.16,.16]) nigiri(g,-.57+i*.38,z,tops[(i+(z>0?1:0))%4]); g.children.forEach(c=>{ if(c.isGroup) c.position.y=.08; }); }],
  sushiPlate:[.9,'w',g=>{ cyl(.45,.38,.05,'#ffffff',0,0,0,24,g); cyl(.36,.36,.01,'#2c5f8a',0,.05,0,24,g);
    for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; nigiri(g,Math.cos(a)*.22,Math.sin(a)*.22,i%2?SALMON:TUNA,-a); } g.children.forEach(c=>{ if(c.isGroup) c.position.y=.06; }); }],
  nigiri:[.5,'w',g=>{ nigiri(g,-.13,0,SALMON); nigiri(g,.13,0,EGG); }],
  roll:[.6,'w',g=>{ maki(g,-.2,0); maki(g,0,.05); maki(g,.2,0); }],
};
export function food(kind,x,z,{h,w,y0=0,rot=0,parent}={}){ const K=KINDS[kind]; if(!K) return null; const [size,by,draw]=K;
  const g=new THREE.Group(); g.position.set(x,y0,z); g.rotation.y=rot; (parent||ROOT).add(g); draw(g);
  const want=by==='h'?(h||w):(w||h); g.scale.setScalar(want?want/size:1); return g; }
