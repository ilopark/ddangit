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
    "typing fast is nice but typing accurately is better.",
    // 추가 업무 톤
    "출장 일정이 확정되어 관련 내용을 공유드립니다.",
    "이번 프로젝트의 진행 상황을 간단히 보고드립니다.",
    "요청하신 수정 사항을 반영하여 다시 보내드립니다.",
    "회의 참석이 어려우시면 대리 참석을 부탁드립니다.",
    "월말 정산 자료는 금요일까지 제출 바랍니다.",
    "신규 입사자 교육 일정을 아래와 같이 안내드립니다.",
    "재고 현황을 확인하여 발주 여부를 결정하겠습니다.",
    "고객사 미팅은 예정대로 진행될 예정입니다.",
    "보고서 마감일이 하루 앞당겨진 점 양해 부탁드립니다.",
    "결과가 나오는 대로 별도로 안내드리겠습니다.",
    "첨부 파일이 열리지 않으면 다시 보내드리겠습니다.",
    "부재중이라 이제야 메일을 확인하였습니다.",
    "다음 안건으로 넘어가기 전에 질문을 받겠습니다.",
    "예정된 점검으로 잠시 시스템이 중단될 수 있습니다.",
    "협력 업체 선정 기준을 다시 검토하고 있습니다.",
    "이번 달 목표를 무사히 달성하여 기쁩니다.",
    "인수인계 자료를 정리하여 전달드리겠습니다.",
    "회신이 늦어진 점 진심으로 사과드립니다.",
    "예산안은 다음 회의에서 최종 승인될 예정입니다.",
    "관련 규정을 확인한 뒤 다시 말씀드리겠습니다.",
    // 추가 일상 문장
    "아침 일찍 일어나면 하루가 훨씬 길게 느껴집니다.",
    "겨울이 지나면 반드시 따뜻한 봄이 찾아옵니다.",
    "물 한 잔을 마시며 잠시 숨을 고릅니다.",
    "좋은 음악은 지친 마음을 부드럽게 달래 줍니다.",
    "웃음은 어떤 약보다도 좋은 명약이라고 합니다.",
    "천천히 걸으면 보이지 않던 풍경이 보입니다.",
    "오늘 못한 일은 내일 다시 시작하면 됩니다.",
    "작은 친절이 세상을 조금 더 따뜻하게 합니다.",
    "책상 위를 정리하면 마음도 함께 정돈됩니다.",
    "새로운 도전은 설렘과 두려움을 동시에 줍니다.",
    "실수를 두려워하면 아무것도 배울 수 없습니다.",
    "하루에 한 페이지씩 읽어도 일 년이면 큰 책이 됩니다.",
    "바람이 선선하게 부는 가을 저녁이 좋습니다.",
    "함께 먹는 밥은 혼자 먹는 밥보다 맛있습니다.",
    "계획을 세우는 것만으로도 절반은 이룬 셈입니다.",
    "밤하늘의 별을 보며 조용히 소원을 빌어 봅니다.",
    "오래 걸어도 목적지가 있으면 지치지 않습니다.",
    "낯선 길을 걷는 것도 여행의 큰 즐거움입니다.",
    "따뜻한 국물 한 그릇이 추위를 녹여 줍니다.",
    "일과 휴식의 균형이 오래가는 비결입니다.",
    "진심은 언젠가 반드시 전해지기 마련입니다.",
    "매일 조금씩 나아지는 사람이 되고 싶습니다.",
    "고요한 아침 공기가 머리를 맑게 해 줍니다.",
    "포기하지 않는 사람에게 기회가 찾아옵니다.",
    "정성을 다한 일은 결과가 달라 보입니다.",
    "느리더라도 멈추지 않으면 결국 도착합니다.",
    "좋아하는 일을 할 때 시간은 빠르게 흐릅니다.",
    "작은 성취들이 모여 큰 자신감이 됩니다.",
    "충분한 잠은 최고의 컨디션을 만들어 줍니다.",
    "오늘도 무사히 하루를 마칠 수 있어 감사합니다.",
    // 추가 영문
    "the sun rises in the east and sets in the west.",
    "keep your eyes on the goal and never look back.",
    "every expert was once a complete beginner too.",
    "a journey of a thousand miles begins with one step.",
    "slow and steady progress wins the long race."
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
