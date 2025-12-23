# 🏆 점수 및 랭킹 시스템 지침서

> 점수 계산, 콤보 시스템, 로컬/글로벌 랭킹 구현

---

## 1. 점수 시스템 개요

### 점수 구성 요소
```
총 점수 = 기본 점수 + 속도 보너스 + 콤보 보너스
```

---

## 2. 점수 계산 공식

### 2.1 기본 점수

| 난이도 | 기본 점수 | 설명 |
|--------|-----------|------|
| 1 (쉬움) | 10점 | 3글자 이하 단어 |
| 2 (보통) | 20점 | 4-5글자 단어 |
| 3 (중간) | 35점 | 6-7글자 단어 |
| 4 (어려움) | 50점 | 8-9글자 단어 |
| 5 (매우 어려움) | 70점 | 10글자 이상 |

### 2.2 속도 보너스

```javascript
// 단어가 화면에 나타난 후 빠르게 입력할수록 보너스
function calculateSpeedBonus(reactionTime, fallDuration) {
  const remainingPercent = 1 - (reactionTime / fallDuration);
  
  if (remainingPercent >= 0.8) return 50;  // 매우 빠름
  if (remainingPercent >= 0.6) return 30;  // 빠름
  if (remainingPercent >= 0.4) return 15;  // 보통
  if (remainingPercent >= 0.2) return 5;   // 느림
  return 0; // 매우 느림
}
```

### 2.3 콤보 보너스

```javascript
// 연속 정답 시 콤보 배수 적용
function getComboMultiplier(combo) {
  if (combo >= 50) return 3.0;   // 🔥 LEGENDARY
  if (combo >= 30) return 2.5;   // ⚡ INSANE
  if (combo >= 20) return 2.0;   // 💜 AMAZING
  if (combo >= 10) return 1.5;   // 🎯 GREAT
  if (combo >= 5)  return 1.2;   // ✨ NICE
  return 1.0;
}

function calculateComboBonus(baseScore, combo) {
  const multiplier = getComboMultiplier(combo);
  return Math.floor(baseScore * (multiplier - 1));
}
```

### 2.4 최종 점수 계산

```javascript
class ScoreCalculator {
  calculate(word, reactionTime, fallDuration, currentCombo) {
    const baseScore = word.difficulty * 10 + 
                     (word.difficulty === 1 ? 0 : (word.difficulty - 1) * 5);
    
    const speedBonus = this.calculateSpeedBonus(reactionTime, fallDuration);
    const comboBonus = this.calculateComboBonus(baseScore, currentCombo);
    
    const totalScore = baseScore + speedBonus + comboBonus;
    
    return {
      baseScore,
      speedBonus,
      comboBonus,
      totalScore,
      multiplier: this.getComboMultiplier(currentCombo)
    };
  }
}
```

---

## 3. 콤보 시스템

### 3.1 콤보 규칙

| 상황 | 결과 |
|------|------|
| 정답 입력 | 콤보 +1 |
| 오답 입력 | 콤보 유지 (패널티 없음) |
| 단어 놓침 (바닥 도달) | 콤보 리셋 (0) |
| 게임 일시정지 | 콤보 유지 |

### 3.2 콤보 효과 표시

```javascript
const COMBO_EFFECTS = {
  5:  { text: 'NICE!',      color: '#22c55e', sound: 'combo_1' },
  10: { text: 'GREAT!',     color: '#3b82f6', sound: 'combo_2' },
  20: { text: 'AMAZING!',   color: '#a855f7', sound: 'combo_3' },
  30: { text: 'INSANE!',    color: '#ec4899', sound: 'combo_4' },
  50: { text: 'LEGENDARY!', color: '#f59e0b', sound: 'combo_5' }
};

function showComboEffect(combo) {
  const milestone = Object.keys(COMBO_EFFECTS)
    .reverse()
    .find(key => combo >= parseInt(key));
  
  if (milestone && combo === parseInt(milestone)) {
    const effect = COMBO_EFFECTS[milestone];
    displayPopup(effect.text, effect.color);
    playSound(effect.sound);
  }
}
```

---

## 4. 로컬 랭킹 시스템

### 4.1 LocalStorage 구조

```javascript
// 저장 데이터 구조
const localRanking = {
  version: 1,
  records: [
    {
      id: 'uuid-1234',
      playerName: 'Player',
      score: 12500,
      combo: 45,
      mode: 'word',        // word, meaning, sentence
      difficulty: 3,
      date: '2025-12-23T12:00:00Z',
      duration: 180        // 게임 시간 (초)
    }
  ]
};
```

### 4.2 RankingManager 클래스

```javascript
// src/js/ui/Ranking.js

class LocalRankingManager {
  constructor() {
    this.storageKey = 'word-quiz-ranking';
    this.maxRecords = 100;
  }

  // 기록 불러오기
  getRecords() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.records || [];
  }

  // 기록 저장
  saveRecord(record) {
    const records = this.getRecords();
    
    record.id = crypto.randomUUID();
    record.date = new Date().toISOString();
    
    records.push(record);
    records.sort((a, b) => b.score - a.score);
    
    // 최대 개수 제한
    if (records.length > this.maxRecords) {
      records.length = this.maxRecords;
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify({
      version: 1,
      records
    }));
    
    return this.getRank(record.score);
  }

  // 순위 확인
  getRank(score) {
    const records = this.getRecords();
    return records.filter(r => r.score > score).length + 1;
  }

  // 상위 N개 기록
  getTopRecords(count = 10) {
    return this.getRecords().slice(0, count);
  }

  // 개인 최고 기록
  getPersonalBest(playerName) {
    const records = this.getRecords()
      .filter(r => r.playerName === playerName);
    return records[0] || null;
  }
}

export default LocalRankingManager;
```

