# AI 기반 단어 퀴즈 타자 게임

한컴 타자 연습 '산성비'를 벤치마킹한 AI 기반 학습용 타자 게임

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-development-yellow)

---

## 주요 기능

- 산성비 스타일 게임: 단어가 하늘에서 떨어지는 클래식 게임 방식
- 3가지 학습 모드: 단어 연습, 의미 퀴즈, 문장 완성
- AI 연동 (WebLLM): 브라우저 로컬 AI를 통한 실시간 단어 생성
- 랭킹 시스템: 로컬/글로벌 순위 경쟁 기능
- PWA 지원: 앱 설치 기능 제공
- CSV 기반 관리: 코드 수정 없는 콘텐츠 업데이트 구조

---

## 게임 모드

| 모드 | 설명 | 예시 |
|------|------|------|
| 단어 연습 | 화면에 나타나는 단어를 그대로 입력 | `apple` → `apple` |
| 의미 퀴즈 | 제시된 뜻을 보고 해당 단어를 유추 입력 | `사과` → `apple` |
| 문장 완성 | 문장의 빈칸에 들어갈 적절한 단어 입력 | `I eat an ___` → `apple` |

---

## 기술 스택

- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)
- Build Tool: Vite
- Backend: Firebase (Firestore, Authentication)
- AI: WebLLM (Browser Local AI)
- Data: CSV (PapaParse)
- Hosting: Vercel / Firebase Hosting
- Version Control: GitHub
- Security: Firestore Security Rules, 점수 조작 방지 시스템

---

## 프로젝트 구조

```
AI Language Game/
├── public/                 # 정적 파일
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
└── docs/                   # 개발 관련 문서
```

---

## 시작하기

### 1. 저장소 복제 및 패키지 설치

```bash
git clone https://github.com/[username]/ai-language-game.git
cd ai-language-game
npm install
```

### 2. Firebase 환경 설정

#### 2.1. 환경 변수 구성
`.env.example` 파일을 복사하여 `.env` 파일을 생성한 후 설정값 입력

```bash
cp .env.example .env
```

`.env` 파일 설정 항목:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID

#### 2.2. Firebase CLI 배포

```bash
firebase login
firebase use --add
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

#### 2.3. Firebase 콘솔 설정 항목
- Firestore Database 생성 (asia-northeast3 위치 권장)
- Authentication 익명 로그인 활성화

### 3. 로컬 개발 환경 실행

```bash
npm run dev
```

### 4. 프로덕션 배포

```bash
# 빌드 수행
npm run build

# Vercel 배포
npx vercel --prod

# Firebase Hosting 배포
firebase deploy --only hosting
```

---

## 문서 목록

| 문서명 | 주요 내용 |
|------|------|
| [00_QNA_DECISIONS](./docs/00_QNA_DECISIONS.md) | 주요 질의응답 및 의사 결정 내역 |
| [01_PROJECT_OVERVIEW](./docs/01_PROJECT_OVERVIEW.md) | 프로젝트 전반 개요 및 방향성 |
| [02_DATA_MANAGEMENT](./docs/02_DATA_MANAGEMENT.md) | CSV 기반 데이터 관리 체계 |
| [03_GAME_ENGINE](./docs/03_GAME_ENGINE.md) | 핵심 게임 엔진 설계 및 구현 |
| [04_TECH_STACK](./docs/04_TECH_STACK.md) | 사용 기술 스택 상세 가이드 |
| [05_UI_UX_DESIGN](./docs/05_UI_UX_DESIGN.md) | 인터페이스 및 경험 디자인 원칙 |
| [06_SCORING_RANKING](./docs/06_SCORING_RANKING.md) | 점수 산정 및 랭킹 시스템 구조 |
| [07_DEPLOYMENT](./docs/07_DEPLOYMENT.md) | 빌드 및 배포 절차 안내 |
| [08_FIREBASE_INTEGRATION](./docs/08_FIREBASE_INTEGRATION.md) | Firebase 연동 및 보안 가이드 |
| [09_SECURITY](./docs/09_SECURITY.md) | 부정행위 방지 및 보안 대책 |

---

## CSV 데이터 규격

```csv
id,word,meaning,sentence,difficulty,category,language
1,apple,사과,I eat an ___ every day.,1,fruit,en
```

| 필드 | 필수 여부 | 상세 설명 |
|------|------|------|
| id | 필수 | 고유 식별 번호 |
| word | 필수 | 학습 대상 단어 |
| meaning | 필수 | 대상 단어의 뜻 |
| sentence | 선택 | 학습 단어가 포함된 예문 |
| difficulty | 필수 | 난이도 수치 (1-5) |
| category | 선택 | 데이터 분류 카테고리 |
| language | 선택 | 언어 식별 코드 |

---

## 개발 로드맵

- [x] 프로젝트 초기 구조 설계
- [x] 개발 지침 문서 작성 완료
- [ ] 게임 엔진 핵심 기능 구현
- [ ] 데이터 인터페이스 개발
- [ ] UI/UX 시스템 적용
- [ ] WebLLM 로컬 AI 연동
- [ ] 글로벌 랭킹 시스템 구축
- [ ] PWA 배포 설정 및 최적화

---

## 라이선스

MIT License

---

## 사용 오픈소스 및 참고 자료

- 한컴 타자 연습 산성비 (기획 모티브)
- WebLLM
- PapaParse
