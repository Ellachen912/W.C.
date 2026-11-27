/* s2_civic.js: both banks retain the same steps, portico, door and silver bull.
   The central lane runs between the reflecting pool and the bull's plinth. */
function bank(approach){
  const door=[0,3.43];
  const path=[...approach,[0,1.06],[0,.84],[0,.68],[0,.48],[0,.30],[0,.10],[0,-.23]];
  return {groups:{
    visitors:{who:['大人','背包'],no:['警察','郵差','市長','Avery'],max:2,
      inside:true,stairs:true,door,in:path,out:path.slice(0,-1).reverse()},
    silverBull:{who:['大人','背包'],no:['警察','郵差','市長','Avery'],max:1,sec:[6,12],
      door,in:[...approach,[.24,1.74]],out:[[.24,1.74],...approach.slice().reverse()],
      stay:[{at:[.94,1.73],act:'look',face:[1.55,2.2]}]},
    patrol:{who:['警察','郵差'],max:1,sec:[5,9],door,
      in:[...approach,[.25,1.45]],out:[[.35,1.50],...approach.slice().reverse()],
      stay:[{at:[.67,1.27],act:'stand',face:[0,.80]}]},
  }};
}
export default {t:'bank',lv:{
  1:bank([[0,2.65],[0,1.92]]),
  2:bank([[0,2.77],[0,1.90]]),
}};
