# 🔧 기술 스택 가이드

> WebLLM, PWA 및 핵심 기술 구현 상세

---

## 1. 기술 스택 개요

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Stack                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   HTML5     │  │   CSS3      │  │   Vanilla JS    │  │
│  │  - Canvas   │  │  - Flexbox  │  │  - ES6+ 문법    │  │
│  │  - Semantic │  │  - Grid     │  │  - ES Modules   │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  PapaParse  │  │   WebLLM    │  │   PWA           │  │
│  │  CSV 파싱    │  │  로컬 AI    │  │  오프라인 지원  │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 핵심 라이브러리

### 2.1 PapaParse (CSV 파싱)

**CDN 링크:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
```

**사용 예시:**
```javascript
Papa.parse('data/words.csv', {
  download: true,
  header: true,
  complete: (results) => {
    console.log(results.data);
  }
});
```

### 2.2 WebLLM (로컬 AI)

**개념:**
- 사용자 브라우저의 GPU/CPU에서 LLM 실행
- API 키 불필요, 비용 0원
- 오프라인에서도 작동 가능

**설치:**
```html
<script type="module">
  import * as webllm from "https://esm.run/@mlc-ai/web-llm";
</script>
```

**초기화:**
```javascript
// src/js/ai/WebLLMClient.js

class WebLLMClient {
  constructor() {
    this.engine = null;
    this.isReady = false;
  }

  async initialize(progressCallback) {
    const { CreateMLCEngine } = await import("https://esm.run/@mlc-ai/web-llm");
    
    this.engine = await CreateMLCEngine(
      "Llama-3.2-1B-Instruct-q4f16_1-MLC", // 경량 모델
      {
        initProgressCallback: (progress) => {
          progressCallback?.(progress);
        }
      }
    );
    
    this.isReady = true;
  }

  async generateSimilarWords(options) {
    if (!this.isReady) throw new Error('WebLLM not initialized');
    
    const { category, difficulty, count } = options;
    
    const prompt = `Generate ${count} English vocabulary words for category "${category}" 
    with difficulty level ${difficulty}/5. 
    Format: word|meaning|example sentence
    Only output the words, no explanation.`;
    
    const response = await this.engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200
    });
    
    return this.parseResponse(response.choices[0].message.content);
  }

  parseResponse(text) {
    // 응답 파싱 로직
    return text.split('\n')
      .filter(line => line.includes('|'))
      .map(line => {
        const [word, meaning, sentence] = line.split('|');
        return { word: word.trim(), meaning: meaning.trim(), sentence: sentence?.trim() };
      });
  }
}

export default WebLLMClient;
```

---

## 3. PWA (Progressive Web App)

### 3.1 필수 파일

```
public/
├── manifest.json    # 앱 메타데이터
├── sw.js            # Service Worker
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

### 3.2 manifest.json

```json
{
  "name": "AI 단어 퀴즈 게임",
  "short_name": "WordQuiz",
  "description": "AI 기반 산성비 스타일 단어 학습 게임",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#16213e",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 3.3 Service Worker (sw.js)

```javascript
const CACHE_NAME = 'word-quiz-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/css/style.css',
  '/src/js/main.js',
  '/data/words.csv'
];

// 설치 시 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 요청 가로채기
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 3.4 HTML에 등록

```html
<!-- public/index.html -->
<head>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#16213e">
</head>

<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

---

## 4. 브라우저 호환성

### 4.1 지원 브라우저

| 브라우저 | 최소 버전 | WebLLM 지원 | PWA 지원 |
|----------|-----------|-------------|----------|
| Chrome | 89+ | ✅ (WebGPU) | ✅ |
| Edge | 89+ | ✅ (WebGPU) | ✅ |
| Firefox | 90+ | ⚠️ (제한적) | ✅ |
| Safari | 16.4+ | ⚠️ (제한적) | ✅ |

### 4.2 폴리필

```html
<!-- 구형 브라우저 지원 -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
```

---

## 5. 성능 최적화

### 5.1 Canvas 최적화

```javascript
class OptimizedRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: false,      // 투명도 불필요 시
      desynchronized: true // 부드러운 렌더링
    });
  }

  // 오프스크린 캔버스 사용
  createOffscreenBuffer() {
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = this.canvas.width;
    this.offscreen.height = this.canvas.height;
    this.offCtx = this.offscreen.getContext('2d');
  }
}
```

### 5.2 메모리 관리

```javascript
// 객체 풀링
class ObjectPool {
  constructor(createFn, initialSize = 20) {
    this.pool = [];
    this.createFn = createFn;
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  get() {
    return this.pool.pop() || this.createFn();
  }

  release(obj) {
    this.pool.push(obj);
  }
}
```

### 5.3 Lazy Loading

```javascript
// WebLLM 지연 로딩
let webllmClient = null;

async function getWebLLM() {
  if (!webllmClient) {
    const { default: WebLLMClient } = await import('./ai/WebLLMClient.js');
    webllmClient = new WebLLMClient();
    await webllmClient.initialize();
  }
  return webllmClient;
}
```

---

## 6. 개발 환경 설정

### 6.1 로컬 서버 실행

```bash
# Python 사용
python -m http.server 8080

# Node.js 사용
npx serve public

# VS Code Live Server 확장 사용
```

### 6.2 디버깅

```javascript
// 개발 모드 플래그
const DEV_MODE = location.hostname === 'localhost';

if (DEV_MODE) {
  window.DEBUG = {
    showFPS: true,
    showHitboxes: true,
    logEvents: true
  };
}
```

---

## 7. 구현 체크리스트

- [ ] HTML5 기본 구조 설정
- [ ] CSS3 스타일 시스템 구축
- [ ] ES6 모듈 시스템 적용
- [ ] PapaParse 연동
- [ ] WebLLM 초기화 및 테스트
- [ ] manifest.json 작성
- [ ] Service Worker 구현
- [ ] 브라우저 호환성 테스트
- [ ] 성능 최적화 적용
