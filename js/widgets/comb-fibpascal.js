"use strict";
/* Lab for フィボナッチ数とパスカルの三角形 (第5回 問5): sum along a slanted line of Pascal's triangle = Fibonacci number. */
(function (ST) {
  ST.widget("fibpascal", {
    title: "フィボナッチ数:パスカルの三角形の斜めの和",
    group: "comb", name: "フィボナッチとパスカル", desc: "三角形を左にそろえて、斜めに足すとフィボナッチ数", order: 19, tag: "定理",
    formula: "$F(n+1) = \\Sigma C(n-r, r)$　($r = 0$ 〜 ⌊$\\frac{n}{2}$⌋)",
    says: "パスカルの三角形を左にそろえて並べ、斜めに並んだ数を足すと、フィボナッチ数が出てきます。",
    meaning: "n 段の階段を1段・2段でのぼるとき、2段のぼりを r 回使うと、のぼりの回数は $n-r$ 回です。その中で2段にする r 回を選ぶので $C(n-r, r)$ 通り。これを r ごとに足したものが、のぼり方の数 $F(n+1)$ です。",
    mount(el) {
      let n = 6;
      const draw = () => {
        const R = Math.floor(n / 2), terms = Array.from({ length: R + 1 }, (_, r) => ({ r, m: n - r, c: ST.C(n - r, r) }));
        const total = terms.reduce((a, t) => a + t.c, 0);
        const hot = (m, r) => m + r === n;
        let rows = "";
        for (let m = 0; m <= n; m++) {
          rows += "<tr>" + Array.from({ length: n + 1 }, (_, r) => r > m ? `<td></td>` : `<td style="padding:3px 6px;text-align:center;font-family:var(--f-mono);${hot(m, r) ? "background:var(--packet-soft);color:var(--packet);border-radius:6px;font-weight:700;outline:1px solid var(--packet)" : "color:var(--muted)"}">${ST.C(m, r)}</td>`).join("") + "</tr>";
        }
        el.innerHTML = `<div><p class="lab-label">階段の段数 n</p><div style="display:flex;gap:8px;align-items:center"><button type="button" class="btn" data-dec aria-label="1へらす">−</button><b style="font-size:22px;min-width:3.2em;text-align:center">${n} 段</b><button type="button" class="btn" data-inc aria-label="1ふやす">＋</button></div></div>
          <div class="stage" style="padding:8px 4px"><div style="overflow-x:auto"><table style="border-collapse:separate;border-spacing:2px;margin:0 auto;font-size:14px" aria-label="左にそろえたパスカルの三角形">${rows}</table></div>
            <div class="cap" style="text-align:center">行 = 0 〜 ${n}、強調は「行 + 列 = ${n}」の斜め</div></div>
          <div class="lab-big" aria-live="polite"><b>${total}</b><span>通り　<span class="cap" style="font-size:15px">F(${n + 1}) ＝ ${n}段ののぼり方</span></span></div>
          <div class="hexbox">${terms.map(t => `r=${t.r}(2段を${t.r}回): C(${t.m},${t.r}) ＝ ${t.c}`).join("<br>")}</div>
          <p class="cap">${terms.map(t => t.c).join(" ＋ ")} ＝ <b>${total}</b>。パスカルの三角形の斜めの和が、フィボナッチ数列 1, 1, 2, 3, 5, 8, 13, 21, … になります。</p>`;
        el.querySelector("[data-dec]").onclick = () => { if (n > 1) { n--; draw(); ST.markLab("fibpascal"); } };
        el.querySelector("[data-inc]").onclick = () => { if (n < 15) { n++; draw(); ST.markLab("fibpascal"); } };
      };
      draw();
    }
  });
})(window.ST);
