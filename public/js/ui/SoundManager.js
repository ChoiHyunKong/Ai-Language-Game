/**
 * 사운드 매니저 - Web Audio API 기반 효과음
 */
export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.isMuted = false;
        this.volume = 0.5;

        // 초기화는 사용자 상호작용 후에 (브라우저 정책)
        this.initialized = false;
    }

    // 사용자 상호작용 후 초기화
    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            // 사운드 초기화 실패 시 무시
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        return this.isMuted;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // 기본 톤 생성
    playTone(frequency, duration, type = 'sine', volumeMultiplier = 1) {
        if (!this.initialized || this.isMuted || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        const vol = this.volume * volumeMultiplier;
        gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // 🎵 정답 효과음 (상승 음)
    playCorrect() {
        if (!this.initialized || this.isMuted) return;

        this.playTone(523.25, 0.1, 'sine', 0.6); // C5
        setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.6), 50); // E5
        setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.7), 100); // G5
    }

    // 🎵 오답 효과음 (하강 음)
    playWrong() {
        if (!this.initialized || this.isMuted) return;

        this.playTone(300, 0.15, 'sawtooth', 0.4);
        setTimeout(() => this.playTone(200, 0.2, 'sawtooth', 0.3), 100);
    }

    // 🎵 콤보 효과음 (밝은 차임)
    playCombo(comboLevel = 1) {
        if (!this.initialized || this.isMuted) return;

        const baseFreq = 600 + (comboLevel * 50);
        this.playTone(baseFreq, 0.1, 'sine', 0.5);
        setTimeout(() => this.playTone(baseFreq * 1.5, 0.15, 'sine', 0.6), 80);
        setTimeout(() => this.playTone(baseFreq * 2, 0.2, 'sine', 0.7), 150);
    }

    // 🎵 속도 증가 효과음
    playSpeedUp() {
        if (!this.initialized || this.isMuted) return;

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playTone(400 + (i * 100), 0.08, 'square', 0.3);
            }, i * 60);
        }
    }

    // 🎵 게임 오버 효과음
    playGameOver() {
        if (!this.initialized || this.isMuted) return;

        this.playTone(400, 0.3, 'sine', 0.6);
        setTimeout(() => this.playTone(350, 0.3, 'sine', 0.5), 200);
        setTimeout(() => this.playTone(300, 0.3, 'sine', 0.4), 400);
        setTimeout(() => this.playTone(250, 0.5, 'sine', 0.3), 600);
    }

    // 🎵 골든 워드 효과음
    playGolden() {
        if (!this.initialized || this.isMuted) return;

        this.playTone(880, 0.1, 'sine', 0.5);
        setTimeout(() => this.playTone(1108.73, 0.1, 'sine', 0.6), 80);
        setTimeout(() => this.playTone(1318.51, 0.15, 'sine', 0.7), 160);
        setTimeout(() => this.playTone(1760, 0.25, 'sine', 0.8), 240);
    }

    // 🎵 버튼 클릭 효과음
    playClick() {
        if (!this.initialized || this.isMuted) return;
        this.playTone(800, 0.05, 'sine', 0.3);
    }

    // 🎵 게임 시작 효과음
    playStart() {
        if (!this.initialized || this.isMuted) return;

        this.playTone(392, 0.15, 'sine', 0.5); // G4
        setTimeout(() => this.playTone(523.25, 0.15, 'sine', 0.6), 150); // C5
        setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.7), 300); // E5
        setTimeout(() => this.playTone(783.99, 0.25, 'sine', 0.8), 450); // G5
    }
}
