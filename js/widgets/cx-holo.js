"use strict";
/* Where is a function holomorphic? The plane is shaded where f is complex-differentiable; poles show as holes, a branch cut as a thick line.
   The holomorphic set is open: around a good point a small disc still lies inside it (its radius = distance to the nearest bad point). */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 3.4), PI2 = Math.PI / 2;
  const FN = {
    poly: { name: "z²＋1", where: "ℂ 全体", bad: [], note: "多項式はどこでも微分できます。正則な範囲は平面全体(領域)です。", dist: () => Infinity },
    exp: { name: "eᶻ", where: "ℂ 全体", bad: [], note: "eᶻ もどこでも微分できます(整関数といいます)。", dist: () => Infinity },
    inv: { name: "1/z", where: "ℂ ∖ {0}", bad: [[0, 0]], note: "z ＝ 0 だけが穴です。穴のまわりの平面は開集合でひとつながりなので、ℂ ∖ {0} は領域です。", dist: p => Math.hypot(p[0], p[1]) },
    rat: { name: "1/(z²＋1)", where: "ℂ ∖ {i, −i}", bad: [[0, 1], [0, -1]], note: "分母が 0 になる z ＝ ±i が穴です。それ以外では正則です。", dist: p => Math.min(Math.hypot(p[0], p[1] - 1), Math.hypot(p[0], p[1] + 1)) },
    tan: { name: "tan z", where: "ℂ ∖ {π/2 ＋ kπ}", bad: [[PI2, 0], [-PI2, 0], [3 * PI2, 0], [-3 * PI2, 0]], note: "cos z ＝ 0 となる実軸上の点 π/2＋kπ が穴です(図には ±π/2、±3π/2 を描いています)。", dist: p => Math.min(...[PI2, -PI2, 3 * PI2, -3 * PI2].map(x => Math.hypot(p[0] - x, p[1]))) },
    log: { name: "Log z", where: "ℂ ∖ (−∞, 0]", cut: true, note: "主値の対数 Log z は、0 と負の実軸(切れ目)を除いたところで正則です。切れ目をまたぐと値が 2πi 飛びます(次のラボで見ます)。", dist: p => p[0] < 0 ? Math.abs(p[1]) : Math.hypot(p[0], p[1]) },
    sqrt: { name: "√z(主値)", where: "ℂ ∖ (−∞, 0]", cut: true, note: "主値の平方根も、0 と負の実軸を除いたところで正則です。", dist: p => p[0] < 0 ? Math.abs(p[1]) : Math.hypot(p[0], p[1]) },
    conj: { name: "z̄", where: "どこも正則でない", none: true, note: "z̄ は、どの点のまわりでも CR方程式が成り立たないので、正則な範囲は空です。", dist: () => 0 },
    abs2: { name: "|z|²", where: "どこも正則でない", none: true, note: "|z|² は原点でだけ微分できますが、開集合の上では成り立たないので、正則な範囲は空です。", dist: () => 0 }
  };

  ST.widget("cholo", {
    title: "正則な範囲:関数ごとに、どこで微分できるか(穴と切れ目)",
    group: "cx", name: "正則な範囲", desc: "多項式・1/z・tan・Log・z̄ … どこが正則か。穴や切れ目の位置を見る", order: 6.7,
    tag: "正則な範囲",
    formula: "正則な範囲 ＝ 微分できる点の集まり(開集合)",
    says: "f が正則な点の集まりが、f の「正則な範囲」です。分母が 0 になる点(極)や、Log・√ の切れ目、$\\bar{z}$ のような関数では、そこを除いた範囲になります。",
    meaning: "正則な範囲は開集合です。正則な点 p のまわりには、同じく全部正則な小さな円板がとれます。その円板の最大の半径は、p から一番近い「穴・切れ目」までの距離です。",
    mount(el) {
      let key = "inv", p = [1, 1];
      el.innerHTML = `<div><p class="lab-label">関数 f(z)</p>${ST.segHtml("fn", Object.entries(FN).map(([k, v]) => [k, v.name]), key)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="正則な範囲"></svg></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]");
      const render = () => {
        const f = FN[key], d = f.dist(p), onBad = d < 1e-9;
        let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="${f.none ? "var(--attack-soft)" : "var(--ok-soft)"}" opacity=".7"/>` + cx.grid(g);
        if (f.cut) s += `<line x1="0" y1="${g.Y(0)}" x2="${g.X(0)}" y2="${g.Y(0)}" stroke="var(--attack)" stroke-width="5"/><circle cx="${g.X(0)}" cy="${g.Y(0)}" r="6" fill="var(--surface)" stroke="var(--attack)" stroke-width="3"/>`;
        (f.bad || []).forEach(b => { if (Math.abs(b[0]) < 3.3) s += `<circle cx="${g.X(b[0])}" cy="${g.Y(b[1])}" r="7" fill="var(--surface)" stroke="var(--attack)" stroke-width="3"/>`; });
        if (!f.none && !onBad && isFinite(d)) s += `<circle cx="${g.X(p[0])}" cy="${g.Y(p[1])}" r="${(Math.min(d, 6) * g.s).toFixed(1)}" fill="var(--info)" fill-opacity=".16" stroke="var(--info)" stroke-width="1.8" stroke-dasharray="5 3"/>`;
        s += cx.handle(g, p, "var(--packet)") + cx.dot(g, p, onBad ? "var(--attack)" : f.none ? "var(--attack)" : "var(--ok)", "p");
        svg.innerHTML = s;
        big.innerHTML = `<b>${f.none ? "× 正則でない" : onBad ? "× 穴・切れ目の上" : "○ 正則"}</b><span>${f.name}　<span class="cap" style="font-size:15px">正則な範囲: ${f.where}</span></span>`;
        cap.innerHTML = f.note + (f.none || onBad ? "" : isFinite(d) ? `<br>p のまわりの青い円板(半径 ${cx.num(d)})は、全部正則な点です。穴や切れ目に当たる手前までが、円板の最大の大きさです。` : "<br>どの点でも、どれだけ大きな円板でも正則です。") + "　(赤い穴や線は「正則でない点」。p をドラッグして近づけてみてください)";
      };
      cx.drag(svg, g, { snap: () => .5, handles: () => [{ id: "p", z: p }], tap: "p", move: (id, q) => { p = q; render(); ST.markLab("cholo"); } });
      ST.wireSeg(el, "fn", v => { key = v; render(); });
      render();
    }
  });
})(window.ST);
