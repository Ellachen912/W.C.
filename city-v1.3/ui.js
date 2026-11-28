import {EXPLORE,complete} from './explore.js';
/* Winston City 介面：點空地選建築、建造選單、建築卡片（加注音、可以改名）、木星頁、家長功能、升級慶祝、測試模式選單。
   3D 場景的東西（鏡頭、畫建築、拍照）由 index.html 透過 initUI 傳進來。 */
import { S, save, STAGES, TYPES, ZONES, PLOTS, REASONS, DAILY_MAX, todayKey, givenToday, exportSave, parseSave, applySave,
  canPlace, whyNoUp, occupied, instances, bestLv, shownName, nameOfT, reqList, reqState, unmet, otherHalf, FOOD_SHOPS } from './data.js';
import { TEXT } from './texts.js';
import { ZY } from './zy.js';

/* 建造選單的分類（同一類可能在好幾區） */
const MENU=[['市政中心',['hall','mayor']],['教育',['school','library']],['住宅',['home']],['基礎建設',['power','water','sewage','trash']],
  ['農業畜牧',['garden','ranch','orchard','tea','agri']],['美食',['breakfast','bakery','icecream','burger','japanese','donut','boba','cafe','nightmarket']],
  ['商業與生活',['market','street','bank']],['醫療與安全',['hospital','firedept','police']],['其他區',['clinic','conv','park','firestation','policebox','temple','stationery','bookstore']],
  ['文化',['art','music','aquarium','gym','dino']],['自然科學',['botanic','playground','zoo','observatory']],['交通',['pier','train','airport']]];
/* 家長 11-20 23:33～23:36：商業區不蓋百貨公司、觀光飯店；商店街改叫老街；書店搬到其他區；運動併進文化；「自然、科學與遊樂」改叫「自然科學」 */

