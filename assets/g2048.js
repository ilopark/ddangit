/* g2048.js — 2048 (실적 시트). 절대위치 타일 + 슬라이드 애니메이션 */
(function(){
  "use strict";
  const N=4, STEP=80, SLIDE=125, KEY="ddanjit-2048-best";
  const comma=window.DDANJIT.comma;
  const $=(s)=>document.querySelector(s);
  let grid, tiles, nextId, score, best=0, over=false, won=false, busy=false;

  function build(){
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">점수</div><div class="v num" id="sc">0</div></div>'+
      '<div class="stat"><div class="k">최고</div><div class="v num" id="bt">0</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:12px">'+
        '<button class="btn" id="newgame" type="button">새 계산(F9)</button>'+
      '</div>'+
      '<div class="board2048" id="board" tabindex="0" role="grid" aria-label="2048 게임판" aria-describedby="g2048help">'+
        '<div class="bg" aria-hidden="true">'+'<div></div>'.repeat(16)+'</div>'+
        '<div class="tiles" id="tiles"></div>'+
      '</div>'+
      '<p id="g2048help" class="sr-only">방향키로 타일을 밀어 같은 숫자를 합치세요</p>'+
      '<div class="banner" id="banner" role="status" aria-live="polite"><div class="box">'+
        '<h3 id="bannerTitle">#REF!</h3><p id="bannerMsg"></p>'+
        '<button class="btn" id="bannerBtn" type="button">다시 계산</button></div></div>';
    try{best=+localStorage.getItem(KEY)||0;}catch(e){}
    $('#bt').textContent=comma(best);
    $('#newgame').addEventListener('click',reset);
    $('#bannerBtn').addEventListener('click',reset);
    document.addEventListener('keydown',onKey);
    // 스와이프
    const b=$('#board'); let sx,sy;
    b.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
    b.addEventListener('touchend',e=>{
      if(busy||over||window.DDANJIT.bossActive||sx==null)return;
      const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
      if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
      move(Math.abs(dx)>Math.abs(dy)?(dx>0?2:0):(dy>0?3:1));
    },{passive:true});
    reset();
  }

  function onKey(e){
    if(window.DDANJIT.bossActive)return;
    const map={ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3,a:0,w:1,d:2,s:3};
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(k in map){ e.preventDefault(); move(map[k]); }
  }

  function setVal(t){
    t.inner.textContent=t.value;
    t.inner.style.background=`var(--t${t.value})`;
    t.inner.style.color=`var(--t${t.value}f)`;
    t.inner.style.fontSize = t.value>=1024?'16px':'22px';
  }
  function posTile(t){ t.el.style.transform=`translate(${t.x*STEP}px, ${t.y*STEP}px)`; }
  function createTile(x,y,value,isNew){
    const t={id:nextId++,x,y,value};
    const el=document.createElement('div'); el.className='tile-fp'+(isNew?' appear':'');
    const inner=document.createElement('div'); inner.className='inner';
    el.appendChild(inner); t.el=el; t.inner=inner;
    setVal(t); posTile(t);          // 위치를 먼저 잡고 DOM 삽입 → 생성 시 슬라이드 방지
    $('#tiles').appendChild(el);
    tiles.push(t); grid[y][x]=t;
    return t;
  }
  function emptyCells(){ const e=[]; for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!grid[y][x])e.push([x,y]); return e; }
  function addRandom(){ const e=emptyCells(); if(!e.length)return; const[x,y]=e[(Math.random()*e.length)|0]; createTile(x,y,Math.random()<0.9?2:4,true); }

  function reset(){
    $('#tiles').innerHTML='';
    grid=[[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]];
    tiles=[]; nextId=1; score=0; over=false; won=false; busy=false;
    $('#banner').classList.remove('show');
    $('#sc').textContent='0';
    addRandom(); addRandom();
    window.DDANJIT.setStatus('준비 완료',0);
    $('#board').focus();
  }

  function move(dir){
    if(over||busy||window.DDANJIT.bossActive)return;
    const vec=[[-1,0],[0,-1],[1,0],[0,1]][dir];
    const tx = vec[0]>0?[3,2,1,0]:[0,1,2,3];
    const ty = vec[1]>0?[3,2,1,0]:[0,1,2,3];
    let moved=false;
    tiles.forEach(t=>{t.merged=false;t.removing=false;});
    ty.forEach(y=>tx.forEach(x=>{
      const t=grid[y][x]; if(!t)return;
      let cx=x, cy=y, mergeInto=null;
      while(true){
        const ax=cx+vec[0], ay=cy+vec[1];
        if(ax<0||ax>3||ay<0||ay>3)break;
        const occ=grid[ay][ax];
        if(!occ){ cx=ax; cy=ay; continue; }
        if(occ.value===t.value && !occ.merged){ mergeInto=occ; }
        break;
      }
      if(mergeInto){
        grid[y][x]=null;
        t.x=mergeInto.x; t.y=mergeInto.y; t.removing=true;
        mergeInto.merged=true; mergeInto.pending=mergeInto.value*2;
        score+=mergeInto.pending; if(mergeInto.pending===2048)won=true;
        posTile(t); moved=true;
      } else if(cx!==x||cy!==y){
        grid[y][x]=null; grid[cy][cx]=t; t.x=cx; t.y=cy;
        posTile(t); moved=true;
      }
    }));
    if(!moved)return;
    busy=true;
    window.DDANJIT.setStatus(null, score);
    setTimeout(resolve, SLIDE);
  }

  function resolve(){
    // 합쳐진(사라지는) 타일 제거
    tiles = tiles.filter(t=>{ if(t.removing){ t.el.remove(); return false; } return true; });
    // 합쳐서 값이 커진 타일 갱신 + 팝
    tiles.forEach(t=>{
      if(t.merged){ t.value=t.pending; setVal(t);
        t.el.classList.remove('merged'); void t.el.offsetWidth; t.el.classList.add('merged'); }
    });
    // 점수/최고
    $('#sc').textContent=comma(score);
    if(score>best){best=score;$('#bt').textContent=comma(best);try{localStorage.setItem(KEY,best);}catch(e){}}
    addRandom();
    busy=false;
    if(won && !$('#banner').classList.contains('show')){
      banner('=2048 달성! ✅','합계 '+comma(score)+' — 계속 진행할 수 있습니다','계속'); won='shown';
    } else if(!canMove()){
      over=true; banner('#REF! 더 이상 이동 불가','최종 합계 '+comma(score),'다시 계산');
    }
  }

  function canMove(){
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const t=grid[y][x]; if(!t)return true;
      if(x<N-1&&grid[y][x+1]&&grid[y][x+1].value===t.value)return true;
      if(y<N-1&&grid[y+1][x]&&grid[y+1][x].value===t.value)return true;
    }
    return false;
  }
  function banner(t,m,btn){ $('#bannerTitle').textContent=t; $('#bannerMsg').textContent=m; $('#bannerBtn').textContent=btn||'다시 계산'; $('#banner').classList.add('show'); }

  window.DDANJIT.register({ init: build });
})();
