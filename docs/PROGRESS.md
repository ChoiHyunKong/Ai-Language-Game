# 개발 진행 상태

AI 지식 게임 프로젝트의 개발 이력 및 현재 상태

**프로덕션 URL**: https://ai-language-game.vercel.app

**최종 업데이트**: 2025년 1월

---

## 1. 프로젝트 개요

### 현재 상태
- **상태**: 프로덕션 배포 완료
- **목표**: AI 용어 학습용 타자 연습 게임
- **기술**: Vite + Vanilla JS + Firebase Firestore + Vercel
- **데이터**: 60개 AI 용어 (한/영/일 3개 언어)

### 핵심 기능
- 산성비 스타일 타자 게임
- 5단계 난이도 시스템
- 글로벌 랭킹 시스템 (Firebase Firestore)
- 다국어 지원 (한국어, 영어, 일본어)
- 반응형 디자인 (모바일/태블릿/데스크탑)

---

## 2. 완료된 주요 구현 사항

### 2.1 게임 엔진 (완료)
- **Canvas 렌더링**: 60 FPS 게임 루프 구현
- **물리 시스템**: 난이도별 낙하 속도 조절
- **충돌 감지**: 단어 화면 하단 도달 감지
- **입력 시스템**: 실시간 키 입력 검증
- **상태 관리**: 게임 시작/중지/재개/종료 관리

### 2.2 난이도 시스템 (완료)
- **5단계 난이도**: 초급부터 전문가까지
- **난이도별 배율**:
  - 레벨 1: 기본 점수 x1
  - 레벨 2: 기본 점수 x1.5
  - 레벨 3: 기본 점수 x2
  - 레벨 4: 기본 점수 x2.5
  - 레벨 5: 기본 점수 x3
- **동적 속도 조절**: 점수에 따른 자동 속도 증가

### 2.3 점수 시스템 (완료)
- **기본 점수**: 단어 길이 기반 점수
- **콤보 시스템**: 연속 정답 시 배율 증가
- **특수 아이템**: 골든 워드 (5배 점수)
- **정확도 계산**: 정답률 백분율
- **최대 콤보 기록**: 세션별 최고 콤보 저장

### 2.4 Firebase 연동 (완료)
- **Firestore Database**: 글로벌 랭킹 저장
- **익명 인증**: Firebase Anonymous Authentication
- **보안 규칙**: 3단계 검증 시스템
  - 인증 계층 (Anonymous Auth)
  - 세션 검증 (Session Hash)
  - 데이터 검증 (Security Rules)
- **폴백 시스템**: Firebase 실패 시 로컬 스토리지 사용

### 2.5 데이터 관리 (완료)
- **CSV 기반**: PapaParse 라이브러리 사용
- **60개 단어**: AI 관련 전문 용어
- **3개 언어**: 한국어, 영어, 일본어
- **난이도 분류**: 1-5단계 분류
- **카테고리**: ai_basic, ml, dl, nlp 등

### 2.6 UI/UX (완료)
- **네온 사이버펑크 테마**: 그라데이션 배경, 네온 효과
- **반응형 디자인**: 모바일/태블릿/데스크탑 대응
- **인터랙티브 요소**:
  - 입력 히스토리 패널
  - 단어 의미 모달
  - 실시간 점수/콤보 표시
  - 속도 레벨 표시
- **애니메이션**: CSS transitions, 파티클 효과

### 2.7 사운드 시스템 (완료)
- **Web Audio API**: 브라우저 네이티브 오디오
- **8종 효과음**:
  - 게임 시작
  - 정답
  - 오답
  - 골든 워드
  - 콤보 달성
  - 속도 증가
  - 게임 오버
- **음소거 기능**: 사용자 제어 가능

### 2.8 배포 인프라 (완료)
- **Vite 빌드**: ES 모듈, 환경 변수 지원
- **Vercel 호스팅**: 자동 배포 (GitHub 연동)
- **환경 변수**: Firebase 설정 보안 관리
- **CSV 자동 포함**: publicDir 설정으로 빌드 자동화

---

## 3. 최근 해결된 주요 이슈

### 3.1 Vite 개발 서버 문제 (해결)
- **문제**: Live Server 사용 시 무한 로딩
- **원인**: Vite 없이 ES 모듈 해석 불가
- **해결**: `npm run dev` 사용 필수화

### 3.2 Vercel 배포 CSV 404 에러 (해결)
- **문제**: `/data/words.csv` 경로 404 에러
- **원인**: Vite publicDir 미설정
- **해결**:
  - vite.config.js에 `publicDir: './data'` 설정
  - CSV 로더 경로를 `/words.csv`로 변경

### 3.3 Firebase Storage Bucket 에러 (해결)
- **문제**: `firebaseinstallations.googleapis.com 400 INVALID_ARGUMENT`
- **원인**: Storage Bucket 도메인 오류 (`.firebasestorage.app` 사용)
- **해결**: `.appspot.com` 도메인으로 수정

### 3.4 랭킹 시스템 작동 불가 (해결)
- **문제**: 랭킹창 미표시, 점수 저장 실패
- **원인**: Firebase 인증 실패 시 전체 앱 중단
- **해결**:
  - Firebase 인증 try-catch 처리
  - 랭킹 조회 실패 시 로컬 스토리지 폴백
  - 모달 표시 로직 항상 실행

### 3.5 프로덕션 콘솔 로그 정리 (해결)
- **문제**: 배포 환경에서 불필요한 console.log
- **원인**: 개발용 디버그 로그 제거 누락
- **해결**: CSVLoader, SoundManager 등에서 console 제거

