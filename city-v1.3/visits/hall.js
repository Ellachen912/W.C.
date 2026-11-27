/* buildings.js H1–H5. The three treads are .08, .16, .22 high.
   The west benches at Lv2/3/5 use the existing life.js COURT.hall seats and approach. */
function benchVisit(x,z,yaw){
  const fx=Math.sin(yaw), fz=Math.cos(yaw);
  const seats=[-.14,.14].map(offset=>[x+Math.cos(yaw)*offset,z-fx*offset]);
  const approach=seats.map(([sx,sz])=>[sx+fx*.45,sz+fz*.45]);
  const lead=[
    [[approach[0][0]*.55,3.35],approach[0]],
    [[(approach[1][0]-.2)/2,(approach[1][1]+3.25)/2],approach[1]],
  ];
  return {who:['市長','Avery'],max:2,door:[-.20,3.42],in:[],out:[],
    stay:seats.map(([sx,sz],i)=>({at:[sx,sz],seat:.21,act:'sit',pair:'hall-west-bench',
      face:[sx+fx,sz+fz],stand:approach[i],go:lead[i],sec:[10,10]}))};
}

function floor({approach,steps,entry,meeting,bench,driver=false}){
  const door=[0,3.42];
  const way=[...approach,...steps,...entry];
  const inside={inside:true,stairs:true,door,in:way,out:way.slice(0,-1).reverse()};
  const [a,b]=meeting;
  // Two facing spots stay usable for a future handshake without occupying the steps.
  const plaza={door,in:[[(a[0]+b[0])/2,a[1]+.32]],out:[[(a[0]+b[0])/2,a[1]+.32]]};
  return {groups:{
    visitors:{...inside,who:['大人'],no:['市長','Avery','郵差','公車司機'],max:1,sec:[8,16]},
    mayorOffice:{...inside,who:['市長'],max:1,sec:[30,60]},
    service:{...plaza,who:driver?['郵差','公車司機']:['郵差'],max:1,sec:[6,12],
      stay:[{at:b,act:'stand',face:a}]},
    mayorGreeting:{...plaza,who:['市長'],max:1,sec:[6,12],
      stay:[{at:a,act:'proud',face:b}]},
    vipPlaza:{...plaza,who:['市長','Avery'],max:2,sec:[8,15],
      stay:[{at:a,act:'stand',face:b},{at:b,act:'stand',face:a}]},
    ...(bench?{vipBench:benchVisit(...bench)}:{}),
  }};
}

export default {t:'hall',lv:{
  1:floor({approach:[[0,2.38],[0,1.42]],steps:[[0,1.06],[0,.96],[0,.86]],
    entry:[[0,.48],[0,.08]],meeting:[[-.43,2.42],[.43,2.42]]}),
  2:floor({approach:[[0,2.43],[0,1.56]],steps:[[0,1.14],[0,1.04],[0,.94]],
    entry:[[0,.48],[0,.08]],meeting:[[-.43,2.61],[.43,2.61]],bench:[-1.2,1.95,0]}),
  3:floor({approach:[[0,2.78],[0,2.26],[0,1.58]],steps:[[.23,1.18],[.23,1.08],[.23,.98]],
    entry:[[.23,.52],[0,.44],[0,.08]],meeting:[[-.43,2.65],[.43,2.65]],bench:[-1.1,1.75,0],driver:true}),
  4:floor({approach:[[0,2.94],[.67,2.44],[.66,1.55],[.39,1.28]],
    steps:[[0,1.15],[0,1.05],[0,.95]],entry:[[0,.48],[0,.02]],
    meeting:[[-.40,2.55],[.40,2.55]],driver:true}),
  5:floor({approach:[[0,3.03],[.98,2.72],[1.01,1.60],[.60,1.08]],
    steps:[[0,.92],[0,.82],[0,.72]],entry:[[0,.36],[0,-.23]],
    meeting:[[-.43,2.76],[.43,2.76]],bench:[-1.55,2.2,.35],driver:true}),
}};
