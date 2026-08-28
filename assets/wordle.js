/* wordle.js — 한글 워들 (KPI 시트). 3글자 · 무제한 시도 */
(function(){
  "use strict";
  const WORDS=[
    "아이스","컴퓨터","냉장고","무지개","도서관","자전거","고양이","강아지","비행기","코끼리",
    "바나나","선생님","운동화","계산기","사무실","보고서","프린터","지하철","라디오","카메라",
    "떡볶이","불고기","회의실","월요일","화요일","수요일","목요일","금요일","보너스","마우스",
    "키보드","모니터","노트북","충전기","이어폰","세탁기","청소기","에어컨","선풍기","백화점",
    "편의점","미용실","주차장","정류장","신호등","아파트","운동장","놀이터","수영장","미술관",
    "박물관","동물원","식물원","우체국","경찰서","소방차","구급차","자동차","잠수함","우주선",
    "무궁화","진달래","개나리","봉숭아","민들레","소나무","도토리","다람쥐","너구리","원숭이",
    "거북이","두꺼비","개구리","올챙이","잠자리","메뚜기","사마귀","지렁이","달팽이","비빔밥",
    "볶음밥","된장국","순두부","갈비탕","설렁탕","삼계탕","바닐라","초콜릿","목걸이","귀걸이",
    "슬리퍼","티셔츠","목도리","지우개","색연필","책가방","숟가락","젓가락","주전자","리모컨",
    "스피커","헤드폰","마이크","손전등","건전지","배터리","장우산","자물쇠","손잡이","형광등",
    "스위치","담벼락","바닷가","갈매기","산책로","오솔길","지름길","소나기","이슬비","함박눈",
    "아침밥","점심밥","저녁밥","일요일","결혼식","졸업식","입학식","케이크","우체통","기차역",
    "승용차","운전사","승무원","조종사","회사원","공무원","요리사","미용사","간호사","변호사",
    "교수님","학생증","운동회","체육복","줄넘기","축구공","농구공","야구공","배구공","탁구채",
    "피아노","플루트","실로폰","계산대","분식집","장난감","인형극","종이배","손수건","김밥집"
  ];
  const $=(s)=>document.querySelector(s);
  const LEN=3, KEY="ddanjit-wordle-best";
  let answer="", tries=0, solved=false, best=0;

  function build(){
    try{best=+localStorage.getItem(KEY)||0;}catch(e){}
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">시도</div><div class="v num" id="tries">0</div></div>'+
      '<div class="stat"><div class="k">최소 기록</div><div class="v num" id="best">'+(best||'-')+'</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+
        '<button class="btn" id="newgame" type="button">새 단어(F9)</button>'+
        '<span class="sub" style="color:var(--muted);font-size:11.5px">정답을 맞힐 때까지 몇 번이든 도전하세요</span>'+
      '</div>'+
      '<div class="board" id="wb" role="grid" aria-label="워들 판"'+
        ' style="grid-template-columns:repeat(3,60px);grid-auto-rows:60px;min-height:2px"></div>'+
      '<form id="wform" style="margin-top:12px;display:flex;gap:8px;max-width:360px">'+
        '<label for="win" class="sr-only">단어 입력</label>'+
        '<input id="win" type="text" maxlength="3" autocomplete="off" spellcheck="false"'+
          ' inputmode="text" aria-label="세 글자 단어 입력"'+
          ' style="flex:1;padding:10px 14px;font-size:18px;font-family:inherit;text-align:center;'+
          'letter-spacing:12px;border:1px solid var(--grid-line);border-radius:6px;'+
          'background:var(--panel);color:var(--cell-fg)">'+
        '<button class="btn" type="submit">입력</button>'+
      '</form>'+
      '<div id="msg" aria-live="polite" style="margin-top:10px;color:var(--muted);font-size:12.5px;min-height:18px"></div>'+
      '<div class="banner" id="banner" role="status" aria-live="polite"><div class="box"><h3 id="bt">-</h3><p id="bm"></p>'+
        '<button class="btn" id="bb" type="button">새 단어</button></div></div>';
    $('#wform').addEventListener('submit',submit);
    $('#newgame').addEventListener('click',reset);
    $('#bb').addEventListener('click',reset);
    reset();
  }

  function reset(){
    answer=WORDS[(Math.random()*WORDS.length)|0];
    tries=0; solved=false;
    $('#wb').innerHTML='';
    $('#tries').textContent='0';
    $('#msg').textContent='';
    $('#banner').classList.remove('show');
    const inp=$('#win'); inp.value=''; inp.disabled=false; inp.focus();
    window.DDANJIT.setStatus('입력 대기', 0);
  }

  function evaluate(guess){
    const res=new Array(LEN).fill('gray');
    const ans=[...answer], g=[...guess], used=new Array(LEN).fill(false);
    for(let i=0;i<LEN;i++){ if(g[i]===ans[i]){res[i]='green';used[i]=true;} }
    for(let i=0;i<LEN;i++){
      if(res[i]==='green')continue;
      for(let j=0;j<LEN;j++){ if(!used[j]&&g[i]===ans[j]){res[i]='yellow';used[j]=true;break;} }
    }
    return res;
  }

  function appendRow(guess,res){
    const wb=$('#wb'), g=[...guess];
    for(let c=0;c<LEN;c++){
      const cell=document.createElement('div');
      cell.className='cell'; cell.setAttribute('role','gridcell');
      cell.style.cssText+='font-size:26px;font-weight:700';
      cell.textContent=g[c];
      if(res[c]==='green'){cell.style.background='var(--good)';cell.style.color='#fff';}
      else if(res[c]==='yellow'){cell.style.background='var(--warn)';cell.style.color='#fff';}
      else{cell.style.background='var(--head-bg)';cell.style.color='var(--muted)';}
      wb.appendChild(cell);
    }
  }

  function submit(e){
    e.preventDefault();
    if(solved||window.DDANJIT.bossActive)return;
    const inp=$('#win');
    const guess=[...inp.value].slice(0,LEN).join('');
    if([...guess].length!==LEN){ msg('세 글자를 입력하세요'); return; }
    if(!/^[가-힣]{3}$/.test(guess)){ msg('한글 세 글자만 가능합니다'); return; }
    const res=evaluate(guess);
    appendRow(guess,res);
    tries++;
    $('#tries').textContent=tries;
    inp.value=''; inp.focus();
    window.DDANJIT.setStatus(null, tries);
    // 방금 행이 보이도록 스크롤
    $('#wb').lastElementChild.scrollIntoView({block:'nearest'});
    if(res.every(r=>r==='green')){
      solved=true; inp.disabled=true;
      if(!best || tries<best){ best=tries; try{localStorage.setItem(KEY,best);}catch(err){} $('#best').textContent=best; }
      banner('정답! 🎉','"'+answer+'" — '+tries+'번 만에 맞혔어요');
      window.DDANJIT.setStatus('정답',tries);
    }
  }
  function msg(t){ $('#msg').textContent=t; setTimeout(()=>{if($('#msg').textContent===t)$('#msg').textContent='';},1800); }
  function banner(t,m){ $('#bt').textContent=t; $('#bm').textContent=m; $('#banner').classList.add('show'); }

  window.DDANJIT.register({ init: build });
})();
