# Jarvisboard 시스템 점검 보고서

> 점검일: 2026-05-15

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 기술 스택 | React 19 + TypeScript + Vite 8 + Tailwind 4 + Supabase |
| 페이지 구성 | 뉴스(`/`) / 주식(`/stock`) / 유튜브(`/youtube`) |
| 외부 API | Supabase, Polygon.io (차트), Finnhub (WebSocket 실시간 시세) |

---

## 🔴 Critical — 즉시 수정 필요

### 1. Supabase `service_role` 키가 프론트에 노출됨
- **파일**: `.env`
- **문제**: `VITE_SUPABASE_ANON_KEY`의 JWT를 디코딩하면 `"role":"service_role"` 임.
  `service_role` 키는 RLS(Row Level Security)를 완전히 우회하며, 모든 테이블에 관리자 권한으로 접근 가능.
  Vite 환경변수는 번들에 그대로 포함되어 누구나 브라우저 개발자 도구에서 추출 가능.
- **조치**: Supabase 대시보드에서 `anon` 키(공개용)로 교체. `service_role` 키는 서버(백엔드)에서만 사용.

---

## 🟠 High — 기능 미동작

### 2. 주식 차트·AI 분석 날짜 하드코딩
- **파일**: `src/hooks/useStockData.tsx`
- **문제**: `fetchChartData`와 `getAnalysisReports` 모두 날짜가 `"2026-03-23"`으로 고정되어 있어 항상 과거 데이터만 조회됨.
  ```ts
  // fetchChartData
  const url = `.../range/1/minute/2026-03-23/2026-03-24?...`

  // getAnalysisReports
  const targetDate = "2026-03-23";
  ```
- **조치**: `new Date()`로 오늘 날짜를 동적으로 계산하도록 수정.

### 3. `MyStockSummaryCards` 데이터 미연결
- **파일**: `src/pages/stock/MyStockSummaryCards.tsx`
- **문제**: 총 투자액 / 오늘 수익 / 보유 종목 / 총 수익률 4개 카드 모두 `-`만 표시됨. 실제 데이터 연결 코드 없음.
- **조치**: `useStockData` 또는 Supabase에서 실제 포트폴리오 데이터를 가져와서 연결 필요.

### 4. YouTube 변환기 백엔드 미구현
- **파일**: `src/pages/youtube/YoutubeDashboard.tsx`
- **문제**: `handleConvert` 함수가 `console.log`와 2초 대기 후 alert만 실행. 실제 API 호출 없음.
  ```ts
  // 실제 API 엔드포인트로 변경 필요 — 주석만 있고 구현 없음
  ```
- **조치**: 실제 변환 API 엔드포인트 연결 또는 미구현 상태 UI 표시 필요.

---

## 🟡 Medium — 버그 / 잠재적 문제

### 5. WebSocket 누수 — 소켓 정리 로직 없음
- **파일**: `src/hooks/useSocket.ts`
- **문제**: `socketInitialize`가 호출될 때마다 새 소켓을 생성하지만, 이전 소켓을 닫는 cleanup이 없음. `StrictMode`나 리렌더링 시 소켓이 중복 생성될 수 있음.
- **조치**: `useRef`로 소켓 인스턴스를 관리하고, `useEffect` cleanup에서 `socket.close()` 호출.

### 6. `Header`에서 `<a>` 태그 사용 (전체 페이지 리로드 발생)
- **파일**: `src/layouts/main/Header.tsx`
- **문제**: React Router 프로젝트에서 `<a href>` 를 사용하면 SPA 라우팅이 아닌 전체 페이지 리로드 발생.
- **조치**: `<a>` → React Router의 `<Link to>` 또는 `<NavLink>`로 교체.

### 7. `HoldingStockListCard` — 소켓 연결 전 빈 화면
- **파일**: `src/pages/stock/HoldingStockListCard.tsx`
- **문제**: `prices[symbol]`이 없으면 `return null`로 항목이 통째로 렌더링되지 않음. WebSocket 연결 전 포트폴리오 목록이 아무것도 표시되지 않음.
- **조치**: 로딩 스켈레톤 UI 또는 `—` 플레이스홀더 표시.

### 8. `open-graph-scraper` 브라우저에서 동작 불가
- **파일**: `src/pages/main/news/TodayNewsListCard.tsx`
- **문제**: `import ogs from "open-graph-scraper"` — `ogs`는 Node.js 전용 서버 패키지. 브라우저에서 실행 불가능. 현재는 import만 되어 있고 사용하지 않지만, 번들 사이즈를 증가시킴.
- **조치**: import 제거.

### 9. `App.tsx` — 미사용 import
- **파일**: `src/App.tsx`
- **문제**: `NewsCardContainer`를 직접 import하지만 `Routes` 안에서 사용하지 않음 (Index 페이지 내부에서 사용).
- **조치**: 해당 import 제거.

### 10. `StockChartCard` — 미사용 import
- **파일**: `src/pages/stock/StockChartCard.tsx`
- **문제**: `useStockData` import 후 사용하지 않음.
- **조치**: 해당 import 제거.

---

## 🔵 Low — 코드 품질

### 11. 디버그 `console.log` 다수 잔존
| 파일 | 내용 |
|------|------|
| `useStockData.tsx` | `console.log("qqwq")` |
| `NewsCardContainer.tsx` | `console.log(key)`, `console.log("data", data)` |
| `StockDashboard.tsx` | 미사용 변수 `start`, `end` (선언만 됨) |

### 12. TypeScript 타입 누락
- **파일**: `YoutubeDashboard.tsx` — `handleInputChange(index, value)` 파라미터 타입 없음
- **파일**: `StockChart.tsx` — echarts `formatter`의 `params` 타입 없음 (암묵적 `any`)

### 13. `superbase.ts` 파일명 오타
- **파일**: `src/service/superbase.ts`
- **문제**: `supabase`의 오타. 기능에는 영향 없으나 일관성 저해.
- **조치**: 파일명 → `supabase.ts`, import 경로 일괄 수정.

### 14. 뉴스 / 주식 페이지 디자인 테마 불일치
- 뉴스 페이지: `bg-slate-50` 라이트 테마
- 주식 페이지: `bg-white/5`, 글래스모피즘 다크 테마
- 조치: 프로젝트 전체 테마 방향 통일 필요.

---

## 작업 우선순위 요약

| 우선순위 | 항목 | 예상 공수 |
|---------|------|---------|
| 🔴 즉시 | Supabase `anon` 키로 교체 | 10분 |
| 🟠 이번주 | 날짜 하드코딩 제거 (동적 날짜) | 30분 |
| 🟠 이번주 | `MyStockSummaryCards` 데이터 연결 | 1~2시간 |
| 🟠 이번주 | WebSocket cleanup 추가 | 30분 |
| 🟡 다음주 | Header `<Link>` 교체 | 15분 |
| 🟡 다음주 | YouTube 백엔드 API 구현 or 미구현 표시 | 미정 |
| 🟡 다음주 | HoldingStockListCard 로딩 UI | 30분 |
| 🔵 여유시 | console.log 제거, 타입 보강, 파일명 오타 수정 | 1시간 |
