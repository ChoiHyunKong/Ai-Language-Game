import { LanguageManager } from './data/LanguageManager.js';
import { CSVLoader } from './data/CSVLoader.js';
import { GameEngine } from './game/GameEngine.js';
import { ScreenManager } from './ui/ScreenManager.js';
import { ScoreManager } from './ui/ScoreManager.js';
import { SoundManager } from './ui/SoundManager.js';
import { authenticateUser, startGameSession, recordGameAction, submitRanking, fetchRankings, updateSession, endGameSession } from '../../src/firebase/security.js';

class App {
  constructor() {
    this.languageManager = new LanguageManager('ko');
    this.csvLoader = null;
    this.gameEngine = null;
    this.screenManager = new ScreenManager();
    this.scoreManager = new ScoreManager();
    this.soundManager = new SoundManager();

    this.settings = {
      mode: 'word',
      language: 'ko',
      difficulty: 3
    };

    this.lastResult = null;

    this.currentUser = null;
    this.currentSession = null;

    this.currentDifficulty = 'all';
    this.currentPage = 1;
    this.rankingsPerPage = 10;
    this.allRankings = [];
  }

  async init() {
    try {
      this.currentUser = await authenticateUser();

      this.csvLoader = new CSVLoader('/words.csv', this.languageManager);
      await this.csvLoader.load();

      this.gameEngine = new GameEngine(
        'gameCanvas',
        this.csvLoader,
        this.languageManager
      );

      this.bindEvents();
      this.createToastElement();

      document.getElementById('loadingScreen').classList.add('hidden');
    } catch (error) {
      document.getElementById('loadingText').textContent = '로딩 실패. 새로고침해주세요.';
    }
  }

