/**
 * AI 지식 게임 - 메인 진입점 (사운드 및 배경 개선 버전)
 */

import { LanguageManager } from './data/LanguageManager.js';
import { CSVLoader } from './data/CSVLoader.js';
import { GameEngine } from './game/GameEngine.js';
import { ScreenManager } from './ui/ScreenManager.js';
import { ScoreManager } from './ui/ScoreManager.js';
import { SoundManager } from './ui/SoundManager.js';

class App {
  constructor() {
    this.languageManager = new LanguageManager('ko');
    this.csvLoader = null;
    this.gameEngine = null;
    this.screenManager = new ScreenManager();
    this.scoreManager = new ScoreManager();
    this.soundManager = new SoundManager(); // 🆕 사운드 매니저

    this.settings = {
      mode: 'word',
      language: 'ko',
      difficulty: 3
    };

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
      this.createParticles(); // 🆕 파티클 생성

      document.getElementById('loadingScreen').classList.add('hidden');

      console.log('✅ 게임 초기화 완료');
    } catch (error) {
      console.error('❌ 초기화 실패:', error);
      document.getElementById('loadingText').textContent = '로딩 실패. 새로고침해주세요.';
    }
  }

  // 🆕 배경 파티클 생성
  createParticles() {
    const container = document.getElementById('bgParticles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 15}s`;
      particle.style.animationDuration = `${10 + Math.random() * 10}s`;

      // 색상 변화
      const colors = ['#a855f7', '#06b6d4', '#ec4899', '#3b82f6'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.boxShadow = `0 0 10px ${particle.style.background}`;

      container.appendChild(particle);
    }
  }

  createToastElement() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast hidden';
    document.body.appendChild(toast);
  }

  bindEvents() {
    // 메뉴 이벤트 - 사운드 초기화
    document.getElementById('startBtn').addEventListener('click', () => {
      this.soundManager.init(); // 첫 클릭 시 사운드 초기화
      this.soundManager.playStart();
      this.startGame();
    });

    document.getElementById('rankingBtn').addEventListener('click', () => {
      this.soundManager.init();
      this.soundManager.playClick();
      this.showRanking();
    });

    // 🆕 음소거 버튼
    document.getElementById('muteBtn').addEventListener('click', () => {
      this.soundManager.init();
      const isMuted = this.soundManager.toggleMute();
      document.getElementById('muteIcon').textContent = isMuted ? '🔇' : '🔊';
      document.getElementById('muteBtn').classList.toggle('muted', isMuted);
    });

    // 설정 변경
    document.getElementById('gameModeSelect').addEventListener('change', (e) => {
      this.soundManager.playClick();
      this.settings.mode = e.target.value;
    });

    document.getElementById('languageSelect').addEventListener('change', (e) => {
      this.soundManager.playClick();
      this.settings.language = e.target.value;
      this.languageManager.setLanguage(e.target.value);
    });

    document.getElementById('difficultySelect').addEventListener('change', (e) => {
      this.soundManager.playClick();
      this.settings.difficulty = parseInt(e.target.value);
    });

    // 게임 이벤트
    document.getElementById('pauseBtn').addEventListener('click', () => {
      this.soundManager.playClick();
      this.pauseGame();
    });

    document.getElementById('resumeBtn').addEventListener('click', () => {
      this.soundManager.playClick();
      this.resumeGame();
    });

    document.getElementById('quitBtn').addEventListener('click', () => {
      this.soundManager.playClick();
      this.quitGame();
    });

    document.getElementById('finishGameBtn').addEventListener('click', () => {
      this.soundManager.playClick();
      this.showResultScreen();
    });

    // 입력 이벤트
    document.getElementById('wordInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.checkInput();
      }
    });

    // 결과 화면 이벤트
    document.getElementById('retryBtn').addEventListener('click', () => {
      this.soundManager.playStart();
      this.startGame();
    });

    document.getElementById('menuBtn').addEventListener('click', () => {
      this.soundManager.playClick();
      this.showMenu();
    });

    document.getElementById('submitScoreBtn').addEventListener('click', () => {
      this.soundManager.playClick();
      this.submitScore();
    });

    // 모달 닫기
    document.getElementById('closeRankingBtn').addEventListener('click', () => {
      this.soundManager.playClick();
      document.getElementById('rankingModal').classList.add('hidden');
    });

    document.getElementById('closeDetailBtn').addEventListener('click', () => {
      this.soundManager.playClick();
      document.getElementById('wordDetailModal').classList.add('hidden');
    });

    // 게임 엔진 콜백
    this.gameEngine.onScoreUpdate = (score, combo) => {
      this.updateDisplay(score, combo);
    };

    this.gameEngine.onComboMilestone = (combo, effect) => {
      this.soundManager.playCombo(Math.floor(combo / 10) + 1);
      this.showComboEffect(effect);
    };

    this.gameEngine.onLifeLost = (life) => {
      document.getElementById('lifeDisplay').textContent = life;
    };

    this.gameEngine.onGameOver = (result) => {
      this.soundManager.playGameOver();
      this.lastResult = result;
      this.showGameOverOverlay();
    };

    // 단어 완료 콜백
    this.gameEngine.onWordCompleted = (wordData) => {
      if (wordData.isGolden) {
        this.soundManager.playGolden();
      } else {
        this.soundManager.playCorrect();
      }
      this.addWordToHistory(wordData);
    };

    // 속도 증가 콜백
    this.gameEngine.onSpeedUp = (level) => {
      this.soundManager.playSpeedUp();
      this.showSpeedUp(level);
    };
  }

  startGame() {
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

    // 인포 마크 초기화
    const panelInfo = document.getElementById('panelInfo');
    panelInfo.textContent = '💡 단어를 클릭하면 설명을 볼 수 있어요!';
    panelInfo.style.color = '';
    panelInfo.style.background = '';

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
        this.soundManager.playWrong(); // 🆕 오답 효과음
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

  addWordToHistory(wordData) {
    const wordList = document.getElementById('wordList');
    const wordCount = document.getElementById('wordCount');

    const item = document.createElement('div');
    item.className = 'word-item' + (wordData.isGolden ? ' golden' : '');
    item.innerHTML = `
      <span>${wordData.word}</span>
      <span class="score">+${wordData.score}</span>
    `;

    item.addEventListener('click', () => {
      this.soundManager.playClick();
      this.showWordDetail(wordData.word, wordData.meaning);
    });

    wordList.appendChild(item);

    const count = parseInt(wordCount.textContent) + 1;
    wordCount.textContent = count;

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

  showGameOverOverlay() {
    document.getElementById('wordInput').disabled = true;
    document.getElementById('gameOverOverlay').classList.remove('hidden');

    const panelInfo = document.getElementById('panelInfo');
    panelInfo.textContent = '👆 단어를 클릭해서 학습하세요!';
    panelInfo.style.color = '#22c55e';
    panelInfo.style.background = 'rgba(34, 197, 94, 0.15)';
  }

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

  showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

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

    this.showToast(`✅ 기록이 저장되었습니다! (${rank}위)`);

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
