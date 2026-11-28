import * as L from './lib.js';

export function backHedge(){
  const z=-1.42, len=2.6;
  L.rbox(len,.12,.13,'#8a6a48',0,.09,z,.02);
  L.rbox(len-.04,.14,.11,L.mat('#5f9a4f',{roughness:.9}),0,.2,z,.05);
  for(let i=0;i<9;i++){
    const leaf=L.sphere(.085,L.mat(i%2?'#679f55':'#5a9149',{flatShading:true}),-len/2+.15+i*(len-.3)/8,.34,z);
    leaf.scale.set(1.2,.55,.8);
  }
  for(const side of [-1,1]){
    const x=side*(len/2+.22);
    L.cyl(.09,.07,.16,'#b5704f',x,.09,z,12);
    const plant=L.sphere(.12,L.mat('#4f8a44',{flatShading:true}),x,.33,z);
    plant.scale.y=.9;
  }
}
