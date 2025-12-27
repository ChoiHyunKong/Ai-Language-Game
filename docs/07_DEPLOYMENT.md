# 배포 및 호스팅 가이드

Vercel 배포, GitHub 연동, 환경 변수 설정 완전 가이드

---

## 1. 배포 아키텍처

### 현재 배포 환경
- **호스팅**: Vercel
- **빌드 도구**: Vite
- **데이터베이스**: Firebase Firestore
- **인증**: Firebase Anonymous Authentication
- **프로덕션 URL**: https://ai-language-game.vercel.app

### 배포 워크플로우
```
로컬 개발 → Git Push → GitHub → Vercel 자동 빌드 및 배포
```

---

## 2. 초기 설정

### 2.1 GitHub 저장소 설정
```bash
# 저장소 초기화
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ChoiHyunKong/Ai-Language-Game.git
git push -u origin main
```

### 2.2 Vercel 프로젝트 설정
1. https://vercel.com 접속 및 GitHub 로그인
2. "New Project" 클릭
3. GitHub 저장소 `ChoiHyunKong/Ai-Language-Game` Import
4. 프로젝트 설정:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

---

## 3. 환경 변수 설정

### 3.1 로컬 환경 (.env)
프로젝트 루트에 `.env` 파일 생성:

```env
VITE_FIREBASE_API_KEY=AIzaSyCmmiq2uXUIaVfipAkN21hSeupjgAOgNtM
VITE_FIREBASE_AUTH_DOMAIN=ai-language-game.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-language-game
VITE_FIREBASE_STORAGE_BUCKET=ai-language-game.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=196870165370
VITE_FIREBASE_APP_ID=1:196870165370:web:0c138fadd044ef2018bcc3
VITE_FIREBASE_MEASUREMENT_ID=G-PG323DE97F
```

### 3.2 Vercel 환경 변수 설정

#### Vercel CLI로 설정
```bash
# 각 환경 변수 추가
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
vercel env add VITE_FIREBASE_MEASUREMENT_ID production
```

#### Vercel 대시보드에서 설정
1. Vercel 프로젝트 > Settings > Environment Variables
2. 각 변수명과 값 입력
3. Environment: **Production** 선택
4. Save 클릭

---

## 4. 빌드 설정

### 4.1 Vite 설정 (vite.config.js)
```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  envDir: '../',
  publicDir: './data',  // CSV 파일 포함
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
      }
    },
    assetsInclude: ['**/*.csv'],
    copyPublicDir: true
  },
  assetsInclude: ['**/*.csv'],
  server: {
    port: 3000,
    open: true
  }
});
```

### 4.2 Vercel 설정 (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

---

## 5. 배포 프로세스

### 5.1 로컬 빌드 및 테스트
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 5.2 Git 푸시를 통한 자동 배포
```bash
git add .
git commit -m "Update: feature description"
git push origin main
```

Vercel이 자동으로 감지하고 빌드 시작

### 5.3 Vercel CLI를 통한 수동 배포
```bash
# Production 배포
vercel --prod

# Preview 배포
vercel
```

---

## 6. 배포 확인 및 모니터링

### 6.1 배포 상태 확인
```bash
# 배포 목록 조회
vercel ls

# 배포 로그 확인
vercel logs [deployment-url]

# 배포 상세 정보
vercel inspect [deployment-url]
```

### 6.2 Vercel 대시보드 모니터링
- **Deployments**: 배포 이력 및 상태
- **Analytics**: 트래픽 및 성능 지표
- **Logs**: 실시간 로그 및 에러 추적

---

## 7. 데이터 업데이트 및 배포

### CSV 파일 업데이트 시
1. `public/data/words.csv` 파일 편집
2. Git 커밋 및 푸시
```bash
git add public/data/words.csv
git commit -m "Update: 단어 데이터 추가"
git push origin main
```
3. Vercel 자동 빌드 및 배포
4. 1-3분 후 프로덕션 반영

---

## 8. 롤백 및 문제 해결

### 8.1 이전 버전으로 롤백
1. Vercel 대시보드 > Deployments
2. 안정적인 이전 배포 선택
3. "Promote to Production" 클릭

### 8.2 일반적인 문제 해결

#### 문제 1: 환경 변수 로드 실패
```bash
# Vercel 환경 변수 확인
vercel env ls

# 재배포
vercel --prod --yes
```

#### 문제 2: CSV 파일 404 에러
- Vite `publicDir` 설정 확인
- CSV 경로: `/words.csv` (빌드 후)
- 로컬 경로: `public/data/words.csv`

#### 문제 3: Firebase 연결 실패
1. Firebase Storage Bucket 확인: `.appspot.com` 사용
2. Vercel 환경 변수 재확인
3. Firebase Console에서 익명 로그인 활성화 확인

---

## 9. 성능 최적화

### 9.1 Vercel 설정 최적화
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 9.2 빌드 최적화
- Code Splitting: Vite 자동 처리
- Asset Minification: Vite 자동 처리
- CSV 파일: gzip 압축 자동 적용

---

## 10. 배포 체크리스트

### 배포 전
- [ ] 로컬에서 `npm run build` 성공
- [ ] `.env` 파일 gitignore 확인
- [ ] Firebase 환경 변수 Vercel에 등록
- [ ] CSV 데이터 검증 완료

### 배포 후
- [ ] 프로덕션 URL 접속 확인
- [ ] Firebase 인증 작동 확인
- [ ] 랭킹 시스템 정상 작동
- [ ] CSV 데이터 로드 확인
- [ ] 모바일/데스크탑 반응형 확인

---

## 11. CI/CD (선택사항)

### GitHub Actions 설정
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 12. 유지보수

### 정기 점검 항목
- Vercel 배포 로그 확인 (주 1회)
- Firebase 사용량 모니터링 (월 1회)
- 보안 업데이트 확인 (월 1회)
- 의존성 업데이트: `npm outdated` (월 1회)

### 백업 전략
- GitHub 저장소: 자동 백업
- Firebase 데이터: Firestore 자동 백업
- Vercel 배포 이력: 최근 100개 자동 보관