  createToastElement() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast hidden';
    document.body.appendChild(toast);
  }

  bindEvents() {
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('rankingBtn').addEventListener('click', () => this.showRanking());

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

    document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
    document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
    document.getElementById('quitBtn').addEventListener('click', () => this.quitGame());

    document.getElementById('finishGameBtn').addEventListener('click', () => this.showResultScreen());

    document.getElementById('wordInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.checkInput();
      }
    });

    document.getElementById('retryBtn').addEventListener('click', () => this.startGame());
    document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
    document.getElementById('submitScoreBtn').addEventListener('click', () => this.submitScore());

    document.getElementById('closeRankingBtn').addEventListener('click', () => {
      document.getElementById('rankingModal').classList.add('hidden');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentDifficulty = e.target.dataset.difficulty;
        this.currentPage = 1;
        this.renderRankings();
      });
    });

    document.getElementById('prevPageBtn').addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderRankings();
      }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
      const filteredRankings = this.getFilteredRankings();
      const totalPages = Math.ceil(filteredRankings.length / this.rankingsPerPage);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderRankings();
      }
    });

    document.getElementById('closeDetailBtn').addEventListener('click', () => {
      document.getElementById('wordDetailModal').classList.add('hidden');
    });

    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = this.soundManager.toggleMute();
        const muteIcon = document.getElementById('muteIcon');
        if (muteIcon) {
          muteIcon.textContent = isMuted ? '🔇' : '🔊';
        }
      });
    }

    this.gameEngine.onScoreUpdate = (score) => {
      this.updateDisplay(score);
    };

    this.gameEngine.onComboMilestone = (combo, effect) => {
      this.showComboEffect(effect);
    };

    this.gameEngine.onLifeLost = (life) => {
      document.getElementById('lifeDisplay').textContent = life;
    };

    this.gameEngine.onGameOver = (result) => {
      this.lastResult = result;
      this.showGameOverOverlay();
    };

    this.gameEngine.onWordCompleted = (wordData) => {
      this.addWordToHistory(wordData);

      if (this.currentSession) {
        recordGameAction(this.currentSession, {
          type: 'answer',
          data: { word: wordData.word, correct: true },
          score: wordData.score
        });
        updateSession(this.currentSession);
      }
    };

    this.gameEngine.onSpeedUp = (level) => {
      this.showSpeedUp(level);
    };
  }

  startGame() {
    this.soundManager.init();
    this.soundManager.playStart();

    document.getElementById('gameOverOverlay').classList.add('hidden');

    this.screenManager.showScreen('gameScreen');

    this.gameEngine.setMode(this.settings.mode);
    this.gameEngine.setDifficulty(this.settings.difficulty);

    this.currentSession = startGameSession({
      mode: this.settings.mode,
      difficulty: this.settings.difficulty
    });

    document.getElementById('scoreDisplay').textContent = '0';
    document.getElementById('comboDisplay').textContent = '0';
    document.getElementById('lifeDisplay').textContent = '3';
    document.getElementById('speedDisplay').textContent = 'x1';
    document.getElementById('wordInput').value = '';
    document.getElementById('wordInput').disabled = false;

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
        if (result.word && result.word.isGolden) {
          this.soundManager.playGolden();
        } else {
          this.soundManager.playCorrect();
        }
        input.classList.add('correct');
        setTimeout(() => input.classList.remove('correct'), 300);
      } else {
        this.soundManager.playWrong();
        input.classList.add('wrong');
        setTimeout(() => input.classList.remove('wrong'), 300);
      }

      input.value = '';
    }
  }

  updateDisplay(score) {
    document.getElementById('scoreDisplay').textContent = score.toLocaleString();
    document.getElementById('comboDisplay').textContent = this.gameEngine.combo;
  }

  showComboEffect(effect) {
    this.soundManager.playCombo();

    const popup = document.getElementById('comboPopup');
    popup.textContent = effect.text;
    popup.style.color = effect.color;
    popup.classList.remove('hidden');

    setTimeout(() => {
      popup.classList.add('hidden');
    }, 500);
  }

  showSpeedUp(level) {
    this.soundManager.playSpeedUp();

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
    this.soundManager.playGameOver();

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

  async submitScore() {
    const playerName = document.getElementById('playerName').value.trim() || 'Player';
    const result = this.gameEngine.getResult();

    try {
      if (this.currentSession) {
        await submitRanking(playerName, this.currentSession);

        endGameSession();

        this.showToast(`✅ 랭킹이 저장되었습니다!`);

        setTimeout(() => {
          this.showRanking();
        }, 1500);
      }
    } catch (error) {
      this.showToast(`❌ 랭킹 저장 실패: ${error.message}`);

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

      this.showToast(`✅ 로컬 기록 저장됨 (${rank}위)`);
    }
  }

  getFilteredRankings() {
    if (this.currentDifficulty === 'all') {
      return this.allRankings;
    }
    return this.allRankings.filter(r => r.difficulty === parseInt(this.currentDifficulty));
  }

  renderRankings() {
    const filteredRankings = this.getFilteredRankings();
    const totalPages = Math.max(1, Math.ceil(filteredRankings.length / this.rankingsPerPage));

    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    const startIdx = (this.currentPage - 1) * this.rankingsPerPage;
    const endIdx = startIdx + this.rankingsPerPage;
    const pageRankings = filteredRankings.slice(startIdx, endIdx);

    const rankingList = document.getElementById('rankingList');

    if (pageRankings.length === 0) {
      rankingList.innerHTML = '<div class="ranking-empty">기록이 없습니다</div>';
    } else {
      const showDifficulty = this.currentDifficulty === 'all';

      rankingList.innerHTML = pageRankings.map((record, index) => {
        const globalRank = startIdx + index + 1;
        const medal = globalRank === 1 ? '🥇' : globalRank === 2 ? '🥈' : globalRank === 3 ? '🥉' : `#${globalRank}`;
        const difficultyDisplay = `⭐x${record.difficulty || 3}`;

        return `
          <div class="ranking-item ${globalRank <= 3 ? 'top-3' : ''}">
            <span class="rank">${medal}</span>
            <span class="name">${record.playerName}</span>
            <span class="score">${record.score.toLocaleString()}</span>
            ${showDifficulty ? `<span class="difficulty">${difficultyDisplay}</span>` : ''}
          </div>
        `;
      }).join('');
    }

    document.getElementById('pageInfo').textContent = `${this.currentPage} / ${totalPages}`;
    document.getElementById('prevPageBtn').disabled = this.currentPage === 1;
    document.getElementById('nextPageBtn').disabled = this.currentPage === totalPages;
  }

  async showRanking() {
    try {
      const records = await fetchRankings('all', 'all');
      this.allRankings = records;

      this.currentPage = 1;
      this.currentDifficulty = 'all';

      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === 'all');
      });

      this.renderRankings();

      document.getElementById('rankingModal').classList.remove('hidden');
    } catch (error) {
      const records = this.scoreManager.getTopRecords(100);
      this.allRankings = records;
      this.currentPage = 1;
      this.currentDifficulty = 'all';

      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === 'all');
      });

      this.renderRankings();
      document.getElementById('rankingModal').classList.remove('hidden');
    }
  }

  showMenu() {
    this.screenManager.showScreen('menuScreen');
  }
}

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
