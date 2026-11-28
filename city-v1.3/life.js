/* Winston City 城市生命感（2026-11-12；人物 2026-11-18 換新）：居民走路、市長、汽車、動物走動、白天晚上、天氣、點建築的小反應。
   人物：程式拼的小人（people.js 木頭小人偶、people_vip.js 市長和 Avery），走在每一格邊緣的人行道上，路口過馬路。
   汽車：KayKit City Builder Bits（CC0）一般車；Kenney Car Kit（CC0）工作車。路＝六角形的邊線。
   家長 11-20 23:12（11-25 做）：說話時間拉長兩倍、說話窗口放大並標出是誰說的；市長的話只有市長會說，
   市長會提醒「哪種建築蓋在哪一區」「先蓋好什麼才能蓋什麼」；Avery 離市場遠一點、跟市長散步時距離拉開、話變多。 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as L from './lib.js';
import { TALK, PEOPLE_TALK } from './texts.js';
import { spawnDoll, HAIRS } from './people.js';
import { makeMayor, makeAvery } from './people_vip.js';
import { createVisits } from './visit.js';   /* 11-27 A-0：人物進建築 */
import { TYPES, ZONES, reqList, reqState, reqText, whyNoUp } from './data.js';

const loader=new GLTFLoader();
let PACK=null;
const pack=()=>PACK||(PACK=import('./life_data.js').then(m=>m.M).catch(()=>({})));
async function glb(path){ const M=await pack(); if(!M[path]) return loader.loadAsync(path);
  const bin=Uint8Array.from(atob(M[path]),c=>c.charCodeAt(0)).buffer; return loader.parseAsync(bin,path.slice(0,path.lastIndexOf('/')+1)); }

/* ---------- 路：六角形的邊線 ---------- */
function buildRoads(hexes,R,riverX){
  const nodes=[], key=(x,z)=>Math.round(x*10)+','+Math.round(z*10), idx={};
  const node=(x,z)=>{ const k=key(x,z); if(idx[k]==null){ idx[k]=nodes.length; nodes.push({x,z,nb:new Set(),hex:new Set()}); } return idx[k]; };
  for(const h of hexes){ const ids=[]; for(let i=0;i<6;i++){ const a=i*Math.PI/3; ids.push(node(h.x+R*Math.cos(a),h.z-R*Math.sin(a))); }
    for(let i=0;i<6;i++){ const a=ids[i], b=ids[(i+1)%6]; nodes[a].hex.add(h.key); nodes[b].hex.add(h.key);
      if(nodes[a].x<riverX+1.2&&nodes[b].x<riverX+1.2) continue;    // 河邊那幾段不走
      nodes[a].nb.add(b); nodes[b].nb.add(a); } }
  return nodes;
}

/* ---------- 人行道（家長 2026-11-18）：每一格邊緣一圈人行道，人走在人行道中間；換到別格時在路口過馬路 ----------
   斑馬線：只畫在市政廳、學校、市場、醫院那一格前面的兩個路口，緊貼路口、顏色很淡（家長：白色不要太明顯、不要退縮太多） */
const HEXR=4.2, RS=HEXR-.15, SW_Y=.04, ROAD_Y=.028;
const ZEBRA_T=['hall','school','market','hospital'];
function buildWalks(hexes,RR,riverX){
  const nodes=[], key=(x,z)=>Math.round(x*10)+','+Math.round(z*10), J={};
  for(const h of hexes){ h.walk=[]; for(let i=0;i<6;i++){ const a=i*Math.PI/3, c=Math.cos(a), s=Math.sin(a), id=nodes.length;
      const dead=!!h.extra&&-RS*s>.2;                                   // 碼頭那一格前面是海，那幾個點沒有人行道（家長 11-20 07:40）
      const jx=h.x+RR*c, jz=h.z-RR*s, k=key(jx,jz), j=J[k]||(J[k]={x:jx,z:jz,c:[],cross:[]}); if(!dead) j.c.push(id);
      nodes.push({x:h.x+RS*c,z:h.z-RS*s,nb:[],hex:h,i,j,dead}); h.walk.push(id); } }
  const link=(a,b,cross)=>{ nodes[a].nb.push({to:b,cross}); nodes[b].nb.push({to:a,cross}); };
  for(const h of hexes) for(let i=0;i<6;i++){ const a=h.walk[i], b=h.walk[(i+1)%6]; if(nodes[a].dead||nodes[b].dead) continue; if(nodes[a].x<riverX+1.2&&nodes[b].x<riverX+1.2) continue; link(a,b,null); }
  for(const j of Object.values(J)) for(let p=0;p<j.c.length;p++) for(let q=p+1;q<j.c.length;q++){ const cr={a:j.c[p],b:j.c[q],zebra:false}; j.cross.push(cr); link(cr.a,cr.b,cr); }
  /* 碼頭那一格離城市有一段（在鐵軌外面）：手動接一條人行道過去，中間是平交道（家長 11-19 23:44） */
  for(const h of hexes) if(h.bridgeTo){ const o=hexes.find(x=>x.id===h.bridgeTo); if(!o||!o.walk) continue;
    let a=-1,b=-1,da=1e9,db=1e9;
    for(const id of h.walk){ if(nodes[id].dead) continue; const d=Math.hypot(nodes[id].x-o.x,nodes[id].z-o.z); if(d<da){ da=d; a=id; } }
    for(const id of o.walk){ const d=Math.hypot(nodes[id].x-h.x,nodes[id].z-h.z); if(d<db){ db=d; b=id; } }
    if(a>=0&&b>=0) link(a,b,{a,b,zebra:false,rail:true}); }
  return {nodes};
}
function zebraMesh(W,hexIds){ const N=W.nodes, gs=[], bar=new THREE.BoxGeometry(.1,.006,.34);
  for(const n of N) for(const e of n.nb) if(e.cross) e.cross.zebra=false;
  for(const h of new Set(hexIds)) for(const i of [4,5]){ const n=N[h.walk[i]], id=h.walk[i];
    for(const cr of n.j.cross){ if(cr.a!==id&&cr.b!==id) continue; cr.zebra=true;
      const A=N[cr.a], B=N[cr.b], len=Math.hypot(B.x-A.x,B.z-A.z), dx=(B.x-A.x)/len, dz=(B.z-A.z)/len, mx=(A.x+B.x)/2, mz=(A.z+B.z)/2;
      for(let k=-3;k<=3;k++){ const g=bar.clone(); g.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.atan2(-dz,dx)).setPosition(mx+dx*k*.2,ROAD_Y,mz+dz*k*.2)); gs.push(g); } } }
  if(!gs.length) return null; const m=new THREE.Mesh(mergeGeometries(gs),L.mat('#efe9dc',{roughness:.95})); m.receiveShadow=true; return m; }

/* 走在人行道上的人：anchor 是常待的地方（離太遠就往回走）；有斑馬線的路口比較常過馬路 */
/* ---------- 有建築的區域（家長 11-20 00:05：市民和車子只在有建築物附近活動，空地那邊不要有人繞） ----------
   LIVE 是每一塊有蓋東西的格子中心；離這些中心 LIVE_R 以內的路口才會有人和車走。城市還空的時候不限制。 */
let LIVE=[], LIVE_R=6.6;
function setLive(list,r){ LIVE=list; if(r) LIVE_R=r; }
function nearLive(n){ if(!LIVE.length) return true; const r2=LIVE_R*LIVE_R;
  for(const c of LIVE){ const dx=n.x-c.x, dz=n.z-c.z; if(dx*dx+dz*dz<r2) return true; } return false; }
function liveDist(n){ if(!LIVE.length) return 0; let m=1e9;
  for(const c of LIVE){ const d=Math.hypot(n.x-c.x,n.z-c.z); if(d<m) m=d; } return m; }

class Walker{
  /* out：走路時往馬路那一側偏多少（離建築遠一點）；avoid(hex)：回傳 true 的格子盡量不要沿著走（Avery 不走市場邊，家長 11-20 23:12） */
  constructor(P,W,{speed=.22,anchor=null,rad=7,scale=.62,out=0,avoid=null}={}){ Object.assign(this,{P,W,speed,anchor,rad,scale,out,avoid}); this.ph=Math.random()*6; this.wait=0; this.wave=0; this.waveCD=4+Math.random()*8; this.place(); }
  anc(){ return typeof this.anchor==='function'?this.anchor():this.anchor; }
  place(x,z){ const N=this.W.nodes, an=this.anc(), tx=x!=null?x:an&&an.x, tz=z!=null?z:an&&an.z;
    let pool=[]; for(let i=0;i<N.length;i++) if(N[i].nb.length&&nearLive(N[i])&&!(this.avoid&&this.avoid(N[i].hex))) pool.push(i);
    if(!pool.length) for(let i=0;i<N.length;i++) if(N[i].nb.length) pool.push(i);
    let best=pool[Math.floor(Math.random()*pool.length)], bd=1e9;
    if(tx!=null) for(const i of pool){ const d=Math.hypot(N[i].x-tx,N[i].z-tz)+(x!=null?0:Math.random()*4); if(d<bd){ bd=d; best=i; } }
    this.a=best; this.prev=-1; this.pick(); this.t=x!=null?0:Math.random(); }
  pick(){ const N=this.W.nodes, nb=N[this.a].nb; if(!nb.length){ this.place(); return; }   // 走到死路（例如河邊）就換一個地方，不要卡住不動
    /* 家長 11-20 00:05：只在有建築的那一區走。有路通往建築區就一定走那邊（寧可回頭）；
       人已經在空地上，就往最近的建築走回去。 */
    let c; const inside=nb.filter(e=>nearLive(N[e.to]));
    if(inside.length){ const c2=inside.filter(e=>e.to!==this.prev); c=c2.length?c2:inside; }
    else { let m=nb[0], md=1e9; for(const e of nb){ const d=liveDist(N[e.to]); if(d<md){ md=d; m=e; } } c=[m]; }
    if(this.avoid){ const ok=c.filter(e=>!(!e.cross&&this.avoid(N[e.to].hex))); if(ok.length) c=ok; }   // 不沿著要避開的那一格走（過馬路可以）
    const an=this.anc(); if(an&&Math.hypot(N[this.a].x-an.x,N[this.a].z-an.z)>this.rad&&Math.random()<.85){ let m=null,md=1e9; for(const e of c){ const d=Math.hypot(N[e.to].x-an.x,N[e.to].z-an.z); if(d<md){ md=d; m=e; } } c=[m]; }
    const w=c.map(e=>!e.cross?1:e.cross.zebra?1.3:.4); let r=Math.random()*w.reduce((a,b)=>a+b,0), k=0; while(k<c.length-1&&(r-=w[k])>0) k++;
    this.edge=c[k]; this.b=c[k].to; }
  update(dt,rain){ const N=this.W.nodes, A=N[this.a], B=N[this.b], dx=B.x-A.x, dz=B.z-A.z, len=Math.hypot(dx,dz)||1, o=this.P.obj;
    if(this.wave>0) this.wave-=dt; else if(this.wait>0) this.wait-=dt; this.waveCD-=dt; if(this.hold>0) this.hold-=dt; if(this.faceT>0) this.faceT-=dt;
    const moving=this.wait<=0&&this.wave<=0&&!(this.hold>0)&&this.a!==this.b;   /* hold：停下來打招呼、聊天（11-27 A-0） */
    if(moving) this.t+=dt*this.speed/len;
    if(this.t>=1){ this.t=0; this.prev=this.a; this.a=this.b;
      if(liveDist(N[this.a])>LIVE_R*2){ this.place(); return this.update(0,rain); }          // 離城市太遠（離開畫面外）就直接挪回有建築的那一區
      this.pick(); if(!this.edge||!this.edge.cross) if(Math.random()<.18) this.wait=1+Math.random()*2.5; return this.update(0,rain); }
    const ux=dx/len, uz=dz/len, cross=this.edge&&this.edge.cross, side=cross?0:.05;
    let px=A.x+dx*this.t-uz*side, pz=A.z+dz*this.t+ux*side;
    if(this.out&&!cross&&A.hex){ const ox=px-A.hex.x, oz=pz-A.hex.z, l=Math.hypot(ox,oz)||1; px+=ox/l*this.out; pz+=oz/l*this.out; }   // 往馬路那一側偏，離建築遠一點
    o.position.set(px,cross?ROAD_Y:SW_Y,pz);
    let yaw=Math.atan2(ux,uz); if((this.wave>0||this.hold>0)&&this.face) yaw=Math.atan2(this.face.x-o.position.x,this.face.z-o.position.z);
    let d=yaw-o.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); o.rotation.y+=d*Math.min(1,dt*8);
    if(moving) this.ph+=dt*this.speed*25/this.scale;
    if(this.cheer>0) this.cheer-=dt;
    const st=this.st?{...this.st}:{}; if(!st.face&&this.faceT>0) st.face=this.faceV; if(this.faceForce) st.face=this.faceForce;   /* 11-27 A-0：送動作、表情給 A-1／A-2 */
    this.P.anim(dt,{walk:moving,ph:this.ph,wave:this.wave>0&&!(this.cheer>0),rain,cheer:this.cheer>0,...st}); }
}

