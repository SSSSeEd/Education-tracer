"use strict";
/* Property 1 lab, drawn like the class slide: [n choose r] = [n-1 choose r-1] + [n-1 choose r].
   All r-subsets of {A..} are listed; "split" moves those that contain A into the middle blob and the rest into the right blob. */
(function (ST) {
  const LET = "ABCDEF";
  const combos = (items, r) => r === 0 ? [[]] : items.flatMap((x, i) => combos(items.slice(i + 1), r - 1).map(c => [x, ...c]));

  ST.widget("rule1", {
    title: "性質①:C(n,r) = C(n−1,r−1) + C(n−1,r)(組合せ的解釈)",
    group: "comb", name: "性質①を分けて数える", desc: "n 個から r 個を、A を選ぶ/選ばないで分ける", order: 5,
    mount(el) {
      let n = 4, r = 2, step = 0, alive = true, busy = false;
      const draw = () => {
        const items = LET.slice(0, n).split(""), all = combos(items, r);
        const withA = all.filter(s => s.includes("A")), without = all.filter(s => !s.includes("A"));
        const chip = (s, cls) => `<span class="ch-chip ${cls}">${s.join("")}</span>`;
        const blob = (title, sub, count, body, on, color) => `<div style="flex:1 1 0;min-width:0;text-align:center">
          <div class="cap" style="margin:0 0 4px;font-weight:700">${title}</div>
          <div style="border-radius:50%/42%;border:3px solid ${on ? color : "var(--line)"};background:${on ? "var(--surface)" : "var(--sunken)"};padding:16px 6px;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;transition:border-color .3s">
            <div style="font:700 26px var(--f-mono);color:${on ? color : "var(--muted)"}">${count}</div>
            <div class="cap" style="margin:0">${sub}</div></div>
          <div style="margin-top:6px;min-height:40px">${body}</div></div>`;
        const left = blob(`C(${n},${r})`, `${n}個から${r}個選ぶ`, all.length, step === 0 ? all.map(s => chip(s, "")).join("") : `<span class="cap">分けました</span>`, step === 0 || step === 1, "var(--packet)");
        const mid = blob(`C(${n - 1},${r - 1})`, `A を選ぶ<br>(残り${n - 1}個から${r - 1}個)`, withA.length, step >= 2 ? withA.map(s => chip(s, "hot")).join("") : "", step >= 2, "var(--link)");
        const right = blob(`C(${n - 1},${r})`, `A を選ばない<br>(残り${n - 1}個から${r}個)`, without.length, step >= 3 ? without.map(s => chip(s, "")).join("") : "", step >= 3, "var(--ok)");
        const msg = ["まず、n 個から r 個選ぶ全部の組を書き出しています。", "「A を選ぶか、選ばないか」のどちらかに必ず分かれます(重なりも漏れもありません)。", "A を選ぶ組(A はもう決まっているので、残りから r−1 個を選ぶ数)を移します。", "A を選ばない組(残りから r 個を選ぶ数)を移します。左の数は、右の2つの合計と等しくなります。"][step];
        el.innerHTML = `<div><p class="lab-label">文字の数 n</p>${ST.segHtml("n", [[3, "3"], [4, "4"], [5, "5"], [6, "6"]], n)}</div>
          <div><p class="lab-label">選ぶ数 r</p>${ST.segHtml("r", Array.from({ length: n }, (_, i) => [i + 1, String(i + 1)]), r)}</div>
          <div class="lab-big" aria-live="polite"><b>${all.length}</b><span>＝ ${withA.length} ＋ ${without.length}　<span class="cap" style="font-size:15px">C(${n},${r}) ＝ C(${n - 1},${r - 1}) ＋ C(${n - 1},${r})</span></span></div>
          <div class="stage" style="padding:12px 8px"><div style="display:flex;gap:6px;align-items:flex-start">${left}<div style="font:700 28px var(--f-mono);align-self:center;padding-top:20px">＝</div>${mid}<div style="font:700 28px var(--f-mono);align-self:center;padding-top:20px">＋</div>${right}</div></div>
          <p class="cap" aria-live="polite">${msg}</p>
          <div class="btns"><button type="button" class="btn primary" data-play ${busy ? "disabled" : ""}>▶ 分けるアニメーション</button><button type="button" class="btn" data-next ${busy || step >= 3 ? "disabled" : ""}>次の段階 ›</button><button type="button" class="btn" data-reset ${busy ? "disabled" : ""}>最初から</button></div>`;
        ST.wireSeg(el, "n", v => { n = +v; if (r > n) r = n; step = 0; draw(); });
        ST.wireSeg(el, "r", v => { r = +v; step = 0; draw(); });
        el.querySelector("[data-next]").onclick = () => { step = Math.min(3, step + 1); draw(); if (step === 3) ST.markLab("rule1"); };
        el.querySelector("[data-reset]").onclick = () => { step = 0; draw(); };
        el.querySelector("[data-play]").onclick = async () => {
          busy = true; step = 0; draw();
          for (let s = 1; s <= 3 && alive; s++) { await ST.sleep(900); if (!alive) return; step = s; draw(); }
          busy = false; if (alive) { draw(); ST.markLab("rule1"); }
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
