/* sudoku.js — 스도쿠 (재고 시트) */
(function(){
  "use strict";
  let solution, puzzle, given, notes, sel=-1, holes=44, notesMode=false, mistakes=0, dead=false;
  const MAXMISS=3;
  const $=(s)=>document.querySelector(s);
  const peers=(i)=>{ // 같은 행·열·3x3 박스 인덱스
    const r=(i/9)|0,c=i%9,set=new Set();
    for(let k=0;k<9;k++){set.add(r*9+k);set.add(k*9+c);}
    const br=r-r%3,bc=c-c%3;
    for(let y=0;y<3;y++)for(let x=0;x<3;x++)set.add((br+y)*9+bc+x);
    set.delete(i); return set;
  };

  function build(){
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">난이도</div><div class="v" id="diffLabel" style="font-size:13px">보통</div></div>'+
      '<div class="stat"><div class="k">빈칸</div><div class="v num" id="blanks">0</div></div>'+
      '<div class="stat"><div class="k">실수</div><div class="v num" id="miss">0/3</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+
        '<button class="btn" id="newgame" type="button">새 시트(F9)</button>'+
        '<button class="btn ghost" id="noteBtn" type="button" aria-pressed="false">✏️ 노트</button>'+
        '<button class="btn ghost dif" data-h="36" type="button">쉬움</button>'+
        '<button class="btn ghost dif" data-h="44" type="button" aria-pressed="true">보통</button>'+
        '<button class="btn ghost dif" data-h="52" type="button">어려움</button>'+
      '</div>'+
      '<p class="sub" style="color:var(--muted);font-size:11.5px;margin:-4px 0 8px">틀린 숫자는 빨간색으로 표시되고, 실수 3회면 게임 오버 · 노트 모드로 후보 메모</p>'+
      '<div class="board" id="board" role="grid" aria-label="스도쿠 판" tabindex="0"'+
        ' style="grid-template-columns:repeat(9,40px);grid-template-rows:repeat(9,40px)"></div>'+
      '<div id="pad" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:12px;max-width:360px"></div>'+
      '<div class="banner" id="banner" role="status" aria-live="polite"><div class="box"><h3 id="bt">완료</h3><p id="bm"></p>'+
        '<button class="btn" id="bb" type="button">새 퍼즐</button></div></div>';
    const b=$('#board');
    for(let i=0;i<81;i++){
      const c=document.createElement('button');
      c.type='button';c.className='cell';c.dataset.i=i;
      c.setAttribute('aria-label',(((i%9)+1))+'열 '+((((i/9)|0)+1))+'행');
      c.style.fontSize='18px';c.style.cursor='pointer';
      // 3x3 박스 경계 두껍게
      const r=(i/9)|0, col=i%9;
      c.style.borderTop=(r%3===0)?'2px solid var(--cell-fg)':'';
      c.style.borderLeft=(col%3===0)?'2px solid var(--cell-fg)':'';
      c.style.borderRight=(col===8)?'2px solid var(--cell-fg)':'';
      c.style.borderBottom=(r===8)?'2px solid var(--cell-fg)':'';
      c.addEventListener('click',()=>select(i));
      b.appendChild(c);
    }
    const pad=$('#pad');
    for(let n=1;n<=9;n++){const btn=document.createElement('button');btn.className='btn ghost';btn.textContent=n;btn.type='button';btn.addEventListener('click',()=>enter(n));pad.appendChild(btn);}
    const del=document.createElement('button');del.className='btn ghost';del.textContent='⌫';del.type='button';del.addEventListener('click',()=>enter(0));pad.appendChild(del);
    b.addEventListener('keydown',onKey);
    $('#noteBtn').addEventListener('click',()=>{
      notesMode=!notesMode;
      const nb=$('#noteBtn');
      nb.setAttribute('aria-pressed',notesMode?'true':'false');
      nb.style.background=notesMode?'var(--accent)':'transparent';
      nb.style.color=notesMode?'var(--accent-fg)':'var(--accent)';
    });
    $('#newgame').addEventListener('click',()=>gen(holes));
    $('#bb').addEventListener('click',()=>gen(holes));
    document.querySelectorAll('.dif').forEach(d=>d.addEventListener('click',()=>{
      holes=+d.dataset.h;
      document.querySelectorAll('.dif').forEach(x=>x.setAttribute('aria-pressed',x===d?'true':'false'));
      $('#diffLabel').textContent=d.textContent;
      gen(holes);
    }));
    gen(holes);
  }

  /* ---- 생성 ---- */
  function shuffled(){const a=[1,2,3,4,5,6,7,8,9];for(let i=8;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
  function ok(bd,p,v){
    const r=(p/9)|0,c=p%9;
    for(let i=0;i<9;i++){if(bd[r*9+i]===v)return false;if(bd[i*9+c]===v)return false;}
    const br=r-r%3,bc=c-c%3;
    for(let y=0;y<3;y++)for(let x=0;x<3;x++)if(bd[(br+y)*9+bc+x]===v)return false;
    return true;
  }
  function fill(bd,p){
    if(p===81)return true;
    if(bd[p]){return fill(bd,p+1);}
    for(const v of shuffled()){if(ok(bd,p,v)){bd[p]=v;if(fill(bd,p+1))return true;bd[p]=0;}}
    return false;
  }
  // 해답 개수 세기 (limit까지만) — 유일성 판정용
  function countSolutions(bd, limit){
    const b=bd.slice(); let count=0;
    (function solve(p){
      if(count>=limit)return;
      while(p<81 && b[p])p++;
      if(p===81){count++;return;}
      for(let v=1;v<=9;v++){ if(ok(b,p,v)){ b[p]=v; solve(p+1); b[p]=0; if(count>=limit)return; } }
    })(0);
    return count;
  }
  function gen(nHoles){
    solution=new Array(81).fill(0); fill(solution,0);
    puzzle=solution.slice(); given=new Array(81).fill(true);
    notes=Array.from({length:81},()=>new Set());
    const order=[...Array(81).keys()];for(let i=80;i>0;i--){const j=(Math.random()*(i+1))|0;[order[i],order[j]]=[order[j],order[i]];}
    // 유일 해답이 유지될 때만 칸을 제거 → 정답이 하나뿐인 퍼즐 보장
    let removed=0;
    for(const p of order){
      if(removed>=nHoles)break;
      const saved=puzzle[p];
      puzzle[p]=0;
      if(countSolutions(puzzle,2)!==1){ puzzle[p]=saved; }  // 유일하지 않으면 되돌림
      else { given[p]=false; removed++; }
    }
    sel=-1; mistakes=0; dead=false;
    if($('#miss'))$('#miss').textContent='0/'+MAXMISS;
    $('#banner').classList.remove('show');
    render();
    window.DDANJIT.setStatus('입력 대기', removed);
  }
  function render(){
    let blanks=0;
    const peerSet = sel>=0 ? peers(sel) : new Set();
    const selVal = sel>=0 ? puzzle[sel] : 0;
    for(let i=0;i<81;i++){
      const c=$('#board').children[i], v=puzzle[i];
      if(!v)blanks++;
      // 내용: 값 또는 후보 노트
      if(v){ c.textContent=''; c.appendChild(document.createTextNode(v)); }
      else if(notes[i] && notes[i].size){
        c.textContent='';
        const nd=document.createElement('div'); nd.className='cand';
        for(let n=1;n<=9;n++){const s=document.createElement('span');s.textContent=notes[i].has(n)?n:'';nd.appendChild(s);}
        c.appendChild(nd);
      } else c.textContent='';
      c.style.fontWeight=given[i]?'700':'500';
      c.style.color=given[i]?'var(--cell-fg)':'var(--focus)';
      // 하이라이트 우선순위: 선택 > 같은 숫자 > 피어(행·열·블록)
      let bg='var(--cell-bg)';
      if(peerSet.has(i)) bg='var(--peer-bg)';
      if(selVal && v===selVal && i!==sel) bg='var(--samenum-bg)';
      c.style.background = i===sel ? 'var(--sel-fill)' : bg;
      c.style.outline = i===sel ? '2px solid var(--sel)' : '';
      c.style.outlineOffset='-2px';
    }
    $('#blanks').textContent=blanks;
    highlightConflicts();
  }
  function highlightConflicts(){
    // 유일 정답과 다르면 오답 → 빨강 (선택 여부와 무관하게 표시)
    for(let i=0;i<81;i++){
      if(!puzzle[i]||given[i])continue;
      if(puzzle[i]!==solution[i]){
        const c=$('#board').children[i];
        c.style.background='var(--bad-bg)'; c.style.color='var(--bad)';
      }
    }
  }
  function select(i){ if(window.DDANJIT.bossActive||dead)return; sel=i; render(); $('#board').focus(); }
  function enter(n){
    if(window.DDANJIT.bossActive||dead||sel<0||given[sel])return;
    if(notesMode && n>0){
      if(puzzle[sel])return;                 // 값이 있는 칸엔 노트 불가
      if(notes[sel].has(n))notes[sel].delete(n); else notes[sel].add(n);
      render(); return;
    }
    const prev=puzzle[sel];
    puzzle[sel]=n;
    if(n>0){
      notes[sel].clear();                    // 값 입력 시 노트 제거
      if(n!==solution[sel] && n!==prev){      // 새로 넣은 틀린 숫자 → 실수 1
        mistakes++;
        $('#miss').textContent=mistakes+'/'+MAXMISS;
        if(mistakes>=MAXMISS){ render(); return gameOver(); }
      }
    }
    render();
    if(n>0)checkWin();
  }
  function gameOver(){
    dead=true;
    $('#bt').textContent='게임 오버';
    $('#bm').textContent='실수 '+MAXMISS+'회 — 새 퍼즐로 다시 도전하세요';
    $('#banner').classList.add('show');
    window.DDANJIT.setStatus('게임 오버', 0);
  }
  function onKey(e){
    if(window.DDANJIT.bossActive)return;
    if(e.key>='1'&&e.key<='9'){enter(+e.key);e.preventDefault();}
    else if(e.key==='Backspace'||e.key==='Delete'||e.key==='0'){enter(0);e.preventDefault();}
    else if(e.key.startsWith('Arrow')&&sel>=0){
      const r=(sel/9)|0,c=sel%9;let nr=r,nc=c;
      if(e.key==='ArrowUp')nr=Math.max(0,r-1);if(e.key==='ArrowDown')nr=Math.min(8,r+1);
      if(e.key==='ArrowLeft')nc=Math.max(0,c-1);if(e.key==='ArrowRight')nc=Math.min(8,c+1);
      sel=nr*9+nc;render();e.preventDefault();
    }
  }
  function checkWin(){
    for(let i=0;i<81;i++)if(puzzle[i]!==solution[i])return;
    $('#bt').textContent='재고 대사 완료 ✅';$('#bm').textContent='모든 셀이 정확합니다!';
    $('#banner').classList.add('show');
    window.DDANJIT.setStatus('완료',0);
  }

  window.DDANJIT.register({ init: build });
})();
