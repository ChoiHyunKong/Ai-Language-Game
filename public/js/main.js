/**
 * AI 지식 게임 - 메인 진입점 (2차 개선 버전)
 */

import { LanguageManager } from './data/LanguageManager.js';
import { CSVLoader } from './data/CSVLoader.js';
import { GameEngine } from './game/GameEngine.js';
import { ScreenManager } from './ui/ScreenManager.js';
import { ScoreManager } from './ui/ScoreManager.js';

class App {
  constructor() {
    this.languageManager = new LanguageManager('ko');
    this.csvLoader = null;
    this.gameEngine = null;
    this.screenManager = new ScreenManager();
    this.scoreManager = new ScoreManager();

    this.settings = {
      mode: 'word',
      language: 'ko',
      difficulty: 3
    };

    // 마지막 게임 결과 저장
    this.lastResult = null;
  }

  async init() {
    try {
      this.csvLoader = new CSVLoader('data/words.csv', this.languageManager);
      await this.csvLoader.load();

      this.gameEngine = new GameEngine(
        'gameCanvas',
        this.csvLoader,
        this.languageManager
      );

      this.bindEvents();
      this.createToastElement();

      document.getElementById('loadingScreen').classList.add('hidden');

      console.log('✅ 게임 초기화 완료');
    } catch (error) {
      console.error('❌ 초기화 실패:', error);
      document.getElementById('loadingText').textContent = '로딩 실패. 새로고침해주세요.';
    }
  }

