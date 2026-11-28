/* Winston City 速度優化（第三階段，家長 11-25「開始」）：
   一棟建築是由幾十到幾百個小零件拼起來的（日式料理店光竹子就快 300 個）。每個零件手機都要各畫一次，
   建築一多就變慢。bakeLot() 在建築蓋好之後，把「不會動、顏色材質一樣」的零件合併成一個，畫的次數大幅減少，
   外觀完全一樣。
   安全規則：
   - 會動的零件（和它底下的零件）不合併，所以風鈴、鐘、旗子照樣會動。
   - 天文台的行星平常不動、點了才轉，測不出來，所以天文台只在同一個小群組裡合併（flat=false）。
   - 會自己動的零件不合併：先把這棟的小動畫跑幾次，有位置、大小、顯示改變的就留著；旗子、煙、水滴、風車等已知會動的也留著。
   - 多材質、鏡像（負縮放）、有子物件的零件不合併；半透明的不會動才合併（11-25）。 */
import * as THREE from 'three';
import { mergeGeometries, deinterleaveGeometry } from 'three/addons/utils/BufferGeometryUtils.js';

const SAMPLES=[.7,3.3,8.1,15.6];
function sig(geo){ const a=geo.attributes, ks=Object.keys(a).sort();
  return (geo.index?'i':'n')+ks.map(k=>k+':'+a[k].itemSize+':'+a[k].array.constructor.name+(a[k].normalized?'n':'')).join(','); }

/* 找出會動的零件：記下每個零件的位置，跑這棟的小動畫幾次，有變的就是會動的；最後把位置還原 */
const mstate=m=>[m.color?m.color.getHex():0,m.emissive?m.emissive.getHex():0,m.emissiveIntensity,m.opacity,m.visible].join();
function findMoving(root,anims,known){
  const moving=new Set(known), snap=[], msnap=new Map(), toggles=new Set();
  root.traverse(o=>{ if(o.userData.moving) moving.add(o); snap.push([o,o.position.clone(),o.quaternion.clone(),o.scale.clone(),o.visible,o.geometry&&o.geometry.attributes.position?o.geometry.attributes.position.version:-1]);
    if(o.material&&!Array.isArray(o.material)&&!msnap.has(o.material)) msnap.set(o.material,mstate(o.material)); });
  for(const t of SAMPLES) for(const f of anims){ try{ f(t,.016); }catch(e){} }
  for(const [o,p,q,s,v,ver] of snap){
    if(o.visible!==v) toggles.add(o);
    if(!o.position.equals(p)||!o.quaternion.equals(q)||!o.scale.equals(s)||o.visible!==v||(ver>=0&&o.geometry.attributes.position.version!==ver)) moving.add(o);
    o.position.copy(p); o.quaternion.copy(q); o.scale.copy(s); o.visible=v; }
  const blink=new Set(); for(const [m,st] of msnap) if(mstate(m)!==st) blink.add(m);   // 會閃、會變色的材質
  for(const o of known) if(o&&o.material) blink.add(o.material);
  moving.blink=blink; moving.toggles=toggles; return moving;
}

/* 小貼圖拼成大貼圖：只拼「整張貼一次」的（UV 在 0～1、沒有重複、沒有位移、沒有上下翻轉），其他維持原樣 */
const drawable=i=>i&&((typeof ImageBitmap!=='undefined'&&i instanceof ImageBitmap)||(typeof HTMLImageElement!=='undefined'&&i instanceof HTMLImageElement&&i.complete&&i.naturalWidth)||(typeof HTMLCanvasElement!=='undefined'&&i instanceof HTMLCanvasElement))&&i.width>0;
function atlasOK(t,g){ if(!drawable(t.image)||t.flipY||t.rotation||t.repeat.x!==1||t.repeat.y!==1||t.offset.x||t.offset.y||t.channel) return false;
  const u=g.attributes.uv; if(!u) return false; for(let i=0;i<u.count;i++){ const x=u.getX(i), y=u.getY(i); if(x<-.001||x>1.001||y<-.001||y>1.001) return false; } return true; }
