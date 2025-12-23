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
- **AI**: WebLLM (브라우저 로컬 AI)
- **Data**: CSV (PapaParse)
- **Hosting**: Vercel
- **Version Control**: GitHub

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

### 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/[username]/ai-language-game.git

# 2. 로컬 서버 실행
cd ai-language-game
npx serve public

# 3. 브라우저에서 열기
# http://localhost:3000
```

### 배포

```bash
# Vercel CLI로 배포
npx vercel --prod
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
