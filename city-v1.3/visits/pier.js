/* s2_pier.js: land access is from -z. The stone quay is .32 high;
   the planks of the .5-wide western jetty are .30 high. */
function pier(path){
  const door=[-.67,-3.42];
  const inPath=[[-.67,-3.17],...path,[-1.60,-.48],[-1.60,-.08],[-1.60,.20],[-1.60,.62],[-1.60,1.04]];
  const route={door,in:inPath,out:inPath.slice().reverse(),max:1,no:['嬰兒車','遛狗','市長','Avery']};
  return {groups:{
    captain:{...route,who:['船長'],sec:[30,60],stay:[{at:[-1.60,1.18],act:'look',face:[-1.60,2.60]}]},
    visitors:{...route,who:['大人','小孩','背包'],no:[...route.no,'船長'],sec:[7,14],
      stay:[{at:[-1.60,1.18],act:'look',face:[-1.60,2.60]}]},
  }};
}
export default {t:'pier',lv:{
  1:pier([[-.92,-2.91],[-.95,-2.54],[-1.31,-1.76],[-1.65,-1.12]]),
  2:pier([[-.92,-2.91],[-.95,-2.54],[-1.29,-1.74],[-1.65,-1.12]]),
  3:pier([[-.74,-2.86],[-.76,-2.56],[-.91,-2.00],[-1.10,-1.88],[-1.66,-1.84],[-1.78,-1.40],[-1.65,-.95]]),
}};
