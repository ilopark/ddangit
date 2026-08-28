/* minesweeper.js — 지뢰찾기 (비용 시트) */
(function(){
  "use strict";
  const comma=window.DDANJIT.comma;
  const NUMCOL=['','#1a73e8','#188038','#d24d3f','#7b1fa2','#b06000','#0097a7','#5f6368','#3b3b3b'];
  let W=9,H=9,MINES=10, grid, revealed, flagged, dead, wonf, started, t0, timer, flags=0;

  const $=(s)=>document.querySelector(s);

  function build(){
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">남은 지뢰</div><div class="v num" id="mineLeft">10</div></div>'+
      '<div class="stat"><div class="k">시간</div><div class="v num" id="time">0</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;flex-wrap:wrap">'+
        '<button class="btn" id="newgame" type="button">새 시트(F9)</button>'+
        '<div role="radiogroup" aria-label="난이도" style="display:flex;gap:4px">'+
          '<button class="btn ghost diff" data-w="9" data-h="9" data-m="10" type="button" aria-pressed="true">초급</button>'+
          '<button class="btn ghost diff" data-w="16" data-h="16" data-m="40" type="button" aria-pressed="false">중급</button>'+
        '</div>'+
        '<span class="sub" style="color:var(--muted);font-size:11.5px">좌클릭 열기 · 우클릭 깃발</span>'+
      '</div>'+
      '<p class="sub" style="color:var(--muted);font-size:11.5px;margin-bottom:8px">키보드: Tab/방향키로 이동, Enter로 열기, F로 깃발</p>'+
      '<div class="board" id="board" role="grid" aria-label="지뢰찾기 판"></div>'+
      '<div class="banner" id="banner" role="status" aria-live="polite"><div class="box"><h3 id="bt">-</h3><p id="bm"></p>'+
        '<button class="btn" id="bb" type="button">다시</button></div></div>';
    $('#newgame').addEventListener('click',reset);
    $('#bb').addEventListener('click',reset);
    document.querySelectorAll('.diff').forEach(b=>b.addEventListener('click',()=>{
      W=+b.dataset.w;H=+b.dataset.h;MINES=+b.dataset.m;
      document.querySelectorAll('.diff').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
      reset();
    }));
    reset();
  }

  function idx(x,y){return y*W+x;}
  function neighbors(x,y){const r=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx>=0&&nx<W&&ny>=0&&ny<H)r.push([nx,ny]);}return r;}

  function place(safeX,safeY){
    grid=new Array(W*H).fill(0);
    let placed=0;
    const forbidden=new Set([idx(safeX,safeY),...neighbors(safeX,safeY).map(([x,y])=>idx(x,y))]);
    while(placed<MINES){
      const p=(Math.random()*W*H)|0;
      if(grid[p]===-1||forbidden.has(p))continue;
      grid[p]=-1;placed++;
    }
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(grid[idx(x,y)]===-1)continue;
      let c=0;neighbors(x,y).forEach(([nx,ny])=>{if(grid[idx(nx,ny)]===-1)c++;});
      grid[idx(x,y)]=c;
    }
  }

  function reset(){
    revealed=new Array(W*H).fill(false);
    flagged=new Array(W*H).fill(false);
    dead=false;wonf=false;started=false;flags=0;
    clearInterval(timer);
    $('#time').textContent='0';
    $('#mineLeft').textContent=comma(MINES);
    $('#banner').classList.remove('show');
    const b=$('#board');
    b.style.gridTemplateColumns=`repeat(${W},30px)`;
    b.style.gridTemplateRows=`repeat(${H},30px)`;
    b.innerHTML='';
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const c=document.createElement('button');
      c.type='button'; c.className='cell'; c.dataset.x=x;c.dataset.y=y;
      c.style.cssText+='font-size:13px;font-weight:700;background:var(--unrevealed)';
      c.setAttribute('aria-label',(x+1)+'열 '+(y+1)+'행, 미개봉');
      c.addEventListener('click',()=>reveal(x,y));
      c.addEventListener('contextmenu',e=>{e.preventDefault();flag(x,y);});
      c.addEventListener('keydown',e=>{
        if(e.key==='f'||e.key==='F'){e.preventDefault();flag(x,y);}
        else if(e.key.startsWith('Arrow')){e.preventDefault();moveFocus(x,y,e.key);}
      });
      b.appendChild(c);
    }
    window.DDANJIT.setStatus('준비 완료',0);
  }
  function cellEl(x,y){return $('#board').children[idx(x,y)];}
  function moveFocus(x,y,key){
    let nx=x,ny=y;
    if(key==='ArrowUp')ny=Math.max(0,y-1);if(key==='ArrowDown')ny=Math.min(H-1,y+1);
    if(key==='ArrowLeft')nx=Math.max(0,x-1);if(key==='ArrowRight')nx=Math.min(W-1,x+1);
    cellEl(nx,ny).focus();
  }

  function startTimer(){started=true;t0=Date.now?0:0;let s=0;timer=setInterval(()=>{s++;$('#time').textContent=s;},1000);}

  function reveal(x,y){
    if(window.DDANJIT.bossActive||dead||wonf)return;
    if(flagged[idx(x,y)])return;
    if(!started){place(x,y);startTimer();}
    if(revealed[idx(x,y)])return;
    flood(x,y);
    paint();
    if(grid[idx(x,y)]===-1){lose(x,y);return;}
    checkWin();
  }
  function flood(x,y){
    const stack=[[x,y]];
    while(stack.length){
      const [cx,cy]=stack.pop();
      const i=idx(cx,cy);
      if(revealed[i]||flagged[i])continue;
      revealed[i]=true;
      if(grid[i]===0)neighbors(cx,cy).forEach(([nx,ny])=>{if(!revealed[idx(nx,ny)])stack.push([nx,ny]);});
    }
  }
  function flag(x,y){
    if(window.DDANJIT.bossActive||dead||wonf||revealed[idx(x,y)])return;
    if(!started){place(x,y);startTimer();}
    flagged[idx(x,y)]=!flagged[idx(x,y)];
    flags+=flagged[idx(x,y)]?1:-1;
    $('#mineLeft').textContent=comma(Math.max(0,MINES-flags));
    paint();
  }
  function paint(){
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const i=idx(x,y),c=cellEl(x,y);
      if(revealed[i]){
        c.style.background='var(--cell-bg)';
        if(grid[i]===-1){c.textContent='💣';c.style.background='var(--bad-bg)';c.setAttribute('aria-label',(x+1)+'열 '+(y+1)+'행, 지뢰');}
        else if(grid[i]>0){c.textContent=grid[i];c.style.color=NUMCOL[grid[i]];c.setAttribute('aria-label',(x+1)+'열 '+(y+1)+'행, 지뢰 '+grid[i]+'개');}
        else {c.textContent='';c.setAttribute('aria-label',(x+1)+'열 '+(y+1)+'행, 빈 칸');}
      } else {
        c.style.background='var(--unrevealed)';
        c.textContent=flagged[i]?'🚩':'';
        c.setAttribute('aria-label',(x+1)+'열 '+(y+1)+'행, '+(flagged[i]?'깃발':'미개봉'));
      }
    }
  }
  function lose(x,y){
    dead=true;clearInterval(timer);
    for(let i=0;i<W*H;i++)if(grid[i]===-1)revealed[i]=true;
    paint();
    if(cellEl(x,y))cellEl(x,y).style.background='var(--bad)';
    banner('#VALUE! 지뢰 발견 💥','다시 시도하세요');
  }
  function checkWin(){
    let ok=true;
    for(let i=0;i<W*H;i++)if(grid[i]!==-1&&!revealed[i])ok=false;
    if(ok){wonf=true;clearInterval(timer);banner('감사 완료 ✅','모든 셀 검증 성공! · '+$('#time').textContent+'초');window.DDANJIT.setStatus('완료',MINES);}
  }
  function banner(t,m){$('#bt').textContent=t;$('#bm').textContent=m;$('#banner').classList.add('show');}

  window.DDANJIT.register({ init: build });
})();
