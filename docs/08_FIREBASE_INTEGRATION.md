# Firebase 연동 가이드

Firebase Firestore 기반 글로벌 랭킹 시스템 및 보안 아키텍처

---

## 1. 아키텍처 개요

### 현재 구현 상태
- **데이터베이스**: Firebase Firestore (NoSQL 문서 기반)
- **인증 시스템**: Firebase Anonymous Authentication
- **보안 계층**: Security Rules + 세션 기반 검증 + 해시 검증
- **가용성 전략**: Firebase 실패 시 로컬 스토리지 폴백
- **프로덕션 URL**: https://ai-language-game.vercel.app

### 시스템 구성도
```
사용자 → 익명 인증 → 게임 세션 시작
      ↓
   게임 플레이 (액션 기록)
      ↓
   랭킹 제출 → 세션 검증 → 해시 검증 → Firestore 저장
      ↓
   [실패 시 로컬 스토리지 폴백]
```

---

## 2. Firebase 설정

### 2.1 프로젝트 생성 및 초기 설정

1. **Firebase 콘솔**에서 새 프로젝트 생성
   - 프로젝트 이름: `ai-language-game`
   - Google Analytics: 선택 사항

2. **Firestore Database 생성**
   - 위치: `asia-northeast3` (서울) 권장
   - 모드: 프로덕션 모드로 시작
   - Security Rules 설정 필요

3. **Authentication 설정**
   - Sign-in method > 익명 로그인 활성화
   - 사용자 자동 정리: 비활성화 (기록 보존)

### 2.2 환경 변수 구성

프로젝트 루트의 `.env` 파일:

```env
VITE_FIREBASE_API_KEY=AIzaSyCmmiq2uXUIaVfipAkN21hSeupjgAOgNtM
VITE_FIREBASE_AUTH_DOMAIN=ai-language-game.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-language-game
VITE_FIREBASE_STORAGE_BUCKET=ai-language-game.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=196870165370
VITE_FIREBASE_APP_ID=1:196870165370:web:0c138fadd044ef2018bcc3
VITE_FIREBASE_MEASUREMENT_ID=G-PG323DE97F
```

**중요 참고사항**:
- Storage Bucket은 반드시 `.appspot.com` 사용 (`.firebasestorage.app` 아님)
- Vercel 환경 변수에도 동일하게 설정 필요

---

## 3. 데이터 모델

### 3.1 Firestore 컬렉션 구조

**컬렉션**: `rankings`

**문서 구조**:
```javascript
{
  playerName: String,      // 플레이어 이름
  score: Number,           // 최종 점수
  maxCombo: Number,        // 최대 콤보
  accuracy: Number,        // 정확도 (%)
  speedLevel: Number,      // 속도 레벨
  mode: String,            // 게임 모드 ('word' | 'sentence')
  difficulty: Number,      // 난이도 (1-5)
  timestamp: Timestamp,    // 게임 종료 시각
  userId: String,          // 익명 사용자 ID
  sessionId: String,       // 세션 식별자
  sessionHash: String      // 세션 무결성 검증 해시
}
```

### 3.2 인덱스 설정

Firestore Console에서 복합 인덱스 생성:

```
컬렉션: rankings
필드 1: difficulty (Ascending)
필드 2: score (Descending)
필드 3: timestamp (Descending)
```

---

## 4. 보안 규칙

### 4.1 Firestore Security Rules

Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rankings/{rankingId} {
      // 읽기: 모두 허용
      allow read: if true;

      // 쓰기: 인증된 사용자만 허용 + 데이터 검증
      allow create: if request.auth != null
        && request.resource.data.playerName is string
        && request.resource.data.playerName.size() >= 1
        && request.resource.data.playerName.size() <= 20
        && request.resource.data.score is int
        && request.resource.data.score >= 0
        && request.resource.data.score <= 999999
        && request.resource.data.maxCombo is int
        && request.resource.data.maxCombo >= 0
        && request.resource.data.accuracy is int
        && request.resource.data.accuracy >= 0
        && request.resource.data.accuracy <= 100
        && request.resource.data.difficulty is int
        && request.resource.data.difficulty >= 1
        && request.resource.data.difficulty <= 5
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.sessionHash is string
        && request.resource.data.sessionHash.size() == 64;

      // 수정 및 삭제: 금지
      allow update, delete: if false;
    }
  }
}
```

### 4.2 보안 계층

**3단계 검증 시스템**:

1. **인증 계층**: Firebase Anonymous Authentication
   - 모든 사용자 자동 익명 로그인
   - UID 기반 사용자 식별

2. **세션 검증 계층**: `src/firebase/security.js`
   - 게임 시작 시 세션 ID 생성
   - 게임 중 액션 기록 및 타임스탬프 저장
   - 세션 무결성 해시 생성

3. **데이터 검증 계층**: Firestore Security Rules
   - 필드 타입 및 범위 검증
   - 사용자 ID 일치 확인
   - 해시 형식 검증

---

## 5. 구현 세부사항

### 5.1 Firebase 초기화

**파일**: `src/firebase/config.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 5.2 익명 인증

