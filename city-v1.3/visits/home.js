/* s1_home.js: use the driveways and front gates at Lv1–2,
   and the open courtyard paths for the two apartment entrances at Lv3. */
function block(homes,mail){
  const rooms=homes.map(({door,path},i)=>['home'+(i+1),{
    who:['大人','小孩'],no:['郵差','市長','Avery'],max:1,inside:true,sec:[15,32],
    door,in:path,out:path.slice(0,-1).reverse(),
  }]);
  return {groups:{...Object.fromEntries(rooms),mail:{who:['郵差'],max:1,sec:[4,8],...mail}}};
}
const post=(door,path,at,face)=>({door,in:path,out:path.slice().reverse(),stay:[{at,face,act:'stand'}]});
export default {t:'home',lv:{
  1:block([
    {door:[-.7,3.36],path:[[-.70,2.75],[-.70,1.35],[-.60,.92],[-.60,.51]]},
    {door:[.7,3.36],path:[[.70,2.75],[.70,1.33],[2.50,1.33],[2.51,.79],[2.02,.79],[2.02,.58]]},
  ],post([-.7,3.36],[[-.70,2.84]],[-.77,2.56],[-1.20,2.50])),
  2:block([
    {door:[-1.60,3.12],path:[[-1.60,2.74],[-1.60,1.28],[-1.90,1.10],[-1.68,.68],[-1.93,.64],[-1.93,.44]]},
    {door:[.55,3.38],path:[[.55,2.8],[.55,1.32],[.51,.78],[.51,.34]]},
    {door:[1.60,3.12],path:[[1.6,2.74],[1.60,1.18],[2.67,1.16],[2.67,.67],[2.67,.27]]},
  ],post([.55,3.38],[[.55,2.82]],[.5,2.56],[.05,2.55])),
  3:block([
    {door:[0,3.41],path:[[.32,2.42],[-.15,1.27],[-1.08,.82],[-1.14,.28],[-.91,.12],[-.91,-.57],[-1.18,-.63],[-1.18,-.90]]},
    {door:[0,3.41],path:[[.32,2.42],[-.15,1.27],[.20,.44],[.55,.31],[1.26,.27],[2.05,.25],[2.05,-.24],[2.05,-.61]]},
  ],post([0,3.41],[[.32,2.42],[-.15,1.27],[-1.03,.82]],[-1.12,.39],[-1.18,-.73])),
}};
