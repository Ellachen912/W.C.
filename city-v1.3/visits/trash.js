/* B-5 垃圾處理中心（s1_trash.js trash()；遊戲 Lv1/2＝舊 1/3）。座標：格子中心為原點、正面 +z。
   焚化爐廠房 x -1.6～.9、z -1.7～-.2，正面大卸料門在 x -.7；門前有卸料平台（高 .1）、垃圾車 (-.7,1.3)、地磅（高 .04，可以走過去）。
   清潔隊員：從地磅右邊走到平台，進大門；或在平台上掃地；或站在右邊玻璃凸窗前看裡面的垃圾吊車。 */
const lead=[[-.35,2.9],[-.35,2.0],[-.3,1.1]];
const work={who:['清潔隊員'],max:1,inside:true,sec:[30,60],
  door:[-.35,3.5],in:[...lead,[-.45,.4],[-.6,-.1],[-.6,-.6]],out:[[-.6,-.1],[-.45,.4],...lead.slice().reverse()]};
const sweep={who:['清潔隊員'],max:1,sec:[12,20],door:[-.35,3.5],in:lead,out:lead.slice().reverse(),
  stay:[{at:[-.25,.4],act:'sweep',face:[-.7,.3]}]};
const peek={who:['清潔隊員'],max:1,sec:[8,15],door:[-.35,3.5],in:lead,out:lead.slice().reverse(),
  stay:[{at:[.45,.5],act:'look',face:[.5,-.2]}]};
const L={groups:{work,sweep,peek}};
export default {t:'trash',lv:{1:L,2:L}};
