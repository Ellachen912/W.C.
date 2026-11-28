import * as THREE from 'three';
import * as L from './lib.js';

export const TEA_COLORS={wall:'#d2c5df',frame:'#82718f',cream:'#f5ead6',tea:'#c79f7c',pearl:'#574447'};
const {wall,frame,cream,tea,pearl}=TEA_COLORS;
const {rbox,cyl,mat,add}=L;
const glass=mat('#c5e4ed',{transparent:true,opacity:.44,depthWrite:false,roughness:.42});

const wallTiles=L.canvasTex((ctx,size)=>{
  ctx.fillStyle='#a799b4';
  ctx.fillRect(0,0,size,size);
  const shades=[wall,'#c5b6d3','#d9cce4','#cdbedb'];
  const w=size/4,h=size/6;
  for(let row=0;row<6;row++) for(let col=-1;col<4;col++){
    const x=col*w+(row%2)*w/2;
    const y=row*h;
    ctx.fillStyle=shades[(row*3+col+4)%4];
    ctx.fillRect(x+2,y+2,w-4,h-4);
    ctx.fillStyle='#e0d6e9';
    ctx.fillRect(x+3,y+3,w-6,2);
  }
},256);
function tileWall(width,height){
  const map=wallTiles.clone();
  map.repeat.set(width*1.12,height*1.36);
  map.needsUpdate=true;
  return new THREE.MeshStandardMaterial({map,roughness:.9});
}

function paving(){
  const radius=4.2,h=Math.sqrt(3)*radius,offset=-h*.24,inset=.18;
  const back=offset+inset,front=offset+h/2-inset;
  const halfWidth=z=>radius-(z-offset)*radius/h-inset;
  const shape=new THREE.Shape([
    [-halfWidth(back),back],[halfWidth(back),back],[halfWidth(front),front],[-halfWidth(front),front],
  ].map(([x,z])=>new THREE.Vector2(x,-z)));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.085,bevelEnabled:true,bevelThickness:.014,bevelSize:.026,bevelSegments:1});
  geometry.rotateX(-Math.PI/2);
  const tex=L.canvasTex((ctx,s)=>{
    ctx.fillStyle='#b0a4a4'; ctx.fillRect(0,0,s,s);
    const colors=['#e9ddcb','#d9cbbb','#e8ded4','#d3c4d4','#e4d4cc'];
    for(let row=0;row<4;row++) for(let col=-1;col<4;col++){
      const x=col*s/4+(row%2)*s/8,y=row*s/4;
      ctx.fillStyle=colors[((row%2)*2+(col+4)%4)%colors.length];
      ctx.fillRect(x+2,y+2,s/4-4,s/4-4);
      ctx.fillStyle='#f0e5d9';
      ctx.fillRect(x+4,y+4,s/4-8,2);
      ctx.fillStyle='#c1b2ae';
      ctx.fillRect(x+3,y+s/4-5,s/4-6,2);
    }
  },256);
  const p=geometry.attributes.position, uv=geometry.attributes.uv;
  for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i)*.79,p.getZ(i)*.79);
  add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:tex,roughness:.9})));
}

function rooftopCup(){
  const x=.51,z=-.53,y=1.41;
  cyl(.25,.29,.10,frame,x,y,z,20);
  cyl(.45,.30,.83,tea,x,y+.08,z,24);
  // Pearls are printed around the cup and raised slightly at the front.
  for(const [angle,height,r] of [[-.70,.30,.054],[-.29,.22,.053],[.10,.31,.060],[.51,.23,.053],[.86,.35,.046],[-.50,.42,.041],[.39,.42,.043]]){
    const surface=.30+(.15*height/.83);
    const bead=L.sphere(r,pearl,x+Math.sin(angle)*surface,y+.08+height,z+Math.cos(angle)*surface);
    bead.scale.set(1,1,.53);
    bead.rotation.y=angle;
  }
  cyl(.469,.454,.070,cream,x,y+.89,z,24);
  cyl(.405,.445,.065,'#e6d6e5',x,y+.955,z,24);
  const straw=cyl(.055,.055,.54,frame,x+.14,y+.955,z-.05,12);
  straw.rotation.z=-.22;
  const tip=cyl(.043,.043,.014,'#c9b1d4',x+.199,y+1.489,z-.05,12);
  tip.rotation.z=-.22;
  L.textPlate('珍珠',.40,.15,'#f6ead9','#74576d',x,y+.625,z+.401);
}

