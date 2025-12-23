# 📊 데이터 관리 지침서

> CSV 하이브리드 시스템을 통한 다국어 퀴즈 데이터 관리

---

## 1. 개요

### 핵심 원칙
- **단일 소스**: 모든 단어/퀴즈는 `data/words.csv`에서 관리
- **무코드 업데이트**: CSV 파일만 교체하면 콘텐츠 업데이트 완료
- **다국어 확장**: 컬럼 패턴 기반으로 새 언어 쉽게 추가
- **컬럼 기반 호출**: 게임 모드와 언어에 따라 필요한 열만 선택적 로드

---

## 2. CSV 파일 스펙

### 2.1 파일 위치
```
AI Language Game/
└── data/
    └── words.csv
```

### 2.2 컬럼 정의 (다국어 확장 구조)

**기본 컬럼:**

| 컬럼명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `id` | Integer | ✅ | 고유 식별자 |
| `difficulty` | Integer | ✅ | 난이도 (1-5) |
| `category` | String | ✅ | 카테고리 |

**언어별 컬럼 (확장 가능):**

| 컬럼 패턴 | 설명 | 예시 |
|-----------|------|------|
| `word_{lang}` | 해당 언어의 단어 | `word_ko`, `word_en`, `word_jp` |
| `meaning_{lang}` | 해당 언어의 뜻 설명 | `meaning_ko`, `meaning_en`, `meaning_jp` |
| `sentence_{lang}` | 해당 언어의 예문 (빈칸: `___`) | `sentence_ko`, `sentence_en`, `sentence_jp` |

### 2.3 지원 언어 코드

| 코드 | 언어 | 상태 |
|------|------|------|
| `ko` | 한국어 | ✅ 지원 |
| `en` | 영어 | ✅ 지원 |
| `jp` | 일본어 | ✅ 지원 |
| `cn` | 중국어 | 🔜 확장 예정 |
| `es` | 스페인어 | 🔜 확장 예정 |

### 2.4 새 언어 추가 방법

```csv
# 기존 컬럼에 새 언어 컬럼만 추가
id,word_ko,word_en,word_jp,word_cn,...,difficulty,category
1,인공지능,Artificial Intelligence,人工知能,人工智能,...,2,ai_basic
```

### 2.5 샘플 데이터

```csv
id,word_ko,word_en,word_jp,meaning_ko,meaning_en,meaning_jp,sentence_ko,sentence_en,sentence_jp,difficulty,category
1,인공지능,Artificial Intelligence,人工知能,인간의 학습 능력을 모방한 시스템,A system that mimics human learning,人間の学習能力を模倣するシステム,___은 현대 기술의 핵심입니다.,___ is the core of modern technology.,___は現代技術の核心です。,2,ai_basic
2,머신러닝,Machine Learning,機械学習,데이터를 통해 스스로 학습하는 알고리즘,An algorithm that learns through data,データで自ら学習するアルゴリズム,___을 활용하여 예측 모델을 만듭니다.,We create models using ___.,___で予測モデルを作ります。,3,ai_basic
```

### 2.6 카테고리 분류

| 카테고리 | 설명 | 예시 단어 |
|----------|------|-----------|
| `ai_basic` | AI 기초 개념 | 인공지능, 머신러닝, 딥러닝 |
| `ai_model` | AI 모델 관련 | 신경망, 대규모언어모델 |
| `ai_nlp` | 자연어처리 | 자연어처리, 토큰, 임베딩 |
| `ai_training` | 학습 관련 | 파인튜닝, 하이퍼파라미터 |
| `ai_method` | 학습 방법론 | 강화학습, 지도학습, 전이학습 |
| `ai_application` | AI 응용 | 챗봇, 음성인식 |

---

## 3. 언어 관리 시스템

### 3.1 LanguageManager 클래스