**파일**: `src/firebase/security.js`

```javascript
import { signInAnonymously } from 'firebase/auth';
import { auth } from './config.js';

export async function authenticateUser() {
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
}
```

### 5.3 세션 관리

```javascript
let currentSession = null;

export function startGameSession(gameConfig) {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  currentSession = {
    id: sessionId,
    userId: auth.currentUser?.uid,
    startTime: Date.now(),
    actions: [],
    config: gameConfig
  };

  return currentSession;
}

export function recordGameAction(session, action) {
  if (!session) return;

  session.actions.push({
    ...action,
    timestamp: Date.now()
  });
}

export function updateSession(session) {
  if (!session) return;
  session.lastUpdate = Date.now();
}
```

### 5.4 랭킹 제출

```javascript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config.js';
import { createHash } from 'crypto';

export async function submitRanking(playerName, session) {
  if (!auth.currentUser) {
    throw new Error('인증되지 않은 사용자');
  }

  const sessionHash = generateSessionHash(session);

  const rankingData = {
    playerName,
    score: session.finalScore,
    maxCombo: session.maxCombo,
    accuracy: session.accuracy,
    speedLevel: session.speedLevel,
    mode: session.config.mode,
    difficulty: session.config.difficulty,
    timestamp: serverTimestamp(),
    userId: auth.currentUser.uid,
    sessionId: session.id,
    sessionHash
  };

  await addDoc(collection(db, 'rankings'), rankingData);
}

function generateSessionHash(session) {
  const data = JSON.stringify({
    id: session.id,
    userId: session.userId,
    actions: session.actions,
    finalScore: session.finalScore
  });

  return createHash('sha256').update(data).digest('hex');
}
```

### 5.5 랭킹 조회

```javascript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export async function fetchRankings(difficulty = 'all', mode = 'all', limitCount = 100) {
  let q = collection(db, 'rankings');

  const constraints = [];

  if (difficulty !== 'all') {
    constraints.push(where('difficulty', '==', parseInt(difficulty)));
  }

  if (mode !== 'all') {
    constraints.push(where('mode', '==', mode));
  }

  constraints.push(orderBy('score', 'desc'));
  constraints.push(orderBy('timestamp', 'desc'));
  constraints.push(limit(limitCount));

  q = query(q, ...constraints);

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

---

## 6. 가용성 및 폴백 전략

### 6.1 Firebase 실패 처리

**파일**: `public/js/main.js`

```javascript
async init() {
  try {
    // Firebase 인증 시도 (실패해도 게임은 진행)
    try {
      this.currentUser = await authenticateUser();
    } catch (authError) {
      console.warn('Firebase 인증 실패, 로컬 모드로 진행:', authError);
    }

    // 게임 초기화 계속 진행
    this.csvLoader = new CSVLoader('/words.csv', this.languageManager);
    await this.csvLoader.load();
    // ...
  } catch (error) {
    console.error('초기화 실패:', error);
  }
}
```

### 6.2 랭킹 조회 폴백

```javascript
async showRanking() {
  try {
    const records = await fetchRankings('all', 'all');
    this.allRankings = records;
  } catch (error) {
    console.error('랭킹 조회 실패, 로컬 데이터 사용:', error);
    const records = this.scoreManager.getTopRecords(100);
    this.allRankings = records;
  }

  // 항상 랭킹 모달 표시
  this.renderRankings();
  document.getElementById('rankingModal').classList.remove('hidden');
}
```

### 6.3 점수 저장 폴백

```javascript
async submitScore() {
  const playerName = document.getElementById('playerName').value.trim() || 'Player';
  const result = this.gameEngine.getResult();

  try {
    if (this.currentSession) {
      await submitRanking(playerName, this.currentSession);
      this.showToast('랭킹이 저장되었습니다!');
    }
  } catch (error) {
    this.showToast('랭킹 저장 실패: ' + error.message);

    // 로컬 스토리지에 폴백
    const rank = this.scoreManager.saveLocal({
      playerName,
      score: result.score,
      maxCombo: result.maxCombo,
      accuracy: result.accuracy,
      speedLevel: result.speedLevel,
      mode: this.settings.mode,
      difficulty: this.settings.difficulty,
      date: new Date().toISOString()
    });

    this.showToast('로컬 기록 저장됨 (' + rank + '위)');
  }
}
```

---

## 7. 문제 해결

### 7.1 일반적인 문제

**문제 1: Firebase 인증 실패**

증상:
```
Firebase 인증 실패, 로컬 모드로 진행
```

해결 방법:
1. Firebase Console에서 익명 로그인 활성화 확인
2. `.env` 파일의 Firebase 설정값 확인
3. Vercel 환경 변수 확인 (`vercel env ls`)

**문제 2: Storage Bucket 400 에러**

증상:
```
firebaseinstallations.googleapis.com 400 INVALID_ARGUMENT
```

해결 방법:
```bash
# .env 파일 수정
VITE_FIREBASE_STORAGE_BUCKET=ai-language-game.appspot.com

