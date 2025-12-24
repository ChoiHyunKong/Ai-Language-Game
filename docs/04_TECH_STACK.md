# 기술 스택 가이드

WebLLM, PWA 및 핵심 기술 구현 상세 안내

---

## 1. 기술 스택 개요
- Frontend: HTML5 (Canvas), CSS3 (Flexbox/Grid), Vanilla JS (ES6+)
- 핵심 라이브러리: PapaParse (CSV 파싱), WebLLM (로컬 AI 엔진)
- 기능 확장: PWA (오프라인 지원 및 앱 설치 환경 제공)

---

## 2. 핵심 라이브러리 활용

### 2.1 PapaParse (CSV 데이터 처리)
- 용도: 외부 CSV 파일을 JavaScript 객체로 변환
- 특징: 대량의 데이터를 비동기적으로 처리 가능

### 2.2 WebLLM (로컬 인공지능)
- 특징: 클라우드 API 없이 브라우저 GPU를 사용하여 연산 수행
- 장점: 비용 발생 없음, 개인정보 보호 우수, 오프라인 작동 가능
- 구현: @mlc-ai/web-llm 라이브러리를 통한 모델 로드 및 프롬프트 처리

---

## 3. PWA (Progressive Web App) 구현

### 3.1 구성 요소
- manifest.json: 앱 이름, 아이콘, 테마 색상 등 메타데이터 정의
- sw.js (Service Worker): 오프라인 환경을 위한 정적 자산 캐싱 및 네트워크 인터셉트

### 3.2 주요 기능
- 설치형 경험: 모바일 및 데스크탑 앱 형태 설치 지원
- 오프라인 모드: 네트워크 연결 없이도 기본 게임 플레이 가능

---

## 4. 환경 및 최적화

### 4.1 브라우저 지원 범위
- Chrome, Edge: WebGPU 기반 전체 성능 지원
- Firefox, Safari: 제한적 지원 또는 기본 웹 기술 활용

### 4.2 성능 최적화 전략
- Canvas 최적화: 투명도 옵션 조정 및 렌더링 부하 최소화
- 메모리 관리: 객체 풀링(Object Pooling) 기법 검토
- 지연 로딩: 대용량 AI 모델 필요 시점에 로드 (Lazy Loading)

---

## 5. 구현 체크리스트
- 기본 웹 표준 구조 및 모듈 시스템 구축
- CSV 데이터 파싱 엔진 연동
- 로컬 AI 클라이언트 인터페이스 개발
- PWA Manifest 및 Service Worker 설정
- 멀티 브라우저 호환성 및 성능 최적화 검증
