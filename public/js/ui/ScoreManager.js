/**
 * 점수 및 랭킹 관리자
 */
export class ScoreManager {
    constructor() {
        this.storageKey = 'ai-word-quiz-ranking';
        this.maxRecords = 100;
    }

    // 로컬 기록 저장
    saveLocal(record) {
        const records = this.getRecords();

        record.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

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

    // 모든 기록 가져오기
    getRecords() {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];

        try {
            const parsed = JSON.parse(data);
            return parsed.records || [];
        } catch {
            return [];
        }
    }

    // 상위 N개 기록
    getTopRecords(count = 10) {
        return this.getRecords().slice(0, count);
    }

    // 순위 확인
    getRank(score) {
        const records = this.getRecords();
        return records.filter(r => r.score > score).length + 1;
    }

    // 개인 최고 기록
    getPersonalBest(playerName) {
        const records = this.getRecords()
            .filter(r => r.playerName === playerName);
        return records[0] || null;
    }

    // 기록 초기화
    clearRecords() {
        localStorage.removeItem(this.storageKey);
    }
}
