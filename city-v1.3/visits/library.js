/* s1_more.js: all three floors retain the front door and portico.
   Source coordinates multiplied by the model's 1.3 scale. Lv3 stays left of the bookmobile. */
const door=[0,3.40];
function level(approach){
  const inPath=[...approach,[0,.94],[0,.72],[0,.08]];
  return {groups:{
    readers:{who:['小黃帽＋書包','老師','背包','奶奶','爺爺'],max:2,
      inside:true,stairs:true,door,in:inPath,out:inPath.slice(0,-1).reverse()},
    returnBooks:{who:['郵差'],max:1,sec:[4,8],door,in:approach,
      stay:[{at:[.05,1.16],act:'stand',face:[0,.26]}],out:[...approach].reverse()},
  }};
}

export default {t:'library',lv:{
  1:level([[0,2.66],[0,1.88],[0,1.30]]),
  2:level([[0,2.64],[0,1.76],[0,1.29]]),
  3:level([[-.10,2.65],[-.10,1.78],[0,1.29]]),
}};
