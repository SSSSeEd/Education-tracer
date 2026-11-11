"use strict";
/* Small helpers shared by the counting labs (組合せ論): binomials, enumeration, and a "count them all" animation loop. */
(function (ST) {
  ST.C = (n, r) => { if (r < 0 || r > n) return 0; let x = 1; for (let i = 1; i <= r; i++) x = x * (n - r + i) / i; return Math.round(x); };
  ST.fact = k => k <= 1 ? 1 : k * ST.fact(k - 1);
  /* All r-element subsets of 0..n-1 as sorted index arrays, in lexicographic order. */
  ST.combIdx = (n, r, from) => { from = from || 0; if (r === 0) return [[]]; const out = []; for (let i = from; i <= n - r; i++) ST.combIdx(n, r - 1, i + 1).forEach(c => out.push([i, ...c])); return out; };
  /* All ordered selections of r distinct indices out of 0..n-1 (P(n,r) of them). */
  ST.permIdx = (n, r, used) => { used = used || []; if (r === 0) return [[]]; const out = []; for (let i = 0; i < n; i++) if (!used.includes(i)) ST.permIdx(n, r - 1, [...used, i]).forEach(p => out.push([i, ...p])); return out; };
  /* Show items 0..total-1 one after another (about 70 frames at most) so that "counting them all" is visible.
     show(i) draws item i. alive() returns false once the lab is closed. Resolves true when it ran to the end. */
  ST.countRun = async (total, show, alive, ms) => {
    const stride = Math.max(1, Math.ceil(total / 70));
    for (let i = 0; i < total; i += stride) { if (!alive()) return false; show(i); await ST.sleep(ms || 55); }
    if (!alive()) return false;
    show(total - 1); return true;
  };
  /* Points on a circle, starting at the top and going clockwise. */
  ST.ringPts = (n, cx, cy, r) => Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; });
})(window.ST);
