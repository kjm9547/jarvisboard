# 뉴스 대시보드 디자인 문서

> 이 파일은 뉴스 페이지 디자인 작업 시 항상 먼저 참고한다.
> 변경사항이 생기면 반드시 이 파일도 함께 업데이트한다.

---

## 파일 구조

```
src/pages/main/news/
├── NEWS_DESIGN.md       ← 이 파일
├── types.ts             ← News 인터페이스
├── useNewsData.ts       ← Supabase fetch + 날짜 그루핑 훅
├── NewsDashboard.tsx    ← 페이지 오케스트레이터 (상태 관리)
├── NewsBanner.tsx       ← 헤더 배너 섹션
├── NewsDateTabs.tsx     ← 날짜 탭 스트립
├── NewsGrid.tsx         ← 뉴스 카드 그리드 + 로딩/빈 상태
└── NewsDetailPanel.tsx  ← 우측 디테일 패널 (lg 이상)
```

---

## 레이아웃 구조

```
┌─────────────────────────────────────────────────────┐
│ NewsBanner                                          │
│  [◆ Jarvis Board 라벨]                              │
│  [AI 뉴스 대시보드 h1]          [character_flying]  │
│  [부제목]                                           │
│  [● 실시간 작동 중] [총 N개 기사 · N일치]            │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ NewsDateTabs (가로 스크롤)                        │
│  [오늘 3] [어제 5] [5월 12일 4] ...              │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────┐ ┌────────────┐
│ NewsGrid (flex-wrap)             │ │ Detail     │
│  [카드] [카드] [카드]            │ │ Panel      │
│  [카드] [카드] ...               │ │ (lg 이상)  │
└──────────────────────────────────┘ └────────────┘
```

---

## 컴포넌트별 디자인 명세

### NewsBanner

| 속성 | 값 |
|------|----|
| 배경 | `bg-card` + `bg-linear-to-br from-primary/10 via-primary/5 to-transparent` 오버레이 |
| 테두리 | `border border-border rounded-2xl` |
| 패딩 | `px-6 py-5 pr-36` (우측 캐릭터 공간 확보) |
| 장식 원 | 우상단 `h-40 w-40 bg-primary/5`, 우하단 `h-24 w-24 bg-primary/8` |
| 캐릭터 | `character_flying.png` h-28, opacity-60, 우측 하단 고정 |
| 라벨 | `icon_512_32x32_circle_resized_32px.png` h-5 + "JARVIS BOARD" text-[11px] uppercase tracking-widest |
| 제목 | `text-2xl font-bold text-foreground` |
| 부제목 | `text-sm text-muted-foreground` |
| 뱃지 | `animate-ping` 초록 dot + "실시간 작동 중" text-emerald-500 |
| 통계 | 로딩 완료 후 "총 N개 기사 · N일치" text-xs |

**개선 포인트:**
- [ ] 배너 높이가 고정되어 있지 않아 콘텐츠에 따라 가변 — 최소 높이 지정 검토
- [ ] 모바일에서 캐릭터가 텍스트를 가릴 수 있음 — sm 이하에서 캐릭터 숨김 처리 검토

---

### NewsDateTabs

| 속성 | 값 |
|------|----|
| 컨테이너 | `flex gap-2 overflow-x-auto pb-1 scrollbar-none` |
| 활성 탭 | `variant="default"` (primary 배경) |
| 비활성 탭 | `variant="outline"` |
| 탭 내부 | Calendar 아이콘 + 날짜 텍스트 + 뉴스 수 Badge |
| 활성 뱃지 | `bg-primary-foreground/20 text-primary-foreground border-transparent` |
| 로딩 스켈레톤 | `h-8 w-20 rounded-lg bg-muted animate-pulse` × 5개 |

**날짜 포맷 규칙:**
- 오늘 → "오늘"
- 어제 → "어제"
- 그 외 → "M월 D일" (ko-KR short)

---

### NewsGrid

| 속성 | 값 |
|------|----|
| 카드 너비 | `w-72` (288px) |
| 카드 레이아웃 | `flex flex-wrap gap-4` |
| 썸네일 높이 | `h-36` |
| 썸네일 없을 때 | `character_glow.png` h-16, opacity-20, hover 시 opacity-30으로 변화 |
| 썸네일 있을 때 | `object-cover`, hover 시 `group-hover:scale-105` (500ms) |
| "AI 요약" 뱃지 | 썸네일 좌상단 `top-2 left-2`, backdrop-blur, `bg-background/70` |
| 본문 날짜 | `text-[11px] text-muted-foreground` |
| 본문 제목 | `text-sm font-bold line-clamp-2` |
| 본문 요약 | `text-xs text-muted-foreground line-clamp-3` |
| 푸터 링크 | `text-xs font-medium text-primary hover:underline` |
| 선택 상태 | `ring-2 ring-primary shadow-md` |
| hover 효과 | `hover:-translate-y-1 hover:shadow-lg hover:ring-1 hover:ring-foreground/20` |

