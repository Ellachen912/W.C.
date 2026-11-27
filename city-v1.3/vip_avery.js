import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { M, add } from './people.js';
import { VSCALE, wrapUp, pickCap, SHIRT, pickA } from './vip_common.js';
import { buildExpressions, expressionController } from './vip_expressions.js';
export function makeAvery(){
const mSkin=M('#f2c4a2',{roughness:.6})   /* 家長 11-27 12:54：原本 #ffdcc6 太白，改成居民清單的膚色 */, mHair=M('#503b32',{roughness:.78,side:THREE.DoubleSide}), mDress=M('#cbbdf5',{roughness:.65,side:THREE.DoubleSide})   /* 家長 11-26 19:15：裙子固定粉紫色（樣張原本的顏色），不隨機 */,
  mShoePink=M('#f8cbd8',{roughness:.65}), mWhite=M('#fbfaf7',{roughness:.6}), mInk=M('#22202a',{roughness:.3}), mBrow=M('#24202a'), mLip=M('#c0604f'), mBlush=M('#f7a0a0',{transparent:true,opacity:.35}),
  mFur=M('#fdeef2',{roughness:1}), mPink=M('#f58fa6',{roughness:.9}), mYel=M('#f4c63d');

/* ---------- 做一個人：每個部位是一塊硬零件，關節只會轉 ---------- */
const person=new THREE.Group();
const body=new THREE.Group(); person.add(body);
const lathe=(pts,seg=36)=>new THREE.LatheGeometry(pts.map(([x,y])=>new THREE.Vector2(x,y)),seg);
// 洋裝（A 字裙，一整塊硬的，腿在裡面擺）
const dress=add(body,lathe([[0,.31],[.16,.275],[.186,.27],[.192,.285],[.145,.39],[.112,.45],[.1,.49],[.07,.52],[.05,.525],[0,.525]]),mDress,[0,0,0],[0,0,0],[1,1,.78]);
add(body,new THREE.CylinderGeometry(.045,.05,.06,16),mSkin,[0,.535,0]);   // 脖子
// 腿＋襪子＋鞋子（鞋上有小花）
function leg(x){ const g=new THREE.Group(); g.position.set(x,.26,0); body.add(g);
  add(g,new THREE.CapsuleGeometry(.042,.1,4,14),mSkin,[0,-.09,0]);
  add(g,new THREE.CylinderGeometry(.047,.047,.075,16),mWhite,[0,-.185,0]);
  add(g,new THREE.TorusGeometry(.047,.01,8,18),mWhite,[0,-.15,0],[Math.PI/2,0,0]);
  add(g,new THREE.SphereGeometry(1,18,12),mShoePink,[0,-.228,.022],[0,0,0],[.056,.034,.088]);
  add(g,new THREE.TorusGeometry(.05,.009,6,18),mShoePink,[0,-.208,.012],[Math.PI/2-.25,0,0]);
  const f=new THREE.Group(); f.position.set(0,-.2,.078); f.rotation.x=-.9; g.add(f);
  add(f,new THREE.SphereGeometry(.009,8,6),mYel);
  for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; add(f,new THREE.SphereGeometry(1,8,6),M('#ffe58a'),[Math.cos(a)*.014,Math.sin(a)*.014,-.002],[0,0,a],[.011,.007,.005]); }
  return g; }
const legL=leg(.062), legR=leg(-.062);
// 手臂（沒有袖子）
function arm(x){ const g=new THREE.Group(); g.position.set(x,.485,0); body.add(g);
  add(g,new THREE.SphereGeometry(.04,12,10),mSkin);
  add(g,new THREE.CapsuleGeometry(.034,.15,4,12),mSkin,[0,-.1,0]);
  add(g,new THREE.SphereGeometry(1,14,10),mSkin,[0,-.215,0],[0,0,0],[.036,.044,.04]); return g; }
const armL=arm(.118), armR=arm(-.118);

