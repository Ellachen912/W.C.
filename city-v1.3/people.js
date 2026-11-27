/* Winston City 居民：木頭小人偶（家長 2026-11-18 定案）。從樣張 person_sample5_peg.html 搬過來。
   規則見專案《Winston City 人物樣張》：不混搭、小孩只能小黃帽＋書包、男生不綁馬尾丸子、平頭只有男生、制服一律穿褲子、醫生護士男女都可以。 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,metalness:0,...o});
export function add(parent,geo,mat,p=[0,0,0],rot=[0,0,0],s=[1,1,1]){ const m=new THREE.Mesh(geo,mat); m.position.set(...p); m.rotation.set(...rot); m.scale.set(...s); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m; }
const PAL={skin:['#ffd9c0','#f2c4a2','#d9a27c'],hair:['#2a2329','#5b3a2a','#8a5a36'],top:['#e5544b','#f2a33a','#4fae6a','#3f86d6','#9a6fd1','#f07aa6','#2fb3a8'],bottom:['#3a4a7a','#6b5444','#2f3a4a','#c9b38f']};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const mm=(c,r=.55)=>M(c,{roughness:r});
const mInk=M('#22202a',{roughness:.3}), mBlush=M('#f7a0a0',{transparent:true,opacity:.35}), mLip=M('#b5533f'), mShoe=mm('#3b3036',.5);
const lathe=(pts,seg=18)=>new THREE.LatheGeometry(pts.map(([x,y])=>new THREE.Vector2(x,y)),seg);
const sstep=(a,b,x)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
// 頭髮：一整塊蓋在頭上。front 前面停在哪（pitch）、side 兩側和後面到哪、faceW 臉前面空出多寬
function hairMesh(HR,mat,{front=.32,side=-.62,faceW=1.25,puff=1.08,ear=0,ys=1.1,tilt=0}={}){
  const R1=HR*puff, NY=48, NP=12, pos=[], idx=[];
  for(let i=0;i<=NY;i++){ const f=-Math.PI+2*Math.PI*i/NY, fr=1-sstep(faceW-.35,faceW+.35,Math.abs(f));
    const lo=fr*(front+.12*Math.cos(f*1.8)+tilt*Math.sin(f))+(1-fr)*(side+ear*Math.exp(-Math.pow((Math.abs(f)-1.57)/.28,2)));
    for(let j=0;j<=NP;j++){ const pt=Math.PI/2+(lo-Math.PI/2)*j/NP, t=j/NP; let x,y,z;
      if(pt>=0){ const r=R1*(1+.02*t); x=Math.sin(f)*r*Math.cos(pt); y=r*Math.sin(pt); z=Math.cos(f)*r*Math.cos(pt); }
      else { const r=R1*(1+.02*t)-.012*sstep(-.45,-.62,pt); x=Math.sin(f)*r; y=R1*Math.sin(pt)*ys; z=Math.cos(f)*r; }
      pos.push(x,y,z); } }
  for(let i=0;i<NY;i++) for(let j=0;j<NP;j++){ const a=i*(NP+1)+j, b=a+NP+1; idx.push(a,b,a+1, b,b+1,a+1); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat); m.castShadow=true; return m; }

function makeDoll(kind){
  const C={ '阿姨':{top:'#e5544b',bottom:'#3a4a7a',hair:'#2a2329',skin:'#ffd9c0'}, '叔叔':{top:'#4fae6a',bottom:'#6b5444',hair:'#2a2329',skin:'#f2c4a2'}, '小孩':{top:'#f2a33a',bottom:'#3f86d6',hair:'#5b3a2a',skin:'#ffd9c0'},
    '小女孩':{top:'#f7c6d9',bottom:'#e8619a',hair:'#2a2329',skin:'#ffd9c0'}, '奶奶':{top:'#b07aa1',bottom:'#4d4a5c',hair:'#e9e7e2',skin:'#ffd9c0'}, '爺爺':{top:'#7f97b3',bottom:'#5d5a55',hair:'#e9e7e2',skin:'#f2c4a2'} }[kind];
  const mSkin=mm(C.skin), mHair=M(C.hair,{roughness:.5,side:THREE.DoubleSide}), mTop=mm(C.top), mBot=mm(C.bottom);
  const man=kind==='叔叔'||kind==='爺爺', kid=kind==='小孩'||kind==='小女孩', old=kind==='爺爺'||kind==='奶奶', W=man?1.12:1, H=man?1.1:1, B=W;   // B：身體寬度
  const root=new THREE.Group(); if(kid) root.scale.setScalar(.72);
  const pants=man||kind==='小孩', HB=pants?.13:.085;   // 叔叔、小孩穿褲子：身體抬高、腿變長、兩腿分開
  const hips=new THREE.Group(); hips.position.y=HB; root.add(hips);
  const body=new THREE.Group(); hips.add(body);
  if(man) add(body,lathe([[0,.1],[.112*B,.1],[.126*B,.11],[.13*B,.125],[.13*B,.16*H],[0,.16*H]]),mBot);   // 叔叔：直直的褲頭，不要圓墩
  else if(pants) add(body,lathe([[0,.035],[.09*B,.035],[.122*B,.05],[.136*B,.09],[.14*B,.13*H],[.135*B,.16*H],[0,.16*H]]),mBot);
  else add(body,lathe([[0,0],[.1*B,0],[.128*B,.012],[.14*B,.04],[.142*B,.13*H],[.135*B,.16*H],[0,.16*H]]),mBot).userData.skirt=1;
  const pantsTop=(!pants&&!kid)?add(body,lathe([[0,.1],[.112*B,.1],[.126*B,.11],[.13*B,.125],[.13*B,.16*H],[0,.16*H]]),mBot):null;   // 大人女生穿制服時換成褲子
  if(pantsTop) pantsTop.visible=false;
  add(body,lathe([[0,.155*H],[.136*B,.155*H],[.13*B,.24*H],[.11*B,.3*H],[.08*B,.335*H],[.05,.35*H],[0,.35*H]]),mTop);
  add(body,new THREE.TorusGeometry(.137*B,.009,4,20),mTop,[0,.158*H,0],[Math.PI/2,0,0]);
  if(man) add(body,new THREE.TorusGeometry(.056,.01,4,12),mTop,[0,.345*H,0],[Math.PI/2,0,0]);    // 叔叔：圓領
  add(body,new THREE.CylinderGeometry(.04,.045,.04,8),mSkin,[0,.36*H,0]);
  const BUNS=[];
  const HR=kid?.17:.15;
  const head=new THREE.Group(); head.position.set(0,.35*H+HR*.97,0); body.add(head);
  add(head,new THREE.SphereGeometry(HR,20,14),mSkin);
  const P=(yaw,pitch,rad=HR)=>new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(rad);
  const onHead=(obj,yaw,pitch,rad=HR)=>{ const p=P(yaw,pitch,rad); obj.position.copy(p); obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),p.clone().normalize()); head.add(obj); return obj; };
  const eyes=[], k=HR/.15;
  for(const s of [-1,1]){
    const e=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),mInk); e.scale.set(.016*k,.021*k,.01); onHead(e,s*.33,kid?-.1:-.05,HR*.995); eyes.push(e);
    const bl=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),mBlush); bl.scale.set(.03*k,.018*k,.005); onHead(bl,s*.58,-.26,HR*.994);
    if(man){ const br=new THREE.Mesh(new THREE.CapsuleGeometry(.007,.03,4,8),old?mHair:mInk); br.rotation.z=Math.PI/2; const bw=new THREE.Group(); bw.add(br); onHead(bw,s*.33,.15,HR*.997); }   // 叔叔：短短的眉毛
    if(man) add(head,new THREE.SphereGeometry(1,8,6),mSkin,[s*HR*.99,-.02,0],[0,0,0],[.018,.03,.024]);                                     // 耳朵
  }
  { const arc=Math.PI*.6, m=new THREE.Mesh(new THREE.TorusGeometry(.03*k,.0048*k,4,10,arc),mLip); m.rotation.z=Math.PI+(Math.PI-arc)/2; const w=new THREE.Group(); w.add(m); onHead(w,0,kid?-.36:-.3,HR*.993); }
  // 頭髮
  const ORIG=[], hh=m=>{ head.add(m); ORIG.push(m); return m; };
  if(kind==='阿姨') hh(hairMesh(HR,mHair));                                                     // 鮑伯頭
  if(man) hh(hairMesh(HR,mHair,{front:.5,side:-.42,faceW:1.3,puff:1.06,ear:.45}));                       // 短髮：露出耳朵，後面到耳朵高度
  if(kid){ hh(hairMesh(HR,mHair,{front:.42,side:-.2,faceW:1.35,puff:1.07}));                    // 小孩：西瓜頭
    for(const s of [-1,1]){ const b=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),mHair); b.position.set(s*.12,.12,-.03); head.add(b); BUNS.push(b); ORIG.push(b); } }   // 兩個小包包頭
  if(kind==='小女孩'){ hh(hairMesh(HR,mHair,{front:.42,side:-.55,faceW:1.3,puff:1.07}));                  // 小女孩：到下巴的短髮＋粉紅髮夾
    hh(add(head,new THREE.SphereGeometry(1,8,6),M('#f06292',{roughness:.4}),[HR*.62,HR*.62,HR*.48],[0,0,.5],[.03,.016,.012])); }
  if(kind==='奶奶'){ hh(hairMesh(HR,mHair,{front:.5,side:-.3,faceW:1.3,puff:1.05,ear:.4}));               // 奶奶：白髮，頭頂後面一顆髮髻
    const b=add(head,new THREE.SphereGeometry(HR*.44,9,7),mHair,[0,HR*.9,-HR*.6]); BUNS.push(b); ORIG.push(b); }
  if(kind==='爺爺') hh(hairMesh(HR,mHair,{front:.85,side:-.42,faceW:1.45,puff:1.04,ear:.5}));              // 爺爺：白色短髮，髮際線高一點
  // 眼鏡：圓圓的黑框
  const glasses=new THREE.Group(); head.add(glasses); const mG=M('#1d1b22',{roughness:.35}); { const ey=kid?-.1:-.05;
    for(const s of [-1,1]){ const rg=new THREE.Mesh(new THREE.TorusGeometry(.03*k,.0055*k,4,12),mG); onHead(rg,s*.33,ey,HR*1.045); glasses.add(rg);
      glasses.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([P(s*.55,ey+.02,HR*1.04),P(s*1.0,ey+.06,HR*1.035),P(s*1.42,ey+.07,HR*1.0)]),10,.004,6,false),mG)); }
    glasses.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([P(-.13,ey+.02,HR*1.05),P(0,ey+.05,HR*1.06),P(.13,ey+.02,HR*1.05)]),8,.0045,6,false),mG)); }
  // 手腳
  const LEGP={man:[.1,.19,.05,.044],kidp:[.06,.15,.05,.044],skirt:[.02,.07,.036,.034]};
  const leg=(x,mode)=>{ const [py,L,rt,rb]=LEGP[mode], isP=mode!=='skirt', g=new THREE.Group(); g.position.set(x,py,0); hips.add(g); g.userData.L=L; g.userData.rt=rt*W; g.userData.rb=rb*W;
    add(g,new THREE.CylinderGeometry(rt*W,rb*W,L,8),mBot,[0,-L/2-.005,0]);
    if(isP) add(g,new THREE.SphereGeometry(.05*W,8,6),mBot,[0,0,0],[0,0,0],[1,.6,1]);
    add(g,new THREE.SphereGeometry(1,8,6),mShoe,[0,-L-.015,.014],[0,0,0],[.046*W,.03,.064]); return g; };
  const LM=man?'man':pants?'kidp':'skirt';
  const sleeves=[], buns=[];
  const arm=x=>{ const g=new THREE.Group(); g.position.set(x,.3*H,0); g.rotation.z=x>0?.18:-.18; body.add(g);
    sleeves.push(add(g,new THREE.SphereGeometry(.033*W,8,6),mTop));
    sleeves.push(add(g,new THREE.CapsuleGeometry(.026*W,.08*H,4,10),mTop,[0,-.055*H,0]));
    add(g,new THREE.SphereGeometry(.03*W,8,6),mSkin,[0,-.12*H,0]); return g; };
  const d={man,kid,old,W,glasses,mG,root,hips,body,head,eyes,kind,HR,B,H,HB,pants,sleeves,buns:BUNS,orig:ORIG,mHair,mats:{mSkin,mHair,mTop,mBot},legL:leg((pants?.062:.055)*W,LM),legR:leg(-(pants?.062:.055)*W,LM),HB,HB0:HB,pantsTop,armL:arm(.125*W),armR:arm(-.125*W),ph:Math.random()*6,blink:2+Math.random()*3,ang:0};
  // 穿褲子用的腿（男生、男孩就是原本的腿；大人女生另外做一組，平常藏起來）
  d.legsN=[d.legL,d.legR]; d.legsP=pantsTop?[leg(.062*W,'man'),leg(-.062*W,'man')]:d.legsN; if(pantsTop) for(const l of d.legsP) l.visible=false;
  d.skirt=body.children.find(o=>o.userData.skirt);
  // 左手：下雨時撐傘
  d.holdL=new THREE.Group(); d.holdL.position.y=-.125*H; d.armL.add(d.holdL);
  { const u=new THREE.Group(); u.rotation.z=.14; d.holdL.add(u); const col=['#e5544b','#3f86d6','#f2c230','#4fae6a','#9a6fd1'][Math.floor(Math.random()*5)];
    add(u,new THREE.CylinderGeometry(.006,.006,.6,8),M('#5b4a40'),[0,.28,0]);
    add(u,new THREE.SphereGeometry(.23,8,6,0,Math.PI*2,0,1.05),M(col,{roughness:.5,side:THREE.DoubleSide,flatShading:true}),[0,.42,0],[0,0,0],[1,.75,1]);
    add(u,new THREE.SphereGeometry(.012,8,6),M('#5b4a40'),[0,.6,0]); d.umb=u; u.visible=false; }
  root.traverse(o=>o.userData.doll=d);
  return d; }


/* ---------- 配件：每個都是另外一塊，套在小人偶身上 ---------- */
const UNI={'老師':{top:'#a7c9df',bot:'#454952'},'牧場主人':{top:'#a85b45',bot:'#405778'},'農夫':{top:'#78934d',bot:'#79563b'},'太空人':{top:'#f5f5ef',bot:'#e8e9e7'},'船長':{top:'#fffdf4',bot:'#20334d'},'列車長':{top:'#344a70',bot:'#24334d'},'畫家':{top:'#d9b98a',bot:'#354b69'},'郵差':{top:'#3e8f4e',bot:'#1f1f24'},'公車司機':{top:'#a9cdea',bot:'#26304f'},'建築工人':{top:'#4a5d7e',bot:'#3f4f6b'},'清潔隊員':{top:'#c6e03a',bot:'#2c3a5c'},'警察':{top:'#2c4a86',bot:'#1f2c4f'},'消防員':{top:'#363b48',bot:'#363b48'},
  '醫生':{top:'#bfe0f2',bot:'#3b4a66'},'護士':{top:'#8fc9e8',bot:'#8fc9e8'},'廚師':{top:'#f7f7f4',bot:'#1f1f24'}};
