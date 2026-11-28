import {cleanExplore} from './explore.js';
/* Winston City 資料和存檔：地圖格子（土地編號）、建築種類、費用、存在這台裝置瀏覽器裡的進度。
   土地系統（《建築與開發階段總表》第五節）：Tile（地圖上的六角格，HEX-001～HEX-050）→ Plot（可蓋建築的土地：整格 HEX-012，或半格 HEX-012-A／-B）→ Building（建築）。
   存檔記「哪一塊地蓋了什麼、幾級」：S.b={ 'HEX-026':{t:'hall',lv:3,name:'可以自己改名'} }。 */
export const STAGES=['','啟航灣','微風港','珊瑚島','星潮城','木星都'];
/* 第一階段 7 棟的價格還沒定：先只在測試模式蓋得到。價格定好後改成 true，孩子就能點空地蓋 */
export const OPEN_S1=true;

/* ---------- 地圖：橫向 10 欄 × 5 排＝50 格 ---------- */
export const ZONES={
  water:{name:'自來水廠',color:'#b9e0e6'}, farm:{name:'農業畜牧區',color:'#c4e39a'}, nature:{name:'自然科學',color:'#a9dcb0'}, culture:{name:'文化區',color:'#d9c9f0'},
  astro:{name:'天文台',color:'#c9d4ee'}, other:{name:'其他區',color:'#e9e4d6'}, edu:{name:'教育區',color:'#f6dea6'}, biz:{name:'商業與生活區',color:'#f3d3c4'},
  res:{name:'住宅區',color:'#f7c9b6'}, civic:{name:'市政中心',color:'#efe8da'}, mayor:{name:'市長的家',color:'#f7c9b6'}, med:{name:'醫療與安全區',color:'#f6c8c8'},
  sport:{name:'運動區',color:'#8fd0a0'}, food:{name:'美食區',color:'#ffd88f'}, power:{name:'發電廠',color:'#ecdf9c'}, sewage:{name:'污水處理廠',color:'#bcd6b4'},
  trash:{name:'垃圾處理中心',color:'#a9dcba'}, trans:{name:'交通區',color:'#c5d9e8'},
  info:{name:'資訊園區',color:'#b8e6e0'},   // 家長 11-20 23:34：HEX-021、031（還沒有建築）
  none:{name:'待定',color:'#e4e1d8'},       // 家長 11-20 23:37、11-21 07:09：還沒決定要做什麼的地（不能蓋）
};
/* 家長 11-20 23:33～11-21 07:09 重新分區（第三階段）：
   002～006 農業；011～015 自然科學；007、008、022 待定；021、031 資訊園區；029、030、040 文化（運動區併進文化）；
   044 美食；042 改成其他區，只能蓋消防站和派出所；污水、垃圾搬到南邊的新格子 052、053，043 留空。
   家長 11-25 17:14：發電廠那一格的鐵路地下化會卡到河，所以發電廠移回原位 041。 */
export const GRID=[ // 北（後山）→南（前海），10 欄；單數欄（第 1、3、5、7、9 欄）往南錯開半格
  ['water','farm','farm','farm','farm','farm','none','none','astro','astro'],
  ['nature','nature','nature','nature','nature','other','edu','edu','culture','culture'],
  ['info','none','biz','res','res','civic','mayor','med','culture','culture'],
  ['info','biz','biz','biz','food','food','other','med','med','culture'],
  ['power','other','none','food','food','food','trans','trans','trans','trans'],
];
export const SPLIT=new Set(['other','food']);          // 這兩區每格切成上下兩個半格（A 上、B 下，固定不變）
const p3=n=>String(n).padStart(3,'0');
export const tileId=(r,c)=>'HEX-'+p3(r*10+c+1);
export const TILES=[]; export const PLOTS={};
GRID.forEach((row,r)=>row.forEach((zone,c)=>{ const id=tileId(r,c), t={id,r,c,zone,plots:[]}; TILES.push(t);
  if(SPLIT.has(zone)) for(const [k,side] of [['A',-1],['B',1]]){ const pid=id+'-'+k; PLOTS[pid]={id:pid,tile:id,r,c,zone,half:true,side}; t.plots.push(pid); }
  else { PLOTS[id]={id,tile:id,r,c,zone,half:false,side:0}; t.plots.push(id); } }));
