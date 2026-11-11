"use strict";
/* Pascal's triangle lab: tap a number to see it is the sum of its upper-left and upper-right numbers,
   and read it as C(n,r). Only the numbers are computed here; nothing is sent anywhere. */
(function (ST) {
  const esc = ST.esc, N = 8;
  const tri = []; for (let n = 0; n <= N; n++) { tri[n] = []; for (let r = 0; r <= n; r++) tri[n][r] = r === 0 || r === n ? 1 : tri[n - 1][r - 1] + tri[n - 1][r]; }

  ST.widget("pascal", {
    title: "パスカルの三角形：数をタップして、左上と右上の和を確かめる",
    group: "comb", name: "パスカルの三角形", desc: "各数は左上と右上の和。二項係数として読む", order: 1,
    mount(el) {
      let sel = { n: 4, r: 2 };
      const draw = () => {
        const { n, r } = sel, v = tri[n][r];
        const rows = tri.map((row, i) => `<div class="pt-row" style="display:flex;justify-content:center;gap:6px;margin:4px 0">${row.map((x, j) => {
          const up = n > 0 && i === n - 1 && (j === r - 1 || j === r);
          const me = i === n && j === r;
          const st = me ? "background:var(--packet);color:#fff;border-color:var(--packet)" : up ? "background:var(--info-soft);border-color:var(--link)" : "";
          return `<button type="button" data-n="${i}" data-r="${j}" aria-label="${i}行目の${j}番目 ${x}" style="min-width:34px;height:34px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);font:600 13px var(--f-mono);${st}">${x}</button>`;
        }).join("")}</div>`).join("");
        const parents = n > 0 && r > 0 && r < n ? `${tri[n - 1][r - 1]} + ${tri[n - 1][r]} = ${v}` : `端の数は、いつも 1`;
        const sum = tri[n].reduce((a, b) => a + b, 0);
        el.innerHTML = `<div class="stage" style="overflow-x:auto;padding:6px 0">${rows}</div>
          <div class="hexbox" aria-live="polite" data-out>
            <div><b>${n}行目の${r}番目</b> ＝ C(${n},${r}) ＝ <b>${v}</b></div>
            <div>${esc(parents)}</div>
            <div>${n}行目の合計 ＝ ${tri[n].join(" + ")} ＝ <b>${sum}</b> ＝ 2<sup>${n}</sup></div>
          </div>
          <p class="cap">一番上が0行目です。オレンジが選んだ数、青が元になった左上・右上の数。</p>`;
        el.querySelectorAll("[data-n]").forEach(b => b.onclick = () => { sel = { n: +b.dataset.n, r: +b.dataset.r }; draw(); ST.markLab("pascal"); });
      };
      draw();
    }
  });
})(window.ST);
