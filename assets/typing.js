/* typing.js — 타자연습 (요약 시트) */
(function(){
  "use strict";
  const SENTENCES=[
    "이번 분기 실적은 전년 대비 12퍼센트 성장하였습니다.",
    "첨부된 자료를 검토하신 후 회신 부탁드립니다.",
    "다음 주 화요일 오후 세시에 회의를 진행하겠습니다.",
    "고객 만족도 조사 결과를 요약하여 보고드립니다.",
    "예산 초과 항목에 대한 검토가 필요한 상황입니다.",
    "빠른 시일 내에 처리하여 다시 연락드리겠습니다.",
    "관련 부서와 협의하여 최종안을 확정하겠습니다.",
    "the quick brown fox jumps over the lazy dog every morning."
  ];
  const $=(s)=>document.querySelector(s);
  let target="", startT=null, done=0, timer=null;

  function build(){
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">타수/분</div><div class="v num" id="cpm">0</div></div>'+
      '<div class="stat"><div class="k">정확도</div><div class="v num" id="acc">100%</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+
        '<button class="btn" id="newgame" type="button">새 문장(F9)</button>'+
        '<span class="sub" style="color:var(--muted);font-size:11.5px">아래 문장을 그대로 입력하세요</span>'+
      '</div>'+
      '<div id="target" aria-live="polite" style="font-size:19px;line-height:1.9;padding:16px 18px;'+
        'background:var(--cell-bg);border:1px solid var(--grid-line);border-radius:6px;'+
        'box-shadow:var(--shadow);min-height:64px;letter-spacing:.3px"></div>'+
      '<label for="typed" class="sr-only">입력창</label>'+
      '<input id="typed" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false"'+
        ' aria-label="타자 입력창"'+
        ' style="width:100%;margin-top:12px;padding:11px 14px;font-size:17px;font-family:inherit;'+
        'border:1px solid var(--grid-line);border-radius:6px;background:var(--panel);color:var(--cell-fg)">'+
      '<div id="result" style="margin-top:12px;color:var(--muted);font-size:12.5px;min-height:18px"></div>';
    $('#newgame').addEventListener('click',next);
    const inp=$('#typed');
    inp.addEventListener('input',onInput);
    document.addEventListener('keydown',e=>{
      if(e.key==='Enter' && !window.DDANJIT.bossActive){ e.preventDefault(); next(); }
    });
    next();
  }

  function next(){
    target=SENTENCES[(Math.random()*SENTENCES.length)|0];
    startT=null; clearInterval(timer); timer=null;
    $('#typed').value=''; $('#typed').disabled=false;
    $('#result').textContent='';
    $('#cpm').textContent='0'; $('#acc').textContent='100%';
    paint('');
    $('#typed').focus();
    window.DDANJIT.setStatus('입력 대기', target.length);
  }

  function paint(typed){
    const host=$('#target');
    host.textContent='';
    for(let i=0;i<target.length;i++){
      const span=document.createElement('span');
      span.textContent=target[i];
      if(i<typed.length){
        if(typed[i]===target[i]){span.style.color='var(--good)';span.style.background='var(--good-bg)';}
        else{span.style.color='var(--bad)';span.style.background='var(--bad-bg)';span.style.borderRadius='2px';}
      } else if(i===typed.length){
        span.style.borderBottom='2px solid var(--accent)';
      } else {
        span.style.color='var(--muted)';
      }
      host.appendChild(span);
    }
  }

  function onInput(e){
    if(window.DDANJIT.bossActive){e.target.value='';return;}
    const typed=e.target.value;
    if(startT===null && typed.length>0){
      startT=performance.now();
      timer=setInterval(tick,250);
    }
    paint(typed);
    tick();
    if(typed.length>=target.length){ finish(typed); }
  }
  function stats(typed){
    let correct=0;for(let i=0;i<typed.length;i++)if(typed[i]===target[i])correct++;
    const acc = typed.length? Math.round(correct/typed.length*100):100;
    const mins = startT? (performance.now()-startT)/60000 : 0;
    const cpm = mins>0? Math.round(typed.length/mins):0;
    return {acc,cpm,correct};
  }
  function tick(){
    const s=stats($('#typed').value);
    $('#cpm').textContent=s.cpm;
    $('#acc').textContent=s.acc+'%';
    window.DDANJIT.setStatus(null, s.cpm);
  }
  function finish(typed){
    clearInterval(timer);timer=null;
    const s=stats(typed);
    $('#typed').disabled=true;
    $('#result').innerHTML='✅ 완료 — <b>'+s.cpm+' 타/분</b>, 정확도 <b>'+s.acc+'%</b>. '+
      '<button class="btn" id="againBtn" type="button" style="margin-left:8px;padding:4px 12px">다음 문장</button>';
    $('#againBtn').addEventListener('click',next);
    window.DDANJIT.setStatus('완료', s.cpm);
  }

  window.DDANJIT.register({ init: build });
})();
