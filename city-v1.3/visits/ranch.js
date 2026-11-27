/* s1_farm.js: use the public lane outside the round pens.
   Lv1 pigs and chicken coop; Lv2 also has a cow pen in the foreground. */
function level(door,path,publicStop,ownerStops){
  const work={who:['牧場主人'],max:1,sec:[30,60],door,in:path,out:path.slice().reverse()};
  return {groups:{
    visitors:{who:'*',no:['牧場主人','市長','Avery'],max:1,door,in:path,out:path.slice().reverse(),
      stay:[{...publicStop,act:'look'}]},
    owner:{...work,stay:[ownerStops[1]]},
    ownerCrouch:{...work,stay:[ownerStops[0]]},
  }};
}
export default {t:'ranch',lv:{
  1:level([.55,3.41],[[.38,3.04],[.10,2.78],[-.05,2.35]],
    {at:[-.20,2.28],face:[-1.35,1.25]},[
      {at:[-.18,2.17],act:'crouch',face:[-1.35,1.25]},
      {at:[-.17,.88],act:'look',face:[1.65,-.5],go:[[-.12,1.47],[-.15,1.10]]},
    ]),
  2:level([.12,3.39],[[.08,3.16],[-.05,2.99]],
    {at:[.13,3.04],face:[.90,2.00]},[
      {at:[.12,2.96],act:'crouch',face:[.90,2.00]},
      {at:[-.92,2.61],act:'look',face:[-1.35,1.25],go:[[-.61,3.00],[-.9,2.85]]},
    ]),
}};
