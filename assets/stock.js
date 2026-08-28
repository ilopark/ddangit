/* stock.js — 모의 주식 투자 (투자 시트) */
(function(){
  "use strict";
  const $=(s)=>document.querySelector(s);
  const comma=window.DDANJIT.comma;
  const START=1000000, QTY=10;
  let cash, shares, avgCost, prices, day, best=0, canvas, ctx;
  const KEY="ddanjit-stock-best";

  function build(){
    try{best=+localStorage.getItem(KEY)||0;}catch(e){}
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">총자산</div><div class="v num" id="total" style="font-size:14px">0</div></div>'+
      '<div class="stat"><div class="k">수익률</div><div class="v num" id="ror" style="font-size:14px">0%</div></div>'+
      '<div class="stat"><div class="k">최고 수익률</div><div class="v num" id="best" style="font-size:14px">'+ (best?best+'%':'-') +'</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+
        '<button class="btn" id="newgame" type="button">새 게임(F9)</button>'+
        '<span class="sub" style="color:var(--muted);font-size:11.5px">가상 종목 · 매수/매도 후 다음 날로</span>'+
      '</div>'+
      '<div style="border:1px solid var(--grid-line);border-radius:6px;background:var(--cell-bg);box-shadow:var(--shadow);padding:10px">'+
        '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">'+
          '<strong style="font-size:13px">가상전자 <span style="color:var(--muted);font-weight:400">(005930K)</span></strong>'+
          '<span class="num" id="price" style="font-size:18px;font-weight:700">0</span>'+
        '</div>'+
        '<canvas id="chart" width="520" height="200" style="width:100%;height:auto;display:block"></canvas>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px;font-size:12.5px">'+
        '<div class="stat" style="text-align:left"><div class="k">현금</div><div class="v num" id="cash" style="font-size:14px">0</div></div>'+
        '<div class="stat" style="text-align:left"><div class="k">보유 (평단)</div><div class="v num" id="hold" style="font-size:14px">0</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">'+
        '<button class="btn" id="buy" type="button">매수 '+QTY+'주</button>'+
        '<button class="btn ghost" id="sell" type="button">매도 '+QTY+'주</button>'+
        '<button class="btn ghost" id="sellall" type="button">전량 매도</button>'+
        '<button class="btn" id="next" type="button" style="margin-left:auto">다음 날 ▶</button>'+
      '</div>'+
      '<div id="msg" aria-live="polite" style="margin-top:10px;color:var(--muted);font-size:12px;min-height:16px"></div>';
    canvas=$('#chart'); ctx=canvas.getContext('2d');
    $('#newgame').addEventListener('click',reset);
    $('#buy').addEventListener('click',()=>trade(1));
    $('#sell').addEventListener('click',()=>trade(-1));
    $('#sellall').addEventListener('click',()=>{ if(shares>0)trade(-shares/QTY); });
    $('#next').addEventListener('click',nextDay);
    reset();
  }

  function price(){ return prices[prices.length-1]; }
  function reset(){
    cash=START; shares=0; avgCost=0; day=1; prices=[10000];
    msg(''); render();
    window.DDANJIT.setStatus('1일차', 0);
  }
  function trade(units){
    const q=Math.round(units*QTY);
    if(q>0){
      const cost=price()*q;
      if(cost>cash){ msg('현금이 부족합니다'); return; }
      avgCost = shares+q>0 ? (avgCost*shares + cost)/(shares+q) : 0;
      shares+=q; cash-=cost;
    } else if(q<0){
      const sq=Math.min(-q, shares); if(sq<=0){ msg('보유 주식이 없습니다'); return; }
      cash+=price()*sq; shares-=sq; if(shares===0)avgCost=0;
    }
    render();
  }
  function nextDay(){
    if(window.DDANJIT.bossActive)return;
    // 랜덤워크 (±약 5%, 가끔 큰 변동)
    let r=(Math.random()-0.5)*0.09;
    if(Math.random()<0.08) r*=2.4;
    let p=Math.round(price()*(1+r));
    p=Math.max(100, p);
    prices.push(p); day++;
    if(prices.length>60)prices.shift();
    render();
    const ror=Math.round((total()-START)/START*100);
    if(ror>best){ best=ror; try{localStorage.setItem(KEY,best);}catch(e){} $('#best').textContent=best+'%'; }
  }
  function total(){ return Math.round(cash + shares*price()); }
  function render(){
    const p=price(), tot=total(), ror=((tot-START)/START*100);
    $('#price').textContent=comma(p)+'원';
    $('#price').style.color = prices.length<2 ? 'var(--cell-fg)' : (p>=prices[prices.length-2]?'var(--good)':'var(--bad)');
    $('#cash').textContent=comma(Math.round(cash))+'원';
    $('#hold').textContent=shares>0 ? comma(shares)+'주 ('+comma(Math.round(avgCost))+')' : '0주';
    $('#total').textContent=comma(tot)+'원';
    const rr=$('#ror'); rr.textContent=(ror>=0?'+':'')+ror.toFixed(1)+'%';
    rr.style.color = ror>0?'var(--good)':(ror<0?'var(--bad)':'var(--cell-fg)');
    window.DDANJIT.setStatus(day+'일차', tot);
    drawChart();
  }
  function cssv(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim()||'#888'; }
  function drawChart(){
    const w=canvas.width, h=canvas.height, pad=8;
    ctx.clearRect(0,0,w,h);
    const min=Math.min(...prices), max=Math.max(...prices), rng=(max-min)||1;
    const x=i=> pad + i*(w-2*pad)/Math.max(1,prices.length-1);
    const y=v=> pad + (1-(v-min)/rng)*(h-2*pad);
    // grid
    ctx.strokeStyle=cssv('--grid-line'); ctx.lineWidth=1;
    for(let g=0;g<=3;g++){ const gy=pad+g*(h-2*pad)/3; ctx.beginPath();ctx.moveTo(pad,gy);ctx.lineTo(w-pad,gy);ctx.stroke(); }
    // line
    const up = prices[prices.length-1]>=prices[0];
    ctx.strokeStyle= up?cssv('--good'):cssv('--bad'); ctx.lineWidth=2; ctx.lineJoin='round';
    ctx.beginPath();
    prices.forEach((v,i)=>{ i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)); });
    ctx.stroke();
    // 마지막 점
    ctx.fillStyle=ctx.strokeStyle;
    ctx.beginPath(); ctx.arc(x(prices.length-1),y(price()),3.5,0,7); ctx.fill();
  }
  function msg(t){ $('#msg').textContent=t; if(t)setTimeout(()=>{if($('#msg').textContent===t)$('#msg').textContent='';},1800); }

  window.DDANJIT.register({ init: build });
})();
