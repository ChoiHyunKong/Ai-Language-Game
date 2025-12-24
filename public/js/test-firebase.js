/**
 * Firebase 테스트 스크립트
 */
import { authenticateUser, startGameSession, recordGameAction, submitRanking, fetchRankings } from '../../src/firebase/security.js';

let currentUser = null;
let testSession = null;

function log(message, type = 'info') {
    const resultDiv = document.getElementById('result');
    const timestamp = new Date().toLocaleTimeString();
    const className = type === 'success' ? 'success' : type === 'error' ? 'error' : '';
    resultDiv.innerHTML += `<div class="${className}">[${timestamp}] ${message}</div>`;
}

window.clearResults = function() {
    document.getElementById('result').innerHTML = '';
};

window.testAuth = async function() {
    try {
        log('사용자 인증 시작...');
        currentUser = await authenticateUser();
        log(`인증 성공! User ID: ${currentUser.uid}`, 'success');
    } catch (error) {
        log(`인증 실패: ${error.message}`, 'error');
    }
};

window.testSubmitRanking = async function() {
    try {
        if (!currentUser) {
            log('먼저 인증을 진행해주세요.', 'error');
            return;
        }

        log('게임 세션 시작...');
        testSession = startGameSession({
            mode: 'word',
            difficulty: 'medium'
        });

        log(`세션 ID: ${testSession.sessionId}`);

        // 게임 액션 시뮬레이션
        log('게임 액션 기록 중...');
        await new Promise(resolve => setTimeout(resolve, 200));
        recordGameAction(testSession, {
            type: 'answer',
            data: { word: 'test', correct: true },
            score: 10
        });

        await new Promise(resolve => setTimeout(resolve, 200));
        recordGameAction(testSession, {
            type: 'answer',
            data: { word: 'firebase', correct: true },
            score: 15
        });

        await new Promise(resolve => setTimeout(resolve, 200));
        recordGameAction(testSession, {
            type: 'answer',
            data: { word: 'security', correct: true },
            score: 20
        });

        log(`총 점수: ${testSession.score}점`);
        log(`액션 수: ${testSession.actions.length}개`);

        // 랭킹 제출
        log('랭킹 제출 중...');
        const docId = await submitRanking('테스트플레이어', testSession);
        log(`랭킹 제출 성공! Document ID: ${docId}`, 'success');

    } catch (error) {
        log(`랭킹 제출 실패: ${error.message}`, 'error');
        console.error(error);
    }
};

window.testFetchRankings = async function() {
    try {
        log('랭킹 조회 중...');
        const rankings = await fetchRankings('all', 'all');

        log(`조회된 랭킹 수: ${rankings.length}개`, 'success');

        if (rankings.length > 0) {
            log('\n=== 상위 랭킹 ===');
            rankings.forEach((rank, index) => {
                log(`${index + 1}위: ${rank.playerName} - ${rank.score}점 (${rank.mode} 모드)`);
            });
        } else {
            log('아직 등록된 랭킹이 없습니다.');
        }
    } catch (error) {
        log(`랭킹 조회 실패: ${error.message}`, 'error');
        console.error(error);
    }
};

// 페이지 로드 시 자동 인증
window.addEventListener('DOMContentLoaded', async () => {
    log('Firebase 테스트 페이지 로드됨');
    log('먼저 "1. 인증 테스트" 버튼을 클릭하세요.');
});
