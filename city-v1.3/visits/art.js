/* s2_art.js: the active museum model has the rotunda, entrance at x=.55,
   the figure-eight sculpture to the left and the reflecting pool to the right. */
const entrance={
  inside:true,stairs:true,door:[.1,3.42],
  in:[[.1,2.92],[.1,1.05],[.55,.88],[.55,.27],[.55,-.38],[.55,-.62]],
  out:[[.55,-.38],[.55,.27],[.55,.88],[.1,1.05],[.1,2.92]],
};
export default {t:'art',lv:{1:{groups:{
  work:{...entrance,who:['畫家'],max:1,sec:[30,60]},
  visitors:{...entrance,who:['大人','老師','背包'],no:['畫家','市長','Avery'],max:2},
  figureEight:{who:['大人','老師','背包'],no:['畫家','市長','Avery'],max:1,sec:[6,12],
    door:[-1.20,2.97],in:[[-1.20,2.50]],out:[[-1.20,2.50]],
    stay:[{at:[-1.18,2.03],act:'look',face:[-1.05,1.35]}]},
  reflectingPool:{who:['大人','老師','背包'],no:['畫家','市長','Avery'],max:1,sec:[6,12],
    door:[1.30,2.96],in:[[1.33,2.57]],out:[[1.33,2.57]],
    stay:[{at:[1.54,2.03],act:'look',face:[1.55,.75]}]},
}}}};
