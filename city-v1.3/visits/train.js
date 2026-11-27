/* B-5 火車站（s2_station.js；Lv1 小車站、Lv2 大車站、Lv3 高鐵站）。座標：格子中心為原點、正門朝 +z（朝鐵路）。
   正門都在 x=0：Lv1 門廊到 z 2.75、門在 z 2.05；Lv2 門在 z 1.78（雨棚柱 x ±.7）；Lv3 玻璃門在 z 1.8（台階到 z 2.1）。
   從正前方尖角的人行道直直走進大廳（月台高 .42、在格子外面，上車之後再做）。
   Lv1 站房左前方長椅 (-2.2,1.9) 面向 +z：坐著等車。所有等級都可以站在站前看鐵路。 */
const guest=(inside)=>({inside:true,max:2,sec:[8,20],door:[0,3.6],in:inside,out:inside.slice(0,-1).reverse()});
const lv=(inside,bench)=>({groups:{
  work:{...guest(inside),who:['列車長'],max:1,sec:[30,60]},
  hall:{...guest(inside),who:['背包','警察','公車司機']},
  watch:{who:['背包','警察','公車司機'],max:1,sec:[8,15],door:[-1.0,3.3],in:[],out:[],
    stay:[{at:[-1.05,2.95],act:'look',face:[-1.05,6.0]}]},
  ...(bench?{bench:{who:['背包','警察','公車司機'],max:2,door:[-1.5,3.15],in:[],out:[],
    stay:[[-2.34,0],[-2.06,1]].map(([x,i])=>({at:[x,1.9],seat:.21,act:'sit',pair:'train-bench',face:[x,2.9],stand:[x,2.35],go:[[x,2.4]],sec:[10,16]}))}}:{}),
}});
export default {t:'train',lv:{
  1:lv([[0,2.9],[0,2.45],[0,2.25],[0,1.9]],true),
  2:lv([[0,2.9],[0,2.3],[0,2.05],[0,1.7]],false),
  3:lv([[0,2.9],[0,2.35],[0,2.1],[0,1.75]],false),
}};
