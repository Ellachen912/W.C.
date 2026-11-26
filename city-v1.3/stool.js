/* 台灣路邊攤的塑膠椅（家長 11-19 11:02：自己畫一張，代替不能修改的網路模型，夜市、早餐店共用）
   造型照「Taiwan Plastic Chair」：上面圓角方形椅面（有菱格止滑紋＋中間小圓孔），下面四面往外微斜的側板，
   每面挖一個拱形開口，形成四隻腳。高約 0.37（遊戲單位）。幾何只建一次，所有椅子共用，每張約 400 面。 */
import * as THREE from 'three';
const GEO={}, MATS={};
function seatTex(){ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d');
  g.fillStyle='#fff'; g.fillRect(0,0,128,128); g.strokeStyle='rgba(0,0,0,.22)'; g.lineWidth=2;
  for(let i=-128;i<256;i+=14){ g.beginPath(); g.moveTo(i,0); g.lineTo(i+128,128); g.stroke(); g.beginPath(); g.moveTo(i,128); g.lineTo(i+128,0); g.stroke(); }
  g.fillStyle='rgba(0,0,0,.55)'; g.beginPath(); g.arc(64,64,6,0,7); g.fill();
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
function build(){ if(GEO.seat) return;
  const rr=(w,r)=>{ const s=new THREE.Shape(), h=w/2; s.moveTo(-h+r,-h); s.lineTo(h-r,-h); s.quadraticCurveTo(h,-h,h,-h+r); s.lineTo(h,h-r); s.quadraticCurveTo(h,h,h-r,h); s.lineTo(-h+r,h); s.quadraticCurveTo(-h,h,-h,h-r); s.lineTo(-h,-h+r); s.quadraticCurveTo(-h,-h,-h+r,-h); return s; };
  GEO.seat=new THREE.ExtrudeGeometry(rr(.24,.04),{depth:.03,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,curveSegments:4}); GEO.seat.rotateX(-Math.PI/2);
  // 椅面的 UV：讓菱格貼圖剛好鋪滿上面
  { const p=GEO.seat.attributes.position, uv=GEO.seat.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i)/.26+.5,p.getZ(i)/.26+.5); }
  GEO.top=new THREE.PlaneGeometry(.235,.235); GEO.top.rotateX(-Math.PI/2);
  // 側板：上窄下寬的梯形，下面挖拱門
  const s=new THREE.Shape(), H=.33, wt=.22, wb=.26; s.moveTo(-wb/2,0); s.lineTo(-.06,0); s.lineTo(-.06,.2); s.absarc(0,.2,.06,Math.PI,0,true); s.lineTo(.06,0); s.lineTo(wb/2,0); s.lineTo(wt/2,H); s.lineTo(-wt/2,H); s.closePath();
  GEO.side=new THREE.ExtrudeGeometry(s,{depth:.016,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:1,curveSegments:8});
  GEO.foot=new THREE.BoxGeometry(.05,.012,.05);
  GEO.ring=new THREE.TorusGeometry(.12,.008,4,4); GEO.ring.rotateX(Math.PI/2); GEO.ring.rotateY(Math.PI/4); }   // 腳之間的一圈橫撐
function mats(color){ if(MATS[color]) return MATS[color];
  const body=new THREE.MeshStandardMaterial({color,roughness:.45}), top=new THREE.MeshStandardMaterial({color,roughness:.5,map:seatTex()});
  const foot=new THREE.MeshStandardMaterial({color:new THREE.Color(color).multiplyScalar(.6),roughness:.6});
  return MATS[color]={body,top,foot}; }
export function plasticStool(color='#2f9a4a'){ build(); const M=mats(color), g=new THREE.Group();
  const seat=new THREE.Mesh(GEO.seat,M.body); seat.position.y=.33; g.add(seat);
  const top=new THREE.Mesh(GEO.top,M.top); top.position.y=.33+.039; g.add(top);
  for(let i=0;i<4;i++){ const piv=new THREE.Group(); piv.rotation.y=i*Math.PI/2; g.add(piv);
    const sd=new THREE.Mesh(GEO.side,M.body); sd.position.set(0,0,.12); sd.rotation.x=-.06; piv.add(sd);
    for(const sx of [-1,1]){ const f=new THREE.Mesh(GEO.foot,M.foot); f.position.set(sx*.105,.006,.125); piv.add(f); } }
  { const rg=new THREE.Mesh(GEO.ring,M.body); rg.position.y=.07; rg.scale.set(1.18,1,1.18); g.add(rg); }
  g.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; } }); return g; }
