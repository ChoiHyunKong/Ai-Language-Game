# 🎮 게임 엔진 개발 지침서

> 산성비 스타일 퀴즈 게임 엔진 설계 및 구현 가이드

---

## 1. 게임 개요

### 핵심 메커니즘
- **산성비 스타일**: 단어/퀴즈가 화면 상단에서 하단으로 떨어짐
- **타이핑 입력**: 사용자가 정답 입력 시 해당 요소 제거
- **게임 오버**: 단어가 바닥에 닿으면 체력 감소

---

## 2. 게임 모드

### 2.1 모드 구조

```
GameEngine (공통 엔진)
├── WordMode       (단어 연습)
├── MeaningMode    (의미 퀴즈)
└── SentenceMode   (문장 완성)
```

### 2.2 모드별 상세

| 모드 | 화면 표시 | 정답 | 난이도 요소 |
|------|-----------|------|-------------|
| 단어 연습 | `apple` | `apple` | 단어 길이, 낙하 속도 |
| 의미 퀴즈 | `사과` | `apple` | 연상 난이도, 시간 |
| 문장 완성 | `I eat an ___ every day.` | `apple` | 문맥 이해 필요 |

---

## 3. 클래스 설계

### 3.1 GameEngine (메인 엔진)

```javascript
// src/js/game/GameEngine.js

class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.fallingWords = [];  // 떨어지는 단어들
    this.score = 0;
    this.combo = 0;
    this.health = 3;
    this.isRunning = false;
    this.currentMode = null;
    
    this.config = {
      spawnInterval: 2000,   // 단어 생성 간격 (ms)
      baseFallSpeed: 1,      // 기본 낙하 속도
      difficultyMultiplier: 0.2
    };
  }

  // 게임 모드 설정
  setMode(mode) {
    this.currentMode = mode;
  }

  // 게임 시작
  start() {
    this.isRunning = true;
    this.spawnWord();
    this.gameLoop();
  }

  // 게임 루프
  gameLoop() {
    if (!this.isRunning) return;
    
    this.update();
    this.render();
    
    requestAnimationFrame(() => this.gameLoop());
  }

  // 상태 업데이트
  update() {
    this.fallingWords.forEach(word => {
      word.y += word.speed;
      
      // 바닥 도달 체크
      if (word.y > this.canvas.height) {
        this.onWordMissed(word);
      }
    });
    
    // 제거된 단어 필터링
    this.fallingWords = this.fallingWords.filter(w => !w.removed);
  }

  // 렌더링
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.fallingWords.forEach(word => {
      this.drawWord(word);
    });
  }

  // 단어 그리기
  drawWord(word) {
    this.ctx.font = `${word.fontSize}px Arial`;
    this.ctx.fillStyle = word.color;
    this.ctx.fillText(word.display, word.x, word.y);
  }

  // 입력 처리
  checkInput(input) {
    const matchedWord = this.fallingWords.find(
      w => w.answer.toLowerCase() === input.toLowerCase()
    );
    
    if (matchedWord) {
      this.onWordMatched(matchedWord);
      return true;
    }
    return false;
  }

  // 정답 처리
  onWordMatched(word) {
    word.removed = true;
    this.combo++;
    this.score += this.calculateScore(word);
    
    // 이벤트 발생
    this.onScoreUpdate?.(this.score, this.combo);
  }

  // 놓친 단어 처리
  onWordMissed(word) {
    word.removed = true;
    this.combo = 0;
    this.health--;
    
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  // 점수 계산
  calculateScore(word) {
    const baseScore = word.difficulty * 10;
    const comboBonus = this.combo * 5;
    return baseScore + comboBonus;
  }

  // 게임 오버
  gameOver() {
    this.isRunning = false;
    this.onGameOver?.(this.score);
  }
}

export default GameEngine;
```

### 3.2 BaseMode (모드 기반 클래스)

```javascript
// src/js/game/BaseMode.js

class BaseMode {
  constructor(csvLoader) {
    this.csvLoader = csvLoader;
  }

  // 오버라이드 필요
  createFallingWord(data) {
    throw new Error('createFallingWord must be implemented');
  }

  // 공통: 랜덤 단어 가져오기
  getRandomWord() {
    return this.csvLoader.getRandom(1)[0];
  }
}

export default BaseMode;
```

### 3.3 WordMode (단어 연습)

```javascript
// src/js/game/WordMode.js

import BaseMode from './BaseMode.js';

class WordMode extends BaseMode {
  createFallingWord(canvasWidth) {
    const data = this.getRandomWord();
    
    return {
      id: Date.now(),
      display: data.word,     // 화면에 단어 표시
      answer: data.word,      // 정답도 같은 단어
      difficulty: data.difficulty,
      x: Math.random() * (canvasWidth - 100),
      y: 0,
      speed: 1 + (data.difficulty * 0.2),
      fontSize: 20,
      color: this.getDifficultyColor(data.difficulty),
      removed: false
    };
  }

  getDifficultyColor(difficulty) {
    const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
    return colors[difficulty - 1] || colors[0];
  }
}

export default WordMode;
```

