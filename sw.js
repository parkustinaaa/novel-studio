const CACHE = 'wnstudio-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=Noto+Sans+KR:wght@300;400;500;700&family=Black+Han+Sans&display=swap'
];

// 설치 — 핵심 파일 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(['/', '/index.html']))
  );
  self.skipWaiting();
});

// 활성화 — 오래된 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 요청 — 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', e => {
  // POST 등 non-GET은 패스
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // 유효한 응답만 캐시
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => {
        // 오프라인 폴백 — index.html 반환
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
