/* s2_japanese.js：從三塊踏腳石到門檻，紅布長板凳座面為 .37。 */
const entrance = {
  inside:true, stairs:true, door:[.10,1.52],
  in:[[.10,1.35],[0,1.0],[.06,.65],[.06,.34],[.06,.02]],
  out:[[.06,.34],[.06,.65],[0,1.0],[.10,1.35]],
};

export default {t:'japanese', lv:{1:{groups:{
  work:{...entrance,who:['廚師'],max:1,sec:[30,60]},
  guests:{...entrance,who:'*',no:['廚師'],max:2},
  bench:{who:'*',no:['廚師'],max:2,door:[1.0,1.55],in:[[1.0,1.48]],
    stay:[
      {at:[.82,1.15],act:'sit',face:[.82,1.52],seat:.37,pair:'red-bench',stand:[.60,1.47],go:[[.82,1.47]]},
      {at:[1.16,1.15],act:'sit',face:[1.16,1.52],seat:.37,pair:'red-bench',stand:[1.44,1.45],go:[[1.16,1.47]]},
    ],out:[[1.0,1.48]]},
}}}};
