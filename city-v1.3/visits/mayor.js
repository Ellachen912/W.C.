/* mayor.js M1–M5: use the villa front door. Lv2+ paths go around
   the fountain; Lv5 also keeps the original white gazebo bench. */
const frontDoor=[0,3.43];
const steps=[[0,.31],[0,.24],[0,.12],[0,-.23]];
function home(approach,withBench=false){
  const porch=[...approach,[0,.72]];
  const inside={door:frontDoor,in:[...porch,...steps],
    out:[...porch,...steps.slice(0,-1)].reverse(),stairs:true,inside:true,max:1};
  const common={door:frontDoor,in:porch,out:[...porch].reverse(),max:1};
  return {groups:{
    vipHome:{...inside,who:['市長','Avery'],sec:[15,30]},
    averyDoor:{...common,who:['Avery'],sec:[7,14],stay:[{at:[-.24,.76],act:'waitdoor',face:[-.24,2.76]}]},
    mail:{...common,who:['郵差'],sec:[4,8],stay:[{at:[.25,.85],act:'stand',face:[0,.16]}]},
    ...(withBench?{vipBench:{who:['市長','Avery'],max:2,door:[-.22,3.43],in:[],out:[],
      stay:[
        {at:[-2.27,1.48],act:'sit',seat:.315,face:[-2.27,2.1],pair:'gazebo',stand:[-2.27,2.04],
          go:[[-.9,3.2],[-1.9,2.62],[-2.24,2.24],[-2.27,2.04]],sec:[10,10]},
        {at:[-1.93,1.48],act:'sit',seat:.315,face:[-1.93,2.1],pair:'gazebo',stand:[-1.93,2.04],
          go:[[-.72,2.95],[-1.72,2.45],[-1.96,2.24],[-1.93,2.04]],sec:[10,10]},
      ]}}:{}),
  }};
}

export default {t:'mayor',lv:{
  1:home([[0,2.77],[0,1.65]]),
  2:home([[0,2.95],[.82,2.57],[.86,1.49],[.49,1.02]]),
  3:home([[0,3.00],[.91,2.62],[.93,1.46],[.51,1.02]]),
  4:home([[0,3.05],[1.01,2.65],[1.02,1.45],[.51,1.03]]),
  5:home([[0,3.10],[1.08,2.67],[1.11,1.88],[.96,1.29],[.50,1.01]],true),
}};