### 3.4 MeaningMode (의미 퀴즈)

```javascript
// src/js/game/MeaningMode.js

import BaseMode from './BaseMode.js';

class MeaningMode extends BaseMode {
  createFallingWord(canvasWidth) {
    const data = this.getRandomWord();
    
    return {
      id: Date.now(),
      display: data.meaning,  // 뜻 표시
      answer: data.word,      // 단어가 정답
      difficulty: data.difficulty,
      x: Math.random() * (canvasWidth - 100),
      y: 0,
      speed: 0.8 + (data.difficulty * 0.15), // 약간 느리게
      fontSize: 18,
      color: '#2196F3',
      removed: false
    };
  }
}

export default MeaningMode;
```

### 3.5 SentenceMode (문장 완성)

```javascript
// src/js/game/SentenceMode.js

import BaseMode from './BaseMode.js';

class SentenceMode extends BaseMode {
  createFallingWord(canvasWidth) {
    const data = this.getRandomWord();
    
    // 문장이 없으면 의미 모드로 폴백
    if (!data.sentence) {
      return this.createMeaningFallback(data, canvasWidth);
    }
    
    return {
      id: Date.now(),
      display: data.sentence,  // 빈칸 문장 표시
      answer: data.word,       // 빈칸에 들어갈 단어
      difficulty: data.difficulty,
      x: 20, // 문장은 왼쪽 정렬
      y: 0,
      speed: 0.6 + (data.difficulty * 0.1), // 가장 느리게
      fontSize: 16,
      color: '#9C27B0',
      removed: false
    };
  }
}

export default SentenceMode;
```

---

## 4. 게임 루프 상세

### 4.1 프레임 구조

```
┌─────────────────────────────────────────┐
│              Game Loop                   │
├─────────────────────────────────────────┤
│  1. Input Processing                     │
│     └── 키보드 입력 감지                  │
│                                          │
│  2. Update                               │
│     ├── 단어 위치 업데이트                │
│     ├── 충돌 감지 (바닥 도달)             │
│     └── 상태 업데이트 (점수, 체력)        │
│                                          │
│  3. Render                               │
│     ├── 캔버스 클리어                     │
│     ├── 배경 그리기                       │
│     ├── 떨어지는 단어 그리기              │
│     └── UI 업데이트 (점수판)              │
│                                          │
│  4. requestAnimationFrame (반복)         │
└─────────────────────────────────────────┘
```

### 4.2 단어 생성 타이밍

```javascript
// 난이도에 따른 생성 간격 조절
calculateSpawnInterval() {
  const baseInterval = 2000;
  const reduction = Math.min(this.score / 100, 1000); // 최대 1초 감소
  return Math.max(baseInterval - reduction, 800); // 최소 0.8초
}
```

---

## 5. 난이도 조절 알고리즘

### 5.1 동적 난이도

```javascript
class DifficultyManager {
  constructor() {
    this.level = 1;
    this.scoreThresholds = [100, 300, 600, 1000, 1500];
  }

  update(score) {
    const newLevel = this.scoreThresholds.filter(t => score >= t).length + 1;
    
    if (newLevel > this.level) {
      this.level = newLevel;
      return true; // 레벨 업!
    }
    return false;
  }

  getSettings() {
    return {
      spawnInterval: 2000 - (this.level * 200),
      fallSpeedMultiplier: 1 + (this.level * 0.1),
      minDifficulty: Math.min(this.level, 3),
      maxSimultaneousWords: 3 + this.level
    };
  }
}
```

---

## 6. 확장성: 새 모드 추가

### 6.1 추가 절차

```javascript
// 1. 새 모드 클래스 생성
// src/js/game/ReverseMode.js

import BaseMode from './BaseMode.js';

class ReverseMode extends BaseMode {
  createFallingWord(canvasWidth) {
    const data = this.getRandomWord();
    return {
      display: data.word,
      answer: data.meaning,  // 뜻을 입력해야 함!
      // ... 기타 속성
    };
  }
}

export default ReverseMode;

// 2. GameEngine에 등록
import ReverseMode from './ReverseMode.js';
engine.registerMode('reverse', new ReverseMode(csvLoader));
```

---

## 7. 구현 체크리스트

- [ ] GameEngine 기본 구조 구현
- [ ] Canvas 렌더링 시스템 구현
- [ ] 단어 생성 및 낙하 로직
- [ ] 입력 처리 시스템
- [ ] WordMode 구현
- [ ] MeaningMode 구현
- [ ] SentenceMode 구현
- [ ] 난이도 조절 시스템
- [ ] 게임 오버 처리
