"use strict";
/* Lab for 順序分割: split {1..n} into groups of given sizes, ordered (groups labelled) or unordered (groups not distinguished). */
(function (ST) {
  const PRE = [
    { k: "0", n: 4, s: [2, 2] }, { k: "1", n: 5, s: [2, 2, 1] }, { k: "2", n: 6, s: [2, 2, 2] },
    { k: "3", n: 7, s: [3, 2, 2] }, { k: "4", n: 12, s: [4, 4, 4] }
  ];
  const fact = ST.fact;
  const ordered = (items, sizes) => {
    if (!sizes.length) return [[]];
    return ST.combIdx(items.length, sizes[0]).flatMap(c => {
      const g = c.map(i => items[i]), rest = items.filter((_, i) => !c.includes(i));
      return ordered(rest, sizes.slice(1)).map(r => [g, ...r]);
    });
  };
  ST.widget("partition", {
    title: "順序分割:グループに区別があるか、ないか",
    group: "comb", name: "順序分割", desc: "7人を 3・2・2 に分ける。区別するなら 210、しないなら 105", order: 16, tag: "順序分割",
    formula: "順序あり: n! ÷ (n₁! n₂! … nᵣ!)　順序なし: それを(同じ大きさのグループの数)! で割る",
    says: "n 個を、大きさが n₁, n₂, …, nᵣ のグループに分ける方法の数です。",
    meaning: "掃除の部屋(5SJHR・基礎実験室・処理実験室)のように、グループに名前があれば「順序分割」です。名前がなく、ただ班を作るだけなら、同じ大きさの班を入れ替えただけの分け方は同じなので、その入れ替え分(2! や 3!)で割ります。",
    mount(el) {
      let sel = "3", mode = "ord", pos = 0, alive = true, busy = false;
      const draw = () => {
        const { n, s } = PRE[+sel];
        const den = s.reduce((a, k) => a * fact(k), 1), ord = fact(n) / den;
        const cntBy = {}; s.forEach(k => cntBy[k] = (cntBy[k] || 0) + 1);
        const sym = Object.values(cntBy).reduce((a, m) => a * fact(m), 1), unord = ord / sym;
        const symTxt = sym > 1 ? Object.values(cntBy).filter(m => m > 1).map(m => m + "!").join("×") : "1";
        const total = mode === "ord" ? ord : unord;
        const big = ord > 5000;
        let list = [];
        if (!big) {
          list = ordered(Array.from({ length: n }, (_, i) => i + 1), s);
          if (mode === "un") list = list.filter(p => p.every((g, i) => i === 0 || p[i - 1].length !== g.length || p[i - 1][0] < g[0]));
        }
        if (pos >= list.length) pos = 0;
        const fmt = p => p.map((g, i) => `<span class="ch-chip ${i % 2 ? "" : "hot"}" style="font-size:14px">{${g.join(",")}}</span>`).join("");
        const fm = `${n}! ÷ (${s.map(k => k + "!").join(" × ")}) ＝ ${ord}` + (mode === "un" ? ` ÷ ${symTxt} ＝ ${unord}` : "");
        el.innerHTML = `<div><p class="lab-label">分けるもの</p>${ST.segHtml("p", PRE.map(p => [p.k, p.n + "人→" + p.s.join("・")]), sel)}</div>
          <div><p class="lab-label">グループの区別</p>${ST.segHtml("m", [["ord", "ある(順序分割)"], ["un", "ない(班づくり)"]], mode)}</div>
          <div class="lab-big" aria-live="polite"><b>${total}</b><span>通り　<span class="cap" style="font-size:15px">${fm}</span></span></div>
          ${big ? `<p class="cap">数が多いので、書き出さず式だけで確かめます。区別なしで ${symTxt} で割るのは、同じ大きさの班の入れ替えが重なるからです。</p>`
          : `<div class="stage" style="padding:10px;text-align:center" aria-live="polite"><p class="lab-label">${pos + 1} / ${list.length} 番目</p><div id="cur">${fmt(list[pos])}</div></div>
          <div class="btns three"><button type="button" class="btn primary" data-all ${busy ? "disabled" : ""}>▶ 全部数える</button><button type="button" class="btn" data-prev ${busy ? "disabled" : ""}>‹ 前</button><button type="button" class="btn" data-next ${busy ? "disabled" : ""}>次 ›</button></div>
          <p class="cap">${mode === "ord" ? "{1,2,3},{4,5},{6,7} と {1,2,3},{6,7},{4,5} は、グループに名前があるので別の分け方です。" : "同じ大きさの班を入れ替えただけの分け方は1つにまとめています(並べ替えの数 " + sym + " で割った数)。"}</p>`}`;
        ST.wireSeg(el, "p", v => { sel = v; pos = 0; draw(); });
        ST.wireSeg(el, "m", v => { mode = v; pos = 0; draw(); ST.markLab("partition"); });
        if (big) return;
        el.querySelector("[data-prev]").onclick = () => { pos = (pos + list.length - 1) % list.length; draw(); };
        el.querySelector("[data-next]").onclick = () => { pos = (pos + 1) % list.length; draw(); };
        el.querySelector("[data-all]").onclick = async () => {
          busy = true;
          const ok = await ST.countRun(list.length, i => { pos = i; const b = el.querySelector(".lab-big b"); if (b) b.textContent = i + 1; const c = el.querySelector("#cur"); if (c) c.innerHTML = fmt(list[i]); }, () => alive, 60);
          if (!alive) return; busy = false; draw(); if (ok) ST.markLab("partition");
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