```javascript
// src/js/data/LanguageManager.js

class LanguageManager {
  constructor(language = 'ko') {
    this.language = language;
    this.supportedLanguages = ['ko', 'en', 'jp'];
  }

  setLanguage(lang) {
    if (this.supportedLanguages.includes(lang)) {
      this.language = lang;
    }
  }

  getWordColumn() {
    return `word_${this.language}`;
  }

  getMeaningColumn() {
    return `meaning_${this.language}`;
  }

  getSentenceColumn() {
    return `sentence_${this.language}`;
  }

  // 새 언어 추가
  addLanguage(langCode) {
    if (!this.supportedLanguages.includes(langCode)) {
      this.supportedLanguages.push(langCode);
    }
  }
}

export default LanguageManager;
```

---

## 4. 게임 모드별 데이터 사용

### 4.1 단어 연습 모드
```javascript
// 사용 컬럼: word_{lang}, difficulty
const lang = languageManager.language;
const displayData = {
  display: row[`word_${lang}`],    // 화면에 표시
  answer: row[`word_${lang}`]      // 정답도 같은 단어
};
```

### 4.2 의미 퀴즈 모드
```javascript
// 사용 컬럼: word_{lang}, meaning_{lang}, difficulty
const lang = languageManager.language;
const displayData = {
  display: row[`meaning_${lang}`], // 화면에 뜻 표시
  answer: row[`word_${lang}`]      // 단어가 정답
};
```

### 4.3 문장 완성 모드
```javascript
// 사용 컬럼: word_{lang}, sentence_{lang}, difficulty
const lang = languageManager.language;
const displayData = {
  display: row[`sentence_${lang}`], // 빈칸 있는 문장 표시
  answer: row[`word_${lang}`]       // 빈칸에 들어갈 단어
};
```

---

## 5. CSV 로더 구현

### 5.1 의존성
```html
<!-- PapaParse CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
```

### 5.2 CSVLoader 클래스 (다국어 지원)

```javascript
// src/js/data/CSVLoader.js

class CSVLoader {
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
        complete: (results) => {
          this.data = results.data.filter(row => row.id);
          resolve(this.data);
        },
        error: (error) => reject(error)
      });
    });
  }

  // 현재 언어로 단어 가져오기
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

  // 카테고리별 필터링
  getByCategory(category) {
    return this.data.filter(row => row.category === category);
  }

  // 랜덤 선택
  getRandom(count = 1) {
    const shuffled = [...this.data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export default CSVLoader;
```

---

## 6. 데이터 업데이트 프로세스

### 6.1 업데이트 절차
```
1. words.csv 파일 수정 (Excel, Google Sheets 등)
2. 저장 후 data/ 폴더에 배치
3. Git commit & push
4. Vercel 자동 배포
5. 완료!
```

### 6.2 주의사항
- ✅ UTF-8 인코딩 필수 (한글, 일본어 지원)
- ✅ 헤더 행 유지
- ✅ 빈 값은 빈 문자열로 처리
- ✅ 모든 언어 컬럼에 데이터 입력
- ❌ 기존 컬럼명 변경 금지

---

## 7. AI 연동 시 데이터 활용

### 7.1 부족 데이터 실시간 생성
```javascript
// CSV 데이터가 부족할 때 AI가 생성
if (availableWords.length < 10) {
  const aiWords = await webLLM.generateSimilarWords({
    category: currentCategory,
    difficulty: currentDifficulty,
    language: languageManager.language,
    count: 5
  });
  availableWords.push(...aiWords);
}
```

---

## 8. 검증 체크리스트

- [ ] CSV 파일이 UTF-8로 저장되었는가?
- [ ] 모든 필수 컬럼(id, difficulty, category)이 존재하는가?
- [ ] 모든 언어별 컬럼(word_*, meaning_*, sentence_*)이 존재하는가?
- [ ] id가 중복되지 않는가?
- [ ] difficulty가 1-5 범위인가?
- [ ] sentence 컬럼에 `___` 빈칸이 포함되어 있는가?
- [ ] 한글/일본어가 깨지지 않는가?
