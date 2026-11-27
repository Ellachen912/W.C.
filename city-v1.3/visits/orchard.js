/* s2_orchard.js: the central stone walk crosses the front fence gap.
   The fruit stand is present at Lv2. Lv1 has a fruit cart. */
const door=[.05,3.42];
function orchard(work,front,guest){
  // A farmer carries a basket; keep a standing stop for the current canDo rules.
  const workRoute={who:['農夫'],max:1,sec:[30,60],door,in:work,out:work.slice().reverse()};
  const fieldStop={at:[.30,-.06],face:[-.60,.10]};
  return {groups:{
    farmer:{...workRoute,stay:[{...fieldStop,act:'stand'}]},
    farmerCrouch:{...workRoute,stay:[{...fieldStop,act:'crouch'}]},
    fruit:{who:'*',no:['農夫','市長','Avery'],max:1,door,in:front,out:front.slice().reverse(),stay:[guest]},
  }};
}
export default {t:'orchard',lv:{
  1:orchard([[.05,3.02],[.15,1.90],[.57,1.04],[.59,.51]],
    [[.05,3.02],[.15,1.90],[.65,1.20]],{at:[1.10,1.05],act:'look',face:[1.75,.75]}),
  2:orchard([[.05,3.02],[.15,1.90],[.28,1.06],[.60,.51]],
    [[.05,3.02],[.12,2.36]],{at:[.40,1.82],act:'look',face:[1.25,1.75]}),
}};
