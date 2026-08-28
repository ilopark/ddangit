# 딴짓 스프레드시트 — 도메인 이전 작업 문서 (Runbook)

> **용도**: 나중에 커스텀 도메인을 구매하면, 이 파일을 Claude에게 그대로 주면서
> "이 문서대로 도메인 이전 진행해줘"라고 하면 바로 실행할 수 있도록 정리한 체크리스트.
> 기준 시점: 2026-08-29

---

## 0. 프로젝트 기준 정보 (현재 상태)

| 항목 | 값 |
|---|---|
| 로컬 경로 | `C:\dev\ddanjit` (폴더명은 ddan**j**it) |
| GitHub 저장소 | `github.com/ilopark/ddangit` (public, 폴더명과 철자 다름: ddan**g**it) |
| 브랜치 | `main` |
| 호스팅 | GitHub Pages (Deploy from branch: `main` / `/(root)`) |
| 현재 라이브 URL | `https://ilopark.github.io/ddangit/` |
| 코드에 박힌 베이스 URL 문자열 | `https://ilopark.github.io/ddangit` |
| git 리모트 | `https://ilopark@github.com/ilopark/ddangit.git` (개인계정 스코프, 푸시 시 계정선택 팝업 없음) |
| 커밋 identity | `-c user.email="frentree2@gmail.com" -c user.name="ilopark"` |
| GA4 측정 ID | `G-PTCZG9FSVN` (`assets/chrome.js` 5번째 줄 근처) — **변경 불필요, 유지** |
| Google Search Console | HTML 파일 방식으로 인증됨 (`googled00c0a3ec9201dc8.html`) |
| 네이버 | 미등록 (github.io 하위경로라 등록 불가 → 도메인 후 진행) |
| 애드센스 | 미삽입 (플레이스홀더만 있음) |

---

## 1. 도메인 구매 후 실행 순서

### STEP 1. DNS 설정 — **사용자가** 도메인 등록업체에서
새 도메인을 `NEWDOMAIN`(예: `ddangit.com`)이라 할 때:
- **apex(루트) 도메인**용 A 레코드 4개 → GitHub Pages IP:
  ```
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
  ```
- (선택) IPv6 AAAA 레코드:
  ```
  2606:50c0:8000::153
  2606:50c0:8001::153
  2606:50c0:8002::153
  2606:50c0:8003::153
  ```
- **www 서브도메인**을 쓸 경우: `CNAME www → ilopark.github.io`
- DNS 전파에 몇 분~수 시간 걸릴 수 있음.

### STEP 2. CNAME 파일 추가 — **Claude가**
- `C:\dev\ddanjit\CNAME` 파일 생성, 내용은 도메인만 (예: `ddangit.com`, `https`·슬래시 없이 한 줄).
- 커밋 & 푸시.
- 그 뒤 **사용자가** GitHub 저장소 → Settings → Pages → "Custom domain"에 도메인 입력 → Save →
  인증서 발급되면 "Enforce HTTPS" 체크.
- ⚠️ 커스텀 도메인을 붙이면 사이트가 **루트(`https://NEWDOMAIN/`)로 서빙**되고 `/ddangit/` 하위경로는 사라짐.

### STEP 3. 절대 URL 일괄 교체 — **Claude가**
- 교체 규칙: `https://ilopark.github.io/ddangit` → `https://NEWDOMAIN`
  (이렇게 하면 하위경로 `/ddangit`가 자연히 제거되어 루트 URL이 됨)
- 대상 파일 찾기:
  ```bash
  cd /c/dev/ddanjit && grep -rl "ilopark.github.io/ddangit" .
  ```
- 현재 기준 교체 대상:
  - `index.html`, `minesweeper.html`, `sudoku.html`, `typing.html`, `wordle.html` (canonical + og:url)
  - `about.html`, `privacy.html`, `office-games.html`, `no-install-games.html` (canonical + og:url)
  - `sitemap.xml` (모든 `<loc>`)
  - `robots.txt` (Sitemap 줄)
- **내부 상대링크(`assets/...`, `xxx.html`)는 건드리지 말 것** — 그대로 작동함.
- 교체 후 확인: `grep -rl "ilopark.github.io" .` → 결과 0이어야 함.

