# JarvisBoard — Claude Code 프로젝트 가이드

## 프로젝트 개요

**JarvisBoard**는 React 19 + Vite + TypeScript 기반 개인 금융 대시보드다.  
뉴스 요약, 주식 포트폴리오, YouTube 영상 분석 세 가지 섹션으로 구성된다.

- **라우팅**: `/` (뉴스), `/stock` (주식), `/youtube` (YouTube)
- **백엔드**: Supabase (데이터베이스 + 인증)
- **실시간 데이터**: WebSocket (주식 가격)

---

## 기술 스택

| 분류 | 라이브러리 | 버전 |
|------|-----------|------|
| 프레임워크 | React | 19.2.4 |
| 빌드 | Vite | 8.0.1 |
| 언어 | TypeScript | 5.9.3 |
| 스타일 | Tailwind CSS | 4.2.2 |
| UI 컴포넌트 | shadcn/ui (radix-nova) | — |
| 헤드리스 UI | Radix UI | 1.4.3 |
| 아이콘 | Lucide React | 0.577.0 |
| 차트 | ECharts + echarts-for-react | 6.0.0 |
| 라우터 | react-router-dom | 7.13.2 |
| DB | Supabase JS | 2.99.3 |

---

## 디렉토리 구조

```
src/
├── components/ui/     # 공용 UI 프리미티브 (Button, Card, Badge 등)
├── hooks/             # 커스텀 훅 (useStockData, useSocket)
├── layouts/main/      # 레이아웃 (MainLayout, Header)
├── lib/               # 유틸리티 (cn() 함수)
├── pages/
│   ├── main/          # 뉴스 페이지 (/)
│   ├── stock/         # 주식 페이지 (/stock)
│   └── youtube/       # YouTube 페이지 (/youtube)
├── service/           # API / Supabase 클라이언트
└── assets/            # 정적 에셋
```

---

## 코딩 컨벤션

### 파일 및 컴포넌트 명명

- **컴포넌트 파일**: PascalCase (`StockDashboard.tsx`, `TodayNewsListCard.tsx`)
- **훅 파일**: camelCase, `use` 접두사 (`useStockData.tsx`, `useSocket.ts`)
- **서비스/유틸**: camelCase (`supabase.ts`, `utils.ts`)
- **export 방식**: Named export 사용 (default export 지양, 단 페이지 컴포넌트는 허용)

### Import 순서

```typescript
// 1. React
import * as React from "react"

// 2. 외부 라이브러리
import { cva } from "class-variance-authority"
import { Lucide 아이콘 } from "lucide-react"

// 3. 내부 절대경로 (@/ 앨리어스)
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

// 4. 상대경로 (같은 디렉토리)
import { SomeHelper } from "./helpers"
```

### 스타일링 규칙

- **Tailwind 클래스** 우선 사용; 인라인 style 속성 금지
- 조건부 클래스는 반드시 `cn()` 유틸리티 사용 (`src/lib/utils.ts`)
- 컴포넌트 variant는 CVA(`class-variance-authority`) 패턴 사용
- 절대 임의 색상 하드코딩 금지 — 반드시 CSS 변수 토큰 사용

```typescript
// 올바른 방법
<div className={cn("bg-card text-card-foreground", isActive && "ring-2 ring-primary")} />

// 금지
<div style={{ backgroundColor: '#16171d' }} />
<div className="bg-[#16171d]" />  // 디자인 토큰이 있는 색상은 금지
```

### 라우팅

- 내부 페이지 이동 시 반드시 `<Link>` (react-router-dom) 사용
- `<a href>` 태그는 외부 링크(`target="_blank"`)에만 허용

```typescript
// 올바른 방법
import { Link } from "react-router-dom"
<Link to="/stock">주식</Link>

// 금지 (전체 페이지 리로드 발생)
<a href="/stock">주식</a>
```

### TypeScript

- 모든 props, 반환값에 명시적 타입 선언
- `any` 타입 사용 금지; 불가피한 경우 `unknown` + 타입 가드 사용
- 컴포넌트 props는 interface로 정의

---

## 디자인 시스템 핵심 규칙

> 상세 내용은 `DESIGN_SYSTEM.md` 참조

### 테마

- 다크/라이트 **모두 지원** — `.dark` 클래스 기반 토글
- 테마 무관 스타일링: 반드시 CSS 변수 토큰(`--background`, `--foreground` 등) 사용
- 신규 페이지는 반드시 다크/라이트 양쪽 테스트 필수

### 컴포넌트 사용 원칙

- 새 UI 요소 추가 전 `src/components/ui/` 기존 컴포넌트 확인
- Card 중첩 금지 (Card 안에 Card 금지)
- shadcn/ui 컴포넌트를 직접 수정하지 말고 className prop으로 확장

### 컬러 토큰 사용

```typescript
// 시맨틱 토큰 우선 사용
bg-background        // 페이지 배경
bg-card              // 카드 배경
text-foreground      // 기본 텍스트
text-muted-foreground // 보조 텍스트
bg-primary           // 주요 액션
bg-destructive       // 위험/삭제 액션
border-border        // 테두리
```

---

## 주요 금지 사항

| 금지 | 이유 | 대안 |
|------|------|------|
| `service_role` Supabase 키를 프런트엔드에 노출 | 보안 취약점 | `anon` 키만 사용 |
| 날짜 하드코딩 (`"2026-03-23"`) | 데이터 오류 | `new Date()` 또는 동적 날짜 |
| 더미 데이터를 프로덕션 코드에 포함 | 사용자 혼란 | 로딩 상태 + 실제 API |
| `console.log` 남기기 | 프로덕션 노이즈 | 제거 또는 조건부 `dev` 환경 |
| WebSocket `useEffect` 클린업 누락 | 메모리 누수 | 반드시 `return () => ws.close()` |
| `open-graph-scraper` 프런트엔드 임포트 | Node.js 전용 패키지 | 서버 사이드 API로 이동 |

---

## 알려진 이슈

상세 내용은 `REPORT.md` 참조.

- **🔴 Critical**: Supabase `service_role` 키 프런트엔드 노출
- **🟠 High**: 주식 차트 날짜 하드코딩 (`useStockData.tsx`)
- **🟠 High**: `MyStockSummaryCards` 더미 데이터 (실제 포트폴리오 미연결)
- **🟠 High**: YouTube 변환 기능 미구현 (`console.log` placeholder)
- **🟡 Medium**: WebSocket 메모리 누수 (`useSocket.ts` 클린업 누락)
- **🟡 Medium**: Header에 `<a>` 태그 사용 (React Router Link로 교체 필요)

---

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
npm run preview  # 빌드 결과 미리보기
```

---

## 환경변수

`.env` 파일에서 관리. 프런트엔드에는 `VITE_` 접두사 변수만 노출됨.

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...   # anon 키만 사용 (service_role 키 절대 금지)
```
