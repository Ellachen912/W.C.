/* s1_farm.js: keep on the unplanted strips around the raised beds. */
function level(door,fieldPath,field,frontPath,look){
  // A farmer carries a basket; keep a standing stop for the current canDo rules.
  const workRoute={who:['農夫'],max:1,sec:[30,60],door,in:fieldPath,out:fieldPath.slice().reverse()};
  const fieldStop={at:field,face:[.3,.55]};
  return {groups:{
    farmer:{...workRoute,stay:[{...fieldStop,act:'stand'}]},
    farmerCrouch:{...workRoute,stay:[{...fieldStop,act:'crouch'}]},
    visitors:{who:'*',no:['農夫','市長','Avery'],max:1,door,in:frontPath,out:frontPath.slice().reverse(),
      stay:[{at:look,act:'look',face:[.65,1.2],sec:[6,12]}]},
  }};
}
export default {t:'garden',lv:{
  1:level([0,3.40],[[-.32,2.60],[-.58,1.44],[-.88,.85]],[-.87,.43],
    [[0,2.61]],[.4,2.05]),
  2:level([0,3.40],[[0,2.97],[0,2.13],[0,1.66],[-.36,1.73],[-1.72,1.73],[-1.78,.78],[-.92,.72]],[-.85,.50],
    [[0,3.03]],[.23,3.05]),
}};