/* 額外的格子：
   - 碼頭專用（家長 11-19 23:44 畫的位置）：火車站旁邊、鐵軌外面靠海。位置由 index.html 算（要在鐵軌外面）。
   - 污水、垃圾往南移一格（家長 11-20 22:56、23:01；11-25 17:14 發電廠移回 041）：HEX-052、053，就在 042、043 的正南邊（south:1，照一般格子排）。 */
export const EXTRA_TILES=[{id:'HEX-051',r:5,c:7,zone:'trans',only:'pier',under:'HEX-049'},
  {id:'HEX-052',r:5,c:1,zone:'sewage',under:'HEX-042',south:1},{id:'HEX-053',r:5,c:2,zone:'trash',under:'HEX-043',south:1}];
EXTRA_TILES.forEach(e=>{ const t={id:e.id,r:e.r,c:e.c,zone:e.zone,plots:[e.id],only:e.only,extra:!e.south,south:!!e.south}; TILES.push(t);
  PLOTS[e.id]={id:e.id,tile:e.id,r:e.r,c:e.c,zone:e.zone,half:false,side:0,only:e.only,extra:!e.south}; });
export const TILE=Object.fromEntries(TILES.map(t=>[t.id,t]));
/* 專用的格子（家長 11-20 23:01、11-21 07:09）：這一格只能蓋這幾種；這幾種也只能蓋在這一格 */
export const TILE_ONLY={'HEX-051':['pier'],'HEX-047':['train'],'HEX-042':['firestation','policebox']};
/* 佔 2 格的建築固定配對（家長 11-20 23:02：天文台就是 009＋010，升級時第二格不會亂跑） */
export const PAIR={'HEX-009':'HEX-010','HEX-010':'HEX-009','HEX-011':'HEX-012','HEX-012':'HEX-011','HEX-013':'HEX-014','HEX-014':'HEX-013'};   /* 11-28：自然科學區固定 011＋012、013＋014 兩對（恐龍博物館、動物園各用一對），015 多出來 */
/* 相鄰的六角格（給佔 2 格的大建築用）：單數欄往南錯開半格 */
export function neighbors(tid){ const t=TILE[tid], odd=t.c%2===0, /* 0 起算的雙數欄（第 1、3、5… 欄）往南錯開 */ d=[[-1,0],[1,0],[odd?0:-1,-1],[odd?1:0,-1],[odd?0:-1,1],[odd?1:0,1]];
  return d.map(([dr,dc])=>TILES.find(x=>x.r===t.r+dr&&x.c===t.c+dc)).filter(Boolean).map(x=>x.id); }

/* ---------- 建築種類 ----------
   zone 蓋在哪一區；size 'full' 整格、'half' 半格、2 佔兩格；max 最多蓋幾間；maxLv 最高等級；cost[lv] 蓋／升到該級要幾顆木星；
   req 要先蓋好的 [[種類,等級]]；cap 等級不能超過哪一棟；fixed 一開始就有、不能另外蓋；s1 第一階段；soon 還沒畫好（選單灰掉）；
   only 只能蓋在哪一格（家長 11-20 23:01、11-21 07:09）
   家長 11-20 23:33：除了住宅，每一種建築都只能蓋一間（max 預設 1）。 */
const T=(name,zone,o={})=>({name,zone,size:'full',max:1,maxLv:3,cost:[0,0,0,0,0,0],req:[],...o});
/* 11-19 15:19 家長：照《建築總表》改成「每一級各自的條件」；第二階段已經畫好的都開放（要市政廳 Lv3）。
   req 可以是陣列（只有 Lv1 的條件）或 {1:[...],2:[...]}（每一級各自的條件）；一個條件可以是 ['種類',等級]、['any',['pier','train']]（其中一個）、['food',2]（任意 2 家美食店）。
   stage:2＝第二階段，要市政廳 Lv3 才能蓋；grow＝廟：Lv2 要同一格另一半空著，升級後佔滿整格 */
