"use strict";
/* Split-and-count lab: l red and m blue items; choose n of them. Splitting by "r from red" gives
   C(l+m,n) = sum_r C(l,r) C(m,n-r)  (Vandermonde). l=1 gives Pascal's rule; l=m=n gives the sum of squares. */
(function (ST) {
  const C = (n, r) => { if (r < 0 || r > n) return 0; let x = 1; for (let i = 1; i <= r; i++) x = x * (n - r + i) / i; return Math.round(x); };

  ST.widget("split", {
    title: "赤と青に分けて数える:C(l+m,n) = Σ C(l,r)·C(m,n−r)",
    group: "comb", name: "赤と青に分けて数える", desc: "漸化式・平方和・ヴァンデルモンドが同じ考え方でできる", order: 4,
    mount(el) {
      let l = 2, m = 5, n = 4, pick = 1;
      const draw = () => {
        n = Math.min(n, l + m);
        const rs = Array.from({ length: n + 1 }, (_, r) => r), terms = rs.map(r => C(l, r) * C(m, n - r));
        const sum = terms.reduce((a, b) => a + b, 0), whole = C(l + m, n);
        if (pick > n) pick = n;
        const dots = (cnt, col, on) => Array.from({ length: cnt }, (_, i) => `<span aria-hidden="true" style="display:inline-block;width:22px;height:22px;margin:2px;border-radius:50%;background:${col};opacity:${i < on ? 1 : .28};border:2px solid ${col}"></span>`).join("");
        const rows = rs.map(r => `<button type="button" data-pick="${r}" aria-pressed="${r === pick}" style="all:unset;cursor:pointer;display:flex;gap:8px;padding:6px 8px;margin:3px 0;border-radius:8px;width:calc(100% - 16px);${r === pick ? "background:var(--packet-soft);outline:2px solid var(--packet)" : ""};${terms[r] === 0 ? "opacity:.45" : ""}">
            <span style="min-width:5.5em">赤${r}個・青${n - r}個</span><span>C(${l},${r}) × C(${m},${n - r}) ＝ <b>${terms[r]}</b></span></button>`).join("");
        el.innerHTML = `<div><p class="lab-label">赤の個数 l</p>${ST.segHtml("l", [1, 2, 3, 4, 5, 6].map(x => [x, String(x)]), l)}</div>
          <div><p class="lab-label">青の個数 m</p>${ST.segHtml("m", [1, 2, 3, 4, 5, 6].map(x => [x, String(x)]), m)}</div>
          <div><p class="lab-label">選ぶ個数 n</p>${ST.segHtml("n", Array.from({ length: Math.min(l + m, 6) }, (_, i) => [i + 1, String(i + 1)]), n)}</div>
          <div class="btns"><button type="button" class="btn" data-pre="pascal">性質①(青が1個)</button><button type="button" class="btn" data-pre="sq">性質③(l = m = n)</button><button type="button" class="btn" data-pre="ex">授業の例(2,5,4)</button></div>
          <div class="stage" style="padding:10px"><div>赤 ${dots(l, "#c0392b", pick)}</div><div>青 ${dots(m, "#2c6fbb", n - pick)}</div><p class="cap" style="margin:6px 0 0">選んだ行(赤${pick}個・青${n - pick}個)の濃い丸が、選ばれたものです。</p></div>
          <div class="hexbox" role="group" aria-label="赤から何個選ぶかで分ける">${rows}</div>
          <div class="lab-big" aria-live="polite"><b>${sum}</b><span>＝ C(${l + m},${n}) ＝ ${whole}　<span class="cap" style="font-size:15px">${terms.join(" + ")} ＝ ${sum}</span></span></div>
          <p class="cap">全体の ${l + m} 個から ${n} 個選ぶ数は、「赤から何個選んだか」で分けて数えても同じです。値が0の行は、赤や青の個数が足りない場合(C が0)です。</p>`;
        ST.wireSeg(el, "l", v => { l = +v; draw(); ST.markLab("split"); });
        ST.wireSeg(el, "m", v => { m = +v; draw(); });
        ST.wireSeg(el, "n", v => { n = +v; draw(); });
        el.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => { pick = +b.dataset.pick; draw(); });
        el.querySelectorAll("[data-pre]").forEach(b => b.onclick = () => {
          const k = b.dataset.pre; if (k === "pascal") { l = 1; m = 4; n = 3; } else if (k === "sq") { l = 3; m = 3; n = 3; } else { l = 2; m = 5; n = 4; }
          pick = 1; draw(); ST.markLab("split");
        });
      };
      draw();
    }
  });
})(window.ST);
