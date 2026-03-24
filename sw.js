const CACHE = 'wnstudio-1774333070';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        '/novel-studio/',
        '/novel-studio/index.html'
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 이전 버전 캐시 전부 삭제
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // 네트워크 우선 전략 (항상 최신 파일 가져옴)
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 성공하면 캐시에도 저장
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // 오프라인이면 캐시에서
        return caches.match(e.request).then(cached => {
          return cached || caches.match('/novel-studio/index.html');
        });
      })
  );
});
