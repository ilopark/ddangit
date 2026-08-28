/* wordle.js — 한글 워들 (KPI 시트). 3글자 음절 단위 */
(function(){
  "use strict";
  const WORDS=["아이스","컴퓨터","냉장고","무지개","해바라","도서관","자전거","고양이","강아지","비행기",
    "코끼리","바나나","선생님","친구들","운동화","계산기","사무실","보고서","프린터","커피숍",
    "지하철","엘리베","텔레비","라디오","카메라","냉면집","떡볶이","김치찌","순두부","불고기",
    "회의실","출근길","점심때","월요일","금요일","연차비","보너스","야근중","퇴근후","사장님",
    "스프레","엑셀표","데이터","마우스","키보드","모니터","노트북","충전기","이어폰","블루투"];
  const $=(s)=>document.querySelector(s);
  const LEN=3, TRIES=6;
  let answer="", row=0, over=false;

  function build(){
    $('#scorebox').innerHTML=
      '<div class="stat"><div class="k">기회</div><div class="v num" id="left">6</div></div>'+
      '<div class="stat"><div class="k">글자</div><div class="v num">3</div></div>';
    $('#play').innerHTML=
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+
        '<button class="btn" id="newgame" type="button">새 단어(F9)</button>'+
        '<span class="sub" style="color:var(--muted);font-size:11.5px">세 글자 단어를 입력하고 Enter</span>'+
      '</div>'+
      '<div class="board" id="board" role="grid" aria-label="워들 판"'+
        ' style="grid-template-columns:repeat(3,64px);grid-template-rows:repeat(6,64px)"></div>'+
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
    const b=$('#board');
    for(let i=0;i<LEN*TRIES;i++){
      const c=document.createElement('div');
      c.className='cell';c.setAttribute('role','gridcell');
      c.style.cssText+='font-size:28px;font-weight:700;background:var(--cell-bg)';
      b.appendChild(c);
    }
    $('#wform').addEventListener('submit',submit);
    $('#win').addEventListener('input',preview);
    $('#newgame').addEventListener('click',reset);
    $('#bb').addEventListener('click',reset);
    reset();
  }

  function cell(r,c){return $('#board').children[r*LEN+c];}
  function reset(){
    answer=WORDS[(Math.random()*WORDS.length)|0];
    row=0;over=false;
    for(let i=0;i<LEN*TRIES;i++){const c=$('#board').children[i];c.textContent='';c.style.background='var(--cell-bg)';c.style.color='var(--cell-fg)';c.style.borderColor='var(--grid-line)';}
    $('#left').textContent=TRIES;
    $('#msg').textContent='';
    $('#banner').classList.remove('show');
    const inp=$('#win');inp.value='';inp.disabled=false;inp.focus();
    window.DDANJIT.setStatus('입력 대기', TRIES);
  }
  function preview(e){
    if(window.DDANJIT.bossActive){e.target.value='';return;}
    const v=[...e.target.value].slice(0,LEN);
    for(let c=0;c<LEN;c++){ cell(row,c).textContent = v[c]||''; }
  }
  function evaluate(guess){
    // 표준 2-패스: green 우선, 그 다음 yellow
    const res=new Array(LEN).fill('gray');
    const ansArr=[...answer], gArr=[...guess];
    const used=new Array(LEN).fill(false);
    for(let i=0;i<LEN;i++){ if(gArr[i]===ansArr[i]){res[i]='green';used[i]=true;} }
    for(let i=0;i<LEN;i++){
      if(res[i]==='green')continue;
      for(let j=0;j<LEN;j++){ if(!used[j]&&gArr[i]===ansArr[j]){res[i]='yellow';used[j]=true;break;} }
    }
    return res;
  }
  function submit(e){
    e.preventDefault();
    if(over||window.DDANJIT.bossActive)return;
    const inp=$('#win');
    const guess=[...inp.value].slice(0,LEN).join('');
    if([...guess].length!==LEN){ msg('세 글자를 입력하세요'); return; }
    if(!/^[가-힣]{3}$/.test(guess)){ msg('한글 세 글자만 가능합니다'); return; }
    const res=evaluate(guess);
    const gArr=[...guess];
    for(let c=0;c<LEN;c++){
      const cel=cell(row,c);
      cel.textContent=gArr[c];
      if(res[c]==='green'){cel.style.background='var(--good)';cel.style.color='#fff';cel.style.borderColor='var(--good)';}
      else if(res[c]==='yellow'){cel.style.background='var(--warn)';cel.style.color='#fff';cel.style.borderColor='var(--warn)';}
      else{cel.style.background='var(--head-bg)';cel.style.color='var(--muted)';}
    }
    row++;
    $('#left').textContent=TRIES-row;
    inp.value='';
    window.DDANJIT.setStatus(null, TRIES-row);
    if(res.every(r=>r==='green')){ over=true;inp.disabled=true;banner('정답! 🎉','오늘의 단어: '+answer+' ('+row+'번 만에)'); window.DDANJIT.setStatus('정답',0); }
    else if(row>=TRIES){ over=true;inp.disabled=true;banner('아쉽네요','정답은 "'+answer+'" 였습니다'); }
  }
  function msg(t){$('#msg').textContent=t;setTimeout(()=>{if($('#msg').textContent===t)$('#msg').textContent='';},1800);}
  function banner(t,m){$('#bt').textContent=t;$('#bm').textContent=m;$('#banner').classList.add('show');}

  window.DDANJIT.register({ init: build });
})();
