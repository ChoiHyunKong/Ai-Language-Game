# Firebase 설정 가이드

프로젝트 연동을 위한 상세 단계별 절차

---

## 1. 초기화 및 연동
- 터미널 명령: `firebase login`을 통한 구글 계정 인증
- 프로젝트 연결: `firebase use --add` 명령으로 프로젝트 및 별칭 설정

---

## 2. Firebase 콘솔 설정
- Firestore 구축: 특정 리전(예: Seoul) 선택 및 프로덕션 모드 시작
- 인증 활성화: Authentication 메뉴 내 '익명 로그인' 허용 설정
- 데이터베이스 규칙: 보안 규칙 및 인덱스 배포 상태 확인

---

## 3. 리소스 배포
- 보안 규칙 배포: `firebase deploy --only firestore:rules` 수행
- 인덱스 배포: `firebase deploy --only firestore:indexes` 수행

---

## 4. 환경 변수 및 로컬 테스트
- 환경 변수: `.env` 파일에 VITE_ 접두사가 붙은 Firebase 설정값 입력 확인
- 실행: `npm run dev` 명령으로 서버 기동 및 브라우저 콘솔 내 인증 로그 확인

---

## 5. 트러블슈팅 가이드
- 권한 오류: Firestore Database 미생성 또는 규칙 미배포 여부 확인
- 인증 실패: 콘솔 내 익명 로그인 활성화 여부 확인
- 설정 누락: `.env` 파일 존재 여부 및 변수명 오타 점검

---

## 6. 관리 명령어
- 프로젝트 목록 조회: `firebase projects:list`
- 전체 배포: `npm run build` 후 `firebase deploy` 실행
- 데이터 확인: Firebase 콘솔 데이터 탭에서 실시간 기록 점검
