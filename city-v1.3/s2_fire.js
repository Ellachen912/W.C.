/* Winston City 第二階段：消防站（半格、1 級、最多 3 間，其他區；家長 2026-11-18 15:27 同意）
   紅白兩層小樓：一樓大車庫（捲門拉起來、停一台紅色消防車＝Kenney Car Kit firetruck）＋辦公室門窗；二樓窗戶＋招牌「木星消防站」；
   屋頂紅色警示燈會慢慢轉；旁邊細長的紅白訓練塔（掛著水管）；門口紅色消防栓、兩個交通錐、地上黃色禁止停車線。
   座標同 s1_more.js 的半格：建地中心為原點、正門朝 +z（朝外面的路）；半格是梯形，後面（z≈-1.55）寬約 ±4，前面（z≈1.7）寬約 ±1.9。 */
import * as THREE from 'three';
import { ROOT, add, rbox, cyl, sphere, mat, tree, bush, anims, wallMat, canvasTex, tiledHip } from './lib.js';
import { kit } from './s1_kit.js';

const RED='#bd6d63', REDD='#89514e', WHITE='#f4ebdc', TRIM='#dfd4c4', GOLDY='#c69b59', DARK='#39424b';
const em=(c,i=.6)=>mat(c,{emissive:new THREE.Color(c),emissiveIntensity:i});
function rectTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
const signTex=rectTex(1024,200,(g,w,h)=>{ g.fillStyle=WHITE; g.fillRect(0,0,w,h); g.strokeStyle=RED; g.lineWidth=10; g.strokeRect(10,10,w-20,h-20);
  g.fillStyle=RED; g.textAlign='center'; g.textBaseline='middle'; g.font=`bold ${h*.58}px "PingFang TC","Noto Sans CJK TC","Noto Sans TC",sans-serif`; g.fillText('木星消防站',w/2,h*.54); });
// 圖樣來源：內政部消防署全球資訊網。
const emblemTex=new THREE.TextureLoader().load(new URL('./models/signs/taiwan-fire-emblem.png',import.meta.url).href);
emblemTex.colorSpace=THREE.SRGBColorSpace;
const emblemMaterial=new THREE.MeshStandardMaterial({map:emblemTex,alphaTest:.45,roughness:.8});
/* 半格底盤（同 s1_more.js 的 halfPad） */
function halfPad(inset=.18,y=0,h=.09){ const R=4.2, Hh=Math.sqrt(3)*R, oz=-Hh*.24, s=new THREE.Shape(); const hw=z=>R-(z-oz)/(Hh/2)*(R/2);
  const z0=oz+inset, z1=oz+Hh/2-inset; [[-(hw(z0)-inset),z0],[hw(z0)-inset,z0],[hw(z1)-inset,z1],[-(hw(z1)-inset),z1]].forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z)); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2}); g.rotateX(-Math.PI/2);
  const positions=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++) uv.setXY(i,positions.getX(i)*.84,positions.getZ(i)*.84);
  const m=add(new THREE.Mesh(g,paver)); m.position.y=y; m.receiveShadow=true; return m; }
const paver=new THREE.MeshStandardMaterial({roughness:.92,map:canvasTex((ctx,size)=>{
  ctx.fillStyle='#aca39c';
  ctx.fillRect(0,0,size,size);
  const tile=size/4;
  const colors=['#ddd5c6','#e1d9c9','#d3c9bc','#e8ddcf'];
  for(let row=0;row<4;row++) for(let col=-1;col<4;col++){
    const x=(col+(row%2)*.5)*tile, y=row*tile;
    ctx.fillStyle=colors[(col+4+row*3)%4];
    ctx.fillRect(x+2,y+2,tile-4,tile-4);
    ctx.fillStyle='#eee2d3';
    ctx.fillRect(x+3,y+3,tile-6,2);
  }
})});
const GLASSM=mat('#a8dcf0',{roughness:.15,metalness:.1,emissive:0x1d4a5c,emissiveIntensity:.15});
function win(x,y,z,w,h,rotation=0){
  const group=new THREE.Group();
  group.position.set(x,y,z);
  group.rotation.y=rotation;
  ROOT.add(group);
  rbox(w+.11,h+.10,.045,TRIM,0,-.045,0,.012,group);
  rbox(w,h,.029,GLASSM,0,0,.024,.009,group);
  rbox(.022,h,.035,WHITE,0,0,.043,.005,group);
  rbox(w,.019,.031,WHITE,0,h*.69,.044,.004,group);
  rbox(w+.16,.037,.102,WHITE,0,-.064,.029,.013,group);
}
function lightFixture(x,y,z){
  rbox(.095,.045,.07,DARK,x,y,z,.012);
  rbox(.052,.035,.039,em('#ffe3b7',.3),x,y-.023,z+.014,.005);
}

