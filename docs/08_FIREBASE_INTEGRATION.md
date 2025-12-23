# 08 - Firebase Integration Guide

이 문서는 실시간 글로벌 랭킹 시스템 및 데이터 영속성을 위한 Firebase 연동 계획을 다룹니다.

## 📋 개요
현재의 랭킹 시스템은 브라우저의 `LocalStorage`에 의존하고 있어 게임을 이용하는 모든 사용자가 순위를 공유할 수 없습니다. 이를 해결하기 위해 Google의 Firebase를 활용하여 전 세계 사용자의 기록을 통합 관리합니다.

## 🛠 선택 서비스
- **Firebase Realtime Database**: 낮은 지연 시간으로 실시간 순위 변동을 반영하기에 적합합니다. (NoSQL 방식)
- **Firebase Hosting (옵션)**: GitHub Pages 대신 고성능 무료 호스팅 서비스를 제공합니다.
- **Firebase Authentication (옵션)**: 사용자 이름 중복 방지 및 아이디 기반 기록 관리가 필요한 경우 도입합니다.

---

## 🏗 아키텍처 및 데이터 구조

### 1. Database Schema (JSON)
```json
{
  "rankings": {
    "word_practice": {
      "difficulty_3": [
        {
          "playerName": "Alpha",
          "score": 15000,
          "maxCombo": 52,
          "accuracy": 98,
          "timestamp": 1703342400000
        }
      ]
    }
  }
}
```

### 2. 주요 로직 (예상 예시)
- **점수 기록**: 게임 종료 시 `push()` 메서드를 사용하여 실시간 데이터베이스에 전송.
- **랭킹 읽기**: `orderByChild('score')` 및 `limitToLast(10)`을 사용하여 상위 10명을 상시 조회.

---

## 🚦 단계별 연동 계획

### 1단계: Firebase 프로젝트 설정
1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성.
2. 웹 앱 등록 및 SDK 설정값(API Key 등) 획득.
3. Realtime Database 보안 규칙 설정 (공개 읽기/제한된 쓰기).

### 2단계: 클라이언트 SDK 도입
1. `firebase-app.js`, `firebase-database.js` 임포트.
2. `FirebaseManager.js` (신규 클래스) 생성하여 통신 로직 캡슐화.

### 3단계: 기존 ScoreManager 연동
1. 기존 `ScoreManager.saveLocal()` 호출 후 `FirebaseManager.saveGlobal()` 호출 하도록 수정.
2. 랭킹 페이지 로딩 시 로컬 데이터와 서버 데이터를 병합하여 표시.

---

## 🛡️ 보안 및 부정행위(해킹) 방지 대책

웹 게임 특성상 모든 로직이 클라이언트에서 동작하므로, 악의적인 사용자가 점수를 조작하여 서버에 전송하는 것을 100% 막기는 어렵지만 다음과 같은 단계별 조치를 통해 방어력을 극대화합니다.

### 1단계: Firebase 보안 규칙 (Security Rules)
데이터베이스 자체에서 허용되지 않은 형식의 데이터가 들어오는 것을 차단합니다.
- **구조 검증**: `playerName`은 문자열이며, `score`는 숫자이고 특정 범위 내에 있는지 검사.
- **삭제/수정 방지**: 한 번 기록된 데이터는 수정하거나 삭제할 수 없도록 `allow create`만 허용하고 `update`, `delete`는 차단.
```javascript
// Firebase Security Rules 예시
match /rankings/{mode}/{difficulty}/{entryId} {
  allow read: if true;
  allow create: if request.resource.data.score is number 
               && request.resource.data.score < 1000000 // 비정상적인 점수 차단
               && request.resource.data.playerName.size() <= 10;
  allow update, delete: if false; // 본인도 수정 불가
}
```

### 2단계: 점수 무결성 검증 로직
클라이언트에서 점수를 생성할 때 논리적 검증 과정을 추가합니다.
- **점수 산출 공식 검증**: 서버(혹은 전송 시)에 `score`만 보내는 것이 아니라, `correctWordsCount`, `maxCombo`, `accuracy`를 함께 보냅니다. 서버 측 규칙이나 함수에서 `score`가 다른 지표들과 논리적으로 맞는지 대조합니다.
- **Honeypot 필드**: 실제 점수 제출과는 상관없는 가짜 변수(예: `isAdmin`)를 만들어 개발자 도구로 조작하는 사람을 낚아 차단 목록에 추가합니다.

### 3단계: 코드 난독화 및 흐름 암호화
- **JavaScript 난독화**: 빌드 도구(Terser 등)를 사용하여 함수 이름과 변수를 읽기 어렵게 만듭니다.
- **Payload 서명**: 전송되는 데이터에 타임스탬프와 비밀 키를 조합한 Hash 값을 포함시켜, 직접 API를 호출하는 행위를 어렵게 만듭니다.

### 4단계: Firebase Cloud Functions (최종 병기)
가장 확실한 방법은 점수 기록 로직을 서버(Cloud Functions)로 옮기는 것입니다.
1. 게임 중 발생하는 주요 이벤트를 서버에 알림.
2. 서버가 게임 종료 시 이 이벤트들을 종합하여 최종 점수를 **서버에서 직접 계산**.
3. 서버가 직접 DB에 기록 (클라이언트는 DB 쓰기 권한을 아예 갖지 않음).

---

## ⚠️ 배포 시 주의 사항 (GitHub Public 등)
- **API Key 노출**: Firebase Web API Key는 코드에 노출되어도 괜찮습니다. (문 개방 열쇠가 아니라, 누구네 집인지 알려주는 주소 역할). 단, 위에서 언급한 **보안 규칙**이 반드시 적용되어 있어야 합니다.
- **환경 변수 관리**: 민감한 운영 설정은 `.env` 파일을 통해 관리하며, `.gitignore`에 포함시켜 GitHub에 올라가지 않도록 합니다. (현재 프로젝트는 `.gitignore`가 설정되어 안전합니다.)
- **사용자 정보**: 현재 로컬에 저장되는 `playerName` 외에 비밀번호나 이메일 등 민감 정보는 절대 저장하지 않습니다.