**애니메이션:**
- 카드 등장: `animate-in fade-in slide-in-from-bottom-3 duration-300`
- Stagger: `animationDelay: index * 50ms`
- fill mode: `fill-mode-[backwards]` (지연 전 투명 유지)

**로딩 스켈레톤:** `w-72 h-72 rounded-xl bg-card ring-1 ring-foreground/10 animate-pulse` × 6개

**빈 상태:** `character_glow.png` h-20, opacity-50, `animate-float-slow` + "해당 날짜의 뉴스가 없습니다"

**개선 포인트:**
- [ ] 카드 너비 고정(w-72)으로 화면이 넓을 때 오른쪽 공백 과다 — CSS grid auto-fill 전환 검토
- [ ] 썸네일 없을 때 bg-muted가 단색으로 허전함 — 미묘한 패턴/그라데이션 적용 검토
- [ ] 푸터 "원본 기사 읽기" 링크 디자인 강조도 부족

---

### NewsDetailPanel

| 속성 | 값 |
|------|----|
| 너비 | `w-90` (360px), `shrink-0` |
| 표시 조건 | `hidden lg:block` (lg 이상에서만 표시) |
| sticky 기준 | `top-16.5` (헤더 높이 50px + 여유) |
| 등장 애니메이션 | `animate-in slide-in-from-right-4 fade-in duration-300` |
| key prop | `news.id` (선택 변경 시 재실행) |
| 헤더 | 제목 + ExternalLink 버튼 + 날짜 CardDescription |
| 스크롤 영역 | `h-[calc(100vh-280px)]` ScrollArea |
| AI 요약 레이블 | `text-[11px] uppercase tracking-widest text-muted-foreground` |
| 요약 본문 | `text-sm text-foreground whitespace-pre-wrap` |
| 원문 발췌 | Separator 이후, `html-react-parser`로 렌더링 |

**개선 포인트:**
- [ ] 모바일/태블릿에서 디테일 패널 접근 불가 — 모달 또는 Bottom Sheet 방식 검토
- [ ] `calc(100vh-280px)` 하드코딩 — 동적 계산 또는 CSS 변수 활용 검토

---

## 애니메이션 목록

| 애니메이션 | 적용 위치 | 설명 |
|-----------|---------|------|
| `animate-ping` | 뱃지 초록 dot | 박동하는 실시간 표시 |
| `animate-float-slow` | 빈 상태 캐릭터 | 6초 주기 둥실둥실 |
| `fade-in + slide-in-from-bottom-3` | 뉴스 카드 등장 | 50ms stagger |
| `slide-in-from-right-4 + fade-in` | 디테일 패널 등장 | 카드 선택 시마다 |
| `group-hover:scale-105` | 썸네일 이미지 | hover 줌인 |
| `hover:-translate-y-1` | 카드 전체 | hover lift |

> `animate-float` (`@keyframes float`, 4s): index.css에 정의됨  
> `animate-float-slow`: 6s variant

---

## 데이터 모델 (`types.ts`)

```typescript
interface News {
  id: number;
  title: string;
  summary: string;
  link: string;
  description: string;   // Google News RSS HTML — html-react-parser로 렌더링
  created_at: string;    // ISO 8601, slice(0,10)으로 날짜 키 추출
  image_url?: string;    // nullable — 맥미니 서버에서 OG 이미지 수집 시 채워짐
}
```

**Supabase 테이블:** `news_summaries`  
**정렬:** `created_at DESC`  
**RLS:** 활성화됨 (anon key 사용)

---

## 사용 중인 아이콘 에셋

| 파일 | 사용 위치 |
|------|---------|
| `character_flying.png` | NewsBanner 우측 장식 |
| `character_glow.png` | NewsGrid 썸네일 placeholder, 빈 상태 |
| `icon_512_32x32_circle_resized_32px.png` | NewsBanner 라벨, 앱 헤더 로고 |

경로: `public/assets/icons/`

---

## 다음 디자인 작업 후보

1. **카드 그리드 → CSS Grid 전환** — `grid-cols-[repeat(auto-fill,minmax(288px,1fr))]`로 빈 공간 제거
2. **썸네일 placeholder 개선** — 단색 muted 대신 미묘한 그라데이션 or 뉴스 카테고리 색상 적용
3. **모바일 디테일 뷰** — lg 미만에서 선택 시 Bottom Sheet 또는 전체화면 모달
4. **날짜 탭 스타일 개선** — 현재 Button 기반 → 탭 전용 커스텀 스타일 검토
5. **배너 모바일 최적화** — 작은 화면에서 캐릭터 숨김 + 레이아웃 조정
