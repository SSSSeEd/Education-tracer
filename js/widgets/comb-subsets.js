"use strict";
/* Subsets lab: every subset of {A..E} is listed, grouped by size. The group sizes are C(n,r) and add up to 2^n.
   The even/odd view shows that even-sized and odd-sized subsets are equally many, i.e. C(n,0) - C(n,1) + ... = 0 (n >= 1). */
(function (ST) {
  const LET = "ABCDE";
  const C = (n, r) => { if (r < 0 || r > n) return 0; let x = 1; for (let i = 1; i <= r; i++) x = x * (n - r + i) / i; return Math.round(x); };

  ST.widget("subsets", {
    title: "部分集合:大きさ別に数えると 2ⁿ、偶数個と奇数個を比べると同数",
    group: "comb", name: "部分集合の数え上げ", desc: "C(n,r) の合計が 2ⁿ、交代和が 0 になる理由", order: 3,
    tag: "性質②・⑤",
    formula: "②  C(n,0)＋C(n,1)＋…＋C(n,n) ＝ 2ⁿ　⑤  C(n,0)−C(n,1)＋C(n,2)−… ＝ 0 (n≧1)",
    says: "②二項係数を全部足すと 2ⁿ。⑤符号を交互にして足すと 0。",
    meaning: "n 個の集合の部分集合を数えています。各要素を「入れる/入れない」で決めるので全部で 2ⁿ 個(大きさ r のものが C(n,r) 個)。偶数個の部分集合と奇数個の部分集合は同じ数なので、交代和は 0 です。",
    mount(el) {
      let n = 4, view = "size", mine = new Set();
      const subsets = items => items.reduce((acc, x) => acc.concat(acc.map(s => [...s, x])), [[]]);
      const draw = () => {
        const items = LET.slice(0, n).split(""), all = subsets(items);
        const by = Array.from({ length: n + 1 }, () => []); all.forEach(s => by[s.length].push(s));
        const cur = items.filter(x => mine.has(x));
        const chip = (s, hot) => `<span class="ch-chip ${hot ? "hot" : ""}">${s.length ? s.join("") : "∅"}</span>`;
        const picks = `<div class="btns" role="group" aria-label="要素を選ぶ">${items.map(x => `<button type="button" class="btn ${mine.has(x) ? "primary" : ""}" data-el="${x}" aria-pressed="${mine.has(x)}" style="min-width:48px">${mine.has(x) ? "✓ " : ""}${x}</button>`).join("")}</div>`;
        let body, big;
        if (view === "size") {
          body = by.map((g, k) => `<div style="margin:6px 0;padding:4px 6px;border-radius:8px;${k === cur.length ? "background:var(--packet-soft)" : ""}"><span class="cap"><b>${k}個</b>: C(${n},${k}) ＝ ${g.length} 通り</span><br>${g.map(s => chip(s, s.join("") === cur.join(""))).join("")}</div>`).join("");
          big = `<b>${all.length}</b><span>通り　<span class="cap" style="font-size:15px">${by.map(g => g.length).join(" + ")} ＝ 2<sup>${n}</sup></span></span>`;
        } else {
          const ev = all.filter(s => s.length % 2 === 0), od = all.filter(s => s.length % 2 === 1);
          body = `<div style="margin:6px 0"><span class="cap"><b>偶数個</b>(0個, 2個, 4個…) ${ev.length} 通り</span><br>${ev.map(s => chip(s, s.join("") === cur.join(""))).join("")}</div>
                  <div style="margin:6px 0"><span class="cap"><b>奇数個</b>(1個, 3個, 5個…) ${od.length} 通り</span><br>${od.map(s => chip(s, s.join("") === cur.join(""))).join("")}</div>`;
          big = `<b>${ev.length} − ${od.length} ＝ ${ev.length - od.length}</b><span>　<span class="cap" style="font-size:15px">${by.map((g, k) => (k % 2 ? "−" : "＋") + g.length).join(" ").replace(/^＋/, "")} ＝ 0</span></span>`;
        }
        el.innerHTML = `<div><p class="lab-label">要素の数 n</p>${ST.segHtml("n", [[2, "2"], [3, "3"], [4, "4"], [5, "5"]], n)}</div>
          <div><p class="lab-label">見方</p>${ST.segHtml("view", [["size", "大きさ別に数える"], ["parity", "偶数個と奇数個"]], view)}</div>
          <div><p class="lab-label">自分で選んでみる(選んだ組が色づきます)</p>${picks}<p class="cap" style="margin:6px 0 0">いまの選び方: <b>{${cur.join(",")}}</b>(${cur.length}個)</p></div>
          <div class="lab-big" aria-live="polite">${big}</div>
          <div class="hexbox" style="max-height:320px;overflow:auto">${body}</div>
          <p class="cap">${view === "size" ? "各要素を「入れる/入れない」で決めると 2ⁿ 通り。大きさ k の組の数が C(n,k) なので、その合計が 2ⁿ です。" : "どれか1つの要素(たとえば A)の入れる/入れないを切り替えると、偶数個の組と奇数個の組が1対1に対応します。だから同数で、C(n,0) − C(n,1) + C(n,2) − … ＝ 0 です(n が1以上のとき)。"}</p>`;
        ST.wireSeg(el, "n", v => { n = +v; mine = new Set([...mine].filter(x => LET.indexOf(x) < n)); draw(); });
        ST.wireSeg(el, "view", v => { view = v; draw(); ST.markLab("subsets"); });
        el.querySelectorAll("[data-el]").forEach(b => b.onclick = () => { const x = b.dataset.el; mine.has(x) ? mine.delete(x) : mine.add(x); draw(); });
      };
      draw();
    }
  });
})(window.ST);
