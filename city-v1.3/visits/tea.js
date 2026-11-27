/* s2_farm2.js: the three stone treads lead to a terrace; the front
   cylindrical tea seat is .32 + .22 high. */
const door=[-.94,3.36];
const path=[[-.90,2.95],[-.45,2.70],[-.05,2.35],[.20,1.90],[.25,1.35],[.22,.75]];
const treads=[[.38,.45],[.58,.45],[.78,.45],[1.02,.64]];
function tea(farm,hedge,platform){
  // A farmer carries a basket; keep a standing stop for the current canDo rules.
  const workRoute={who:['農夫'],max:1,sec:[30,60],door,in:farm,out:farm.slice().reverse()};
  const fieldStop={at:hedge,face:[hedge[0]-.66,hedge[1]-.14]};
  return {groups:{
    farmer:{...workRoute,stay:[{...fieldStop,act:'stand'}]},
    farmerCrouch:{...workRoute,stay:[{...fieldStop,act:'crouch'}]},
    teaSeat:{who:'*',no:['農夫','市長','Avery'],max:1,door,stairs:true,
      in:platform,out:platform.slice().reverse(),stay:[{at:[2.10,.67],act:'sit',face:[2.10,.25],
        seat:.54,stand:[1.78,.73],sec:[12,23]}]},
  }};
}
export default {t:'tea',lv:{
  1:tea(path.slice(0,-1),[-.07,1.30],[...path,...treads,[1.62,.70],[1.82,.70]]),
  2:tea([...path.slice(0,4),[.40,1.48]],[.38,1.27],
    [...path.slice(0,4),[.60,1.35],[.60,.88],[.60,.56],[.79,.54],
      [.85,.72],[1.12,.76],[1.65,.77],[1.82,.73]]),
}};
