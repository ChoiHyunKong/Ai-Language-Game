/**
 * 화면 관리자
 */
export class ScreenManager {
    constructor() {
        this.screens = {
            menu: document.getElementById('menuScreen'),
            game: document.getElementById('gameScreen'),
            result: document.getElementById('resultScreen')
        };
        this.currentScreen = 'menu';
    }

    showScreen(screenId) {
        // 모든 화면 숨기기
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // 선택된 화면 표시
        const screenKey = screenId.replace('Screen', '');
        if (this.screens[screenKey]) {
            this.screens[screenKey].classList.add('active');
            this.currentScreen = screenKey;
        }
    }

    getCurrentScreen() {
        return this.currentScreen;
    }
}
