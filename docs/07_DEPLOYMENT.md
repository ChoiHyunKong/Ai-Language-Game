# 배포 및 호스팅 지침서

Vercel 배포, GitHub 연동, PWA 설정 가이드

---

## 1. 배포 워크플로우
- 로컬 개발 환경 코드 수정 및 테스트
- GitHub 원격 저장소 Push
- Vercel 자동 빌드 및 호스팅 서버 반영

---

## 2. GitHub 저장소 운영
- 저장소 초기화: git init 및 기본 설정
- 브랜치 전략: main (프로덕션), develop (기능 통합), feature (개별 기능 개발) 구분 권장

---

## 3. Vercel 배포 절차
- 계정 연결: GitHub 연동을 통한 프로젝트 임포트
- 빌드 설정: 정적 자산 경로 및 라우팅 규칙 정의 (필요시 vercel.json 활용)
- 환경 변수: Firebase 설정값 등 민감 정보를 환경 변수로 등록

---

## 4. PWA (Progressive Web App) 설정
- 필수 조건: HTTPS 도메인 확보, manifest.json 작성, Service Worker 등록
- 주요 항목: 앱 이름, 아이콘(192px, 512px), 테마 색상 설정
- 최적화 도구: Maskable.app 등 활용하여 모든 플랫폼 아이콘 대응

---

## 5. CI/CD 및 모니터링
- 자동화: GitHub Actions를 통한 특정 이벤트 시 자동 배포 구성 가능
- 모니터링: Vercel Analytics 활용하여 사용자 트래픽 및 성능 데이터 분석

---

## 6. 유지보수 및 롤백
- 데이터 갱신: CSV 파일 수정 후 Push 시 즉시 반영
- 문제 대응: 배포 이력 관리를 통한 이전 안정 버전으로의 롤백 기능 활용

---

## 7. 배포 체크리스트
- GitHub 저장소 최신화 및 코드 푸시 여부
- Vercel 프로젝트 환경 변수 일치 여부
- PWA Manifest 및 Service Worker 기능 작동 여부
- 도메인 연결 및 SSL 보안 인증 상태 확인
- 모바일 및 데스크탑 환경 실 배포 환경 테스트
