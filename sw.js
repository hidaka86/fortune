/* MYOURISCOPE Service Worker — ネットワーク優先+オフラインフォールバック */
const CACHE = "myouriscope-v3";
const MAX_ENTRIES = 180; // タロット原寸画像等でキャッシュが無制限に肥大しないための上限

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 保存後の掃除: 同じパスの旧バージョン(?v=旧SHA)を消し、全体を上限以内に保つ
async function cleanup(cache, request) {
  const url = new URL(request.url);
  const keys = await cache.keys();
  if (url.search) {
    for (const k of keys) {
      const ku = new URL(k.url);
      if (ku.pathname === url.pathname && ku.search !== url.search) await cache.delete(k);
    }
  }
  if (keys.length > MAX_ENTRIES) {
    for (const k of keys.slice(0, keys.length - MAX_ENTRIES)) await cache.delete(k);
  }
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          e.waitUntil(
            caches.open(CACHE).then((c) => c.put(e.request, copy).then(() => cleanup(c, e.request)))
          );
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: e.request.destination === "document" }))
  );
});
