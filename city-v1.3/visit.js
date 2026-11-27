/* Winston City 人物進建築（A-0 核心，2026-11-27）。規則見專案《Winston City 人物進建築（分工與覆核）》。
   1. 誰去哪裡：照人物表（WORK、FREE），有路線檔（visits/建築代號.js）的建築才會去。
   2. 走去 → 門口 → 照路線走進去 → 室內型在門裡淡掉、待 8～20 秒（上班的人 30～60 秒）／戶外型在停留點做動作 → 走出來 → 接回人行道。
   3. 高度：從門口開始，每一點從「上一點高度＋0.3」往下量那棟建築的地板（台階一階一階上去，不會跳到遮雨棚上面）。
   4. 人數：每組 max、每棟最多 3 人（半格 2 人）、全城同時最多 6 人。
   5. 建築拆掉、升級、重畫：人立刻從門口出來接回人行道。
   6. 路上互動：打招呼（15%）→ 30% 接著聊天（小孩和小孩一半是說悄悄話）；坐同一桌的兩個人會聊天。全城最多 8 組，聊天最多 4 組。
   動作、表情由 people.js（A-1）、vip_*.js（A-2）做；這裡只送 act／face／look／talk／cover／sit 給 P.anim()。 */
import * as THREE from 'three';
import { LIST } from './visits/index.js';

const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const rnd=(a,b)=>a+Math.random()*(b-a);
const pickA=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- 人物表（《分工與覆核》第 3 節） ---------- */
const FOOD=['breakfast','bakery','icecream','burger','japanese'];
export const WORK={ 清潔隊員:['trash'], 警察:['policebox'], 消防員:['firestation'], 醫生:['hospital','clinic'], 護士:['hospital','clinic'], 廚師:FOOD,
  郵差:['hall'], 公車司機:['hall'], 建築工人:['power','water','sewage'], 農夫:['garden','orchard','tea'], 牧場主人:['ranch'], 船長:['pier'], 列車長:['train'],
  畫家:['art'], 太空人:['observatory'], '小黃帽＋書包':['school'], 老師:['school'] };
export const FREE={ 清潔隊員:['park','nightmarket'], 警察:['bank','train','nightmarket'], 消防員:['water','conv'], 醫生:['breakfast','conv'], 護士:['breakfast','conv'],
  廚師:['market'], 郵差:['home','bank','library'], 公車司機:['train'], 建築工人:['breakfast','conv'], 農夫:['market'], 牧場主人:['market'], 船長:['market'], 畫家:['park'],
  '小黃帽＋書包':['stationery','library','icecream','park'], 老師:['library','art'], 菜籃:['market','bakery','conv','temple'],
  背包:['library','bank','art','train','pier','observatory'], 遛狗:['park','market',...FOOD], 嬰兒車:['park','market',...FOOD] };
const OLD=['temple','park','clinic','breakfast'], KID=['park','icecream'], ADULT=['conv','market','bank','bakery','burger','japanese','park','hall'];
const NIGHT_OK=['home','mayor','hospital','nightmarket'];