function packAtlas(texs){ const out=new Map(), groups=new Map();
  for(const t of texs){ const k=t.colorSpace+'|'+t.magFilter; if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(t); }
  for(const list of groups.values()){ if(list.length<2) continue;
    const PAD=4, W=1024, MAXH=2048, items=list.map(t=>{ const f=Math.min(1,256/Math.max(t.image.width,t.image.height)); return {t,w:Math.max(1,Math.round(t.image.width*f)),h:Math.max(1,Math.round(t.image.height*f))}; }).sort((a,b)=>b.h-a.h);
    let x=PAD, y=PAD, rowH=0; const placed=[];
    for(const it of items){ if(x+it.w+PAD>W){ x=PAD; y+=rowH+2*PAD; rowH=0; } if(y+it.h+PAD>MAXH) break; it.x=x; it.y=y; x+=it.w+2*PAD; rowH=Math.max(rowH,it.h); placed.push(it); }
    if(placed.length<2) continue;
    let H=64; while(H<y+rowH+PAD) H*=2;
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const cx=cv.getContext('2d'); cx.imageSmoothingEnabled=list[0].magFilter!==THREE.NearestFilter;
    for(const it of placed){ cx.drawImage(it.t.image,it.x-PAD,it.y-PAD,it.w+2*PAD,it.h+2*PAD); cx.drawImage(it.t.image,it.x,it.y,it.w,it.h); }   // 先畫大一圈當邊，遠看才不會滲到隔壁的顏色
    const tex=new THREE.CanvasTexture(cv); tex.flipY=false; tex.colorSpace=list[0].colorSpace; tex.magFilter=list[0].magFilter; tex.anisotropy=list[0].anisotropy||1; tex.needsUpdate=true;
    for(const it of placed) out.set(it.t,{tex,r:[(it.x+.5)/W,(it.y+.5)/H,(it.w-1)/W,(it.h-1)/H]}); }
  return out; }

