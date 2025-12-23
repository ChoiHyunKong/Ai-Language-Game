# 09 - SEO & Marketing Strategy

이 문서는 검색 엔진 최적화(SEO) 및 웹 서비스 마케팅을 위한 전략과 체크리스트를 다룹니다.

## 📋 개요
사용자가 구글, 네이버 등 검색 엔진에서 "AI 타자 게임", "AI 용어 학습" 등을 검색했을 때 상단에 노출되도록 하여 자연 유입(Organic Traffic)을 극대화하는 것을 목표로 합니다.

---

## 🔍 SEO (Search Engine Optimization) 최적화

### 1. 메타 데이터 설정 (HTML `<head>`)
- **Title**: 브랜드명과 핵심 키워드 조합 (예: `AI 지식 게임 | AI 용어 학습용 타자 연습`)
- **Meta Description**: 서비스 성격을 정의하는 160자 이내 문구.
- **OG Tags (Open Graph)**: 카카오톡, 페이스북 공유 시 나타날 썸네일(`og:image`)과 제목 설정.

### 2. 기술적 SEO
- **Semantic HTML**: `<h1>`~`<h3>` 태그의 계층 구조 엄수.
- **Sitemap & Robots**: `sitemap.xml`과 `robots.txt`를 생성하여 검색 로봇에게 사이트 구조 제공.
- **JSON-LD**: 구조화된 데이터 마크업을 통해 구글 검색 결과에 리치 스니펫 출력 유도.
- **Image Alt Tags**: 모든 이미지 요소에 설명 텍스트 추가.

### 3. PWA (Progressive Web App) 강화
- 현재 구현된 `manifest.json` 및 `sw.js`를 최적화하여 '앱 설치 가능' 점수를 높임 (SEO 가산점 요소).

---

## 📣 마케팅 전략

### 1. 타겟 오디언스
- AI 기술에 관심이 있는 학생 및 주니어 개발자.
- IT 용어를 쉽고 재미있게 익히고 싶은 입문자.

### 2. 배포 채널
- **커뮤니티**: 클리앙(새소식), 블라인드, 에브리타임, 오픈채팅방.
- **플랫폼**: 깃허브 트렌딩(GitHub Trending) 도전, 인디사이드, 자소설닷컴 등.
- **SNS**: 게임 플레이 영상(사운드 포함)을 숏폼(Reels, Shorts)으로 제작하여 배포.

---

## 📈 성능 측정 (Analytics)
- **Google Analytics (GA4)**: 사용자 방문 횟수, 체류 시간, 유입 경로 추적.
- **Google Search Console**: 검색 노출 순위 및 클릭률 모니터링.
- **Naver Search Advisor**: 네이버 검색 수집 상태 확인.

---

## 📝 체크리스트
- [ ] 파비콘(Favicon) 및 터치 아이콘 최적화
- [ ] 메타 태그 완성 및 검토 (`index.html`)
- [ ] `robots.txt` 작성
- [ ] `sitemap.xml` 자동 생성 스크립트 또는 수동 작성
- [ ] GA4 추적 코드 삽입 (Firebase 연동 시 함께 진행 가능)
