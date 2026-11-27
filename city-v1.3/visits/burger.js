/* s2_fastfood.js：左披薩、右漢堡。室內分開走，兩桌從街道的外側入座。 */
const pizza = {
  inside:true, stairs:true, door:[-1.78,1.57],
  in:[[-1.86,1.19],[-1.78,.77],[-1.70,.22],[-1.70,-.46],[-1.70,-.50],[-1.70,-.535],[-1.70,-.72]],
  out:[[-1.70,-.535],[-1.70,-.50],[-1.70,-.46],[-1.70,.22],[-1.78,.77],[-1.86,1.19]],
};
const burger = {
  inside:true, door:[1.71,1.54],
  in:[[1.71,1.13],[1.71,.66],[1.72,.35],[1.72,-.12]],
  out:[[1.72,.35],[1.71,.66],[1.71,1.13]],
};

function table(x,pair){
  return {
    who:'*',no:['廚師'],max:2,door:[x,1.65],in:[[x,1.57]],
    stay:[-1,1].map(side=>({
      at:[x+side*.28,1.2],act:'sit',face:[x,1.2],seat:.35,pair,
      go:[[x+side*.28,1.57]],stand:[x+side*.36,1.55],sec:[12,25],
    })),out:[[x,1.57]],
  };
}

export default {t:'burger', lv:{1:{groups:{
  workPizza:{...pizza,who:['廚師'],max:1,sec:[30,60]},
  workBurger:{...burger,who:['廚師'],max:1,sec:[30,60]},
  pizzaGuests:{...pizza,who:'*',no:['廚師'],max:1},
  burgerGuests:{...burger,who:'*',no:['廚師'],max:1},
  pizzaTable:table(-1.15,'pizza-table'),
  burgerTable:table(1.0,'burger-table'),
}}}};
