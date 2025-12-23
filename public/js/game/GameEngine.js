/**
 * 게임 엔진 - AI 지식 게임 (개선 버전)
 * 
 * 개선사항:
 * 1. 중복 단어 방지
 * 2. 입력 단어 기록 (우측 스택)
 * 3. 5개마다 속도 30% 증가
 * 4. 골든 워드 (2배 점수)
 * 5. 오타 페널티
 */
export class GameEngine {
    constructor(canvasId, csvLoader, languageManager) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.csvLoader = csvLoader;
        this.languageManager = languageManager;

        // 게임 상태
        this.fallingWords = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.life = 3;
        this.isRunning = false;
        this.isPaused = false;

        // 통계
        this.totalWords = 0;
        this.correctWords = 0;
        this.wrongInputs = 0;

        // 🆕 중복 방지: 이미 사용된 단어 ID 추적
        this.usedWordIds = new Set();

        // 🆕 입력된 단어 기록
        this.completedWords = [];

        // 🆕 속도 증가 시스템
        this.speedLevel = 1;
        this.wordsUntilSpeedUp = 5;

        // 설정
        this.mode = 'word';
        this.difficulty = 3;

        this.config = {
            spawnInterval: 2500,
            baseFallSpeed: 0.5,
            maxWords: 5,
            goldenWordChance: 0.15 // 🆕 15% 확률로 골든 워드
        };

        // 타이머
        this.spawnTimer = null;
        this.animationFrame = null;

        // 콜백
        this.onScoreUpdate = null;
        this.onComboMilestone = null;
        this.onLifeLost = null;
        this.onGameOver = null;
        this.onWordCompleted = null; // 🆕 단어 완료 시 콜백
        this.onSpeedUp = null; // 🆕 속도 증가 시 콜백

        // 캔버스 크기 설정
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    setMode(mode) {
        this.mode = mode;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.config.spawnInterval = 3000 - (difficulty * 300);
        this.config.baseFallSpeed = 0.3 + (difficulty * 0.15);
    }

    start() {
        this.reset();
        this.isRunning = true;
        this.isPaused = false;

        setTimeout(() => {
            this.resizeCanvas();
            this.spawnWord();

            this.spawnTimer = setInterval(() => {
                if (!this.isPaused && this.fallingWords.length < this.config.maxWords) {
                    this.spawnWord();
                }
            }, this.config.spawnInterval);

            this.gameLoop();
        }, 100);
    }

    reset() {
        this.fallingWords = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.life = 3;
        this.totalWords = 0;
        this.correctWords = 0;
        this.wrongInputs = 0;

        // 🆕 새 게임 시 초기화
        this.usedWordIds.clear();
        this.completedWords = [];
        this.speedLevel = 1;
        this.wordsUntilSpeedUp = 5;
    }

    spawnWord() {
        const data = this.getRandomWordData();
        if (!data) {
            console.log('⚠️ 더 이상 사용 가능한 단어가 없습니다.');
            return;
        }

        const wordData = this.createWordObject(data);
        this.fallingWords.push(wordData);
        this.totalWords++;
    }

    getRandomWordData() {
        const minDiff = Math.max(1, this.difficulty - 1);
        const maxDiff = Math.min(5, this.difficulty + 1);

        // 🆕 이미 사용된 단어 제외
        const available = this.csvLoader.getByDifficultyRange(minDiff, maxDiff)
            .filter(row => !this.usedWordIds.has(row.id));

        if (available.length === 0) {
            // 모든 단어 사용됨 - 전체에서 미사용 단어 찾기
            const allAvailable = this.csvLoader.getAll()
                .filter(row => !this.usedWordIds.has(row.id));

            if (allAvailable.length === 0) return null;

            const randomIndex = Math.floor(Math.random() * allAvailable.length);
            return allAvailable[randomIndex];
        }

        const randomIndex = Math.floor(Math.random() * available.length);
        return available[randomIndex];
    }

