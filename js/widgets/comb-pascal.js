"use strict";
/* Pascal's triangle lab: tap a number to see it is the sum of its upper-left and upper-right numbers and to read it as C(n,r).
   "Build it row by row" plays an animation. Only the numbers are computed here; nothing is sent anywhere. */
(function (ST) {
  const esc = ST.esc, N = 8;
  const tri = []; for (let n = 0; n <= N; n++) { tri[n] = []; for (let r = 0; r <= n; r++) tri[n][r] = r === 0 || r === n ? 1 : tri[n - 1][r - 1] + tri[n - 1][r]; }

  ST.widget("pascal", {
    title: "パスカルの三角形：数をタップして、左上と右上の和を確かめる",
    group: "comb", name: "パスカルの三角形", desc: "各数は左上と右上の和。二項係数として読む", order: 1,
    mount(el) {
      let sel = { n: 4, r: 2 }, shown = N, alive = true, building = false;
      const draw = (fresh) => {
        const { n, r } = sel, v = tri[n][r];
        const rows = tri.slice(0, shown + 1).map((row, i) => `<div class="pt-row ${i === n ? "on" : ""}" style="display:flex;justify-content:center;gap:6px;margin:5px 0;padding:2px 0">${row.map((x, j) => {
          const up = n > 0 && i === n - 1 && (j === r - 1 || j === r);
          const me = i === n && j === r;
          return `<button type="button" class="pt-cell ${me ? "me" : up ? "up" : ""} ${fresh === i ? "new" : ""}" data-n="${i}" data-r="${j}" aria-pressed="${me}" aria-label="${i}行目の${j}番目 ${x}">${x}</button>`;
        }).join("")}</div>`).join("");
        const inner = n > 0 && r > 0 && r < n;
        const parents = inner ? `<b style="color:var(--link)">${tri[n - 1][r - 1]}</b> ＋ <b style="color:var(--link)">${tri[n - 1][r]}</b> ＝ <b style="color:var(--packet)">${v}</b>` : `端の数は、いつも <b style="color:var(--packet)">1</b>`;
        el.innerHTML = `<div class="lab-big" aria-live="polite"><b>${v}</b><span>＝ C(${n},${r})　<span class="cap" style="font-size:15px">${n}行目の${r}番目(一番上が0行目)</span></span></div>
          <div class="stage" style="overflow-x:auto;padding:8px 4px">${rows}</div>
          <div class="hexbox" aria-live="polite" data-out>
            <div>左上と右上の和： ${parents}</div>
            <div>${n}行目の合計： ${tri[n].join(" ＋ ")} ＝ <b>${tri[n].reduce((a, b) => a + b, 0)}</b> ＝ 2<sup>${n}</sup></div>
          </div>
          <div class="btns"><button type="button" class="btn primary" data-build ${building ? "disabled" : ""}>▶ 1行ずつ作るアニメーション</button></div>
          <p class="cap">オレンジが選んだ数、青の枠が元になった左上・右上の数です。選んだ行は背景が色づきます。</p>`;
        el.querySelectorAll("[data-n]").forEach(b => b.onclick = () => { if (building) return; sel = { n: +b.dataset.n, r: +b.dataset.r }; draw(); ST.markLab("pascal"); });
        el.querySelector("[data-build]").onclick = async () => {
          building = true; shown = 0; sel = { n: 0, r: 0 }; draw(0);
          for (let i = 1; i <= N && alive; i++) { await ST.sleep(700); if (!alive) return; shown = i; sel = { n: i, r: 1 }; draw(i); }
          building = false; if (alive) { sel = { n: 4, r: 2 }; draw(); ST.markLab("pascal"); }
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
