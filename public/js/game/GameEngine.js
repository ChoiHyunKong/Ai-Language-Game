export class GameEngine {
    constructor(canvasId, csvLoader, languageManager) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.csvLoader = csvLoader;
        this.languageManager = languageManager;

        this.fallingWords = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.life = 3;
        this.isRunning = false;
        this.isPaused = false;

        this.totalWords = 0;
        this.correctWords = 0;
        this.wrongInputs = 0;

        this.usedWordIds = new Set();
        this.completedWords = [];

        this.speedLevel = 1;
        this.wordsUntilSpeedUp = 5;

        this.mode = 'word';
        this.difficulty = 3;

        this.config = {
            spawnInterval: 2500,
            baseFallSpeed: 0.5,
            maxWords: 5,
            goldenWordChance: 0.15
        };

        this.spawnTimer = null;
        this.animationFrame = null;

        this.onScoreUpdate = null;
        this.onComboMilestone = null;
        this.onLifeLost = null;
        this.onGameOver = null;
        this.onWordCompleted = null;
        this.onSpeedUp = null;

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

        this.usedWordIds.clear();
        this.completedWords = [];
        this.speedLevel = 1;
        this.wordsUntilSpeedUp = 5;
    }

    spawnWord() {
        const data = this.getRandomWordData();
        if (!data) {
            return;
        }

        const wordData = this.createWordObject(data);
        this.fallingWords.push(wordData);
        this.totalWords++;
    }

    getRandomWordData() {
        const minDiff = Math.max(1, this.difficulty - 1);
        const maxDiff = Math.min(5, this.difficulty + 1);

        const available = this.csvLoader.getByDifficultyRange(minDiff, maxDiff)
            .filter(row => !this.usedWordIds.has(row.id));

        if (available.length === 0) {
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

        const isGolden = Math.random() < this.config.goldenWordChance;

        const currentSpeed = (this.config.baseFallSpeed + (data.difficulty * 0.1)) *
            (1 + (this.speedLevel - 1) * 0.5);

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
            isGolden,
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
        this.ctx.shadowBlur = word.isGolden ? 20 : 10;

        const padding = 10;
        const textWidth = this.ctx.measureText(word.display).width;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = fontSize + padding * 2;

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
        this.ctx.lineWidth = word.isGolden ? 3 : 2;
        this.ctx.stroke();

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

    checkInput(input) {
        const normalizedInput = input.toLowerCase().trim();

        const matchedWord = this.fallingWords
            .filter(w => !w.removed && w.answer.toLowerCase() === normalizedInput)
            .sort((a, b) => b.y - a.y)[0];

        if (matchedWord) {
            this.onWordMatched(matchedWord);
            return { success: true, word: matchedWord };
        } else {
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

        const multiplier = word.isGolden ? 2 : 1;
        const baseScore = word.difficulty * 10 * multiplier;
        const comboBonus = Math.floor(this.combo * 5);
        const speedBonus = this.calculateSpeedBonus(word);

        this.score += baseScore + comboBonus + speedBonus;

        this.completedWords.push({
            word: word.answer,
            meaning: word.meaning,
            display: word.display,
            isGolden: word.isGolden,
            score: baseScore + comboBonus + speedBonus
        });

        this.onWordCompleted?.(this.completedWords[this.completedWords.length - 1]);

        this.wordsUntilSpeedUp--;
        if (this.wordsUntilSpeedUp <= 0) {
            this.speedLevel++;
            this.wordsUntilSpeedUp = 5;
            this.onSpeedUp?.(this.speedLevel);

            this.fallingWords.forEach(w => {
                w.speed *= 1.5;
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