// 頭
const head=new THREE.Group(); head.position.set(0,.76,0); body.add(head);
const face=new THREE.Group(); head.add(face); face.scale.set(1.05,.97,1);
const HR=.23;
add(face,new THREE.SphereGeometry(HR,28,20),mSkin);
const P=(yaw,pitch,rad=HR)=>new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(rad);
function onHead(obj,yaw,pitch,rad=HR){ const p=P(yaw,pitch,rad); obj.position.copy(p); obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),p.clone().normalize()); face.add(obj); return obj; }
const wrap=(m,rz=0)=>{ const g=new THREE.Group(); g.add(m); g.rotation.z=rz; return g; };
const eyes=[],normalLashes=[];
for(const s of [-1,1]){
  const e=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),M('#4b3430',{roughness:.76})); e.scale.set(.024,.034,.012); onHead(e,s*.33,-.02,HR*.995); eyes.push(e);
  for(const [c,p,sc] of [['#634638',[0,-.10,.75],[.69,.77,.26]],['#302629',[0,.02,.96],[.47,.59,.12]],['#fff9ef',[-.26,.32,1.02],[.19,.15,.10]]]){const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:c}));m.position.set(...p);m.scale.set(...sc);e.add(m);}
  {const pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push(P(s*(.405+.10*t),.015+.055*t*t,HR+.006));}normalLashes.push(add(face,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,.0035,8,false),mInk));}
  {const pos=[],idx=[],N=48,K=8;for(let i=0;i<=N;i++){const t=i/N,x=(t-.5)*.054,cy=.009*Math.sin(Math.PI*t)-.001*t,w=.006*Math.pow(Math.sin(Math.PI*t),.48)*(1-.43*t);for(let j=0;j<=K;j++){const u=j/K*2-1;const p=P(s*.33+s*x/HR,.21+(cy+w*u)/HR,HR+.004+.0018*(1-u*u));pos.push(p.x,p.y,p.z);}}for(let i=0;i<N;i++)for(let j=0;j<K;j++){const a=i*(K+1)+j,b=a+K+1;idx.push(a,b,a+1,b,b+1,a+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();add(face,g,new THREE.MeshBasicMaterial({color:'#49352e',side:THREE.DoubleSide}));}
  {const pos=[],uv=[],idx=[],N=48,K=12;for(let i=0;i<=K;i++){const r=i/K;for(let j=0;j<=N;j++){const a=j*2*Math.PI/N,x=.041*r*Math.cos(a),y=.025*r*Math.sin(a);const p=P(s*.55+x/HR,-.2+y/HR,HR+.0015);pos.push(p.x,p.y,p.z);uv.push(.5+.5*r*Math.cos(a),.5+.5*r*Math.sin(a));}}for(let i=0;i<K;i++)for(let j=0;j<N;j++){const a=i*(N+1)+j,b=a+N+1;idx.push(a,b,a+1,b,b+1,a+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),grad=ctx.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(239,128,133,0.48)');grad.addColorStop(.45,'rgba(239,128,133,0.30)');grad.addColorStop(1,'rgba(239,128,133,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);add(face,g,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,side:THREE.DoubleSide}));}
  add(face,new THREE.SphereGeometry(1,14,10),mSkin,[s*HR*1.0,-.035,0],[0,0,0],[.028,.046,.036]);
}
{const shape=new THREE.Shape();shape.moveTo(-.016,-.018);shape.quadraticCurveTo(-.019,-.018,-.017,-.013);shape.lineTo(-.003,.023);shape.quadraticCurveTo(0,.028,.003,.023);shape.lineTo(.017,-.013);shape.quadraticCurveTo(.019,-.018,.014,-.018);shape.closePath();const nose=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.007,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:3,steps:1,curveSegments:12}),M('#dc925e'));nose.scale.set(.85,.85,.85);onHead(nose,0,-.15,HR*.997);}
let originalMouth;{ const arc=Math.PI*.62, m=new THREE.Mesh(new THREE.TorusGeometry(.036,.0052,8,20,arc),mLip); m.rotation.z=Math.PI+(Math.PI-arc)/2; originalMouth=onHead(wrap(m),0,-.24,HR*.994); }

const {mouths,smileEyes}=buildExpressions({originalMouth,P,HR,face,mInk,mouthPitch:-0.24,lashes:true});

