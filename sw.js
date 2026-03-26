// wnstudio sw.js - updated: 1774502673
const CACHE = 'wnstudio-1774502673';

self.addEventListener('install', e => {
  // 즉시 활성화
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/novel-studio/', '/novel-studio/index.html'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 이전 캐시 전부 삭제
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('캐시 삭제:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 항상 네트워크 우선
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'})
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
