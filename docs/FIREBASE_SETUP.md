# Firebase 설정 가이드

Firebase 연동을 위한 단계별 가이드입니다.

## 1단계: Firebase 로그인

터미널을 열고 다음 명령어를 실행하세요:

```bash
firebase login
```

브라우저가 열리면 Google 계정으로 로그인합니다.

## 2단계: Firebase 프로젝트 연결

```bash
cd "c:\Users\chyun\OneDrive\바탕 화면\AI 활용\AI Language Game"
firebase use --add
```

프로젝트 목록에서 **ai-language-game** 선택하고 alias는 **default**로 입력합니다.

## 3단계: Firestore Database 생성 (Firebase Console)

1. https://console.firebase.google.com 접속
2. **ai-language-game** 프로젝트 선택
3. 왼쪽 메뉴에서 **Firestore Database** 클릭
4. **데이터베이스 만들기** 버튼 클릭
5. 위치 선택: **asia-northeast3 (Seoul)**
6. 보안 규칙: **프로덕션 모드에서 시작** 선택
7. **사용 설정** 클릭

## 4단계: Authentication 활성화 (Firebase Console)

1. 왼쪽 메뉴에서 **Authentication** 클릭
2. **시작하기** 버튼 클릭
3. **Sign-in method** 탭 선택
4. **익명** 찾아서 클릭
5. **사용 설정** 토글 켜기
6. **저장** 클릭

## 5단계: Firestore 보안 규칙 배포

Firestore Database가 생성된 후 실행:

```bash
firebase deploy --only firestore:rules
```

성공 메시지:
```
✔  firestore: released rules firestore.rules to cloud.firestore
```

## 6단계: Firestore 인덱스 배포

```bash
firebase deploy --only firestore:indexes
```

성공 메시지:
```
✔  firestore: deployed indexes in firestore.indexes.json successfully
```

## 7단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 이 자동으로 열립니다.

## 8단계: Firebase 연결 테스트

개발자 도구(F12)를 열고 Console 탭에서 확인:

```
사용자 인증 중...
인증 완료: [사용자 UID]
```

오류가 없으면 Firebase 연동이 성공한 것입니다!

## 문제 해결

### 오류: "Firebase config is missing"
- `.env` 파일이 있는지 확인
- 환경 변수가 `VITE_` 접두사로 시작하는지 확인
- 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### 오류: "Permission denied"
- Firebase Console에서 Firestore Database가 생성되었는지 확인
- 보안 규칙이 배포되었는지 확인: `firebase deploy --only firestore:rules`

### 오류: "Anonymous sign-in is disabled"
- Firebase Console > Authentication > Sign-in method
- 익명 로그인이 활성화되어 있는지 확인

## 다음 단계

Firebase 연동이 완료되면:

1. 게임 플레이 테스트
2. 랭킹 제출 테스트
3. 보안 규칙 검증
4. Vercel 배포 준비

## 추가 명령어

### Firebase 프로젝트 확인
```bash
firebase projects:list
```

### 현재 프로젝트 확인
```bash
firebase use
```

### 모든 Firebase 기능 배포
```bash
npm run build
firebase deploy
```

### Firestore 데이터 확인
Firebase Console > Firestore Database > 데이터 탭에서 `rankings` 컬렉션 확인