---

## 4. 현재 기술 스택

### Frontend
- **언어**: JavaScript (ES6+)
- **빌드**: Vite 5.x
- **렌더링**: Canvas API
- **오디오**: Web Audio API
- **데이터 파싱**: PapaParse

### Backend & Database
- **데이터베이스**: Firebase Firestore
- **인증**: Firebase Anonymous Authentication
- **보안**: Firestore Security Rules

### DevOps
- **호스팅**: Vercel
- **CI/CD**: GitHub → Vercel 자동 배포
- **환경 변수**: Vercel Environment Variables
- **버전 관리**: Git/GitHub

---

## 5. 현재 프로젝트 구조

```
AI Language Game/
├── public/                    # 소스 코드 및 정적 파일
│   ├── index.html            # 메인 HTML
│   ├── css/
│   │   └── style.css         # 스타일시트
│   ├── js/
│   │   ├── main.js           # 애플리케이션 진입점
│   │   ├── game/             # 게임 엔진
│   │   │   ├── GameEngine.js
│   │   │   ├── FallingWord.js
│   │   │   └── Particle.js
│   │   ├── data/             # 데이터 로더
│   │   │   ├── CSVLoader.js
│   │   │   └── LanguageManager.js
│   │   └── ui/               # UI 컴포넌트
│   │       ├── ScreenManager.js
│   │       ├── ScoreManager.js
│   │       └── SoundManager.js
│   └── data/
│       └── words.csv         # 단어 데이터
├── src/
│   └── firebase/             # Firebase 연동
│       ├── config.js         # Firebase 초기화
│       └── security.js       # 인증 및 랭킹
├── dist/                     # Vercel 빌드 출력
├── docs/                     # 프로젝트 문서
├── vite.config.js            # Vite 설정
└── package.json              # 의존성 관리
```

---

## 6. 성능 지표

### 게임 성능
- **프레임레이트**: 60 FPS 안정적 유지
- **렌더링**: Canvas 최적화로 부드러운 애니메이션
- **입력 지연**: < 50ms 실시간 반응

### 빌드 성능
- **빌드 시간**: < 10초
- **번들 크기**: ~200KB (gzip 압축 후)
- **초기 로딩**: < 2초 (3G 네트워크 기준)

### Firebase 사용량
- **읽기**: ~300회/일 (예상)
- **쓰기**: ~100회/일 (예상)
- **저장**: < 100KB
- **비용**: 무료 티어 범위 내

---

## 7. 향후 계획 (우선순위 순)

### 7.1 단기 목표 (1-2개월)
- [ ] PWA 변환
  - Service Worker 등록
  - 오프라인 캐싱
  - 설치 가능한 앱
- [ ] SEO 최적화
  - 메타 태그 개선
  - Open Graph 태그
  - 사이트맵 생성
- [ ] 단어 데이터 확장
  - 100개 이상으로 확대
  - 신규 카테고리 추가

### 7.2 중기 목표 (3-6개월)
- [ ] 학습 모드 추가
  - 의미 퀴즈 모드
  - 예문 완성 모드
- [ ] 사용자 계정 시스템
  - 이메일/소셜 로그인
  - 학습 진도 저장
  - 개인 통계
- [ ] 멀티플레이어 모드
  - 실시간 대전
  - 방 생성/입장
  - 채팅 기능

### 7.3 장기 목표 (6개월 이상)
- [ ] 모바일 앱 출시
  - React Native 포팅
  - iOS/Android 배포
- [ ] AI 기반 난이도 조절
  - 사용자 실력 분석
  - 맞춤형 단어 추천
- [ ] 커뮤니티 기능
  - 사용자 생성 단어팩
  - 공유 및 평가 시스템

---

## 8. 알려진 제한사항

### 기술적 제한
- **브라우저 호환성**: 최신 Chrome/Firefox/Safari 권장
- **모바일 키보드**: 일부 디바이스에서 입력 지연 가능
- **네트워크 의존**: Firebase 연결 필요 (폴백 있음)

### 콘텐츠 제한
- **단어 수**: 현재 60개 (확장 예정)
- **언어**: 3개 언어만 지원
- **난이도**: 수동 분류 (자동화 예정)

---

## 9. 기여 및 피드백

### 기여 방법
1. GitHub Issues에 버그 리포트 또는 기능 제안
2. Pull Request 제출 (코드 리뷰 후 머지)
3. 단어 데이터 추가 (CSV 파일 수정)

### 연락처
- GitHub: https://github.com/ChoiHyunKong/Ai-Language-Game
- Issues: https://github.com/ChoiHyunKong/Ai-Language-Game/issues

---

## 10. 버전 히스토리

### v1.0.0 (2025-01-xx) - 프로덕션 배포
- Vercel 프로덕션 배포 완료
- Firebase Firestore 랭킹 시스템
- 60개 AI 용어 데이터
- 5단계 난이도 시스템
- 다국어 지원 (한/영/일)

### v0.3.0 - Firebase 통합
- Firestore 랭킹 시스템 구현
- 익명 인증 추가
- 보안 규칙 배포

### v0.2.0 - 게임 시스템 확장
- 난이도별 점수 배율
- 콤보 시스템
- 특수 아이템 (골든 워드)
- 속도 레벨 시스템

### v0.1.0 - 초기 버전
- 기본 게임 엔진
- CSV 데이터 로더
- 로컬 랭킹 시스템
