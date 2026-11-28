/* Winston City 9 菜園、10 牧場（原名養雞場），各 2 級。家長 2026-11-11 17:46：用 Quaternius 的 Farm Buildings、Ultimate Food、Farm Animals 和 Kenney Fantasy Town 模型。
   菜園 Lv1 紅色小穀倉工具屋、三排菜（高麗菜、紅蘿蔔、番茄和紅椒）、稻草人、水井、蔬菜推車、木柵欄、很多樹
   → Lv2 再兩排菜（南瓜和茄子、青椒和紅椒）、稻田和白鷺鷥、金黃小麥田和荷蘭風車（把小麥磨成麵粉，葉片會轉）。（18:56 拿掉竹棚瓜架）
   牧場（18:38 定稿）Lv1 紅色穀倉、網子雞舍（架高小屋＋斜坡＋產蛋箱＋鐵絲網運動場）、雞蛋攤、圓形豬圈、抽水風車（會轉）
   → Lv2 穀倉換成大牛舍、圓筒穀倉、圓形牛欄（乳牛、乾草架、水槽）、圓捆乾草、牛奶桶。
   11-28 07:59 家長：菜園加一圈木柵（不要貼著六角格邊緣、入口大一點，不要像關起來）。 */
import * as THREE from 'three';
import { animals, ROOT, setRoot, add, rbox, cyl, sphere, mat, tree, bush, prism, canvasTex, textPlate, anims, butterfly } from './lib.js';
import { GARDEN, FARM, scarecrow, chicken, beam, rotors, awning } from './stage1.js';
import { kit, FARMB, FOOD, ANIMAL } from './s1_kit.js';
const FT=n=>`models/ft/${n}.glb`;
// ---------- 共用 ----------
function bed(x,z,w,items,s=.26,soil=GARDEN.soil){        // 一畦菜：一排只種一種；兩種就左半排一種、右半排一種（家長 20:12：不要交錯）
  rbox(w,.16,.5,soil,x,0,z,.06); const n=Math.round(w/.42);
  for(let i=0;i<n;i++) kit(FOOD(items[Math.min(items.length-1,Math.floor(i*items.length/n))]),x-w/2+(i+.5)*w/n,z,{w:s,y0:.14,rot:i*1.3});
}
function picket(x0,x1,z){ const n=Math.max(1,Math.round((x1-x0)/1.4)); for(let i=0;i<n;i++) kit(FARMB('Fence2'),x0+(i+.5)*(x1-x0)/n,z,{w:(x1-x0)/n}); }
function railFence(x0,z0,x1,z1){ const len=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.round(len/1.4)), rot=-Math.atan2(z1-z0,x1-x0);
  for(let i=0;i<n;i++){ const t=(i+.5)/n; kit(FARMB('Fence'),x0+(x1-x0)*t,z0+(z1-z0)*t,{h:.32,rot}); } }
/* ---------- 菜園木柵（家長 11-28 07:59） ----------
   沿著六角格繞一圈，但往內縮：草地邊緣離中心約 3.38，柵欄放在 3.1（11-28 08:11 家長：再靠邊一點點），中間留一條草地喘口氣。
   柵欄矮矮的（0.36）、木樁之間有空隙；正面（朝 +z 的路）留 1.7 寬的大入口，兩邊門柱稍高、旁邊種花，入口接木板步道。
   工具屋、Lv2 風車擋到的地方不畫柵欄（柵欄接到建築的牆）。 */
const FENCE_AP=3.1, GATE=.85, FENCE_C='#9a6a44', FENCE_STEP=.32;
const hexD=(x,z)=>Math.max(Math.abs(z),.866*Math.abs(x)+.5*Math.abs(z));          // 到中心的「六角距離」（等於離哪一條邊多近）
function clearOf(x,z){ const d=hexD(x,z); if(d>FENCE_AP) return d<FENCE_AP+.3?[x*(FENCE_AP+.3)/d,z*(FENCE_AP+.3)/d]:[x,z];   // 柵欄外面的樹：至少離柵欄 0.3
  return d>FENCE_AP-.38?[x*(FENCE_AP-.38)/d,z*(FENCE_AP-.38)/d]:[x,z]; }                                                      // 柵欄裡面的樹：往內收，不要壓到柵欄
