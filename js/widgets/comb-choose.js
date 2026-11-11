"use strict";
/* Choose vs arrange lab: list every way to pick r of n letters (combination) and every way to line them up (permutation).
   Each combination is shown with its r! orderings, so P(n,r) = r! x C(n,r) can be seen directly. */
(function (ST) {
  const LET = "ABCDE";
  const fact = k => k <= 1 ? 1 : k * fact(k - 1);
  const combos = (items, r) => r === 0 ? [[]] : items.flatMap((x, i) => combos(items.slice(i + 1), r - 1).map(c => [x, ...c]));
  const perms = items => items.length <= 1 ? [items] : items.flatMap((x, i) => perms([...items.slice(0, i), ...items.slice(i + 1)]).map(p => [x, ...p]));

  ST.widget("choose", {
    title: "選ぶ(組合せ)と並べる(順列):全部書き出して数える",
    group: "comb", name: "選ぶ・並べる", desc: "組合せ C(n,r) と順列 P(n,r) を書き出して比べる", order: 2,
    mount(el) {
      let n = 4, r = 2, mode = "c", hotIdx = 0;
      const draw = () => {
        const items = LET.slice(0, n).split("");
        const cs = combos(items, r), total = mode === "c" ? cs.length : cs.length * fact(r);
        if (hotIdx >= cs.length) hotIdx = 0;
        const chip = (t, hot) => `<span class="ch-chip ${hot ? "hot" : ""}">${t}</span>`;
        const body = mode === "c"
          ? cs.map((c, i) => `<button type="button" data-hot="${i}" style="all:unset;cursor:pointer">${chip(c.join(""), i === hotIdx)}</button>`).join("")
          : cs.map((c, i) => `<div data-hot="${i}" style="margin:6px 0;padding:4px 6px;border-radius:8px;${i === hotIdx ? "background:var(--packet-soft)" : ""}"><span class="cap">{${c.join(",")}} →</span> ${perms(c).map(p => chip(p.join(""), i === hotIdx)).join("")}</div>`).join("");
        const eq = mode === "c" ? `C(${n},${r}) ＝ ${total}` : `P(${n},${r}) ＝ ${fact(r)}! × C(${n},${r}) ＝ ${fact(r)} × ${cs.length}`;
        el.innerHTML = `<div style="display:grid;gap:12px">
          <div><p class="lab-label">文字の数 n</p>${ST.segHtml("n", [[3, "3"], [4, "4"], [5, "5"]], n)}</div>
          <div><p class="lab-label">選ぶ数 r</p>${ST.segHtml("r", Array.from({ length: n }, (_, i) => [i + 1, String(i + 1)]), r)}</div>
          <div><p class="lab-label">数え方</p>${ST.segHtml("mode", [["c", "選ぶだけ(順序なし)"], ["p", "選んで並べる(順序あり)"]], mode)}</div></div>
          <div class="lab-big" aria-live="polite"><b>${total}</b><span>通り　<span class="cap" style="font-size:15px">${eq}</span></span></div>
          <div class="hexbox" style="max-height:300px;overflow:auto">${body}</div>
          <p class="cap">${mode === "c" ? "AB と BA は同じ選び方なので、1通りと数えます。タップすると色がつきます。" : "選んだ組合せ1つにつき、並べ方が r! 通りあります。AB と BA は別の並べ方です。"}</p>`;
        ST.wireSeg(el, "n", v => { n = +v; if (r > n) r = n; draw(); });
        ST.wireSeg(el, "r", v => { r = +v; draw(); });
        ST.wireSeg(el, "mode", v => { mode = v; draw(); ST.markLab("choose"); });
        el.querySelectorAll("[data-hot]").forEach(b => b.onclick = () => { hotIdx = +b.dataset.hot; draw(); });
      };
      draw();
    }
  });
})(window.ST);
