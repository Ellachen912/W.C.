import * as THREE from 'three';

const TAU=Math.PI*2;
const smooth=t=>{ t=THREE.MathUtils.clamp(t,0,1); return t*t*(3-2*t); };
const profiles={
  elephant:{forward:[.81,-.59],legTop:.46,period:12.4,walk:2.25,stride:.34,lift:.060,head:.20},
  giraffe:{forward:[-.64,.77],legTop:.43,period:11.7,walk:2.00,stride:.39,lift:.061,head:.52},
  ostrich:{forward:[.83,.55],legTop:.44,period:8.9,walk:1.65,stride:.36,lift:.084,head:.47},
  doe:{forward:[.90,-.43],legTop:.45,period:10.7,walk:2.3,stride:.40,lift:.062,head:.48},
  stag:{forward:[.40,.92],legTop:.44,period:11.2,walk:2.4,stride:.40,lift:.061,head:.45},
};

// Build small vertex poses in the model's own coordinates. Body vertices above
// the relevant joints retain their original positions.
export function prepareZooAnimal(model,id){
  const p=profiles[id];
  const [fx,fz]=p.forward;
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model,true);
  const size=bounds.getSize(new THREE.Vector3());
  const height=size.y, extent=Math.max(size.x,size.z);
  const meshes=[];
  model.traverse(mesh=>{if(mesh.isMesh) meshes.push(mesh);});
  for(const mesh of meshes){
    const matrix=mesh.matrixWorld.clone(), inv=new THREE.Matrix3().setFromMatrix4(matrix).invert();
    const geometry=mesh.geometry.clone();
    const position=geometry.attributes.position;
    const legCount=p.legTop?(id==='ostrich'?2:4):0;
    const channels=p.legTop&&id!=='ostrich'?3:2;
    const idle=legCount*channels;
    const values=Array.from({length:idle+1},()=>new Float32Array(position.count*3));
    const v=new THREE.Vector3();
    const rows=Array.from({length:position.count},(_,i)=>{
      v.fromBufferAttribute(position,i).applyMatrix4(matrix);
      return {v:v.clone(),long:v.x*fx+v.z*fz,side:v.x*fz-v.z*fx,h:(v.y-bounds.min.y)/height};
    });
    const feet=rows.filter(row=>row.h<.12);
    const footCenter=(Math.min(...feet.map(q=>q.long))+Math.max(...feet.map(q=>q.long)))/2;
    const sideCenter=(Math.min(...feet.map(q=>q.side))+Math.max(...feet.map(q=>q.side)))/2;
    const foremost=Math.max(...rows.map(q=>q.long));
    function put(target,i,x,y,z){
      v.set(x,y,z).applyMatrix3(inv);
      values[target].set(v.toArray(),i*3);
    }
    for(const [i,q] of rows.entries()){
      const lateral=q.side>=sideCenter?1:0;
      if(legCount){
        const leg=lateral+(legCount===4&&q.long<footCenter?2:0);
        let weight=1-smooth(q.h/p.legTop);
        if(id==='elephant') weight*=1-smooth((q.long-foremost+extent*.30)/(extent*.17));
        put(leg*channels,i,fx*weight,0,fz*weight);
        put(leg*channels+1,i,0,weight,0);
        if(channels===3) put(leg*channels+2,i,fz*weight,0,-fx*weight);
      }
      const w=id==='elephant'
        ? smooth((q.long-foremost+extent*.25)/(extent*.19))*(1-smooth((q.h-.24)/.38))
        : smooth((q.h-p.head)/(1-p.head))*smooth((q.long-foremost+extent*.63)/(extent*.4));
      const sway=height*w*(id==='elephant'?.095:.055);
      put(idle,i,fz*sway,id==='ostrich'?-w*height*.042:0,-fx*sway);
    }
    geometry.morphAttributes.position=values.map(a=>new THREE.BufferAttribute(a,3));
    geometry.morphTargetsRelative=true;
    // Targets for the feet use model-space lengths applied as weights.
    // The rest bounds already frame the animal; the model stays on screen.
    geometry.boundingBox=bounds.clone().applyMatrix4(matrix.clone().invert()).expandByScalar(height*.16);
    geometry.boundingSphere=geometry.boundingBox.getBoundingSphere(new THREE.Sphere());
    mesh.geometry=geometry;
    mesh.updateMorphTargets();
  }
  return {height,profile:p};
}