const U3=n=>[0,...Array(n).fill(0)].map((_,i)=>i===0?0:3);   // 升級一律 3 顆
const C=(lv1,maxLv)=>{ const c=U3(maxLv); c[1]=lv1; return c; };
export const TYPES={
  hall:  T('市政廳','civic',{maxLv:5,cost:[0,0,5,5,5,5],fixed:1}),
  mayor: T('市長的家','mayor',{maxLv:5,cost:[0,0,3,3,3,3],cap:'hall',fixed:1}),
  school:T('學校','edu',{cost:C(5,3),req:[['hall',2]],cap:'hall'}),
  library:T('圖書館','edu',{cost:C(5,3),req:[['school',1]],cap:'hall'}),
  // 第一階段
  power: T('發電廠','power',{cost:C(5,3),s1:1}),
  water: T('自來水廠','water',{cost:C(5,3),s1:1}),
  home:  T('住宅區','res',{max:99,cost:C(5,3),req:{1:[['power',1],['water',1]],2:[['power',2],['water',2]],3:[['sewage',1],['hall',3]]},s1:1}),   // 住宅不限間數（家長 11-20 23:33）
  sewage:T('污水處理廠','sewage',{cost:C(5,3),req:[['home',1]],s1:1}),
  trash: T('垃圾處理中心','trash',{maxLv:2,cost:C(5,2),req:{2:[['home',2]]},s1:1}),
  garden:T('菜園','farm',{maxLv:2,cost:C(4,2),req:[['water',1]],s1:1}),
  ranch: T('牧場','farm',{maxLv:2,cost:C(4,2),req:[['water',1]],s1:1}),
  // 農業（第二階段）
  orchard:T('果園','farm',{maxLv:2,cost:C(4,2),req:[['garden',1]],stage:2}), tea:T('茶園','farm',{maxLv:2,cost:C(4,2),req:[['garden',1]],stage:2}), agri:T('農產加工廠','farm',{req:[['garden',2],['ranch',2]],soon:1}),
  // 美食區：全部只有一級、6 顆（家長 11-19 11:16）
  breakfast:T('早餐店','food',{size:'half',maxLv:1,cost:[0,6],req:[['garden',1],['ranch',1]]}),
  bakery:T('麵包店','food',{size:'half',maxLv:1,cost:[0,6],req:[['garden',2],['ranch',1]],stage:2}),
  icecream:T('冰淇淋店','food',{size:'half',maxLv:1,cost:[0,6],req:[['ranch',2],['orchard',1]],stage:2}),
  burger:T('漢堡披薩店','food',{size:'half',maxLv:1,cost:[0,6],req:[['garden',2],['ranch',2]],stage:2}),
  japanese:T('日式料理店','food',{size:'half',maxLv:1,cost:[0,6],req:[['garden',2],['pier',1]],stage:2}),
  nightmarket:T('夜市','food',{maxLv:1,cost:[0,6],req:[['food',2]],stage:2}),   /* 家長 11-20 08:44 先不開放；11-28 01:15 家長：夜市可以開放了 */
  donut:T('甜甜圈店','food',{size:'half',maxLv:1,req:[['orchard',1],['bakery',1]],soon:1}), boba:T('珍珠奶茶店','food',{size:'half',maxLv:1,req:[['tea',1]],soon:1}), cafe:T('咖啡廳','food',{size:'half',maxLv:1,req:[['tea',1],['bakery',1]],soon:1}),
  // 商業與生活（家長 11-20 23:33、11-25 16:36：百貨公司、觀光飯店直接移除；商店街改叫老街；書店搬到其他區、改半格）
  market:T('市場','biz',{cost:C(5,3),req:{1:[['garden',1]],2:[['garden',1],['orchard',1]]}}),
  bank:T('銀行','biz',{maxLv:2,cost:C(5,2),req:{1:[['market',1]],2:[['any',['pier','train']]]},stage:2}),
  street:T('老街','biz',{req:[['home',1],['conv',1]],soon:1}),
  // 文化（家長 11-20 23:36：運動區併進文化區）
  art:T('美術館','culture',{maxLv:1,cost:[0,7],req:[['library',1]],stage:2}),
  music:T('音樂廳','culture',{req:[['art',1]],soon:1}), aquarium:T('海生館','culture',{maxLv:1,cost:[0,7],req:[['pier',1],['market',1]],stage:2,hallLv:4}),
  gym:T('運動中心','culture',{size:2,maxLv:2,cost:[0,5,4],req:[['school',1]],cap:'hall',stage:2,hallLv:4}),   /* 家長 11-27 12:17：改成 2 格（Lv1 運動公園：專業跳水游泳池＋網球場；Lv2 加木星棒球場） */
  /* 自然科學（家長 11-28 01:20：只放恐龍博物館、動物園，各佔 2 格；植物園、兒童遊戲公園拿掉。08:16：恐龍博物館要市政廳 Lv4） */
  dino:T('恐龍博物館','nature',{size:2,maxLv:1,req:[['art',1]],hallLv:4}), zoo:T('動物園','nature',{size:2,req:[['ranch',2]],soon:1}),
  observatory:T('天文台','astro',{size:2,cost:C(5,3),req:[['library',1]],cap:'hall',stage:2,hallLv:4}),   /* 家長 11-28 08:16：市政廳 Lv4 才開放 */
  // 醫療與安全（家長 11-20 23:16：醫院改成市政廳 Lv3 就開放）
  hospital:T('醫院','med',{cost:C(5,3),req:[['hall',3]],cap:'hall'}), firedept:T('消防總局','med',{req:[['water',1],['firestation',1]],soon:1,hallLv:4}), police:T('警察總部','med',{req:[['home',1],['policebox',1]],soon:1,hallLv:4}),   /* 家長 11-28 08:20：改名消防總局、警察總部，市政廳 Lv4 才開放 */
  // 其他區（半格）
  clinic:T('診所','other',{size:'half',maxLv:1,cost:[0,4],req:[['home',1]]}), conv:T('便利商店','other',{size:'half',maxLv:1,cost:[0,4],req:[['home',1]]}),
  park:T('社區公園','other',{maxLv:2,cost:C(4,2),req:{1:[['home',1]],2:[['home',2]]}})   /* 家長 11-13：公園改一整格（蓋在其他區會佔上下兩個半格） */,
  /* 家長 11-20 23:16：消防站、派出所改成市政廳 Lv2 就開放；11-21 07:09：只能蓋在 HEX-042（上下哪一半自己選） */
  firestation:T('消防站','other',{size:'half',maxLv:1,cost:[0,4],req:[['hall',2]],only:'HEX-042'}),
  policebox:T('派出所','other',{size:'half',maxLv:1,cost:[0,4],req:[['hall',2]],only:'HEX-042'}),
  temple:T('台灣傳統廟','other',{size:'half',maxLv:2,cost:C(4,2),req:[['home',1]],grow:1,stage:2}),
  stationery:T('文具店','other',{size:'half',maxLv:1,cost:[0,4],req:[['school',1]],stage:2}),
  bookstore:T('書店','other',{size:'half',maxLv:1,req:[['library',1]],soon:1}),
  // 交通（家長 11-19：碼頭只能蓋在 HEX-051；11-20 23:01：火車站只能蓋在 HEX-047）
  pier:T('碼頭','trans',{cost:C(5,3),req:{2:[['market',2]],3:[['hall',3]]},stage:2,only:'HEX-051'}),
  train:T('火車站','trans',{cost:C(5,3),req:{1:[['pier',1]],2:[['market',2]],3:[['hall',3]]},stage:2,only:'HEX-047'}),
  airport:T('機場','trans',{size:2,req:[['train',2],['pier',2]],soon:1}),
};
export const MAXLV=Object.fromEntries(Object.entries(TYPES).map(([k,v])=>[k,v.maxLv]));
/* 一開始的位置：市政廳、市長的家；測試模式另外把 7 棟第一階段擺在預設位置（11-25：發電、污水、垃圾搬到新格子） */
export const HOME_PLOT={hall:'HEX-026',mayor:'HEX-027',school:'HEX-017'};
export const TEST_LAYOUT={aquarium:'HEX-040',hall:'HEX-026',school:'HEX-017',mayor:'HEX-027',power:'HEX-041',water:'HEX-001',sewage:'HEX-052',trash:'HEX-053',home:'HEX-024',garden:'HEX-002',ranch:'HEX-003',library:'HEX-018',hospital:'HEX-028',market:'HEX-023',clinic:'HEX-016-A',conv:'HEX-016-B',park:'HEX-037-A',breakfast:'HEX-035-A',bakery:'HEX-035-B'};