export function initUI({ L, camera, BUILDINGS, TOPH, renderCity, flyTo, snap, bounce, plotPos, setHi, curB, TM }){
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const reduceM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* 注音：國字右邊直排注音（S.zy 開關，預設開）；只有寫在 texts.js、data.js 裡的文字有注音 */
  function ruby(text){
    const z=S.zy&&ZY[text]; if(!z) return esc(text);
    const zs=z.split(' '); let out='';
    [...text].forEach((ch,i)=>{ const y=zs[i]; if(!y){ out+=esc(ch); return; }
      const light=y.includes('˙'), b=y.replace('˙',''), tone='ˊˇˋ'.includes(b.slice(-1))?b.slice(-1):'', body=tone?b.slice(0,-1):b;
      out+=`<span class="c"><span class="h">${ch}</span><span class="z">${light?'<b class="l">˙</b>':''}${[...body].map((s,k,A)=>`<i>${s}${tone&&k===A.length-1?`<b class="t">${tone}</b>`:''}</i>`).join('')}</span></span>`; });
    return `<span class="zy">${out}</span>`;
  }
  /* 家長 11-14：按鈕、原因、慶祝畫面也加注音。一般文字：國字一段一段用 ZY 裡最長的詞去配，配不到就照原樣 */
  const ZK=Object.keys(ZY).filter(k=>/^[一-鿿]+$/.test(k)&&k.length<=12);
  const ZS=new Set(ZK);
  function zt(text){
    text=String(text); if(!S.zy) return esc(text);
    return text.split(/([一-鿿]+)/).map((seg,i)=>{ if(!(i%2)) return esc(seg); let out='',j=0;
      while(j<seg.length){ let k=Math.min(12,seg.length-j); while(k>1&&!ZS.has(seg.substr(j,k))) k--; out+=ruby(seg.substr(j,k)); j+=k; }
      return out; }).join('');
  }
  /* 家長 11-14：iPad 等大螢幕上，卡片和「蓋好了」畫面放大（手機不變） */
  const uiZ=(h=560)=>{ const z=Math.min(1.7,innerWidth*.8/380,innerHeight/h); return z<1.15?1:z; };
  function fitSheet(){ let z=uiZ(); const big=sheet.classList.contains('tall')||sheet.classList.contains('pw'), room=big?innerHeight-200:innerHeight*.62-90;
    if(big&&z>1){ sheet.style.maxHeight='none'; const need=sheet.scrollHeight; if(need*z>room) z=Math.max(1,room/need); }   /* 內容多的頁（設定、密碼、發木星）放大倍數自動縮一點，整頁放得下不用滑 */
    sheet.style.transform=z>1?`translateX(-50%) scale(${z})`:''; sheet.style.transformOrigin=z>1?'50% 100%':''; sheet.style.maxHeight=z>1?Math.round(room/z)+'px':''; }   /* tall：設定頁內容多，iPad 上整個放得下（家長 11-25 22:56） */
  addEventListener('resize',()=>{ fitSheet(); const b=document.querySelector('.lvbox'); if(b) fitBox(b); });
  function fitBox(b){ b.style.transform=''; const z=Math.min(uiZ(b.offsetHeight/.9),innerHeight*.94/b.offsetHeight); b.parentNode.style.transform=z>1.15?`scale(${z})`:''; }
  const nameHtml=(B,pid)=>B[pid].name?esc(B[pid].name):ruby(nameOfT(B[pid].t));
  const textOf=(t,k,lv)=>{ const T=TEXT[t]; if(!T) return ''; if(k==='intro') return T.intro; const a=T[k]; return a?(a[Math.min(lv,a.length)-1]||''):''; };

  /* ---- 木星圖示（代替星星）：小圓盤畫上木星的橫條紋和大紅斑 ---- */
  const jc=document.createElement('canvas'); jc.width=jc.height=96;
  { const g=jc.getContext('2d'), R=44; g.translate(48,48); g.save(); g.beginPath(); g.arc(0,0,R,0,7); g.clip();
    const bands=['#f1dcc0','#d8a064','#f4e6cf','#c98a55','#ecc79c','#b87a4a','#f0d9b8','#cf9560'];
    bands.forEach((c,i)=>{ g.fillStyle=c; g.fillRect(-R,-R+i*(2*R/bands.length),2*R,2*R/bands.length+1); });
    g.fillStyle='#c4573a'; g.beginPath(); g.ellipse(12,12,13,7,0,0,7); g.fill();
    const sh=g.createRadialGradient(-16,-18,6,0,0,R); sh.addColorStop(0,'rgba(255,255,255,.35)'); sh.addColorStop(.6,'rgba(255,255,255,0)'); sh.addColorStop(1,'rgba(60,30,10,.35)'); g.fillStyle=sh; g.fillRect(-R,-R,2*R,2*R);
    g.restore(); g.lineWidth=3; g.strokeStyle='#a9743f'; g.beginPath(); g.arc(0,0,R,0,7); g.stroke(); }
  const JURL=jc.toDataURL('image/png'), J=`<img class="jx" alt="" src="${JURL}">`;
  $('jTop').src=JURL;

  const sheet=$('sheet'); let toastT;
  function toast(t){ const e=$('toast'); e.innerHTML=zt(t); e.style.display='block'; clearTimeout(toastT); toastT=setTimeout(()=>e.style.display='none',3000); }
  function refreshTop(){ $('stage').innerHTML=zt(STAGES[bestLv(S.b,'hall')]||STAGES[1]); $('cityN').textContent=S.city; $('starN').textContent=S.stars; }
  { const g=$('flagc').getContext('2d'); g.drawImage(L.cityFlagTex.image,0,0,110,68); }
  function closeSheet(){ sheet.classList.remove('on'); sheet.innerHTML=''; shiftView(); }
  function shiftView(){ // 卡片打開時：把建築放在「標題列」和「卡片」中間，空間不夠就縮小一點
    const W=innerWidth,H=innerHeight;
    if(sheet.classList.contains('on')){ const top=sheet.getBoundingClientRect().top, hd=document.querySelector('.top').getBoundingClientRect().bottom+8, avail=Math.max(120,top-hd);
      camera.zoom=Math.max(.5,Math.min(1,avail/(H*.45))); camera.setViewOffset(W,H,0,H/2-(hd+top)/2,W,H); }
    else { camera.zoom=1; camera.clearViewOffset(); }
    camera.updateProjectionMatrix();
  }
  function openSheet(html,back){ sheet.classList.remove('pw','tall'); sheet.innerHTML=`<button class="x" aria-label="關閉" type="button">✕</button>`+(back?`<button class="back" type="button">‹ 返回</button>`:'')+html; sheet.classList.add('on'); fitSheet(); sheet.querySelector('.x').onclick=()=>{ closeSheet(); setHi([]); }; if(back) sheet.querySelector('.back').onclick=back; sheet.scrollTop=0; shiftView(); }

  /* ---- 聲音和慶祝（尊重「減少動態」設定） ---- */
  let actx;
  function tone(f,at,dur,type='triangle',gain=.18){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const o=actx.createOscillator(), g=actx.createGain(), t=actx.currentTime+at; o.type=type; o.frequency.value=f; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(gain,t+.02); g.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+dur+.05); }catch(e){} }
  const chime=()=>[523,659,784,1047].forEach((f,i)=>tone(f,i*.11,.45));
  function confetti(n=48){
    if(reduceM) return;
    const box=document.createElement('div'), cs=['#ffc83d','#ff8fa3','#7cc8f0','#8fd06a','#c77dff','#ff9f43']; box.className='confetti';
    for(let i=0;i<n;i++){ const p=document.createElement('i'); p.style.cssText=`left:${Math.random()*100}%;background:${cs[i%6]};animation-delay:${Math.random()*.5}s;animation-duration:${1.6+Math.random()*1.4}s`; box.appendChild(p); }
    for(let i=0;i<10;i++){ const p=document.createElement('img'); p.src=JURL; p.className='jfall'; p.style.cssText=`left:${Math.random()*100}%;animation-delay:${Math.random()*.7}s;animation-duration:${2+Math.random()*1.2}s`; box.appendChild(p); }
    document.body.appendChild(box); setTimeout(()=>box.remove(),4200);
  }
  /* 點建築：小聲音＋冒出幾顆小木星 */
  function tapFx(t,x,y){
    if(t==='mayor'){ tone(330,0,.5,'sine',.22); tone(392,.14,.5,'sine',.2); tone(494,.28,.5,'sine',.2); tone(659,.42,.8,'sine',.18); }
    else if(t==='school'){ tone(880,0,1.1,'sine',.22); tone(880,.34,1.1,'sine',.18); tone(1320,0,.5,'sine',.06); }
    // 其他建築的聲音在 life.js（每種建築不一樣）
    if(reduceM) return;
    for(let i=0;i<6;i++){ const e=document.createElement('img'); e.src=JURL; e.className='spark'; e.style.left=x+'px'; e.style.top=y+'px'; document.body.appendChild(e);
      const a=-Math.PI/2+(i-2.5)*.5, d=50+Math.random()*30; e.animate([{transform:'translate(-50%,-50%) scale(.5)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(1.1)`,opacity:0}],{duration:800,easing:'ease-out'}).onfinish=()=>e.remove(); }
  }
  /* 蓋好／升級瞬間：全螢幕大字、前後對照、彩帶 */
  function levelUp(pid,lv,before,after,done){
    const r=S.b[pid], stage=r.t==='hall'?STAGES[lv]:'';
    chime(); setTimeout(()=>chime(),420); confetti(70);
    const o=document.createElement('div'); o.className='lvup';
    o.innerHTML=`<div class="lvsc" style="width:min(380px,100%)"><div class="lvbox"><div class="lvt">${S.b[pid].name?esc(S.b[pid].name):zt(nameOfT(r.t))}${zt(lv>1?' 升到 Lv'+lv:' 蓋好了')}！</div>${stage?`<div class="lvc">${zt('城市變成「'+stage+'」')}</div>`:''}<div class="ba"><figure><img alt="" src="${before}"><figcaption>${zt(lv>1?'升級前':'空地')}</figcaption></figure><span aria-hidden="true">➜</span><figure><img alt="" src="${after}"><figcaption>Lv${lv}</figcaption></figure></div><div class="lvd">${ruby(textOf(r.t,'lv',lv))}</div><button class="go" type="button">${zt('太棒了')}</button></div></div>`;
    document.body.appendChild(o); fitBox(o.querySelector('.lvbox')); o.querySelector('button').onclick=()=>{ o.remove(); done(); };
  }
  const kOf=(t,lv)=>Math.max(1,TOPH(t,lv)/3.2);
  /* 真的升級：扣木星、存檔、重畫城市、慶祝 */
  function doUp(pid,back){
    const r=S.b[pid], ty=TYPES[r.t], nl=r.lv+1, c=ty.cost[nl];
    if(whyNoUp(S.b,pid)||S.stars<c) return;
    const pos=plotPos(pid,r), k=kOf(r.t,nl);
    closeSheet(); flyTo(pos,r.t);
    const before=snap(pos,k);
    S.stars-=c; r.lv=nl; if(ty.grow&&nl===2){ const o=otherHalf(pid); if(o) r.occ=[o]; } save(); renderCity();   // 廟長大：佔滿整格
    const after=snap(pos,k);
    window.dispatchEvent(new CustomEvent('wc-cheer'));   /* 移交 11-26：蓋好、升級時，市長和 Avery 原地開心慶祝 */ levelUp(pid,nl,before,after,()=>{ bounce(pid); openCard(pid,back); });
  }
  /* 真的蓋：在這塊地放一棟 Lv1 */
  function doBuild(pid,t,sure){
    const ty=TYPES[t], c=ty.cost[1], ok=canPlace(S.b,t,pid); if(ok.why) return; if(S.stars<c){ needView(t,1); return; }
    { const o=otherHalf(pid), r0=o&&S.b[o]; if(!sure&&r0&&TYPES[r0.t].grow&&r0.lv===1&&r0.lv<TYPES[r0.t].maxLv){   /* 家長 11-18：Lv1 廟旁邊的半格要蓋東西，先問一下 */
      openSheet(`<h2>${zt('確定要蓋在這裡嗎？')}</h2><p>${zt('蓋在這裡，廟就不能升級了。')}</p><button class="go" id="sureY" type="button">${zt('確定要蓋')}</button><button class="go alt" id="sureN" type="button">${zt('不要，換一塊地')}</button>`);
      $('sureY').onclick=()=>doBuild(pid,t,true); $('sureN').onclick=()=>{ closeSheet(); setHi(eligible(t),true); pending=t; }; return; } }
    const rec={t,lv:1}; if(ok.occ.length) rec.occ=ok.occ;
    const pos=plotPos(pid,rec), k=kOf(t,1);
    closeSheet(); setHi([]); pending=null; flyTo(pos,t);
    const before=snap(pos,k);
    S.stars-=c; S.b[pid]=rec; save(); renderCity();
    const after=snap(pos,k);
    window.dispatchEvent(new CustomEvent('wc-cheer'));   /* 移交 11-26：蓋好、升級時，市長和 Avery 原地開心慶祝 */ levelUp(pid,1,before,after,()=>{ bounce(pid); openCard(pid); });
  }
  /* 建築卡片：介紹、這一級做什麼、小知識、升級按鈕；名字旁邊的小筆可以改名 */
  function openCard(pid,back){
    const B=S.b, r=B[pid]; if(!r) return; const ty=TYPES[r.t], lv=r.lv, max=ty.maxLv, next=lv<max?ty.cost[lv+1]:0;
    const w0=whyNoUp(B,pid), low=!w0&&S.stars<next, why=lv>=max?'':(w0||(low?'木星還不夠，還差 '+(next-S.stars)+' 顆':''));
    const fact=textOf(r.t,'fact',lv), now=textOf(r.t,'lv',lv);
    openSheet(`<h2>${nameHtml(B,pid)}　Lv${lv} <button class="pen" id="pen" type="button" aria-label="改名字">✎</button></h2><div class="sub">${zt(r.t==='hall'?STAGES[lv]:'第 '+lv+' 級')}${r.name?'・本來叫'+esc(nameOfT(r.t)):''}</div><div class="lvs" aria-hidden="true">${Array.from({length:max},(_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('')}</div>`
      
      +(lv>=max?`<button class="go" disabled type="button">${zt('已經升到最高級了')}</button>`:`<button class="go${why?' soft':''}" id="goBtn" type="button">${why?'':UPI}${zt('升到')} Lv${lv+1}　${J} ${next}</button><div class="why">${zt(why)}${why?'<br><small>'+zt('點按鈕看看要先做什麼')+'</small>':''}</div>`)   /* 家長 11-14：升級按鈕放在最上面，不用滑到最下面 */
      +`<p>${ruby(textOf(r.t,'intro'))}</p>`+(now?`<p class="now">${ruby(now)}</p>`:'')+(fact?`<div class="fact"><b>${ruby('城市小知識')}</b><br>${ruby(fact)}</div>`:'')+(EXPLORE[r.t]?`<button class="go alt" id="exploreBtn">${ruby('職業探索')}${S.explore?.[r.t]?' ✓':''}</button>`:'')+`<button class="go alt" id="exploreLog">${ruby('探索紀錄')}</button>`,back);
    if($('exploreBtn')) $('exploreBtn').onclick=()=>exploreView(r.t,()=>openCard(pid,back)); $('exploreLog').onclick=()=>exploreLog(()=>openCard(pid,back));
    const gb=$('goBtn'); if(gb) gb.onclick=()=>why?needView(r.t,lv+1,pid):doUp(pid,back);   /* 家長 11-18：條件沒達成點下去，跳提醒說要先做什麼 */
    $('pen').onclick=()=>renameView(pid,()=>openCard(pid,back));
  }
  function exploreView(t,back){const d=EXPLORE[t];if(!d)return;const answers=Math.random()<.5?[d.correct,d.wrong]:[d.wrong,d.correct];openSheet(`<h2>${ruby(d.role)}</h2><p>${ruby(d.fact)}</p><div class="fact">${ruby(d.question)}</div>${answers.map((a,i)=>`<button class="go alt" id="ex${i}">${ruby(a)}</button>`).join('')}<p id="exFeedback" aria-live="polite"></p>`,back);answers.forEach((a,i)=>{$('ex'+i).onclick=()=>{if(a!==d.correct){$('exFeedback').textContent='再想想看！';return;}complete(S,t);save();$('exFeedback').textContent='答對了！已記錄探索成果。';answers.forEach((_,j)=>$('ex'+j).disabled=true);};});}
  function exploreLog(back){const keys=Object.keys(EXPLORE).filter(t=>instances(S.b,t).length);openSheet(`<h2>${ruby('探索紀錄')}</h2><p>${keys.filter(t=>S.explore?.[t]).length} / ${keys.length}</p>${keys.map(t=>`<button class="go alt" data-ex="${t}">${S.explore?.[t]?'✓ ':''}${ruby(nameOfT(t))}</button>`).join('')}`,back);sheet.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>exploreView(b.dataset.ex,()=>exploreLog(back)));}
  /* 改名：孩子自己改，不用密碼；最多 8 個字、不能空白；可以改回原名 */
  function renameView(pid,back){
    const r=S.b[pid];
    openSheet(`<h2>幫 ${esc(nameOfT(r.t))} 取名字</h2><div class="sub">最多 8 個字</div><input id="nm" type="text" maxlength="8" value="${esc(r.name||nameOfT(r.t))}" placeholder="${esc(nameOfT(r.t))}"><div class="why" id="nmw"></div><button class="go" id="nmOk" type="button">好了</button>`+(r.name?`<button class="go alt" id="nmBack" type="button">改回「${esc(nameOfT(r.t))}」</button>`:''),back);
    const inp=$('nm'), ok=$('nmOk'); const chk=()=>{ ok.disabled=!inp.value.trim(); $('nmw').textContent=inp.value.trim()?'':'名字不能空白'; }; inp.oninput=chk; chk();
    ok.onclick=()=>{ const v=inp.value.trim().slice(0,8); if(!v) return; if(v===nameOfT(r.t)) delete r.name; else r.name=v; save(); renderCity(); back(); toast('改好名字了'); };
    if($('nmBack')) $('nmBack').onclick=()=>{ delete r.name; save(); renderCity(); back(); toast('改回原來的名字了'); };
  }
  /* 點空地：跳出這一區能蓋的建築；不能蓋的灰掉並寫原因 */
  let pending=null;
  function typeRow(t,pid){
    const ty=TYPES[t], ok=canPlace(S.b,t,pid), c=ty.cost[1];
    if(ok.why) return ok.need?`<button class="row dim go2" data-need="${t}" type="button">${thumb(t)}<b>${ruby(ty.name)}<br><small>${zt(ok.why)}</small></b><i aria-hidden="true">›</i></button>`:`<div class="row dim">${thumb(t)}<b>${ruby(ty.name)}<br><small>${zt(ok.why)}</small></b></div>`;
    const low=S.stars<c;
    return `<div class="row${t===pending?' pick':''}">${thumb(t)}<b>${ruby(ty.name)}<br><small>${zt(low?'木星還不夠，還差 '+(c-S.stars)+' 顆':ty.size==='half'?'半格的小店':'可以蓋在這裡')}</small></b><button data-t="${t}" type="button" class="${low?'soft':''}">${zt('蓋')} ${J} ${c}</button></div>`;
  }
  function openPlot(pid,pend){
    pending=pend||pending; const p=PLOTS[pid], types=Object.keys(TYPES).filter(t=>TYPES[t].zone===p.zone&&!TYPES[t].fixed&&!TYPES[t].previewOnly);
    types.sort((a,b)=>(a===pending?-1:0)-(b===pending?-1:0)||(canPlace(S.b,a,pid).why?1:0)-(canPlace(S.b,b,pid).why?1:0));
    const one=pend&&!canPlace(S.b,pend,pid).why;   /* 家長 11-14：從「建造」選好建築、點發亮的土地 → 只問這一棟 */
    openSheet(`<h2>${zt(one?'在這裡蓋'+TYPES[pend].name+'？':'空地')}</h2><div class="sub">${zt(ZONES[p.zone].name+(p.half?'・半格':'')+'・土地')} ${pid}</div>`+(one?typeRow(pend,pid):types.length?types.map(t=>typeRow(t,pid)).join(''):`<p class="sub">${zt('這一區沒有別的建築可以蓋')}</p>`));
    sheet.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>doBuild(pid,b.dataset.t));
    sheet.querySelectorAll('[data-need]').forEach(b=>b.onclick=()=>needView(b.dataset.need,1));
  }
  /* 建造：先選類型 → 看這一類的建築（蓋好的、可以蓋的、還不能蓋的和原因）→ 可以蓋的按「選地點」，能蓋的空地會亮起來 */
  const HAM='<i class="ham" aria-hidden="true"><svg viewBox="0 0 32 32"><g class="hm"><rect x="14.5" y="10" width="3.4" height="17" rx="1.6" fill="#b07a4a"/><rect x="7" y="4" width="18" height="8" rx="2" fill="#7b8191"/><rect x="7" y="4" width="5" height="8" rx="1.5" fill="#5f6573"/></g><g class="sp" fill="#f2c230"><circle cx="5" cy="27" r="1.6"/><circle cx="9" cy="29.5" r="1.2"/><circle cx="3" cy="23" r="1.1"/></g></svg></i>';   /* 家長 11-14：可以蓋、可以升級的都用敲敲打打的小錘子表示 */
  /* 家長 11-25 17:30：可以蓋＝小錘子；可以升級＝綠色往上的箭頭（會輕輕往上跳），一看就分得出來 */
  const UPI='<i class="ham upi" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#4caf50"/><g class="ua"><path d="M16 7 L25 17 H19.5 V25 H12.5 V17 H7 Z" fill="#fff"/></g></svg></i>';
  /* 家長 11-25 17:27：木星不夠的，不能顯示「可以蓋／可以升級」和小錘子 */
  const rich=(t,lv)=>S.stars>=(TYPES[t].cost[lv]||0);
  const canUp=pid=>!whyNoUp(S.b,pid)&&rich(S.b[pid].t,S.b[pid].lv+1);
  const canNow=t=>rich(t,1)&&eligible(t).length>0;
  function eligible(t){ const occ=occupied(S.b); return Object.keys(PLOTS).filter(pid=>!occ[pid]&&!canPlace(S.b,t,pid).why); }
  function menuCats(cats){
    if(!cats&&wideUI()){ menuTree(); return; }
    setHi([]); pending=null;
    /* 家長 11-19 15:15：iPhone 上維持先選分區；按鈕左邊加那一區地面顏色的小六角形，可以蓋、可以升級的分區排前面 */
    const info=MENU.map(([n,items],i)=>{ const built=items.reduce((a,t)=>a+instances(S.b,t).length,0), can=items.filter(canNow).length, ups=items.reduce((a,t)=>a+instances(S.b,t).filter(canUp).length,0), open=items.some(t=>!TYPES[t].soon);
      return {n,items,i,built,can,ups,open,rank:!open?3:can?0:ups?1:2}; });
    const hexDot=c=>`<svg class="zdot" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,1.5 21.5,6.8 21.5,17.2 12,22.5 2.5,17.2 2.5,6.8" fill="${c}" stroke="rgba(59,53,80,.35)" stroke-width="1.4"/></svg>`;
    openSheet(`<h2>${zt('建造')}</h2><div class="sub">${zt('先選一個類型，也可以直接點地上的空地')}</div><div class="grid">`+[...info].sort((a,b)=>a.rank-b.rank||a.i-b.i).map(({n,items,i,built,can,ups,open})=>{ const dot=hexDot(ZONES[TYPES[items[0]].zone].color);
      return open?`<button class="cat zc${can||ups?' can':''}" data-i="${i}" type="button">${can?HAM:ups?UPI:''}${dot}<b>${zt(n)}</b><small>${zt(can?can+' 種可以蓋':ups?ups+' 棟可以升級':built?'蓋了 '+built+' 棟':'看看要蓋什麼')}</small></button>`:`<button class="cat zc dim" data-i="${i}" type="button">${dot}<b>${zt(n)}</b><small>${zt('之後開放')}</small></button>`; }).join('')+`</div>`);
    sheet.querySelectorAll('.cat[data-i]').forEach(b=>b.onclick=()=>menuItems(+b.dataset.i));
  }
  /* ---- iPad 建造樹（家長 11-19 15:15～15:18）：寬螢幕才用；一欄是一步，從左往右；卡片是建築小圖＋注音名字。
     蓋好的→打開那一棟；可以蓋的→關掉、能蓋的空地亮起來（跟原本一樣）；還不能蓋的→把要先完成的卡片框起來，並跳出提醒 ---- */
  const wideUI=()=>innerWidth>=700&&innerHeight>=600;
  function treeCols(){ const T=Object.keys(TYPES).filter(t=>!TYPES[t].soon&&!TYPES[t].previewOnly), memo={};
    const reqTs=t=>reqList(t,1).flatMap(it=>it[0]==='any'?[it[1].reduce((a,b)=>dep(a)<=dep(b)?a:b)]:it[0]==='food'?['breakfast']:[it[0]]).filter(r=>r!==t&&TYPES[r]&&(TYPES[r].stage===2)===(TYPES[t].stage===2));
    function dep(t){ if(t in memo) return memo[t]; memo[t]=0; const rs=reqTs(t); return memo[t]=rs.length?1+Math.max(...rs.map(dep)):0; }
    const groups=[1,2].map(sg=>{ const ts=T.filter(t=>(TYPES[t].stage===2?2:1)===sg), cols=[]; for(const t of ts){ const d=dep(t); (cols[d]=cols[d]||[]).push(t); } return cols.filter(Boolean); });
    return groups; }
  function treeCard(t){ const ty=TYPES[t], ins=instances(S.b,t), lv=bestLv(S.b,t), el=eligible(t), up=ins.some(canUp), c=ty.cost[1];
    const st=lv?'done':el.length&&rich(t,1)?'can':'lock';
    const poor=!lv&&el.length&&!rich(t,1); const sub=st==='done'?`Lv${lv}`+(up?'・'+zt('可以升級'):''):st==='can'?zt('可以蓋'):zt(poor?'木星不夠':'還不能蓋');   /* 家長 11-20 23:15：可以蓋的後面不用標木星幾顆 */
    return `<button class="tc ${st}" data-tt="${t}" type="button">${st==='can'?HAM:st==='done'&&up?UPI:''}${st==='lock'?'<i class="lk" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#9d98ad"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="#9d98ad" stroke-width="2.4"/></svg></i>':''}${thumb(t,'tth')}<b>${ruby(ty.name)}</b><small>${sub}</small></button>`; }
  function menuTree(){
    setHi([]); pending=null; closeSheet(); document.querySelector('.tree')?.remove();
    const g=treeCols(), c1=(g[0]&&g[0][0])||[], cap=Math.max(3,c1.indexOf('trash')+1||c1.length);   /* 家長 11-20 23:18：一欄最多排到第一步「垃圾處理中心」那麼長，超過就分到旁邊一欄，不用往下滑很久 */
    const col=(ts,k)=>{ const ch=[]; for(let i=0;i<ts.length;i+=cap) ch.push(ts.slice(i,i+cap));
      return `<div class="tstep"><div class="tst">${zt('第 '+k+' 步')}</div><div class="tcols">${ch.map(c=>`<div class="tcol">${c.map(treeCard).join('')}</div>`).join('')}</div></div>`; };
    let k=0; const html=g[0].map(ts=>col(ts,++k)).join('')+`<div class="tgate"><span>${zt('市政廳 Lv3 開放')}</span></div>`+g[1].map(ts=>col(ts,++k)).join('');
    const o=document.createElement('div'); o.className='tree'; o.setAttribute('role','dialog');
    o.innerHTML=`<div class="thd"><h2>${zt('建造')}</h2><span class="sub">${zt('從左邊往右，一步一步蓋')}</span><button class="tz" type="button">${zt('用分區看')}</button><button class="x" aria-label="關閉" type="button">✕</button></div><div class="tsc">${html}</div>`;
    document.body.appendChild(o);
    const shut=()=>o.remove(); o.querySelector('.x').onclick=shut; o.querySelector('.tz').onclick=()=>{ shut(); menuCats(true); };
    const first=o.querySelector('.tc.can')||o.querySelector('.tc.lock'); if(first){ const sc=o.querySelector('.tsc'); sc.scrollLeft=Math.max(0,first.closest('.tstep').offsetLeft-40); }
    o.querySelectorAll('[data-tt]').forEach(b=>b.onclick=()=>{ const t=b.dataset.tt; o.querySelectorAll('.need').forEach(e=>e.classList.remove('need'));
      if(b.classList.contains('done')){ shut(); goNeed(t); return; }
      if(b.classList.contains('can')){ shut(); pickPlot(t); return; }
      for(const st of unmet(S.b,t,1)) for(const r of st.kind==='one'?[st.t]:st.kind==='any'?st.ts:FOOD_SHOPS){ const e=o.querySelector(`[data-tt="${r}"]`); if(e) e.classList.add('need'); }
      needView(t,1); }); }
  function menuItems(i){
    const [n,items]=MENU[i];
    const pic=t=>thumb(t);   /* 家長 11-13：選單放建築小圖，小朋友看圖選 */
    const row=t=>{ const ty=TYPES[t], ins=instances(S.b,t), el=eligible(t);
      if(ins.length) return ins.map(pid=>`<button class="row go2${canUp(pid)?' can':''}" data-p="${pid}" type="button"><b>${nameHtml(S.b,pid)}<br><small>Lv${S.b[pid].lv}／${ty.maxLv}${canUp(pid)?'・'+zt('可以升級'):''}</small></b>${canUp(pid)?UPI:''}${pic(t)}<i aria-hidden="true">›</i></button>`).join('')+(ins.length<ty.max&&el.length&&rich(t,1)?`<button class="row go2 can" data-t="${t}" type="button"><b>${zt('再蓋一間'+ty.name)}<br><small>${zt('還可以蓋 '+(ty.max-ins.length)+' 間')}</small></b>${pic(t)}<i aria-hidden="true">›</i></button>`:'');
      if(el.length&&!rich(t,1)) return `<button class="row dim go2" data-need="${t}" type="button"><b>${ruby(ty.name)}<br><small>${zt('木星不夠，要 '+ty.cost[1]+' 顆，現在有 '+S.stars+' 顆')}</small></b>${pic(t)}<i aria-hidden="true">›</i></button>`;
      if(el.length) return `<button class="row go2 can" data-t="${t}" type="button"><b>${ruby(ty.name)}<br><small>${zt('還沒蓋')}・${zt('點這裡選地點')}</small></b>${HAM}${pic(t)}<i aria-hidden="true">›</i></button>`;
      const u=ty.soon?[]:unmet(S.b,t,1);
      if(u.length) return `<button class="row dim go2" data-need="${t}" type="button"><b>${ruby(ty.name)}<br><small>${zt(reqTextUI(u[0]))}</small></b>${pic(t)}<i aria-hidden="true">›</i></button>`;   /* 點了跳提醒 */
      const any=Object.keys(PLOTS).find(pid=>PLOTS[pid].zone===ty.zone), why=any?canPlace(S.b,t,any).why:'';
      return `<div class="row dim"><b>${ruby(ty.name)}<br><small>${zt(ty.soon?'還在設計，之後開放':why==='這塊地已經有建築了'?'沒有空地了':why)}</small></b>${pic(t)}</div>`; };
    openSheet(`<h2>${zt(n)}</h2><div class="sub">${zt('點一棟看看')}</div>`+items.map(row).join(''),menuCats);
    sheet.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{ const pid=b.dataset.p; flyTo(plotPos(pid,S.b[pid]),S.b[pid].t); openCard(pid,()=>menuItems(i)); });
    sheet.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>pickPlot(b.dataset.t));
    sheet.querySelectorAll('[data-need]').forEach(b=>b.onclick=()=>needView(b.dataset.need,1));
  }
  function pickPlot(t){ const el=eligible(t); pending=t; closeSheet(); setHi(el,true);
    if(el.length===1){ flyTo(plotPos(el[0])); openPlot(el[0],t); } else { flyTo(null); toast('點一塊發亮的土地，'+TYPES[t].name+'就蓋在那裡'); } }
  /* ---- 條件還沒做到的提醒（家長 11-18 14:08、11-19 15:10）：要先完成什麼、現在幾級、「帶我去」；木星不夠也寫還差幾顆。文字全部有注音，iPad 上放大 ---- */
  function thumb(t,cls='th'){ return `<img class="${cls}" src="thumbs/${t}.png" alt="" loading="lazy" onerror="this.style.${cls==='ndbig'?'display=\'none\'':'visibility=\'hidden\''}">`; }
  const reqTextUI=st=>st.kind==='any'?'要先蓋好'+st.ts.map(nameOfT).join('或'):st.kind==='food'?'要先蓋好 '+st.need+' 家美食店':st.need>1?'要先把'+nameOfT(st.t)+'升到 Lv'+st.need:'要先蓋好'+nameOfT(st.t);
  function needView(t,lv,pid){
    const ty=TYPES[t], cost=ty.cost[lv]||0, sts=reqList(t,lv).map(it=>reqState(S.b,it)), rows=[];
    const status=(ok,txt)=>`<small class="${ok?'ok':'no'}">${ok?'✓ ':''}${zt(txt)}</small>`;
    const go=(k,v)=>`<button class="ndgo" type="button" data-${k}="${v}">GO</button>`;
    for(const st of sts){
      if(st.kind==='one'){ const nm=nameOfT(st.t); rows.push(`<div class="nd${st.ok?' ok':''}">${thumb(st.t,'ndth')}<b><span class="nw">${ruby(nm)}</span><br>${st.ok?status(1,'完成了'):st.have?status(0,'現在 Lv'+st.have+'，要 Lv'+st.need):status(0,st.need>1?'還沒蓋，要蓋好再升到 Lv'+st.need:'還沒蓋')}</b>${st.ok?'':go('go',st.t)}</div>`); }
      else if(st.kind==='any'){ rows.push(`<div class="ndor">${zt(st.ts.map(nameOfT).join('或')+'，蓋好一個就可以')}</div>`);
        for(const x of st.ts){ const h=bestLv(S.b,x); rows.push(`<div class="nd${h?' ok':''}">${thumb(x,'ndth')}<b>${ruby(nameOfT(x))}<br>${h?status(1,'完成了'):status(0,'還沒蓋')}</b>${h||st.ok?'':go('go',x)}</div>`); } }
      else rows.push(`<div class="nd${st.ok?' ok':''}">${thumb('breakfast','ndth')}<b>${ruby('美食店')}<br>${st.ok?status(1,'完成了'):status(0,'已經有 '+st.have+' 家，還要 '+(st.need-st.have)+' 家')}</b>${st.ok?'':go('food',1)}</div>`);
    }
    if(lv===2&&ty.grow&&pid){ const w=whyNoUp(S.b,pid); if(w.startsWith('旁邊')) rows.push(`<div class="nd"><b>${zt(w)}</b></div>`); }
    const low=S.stars<cost; rows.push(`<div class="nd${low?'':' ok'}"><img class="ndth jxbig" alt="" src="${JURL}"><b>${ruby('木星')}<br>${low?status(0,'要 '+cost+' 顆，現在有 '+S.stars+' 顆，還差 '+(cost-S.stars)+' 顆'):status(1,'夠了')}</b></div>`);
    const nm=pid&&S.b[pid]&&S.b[pid].name?esc(S.b[pid].name):ruby(ty.name);
    const o=document.createElement('div'); o.className='lvup';
    o.innerHTML=`<div class="lvsc" style="width:min(400px,100%)"><div class="lvbox ndbox"><div class="ndt">${lv===1?zt('還不能蓋')+nm:nm+zt('還不能升到')+' Lv'+lv}</div>${thumb(t,'ndbig')}<div class="ndsub">${zt('要先完成這些：')}</div>${rows.join('')}<button class="go" type="button" id="ndOk">${zt('知道了')}</button></div></div>`;
    document.body.appendChild(o); fitBox(o.querySelector('.lvbox')); tone(392,0,.25,'sine',.12); tone(330,.12,.3,'sine',.1);
    const shut=()=>o.remove(); o.querySelector('#ndOk').onclick=shut; o.onclick=e=>{ if(e.target===o) shut(); };
    o.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{ shut(); goNeed(b.dataset.go); });
    o.querySelectorAll('[data-food]').forEach(b=>b.onclick=()=>{ shut(); menuItems(MENU.findIndex(m=>m[0]==='美食')); });
  }
  /* 「帶我去」：蓋好了→飛過去打開那一棟（看升級）；還沒蓋、可以蓋→能蓋的空地亮起來；還不能蓋→再看它要先做什麼 */
  function goNeed(t){ const ins=instances(S.b,t);
    if(ins.length){ const pid=ins.reduce((a,p)=>S.b[p].lv>S.b[a].lv?p:a); closeSheet(); setHi([]); flyTo(plotPos(pid,S.b[pid]),t); openCard(pid); return; }
    if(eligible(t).length){ pickPlot(t); return; }
    if(unmet(S.b,t,1).length){ needView(t,1); return; }
    toast(TYPES[t].name+'現在沒有空地可以蓋'); }
  { const bb=$('bBuild'); bb.innerHTML=bb.querySelector('svg').outerHTML+zt('建造'); $('bHome').innerHTML=zt('看全城'); }   /* 家長 11-14：主畫面按鈕加注音 */
  $('bBuild').onclick=()=>menuCats();
  $('bHome').onclick=()=>{ closeSheet(); setHi([]); flyTo(null); };

  /* ---- 測試模式：點空地，選一種已經畫好的建築試蓋（不管前置、上限、木星） ---- */
  let testPlaceFn=null;
  function testPlace(pid){
    /* 測試模式（家長 11-19 17:37）：所有建築都列出來，不管分區和條件，點了直接放；這塊地本來的分區排最前面 */
    const p=PLOTS[pid], all=Object.keys(TYPES).filter(t=>!TYPES[t].previewOnly), mine=all.filter(t=>TYPES[t].zone===p.zone), rest=all.filter(t=>TYPES[t].zone!==p.zone);
    const row=t=>{ const ok=canPlace(TM.b,t,pid,true), ty=TYPES[t];
      return ok.why?`<div class="row dim"><b>${esc(ty.name)}<br><small>${esc(ok.why)}</small></b></div>`
                   :`<div class="row"><b>${esc(ty.name)}<br><small>${esc(ZONES[ty.zone].name+'・'+(ty.size==='half'?'半格':ty.size===2?'2 格':'整格')+'・最高 Lv'+ty.maxLv)}</small></b><button data-t="${t}" type="button">放這裡</button></div>`; };
    const zones=[...new Set(rest.map(t=>TYPES[t].zone))];
    openSheet(`<h2>測試：這塊空地</h2><div class="sub">${esc(ZONES[p.zone].name)}・土地 ${pid}・不扣木星、不存檔、可以亂蓋</div>`
      +mine.map(row).join('')
      +zones.map(z=>`<div class="sub" style="margin-top:10px">${esc(ZONES[z].name)}</div>`+rest.filter(t=>TYPES[t].zone===z).map(row).join('')).join(''));
    sheet.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ const t=b.dataset.t, ok=canPlace(TM.b,t,pid,true); closeSheet(); testPlaceFn(pid,t,ok.occ); });
  }

  /* ---- 木星頁：點木星直接進來；只有「發木星」要家長密碼 ---- */
  function openStars(){
    openSheet(`<h2>累計的木星</h2><div class="bign">${J} ${S.stars}</div>`
      +`<button class="go" id="pmGive" type="button">發木星（要家長密碼）</button>`
      +`<div class="grid"><button class="cat" id="pmExp" type="button">匯出存檔<small>下載或搬到另一台</small></button><button class="cat" id="pmImp" type="button">匯入存檔<small>從另一台搬來</small></button>`
      +`<button class="cat" id="pmCity" type="button">改城市名稱<small>${esc(S.city)}</small></button><button class="cat" id="pmPw" type="button">改密碼<small>要先輸入舊密碼</small></button></div>`
      +`<div class="row"><b>注音<br><small>卡片和小知識的字旁邊加注音</small></b><button id="pmZy" type="button" class="sw${S.zy?' on':''}" aria-pressed="${S.zy}">${S.zy?'開':'關'}</button></div>`
      +`<button class="go alt" id="pmLog" type="button">看發木星紀錄（也可以點左上角的市旗）</button>`);
    sheet.classList.add('tall'); fitSheet();
    $('pmGive').onclick=askPw; $('pmExp').onclick=exportView; $('pmImp').onclick=importView; $('pmPw').onclick=changePw; $('pmCity').onclick=cityView; $('pmLog').onclick=()=>openLog(openStars);
    $('pmZy').onclick=()=>{ S.zy=!S.zy; save(); openStars(); toast(S.zy?'注音打開了':'注音關掉了'); };
  }
  function openLog(back){
    openSheet(`<h2>發木星紀錄</h2><div class="sub">累計 ${S.stars} 顆</div>`+(S.slog.length?S.slog.slice().reverse().map(e=>`<div class="row"><b>${esc(e.why)}<br><small>${esc(e.t||e.d)}</small></b><span>${e.n<0?'−'+(-e.n):'＋'+e.n} ${J}</span></div>`).join(''):`<p class="sub">還沒有紀錄</p>`),back);
  }
  function cityView(){
    openSheet(`<h2>改城市名稱</h2><div class="sub">最多 16 個字</div><input id="cn" type="text" maxlength="16" value="${esc(S.city)}"><button class="go" id="cnOk" type="button">好了</button><button class="go alt" id="cnBack" type="button">改回 Winston City</button>`,openStars);
    const inp=$('cn'); inp.oninput=()=>{ $('cnOk').disabled=!inp.value.trim(); };
    $('cnOk').onclick=()=>{ const v=inp.value.trim().slice(0,16); if(!v) return; S.city=v; save(); refreshTop(); openStars(); toast('城市名稱改好了'); };
    $('cnBack').onclick=()=>{ S.city='Winston City'; save(); refreshTop(); openStars(); };
  }
  function padInput(title,sub,hint,done,back){
    let pw='';
    const draw=msg=>{
      openSheet(`<h2>${title}</h2><div class="sub">${sub}</div><div class="pwd" aria-label="已輸入 ${pw.length} 位">${[0,1,2,3].map(k=>`<i class="${k<pw.length?'on':''}"></i>`).join('')}</div><div class="why">${msg||''}</div><div class="pad">`+[1,2,3,4,5,6,7,8,9,'清除',0,'⌫'].map(k=>`<button data-k="${k}" type="button">${k}</button>`).join('')+`</div>`+(hint?`<div class="sub" style="text-align:center">${hint}</div>`:''),back);
      sheet.classList.add('pw'); fitSheet(); sheet.scrollTop=0;   /* 家長 11-20 12:43：發木星的密碼鍵盤字太大要往下滑 → 改小一點、整個放得下 */
      sheet.querySelectorAll('.pad button').forEach(b=>b.onclick=()=>{
        const k=b.dataset.k; if(k==='清除') pw=''; else if(k==='⌫') pw=pw.slice(0,-1); else if(pw.length<4) pw+=k;
        if(pw.length===4){ const r=done(pw); if(r){ pw=''; draw(r); } } else draw('');
      });
    };
    draw('');
  }
  const defHint=()=>S.pass==='1234'?'（預設密碼是 1234）':'';
  function askPw(){ padInput('家長密碼','發木星要先輸入 4 位數密碼',defHint(),pw=>{ if(pw===S.pass){ giveForm(); return; } return '密碼不對，再試一次'; },openStars); }
  function changePw(){
    padInput('改密碼','先輸入現在的密碼',defHint(),old=>{ if(old!==S.pass) return '密碼不對，再試一次';
      padInput('新密碼','請輸入新的 4 位數密碼','',a=>{ padInput('再輸入一次','確認新密碼','',b=>{ if(a!==b){ changePw(); toast('兩次不一樣，請重來'); return; } S.pass=a; save(); openStars(); toast('密碼改好了'); },openStars); },openStars); },openStars);
  }
  function exportView(){
    const code=exportSave();
    openSheet(`<h2>匯出存檔</h2><div class="sub">複製這串文字，貼到 LINE 的 Keep 記事本或傳給自己。到另一台按「匯入存檔」貼上。</div><textarea id="code" readonly>${code}</textarea><button class="go" id="cp" type="button">複製</button><button class="go" id="dlSave" type="button">下載備份檔</button><div class="why">備份含家長密碼，請妥善保管。</div>`,openStars);
    $('dlSave').onclick=()=>{const url=URL.createObjectURL(new Blob([code],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='WinstonCity-'+new Date().toISOString().slice(0,10)+'.wc1';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);};
    $('cp').onclick=()=>{ const ta=$('code'); const ok=()=>toast('已複製'); ta.select(); try{ navigator.clipboard.writeText(code).then(ok,()=>{ document.execCommand('copy'); ok(); }); }catch(e){ try{ document.execCommand('copy'); ok(); }catch(e2){ toast('請長按文字自己複製'); } } };
  }
  function importView(){
    openSheet(`<h2>匯入存檔</h2><div class="sub">選擇備份檔，或貼上從另一台複製的文字。</div><textarea id="code" placeholder="WC1:..."></textarea><input id="saveFile" type="file" accept=".wc1,.txt,text/plain"><div class="why" id="imsg"></div><button class="go" id="im" type="button">檢查</button>`,openStars);
    $('saveFile').onchange=async()=>{const f=$('saveFile').files[0];if(!f)return;try{if(f.size>2000000)throw Error('檔案太大');$('code').value=await f.text();$('imsg').textContent='已讀取，請按檢查';}catch(e){$('imsg').textContent='無法讀取備份檔';}};
    $('im').onclick=()=>{
      const r=parseSave($('code').value); if(r.err){ $('imsg').textContent=r.err; return; }
      const d=r.data, n=Object.keys(d.b).length;
      openSheet(`<h2>確定要覆蓋嗎？</h2><p>這份存檔：${esc(d.city)}，木星 ${d.stars} 顆，${n} 棟建築（市政廳 Lv${bestLv(d.b,'hall')}），${d.slog.length} 筆紀錄。</p><div class="why">這一台現在的進度會被蓋掉。請先下載備份。</div><button class="go" id="yes" type="button">確定覆蓋</button>`,importView);
      $('yes').onclick=()=>{ applySave(d); renderCity(); flyTo(null); closeSheet(); toast('匯入完成'); };
    };
  }
  function giveForm(){
    let n=1, why='', warned=false;
    const draw=()=>{
      warned=false;
      openSheet(`<h2>發木星</h2><div class="sub">要發幾顆？為什麼？今天已發 ${givenToday()} 顆</div><div class="amt"><button id="mi" type="button" aria-label="少一顆">－</button><b>${J} ${n}</b><button id="pl" type="button" aria-label="多一顆">＋</button></div><div class="chips">${[1,2,3,5,10].map(v=>`<button data-n="${v}" class="${v===n?'on':''}" type="button">${v}</button>`).join('')}</div><div class="sub" style="margin-top:10px">理由</div><div class="chips">${REASONS.map(([r])=>`<button data-r="${r}" class="${r===why?'on':''}" type="button">${r}</button>`).join('')}</div><input id="why" type="text" placeholder="或自己寫理由" value="${esc(REASONS.some(([r])=>r===why)?'':why)}" maxlength="20"><button class="go" id="ok" type="button" ${why.trim()?'':'disabled'}>發給 Winston　${J} ${n}</button><button class="go alt" id="fix" type="button">修正按錯（扣回多發的木星）</button><button class="cat" id="tmGo" type="button">測試模式<small>家長看每一棟、試蓋，不扣木星、不存檔</small></button>`,openStars);
      sheet.classList.add('tall'); fitSheet();   /* 家長 11-26 00:37：發木星一個畫面就能完成，不用往下滑 */
      $('mi').onclick=()=>{ n=Math.max(1,n-1); draw(); }; $('pl').onclick=()=>{ n=Math.min(50,n+1); draw(); };
      sheet.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{ n=+b.dataset.n; draw(); });
      sheet.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ why=b.dataset.r; const def=REASONS.find(([r])=>r===why)[1]; if(def) n=def; draw(); });
      $('why').oninput=e=>{ why=e.target.value; warned=false; $('ok').disabled=!why.trim(); sheet.querySelectorAll('[data-r]').forEach(x=>x.classList.remove('on')); };
      $('ok').onclick=()=>{
        const today=givenToday();
        if(!warned&&today+n>DAILY_MAX){ warned=true; $('ok').innerHTML=`今天已發 ${today} 顆，再發就超過 ${DAILY_MAX} 顆了。再按一次確定`; return; }
        logStar(why.trim(),n); toast('發了 '+n+' 顆木星'); openStars();
      };
      $('fix').onclick=fixForm;
      $('tmGo').onclick=()=>{ closeSheet(); const b=document.getElementById('tmB'); b.hidden=false; b.style.display=''; if(!TM.on) b.click(); };   /* 家長 11-13：測試模式收進要密碼的發木星畫面；進去後右上角才出現「離開測試」 */
    };
    draw();
  }
  function logStar(why,n){ const d=new Date(); S.slog.push({d:String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getDate()).padStart(2,'0'),t:todayKey(),why,n}); S.stars+=n; save(); refreshTop(); }
  /* 修正按錯：家長手滑多發了，把多的扣回來（紀錄會留一行「修正按錯 −n」） */
  function fixForm(){
    let n=1; const last=S.slog.slice().reverse().find(e=>e.n>0);
    const draw=()=>{ const max=Math.min(50,S.stars);
      openSheet(`<h2>修正按錯</h2><div class="sub">要扣回幾顆？${last?`上一筆：${esc(last.why)} ＋${last.n}`:''}</div>`+(max<1?`<p>現在沒有木星可以扣。</p>`:`<div class="amt"><button id="mi" type="button" aria-label="少一顆">－</button><b>${J} ${n}</b><button id="pl" type="button" aria-label="多一顆">＋</button></div><button class="go" id="ok" type="button">扣回 ${n} 顆</button>`),giveForm);
      if(max<1) return;
      sheet.classList.add('tall'); fitSheet();   /* 家長 11-26 00:37：發木星一個畫面就能完成，不用往下滑 */
      $('mi').onclick=()=>{ n=Math.max(1,n-1); draw(); }; $('pl').onclick=()=>{ n=Math.min(max,n+1); draw(); };
      $('ok').onclick=()=>{ logStar('修正按錯',-n); toast('扣回 '+n+' 顆'); openStars(); }; };
    draw();
  }
  $('bStars').onclick=openStars;
  $('flagc').parentElement.onclick=()=>openLog();

  return { needView, toast, ruby, refreshTop, tapFx, closeSheet, openCard, openPlot, testPlace, shiftView, pendingType:()=>pending, setTestPlace:f=>{ testPlaceFn=f; } };
}