    createWordObject(data) {
        // 🆕 사용된 단어로 표시
        this.usedWordIds.add(data.id);

        let display, answer;

        switch (this.mode) {
            case 'meaning':
                display = this.csvLoader.getMeaning(data);
                answer = this.csvLoader.getWord(data);
                break;
            case 'sentence':
                display = this.csvLoader.getSentence(data) || this.csvLoader.getMeaning(data);
                answer = this.csvLoader.getWord(data);
                break;
            case 'word':
            default:
                display = this.csvLoader.getWord(data);
                answer = this.csvLoader.getWord(data);
                break;
        }

        this.ctx.font = '18px "Noto Sans KR"';
        const textWidth = this.ctx.measureText(display).width;

        // 🆕 골든 워드 (2배 점수)
        const isGolden = Math.random() < this.config.goldenWordChance;

        // 🆕 현재 속도 레벨 적용
        const currentSpeed = (this.config.baseFallSpeed + (data.difficulty * 0.1)) *
            (1 + (this.speedLevel - 1) * 0.3);

        return {
            id: data.id,
            dataId: data.id,
            display,
            answer,
            meaning: this.csvLoader.getMeaning(data),
            difficulty: data.difficulty,
            x: Math.random() * (this.canvas.width - textWidth - 40) + 20,
            y: -30,
            speed: currentSpeed,
            color: isGolden ? '#fbbf24' : this.getDifficultyColor(data.difficulty),
            isGolden, // 🆕 골든 워드 플래그
            createdAt: Date.now(),
            removed: false
        };
    }

    getDifficultyColor(difficulty) {
        const colors = {
            1: '#22c55e',
            2: '#84cc16',
            3: '#f59e0b',
            4: '#f97316',
            5: '#ef4444'
        };
        return colors[difficulty] || colors[3];
    }

    gameLoop() {
        if (!this.isRunning) return;

        if (!this.isPaused) {
            this.update();
            this.render();
        }

        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (this.canvas.height < 100) return;

        this.fallingWords.forEach(word => {
            if (!word.removed) {
                word.y += word.speed;

                if (word.y > this.canvas.height - 80) {
                    this.onWordMissed(word);
                }
            }
        });

        this.fallingWords = this.fallingWords.filter(w => !w.removed);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.fallingWords.forEach(word => {
            if (!word.removed) {
                this.drawWord(word);
            }
        });
    }

