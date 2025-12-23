# 🚀 배포 및 호스팅 지침서

> Vercel 배포, GitHub 연동, PWA 설정 가이드

---

## 1. 배포 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    개발 워크플로우                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  로컬 개발        GitHub           Vercel               │
│  ┌───────┐       ┌───────┐       ┌───────────────┐      │
│  │ 코드  │ push  │ Repo  │ 자동  │ 빌드 & 배포   │      │
│  │ 수정  │ ───► │       │ ───► │               │      │
│  └───────┘       └───────┘       └───────┬───────┘      │
│                                          │              │
│                                          ▼              │
│                                  ┌───────────────┐      │
│                                  │ Production    │      │
│                                  │ your-app.     │      │
│                                  │ vercel.app    │      │
│                                  └───────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. GitHub 저장소 설정

### 2.1 저장소 생성

```bash
# 로컬 Git 초기화
cd "AI Language Game"
git init

# .gitignore 생성
echo "node_modules/
.DS_Store
*.log
.env" > .gitignore

# 첫 커밋
git add .
git commit -m "Initial commit: Project structure and documentation"

# GitHub 연결
git remote add origin https://github.com/[username]/ai-language-game.git
git branch -M main
git push -u origin main
```

### 2.2 권장 브랜치 전략

```
main (프로덕션)
  │
  └── develop (개발)
        │
        ├── feature/game-engine
        ├── feature/csv-loader
        └── feature/ranking-system
```

---

## 3. Vercel 배포

### 3.1 Vercel 연결

1. **[vercel.com](https://vercel.com)** 접속
2. **GitHub로 로그인**
3. **Import Project** 클릭
4. **GitHub 저장소 선택**
5. **Deploy** 클릭

### 3.2 프로젝트 설정

```json
// vercel.json (옵션)
{
  "version": 2,
  "builds": [
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### 3.3 환경 변수 설정 (필요시)

```
Project Settings → Environment Variables

GOOGLE_SHEETS_URL = https://script.google.com/...
```

---

## 4. 도메인 설정 (선택)

### 4.1 커스텀 도메인

1. Vercel Dashboard → Settings → Domains
2. **Add Domain** 클릭
3. 도메인 입력 (예: `wordquiz.com`)
4. DNS 레코드 설정:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### 4.2 무료 도메인 옵션

```
Vercel 제공: your-project.vercel.app (자동)
```

---

## 5. 파일 구조 for 배포

```
AI Language Game/
├── public/                 # ← Vercel이 서빙하는 폴더
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js               # Service Worker
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
│
├── data/
│   └── words.csv
│
├── docs/                   # 문서 (배포에 포함 안함)
│
├── .gitignore
├── vercel.json             # Vercel 설정
└── README.md
```

> ⚠️ **중요:** Vercel은 기본적으로 `public/` 폴더를 루트로 서빙합니다.

---

## 6. PWA 배포 체크리스트

### 6.1 필수 조건

- [x] HTTPS 사용 (Vercel 자동 제공)
- [ ] `manifest.json` 설정
- [ ] Service Worker 등록
- [ ] 앱 아이콘 준비

### 6.2 manifest.json 최종 확인

```json
{
  "name": "AI 단어 퀴즈 게임",
  "short_name": "WordQuiz",
  "description": "산성비 스타일 단어 학습 게임",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#a855f7",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 6.3 앱 아이콘 생성

**권장 도구:**
- [Maskable.app](https://maskable.app/) - 마스킹 가능한 아이콘 생성
- [PWA Builder](https://www.pwabuilder.com/) - 아이콘 자동 생성

---

## 7. CI/CD 자동화 (선택)

### 7.1 GitHub Actions

```yaml
# .github/workflows/deploy.yml

name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 8. 모니터링 및 분석

### 8.1 Vercel Analytics (무료)

```javascript
// public/index.html에 추가
<script defer src="/_vercel/insights/script.js"></script>
```

### 8.2 간단한 사용 로그

```javascript
// 게임 시작/종료 시 로깅 (선택)
async function logGameEvent(event, data) {
  await fetch('/api/log', {
    method: 'POST',
    body: JSON.stringify({ event, data, timestamp: Date.now() })
  });
}
```

---

## 9. 유지보수 가이드

### 9.1 콘텐츠 업데이트 (CSV)

```bash
# 1. CSV 파일 수정
# 2. 커밋 & 푸시
git add data/words.csv
git commit -m "Update word data"
git push

# 3. Vercel 자동 배포 (완료!)
```

### 9.2 롤백

```bash
# Vercel Dashboard → Deployments
# 이전 배포 선택 → ... → Promote to Production
```

### 9.3 환경별 배포

```
main 브랜치     → 프로덕션 (your-app.vercel.app)
develop 브랜치  → 미리보기 (your-app-develop.vercel.app)
PR              → 미리보기 (your-app-pr-123.vercel.app)
```

---

## 10. 배포 체크리스트

### 첫 배포 전

- [ ] GitHub 저장소 생성
- [ ] 프로젝트 파일 푸시
- [ ] Vercel 계정 생성
- [ ] GitHub 저장소 연결
- [ ] 배포 테스트

### 매 배포 시

- [ ] 로컬 테스트 완료
- [ ] CSV 데이터 검증
- [ ] manifest.json 확인
- [ ] 브라우저 캐시 확인

### PWA 배포

- [ ] HTTPS 적용 확인
- [ ] manifest.json 유효성
- [ ] Service Worker 등록
- [ ] 아이콘 표시 확인
- [ ] 오프라인 모드 테스트

---

## 11. 문제 해결

### 일반적인 오류

| 증상 | 원인 | 해결 |
|------|------|------|
| 404 에러 | 경로 설정 오류 | vercel.json routes 확인 |
| CSS 미적용 | MIME 타입 오류 | 파일 확장자 확인 |
| PWA 설치 불가 | HTTPS 또는 manifest | 콘솔 오류 확인 |
| CSV 로드 실패 | CORS 또는 경로 | public/ 폴더 확인 |

### 디버깅 명령

```bash
# Vercel CLI로 로컬 테스트
npm i -g vercel
vercel dev

# 빌드 로그 확인
vercel logs your-app.vercel.app
```
