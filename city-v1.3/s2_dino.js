import * as THREE from 'three';
import * as L from './lib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const berry = '#cc7466', coral = '#ee9c7a', sage = '#72a49a', mint = '#9ac6ac';
const cream = '#f5dfb6', bone = '#fff1cd', stone = '#c79c77';
const ink = '#3f4b52', amber = '#f4ba63', pine = '#547b75';
const flat = color => L.mat(color, {flatShading:true});

function group(parent,name,x=0,y=0,z=0) {
  const g=new THREE.Group(); g.name=name; g.position.set(x,y,z); parent.add(g); return g;
}

function box(parent,x,y,z,w,h,d,color) {
  const o=L.add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),L.mat(color)),parent);
  o.position.set(x,y,z); return o;
}
function rounded(w,h,d,color,x,y,z,r,parent) {
  const geometry=new RoundedBoxGeometry(w,h,d,1,Math.min(r,w/2-.001,h/2-.001,d/2-.001));
  const o=L.add(new THREE.Mesh(geometry,L.mat(color)),parent);
  o.position.set(x,y+h/2,z); return o;
}
function blob(parent,x,y,z,a,b,c,color) {
  const o=L.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1,Math.max(a,b,c)<.08?0:1),flat(color)),parent);
  o.position.set(x,y,z); o.scale.set(a,b,c); return o;
}
function link(parent,a,b,r0,r1,color) {
  const u=new THREE.Vector3(...a), v=new THREE.Vector3(...b), vector=v.clone().sub(u);
  const o=L.add(new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,vector.length(),7),flat(color)),parent);
  o.position.copy(u).lerp(v,.5); o.quaternion.setFromUnitVectors(THREE.Object3D.DEFAULT_UP,vector.normalize());
  return o;
}
function loft(parent,rings,color,underside=color) {
  const n=10, vertices=[], indices=[];
  for(const [x,y,h,w] of rings) for(let i=0;i<n;i++){
    const a=i*Math.PI*2/n;
    vertices.push(x,y+h*Math.sin(a),w*Math.cos(a));
  }
  for(let k=0;k<rings.length-1;k++) for(let i=0;i<n;i++){
    const a=k*n+i,b=k*n+(i+1)%n;
    indices.push(a,b,b+n,a,b+n,a+n);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geo.setIndex(indices);
  geo.computeVertexNormals();
  // One span per material is faster than issuing a draw for each small panel.
  const colored=geo.toNonIndexed();
  geo.dispose();
  const pos=colored.getAttribute('position'), colors=[];
  const base=new THREE.Color(color), belly=new THREE.Color(underside);
  for(let i=0;i<pos.count;i++){
    const c=(Math.floor(i/6)%n>=5?belly:base);
    colors.push(c.r,c.g,c.b);
  }
  colored.clearGroups();
  colored.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  colored.computeVertexNormals();
  return L.add(new THREE.Mesh(colored,L.mat('#ffffff',{vertexColors:true,flatShading:true,side:THREE.DoubleSide})),parent);
}
function eyes(head,x,y,z,size) {
  for(const side of [-1,1]){
    blob(head,x,y,z*side,size,size,size*.39,bone);
    blob(head,x+.026,y+.006,(z+size*.24)*side,size*.62,size*.77,size*.24,ink);
  }
}
function toes(parent,x,y,z,size) {
  blob(parent,x,y,z,size,size*.42,size*.83,bone);
  for(const dz of [-.055,0,.055]) blob(parent,x+.086,y-.008,z+dz,.052,.03,.026,cream);
}
function displayMotion(head,tail,phase) {
  head.userData.moving=true; tail.userData.moving=true;
  L.anims.push(time=>{
    head.rotation.y=.19*Math.sin(time*1.09+phase);
    head.rotation.z=.058*Math.sin(time*1.09+.79+phase);
    tail.rotation.y=.23*Math.sin(time*1.63+phase);
  });
}
function tyrannosaur(parent) {
  const rex=group(parent,'Tyrannosaurus • fixed stance',-1.47,.15,1.48);
  rex.rotation.y=-.24;
  loft(rex,[[-.55,.74,.19,.21],[-.28,.78,.35,.29],[.04,.83,.30,.25],[.30,1.03,.19,.17],[.43,1.16,.105,.11]],berry,coral);
  const tail=group(rex,'Tyrannosaurus moving tail',-.43,.72,0);
  loft(tail,[[-.89,.13,.016,.016],[-.69,.05,.05,.053],[-.43,-.02,.083,.089],[-.16,-.018,.145,.151],[.07,.02,.191,.195]],berry,coral);
  const head=group(rex,'Tyrannosaurus moving head',.37,1.15,0);
  loft(head,[[-.17,.11,.105,.088],[.03,.13,.22,.176],[.30,.11,.166,.15],[.48,.095,.10,.111],[.51,.09,.06,.069]],berry,coral);
  blob(head,.29,-.047,0,.23,.066,.113,ink);
  blob(head,.27,-.084,0,.228,.050,.105,coral);
  for(const s of [-1,1]) for(let j=0;j<4;j++){
    link(head,[.15+j*.076,-.007,s*.104],[.16+j*.076,-.047,s*.105],.017,.004,bone);
  }
  eyes(head,.107,.166,.164,.054);
  for(const s of [-1,1]){
    blob(head,.465,.113,s*.103,.035,.019,.014,ink);
    blob(rex,-.20,.55,s*.22,.20,.30,.17,berry);
    link(rex,[-.15,.47,s*.22],[-.32,.24,s*.22],.102,.069,berry);
    link(rex,[-.32,.25,s*.22],[-.16,.027,s*.22],.072,.058,coral);
    toes(rex,-.075,.04,s*.22,.14);
    link(rex,[.28,.86,s*.148],[.37,.69,s*.198],.053,.036,berry);
    link(rex,[.37,.69,s*.198],[.51,.724,s*.192],.036,.025,coral);
  }
  displayMotion(head,tail,0);
}
function triceratops(parent) {
  const tri=group(parent,'Triceratops • fixed stance',1.52,.15,1.53);
  tri.rotation.y=Math.PI+.29;
  loft(tri,[[-.53,.51,.16,.17],[-.28,.57,.274,.261],[.07,.58,.258,.26],[.38,.57,.18,.163],[.48,.60,.11,.12]],sage,mint);
  const tail=group(tri,'Triceratops moving tail',-.46,.50,0);
  loft(tail,[[-.54,-.08,.017,.018],[-.34,-.07,.048,.046],[-.15,-.035,.081,.072],[.06,.015,.102,.112]],sage,mint);
  for(const x of [-.27,.29]) for(const s of [-1,1]){
    link(tri,[x,.53,s*.18],[x+.015,.18,s*.22],.125,.084,sage);
    link(tri,[x+.015,.18,s*.22],[x+.044,.035,s*.22],.083,.073,mint);
    toes(tri,x+.093,.039,s*.22,.10);
  }
  const head=group(tri,'Triceratops moving head',.39,.59,0);
  const frill=blob(head,.048,.173,0,.079,.33,.306,coral);
  frill.rotation.z=-.17;
  blob(head,.089,.186,0,.066,.267,.247,sage);
  for(let j=0;j<7;j++){
    const a=-Math.PI*.13+j*Math.PI*1.26/6;
    blob(head,.064,.17+.302*Math.sin(a),.287*Math.cos(a),.039,.049,.044,cream);
  }
  loft(head,[[.093,.075,.168,.171],[.25,.055,.143,.128],[.405,.032,.086,.090],[.444,.024,.043,.059]],sage,mint);
  blob(head,.41,-.014,0,.083,.050,.068,bone);
  for(const s of [-1,1]){
    link(head,[.202,.181,s*.121],[.357,.324,s*.155],.054,.006,bone);
  }
  link(head,[.373,.083,0],[.452,.180,0],.042,.006,bone);
  eyes(head,.269,.112,.125,.043);
  displayMotion(head,tail,1.4);
}
function facade(g) {
  // Low sandstone pavilion with a raised copper roof and fossil relief above the doors.
  rounded(4.44,.16,2.40,stone,0,.03,-1.01,.075,g);
  rounded(4.13,1.47,2.12,cream,0,.17,-1.04,.073,g);
  rounded(4.35,.13,2.32,bone,0,1.59,-1.04,.056,g);
  L.prism(4.40,2.38,.84,flat(pine),0,1.68,-1.04,'z',g);
  L.prism(3.90,.095,.60,flat(coral),0,1.73,.169,'z',g);
  box(g,0,.69,.037,1.18,1.02,.051,pine);
  for(const side of [-1,1]){
    rounded(.49,.86,.054,'#acd1c0',side*.270,.18,.076,.012,g);
    box(g,side*.098,.55,.110,.026,.20,.029,amber);
    rounded(.74,.64,.079,stone,side*1.28,.45,.055,.032,g);
    rounded(.65,.55,.082,'#92bdb6',side*1.28,.495,.068,.028,g);
    box(g,side*1.28,.775,.115,.023,.54,.015,bone);
    rounded(.15,1.42,.21,bone,side*.72,.17,.103,.028,g);
    for(let j=0;j<3;j++) box(g,side*(1.80+j*.11),.89,.077,.036,1.12,.09,stone);
  }
  rounded(1.67,.17,.59,coral,0,1.27,.22,.048,g);
  L.textPlate('恐龍博物館',1.41,.25,'#f8e6c1','#405954',0,1.342,.533);
  const med=L.cyl(.205,.205,.058,bone,0,2.008,.234,16,g);
  med.rotation.x=Math.PI/2;
  const disc=L.cyl(.158,.158,.065,stone,0,2.008,.259,16,g);
  disc.rotation.x=Math.PI/2;
  for(let i=0;i<7;i++){
    const a=i*.76;
    blob(g,.014*i*Math.cos(a),2.037+.014*i*Math.sin(a),.296,.030,.023,.016,bone);
  }
  for(let i=0;i<5;i++) rounded(1.29+i*.059,.022,.36+i*.076,'#e6c6a5',0,.031+i*.021,.348,.01,g);
}
export function drawDinosaurMuseum() {
  const lot=L.ROOT;
  const g=group(lot,'Dinosaur museum');
  L.hexPad('#b7cd8c',.38,.055,.019);
  facade(g);
  for(let i=0;i<9;i++){
    const z=.53+i*.344;
    rounded(.94-i*.019,.034,.324,i%3===0?'#ecd3aa':'#e4c79f',.034*Math.sin(i*.72),.033,z,.018,g);
  }
  for(const [x,z,c] of [[-1.47,1.48,'#e6b58f'],[1.52,1.53,'#d4c59e']]){
    const base=L.cyl(1.02,1.07,.084,stone,x,.048,z,14,g);base.scale.z=.61;
    const top=L.cyl(.973,.973,.025,c,x,.126,z,14,g);top.scale.z=.60;
  }
  tyrannosaur(g);
  triceratops(g);
  L.textPlate('暴龍',.48,.18,'#f8e6c1','#7b5744',-1.59,.20,2.10);
  L.textPlate('三角龍',.56,.18,'#f8e6c1','#557366',1.51,.20,2.14);
  for(const [x,z,r] of [[-2.64,.44,.22],[2.58,.46,.23],[-1.59,2.56,.15],[1.76,2.54,.15],[-2.30,-.56,.16],[2.35,-.60,.17]]){
    blob(g,x,.14,z,r,.14,r*.88,'#8db074');
    blob(g,x+.11,.10,z-.065,r*.60,.09,r*.64,'#a5c481');
    if(z>2) blob(g,x+.04,.20,z-.025,.046,.037,.044,coral);
  }
  for(const [x,z] of [[-2.46,-.64],[2.35,-.56]]){
    link(g,[x,.07,z],[x,.49,z],.07,.038,stone);
    blob(g,x,.64,z,.28,.29,.23,'#77a57d');
    blob(g,x+.10,.83,z-.02,.20,.22,.19,mint);
  }
}
