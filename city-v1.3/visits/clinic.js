/* s1_more.js：騎樓柱、機車和花台之間走中央止滑磚，從兩片拉門框之間進去。 */
const entrance = {
  inside:true, door:[-.065,1.46],
  in:[[-.065,.72],[-.065,.36],[-.065,.02],[-.065,-.45],[-.065,-.98]],
  out:[[-.065,-.45],[-.065,.02],[-.065,.36],[-.065,.72]],
};

export default {t:'clinic', lv:{1:{groups:{
  work:{...entrance,who:['醫生','護士'],max:2,sec:[30,60]},
  patients:{...entrance,who:['奶奶','爺爺'],no:['醫生','護士'],max:1,sec:[18,30]},
  guests:{...entrance,who:'*',no:['醫生','護士','奶奶','爺爺'],max:1},
}}}};