### STEP 4. 커밋 & 푸시 — **Claude가**
```bash
cd /c/dev/ddanjit && git add -A && \
git -c user.email="frentree2@gmail.com" -c user.name="ilopark" commit -q -m "도메인 이전: 절대 URL을 NEWDOMAIN으로 교체 + CNAME" && \
git push -q origin main
```

### STEP 5. Google Search Console — **사용자 + Claude**
- 새 속성 추가: `https://NEWDOMAIN/` (URL 접두어) 또는 도메인 속성.
- 소유확인: 구글이 주는 `googleXXXX.html` 파일을 **Claude가** 저장소 루트에 넣고 푸시 →
  사용자가 "확인" 클릭. (또는 DNS·GA 방식)
- 사이트맵 제출: `sitemap.xml`.
- 주요 페이지 색인 요청.
- ⚠️ 기존 github.io 속성은 그대로 둘 것 — GitHub이 옛 URL을 새 도메인으로 **자동 301 리다이렉트**해서 SEO가 승계됨.

### STEP 6. GA4 스트림 URL 수정 — **사용자**
- GA4 관리 → 데이터 스트림 → 스트림 URL을 새 도메인으로 수정.
- **측정 ID는 그대로 유지 → 코드 변경 없음.**

### STEP 7. 네이버 서치어드바이저 등록 — **사용자 + Claude**
- 이제 호스트 = 새 도메인이라 등록 가능.
- `https://NEWDOMAIN/` 등록 → 소유확인 파일/메타를 **Claude가** 넣음 → 사이트맵 제출.

### STEP 8. 애드센스 연동 — **사용자 (승인 후 Claude가 코드 삽입)**
- 애드센스에 새 도메인 추가 → 사이트 심사 신청.
- 승인되면 광고 코드 삽입:
  - 게시자 스크립트: 각 HTML `<head>`의 애드센스 주석 위치 (또는 `assets/chrome.js`)에서
    `ca-pub-XXXXXXXX`를 실제 게시자 ID로 교체.
  - `.ad` 플레이스홀더 슬롯(`class="ad ..."` `광고 · Advertisement`)을 실제 광고 유닛으로 교체.

### STEP 9. 검증 — **Claude가**
```bash
for u in "" minesweeper.html sudoku.html typing.html wordle.html about.html privacy.html office-games.html no-install-games.html sitemap.xml robots.txt; do
  echo "$u -> $(curl -s -o /dev/null -w '%{http_code}' https://NEWDOMAIN/$u)"
done
```
- 모두 200 확인, canonical이 새 도메인인지, GA hit 나가는지 확인.

---

## 2. 변경되지 않는 것 (안심 목록)
- 내부 상대 링크 전부 (`assets/*`, `*.html`)
- 게임 로직 / CSS / 기능 전체
- GA4 측정 ID (`G-PTCZG9FSVN`)
- favicon, 테마, localStorage 키

---

## 3. 도메인과 별개로 아직 남아있는 TODO
- [ ] **애드센스 광고 코드 삽입** (현재 플레이스홀더) — 도메인+승인 후
- [ ] (선택) **문의/연락 수단** — 애드센스가 요구하면 간단한 폼/이메일 재추가 (현재 제거됨)
- [ ] (선택) 게임 공략 아티클(B 유형) 추가로 콘텐츠 보강
- [ ] 커뮤니티 공유로 초기 트래픽 시딩

---

## 4. 자주 쓰는 명령 모음
```bash
# 로컬 프리뷰 (Claude: preview_start name "ddanjit" 사용 권장)
cd /c/dev/ddanjit

# 베이스 URL이 박힌 곳 찾기
grep -rl "ilopark.github.io" .

# 커밋 & 푸시 (개인계정, 팝업 없음)
git add -A && git -c user.email="frentree2@gmail.com" -c user.name="ilopark" commit -q -m "메시지" && git push -q origin main

# 배포 확인
curl -s -o /dev/null -w "%{http_code}\n" https://ilopark.github.io/ddangit/
```