const mHard=M('#f5c234',{roughness:.35}), mVest=M('#f27a24',{roughness:.6,side:THREE.DoubleSide}), mRefl=M('#eef3f6',{roughness:.25,metalness:.3}),
  mStraw=M('#e2c98c',{roughness:.9,flatShading:true}), mStrawD=M('#b99a5a',{roughness:.9}), mChef=M('#fbfbf8',{roughness:.7}), mCoat=M('#ffffff',{roughness:.55,side:THREE.DoubleSide,emissive:'#6a6e72'}), mCoatL=M('#d9dde2',{roughness:.6}), mBtn=M('#9aa3ad',{roughness:.4});
function canvasTex(size,draw){ const c=document.createElement('canvas'); c.width=c.height=size; draw(c.getContext('2d'),size); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
function addAcc(d){ const {head,body,HR,B,H}=d, A={};
  const lerpR=(pts,y)=>{ if(y<=pts[0][0]) return pts[0][1]; for(let i=1;i<pts.length;i++) if(y<=pts[i][0]){ const [y0,r0]=pts[i-1],[y1,r1]=pts[i]; return r0+(r1-r0)*(y-y0)/(y1-y0); } return pts[pts.length-1][1]; };
  const TOP=[[.155*H,.136*B],[.24*H,.13*B],[.3*H,.11*B],[.335*H,.08*B]], VEST=[[.165*H,.149*B],[.2*H,.148*B],[.25*H,.143*B],[.29*H,.128*B],[.315*H,.106*B]];
  const topR=y=>lerpR(TOP,y), vestR=y=>lerpR(VEST,y);
  const band=(parent,y,h,mat,off=.0015,rf=topR)=>add(parent,new THREE.CylinderGeometry(rf(y+h/2)+off,rf(y-h/2)+off,h,40,1,true),mat,[0,y,0]);   // 貼平的色帶（反光條）
  const legBands=(mat,mat2)=>{ const out=[]; for(const lg of d.legsP){ const {L,rt,rb}=lg.userData, g=new THREE.Group(); lg.add(g); const yb=-L*.62, r=rt+(rb-rt)*((-yb-.005)/L);
      add(g,new THREE.CylinderGeometry(r+.0015,r+.0015,.018,12,1,true),mat,[0,yb,0]); if(mat2) add(g,new THREE.CylinderGeometry(r+.0025,r+.0025,.006,12,1,true),mat2,[0,yb,0]); out.push(g); } return out; };
  const frontPath=(x0,y0,x1,y1,zs=1)=>{ const p=[]; for(let i=0;i<=10;i++){ const t=i/10, x=x0+(x1-x0)*t, y=y0+(y1-y0)*t, r=topR(y)+.007; p.push(new THREE.Vector3(x,y,zs*Math.sqrt(Math.max(0,r*r-x*x)))); } return new THREE.CatmullRomCurve3(p); };
  // 工程帽：黃色圓頂、前面帽簷、中間一條凸線；配橘色反光背心
  { const g=new THREE.Group(); g.position.y=HR*.05; g.rotation.x=-.08; head.add(g); const R=HR*1.16, TH=1.32;
    add(g,new THREE.SphereGeometry(R,18,9,0,Math.PI*2,0,TH),mHard);
    const ey=R*Math.cos(TH);
    const brim=add(g,new THREE.CylinderGeometry(R*1.08,R*1.1,.012,18),mHard,[0,ey,.012],[0,0,0],[1,1,1.12]);
    add(g,new THREE.TorusGeometry(R*1.005,.011,4,15,Math.PI),mHard,[0,0,0],[0,Math.PI/2,0]);
    add(g,new THREE.SphereGeometry(1,8,6),M('#ffffff',{roughness:.3}),[0,R*.72,R*.69],[-.8,0,0],[.022,.016,.004]);   // 小貼紙
    const v=new THREE.Group(); body.add(v);
    const pts=[[.143*B,.165*H],[.142*B,.2*H],[.137*B,.25*H],[.122*B,.29*H],[.1*B,.315*H]].map(([x,y])=>new THREE.Vector2(x+.006,y));
    add(v,new THREE.LatheGeometry(pts,40),mVest);
    for(const y of [.205,.255]) band(v,y*H,.014,mRefl,.0075,vestR);
    A['工程帽']=[g,v]; }
  // 斗笠：扁扁的尖頂圓帽，一圈圈稜線
  { const g=new THREE.Group(); g.position.y=HR*.46; head.add(g);
    add(g,new THREE.ConeGeometry(HR*1.95,HR*.78,18,1,true),mStraw,[0,HR*.39,0]);
    add(g,new THREE.CircleGeometry(HR*1.95,18),mStrawD,[0,0,0],[Math.PI/2,0,0]);
    for(const t of [.35,.65]) add(g,new THREE.TorusGeometry(HR*1.95*(1-t),.006,5,18),mStrawD,[0,HR*.78*t,0],[Math.PI/2,0,0]);
    A['斗笠']=[g]; }
  // 廚師帽：白色帽圈＋上面蓬蓬的
  { const g=new THREE.Group(); g.position.y=HR*.72; g.rotation.x=-.06; head.add(g);
    add(g,new THREE.CylinderGeometry(HR*.86,HR*.9,HR*.42,14),mChef,[0,HR*.15,0]);
    add(g,new THREE.SphereGeometry(HR*.62,9,7),mChef,[0,HR*.62,0],[0,0,0],[1,.85,1]);
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; add(g,new THREE.SphereGeometry(HR*.42,8,6),mChef,[Math.cos(a)*HR*.52,HR*.5,Math.sin(a)*HR*.52],[0,0,0],[1,.9,1]); }
    A['廚師帽']=[g]; }
  // 白袍：白色長外套，從肩膀蓋到大腿，前面一條開襟、兩顆扣子、一個口袋；袖子也變白
  { const g=new THREE.Group(); body.add(g);
    const pts=[[.07*B,.34*H],[.105*B,.315*H],[.13*B,.27*H],[.142*B,.2*H],[.146*B,.12],[.152*B,.03],[.156*B,-.035]].map(([x,y])=>new THREE.Vector2(x+.008,y));
    add(g,new THREE.LatheGeometry(pts,40),mCoat);
    add(g,new THREE.TorusGeometry(.162*B,.006,4,20),mCoatL,[0,-.035,0],[Math.PI/2,0,0]);
    const fz=y=>{ let r=.15; for(let i=1;i<pts.length;i++) if(y>=pts[i].y){ const a=pts[i-1],b=pts[i],t=(y-b.y)/(a.y-b.y); r=b.x+(a.x-b.x)*t; break; } return r; };
    add(g,new THREE.BoxGeometry(.006,.36*H+.035,.004),mCoatL,[0,(.32*H-.035)/2,fz(.15)*1.0+.002],[-.06,0,0]);
    for(const y of [.24*H,.16*H]) add(g,new THREE.SphereGeometry(.009,8,6),mBtn,[.016,y,fz(y)+.004]);
    add(g,new THREE.BoxGeometry(.05*B,.035,.004),mCoatL,[-.07*B,.08,fz(.08)*.94+.003],[0,-.48,0]);
    A['白袍']=[g]; }
  // 書包／背包（同一個形狀，顏色不同）
  const bag=(col,dark,sz)=>{ const g=new THREE.Group(); body.add(g); const mB=M(col,{roughness:.6}), mS=M(dark,{roughness:.6});
    add(g,new RoundedBoxGeometry(.19*sz*B,.19*sz*H,.08*sz,3,.025),mB,[0,.235*H,-.17*B]);
    add(g,new RoundedBoxGeometry(.13*sz*B,.06*sz,.022,2,.01),mS,[0,.19*H,-.215*B]);
    for(const s of [-1,1]){ add(g,new THREE.TorusGeometry(.11*B,.011,4,10,Math.PI*1.1),mS,[s*.06*B,.24*H,-.02],[0,Math.PI/2,-.1],[1,1.1,1]); }
    return g; };
  // 小黃帽＋書包（只有小孩）
  { const g=new THREE.Group(); g.position.y=HR*.05; head.add(g); const R=HR*1.14, TH=1.32;
    add(g,new THREE.SphereGeometry(R,18,9,0,Math.PI*2,0,TH),M('#f7cc2e',{roughness:.6}));
    add(g,new THREE.CylinderGeometry(R*1.32,R*1.34,.012,18),M('#f7cc2e',{roughness:.6}),[0,R*Math.cos(TH),0]);
    add(g,new THREE.TorusGeometry(R*Math.sin(TH)*1.01,.008,6,36),M('#e2a91c'),[0,R*Math.cos(TH)+.008,0],[Math.PI/2,0,0]);
    A['小黃帽＋書包']=[g,bag('#e04a3c','#b83a2e',1)]; }
  // 背包（大人）：書包改成深藍色
  A['背包']=[bag('#35537e','#26405f',1.08)];
  // 手上拿的東西：放在右手，保持直立
  const hold=new THREE.Group(); hold.position.y=-.125*H; d.armR.add(hold); d.hold=hold;
  { const g=new THREE.Group(); g.scale.setScalar(1.45); g.position.z=.015; hold.add(g); const mW=M('#c49a5c',{roughness:.9}), mWd=M('#9b7440',{roughness:.9});   // 菜籃
    add(g,new THREE.CylinderGeometry(.055,.045,.055,9,1,true),M('#c49a5c',{roughness:.9,side:THREE.DoubleSide}),[0,-.06,.01]);
    add(g,new THREE.CircleGeometry(.045,18),mWd,[0,-.087,.01],[-Math.PI/2,0,0]);
    for(const y of [-.075,-.055,-.04]) add(g,new THREE.TorusGeometry(.052,.003,4,12),mWd,[0,y,.01],[Math.PI/2,0,0]);
    add(g,new THREE.TorusGeometry(.05,.006,4,10,Math.PI),mWd,[0,-.035,.01]);
    for(const [x,z,c] of [[-.02,0,'#5aa852'],[.018,.02,'#4c9a45'],[.0,.0,'#e5543f']]) add(g,new THREE.SphereGeometry(.024,8,6),M(c,{roughness:.7}),[x,-.034,.01+z]);
    A['菜籃']=[g]; }
  { const g=new THREE.Group(); hold.add(g); const L=d.HB+.3*H-.125*H-.005, mC=M('#7a5234',{roughness:.6});   // 拐杖：從手到地上
    add(g,new THREE.CylinderGeometry(.013,.012,L,8),mC,[0,-L/2,.03]);
    add(g,new THREE.TorusGeometry(.026,.012,4,8,Math.PI),mC,[0,0,.004],[0,Math.PI/2,0]);
    A['拐杖']=[g]; }
  // ===== 制服組（整套，不跟其他配件混搭） =====
  const ring=(parent,r,y,mat,t=.008)=>add(parent,new THREE.TorusGeometry(r,t,4,20),mat,[0,y,0],[Math.PI/2,0,0]);
  const legRings=(mat,mat2)=>{ const out=[]; for(const lg of [d.legL,d.legR]){ const L=lg.userData.L, g=new THREE.Group(); lg.add(g); const r=(d.pants?.047:.036)*d.B/(d.B/(d.kind==='叔叔'?1.12:1))+.004;
      ring(g,r,-L*.62,mat,.0075); if(mat2) ring(g,r,-L*.62-.016,mat2,.006); out.push(g); } return out; };
  const capDome=(R,TH,mat)=>{ const g=new THREE.Group(); add(g,new THREE.SphereGeometry(R,18,9,0,Math.PI*2,0,TH),mat); return g; };
  const halfBrim=(r,mat,y,z,tilt=.15)=>{ const b=add(new THREE.Group(),new THREE.CylinderGeometry(r,r,.011,12,1,false,-Math.PI/2,Math.PI),mat); const p=b.parent; p.position.set(0,y,z); p.rotation.x=tilt; return p; };
  const mRef=M('#e9eef2',{roughness:.25,metalness:.35}), mGold=M('#f1c24a',{roughness:.3,metalness:.55});
  // 清潔隊員：螢光黃綠上衣＋反光條、深藍褲＋褲管反光條、同色鴨舌帽、手拿掃把
  { const mU=M('#c6e03a',{roughness:.6}), parts=[];
    const cap=capDome(HR*1.12,1.3,mU); cap.position.y=HR*.05; head.add(cap); cap.add(halfBrim(HR*.62,mU,HR*1.12*Math.cos(1.3),HR*1.12*Math.sin(1.3)*.62)); parts.push(cap);
    const v=new THREE.Group(); body.add(v); band(v,.205*H,.016,mRef); band(v,.25*H,.016,mRef); parts.push(v,...legBands(mRef));
    const br=new THREE.Group(); hold.add(br); const L=d.HB+.3*H-.125*H, mSt=M('#8a6a44',{roughness:.7});
    add(br,new THREE.CylinderGeometry(.009,.009,L+.02,8),mSt,[0,-L/2+.01,.045],[.18,0,0]);
    add(br,new RoundedBoxGeometry(.11,.035,.03,2,.01),M('#3f6b3a',{roughness:.8}),[0,-L+.02,.045+L*.09]);
    add(br,new THREE.BoxGeometry(.1,.03,.024),M('#e7c86a',{roughness:.95}),[0,-L-.006,.045+L*.09]);
    parts.push(br); A['清潔隊員']=parts; }
  // 警察：深藍制服、警帽（平頂、黑帽簷、金色帽徽）、胸前金色警徽、黑色腰帶
  { const mN=M('#22305a',{roughness:.6}), mK=M('#17181d',{roughness:.35}), parts=[];
    const cap=new THREE.Group(); cap.position.y=HR*.72; cap.rotation.x=-.08; head.add(cap);
    add(cap,new THREE.CylinderGeometry(HR*1.17,HR*.98,HR*.36,16),mN,[0,HR*.16,0]);
    add(cap,new THREE.CylinderGeometry(HR*1.0,HR*1.0,HR*.12,16),mK,[0,-HR*.02,0]);
    cap.add(halfBrim(HR*.6,mK,-HR*.07,HR*.62,.32));
    add(cap,new THREE.SphereGeometry(1,8,6),mGold,[0,HR*.2,HR*1.07],[0,0,0],[.022,.025,.008]);
    parts.push(cap);
    const v=new THREE.Group(); body.add(v); const bR=.13*B+.004; ring(v,bR,.16*H,mK,.009);
    add(v,new THREE.BoxGeometry(.026,.02,.008),mGold,[0,.16*H,bR+.006]);
    const badge=add(v,new THREE.CylinderGeometry(.018,.018,.006,8),mGold,[.055*B,.265*H,.124*B],[Math.PI/2-.35,0,0]);
    parts.push(v); A['警察']=parts; }
  // 護士（男女都可以）：淺藍護理服、白色護士帽紅十字、V 領白邊、胸前口袋插筆、名牌、掛在胸前的小錶
  { const parts=[]; const cap=new THREE.Group(); cap.position.set(0,HR*1.02,HR*.18); cap.rotation.x=-.35; head.add(cap);
    add(cap,new RoundedBoxGeometry(HR*1.05,HR*.32,HR*.5,2,.012),M('#ffffff',{roughness:.6}));
    const mR=M('#e5484d'); add(cap,new THREE.BoxGeometry(.044,.012,.005),mR,[0,0,HR*.255]); add(cap,new THREE.BoxGeometry(.012,.044,.005),mR,[0,0,HR*.255]);
    parts.push(cap);
    const v=new THREE.Group(); body.add(v); const mW=M('#ffffff',{roughness:.5});
    for(const sx of [-1,1]) add(v,new THREE.TubeGeometry(frontPath(sx*.06*B,.335*H,0,.275*H),14,.0055,6,false),mW);   // V 領白邊
    const py=.235*H, pz=topR(py)+.003;
    add(v,new RoundedBoxGeometry(.045,.04,.006,2,.003),M('#7fb7d8',{roughness:.6}),[.055*B,py,pz-.004],[-.1,0,0]);                 // 口袋
    add(v,new THREE.CylinderGeometry(.004,.004,.04,8),M('#3f6fd0',{roughness:.4}),[.065*B,py+.02,pz-.001]);                         // 筆
    add(v,new RoundedBoxGeometry(.04,.018,.005,2,.003),mW,[-.055*B,.255*H,topR(.255*H)+.002],[-.15,0,0]);                          // 名牌
    add(v,new THREE.CylinderGeometry(.012,.012,.005,8),M('#c9ced6',{metalness:.6,roughness:.25}),[-.06*B,.22*H,topR(.22*H)+.004],[Math.PI/2-.1,0,0]);   // 小錶
    parts.push(v); A['護士']=parts; }
  // 醫生（男女都可以）：白袍＋聽診器
  { const parts=[...(A['白袍']||[])];
    const st=new THREE.Group(); body.add(st); const mS=M('#3a3f4a',{roughness:.4});
    add(st,new THREE.TorusGeometry(.062,.006,4,12),mS,[0,.335*H,.015],[Math.PI/2-.25,0,0]);
    for(const s of [-1,1]){ const c=new THREE.CatmullRomCurve3([new THREE.Vector3(s*.05,.33*H,.055),new THREE.Vector3(s*.04,.27*H,.125*B),new THREE.Vector3(s*.012,.21*H,.15*B)]); add(st,new THREE.TubeGeometry(c,6,.005,4,false),mS); }
    add(st,new THREE.CylinderGeometry(.016,.016,.008,8),M('#c9ced6',{metalness:.6,roughness:.25}),[0,.205*H,.158*B],[Math.PI/2-.2,0,0]);
    parts.push(st); A['醫生']=parts; }
  // 廚師的紅領巾：脖子一圈小領子＋胸前一片三角巾，整片貼著衣服做，不會翹出來
  const chefScarf=()=>{ const g=new THREE.Group(); body.add(g); const mR=M('#d93a35',{roughness:.6,side:THREE.DoubleSide});
    add(g,new THREE.LatheGeometry([[.046,.362*H],[.07*B,.35*H],[.088*B,.333*H],[.098*B,.322*H]].map(([x,y])=>new THREE.Vector2(x+.006,y)),36),mR);
    const pos=[], idx=[], N=8, top=.33*H, bot=.25*H, hw=.055*B;
    for(let j=0;j<=N;j++){ const y=top+(bot-top)*j/N, w=hw*(1-j/N); for(let i=0;i<=N;i++){ const x=-w+2*w*i/N, r=topR(y)+.005; pos.push(x,y,Math.sqrt(Math.max(0,r*r-x*x))); } }
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const p=j*(N+1)+i; idx.push(p,p+N+1,p+1, p+1,p+N+1,p+N+2); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,mR); m.castShadow=true; g.add(m); return g; };
  // 配件領巾：胸口一個結＋兩條短尾巴（脖子不圍），顏色隨機
  const strip=(parent,cx,top,bot,w,tilt,mat,off)=>{ const pos=[], idx=[], N=6;   // 貼著胸口的一條布
    for(let j=0;j<=N;j++){ const y=top+(bot-top)*j/N; for(let i=0;i<=2;i++){ const x=cx+tilt*(top-y)+(i/2-.5)*w, r=topR(y)+off; pos.push(x,y,Math.sqrt(Math.max(0,r*r-x*x))); } }
    for(let j=0;j<N;j++) for(let i=0;i<2;i++){ const p=j*3+i; idx.push(p,p+3,p+1, p+1,p+3,p+4); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,mat); m.castShadow=true; parent.add(m); return m; };
  const knitScarf=()=>{ const g=new THREE.Group(); body.add(g); const mB=M(['#3f86d6','#e5544b','#f2a33a','#4fae6a','#9a6fd1','#f07aa6','#2fb3a8','#f2c230'][Math.floor(Math.random()*8)],{roughness:.85,side:THREE.DoubleSide}), mW=M('#f4f1ea',{roughness:.85,side:THREE.DoubleSide});   // 只有胸口的結和兩條尾巴，顏色隨機
    const kx=.03*B, ky=.322*H; add(g,new THREE.SphereGeometry(1,8,6),mB,[kx,ky,topR(ky)+.008],[0,0,0],[.02,.018,.012]);
    for(const [dx,len,tilt] of [[-.006,.08*H,-.12],[.016,.065*H,.18]]){ strip(g,kx+dx,ky-.008,ky-.008-len,.028,tilt,mB,.006);
      strip(g,kx+dx+tilt*(len*.75),ky-.008-len*.7,ky-.008-len*.82,.029,tilt,mW,.0075); }
    return g; };
  A['領巾']=[knitScarf()];
  // 廚師：白色廚師服（兩排扣子）、黑褲、紅領巾、廚師帽
  { const v=new THREE.Group(); body.add(v); const mBt=M('#c9ced6',{roughness:.4});
    for(const sx of [-1,1]) for(const y of [.2,.24,.28]) add(v,new THREE.SphereGeometry(.008,8,6),mBt,[sx*.035*B,y*H,Math.sqrt(Math.max(0,topR(y*H)**2-(.035*B)**2))+.003]);
    A['廚師']=[A['廚師帽'][0],v,chefScarf()]; }
  // 木星氣球（小孩，右手）
  { const g=new THREE.Group(); hold.add(g); const tilt=new THREE.Group(); tilt.rotation.z=.25; g.add(tilt);
    add(tilt,new THREE.CylinderGeometry(.002,.002,.55,8),M('#ffffff'),[0,.275,0]);
    const jt=canvasTex(128,(c,n)=>{ c.fillStyle='#e9b777'; c.fillRect(0,0,n,n); for(const [y,h,col] of [[0,14,'#cf7d45'],[22,10,'#f6dfae'],[38,14,'#d58a4e'],[58,10,'#f6dfae'],[74,14,'#cf7d45'],[94,10,'#f6dfae'],[110,18,'#c47a43']]){ c.fillStyle=col; c.fillRect(0,y,n,h); } c.fillStyle='#c9503a'; c.beginPath(); c.ellipse(64,84,20,11,0,0,7); c.fill(); });
    const b=add(tilt,new THREE.SphereGeometry(.11,12,9),new THREE.MeshStandardMaterial({map:jt,roughness:.35}),[0,.66,0],[0,-.6,0],[1,1.1,1]);
    add(tilt,new THREE.ConeGeometry(.015,.025,10),M('#cf7d45'),[0,.54,0],[Math.PI,0,0]);
    g.userData.bob=b; A['氣球']=[g]; }
  // 消防員：深色消防衣＋黃色和銀色反光條、紅色消防帽（後面帽簷比較寬）＋金色盾牌徽章
  { const mY=M('#f2c230',{roughness:.5}), mRed=M('#d93a2f',{roughness:.35}), parts=[];
    const hel=new THREE.Group(); hel.position.y=HR*.04; head.add(hel); const R=HR*1.17, TH=1.3;
    add(hel,new THREE.SphereGeometry(R,18,9,0,Math.PI*2,0,TH),mRed);
    add(hel,new THREE.TorusGeometry(R*1.002,.012,4,15,2.4),mRed,[0,0,0],[0,Math.PI/2,(Math.PI-2.4)/2]);
    add(hel,new THREE.CylinderGeometry(R*1.12,R*1.18,.012,18),mRed,[0,R*Math.cos(TH),-.03],[-.12,0,0],[1,1,1.25]);
    add(hel,new RoundedBoxGeometry(.075,.07,.012,2,.006),mGold,[0,R*.7,R*.87],[-.68,0,0]);
    parts.push(hel);
    const v=new THREE.Group(); body.add(v);
    for(const y of [.205,.255]){ band(v,y*H,.022,mY,.0015); band(v,y*H,.007,mRef,.0025); }
    parts.push(v,...legBands(mY,mRef)); A['消防員']=parts; }
  // 郵差：綠色制服、綠色鴨舌帽、斜背郵包
  { const mG=M('#3e8f4e',{roughness:.6}), mBag=M('#2f6b3b',{roughness:.6}), parts=[];
    const cap=capDome(HR*1.12,1.3,mG); cap.position.y=HR*.05; head.add(cap); cap.add(halfBrim(HR*.62,mG,HR*1.12*Math.cos(1.3),HR*1.12*Math.sin(1.3)*.62));
    add(cap,new THREE.SphereGeometry(1,8,6),M('#f2c230'),[0,HR*.75,HR*.8],[-.8,0,0],[.02,.02,.005]); parts.push(cap);
    const v=new THREE.Group(); body.add(v);
    add(v,new THREE.TubeGeometry(frontPath(.12*B,.2*H,-.07*B,.335*H),20,.007,6,false),mBag); add(v,new THREE.TubeGeometry(frontPath(.12*B,.2*H,-.07*B,.335*H,-1),20,.007,6,false),mBag);
    add(v,new RoundedBoxGeometry(.04,.085,.11,2,.012),mBag,[.158*B,.18*H,.02]);
    add(v,new RoundedBoxGeometry(.012,.04,.09,2,.005),M('#f2c230'),[.18*B,.195*H,.02]);
    parts.push(v); A['郵差']=parts; }
  // 公車司機：淺藍襯衫、深藍褲、深藍司機帽（白色帽帶）、紅色領帶
  { const mN=M('#26304f',{roughness:.55}), mK=M('#17181d',{roughness:.35}), parts=[];
    const cap=new THREE.Group(); cap.position.y=HR*.72; cap.rotation.x=-.08; head.add(cap);
    add(cap,new THREE.CylinderGeometry(HR*1.12,HR*.98,HR*.32,16),mN,[0,HR*.14,0]);
    add(cap,new THREE.CylinderGeometry(HR*1.0,HR*1.0,HR*.1,16),M('#f4f4f2',{roughness:.5}),[0,-HR*.03,0]);
    cap.add(halfBrim(HR*.58,mK,-HR*.08,HR*.6,.3)); parts.push(cap);
    const v=new THREE.Group(); body.add(v); const ty=.27*H;
    add(v,new RoundedBoxGeometry(.024,.085,.008,2,.004),M('#d6453d',{roughness:.5}),[0,ty,topR(ty)+.004],[-.22,0,0]);
    add(v,new RoundedBoxGeometry(.03,.02,.01,2,.004),M('#d6453d',{roughness:.5}),[0,.322*H,topR(.322*H)+.002],[-.6,0,0]);
    parts.push(v); A['公車司機']=parts; }
  // 建築工人：黃色安全帽、橘色反光背心、工具腰帶、手拿鐵鎚
  { const mBr=M('#7a5234',{roughness:.7}), parts=[A['工程帽'][0],A['工程帽'][1]];
    const v=new THREE.Group(); body.add(v); band(v,.14*H,.024,mBr,.004,()=>.13*B);
    for(const s of [-1,1]) add(v,new RoundedBoxGeometry(.045,.05,.025,2,.008),M('#8d6340',{roughness:.7}),[s*.09*B,.12*H,.13*B*.85]);
    parts.push(v);
    const hm=new THREE.Group(); hold.add(hm); add(hm,new THREE.CylinderGeometry(.008,.008,.11,8),mBr,[0,-.03,.03]);
    add(hm,new RoundedBoxGeometry(.06,.025,.025,2,.006),M('#9aa3ad',{roughness:.3,metalness:.6}),[0,.025,.03]); parts.push(hm);
    A['建築工人']=parts; }
  // 嬰兒車：雙手往前推
  { const st=new THREE.Group(); d.root.add(st); const mF=M('#3b3f4a',{roughness:.4,metalness:.3}), mBd=M(['#5b8fd0','#e58fb0','#7cc08a'][Math.floor(Math.random()*3)],{roughness:.6,side:THREE.DoubleSide});
    const hy=d.HB+.3*H-.054*H, hz=.107*H+.01;
    add(st,new THREE.CylinderGeometry(.011,.011,.3*d.W,8),mF,[0,hy,hz],[0,0,Math.PI/2]);
    for(const s of [-1,1]){ add(st,new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s*.13,hy,hz),new THREE.Vector3(s*.12,.2,.3),new THREE.Vector3(s*.11,.045,.46)]),12,.008,6,false),mF);
      add(st,new THREE.CylinderGeometry(.008,.008,.24,8),mF,[s*.11,.08,.33],[Math.PI/2,0,0]);
      for(const z of [.24,.46]){ const w=add(st,new THREE.CylinderGeometry(.042,.042,.02,8),M('#26272d',{roughness:.6}),[s*.12,.042,z],[0,0,Math.PI/2]); (d.wheels=d.wheels||[]).push(w); } }
    add(st,new THREE.SphereGeometry(.13,10,6,0,Math.PI*2,Math.PI/2,Math.PI/2),mBd,[0,.21,.36],[0,0,0],[.95,.75,1.25]);
    add(st,new THREE.TorusGeometry(.13,.01,4,14),mBd,[0,.21,.36],[Math.PI/2,0,0],[.95,1.25,1]);
    add(st,new THREE.SphereGeometry(.13,10,6,Math.PI*.5,Math.PI,0,Math.PI/2),mBd,[0,.21,.31],[0,0,0],[.95,.9,1.0]);
    add(st,new THREE.SphereGeometry(.04,8,6),d.mats.mSkin,[0,.235,.4]);
    A['嬰兒車']=[st]; }
  // 遛狗：小狗走在右手邊，用牽繩牽著
  { const dog=new THREE.Group(); dog.position.set(-.34*d.W,0,.16); d.root.add(dog); const mD=M('#c98a4b',{roughness:.7}), mDw=M('#f5ead8',{roughness:.8}), mDk=M('#5a3a26',{roughness:.7});
    add(dog,new THREE.CapsuleGeometry(.045,.11,4,12),mD,[0,.105,0],[Math.PI/2,0,0]);
    add(dog,new THREE.SphereGeometry(.038,8,6),mDw,[0,.1,.065]);
    const hd=new THREE.Group(); hd.position.set(0,.165,.095); dog.add(hd);
    add(hd,new THREE.SphereGeometry(.05,8,6),mD); add(hd,new THREE.SphereGeometry(1,8,6),mDw,[0,-.012,.042],[0,0,0],[.028,.022,.03]);
    add(hd,new THREE.SphereGeometry(.009,8,6),M('#2b2433'),[0,-.004,.072]);
    for(const s of [-1,1]){ add(hd,new THREE.SphereGeometry(.007,8,6),mInk,[s*.02,.012,.042]); add(hd,new THREE.SphereGeometry(1,8,6),mDk,[s*.042,.005,-.005],[0,0,s*.35],[.016,.036,.012]); }
    add(dog,new THREE.TorusGeometry(.035,.007,4,9),M('#e5544b'),[0,.135,.08],[Math.PI/2-.5,0,0]);
    const legs=[]; for(const [x,z] of [[.028,.06],[-.028,.06],[.028,-.06],[-.028,-.06]]){ const g=new THREE.Group(); g.position.set(x,.09,z); dog.add(g); add(g,new THREE.CylinderGeometry(.012,.011,.07,8),mD,[0,-.04,0]); add(g,new THREE.SphereGeometry(.014,8,6),mDw,[0,-.075,.004]); legs.push(g); }
    const tail=add(dog,new THREE.CapsuleGeometry(.008,.05,4,6),mD,[0,.14,-.1],[-.7,0,0]);
    const lg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]); const leash=new THREE.Line(lg,new THREE.LineBasicMaterial({color:'#d6453d'})); d.root.add(leash);
    d.dog={dog,legs,tail,leash}; A['遛狗']=[dog,leash]; }
  // ---- 髮型 ----
  const HM=d.mHair, hs={};
  { const base=hairMesh(HR,HM,{front:.5,side:-.3,faceW:1.3,puff:1.06,ear:.4}); head.add(base);       // 馬尾：往後綁，後面垂一束
    const tie=add(head,new THREE.TorusGeometry(.03,.011,4,8),M('#e5544b'),[0,HR*.15,-HR*1.06],[0,0,0]);
    const tail=add(head,new THREE.SphereGeometry(1,8,6),HM,[0,-HR*.25,-HR*1.2],[.35,0,0],[.045,.13,.045]);
    hs['馬尾']=[base,tie,tail]; }
  { const base=hairMesh(HR,HM,{front:.5,side:-.3,faceW:1.3,puff:1.06,ear:.4}); head.add(base);       // 包頭：頭頂後面一顆圓髮髻
    const bun=add(head,new THREE.SphereGeometry(HR*.48,9,7),HM,[0,HR*.95,-HR*.55]); bun.userData.top=1;
    const lowbun=add(head,new THREE.SphereGeometry(HR*.42,9,7),HM,[0,HR*.1,-HR*1.1]);                 // 戴帽子時改成後腦低髮髻
    lowbun.userData.low=1; hs['丸子頭']=[base,bun,lowbun]; }
  { const base=hairMesh(HR,HM,{front:.6,side:-.35,faceW:1.35,puff:1.025,ear:.5}); head.add(base); hs['平頭']=[base]; }  // 平頭：貼著頭很短
  hs['短髮']=[hairMesh(HR,HM,{front:.5,side:-.42,faceW:1.3,puff:1.06,ear:.45})];
  hs['長髮']=[hairMesh(HR,HM,{front:.38,side:-1.3,faceW:1.25,puff:1.08,ys:1.6})];
  hs['鮑伯頭']=[hairMesh(HR,HM)];
  hs['側分']=[hairMesh(HR,HM,{front:.5,side:-.45,faceW:1.3,puff:1.06,ear:.4,tilt:.2})];
  { const base=hairMesh(HR,HM,{front:.55,side:-.35,faceW:1.3,puff:1.03,ear:.4}), arr=[base]; let sd=7; const rn=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };   // 捲髮：頭上很多小圓捲
    for(const [pt,n] of [[1.45,3],[1.15,8],[.85,12],[.55,14],[.25,13],[-.05,10]]) for(let i=0;i<n;i++){ const yaw=(i+rn()*.5)/n*Math.PI*2-Math.PI;
      if(Math.abs(yaw)<1.15&&pt<.8) continue; if(Math.abs(Math.abs(yaw)-1.57)<.32&&pt<.35) continue;
      const c=new THREE.Mesh(new THREE.SphereGeometry(HR*.21,8,6),HM); c.castShadow=true; c.position.set(Math.sin(yaw)*Math.cos(pt)*HR*1.06,Math.sin(pt)*HR*1.06,Math.cos(yaw)*Math.cos(pt)*HR*1.06); if(pt>.3) c.userData.top=1; arr.push(c); }
    hs['捲髮']=arr; }
  { const base=hairMesh(HR,HM,{front:.5,side:-.3,faceW:1.3,puff:1.05,ear:.4}), arr=[base];   // 三顆丸子：頭頂一顆、兩邊各一顆
    for(const [x,y,z,r] of [[0,1.02,-.15,.4],[-.8,.68,-.12,.36],[.8,.68,-.12,.36]]){ const b=new THREE.Mesh(new THREE.SphereGeometry(HR*r,8,6),HM); b.position.set(x*HR,y*HR,z*HR); b.castShadow=true; b.userData.top=1; arr.push(b); }
    hs['三顆丸子']=arr; }
  for(const k of ['短髮','長髮','鮑伯頭','側分','捲髮','三顆丸子']) for(const o of hs[k]) if(!o.parent) head.add(o);
  d.hairs=hs;
  // New professions: original doll, separate wearable groups.
  { const white=M('#f7f7f0'), navy=M('#22354e'), gold=M('#d6a747'), red=M('#b83c45'), dark=M('#282b35');
    const group=p=>{const g=new THREE.Group();p.add(g);return g;};
    const box=(p,w,h,z,mat,x,y,zz)=>add(p,new RoundedBoxGeometry(w,h,z,2,.006),mat,[x,y,zz]);
    const cyl=(p,r1,r2,h,mat,x,y,z)=>add(p,new THREE.CylinderGeometry(r1,r2,h,24),mat,[x,y,z]);
    const cap=(p,top,band,peak)=>{cyl(p,.174,.163,.055,top,0,.128,0);cyl(p,.165,.165,.025,band,0,.09,0);add(p,new THREE.SphereGeometry(1,20,10),peak,[0,.077,.105],[0,0,0],[.15,.012,.105]);add(p,new THREE.SphereGeometry(.018,12,8),gold,[0,.108,.165]);};
    {const helmet=group(head), suit=group(body);
      add(helmet,new THREE.SphereGeometry(.193,32,20),M('#b8e4f4',{transparent:true,opacity:.18,depthWrite:false,roughness:.12}),[0,0,0]);
      add(helmet,new THREE.TorusGeometry(.158,.021,8,28),white,[0,-.108,0],[Math.PI/2,0,0]);
      for(const sign of [-1,1])add(helmet,new THREE.SphereGeometry(.041,12,8),white,[sign*.18,0,0]);
      box(suit,.17,.21,.09,white,0,.235*H,-.14*B);
      for(const sign of [-1,1])cyl(suit,.037,.037,.18,M('#9ba9b7'),sign*.07,.23*H,-.19*B);
      box(suit,.105,.07,.025,navy,0,.25*H,.13*B);
      for(let j=0;j<3;j++)box(suit,.017,.014,.012,[red,gold,white][j],(j-1)*.029,.25*H,.15*B);
      A['太空人']=[helmet,suit];}
    {const hat=group(head), jacket=group(body);cap(hat,white,navy,dark);
      for(const sign of [-1,1]){box(jacket,.065,.016,.06,navy,sign*.105*B,.315*H,0);for(let j=0;j<3;j++)box(jacket,.009,.019,.062,gold,sign*.105*B+(j-1)*.018,.318*H,0);}
      for(const sign of [-1,1])for(let j=0;j<3;j++)add(jacket,new THREE.SphereGeometry(.009,8,6),gold,[sign*.045,.20*H+j*.036,.137*B-j*.008]);
      A['船長']=[hat,jacket];}
    {const hat=group(head), jacket=group(body);cap(hat,navy,red,dark);
      box(jacket,.07,.065,.018,white,0,.31*H,.105*B);
      box(jacket,.025,.085,.018,red,0,.273*H,.13*B);
      for(let j=0;j<3;j++)add(jacket,new THREE.SphereGeometry(.009,8,6),gold,[0,.18*H+j*.025,.14*B]);
      box(jacket,.045,.024,.015,gold,.07*B,.28*H,.11*B);
      A['列車長']=[hat,jacket];}
    {const hat=group(head), apron=group(body), palette=group(d.armL), brush=group(d.armR);
      add(hat,new THREE.SphereGeometry(1,24,12),M('#8b1826'),[.015,.133,0],[0,0,-.16],[.174,.055,.164]);
      cyl(hat,.012,.016,.035,M('#8b1826'),.025,.185,0);
      // No rectangular chest panel; paint accents directly on shirt.
      for(let j=0;j<5;j++)add(apron,new THREE.SphereGeometry(1,8,6),M(['#e55a55','#e6bd3b','#368ec7','#5da56a','#9563bd'][j]),[(j%3-1)*.047,.16*H+Math.floor(j/3)*.065,.13*B],[0,0,j],[.019,.013,.005]);
      add(palette,new THREE.SphereGeometry(1,20,12),M('#b68a58'),[0,-.13*H,.055],[0,0,0],[.077,.052,.013]);
      for(let j=0;j<5;j++){let a=j*1.1;add(palette,new THREE.SphereGeometry(.012,8,6),M(['#e55a55','#e6bd3b','#368ec7','#5da56a','#9563bd'][j]),[.05*Math.cos(a),-.13*H+.034*Math.sin(a),.067]);}
      cyl(brush,.005,.006,.13,M('#805333'),0,-.12*H,.035);
      add(brush,new THREE.ConeGeometry(.013,.035,10),M('#344b80'),[0,-.12*H+.08,.035]);
      A['畫家']=[hat,apron,palette,brush];}
  }
  {const hat=new THREE.Group();head.add(hat);const leather=M('#a97840'),band=M('#573b2b');
  add(hat,new THREE.SphereGeometry(1,24,12),leather,[0,.10,0],[0,0,0],[.225,.025,.19]);
  add(hat,new THREE.CylinderGeometry(.108,.135,.09,24),leather,[0,.155,0]);
  add(hat,new THREE.CylinderGeometry(.137,.137,.022,24),band,[0,.122,0]);
  for(const sign of [-1,1])add(hat,new THREE.SphereGeometry(1,16,8),leather,[sign*.16,.125,0],[0,0,sign*.28],[.075,.025,.16]);
  const scarf=knitScarf(); scarf.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.set('#e9d6a6');}});
  const bucket=new THREE.Group();hold.add(bucket);const metal=M('#aab6bc',{metalness:.35});
  add(bucket,new THREE.CylinderGeometry(.058,.043,.095,20,1,true),M('#aab6bc',{side:THREE.DoubleSide,metalness:.35}),[0,-.09,.025]);
  add(bucket,new THREE.CircleGeometry(.043,20),metal,[0,-.137,.025],[-Math.PI/2,0,0]);
  add(bucket,new THREE.CircleGeometry(.052,20),M('#fff8e8'),[0,-.052,.025],[-Math.PI/2,0,0]);
  add(bucket,new THREE.TorusGeometry(.058,.004,8,20,Math.PI),metal,[0,-.043,.025]);
  A['牧場主人']=[hat,scarf,bucket];}
  A['農夫']=[...A['斗笠'],...A['菜籃']];
  {const book=new THREE.Group();hold.add(book);
    add(book,new RoundedBoxGeometry(.105,.145,.025,2,.004),M('#f6edda'),[0,-.035,.038]);
    for(const z of [.021,.055])add(book,new RoundedBoxGeometry(.113,.151,.009,2,.003),M('#356c59'),[0,-.035,z]);
    add(book,new RoundedBoxGeometry(.012,.151,.035,2,.003),M('#285343'),[-.051,-.035,.038]);
    add(book,new RoundedBoxGeometry(.061,.027,.003,2,.001),M('#e9c77c'),[.004,-.007,.061]);
    const shirt=new THREE.Group();body.add(shirt);
    const fabric=M('#e8f2f7',{side:THREE.DoubleSide}), pocket=M('#80abc8',{side:THREE.DoubleSide});
    function patch(points,mat){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.setIndex(points.length===3?[0,1,2]:[0,1,2,0,2,3]);g.computeVertexNormals();add(shirt,g,mat);}
    patch([[-.086*B,.268*H,.109*B],[-.041*B,.268*H,.132*B],[-.041*B,.216*H,.14*B],[-.086*B,.216*H,.116*B]],pocket);
    add(shirt,new THREE.CylinderGeometry(.005,.005,.047*H,10),M('#354a65'),[-.06*B,.272*H,.122*B],[0,0,-.12]);
    A['老師']=[book,shirt];}
  d.acc=A; }
