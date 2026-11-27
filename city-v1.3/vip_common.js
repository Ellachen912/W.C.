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


const timed = {clap:2.6, handshake:1.5, proud:4, pray:4};
const standing = new Set(['clap','handshake','proud','crouch','pray','waitdoor','dance']);
const seated = new Set(['chat','icecream']);
const smooth = x => x*x*(3-2*x);
const clamp = THREE.MathUtils.clamp;

// Keep independently animated pieces out of the geometry merge while
// matching the baked palette used by the rest of each limb.
export function preserveVipJoints(arms,legs,dress){
  const materials=new Map();
  function preserve(mesh){
    if(!mesh.isMesh || mesh.material.map || mesh.material.transparent) return;
    mesh.userData.noMerge=1;
    const original=mesh.material;
    if(!materials.has(original)){
      const color=original.color.clone().add((original.emissive??original.color).clone().multiplyScalar(.5));
      color.r=Math.min(1,color.r); color.g=Math.min(1,color.g); color.b=Math.min(1,color.b);
      materials.set(original,M(color,{roughness:.7,side:THREE.DoubleSide}));
    }
    mesh.material=materials.get(original);
  }
  for(const arm of arms) for(const mesh of arm.children)
    if(mesh.position.y<-.19 || mesh.geometry?.type==='CapsuleGeometry') preserve(mesh);
  for(const leg of legs) for(const mesh of leg.children)
    if(mesh.position.y<=-.149) preserve(mesh);
  if(dress) preserve(dress);
}