/* ---------- 規則：能不能蓋在這塊地、能不能升級 ---------- */
export const nameOfT=t=>TYPES[t]?TYPES[t].name:t;
export function occupied(B){ const o={}; for(const pid in B){ o[pid]=pid; for(const x of B[pid].occ||[]) o[x]=pid; } return o; }
export const instances=(B,t)=>Object.keys(B).filter(p=>B[p].t===t);
export const bestLv=(B,t)=>instances(B,t).reduce((a,p)=>Math.max(a,B[p].lv),0);
export const shownName=(B,pid)=>B[pid].name||nameOfT(B[pid].t);
/* 回傳 {why:'不能蓋的原因'} 或 {occ:[還要佔用的地]}；test＝測試模式（不管前置、上限、開放） */
/* ---------- 條件（每一級各自的條件；11-19 15:19） ---------- */
export const FOOD_SHOPS=Object.keys(TYPES).filter(t=>TYPES[t].zone==='food'&&t!=='nightmarket');
/* 這一級要先完成的條件清單：Lv1 加上「第二階段要市政廳 Lv3」；升級加上「不超過市政廳」 */
export function reqList(t,lv){ const ty=TYPES[t], r=ty.req, out=[];
  if(lv===1&&(ty.stage===2||ty.hallLv)) out.push(['hall',ty.hallLv||3]);   // 11-28：有 hallLv 的（恐龍博物館、天文台、運動中心、海生館）都要市政廳 Lv4   // hallLv：家長 11-27 15:27 海生館、運動中心要市政廳 Lv4
  const list=Array.isArray(r)?(lv===1?r:[]):(r[lv]||[]); out.push(...list);
  if(lv>=2&&ty.cap) out.push([ty.cap,lv]);
  const seen=new Set(); return out.filter(x=>{ const k=JSON.stringify(x); if(seen.has(k)) return false; seen.add(k); return true; }); }