# Vercel 환경 변수 업데이트
vercel env rm VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# 입력: ai-language-game.appspot.com
```

**문제 3: 랭킹 제출 실패**

증상: 점수가 Firestore에 저장되지 않음

해결 방법:
1. Security Rules 확인 (필드 검증 규칙)
2. 브라우저 콘솔에서 에러 메시지 확인
3. 사용자 인증 상태 확인 (`auth.currentUser`)

### 7.2 디버깅

**Firebase 연결 테스트**:
```javascript
// 브라우저 콘솔에서 실행
import { auth } from './src/firebase/config.js';
console.log('User:', auth.currentUser);
console.log('UID:', auth.currentUser?.uid);
```

**Firestore 쓰기 테스트**:
```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from './src/firebase/config.js';

await addDoc(collection(db, 'test'), { message: 'Hello' });
```

---

## 8. 성능 최적화

### 8.1 쿼리 최적화

- **복합 인덱스**: difficulty + score + timestamp 인덱스 생성
- **제한된 결과**: `limit(100)`으로 과도한 데이터 전송 방지
- **캐싱**: 랭킹 데이터 클라이언트 측 캐싱 (5분)

### 8.2 비용 관리

**Firestore 무료 할당량**:
- 읽기: 50,000회/일
- 쓰기: 20,000회/일
- 삭제: 20,000회/일
- 저장: 1GB

**예상 사용량** (일일 100명 기준):
- 읽기: 100명 x 3회 = 300회
- 쓰기: 100명 x 1회 = 100회
- 저장: 100KB 미만

**비용 절감 전략**:
- 랭킹 조회 시 limit 설정
- 로컬 스토리지 1차 활용
- 페이지네이션 구현

---

## 9. 보안 모니터링

### 9.1 정기 점검 항목

- Firestore 사용량 모니터링 (주 1회)
- Security Rules 감사 (월 1회)
- 비정상 점수 패턴 확인 (주 1회)
- 익명 사용자 수 추이 (월 1회)

### 9.2 의심 활동 탐지

**비정상 패턴**:
- 짧은 시간 내 과도한 고득점 제출
- 동일 IP에서 다수 사용자
- 논리적으로 불가능한 점수 조합

**대응 방안**:
- Firebase Console에서 수동 기록 삭제
- Security Rules 강화
- 클라이언트 검증 로직 추가

---

## 10. 배포 체크리스트

### 배포 전
- [ ] Firebase 프로젝트 생성 완료
- [ ] Firestore Database 생성 및 인덱스 설정
- [ ] Authentication 익명 로그인 활성화
- [ ] Security Rules 배포 및 테스트
- [ ] `.env` 파일에 Firebase 설정값 입력
- [ ] Vercel 환경 변수 등록
- [ ] Storage Bucket `.appspot.com` 확인

### 배포 후
- [ ] 프로덕션에서 익명 로그인 작동 확인
- [ ] 랭킹 제출 및 조회 테스트
- [ ] Firebase 콘솔에서 데이터 저장 확인
- [ ] 로컬 스토리지 폴백 작동 확인
- [ ] 브라우저 콘솔 에러 확인

---

## 11. 유지보수

### 정기 작업
- Firestore 사용량 확인 (월 1회)
- 비정상 기록 검토 및 삭제 (주 1회)
- Security Rules 업데이트 (필요 시)
- 백업 정책 수립 및 실행 (월 1회)

### 백업 전략
- Firestore 자동 백업 활성화 (Firebase Console)
- 로컬 스토리지 백업 데이터 유지
- 주요 랭킹 데이터 CSV 내보내기 (월 1회)