export function bakeLot(root,{anims=[],known=[],flat=true}={}){
  const moving=findMoving(root,anims,known);
  /* 會動的東西連同它底下的零件都不碰 */
  const attached=new Set(); for(const o of moving) if(o&&o.traverse) o.traverse(x=>attached.add(x));
  for(const o of attached) if(o.isMesh) o.castShadow=false;   /* 家長 11-25 23:10：會動的東西影子會一跳一跳地閃 → 會動的都不投影子 */
  root.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(), rel=new THREE.Matrix4();
  /* flat：整棟不會動的零件全部合併到最外層（不同小群組的同色零件也能合在一起）；flat=false 只在同一個群組裡合併 */
  const buckets=new Map(); let before=0, after=0;
  /* 外觀完全一樣的材質（模型載進來常常每個零件各複製一份）當成同一個，才合併得起來；會閃、會變色的不算 */
  const canon=new Map(), mkey=m=>[m.type,m.color&&m.color.getHex(),m.emissive&&m.emissive.getHex(),m.emissiveIntensity,m.roughness,m.metalness,m.map&&m.map.uuid,m.emissiveMap&&m.emissiveMap.uuid,m.normalMap&&m.normalMap.uuid,m.side,m.flatShading,m.vertexColors,m.toneMapped,m.fog,m.wireframe].join('|');
  const same=mt=>{ if(moving.blink.has(mt)||mt.userData.keep) return mt; const k=mkey(mt); if(!canon.has(k)) canon.set(k,mt); return canon.get(k); };
  /* 11-25 夜市太卡：下載的模型每個零件顏色都不一樣，材質不同就合不起來。
     沒有貼圖、不發光、不透明的零件，把顏色寫進每個點（頂點顏色），就能共用一個材質、合成一塊，看起來一模一樣 */
  const vcMats=new Map(), vcOK=mt=>mt.isMeshStandardMaterial&&(!mt.isMeshPhysicalMaterial||(!mt.clearcoat&&!mt.transmission&&!mt.sheen&&!mt.iridescence&&!mt.specularColorMap&&!mt.specularIntensityMap))&&(!mt.map||mt.map.channel===0)&&!mt.alphaMap&&!mt.normalMap&&!mt.roughnessMap&&!mt.metalnessMap&&!mt.aoMap&&!mt.lightMap&&!mt.bumpMap&&!mt.envMap&&!mt.transparent&&!mt.vertexColors&&mt.opacity===1&&!mt.emissiveMap&&!moving.blink.has(mt)&&!mt.userData.keep;
  const vcMat=(mt,map=mt.map)=>{ const k=[mt.roughness,mt.metalness,mt.flatShading,mt.side,mt.envMapIntensity,mt.fog,mt.wireframe,map&&map.uuid,mt.emissive&&mt.emissive.getHex(),mt.emissiveIntensity].join(); let v=vcMats.get(k);
    if(!v){ v=new THREE.MeshStandardMaterial({vertexColors:true,roughness:mt.roughness,metalness:mt.metalness,flatShading:mt.flatShading,side:mt.side}); v.envMapIntensity=mt.envMapIntensity; if(map) v.map=map; if(mt.emissive){ v.emissive.copy(mt.emissive); v.emissiveIntensity=mt.emissiveIntensity; } vcMats.set(k,v); } return v; };
  const cand=[], put=(A,m,M,use,col,uv,rect)=>{ const g=m.geometry, vc=!!col;
    const k=A.uuid+'|'+use.uuid+'|'+m.castShadow+m.receiveShadow+'|'+m.renderOrder+'|'+m.frustumCulled+'|'+(vc?'vc'+(g.index?'i':'n')+(uv?'uv':''):sig(g));
    let b=buckets.get(k); if(!b) buckets.set(k,b={A,list:[]}); b.list.push([m,M,use,col,uv,rect]); };
  root.traverse(m=>{
    if(!m.isMesh||m.isSkinnedMesh||m.isInstancedMesh||m.children.length||attached.has(m)||!m.visible||m.userData.baked) return;
    for(let p=m.parent;p&&p!==root;p=p.parent) if(!p.visible) return;
    let mt=m.material; if(!mt||Array.isArray(mt)||mt.alphaTest>0||mt.type==='ShaderMaterial') return;   /* 11-25 家長同意試試：半透明（玻璃、水面）不會動的也合併；會變透明度的已經在上面排除 */ mt=same(mt);
    const g=m.geometry; if(!g||!g.attributes.position||Object.keys(g.morphAttributes||{}).length) return;
    const A=flat?root:m.parent; if(A===root) rel.multiplyMatrices(inv,m.matrixWorld); else { m.updateMatrix(); rel.copy(m.matrix); }
    if(rel.determinant()<=0) return;
    const vc=vcOK(mt)&&(!mt.map||!!g.attributes.uv);
    if(vc&&mt.map&&atlasOK(mt.map,g)){ cand.push([A,m,rel.clone(),mt]); return; }   // 有貼圖的先記下來，等一下拼成一張大貼圖
    put(A,m,rel.clone(),vc?vcMat(mt):mt,vc?mt.color:null,vc&&!!mt.map,null); });
  /* 11-25：下載的模型每個零件各帶一張小貼圖，貼圖不同就合不起來 → 同一棟的小貼圖拼成一張大貼圖（每張最大 256），零件就能合在一起 */
  if(cand.length){ const slots=packAtlas([...new Set(cand.map(c=>c[3].map))]);
    for(const [A,m,M,mt] of cand){ const sl=slots.get(mt.map); if(sl){ const v=vcMat(mt,sl.tex); put(A,m,M,v,mt.color,true,sl.r); } else put(A,m,M,vcMat(mt),mt.color,true,null); } }
  for(const {A,list} of buckets.values()){
    before+=list.length; if(list.length<2){ after+=list.length; continue; }   // 只有一個的維持原樣
    const geos=list.map(([m,M,,col,uv,rect])=>{ let c=m.geometry.clone(); if(Object.values(c.attributes).some(a=>a.isInterleavedBufferAttribute)) deinterleaveGeometry(c);
      if(col){ const n=c.attributes.position.count, f32=a=>{ const o=new Float32Array(a.count*3); for(let i=0;i<a.count;i++){ o[i*3]=a.getX(i); o[i*3+1]=a.getY(i); o[i*3+2]=a.getZ(i); } return new THREE.BufferAttribute(o,3); };
        const ouv=c.attributes.uv, pos=f32(c.attributes.position), nor=c.attributes.normal?f32(c.attributes.normal):null, idx=c.index;
        c=new THREE.BufferGeometry(); c.setAttribute('position',pos); if(nor) c.setAttribute('normal',nor); else c.computeVertexNormals(); if(uv){ const u=ouv, o=new Float32Array(u.count*2); for(let i=0;i<u.count;i++){ o[i*2]=u.getX(i); o[i*2+1]=u.getY(i); if(rect){ o[i*2]=rect[0]+Math.min(1,Math.max(0,o[i*2]))*rect[2]; o[i*2+1]=rect[1]+Math.min(1,Math.max(0,o[i*2+1]))*rect[3]; } } c.setAttribute('uv',new THREE.BufferAttribute(o,2)); } if(idx) c.setIndex(Array.from(idx.array));
        const cc=new Float32Array(n*3); for(let i=0;i<n;i++){ cc[i*3]=col.r; cc[i*3+1]=col.g; cc[i*3+2]=col.b; } c.setAttribute('color',new THREE.BufferAttribute(cc,3)); }
      c.applyMatrix4(M); return c; });   // 模型檔的零件資料是交錯排的，先拆開才能合併
    let merged=null; try{ merged=mergeGeometries(geos,false); }catch(e){ merged=null; }
    geos.forEach(c=>c.dispose());
    if(!merged){ after+=list.length; continue; }
    const f=list[0][0], M=new THREE.Mesh(merged,list[0][2]);
    M.castShadow=f.castShadow; M.receiveShadow=f.receiveShadow; M.renderOrder=f.renderOrder; M.userData.baked=list.length;
    for(const [m] of list){ m.parent.remove(m); m.geometry.dispose(); }   // 舊零件已經送進顯示卡了，要放掉，不然記憶體會一直漲
    A.add(M); after++; }
  /* 家長 11-28 加速：合併後還剩下的小零件（多半是會動的小東西）記下來，鏡頭離很遠、小到看不到時就先不畫。
     自己會開關顯示的零件（和它底下的）不碰，免得跟它的動畫打架 */
  const skip=new Set(); for(const o of moving.toggles) o.traverse(x=>skip.add(x));
  const detail=[], wp=new THREE.Vector3(), ws=new THREE.Vector3(), wq=new THREE.Quaternion();
  root.updateMatrixWorld(true);
  root.traverse(m=>{ if(!m.isMesh||m.userData.baked||!m.visible||skip.has(m)||m.userData.keep) return;
    for(let p=m.parent;p&&p!==root;p=p.parent) if(!p.visible||skip.has(p)) return;
    const g=m.geometry; if(!g) return; if(!g.boundingSphere) g.computeBoundingSphere(); if(!g.boundingSphere) return;
    m.matrixWorld.decompose(wp,wq,ws); const r=g.boundingSphere.radius*Math.max(Math.abs(ws.x),Math.abs(ws.y),Math.abs(ws.z));
    if(r<.35) detail.push([m,r]); });
  return {before,after,detail};
}

/* 數一棟（或整個場景）有幾個要畫的零件 */
export function countMeshes(root){ let n=0; root.traverse(o=>{ if(o.isMesh&&o.visible) n++; }); return n; }
