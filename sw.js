"use strict";
/* Offline support. Network first (so lessons and news stay current), falling back to the cached copy when offline.
   Same-origin GET only; web fonts from other origins are not cached (system fonts are used offline). */
const CACHE = "edutracer-v1";
const SHELL = [
  "./",
  "index.html",
  "css/style.css",
  "manifest.webmanifest",
  "icon.svg",
  "icon-180.png",
  "js/core.js",
  "js/data/sources.js",
  "js/data/terms.js",
  "js/data/courses.js",
  "js/data/quiz.js",
  "js/widgets/_kit.js",
  "js/widgets/comb-choose.js",
  "js/widgets/comb-pascal.js",
  "js/widgets/comb-rule1.js",
  "js/widgets/comb-subsets.js",
  "js/widgets/comb-split.js",
  "js/widgets/comb-vander.js",
  "js/widgets/_comb.js",
  "js/widgets/comb-committee.js",
  "js/widgets/comb-atleast.js",
  "js/widgets/comb-points.js",
  "js/widgets/comb-polygon.js",
  "js/widgets/comb-rects.js",
  "js/widgets/comb-lattice.js",
  "js/widgets/comb-anagram.js",
  "js/widgets/comb-gifts.js",
  "js/widgets/comb-bars.js",
  "js/widgets/comb-partition.js",
  "js/widgets/comb-heq.js",
  "js/widgets/comb-stairs.js",
  "js/widgets/comb-fibpascal.js",
  "js/views.js",
  "js/app.js"
];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match("index.html"))));
});
