/* s1_more.js：遊戲 Lv1 使用大型店面。座標乘 1.25；塑膠椅另乘 .62，座面約 .286。
   正門由最左桌外側繞入，避開左側座位與煎台。 */
const entrance = {
  inside:true, stairs:true, door:[-1.93,1.56],
  in:[[-2.10,1.19],[-1.92,.74],[-1.2875,.40],[-1.2875,-.28125],[-1.2875,-.59]],
  out:[[-1.2875,-.28125],[-1.2875,.40],[-1.92,.74],[-2.10,1.19]],
};

export default {t:'breakfast', lv:{1:{groups:{
  work:{...entrance,who:['廚師'],max:1,sec:[30,60]},
  guests:{...entrance,who:'*',no:['廚師'],max:2},
  table:{who:'*',no:['廚師'],max:2,door:[-1.31,1.60],in:[[-1.31,1.57]],
    stay:[
      {at:[-1.7125,1.1875],act:'sit',face:[-1.3125,1.1875],seat:.286,pair:'breakfast-table',
        stand:[-1.83,1.56],go:[[-1.7125,1.57]],sec:[12,25]},
      {at:[-.9125,1.1875],act:'sit',face:[-1.3125,1.1875],seat:.286,pair:'breakfast-table',
        stand:[-.80,1.56],go:[[-.9125,1.57]],sec:[12,25]},
    ],out:[[-1.31,1.57]]},
}}}};
