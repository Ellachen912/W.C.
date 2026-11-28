import * as THREE from 'three';

const TAU=Math.PI*2;
const smooth=t=>{ t=THREE.MathUtils.clamp(t,0,1); return t*t*(3-2*t); };
const profiles={
  elephant:{forward:[.81,-.59],legTop:.46,period:12.4,walk:2.25,stride:.34,lift:.060,head:.20},
  giraffe:{forward:[-.64,.77],legTop:.43,period:11.7,walk:2.00,stride:.39,lift:.061,head:.52},
  ostrich:{forward:[.83,.55],legTop:.44,period:8.9,walk:1.65,stride:.36,lift:.084,head:.47},
  doe:{forward:[.90,-.43],head:.48},
  stag:{forward:[.40,.92],head:.45},
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
    const idle=legCount*2;
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
        put(leg*2,i,fx*weight,0,fz*weight);
        put(leg*2+1,i,0,weight,0);
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

export function zooMotion(animal,model,id,anatomy,scale,points,index){
  const {profile:p,height}=anatomy;
  const morphs=[];
  model.traverse(mesh=>{if(mesh.morphTargetInfluences) morphs.push(mesh.morphTargetInfluences);});
  const initial=animal.rotation.y;
  const forward=Math.atan2(...p.forward);
  const curve=points&&new THREE.QuadraticBezierCurve(
    new THREE.Vector2(...points[0]),new THREE.Vector2(...points[1]),new THREE.Vector2(...points[2]));
  const routeLength=curve?.getLength()??0;
  const offsets=id==='ostrich'?[0,.5]:[0,.50,.72,.22];
  const stride=p.stride*scale*height;
  const cycles=Math.max(1,Math.round(routeLength/Math.max(.07,stride)));
  const ease=t=>t<.16?t*t/.32:t>.84?1-(1-t)*(1-t)/.32:t-.08;
  const unitEase=t=>t<.16?ease(t)/.84:t>.84?1-(1-t)*(1-t)/(.32*.84):ease(t)/.84;
  const angle=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
  function setGait(phase,envelope,stepLength,idle){
    for(const weights of morphs){
      const legs=(weights.length-1)/2;
      for(let i=0;i<legs;i++){
        const u=(phase+offsets[i])%1;
        const swing=u>=.58;
        const v=(u-.58)/.42;
        const travel=swing?-.29+.58*smooth(v):.29-u;
        weights[i*2]=travel*stepLength/scale*envelope;
        weights[i*2+1]=(swing?Math.sin(v*Math.PI):0)*p.lift*height*envelope;
      }
      weights[weights.length-1]=idle;
    }
  }
  return time=>{
    const idle=Math.sin(time*(id==='ostrich'?2.4:1.25)+index*1.8);
    if(!curve){
      setGait(0,0,0,idle);
      return;
    }
    const t=(time+index*.94)%p.period;
    const turn=.95, outbound=turn+p.walk, restEnd=outbound+1.25;
    const returning=restEnd+turn, stop=returning+p.walk;
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
    if(t<turn) animal.rotation.y=angle(initial,startYaw,smooth(t/turn));
    else if(walking) animal.rotation.y=yaw+(back?Math.PI:0);
    else if(t<restEnd) animal.rotation.y=endYaw;
    else if(t<returning) animal.rotation.y=endYaw+Math.PI*smooth((t-restEnd)/turn);
    else animal.rotation.y=angle(startYaw+Math.PI,initial,smooth((t-stop)/turn));
    const amplitude=walking?smooth(raw/.14)*smooth((1-raw)/.14):0;
    setGait(progress*cycles,amplitude,routeLength/cycles,idle*(walking?.35:1));
  };
}