function menu(){
  const tex=L.canvasTex((ctx,size)=>{
    ctx.fillStyle='#f5ead9';ctx.fillRect(0,0,size,size);
    ctx.fillStyle='#826c85';ctx.fillRect(14,14,size-28,49);
    ctx.fillStyle='#fff6ea';ctx.font='bold 29px sans-serif';
    ctx.fillText('茶飲',26,49);
    ctx.fillStyle='#674f66';ctx.font='bold 26px sans-serif';
    ['珍珠奶茶','黑糖鮮奶','茉香奶茶'].forEach((text,i)=>ctx.fillText(text,25,109+i*45));
  },256);
  const board=add(new THREE.Mesh(new THREE.PlaneGeometry(.32,.34),new THREE.MeshBasicMaterial({map:tex})));
  board.position.set(1.066,.69,.285);
}

function bubbleTea(){
  paving();
  rbox(2.87,.10,1.53,'#b4a7b8',0,.084,-.45,.05);
  const backTiles=tileWall(2.78,1.15), sideTiles=tileWall(1.40,1.15);
  rbox(2.78,1.15,.13,backTiles,0,.16,-1.14,.045);
  for(const side of [-1,1]) rbox(.14,1.15,1.40,sideTiles,side*1.32,.16,-.45,.048);
  rbox(2.78,.24,.15,tileWall(2.78,.24),0,1.07,.225,.025);
  rbox(2.86,.065,1.53,cream,0,1.305,-.45,.030);
  rbox(2.96,.064,1.59,frame,0,1.365,-.45,.026);
  rbox(2.79,.018,1.39,'#ebdfe5',0,1.429,-.45,.008);
  for(const x of [-1.08,-.43,.94,1.30]) rbox(.086,.91,.083,frame,x,.18,.25,.016);
  rbox(.57,.83,.075,glass,-.76,.20,.25,.022);
  rbox(.49,.035,.025,frame,-.76,.66,.297,.008);
  rbox(.026,.13,.028,cream,-.56,.49,.311,.008);
  rbox(.58,.044,.19,cream,-.76,.105,.34,.022);
  rbox(1.39,.053,.23,cream,.255,.621,.33,.024);
  for(const x of [-.24,.73]) rbox(.095,.12,.14,frame,x,.513,.27,.017);
  rbox(1.33,.38,.27,'#afa0b9',.245,.17,-.77,.025);
  rbox(1.39,.043,.30,cream,.245,.54,-.77,.018);
  for(const x of [-.07,.26,.59]){
    rbox(.15,.04,.15,'#a0afb3',x,.58,-.74,.013);
    cyl(.064,.060,.14,glass,x,.62,-.74,12);
    cyl(.069,.069,.022,cream,x,.76,-.74,12);
  }
  L.textPlate('珍珠奶茶',1.56,.21,frame,'#fff4df',-.08,1.205,.319);
  for(let i=0;i<9;i++){
    const piece=rbox(.318,.045,.45,i%2===0?cream:'#c4b1d0',-1.27+i*.318,.986,.50,.009);
    piece.rotation.x=.09;
  }
  rbox(2.88,.071,.041,frame,0,.956,.72,.014);
  for(const x of [-1.18,1.18]) cyl(.025,.025,.84,frame,x,.109,.70,8);
  menu();
  for(const x of [-1.87,1.79]){
    cyl(.17,.135,.18,'#aa96aa',x,.10,.26,10);
    const previous=L.ROOT;
    const leaves=new THREE.Group();
    leaves.position.y=.20;
    previous.add(leaves);
    L.setRoot(leaves);
    try{L.bush(x,.26,.60,null);}finally{L.setRoot(previous);}
  }
  rooftopCup();
}

export const BUBBLETEA_LV=[['bubbletea','珍珠奶茶店',bubbleTea,'half']];
export const BUBBLETEA_TOP=[0,2.94];