/* 一個條件的狀態：ok 有沒有做到、have 現在幾級（或幾家）、need 要幾級（或幾家） */
export function reqState(B,it){
  if(it[0]==='any') return {kind:'any',ts:it[1],ok:it[1].some(x=>bestLv(B,x)>=1)};
  if(it[0]==='food'){ const have=FOOD_SHOPS.filter(x=>instances(B,x).length).length; return {kind:'food',need:it[1],have,ok:have>=it[1]}; }
  const have=bestLv(B,it[0]); return {kind:'one',t:it[0],need:it[1],have,ok:have>=it[1]}; }
export function reqText(st){
  if(st.kind==='any') return '要先蓋好'+st.ts.map(nameOfT).join('或');
  if(st.kind==='food') return '要先蓋好 '+st.need+' 家美食店';
  return st.need>1?`要先把${nameOfT(st.t)}升到 Lv${st.need}`:`要先蓋好${nameOfT(st.t)}`; }
export const unmet=(B,t,lv)=>reqList(t,lv).map(it=>reqState(B,it)).filter(s=>!s.ok);
/* 廟：同一格另一半 */
export const otherHalf=pid=>{ const p=PLOTS[pid]; return p&&p.half?p.tile+'-'+(p.side<0?'B':'A'):null; };
/* 這塊地是不是某種建築的專用地、這種建築有沒有指定的格子 */
function onlyWhy(t,p){ const ty=TYPES[t], ol=TILE_ONLY[p.tile];
  if(ol&&!ol.includes(t)) return '這一格只能蓋'+ol.map(nameOfT).join('和');
  if(ty.only&&p.tile!==ty.only) return ty.name+'要蓋在專用的那一格喔';
  return ''; }