function gardenFence(lv){
  const r=FENCE_AP/.866, V=[...Array(6)].map((_,i)=>[r*Math.cos(i*Math.PI/3),r*Math.sin(i*Math.PI/3)]);   // 六個角（z 往前是正）
  const skip=[{x0:-2.45,x1:-.85,z0:-2.3,z1:-.9}];                                                       // 工具屋
  const skipC=lv>=2?[[2.45,-.35,.6]]:[];                                                                   // 風車底座
  const blocked=(x,z)=>skip.some(s=>x>s.x0&&x<s.x1&&z>s.z0&&z<s.z1)||skipC.some(([cx,cz,cr])=>Math.hypot(x-cx,z-cz)<cr)||(z>FENCE_AP-.05&&Math.abs(x)<GATE);
  for(let e=0;e<6;e++){ const [ax,az]=V[e], [bx,bz]=V[(e+1)%6], n=Math.round(r/FENCE_STEP); let prev=null;
    for(let i=0;i<=n;i++){ const t=i/n, x=ax+(bx-ax)*t, z=az+(bz-az)*t;
      if(blocked(x,z)){ prev=null; continue; }
      if(i<n||e===5) cyl(.028,.034,.36,FENCE_C,x,0,z,6);                                                  // 木樁（角上的只畫一次）
      if(prev) for(const y of [.14,.28]) beam([prev[0],y,prev[1]],[x,y,z],.016,FENCE_C,5);                 // 兩條橫木
      prev=[x,z]; } }
  for(const s of [-1,1]){ const gx=s*GATE;                                                                // 入口兩根門柱＋小圓頂＋花
    cyl(.05,.055,.5,FENCE_C,gx,0,FENCE_AP,8); sphere(.065,FENCE_C,gx,.54,FENCE_AP);
    bush(gx+s*.38,FENCE_AP+.22,.4,s<0?'#ff8fa3':'#ffd166'); }                                         // 花種在柵欄外、入口兩邊
  for(let z=FENCE_AP+.12;z>(lv>=2?1.55:1.15);z-=.22){                                                 // 木板步道：從入口走到菜畦前（Lv2 走在兩片麥田中間）
    rbox(.44,.035,.16,'#c9a27a',(z*7%2-1)*.02,.09,z,.01); }
}
// ---------- 菜園 ----------
function paddy(x,z,w,d){                    // 稻田：水汪汪的田＋一排排綠色秧苗＋田埂
  rbox(w+.12,.1,d+.12,'#a88a5a',x,0,z,.03);
  rbox(w,.02,d,mat('#7fc6d8',{roughness:.2,metalness:.1}),x,.1,z,.01);
  for(let i=0;i<Math.floor(w/.16);i++) for(let j=0;j<Math.floor(d/.18);j++){ const px=x-w/2+.1+i*.16, pz=z-d/2+.1+j*.18;
    for(const a of [-.3,0,.3]){ const s=rbox(.015,.13,.015,'#6cc04f',px,.1,pz,.005); s.rotation.z=a; } }
}
function egret(x,z,rot=0){                  // 白鷺鷥
  const g=new THREE.Group(); g.position.set(x,.12,z); g.rotation.y=rot; ROOT.add(g); animals.push({g,kind:'egret',x0:x,z0:z,r:.25,ph:Math.random()*9});
  const b=sphere(.08,'#ffffff',0,.28,0,{},g); b.scale.set(1.5,.9,.9);
  const nk=add(new THREE.Mesh(new THREE.CylinderGeometry(.018,.022,.2,6),mat('#ffffff')),g); nk.position.set(.1,.4,0); nk.rotation.z=-.4;
  sphere(.04,'#ffffff',.15,.5,0,{},g); const bk=add(new THREE.Mesh(new THREE.ConeGeometry(.015,.1,6),mat('#f2c230')),g); bk.rotation.z=-Math.PI/2; bk.position.set(.22,.5,0);
  for(const s of [-1,1]) cyl(.006,.006,.22,'#3b3550',0,0,s*.03,4,g);
}
function wheat(x,z,w,d){                    // 小麥田：用農場包的麥子模型（家長 11-12 22:44：麥田用在菜園）
  rbox(w+.1,.1,d+.1,'#b58a5c',x,0,z,.03);
  const nx=5, nz=3; for(let i=0;i<nx;i++) for(let j=0;j<nz;j++) { const g=kit('models/farmx/wheat.glb',x-w/2+(i+.5)*w/nx+(j%2)*.06,z-d/2+(j+.5)*d/nz,{w:.62,y0:.09,rot:(i*3+j)*.9}); const ph=g.position.x*1.3+g.position.z*.7; anims.push(t=>{ g.rotation.x=Math.sin(t*1.3+ph)*.045; g.rotation.z=Math.sin(t*1.1+ph)*.03; }); }   /* 麥穗隨風擺 */
}
function trellis(x,z){                      // 竹棚瓜架：高高的竹架，上面爬滿葉子，吊著南瓜和絲瓜
  const W=1.2, D=.9, H=1.5;
  for(const [dx,dz] of [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]]) cyl(.035,.04,H,'#c9b06a',x+dx,0,z+dz,8);
  for(let i=0;i<5;i++) rbox(.03,.03,D,'#c9b06a',x-W/2+i*W/4,H,z,.01); for(let j=0;j<4;j++) rbox(W,.03,.03,'#c9b06a',x,H,z-D/2+j*D/3,.01);
  for(let i=0;i<14;i++){ const a=(i*.618)%1, b=(i*.382)%1; const l=sphere(.14,mat('#5fae4e',{flatShading:true}),x-W/2+.1+a*(W-.2),H+.05,z-D/2+.1+b*(D-.2)); l.scale.y=.45; }
  for(let i=0;i<4;i++){ const gx=x-W/2+.2+i*.27, gz=z-.15+(i%2)*.3; beam([gx,H,gz],[gx,H-.2,gz],.006,'#4f9f4a',4);
    if(i%2) kit(FOOD('Pumpkin'),gx,gz,{w:.2,y0:H-.42}); else cyl(.035,.03,.32,'#8fd36a',gx,H-.55,gz,8); }
}
export function garden(lv){
  butterfly(-.3,.75,.6,{c:'#ffffff',c2:'#f2c230',r:.7}); butterfly(1.2,.8,-.3,{c:'#f2a33a',r:.5});   /* 家長 11-13：菜園蝴蝶 */
  kit(FARMB('SmallBarn'),-1.65,-1.6,{w:1.45});                                   // 紅色小穀倉＝工具屋
  bed(.75,-.75,2.6,['Lettuce_Whole']); bed(.75,-.1,2.6,['Carrot']); bed(.75,.55,2.6,['Tomato'],.3);
  scarecrow(-1.55,.35,1.0);
  kit(FARMB('Well'),1.95,-1.3,{w:.55});                                            // 11-28：往內挪，讓出柵欄
  const CX=-2.05, CZ=1.05;                                                         // 蔬菜推車（11-28 往內挪）
  kit(FT('cart'),CX,CZ,{w:.85,rot:.5});                                       // 蔬菜推車：堆滿一車（家長 20:12）
  { const cr=Math.cos(.5), sr=Math.sin(.5); [[-.2,-.1,'Pumpkin',.2],[0,-.1,'Lettuce_Whole',.2],[.2,-.1,'Pumpkin',.2],[-.2,.1,'Lettuce_Whole',.2],[0,.1,'Tomato',.15],[.2,.1,'Lettuce_Whole',.2],
      [-.1,0,'Carrot',.2,.1],[.1,0,'Tomato',.15,.1],[0,.02,'Eggplant',.17,.18]].forEach(([dx,dz,n,w,dy=0])=>kit(FOOD(n),CX+dx*.8*cr+dz*.8*sr,CZ-dx*.8*sr+dz*.8*cr,{w:w*.8,y0:.3+dy*.7,rot:dx*7})); }   // 一之一：菜放低、貼在推車板子上
  cyl(.12,.1,.22,'#4a8fd8',2.3,0,1.0,14); beam([2.3,.22,1.0],[2.45,.3,1.1],.02,'#4a8fd8',6);   // 澆水桶（11-28 挪到菜畦旁邊，Lv2 不會壓到南瓜茄子那一排）
  bush(-.4,-1.75,.6,'#ffd166');
  // 家長 18:45：照牧場的風格，樹多一點、木頭柵欄（11-28：樹不壓到柵欄，靠近的往內或往外挪一點）
  const T=(x,z,s,c)=>{ const [a,b]=clearOf(x,z); tree(a,b,s,c); };
  [[-.3,-2.85,.7,'#6fc463'],[.9,-2.6,.65],[2.0,-2.4,.6,'#6fc463'],[-2.7,-.4,.65],[2.75,.4,.6,'#6fc463'],[-2.55,-1.45,.55]].forEach(([x,z,sc,c])=>T(x,z,sc,c));
  if(lv<2){ T(-2.35,2.1,.55,'#6fc463');   // 家長 20:12：前面的木柵欄不要（11-28 改成整圈矮木柵＋大入口）
    T(2.35,2.0,.55); bush(-1.4,1.7,.55,'#ff8fa3'); bush(1.4,1.6,.55,'#c99be8'); }
  if(lv>=2){
    bed(.75,1.2,2.6,['Pumpkin','Eggplant']); bed(-.95,1.2,.9,['Pepper_Green']);
    wheat(-1.0,2.15,1.4,.65); wheat(1.0,2.15,1.4,.65);   /* 家長 11-13：兩片麥田，不要稻田、白鷺鷥、小水溝（11-28：往後收、變窄，中間留步道，不碰柵欄） */
    kit(FARMB('TowerWindmill'),2.45,-.35,{h:3.4,rot:-.5,spin:'Blades',rotors});      // 荷蘭風車：把小麥磨成麵粉
    T(-2.7,-.35,.65,'#6fc463'); bush(-2.2,.2,.55,'#ff8fa3');                // 家長 18:56：不要藤架，改種樹和花
  }
  gardenFence(lv);
}
// ---------- 牧場 ----------
/* 家長 2026-11-11 18:21：雞會飛，要住在有網子的雞舍；不要羊，只要牛和豬，分開圈；圍欄做成圓的；
   Lv1 雞＋豬 → Lv2 再加牛和乾草；動物放大、樹多一點；雞蛋大招牌改成路邊雞蛋攤。 */
