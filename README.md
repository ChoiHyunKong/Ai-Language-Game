# 🎮 AI 기반 단어 퀴즈 타자 게임

> 한컴 타자 연습 '산성비'를 벤치마킹한 AI 기반 학습용 타자 게임

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-development-yellow)

---

## ✨ 주요 기능

- 🌧️ **산성비 스타일 게임**: 단어가 하늘에서 떨어지는 클래식 게임 방식
- 🧠 **3가지 학습 모드**: 단어 연습, 의미 퀴즈, 문장 완성
- 🤖 **AI 연동 (WebLLM)**: 브라우저에서 동작하는 로컬 AI로 실시간 단어 생성
- 📊 **랭킹 시스템**: 로컬/글로벌 순위 경쟁
- 📱 **PWA 지원**: 앱처럼 설치하여 사용 가능
- 💾 **CSV 기반 관리**: 코드 수정 없이 콘텐츠 업데이트

---

## 🎯 게임 모드

| 모드 | 설명 | 예시 |
|------|------|------|
| 🔤 단어 연습 | 떨어지는 단어를 그대로 입력 | `apple` → `apple` |
| 🧠 의미 퀴즈 | 뜻을 보고 단어 유추 | `사과` → `apple` |
| ✏️ 문장 완성 | 빈칸에 맞는 단어 입력 | `I eat an ___` → `apple` |

---

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Build Tool**: Vite
- **Backend**: Firebase (Firestore, Authentication)
- **AI**: WebLLM (브라우저 로컬 AI)
- **Data**: CSV (PapaParse)
- **Hosting**: Vercel / Firebase Hosting
- **Version Control**: GitHub
- **Security**: Firestore Security Rules, 점수 조작 방지 시스템

---

## 📁 프로젝트 구조

```
AI Language Game/
├── public/                 # 정적 파일 (배포 대상)
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
├── src/                    # 소스 코드
│   ├── js/
│   │   ├── main.js
│   │   ├── game/           # 게임 엔진
│   │   ├── data/           # CSV 로더
│   │   ├── ai/             # WebLLM 연동
│   │   └── ui/             # UI 컴포넌트
│   └── css/
│       └── style.css
├── data/
│   └── words.csv           # 퀴즈 데이터
└── docs/                   # 개발 문서
```

---

## 🚀 시작하기

### 1. 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone https://github.com/[username]/ai-language-game.git
cd ai-language-game

# NPM 패키지 설치
npm install
```

### 2. Firebase 설정

#### 2.1. 환경 변수 설정
`.env.example`을 복사하여 `.env` 파일을 생성하고, Firebase 설정값을 입력합니다:

```bash
cp .env.example .env
```

`.env` 파일에 Firebase 프로젝트 설정 입력:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### 2.2. Firebase CLI 로그인 및 배포

```bash
# Firebase 로그인
firebase login

# Firebase 프로젝트 연결
firebase use --add
# 프로젝트 선택: ai-language-game

# Firestore 보안 규칙 배포
firebase deploy --only firestore:rules

# Firestore 인덱스 배포
firebase deploy --only firestore:indexes
```

#### 2.3. Firebase Console 설정
Firebase Console (https://console.firebase.google.com)에서 다음 작업 수행:

1. **Firestore Database 생성**
   - Firestore Database 메뉴 > "데이터베이스 만들기"
   - 위치: asia-northeast3 (서울)
   - 프로덕션 모드로 시작

2. **Authentication 활성화**
   - Authentication 메뉴 > "시작하기"
   - Sign-in method 탭 > "익명" 활성화

### 3. 로컬 개발 서버 실행

```bash
# Vite 개발 서버 실행
npm run dev

# 브라우저에서 자동 열림: http://localhost:3000
```

### 4. 배포

#### Vercel 배포
```bash
# 빌드
npm run build

# Vercel CLI로 배포
npx vercel --prod
```

#### Firebase Hosting 배포
```bash
# 빌드 후 Firebase Hosting에 배포
npm run build
firebase deploy --only hosting
```

---

## 📖 문서

| 문서 | 설명 |
|------|------|
| [00_QNA_DECISIONS](./docs/00_QNA_DECISIONS.md) | Q&A 및 확정 사항 |
| [01_PROJECT_OVERVIEW](./docs/01_PROJECT_OVERVIEW.md) | 프로젝트 개요 |
| [02_DATA_MANAGEMENT](./docs/02_DATA_MANAGEMENT.md) | CSV 데이터 관리 |
| [03_GAME_ENGINE](./docs/03_GAME_ENGINE.md) | 게임 엔진 개발 |
| [04_TECH_STACK](./docs/04_TECH_STACK.md) | 기술 스택 가이드 |
| [05_UI_UX_DESIGN](./docs/05_UI_UX_DESIGN.md) | UI/UX 디자인 |
| [06_SCORING_RANKING](./docs/06_SCORING_RANKING.md) | 점수/랭킹 시스템 |
| [07_DEPLOYMENT](./docs/07_DEPLOYMENT.md) | 배포 가이드 |
| [08_FIREBASE_INTEGRATION](./docs/08_FIREBASE_INTEGRATION.md) | Firebase 연동 가이드 |
| [09_SECURITY](./docs/09_SECURITY.md) | 보안 및 해킹 방지 |

---

## 📊 CSV 데이터 형식

```csv
id,word,meaning,sentence,difficulty,category,language
1,apple,사과,I eat an ___ every day.,1,fruit,en
```

| 컬럼 | 필수 | 설명 |
|------|------|------|
| `id` | ✅ | 고유 식별자 |
| `word` | ✅ | 학습 단어 |
| `meaning` | ✅ | 단어 뜻 |
| `sentence` | ⭕ | 예문 (빈칸: `___`) |
| `difficulty` | ✅ | 난이도 (1-5) |
| `category` | ⭕ | 카테고리 |
| `language` | ⭕ | 언어 코드 |

---

## 🗺 로드맵

- [x] 프로젝트 구조 설계
- [x] 지침 문서 작성
- [ ] 기본 게임 엔진 구현
- [ ] CSV 로더 개발
- [ ] UI/UX 적용
- [ ] WebLLM 연동
- [ ] 랭킹 시스템
- [ ] PWA 설정
- [ ] Vercel 배포

---

## 📄 라이선스

MIT License

---

## 🙏 감사

- 한컴 타자 연습 - 산성비 게임 영감
- WebLLM 프로젝트
- PapaParse