// Sculpted bob: raised forehead clearance, rounded volume and directional locks.
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
function hairline(y){const f=Math.abs(y),pts=[[0,.49],[.45,.48],[.72,.43],[.95,.31],[1.18,-.10],[1.5,-.43],[2.2,-.56],[Math.PI,-.58]];let v=-.58;for(let i=1;i<pts.length;i++)if(f<=pts[i][0]){v=pts[i-1][1]+(pts[i][1]-pts[i-1][1])*smooth((f-pts[i-1][0])/(pts[i][0]-pts[i-1][0]));break;}return v+(1-smooth(f/1.0))*(.065*Math.sin(3*y+.4)+.025*Math.cos(7*y))+.045*smooth((f-1)/.6)*Math.cos(6*y);}
{const pos=[],idx=[],N=96,K=32;for(let i=0;i<=N;i++){const y=-Math.PI+2*Math.PI*i/N,hl=hairline(y);for(let j=0;j<=K;j++){const t=j/K,p=hl+(Math.PI/2-hl)*t;const edge=.018+.082*smooth(t/.12),flow=.023*Math.sin(Math.PI*t)*Math.cos(9*y+3*t);const back=smooth((Math.abs(y)-.95)/1.5);const volume=back*Math.pow(Math.sin(Math.PI*t),.8)*(.095+.025*Math.cos(11*y+2.4*t));const sweep=y+.48*t;const ridges=.014*Math.sin(Math.PI*t)*Math.cos(18*sweep);const front=1-smooth(Math.abs(y)/1.4);const locks=.033*front*Math.sin(Math.PI*t)*Math.cos(5*(y+.65*t));const r=HR*(1+edge+flow+volume+ridges+locks);const v=P(y,p,r);pos.push(v.x,v.y,v.z);}}for(let i=0;i<N;i++)for(let j=0;j<K;j++){const a=i*(K+1)+j,b=a+K+1;idx.push(a,b,a+1,b,b+1,a+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();add(face,g,mHair);}
function sweptLock(y0,p0,y1,p1,w){const pos=[],idx=[],N=40,K=20;for(let i=0;i<=N;i++){const t=i/N,y=y0+(y1-y0)*t,p=p0+(p1-p0)*t;const width=w*Math.pow(Math.sin(Math.PI*t),.65);for(let j=0;j<=K;j++){const u=j/K*2-1,yy=y+u*width;const rad=HR*(1.095+.065*Math.sin(Math.PI*t)*Math.sqrt(Math.max(0,1-u*u)));const v=P(yy,p,rad);pos.push(v.x,v.y,v.z);}}for(let i=0;i<N;i++)for(let j=0;j<K;j++){const a=i*(K+1)+j,b=a+K+1;idx.push(a,b,a+1,b,b+1,a+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();add(face,g,mHair);}
// Hair flow integrated into continuous shell to eliminate overlapping seams.
// 兔耳髮箍
const band=new THREE.Group(); band.rotation.x=.1; face.add(band);
const BR=HR*1.22; add(band,new THREE.TorusGeometry(BR,.034,10,40,Math.PI*.92),mFur,[0,0,0],[0,0,Math.PI*.04]);
const ears=[]; for(const s of [-1,1]){ const g=new THREE.Group(); g.position.set(s*.1,Math.sqrt(BR*BR-.01)-.01,0); g.rotation.z=-s*.2; band.add(g); ears.push(g);
  add(g,new THREE.SphereGeometry(1,20,16),mFur,[0,.13,0],[0,0,0],[.06,.145,.034]);
  add(g,new THREE.SphereGeometry(1,20,16),mPink,[0,.125,.024],[0,0,0],[.034,.105,.014]); }

// Small white rabbit clip on the side of the fringe.
const clip=new THREE.Group();onHead(clip,.72,.65,HR*1.08);clip.rotation.z=-.25;
add(clip,new THREE.SphereGeometry(1,20,14),mFur,[0,0,.014],[0,0,0],[.038,.03,.014]);
for(const s of [-1,1]){add(clip,new THREE.SphereGeometry(1,14,10),mFur,[s*.017,.037,.012],[0,0,-s*.22],[.012,.027,.009]);add(clip,new THREE.SphereGeometry(1,12,8),mPink,[s*.017,.038,.020],[0,0,-s*.22],[.006,.017,.004]);add(clip,new THREE.SphereGeometry(.004,10,8),mInk,[s*.012,.003,.027]);}add(clip,new THREE.SphereGeometry(.004,10,8),mPink,[0,-.009,.028]);
// Dress collar and tiny buttons.
for(const s of [-1,1])add(body,new THREE.SphereGeometry(1,16,10),mWhite,[s*.033,.49,.074],[0,0,s*.3],[.039,.019,.012]);
for(let i=0;i<2;i++)add(body,new THREE.SphereGeometry(.009,12,8),mWhite,[0,.447-i*.035,.093+i*.009]);

  /* 家長 11-26：髮飾（兔夾或兔耳，一定戴）、表情都隨機；表情過一陣子會換 */
  const ear=pickA(['兔夾','兔耳']);   /* 家長 11-26 19:10：一定要戴，只是隨機選兔子髮夾或兔耳髮箍 */ band.visible=ear==='兔耳'; clip.visible=ear==='兔夾';
  const live=[...new Set(Object.values(mouths)),...smileEyes,...eyes,...normalLashes];
  for(const o of live){ o.userData.keep=1; o.traverse(x=>{ x.userData.noMerge=1; x.userData.keep=1; }); }
  let expr='原版'; const setExpr=e=>{ expr=e; const happy=e==='微笑'||e==='開心大笑'; for(const m of new Set(Object.values(mouths))) m.visible=m===mouths[e]; for(const m of smileEyes) m.visible=happy; for(const m of normalLashes) m.visible=!happy; for(const m of eyes) m.visible=!happy; };
  const expressions=expressionController(setExpr);
  let T=0, blinkT=2;
  const OUT=wrapUp(person,{avery:true},.98,VSCALE*.8);   // 家長 11-18：Avery 年紀比較小，縮小一點
  OUT.react=expressions.react;
  OUT.anim=(dt,st)=>{ T+=dt; const walk=st.walk, wave=st.wave, sw=walk?Math.sin(st.ph):0;
    expressions.tick(dt,wave);
    legL.rotation.x=sw*.5; legR.rotation.x=-sw*.5;
    body.position.y=walk?Math.abs(Math.cos(st.ph))*.02:Math.sin(T*2)*.004; body.rotation.z=walk?Math.sin(st.ph)*.03:0;
    dress.rotation.y=walk?Math.sin(st.ph)*.06:0;
    armL.rotation.x=-sw*.45; armL.rotation.z=.2;
    armR.rotation.x=sw*.45; armR.rotation.z=wave?-1.75+Math.sin(T*9)*.3:-.2; if(wave) armR.rotation.x=-1.0;
    head.rotation.z=wave?Math.sin(T*4.5)*.05:0; head.rotation.y=walk||wave?0:Math.sin(T*.6)*.12;
    const wob=walk?Math.sin(st.ph*2)*.05:Math.sin(T*2)*.015; ears[0].rotation.x=wob; ears[1].rotation.x=wob*.8;
    blinkT-=dt; const closed=blinkT<0; if(blinkT<-.12) blinkT=2.5+Math.random()*2.5;
    for(const e of eyes) e.scale.y=closed?.004:.034; };
  /* 移交 11-26：坐下／平滑起身（sit 0→1 約 0.9 秒，smoothstep），原地開心慶祝（取自 mayor-motion-v4，腳不離地；不跑、不跳、不驚訝） */
  { const baseAnim=OUT.anim; let sitS=0, cT=0; OUT.sitK=0;
    OUT.anim=(dt,st)=>{ baseAnim(dt,st);
      sitS=Math.max(0,Math.min(1,sitS+(st.sit?dt:-dt)/.9)); const k=sitS*sitS*(3-2*sitS); OUT.sitK=k;
      if(k>0){ legL.rotation.x+=(-1.48-legL.rotation.x)*k; legR.rotation.x+=(-1.48-legR.rotation.x)*k; body.position.y+=.115*k; armL.rotation.x-=.35*k; armR.rotation.x-=.35*k; }
      if(st.cheer&&k===0&&!st.walk){ cT+=dt; const a=.5+.5*Math.sin(cT*5); armL.rotation.z=1.85+.35*a; armR.rotation.z=-1.85-.35*a; armL.rotation.x=armR.rotation.x=-.25; head.rotation.z=.055*Math.sin(cT*5); body.rotation.z=.025*Math.sin(cT*5); body.position.y=0; legL.rotation.x=legR.rotation.x=0; } else if(cT){ cT=0; body.rotation.x=0; head.rotation.x=0; } }; }
  return OUT; }