/* 回傳 {why:'不能蓋的原因'} 或 {occ:[還要佔用的地]}；need:1＝是條件還沒做到（點了會跳提醒）；test＝測試模式（不管前置、上限、開放） */
export function canPlace(B,t,pid,test=false){
  const ty=TYPES[t], p=PLOTS[pid], occ=occupied(B);
  if(!ty||!p) return {why:'這裡不能蓋'};
  if(ty.previewOnly) return {why:'目前只提供獨立測試'};
  if(occ[pid]) return {why:'這塊地已經有建築了'};
  if(!test){   /* 測試模式（家長 11-19 17:37）：不管分區、前置、上限、開放與否，全部可以自由蓋 */
    if(p.zone==='none') return {why:'這塊地還沒決定要蓋什麼喔'};
    if(ty.zone!==p.zone) return {why:'要蓋在'+ZONES[ty.zone].name};
    const ow=onlyWhy(t,p); if(ow) return {why:ow};
    if(ty.soon||ty.draft) return {why:'還在設計，之後開放'};   // draft：已經畫好草稿、家長還沒確認，只有測試模式看得到
    if(ty.fixed) return {why:'一開始就蓋好了'};
    if(ty.s1&&!OPEN_S1) return {why:'快要開放了'};
    const n=instances(B,t).length; if(n>=ty.max) return {why:ty.max>1?`已經蓋了 ${n} 間，最多 ${ty.max} 間`:'已經蓋好了'};
    const u=unmet(B,t,1); if(u.length) return {why:reqText(u[0]),need:1};
  }
  // 占地：半格直接蓋；整格蓋在被切開的格子要兩個半格都空；佔 2 格要旁邊同一區還有一格空地（有固定配對就只能用那一格）
  if(ty.size==='half'&&!p.half&&!test) return {why:'這種店要蓋在半格'};
  if(ty.size==='full'&&p.half){ const other=otherHalf(pid); if(occ[other]) return {why:'這一格的另一半已經有建築了'}; return {occ:[other]}; }
  if(ty.size===2){ if(t==='dino'&&p.half) return {why:'需要兩塊相鄰的完整土地'}; const pr=PAIR[p.tile];
    if(pr){ if(occ[pr]) return {why:'旁邊那一格已經有建築了'}; return {occ:[pr]}; }
    const nb=neighbors(p.tile).sort((m,n)=>(TILE[m].c===p.c)-(TILE[n].c===p.c)).find(n=>(test||TILE[n].zone===p.zone)&&!occ[n]&&(t!=='dino'||!onlyWhy(t,PLOTS[n]||{tile:n}))&&!SPLIT.has(TILE[n].zone)&&TILE[n].zone!=='none'&&!PAIR[n]); if(!nb) return {why:'旁邊要再有一塊同一區的空地'}; return {occ:[nb]}; }
  return {occ:[]};
}
/* 不能升級的原因（空字串＝可以升）；廟 Lv1→2 要同一格另一半空著 */
export function whyNoUp(B,pid){
  const r=B[pid], ty=TYPES[r.t];
  if(r.lv>=ty.maxLv) return '已經升到最高級了';
  if(ty.grow&&r.lv===1){ const o=otherHalf(pid), occ=occupied(B); if(o&&occ[o]&&occ[o]!==pid) return '旁邊的半格有建築了，廟沒辦法長大'; }
  const u=unmet(B,r.t,r.lv+1); if(u.length) return reqText(u[0]);
  return '';
}

/* ---------- 存檔（版本 3：S.b 記每塊地的建築；版本 2 只記 lv，讀進來時自動搬到新地圖） ---------- */
const KEY='winston-city-v2';
const fresh=()=>({ver:3,explore:{},stars:0,slog:[],pass:'1234',city:'Winston City',zy:true,b:{'HEX-026':{t:'hall',lv:1},'HEX-027':{t:'mayor',lv:1}}});
export const S=fresh();
const int=(v,a,b)=>{ v=Math.floor(+v); return Number.isFinite(v)?Math.min(b,Math.max(a,v)):a; };
const cleanName=v=>{ v=String(v||'').trim().slice(0,8); return v||undefined; };
/* 地圖改分區後（11-25），舊存檔裡蓋在「已經不是這一區」的建築：幫它找一塊同一區的空地搬過去（不會不見） */
function findHome(b,t){ const ty=TYPES[t];
  const cand=Object.keys(PLOTS).filter(pid=>{ const p=PLOTS[pid]; return p.zone===ty.zone&&!onlyWhy(t,p); });
  if(ty.only) cand.sort((a,c)=>(PLOTS[c].tile===ty.only)-(PLOTS[a].tile===ty.only));
  for(const pid of cand){ if(ty.size==='half'&&!PLOTS[pid].half) continue; const r=canPlace(b,t,pid,true); if(!r.why) return {pid,occ:r.occ||[]}; }
  return null; }
