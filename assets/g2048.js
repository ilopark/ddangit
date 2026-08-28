/* g2048.js — 2048 (실적 시트) */
(function(){
  "use strict";
  const N=4, KEY="ddanjit-2048-best";
  const comma = window.DDANJIT.comma;
  let board, score, best=0, over=false, won=false;

  const $=(s)=>document.querySelector(s);
  const empties=()=>{const e=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(board[y][x]===0)e.push([y,x]);return e;};

  function build(){
    const sb=$('#scorebox');
    sb.innerHTML =
      '<div class="stat"><div class="k">점수</div><div class="v num" id="sc">0</div></div>'+
      '<div class="stat"><div class="k">최고</div><div class="v num" id="bt">0</div></div>';
    const play=$('#play');
    play.innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:12px">'+
        '<button class="btn" id="newgame" type="button">새 계산(F9)</button>'+
        '<button class="btn ghost" id="undoInfo" type="button" disabled aria-hidden="true" style="opacity:0;pointer-events:none">.</button>'+
      '</div>'+
      '<div class="board" id="board" role="grid" aria-label="2048 게임판" tabindex="0"'+
        ' style="grid-template-columns:repeat(4,72px);grid-template-rows:repeat(4,72px)"></div>'+
      '<div class="banner" id="banner" role="status" aria-live="polite"><div class="box">'+
        '<h3 id="bannerTitle">#REF!</h3><p id="bannerMsg"></p>'+
        '<button class="btn" id="bannerBtn" type="button">다시 계산</button></div></div>';
    const grid=$('#board');
    for(let i=0;i<16;i++){
      const c=document.createElement('div');
      c.className='cell tile'; c.dataset.v='0'; c.setAttribute('role','gridcell');
      c.style.fontWeight='700'; c.style.fontSize='22px';
      grid.appendChild(c);
    }
    try{best=+localStorage.getItem(KEY)||0;}catch(e){}
    $('#bt').textContent=comma(best);
    $('#newgame').addEventListener('click',reset);
    $('#bannerBtn').addEventListener('click',reset);
    grid.addEventListener('keydown',onKey);
    // 스와이프
    let sx,sy;
    grid.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
    grid.addEventListener('touchend',e=>{
      if(window.DDANJIT.bossActive||sx==null)return;
      const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
      if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
      move(Math.abs(dx)>Math.abs(dy)?(dx>0?2:0):(dy>0?3:1));
    },{passive:true});
    document.addEventListener('keydown',e=>{
      if(window.DDANJIT.bossActive)return;
      const map={ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3,a:0,w:1,d:2,s:3};
      const k=e.key.length===1?e.key.toLowerCase():e.key;
      if(k in map){ move(map[k]); e.preventDefault(); }
    });
    reset();
  }

  function tileEl(y,x){ return $('#board').children[y*N+x]; }
  function anim(t,cls){ t.classList.remove('anim-pop','anim-merge'); void t.offsetWidth; t.classList.add(cls); }
  function render(pop, merged){
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const t=tileEl(y,x), v=board[y][x];
      t.dataset.v=v; t.textContent=v?v:'';
      t.style.background=v?`var(--t${v})`:'var(--cell-bg)';
      t.style.color=v?`var(--t${v}f)`:'var(--cell-fg)';
      t.style.fontSize = v>=1024?'16px':'22px';
      if(merged && merged[y] && merged[y][x]) anim(t,'anim-merge');
    }
    if(pop&&pop.length){ anim(tileEl(pop[0],pop[1]),'anim-pop'); }
    $('#sc').textContent=comma(score);
    if(score>best){best=score;$('#bt').textContent=comma(best);try{localStorage.setItem(KEY,best);}catch(e){}}
    window.DDANJIT.setStatus(null, score);
  }
  function addTile(){const e=empties();if(!e.length)return null;const[y,x]=e[(Math.random()*e.length)|0];board[y][x]=Math.random()<0.9?2:4;return[y,x];}
  // slide2: 병합 위치 마스크도 함께 반환
  function slide2(row){
    const a=row.filter(v=>v), out=[], merges=new Array(N).fill(false);
    for(let i=0;i<a.length;i++){
      if(i<a.length-1 && a[i]===a[i+1]){ const m=a[i]*2; score+=m; if(m===2048)won=true; out.push(m); merges[out.length-1]=true; i++; }
      else out.push(a[i]);
    }
    while(out.length<N)out.push(0);
    return {row:out, merges};
  }
  // 반시계 회전(상하 방향 정상화)
  function rot(b){const o=[];for(let x=0;x<N;x++){o.push([]);for(let y=0;y<N;y++)o[x].push(b[y][N-1-x]);}return o;}
  function canMove(){for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!board[y][x])return true;if(x<N-1&&board[y][x]===board[y][x+1])return true;if(y<N-1&&board[y][x]===board[y+1][x])return true;}return false;}
  function move(dir){
    if(over)return;
    let b=board.map(r=>r.slice());
    for(let i=0;i<dir;i++)b=rot(b);
    let mask=[];
    b=b.map(row=>{const r=slide2(row);mask.push(r.merges);return r.row;});
    for(let i=0;i<(4-dir)%4;i++){b=rot(b);mask=rot(mask);}
    if(JSON.stringify(b)!==JSON.stringify(board)){
      board=b; const p=addTile(); render(p,mask);
      if(won && !$('#banner').classList.contains('show')){ showBanner('=2048 달성! ✅','합계 '+comma(score)+' — 계속 계산할 수 있습니다','계속'); won='shown'; }
      else if(!canMove()){ over=true; showBanner('#REF! 더 이상 이동 불가','최종 합계 '+comma(score),'다시 계산'); }
    }
  }
  function onKey(e){
    if(window.DDANJIT.bossActive)return;
    const map={ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3};
    if(e.key in map){move(map[e.key]);e.preventDefault();}
  }
  function showBanner(t,m,btn){$('#bannerTitle').textContent=t;$('#bannerMsg').textContent=m;$('#bannerBtn').textContent=btn;$('#banner').classList.add('show');}
  function reset(){board=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];score=0;over=false;won=false;$('#banner').classList.remove('show');addTile();addTile();render();$('#board').focus();}

  window.DDANJIT.register({ init: build });
})();