/* 家長 11-27：斗笠不再當一般居民的配件（農夫的工作服才戴）；職業服裝取自 GitHub residents-professions-v9（b55cd163）：太空人、船長、列車長、畫家、農夫、牧場主人、老師 */
function wear(d,k){ const ok=d.kid?['無','小黃帽＋書包','領巾','遛狗','氣球']:['無','菜籃','拐杖','背包','遛狗','嬰兒車','領巾','清潔隊員','警察','醫生','護士','消防員','郵差','公車司機','建築工人','廚師','太空人','船長','列車長','畫家','農夫','牧場主人','老師']; if(!ok.includes(k)) k='無';   // 小孩只能小黃帽＋書包，大人不行
  const vis=new Set(d.acc[k]||[]); for(const arr of Object.values(d.acc)) for(const o of arr) o.visible=vis.has(o);
  d.cur=k; d.hat=['小黃帽＋書包','清潔隊員','警察','消防員','護士','郵差','公車司機','建築工人','廚師','太空人','船長','列車長','畫家','農夫','牧場主人'].includes(k); d.holding=['菜籃','拐杖','清潔隊員','遛狗','建築工人','氣球','農夫','牧場主人','老師'].includes(k); d.push=(k==='嬰兒車');
  for(const m of d.sleeves) m.material=k==='醫生'?mCoat:d.mats.mTop;
  // 制服一律穿褲子（男女都一樣）
  const uni=!!UNI[k], P=uni||!d.pantsTop?d.legsP:d.legsN;
  if(d.pantsTop){ d.pantsTop.visible=uni; d.skirt.visible=!uni; for(const l of d.legsN) l.visible=!uni; for(const l of d.legsP) l.visible=uni; d.HB=uni?.13:d.HB0; }
  d.legL=P[0]; d.legR=P[1];
  // 制服：整套換顏色，脫掉時換回原本的顏色
  const U=UNI[k];
  if(U){ if(!d.saved) d.saved=[d.mats.mTop.color.getHex(),d.mats.mBot.color.getHex()]; d.mats.mTop.color.set(U.top); d.mats.mBot.color.set(U.bot); }
  else if(d.saved){ d.mats.mTop.color.setHex(d.saved[0]); d.mats.mBot.color.setHex(d.saved[1]); d.saved=null; } setHair(d,d.hairNow||'原本'); }
