/* s2_other.js：正門 x=.15，柱子在 x=-.45、.75。站崗在中央走道左側。 */
const entrance = {
  inside:true, door:[.15,1.48],in:[[.15,.91],[.15,.55],[.15,.02]],
  out:[[.15,.55],[.15,.91]],
};

export default {t:'policebox', lv:{1:{groups:{
  work:{...entrance,who:['警察'],max:1,sec:[30,60]},
  guard:{who:['警察'],max:1,sec:[30,60],door:[-.37,1.48],in:[[-.37,1.22]],
    stay:[{at:[-.37,1.02],act:'guard',face:[-.37,1.50]}],out:[[-.37,1.22]]},
  guests:{...entrance,who:'*',no:['警察'],max:1,sec:[8,12]},
}}}};