---

## 5. 글로벌 랭킹 시스템

### 5.1 Google Sheets 설정

**1. Google Sheets 생성**
```
| A         | B     | C     | D    | E          | F        |
|-----------|-------|-------|------|------------|----------|
| playerName| score | combo | mode | difficulty | date     |
| Player1   | 15000 | 52    | word | 3          | 2025-... |
```

**2. Apps Script 배포**
```javascript
// Google Apps Script

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    data.playerName,
    data.score,
    data.combo,
    data.mode,
    data.difficulty,
    new Date().toISOString()
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    rank: getRank(data.score)
  }));
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // 헤더 제외, 점수 기준 정렬
  const records = data.slice(1)
    .map(row => ({
      playerName: row[0],
      score: row[1],
      combo: row[2],
      mode: row[3],
      difficulty: row[4],
      date: row[5]
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
  
  return ContentService.createTextOutput(JSON.stringify(records))
    .setMimeType(ContentService.MimeType.JSON);
}

function getRank(score) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const scores = sheet.getRange('B:B').getValues().flat().filter(Number);
  return scores.filter(s => s > score).length + 1;
}
```

### 5.2 클라이언트 연동

```javascript
// src/js/ui/GlobalRanking.js

class GlobalRankingManager {
  constructor(sheetUrl) {
    this.sheetUrl = sheetUrl;
  }

  // 글로벌 랭킹 조회
  async getGlobalRanking() {
    try {
      const response = await fetch(this.sheetUrl);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch global ranking:', error);
      return [];
    }
  }

  // 기록 제출
  async submitScore(record) {
    try {
      const response = await fetch(this.sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to submit score:', error);
      return null;
    }
  }
}

export default GlobalRankingManager;
```

---

## 6. 랭킹 UI

### 6.1 랭킹 보드 HTML

```html
<div class="ranking-modal" id="rankingModal">
  <div class="ranking-content">
    <h2>🏆 RANKING</h2>
    
    <div class="ranking-tabs">
      <button class="tab active" data-tab="local">LOCAL</button>
      <button class="tab" data-tab="global">GLOBAL</button>
    </div>
    
    <div class="ranking-list" id="rankingList">
      <!-- 동적 생성 -->
    </div>
    
    <button class="btn close-btn">CLOSE</button>
  </div>
</div>
```

### 6.2 랭킹 아이템 렌더링

```javascript
function renderRankingItem(record, rank) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  
  return `
    <div class="ranking-item ${rank <= 3 ? 'top-rank' : ''}">
      <span class="rank">${medal}</span>
      <span class="name">${record.playerName}</span>
      <span class="score">${record.score.toLocaleString()}</span>
      <span class="combo">${record.combo}x</span>
    </div>
  `;
}
```

---

## 7. 게임 결과 화면

```html
<div class="result-screen" id="resultScreen">
  <h1>GAME OVER</h1>
  
  <div class="result-stats">
    <div class="stat">
      <span class="label">SCORE</span>
      <span class="value" id="finalScore">0</span>
    </div>
    <div class="stat">
      <span class="label">MAX COMBO</span>
      <span class="value" id="maxCombo">0</span>
    </div>
    <div class="stat">
      <span class="label">RANK</span>
      <span class="value" id="currentRank">#1</span>
    </div>
  </div>
  
  <div class="name-input">
    <input type="text" id="playerName" placeholder="Enter your name" maxlength="10">
    <button class="btn" id="submitScore">SUBMIT</button>
  </div>
  
  <div class="result-actions">
    <button class="btn" id="retryBtn">RETRY</button>
    <button class="btn" id="menuBtn">MENU</button>
  </div>
</div>
```

---

## 8. 통계 추적 (선택)

```javascript
class GameStats {
  constructor() {
    this.stats = {
      totalGames: 0,
      totalScore: 0,
      totalWords: 0,
      correctWords: 0,
      missedWords: 0,
      bestCombo: 0,
      playTime: 0  // 초
    };
    
    this.load();
  }

  load() {
    const saved = localStorage.getItem('game-stats');
    if (saved) {
      this.stats = JSON.parse(saved);
    }
  }

  save() {
    localStorage.setItem('game-stats', JSON.stringify(this.stats));
  }

  recordGame(gameResult) {
    this.stats.totalGames++;
    this.stats.totalScore += gameResult.score;
    this.stats.totalWords += gameResult.totalWords;
    this.stats.correctWords += gameResult.correctWords;
    this.stats.missedWords += gameResult.missedWords;
    this.stats.bestCombo = Math.max(this.stats.bestCombo, gameResult.maxCombo);
    this.stats.playTime += gameResult.duration;
    
    this.save();
  }

  getAccuracy() {
    if (this.stats.totalWords === 0) return 0;
    return (this.stats.correctWords / this.stats.totalWords * 100).toFixed(1);
  }
}
```

---

## 9. 구현 체크리스트

- [ ] ScoreCalculator 클래스 구현
- [ ] 콤보 시스템 구현
- [ ] 콤보 효과 UI
- [ ] LocalRankingManager 구현
- [ ] 랭킹 UI 디자인
- [ ] Google Sheets 설정
- [ ] Apps Script 배포
- [ ] GlobalRankingManager 연동
- [ ] 게임 결과 화면
- [ ] 통계 추적 (선택)
