/* ============================================================
   chrome.js — 엑셀 위장 껍데기 (모든 게임 페이지 공용)
   - 상단 타이틀/리본/수식줄, 하단 시트탭/상태바 렌더
   - 사장님(ESC) 오버레이: 진짜 업무 스프레드시트로 위장
   - 테마 토글, 게임 마운트 인터페이스
   ============================================================ */
(function(){
  "use strict";

  /* ---------- Google Analytics 4 (유입 추적) ----------
     아래 GA_ID 를 본인 측정 ID(G-XXXXXXXXXX)로 교체하면 모든 페이지가
     자동 추적됩니다. 미설정이면 아무것도 로드하지 않습니다. */
  const GA_ID = "G-PTCZG9FSVN";
  if(GA_ID.indexOf("XXX") < 0){
    const s=document.createElement('script'); s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;
    document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  // 게임 페이지 목록 (시트 탭 = 게임 선택기, 각자 독립 URL = SEO)
  const GAMES = [
    {id:"perf",   file:"index.html",       tab:"실적",   name:"2048"},
    {id:"cost",   file:"minesweeper.html", tab:"비용",   name:"지뢰찾기"},
    {id:"sudoku", file:"sudoku.html",      tab:"재고",   name:"스도쿠"},
    {id:"summary",file:"typing.html",      tab:"요약",   name:"타자연습"},
    {id:"kpi",    file:"wordle.html",      tab:"KPI",    name:"워들"}
  ];

  const $ = (s,r)=> (r||document).querySelector(s);
  const el = (t,c,txt)=>{const e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e;};
  const comma = n => n.toLocaleString('en-US');
  window.DDANJIT = window.DDANJIT || {};
  window.DDANJIT.comma = comma;
  window.DDANJIT.bossActive = false;

  const currentId = document.body.getAttribute('data-game') || "perf";

  /* ---------- 테마 ---------- */
  const THEME_KEY = "ddanjit-theme";
  function applyTheme(t){
    if(t==="light"||t==="dark") document.documentElement.setAttribute('data-theme',t);
    else document.documentElement.removeAttribute('data-theme');
  }
  function initTheme(){
    let saved=null; try{ saved=localStorage.getItem(THEME_KEY);}catch(e){}
    if(saved) applyTheme(saved);
    return saved;
  }
  function toggleTheme(){
    const isDark = document.documentElement.getAttribute('data-theme')==="dark" ||
      (!document.documentElement.getAttribute('data-theme') &&
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDark ? "light" : "dark";
    applyTheme(next);
    try{ localStorage.setItem(THEME_KEY,next);}catch(e){}
    const btn=$('#themeBtn'); if(btn) btn.textContent = next==="dark" ? "☀ 라이트" : "🌙 다크";
  }
  initTheme();

  /* ---------- 상단 크롬 ---------- */
  function buildChrome(){
    const g = GAMES.find(x=>x.id===currentId) || GAMES[0];

    const title = el('div','titlebar');
    title.innerHTML =
      '<div class="doticon" aria-hidden="true">X</div>'+
      '<span class="fname">2분기_부서별_실적_보고서_최종_FINAL_v3.xlsx — Excel</span>'+
      '<span class="spacer"></span>'+
      '<button class="theme-btn" id="themeBtn" type="button" aria-label="색상 테마 전환">🌙 다크</button>'+
      '<span class="winbtns" aria-hidden="true">&#8211; &#9633; &#10005;</span>';

    const menu = el('nav','menubar');
    menu.setAttribute('aria-label','메뉴');
    ['파일','홈','삽입','페이지 레이아웃','수식','데이터','검토','보기','도움말']
      .forEach((m,i)=>{ const s=el('span',i===1?'active':'',m); menu.appendChild(s); });

    const tb = el('div','toolbar');
    tb.setAttribute('aria-hidden','true');
    tb.innerHTML =
      '<span class="tbtn b">B</span><span class="tbtn i">I</span><span class="tbtn u">U</span>'+
      '<span class="tsep"></span><span class="tbtn">&#9776;</span><span class="tbtn">&#8801;</span>'+
      '<span class="tbtn">&#9636;</span><span class="tsep"></span><span class="tbtn">%</span>'+
      '<span class="tbtn">.00</span><span class="tbtn">&#8721;</span><span class="tsep"></span>'+
      '<span class="tbtn">&#128269;</span><span class="tbtn">&#9660;</span>';

    const fb = el('div','formulabar');
    fb.innerHTML =
      '<div class="namebox num" id="namebox">D6</div>'+
      '<div class="fx" aria-hidden="true"><i>fx</i></div>'+
      '<div class="finput" id="finput">=SUMIFS(매출!$D:$D, 부서!$B:$B, "영업1팀")</div>';

    document.body.prepend(fb);
    document.body.prepend(tb);
    document.body.prepend(menu);
    document.body.prepend(title);

    const saved = (function(){try{return localStorage.getItem(THEME_KEY);}catch(e){return null;}})();
    const btn=$('#themeBtn');
    if(btn){
      const dark = saved==="dark" || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      btn.textContent = dark ? "☀ 라이트" : "🌙 다크";
      btn.addEventListener('click',toggleTheme);
    }
  }

  /* ---------- 하단 시트탭 + 상태바 ---------- */
  function buildStatus(){
    const bar = el('div','statusbar');
    const tabs = el('div','sheettabs'); tabs.setAttribute('role','tablist');
    GAMES.forEach(g=>{
      const a=el('a','tab'+(g.id===currentId?' active':''),g.tab);
      a.href=g.file; a.setAttribute('role','tab');
      a.title=g.name;
      if(g.id===currentId) a.setAttribute('aria-current','page');
      tabs.appendChild(a);
    });
    const plus=el('span','tab');plus.textContent='＋';plus.style.opacity='.6';tabs.appendChild(plus);

    const right = el('div','status-right');
    right.innerHTML =
      '<span id="st-mode">준비 완료</span>'+
      '<span class="num">합계: <span id="st-sum">0</span></span>'+
      '<span class="hint">사장님 오면 <kbd>ESC</kbd></span>';

    bar.appendChild(tabs); bar.appendChild(right);
    document.body.appendChild(bar);
  }
  window.DDANJIT.setStatus = (label, sum)=>{
    const m=$('#st-mode'); if(m&&label!=null) m.textContent=label;
    const s=$('#st-sum'); if(s&&sum!=null) s.textContent=comma(sum);
  };

  /* ---------- 사장님 오버레이 ---------- */
  function seedRand(r,c){ let x=Math.sin(r*928.3+c*47.7)*10000; return x-Math.floor(x); }
  function buildBoss(){
    const boss=el('div','boss'); boss.id='bossOverlay';
    boss.setAttribute('aria-hidden','true');
    const wrap=el('div','bwrap');
    const table=document.createElement('table');
    const depts=["영업1팀","영업2팀","영업3팀","마케팅팀","개발팀","디자인팀","인사팀","재무팀",
      "기획팀","물류팀","고객지원","해외사업","R&D","품질관리","합계"];
    const heads=["부서","4월","5월","6월","2분기합계","목표","달성률","전년대비","담당"];
    const cols=["A","B","C","D","E","F","G","H","I"];
    let h="<thead><tr><th class='rowh'></th>";
    cols.forEach(c=>h+="<th>"+c+"</th>"); h+="</tr></thead><tbody>";
    for(let r=1;r<=26;r++){
      h+="<tr><td class='rowh num'>"+r+"</td>";
      for(let ci=0;ci<cols.length;ci++){
        let cls="",txt="";
        if(r===1){cls="lbl";txt=heads[ci]||"";}
        else if(r>=2 && r<=16){
          const di=r-2;
          if(ci===0){cls="lbl";txt=depts[di]||"";}
          else if(ci>=1&&ci<=5){cls="rt num";txt=comma((800+Math.floor(seedRand(r,ci)*4200))*10);}
          else if(ci===6){cls="rt num";txt=(68+Math.floor(seedRand(r,ci)*60))+"%";}
          else if(ci===7){cls="rt num";txt=(Math.floor(seedRand(r,ci)*46)-15)+"%";}
          else if(ci===8){txt=["김","이","박","최","정","한","오","윤","장","임"][di%10]+["대리","과장","차장","사원"][di%4];}
        }
        const isSel = (r===7&&ci===4);
        h+="<td class='"+cls+(isSel?" sel":"")+"'>"+txt+"</td>";
      }
      h+="</tr>";
    }
    h+="</tbody>";
    table.innerHTML=h;
    wrap.appendChild(table);
    boss.appendChild(wrap);
    document.body.appendChild(boss);
  }
  function setBoss(on){
    const boss=$('#bossOverlay'); if(!boss)return;
    window.DDANJIT.bossActive=on;
    boss.classList.toggle('show',on);
    boss.setAttribute('aria-hidden', on?'false':'true');
    const fi=$('#finput'), nb=$('#namebox');
    if(fi) fi.textContent = on ? "=SUM(D2:D16)/COUNTA(B2:B16)" : '=SUMIFS(매출!$D:$D, 부서!$B:$B, "영업1팀")';
    if(nb) nb.textContent = on ? "E7" : "D6";
    window.DDANJIT.setStatus(on ? "계산 중…" : "준비 완료");
    if(on && window.DDANJIT._onBoss) window.DDANJIT._onBoss();
  }
  window.DDANJIT.onBoss = fn => { window.DDANJIT._onBoss = fn; };

  /* ---------- 토스트 ---------- */
  function toast(html, ms){
    const t=el('div','toast'); t.innerHTML=html; document.body.appendChild(t);
    setTimeout(()=>t.classList.add('hide'), ms||4600);
    setTimeout(()=>t.remove(), (ms||4600)+600);
  }
  window.DDANJIT.toast = toast;

  /* ---------- 전역 키: ESC = 사장님 ---------- */
  window.addEventListener('keydown', e=>{
    if(e.key==='Escape'){ setBoss(!window.DDANJIT.bossActive); e.preventDefault(); }
  });

  /* ---------- 부팅 ---------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    buildChrome();
    buildBoss();
    buildStatus();
    // 게임 초기화 (각 game-*.js가 등록)
    if(window.DDANJIT._game && typeof window.DDANJIT._game.init==='function'){
      try{ window.DDANJIT._game.init(); }catch(err){ console.error('game init 실패:',err); }
    }
    const g=GAMES.find(x=>x.id===currentId)||GAMES[0];
    setTimeout(()=>toast('방향키/마우스로 '+g.name+' 플레이 · 사장님 오면 <kbd>ESC</kbd> · 탭으로 게임 전환'), 700);
  });

  // 게임 등록 인터페이스
  window.DDANJIT.register = gameObj => { window.DDANJIT._game = gameObj; };
})();
