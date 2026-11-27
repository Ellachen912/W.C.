/* s1_more.js draws the park at 1.3 scale and adds .085 before scaling.
   Bench positions, orientation and seat height follow that transform. */
const vip=['市長','Avery'];
const noBench=['嬰兒車','遛狗','清潔隊員',...vip];
const door=[0,3.38];
function level(path,bench,benchPath,lookStops,sweepStop){
  const [x,z,yaw]=bench;
  const fx=Math.sin(yaw), fz=Math.cos(yaw);
  const seats=[-.17,.17].map(i=>{
    const at=[x+Math.cos(yaw)*i,z-fx*i];
    const front=d=>[at[0]+fx*d,at[1]+fz*d];
    return {at,act:'sit',seat:(.085+.21)*1.3,face:front(1),pair:'park-bench',
      stand:front(.43),go:[...benchPath,front(.43)],sec:[12,24]};
  });
  const entry={door,in:path,out:path.slice().reverse()};
  return {groups:{
    stroll:{...entry,who:'*',no:['清潔隊員',...vip],max:2,
      stay:[{at:lookStops[0],act:'stand',face:lookStops[2]}]},
    bench:{...entry,who:'*',no:noBench,max:2,stay:seats},
    birds:{...entry,who:['小孩','小女孩'],no:['嬰兒車','遛狗',...vip],max:1,
      stay:[{at:lookStops[0],act:'crouch',face:lookStops[2]}]},
    sweep:{...entry,who:['清潔隊員'],max:1,stay:[{at:sweepStop,act:'sweep',face:lookStops[2]}]},
    vipBench:{...entry,who:vip,max:2,stay:seats},
    vipBirds:{...entry,who:vip,max:2,stay:lookStops.slice(0,2).map(at=>({
      at,act:'crouch',face:lookStops[2],sec:[7,12],
    }))},
  }};
}
export default {t:'park',lv:{
  1:level([[0,3.03],[.39,1.69],[.08,1.14]],[-1.885,-.78,.7],
    [[-.19,.585],[-.72,-.455],[-1.1,-.53]],
    [[.07,.85],[.50,.77],[.195,1.235]],[.34,1.43]),
  2:level([[0,3.03],[-.19,2.08],[-.53,1.48]],[-1.3,-1.365,.45],
    [[.01,1.14],[.08,.50],[.07,-.29],[-.36,-.75]],
    [[-.52,1.21],[-.03,1.53],[.195,1.235]],[-.30,1.89]),
}};
