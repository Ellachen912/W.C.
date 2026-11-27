/* The public test menu exposes one level, drawn with NIGHT_LV[1] (the
   large night market). Go up the right aisle and return on the left. */
const door=[0,3.39];
const entry=[[0,2.86],[-.04,2.39],[.13,1.77],[1.10,1.42]];
const route=[[1.10,.55],[1.04,-.56],[.85,-1.20],[.79,-1.88]];
const returnAisle=[[-.79,-1.89],[-.91,-1.19],[-1.09,-.50],[-1.13,.72],[-1.12,1.35],
  [-1.12,2.44],[-.95,2.62],[-.04,2.62],[0,2.86]];
const back=[...route,...returnAisle];
const guests=['市長','Avery','清潔隊員','警察'];
const seat=.1+.369*.8; // s2_nightmarket.js pchair: y=.1, scale=.8
const stroll=(inPath,out,at,face)=>({door,who:'*',no:guests,max:1,sec:[6,11],
  in:inPath,out,stay:[{at,act:'look',face}]});

export default {t:'nightmarket',lv:{1:{groups:{
  foodStall:stroll(entry,back,[1.13,.54],[2,.50]),
  squidStall:stroll([...entry,...route.slice(0,2)],back.slice(2),[1.02,-1.05],[2,-1.05]),
  gameStall:stroll([...entry,...route],returnAisle,[.67,-1.83],[.45,-2.35]),
  meal:{door,who:'*',no:guests,max:2,in:[[0,2.86],[-.04,2.39],[-.04,2.27]],out:[[-.04,2.39],[0,2.86]],
    stay:[-.625,-.275].map(x=>({at:[x,2.135],act:'sit',seat,face:[x,1.75],
      stand:[x,2.47],go:[[x,2.46]],pair:'front-table',sec:[12,22]}))},
  fish:{door,who:['小孩','小女孩'],no:['Avery'],max:1,in:[...entry,...route.slice(0,2)],
    out:back.slice(2),stay:[{at:[.64,-.84],act:'crouch',face:[0,-1.20],sec:[5,9]}]},
  sweep:{door,who:['清潔隊員'],max:1,in:[...entry,...route.slice(0,2)],out:back.slice(2),
    stay:[{at:[1.05,-.57],act:'sweep',face:[1.05,-1.15],sec:[12,19]}]},
  patrol:{door,who:['警察'],max:1,in:[...entry,...route],out:returnAisle,
    stay:[{at:[.35,-1.87],act:'stand',face:[0,-.90],sec:[5,9]}]},
}}}};