const WOODF='#8a5a3a', ROOFC='#5d5853';
function roundFence(x,z,r){               // 圓形木柵欄：完整一圈木樁＋兩圈橫木（家長 20:12：不要有缺口，動物要圍好）
  const n=Math.round(r*2*Math.PI/.26);
  for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; cyl(.03,.035,.42,WOODF,x+Math.cos(a)*r,0,z+Math.sin(a)*r,6); }
  for(const y of [.17,.34]){ const t=add(new THREE.Mesh(new THREE.TorusGeometry(r,.022,5,96),mat(WOODF))); t.rotation.x=-Math.PI/2; t.position.set(x,y,z); }
}
const meshTex=canvasTex((g,s)=>{ g.clearRect(0,0,s,s); g.strokeStyle='#e8ecef'; g.lineWidth=5; for(let i=0;i<=8;i++){ g.beginPath(); g.moveTo(i*s/8,0); g.lineTo(i*s/8,s); g.stroke(); g.beginPath(); g.moveTo(0,i*s/8); g.lineTo(s,i*s/8); g.stroke(); } },256);
function meshPanel(w,h,x,y,z,rotY=0){ const t=meshTex.clone(); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(w*2.2,h*2.2); t.needsUpdate=true;
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.35,side:THREE.DoubleSide,roughness:.6})); p.position.set(x,y+h/2,z); p.rotation.y=rotY; ROOT.add(p); }
function coop(x,z){                        // 雞舍：架高的紅色小屋＋斜坡＋前面凸出的產蛋箱＋旁邊一間鐵絲網運動場（有屋頂，雞飛不出去）
  const hx=x-.6, W=.85, D=.8, L=.32, H=.6;
  for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) rbox(.07,L,.07,'#f4efe6',hx+dx*(W/2-.05),0,z+dz*(D/2-.05),.01);
  rbox(W,H,D,FARM.wall,hx,L,z,.02); for(let i=1;i<6;i++) rbox(W+.005,.012,D+.005,'#a8443a',hx,L+i*H/6,z,.002);
  for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) rbox(.05,H,.05,'#ffffff',hx+dx*W/2,L,z+dz*D/2,.01);
  prism(W+.2,D+.22,.38,ROOFC,hx,L+H,z,'x');
  rbox(.22,.18,.03,'#ffffff',hx-.15,L+.28,z+D/2+.005,.01); rbox(.18,.14,.02,'#3b3550',hx-.15,L+.3,z+D/2+.02,.005);   // 小窗
  // 產蛋箱：前面右邊凸出來，斜斜的蓋子
  rbox(.36,.22,.24,FARM.wall,hx+.18,L+.08,z+D/2+.12,.01); const lid=rbox(.42,.04,.3,ROOFC,hx+.18,L+.34,z+D/2+.12,.01); lid.rotation.x=.35;
  // 運動場：白框＋鐵絲網＋半透明浪板屋頂
  const rx0=hx+W/2, rx1=x+.95, rz=D+.1, RH=.82, rcx=(rx0+rx1)/2;
  for(const px of [rx0+.03,rcx,rx1]) for(const s of [-1,1]) rbox(.06,RH,.06,'#ffffff',px,0,z+s*rz/2,.01);
  for(const s of [-1,1]) rbox(rx1-rx0,.05,.06,'#ffffff',rcx,RH,z+s*rz/2,.01); rbox(.06,.05,rz,'#ffffff',rx1,RH,z,.01);
  meshPanel(rx1-rx0,RH,rcx,0,z+rz/2+.005); meshPanel(rx1-rx0,RH,rcx,0,z-rz/2-.005); meshPanel(rz,RH,rx1+.005,0,z,Math.PI/2);
  const rf=rbox(rx1-rx0+.12,.03,rz+.16,mat('#cfe3e8',{transparent:true,opacity:.75,roughness:.3}),rcx,RH+.05,z,.01); rf.rotation.z=.12;
  rbox(rx1-rx0,.02,rz,'#d9c38f',rcx,0,z,.01);                                   // 沙地
  // 斜坡（有橫條）：從小屋的門走下來
  rbox(.14,.12,.03,'#3b3550',hx+W/2+.005,L+.02,z-.1,.005).rotation.y=Math.PI/2;
  const rp=rbox(.42,.025,.16,'#b58a5c',hx+W/2+.18,.16,z-.1,.005); rp.rotation.z=-.62;
  for(let i=0;i<4;i++){ const sl=rbox(.02,.02,.16,'#8a5a3a',hx+W/2+.05+i*.085,.29-i*.062,z-.1,.003); }
  [[rcx-.25,z+.15,.5],[rcx+.1,z-.2,2.2],[rcx+.3,z+.2,-1],[rcx-.05,z+.25,1.2,'#e9a66a']].forEach(([cx,cz,r,c])=>chicken(cx,cz,r,c));
  chicken(hx+W/2+.25,z-.1,0); 
}
function eggStand(X,Z,sc=1,rot=0,milk=false){ const prev=ROOT, g=new THREE.Group(); g.position.set(X,0,Z); g.scale.setScalar(sc); g.rotation.y=rot; prev.add(g); setRoot(g); const x=0, z=0;                    // 路邊雞蛋攤：小木桌＋紅白遮陽棚＋一盒盒雞蛋＋「新鮮雞蛋」牌子
  for(const dx of [-.4,.4]) for(const dz of [-.18,.18]) rbox(.05,.42,.05,'#b58a5c',x+dx,0,z+dz,.01);
  rbox(.92,.05,.46,'#c9925a',x,.42,z,.01);
  for(const dx of [-.42,.42]) rbox(.05,.55,.05,'#b58a5c',x+dx,.47,z-.2,.01);
  awning(x,1.02,z-.22,.95,.45,milk?'#3d7fd1':'#d9483b','#ffffff',.5);
  if(milk){ /* 家長 11-12：牛奶攤，藍色棚子，和雞蛋攤背對背 */
    for(let i=0;i<8;i++){ const bx=x-.34+(i%4)*.13, bz=z-.08+Math.floor(i/4)*.14; cyl(.04,.04,.14,'#f7f7f2',bx,.47,bz,12); cyl(.022,.03,.04,'#f7f7f2',bx,.61,bz,10); cyl(.024,.024,.02,'#3d7fd1',bx,.65,bz,10); }
    cyl(.07,.08,.2,'#dfe3ea',x+.3,.47,z,14); cyl(.045,.055,.05,'#dfe3ea',x+.3,.67,z,14); cyl(.055,.055,.02,'#3d7fd1',x+.3,.72,z,14);
    textPlate('新鮮牛奶',.6,.17,'#f3f8ff','#2f6db8',x,.0+.1,z+.25); }
  else { for(const [dx,dz] of [[-.25,-.05],[.05,-.05],[.3,.08],[-.1,.12]]){ rbox(.24,.05,.15,'#e6dccb',x+dx,.47,z+dz,.01);
    for(let i=0;i<6;i++) sphere(.03,i%2?'#f5e6cc':'#d9a46a',x+dx-.08+(i%3)*.08,.54,z+dz-.035+Math.floor(i/3)*.07); }
  textPlate('新鮮雞蛋',.6,.17,'#fffaf0','#c0392b',x,.0+.1,z+.25); }
  setRoot(prev);
}
function pigPen(x,z,r){                    // 豬圈：圓柵欄＋泥巴坑＋木頭食槽＋小豬屋＋豬
  rbox(r*2-.1,.03,r*2-.1,'#cfae7a',x,0,z,r-.06);
  const mud=add(new THREE.Mesh(new THREE.CircleGeometry(r*.42,24),mat('#7a5a3a',{roughness:.4}))); mud.rotation.x=-Math.PI/2; mud.position.set(x+r*.2,.045,z+r*.2); mud.scale.y=.7;
  rbox(.5,.12,.14,'#8a5a3a',x-r*.3,0,z+r*.45,.01); rbox(.44,.02,.08,'#e3c98a',x-r*.3,.11,z+r*.45,.005);
  prism(.55,.5,.38,'#a8443a',x-r*.35,0,z-r*.4,'x');
  [[.25,.15,.36,.7],[-.1,-.05,.34,-2.3],[.45,-.35,.3,2.4]].forEach(([a,b,h,rot],i)=>animals.push({g:kit(ANIMAL('Pig'),x+r*a,z+r*b,{h,rot}),kind:'pig',x0:x,z0:z,r:r*.55,ph:i*2.1}));
  roundFence(x,z,r);
}
function hayBale(x,z,rot=0){ const b=cyl(.2,.2,.32,'#e3c46a',x,.2,z,16); b.rotation.z=Math.PI/2; b.rotation.y=rot; b.position.set(x,.2,z);
  const e=add(new THREE.Mesh(new THREE.CircleGeometry(.17,16),mat('#d1ad4f'))); e.position.set(x+.165*Math.cos(rot),.2,z-.165*Math.sin(rot)); e.rotation.y=Math.PI/2+rot; }
