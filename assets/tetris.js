/* tetris.js — 테트리스 (생산 시트) */
(function(){
  "use strict";
  const W=10, H=20, KEY="ddanjit-tetris-best";
  const comma=window.DDANJIT.comma;
  const $=(s)=>document.querySelector(s);
  const PIECES=[
    {m:[[1,1,1,1]], c:'#4aa3df'},        // I
    {m:[[1,1],[1,1]], c:'#e0b400'},      // O
    {m:[[1,1,1],[0,1,0]], c:'#a06bd0'},  // T
    {m:[[0,1,1],[1,1,0]], c:'#5cb85c'},  // S
    {m:[[1,1,0],[0,1,1]], c:'#d24d3f'},  // Z
    {m:[[1,0,0],[1,1,1]], c:'#4a6bd0'},  // J
    {m:[[0,0,1],[1,1,1]], c:'#e0954a'}   // L
  ];
  let board, cells, cur, score, lines, best=0, timer=null, over=false, dropMs;

  function build(){
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">점수</div><div class="v num" id="sc">0</div></div>'+
      '<div class="stat"><div class="k">라인</div><div class="v num" id="ln">0</div></div>'+
      '<div class="stat"><div class="k">최고</div><div class="v num" id="bt">0</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+
        '<button class="btn" id="newgame" type="button">새 게임(F9)</button>'+
        '<span class="sub" style="color:var(--muted);font-size:11.5px">← → 이동 · ↑ 회전 · ↓ 내리기 · Space 즉시낙하</span>'+
      '</div>'+
      '<div class="board" id="board" role="grid" aria-label="테트리스 판" tabindex="0"'+
        ' style="grid-template-columns:repeat('+W+',18px);grid-template-rows:repeat('+H+',18px)"></div>'+
      '<div class="banner" id="banner" role="status" aria-live="polite"><div class="box"><h3>게임 오버</h3>'+
        '<p id="bm"></p><button class="btn" id="bb" type="button">다시</button></div></div>';
    const b=$('#board'); cells=[];
    for(let i=0;i<W*H;i++){const c=document.createElement('div');c.className='cell';c.setAttribute('role','gridcell');b.appendChild(c);cells.push(c);}
    try{best=+localStorage.getItem(KEY)||0;}catch(e){}
    $('#bt').textContent=comma(best);
    $('#newgame').addEventListener('click',reset);
    $('#bb').addEventListener('click',reset);
    document.addEventListener('keydown',onKey);
    reset();
  }

  function collide(m,px,py){
    for(let y=0;y<m.length;y++)for(let x=0;x<m[y].length;x++){
      if(!m[y][x])continue;
      const bx=px+x, by=py+y;
      if(bx<0||bx>=W||by>=H)return true;
      if(by>=0&&board[by][bx])return true;
    }
    return false;
  }
  function rotate(m){
    const r=m[0].map((_,i)=>m.map(row=>row[i]).reverse());
    return r;
  }
  function spawn(){
    const p=PIECES[(Math.random()*PIECES.length)|0];
    cur={m:p.m.map(r=>r.slice()), c:p.c, x:((W- p.m[0].length)/2)|0, y:-p.m.length+1};
    // 살짝 위에서 시작; 스폰 위치 충돌이면 게임오버
    cur.y=0;
    if(collide(cur.m,cur.x,cur.y)){ gameOver(); }
  }
  function lock(){
    for(let y=0;y<cur.m.length;y++)for(let x=0;x<cur.m[y].length;x++){
      if(cur.m[y][x]){ const by=cur.y+y, bx=cur.x+x; if(by>=0) board[by][bx]=cur.c; }
    }
    clearLines(); spawn(); draw();
  }
  function clearLines(){
    let cleared=0;
    for(let y=H-1;y>=0;y--){
      if(board[y].every(v=>v)){ board.splice(y,1); board.unshift(new Array(W).fill(0)); cleared++; y++; }
    }
    if(cleared){
      lines+=cleared; score+=[0,100,300,500,800][cleared];
      $('#sc').textContent=comma(score); $('#ln').textContent=comma(lines);
      window.DDANJIT.setStatus(null,score);
      const nd=Math.max(120, 600 - Math.floor(lines/5)*45);
      if(nd!==dropMs){ dropMs=nd; clearInterval(timer); timer=setInterval(step,dropMs); }
    }
  }
  function step(){
    if(window.DDANJIT.bossActive||over)return;
    if(!collide(cur.m,cur.x,cur.y+1)){ cur.y++; draw(); }
    else lock();
  }
  function onKey(e){
    if(window.DDANJIT.bossActive||over)return;
    const k=e.key;
    if(k==='ArrowLeft'){ if(!collide(cur.m,cur.x-1,cur.y)){cur.x--;draw();} e.preventDefault(); }
    else if(k==='ArrowRight'){ if(!collide(cur.m,cur.x+1,cur.y)){cur.x++;draw();} e.preventDefault(); }
    else if(k==='ArrowDown'){ step(); e.preventDefault(); }
    else if(k==='ArrowUp'){ const r=rotate(cur.m); if(!collide(r,cur.x,cur.y)){cur.m=r;draw();} e.preventDefault(); }
    else if(k===' '){ while(!collide(cur.m,cur.x,cur.y+1))cur.y++; lock(); e.preventDefault(); }
  }
  function draw(){
    for(let i=0;i<cells.length;i++){ const y=(i/W)|0, x=i%W; cells[i].style.background = board[y][x]||'var(--cell-bg)'; }
    if(cur) for(let y=0;y<cur.m.length;y++)for(let x=0;x<cur.m[y].length;x++){
      if(cur.m[y][x]){ const by=cur.y+y, bx=cur.x+x; if(by>=0&&by<H&&bx>=0&&bx<W) cells[by*W+bx].style.background=cur.c; }
    }
  }
  function reset(){
    clearInterval(timer);
    board=Array.from({length:H},()=>new Array(W).fill(0));
    score=0; lines=0; over=false; dropMs=600;
    $('#sc').textContent='0'; $('#ln').textContent='0';
    $('#banner').classList.remove('show');
    spawn(); draw(); $('#board').focus();
    timer=setInterval(step,dropMs);
    window.DDANJIT.setStatus('준비 완료',0);
  }
  function gameOver(){
    over=true; clearInterval(timer);
    if(score>best){best=score;$('#bt').textContent=comma(best);try{localStorage.setItem(KEY,best);}catch(e){}}
    $('#bm').textContent='점수 '+comma(score)+' · '+lines+'라인';
    $('#banner').classList.add('show');
  }

  window.DDANJIT.register({ init: build });
})();
