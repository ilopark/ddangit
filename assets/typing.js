/* typing.js — 타자연습 (요약 시트) */
(function(){
  "use strict";
  const SENTENCES=[
    // 업무/이메일 톤 (위장 컨셉)
    "이번 분기 실적은 전년 대비 12퍼센트 성장하였습니다.",
    "첨부된 자료를 검토하신 후 회신 부탁드립니다.",
    "다음 주 화요일 오후 세시에 회의를 진행하겠습니다.",
    "고객 만족도 조사 결과를 요약하여 보고드립니다.",
    "예산 초과 항목에 대한 검토가 필요한 상황입니다.",
    "빠른 시일 내에 처리하여 다시 연락드리겠습니다.",
    "관련 부서와 협의하여 최종안을 확정하겠습니다.",
    "말씀하신 일정에 맞추어 준비하도록 하겠습니다.",
    "회의록은 오늘 중으로 정리하여 공유드리겠습니다.",
    "요청하신 견적서를 메일로 발송해 드렸습니다.",
    "담당자 확인 후 이번 주 안으로 회신 드리겠습니다.",
    "해당 건은 내부 검토를 거쳐 다시 안내드리겠습니다.",
    "일정 변경이 필요하시면 미리 알려 주시기 바랍니다.",
    "지난 회의에서 논의된 사항을 다시 정리하였습니다.",
    "계약서 초안을 보내드리니 검토 부탁드립니다.",
    "다음 달 워크숍 장소와 일정을 공지드립니다.",
    "매출 자료는 첨부한 파일을 참고해 주시기 바랍니다.",
    "결재가 완료되는 대로 즉시 진행하도록 하겠습니다.",
    "협조해 주셔서 진심으로 감사드립니다.",
    "추가로 필요한 자료가 있으면 언제든 요청해 주세요.",
    // 일상/연습 문장
    "천 리 길도 한 걸음부터 시작된다고 합니다.",
    "오늘 하루도 즐겁고 보람차게 보내시길 바랍니다.",
    "가는 말이 고와야 오는 말이 곱다는 속담이 있습니다.",
    "꾸준히 연습하면 타자 속도는 반드시 빨라집니다.",
    "작은 습관 하나가 큰 변화를 만들어 냅니다.",
    "봄이 오면 벚꽃이 거리마다 흐드러지게 핍니다.",
    "맑은 하늘 아래에서 산책을 하니 기분이 좋아집니다.",
    "책을 읽는 시간은 마음을 살찌우는 좋은 습관입니다.",
    "커피 한 잔의 여유가 오후를 든든하게 만들어 줍니다.",
    "실패는 성공으로 가는 과정의 일부일 뿐입니다.",
    "서두르지 말고 정확하게 입력하는 연습이 중요합니다.",
    "노력은 결코 배신하지 않는다는 말을 믿습니다.",
    "친구와 함께 나누는 대화는 언제나 즐겁습니다.",
    "건강한 몸에 건강한 정신이 깃든다고 합니다.",
    "여행은 새로운 세상을 만나는 가장 좋은 방법입니다.",
    "비 온 뒤에 땅이 더욱 단단하게 굳어집니다.",
    "감사하는 마음은 삶을 더욱 풍요롭게 만듭니다.",
    "지금 이 순간에 집중하는 것이 가장 중요합니다.",
    "따뜻한 말 한마디가 누군가에게 큰 힘이 됩니다.",
    "정직함은 오래갈수록 빛을 발하는 미덕입니다.",
    // 영문 연습
    "the quick brown fox jumps over the lazy dog every morning.",
    "practice makes perfect when you keep trying every day.",
    "a smooth sea never made a skilled sailor after all.",
    "good things come to those who keep working hard.",
    "typing fast is nice but typing accurately is better."
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