/* ---------- 走路／開車的東西 ---------- */
class Mover{
  constructor(obj,nodes,{speed=.5,side=.32,allow=null,kind='walk',p=null}={}){ Object.assign(this,{obj,nodes,speed,side,allow,kind,p});
    const all=nodes.map((n,i)=>i).filter(i=>nodes[i].nb.size);
    let ok=all.filter(i=>this.okNode(i));                                           // 先找「有建築的區域＋自己的範圍」
    if(!ok.length) ok=all.filter(i=>!this.allow||this.allow(nodes[i]));             // 沒有就放寬成只看自己的範圍
    if(!ok.length) ok=all;                                                          // 再沒有就隨便一個（不然 this.a 會是 undefined）
    this.a=ok[Math.floor(Math.random()*ok.length)]; this.prev=-1; this.pick(); this.t=Math.random(); this.ph=Math.random()*9; this.wait=0; }
  okNode(i){ return (!this.allow||this.allow(this.nodes[i]))&&nearLive(this.nodes[i]); }
  pick(){ const me=this.nodes[this.a]; if(!me){ this.a=0; this.b=0; return; } const nb=[...me.nb]; if(!nb.length){ this.b=this.a; return; }
    let c; const inside=nb.filter(i=>this.okNode(i));                              // okNode 已經包含「在有建築的那一區」
    if(inside.length){ const c2=inside.filter(i=>i!==this.prev); c=c2.length?c2:inside; }
    else { let m=nb[0], md=1e9; for(const i of nb){ const d=liveDist(this.nodes[i]); if(d<md){ md=d; m=i; } } c=[m]; }
    this.b=c[Math.floor(Math.random()*c.length)]; }
  update(dt){ const A=this.nodes[this.a], B=this.nodes[this.b], dx=B.x-A.x, dz=B.z-A.z, len=Math.hypot(dx,dz)||1;
    if(this.wait>0){ this.wait-=dt; } else this.t+=dt*this.speed/len;
    if(this.t>=1){ this.t-=1; this.prev=this.a; this.a=this.b;
      if(liveDist(this.nodes[this.a])>LIVE_R*2){ const ok=this.nodes.map((n,i)=>i).filter(i=>this.okNode(i)&&this.nodes[i].nb.size); if(ok.length){ this.a=ok[Math.floor(Math.random()*ok.length)]; this.prev=-1; } }   // 開太遠就挪回城市
      this.pick(); if(this.kind==='walk'&&Math.random()<.25) this.wait=1+Math.random()*2; return this.update(0); }
    const ux=dx/len, uz=dz/len, x=A.x+dx*this.t+uz*-this.side, z=A.z+dz*this.t-ux*-this.side;
    this.obj.position.set(x,0,z); const yaw=Math.atan2(ux,uz); let d=yaw-this.obj.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); this.obj.rotation.y+=d*Math.min(1,dt*8);
  }
}

/* 公園的小動物：松鼠跑一小段→停下來東張西望甩尾巴；小鳥跳兩步→低頭啄→偶爾飛起來繞一圈再落地。晚上停著不動。
   a.x0,a.z0 是一開始的位置，a.r 是活動範圍，a.y0 是站的高度（停在長椅、路燈上的小鳥不走動） */
function animSmall(a,t){ const g=a.g; if(a.night) return;
  if(a.kind==='squirrel'){ const P=7, u=((t+a.ph*3)%P)/P, seg=Math.floor((t+a.ph*3)/P);
    const ang=seg*2.4+a.ph, tx=a.x0+Math.cos(ang)*a.r, tz=a.z0+Math.sin(ang)*a.r, px=a.x0+Math.cos(ang-2.4)*a.r, pz=a.z0+Math.sin(ang-2.4)*a.r;
    if(u<.35){ const v=u/.35; g.position.x=px+(tx-px)*v; g.position.z=pz+(tz-pz)*v; g.position.y=a.y0+Math.abs(Math.sin(v*Math.PI*6))*.06; g.rotation.y=-Math.atan2(tz-pz,tx-px); g.rotation.z=0; }
    else { g.position.x=tx; g.position.z=tz; g.position.y=a.y0; g.rotation.z=Math.sin(t*9)*(u>.6&&u<.7?.15:0); g.rotation.y+=Math.sin(t*1.7+a.ph)*.004; } }
  else { if(a.perch){ g.rotation.y=a.ph+Math.sin(t*.7)*.6; g.position.y=a.y0+Math.max(0,Math.sin(t*3+a.ph))*.01; return; }
    const P=12, u=((t+a.ph*5)%P)/P, seg=Math.floor((t+a.ph*5)/P), ang=seg*1.9+a.ph;
    const bx=a.x0+Math.cos(ang)*a.r*.6, bz=a.z0+Math.sin(ang)*a.r*.6;
    if(u<.75){ const hop=Math.floor(u*24), hx=Math.cos(hop*1.3+ang)*.08, hz=Math.sin(hop*1.3+ang)*.08;   // 地上跳跳、啄啄
      g.position.x=bx+hx; g.position.z=bz+hz; g.position.y=a.y0+Math.abs(Math.sin(u*24*Math.PI))*.035; g.rotation.y=-(hop*1.3+ang); g.rotation.z=(hop%3===0)?-.5:0; }
    else { const v=(u-.75)/.25, nx=a.x0+Math.cos(ang+1.9)*a.r*.6, nz=a.z0+Math.sin(ang+1.9)*a.r*.6;   // 飛起來繞一下，落到下一個地方
      g.position.x=bx+(nx-bx)*v; g.position.z=bz+(nz-bz)*v; g.position.y=a.y0+Math.sin(v*Math.PI)*1.1; g.rotation.y=-Math.atan2(nz-bz,nx-bx); g.rotation.z=0; } } }

/* ---------- 市長的話（家長 11-26 14:29）：分區的話太無聊 → 改成介紹城市發展，寓教於樂。
   城市裡蓋了什麼，市長就介紹它在真實城市裡做什麼、怎麼來的；偶爾說一句城市怎麼長大的。 */
