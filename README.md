# AI 지식 게임 - AI 용어 학습 타자 게임

한컴 타자 연습 '산성비'를 벤치마킹한 AI 용어 학습용 타자 게임

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production-green)

**Live Demo**: [https://ai-language-game.vercel.app](https://ai-language-game.vercel.app)

---

## 주요 기능

- 산성비 스타일 게임: 단어가 하늘에서 떨어지는 클래식 게임 방식
- 다국어 지원: 한국어, 영어, 일본어 단어 학습
- 5단계 난이도: 쉬움부터 매우 어려움까지 체계적 학습
- 실시간 랭킹: Firebase 기반 글로벌 랭킹 시스템
- 반응형 디자인: 모바일, 태블릿, 데스크탑 완벽 지원
- 사운드 효과: Web Audio API 기반 실시간 피드백

---

## 게임 특징

### 난이도 시스템
- 레벨 1-5까지 점진적 난이도 증가
- 난이도별 차별화된 점수 배율
- 콤보 시스템으로 고득점 유도

### 특수 아이템
- 골든 워드: 5배 점수 획득
- 콤보 마일스톤: 특별 보너스
- 속도 증가: 점수 상승에 따른 난이도 조절

---

## 기술 스택

### Frontend
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Canvas API (게임 렌더링)
- Web Audio API (사운드 효과)

### Build & Deploy
- Vite (빌드 도구)
- Vercel (호스팅)
- GitHub (버전 관리)

### Backend & Database
- Firebase Firestore (랭킹 데이터)
- Firebase Authentication (익명 로그인)
- Firebase Security Rules (보안)

### Data Management
- CSV (PapaParse) - 60개 AI 용어 데이터

---

## 프로젝트 구조

```
AI Language Game/
├── public/                 # 정적 파일 및 소스 코드
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js        # 메인 애플리케이션
│   │   ├── game/          # 게임 엔진
│   │   ├── data/          # CSV 로더
│   │   └── ui/            # UI 컴포넌트
│   └── data/
│       └── words.csv      # 단어 데이터
├── src/
│   └── firebase/          # Firebase 연동
│       ├── config.js
│       └── security.js
├── dist/                  # 빌드 출력
├── docs/                  # 프로젝트 문서
└── vite.config.js         # Vite 설정
```

---

## 시작하기

### 1. 저장소 복제 및 패키지 설치

```bash
git clone https://github.com/ChoiHyunKong/Ai-Language-Game.git
cd Ai-Language-Game
npm install
```

### 2. Firebase 환경 설정

#### 2.1. 환경 변수 구성
`.env` 파일을 프로젝트 루트에 생성하고 Firebase 설정값 입력:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### 2.2. Firebase 콘솔 설정
1. Firebase 프로젝트 생성
2. Firestore Database 생성 (asia-northeast3 권장)
3. Authentication > 익명 로그인 활성화
4. Firestore 보안 규칙 배포

### 3. 로컬 개발 환경 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 자동 실행

### 4. 프로덕션 빌드 및 배포

```bash
# 빌드
npm run build

# Vercel CLI 배포
npx vercel --prod
```

---

## 게임 데이터 관리

### CSV 파일 구조

`public/data/words.csv` 파일에서 단어 데이터 관리:

```csv
id,word_ko,word_en,word_jp,meaning_ko,meaning_en,meaning_jp,sentence_ko,sentence_en,sentence_jp,difficulty,category
1,인공지능,AI,AI,기계의 지능적 행동 구현,Implementation of intelligent behavior in machines,...,3,ai_basic
```

### 단어 추가 방법

1. `public/data/words.csv` 파일 편집
2. 새로운 행에 데이터 추가 (ID는 순차적으로)
3. Git 커밋 및 푸시
4. Vercel 자동 배포 완료

---

## 주요 기능 구현 상태

- [x] 게임 엔진 핵심 기능
- [x] 다국어 지원 (한/영/일)
- [x] 5단계 난이도 시스템
- [x] Firebase 랭킹 시스템
- [x] 반응형 UI/UX
- [x] 사운드 효과
- [x] Vercel 배포
- [x] 익명 인증 및 보안
- [x] CSV 기반 데이터 관리
- [x] 콤보 및 특수 아이템

---

## 배포 정보

- **프로덕션 URL**: https://ai-language-game.vercel.app
- **호스팅**: Vercel
- **데이터베이스**: Firebase Firestore
- **빌드 도구**: Vite

### 환경 변수 (Vercel)

Vercel 대시보드에서 다음 환경 변수 설정 필요:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

---

## 문서

| 문서명 | 주요 내용 |
|------|------|
| [07_DEPLOYMENT](./docs/07_DEPLOYMENT.md) | 배포 및 호스팅 가이드 |
| [08_FIREBASE_INTEGRATION](./docs/08_FIREBASE_INTEGRATION.md) | Firebase 연동 및 보안 |
| [PROGRESS](./docs/PROGRESS.md) | 개발 진행 상황 |

---

## 라이선스

MIT License

---

## 기여

이슈 및 Pull Request 환영합니다!

## 참고 자료

- 한컴 타자 연습 산성비 (게임 모티브)
- [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/)
- [PapaParse](https://www.papaparse.com/)