    drawWord(word) {
        const fontSize = this.mode === 'sentence' ? 16 : 18;
        this.ctx.font = `500 ${fontSize}px "Noto Sans KR"`;

        this.ctx.shadowColor = word.color;
        this.ctx.shadowBlur = word.isGolden ? 20 : 10; // 🆕 골든은 더 강한 글로우

        const padding = 10;
        const textWidth = this.ctx.measureText(word.display).width;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = fontSize + padding * 2;

        // 🆕 골든 워드는 다른 배경
        this.ctx.fillStyle = word.isGolden ? 'rgba(251, 191, 36, 0.2)' : 'rgba(0, 0, 0, 0.7)';

        const x = word.x - padding;
        const y = word.y - fontSize - padding;
        const radius = 8;

        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + boxWidth - radius, y);
        this.ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + radius);
        this.ctx.lineTo(x + boxWidth, y + boxHeight - radius);
        this.ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - radius, y + boxHeight);
        this.ctx.lineTo(x + radius, y + boxHeight);
        this.ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = word.color;
        this.ctx.lineWidth = word.isGolden ? 3 : 2; // 🆕 골든은 두꺼운 테두리
        this.ctx.stroke();

        // 🆕 골든 워드 표시
        if (word.isGolden) {
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.font = '12px "Orbitron"';
            this.ctx.fillText('x2', x + boxWidth - 20, y + 12);
        }

        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `500 ${fontSize}px "Noto Sans KR"`;
        this.ctx.fillText(word.display, word.x, word.y);
    }

    // 🆕 오타도 체크하는 새로운 입력 처리
    checkInput(input) {
        const normalizedInput = input.toLowerCase().trim();

        const matchedWord = this.fallingWords
            .filter(w => !w.removed && w.answer.toLowerCase() === normalizedInput)
            .sort((a, b) => b.y - a.y)[0];

        if (matchedWord) {
            this.onWordMatched(matchedWord);
            return { success: true, word: matchedWord };
        } else {
            // 🆕 오타 페널티
            this.wrongInputs++;
            this.combo = 0;
            this.life--;

            this.onLifeLost?.(this.life);
            this.onScoreUpdate?.(this.score, this.combo);

            if (this.life <= 0) {
                this.gameOver();
            }

            return { success: false, word: null };
        }
    }

    onWordMatched(word) {
        word.removed = true;
        this.correctWords++;
        this.combo++;

        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        // 🆕 골든 워드는 2배 점수
        const multiplier = word.isGolden ? 2 : 1;
        const baseScore = word.difficulty * 10 * multiplier;
        const comboBonus = Math.floor(this.combo * 5);
        const speedBonus = this.calculateSpeedBonus(word);

        this.score += baseScore + comboBonus + speedBonus;

        // 🆕 완료된 단어 기록
        this.completedWords.push({
            word: word.answer,
            meaning: word.meaning,
            display: word.display,
            isGolden: word.isGolden,
            score: baseScore + comboBonus + speedBonus
        });

        // 🆕 단어 완료 콜백
        this.onWordCompleted?.(this.completedWords[this.completedWords.length - 1]);

        // 🆕 속도 증가 체크
        this.wordsUntilSpeedUp--;
        if (this.wordsUntilSpeedUp <= 0) {
            this.speedLevel++;
            this.wordsUntilSpeedUp = 5;
            this.onSpeedUp?.(this.speedLevel);

            // 현재 떨어지는 단어들 속도 업데이트
            this.fallingWords.forEach(w => {
                w.speed *= 1.3;
            });
        }

        this.onScoreUpdate?.(this.score, this.combo);
        this.checkComboMilestone();
    }

    calculateSpeedBonus(word) {
        const reactionTime = Date.now() - word.createdAt;

        if (reactionTime < 2000) return 50;
        if (reactionTime < 4000) return 30;
        if (reactionTime < 6000) return 15;
        return 0;
    }

    checkComboMilestone() {
        const milestones = {
            5: { text: 'NICE!', color: '#22c55e' },
            10: { text: 'GREAT!', color: '#3b82f6' },
            20: { text: 'AMAZING!', color: '#a855f7' },
            30: { text: 'INSANE!', color: '#ec4899' },
            50: { text: 'LEGENDARY!', color: '#f59e0b' }
        };

        if (milestones[this.combo]) {
            this.onComboMilestone?.(this.combo, milestones[this.combo]);
        }
    }

    onWordMissed(word) {
        word.removed = true;
        this.combo = 0;
        this.life--;

        this.onLifeLost?.(this.life);
        this.onScoreUpdate?.(this.score, this.combo);

        if (this.life <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.stop();
        const result = this.getResult();
        this.onGameOver?.(result);
    }

    getResult() {
        const accuracy = this.totalWords > 0
            ? Math.round((this.correctWords / this.totalWords) * 100)
            : 0;

        return {
            score: this.score,
            maxCombo: this.maxCombo,
            totalWords: this.totalWords,
            correctWords: this.correctWords,
            wrongInputs: this.wrongInputs,
            accuracy,
            speedLevel: this.speedLevel,
            completedWords: this.completedWords
        };
    }

    // 🆕 완료된 단어 목록 반환
    getCompletedWords() {
        return this.completedWords;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        this.isRunning = false;

        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
            this.spawnTimer = null;
        }

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
}
