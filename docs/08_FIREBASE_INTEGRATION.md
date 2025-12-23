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

## ⚠️ 주의 사항
- **보안**: 클라이언트 측에서만 동작하므로 API 키가 노출됩니다. Firebase 보안 규칙을 통해 특정 도메인에서만 접근 가능하도록 설정해야 합니다.
- **오남용 방지**: 점수 조작(Inspector 이용)을 방지하기 위한 최소한의 검증 로직(예: 점수/콤보 비율 검사)이 필요합니다.
