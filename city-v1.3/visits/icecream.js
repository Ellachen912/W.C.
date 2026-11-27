/* s2_icecream.js：門在 x=.70。兩桌由正面進場；VIP 在同一張桌兩側站著吃。 */
const entrance = {
  inside:true, stairs:true, door:[.85,1.50],
  in:[[.82,1.12],[.70,.56],[.70,.24],[.70,-.17],[.70,-.33]],
  out:[[.70,-.17],[.70,.24],[.70,.56],[.82,1.12]],
};

function table(x,pair){
  return {
    who:['小孩','小女孩','小黃帽＋書包'],no:['市長','Avery'],max:2,door:[x,1.52],in:[[x,1.48]],
    stay:[-1,1].map(side=>({
      at:[x+side*.29,1.10],act:'sit',face:[x,1.10],seat:.35,pair,
      go:[[x+side*.29,1.48]],stand:[x+side*.38,1.43],sec:[12,25],
    })),out:[[x,1.48]],
  };
}

export default {t:'icecream', lv:{1:{groups:{
  work:{...entrance,who:['廚師'],max:1,sec:[30,60]},
  guests:{...entrance,who:['小孩','小女孩','小黃帽＋書包','大人'],no:['廚師','市長','Avery'],max:1},
  leftTable:table(-1.4,'ice-left'),
  rightTable:table(.15,'ice-right'),
  vip:{who:['市長','Avery'],max:2,sec:[12,25],door:[.15,1.53],in:[[.15,1.49]],
    stay:[
      {at:[-.25,1.43],act:'icecream',face:[.15,1.1],pair:'ice-vip'},
      {at:[.55,1.43],act:'icecream',face:[.15,1.1],pair:'ice-vip'},
    ],out:[[.15,1.49]]},
  terrace:{who:['遛狗','嬰兒車'],max:1,door:[1.24,1.50],in:[[1.19,1.28]],
    stay:[{at:[1.08,1.08],act:'stand',face:[.15,1.10]}],out:[[1.19,1.28]]},
}}}};
