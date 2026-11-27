/* Winston City 共用的樹（家長 11-27 12:39：以後種樹都從這幾種模型裡挑，不要整排同一種；可以改顏色，粉紅花樹也不錯）
   樹種 kind：
     'p04' 'p06' 'p12' 'p13'：社區公園那一套低多邊形樹（models/park/trees.glb，low_poly_tree_set，s1_more.js 的 ptree 也用它）
                              p04 結紅果、p06 兩層葉、p12 圓冠、p13 寬冠
     'city'                 ：家長給的 Blender 檔（Winston_City_Park_Civic_Edition）裡的城市樹：細樹幹＋兩顆多面體樹冠，程式照原檔比例畫
   顏色 tint：'green'（原色）、'pink'（粉紅花樹，樹冠換粉紅、加小白花）、'lime'（淺綠）、'deep'（深綠）
   用法：cityTree(x,z,{kind:'p12',tint:'pink',k:1})；種一排時用 TREE_MIX[i%TREE_MIX.length] 輪流挑，不要全部同一種。 */
import * as THREE from 'three';
import { kit } from './s1_kit.js';
import { ROOT, add, mat } from './lib.js';
const dotGeo=new THREE.SphereGeometry(1,8,6);   // 小白花：低面數小球（共用一個形狀）

export const PARK_TREES='models/park/trees.glb';
const LEAF=/Material\.00[12]/;                                     // 公園樹的葉子材質（Material 是樹幹、Material.003 是紅果子）
export const TINTS={ green:null,
  pink:{a:'#f2a9c0',b:'#f8c4d4',dot:'#ffffff'}, lime:{a:'#8fd06a',b:'#a6dc7f'}, deep:{a:'#3f8f45',b:'#4f9f52'} };
/* 輪流用的組合：公園四種樹＋城市樹，混一兩棵粉紅花樹 */
export const TREE_MIX=[{kind:'p12'},{kind:'city',tint:'pink'},{kind:'p04'},{kind:'p13'},{kind:'city'},{kind:'p06'},{kind:'p12',tint:'pink'},{kind:'p13',tint:'lime'}];

const tintCache={};
function tintMat(m,t){ const k=m.uuid+'|'+t; if(tintCache[k]) return tintCache[k]; const c=m.clone(); const T=TINTS[t];
  c.color=new THREE.Color(m.name.endsWith('1')?T.b:T.a); return tintCache[k]=c; }

/* 城市樹（照 Blender 檔：樹幹 0.116 高、下樹冠半徑 0.105、上樹冠 0.075，整棵放大 3.2 倍） */
function blendTree(x,z,k,tint,y0,parent){ const s=3.2*k, T=TINTS[tint]||{a:'#61ba54',b:'#73c966'};
  const g=new THREE.Group(); g.position.set(x,y0,z); (parent||ROOT).add(g);
  const tr=add(new THREE.Mesh(new THREE.CylinderGeometry(.013*s,.023*s,.116*s,10),mat('#a8734f',{flatShading:true})),g); tr.position.y=.058*s;
  const lo=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.105*s,1),mat(T.a,{flatShading:true,roughness:.9})),g); lo.position.y=.193*s;
  const up=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.075*s,1),mat(T.b,{flatShading:true,roughness:.9})),g); up.position.set(.021*s,.279*s,.011*s);
  if(T.dot) for(let i=0;i<7;i++){ const a=i*2.4, h=(i%3-1)*.05*s; { const d=add(new THREE.Mesh(dotGeo,mat(T.dot)),g); d.scale.setScalar(.012*s); d.position.set(Math.cos(a)*.1*s,.2*s+h,Math.sin(a)*.1*s); } }
  return g; }

/* 種一棵樹。parent 不給就放在目前的 ROOT（跟其他零件一樣） */
export function cityTree(x,z,{kind='p12',tint='green',k=1,y0=.1,parent=null,rot}={}){
  if(kind==='city') return blendTree(x,z,k,tint,y0,parent);
  const id=kind.slice(1), r=rot!=null?rot:((x*7.3+z*3.1)%6.28);    // 依位置轉個角度，同一種樹也不會長一樣
  return kit(PARK_TREES,x,z,{node:'Lowpoly_Tree_'+id,h:1.15*k,y0,rot:r,parent,then:TINTS[tint]?o=>o.traverse(m=>{ if(m.isMesh&&LEAF.test(m.material.name)) m.material=tintMat(m.material,tint); }):null}); }
