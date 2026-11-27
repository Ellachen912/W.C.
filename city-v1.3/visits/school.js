/* buildings.js S1–S3. At Lv2 and Lv3 the playground is behind the
   classrooms; the route uses the open east edge and returns to the front door. */
function school({campus,steps,entrance,teachers=false}){
  const door=[0,3.42];
  const path=[...campus,...steps,...entrance];
  return {groups:{
    students:{who:teachers?['小黃帽＋書包','老師']:['小黃帽＋書包'],max:2,
      door,in:path,out:path.slice(0,-1).reverse(),stairs:true,inside:true,sec:[30,60]},
    dropoff:{who:['大人'],no:['遛狗','嬰兒車','老師','市長','Avery'],max:1,sec:[4,8],
      door,in:[[0,3.17]],stay:[{at:[-.42,3.14],act:'stand',face:[0,2.22]}],out:[[0,3.17]]},
  }};
}

export default {t:'school',lv:{
  1:school({campus:[[0,2.64],[0,2.27]],steps:[[0,2.00],[0,1.87]],entrance:[[0,1.56]]}),
  2:school({teachers:true,campus:[[1.34,3.13],[2.46,2.70],[2.70,1.85],[2.48,.35],[2.34,-.65],
    [1.99,-1.14],[2.34,-.65],[2.48,.35],[2.70,1.85],[2.46,2.70],[1.27,2.87],[0,2.55]],
    steps:[[0,1.94],[0,1.82]],entrance:[[0,1.52]]}),
  3:school({teachers:true,campus:[[1.26,3.13],[2.30,2.84],[2.76,2.35],[2.80,1.65],
    [2.54,.20],[2.43,-.53],[2.04,-1.10],[2.43,-.53],[2.54,.20],[2.80,1.65],[2.76,2.35],
    [2.30,2.84],[1.17,2.88],[0,2.82]],steps:[[0,2.62],[0,2.49]],entrance:[[0,2.13]]}),
}};