const MAYOR_CITY={"hall": ["市政廳就像城市的大腦，市長和很多人在這裡一起做決定。", "真的城市裡，大家繳的稅會拿來蓋馬路、學校和公園。", "城市要蓋新的東西之前，會先畫好計畫，再一步一步完成。"], "mayor": ["市長是大家投票選出來的，過幾年還要再選一次。", "市長要常常到城市各地走走，聽聽大家需要什麼。"], "school": ["很久以前，很多小朋友沒有學校可以上，要在家幫忙工作。", "台灣的小朋友六歲就可以上小學，要讀六年。", "附近有學校，大家才會願意搬來住，城市就會慢慢長大。"], "library": ["圖書館的書是大家一起用的，借回家看完要記得還。", "世界上很早的圖書館，放的是刻在泥板上的字。", "圖書館的書會照號碼排好，才找得到想看的書。"], "power": ["發電廠把電送到每一家，電燈、冰箱和電視才會動。", "電可以用太陽、風、水來發，也可以燒煤和天然氣來發。", "一百多年前，很多人家裡還沒有電燈，晚上要點蠟燭。"], "water": ["自來水廠把河水或水庫的水洗乾淨，再用水管送到每一家。", "水要經過沉澱、過濾和消毒，才會變成乾淨的自來水。", "很久以前沒有自來水，大家要去井邊或河邊提水。"], "home": ["很多城市一開始，就是很多人搬到同一個地方住在一起。", "人住得越多，就需要越多商店、學校和馬路。", "城市裡的土地不夠用，所以會蓋很高的大樓，讓更多人住。"], "sewage": ["我們用過的髒水，會順著地下的水管流到污水處理廠。", "污水處理廠把髒水變乾淨，才會放回河裡和海裡。", "很久以前沒有下水道，城市很髒，大家很容易生病。"], "trash": ["垃圾車每天把垃圾收走，城市才會乾乾淨淨。", "台灣的垃圾車會放音樂，聽到音樂就要拿垃圾出來倒。", "寶特瓶、紙和鐵罐要做資源回收，可以再做成新的東西。"], "garden": ["菜園種的青菜會送到市場，再來到我們的餐桌上。", "種菜要有陽光、水和好的土，還要有耐心等它長大。", "以前城市旁邊都是農田，城市變大以後，農田就越來越少了。"], "ranch": ["乳牛每天都要擠牛奶，牛奶會送到工廠裝瓶。", "雞生的蛋、牛擠的奶，都是從牧場送到城市來的。"], "orchard": ["果樹要種好幾年才會開始結果，農夫要很有耐心。", "台灣是水果王國，有香蕉、芒果、鳳梨和好多水果。", "果園的水果採下來以後，會裝箱用卡車送到市場。"], "tea": ["台灣的茶很有名，很多外國人都喜歡喝。", "茶園常常種在山坡上，因為那裡涼涼的，常常有霧。", "採茶的時候，只摘最上面最嫩的葉子。"], "breakfast": ["台灣的早餐店有蛋餅、饅頭、三明治和豆漿。", "早餐店很早就開門，讓大家吃飽了再去上學、上班。"], "bakery": ["麵包是用麵粉、水和酵母做的，酵母會讓麵團膨起來。", "麵包師傅天還沒亮就要起床烤麵包。"], "icecream": ["很久以前沒有冰箱，冰淇淋是很難得的點心。", "冰淇淋要一邊攪拌一邊冷凍，吃起來才會軟軟綿綿的。"], "burger": ["披薩是從義大利來的，漢堡是在美國變得很有名的。", "城市裡有世界各地的食物，因為有很多不同地方的人住在一起。"], "japanese": ["壽司和拉麵都是從日本來的料理。", "台灣有很多日本料理店，因為台灣和日本離得很近。"], "nightmarket": ["夜市是台灣很特別的地方，晚上很多攤子一起賣小吃。", "很多夜市是從廟口或市場旁邊慢慢變熱鬧的。"], "market": ["很多城市一開始，就是大家來市場買賣東西慢慢變熱鬧的。", "市場一大早就很熱鬧，菜、魚和肉都很新鮮。"], "bank": ["銀行幫大家保管錢，把錢存起來還可以拿到一點利息。", "很久以前還沒有錢的時候，大家用東西交換東西。"], "gym": ["運動中心有游泳池、網球場和棒球場，大家都可以來運動。", "常常運動，身體會更健康，也會交到好朋友。", "棒球比賽的時候，全城的人都會一起來加油。"], "art": ["美術館收藏很多畫和雕塑，讓大家都可以來看。", "美術館會好好保護很老的作品，讓以後的人也看得到。"], "observatory": ["天文台要蓋在比較暗、比較高的地方，才看得清楚星星。", "城市的燈太亮，晚上就看不到星星，這叫做光害。"], "hospital": ["醫院有很多醫生和護理師，白天晚上都有人照顧病人。", "醫院要蓋在交通方便的地方，救護車才可以很快到。"], "clinic": ["小感冒可以先去家附近的診所看醫生。", "診所離家近，大家生病的時候不用跑很遠。"], "conv": ["台灣的便利商店很多，走幾步路就有一家。", "很多便利商店整天都開著，半夜也買得到東西。"], "park": ["城市裡要有公園，讓大家可以散步、運動和呼吸新鮮空氣。", "公園的大樹可以讓城市變涼快，還可以讓小鳥住。"], "firestation": ["發生火災要打一一九，消防車就會趕快來。", "消防站要分散在城市各地，才可以很快到達每個地方。", "消防員接到電話，要很快穿好衣服出發去救火。"], "policebox": ["警察會幫忙指揮交通，還會保護大家的安全。", "迷路或遇到危險，可以去找警察幫忙，電話是一一零。"], "temple": ["台灣很多老街和市場，都是從廟的旁邊開始熱鬧起來的。", "以前廟前面的廣場，是大家聚在一起聊天、看戲的地方。"], "stationery": ["文具店常常開在學校旁邊，方便小朋友買鉛筆和本子。"], "pier": ["很多城市一開始都蓋在海邊或河邊，因為坐船運東西很方便。", "漁船從碼頭出海捕魚，再把魚送到市場。", "大大的貨櫃船，會把東西從世界各地運到港口。"], "train": ["火車一次可以載很多人和很多貨，城市和城市之間就變近了。", "有了火車站，車站附近就會開很多商店，慢慢變熱鬧。", "一百多年前，台灣就已經有火車了。"]};
const MAYOR_GROW=["城市通常是從有水、有路的地方開始長大的。", "先有水、電和馬路，大家才住得舒服。", "城市變大以後，也要留一些地方給公園和大樹。", "城市裡的東西都連在一起，少了一樣，大家都會不方便。", "好的城市，小朋友、老人和每個人都住得很開心。"];
const pickA=a=>a[Math.floor(Math.random()*a.length)];
function mayorLines(B){ const built=[...new Set(Object.values(B).map(r=>r.t))].filter(t=>MAYOR_CITY[t]); if(!built.length) return MAYOR_GROW;
  return MAYOR_CITY[pickA(built)]; }
/* Avery 的話（家長 11-20 23:12：要再補充不同的選項） */
const AVERY_MORE=['我最喜歡跟市長一起散步！','你看！這是我們的城市耶！','我想要吃冰淇淋！','今天要去公園玩嗎？','我會幫忙照顧小動物喔！','晚上的星星好多好漂亮！',
  '我長大也要當市長！','走路要走人行道，過馬路要小心喔！','我們的城市每天都變大一點點！','下雨天要記得帶雨傘喔！','我數到十，你要來找我喔！','你最喜歡哪一棟建築？','噓，小鳥在唱歌！'];

