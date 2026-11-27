import * as THREE from 'three';
export function buildExpressions({originalMouth,P,HR,face,mInk,mouthPitch,lashes=false}){
const mouths={原版:originalMouth,微笑:originalMouth,閉眼:originalMouth};
function surfacePoint(yaw,pitch,x,y,depth=.003){const c=P(yaw,pitch),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),c.clone().normalize());return new THREE.Vector3(x,y,0).applyQuaternion(q).add(c).normalize().multiplyScalar(HR+depth);}
function faceFill(yaw,pitch,pts,color,depth){const contour=pts.map(p=>new THREE.Vector2(...p));if(contour[0].distanceTo(contour.at(-1))<1e-7)contour.pop();const triangles=THREE.ShapeUtils.triangulateShape(contour,[]),pos=[];for(const tri of triangles){const [a,b,c]=tri.map(i=>contour[i]);const N=8;function p(i,j){const u=i/N,v=j/N;return surfacePoint(yaw,pitch,a.x+(b.x-a.x)*u+(c.x-a.x)*v,a.y+(b.y-a.y)*u+(c.y-a.y)*v,depth).toArray();}for(let i=0;i<N;i++)for(let j=0;j<N-i;j++){pos.push(...p(i,j),...p(i+1,j),...p(i,j+1));if(i+j<N-1)pos.push(...p(i+1,j),...p(i+1,j+1),...p(i,j+1));}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));face.add(m);return m;}
function mouthGroup(pts, tongue){const g=new THREE.Group();face.add(g);const base=faceFill(0,mouthPitch,pts,'#793b2c',.004);g.add(base);if(tongue){const t=faceFill(0,mouthPitch,tongue,'#e77e68',.005);g.add(t);}return g;}
const laughShape=new THREE.Shape();laughShape.moveTo(-.042,-.018);laughShape.quadraticCurveTo(0,-.032,.042,-.018);laughShape.bezierCurveTo(.039,-.052,.022,-.072,0,-.073);laughShape.bezierCurveTo(-.022,-.072,-.039,-.052,-.042,-.018);laughShape.closePath();
const tongueShape=new THREE.Shape();tongueShape.moveTo(-.025,-.057);tongueShape.quadraticCurveTo(0,-.043,.025,-.057);tongueShape.quadraticCurveTo(.015,-.070,0,-.070);tongueShape.quadraticCurveTo(-.015,-.070,-.025,-.057);tongueShape.closePath();
mouths['開心大笑']=mouthGroup(laughShape.getPoints(24).map(p=>[p.x,p.y]),tongueShape.getPoints(24).map(p=>[p.x,p.y]));
const smileEyes=[];for(const s of [-1,1]){const pts=Array.from({length:25},(_,i)=>{const x=(i/24*2-1)*.023;return surfacePoint(s*.33,-.03,x,.014*(1-(x/.023)**2)-.005,.006);});const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),32,.0045,8,false),mInk);face.add(m);smileEyes.push(m);if(lashes){const lashPts=[surfacePoint(s*.33,-.03,s*.021,-.004,.006),surfacePoint(s*.33,-.03,s*.031,.003,.006),surfacePoint(s*.33,-.03,s*.036,.009,.006)];const lash=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lashPts),12,.003,8,false),mInk);face.add(lash);smileEyes.push(lash);}}

const calmEyes=[-1,1].map(side=>{
  const points=Array.from({length:17},(_,i)=>{
    const u=i/8-1;
    return surfacePoint(side*.33,-.03,u*.024,.012*u*u-.009,.007);
  });
  const line=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,.0038,6,false),mInk);
  face.add(line);
  return line;
});
return {mouths,smileEyes,calmEyes};
}

const faces={normal:'原版',smile:'微笑',laugh:'開心大笑',calm:'閉眼'};
export function expressionController(setExpr){
  let current='原版',requested='原版',hold=0;
  setExpr(current);
  return {
    react(expression,seconds=3){
      if(!Object.values(faces).includes(expression)) return;
      hold=Math.max(0,seconds);
      requested=current=expression;
      setExpr(current);
    },
    tick(dt,wave,face,actionFace){
      hold=Math.max(0,hold-dt);
      const next=faces[face] ?? faces[actionFace] ?? (wave?'開心大笑':hold>0?requested:'原版');
      if(next!==current){ current=next; setExpr(next); }
    }
  };
}
