"use strict";
/* Vandermonde lab drawn like the class slide: [whole: l+m choose n] = sum over r of [red: l choose r] x [blue: m choose n-r].
   The animation walks r = 0..n and adds each product until the running total equals the whole. */
(function (ST) {
  const C = (n, r) => { if (r < 0 || r > n) return 0; let x = 1; for (let i = 1; i <= r; i++) x = x * (n - r + i) / i; return Math.round(x); };
  const RED = "var(--attack)", BLUE = "var(--c1)";

  ST.widget("vander", {
    title: "ヴァンデルモンドの畳み込み:全体の箱 ＝ Σ(赤の箱 × 青の箱)",
    group: "comb", name: "ヴァンデルモンドの箱の図", desc: "赤 l 個・青 m 個から n 個選ぶ数を、赤から r 個選ぶ場合で足し上げる", order: 6,
    tag: "性質④",
    formula: "C(l+m,n) ＝ Σ C(l,r) × C(m,n−r)　(r＝0〜n)",
    says: "ヴァンデルモンドの畳み込み。全体の箱の数は、(赤の箱)×(青の箱)を r で足したものに等しい。",
    meaning: "l+m 個から n 個選ぶ全部の組を、「赤から r 個、青から n−r 個」で分けて数えています。赤と青は独立に選べるので、場合ごとに掛け算になります。",
    mount(el) {
      let l = 2, m = 5, n = 4, r = 0, upto = -1, alive = true, busy = false;
      const draw = () => {
        n = Math.min(n, l + m); if (r > n) r = n;
        const terms = Array.from({ length: n + 1 }, (_, k) => C(l, k) * C(m, n - k)), whole = C(l + m, n);
        const shownTo = upto >= 0 ? upto : -1;
        const acc = terms.slice(0, shownTo + 1).reduce((a, b) => a + b, 0);
        const red = Array.from({ length: Math.min(r, l) }, (_, i) => "R" + (i + 1)), blue = Array.from({ length: Math.max(0, Math.min(n - r, m)) }, (_, i) => "B" + (i + 1));
        const ok = terms[r] > 0;
        const egg = (head, sub, num, color, body) => `<div style="flex:1 1 0;min-width:0;text-align:center"><div class="cap" style="margin:0 0 4px;font-weight:700;color:${color}">${head}</div>
          <div style="border-radius:50%/42%;border:3px solid ${color};background:var(--surface);padding:14px 4px;min-height:110px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">
            <div style="font:700 26px var(--f-mono);color:${color}">${num}</div><div class="cap" style="margin:0">${sub}</div></div><div style="margin-top:6px;min-height:34px">${body}</div></div>`;
        const chips = (arr, cls) => arr.length ? arr.map(x => `<span class="ch-chip ${cls}" style="font-size:13px;padding:1px 7px">${x}</span>`).join("") : `<span class="cap">なし</span>`;
        const rows = terms.map((t, k) => `<button type="button" data-r="${k}" aria-pressed="${k === r}" style="all:unset;cursor:pointer;display:flex;gap:8px;align-items:center;padding:6px 8px;margin:3px 0;border-radius:8px;width:calc(100% - 16px);${k === r ? "background:var(--packet-soft);outline:2px solid var(--packet)" : ""};${t === 0 ? "opacity:.45" : ""}">
          <span style="min-width:2.2em;font-weight:700">r=${k}</span><span>${C(l, k)} × ${C(m, n - k)} ＝ <b>${t}</b></span><span style="margin-left:auto">${k <= shownTo ? "✓" : ""}</span></button>`).join("");
        el.innerHTML = `<div><p class="lab-label">赤の個数 l</p>${ST.segHtml("l", [1, 2, 3, 4, 5, 6].map(x => [x, String(x)]), l)}</div>
          <div><p class="lab-label">青の個数 m</p>${ST.segHtml("m", [1, 2, 3, 4, 5, 6].map(x => [x, String(x)]), m)}</div>
          <div><p class="lab-label">選ぶ個数 n</p>${ST.segHtml("n", Array.from({ length: Math.min(l + m, 6) }, (_, i) => [i + 1, String(i + 1)]), n)}</div>
          <div class="stage" style="padding:12px 6px"><div style="display:flex;gap:4px;align-items:flex-start">
            ${egg("全体", `${l + m}個から<br>${n}個選ぶ`, whole, "var(--ok)", `<span class="cap">C(${l + m},${n})</span>`)}
            <div style="font:700 26px var(--f-mono);align-self:center;padding-top:18px">＝Σ</div>
            ${egg("赤", `赤${l}個から<br>${r}個選ぶ`, C(l, r), RED, chips(red, ""))}
            <div style="font:700 24px var(--f-mono);align-self:center;padding-top:18px">×</div>
            ${egg("青", `青${m}個から<br>${n - r}個選ぶ`, C(m, n - r), BLUE, chips(blue, "hot"))}</div></div>
          <p class="cap" aria-live="polite">${ok ? `r=${r} のとき、赤から ${r} 個・青から ${n - r} 個選ぶ組は ${C(l, r)} × ${C(m, n - r)} ＝ ${terms[r]} 通りです。` : `r=${r} のときは、赤が ${l} 個しかない(または青が ${m} 個しかない)ので 0 通りです。`}</p>
          <div class="hexbox" role="group" aria-label="r を選ぶ">${rows}</div>
          <div class="lab-big" aria-live="polite"><b>${shownTo >= 0 ? acc : whole}</b><span>${shownTo >= 0 ? `ここまでの合計${acc === whole && shownTo >= n ? ` ＝ 全体 C(${l + m},${n}) ＝ ${whole}` : `(全体は ${whole})`}` : `全体 C(${l + m},${n}) ＝ ${whole}　<span class="cap" style="font-size:15px">${terms.join(" + ")}</span>`}</span></div>
          <div class="btns"><button type="button" class="btn primary" data-play ${busy ? "disabled" : ""}>▶ r を動かして足していく</button><button type="button" class="btn" data-ex ${busy ? "disabled" : ""}>授業の例(2,5,4)</button></div>`;
        ST.wireSeg(el, "l", v => { l = +v; upto = -1; draw(); });
        ST.wireSeg(el, "m", v => { m = +v; upto = -1; draw(); });
        ST.wireSeg(el, "n", v => { n = +v; upto = -1; draw(); });
        el.querySelectorAll("[data-r]").forEach(b => b.onclick = () => { r = +b.dataset.r; draw(); });
        el.querySelector("[data-ex]").onclick = () => { l = 2; m = 5; n = 4; r = 1; upto = -1; draw(); };
        el.querySelector("[data-play]").onclick = async () => {
          busy = true; upto = -1; r = 0; draw();
          for (let k = 0; k <= n && alive; k++) { await ST.sleep(900); if (!alive) return; r = k; upto = k; draw(); }
          busy = false; if (alive) { draw(); ST.markLab("vander"); }
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