function firestation(){
  halfPad();
  const Y=.1, W=3.2, D=1.7, cx=-.35, cz=-.55, fz=cz+D/2, gf=1.15, ff=.85;   // gf 一樓高、ff 二樓高
  // 一樓：左邊大車庫、右邊辦公室
  const gx=cx-.55, gw=1.55, gh=.98, gL=gx-gw/2, gR=gx+gw/2, x0=cx-W/2, x1=cx+W/2;
  rbox(gL-x0+.02,gf,D,wallMat(RED,gL-x0,gf),(x0+gL)/2,Y,cz,.03); rbox(x1-gR+.02,gf,D,wallMat(RED,x1-gR,gf),(gR+x1)/2,Y,cz,.03);   // 車庫左邊的牆、右邊的辦公室
  rbox(gw,gf,.12,wallMat(RED,gw,gf),gx,Y,cz-D/2+.06,.02); rbox(gw,gf-gh,D,wallMat(RED,gw,gf-gh),gx,Y+gh,cz,.02);                 // 車庫後牆、門上方
  rbox(gw,.02,D-.1,'#4a4f5a',gx,Y,cz,.005); rbox(gw-.02,gh,.02,'#3a3f4a',gx,Y,cz-D/2+.13,.004); // 車庫地板、裡面暗暗的後牆
  for(const sx of [-1,1]) rbox(.1,gh+.06,.1,WHITE,gx+sx*(gw/2+.03),Y,fz,.01); rbox(gw+.26,.12,.12,WHITE,gx,Y+gh,fz,.01);   // 白色門框
  { const r=cyl(.09,.09,gw,'#c9ced6',0,0,0,14); r.rotation.z=Math.PI/2; r.position.set(gx,Y+gh-.1,fz-.08); }   // 捲門捲在上面
    kit('models/car3/firetruck.glb',gx,cz+.1,{d:1.4,y0:Y+.02});                                 // 紅色消防車停在車庫裡
  const ox=cx+.95; rbox(.46,.78,.06,REDD,ox-.15,Y,fz+.013,.016);
  rbox(.36,.47,.028,GLASSM,ox-.15,Y+.24,fz+.048,.008);
  rbox(.025,.12,.026,TRIM,ox-.035,Y+.32,fz+.068,.005);
  rbox(.53,.035,.14,WHITE,ox-.15,Y,fz+.062,.009);
  lightFixture(ox-.15,Y+.85,fz+.065);   // 辦公室門
  win(ox+.42,Y+.45,fz+.005,.32,.34);
  for(const x of [gL+.10,gR-.10]){
    rbox(.052,.64,.033,REDD,x,Y+.18,fz+.059,.009);
    lightFixture(x,Y+gh-.06,fz+.08);
  }
  rbox(gw+.31,.045,.20,TRIM,gx,Y+gh+.108,fz+.044,.013);
  rbox(W+.06,.10,D+.06,WHITE,cx,Y+gf-.05,cz,.016);
  rbox(W+.08,.023,D+.08,REDD,cx,Y+gf+.05,cz,.007);                                           // 一二樓中間白色腰帶
  // 二樓：窗戶一排＋招牌
  rbox(W,ff,D,wallMat(RED,W,ff),cx,Y+gf+.05,cz,.03); const y2=Y+gf+.05;
  for(const x of [cx-1.22,cx-.65,cx+.65,cx+1.22]) win(x,y2+.45,fz+.009,.40,.28);
  for(const side of [-1,1]) for(const z of [-1.00,-.43]){
    win(cx+side*(W/2+.006),y2+.43,z,.31,.31,side*Math.PI/2);
  }
  { const p=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.3),new THREE.MeshStandardMaterial({map:signTex,roughness:.7})); p.position.set(cx,y2+.24,fz+.03); add(p);
    rbox(1.88,.06,.06,REDD,cx,y2+.06,fz+.02,.01); }
  // 正立面中央的深藍底牌襯出官方金色鳳凰。
  rbox(.44,.419,.061,'#203347',cx,y2+.405,fz+.018,.036);
  const emblem=new THREE.Mesh(new THREE.PlaneGeometry(.319,.37),emblemMaterial);
  emblem.position.set(cx,y2+.6145,fz+.052);
  add(emblem);
  // 屋頂：女兒牆＋會轉的紅色警示燈
  const top=y2+ff; rbox(W+.08,.06,D+.08,WHITE,cx,top,cz,.01);
  for(const sz of [-1,1]) rbox(W+.08,.16,.07,WHITE,cx,top+.06,cz+sz*(D/2),.01); for(const sx of [-1,1]) rbox(.07,.16,D,WHITE,cx+sx*(W/2),top+.06,cz,.01);
  { const g=new THREE.Group(); g.position.set(cx-.55,top+.06,fz-.35); ROOT.add(g);
    cyl(.16,.18,.1,DARK,0,0,0,16,g); const dome=sphere(.14,em('#ff3b2f',.8),0,.16,0,{},g); dome.scale.y=.85;
    const rot=new THREE.Group(); rot.position.y=.16; g.add(rot); const beam=new THREE.Mesh(new THREE.BoxGeometry(.5,.035,.06),new THREE.MeshBasicMaterial({color:0xffe0d0,transparent:true,opacity:.65})); rot.add(beam);
    anims.push(t=>{ rot.rotation.y=t*2.4; dome.material.emissiveIntensity=.5+.5*Math.max(0,Math.sin(t*4.8)); }); }
  rbox(.62,.4,.4,'#cfd6dd',cx+.9,top+.06,cz-.2,.02);                                        // 屋頂小機房
  // 右邊：消防訓練塔（家長 11-19 18:54 重做：原本只是紅白條＋一塊方板，看不出是什麼）
  //   磁磚塔身＋白色腰帶、三層深色窗、側面爬梯、頂樓開放平台（四角欄杆）、四坡小屋頂、垂下來曬的水管
  { const tx=cx+W/2+.62, tz=cz-.25, th=2.55, hw=.33;
    rbox(hw*2,th,hw*2,wallMat(RED,.7,th),tx,Y,tz,.03);
    for(const y of [.82,1.66]) rbox(hw*2+.06,.1,hw*2+.06,WHITE,tx,Y+y,tz,.012);                 // 白色腰帶
    for(const y of [.3,1.14,1.98]) win(tx,Y+y,tz+hw+.01,.26,.32);                                // 正面窗戶（白框＋玻璃，不要黑色方塊）
    for(const y of [.3,1.14,1.98]) for(const sd of [-1,1]){ rbox(.04,.4,.34,WHITE,tx+sd*(hw+.01),Y+y-.04,tz,.01); rbox(.03,.32,.26,GLASSM,tx+sd*(hw+.025),Y+y,tz,.008); }   // 側面窗戶
    for(const s of [-1,1]) cyl(.022,.022,th-.12,'#cfd6dd',tx+s*.11,Y+.06,tz-hw-.03,6);          // 爬梯兩根立桿
    for(let i=0;i<9;i++){ const r=cyl(.015,.015,.22,'#cfd6dd',tx,Y+.22+i*.26,tz-hw-.03,5); r.rotation.z=Math.PI/2; }
    rbox(.94,.08,.94,WHITE,tx,Y+th,tz,.015);                                                     // 頂樓平台
    for(const [dx,dz] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]) cyl(.028,.028,.42,WHITE,tx+dx,Y+th+.08,tz+dz,6);
    for(const y of [.2,.4]) for(const s of [-1,1]){ rbox(.86,.035,.035,WHITE,tx,Y+th+y,tz+s*.4,.008); rbox(.035,.035,.86,WHITE,tx+s*.4,Y+th+y,tz,.008); }   // 欄杆
    tiledHip(1.04,1.04,.24,REDD,tx,Y+th+.47,tz);   // 四坡小屋頂
    for(let i=0;i<3;i++){ const h=.8+i*.2, hx2=tx-.17+i*.17; rbox(.055,h,.045,'#cbbf9c',hx2,Y+th-h-.16,tz+hw+.03,.02); cyl(.035,.035,.06,'#b08d3a',hx2,Y+th-h-.2,tz+hw+.03,8); }   // 垂下來曬的水帶（下面是銅接頭）
    rbox(.5,.04,.06,'#8d939e',tx,Y+th-.1,tz+hw+.03,.01); }
  // Recessed utility cabinet on the outer wall, clear of the visitor approach.
  rbox(.11,.30,.32,REDD,cx+W/2+.035,Y+.23,cz-.49,.022);
  rbox(.030,.23,.255,TRIM,cx+W/2+.096,Y+.26,cz-.49,.012);
  rbox(.026,.12,.027,DARK,cx+W/2+.115,Y+.32,cz-.415,.006);
  // 門口：車庫前的水泥坡道＋黃色禁止停車斜線
  rbox(gw+.3,.03,1.25,'#d6d2c8',gx,Y+.005,fz+.68,.01);   /* 11-19 19:02：原本和地基同高會閃，抬高一點 */
  for(let i=0;i<5;i++){ const m=rbox(.08,.012,.9,GOLDY,gx-.6+i*.3,Y+.027,fz+.68,.003); m.rotation.y=.6; }
  rbox(gw+.3,.012,.06,GOLDY,gx,Y+.027,fz+.08,.002); rbox(gw+.3,.012,.06,GOLDY,gx,Y+.027,fz+1.28,.002);
  // 消防栓、交通錐
  { const hx=ox+.55, hz=fz+.55;
    cyl(.14,.15,.045,REDD,hx,Y,hz,12); cyl(.1,.12,.055,RED,hx,Y+.045,hz,12);          // 底座法蘭
    cyl(.085,.1,.24,RED,hx,Y+.1,hz,12); cyl(.115,.115,.04,REDD,hx,Y+.3,hz,12);        // 身體＋上緣
    const dm=sphere(.1,RED,hx,Y+.37,hz); dm.scale.y=.62; cyl(.045,.05,.055,GOLDY,hx,Y+.4,hz,6);   // 圓頂＋六角螺帽
    for(const s of [-1,1]){ const n=cyl(.045,.05,.1,RED,hx+s*.06,Y+.17,hz,10); n.rotation.z=Math.PI/2; n.position.set(hx+s*.115,Y+.22,hz);
      const c2=cyl(.052,.052,.028,GOLDY,0,0,0,8); c2.rotation.z=Math.PI/2; c2.position.set(hx+s*.175,Y+.22,hz); }   // 兩側出水口
    const fn=cyl(.052,.058,.1,RED,hx,Y+.08,hz,10); fn.rotation.x=Math.PI/2; fn.position.set(hx,Y+.13,hz+.11);
    const fc=cyl(.06,.06,.028,GOLDY,0,0,0,8); fc.rotation.x=Math.PI/2; fc.position.set(hx,Y+.13,hz+.17); }   // 前面大出水口
  for(const [x,z] of [[gx-1.05,fz+.45],[gx+1.05,fz+1.1]]) kit('models/car3/cone.glb',x,z,{h:.3,y0:Y});
  // 後面種樹、花
  for(const [x,z,k,c] of [[-3.1,-1.15,.6],[3.15,-1.15,.55,'#6fc463']]) tree(x,z,k,c);
  bush(-2.4,-1.25,.6,'#ffd166'); bush(2.35,.2,.55,'#ff8fa3');
}

export const FIRE_LV=[['firestation','消防站 Lv1',firestation,'half']];
export const FIRE_TOP=[0,4.0];
