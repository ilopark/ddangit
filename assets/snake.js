/* snake.js — 스네이크 (영업 시트) */
(function(){
  "use strict";
  const N=17, KEY="ddanjit-snake-best";
  const comma=window.DDANJIT.comma;
  const $=(s)=>document.querySelector(s);
  let cells, snake, dir, nextDir, food, score, best=0, timer=null, dead=false, speed;

  function build(){
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">점수</div><div class="v num" id="sc">0</div></div>'+
      '<div class="stat"><div class="k">최고</div><div class="v num" id="bt">0</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+
        '<button class="btn" id="newgame" type="button">새 게임(F9)</button>'+
        '<span class="sub" style="color:var(--muted);font-size:11.5px">방향키 / WASD · 모바일 스와이프</span>'+
      '</div>'+
      '<div class="board" id="board" role="grid" aria-label="스네이크 판" tabindex="0"'+
        ' style="grid-template-columns:repeat('+N+',18px);grid-template-rows:repeat('+N+',18px)"></div>'+
      '<div class="banner" id="banner" role="status" aria-live="polite"><div class="box"><h3 id="bt2">게임 오버</h3>'+
        '<p id="bm"></p><button class="btn" id="bb" type="button">다시</button></div></div>';
    const b=$('#board'); cells=[];
    for(let i=0;i<N*N;i++){const c=document.createElement('div');c.className='cell';c.setAttribute('role','gridcell');b.appendChild(c);cells.push(c);}
    try{best=+localStorage.getItem(KEY)||0;}catch(e){}
    $('#bt').textContent=comma(best);
    $('#newgame').addEventListener('click',reset);
    $('#bb').addEventListener('click',reset);
    document.addEventListener('keydown',onKey);
    let sx,sy;
    b.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
    b.addEventListener('touchend',e=>{
      if(sx==null)return; const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
      if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;
      setDir(Math.abs(dx)>Math.abs(dy)?(dx>0?[1,0]:[-1,0]):(dy>0?[0,1]:[0,-1]));
    },{passive:true});
    reset();
  }

  function idx(x,y){return y*N+x;}
  function setDir(d){ if(dead)return; if(d[0]===-dir[0]&&d[1]===-dir[1])return; nextDir=d; }
  function onKey(e){
    if(window.DDANJIT.bossActive)return;
    const m={ArrowLeft:[-1,0],ArrowUp:[0,-1],ArrowRight:[1,0],ArrowDown:[0,1],a:[-1,0],w:[0,-1],d:[1,0],s:[0,1]};
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(k in m){ setDir(m[k]); e.preventDefault(); }
  }
  function placeFood(){
    let p; do{ p=[(Math.random()*N)|0,(Math.random()*N)|0]; }while(snake.some(s=>s[0]===p[0]&&s[1]===p[1]));
    food=p;
  }
  function reset(){
    clearInterval(timer);
    snake=[[8,8],[7,8],[6,8]]; dir=[1,0]; nextDir=[1,0]; score=0; dead=false; speed=130;
    placeFood(); draw();
    $('#sc').textContent='0'; $('#banner').classList.remove('show');
    $('#board').focus();
    timer=setInterval(tick, speed);
    window.DDANJIT.setStatus('준비 완료',0);
  }
  function draw(){
    for(let i=0;i<cells.length;i++){cells[i].style.background='var(--cell-bg)';}
    cells[idx(food[0],food[1])].style.background='var(--bad)';
    snake.forEach((s,i)=>{ cells[idx(s[0],s[1])].style.background = i===0?'var(--xl-green)':'var(--accent)'; });
  }
  function tick(){
    if(window.DDANJIT.bossActive||dead)return;
    dir=nextDir;
    const head=[snake[0][0]+dir[0], snake[0][1]+dir[1]];
    if(head[0]<0||head[0]>=N||head[1]<0||head[1]>=N||snake.some(s=>s[0]===head[0]&&s[1]===head[1])){ return gameOver(); }
    snake.unshift(head);
    if(head[0]===food[0]&&head[1]===food[1]){
      score+=10; $('#sc').textContent=comma(score); window.DDANJIT.setStatus(null,score);
      placeFood();
      if(speed>60 && score%50===0){ speed-=8; clearInterval(timer); timer=setInterval(tick,speed); }
    } else { snake.pop(); }
    draw();
  }
  function gameOver(){
    dead=true; clearInterval(timer);
    if(score>best){best=score;$('#bt').textContent=comma(best);try{localStorage.setItem(KEY,best);}catch(e){}}
    $('#bm').textContent='점수 '+comma(score);
    $('#banner').classList.add('show');
  }

  window.DDANJIT.register({ init: build });
})();