function cowPen(x,z,r){                    // 牛欄：圓柵欄＋草地＋乾草架＋水槽＋乳牛
  const g=add(new THREE.Mesh(new THREE.CircleGeometry(r-.05,40),mat('#9ad874',{roughness:.95}))); g.rotation.x=-Math.PI/2; g.position.set(x,.045,z);
  rbox(.5,.14,.18,'#9aa3b2',x+r*.4,0,z-r*.45,.02); rbox(.44,.02,.12,mat('#7fc6d8',{roughness:.2}),x+r*.4,.13,z-r*.45,.005);
  [[-.15,.2,.9],[.35,.05,-2.5]].forEach(([a,b,rot],i)=>animals.push({g:kit(ANIMAL('Cow'),x+r*a,z+r*b,{h:.55,rot}),kind:'cow',x0:x,z0:z,r:r*.45,ph:i*3.3}));
  roundFence(x,z,r);
}
function milkCan(x,z){ cyl(.08,.09,.24,'#dfe3ea',x,0,z,14); cyl(.05,.06,.06,'#dfe3ea',x,.24,z,14); cyl(.06,.06,.02,'#9aa3b2',x,.3,z,14); }
export function ranch(lv){
  if(lv<2) kit(FARMB('Barn'),-1.25,-1.6,{w:2.2});
  else kit(FARMB('BigBarn'),-1.05,-1.65,{w:2.6});                                 // Lv2 換成大牛舍
  kit(FARMB('Windmill'),2.3,-1.55,{h:2.8,rot:-.4,spin:'Blades',rotors});          // 抽水風車
  coop(1.65,-.5);                                                                // 雞舍往後挪，前面空出來
  pigPen(-1.35,1.25,.95);
  eggStand(1.0,lv>=2?.32:.6,.72,-Math.PI/2);   // Lv2 往後一點，讓出牛欄。一之一：方向朝內、朝豬圈（西邊）
                                                 // 家長 20:12：雞蛋攤放在雞舍小屋正前方，長邊朝前，招牌朝外
  const trees=[[-2.7,-.2,.7],[2.7,.75,.65,'#6fc463'],[-.2,-2.7,.65,'#6fc463'],[.9,-2.5,.6],[-2.25,-2.1,.65],[2.75,-.5,.55],[-2.45,2.0,.55,'#6fc463']];   // 樹往內收，不超出六角格（家長 11-13）
  if(lv<2) trees.push([2.55,1.35,.55,'#6fc463'],[-.3,2.5,.55]);
  kit('models/farmx/haycart.glb',lv<2?.35:-.45,lv<2?1.75:2.45,{w:.95,y0:.02,rot:lv<2?-.35:.3});   // 乾草推車（農場包，家長 11-12 22:44）
  trees.forEach(([x,z,s,c])=>tree(x,z,s,c)); bush(.15,-1.0,.55,'#ffd166'); bush(-2.6,.6,.55,'#ff8fa3');
  if(lv>=2){
    for(const [x,z] of [[-2.55,-.95]]) kit(FARMB('Silo'),x,z,{h:3.0});
    cowPen(.9,2.0,.9);   /* 家長 11-13：太擠，牛圈往下 */
    for(const dx of [0,.22]) milkCan(.55+dx,-.85);
    eggStand(1.36,.32,.72,Math.PI/2,true);   // 牛奶攤：和雞蛋攤背對背（有牛的 Lv2 才有）
  }
}
export const GARDEN_LV=[1,2].map(l=>['garden'+(l>1?l:''),'菜園 Lv'+l,()=>garden(l),'whole']);
export const RANCH_LV=[1,2].map(l=>['ranch'+(l>1?l:''),'牧場 Lv'+l,()=>ranch(l),'whole']);
