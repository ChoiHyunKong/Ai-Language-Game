# 프로젝트 개요

핵심 내용: AI 기반 단어 퀴즈 타자 게임 (산성비 스타일)

---

## 1. 프로젝트 비전
- 목표: 단순 타이핑을 넘어 단어 의미와 예문 기반 학습 효과 제공
- 효율: 서버 비용 최소화 및 CSV 기반 콘텐츠 업데이트 편의성 확보
- 경험: AI 연동을 통한 실시간 퀴즈 생성 및 다국어 확장성 지원

---

## 2. 시스템 아키텍처
- 사용 환경: 브라우저 기반 게임 실행
- UI 레이어: 화면 렌더링 및 입력 처리
- 게임 엔진: 산성비 로직 및 모드 관리
- AI 엔진 (WebLLM): 로컬 환경 단어 생성 및 힌트 제공
- 데이터 레이어: CSV Loader, LocalStorage(로컬), Firebase(글로벌)

---

## 3. 핵심 기능
- 게임 모드: 단어 연습, 의미 퀴즈, 문장 완성
- AI 기능: 유사 단어 실시간 생성, 힌트 제공, 난이도 조절 보조
- 점수 시스템: 난이도별 차등 점수, 속도 보너스, 콤보 시스템

---

## 4. 기술 스택
- Frontend: HTML5, CSS3, Vanilla JS
- AI: WebLLM (Browser Local AI)
- Data: CSV (PapaParse)
- Storage: LocalStorage, Firebase Realtime Database
- Hosting: Vercel / Firebase Hosting
- Version Control: GitHub

---

## 5. 개발 로드맵
- Phase 1: 프로젝트 구조 설정, CSV 로더 및 기본 산성비 엔진 구현
- Phase 2: 게임 모드 확장, 점수 시스템 및 UI/UX 개선
- Phase 3: WebLLM 연동 및 AI 단어 생성 기능 구축
- Phase 4: PWA 설정, Firebase 연동, 글로벌 랭킹 및 최종 배포

---

## 6. 관련 문서
- [00_QNA_DECISIONS](./00_QNA_DECISIONS.md)
- [02_DATA_MANAGEMENT](./02_DATA_MANAGEMENT.md)
- [03_GAME_ENGINE](./03_GAME_ENGINE.md)
- [04_TECH_STACK](./04_TECH_STACK.md)
- [05_UI_UX_DESIGN](./05_UI_UX_DESIGN.md)
- [06_SCORING_RANKING](./06_SCORING_RANKING.md)
- [07_DEPLOYMENT](./07_DEPLOYMENT.md)
- [08_FIREBASE_INTEGRATION](./08_FIREBASE_INTEGRATION.md)
- [09_SECURITY](./09_SECURITY.md)