  // 🆕 토스트 알림 요소 생성
  createToastElement() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast hidden';
    document.body.appendChild(toast);
  }

  bindEvents() {
    // 메뉴 이벤트
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('rankingBtn').addEventListener('click', () => this.showRanking());

    // 설정 변경
    document.getElementById('gameModeSelect').addEventListener('change', (e) => {
      this.settings.mode = e.target.value;
    });

    document.getElementById('languageSelect').addEventListener('change', (e) => {
      this.settings.language = e.target.value;
      this.languageManager.setLanguage(e.target.value);
    });

    document.getElementById('difficultySelect').addEventListener('change', (e) => {
      this.settings.difficulty = parseInt(e.target.value);
    });

    // 게임 이벤트
    document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
    document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
    document.getElementById('quitBtn').addEventListener('click', () => this.quitGame());

    // 🆕 게임 오버 후 결과 보기 버튼
    document.getElementById('finishGameBtn').addEventListener('click', () => this.showResultScreen());

    // 입력 이벤트
    document.getElementById('wordInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.checkInput();
      }
    });

    // 결과 화면 이벤트
    document.getElementById('retryBtn').addEventListener('click', () => this.startGame());
    document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
    document.getElementById('submitScoreBtn').addEventListener('click', () => this.submitScore());

    // 랭킹 모달 닫기
    document.getElementById('closeRankingBtn').addEventListener('click', () => {
      document.getElementById('rankingModal').classList.add('hidden');
    });

    // 단어 설명 모달 닫기
    document.getElementById('closeDetailBtn').addEventListener('click', () => {
      document.getElementById('wordDetailModal').classList.add('hidden');
    });

    // 게임 엔진 콜백
    this.gameEngine.onScoreUpdate = (score, combo) => {
      this.updateDisplay(score, combo);
    };

    this.gameEngine.onComboMilestone = (combo, effect) => {
      this.showComboEffect(effect);
    };

    this.gameEngine.onLifeLost = (life) => {
      document.getElementById('lifeDisplay').textContent = life;
    };

    // 🆕 게임 오버 시 화면 유지
    this.gameEngine.onGameOver = (result) => {
      this.lastResult = result;
      this.showGameOverOverlay();
    };

    // 단어 완료 콜백
    this.gameEngine.onWordCompleted = (wordData) => {
      this.addWordToHistory(wordData);
    };

    // 속도 증가 콜백
    this.gameEngine.onSpeedUp = (level) => {
      this.showSpeedUp(level);
    };
  }

  startGame() {
    // 게임 오버 오버레이 숨기기
    document.getElementById('gameOverOverlay').classList.add('hidden');

    this.screenManager.showScreen('gameScreen');

    this.gameEngine.setMode(this.settings.mode);
    this.gameEngine.setDifficulty(this.settings.difficulty);

    // UI 초기화
    document.getElementById('scoreDisplay').textContent = '0';
    document.getElementById('comboDisplay').textContent = '0';
    document.getElementById('lifeDisplay').textContent = '3';
    document.getElementById('speedDisplay').textContent = 'x1';
    document.getElementById('wordInput').value = '';
    document.getElementById('wordInput').disabled = false;

    // 단어 기록 패널 초기화
    document.getElementById('wordList').innerHTML = '';
    document.getElementById('wordCount').textContent = '0';

    document.getElementById('wordInput').focus();

    this.gameEngine.start();
  }

  checkInput() {
    const input = document.getElementById('wordInput');
    const value = input.value.trim();

    if (value) {
      const result = this.gameEngine.checkInput(value);

      if (result.success) {
        input.classList.add('correct');
        setTimeout(() => input.classList.remove('correct'), 300);
      } else {
        input.classList.add('wrong');
        setTimeout(() => input.classList.remove('wrong'), 300);
      }

      input.value = '';
    }
  }

  updateDisplay(score, combo) {
    document.getElementById('scoreDisplay').textContent = score.toLocaleString();
    document.getElementById('comboDisplay').textContent = combo;
  }

  showComboEffect(effect) {
    const popup = document.getElementById('comboPopup');
    popup.textContent = effect.text;
    popup.style.color = effect.color;
    popup.classList.remove('hidden');

    setTimeout(() => {
      popup.classList.add('hidden');
    }, 500);
  }

  showSpeedUp(level) {
    document.getElementById('speedDisplay').textContent = `x${level}`;

    const popup = document.getElementById('speedUpPopup');
    popup.textContent = `SPEED x${level}!`;
    popup.classList.remove('hidden');

    setTimeout(() => {
      popup.classList.add('hidden');
    }, 1000);
  }

  // 🆕 단어 기록에 추가 (아래에서부터 쌓기)
  addWordToHistory(wordData) {
    const wordList = document.getElementById('wordList');
    const wordCount = document.getElementById('wordCount');

    const item = document.createElement('div');
    item.className = 'word-item' + (wordData.isGolden ? ' golden' : '');
    item.innerHTML = `
      <span>${wordData.word}</span>
      <span class="score">+${wordData.score}</span>
    `;

    // 클릭 시 설명 표시
    item.addEventListener('click', () => {
      this.showWordDetail(wordData.word, wordData.meaning);
    });

    // 🆕 아래에서부터 쌓기 (flex-direction: column-reverse로 인해 appendChild가 아래로 감)
    wordList.appendChild(item);

    // 카운트 업데이트
    const count = parseInt(wordCount.textContent) + 1;
    wordCount.textContent = count;

    // 스크롤 최상단으로 (실제로는 최하단 단어가 보임)
    wordList.scrollTop = 0;
  }

  showWordDetail(word, meaning) {
    document.getElementById('detailWord').textContent = word;
    document.getElementById('detailMeaning').textContent = meaning || '설명이 없습니다.';
    document.getElementById('wordDetailModal').classList.remove('hidden');
  }

  pauseGame() {
    this.gameEngine.pause();
    document.getElementById('pauseOverlay').classList.remove('hidden');
  }

  resumeGame() {
    document.getElementById('pauseOverlay').classList.add('hidden');
    this.gameEngine.resume();
    document.getElementById('wordInput').focus();
  }

  quitGame() {
    this.gameEngine.stop();
    document.getElementById('pauseOverlay').classList.add('hidden');
    document.getElementById('gameOverOverlay').classList.add('hidden');
    this.showMenu();
  }

  // 🆕 게임 오버 오버레이 표시 (화면 유지)
  showGameOverOverlay() {
    document.getElementById('wordInput').disabled = true;
    document.getElementById('gameOverOverlay').classList.remove('hidden');

    // 인포 마크 강조
    const panelInfo = document.getElementById('panelInfo');
    panelInfo.textContent = '👆 단어를 클릭해서 학습하세요!';
    panelInfo.style.color = '#22c55e';
    panelInfo.style.background = 'rgba(34, 197, 94, 0.15)';
  }

  // 🆕 결과 화면으로 이동
  showResultScreen() {
    if (this.lastResult) {
      document.getElementById('finalScore').textContent = this.lastResult.score.toLocaleString();
      document.getElementById('maxCombo').textContent = this.lastResult.maxCombo;
      document.getElementById('accuracy').textContent = this.lastResult.accuracy + '%';
      document.getElementById('finalSpeed').textContent = 'x' + this.lastResult.speedLevel;
    }

    document.getElementById('gameOverOverlay').classList.add('hidden');
    this.screenManager.showScreen('resultScreen');
  }

  // 🆕 토스트 알림 표시
  showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  // 🆕 점수 저장 후 알림 + 랭킹 표시
  submitScore() {
    const playerName = document.getElementById('playerName').value.trim() || 'Player';
    const result = this.gameEngine.getResult();

    const rank = this.scoreManager.saveLocal({
      playerName,
      score: result.score,
      maxCombo: result.maxCombo,
      accuracy: result.accuracy,
      speedLevel: result.speedLevel,
      mode: this.settings.mode,
      difficulty: this.settings.difficulty,
      date: new Date().toISOString()
    });

    // 토스트 알림 표시
    this.showToast(`✅ 기록이 저장되었습니다! (${rank}위)`);

    // 1.5초 후 랭킹 모달 표시
    setTimeout(() => {
      this.showRanking();
    }, 1500);
  }

  showRanking() {
    const records = this.scoreManager.getTopRecords(10);
    const rankingList = document.getElementById('rankingList');

    if (records.length === 0) {
      rankingList.innerHTML = '<div class="ranking-empty">기록이 없습니다</div>';
    } else {
      rankingList.innerHTML = records.map((record, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        return `
          <div class="ranking-item ${rank <= 3 ? 'top-3' : ''}">
            <span class="rank">${medal}</span>
            <span class="name">${record.playerName}</span>
            <span class="score">${record.score.toLocaleString()}</span>
          </div>
        `;
      }).join('');
    }

    document.getElementById('rankingModal').classList.remove('hidden');
  }

  showMenu() {
    this.screenManager.showScreen('menuScreen');
  }
}

// 앱 시작
const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