export function initLife(ctx){
  const { scene, hexes, R, riverX, camera, sun, hemi, sea, fog, UI, curB, TM, tagsEl } = ctx;
  const nodes=buildRoads(hexes,R,riverX), root=new THREE.Group(); scene.add(root);
  const movers=[], people=[]; let mayor=null, avery=null, ready=false;
  const WALK=buildWalks(hexes,R,riverX), walkers=[];
  const hexOf=pid=>hexes.find(h=>h.id===String(pid).slice(0,7));
  /* 11-25 速度：城市沒變的時候，不用每一格都重新整理「蓋了哪些建築」 */
  const ver=ctx.ver||(()=>NaN); let builtVer=-1, builtSet=new Set();
  const built=t=>{ const v=ver(); if(v!==builtVer||v!==v){ builtVer=v; builtSet=new Set(Object.values(curB()).map(r=>r.t)); } return builtSet.has(t); };
  const streetEdges=nodes.flatMap((n,a)=>[...n.nb].filter(b=>b>a).map(b=>{
    const end=nodes[b];
    return {a,b,x:(n.x+end.x)/2,z:(n.z+end.z)/2};
  }));
  let streetVer;
  function syncCampusStreets(){
    const version=ver();
    if(streetVer===version) return;
    streetVer=version;
    const centers=[];
    for(const [pid,rec] of Object.entries(curB())){
      if((rec.t!=='dino'&&rec.t!=='gym'&&rec.t!=='zoo')||!rec.occ?.[0]) continue;
      const a=hexOf(pid), b=hexOf(rec.occ[0]);
      if(a&&b) centers.push([(a.x+b.x)/2,(a.z+b.z)/2]);
    }
    for(const {a,b,x,z} of streetEdges){
      if(centers.some(([cx,cz])=>Math.hypot(cx-x,cz-z)<.08)){
        nodes[a].nb.delete(b);
        nodes[b].nb.delete(a);
      }else{
        nodes[a].nb.add(b);
        nodes[b].nb.add(a);
      }
    }
    for(const mover of movers){
      if(nodes[mover.a].nb.has(mover.b)) continue;
      if(mover.t>.5) mover.a=mover.b;
      mover.prev=-1;
      mover.t=0;
      mover.pick();
    }
  }
  const nearType=t=>n=>[...n.hex].some(k=>k===t);
  /* 載入 */
  (async()=>{
    const [C1,C2,C3,C4,C5,KD,KG,KT,KA]=await Promise.all([
      'models/life/kay_sedan.glb','models/life/kay_hatchback.glb','models/life/kay_stationwagon.glb','models/life/kay_taxi.glb','models/life/kay_police.glb',
      'models/car3/delivery.glb','models/car3/garbage-truck.glb','models/car3/tractor.glb','models/car3/ambulance.glb'].map(p=>glb(p).catch(e=>{ console.warn(p,e); return null; })));
    // 車：一般車沿路開（靠右）；工作車有自己的範圍
    const car=(gl,len,opt={})=>{ if(!gl) return; const o=gl.scene.clone(true); o.traverse(m=>{ if(m.isMesh){ m.castShadow=false; if(opt.soft){ m.material=m.material.clone(); m.material.color.lerp(new THREE.Color('#ffffff'),.12); } } });
      const w=new THREE.Group(), inner=new THREE.Group(); inner.add(o); w.add(inner); const b=new THREE.Box3().setFromObject(o), s=b.getSize(new THREE.Vector3()), k=len/Math.max(s.x,s.z);
      inner.scale.setScalar(k); inner.position.set(-(b.min.x+b.max.x)/2*k,-b.min.y*k,-(b.min.z+b.max.z)/2*k); if(s.x>s.z) inner.rotation.y=opt.yaw||Math.PI/2; else inner.rotation.y=opt.yaw0||0;
      root.add(w); const m=new Mover(w,nodes,{speed:opt.speed||1.4,side:.4,kind:'car',allow:opt.allow});   /* 雙向道：車子靠一邊的車道開 */ m.need=opt.need; movers.push(m); return m; };
    for(const [c,sp] of [[C1,1.5],[C2,1.3],[C3,1.4],[C4,1.6],]) car(c,.95,{speed:sp});
    car(C5,.95,{speed:1.5,need:'police'});   // 警車：有警察局才出現
    car(KD,1.0,{speed:1.2,soft:1,need:'market'}); car(KG,1.05,{speed:.9,soft:1,need:'trash'}); car(KT,.8,{speed:.6,soft:1,allow:nearType('farm'),need:'garden'}); // 拖拉機：有菜園才出現；垃圾車要垃圾處理中心、救護車要醫院、送貨車要市場
    car(KA,1.0,{speed:1.8,soft:1,need:'hospital'});   /* 11-25：救護車原本被寫在註解裡，一直沒出現 */
    ready=true;
  })();

  /* ---------- 人：市長、Avery、居民（家長 2026-11-18） ---------- */
  const tagOf=txt=>{ const t=document.createElement('div'); t.className='mtag'; t.textContent=txt; tagsEl.appendChild(t); return t; };
  const hexAnchor=t=>()=>{ const B=curB(), pid=Object.keys(B).find(p=>B[p].t===t), h=pid&&hexOf(pid); return h?{x:h.x,z:h.z}:null; };
  /* Avery 不沿著市場那一格走（家長 11-20 23:12：太靠近市場會卡進建築裡） */
  const marketHex=h=>{ if(!h) return false; const B=curB(); return Object.keys(B).some(p=>B[p].t==='market'&&String(p).slice(0,7)===h.id); };
  function addPerson(P,opt){ root.add(P.obj); P.obj.traverse(m=>{ if(m.isMesh) m.castShadow=false; });   /* 家長 11-25 23:10：會動的東西影子會閃 → 小人、車子都不投影子 */ const w=new Walker(P,WALK,opt); P.w=w; people.push(P); walkers.push(w); return w; }
  try{ const M=makeMayor(); M.tag=tagOf('市長'); mayor=addPerson(M,{speed:.2,anchor:hexAnchor('hall'),rad:6,scale:.56}); mayor.trail=[]; }catch(e){ console.warn('mayor',e); }
  try{ const A=makeAvery(); avery=addPerson(A,{speed:.18,anchor:hexAnchor('mayor'),rad:5,scale:.45,out:.12,avoid:marketHex}); avery.mode='home'; avery.modeT=20+Math.random()*15; }catch(e){ console.warn('avery',e); }
  /* ---------- 移交 11-26：市長和 Avery 一起到戶外休息（取自 courtyard-preview-v2，接上真的城市道路） ----------
     市長的家 Lv5：沿人行道走到門口 → 走進左邊涼亭 → 一起坐白色雙人石椅 → 兩人坐定後 10 秒 → 平滑起身 → 繞噴水池一圈 → 回門口人行道，接回原本的路。
     市政廳 Lv2、3、5：坐廣場長椅 10 秒 → 在廣場走一走（Lv5 繞噴水池）→ 回人行道。不進室內。
     下面的座標都是建築自己的座標（大門朝 +z），用那棟建築的群組換算成世界座標；路線已用障礙物圖檢查過，避開柱子、花圃、水池、樹。 */
  const COURT={
    mayor:{ ok:lv=>lv>=5, seatTop:()=>.315,
      ground:(x,z)=>Math.hypot(x+2.1,z-1.6)<.62?.13:Math.abs(x)<.32&&z>-.1&&z<2.85?.1:.02,   // 院子地面 .02、涼亭地板 .13、大門前步道 .1（實測）
      seats:()=>[[-2.27,1.48],[-1.93,1.48]], yaw:0,
      /* 西邊座位走外側、東邊座位走內側，兩人並排不交叉 */
      enter:[[[-.9,3.2],[-1.9,2.62],[-2.24,2.24],[-2.27,2.04]],[[-.72,2.95],[-1.72,2.45],[-1.96,2.24],[-1.93,2.04]]],
      leave:[[[-2.27,2.04],[-2.24,2.3],[-1.9,2.62]],[[-1.93,2.04],[-1.96,2.24],[-1.72,2.45]]],
      walk:()=>{ const r=1.2, a0=Math.atan2(2.55-2,-1.8), pts=[]; for(let k=0;k<=56;k++){ const a=a0-k*(2*Math.PI+a0-Math.PI/2)/56; pts.push([r*Math.cos(a),2+r*Math.sin(a)]); } return pts; } },
    hall:{ ok:lv=>lv===2||lv===3||lv===5, seatTop:()=>.21,
      ground:()=>.045,   // 廣場石板（實測 .03～.08）
      bench:lv=>lv===2?[-1.2,1.95,0]:lv===3?[-1.1,1.75,0]:[-1.55,2.2,.35],
      walk:lv=>{ if(lv===5){ /* 噴水池後面離柱廊台階只剩 0.2，過不去 → 只走前面的弧：從左邊繞到右前方，再往右前方出去（不走回頭路） */ const pts=[]; for(let k=0;k<=20;k++){ const a=Math.PI-k*(Math.PI*.8)/20; pts.push([1.0*Math.cos(a),1.82+.9*Math.sin(a)]); } pts.push([1.05,2.75]); return pts; }
        return [[-.6,2.6],[.6,2.6],[1.2,2.8]]; } } };
  /* 坐下時身體離座面的高度（V2 量的：座面頂 − .125） */
  const SIT_DROP=.125;
  const CS=(k,lv)=>{ const C=COURT[k]; if(C.seats) return {seats:C.seats(),yaw:C.yaw};
    const [bx,bz,r]=C.bench(lv), ux=Math.cos(r), uz=-Math.sin(r), fx=Math.sin(r), fz=Math.cos(r);
    const seats=[-.14,.14].map(o=>[bx+ux*o,bz+uz*o]);
    const ap=seats.map(([x,z])=>[x+fx*.45,z+fz*.45]);   /* 西邊座位的人先往外繞（z 大一點），兩人並排不擦撞 */
    return {seats,yaw:r,enter:[[[ap[0][0]*.55,3.35],ap[0]],[[(ap[1][0]-.2)/2,(ap[1][1]+3.25)/2],ap[1]]],leave:seats.map(([x,z])=>[[x+fx*.45,z+fz*.45]])}; };
  L.blockers.length=0; if(mayor) L.blockers.push(mayor.P.obj.position); if(avery) L.blockers.push(avery.P.obj.position);
  let VISIT=null, visitT=35+Math.random()*20, visitLast='';
  const pidOf=t=>{ const B=curB(); return Object.keys(B).find(p=>B[p].t===t); };
  /* 人行道的最短路（Dijkstra）：從 target 往外算距離，人從附近的點接上去 */
  function walkPath(from,target){ const N=WALK.nodes, n=N.length, dist=new Float64Array(n).fill(1e9), nxt=new Int32Array(n).fill(-1), done=new Uint8Array(n);
    dist[target]=0; for(;;){ let u=-1, m=1e9; for(let i=0;i<n;i++) if(!done[i]&&dist[i]<m){ m=dist[i]; u=i; } if(u<0) break; done[u]=1;
      for(const e of N[u].nb){ const v=e.to, d=m+Math.hypot(N[u].x-N[v].x,N[u].z-N[v].z); if(d<dist[v]){ dist[v]=d; nxt[v]=u; } } }
    let best=-1, bd=1e9; for(let i=0;i<n;i++){ if(dist[i]>=1e9) continue; const d=Math.hypot(N[i].x-from.x,N[i].z-from.z); if(d>2.6) continue; const c=d+dist[i]; if(c<bd){ bd=c; best=i; } }
    if(best<0) return null; const out=[]; for(let i=best;i>=0;i=nxt[i]){ out.push(new THREE.Vector3(N[i].x,SW_Y,N[i].z)); if(i===target) break; } return out; }
  /* ---------- 11-27 A-0：人物進建築（visit.js；路線檔在 visits/） ---------- */
  const VIS=createVisits({ curB, lotGroup:pid=>ctx.lotGroup&&ctx.lotGroup(pid), WALK, walkPath, walkers, hexOf, SW_Y, root,
    isVip:w=>w===mayor||w===avery, night:()=>night(), rain:()=>W.kind==='rain', vipDone:w=>pairDone(w) });
  /* ---------- 11-27 家長 23:11：市長和 Avery 一起去（冰淇淋店、公園、廟、市長的家…）、在路上停下來聊天或跳舞 ---------- */
  let soloT=30+Math.random()*30, tripT=25+Math.random()*20, duo=null, duoT=40+Math.random()*20, duoForce=null;
  function joinMayor(){ const ap=avery.P.obj.position, mp=mayor.P.obj.position; avery.mode='follow'; avery.modeT=25+Math.random()*15; avery.anchor=()=>mayor.P.obj.position; avery.rad=.3;
    mayor.trail=[{x:ap.x,y:ap.y,z:ap.z,r:0},{x:mp.x,y:mp.y,z:mp.z,r:0}]; }
  function pairDone(w){ if(w===avery){ if(mayor.vis) avery.mode='wait'; else joinMayor(); } else if(w===mayor&&avery.mode==='wait') joinMayor(); }
  function startTrip(pid){ if(!mayor||!avery||VISIT||duo||mayor.vis||avery.vis) return false; if(!pid&&avery.mode!=='follow') return false;
    const g=VIS.startPair(mayor,avery,pid); if(g){ avery.mode='trip'; avery.modeT=1e9; } return g; }
  /* Avery 不在身邊時：市長偶爾自己去市政廳辦公、在門口跟居民握手 */
  function soloTick(dt){ if(VISIT||duo||mayor.vis||avery.mode==='follow'||avery.mode==='trip'||avery.mode==='wait') return; soloT-=dt; if(soloT>0) return; soloT=50+Math.random()*30; VIS.startSolo(mayor); }
  function tripTick(dt){ if(VISIT||duo||mayor.vis||avery.vis||avery.mode!=='follow') return; tripT-=dt; if(tripT>0) return; tripT=45+Math.random()*30; startTrip(); }
  function duoTick(dt,rain){
    if(!duo){ if(VISIT||mayor.vis||avery.vis||avery.mode!=='follow'||rain||mayor.wave>0||(mayor.edge&&mayor.edge.cross)) return; duoT-=dt; if(duoT>0) return; duoT=40+Math.random()*20;
      if(avery.P.obj.position.distanceTo(mayor.P.obj.position)>1.3) return;
      const mp=mayor.P.obj.position, h=WALK.nodes[mayor.a]&&WALK.nodes[mayor.a].hex; let dx=0, dz=1; if(h){ dx=mp.x-h.x; dz=mp.z-h.z; const l=Math.hypot(dx,dz)||1; dx/=l; dz/=l; }
      duo={kind:duoForce||(Math.random()<.5?'chat':'dance'), t:0, dur:6+Math.random()*4, spot:new THREE.Vector3(mp.x+dx*.45,mp.y,mp.z+dz*.45), laugh:Math.random()<.5?mayor:avery}; mayor.hold=duo.dur+.3; return; }
    duo.t+=dt; const end=duo.t>=duo.dur||rain||VISIT||mayor.vis;
    if(end){ duo=null; mayor.hold=0; mayor.st=null; mayor.face=null; avery.st=null; return; }
    const mp=mayor.P.obj.position, ap=avery.P.obj.position; mayor.hold=Math.max(mayor.hold,.2); mayor.face=ap.clone();
    for(const [me,ot] of [[mayor,avery],[avery,mayor]]){ const look={x:ot.P.obj.position.x,z:ot.P.obj.position.z};
      if(duo.kind==='dance') me.st={act:'dance',look,face:'laugh'};
      else { const spk=Math.floor(duo.t/3.5)%2===0?mayor:avery; me.st={act:'chat',talk:spk===me,look,face:'smile'}; if(duo.t>duo.dur-1.5&&duo.laugh===me){ me.st.face='laugh'; me.st.cover=true; } } } }
  /* Avery 在聊天、跳舞時：走到市長靠馬路那一側，面向市長 */
  function averyDuo(dt,raining){ const ap=avery.P.obj.position, q=duo.spot, dx=q.x-ap.x, dz=q.z-ap.z, d=Math.hypot(dx,dz), o=avery.P.obj; let moved=0;
    if(d>.01){ const st=Math.min(d,dt*.35); ap.x+=dx/d*st; ap.z+=dz/d*st; moved=st; }
    const mp=mayor.P.obj.position, yaw=moved>dt*.02?Math.atan2(dx,dz):Math.atan2(mp.x-ap.x,mp.z-ap.z), dl=yaw-o.rotation.y; o.rotation.y+=Math.atan2(Math.sin(dl),Math.cos(dl))*(1-Math.exp(-dt*8));
    if(moved>dt*.02){ avery.ph+=moved*25/avery.scale; avery.P.anim(dt,{walk:true,ph:avery.ph,wave:false,rain:raining}); }
    else avery.P.anim(dt,{walk:false,ph:avery.ph,wave:false,rain:raining,...(avery.st||{})}); }
  function startVisit(kind){ if(VISIT||!mayor||!avery||mayor.vis||avery.vis||duo) return false; const B=curB(), list=kind?[kind]:Object.keys(COURT);
    const ok=list.filter(k=>{ const p=pidOf(k); return p&&COURT[k].ok(B[p].lv)&&ctx.lotGroup&&ctx.lotGroup(p); });
    if(!ok.length) return false; const k=ok.length>1?ok.find(x=>x!==visitLast)||ok[0]:ok[0], pid=pidOf(k), g=ctx.lotGroup(pid), lv=B[pid].lv, h=hexOf(pid);
    if(!h||!h.walk) return false; g.updateMatrixWorld(true);
    const W=(x,z,y)=>g.localToWorld(new THREE.Vector3(x,y==null?COURT[k].ground(x,z):y,z));
    const mp=mayor.P.obj.position, fronts=[h.walk[4],h.walk[5]].filter(i=>!WALK.nodes[i].dead);
    let best=null; for(const f of fronts){ const p=walkPath(mp,f); if(p&&(!best||p.length<best.p.length)) best={f,p}; }
    if(!best) return false;
    const node=WALK.nodes[best.f], west=g.worldToLocal(new THREE.Vector3(node.x,0,node.z)).x<0;
    /* 市長站在來的那一側、往院子裡一步；Avery 走過去站在人行道另一側（兩點差 .25，經過時不會撞到）。
       這樣市長一定走內側、坐東邊；起身後市長往水池走，不會穿過 Avery */
    const Fm=west?[-.2,3.25]:[.2,3.25], Fa=west?[.2,3.5]:[-.2,3.5];
    /* Avery 離得遠：從另一邊的路口走過來，直接到她那一側的位置，不會和市長在人行道上迎面相撞 */
    const ap=avery.P.obj.position, other=fronts.find(f=>f!==best.f), pa=(other!=null&&walkPath(ap,other))||walkPath(ap,best.f)||[];
    VISIT={kind:k,pid,g,lv,W,h,node:best.f,phase:'go',t:0,rest:0,F:[Fm,Fa],
      route:[[mp.clone(),...best.p,W(...Fm,SW_Y)],[ap.clone(),...pa,W(...Fa,SW_Y)]].map(pts=>({pts,i:1}))};
    /* Avery 本來就在市長旁邊：照原本的平滑跟隨走在後面，不要兩人走同一條線疊在一起 */
    const tag=ap.distanceTo(mp)<4; if(tag){ VISIT.route[1]={pts:[ap.clone()],i:1}; VISIT.aveFollow=true; mayor.trail=[{x:ap.x,y:ap.y,z:ap.z,r:0},{x:mp.x,y:mp.y,z:mp.z,r:0}]; avery.mode='follow'; avery.modeT=1e9; }
    else avery.mode='visit';
    mayor.wave=0; visitLast=k; return true; }
  function endVisit(){ const v=VISIT; VISIT=null; if(!v) return; for(const w of [mayor,avery]) w.P.sitting=false;
    const p=mayor.P.obj.position; mayor.place(p.x,p.z);
    avery.mode='follow'; avery.modeT=25+Math.random()*15; avery.anchor=()=>mayor.P.obj.position; avery.rad=.3;
    visitT=100+Math.random()*60; }
  function cancelVisit(){ if(!VISIT) return; const v=VISIT; VISIT=null; for(const w of [mayor,avery]) w.P.sitting=false; const mp=mayor.P.obj.position, ap=avery.P.obj.position; mayor.place(mp.x,mp.z); avery.mode='home'; avery.anchor=hexAnchor('mayor'); avery.rad=5; avery.place(ap.x,ap.z);   /* 從原地最近的路口接回去，不瞬間移動 */ visitT=60+Math.random()*40; }
  /* 沿著一串點走（同一段路兩人同時出發、同時到，並排不脫節） */
  const segLen=r=>{ const a=r.pts[r.i-1], b=r.pts[r.i]; return a&&b?Math.hypot(b.x-a.x,b.z-a.z):0; };
  function moveOn(w,r,step){ const o=w.P.obj, p=o.position; let left=step, moved=0;
    while(left>1e-6&&r.i<r.pts.length){ const q=r.pts[r.i], dx=q.x-p.x, dz=q.z-p.z, d=Math.hypot(dx,dz);
      if(d<=left){ p.x=q.x; p.z=q.z; p.y=q.y; left-=d; moved+=d; r.i++; }
      else { const f=left/d; p.x+=dx*f; p.z+=dz*f; p.y+=(q.y-p.y)*f; moved+=left; left=0; } }
    return moved; }
  function turnTo(o,yaw,dt){ const d=Math.atan2(Math.sin(yaw-o.rotation.y),Math.cos(yaw-o.rotation.y)); o.rotation.y+=d*(1-Math.exp(-dt*8)); }
  function stepActor(w,r,step,dt,sit=false){ const o=w.P.obj, x0=o.position.x, z0=o.position.z, moved=r?moveOn(w,r,step):0;
    if(moved>1e-5){ turnTo(o,Math.atan2(o.position.x-x0,o.position.z-z0),dt); w.ph+=moved*25/w.scale; }
    w.P.anim(dt,{walk:moved>dt*.02,ph:w.ph,wave:false,rain:W.kind==='rain',sit}); return moved; }
  const doneR=r=>!r||r.i>=r.pts.length;
  /* 兩人同步：每一段用比較長那個人的長度決定時間 */
  function pairStep(dt,speed){ const [rm,ra]=VISIT.route; const L1=Math.max(segLen(rm),segLen(ra),.001), k=dt*speed/L1;
    stepActor(mayor,rm,segLen(rm)*k+(doneR(ra)?dt*speed:0),dt); stepActor(avery,ra,segLen(ra)*k+(doneR(rm)?dt*speed:0),dt); }
  function visitTick(dt){
    if(!VISIT){ if(!paused){ visitT-=dt; if(visitT<0){ if(!startVisit()) visitT=40; } } return; }
    const v=VISIT; v.t+=dt;
    if(!curB()[v.pid]||ctx.lotGroup(v.pid)!==v.g||!COURT[v.kind].ok(curB()[v.pid].lv)){ cancelVisit(); return; }   // 建築被拆、重畫或降級：回到平常
    const C=COURT[v.kind], cs=CS(v.kind,v.lv), yawW=v.g.rotation.y+cs.yaw, seatY=C.seatTop(v.lv)-SIT_DROP;
    const W=v.W, ent=C.enter||cs.enter, lea=C.leave||cs.leave;
    if(v.phase==='go'){   // 各自沿人行道走到門口；先到的人等另一個
      const [rm]=v.route; stepActor(mayor,rm,mayor.speed*dt,dt);
      if(v.aveFollow&&doneR(rm)){ v.aveFollow=false; avery.mode='visit'; v.route[1]={pts:[avery.P.obj.position.clone(),W(...v.F[1],SW_Y)],i:1}; }
      const ra=v.route[1]; let yieldA=false;
      if(!v.aveFollow&&!doneR(ra)){ const mp=mayor.P.obj.position, ap=avery.P.obj.position, q=rm.pts[rm.i];   // 走到市長後面太近：Avery 先停一下
        if(q&&Math.hypot(mp.x-ap.x,mp.z-ap.z)<.5&&(q.x-mp.x)*(mp.x-ap.x)+(q.z-mp.z)*(mp.z-ap.z)>0) yieldA=true; }
      if(!v.aveFollow) stepActor(avery,ra,yieldA?0:.27*dt,dt);   // Avery 從遠處趕過來，走快一點
      if(doneR(rm)) turnTo(mayor.P.obj,v.g.rotation.y+Math.PI,dt); if(!v.aveFollow&&doneR(ra)) turnTo(avery.P.obj,v.g.rotation.y+Math.PI,dt);
      if(!v.aveFollow&&doneR(rm)&&doneR(ra)){ /* 站在人行道上（離房子遠）的人走外側、坐西邊；站進院子一步的人走內側、坐東邊 → 兩條路不交叉 */ const zm=v.g.worldToLocal(mayor.P.obj.position.clone()).z, za=v.g.worldToLocal(avery.P.obj.position.clone()).z;
        v.seatOf=zm>=za?[0,1]:[1,0];
        v.route=[mayor,avery].map((w,i)=>{ const s=v.seatOf[i]; return {pts:[w.P.obj.position.clone(),...ent[s].map(([x,z])=>W(x,z)),W(...cs.seats[s],C.ground(...cs.seats[s]))],i:1}; });
        v.phase='enter'; }
      else if(v.t>200) cancelVisit();
      return; }
    if(v.phase==='enter'){ pairStep(dt,.24); if(doneR(v.route[0])&&doneR(v.route[1])){ v.phase='sit'; v.rest=0; mayor.P.react?.('微笑',14); avery.P.react?.('微笑',14); } return; }
    if(v.phase==='sit'||v.phase==='stand'){ const sitting=v.phase==='sit';
      for(const [i,w] of [[0,mayor],[1,avery]]){ const o=w.P.obj, s=v.seatOf[i], st=cs.seats[s], g0=W(st[0],st[1]).y, k=w.P.sitK||0;
        turnTo(o,yawW,dt); o.position.y=g0+(v.g.localToWorld(new THREE.Vector3(0,seatY,0)).y-g0)*k; w.P.sitting=sitting; stepActor(w,null,0,dt,sitting); }
      const kM=mayor.P.sitK||0, kA=avery.P.sitK||0;
      if(sitting){ if(kM>=1&&kA>=1){ v.rest+=dt; if(v.rest>=10){ v.phase='stand'; } } }   // 兩人都坐定才開始算 10 秒
      else if(kM<=0&&kA<=0){   // 完全站起來才開始走
        v.route=[mayor,avery].map((w,i)=>{ const s=v.seatOf[i]; return {pts:[w.P.obj.position.clone(),...lea[s].map(([x,z])=>W(x,z))],i:1}; }); v.phase='leave'; }
      return; }
    if(v.phase==='leave'){ pairStep(dt,.24); if(doneR(v.route[0])&&doneR(v.route[1])){
        /* 散步：市長走前面，Avery 跟在後面（用原本平滑跟隨），走完回門口人行道，接回原本的路 */
        const loc=C.walk(v.lv), loop=loc.map(([x,z])=>W(x,z)), fr=[v.h.walk[4],v.h.walk[5]].filter(i=>!WALK.nodes[i].dead), east=fr.find(i=>v.g.worldToLocal(new THREE.Vector3(WALK.nodes[i].x,0,WALK.nodes[i].z)).x>0);
        const ex=east!=null?east:v.node, node=WALK.nodes[ex];   /* 散步都是往右前方結束，從右邊路口接回去（不走回頭路，Avery 跟在後面才不會撞到） */
        const sx=Math.sign(v.g.worldToLocal(new THREE.Vector3(node.x,0,node.z)).x)||1, lx=loc[loc.length-1][0];   /* 直接朝要接回去的路口走，不走回頭路（Avery 跟在後面，回頭會撞到） */
        v.route=[{pts:[mayor.P.obj.position.clone(),...loop,W(sx>0?Math.max(.6,lx):Math.min(-.6,lx),3.3),new THREE.Vector3(node.x,SW_Y,node.z)],i:1}];
        const ap=avery.P.obj.position, mp=mayor.P.obj.position; mayor.trail=[{x:ap.x,y:ap.y,z:ap.z,r:0},{x:mp.x,y:mp.y,z:mp.z,r:0}];
        avery.mode='follow'; avery.modeT=1e9; v.phase='walk'; }
      return; }
    if(v.phase==='walk'){ stepActor(mayor,v.route[0],.22*dt,dt); if(doneR(v.route[0])) endVisit(); }
  }
  /* 蓋好、升級：兩人原地開心慶祝（腳不離地） */
  function cheer(){ for(const w of [mayor,avery]){ if(!w||(VISIT&&VISIT.phase!=='go')) continue; w.cheer=2.6; w.wait=Math.max(w.wait||0,2.6); w.P.react?.('開心大笑',2.6); } }
  addEventListener('wc-cheer',cheer);
  /* 居民：人數跟著城市長大（2＋所有建築等級加起來，最少 3、最多 24；11-25 速度優化從 30 降到 24）；有工作的人待在自己的建築附近 */
  /* 家長 11-27：斗笠不再當一般居民配件；菜園、果園、茶園改成農夫，牧場改成牧場主人，學校 Lv2 多一位老師（GitHub 職業 v7） */
  const ROLES={trash:['清潔隊員'],policebox:['警察'],police:['警察'],firestation:['消防員'],firedept:['消防員'],clinic:['醫生','護士'],hospital:['醫生','護士'],
    breakfast:['廚師'],bakery:['廚師'],icecream:['廚師'],burger:['廚師'],japanese:['廚師'],orchard:['農夫'],tea:['農夫'],train:['列車長'],pier:['船長'],art:['畫家'],observatory:['太空人'],bank:['背包'],conv:['無'],stationery:['無'],market:['菜籃','廚師'],garden:['農夫'],ranch:['牧場主人'],school:['小黃帽＋書包','老師','小黃帽＋書包'],home:['郵差','嬰兒車'],power:['建築工人'],water:['建築工人'],sewage:['建築工人'],library:['背包']};
  const KIDS=['小孩','小女孩'], ADULTS=['阿姨','叔叔','阿姨','叔叔','奶奶','爺爺'];
  function roster(){ const B=curB(), out=[]; let sum=0;
    for(const [pid,r] of Object.entries(B)){ sum+=r.lv; const h=hexOf(pid); if(!h) continue; const roles=r.t==='hall'?(r.lv>=3?['公車司機']:[]):(ROLES[r.t]||[]);
      roles.forEach((role,j)=>{ if(j===0||r.lv>=2) out.push({key:pid+':'+role+':'+j,role,an:{x:h.x,z:h.z}}); }); }
    const n=Math.max(3,Math.min(24,2+sum)); return {n,roles:out.slice(0,n-1)}; }
  /* 11-25 速度：鏡頭拉很遠看全城時，居民小到看不清楚影子，先不畫居民的影子；拉近就恢復 */
  let farView=false;
  const setShadow=(P,on)=>P.obj.traverse(m=>{ if(m.isMesh) m.castShadow=on; });
  function makeResident(role,an){ let kind, acc=role||'無';
    if(role==='小黃帽＋書包') kind=pickA(KIDS);
    else if(['清潔隊員','警察','消防員','醫生','護士','郵差','公車司機','建築工人','廚師','太空人','船長','列車長','畫家','農夫','牧場主人','老師'].includes(role)) kind=pickA(['阿姨','叔叔']);
    else if(role) kind=pickA(role==='嬰兒車'?['阿姨','叔叔']:ADULTS);
    else { kind=Math.random()<.3?pickA(KIDS):pickA(ADULTS); const B=curB(), hasSchool=Object.values(B).some(r=>r.t==='school');
      const k=Math.random(); acc=KIDS.includes(kind)?(hasSchool&&k<.35?'小黃帽＋書包':k<.5?'氣球':k<.62?'遛狗':k<.72?'領巾':'無'):(k<.12?'遛狗':k<.22?'領巾':k<.3?'背包':(kind==='奶奶'||kind==='爺爺')&&k<.45?'拐杖':'無'); }
    const hair=Math.random()<.5?'原本':pickA(HAIRS), P=spawnDoll({kind,acc,hair,glasses:kind==='奶奶'||kind==='爺爺'?true:Math.random()<.12});
    if(farView) setShadow(P,false);
    return addPerson(P,{speed:(P.kid?.2:.18)+Math.random()*.05,anchor:an,rad:an?6:9,scale:.62}); }
  let rosterT=0, spawnT=0;
  function syncPeople(dt){ rosterT-=dt; spawnT-=dt; if(rosterT>0&&spawnT>0) return; rosterT=1.5;
    const {n,roles}=roster(), keys=new Set(roles.map(r=>r.key)), res=walkers.filter(w=>w!==mayor&&w!==avery);
    for(const w of res) if(w.key&&!keys.has(w.key)) w.gone=true;                                     // 建築拆掉了，那棟的人離開
    const live=res.filter(w=>!w.gone), civ=live.filter(w=>!w.key);
    if(live.length>n){ const ex=(civ.length?civ:live)[0]; ex.gone=true; }
    for(const w of walkers.filter(w=>w.gone)){ root.remove(w.P.obj); people.splice(people.indexOf(w.P),1); walkers.splice(walkers.indexOf(w),1); }
    if(spawnT>0) return; spawnT=.35;                                                                   // 一次只多一個人，不會卡
    const have=new Set(walkers.map(w=>w.key).filter(Boolean)), need=roles.find(r=>!have.has(r.key));
    if(need){ const w=makeResident(need.role,need.an); w.key=need.key; return; }
    if(walkers.length-2<n){ const B=curB(), pids=Object.keys(B), h=Math.random()<.6&&pids.length?hexOf(pickA(pids)):null; makeResident(null,h?{x:h.x,z:h.z}:null); } }
  /* 有建築的格子中心（家長 11-20 00:05） */
  let liveKey='', liveVer=-1;
  function syncLive(){ const v=ver(); if(v===liveVer) return; liveVer=v;   // 11-25：城市有變才重算
    const ids=[...new Set(Object.keys(curB()).map(p=>String(p).slice(0,7)))].sort(), k=ids.join();
    if(k===liveKey) return; liveKey=k;
    const cent=[];
    for(const id of ids){ const h=hexes.find(x=>x.id===id); if(!h) continue; cent.push({x:h.x,z:h.z});
      if(h.bridgeTo){ const o=hexes.find(x=>x.id===h.bridgeTo); if(o) cent.push({x:o.x,z:o.z}); } }   // 碼頭那一格：連它對面那一格也算「有建築」，人才走得過平交道
    setLive(cent, R*1.35);
    /* 建築有變動時，把已經跑到空地上的人直接挪回來（本來就不該在那裡，所以不怕看到瞬移） */
    for(const w of walkers) if(!w.vis&&liveDist(w.P.obj.position)>LIVE_R) w.place();
  }
  let zebraKey='', zebraM=null, zebraVer=-1;
  function syncZebra(){ const v=ver(); if(v===zebraVer) return; zebraVer=v;
    const B=curB(), ids=Object.keys(B).filter(p=>ZEBRA_T.includes(B[p].t)).map(hexOf).filter(Boolean), k=ids.map(h=>h.id).sort().join();
    if(k===zebraKey) return; zebraKey=k; if(zebraM){ root.remove(zebraM); zebraM.geometry.dispose(); } zebraM=zebraMesh(WALK,ids); if(zebraM) root.add(zebraM); }

  /* ---------- 天上：雲、鳥、星星、雨、彩虹 ---------- */
  const clouds=new THREE.Group(); scene.add(clouds);
  const cm=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1,transparent:true,opacity:.92,flatShading:true});
  for(let i=0;i<9;i++){ const c=new THREE.Group(); for(let k=0;k<4;k++){ const s=new THREE.Mesh(new THREE.IcosahedronGeometry(1.6+Math.random()*1.4,0),cm); s.position.set(k*2.2-3,Math.random()*.8,Math.random()*1.5); s.scale.y=.6; c.add(s); }
    c.position.set(-60+Math.random()*120,22+Math.random()*6,-40+Math.random()*70); c.userData.v=.6+Math.random()*.6; clouds.add(c); }
  const birds=new THREE.Group(); scene.add(birds);
  for(let i=0;i<5;i++){ const b=new THREE.Group(); const wm=L.mat('#3b3550'); for(const s of [-1,1]){ const w=new THREE.Mesh(new THREE.BoxGeometry(.5,.04,.16),wm); w.position.x=s*.25; w.userData.s=s; b.add(w); } b.position.set(i*1.1-(i%2)*.5,0,i*.9); birds.add(b); }
  birds.visible=false; let birdT=6;
  const starG=new THREE.BufferGeometry(), sp=[]; for(let i=0;i<500;i++){ const a=Math.random()*Math.PI*2, e=.15+Math.random()*1.3, r=260; sp.push(Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r); }
  starG.setAttribute('position',new THREE.Float32BufferAttribute(sp,3)); const stars=new THREE.Points(starG,new THREE.PointsMaterial({color:'#ffffff',size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false})); scene.add(stars);
  const rainG=new THREE.BufferGeometry(), rp=new Float32Array(1500*6); rainG.setAttribute('position',new THREE.BufferAttribute(rp,3));
  const rain=new THREE.LineSegments(rainG,new THREE.LineBasicMaterial({color:'#cfe6f5',transparent:true,opacity:.55})); rain.visible=false; rain.frustumCulled=false; scene.add(rain);
  for(let i=0;i<1500;i++){ rp[i*6]=(Math.random()-.5)*90; rp[i*6+1]=Math.random()*30; rp[i*6+2]=(Math.random()-.5)*70; }
  const rainbow=new THREE.Group(); ['#e5484d','#f08a3c','#f2c230','#5bbf6a','#5b8fe0','#4a5bc4','#9b6ad1'].forEach((c,i)=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(40-i*1.1,.55,6,64,Math.PI),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,fog:false,depthWrite:false})); rainbow.add(t); });
  rainbow.position.set(0,-2,-70); rainbow.visible=false; scene.add(rainbow);

  /* ---------- 天氣：大多晴天；打開時小機率陰天或小雨，雨下一兩分鐘就停，停了出彩虹 ---------- */
  const W={kind:'sun',rainLeft:0,rainbow:0};
  { const r=Math.random(); if(r<.12){ W.kind='rain'; W.rainLeft=60+Math.random()*60; } else if(r<.27){ W.kind='sun'; W.rainbow=W.rbMax=120; } }   // 家長：不要陰天，改成偶爾出彩虹
  function setWeather(k){ if(k==='rainbow'){ W.kind='sun'; W.rainLeft=0; W.rainbow=W.rbMax=120; return; } W.kind=k; W.rainLeft=k==='rain'?70:0; W.rainbow=0; }
  /* ---------- 白天晚上：照手機的時間；測試模式可以切換 ---------- */
  const T={force:null};
  /* 家長 11-18、11-19 23:40：下午五點到九點是傍晚（色調要像晚霞），九點以後才是晚上 */
  const night=()=>{ if(T.force!=null) return T.force; const d=new Date(), h=d.getHours()+d.getMinutes()/60;
    if(h>=6.5&&h<17) return 0;
    if(h>=17&&h<20.8) return (h-17)/3.8*.22;                 // 傍晚只稍微暗一點，天空交給晚霞
    if(h>=20.8&&h<21.4) return .22+(h-20.8)/.6*.78;          // 九點前後整個暗下來
    if(h>=21.4||h<5.5) return 1; return 1-(h-5.5); };
  const dusk=()=>{ if(T.force!=null) return T.force===.5?1:0; const h=new Date().getHours()+new Date().getMinutes()/60;
    if(h<16.2||h>21.4) return 0;
    if(h<17) return (h-16.2)/.8;                             // 四點多開始染上晚霞
    if(h<20.4) return 1;                                     // 五點～八點二十：整片晚霞
    return Math.max(0,1-(h-20.4)/1.0); };                    // 慢慢褪掉，接到晚上
  const lampMats=Object.entries(L.mats).filter(([k])=>k.startsWith('#fff3c4')).map(([,m])=>m);
  const seaDay=new THREE.Color(0x3cb6e2), seaNight=new THREE.Color(0x2c5f94), tmp=new THREE.Color();
  const moon=new THREE.Mesh(new THREE.SphereGeometry(5,24,16),new THREE.MeshBasicMaterial({color:0xfff4d6,transparent:true,opacity:0,fog:false})); moon.position.set(-70,62,-120); moon.visible=false; scene.add(moon);   // 月亮
  const halo=new THREE.Mesh(new THREE.SphereGeometry(9,24,16),new THREE.MeshBasicMaterial({color:0xfff4d6,transparent:true,opacity:0,fog:false,depthWrite:false})); halo.position.copy(moon.position); halo.visible=false; scene.add(halo);
  /* 晚霞：天頂偏玫瑰紫、靠地平線是暖橘（家長 11-19 23:40） */
  function sky(n,dk,wet){ const top=new THREE.Color('#8fd3f5').lerp(new THREE.Color('#ff9456'),dk*.95).lerp(new THREE.Color('#24336e'),n).lerp(new THREE.Color('#9aa7b4'),wet*(1-n)*.7);
    const mid=new THREE.Color('#bfe8fa').lerp(new THREE.Color('#f4788f'),dk*.92).lerp(new THREE.Color('#36437f'),n).lerp(new THREE.Color('#bcc4cc'),wet*(1-n)*.7);
    const low=new THREE.Color('#e3f6fd').lerp(new THREE.Color('#8f72c0'),dk*.85).lerp(new THREE.Color('#4a5596'),n).lerp(new THREE.Color('#cfd6dc'),wet*(1-n)*.7);
    document.body.style.background=`linear-gradient(${top.getStyle()},${mid.getStyle()} 42%,${low.getStyle()} 86%)`;   /* 遊戲鏡頭是往下看的，畫面最上面那一條就是靠近地平線的天空 → 晚霞的暖橘放上面，越往下（抬頭的天空）越粉紅、越紫（家長 11-19 23:40） */
    if(fog) fog.color.copy(dk>0?top:low); }   // 傍晚遠景的霧也染成晚霞色，不然山腳會灰灰的
  let lastSky='';

  /* ---------- 點建築的小反應 ---------- */
  let actx; function tone(f,at,dur,type='triangle',gain=.15){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const o=actx.createOscillator(), g=actx.createGain(), t=actx.currentTime+at; o.type=type; o.frequency.value=f; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(gain,t+.02); g.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+dur+.05); }catch(e){} }
  const SOUND={ hall:()=>[0,.5].forEach(a=>tone(523,a,1.2,'sine',.2)), power:()=>{ tone(220,0,.5,'sawtooth',.06); tone(440,.1,.6,'triangle',.12); }, water:()=>[880,990,1170].forEach((f,i)=>tone(f,i*.08,.25,'sine',.12)),
    sewage:()=>[300,360,420].forEach((f,i)=>tone(f,i*.12,.3,'sine',.1)), trash:()=>{ tone(180,0,.15,'square',.06); tone(160,.2,.15,'square',.06); }, home:()=>[659,784,988].forEach((f,i)=>tone(f,i*.1,.4)),
    garden:()=>[523,587,659,784].forEach((f,i)=>tone(f,i*.09,.3)), ranch:()=>{ tone(150,0,.9,'sawtooth',.07); tone(140,.05,.9,'triangle',.1); },
    library:()=>[392,494,587].forEach((f,i)=>tone(f,i*.15,.6,'sine',.12)), clinic:()=>{ tone(784,0,.5,'sine',.15); tone(659,.25,.6,'sine',.15); },
    hospital:()=>[0,.45,.9].forEach(a=>{ tone(960,a,.22,'square',.05); tone(770,a+.22,.22,'square',.05); }), breakfast:()=>{ for(let i=0;i<6;i++) tone(2000+Math.random()*1500,i*.05,.05,'square',.02); tone(523,.3,.4); },
    market:()=>[523,659,784,659,880].forEach((f,i)=>tone(f,i*.1,.25)), conv:()=>{ tone(880,0,.5,'sine',.16); tone(698,.3,.7,'sine',.16); }, park:()=>[2200,2600,2400,2900].forEach((f,i)=>tone(f,i*.12,.08,'sine',.07)) };
  const boosts=[]; const pops=[]; let glowUntil=0;
  function react(t,group){
    if(SOUND[t]) SOUND[t]();
    if(group) boosts.push({g:group,until:clock+3});
    if(t==='ranch'&&group){ const e=new THREE.Mesh(new THREE.SphereGeometry(.12,16,12),L.mat('#fff6e2')); e.scale.y=1.3; const p=group.position; e.position.set(p.x+1,1.2,p.z-.2); scene.add(e); pops.push({o:e,t:0}); }
    if(t==='school') walkers.filter(w=>w.P.kid).forEach(w=>{ const s0=w.speed; w.speed=s0*2.2; setTimeout(()=>w.speed=s0,5000); });   // 上課鐘響，小朋友跑起來
    if(t==='home') glowUntil=clock+1.5;
  }
  const boostOf=o=>{ for(const b of boosts){ if(b.until<clock) continue; for(let p=o;p;p=p.parent) if(p===b.g) return 3.5; } return 1; };

  /* ---------- 點路上的人：說一句話 ---------- */
  const ray=new THREE.Raycaster(); let bubble=null;
  function pick(r){ const hits=r.intersectObjects(people.filter(p=>p.obj.visible).map(p=>p.hit),false);   /* 11-27：走進建築（淡掉）的人點不到 */ if(!hits.length) return false; const p=people.find(x=>x.hit===hits[0].object);
    /* 家長 11-20 23:12：市長的話只有市長會說（原本「市長的家」蓋好後，TALK.mayor 會混進一般居民的話裡） */
    const B=curB(), types=[...new Set(Object.values(B).map(x=>x.t))].filter(t=>TALK[t]&&t!=='mayor'); const role=p.d&&p.d.cur, rain=W.kind==='rain';
    let pool, who='';
    if(p.mayor){ who='市長'; pool=Math.random()<.78?mayorLines(B):MAYOR_GROW; }
    else if(p.avery){ who='Avery'; pool=[...(PEOPLE_TALK.avery||[]),...AVERY_MORE]; }
    else pool=role&&role!=='無'&&PEOPLE_TALK[role]?PEOPLE_TALK[role]:rain&&Math.random()<.5?PEOPLE_TALK.rain:[...TALK.generic,...types.flatMap(t=>TALK[t])];
    say(p,pickA(pool),who); tone(660,0,.15,'sine',.12); tone(880,.1,.2,'sine',.12); return p; }   /* 11-19：回傳這個人，鏡頭才能跟著他跑 */
  /* 家長 11-20 23:12：字消失太快，小朋友讀不完 → 停留時間至少兩倍（4 秒→8 秒，字多的再加長） */
  function say(p,text,who){ p.react?.('微笑',Math.max(8,String(text).length*.45)); if(bubble) bubble.el.remove(); const el=document.createElement('div'); el.className='talk'; el.innerHTML=(who?`<b>${who}</b>`:'')+UI().ruby(text); tagsEl.appendChild(el); bubble={el,p,until:clock+Math.max(8,String(text).length*.45)}; }

  /* ---------- 每一格 ---------- */
  let clock=0;
  let paused=false;
  function lineup(x,z){ paused=true; people.forEach((p,i)=>{ p.obj.position.set(x+(i-(people.length-1)/2)*.42,SW_Y,z); p.obj.rotation.y=0; p.anim(0,{walk:false,ph:0,wave:false,rain:false}); }); }
  function update(dt,t,v3,W2,H2){
    clock=t;
    for(const p of people) if(p.tag){ v3.setFromMatrixPosition(p.obj.matrixWorld); v3.y+=p.h*1.25; v3.project(camera); p.tag.style.display=v3.z<1?'block':'none'; p.tag.style.left=((v3.x+1)/2*W2)+'px'; p.tag.style.top=((1-v3.y)/2*H2)+'px'; }
    if(paused) return;
    { const tg=ctx.target&&ctx.target(), far=!!tg&&camera.position.distanceTo(tg)>60;   // 看全城時居民影子先不畫
      if(far!==farView){ farView=far; } }
    // 車和人：工作車沒有對應建築時不出現
    syncLive(); syncCampusStreets(); syncZebra(); syncPeople(dt); const raining=W.kind==='rain';
    VIS.update(dt); VIS.social(dt,raining,farView); VIS.faceTick(dt); VIS.refresh(ver());
    for(const w of walkers){ if(w.vis){ VIS.step(w,dt,raining); continue; } if(w===avery&&(w.mode==='follow'||w.mode==='visit')) continue; if(w===avery&&w.mode==='wait'){ w.P.anim(dt,{walk:false,ph:w.ph,wave:false,rain:raining}); continue; } if(w===mayor&&VISIT) continue; w.update(dt,raining); }
    if(mayor&&avery){ visitTick(dt); if(!paused){ tripTick(dt); soloTick(dt); duoTick(dt,raining); } }
    if(mayor){ const mp=mayor.P.obj.position, tr=mayor.trail, last=tr[tr.length-1]; if(!mayor.vis&&(!last||Math.hypot(mp.x-last.x,mp.z-last.z)>.02)){ tr.push({x:mp.x,y:mp.y,z:mp.z,r:mayor.P.obj.rotation.y}); if(tr.length>160) tr.shift(); }
      for(const w of walkers){ if(w===mayor||w===avery||w.waveCD>0||w.wave>0||w.vis||w.soc) continue; const p=w.P.obj.position; if(!VISIT&&!mayor.vis&&Math.hypot(p.x-mp.x,p.z-mp.z)<.9){ w.wave=1.6; w.waveCD=25+Math.random()*20; w.face=mp.clone(); w.faceV='laugh'; w.faceT=1.6; if(mayor.wave<=0){ mayor.wave=1.2; mayor.face=p.clone(); } } } }   // 市長經過，居民揮手、市長也揮手
    if(avery&&mayor){ avery.modeT-=dt; const ap=avery.P.obj.position, mp=mayor.P.obj.position;                         // Avery：平常在市長的家附近；有時候走去找市長，跟在旁邊一起走
      if(avery.mode==='home'&&avery.modeT<0){ avery.mode='seek'; avery.anchor=()=>mayor.P.obj.position; avery.rad=.3; avery.modeT=40; }
      else if(avery.mode==='seek'&&!mayor.vis&&(Math.hypot(ap.x-mp.x,ap.z-mp.z)<1.0||avery.modeT<0)){ avery.mode='follow'; avery.modeT=25+Math.random()*20; }
      else if(avery.mode==='follow'&&duo) averyDuo(dt,raining);
      else if(avery.mode==='follow'){ /* 家長 11-20 23:12：跟市長散步時距離再拉開（.42→.8），而且走在馬路那一側，不貼著建築 */
        // Interpolate the trail by distance, then approach it continuously.
        const tr=mayor.trail; let remaining=.8, k=tr.length-1, q=tr[k];
        while(k>0){const u=tr[k],v=tr[k-1],len=Math.hypot(u.x-v.x,u.z-v.z); if(len>=remaining&&len>0){const f=remaining/len;q={x:u.x+(v.x-u.x)*f,y:u.y+(v.y-u.y)*f,z:u.z+(v.z-u.z)*f};break;} remaining-=len;q=v;k--;}
        let moved=0;
        if(q){const dx=q.x-ap.x,dz=q.z-ap.z,dist=Math.hypot(dx,dz); const step=Math.min(dist,dt*Math.min(.65,mayor.speed+dist*2));
          if(dist>.008){ap.x+=dx/dist*step;ap.z+=dz/dist*step;moved=step;const o=avery.P.obj,yaw=Math.atan2(dx,dz),delta=yaw-o.rotation.y;o.rotation.y+=Math.atan2(Math.sin(delta),Math.cos(delta))*(1-Math.exp(-dt*9));} ap.y+=(q.y-ap.y)*(1-Math.exp(-dt*10));}
        const moving=moved>dt*.025; if(moving) avery.ph+=moved*25/avery.scale; if(avery.cheer>0) avery.cheer-=dt; avery.P.anim(dt,{walk:moving,ph:avery.ph,wave:!moving&&mayor.wave>0&&!(avery.cheer>0),rain:raining,cheer:!moving&&avery.cheer>0});
        if(avery.modeT<0){ avery.mode='home'; avery.anchor=hexAnchor('mayor'); avery.rad=5; avery.modeT=25+Math.random()*20; avery.place(ap.x,ap.z); } } }
    if(ready) for(const m of movers){ if(m.need){ const on=built(m.need); /* 測試模式也一樣：要有那棟建築才出現 */ m.obj.visible=on; if(!on) continue; } m.update(dt); }
    // 動物
    const nt=night()>.5; for(const a of L.animals) a.night=nt;
    for(const a of L.animals){ const g=a.g, k=t*.5+a.ph;
      if(a.kind==='chicken'){ g.position.x=a.x0+Math.sin(k*1.3)*a.r; g.position.z=a.z0+Math.cos(k*.9)*a.r*.7; g.rotation.y=k*.8; g.rotation.z=Math.max(0,Math.sin(k*5))*.35; }
      else if(a.kind==='pig'||a.kind==='cow'){ }   // 家長：牛和豬不要動，維持原本
      else if(a.kind==='pig_old'){ const r=a.r*(.6+.3*Math.sin(k*.3)); g.position.x=a.x0+Math.cos(k*.35)*r; g.position.z=a.z0+Math.sin(k*.35)*r; g.rotation.y=-k*.35+Math.PI; }
      else if(a.kind==='cow_old'){ g.rotation.x=Math.max(0,Math.sin(k*.6))*.08; g.position.x=a.x0+Math.cos(k*.12)*a.r*.5+(a.ph?a.r*.4:-a.r*.3); g.position.z=a.z0+Math.sin(k*.12)*a.r*.3; g.rotation.y=-k*.12+(a.ph?2:0); }
      else if(a.kind==='squirrel'||a.kind==='bird'){ animSmall(a,t); }   // 公園的松鼠、小鳥（家長 11-13 10:21：要會動）
      else if(a.kind==='egret'){ g.position.x=a.x0+Math.sin(k*.4)*a.r; g.rotation.y=Math.cos(k*.4)>0?.2:Math.PI-.2; } }
    // 雲、鳥
    for(const c of clouds.children){ c.position.x+=dt*c.userData.v; if(c.position.x>70) c.position.x=-70; }
    birdT-=dt; if(birdT<0&&!birds.visible){ birds.visible=true; birds.position.set(-70,14,-20+Math.random()*30); birds.userData.v=6; } if(birds.visible){ birds.position.x+=dt*birds.userData.v; birds.children.forEach(b=>b.children.forEach(w=>w.rotation.z=w.userData.s*Math.sin(t*9)*.6)); if(birds.position.x>70){ birds.visible=false; birdT=20+Math.random()*30; } }
    // 天氣
    if(W.kind==='rain'){ W.rainLeft-=dt; if(W.rainLeft<=0){ W.kind='sun'; W.rainbow=W.rbMax=10; } }
    rain.visible=W.kind==='rain'; if(rain.visible){ const c=ctx.target(); rain.position.set(c.x,0,c.z); for(let i=0;i<1500;i++){ rp[i*6+1]-=dt*22; if(rp[i*6+1]<0) rp[i*6+1]+=30; rp[i*6+4]=rp[i*6+1]+.7; rp[i*6+3]=rp[i*6]+.12; rp[i*6+5]=rp[i*6+2]; } rainG.attributes.position.needsUpdate=true; }
    if(W.rainbow>0){ W.rainbow-=dt; } const rbA=W.rainbow>0&&night()<.3?Math.min(1,W.rainbow/2,((W.rbMax||10)-W.rainbow)/1.5)*.6:0;   // 家長 11-18：晚上不要彩虹
    rainbow.children.forEach(m=>m.material.opacity=rbA); rainbow.visible=rbA>0;   /* 11-25：這行原本被接在註解後面沒有執行，彩虹一直沒出現 */
    // 白天晚上
    const n=night(), dk=dusk(), wet=W.kind==='rain'?1:W.kind==='cloud'?.6:0;
    // 家長 11-18：晚上不要太暗，改成月光（偏藍白的主光留 45%、天空光留 72%），天上有月亮
    sun.intensity=2.6*(1-n*.55)*(1-wet*.45); sun.color.set('#fff1d6').lerp(new THREE.Color('#ff8f52'),dk*.85).lerp(new THREE.Color('#b8c8ff'),n); hemi.intensity=1.5*(1-n*.28)*(1-wet*.2);
    hemi.color.set(0xdff4ff).lerp(new THREE.Color('#ffcfa6'),dk*.55).lerp(new THREE.Color('#9aa8e0'),n);   // 傍晚連環境光也染暖
    moon.visible=halo.visible=n>.4; moon.material.opacity=Math.min(1,(n-.4)*2.5); halo.material.opacity=moon.material.opacity*.25;   /* 11-25：月亮這行原本也被接在註解後面 */
    sea.material.color.copy(seaDay).lerp(tmp.set('#e08a6a'),dk*.38*(1-n)).lerp(seaNight,n).lerp(tmp.set('#5f8fa6'),wet*.4*(1-n));   // 海面映晚霞
    stars.material.opacity=Math.max(0,n-.3)*1.2*(1-wet); stars.visible=stars.material.opacity>0; cm.color.set('#ffffff').lerp(tmp.set('#9aa3ad'),wet*.8).lerp(tmp.set('#4a5070'),n*.8); clouds.scale.setScalar(1);
    for(const m of lampMats) m.emissiveIntensity=.35+n*1.4;
    L.glassMat.emissiveIntensity=clock<glowUntil?1.3:.15+n*1.1; L.glassMat.emissive.set(n>.3||clock<glowUntil?0xffc66a:0x1d4a5c);   // 晚上窗戶亮燈
    const key=[n.toFixed(2),dk.toFixed(2),wet].join(); if(key!==lastSky){ lastSky=key; sky(n,dk,wet); }
    for(let i=pops.length-1;i>=0;i--){ const p=pops[i]; p.t+=dt; p.o.position.y+=dt*.8; p.o.material.transparent=true; if(p.t>1.5){ scene.remove(p.o); pops.splice(i,1); } }
    // 說話泡泡
    if(bubble){ if(clock>bubble.until){ bubble.el.remove(); bubble=null; } else { v3.setFromMatrixPosition(bubble.p.obj.matrixWorld); v3.y+=bubble.p.h*1.35; v3.project(camera);
      /* 家長 11-27 12:48：跟隨模式時對話框跑到上面、跟標題重疊，而且一直晃 → 夾在畫面裡（不蓋到上面的城市名牌），位置慢慢跟過去、取整數像素 */
      const el=bubble.el, bw=el.offsetWidth, bh=el.offsetHeight, hud=(document.querySelector('.city')?.getBoundingClientRect().bottom||70)+12;
      const tx=Math.min(Math.max((v3.x+1)/2*W2,bw/2+8),W2-bw/2-8), ty=Math.min(Math.max((1-v3.y)/2*H2,hud+bh),H2-24);
      if(bubble.sx==null){ bubble.sx=tx; bubble.sy=ty; } else { const k=Math.min(1,dt*6); bubble.sx+=(tx-bubble.sx)*k; bubble.sy+=(ty-bubble.sy)*k; }
      el.style.left=Math.round(bubble.sx)+'px'; el.style.top=Math.round(bubble.sy)+'px'; } }
  }
  return { visits:VIS, visit:k=>startVisit(k), trip:pid=>startTrip(pid), solo:g=>(!mayor||mayor.vis||VISIT||duo)?false:VIS.startSolo(mayor,g), duo:k=>{ duoT=0; duoForce=k||null; return true; }, cheer, court:{COURT,CS}, lineup, stats:()=>({ready,people:people.length,movers:movers.length,roles:walkers.map(w=>w.P.mayor?'市長':w.P.avery?'Avery':(w.P.kind+(w.P.d&&w.P.d.cur!=='無'?'/'+w.P.d.cur:''))),avery:avery&&avery.mode,duo:duo&&duo.kind,visit:VISIT&&{kind:VISIT.kind,phase:VISIT.phase,rest:+(VISIT.rest||0).toFixed(1)},pos:people.map(p=>p.obj.position.toArray().map(x=>+x.toFixed(1))),pp:people.slice(0,2).map(p=>[p.obj.position.x,p.obj.position.y,p.obj.position.z]),mw:mayor&&{a:mayor.a,b:mayor.b,t:mayor.t,wait:mayor.wait,wave:mayor.wave,cheer:mayor.cheer}}), update, pick, react, boostOf, setWeather, setNight:v=>{ T.force=v; lastSky=''; }, get weather(){ return W.kind; } };
}