export function createVisits(o){
  const { curB, lotGroup, WALK, walkPath, walkers, isVip, night, SW_Y, root, hexOf } = o;
  const FILES={};
  Promise.all(LIST.map(t=>import(`./visits/${t}.js`).then(m=>{ FILES[t]=m.default; }).catch(e=>console.warn('visits',t,e))));
  const ray=new THREE.Raycaster(), DOWN=V(0,-1,0);
  const visible=ob=>{ for(let p=ob;p;p=p.parent) if(p.visible===false) return false; return true; };

  /* ---------- 路線檔 → 世界座標 ---------- */
  const lvOf=(file,lv)=>{ let best=null; for(const k of Object.keys(file.lv).map(Number).sort((a,b)=>a-b)) if(k<=lv) best=file.lv[k]; return best; };
  const toW=(g,x,z)=>{ const f=g.userData.fit; return g.localToWorld(V(x,0,f?f[0]+f[1]*z:z)); };
  /* 從上一點高度＋0.3 往下量（最多量到 0.6 深）；沒碰到就是人行道高度 */
  function probe(g,p,prevY,climb=.3){ const top=prevY+climb; ray.set(V(p.x,top,p.z),DOWN); ray.far=top+.3;   /* climb：往上最多爬多高（坐的位置只量椅子下面的地板） */
    const h=ray.intersectObject(g,true).find(i=>i.object.isMesh&&visible(i.object)&&!i.object.userData.noRay);
    return h?Math.max(h.point.y+.01,SW_Y):SW_Y; }
  function chain(g,locals,y0,low){ let y=y0; return locals.map(([x,z],i)=>{ const w=toW(g,x,z); y=probe(g,w,y,low&&i===locals.length-1?.05:.3); w.y=y; return w; }); }
  /* 門口最近的人行道點 */
  function nodeNear(p,pid){ const N=WALK.nodes, h=pid&&hexOf(pid), own=h&&h.walk&&h.walk.filter(i=>N[i].nb.length&&!N[i].dead); if(own&&own.length){ let best=-1, bd=1e9; for(const i of own){ const d=Math.hypot(N[i].x-p.x,N[i].z-p.z); if(d<bd){ bd=d; best=i; } } return best; }   /* 先找這棟自己那一格的人行道 */
    let best=-1, bd=1e9; for(let i=0;i<N.length;i++){ const n=N[i]; if(!n.nb.length||n.dead) continue; const d=Math.hypot(n.x-p.x,n.z-p.z); if(d<bd){ bd=d; best=i; } } return best; }

  /* 人行道上正對門口的那一點：從最近的路口沿著人行道走到這裡，再轉進門（不要從路口斜斜穿過建地） */
  function curbPoint(node,door){ const N=WALK.nodes, A=N[node]; let best=null, bd=1e9;
    for(const e of A.nb){ if(e.cross) continue; const B=N[e.to], dx=B.x-A.x, dz=B.z-A.z, L2=dx*dx+dz*dz; if(!L2) continue;
      const t=((door.x-A.x)*dx+(door.z-A.z)*dz)/L2; if(t<=.02||t>=.98) continue; const px=A.x+dx*t, pz=A.z+dz*t, d=Math.hypot(door.x-px,door.z-pz); if(d<bd){ bd=d; best=V(px,SW_Y,pz); } }
    return best&&bd<Math.hypot(door.x-A.x,door.z-A.z)?best:null; }
  /* ---------- 這個人是誰 ---------- */
  const role=w=>{ const d=w.P.d; return d&&d.cur&&d.cur!=='無'?d.cur:null; };
  const names=w=>{ const P=w.P, n=['*']; const r=role(w); if(r) n.push(r); if(P.kind) n.push(P.kind); n.push(P.kid?'小孩':'大人'); if(P.mayor) n.push('市長'); if(P.avery) n.push('Avery'); return n; };
  const can=(w,a)=>{ const P=w.P; if(P.canDo) return !!P.canDo(a); return a==='stand'||a==='look'; };   // 還沒有 A-1 的動作時：只會站、看
  function freeTypes(w){ const r=role(w), k=w.P.kind; if(r&&FREE[r]) return FREE[r]; if(k==='奶奶'||k==='爺爺') return OLD; if(w.P.kid) return KID; return ADULT; }
  function fits(G,w,rain){ const n=names(w), who=G.who;
    const ok=who==='*'||(Array.isArray(who)&&(who.includes('*')||who.some(x=>n.includes(x)))); if(!ok) return false;
    if((G.no||[]).some(x=>n.includes(x))) return false;
    const r=role(w); if(r==='嬰兒車'&&(G.inside||G.stairs)) return false; if(r==='遛狗'&&G.inside) return false;
    if(rain&&!G.inside) return false;                                     // 下雨：不在戶外坐、不在戶外停留
    return true; }

  /* ---------- 誰在哪裡（人數上限） ---------- */
  const active=()=>walkers.filter(w=>w.vis);
  const countB=pid=>active().filter(w=>w.vis.pid===pid).length;
  const countG=(pid,gn)=>active().filter(w=>w.vis.pid===pid&&w.vis.gname===gn).length;
  const stayTaken=(pid,gn,i)=>active().some(w=>w.vis.pid===pid&&w.vis.gname===gn&&w.vis.si===i);
  const capB=pid=>String(pid).length>7?2:3;

  /* ---------- 排一趟 ---------- */
  function build(w,pid,gname,G){ const g=lotGroup(pid); if(!g) return null; g.updateMatrixWorld(true);
    let si=-1, st=null;
    if(!G.inside&&G.stay&&G.stay.length){ const free=G.stay.map((s,i)=>i).filter(i=>!stayTaken(pid,gname,i)); if(!free.length) return null; si=pickA(free); st=G.stay[si]; }
    let act=st?st.act||'stand':null, at=st?st.at:null;
    if(st&&!can(w,act)){ if(act==='sit'&&st.stand){ act='stand'; at=st.stand; } else if(act==='look'||act==='stand'){ act=can(w,'look')?act:'stand'; } else return null; }
    const loc=[G.door,...(G.in||[]),...(st?(act==='sit'||at===st.at?(st.go||[]):[]):[]),...(at?[at]:[])];
    const inW=chain(g,loc,SW_Y,act==='sit'), last=inW[inW.length-1];
    const outW=chain(g,[...(G.out||[]),G.door],last.y);
    const node=nodeNear(inW[0],pid); if(node<0) return null; const N=WALK.nodes[node], nodeP=V(N.x,SW_Y,N.z), curb=curbPoint(node,inW[0]);
    const path=walkPath(w.P.obj.position,node); if(!path){ w._why='nopath'; return null; }
    const pos=w.P.obj.position.clone();
    return { pid, g, gname, G, st, si, act, lv:curB()[pid].lv,
      faceW:st&&st.face?toW(g,st.face[0],st.face[1]):null, seatY:st&&st.seat!=null?g.localToWorld(V(0,st.seat,0)).y:null,
      pts:[pos,...path,nodeP,...(curb?[curb]:[]),...inW], i:1, bi:1+path.length, outW:[...outW,...(curb?[curb]:[]),nodeP], node, nodeP, phase:'go', t:0,
      sec:st&&st.sec||G.sec||(G.inside?[8,20]:[8,15]) }; }
  function start(w,pid,force){ w._why='?'; const B=curB(), r=B[pid]; if(!r) return false; const file=FILES[r.t]; if(!file) return false;
    const L=lvOf(file,r.lv); if(!L) return false; const rain=o.rain();
    if(!force){ if(active().length>=6||countB(pid)>=capB(pid)) return false; if(night()>.5&&!NIGHT_OK.includes(r.t)) return false; }
    const gs=Object.entries(L.groups).filter(([gn,G])=>fits(G,w,rain)&&countG(pid,gn)<(G.max||2));
    /* 上班的人走「上班」那一組；其他人不走上班那一組 */
    const r0=role(w), mine=gs.filter(([gn,G])=>Array.isArray(G.who)&&r0&&G.who.includes(r0)), others=gs.filter(([gn,G])=>!(Array.isArray(G.who)&&r0&&G.who.includes(r0)));
    const own=w.key&&w.key.split(':')[0]===pid, list=own&&mine.length?mine:others.length?others:mine;
    w._why='groups:'+gs.map(g=>g[0]).join('/');
    for(const [gn,G] of list.sort(()=>Math.random()-.5)){ const v=build(w,pid,gn,G); if(v){ w.vis=v; w.hold=0; w.wave=0; w.st=null; w.soc=null; return true; } }
    return false; }
  function choose(w){ const B=curB(); if(!Object.keys(FILES).length) return false;
    const p=w.P.obj.position, own=w.key&&w.key.split(':')[0];
    const near=pid=>{ const h=hexOf(pid); return h&&Math.hypot(h.x-p.x,h.z-p.z)<14; };
    let cands=[];
    if(own&&B[own]&&FILES[B[own].t]&&Math.random()<.7) cands=[own];   // 上班的人：七成回自己那棟
    else { const fr=freeTypes(w); for(const pid in B) if(fr.includes(B[pid].t)&&FILES[B[pid].t]&&near(pid)) cands.push(pid); }
    for(const pid of cands.sort(()=>Math.random()-.5)) if(start(w,pid)) return true;
    return false; }

  /* ---------- 淡入淡出：換成這個人自己的透明材質，淡完換回共用的 ---------- */
  function setFade(P,a){
    if(a>=1){ if(P._fm){ for(const [m,mat] of P._fm) m.material=mat; P._fm=null; } P.obj.visible=true; return; }
    if(a<=0){ P.obj.visible=false; return; }
    P.obj.visible=true;
    if(!P._fm){ P._fm=[]; P.obj.traverse(m=>{ if(!m.isMesh||!m.material||m===P.hit) return; const mat=m.material; P._fm.push([m,mat]);
      const c=Array.isArray(mat)?mat.map(x=>x.clone()):mat.clone(); for(const x of [].concat(c)){ x.userData.op0=x.transparent?x.opacity:1; x.transparent=true; x.depthWrite=false; } m.material=c; }); }
    for(const [m] of P._fm) for(const x of [].concat(m.material)) x.opacity=a*x.userData.op0; }

  /* ---------- 走一串點（高度跟著點慢慢變） ---------- */
  function moveOn(o3,r,step){ const p=o3.position; let left=step, moved=0;
    while(left>1e-6&&r.i<r.pts.length){ const q=r.pts[r.i], dx=q.x-p.x, dz=q.z-p.z, d=Math.hypot(dx,dz);
      if(d<=left){ p.set(q.x,q.y,q.z); left-=d; moved+=d; r.i++; }
      else { const f=left/d; p.x+=dx*f; p.z+=dz*f; p.y+=(q.y-p.y)*f; moved+=left; left=0; } }
    return moved; }
  const restLen=(r,p)=>{ let s=0, a=p; for(let k=r.i;k<r.pts.length;k++){ const b=r.pts[k]; if(a) s+=Math.hypot(b.x-a.x,b.z-a.z); a=b; } return s; };
  function turnTo(o3,yaw,dt){ const d=Math.atan2(Math.sin(yaw-o3.rotation.y),Math.cos(yaw-o3.rotation.y)); o3.rotation.y+=d*(1-Math.exp(-dt*8)); }
  const FADE=.35;   /* 從門前 .35 開始淡（門在 in 最後一點前面約 .17），走到門裡剛好看不見 */

  function finish(w){ const v=w.vis; if(!v) return; setFade(w.P,1); w.vis=null; w.place(v.nodeP.x,v.nodeP.z); w.vT=rnd(20,40); }
  function abort(w){ const v=w.vis; if(!v) return; setFade(w.P,1); w.P.obj.position.copy(v.nodeP); w.vis=null; w.place(v.nodeP.x,v.nodeP.z); w.vT=rnd(10,20); }

  /* ---------- 每一格：一個人的這一趟 ---------- */
  function step(w,dt,rain){ const v=w.vis, P=w.P, o3=P.obj, B=curB();
    if(!B[v.pid]||lotGroup(v.pid)!==v.g||B[v.pid].lv!==v.lv){ abort(w); return; }   // 建築拆掉、升級、重畫
    v.t+=dt; const sp=w.speed*.9;
    const anim=(walk,extra={})=>{ if(walk) w.ph+=dt*w.speed*25/w.scale; P.anim(dt,{walk,ph:w.ph,wave:w.wave>0,rain,...extra}); };
    if(v.phase==='go'){
      /* 排隊：同一棟、比我早出發、正在走的人就在我前面 0.35 以內，先等一下 */
      const busy=v.i>v.bi&&active().some(x=>x!==w&&x.vis.pid===v.pid&&(x.vis.phase==='go'||x.vis.phase==='out')&&x.vis.t>v.t&&x.P.obj.position.distanceTo(o3.position)<.35);
      const x0=o3.position.x, z0=o3.position.z, moved=busy?0:moveOn(o3,v,sp*dt);
      if(moved>1e-5) turnTo(o3,Math.atan2(o3.position.x-x0,o3.position.z-z0),dt);
      if(v.G.inside){ const rem=restLen(v,o3.position); setFade(P,Math.min(1,rem/FADE)); }
      anim(moved>dt*.02);
      if(v.i>=v.pts.length){ if(v.G.inside){ v.phase='inside'; v.left=rnd(...v.sec); setFade(P,0); } else { v.phase='stay'; v.left=rnd(...v.sec); } }
      return; }
    if(v.phase==='inside'){ v.left-=dt; if(v.left<=0) goOut(w); return; }
    if(v.phase==='stay'){
      const sit=v.act==='sit', k=sit?(P.sitK!=null?P.sitK:(v.standing?0:1)):0;
      if(v.faceW) turnTo(o3,Math.atan2(v.faceW.x-o3.position.x,v.faceW.z-o3.position.z),dt);
      const ground=v.pts[v.pts.length-1].y; if(sit&&v.seatY!=null){ const drop=P.sitDrop!=null?P.sitDrop:.125; o3.position.y=ground+(v.seatY-drop-ground)*k; }
      const ex={act:v.act,sit:sit&&!v.standing}; if(v.act==='look'&&v.faceW) ex.look={x:v.faceW.x,z:v.faceW.z};
      /* 同一桌兩個人：聊天 */
      const mate=v.st&&v.st.pair&&active().find(x=>x!==w&&x.vis.pid===v.pid&&x.vis.phase==='stay'&&x.vis.st&&x.vis.st.pair===v.st.pair);
      if(mate&&!v.standing){ const both=(k>=1||!sit)&&(!mate.vis.act||mate.vis.act!=='sit'||(mate.P.sitK!=null?mate.P.sitK:1)>=1);
        if(both){ const t=Math.min(v.t,mate.vis.t), me=walkers.indexOf(w)<walkers.indexOf(mate)?0:1, spk=Math.floor(t/3.5)%2;
          Object.assign(ex,{act:'chat',talk:spk===me,look:{x:mate.P.obj.position.x,z:mate.P.obj.position.z},face:'smile'});
          if(t%11>9.5&&me===0){ ex.face='laugh'; ex.cover=true; } } }
      if(w.faceForce) ex.face=w.faceForce;
      anim(false,ex);
      v.left-=dt;
      if(v.left<=0||rain&&!v.G.inside){ if(sit&&!v.standing){ v.standing=true; } }
      if(v.standing||(!sit&&(v.left<=0||rain))){ if(!sit||k<=0) goOut(w); }
      return; }
    if(v.phase==='out'){
      const x0=o3.position.x, z0=o3.position.z, moved=moveOn(o3,v,sp*dt);
      if(moved>1e-5) turnTo(o3,Math.atan2(o3.position.x-x0,o3.position.z-z0),dt);
      if(v.G.inside){ v.walked=(v.walked||0)+moved; setFade(P,Math.min(1,v.walked/FADE)); }
      anim(moved>dt*.02);
      if(v.i>=v.pts.length) finish(w); }
  }
  function goOut(w){ const v=w.vis, o3=w.P.obj; v.phase='out'; v.walked=0;
    const back=v.G.inside?[]:(v.st&&v.st.go?[...v.st.go].reverse():[]);
    const backW=back.length?chain(v.g,back,o3.position.y):[];
    if(v.G.inside){ /* 從門裡（最後一點）淡入走出來 */ }
    v.pts=[o3.position.clone(),...backW,...v.outW]; v.i=1; }

  /* ---------- 每一格：誰要出門去哪裡 ---------- */
  let tick=0;
  function update(dt){ tick-=dt;
    for(const w of walkers) if(w.vis&&(w.gone||!w.P.obj.parent)){ w.vis=null; }   // 人被移走了（城市變小）
    if(tick>0) return; tick=.5;
    for(const w of walkers){ if(w.vis||isVip(w)||w.gone) continue; w.vT=(w.vT==null?rnd(5,30):w.vT)-.5;
      if(w.vT>0||w.soc||w.hold>0||w.wave>0) continue; w.vT=rnd(20,40); choose(w); } }

  /* ---------- 路上互動：打招呼、聊天、說悄悄話 ---------- */
  const SOC=[]; let socT=0, rolls=0, greets=0;
  const freeW=w=>!w.vis&&!isVip(w)&&!w.gone&&!w.soc&&!(w.hold>0)&&!(w.wave>0)&&w.P.obj.visible;
  function startChat(a,b,kind){ const dur=kind==='whisper'?rnd(4,6):rnd(6,10); const s={a,b,kind,t:0,dur,laugh:Math.random()<.5?a:b}; a.soc=b.soc=s; a.hold=b.hold=dur+.2; SOC.push(s); return s; }
  function social(dt,rain,far){
    for(const w of walkers) if(w.gCD>0) w.gCD-=dt;
    for(let i=SOC.length-1;i>=0;i--){ const s=SOC[i], {a,b}=s; s.t+=dt;
      const gone=a.gone||b.gone||a.vis||b.vis;
      if(gone||s.t>=s.dur){ SOC.splice(i,1); for(const w of [a,b]){ w.soc=null; w.st=null; w.hold=0; w.gCD=30; if(!gone&&s.kind!=='greet'){ w.wave=1; w.face=(w===a?b:a).P.obj.position; } }
        if(!gone&&s.kind==='greet'&&!rain&&Math.random()<.3&&SOC.filter(x=>x.kind!=='greet').length<4) startChat(a,b,a.P.kid&&b.P.kid&&Math.random()<.5?'whisper':'chat');
        continue; }
      for(const [me,ot] of [[a,b],[b,a]]){ me.face=ot.P.obj.position; const look={x:ot.P.obj.position.x,z:ot.P.obj.position.z};
        if(s.kind==='greet'){ me.st={face:far?undefined:'smile'}; continue; }
        const spk=Math.floor(s.t/3.5)%2===0?a:b, ending=s.t>s.dur-1.5;
        me.st={act:s.kind==='whisper'&&spk===me?'whisper':'chat',talk:spk===me,look,face:far?undefined:'smile'};
        if(ending&&s.laugh===me){ me.st.face=far?undefined:'laugh'; me.st.cover=true; } } }
    if(rain) return;
    socT-=dt; if(socT>0) return; socT=.25;
    const R=walkers.filter(freeW);
    for(let i=0;i<R.length;i++) for(let j=i+1;j<R.length;j++){ const a=R[i], b=R[j]; if(a.soc||b.soc||a.gCD>0||b.gCD>0) continue;
      if(a.P.obj.position.distanceTo(b.P.obj.position)>.9) continue;
      rolls++; if(SOC.length>=8||Math.random()>=.15){ a.gCD=b.gCD=6; continue; } greets++;
      const s={a,b,kind:'greet',t:0,dur:1.5}; a.soc=b.soc=s; a.hold=b.hold=1.5; a.wave=b.wave=1.5; SOC.push(s); } }

  /* ---------- 測試模式 ---------- */
  let dbg=null, dbgVer='';
  const COL=['#e5484d','#3f86d6','#2fb37a','#f2a33a','#9a6fd1','#e06aa8','#1fb3c4','#7a7a7a'];
  function drawRoutes(on){ if(dbg){ root.remove(dbg); dbg.traverse(m=>{ if(m.geometry) m.geometry.dispose(); }); dbg=null; } if(!on) return;
    dbg=new THREE.Group(); const B=curB(); let ci=0; const ball=new THREE.SphereGeometry(.035,8,6), big=new THREE.SphereGeometry(.07,10,8);
    for(const pid in B){ const file=FILES[B[pid].t], g=lotGroup(pid); if(!file||!g) continue; g.updateMatrixWorld(true); const L=lvOf(file,B[pid].lv); if(!L) continue;
      for(const [gn,G] of Object.entries(L.groups)){ const c=new THREE.Color(COL[ci++%COL.length]), m=new THREE.MeshBasicMaterial({color:c,depthTest:false}), lm=new THREE.LineBasicMaterial({color:c,depthTest:false});
        const lines=[]; const inL=[G.door,...(G.in||[])], inW=chain(g,inL,SW_Y); lines.push(inW);
        for(const s of G.stay||[]){ const a=chain(g,[...(s.go||[]),s.at],inW[inW.length-1].y,s.act==='sit'); lines.push([inW[inW.length-1],...a]); if(s.stand){ const b=chain(g,[s.stand],inW[inW.length-1].y); lines.push([inW[inW.length-1],...b]); } }
        const last=inW[inW.length-1]; lines.push(chain(g,[...(G.out||[]),G.door],last.y).reduce((acc,p)=>(acc.push(p),acc),[last]));
        for(const pts of lines){ const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(p=>p.clone().setY(p.y+.01))),lm); ln.renderOrder=999; dbg.add(ln);
          for(const p of pts){ const s=new THREE.Mesh(ball,m); s.position.copy(p); s.renderOrder=999; dbg.add(s); } }
        const d=new THREE.Mesh(big,m); d.position.copy(inW[0]); d.renderOrder=999; dbg.add(d);
        const node=nodeNear(inW[0],pid); if(node>=0){ const N=WALK.nodes[node], c=curbPoint(node,inW[0]); const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(N.x,SW_Y+.01,N.z),...(c?[c.clone().setY(SW_Y+.01)]:[]),inW[0]]),lm); dbg.add(ln); } } }
    root.add(dbg); }
  let routesOn=false;
  function showRoutes(on){ routesOn=on==null?!routesOn:!!on; dbgVer=''; drawRoutes(routesOn); return routesOn; }
  function refresh(ver){ if(routesOn&&ver!==dbgVer){ dbgVer=ver; drawRoutes(true); } }
  /* 叫人去這棟：找最近、符合的人，馬上出發（不管機率、晚上） */
  function sendTo(pid,pref){ const B=curB(); if(!B[pid]||!FILES[B[pid].t]) return '這棟還沒有路線';
    const g=lotGroup(pid); if(!g) return ''; const c=g.position;
    const list=walkers.filter(w=>!w.vis&&!isVip(w)&&!w.gone).sort((a,b)=>a.P.obj.position.distanceTo(c)-b.P.obj.position.distanceTo(c));
    for(const w of list){ if(pref&&!names(w).includes(pref)) continue; if(w.soc){ w.soc.t=w.soc.dur; } if(start(w,pid,true)) return (role(w)||w.P.kind)+' → '+w.vis.gname; }
    return '沒有適合的人'+(o.debug?':'+list.slice(0,6).map(w=>names(w)[1]+'='+w._why).join(','):''); }
  /* 表情：所有人輪流換（8 秒） */
  let faceT=0; function faceTest(){ faceT=8; }
  function faceTick(dt){ if(faceT<=0) return; faceT-=dt; const F=['normal','smile','laugh','calm'], f=faceT>0?F[Math.floor((8-faceT)/2)%4]:null; for(const w of walkers) w.faceForce=f; }
  /* 聊天：附近的人馬上兩兩聊天 */
  function chatTest(){ const R=walkers.filter(freeW); let n=0; while(R.length>1&&n<4){ const a=R.shift(); R.sort((x,y)=>x.P.obj.position.distanceTo(a.P.obj.position)-y.P.obj.position.distanceTo(a.P.obj.position)); const b=R.shift();
      a.face=b.P.obj.position; b.face=a.P.obj.position; startChat(a,b,a.P.kid&&b.P.kid?'whisper':'chat'); n++; } return n; }
  /* 覆核用：每棟每組的路線點（世界座標＋量到的高度），以及離格子中心的距離 */
  function audit(){ const B=curB(), out=[];
    for(const pid in B){ const file=FILES[B[pid].t], g=lotGroup(pid); if(!file||!g) continue; g.updateMatrixWorld(true); const L=lvOf(file,B[pid].lv); if(!L) continue; const h=hexOf(pid);
      for(const [gn,G] of Object.entries(L.groups)){ const lines=[]; const inW=chain(g,[G.door,...(G.in||[])],SW_Y); lines.push(['in',inW]);
        for(const [i,st] of (G.stay||[]).entries()){ lines.push(['stay'+i,chain(g,[...(st.go||[]),st.at],inW[inW.length-1].y,st.act==='sit')]); if(st.stand) lines.push(['stand'+i,chain(g,[st.stand],inW[inW.length-1].y)]); }
        lines.push(['out',chain(g,[...(G.out||[]),G.door],inW[inW.length-1].y)]);
        const node=nodeNear(inW[0],pid), N=node>=0?WALK.nodes[node]:null, c=node>=0?curbPoint(node,inW[0]):null;
        /* 穿東西檢查：每一段在腳踝、腰的高度水平射一條線，碰到建築的東西就記下來（進門的最後一段不算） */
        const hits=[]; for(const [k,pts] of lines){ for(let j=1;j<pts.length;j++){ if(k==='in'&&G.inside&&j===pts.length-1) continue; const a=pts[j-1], bb=pts[j], d=Math.hypot(bb.x-a.x,bb.z-a.z); if(d<.02) continue;
            for(const hh of [.12,.3]){ const o=V(a.x,Math.max(a.y,bb.y)+hh,a.z), dir=V(bb.x-a.x,0,bb.z-a.z).normalize(); ray.set(o,dir); ray.far=d; const hit=ray.intersectObject(g,true).find(i=>i.object.isMesh&&visible(i.object));
              if(hit){ hits.push(k+'#'+j+'@'+hh+':'+(hit.object.name||hit.object.geometry.type)+':'+hit.distance.toFixed(2)+'/'+d.toFixed(2)); break; } } } }
        out.push({pid,t:B[pid].t,lv:B[pid].lv,g:gn,hits,doorToWalk:N?+Math.hypot((c||N).x-inW[0].x,(c||N).z-inW[0].z).toFixed(2):-1,
          lines:lines.map(([k,pts])=>[k,pts.map(p=>[+p.x.toFixed(2),+p.y.toFixed(3),+p.z.toFixed(2),h?+Math.hypot(p.x-h.x,p.z-h.z).toFixed(2):0])])}); } }
    return out; }
  const stats=()=>({files:Object.keys(FILES),visits:active().map(w=>({who:role(w)||w.P.kind,pid:w.vis.pid,g:w.vis.gname,phase:w.vis.phase,act:w.vis.act,y:+w.P.obj.position.y.toFixed(3),vis:w.P.obj.visible,fade:!!w.P._fm})),soc:SOC.map(s=>s.kind),rolls,greets,free:walkers.filter(freeW).length});
  const trace=()=>active().map(w=>({g:w.vis.gname,ph:w.vis.phase,i:w.vis.i,n:w.vis.pts.length,bi:w.vis.bi,p:w.P.obj.position.toArray().map(x=>+x.toFixed(2)),hold:w.hold,wait:w.wait,wave:w.wave,soc:!!w.soc}));
  return { audit, trace, update, step, social, faceTick, showRoutes, refresh, sendTo, faceTest, chatTest, stats, files:FILES };
}
