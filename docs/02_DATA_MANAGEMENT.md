# 데이터 관리 지침서

핵심 내용: CSV 기반 다국어 퀴즈 데이터 관리 체계

---

## 1. 개요
- 단일 원천: 모든 데이터는 `data/words.csv`에서 통합 관리
- 무코드 업데이트: 프로그램 수정 없이 CSV 파일 교체만으로 데이터 갱신
- 다국어 확장: 컬럼 확장 방식으로 신규 언어 추가 용이
- 유연한 로드: 게임 모드 및 언어 설정에 따른 선택적 컬럼 호출

---

## 2. CSV 파일 규격

### 2.1 파일 위치
- 경로: `data/words.csv`

### 2.2 컬럼 정의
- 기본 컬럼: id(식별자), difficulty(난이도 1-5), category(분류)
- 언어별 컬럼: `word_{lang}`, `meaning_{lang}`, `sentence_{lang}` (예: word_ko, word_en)

### 2.3 지원 언어
- 현재 지원: ko(한국어), en(영어), jp(일본어)
- 확장 예정: cn(중국어), es(스페인어) 등

### 2.4 데이터 샘플
```csv
id,word_ko,word_en,word_jp,meaning_ko,sentence_ko,difficulty,category
1,인공지능,AI,人工知能,인간 지능 모방 시스템,___은 현대 기술의 핵심.,2,ai_basic
```

---

## 3. 언어 관리 아키텍처
- LanguageManager 클래스: 지원 언어 목록 관리 및 현재 언어 기반 컬럼명 생성
- 호출 방식: `getWordColumn()`, `getMeaningColumn()` 등 메서드 활용

---

## 4. 게임 모드별 활용
- 단어 연습: `word_{lang}` 직접 매칭
- 의미 퀴즈: `meaning_{lang}` 표시 후 `word_{lang}` 정답 처리
- 문장 완성: `sentence_{lang}` 표시 후 `word_{lang}` 정답 처리

---

## 5. 데이터 업데이트 프로세스
1. words.csv 파일 편집 (UTF-8 인코딩 필수)
2. data/ 폴더 내 파일 덮어쓰기
3. Git Commit & Push
4. Vercel 자동 빌드 및 배포 완료

---

## 6. 품질 검토 체크리스트
- 파일 인코딩 확인: UTF-8 (한글/일어 깨짐 방지)
- 필수 컬럼 존재 여부: id, difficulty, category
- 데이터 무결성: id 중복 및 difficulty 범위(1-5) 확인
- 예문 형식: 문장 완성 모드용 `___` 포함 여부
