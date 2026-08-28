// 아티클 AI 냄새 검사 — 사람이 안 쓰는 패턴을 기계로 잡는다.
//
// 실행:  node tools/smell.cjs                 전체 html
//        node tools/smell.cjs office-games.html
//
// ★ 왜 이런 검사가 필요한가
//   AI 가 쓴 글은 문장 하나하나가 틀리지 않는다. 걸리는 건 "전체가 너무 반듯한 것" 이다.
//   조건 4개 → 항목 5개 → 팁 4개 → 정리. 항목마다 같은 길이, 같은 문형, 같은 평가어.
//   그래서 개별 문장이 아니라 구조와 반복을 본다.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// 법적 고지는 번호를 매기는 게 정상이고 문단이 고른 것도 정상이다. 구조 검사에서 뺀다.
const LEGAL = ['privacy.html'];

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !f.startsWith('google'));

// 1) 상투구 — 글이 자기를 설명하거나 마무리를 선언하는 말
const CLICHE = [
  '이 글에서는', '정리했습니다', '알아보겠습니다', '살펴보겠습니다', '소개하겠습니다',
  '결론적으로', '요약하자면', '종합하면', '지금까지', '뿐만 아니라', '더 나아가',
  '이 핵심입니다', '가 핵심입니다', '중요합니다만', '여러분', '~하시기 바랍니다',
];

// 2) 무색무취 평가어 — 하나만 있으면 괜찮은데 반복되면 티가 난다
const BLAND = ['하기 좋습니다', '딱 좋습니다', '무난합니다', '추천합니다', '좋은 선택입니다', '유용합니다'];

const strip = (s) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

let bad = 0;
for (const f of files) {
  const p = path.join(ROOT, path.basename(f));
  if (!fs.existsSync(p)) { console.log(`  ${f} — 파일 없음`); continue; }
  const html = fs.readFileSync(p, 'utf8');
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [''])[0];
  if (!main) continue;
  const text = strip(main);
  const issues = [];
  const legal = LEGAL.includes(path.basename(f));

  for (const w of CLICHE) if (text.includes(w)) issues.push(`상투구 "${w}"`);
  for (const w of BLAND) {
    const n = (text.split(w).length - 1);
    if (n >= 3) issues.push(`평가어 "${w}" ${n}회 (3회 이상이면 반복으로 읽힙니다)`);
  }

  // 3) 넘버링 부제 — "1. 이름 — 설명" 이 세 개 이상이면 템플릿이다
  const numbered = (main.match(/<h[23]>\s*\d+\.\s/g) || []).length;
  if (!legal && numbered >= 3) issues.push(`번호 붙은 소제목 ${numbered}개 (목록을 그대로 소제목으로 쓴 모양)`);

  // 4) 소제목 길이가 전부 비슷하면 기계로 찍은 것이다
  const heads = [...main.matchAll(/<h2>(.*?)<\/h2>/g)].map((x) => strip(x[1]).length);
  if (heads.length >= 4) {
    const mean = heads.reduce((a, b) => a + b, 0) / heads.length;
    const sd = Math.sqrt(heads.reduce((a, b) => a + (b - mean) ** 2, 0) / heads.length);
    const cv = mean ? sd / mean : 0;
    if (!legal && cv < 0.18) issues.push(`소제목 길이 변동계수 ${cv.toFixed(2)} (0.18 미만이면 다 비슷한 길이입니다)`);
  }

  // 5) 문단 길이도 마찬가지
  const ps = [...main.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((x) => strip(x[1]).length).filter((n) => n > 20);
  if (ps.length >= 5) {
    const mean = ps.reduce((a, b) => a + b, 0) / ps.length;
    const sd = Math.sqrt(ps.reduce((a, b) => a + (b - mean) ** 2, 0) / ps.length);
    const cv = mean ? sd / mean : 0;
    if (!legal && cv < 0.30) issues.push(`문단 길이 변동계수 ${cv.toFixed(2)} (0.30 미만이면 너무 고릅니다)`);
  }

  // 6) 목록 항목이 전부 "굵은 말 — 설명" 형태면 틀에 부은 것이다
  const li = [...main.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => x[1]);
  const dashed = li.filter((s) => /—|&mdash;/.test(s)).length;
  if (li.length >= 4 && dashed === li.length) issues.push(`목록 ${li.length}개가 전부 "말 — 설명" 형식`);

  const tag = issues.length ? '★' : ' ';
  console.log(`${tag} ${path.basename(f).padEnd(24)} 본문 ${String(text.length).padStart(5)}자 · h2 ${heads.length}개`);
  issues.forEach((s) => console.log(`     ${s}`));
  if (issues.length) bad++;
}

