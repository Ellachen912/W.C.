/* s1_more.js: 1.3-scaled main entrance; staff use the separate east emergency entrance.
   Keep the approach right of the ambulance at x=.455, z=1.885. */
function hospital(frontX,frontZ,covered){
  const entry=(door,way)=>({door,in:way,out:way.slice(0,-1).reverse(),inside:true});
  const front=entry([frontX,3.41],[[frontX,2.78],[frontX,1.68],[frontX,.80],
    [frontX,frontZ+.12],[frontX,frontZ-.18]]);
  const east=1.495;
  const staff=entry([east,3.39],covered?
    [[east,2.22],[east,1.56],[east,.86],[east,.14],[east,-.147]]:
    [[east,2.45],[east,1.48],[east,.71],[east,.14],[east,-.147]]);
  return {groups:{
    staff:{...staff,who:['醫生','護士'],max:2,sec:[30,60]},
    patients:{...front,who:'*',no:['醫生','護士','市長','Avery'],max:2,sec:[12,24]},
  }};
}

export default {t:'hospital',lv:{
  1:hospital(-.715,-.0325,false),
  2:hospital(-.715,-.0325,true),
  3:hospital(-1.04,.0975,true),
}};
