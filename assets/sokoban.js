/* sokoban.js — 소코반 (물류 시트). 역방향 생성으로 매판 랜덤 + 항상 풀림 */
(function(){
  "use strict";
  const $=(s)=>document.querySelector(s);
  const DIFFS={쉬움:{G:7,boxes:2,pulls:35}, 보통:{G:8,boxes:3,pulls:75}, 어려움:{G:9,boxes:4,pulls:120}};
  let G, grid, targets, boxes, player, start, history, won, diff="보통";
  const DIRS=[[0,-1],[0,1],[-1,0],[1,0]];
  const key=(x,y)=>x+","+y;

  function build(){
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">난이도</div><div class="v" id="dlab" style="font-size:14px">보통</div></div>'+
      '<div class="stat"><div class="k">이동</div><div class="v num" id="moves">0</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">'+
        '<button class="btn" id="newgame" type="button">새 퍼즐(F9)</button>'+
        '<button class="btn ghost" id="undo" type="button">되돌리기(Z)</button>'+
        '<button class="btn ghost" id="restart" type="button">다시하기(R)</button>'+
        '<span style="width:6px"></span>'+
        '<button class="btn ghost df" data-d="쉬움" type="button">쉬움</button>'+
        '<button class="btn ghost df" data-d="보통" type="button" aria-pressed="true">보통</button>'+
        '<button class="btn ghost df" data-d="어려움" type="button">어려움</button>'+
      '</div>'+
      '<p class="sub" style="color:var(--muted);font-size:11.5px;margin-bottom:8px">방향키로 상자(주황)를 밀어 목표(점) 위에 모두 올리세요</p>'+
      '<div class="board" id="board" role="grid" aria-label="소코반 판" tabindex="0"></div>'+
      '<div class="banner" id="banner" role="status" aria-live="polite"><div class="box"><h3>클리어! 🎉</h3>'+
        '<p id="bm"></p><button class="btn" id="bb" type="button">새 퍼즐</button></div></div>';
    $('#newgame').addEventListener('click',()=>gen());
    $('#bb').addEventListener('click',()=>gen());
    $('#undo').addEventListener('click',undo);
    $('#restart').addEventListener('click',restart);
    document.querySelectorAll('.df').forEach(b=>b.addEventListener('click',()=>{
      diff=b.dataset.d; document.querySelectorAll('.df').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
      $('#dlab').textContent=diff; gen();
    }));
    document.addEventListener('keydown',onKey);
    gen();
  }

  function isFloor(x,y){ return x>0&&x<G-1&&y>0&&y<G-1; }

  function gen(){
    const d=DIFFS[diff]; G=d.G;
    // 격자: 테두리 벽, 내부 바닥
    grid=Array.from({length:G},(_,y)=>Array.from({length:G},(_,x)=>isFloor(x,y)?0:1));
    const floors=[];
    for(let y=1;y<G-1;y++)for(let x=1;x<G-1;x++)floors.push([x,y]);
    // "모든 상자가 목표 밖" 상태가 될 때까지 재시도 (역방향 생성이라 항상 풀림 보장)
    let best=null, bestOn=999;
    for(let attempt=0; attempt<30; attempt++){
      shuffle(floors);
      const tgt=new Set(), bx=new Set();
      for(let i=0;i<d.boxes;i++){ const [x,y]=floors[i]; tgt.add(key(x,y)); bx.add(key(x,y)); }
      let pc=floors.find(([x,y])=>!bx.has(key(x,y)));
      let p={x:pc[0], y:pc[1]};
      for(let k=0;k<d.pulls;k++){
        const dir=DIRS[(Math.random()*4)|0];
        const fx=p.x+dir[0], fy=p.y+dir[1], bxx=p.x-dir[0], byy=p.y-dir[1];
        if(!isFloor(fx,fy)||bx.has(key(fx,fy))) continue;
        if(bx.has(key(bxx,byy)) && Math.random()<0.8){ bx.delete(key(bxx,byy)); bx.add(key(p.x,p.y)); }
        p={x:fx,y:fy};
      }
      let on=0; bx.forEach(b=>{ if(tgt.has(b))on++; });
      if(on<bestOn){ bestOn=on; best={tgt:new Set(tgt), bx:new Set(bx), p:{...p}}; }
      if(on===0) break;
    }
    targets=best.tgt; boxes=best.bx; player=best.p;
    start={player:{...player}, boxes:new Set(boxes)};
    history=[]; won=false;
    $('#moves').textContent='0';
    $('#banner').classList.remove('show');
    render(); $('#board').focus();
    window.DDANJIT.setStatus('준비 완료',0);
  }

  function onKey(e){
    if(window.DDANJIT.bossActive)return;
    const m={ArrowLeft:[-1,0],ArrowUp:[0,-1],ArrowRight:[1,0],ArrowDown:[0,1],a:[-1,0],w:[0,-1],d:[1,0],s:[0,1]};
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(k==='z'){ undo(); e.preventDefault(); return; }
    if(k==='r'){ restart(); e.preventDefault(); return; }
    if(k in m){ move(m[k]); e.preventDefault(); }
  }
  function move(dir){
    if(won||window.DDANJIT.bossActive)return;
    const nx=player.x+dir[0], ny=player.y+dir[1];
    if(grid[ny][nx]===1)return;                 // 벽
    const snap={player:{...player}, boxes:new Set(boxes)};
    if(boxes.has(key(nx,ny))){
      const bx=nx+dir[0], by=ny+dir[1];
      if(grid[by][bx]===1||boxes.has(key(bx,by)))return; // 상자 못 밀음
      boxes.delete(key(nx,ny)); boxes.add(key(bx,by));
    }
    player={x:nx,y:ny};
    history.push(snap);
    $('#moves').textContent=history.length;
    window.DDANJIT.setStatus(null, history.length);
    render(); checkWin();
  }
  function undo(){
    if(!history.length||won)return;
    const s=history.pop(); player=s.player; boxes=s.boxes;
    $('#moves').textContent=history.length; render();
  }
  function restart(){
    player={...start.player}; boxes=new Set(start.boxes); history=[]; won=false;
    $('#moves').textContent='0'; $('#banner').classList.remove('show'); render();
  }
  function checkWin(){
    let ok=true; targets.forEach(t=>{ if(!boxes.has(t))ok=false; });
    if(ok){ won=true; $('#bm').textContent=history.length+'번 이동'; $('#banner').classList.add('show'); window.DDANJIT.setStatus('클리어',history.length); }
  }
  function render(){
    const b=$('#board'), sz=34;
    b.style.gridTemplateColumns='repeat('+G+','+sz+'px)';
    b.style.gridTemplateRows='repeat('+G+','+sz+'px)';
    let h='';
    for(let y=0;y<G;y++)for(let x=0;x<G;x++){
      const isWall=grid[y][x]===1, isT=targets.has(key(x,y)), isB=boxes.has(key(x,y)), isP=(player.x===x&&player.y===y);
      let bg='var(--cell-bg)', inner='', style='';
      if(isWall){ bg='var(--muted)'; }
      else if(isB){ bg = isT?'var(--good)':'#e0954a'; style='border-radius:4px'; }
      else if(isP){ bg='var(--accent)'; style='border-radius:50%'; }
      else if(isT){ inner='<span style="color:var(--accent);font-size:16px">•</span>'; }
      h+='<div class="cell" role="gridcell" style="background:'+bg+';'+style+'">'+inner+'</div>';
    }
    b.innerHTML=h;
  }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } }

  window.DDANJIT.register({ init: build });
})();