function setHair(d,h){ if(d.man&&['長髮','鮑伯頭','丸子頭','馬尾','三顆丸子'].includes(h)) h='原本'; if(!d.man&&d.kind!=='小孩'&&h==='平頭') h='原本';   // 平頭只有男生   // 男生不留長髮、鮑伯頭，不綁馬尾、丸子
  d.hairNow=h; for(const m of d.orig) m.visible=(h==='原本'); for(const b of d.buns) b.visible=(h==='原本')&&!d.hat;
  for(const [n,arr] of Object.entries(d.hairs)) for(const o of arr) o.visible=(n===h)&&!(o.userData.top&&d.hat)&&!(o.userData.low&&!d.hat); }


function glassCol(d){ const h=d.mats.mHair.color, l=h.r*.3+h.g*.59+h.b*.11; d.mG.color.copy(h).lerp(new THREE.Color(l>.5?'#8d939b':'#ffffff'),l>.5?.45:.3); }

/* ---------- 合併：把每個會動的部位裡的小零件合成一塊（用頂點顏色），iPad 上 30 個人也不會卡 ---------- */
const VC=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,side:THREE.DoubleSide});
export function prune(root){ const rm=[]; root.traverse(o=>{ if(o!==root&&!o.visible&&!o.userData.keep) rm.push(o); }); for(const o of rm) if(o.parent) o.parent.remove(o); }
export function bake(root){ const objs=[]; root.traverse(o=>objs.push(o));
  for(const o of objs){ const ms=o.children.filter(m=>m.isMesh&&!m.isSprite&&!m.userData.noMerge&&!m.children.length&&m.material&&!Array.isArray(m.material)&&!m.material.map&&!m.material.transparent&&m.visible);
    if(ms.length<2) continue; const gs=[];
    for(const m of ms){ m.updateMatrix(); let g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();
      for(const k of Object.keys(g.attributes)) if(k!=='position'&&k!=='normal') g.deleteAttribute(k);
      g.applyMatrix4(m.matrix); const c=m.material.color, e=m.material.emissive||c, n=g.attributes.position.count, col=new Float32Array(n*3);
      for(let i=0;i<n;i++){ col[i*3]=Math.min(1,c.r+e.r*.5); col[i*3+1]=Math.min(1,c.g+e.g*.5); col[i*3+2]=Math.min(1,c.b+e.b*.5); }
      g.setAttribute('color',new THREE.BufferAttribute(col,3)); gs.push(g); }
    const mg=mergeGeometries(gs,false); if(!mg) continue; for(const m of ms) o.remove(m);
    const one=new THREE.Mesh(mg,VC); one.castShadow=true; one.receiveShadow=true; o.add(one); } }