// ── 게임 목록이 낡았는지 ────────────────────────────────────────────────
//
// ★ 게임을 추가하면 아티클을 같이 고쳐야 하는데 그걸 매번 잊는다.
//   실측 2026-08-29: 게임이 5개에서 10개로 늘어난 동안 아티클 두 편과 index·about 은
//   그대로 5개만 소개하고 있었다. 제목에 "추천 5선" 이 박혀 있었던 것도 같은 이유다.
//   그래서 제목에 개수를 쓰지 않기로 했고, 누락은 여기서 잡는다.
const NOT_GAME = ['about.html', 'privacy.html', 'index.html', 'office-games.html',
  'no-install-games.html'];
const listPages = ['index.html', 'about.html', 'office-games.html', 'no-install-games.html'];

// 게임 이름은 각 페이지의 h1 에서 뽑는다. 괄호 앞까지가 대표 이름이다.
//   "소코반 (창고지기)" → 소코반,  "네모네모로직 (노노그램)" → 네모네모로직
// 아티클은 링크가 아니라 본문에서 이름으로 언급하므로 이름으로 대조한다.
const games = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && !f.startsWith('google') && !f.startsWith('guide-'))
  .filter((f) => !NOT_GAME.includes(f))
  .map((f) => {
    const h1 = (fs.readFileSync(path.join(ROOT, f), 'utf8').match(/<h1[^>]*>([^<]+)<\/h1>/) || [])[1] || '';
    // 뒤에 붙는 일반어는 뗀다. "지뢰찾기 온라인" 은 아티클에서 "지뢰찾기" 로 부른다.
    const raw = h1.split('(')[0].trim().replace(/s*(온라인|게임|무료)$/, '').trim();
    return { file: f, name: raw || f.replace('.html', '') };
  })
  .filter((g) => g.name);

// index.html 은 2048 을 자기 화면에 띄우므로 그 이름도 게임 목록에 넣는다.
if (!games.some((g) => g.name === '2048')) games.push({ file: 'index.html', name: '2048' });

console.log('');
console.log(`게임 ${games.length}개 — 목록 반영 여부`);
let stale = 0;
for (const p of listPages) {
  const fp = path.join(ROOT, p);
  if (!fs.existsSync(fp)) continue;
  const src = fs.readFileSync(fp, 'utf8');
  const miss = games.filter((g) => !src.includes(g.name));
  if (miss.length) { stale++; console.log(`★ ${p.padEnd(24)} 빠진 게임 ${miss.length}개 — ${miss.map((g) => g.name).join(' · ')}`); }
  else console.log(`  ${p.padEnd(24)} ${games.length}개 전부 반영`);
}

// 제목에 개수를 박으면 게임을 추가할 때마다 낡는다.
for (const p of listPages) {
  const src = fs.existsSync(path.join(ROOT, p)) ? fs.readFileSync(path.join(ROOT, p), 'utf8') : '';
  const m = src.match(/<title>([^<]*)<\/title>/);
  if (m && /\d+\s*(선|가지|개)/.test(m[1])) { stale++; console.log(`★ ${p} 제목에 개수가 박혀 있습니다 — "${m[1].trim()}"`); }
}

console.log('');
console.log(`${files.length}개 검사 · 냄새 ${bad}개 · 목록 낡음 ${stale}개`);
process.exit(bad || stale ? 1 : 0);
