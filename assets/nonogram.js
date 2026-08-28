/* nonogram.js — 네모네모로직 (원가 시트) */
(function(){
  "use strict";
  const $=(s)=>document.querySelector(s);
  let N=10, sol, fill, mark, solved;

  function build(){
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">크기</div><div class="v" id="size" style="font-size:14px">10×10</div></div>'+
      '<div class="stat"><div class="k">남은 칸</div><div class="v num" id="left">0</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">'+
        '<button class="btn" id="newgame" type="button">새 퍼즐(F9)</button>'+
        '<button class="btn ghost sz" data-n="5" type="button">5×5</button>'+
        '<button class="btn ghost sz" data-n="10" type="button" aria-pressed="true">10×10</button>'+
      '</div>'+
      '<p class="sub" style="color:var(--muted);font-size:11.5px;margin-bottom:8px">좌클릭: 칠하기 · 우클릭: X 표시 · 숫자는 그 줄의 연속 칠 개수</p>'+
      '<div class="nono" id="nono" role="grid" aria-label="네모네모로직 판"></div>'+
      '<div class="banner" id="banner" role="status" aria-live="polite"><div class="box"><h3>완성! 🎉</h3>'+
        '<p id="bm"></p><button class="btn" id="bb" type="button">새 퍼즐</button></div></div>';
    $('#newgame').addEventListener('click',gen);
    $('#bb').addEventListener('click',gen);
    document.querySelectorAll('.sz').forEach(b=>b.addEventListener('click',()=>{
      N=+b.dataset.n; document.querySelectorAll('.sz').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
      $('#size').textContent=N+'×'+N; gen();
    }));
    gen();
  }

  function runs(line){
    const r=[]; let c=0;
    for(const v of line){ if(v){c++;} else if(c){r.push(c);c=0;} }
    if(c)r.push(c);
    return r.length?r:[0];
  }
  function gen(){
    // 랜덤 해답 (약 55% 채움, 빈 줄 방지)
    sol=Array.from({length:N},()=>Array.from({length:N},()=>Math.random()<0.55?1:0));
    for(let y=0;y<N;y++){ if(sol[y].every(v=>!v)) sol[y][(Math.random()*N)|0]=1; }
    for(let x=0;x<N;x++){ if(sol.every(r=>!r[x])) sol[(Math.random()*N)|0][x]=1; }
    fill=Array.from({length:N},()=>new Array(N).fill(0));
    mark=Array.from({length:N},()=>new Array(N).fill(0));
    solved=false;
    render();
  }
  function colLine(x){ return sol.map(r=>r[x]); }
  function render(){
    const wrap=$('#nono');
    const cw=26, clue=64;
    wrap.style.gridTemplateColumns=clue+'px repeat('+N+','+cw+'px)';
    wrap.style.gridTemplateRows=clue+'px repeat('+N+','+cw+'px)';
    let html='<div class="corner"></div>';
    for(let x=0;x<N;x++){ html+='<div class="cclue">'+runs(colLine(x)).map(n=>'<span>'+n+'</span>').join('')+'</div>'; }
    for(let y=0;y<N;y++){
      html+='<div class="rclue">'+runs(sol[y]).map(n=>'<span>'+n+'</span>').join('')+'</div>';
      for(let x=0;x<N;x++){
        html+='<div class="ncell'+(fill[y][x]?' fill':'')+'" data-x="'+x+'" data-y="'+y+'">'+(!fill[y][x]&&mark[y][x]?'✕':'')+'</div>';
      }
    }
    wrap.innerHTML=html;
    wrap.querySelectorAll('.ncell').forEach(c=>{
      const x=+c.dataset.x, y=+c.dataset.y;
      c.addEventListener('click',()=>{ if(window.DDANJIT.bossActive||solved)return; mark[y][x]=0; fill[y][x]^=1; update(); });
      c.addEventListener('contextmenu',e=>{ e.preventDefault(); if(window.DDANJIT.bossActive||solved)return; if(fill[y][x])return; mark[y][x]^=1; update(); });
    });
    update();
  }
  function update(){
    let remain=0;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const cell=$('#nono').querySelector('.ncell[data-x="'+x+'"][data-y="'+y+'"]');
      if(!cell)continue;
      cell.classList.toggle('fill', !!fill[y][x]);
      cell.textContent = (!fill[y][x]&&mark[y][x])?'✕':'';
      if(sol[y][x]&&!fill[y][x])remain++;
    }
    $('#left').textContent=remain;
    window.DDANJIT.setStatus(null, remain);
    // 승리: 칠한 것이 해답과 정확히 일치
    let win=true;
    for(let y=0;y<N&&win;y++)for(let x=0;x<N;x++){ if(!!fill[y][x]!==!!sol[y][x]){win=false;break;} }
    if(win&&!solved){ solved=true; $('#bm').textContent='그림을 완성했어요!'; $('#banner').classList.add('show'); window.DDANJIT.setStatus('완성',0); }
  }

  window.DDANJIT.register({ init: build });
})();