// A closed route with parallel return lanes and tangent semicircles at both ends.
export function wideWalk(points,radius,side){
  const outbound=new THREE.QuadraticBezierCurve(...points.map(p=>new THREE.Vector2(...p)));
  const edge=u=>{
    const p=outbound.getPointAt(u), t=outbound.getTangentAt(u);
    return {p,t,n:new THREE.Vector2(t.y,-t.x).multiplyScalar(side)};
  };
  const back=u=>{
    const {p,n}=edge(1-u);
    return p.addScaledVector(n,2*radius);
  };
  const arc=(u,far)=>{
    const {p,t,n}=edge(far?1:0);
    if(!far){ p.addScaledVector(n,2*radius); t.negate(); n.negate(); }
    return p.addScaledVector(t,radius*Math.sin(Math.PI*u))
      .addScaledVector(n,radius*(1-Math.cos(Math.PI*u)));
  };
  const pieces=[u=>outbound.getPointAt(u),u=>arc(u,true),back,u=>arc(u,false)];
  return pieces.map((at,i)=>{
    let length=i%2?Math.PI*radius:0;
    if(i%2===0){
      let last=at(0);
      for(let j=1;j<=16;j++){
        const point=at(j/16);
        length+=point.distanceTo(last);
        last=point;
      }
    }
    return {at,length,turn:i%2===1};
  });
}

