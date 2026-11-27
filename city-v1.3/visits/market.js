/* Market stalls are drawn at scale 1.3 (s1_more.js). Each visit can pause
   at one of two counters. The selling aisle runs left to right; the paved
   forecourt connects the far side back to the core's shared sidewalk door. */
function market({door,aisle,stops,exit}){
  return {groups:Object.fromEntries(stops.map(([at,face,extraIn,extraOut],i)=>[
    'stall'+(i+1),{who:'*',no:['市長','Avery'],max:1,sec:[6,11],door,
      in:[...aisle,...extraIn],out:[...extraOut,...exit],
      stay:[{at,face,act:'look'}]},
  ]))};
}
export default {t:'market',lv:{
  1:market({door:[-1.35,2.93],aisle:[[-1.35,2.41],[-1.35,1.41]],
    stops:[
      [[-.78,1.41],[-.78,.585],[],[[.98,1.41]]],
      [[.98,1.41],[.98,.585],[[-.78,1.41]],[]],
    ],
    exit:[[1.28,1.65],[1.28,2.63],[.35,2.84]]}),
  2:market({door:[-1.14,2.99],aisle:[[-.75,2.48],[-.62,1.27]],
    stops:[
      [[-.60,1.2],[-1.495,.585],[],[[.58,1.20]]],
      [[.58,1.20],[1.495,.585],[[-.60,1.20]],[]],
    ],
    exit:[[.61,1.47],[.85,2.18],[.67,2.60],[-.39,2.87]]}),
  3:market({door:[-.55,3.38],aisle:[[-.51,2.46],[-.40,1.29]],
    stops:[
      [[-.42,1.20],[-.78,.54],[],[[.66,1.22]]],
      [[.66,1.22],[.95,.54],[[-.42,1.20]],[]],
    ],
    exit:[[.78,1.57],[.77,2.43],[.40,3.02]]}),
}};