/* 舊存檔的污水、垃圾：從 042、043 搬到南邊的新格子；11-25 16:46 那一版蓋在 052／053／054 的也搬到現在的位置（照建築種類找） */
const MOVED={'HEX-042':{sewage:'HEX-052'},'HEX-043':{trash:'HEX-053'},'HEX-052':{power:'HEX-041',sewage:'HEX-052'},'HEX-053':{sewage:'HEX-052',trash:'HEX-053'},'HEX-054':{trash:'HEX-053'}};
/* 把任何版本的存檔整理成合法的版本 3（舊存檔：市政廳、市長的家、學校搬到新地圖的位置） */
function normalize(j){
  const out={ver:3,explore:cleanExplore(j.explore),stars:int(j.stars,0,99999),pass:/^\d{4}$/.test(j.pass)?j.pass:'1234',city:String(j.city||'Winston City').trim().slice(0,16)||'Winston City',zy:j.zy!==false,
    slog:(Array.isArray(j.slog)?j.slog:[]).slice(-500).map(e=>({d:String(e.d||'').slice(0,10),t:e.t?String(e.t).slice(0,10):undefined,why:String(e.why||'').slice(0,40),n:int(e.n,-99,99)})),b:{}};
  const homeless=[];
  if(j.b&&typeof j.b==='object'){
    for(let pid in j.b){ const r=j.b[pid]; if(!r||!TYPES[r.t]||TYPES[r.t].soon) continue;
      if(MOVED[pid]&&MOVED[pid][r.t]) pid=MOVED[pid][r.t];
      const rec={t:r.t,lv:int(r.lv,1,TYPES[r.t].maxLv)}; const nm=cleanName(r.name); if(nm) rec.name=nm;
      const p=PLOTS[pid];
      if(!p||p.zone!==TYPES[r.t].zone||onlyWhy(r.t,p)){ homeless.push(rec); continue; }
      if(Array.isArray(r.occ)) rec.occ=r.occ.filter(x=>PLOTS[x]||TILE[x]).slice(0,2);
      if(TYPES[r.t].size===2&&PAIR[p.tile]) rec.occ=[PAIR[p.tile]];
      out.b[pid]=rec; }
  } else if(j.lv&&typeof j.lv==='object'){                         // 版本 2 → 3
    const hl=int(j.lv.hall,1,5); out.b[HOME_PLOT.hall]={t:'hall',lv:hl}; out.b[HOME_PLOT.mayor]={t:'mayor',lv:Math.min(hl,int(j.lv.mayor,1,5))};
    const sl=hl<2?0:Math.min(hl,int(j.lv.school,0,3)); if(sl) out.b[HOME_PLOT.school]={t:'school',lv:sl};
  }
  for(const rec of homeless){ const h=findHome(out.b,rec.t); if(!h) continue; out.b[h.pid]=rec; if(h.occ.length) rec.occ=h.occ; }   // 碼頭、火車站、搬了分區的建築，自動搬到對的地
  if(!instances(out.b,'hall').length) out.b[HOME_PLOT.hall]={t:'hall',lv:1};
  if(!instances(out.b,'mayor').length) out.b[HOME_PLOT.mayor]={t:'mayor',lv:1};
  return out;
}
try{ const j=JSON.parse(localStorage.getItem(KEY)||'null'); if(j&&typeof j==='object') Object.assign(S,normalize(j)); }catch(e){}
export function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
export function reset(){ for(const k of Object.keys(S)) delete S[k]; Object.assign(S,fresh()); save(); }
save();   // 舊存檔讀進來後馬上存成新版本

/* ---------- 家長功能用的資料和工具 ---------- */
export const DAILY_MAX=5;            // 每天最多發幾顆，超過會提醒家長
export const REASONS=[['好好吃飯',1],['好好睡覺',1],['照顧妹妹',1],['整理房間',1],['考試獎勵',0],['唸書獎勵',0]];   // [理由, 預設顆數；0＝每次自己選]
const pad=n=>String(n).padStart(2,'0');
export const todayKey=()=>{ const d=new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); };
export function givenToday(){ const t=todayKey(), md=t.slice(5).replace('-','/'); return S.slog.filter(e=>e.t?e.t===t:e.d===md).reduce((a,e)=>a+e.n,0); }
/* 匯出／匯入存檔：一串文字，貼到 LINE Keep 記事本就能搬到另一台（舊的 WC1 文字也讀得懂） */
export function exportSave(){ return 'WC1:'+btoa(unescape(encodeURIComponent(JSON.stringify({ver:3,explore:S.explore,stars:S.stars,pass:S.pass,city:S.city,zy:S.zy,b:S.b,slog:S.slog})))); }
export function parseSave(text){
  try{
    text=String(text||'').trim();
    if(!text.startsWith('WC1:')) return {err:'這不是存檔文字，要以 WC1: 開頭'};
    const raw=JSON.parse(decodeURIComponent(escape(atob(text.slice(4).replace(/\s+/g,''))))); if(!raw||typeof raw!=='object'||Array.isArray(raw)||(!raw.b&&!raw.lv)||!Number.isFinite(raw.stars))return {err:'存檔格式不完整'}; return {data:normalize(raw)};
  }catch(e){ return {err:'讀不懂這串文字，請確認有完整複製'}; }
}
export function applySave(d){ for(const k of Object.keys(S)) delete S[k]; Object.assign(S,normalize(d)); save(); }
