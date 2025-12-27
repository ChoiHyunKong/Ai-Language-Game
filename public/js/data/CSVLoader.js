/**
 * CSV 데이터 로더
 */
export class CSVLoader {
    constructor(filePath, languageManager) {
        this.filePath = filePath;
        this.languageManager = languageManager;
        this.data = [];
    }

    async load() {
        return new Promise((resolve, reject) => {
            Papa.parse(this.filePath, {
                download: true,
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    this.data = results.data.filter(row => row.id);
                    resolve(this.data);
                },
                error: (error) => {
                    console.error('CSV 로드 실패:', error);
                    reject(error);
                }
            });
        });
    }

    // 현재 언어로 데이터 가져오기
    getWord(row) {
        return row[this.languageManager.getWordColumn()];
    }

    getMeaning(row) {
        return row[this.languageManager.getMeaningColumn()];
    }

    getSentence(row) {
        return row[this.languageManager.getSentenceColumn()];
    }

    // 난이도별 필터링
    getByDifficulty(level) {
        return this.data.filter(row => row.difficulty === level);
    }

    // 난이도 범위 필터링
    getByDifficultyRange(min, max) {
        return this.data.filter(row => row.difficulty >= min && row.difficulty <= max);
    }

    // 카테고리별 필터링
    getByCategory(category) {
        return this.data.filter(row => row.category === category);
    }

    // 랜덤 선택
    getRandom(count = 1, filter = null) {
        let pool = filter ? this.data.filter(filter) : this.data;
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // 전체 데이터
    getAll() {
        return this.data;
    }

    // 데이터 개수
    getCount() {
        return this.data.length;
    }
}
