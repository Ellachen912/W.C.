/* s2_other.js draws Lv2 in its own group shifted by OZ. Lv1 is in
   untransformed half-plot coordinates; the core applies HALF_FIT and rotation. */
const adults=['奶奶','爺爺','菜籃'];
const vip=['市長','Avery'];
const noChildren=['小孩','小女孩'];
const OZ=-Math.sqrt(3)*4.2*.24;

function temple({at,door,gate,approach,court,censer,steps,lion}){
  const hall=[...gate,...approach,...steps].map(at);
  const indoor={inside:true,stairs:true,door:at(door),in:hall,out:hall.slice(0,-1).reverse()};
  const prayerSpot=x=>({at:at([x,court]),act:'pray',face:at([0,censer]),sec:[4,5]});
  const prayer={door:at(door),in:gate.map(at),out:gate.slice().reverse().map(at),max:2};
  return {groups:{
    entry:{...indoor,who:adults,no:noChildren,max:2},
    prayer:{...prayer,who:adults,no:noChildren,stay:[prayerSpot(-.30),prayerSpot(.30)]},
    stoneLion:{who:['小孩','小女孩'],max:1,door:at(door),
      in:[],out:[],
      stay:[{at:at(lion.stop),act:'look',face:at(lion.model),go:lion.go.map(at),sec:[6,10]}]},
    vipPrayer:{...prayer,who:vip,stay:[-.30,.30].map(x=>({...prayerSpot(x),pair:'censer'}))},
    vipHall:{...indoor,who:vip,max:2},
  }};
}

export default {t:'temple',lv:{
  1:temple({at:p=>p,door:[0,1.50],gate:[],approach:[[.57,1.39],[.60,1.06],[.56,.76]],
    court:1.44,censer:1.0,steps:[[0,.66],[0,.50],[0,.36],[0,.25],[0,-.03]],
    lion:{stop:[1.03,1.40],model:[1.50,1.15],go:[[.53,1.39]]}}),
  2:temple({at:([x,z])=>[x,z+OZ],door:[0,3.42],gate:[[0,2.70],[0,2.25],[0,1.73]],
    approach:[[.68,1.43],[.70,.88],[.70,.35],[.45,-.37],[0,-.68]],
    court:1.39,censer:.85,steps:[[0,-.86],[0,-1.0],[0,-1.10],[0,-1.38]],
    lion:{stop:[1.02,2.70],model:[1.75,2.40],go:[[.55,3.11],[.88,2.78]]}}),
}};