export function installVipActions(out, {body,head,arms,legs,skin,avery,expressions,face,radius,dress}) {
  const base = out.anim;
  const down = new THREE.Vector3(0,-1,0);
  const point = (x,y,z) => new THREE.Vector3(x,y,z);
  const rigs = arms.map((arm,i) => {
    const handY = avery ? -.215 : -.222;
    const palm = new THREE.Group();
    palm.position.y = handY;
    const handParts = arm.children.filter(mesh => mesh.position.y < -.19);
    arm.add(palm);
    for (const mesh of handParts) {
      mesh.position.y -= handY;
      palm.add(mesh);
    }
    const upper = arm.children.find(mesh => mesh.geometry?.type === 'CapsuleGeometry');
    const restY = upper?.position.y;
    const forearm = add(arm,new THREE.CapsuleGeometry(avery?.032:.028,.064,4,12),upper?.material??skin);
    forearm.visible = false;
    return {arm,palm,handY,upper,restY,forearm,side:i===0?1:-1};
  });
  const legRest=legs.map(leg=>leg.position.clone());
  const zAxis=new THREE.Vector3(0,0,1);
  const hips=point(0,legRest[0].y,0);
  const undoSway=new THREE.Quaternion();
  const knees = legs.map(leg => {
    const knee = new THREE.Group();
    knee.position.y=-.12;
    const lower = leg.children.filter(mesh => mesh.position.y <= -.149);
    leg.add(knee);
    for (const mesh of lower) {
      mesh.position.y += .12;
      knee.add(mesh);
    }
    return knee;
  });
  const cone = new THREE.Group();
  rigs[1].palm.add(cone);
  add(cone,new THREE.ConeGeometry(.038,.096,14),M('#bb8268'),[0,.012,.038],[0,0,Math.PI]);
  add(cone,new THREE.SphereGeometry(.043,16,12),M('#ebafbc'),[0,.071,.038]);
  cone.scale.setScalar(avery?.83:1);
  cone.visible=false;
  let sit=0, action, elapsed=0, amount=0, consumed, cover=0, talking=0;
  let aim=0;

  function poseHand(rig,target,weight,nearFace=false) {
    const {arm,palm,handY,upper,restY,forearm,side}=rig;
    palm.position.set(0,handY,0);
    palm.quaternion.identity();
    if (upper) { upper.position.y=restY; upper.scale.y=1; }
    forearm.visible=Boolean(target && weight>.001);
    if (!forearm.visible) return;

    const rest=palm.position.clone().applyQuaternion(arm.quaternion).add(arm.position);
    const wrist=rest.lerp(target,weight);
    let elbow;
    if (nearFace) {
      // Solve a bent elbow with fixed limb lengths instead of stretching to the face.
      const upperLength=avery?.112:.115;
      const lowerLength=-handY-upperLength;
      const reach=wrist.clone().sub(arm.position);
      const distance=clamp(reach.length(),.025,upperLength+lowerLength-.004);
      const axis=reach.normalize();
      wrist.copy(arm.position).addScaledVector(axis,distance);
      const outward=point(side*.65,-1,.05);
      outward.addScaledVector(axis,-outward.dot(axis)).normalize();
      const along=(upperLength**2-lowerLength**2+distance**2)/(2*distance);
      const bend=Math.sqrt(Math.max(0,upperLength**2-along**2));
      elbow=arm.position.clone().addScaledVector(axis,along).addScaledVector(outward,bend);
    } else {
      // Keep elbows outside the torso and below the raised hands.
      elbow=arm.position.clone().lerp(wrist,.43);
      elbow.x+=side*.080*weight;
      elbow.y-=.075*weight;
      elbow.z+=.040*weight;
    }
    const upperDirection=elbow.clone().sub(arm.position);
    arm.quaternion.setFromUnitVectors(down,upperDirection.clone().normalize());
    const inverse=arm.quaternion.clone().invert();
    const localWrist=wrist.sub(arm.position).applyQuaternion(inverse);
    const localElbow=upperDirection.applyQuaternion(inverse);
    const segment=localWrist.clone().sub(localElbow);
    if (upper) {
      upper.position.y=THREE.MathUtils.lerp(restY,-upperDirection.length()/2,weight);
      upper.scale.y=THREE.MathUtils.lerp(1,upperDirection.length()/.17,weight);
    }
    forearm.position.copy(localElbow).addScaledVector(segment,.5);
    forearm.quaternion.setFromUnitVectors(down,segment.clone().normalize());
    forearm.scale.y=segment.length()/.12;
    palm.position.copy(localWrist);
    palm.quaternion.copy(inverse);
  }

  // Seat anchor offset in city building units, matching the existing courtyard seats.
  out.sitDrop=.125;
  out.sitK=0;
  out.anim=(dt,st)=>{
    const requested=st.act ?? (st.cheer?'clap':undefined);
    const supported=(standing.has(requested)||seated.has(requested)) &&
      (avery ? !['handshake','proud'].includes(requested) : requested!=='waitdoor');
    const next=supported && !st.walk && ((!st.sit&&sit===0)||seated.has(requested)) ? requested : undefined;
    if (next!==consumed) consumed=undefined;
    if (!action && next && next!==consumed) {
      action=next;
      consumed=next;
      elapsed=0;
    }
    if(action) elapsed+=dt;
    const duration=timed[action] ?? Infinity;
    const active=next===action && Boolean(action) && elapsed<duration;
    amount=clamp(amount+(active?dt:-dt)/.45,0,1);
    const k=smooth(amount);
    if (!active && amount===0) action=undefined;
    const time=Math.min(elapsed,duration);
    const conversing=action==='chat';
    const coverGesture=st.cover&&!conversing;
    const faceName=coverGesture ? 'laugh' : active ? ({clap:'laugh',handshake:'smile',proud:'smile',crouch:'laugh',
      pray:'calm',chat:'smile',dance:'smile'})[action] : undefined;
    expressions.tick(dt,st.wave,st.face,faceName);
    base(dt,st);
    body.position.x=0;
    body.rotation.x=body.rotation.y=head.rotation.x=0;
    legs.forEach((leg,i)=>{
      leg.position.copy(legRest[i]);
      leg.rotation.y=leg.rotation.z=0;
    });
    sit=clamp(sit+(st.sit?dt:-dt)/.9,0,1);
    out.sitK=smooth(sit);
    if(out.sitK>0){
      for(const leg of legs) leg.rotation.x=THREE.MathUtils.lerp(leg.rotation.x,-1.48,out.sitK);
      body.position.y+=.115*out.sitK;
      for(const arm of arms) arm.rotation.x-=.35*out.sitK;
    }

    let direction=0;
    const looking=Boolean(st.look && ['chat','handshake','crouch','waitdoor'].includes(action));
    if(looking){
      const origin=out.obj.getWorldPosition(point(0,0,0));
      const rotation=out.obj.getWorldQuaternion(new THREE.Quaternion()).invert();
      const relative=point(st.look.x-origin.x,0,st.look.z-origin.z).applyQuaternion(rotation);
      direction=clamp(Math.atan2(relative.x,relative.z),-.9,.9);
    }
    aim=THREE.MathUtils.damp(aim,direction,7,dt);
    body.rotation.y=aim*.24*k;
    head.rotation.y+=aim*.70*k;
    let left,right;
    cover=clamp(cover+(coverGesture?dt:-dt)/.45,0,1);
    talking=clamp(talking+(st.talk?dt:-dt)/.45,0,1);
    let handWeight=k;
    const chest=avery?.45:.46;
    for(const knee of knees) knee.rotation.x=0;
    if(dress) dress.morphTargetInfluences[0]=action==='crouch'?k:0;
    switch(action){
      case 'clap': {
        const spread=.036+.065*(.5+.5*Math.cos(time*Math.PI*4));
        left=point(spread,chest,.207); right=point(-spread,chest,.207);
        break;
      }
      case 'handshake':
        right=point(-.105+aim*.10,chest+.032*Math.sin(time*Math.PI*4/1.5),.247);
        break;
      case 'proud':
        left=point(.163,.348,.048); right=point(-.163,.348,.048);
        head.rotation.x=-.14*k;
        break;
      case 'icecream':
        right=point(avery?-.160:-.178,.345+.063*(.5+.5*Math.sin(time*1.5)),.143);
        break;
      case 'crouch':
        body.position.y-=.068*k;
        for(const leg of legs) leg.rotation.x-=.77*k;
        for(const knee of knees) knee.rotation.x=1.55*k;
        head.rotation.x=.18*k;
        left=point(.122,.294,.155); right=point(-.122,.294,.155);
        break;
      case 'pray': {
        left=point(.035,chest+.044,.175); right=point(-.035,chest+.044,.175);
        head.rotation.x=.27*k*(.5-.5*Math.cos(time*Math.PI*1.5));
        break;
      }
      case 'waitdoor': {
        const pause=.5-.5*Math.cos(time*.68);
        head.rotation.y+=k*(.42*Math.sin(time*1.6)*(1-pause)+aim*.25*pause);
        break;
      }
      case 'chat':
        body.rotation.z+=.026*k*Math.sin(time*2+(avery?Math.PI:0));
        head.rotation.z-=aim*.15*k*(1-talking);
        head.rotation.x=k*(.045+.028*talking)*Math.sin(time*2.6);
        break;
      case 'dance': {
        const phase=time*2.55+(avery?.34:0);
        const sway=k*.23*Math.sin(phase);
        // Lean around the hips while preserving the world pose of both legs.
        const baseLean=body.rotation.z;
        body.position.add(hips.clone().sub(hips.clone().applyAxisAngle(zAxis,sway))
          .applyAxisAngle(zAxis,baseLean));
        body.rotation.z+=sway;
        undoSway.setFromAxisAngle(zAxis,-sway);
        for(const leg of legs){
          leg.position.sub(hips).applyQuaternion(undoSway).add(hips);
          leg.quaternion.premultiply(undoSway);
        }
        head.rotation.z-=sway*.34;
        const swing=Math.cos(phase);
        arms[0].rotation.z+=k*(.25+.17*swing);
        arms[1].rotation.z-=k*(.25-.17*swing);
        arms[0].rotation.x-=k*(.16+.20*swing);
        arms[1].rotation.x-=k*(.16-.20*swing);
        break;
      }
    }
    const nearFace=smooth(cover);
    if (nearFace>0) {
      // Lower the chin toward the hand. Use the near cheek so the hand
      // does not have to cross the face or reach past the nose.
      head.rotation.x+=nearFace*.17;
      head.rotation.z-=nearFace*.07;
      const cheek=face.localToWorld(point(-radius*.60,-radius*.69,radius*.78));
      right=body.worldToLocal(cheek);
      handWeight=nearFace;
    }
    poseHand(rigs[0],left,k);
    poseHand(rigs[1],right,handWeight,nearFace>0);
    cone.visible=requested==='icecream' && action==='icecream' && active;
  };
}
