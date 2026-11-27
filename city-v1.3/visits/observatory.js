/* B-5 天文台（s2_astro.js；2 格）。座標：兩格中間為原點，x 沿兩格排列方向、正門朝 +z；左格中心 (-4.44,0)、右格 (4.44,0)。
   左格：步道 (-4.09,3.5)→(-4.19,2.4)→(-4.04,1.4)→(-4.09,.62) 走到觀測圓頂的門（z .43）進去。
   院子裡的三腳架望遠鏡 (-2.49,.95)：站在旁邊看；長椅 (-2.99,1.55) 轉 -.5、座面 .30：坐著看星星。
   Lv2 起右格星象館：步道 x 4.29 從 z 3.5 到 2.3，玻璃門在 z 1.95 左右，直直走進去。 */
const dome=(who,sec)=>({who,max:1,inside:true,sec,door:[-4.09,3.45],
  in:[[-4.19,2.4],[-4.04,1.4],[-4.09,.75],[-4.09,.2]],out:[[-4.09,.75],[-4.04,1.4],[-4.19,2.4]]});
const guests=['背包','老師','小黃帽＋書包'];
const scope={who:[...guests,'太空人'],max:1,sec:[8,15],door:[-3.0,3.1],in:[[-2.6,2.2]],out:[[-2.6,2.2]],
  stay:[{at:[-2.3,1.3],act:'look',face:[-2.49,.95]}]};
const yaw=-.5, fx=Math.sin(yaw), fz=Math.cos(yaw);
const bench={who:guests,max:2,door:[-3.0,3.1],in:[],out:[],
  stay:[-.14,.14].map(o=>{ const x=-2.99+Math.cos(yaw)*o, z=1.55-fx*o, sx=x+fx*.45, sz=z+fz*.45;
    return {at:[x,z],seat:.30,act:'sit',pair:'obs-bench',face:[x+fx,z+fz],stand:[sx,sz],go:[[sx,sz]],sec:[10,16]}; })};
const planet={who:[...guests,'太空人'],max:2,inside:true,sec:[8,20],door:[4.29,3.45],in:[[4.29,2.6],[4.29,2.15],[4.29,1.5]],out:[[4.29,2.15],[4.29,2.6]]};
const L1={groups:{work:dome(['太空人'],[30,60]),visit:dome(guests,[8,20]),scope,bench}};
export default {t:'observatory',lv:{1:L1,2:{groups:{...L1.groups,planet}}}};
