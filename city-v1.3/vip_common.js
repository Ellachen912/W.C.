/* Winston City 市長、Avery。家長 11-26：換成市長 V2.2（眼睛用 F 圓眼微調）、Avery V2.9；表情、穿著、配件都隨機。舊說明：（家長 2026-11-18 定案）。從樣張 person_sample4_mayor.html、person_sample2_girl.html 搬過來。
   市長：T 恤胸前木星（上衣橘或白隨機）、W 棒球帽（深藍、橘、不戴隨機，11-19）、不戴墨鏡、足球襪兩條橘線、小木星繞著前胸轉、腳邊 8 顆小星光（11-19 拿掉地上金光圈）。Avery：市長的家人，黑色短髮、兔耳髮箍、紫色洋裝。 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { M, add, prune, bake } from './people.js';
export const VSCALE=.56;
export function wrapUp(person,parts,h,sc=VSCALE){ prune(person); bake(person); const obj=new THREE.Group(), inner=new THREE.Group(); inner.scale.setScalar(sc); inner.add(person); obj.add(inner);
  const H=h*sc, hit=new THREE.Mesh(new THREE.BoxGeometry(H*.55,H,H*.55),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=H/2; obj.add(hit); return {obj,hit,h:H,...parts}; }
export const pickCap=()=>{ const r=Math.random(); return r<1/3?'不戴':r<2/3?'藍':'橘'; };
export const SHIRT={橘:['#f7882a','#ffffff'],白:['#f7f4ee','#f7882a']};
export const pickA=a=>a[Math.floor(Math.random()*a.length)];
export const EXPR=['原版','微笑','驚訝','開心大笑'];