/* ---------- 做一個城市居民 ---------- */
export const KINDS=['阿姨','叔叔','小孩','小女孩','奶奶','爺爺'];
export const HAIRS=['短髮','長髮','鮑伯頭','側分','捲髮','丸子頭','馬尾','三顆丸子','平頭'];
export const PSCALE=.62;   // 小人偶在城市裡的大小
export function spawnDoll({kind,acc='無',hair='原本',glasses=null}){ const d=makeDoll(kind); addAcc(d);
  d.mats.mSkin.color.set(pick(PAL.skin)); if(!d.old) d.mats.mHair.color.set(pick(PAL.hair)); d.mats.mTop.color.set(pick(PAL.top)); d.mats.mBot.color.set(pick(PAL.bottom));
  wear(d,acc); setHair(d,hair); d.glasses.visible=acc==='老師'||(glasses==null?d.old:glasses); glassCol(d); d.umb.userData.keep=1;
  for(const e of d.eyes) e.userData.noMerge=1;
  prune(d.root); bake(d.root);
  const obj=new THREE.Group(), inner=new THREE.Group(); inner.scale.setScalar(PSCALE); inner.add(d.root); obj.add(inner); d.root.position.set(0,0,0);
  const h=(d.kid?.5:.74)*PSCALE, hit=new THREE.Mesh(new THREE.BoxGeometry(h*.6,h,h*.6),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=h/2; obj.add(hit);
  d.ph=Math.random()*6; d.T=0; return {obj,hit,h,d,kind,role:d.cur,kid:d.kid,old:d.old,man:d.man,anim:(dt,st)=>animDoll(d,dt,st)}; }
/* st：{walk, ph, wave, rain, face}（walk 走路中、ph 步伐、wave 揮手中、rain 下雨） */
function animDoll(d,dt,st){ d.T+=dt; const T=d.T, walk=st.walk, sw=walk?Math.sin(st.ph):0;
  d.hips.position.y=d.HB+(walk?Math.abs(Math.cos(st.ph))*.015:0);
  d.body.rotation.z=walk?Math.sin(st.ph)*.045:Math.sin(T*1.6+d.ph)*.015;
  d.legL.rotation.x=sw*.6; d.legR.rotation.x=-sw*.6;
  const umbOn=st.rain&&!d.push; d.umb.visible=umbOn;
  if(d.push){ d.armL.rotation.x=d.armR.rotation.x=-1.1+sw*.03; }
  else { d.armL.rotation.x=umbOn?-.55+sw*.05:-sw*.7; d.armR.rotation.x=d.holding?sw*.15:sw*.7; d.armR.rotation.z=-.18; }
  if(st.wave&&!d.push){ d.armR.rotation.x=-.4; d.armR.rotation.z=-2.3+Math.sin(T*9)*.3; }
  d.holdL.quaternion.copy(d.armL.quaternion).invert();
  if(d.push&&d.wheels) for(const w of d.wheels) w.rotation.x+=walk?dt*6:0;
  if(d.cur==='遛狗'){ const g=d.dog; g.legs.forEach((l,i)=>l.rotation.x=walk?Math.sin(st.ph*1.3+(i%3?0:Math.PI))*.6:0); g.tail.rotation.z=Math.sin(T*9)*.5;
    d.root.updateMatrixWorld(true); const a=new THREE.Vector3(0,-.12*d.H,0); d.armR.localToWorld(a); d.root.worldToLocal(a); const b=new THREE.Vector3(0,.15,.1); g.dog.localToWorld(b); d.root.worldToLocal(b);
    const p=g.leash.geometry.attributes.position; p.setXYZ(0,a.x,a.y,a.z); p.setXYZ(1,b.x,b.y,b.z); p.needsUpdate=true; }
  d.hold.quaternion.copy(d.armR.quaternion).invert();
  d.head.rotation.y=walk||st.wave?0:Math.sin(T*.7+d.ph)*.25;
  d.blink-=dt; const closed=d.blink<0; if(d.blink<-.12) d.blink=2.5+Math.random()*2.5;
  for(const e of d.eyes) e.scale.y=closed?.003:(d.kid?.021*.17/.15:.021);
  if(d.cur==='氣球'){ const bb=d.acc['氣球']&&d.acc['氣球'][0]; if(bb&&bb.userData.bob) bb.userData.bob.position.x=Math.sin(T*1.7+d.ph)*.015; } }
