# 🎨 UI/UX 디자인 지침서

> 프리미엄 게이밍 경험을 위한 디자인 시스템

---

## 1. 디자인 컨셉

### 테마: **Neon Cyberpunk**
- 다크 모드 기반
- 네온 글로우 효과
- 미래지향적 인터페이스

### 무드보드 키워드
```
🌃 어두운 배경 + 네온 하이라이트
💜 보라/파랑/청록 그라데이션
✨ 글로우/블러 효과
⚡ 다이나믹 애니메이션
```

---

## 2. 컬러 팔레트

### 2.1 기본 색상

```css
:root {
  /* 배경 */
  --bg-primary: #0a0a0f;
  --bg-secondary: #13131a;
  --bg-tertiary: #1a1a2e;
  
  /* 네온 하이라이트 */
  --neon-purple: #a855f7;
  --neon-blue: #3b82f6;
  --neon-cyan: #06b6d4;
  --neon-pink: #ec4899;
  --neon-green: #22c55e;
  
  /* 텍스트 */
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --text-muted: #52525b;
  
  /* 상태 색상 */
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
}
```

### 2.2 난이도별 색상

```css
.difficulty-1 { color: #22c55e; } /* 쉬움 - 초록 */
.difficulty-2 { color: #84cc16; } /* 보통 - 연두 */
.difficulty-3 { color: #f59e0b; } /* 중간 - 주황 */
.difficulty-4 { color: #f97316; } /* 어려움 - 진주황 */
.difficulty-5 { color: #ef4444; } /* 매우 어려움 - 빨강 */
```

---

## 3. 타이포그래피

### 3.1 폰트 설정

```css
/* Google Fonts 임포트 */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap');

:root {
  --font-display: 'Orbitron', sans-serif;  /* 제목, 점수 */
  --font-body: 'Noto Sans KR', sans-serif; /* 본문, 한글 */
}
```

### 3.2 텍스트 스타일

```css
/* 제목 */
.title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* 점수 */
.score {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 700;
}

/* 떨어지는 단어 */
.falling-word {
  font-family: var(--font-body);
  font-size: 1.25rem;
  font-weight: 500;
}
```

---

## 4. 화면 레이아웃

### 4.1 메인 게임 화면

```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐│
│  │ 🏆 SCORE: 1,234  ⚡ COMBO: 5x  ❤️ 3 ││ ← 상단바
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│                                         │
│           🍎 apple                      │ ← 게임 영역
│                   🧠 사과               │    (Canvas)
│        ✏️ I eat an ___ every day.      │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │  [입력창: 단어를 입력하세요...]      ││ ← 입력 영역
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 4.2 CSS Grid 레이아웃

```css
.game-container {
  display: grid;
  grid-template-rows: 60px 1fr 80px;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid rgba(168, 85, 247, 0.3);
}

.game-canvas {
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
}

.input-area {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
}
```

---

## 5. 컴포넌트 스타일

### 5.1 입력창

```css
.input-field {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.25rem;
  font-family: var(--font-body);
  
  background: var(--bg-primary);
  border: 2px solid var(--neon-purple);
  border-radius: 12px;
  
  color: var(--text-primary);
  outline: none;
  
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: var(--neon-cyan);
  box-shadow: 
    0 0 20px rgba(6, 182, 212, 0.3),
    inset 0 0 20px rgba(6, 182, 212, 0.1);
}

/* 정답 입력 시 */
.input-field.correct {
  animation: correctPulse 0.3s ease;
}

@keyframes correctPulse {
  0%, 100% { border-color: var(--neon-purple); }
  50% { border-color: var(--success); box-shadow: 0 0 30px rgba(34, 197, 94, 0.5); }
}
```

### 5.2 점수판

```css
.scoreboard {
  display: flex;
  gap: 2rem;
  font-family: var(--font-display);
}

.score-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

.combo-value {
  color: var(--neon-purple);
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
}
```

### 5.3 버튼

```css
.btn {
  padding: 0.75rem 2rem;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-blue));
  border: none;
  border-radius: 8px;
  
  color: white;
  cursor: pointer;
  
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4);
}

.btn:active {
  transform: translateY(0);
}
```

---

## 6. 애니메이션

### 6.1 떨어지는 단어

```css
.word-block {
  animation: wordFall linear;
  animation-fill-mode: forwards;
}

@keyframes wordFall {
  from { transform: translateY(0); }
  to { transform: translateY(calc(100vh - 140px)); }
}

/* 정답 시 폭발 효과 */
.word-block.explode {
  animation: explode 0.3s ease-out forwards;
}

@keyframes explode {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.8; }
  100% { transform: scale(0); opacity: 0; }
}
```

### 6.2 콤보 효과

```css
.combo-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 900;
  
  color: var(--neon-purple);
  text-shadow: 
    0 0 20px var(--neon-purple),
    0 0 40px var(--neon-purple);
  
  animation: comboPopup 0.5s ease-out forwards;
  pointer-events: none;
}

@keyframes comboPopup {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
```

### 6.3 글로우 효과

```css
.glow-text {
  text-shadow: 
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 40px currentColor;
}

.glow-box {
  box-shadow: 
    0 0 5px var(--neon-purple),
    0 0 10px var(--neon-purple),
    0 0 20px rgba(168, 85, 247, 0.5);
}
```

---

## 7. 반응형 디자인

### 7.1 브레이크포인트

```css
/* 모바일 */
@media (max-width: 480px) {
  .title { font-size: 1.5rem; }
  .score-value { font-size: 1rem; }
  .falling-word { font-size: 1rem; }
  .input-field { font-size: 1rem; padding: 0.75rem; }
}

/* 태블릿 */
@media (min-width: 481px) and (max-width: 768px) {
  .game-container { max-width: 600px; }
}

/* 데스크톱 */
@media (min-width: 769px) {
  .game-container { max-width: 800px; }
}
```

---

## 8. 접근성

```css
/* 포커스 표시 */
*:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
}

/* 모션 감소 설정 존중 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. 구현 체크리스트

- [ ] CSS 변수 시스템 구축
- [ ] 폰트 로드 및 적용
- [ ] 기본 레이아웃 구현
- [ ] 입력창 스타일링
- [ ] 점수판/상태바 디자인
- [ ] 버튼 컴포넌트
- [ ] 낙하 애니메이션
- [ ] 콤보/효과 애니메이션
- [ ] 반응형 적용
- [ ] 접근성 테스트
