/* Winston City 第二階段：火車站（1 格，南邊交通區）＋繞地圖外圍一圈的鐵路（家長 2026-11-18 12:40 同意）
   Lv1 小車站：木造小站（深咖啡木頭＋米白窗框＋灰黑屋頂）、一個月台、兩節橘色電車繞城一圈（家長 11-18 12:57 車廂改橘色）
   Lv2 大車站：深咖啡木牆＋灰黑屋頂的兩層樓（和小車站同色調）＋中間鐘塔「木星車站」、兩個月台＋第二條軌道、天橋；站前廣場停公車；三節電車，第二條軌道停一列等待的電車
   Lv3 高鐵站：玻璃大廳＋白色拱形玻璃頂罩住月台，「木星高鐵站」；白底橘條子彈列車（車站有橘色點綴）和電車兩班交替進站
   鐵路：蓋了火車站才出現。外圍一圈圓角長方形，全部在 50 格外面；跨過河兩次（西北、西南各一座紅色鐵橋），
         碼頭前用低矮木橋跨過碼頭水道（有碼頭才有水道）。火車每次經過車站都會停一下再開走。
   座標：車站群組以格子中心為原點、正門朝 +z（朝鐵路）。鐵路群組用世界座標。
   STN.rail、STN.riverPath… 由 index.html 填。 */
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { pack } from './s1_kit.js';   /* 11-19 22:3x：火車和公車的模型搬到 models_data2.js 之後，這裡還在讀 models_data.js，所以遊戲裡看不到火車 */
import { ROOT, add, rbox, cyl, sphere, mat, prism, hip, tree, bush, lamp, bench, clock, textPlate, anims, glassMat } from './lib.js';

export const STN={ fixT:null, rail:null, riverPath:null, riverZ:[0,0], coastZ:null, dz:8.6 };   // dz：車站格子中心到南邊鐵軌的距離（index 每次畫之前填）
const WOOD='#6e4b33', WOODL='#8a6244', CREAMW='#f3e6cc', TRIM='#7a5236', SLATE='#4d5563', BRICK='#9c4a3a', PLAT='#d9d2c4', SKY='#5bb8ec', SKYD='#2f8fcf';
const ORG='#f08a24';   // ORG：高鐵站的橘色（家長 11-18 12:55）   // 11-19 23:50：第二條軌道拿掉，SID 不用了

/* 兩種配色（家長 11-19：火車站咖啡色要調好看一點，或者改成配合 Lv3 高鐵的橘／灰／白）
   'b'＝原本的深咖啡木造；'o'＝白牆＋灰屋頂＋橘色腰帶，和高鐵站同一家族 */
