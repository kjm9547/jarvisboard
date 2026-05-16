# JarvisBoard 디자인 시스템

> **참고**: 이 문서는 `src/index.css`의 CSS 변수와 `src/components/ui/`의 컴포넌트를 기준으로 작성되었다.

---

## 목차

1. [디자인 원칙](#1-디자인-원칙)
2. [테마 시스템](#2-테마-시스템)
3. [컬러 팔레트](#3-컬러-팔레트)
4. [타이포그래피](#4-타이포그래피)
5. [스페이싱 스케일](#5-스페이싱-스케일)
6. [보더 반경](#6-보더-반경)
7. [그림자 & 링](#7-그림자--링)
8. [컴포넌트 가이드](#8-컴포넌트-가이드)
9. [레이아웃 패턴](#9-레이아웃-패턴)
10. [아이콘](#10-아이콘)
11. [애니메이션](#11-애니메이션)
12. [접근성](#12-접근성)

---

## 1. 디자인 원칙

| 원칙 | 설명 |
|------|------|
| **토큰 우선** | 임의 색상값 대신 항상 CSS 변수 토큰 사용 |
| **다크/라이트 동시 지원** | 모든 컴포넌트는 `.dark` 클래스 전환 시 자연스럽게 동작해야 함 |
| **한국어 가독성** | 폰트, 자간, 줄간격은 한글 최적화 기준으로 설정 |
| **컴포넌트 확장** | shadcn/ui 프리미티브를 수정하지 않고 `className` prop으로 확장 |
| **접근성** | 포커스 링, aria 속성, 색상 대비 최소 4.5:1 유지 |

---

## 2. 테마 시스템

### 구조

테마는 CSS 커스텀 프로퍼티 기반으로 동작한다. `.dark` 클래스를 `<html>` 또는 루트 요소에 토글하면 전체 테마가 전환된다.

```css
/* src/index.css */
@custom-variant dark (&:is(.dark *));

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

### 시스템 다크모드 감지

```css
@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --bg: #16171d;
    /* ... */
  }
}
```

### 테마 전환 구현 예시

```typescript
// 다크모드 토글
document.documentElement.classList.toggle("dark")

// 현재 테마 확인
const isDark = document.documentElement.classList.contains("dark")
```

### 테마별 개발 체크리스트

신규 컴포넌트 개발 시 반드시 확인:
- [ ] 라이트 모드에서 텍스트/배경 대비 적절한가?
- [ ] 다크 모드에서 텍스트/배경 대비 적절한가?
- [ ] 임의 색상값(`#ffffff`, `bg-gray-100`) 대신 토큰을 사용했는가?
- [ ] 이미지/아이콘이 다크 모드에서도 가시성이 좋은가?

---

## 3. 컬러 팔레트

### 시맨틱 토큰 (Tailwind 클래스로 사용)

모든 컴포넌트에서 아래 토큰만 사용한다. 임의 색상 하드코딩 금지.

#### 배경/표면

| 토큰 | Tailwind 클래스 | 용도 |
|------|----------------|------|
| `--background` | `bg-background` | 페이지 전체 배경 |
| `--card` | `bg-card` | 카드, 패널 배경 |
| `--popover` | `bg-popover` | 드롭다운, 팝오버 |
| `--muted` | `bg-muted` | 비활성 영역, 코드 블록 |
| `--input` | `bg-input` | 입력 필드 배경 |

#### 텍스트

| 토큰 | Tailwind 클래스 | 용도 |
|------|----------------|------|
| `--foreground` | `text-foreground` | 기본 본문 텍스트 |
| `--card-foreground` | `text-card-foreground` | 카드 내부 텍스트 |
| `--muted-foreground` | `text-muted-foreground` | 보조 텍스트, 플레이스홀더 |
| `--primary-foreground` | `text-primary-foreground` | Primary 버튼 위 텍스트 |

#### 액션/상태

| 토큰 | Tailwind 클래스 | 다크 모드 값 | 용도 |
|------|----------------|------------|------|
| `--primary` | `bg-primary` | `oklch(0.922 0 0)` | 주요 버튼, 강조 |
| `--secondary` | `bg-secondary` | `oklch(0.269 0 0)` | 보조 버튼 |
| `--accent` | `bg-accent` | `oklch(0.269 0 0)` | 호버 상태, 강조 |
| `--destructive` | `bg-destructive` | `oklch(0.704 0.191 22.216)` | 삭제, 오류 |

#### 구조

| 토큰 | Tailwind 클래스 | 다크 모드 값 | 용도 |
|------|----------------|------------|------|
| `--border` | `border-border` | `oklch(1 0 0 / 10%)` | 테두리 |
| `--ring` | `ring-ring` | `oklch(0.556 0 0)` | 포커스 링 |

#### 차트 컬러 (데이터 시각화 전용)

```css
--chart-1: oklch(0.87 0 0)   /* 가장 밝음 */
--chart-2: oklch(0.556 0 0)
--chart-3: oklch(0.439 0 0)
--chart-4: oklch(0.371 0 0)
--chart-5: oklch(0.269 0 0)  /* 가장 어두움 */
```

### 커스텀 변수 (레거시 — 신규 코드에서 사용 자제)

`@media (prefers-color-scheme: dark)` 에서 정의된 변수들. 신규 코드는 위 시맨틱 토큰 우선 사용.

```css
--text: #9ca3af          /* 본문 텍스트 */
--text-h: #f3f4f6        /* 헤딩 텍스트 */
--bg: #16171d            /* 페이지 배경 */
--border: #2e303a        /* 테두리 */
--accent: #c084fc        /* 퍼플 액센트 */
--accent-bg: rgba(192, 132, 252, 0.15)
--accent-border: rgba(192, 132, 252, 0.5)
```

### 의미 있는 색상 (컴포넌트에서 상황별 사용)

```typescript
// 수익/상승 — 에메랄드
className="text-emerald-500"

// 손실/하락 — 레드
className="text-red-500"

// 투자액 — 블루
className="text-blue-500"

// 보유 종목 — 앰버
className="text-amber-500"

// 분석/차트 — 인디고
className="text-indigo-500"
```

---

## 4. 타이포그래피

### 폰트 스택

| 역할 | 폰트 | 변수 |
|------|------|------|
| 본문 (한국어) | Spoqa Han Sans Neo | `font-family: "Spoqa Han Sans Neo"` |
| 헤딩/UI | Geist Variable | `--font-heading`, `--font-sans` |
| 보조 | Pretendard, IBM Plex Sans KR | — |

### 기본 타이포그래피 설정

```css
:root {
  font: 18px/145% var(--font-sans);
  letter-spacing: 0.18px;
}

@media (max-width: 1024px) {
  :root { font-size: 16px; }
}
```

### Tailwind 타이포그래피 스케일

| 클래스 | 크기 | 용도 |
|--------|------|------|
| `text-[10px]` | 10px | 마이크로 레이블 |
| `text-xs` | 12px | 배지, 캡션, 보조 텍스트 |
| `text-sm` | 14px | 카드 본문, 폼 요소 |
| `text-base` | 16px | 카드 제목 |
| `text-xl` | 20px | 뉴스 카드 제목 |
| `text-2xl` | 24px | 대시보드 수치 |

### 폰트 웨이트

```typescript
font-medium    // UI 레이블, 카드 제목
font-semibold  // 배지, 강조 텍스트
font-bold      // 대시보드 수치, 주요 수치
```

### 줄 제한 (long text)

```typescript
line-clamp-2   // 뉴스 카드 제목
line-clamp-4   // 뉴스 카드 요약
```

---

## 5. 스페이싱 스케일

4px 기반 스케일. `gap-`, `p-`, `px-`, `py-`, `m-` 클래스로 사용.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `1` | 4px | 아이콘-텍스트 간격 |
| `1.5` | 6px | 버튼 내부 gap |
| `2` | 8px | 배지 내부 padding |
| `2.5` | 10px | 버튼 수평 padding |
| `3` | 12px | 소형 카드 padding |
| `4` | 16px | 카드 기본 padding |
| `5` | 20px | 페이지 외부 여백 |
| `8` | 32px | 섹션 간격 |

### 컴포넌트별 권장 스페이싱

```typescript
// 카드 그리드 (flex-wrap)
<div className="flex flex-wrap gap-2 mb-5">

// 페이지 컨테이너
<div className="px-5 pt-5">

// 카드 헤더 내부
<CardHeader className="pb-3">
<CardContent className="pb-5">
```

---

## 6. 보더 반경

`--radius` 변수(`0.625rem = 10px`)를 기준으로 하는 스케일.

| 변수 | 계산 | 대략 | Tailwind |
|------|------|------|---------|
| `--radius-sm` | `radius × 0.6` | 6px | `rounded-sm` |
| `--radius-md` | `radius × 0.8` | 8px | `rounded-md` |
| `--radius-lg` | `radius` | 10px | `rounded-lg` |
| `--radius-xl` | `radius × 1.4` | 14px | `rounded-xl` |
| `--radius-2xl` | `radius × 1.8` | ~18px | `rounded-2xl` |
| `--radius-4xl` | `radius × 2.6` | ~26px | `rounded-4xl` (pill) |

### 용도별 권장 반경

```typescript
rounded-lg    // 버튼, 입력 필드
rounded-xl    // 카드, 패널
rounded-full  // 스크롤바 thumb, 아바타
rounded-4xl   // 배지 (pill 형태)
```

---

## 7. 그림자 & 링

### 카드 테두리 방식

JarvisBoard는 `box-shadow` 대신 `ring` 유틸리티를 기본 테두리로 사용한다.

```typescript
ring-1 ring-foreground/10    // 카드 기본 테두리 (Card 컴포넌트 기본값)
ring-2 ring-primary          // 선택된 상태
```

### 포커스 링

```typescript
focus-visible:ring-3 focus-visible:ring-ring/50   // 버튼, 입력 포커스
```

### 그림자 (호버/인터랙션)

```typescript
shadow-sm                    // 기본 상태
hover:shadow-lg              // 호버 시 강조 (뉴스 카드)
shadow-md scale-105          // 선택된 배지
```

### 커스텀 그림자 토큰 (다크 모드)

```css
--shadow: rgba(0,0,0,0.4) 0 10px 15px -3px, rgba(0,0,0,0.25) 0 4px 6px -2px;
```

---

## 8. 컴포넌트 가이드

### Button

`src/components/ui/button.tsx` — CVA 기반 variant 시스템

#### Variant

| variant | 용도 | 배경 |
|---------|------|------|
| `default` | 주요 액션 | `bg-primary` |
| `outline` | 보조 액션 | 테두리만 |
| `secondary` | 중립 액션 | `bg-secondary` |
| `ghost` | 최소 강조 | 호버 시만 배경 |
| `destructive` | 삭제/위험 | `bg-destructive/10` |
| `link` | 텍스트 링크 형태 | 없음 |

#### Size

| size | 높이 | 용도 |
|------|------|------|
| `xs` | 24px | 인라인, 밀집 UI |
| `sm` | 28px | 소형 버튼 |
| `default` | 32px | 일반 버튼 |
| `lg` | 36px | 큰 버튼 |
| `icon` | 32×32px | 정사각형 아이콘 버튼 |

```typescript
// 사용 예시
<Button variant="default" size="default">저장</Button>
<Button variant="outline" size="sm">취소</Button>
<Button variant="ghost" size="icon"><ChevronRight /></Button>
<Button variant="destructive">삭제</Button>

// 다형성 렌더링 (Link 등)
<Button asChild variant="outline">
  <Link to="/stock">주식 보기</Link>
</Button>
```

---

### Card

`src/components/ui/card.tsx` — 복합 컴포넌트 패턴 (Compound Component)

#### 구조

```typescript
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
    <CardAction>우측 액션 버튼</CardAction>
  </CardHeader>
  <CardContent>
    본문 내용
  </CardContent>
  <CardFooter>
    푸터 (선택사항)
  </CardFooter>
</Card>
```

#### Size prop

```typescript
<Card size="default" />  // gap-4, py-4, px-4
<Card size="sm" />       // gap-3, py-3, px-3 (밀집 레이아웃)
```

#### 스타일 확장 패턴

```typescript
// 다크 배경 카드 (주식 페이지)
<Card className="bg-white/5 border-none shadow-none ring-0 backdrop-blur-sm">

// 라이트 카드 (뉴스 페이지)
<Card className="border-slate-200 shadow-sm hover:shadow-lg bg-white ring-0">

// 고정 크기 카드 (요약 수치)
<Card className="min-w-[250px] h-[110px]">
```

#### CardAction (우측 정렬 액션)

```typescript
<CardHeader>
  <CardTitle>보유 종목</CardTitle>
  <CardAction>
    <Button variant="ghost" size="icon-sm"><RefreshCcw /></Button>
  </CardAction>
</CardHeader>
```

---

### Badge

`src/components/ui/badge.tsx` — 상태 표시, 태그, 티커

#### Variant

| variant | 용도 |
|---------|------|
| `default` | 활성 상태, 선택됨 |
| `secondary` | 비활성, 기본 태그 |
| `destructive` | 오류, 경고 |
| `outline` | 테두리만 |

```typescript
// 주식 티커 선택
<Badge
  variant={isSelected ? "default" : "secondary"}
  className={cn(
    "px-4 py-1.5 cursor-pointer text-sm font-semibold transition-all",
    isSelected && "scale-105 shadow-md"
  )}
  onClick={handleSelect}
>
  {symbol}
</Badge>

// 뉴스 NEW 배지
<Badge className="bg-indigo-600 text-white text-[10px] px-2 py-0.5">
  NEW
</Badge>
```

---

### Input

`src/components/ui/input.tsx` — 폼 입력 필드

```typescript
<Input
  type="text"
  placeholder="YouTube URL 입력"
  className="w-full"
/>

// 오류 상태
<Input aria-invalid="true" />
// aria-invalid 시 자동으로 destructive 테두리 적용
```

---

### Label

`src/components/ui/label.tsx` — 폼 레이블

```typescript
<Label htmlFor="url-input">YouTube URL</Label>
<Input id="url-input" type="url" />
```

---

### ScrollArea

`src/components/ui/scroll-area.tsx` — 커스텀 스크롤바 영역

```typescript
<ScrollArea className="h-[400px] w-full">
  {/* 긴 콘텐츠 */}
</ScrollArea>
```

---

### Separator

`src/components/ui/separator.tsx` — 구분선

```typescript
<Separator />                          // 수평 (기본)
<Separator orientation="vertical" />   // 수직
```

---

## 9. 레이아웃 패턴

### 페이지 컨테이너

```typescript
// 모든 페이지 기본 래퍼
<div className="px-5 pt-5">
  <div className="flex items-start justify-center mb-5 flex-col gap-2">
    <h2 className="text-xl font-bold text-foreground">페이지 제목</h2>
    <p className="text-sm text-muted-foreground">설명</p>
  </div>
  {/* 내용 */}
</div>
```

### 카드 그리드 (flex-wrap)

```typescript
// 반응형 카드 목록 — 카드가 자연스럽게 줄 바꿈
<div className="flex flex-wrap gap-2 mb-5">
  {items.map(item => (
    <Card key={item.id} className="min-w-[250px]">
      ...
    </Card>
  ))}
</div>
```

### 대시보드 2단 레이아웃

```typescript
// 메인 콘텐츠 + 사이드 패널
<div className="flex gap-4">
  <div className="flex-1 min-w-0">{/* 주 콘텐츠 */}</div>
  <div className="w-[320px] shrink-0">{/* 사이드 패널 */}</div>
</div>
```

### 카드 헤더 아이콘 + 제목 패턴

```typescript
<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  <CardTitle className="text-xs font-medium text-muted-foreground">
    총 투자액
  </CardTitle>
  <Wallet className="h-4 w-4 text-blue-500" />
</CardHeader>
```

### Sticky 헤더

```typescript
<header className="z-[9999] sticky top-0 w-full bg-background border-b border-border h-[50px]">
```

---

## 10. 아이콘

**Lucide React** 사용. `lucide-react` 패키지에서 직접 import.

```typescript
import { TrendingUp, Wallet, BarChart3, Briefcase } from "lucide-react"

// 크기: Tailwind size 유틸리티
<TrendingUp className="h-4 w-4" />   // 16px (카드 내 아이콘)
<Wallet className="h-5 w-5" />       // 20px (중형)
<BarChart3 className="size-4" />     // size-* 단축 클래스

// 버튼 내 아이콘 (자동 크기 조정됨 — 별도 size 클래스 불필요)
<Button size="icon"><RefreshCcw /></Button>
```

### 아이콘 컬러 의미

```typescript
text-blue-500    // 투자/금융 데이터
text-emerald-500 // 수익/상승
text-red-500     // 손실/하락
text-amber-500   // 보유/중립
text-indigo-500  // 분석/차트
text-muted-foreground // 보조 UI 아이콘
```

---

## 11. 애니메이션

### 마이크로 인터랙션 (기본 제공)

Button 컴포넌트에 내장된 트랜지션:

```css
/* 버튼 클릭 시 */
active:translate-y-px

/* 상태 변화 */
transition-all

/* 배지 선택 */
scale-105
```

### 호버 트랜지션

```typescript
// 카드 호버
className="transition-all hover:shadow-lg hover:border-slate-300"

// 배지 호버
className="transition-all hover:opacity-80"
```

### tw-animate-css 클래스

`tw-animate-css` 패키지로 추가 애니메이션 사용 가능:

```typescript
// 페이드인
className="animate-fade-in"

// 슬라이드업
className="animate-slide-up"
```

### 애니메이션 원칙

- 기능적 피드백 목적의 애니메이션만 사용 (스피너, 호버 강조 등)
- 순수 장식용 애니메이션 지양 (접근성 및 성능)
- `prefers-reduced-motion` 미디어 쿼리 고려 필요

---

## 12. 접근성

### 포커스 관리

모든 인터랙티브 요소는 키보드 포커스 가시성을 가져야 한다.  
Button 컴포넌트는 기본으로 포커스 링 포함:

```css
focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50
```

### aria 속성

```typescript
// 오류 상태 입력
<Input aria-invalid="true" aria-describedby="error-msg" />
<p id="error-msg">올바른 URL을 입력하세요</p>

// 로딩 상태
<Button aria-busy="true" disabled>처리 중...</Button>

// 아이콘 전용 버튼
<Button size="icon" aria-label="새로고침">
  <RefreshCcw />
</Button>
```

### 색상 대비

- 텍스트-배경 대비: **최소 4.5:1** (WCAG AA)
- 큰 텍스트(18px+): **최소 3:1**
- `text-muted-foreground`는 보조 텍스트에만 사용 (주요 정보 금지)

### 시맨틱 HTML

```typescript
// 올바른 방법 — 링크는 <a> 또는 <Link>
<Link to="/stock">주식 보기</Link>

// 버튼은 <button> 또는 Button 컴포넌트
<Button onClick={handleSave}>저장</Button>

// 금지 — 클릭 핸들러를 div에 직접
<div onClick={handleSave}>저장</div>  // 키보드 접근 불가
```

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-15 | 초기 문서 작성 — 기존 컴포넌트 기준으로 토큰/패턴 정리 |