export function zooMotion(animal,model,id,anatomy,scale,points,index,ground,loop){
  const {profile:p,height}=anatomy;
  const morphs=[];
  model.traverse(mesh=>{if(mesh.morphTargetInfluences) morphs.push(mesh.morphTargetInfluences);});
  const initial=animal.rotation.y;
  const forward=Math.atan2(...p.forward);
  const pitchAxis=new THREE.Vector3(Math.cos(forward),0,-Math.sin(forward));
  const curve=points&&new THREE.QuadraticBezierCurve(
    new THREE.Vector2(...points[0]),new THREE.Vector2(...points[1]),new THREE.Vector2(...points[2]));
  const routeLength=curve?.getLength()??0;
  const offsets=id==='ostrich'?[0,.5]:[0,.50,.72,.22];
  const heavy=id==='elephant'||id==='giraffe';
  const channels=id==='ostrich'?2:3;
  const gaitShift=heavy||ground?3.7:0;
  const stride=p.stride*scale*height;
  const cycles=Math.max(1,Math.round(routeLength/Math.max(.07,stride)));
  const ease=t=>t<.16?t*t/.32:t>.84?1-(1-t)*(1-t)/.32:t-.08;
  const unitEase=t=>t<.16?ease(t)/.84:t>.84?1-(1-t)*(1-t)/(.32*.84):ease(t)/.84;
  const angle=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
  function setGait(phase,envelope,stepLength,idle,turning=0,liftScale=1){
    for(const weights of morphs){
      const legs=(weights.length-1)/channels;
      for(let i=0;i<legs;i++){
        const u=(phase+offsets[i])%1;
        const swing=u>=.58;
        const v=(u-.58)/.42;
        const travel=swing?-.29+.58*smooth(v):.29-u;
        const lift=swing?Math.sin(v*Math.PI):0;
        const k=i*channels;
        weights[k]=travel*stepLength/scale*envelope;
        weights[k+1]=lift*p.lift*height*envelope*liftScale;
        if(channels===3) weights[k+2]=travel*turning*height*(i<2?1:-1)*envelope;
      }
      weights[weights.length-1]=idle;
    }
  }
  function followSlope(){
    if(!ground) return;
    const z=animal.position.z;
    animal.position.y=ground(z)+.017;
    // Local +Z pitch, after compensating for the direction of the source mesh.
    const look=Math.cos(animal.rotation.y+forward);
    const grade=(ground(z+.15)-ground(z-.15))/.30;
    const pitch=-Math.atan(grade*look)*.65;
    model.quaternion.setFromAxisAngle(pitchAxis,pitch);
  }
  if(loop){
    const speed=(id==='elephant'?.32:.38)*(index%2?.81:1);
    const segments=loop.map(segment=>({...segment,duration:segment.length/speed*(segment.turn?1.33:1)}));
    const movingTime=segments.reduce((total,segment)=>total+segment.duration,0);
    const distance=segments.reduce((total,segment)=>total+segment.length,0);
    const stepCount=Math.max(4,Math.round(distance/Math.max(.20,stride*.77)));
    const stepLength=distance/stepCount;
    const period=movingTime+2.35;
    return time=>{
      const phaseTime=(time+index*1.4)%period;
      let local=phaseTime, travelled=0, segment=segments[0];
      for(const candidate of segments){
        segment=candidate;
        if(local<candidate.duration) break;
        local-=candidate.duration;
        travelled+=candidate.length;
      }
      const stopped=phaseTime>=movingTime;
      const u=stopped?1:local/segment.duration;
      const point=segment.at(u);
      const start=segment.at(Math.max(0,u-.004)), end=segment.at(Math.min(1,u+.004));
      animal.position.x=point.x;
      animal.position.z=point.y;
      animal.rotation.y=Math.atan2(end.x-start.x,end.y-start.y)-forward;
      const idle=Math.sin(time*1.25+index*1.8);
      const envelope=stopped?0:smooth(phaseTime/.30)*smooth((movingTime-phaseTime)/.30);
      const lateral=segment.turn?.050*Math.sin(Math.PI*u):0;
      const lift=segment.turn?1+.95*Math.sin(Math.PI*u):1;
      setGait((travelled+u*segment.length)/stepLength,envelope,stepLength,idle*(stopped?1:.38),lateral,lift);
    };
  }
  return time=>{
    const idle=Math.sin(time*(id==='ostrich'?2.4:1.25)+index*1.8);
    if(!curve){
      setGait(0,0,0,idle);
      return;
    }
    const t=(time+index*.94)%(p.period+gaitShift);
    const turn=heavy?1.75:ground?1.38:.95;
    const turnBack=heavy?(id==='elephant'?3.6:3.15):ground?2.38:turn;
    const outbound=turn+p.walk, restEnd=outbound+1.25;
    const returning=restEnd+turnBack, stop=returning+p.walk;
    const back=t>=returning&&t<stop;
    const walking=(t>=turn&&t<outbound)||back;
    const raw=walking?(t-(back?returning:turn))/p.walk:0;
    const progress=walking?unitEase(raw):(t>=outbound&&t<returning?1:0);
    const u=back?1-progress:progress;
    const point=curve.getPointAt(u);
    const tangent=curve.getTangentAt(u);
    const yaw=Math.atan2(tangent.x,tangent.y)-forward;
    const endYaw=Math.atan2(curve.v2.x-curve.v1.x,curve.v2.y-curve.v1.y)-forward;
    const startYaw=Math.atan2(curve.v1.x-curve.v0.x,curve.v1.y-curve.v0.y)-forward;
    animal.position.x=point.x; animal.position.z=point.y;
    let pivot;
    if(t<turn) pivot={from:initial,to:startYaw,u:t/turn,steps:1};
    else if(walking) animal.rotation.y=yaw+(back?Math.PI:0);
    else if(t<restEnd) animal.rotation.y=endYaw;
    else if(t<returning) pivot={from:endYaw,to:endYaw+Math.PI,u:(t-restEnd)/turnBack,steps:2};
    else pivot={from:startYaw+Math.PI,to:initial,u:Math.min(1,(t-stop)/turn),steps:1};

    if(pivot){
      const {from,to,u,steps}=pivot;
      const delta=steps===2?Math.PI:Math.atan2(Math.sin(to-from),Math.cos(to-from));
      if(heavy||ground){
        // Change direction across several planted steps. The hips trace a shallow
        // loop that starts and finishes at the same route point.
        const envelope=smooth(u/.17)*smooth((1-u)/.17)*Math.min(1,Math.abs(delta)*1.5);
        const phase=u*steps;
        const pulse=Math.sin(TAU*phase)*.019*envelope;
        animal.rotation.y=from+delta*(smooth(u)+pulse);
        const bow=Math.sin(Math.PI*u)**2*Math.min(.12,scale*height*.085);
        const direction=from+forward+delta*.5;
        animal.position.x+=Math.sin(direction)*bow;
        animal.position.z+=Math.cos(direction)*bow;
        followSlope();
        setGait(phase,envelope,.10*height*scale,idle*.45,.065*Math.sign(delta));
        return;
      }
      animal.rotation.y=angle(from,to,smooth(u));
    }
    followSlope();
    const amplitude=walking?smooth(raw/.14)*smooth((1-raw)/.14):0;
    setGait(progress*cycles,amplitude,routeLength/cycles,idle*(walking?.35:1));
  };
}