const SB={wall:'#7a5438',wall2:'#9a7150',trim:'#f0e4cc',band:'#c98a3c',roof:'#4d5563',base:'#cfc4b2',door:'#5a3a26',sbg:'#f7ecd8',stx:'#5a3a26',top:'#f2c14e'};
const SO={wall:'#edeff2',wall2:'#dfe3e8',trim:'#f8f9fb',band:ORG,roof:'#6b7280',base:'#d7dade',door:'#39414d',sbg:ORG,stx:'#ffffff',top:ORG};
export let SSTYLE='o';   /* 家長 11-19 22:5x 選 B：白牆＋灰屋頂＋橘色腰帶，和高鐵站同一家族 */ export function setStationStyle(k){ SSTYLE=k; }
const P=()=>SSTYLE==='o'?SO:SB;
function grp(x,y,z,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||ROOT).add(g); return g; }
function sign(txt,w,h,bg,fg,x,y,z,ry=0,parent){ const g=grp(x,y,z,ry,parent); const cv=document.createElement('canvas'); cv.width=512; cv.height=Math.round(512*h/w);
  const c=cv.getContext('2d'); c.fillStyle=bg; c.fillRect(0,0,cv.width,cv.height); c.fillStyle=fg; const fs=Math.min(cv.height*.7,470/txt.length*1.05);
  c.font=`bold ${fs}px "PingFang TC","Noto Sans CJK TC","Noto Sans TC",sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(txt,256,cv.height/2+3);
  const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
  rbox(w+.08,h+.08,.05,'#3b3550',0,-.04,-.03,.02,g); const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.8})); p.position.set(0,h/2,.0); g.add(p); return g; }

/* ---------- 鐵路路線：圓角長方形 ---------- */
function segs(R){ const {x0,x1,z0,z1,r}=R, a=x1-x0-2*r, b=z1-z0-2*r, q=Math.PI*r/2;
  return [ {k:'L',p:[x0+r,z0],d:[1,0],len:a}, {k:'A',c:[x1-r,z0+r],t0:-Math.PI/2,len:q}, {k:'L',p:[x1,z0+r],d:[0,1],len:b}, {k:'A',c:[x1-r,z1-r],t0:0,len:q},
           {k:'L',p:[x1-r,z1],d:[-1,0],len:a}, {k:'A',c:[x0+r,z1-r],t0:Math.PI/2,len:q}, {k:'L',p:[x0,z1-r],d:[0,-1],len:b}, {k:'A',c:[x0+r,z0+r],t0:Math.PI,len:q} ]; }
let SEG=null, LEN=0;
function initPath(){ if(SEG&&SEG.R===STN.rail) return; SEG=segs(STN.rail); SEG.R=STN.rail; LEN=SEG.reduce((s,g)=>s+g.len,0); }
export function railAt(u){ initPath(); u=((u%LEN)+LEN)%LEN; const r=STN.rail.r;
  for(const g of SEG){ if(u<=g.len||g===SEG[SEG.length-1]){ if(g.k==='L') return {x:g.p[0]+g.d[0]*u,z:g.p[1]+g.d[1]*u,tx:g.d[0],tz:g.d[1]};
      const th=g.t0+u/r; return {x:g.c[0]+r*Math.cos(th),z:g.c[1]+r*Math.sin(th),tx:-Math.sin(th),tz:Math.cos(th)}; } u-=g.len; } }
/* 離鐵路有多遠（給 index 把山壓平） */
export function railDist(R,x,z){ const cx=(R.x0+R.x1)/2, cz=(R.z0+R.z1)/2, hx=(R.x1-R.x0)/2-R.r, hz=(R.z1-R.z0)/2-R.r;
  const qx=Math.abs(x-cx)-hx, qz=Math.abs(z-cz)-hz; return Math.abs(Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-R.r); }
/* 南邊直線上某個 x 對應的 u */
const uSouth=x=>{ initPath(); const R=STN.rail, a=R.x1-R.x0-2*R.r, b=R.z1-R.z0-2*R.r, q=Math.PI*R.r/2; return a+q+b+q+(R.x1-R.r-x); };

/* ---------- 軌道的長條模型：沿著一串取樣點長出「上面＋兩側」 ---------- */
function strip(S,off,w,yTop,h,material,parent){ const pos=[], idx=[];
  S.forEach((s,i)=>{ const nx=-s.tz, nz=s.tx, a=off-w/2, b=off+w/2, y=s.y+yTop;
    pos.push(s.x+nx*a,y-h,s.z+nz*a, s.x+nx*a,y,s.z+nz*a, s.x+nx*b,y,s.z+nz*b, s.x+nx*b,y-h,s.z+nz*b);
    if(i){ const p=(i-1)*4, c=i*4; for(const [m,n] of [[0,1],[1,2],[2,3]]) idx.push(p+m,c+m,p+n, p+n,c+m,c+n); } });
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
  const m=new THREE.Mesh(g,material); m.castShadow=false; m.receiveShadow=true; parent.add(m); return m; }
function sleepers(S,every,parent){ const n=Math.floor(S.length/every), im=new THREE.InstancedMesh(new THREE.BoxGeometry(.2,.06,1.15),mat('#9a7650'),n), o=new THREE.Object3D();
  for(let i=0;i<n;i++){ const s=S[i*every]; o.position.set(s.x,s.y+.135,s.z); o.rotation.set(0,Math.atan2(-s.tz,s.tx),0); o.updateMatrix(); im.setMatrixAt(i,o.matrix); }
  im.receiveShadow=true; parent.add(im); }
const BALLAST=mat('#c2b8a8',{roughness:1,side:THREE.DoubleSide}), RAILM=mat('#9aa0aa',{metalness:.5,roughness:.35,side:THREE.DoubleSide});
function track(S,parent,ballast=true){ if(ballast) strip(S,0,1.5,.1,.14,BALLAST,parent); sleepers(S,1,parent); for(const o of [-.38,.38]) strip(S,o,.07,.22,.08,RAILM,parent); }

/* ---------- 火車 ---------- */
let TRAM=null;
function tramModel(){ if(TRAM) return TRAM; const p='models/transport/Train.obj';
  TRAM=pack(p).then(async M=>{ const o=M[p]?new OBJLoader().parse(M[p].slice(1)):await new OBJLoader().loadAsync(p);
    const C={Outside:ORG,Top:'#eef3f7',Windows:'#24344a',Black:'#2b2b33'};
    o.traverse(m=>{ if(!m.isMesh) return; const f=mm=>mat(C[mm.name]||SKY,{flatShading:true,roughness:mm.name==='Windows'?.25:.7}); m.material=Array.isArray(m.material)?m.material.map(f):f(m.material); m.castShadow=false; m.receiveShadow=true; });   /* 家長 11-25：會動的不投影子 */
    const w=new THREE.Group(); w.add(o); w.rotation.y=Math.PI/2; const b=new THREE.Box3().setFromObject(w), sz=b.getSize(new THREE.Vector3()); w.scale.setScalar(3.0/sz.x);
    const b2=new THREE.Box3().setFromObject(w), c=b2.getCenter(new THREE.Vector3()); w.position.set(-c.x,-b2.min.y,-c.z); return w; });
  return TRAM; }
function tramCar(){ const g=new THREE.Group(); tramModel().then(w=>g.add(w.clone(true))); g.userData.len=3.0; return g; }
/* 子彈列車（程式畫）：白車身、藍色腰帶、深色窗帶；lead＝車頭方向 +x（-1 是車尾往 -x） */
function bulletCar(lead=0){ const g=new THREE.Group(), L=3.2, W=.86, Hh=.8, body=lead?2.2:L, x0=lead<0?L/2-body:-L/2, xc=x0+body/2;
  rbox(body,Hh,W,'#f6f7f9',xc,.12,0,.18,g); rbox(body+.01,.1,W+.01,ORG,xc,.3,0,.04,g); rbox(body+.01,.16,W+.01,'#22324a',xc,.6,0,.06,g);
  rbox(body-.2,.08,.5,'#d9dde3',xc,.92,0,.04,g);
  for(let x=x0+.15;x<x0+body-.5;x+=1.0) rbox(.5,.1,W-.1,'#3a3f48',x+.25,.02,0,.03,g);   // 轉向架
  if(lead){ const nx=lead>0?L/2-1.0:-L/2+1.0, nose=sphere(1,'#f6f7f9',nx,.12+Hh*.46,0,{},g); nose.scale.set(1.0,Hh*.48,W*.5);
    const st=sphere(1,ORG,nx,.35,0,{},g); st.scale.set(.985,.06,W*.505);
    const ws=sphere(1,'#22324a',nx+(lead>0?.18:-.18),.12+Hh*.7,0,{roughness:.2},g); ws.scale.set(.5,.15,W*.36); }
  g.userData.len=L; return g; }
/* 一列車：cars 由前到後 */
/* 家長 11-25：南邊新三格底下那一段鐵路地下化（index 填 STN.tunnels＝[[x 起, x 迄]]），火車開進去就看不到 */
export const inTunnel=p=>!!STN.tunnels&&!!STN.rail&&Math.abs(p.z-STN.rail.z1)<.6&&STN.tunnels.some(([a,b])=>p.x>a&&p.x<b);
/* 家長 11-25 23:03：轉彎、上下坡時車廂歪掉、分開 → 照真的火車：每節車廂前後各一組轉向架壓在鐵軌上，
   車身擺在兩組轉向架中間、朝向兩組轉向架的連線（轉彎時車身就順著彎道，下坡時車頭往下）；車廂之間有連結的通道 */
const BOG=.64;   // 轉向架間距佔車長的比例
const tmpA=new THREE.Vector3(), tmpB=new THREE.Vector3();
function bogie(u){ const p=railAt(u); return {x:p.x,z:p.z,y:STN.yOf?STN.yOf(u):0}; }
function placeCar(c,uf){ const L=c.userData.len, B=L*BOG, ur=uf-B, f=bogie(uf), r=bogie(ur);
  const dx=f.x-r.x, dz=f.z-r.z, dh=Math.hypot(dx,dz)||1e-6, cx=(f.x+r.x)/2, cz=(f.z+r.z)/2, cy=(f.y+r.y)/2;
  const yaw=Math.atan2(-dz,dx), pitch=Math.atan2(f.y-r.y,dh);
  c.rotation.order='YZX'; c.rotation.set(0,yaw,pitch); c.position.set(cx,cy+.24,cz); c.visible=!inTunnel({x:cx,z:cz});
  const ux=dx/dh, uz=dz/dh, cp=Math.cos(pitch), sp=Math.sin(pitch), h=L/2;   // 車頭、車尾的連結點
  const e=[{x:cx+ux*h*cp,y:cy+.24+.42+h*sp,z:cz+uz*h*cp},{x:cx-ux*h*cp,y:cy+.24+.42-h*sp,z:cz-uz*h*cp},c.visible,ur]; e.d={x:ux*cp,y:sp,z:uz*cp}; return e; }
const gapOf=(p,b)=>{ const a=p[1], d=p.d; return (a.x-b.x)*d.x+(a.y-b.y)*d.y+(a.z-b.z)*d.z; };   // 沿著前一節車身方向量：正的是隔開、負的是撞進去
/* 家長 11-26 00:35：車廂不能脫節 → 後面每一節都去「接」前一節的車尾：調整位置直到兩節的連結點距離剛好等於 gap（上下坡、轉彎都一樣） */
function placeTrain(cars,uFront,gap=.12,links=[]){ const ends=[]; let prev=null;
  for(const c of cars){ const L=c.userData.len, B=L*BOG;
    let uf=prev?prev[3]-(prev.L-prev.B)/2-gap-(L-B)/2:uFront-(L-B)/2, e=placeCar(c,uf);
    if(prev) for(let k=0;k<5;k++){ const g=gapOf(prev,e[0]); if(Math.abs(g-gap)<.004) break; uf+=g-gap; e=placeCar(c,uf); }
    e.L=L; e.B=B; ends.push(e); prev=e; }
  links.forEach((k,i)=>{ const a=ends[i][1], b=ends[i+1][0]; tmpA.set(a.x,a.y,a.z); tmpB.set(b.x,b.y,b.z);
    const len=tmpA.distanceTo(tmpB); k.position.copy(tmpA).add(tmpB).multiplyScalar(.5); k.scale.set(len+.3,1,1);
    k.rotation.order='YZX'; k.rotation.set(0,Math.atan2(-(b.z-a.z),b.x-a.x),Math.atan2(b.y-a.y,Math.hypot(b.x-a.x,b.z-a.z)));
    k.visible=ends[i][2]&&ends[i+1][2]; }); }
/* 車廂之間的連結通道（深灰色的風擋） */
function link(){ const m=new THREE.Mesh(new THREE.BoxGeometry(1,.62,.62),mat('#3a3d45',{roughness:.9})); m.castShadow=false; return m; }
const ease=x=>x-Math.sin(2*Math.PI*x)/(2*Math.PI);

/* 引道和隧道口（家長 11-25）：不管有沒有蓋火車站都要有（地面已經挖開），所以跟地面一起畫一次，不放在鐵路裡 */
export function buildTrench(){ initPath(); const G=new THREE.Group(), R=STN.rail, TR=STN.trench||{w:0,e:0,d:0}, a0=STN.tunnels&&STN.tunnels[0]; if(!a0) return G;
  const sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t), dip=p=>{ let y=0; for(const [a,b] of STN.tunnels){ const k=p.x<a?1-sm((a-p.x)/TR.w):p.x>b?1-sm((p.x-b)/TR.e):1; y=Math.min(y,-TR.d*k); } return y; };
  const S=[]; { const N=Math.ceil(LEN/.4); for(let i=0;i<=N;i++){ const u=i*LEN/N, p=railAt(u); if(Math.abs(p.z-R.z1)<.6) S.push({...p,y:dip(p),u}); } }
  /* 引道：水泥 U 形槽，兩邊擋土牆頂和地面一樣高，槽底跟著鐵軌往下陷（台灣鐵路地下化的引道就是這樣）；隧道口是一面水泥牆，中間黑色洞口 */
  const CON=mat('#c9c3b8',{roughness:.95}), CON2=mat('#9f998e',{roughness:.95}), DARK=mat('#1e1b24',{roughness:1});
  for(const [a,b] of STN.tunnels){
    const Sw=S.filter(s=>Math.abs(s.z-R.z1)<.6&&((s.x>=a-TR.w-.6&&s.x<=a+.2)||(s.x>=b-.2&&s.x<=b+TR.e+.6))).sort((p,q)=>p.x-q.x);
    const runs=[Sw.filter(s=>s.x<=a+.2),Sw.filter(s=>s.x>=b-.2)];
    for(const run of runs){ if(run.length<2) continue; strip(run,0,2.5,.02,1.7,CON2,G);   // 槽底（側面往下延伸，從斜上方看不會穿幫）
      const east=run[0].x>=b-.3;
      for(const side of [-1,1]){ const x0=east?b-.4:a-TR.w-.4, x1=east?b+TR.e+.4:a+.4, /* 擋土牆蓋滿整段挖開的地，跟隧道口牆接起來 */ w=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,TR.d+.45,.22),CON); w.position.set((x0+x1)/2,.12-(TR.d+.45)/2,R.z1+side*1.36); w.castShadow=true; w.receiveShadow=true; G.add(w);
        const cap=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,.06,.32),mat('#e2ddd3',{roughness:.9})); cap.position.set((x0+x1)/2,.14,R.z1+side*1.36); G.add(cap); } }
    for(const [x,dir] of [[a,-1],[b,1]]){   // dir：引道在隧道口的哪一邊
      const hw=new THREE.Mesh(new THREE.BoxGeometry(.4,TR.d+.7,3.1),CON); hw.position.set(x-dir*.2,.35-(TR.d+.7)/2+.1,R.z1); hw.castShadow=true; hw.receiveShadow=true; G.add(hw);
      const top=new THREE.Mesh(new THREE.BoxGeometry(.6,.12,3.3),mat('#e2ddd3',{roughness:.9})); top.position.set(x-dir*.2,.5,R.z1); G.add(top);
      const hole=new THREE.Mesh(new THREE.BoxGeometry(.12,1.25,1.9),DARK); hole.position.set(x+dir*.05,-TR.d+.6,R.z1); G.add(hole); } }
  return G; }
/* ---------- 鐵路本體：index 在 renderCity 時呼叫，回傳一個群組（世界座標） ---------- */
export function buildRail({lv,stationX,pier}){ initPath(); const G=new THREE.Group(); const R=STN.rail;
  // 橋：河（西北、西南）＋碼頭水道
  const bridges=[];
  { const N=Math.ceil(LEN/.5); let prev=null; const [zA,zB]=STN.riverZ;
    for(let i=0;i<=N;i++){ const u=i*LEN/N, p=railAt(u); if(p.z<zA||p.z>zB||!STN.riverPath){ prev=null; continue; } const s=Math.sign(p.x-STN.riverPath(p.z));
      if(prev!==null&&s!==prev) bridges.push({u,kind:'river'}); prev=s; } }
  /* 11-19 23:44：碼頭搬到鐵軌外面的新格子，原本的碼頭水道和木橋不用了 */
  const RISE=.42, FLAT={river:2.4}, RAMP=3.2, sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
  /* 地下化（家長 11-25 17:14）：引道一路往下陷到 d，進隧道；出來再慢慢爬上來 */
  const TR=STN.trench||{w:0,e:0,d:0}, dip=p=>{ if(!STN.tunnels||Math.abs(p.z-R.z1)>.6) return 0; let y=0;
    for(const [a,b] of STN.tunnels){ const k=p.x<a?1-sm((a-p.x)/TR.w):p.x>b?1-sm((p.x-b)/TR.e):1; y=Math.min(y,-TR.d*k); } return y; };
  STN.yOf=u=>{ let y=0; for(const b of bridges){ let d=Math.abs(u-b.u); d=Math.min(d,LEN-d); y=Math.max(y,RISE*(1-sm((d-FLAT[b.kind])/RAMP))); } return y+dip(railAt(u)); };
  const S=[]; { const N=Math.ceil(LEN/.55); for(let i=0;i<=N;i++){ const u=i*LEN/N, p=railAt(u); S.push({...p,y:STN.yOf(u),u}); } }
  { let run=[]; for(const s of S){ if(inTunnel(s)&&s.y<-.2){ if(run.length>1) track(run,G); run=[]; } else run.push(s); } if(run.length>1) track(run,G); }   // 地下化那一段不畫鐵軌
  // 橋身：河上紅色鐵橋（兩側鈑梁＋白欄杆＋橋墩），碼頭前咖啡色木橋
  for(const b of bridges){ const half=FLAT[b.kind]+.6, Sb=S.filter(s=>{ let d=Math.abs(s.u-b.u); d=Math.min(d,LEN-d); return d<=half; }).sort((a,c)=>((a.u-b.u+LEN*1.5)%LEN)-((c.u-b.u+LEN*1.5)%LEN));
    const red=b.kind==='river', c1=red?'#c8473a':'#8a6244';
    for(const o of [-.85,.85]){ strip(Sb,o,.12,red?.62:.4,red?.5:.3,mat(c1,{side:THREE.DoubleSide}),G); if(red) strip(Sb,o,.05,.92,.04,mat('#f4f1ea',{side:THREE.DoubleSide}),G); }
    strip(Sb,0,1.8,.06,.14,mat(red?'#9a3a30':'#6e4b33',{side:THREE.DoubleSide}),G);
    const p=railAt(b.u), y=STN.yOf(b.u); for(const k of [-1.3,1.3]){ const q=railAt(b.u+k); const pl=cyl(.22,.26,y+.4,red?'#b9b2a6':'#6e4b33',q.x,-.35,q.z,10,G); }
    if(red) for(let k=-2;k<=2;k++){ const q=railAt(b.u+k*.85), yy=STN.yOf(b.u+k*.85); for(const o of [-.85,.85]){ const m=new THREE.Mesh(new THREE.BoxGeometry(.06,.5,.06),mat('#f4f1ea')); m.position.set(q.x-q.tz*o,yy+.66+.25,q.z+q.tx*o); G.add(m); } }
  }
  /* 家長 11-19 23:50：第二條軌道拿掉。Lv2 只留一個月台，天橋也拿掉，升級的是站房本身 */
  const sx=stationX, uS=uSouth(sx);
  // 火車：Lv1 兩節電車；Lv2 三節電車＋第二條軌道停一列；Lv3 子彈列車＋電車兩班交替
  const RUN=42, DWELL=5, TC=RUN+DWELL, sets=[];
  const mk=list=>{ list.forEach(c=>G.add(c)); list.links=list.slice(1).map(()=>{ const k=link(); G.add(k); return k; }); return list; };
  if(lv===1) sets.push({cars:mk([tramCar(),tramCar()]),ph:0});
  if(lv===2) sets.push({cars:mk([tramCar(),tramCar(),tramCar()]),ph:0});
  if(lv>=3){ sets.push({cars:mk([bulletCar(1),bulletCar(0),bulletCar(-1)]),ph:0}); sets.push({cars:mk([tramCar(),tramCar()]),ph:TC/2}); }
  for(const s of sets){ s.len=s.cars.reduce((a,c)=>a+c.userData.len+.12,0)-.12; s.stop=uS+s.len/2; }   // 車頭停在車站中間往前半列車長
  /* 家長 11-26 14:24：鐵路西邊（河邊）、北邊（山腳）、東邊（海邊）各加一個簡單的小站，火車每站停一下。
     小站蓋在鐵軌靠城市那一側的草地上（西邊那站如果靠河就改到另一側），不碰到六角格 */
  const a=R.x1-R.x0-2*R.r, b=R.z1-R.z0-2*R.r, q=Math.PI*R.r/2, zm=(R.z0+R.z1)/2;
  const flatAt=u=>{ for(let d=-2.2;d<=2.2;d+=.2) if(Math.abs(STN.yOf(u+d))>.001) return false; return true; };
  const halts=[['河邊站',2*a+b+3*q+((R.z1-R.r)-(zm-6))],['山腳站',(13-(R.x0+R.r))],['海邊站',a+q+((zm-4)-(R.z0+R.r))]].map(([nm,u])=>{ let k=0; while(!flatAt(u)&&k<40){ u+=(k%2?1:-1)*(k+1)*.4; k++; } return [nm,((u%LEN)+LEN)%LEN]; });
  for(const [nm,u] of halts){ const p=railAt(u), tx=p.tx, tz=p.tz; let nx=-tz, nz=tx; if(nx*(0-p.x)+nz*(zm-p.z)<0){ nx=-nx; nz=-nz; }
    if(STN.riverPath&&p.z>STN.riverZ[0]&&p.z<STN.riverZ[1]&&Math.abs(p.x+nx*1.3-STN.riverPath(p.z))<2.4){ nx=-nx; nz=-nz; }
    const hg=new THREE.Group(); hg.position.set(p.x+nx*1.22,0,p.z+nz*1.22); hg.rotation.y=Math.atan2(-tz,tx); G.add(hg);
    const sd=Math.sign(-nx*tz+nz*tx)||1;   // 月台在車廂的哪一邊（本地 z 的正負）
    rbox(3.4,.3,.86,'#cfc8bb',0,0,0,.03,hg); rbox(3.4,.02,.1,'#f2c230',0,.3,-sd*.36,.004,hg);   // 月台、黃色警戒線
    for(const x of [-.75,.75]) for(const z of [.05,.3]) cyl(.035,.035,1.05,'#4d5566',x,.3,sd*z,8,hg);   // 柱子
    const rf=rbox(2.1,.07,.62,'#3b6ea8',0,1.35,sd*.17,.02,hg); rf.rotation.x=-sd*.12;              // 斜的藍色屋頂
    rbox(.8,.05,.18,'#c98d55',0,.46,sd*.3,.01,hg); rbox(.8,.16,.04,'#c98d55',0,.52,sd*.38,.01,hg);   // 長椅
    for(const x of [-.3,.3]) rbox(.05,.16,.16,'#6d6a7d',x,.3,sd*.3,.01,hg);
    { const cv=document.createElement('canvas'); cv.width=256; cv.height=96; const c2=cv.getContext('2d'); c2.fillStyle='#ffffff'; c2.fillRect(0,0,256,96); c2.fillStyle='#24476e'; c2.font='bold 62px "PingFang TC","Noto Sans TC",sans-serif'; c2.textAlign='center'; c2.textBaseline='middle'; c2.fillText(nm,128,52);
      const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; const sg=new THREE.Group(); sg.position.set(1.35,.3,sd*.2); hg.add(sg);
      for(const x of [-.36,.36]) cyl(.025,.025,.95,'#4d5566',x,0,0,8,sg); rbox(.86,.34,.05,'#24476e',0,.86,0,.01,sg);
      for(const s3 of [1,-1]){ const pl=new THREE.Mesh(new THREE.PlaneGeometry(.8,.3),new THREE.MeshStandardMaterial({map:t,roughness:.8})); pl.position.set(0,1.03,s3*.03); if(s3<0) pl.rotation.y=Math.PI; sg.add(pl); } } }
  /* 時刻表：從大車站出發 → 每個小站停 3 秒 → 回大車站停 5 秒 */
  const HALT=3, legs=[]; { const ks=halts.map(([,u])=>((u-uS)%LEN+LEN)%LEN).sort((x,y)=>x-y); let prev=0;
    for(const k of [...ks,LEN]){ const len=k-prev, dur=Math.max(4,RUN*len/LEN); legs.push({f0:prev,len,dur,dwell:k===LEN?DWELL:HALT}); prev=k; } }
  const TC2=legs.reduce((s2,l)=>s2+l.dur+l.dwell,0);
  const fAt=tau=>{ for(const l of legs){ if(tau<l.dur) return l.f0+l.len*ease(tau/l.dur); tau-=l.dur; if(tau<l.dwell) return l.f0+l.len; tau-=l.dwell; } return LEN; };
  for(const s2 of sets) s2.ph=s2.ph?TC2/2:0;
  const step=t=>{ for(const s of sets){ const tau=((t+s.ph)%TC2+TC2)%TC2; placeTrain(s.cars,s.stop+fAt(tau),.12,s.cars.links); } };
  step(0); anims.push((t)=>step(STN.fixT!=null?STN.fixT:t));
  /* 平交道（家長 11-19 23:44）：碼頭的人行道穿過鐵軌的地方；火車靠近就放下柵欄、紅燈交替閃 */
  if(pier){ const cx=pier.x, uC=uSouth(cx), cz=R.z1, cross=[];
    rbox(2.9,.05,2.0,'#d9d3c7',cx,.235,cz,.02,G);                                        // 鋪面（蓋過道碴和枕木）
    /* 號誌柱照家長 11-20 07:55 給的參考圖：黑橘相間的柱子＋喇叭形底座、黑色控制箱（咖啡色斜帶）、
       兩個黑色燈罩的紅燈、上面黑橘格子的 X 形標誌、旁邊伸出一支紅色警示燈 */
    const boxTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g2=c.getContext('2d');
      g2.fillStyle='#22242a'; g2.fillRect(0,0,64,64); g2.fillStyle='#6b4a2a'; g2.beginPath(); g2.moveTo(0,64); g2.lineTo(64,12); g2.lineTo(64,64); g2.closePath(); g2.fill();
      g2.fillStyle='#c0392b'; g2.fillRect(44,6,12,4);
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const boxM=new THREE.MeshStandardMaterial({map:boxTex,roughness:.75});
    const ORGB='#e8821f', BLK='#1d1f24';
    for(const s2 of [-1,1]){ const g=grp(cx+1.15,0,cz+s2*(s2>0?2.05:1.62),0,G);   /* 家長 11-26：碼頭這側的號誌移到螃蟹招牌後面（從城市這邊看過去，不擋到螃蟹招牌） */
      cyl(.2,.3,.07,BLK,0,.2,0,16,g); cyl(.09,.16,.1,BLK,0,.27,0,14,g);                       // 喇叭形底座
      for(let i=0;i<8;i++) cyl(.048,.05,.19,i%2?ORGB:BLK,0,.37+i*.19,0,12,g);                 // 黑橘相間的柱子
      const head=grp(0,0,0,s2>0?0:Math.PI,g);                                                  // 號誌朝向走過來的人
      { const bx=add(new THREE.Mesh(new THREE.BoxGeometry(.3,.4,.19),boxM),head); bx.position.set(0,.78,.04);   // 控制箱
        rbox(.33,.03,.22,BLK,0,.98,.04,.01,head); }
      { rbox(.5,.045,.045,BLK,0,1.33,.05,.015,head);                                           // 兩個燈
        const lm=()=>new THREE.MeshStandardMaterial({color:'#7d2420',emissive:new THREE.Color('#ff3b30'),emissiveIntensity:.12,roughness:.45});
        const m1=lm(), m2=lm();
        for(const [sx,mm] of [[-1,m1],[1,m2]]){ const lg=grp(sx*.23,1.3,.07,sx*.26,head);
          const hood=cyl(.095,.105,.07,BLK,0,0,0,14,lg); hood.rotation.x=Math.PI/2; hood.position.set(0,0,0);
          const lens=cyl(.068,.068,.025,mm,0,0,0,14,lg); lens.rotation.x=Math.PI/2; lens.position.z=.05;
          const vis=add(new THREE.Mesh(new THREE.CylinderGeometry(.115,.115,.07,14,1,true,Math.PI*.1,Math.PI*.8),mat(BLK)),lg); vis.rotation.x=Math.PI/2; vis.position.z=.03; }
        var LM1=m1, LM2=m2; }
      for(const rz of [.785,-.785]){ const bar=grp(0,1.72,.09,0,head); bar.rotation.z=rz;      // X 形標誌（黑橘格子）
        for(let i=0;i<5;i++) rbox(.19,.125,.035,i%2?BLK:ORGB,-.38+i*.19,-.062,0,.008,bar); }
      { const ax=.42; rbox(.5,.035,.035,'#8a7a5a',ax-.08,1.63,.02,.01,head);                   // 伸出去的紅色警示燈
        cyl(.055,.06,.05,'#8a7a5a',ax+.16,1.6,.02,12,head);
        const bm=new THREE.MeshStandardMaterial({color:'#d33a2c',emissive:new THREE.Color('#ff2a1a'),emissiveIntensity:.3,roughness:.35,transparent:true,opacity:.92});
        cyl(.062,.062,.1,bm,ax+.16,1.65,.02,14,head); cyl(.068,.068,.02,BLK,ax+.16,1.75,.02,14,head);
        var BM=bm; }
      const piv=new THREE.Group(); piv.position.set(0,1.02,0); g.add(piv);                     // 柵欄
      rbox(2.4,.09,.09,'#f4f1ea',-1.2,-.045,0,.02,piv);
      for(let i=0;i<4;i++) rbox(.3,.1,.1,'#c8382e',-.4-i*.6,-.05,0,.02,piv);
      cross.push({piv,m1:LM1,m2:LM2,bm:BM}); }
    anims.push((t,dt)=>{ const tt=STN.fixT!=null?STN.fixT:t; let near=false;
      for(const st of sets){ const tau=((tt+st.ph)%TC2+TC2)%TC2, f=fAt(tau);
        let d=Math.abs((((st.stop+f)-uC)%LEN+LEN)%LEN); d=Math.min(d,LEN-d); if(d<11) near=true; }
      const want=near?0:1.42, k=Math.min(1,(dt||.016)*2.4), fl=near?(Math.sin(tt*7)>0?1:0):0;
      for(const c of cross){ c.piv.rotation.z+=(want-c.piv.rotation.z)*k;
        c.m1.emissiveIntensity=.12+fl*1.6; c.m2.emissiveIntensity=.12+(1-fl)*(near?1.6:0);
        if(c.bm) c.bm.emissiveIntensity=near?.4+Math.abs(Math.sin(tt*5))*1.3:.3; } }); }
  return G; }

/* ---------- 車站共用：通道、月台、雨棚 ---------- */
function walkway(z0,z1,w=1.5){ rbox(w,.06,z1-z0,'#efe6d6',0,.03,(z0+z1)/2,.02); for(let z=z0+.3;z<z1;z+=.45) rbox(w-.1,.012,.18,'#ffffff',0,.09,z,.004); }   // 過馬路的地方畫斑馬線
function platform(zc,w=8.4,d=1.9,col=PLAT){ rbox(w,.42,d,'#b9b0a0',0,0,zc,.03); rbox(w,.06,d,col,0,.42,zc,.02);
  rbox(w-.1,.015,.12,'#f2c230',0,.48,zc+d/2-.2,.005); rbox(w-.1,.015,.12,'#f2c230',0,.48,zc-d/2+.2,.005); }
function canopy(zc,w,d,roofC,postC,y=1.75){ for(let x=-w/2+.4;x<=w/2-.3;x+=1.6) cyl(.05,.05,y-.48,postC,x,.48,zc,8); rbox(w,.08,d,roofC,0,y,zc,.03); rbox(w,.12,.08,postC,0,y-.08,zc+d/2-.04,.02); }
function nameBoard(txt,x,zc,y=.48){ cyl(.03,.03,.8,'#4d5563',x-.55,y,zc,8); cyl(.03,.03,.8,'#4d5563',x+.55,y,zc,8); sign(txt,1.3,.36,'#ffffff','#244873',x,y+.62,zc+.02); }

/* ---------- 每一級 ---------- */
function lv1(){ const dz=STN.dz, pz=dz-1.85, C=P();
  // 站房：木造／白牆兩種配色、屋頂四坡、前面有山牆門廊
  const g=grp(0,0,1.2); rbox(3.4,.14,2.0,C.base,0,0,0,.03,g);
  rbox(3.1,1.15,1.7,C.wall,0,.14,0,.04,g); rbox(3.14,.18,1.74,C.band,0,.14,0,.03,g);
  for(const x of [-1.05,1.05]){ rbox(.6,.55,.04,C.trim,x,.6,.86,.02,g); rbox(.5,.46,.03,'#a8dcf0',x,.645,.88,.02,g).material=glassMat; rbox(.04,.46,.04,C.trim,x,.645,.9,.01,g); }
  for(const x of [-1.2,-.4,.4,1.2]) rbox(.04,1.1,.04,C.wall2,x,.16,.87,.01,g);
  hip(3.6,2.1,.75,C.roof,0,1.29,0,g);
  // 門廊
  rbox(1.3,.06,.8,C.base,0,.14,1.15,.02,g); for(const x of [-.55,.55]) cyl(.05,.05,1.05,C.wall2,x,.2,1.45,8,g);
  prism(1.5,1.0,.55,C.roof,0,1.25,1.25,'z',g); rbox(1.3,.12,.06,C.band,0,1.18,1.74,.02,g);
  { rbox(.72,.95,.05,C.trim,0,.14,.85,.02,g); for(const s of [-1,1]) rbox(.3,.8,.04,'#a8dcf0',s*.16,.2,.885,.015,g).material=glassMat; rbox(.04,.8,.05,C.trim,0,.2,.9,.01,g); }   /* 玻璃門，不要一塊黑的 */
  sign('木星站',1.0,.28,C.sbg,C.stx,0,1.32,1.78,0,g);
  // 站前（後面）小廣場：樹、花、長椅、路燈、腳踏車架
  tree(-2.3,-1.8,.95); tree(2.4,-1.6,.85,'#58b06a'); bush(-1.2,-2.4,.8); bush(1.0,-2.5,.8,'#ffd166'); bush(2.7,.6,.7);
  bench(-2.2,1.9,0); lamp(2.3,2.3); lamp(-2.6,.5);
  for(let i=0;i<3;i++){ const x=1.2+i*.35; cyl(.16,.16,.03,'#2b2b33',x,.3,2.5,16).rotation.x=Math.PI/2; }
  // 通道＋月台＋小雨棚＋站名牌
  walkway(3.0,pz-.95); platform(pz); canopy(pz,3.6,1.1,C.roof,C.wall2); nameBoard('木星站',2.8,pz); bench(-2.6,pz-.2,Math.PI);
}
function lv2(){ const C=P(), LTRIM=C.trim; const dz=STN.dz, pz=dz-1.85;
  // 兩層樓＋中間鐘塔（像新竹站）
  const g=grp(0,0,.9); rbox(5.4,.14,2.3,C.base,0,0,0,.03,g);
  for(const x of [-1.6,1.6]){ rbox(2.0,1.7,1.8,C.wall,x,.14,0,.04,g); rbox(2.04,.12,1.84,C.band,x,.9,0,.02,g); hip(2.2,2.0,.6,C.roof,x,1.84,0,g);
    for(const wx of [-.5,.5]) for(const wy of [.35,1.1]){ rbox(.36,.42,.04,LTRIM,x+wx,wy,.91,.02,g); rbox(.28,.34,.03,'#a8dcf0',x+wx,wy+.04,.93,.02,g).material=glassMat; } }
  rbox(1.3,2.6,1.6,C.wall,0,.14,.1,.04,g); rbox(1.34,.14,1.64,C.band,0,1.6,.1,.02,g); rbox(1.4,.16,1.7,LTRIM,0,2.74,.1,.03,g);
  rbox(.9,.7,.9,C.wall,0,2.9,.1,.04,g); hip(1.1,1.1,.6,C.roof,0,3.6,.1,g); sphere(.08,C.top,0,4.25,.1,{metalness:.5,roughness:.3},g);
  clock(.3,g,0,3.25,.56); sign('木星車站',1.15,.3,C.sbg,C.stx,0,1.75,.92,0,g);
  { rbox(.92,1.25,.05,C.trim,0,.14,.88,.02,g); for(const s of [-1,1]) rbox(.38,1.05,.04,'#a8dcf0',s*.21,.2,.915,.015,g).material=glassMat; rbox(.05,1.05,.05,C.trim,0,.2,.93,.01,g); } rbox(1.6,.06,.7,C.roof,0,1.35,1.2,.02,g); for(const x of [-.7,.7]) cyl(.05,.05,1.2,LTRIM,x,.16,1.48,8,g);
  // 站前（後面）廣場：公車、花圃、旗子
  rbox(5.6,.04,1.8,'#e6dfd0',0,.02,-2.1,.02); bus(-1.0,-2.15); bush(1.9,-2.0,.9,'#ff8fa3'); bush(2.6,-2.3,.8,'#ffd166'); tree(-3.0,-.9,.9); tree(3.1,-.7,.85,'#58b06a');
  lamp(2.9,1.9); lamp(-2.9,1.9);
  // 兩個月台＋第二條軌道＋天橋
  walkway(3.0,pz-.95,1.8); platform(pz,9.2); canopy(pz,6.4,1.3,C.roof,LTRIM); nameBoard('木星車站',3.9,pz);
  for(const x of [-3.6,3.6]) bench(x,pz-.25,Math.PI);                                            // 月台長椅（原本第二月台和天橋的位置改放座位）
  for(const x of [-2.2,2.2]) lamp(x,pz-.55);
}
function lv3(){ const dz=STN.dz, pz=dz-1.85;
  // 玻璃大廳：白框、玻璃牆、弧形屋頂
  const g=grp(0,0,.8); rbox(6.0,.14,2.6,'#e4e6ea',0,0,0,.03,g);
  const gl=rbox(5.0,1.7,2.0,'#a8dcf0',0,.14,0,.04,g); gl.material=mat('#a8dcf0',{roughness:.12,metalness:.15,transparent:true,opacity:.75,emissive:0x1d4a5c,emissiveIntensity:.2});
  for(let x=-2.5;x<=2.5;x+=.625) rbox(.06,1.7,2.04,'#f6f7f9',x,.14,0,.01,g);
  const roof=new THREE.Mesh(new THREE.CylinderGeometry(3.0,3.0,5.6,32,1,false,Math.PI/2-.55,1.1),mat('#f6f7f9',{side:THREE.DoubleSide})); roof.rotation.z=Math.PI/2; roof.position.set(0,1.92-3.0*Math.cos(.55),0); add(roof,g);
  rbox(6.0,.1,2.6,'#f6f7f9',0,1.84,0,.03,g); sign('木星高鐵站',1.9,.34,ORG,'#ffffff',0,2.05,1.31,0,g); rbox(5.1,.12,2.1,ORG,0,1.72,0,.02,g); for(const x of [-2.6,2.6]) rbox(.16,1.6,.16,ORG,x,.14,1.0,.03,g);
  { rbox(1.34,1.4,.06,'#f6f7f9',0,.14,1.0,.02,g); for(const sd of [-1,1]) rbox(.56,1.18,.05,'#a8dcf0',sd*.31,.2,1.035,.015,g).material=glassMat; rbox(.07,1.18,.06,ORG,0,.2,1.045,.01,g); }   /* 玻璃自動門，不要一塊黑的 */
  // 站前廣場：公車兩台、樹、路燈
  rbox(6.2,.04,1.6,'#e6dfd0',0,.02,-2.25,.02); bus(-1.4,-2.3); bus(1.6,-2.3,'#f6f7f9'); tree(-3.2,-.6,.9); tree(3.3,-.6,.9,'#58b06a'); lamp(3.0,2.2); lamp(-3.0,2.2);
  // 月台（灰白）＋白色拱形玻璃頂罩住兩個月台和軌道
  walkway(3.0,pz-.95,2.2); platform(pz,10,1.9,'#e9ebee'); nameBoard('木星高鐵站',4.3,pz); rbox(9.9,.05,.18,ORG,0,.44,pz,.01);
  const zc=dz-.45, span=5.8, rr=span/2, L=10.4;
  const arch=new THREE.Mesh(new THREE.CylinderGeometry(rr,rr,L,40,1,true,0,Math.PI),mat('#bfe6f6',{transparent:true,opacity:.35,roughness:.1,side:THREE.DoubleSide,depthWrite:false}));
  arch.rotation.z=Math.PI/2; arch.position.set(0,.5,zc); arch.scale.set(.6,1,1); add(arch).castShadow=false;
  for(let x=-L/2;x<=L/2+.01;x+=1.3){ const rib=new THREE.Mesh(new THREE.TorusGeometry(rr,.06,6,40,Math.PI),mat('#f6f7f9')); rib.position.set(x,.5,zc); rib.rotation.y=Math.PI/2; rib.scale.set(1,.6,1); add(rib); }
  for(const z of [zc-rr,zc+rr]) rbox(L+.2,.22,.22,ORG,0,.48,z,.04);
  for(const z of [pz-.9,dz+1.5]) for(let x=-L/2;x<=L/2+.01;x+=2.6) cyl(.06,.06,.1,'#f6f7f9',x,.48,z,8);
}
function bus(x,z,c=SKY){ const g=grp(x,0,z); const p='models/transport/Bus.obj';
  pack(p).then(async M=>{ const o=M[p]?new OBJLoader().parse(M[p].slice(1)):await new OBJLoader().loadAsync(p);
    const C={Material:c,Top:'#eef3f7',Windows:'#24344a',Bottom:'#2b2b33',Bumper:'#3a3f48',Details:'#2b2b33',Lights:'#fff3c4'};
    o.traverse(m=>{ if(!m.isMesh) return; const f=mm=>mat(C[mm.name]||c,{flatShading:true}); m.material=Array.isArray(m.material)?m.material.map(f):f(m.material); m.castShadow=true; });
    const w=new THREE.Group(); w.add(o); const b=new THREE.Box3().setFromObject(w), sz=b.getSize(new THREE.Vector3()); if(sz.z>sz.x) w.rotation.y=Math.PI/2;
    const b1=new THREE.Box3().setFromObject(w), s1=b1.getSize(new THREE.Vector3()); w.scale.setScalar(2.2/s1.x); const b2=new THREE.Box3().setFromObject(w), cc=b2.getCenter(new THREE.Vector3()); w.position.set(-cc.x,-b2.min.y+.04,-cc.z); g.add(w); });
  return g; }

export const STATION_LV=[[1,'小車站',lv1,'whole'],[2,'大車站',lv2,'whole'],[3,'高鐵站',lv3,'whole']];
export const STATION_TOP=[0,2.6,4.4,3.0];
