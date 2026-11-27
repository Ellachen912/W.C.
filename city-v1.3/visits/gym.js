/* B-5 運動中心（s3_gym.js；2 格）。座標：兩格中間為原點，x 沿兩格排列方向、正門朝 +z；左格中心 (-4.44,0)、右格 (4.44,0)，中間是路（x -.8～.8）。
   左格運動公園：從中間那條路接進來的直步道（z .05，高 .14）。
   - 泳池：池畔木平台高 .45，台階在 x -4.4～-3.8、z -.3～-.7，一階一階走上去，站在平台上看泳池（池水在 z -1.5～-2.6）。
   - 網球場：場地 x -5.6～-3.5、z .6～2.4，圍網入口那一小段步道在 x -4.6；地燈 bollard 在 z .42（x -6.14、-5.04、-3.84、-2.74）。
   右格：Lv1 草地上的長椅 (3.44,1.9)（轉 .3，座面 .30）；Lv2 棒球場，從中間的路走到正門口（x 1.1 附近的開口）進去。 */
const D=[-1.05,.05];
const pool={who:['大人','小孩'],no:['嬰兒車','遛狗'],max:2,stairs:true,sec:[8,15],door:D,
  in:[[-2.2,.05],[-4.1,.05],[-4.1,-.3],[-4.1,-.5],[-4.1,-.7],[-4.1,-.95]],
  out:[[-4.1,-.7],[-4.1,-.5],[-4.1,-.3],[-4.1,.05],[-2.2,.05]],
  stay:[{at:[-4.35,-1.25],act:'look',face:[-4.6,-2.1]},{at:[-3.75,-1.25],act:'look',face:[-3.5,-2.1]}]};
const tennis={who:['大人','小孩'],max:2,sec:[8,15],door:D,in:[[-2.2,.05]],out:[[-2.2,.05]],
  stay:[{at:[-4.55,.5],act:'look',face:[-4.55,1.5],go:[[-4.55,.05]]},{at:[-3.1,.5],act:'look',face:[-4.0,1.3],go:[[-3.1,.05]]}]};
const yaw=.3, fx=Math.sin(yaw), fz=Math.cos(yaw);
const bench={who:['大人','小孩'],max:2,door:[1.25,2.3],in:[],out:[],
  stay:[-.14,.14].map(o=>{ const x=3.44+Math.cos(yaw)*o, z=1.9-fx*o, sx=x+fx*.45, sz=z+fz*.45;
    return {at:[x,z],seat:.30,act:'sit',pair:'gym-bench',face:[x+fx,z+fz],stand:[sx,sz],go:[[sx-.3,sz+.05],[sx,sz]],sec:[10,16]}; })};
const ballpark={who:['大人','小孩'],no:['遛狗'],max:2,inside:true,sec:[8,20],door:[-.6,0],in:[[.8,0],[1.25,0]],out:[[.8,0]]};
export default {t:'gym',lv:{1:{groups:{pool,tennis,bench}},2:{groups:{pool,tennis,ballpark}}}};
