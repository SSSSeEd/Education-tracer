"use strict";
/* Lab for 非線形モデルの線形化 (第3回 2-4, ロボットアームの例): J θ″ + B θ′ + M g l sin θ = τ  versus its linearization  … + M g l θ = τ.
   Both are simulated by RK4 from the same start; the dashed arm is the linear model. Near θ = 0 they agree (sin θ ≈ θ). */
(function (ST) {
  const ctl = ST.ctl, T = 10, DT = .005, J = 1, MGL = 4, RAD = Math.PI / 180;
  ST.widget("lin", {
    title: "線形化:sin θ を θ に置き換えてよいか",
    group: "ctl", name: "線形化(アームの角度)", desc: "アームの運動を、非線形モデルと線形化したモデルで並べて動かす", order: 6, tag: "線形化",
    formula: "sin θ ≈ sin 0 ＋ cos 0·(θ − 0) ＝ θ",
    says: "線形でない関数を、ある点 x₀ のまわりだけ直線で近似する(テイラー展開を1次で切る)と、y ＝ f(x₀) ＋ A(x − x₀)(A ＝ f の微分)になります。アームでは θ ＝ 0 のまわりで sin θ ≈ θ と置き、J θ″ ＋ B θ′ ＋ M g l θ ＝ τ という線形モデルにします。",
    meaning: "角度が小さいうちは、sin θ と θ はほぼ同じ値なので、線形モデルは本物とほぼ重なって動きます。角度を大きくしていくと、sin θ は θ より小さくなる(重力の戻す力が弱くなる)ので、本物のほうがゆっくり揺れ、線形モデルとずれていきます。",
    mount(el) {
      let th0 = 40, B = .2, tau = 0, sim = null, ply = null;
      el.innerHTML = `${ctl.sliders([{ id: "th0", label: "最初の角度 θ(0)", min: 5, max: 150, step: 5, v: th0, unit: "°" }, { id: "tau", label: "加えるトルク τ(一定)", min: 0, max: 3, step: .5, v: tau }, { id: "B", label: "粘性抵抗 B", min: 0, max: 1, step: .1, v: B }])}
        <div data-ply></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 196" style="width:100%;display:block" role="img" aria-label="アームの動き" data-scene></svg></div>
        <div class="stage" data-pa style="padding:6px"></div><div class="stage" data-ps style="padding:6px"></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), scene = $("[data-scene]"), pa = $("[data-pa]"), ps = $("[data-ps]"), cap = $("[data-cap]");
      const run = () => {
        const n = Math.round(T / DT), t0 = th0 * RAD;
        const nl = ctl.rk4((s) => [s[1], (tau - B * s[1] - MGL * Math.sin(s[0])) / J], [t0, 0], DT, n), li = ctl.rk4((s) => [s[1], (tau - B * s[1] - MGL * s[0]) / J], [t0, 0], DT, n);
        sim = { nl: ctl.col(nl, 0).map(x => x / RAD), li: ctl.col(li, 0).map(x => x / RAD) };
        sim.err = Math.max(...sim.nl.map((x, i) => Math.abs(x - sim.li[i])));
      };
      const draw = t => {
        const a = ctl.at(sim.nl, DT, t) * RAD, b = ctl.at(sim.li, DT, t) * RAD, px = 100, py = 96, L = 78;
        const arm = (ang, c, dash, bob) => { const x = px + L * Math.sin(ang), y = py + L * Math.cos(ang); return `<line x1="${px}" y1="${py}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${c}" stroke-width="${dash ? 3 : 5}" stroke-linecap="round"${dash ? ` stroke-dasharray="6 5"` : ""}/>${bob ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${c}" stroke="var(--surface)" stroke-width="2"/>` : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="3 2"/>`}`; };
        let s = `<line x1="${px}" y1="${py}" x2="${px}" y2="${py + L + 10}" stroke="var(--muted)" stroke-dasharray="3 3"/><rect x="${px - 30}" y="${py - 10}" width="60" height="8" fill="var(--sunken)" stroke="var(--muted)"/>`;
        s += arm(b, "var(--info)", true, false) + arm(a, "var(--packet)", false, true) + `<circle cx="${px}" cy="${py}" r="4" fill="var(--ink)"/>`;
        s += `<text x="206" y="44" class="svg-t" style="font-size:12px;font-weight:700" fill="var(--packet)">本物(非線形)</text><text x="206" y="62" class="svg-m" style="font-size:11px" fill="var(--packet)">θ ＝ ${ctl.n(a / RAD, 1)}°</text>`;
        s += `<text x="206" y="88" class="svg-t" style="font-size:12px;font-weight:700" fill="var(--info)">線形化したモデル</text><text x="206" y="106" class="svg-m" style="font-size:11px" fill="var(--info)">θ ＝ ${ctl.n(b / RAD, 1)}°</text><text x="206" y="130" class="svg-m" style="font-size:11px">差 ${ctl.n(Math.abs(a - b) / RAD, 1)}°</text>`;
        scene.innerHTML = s;
        pa.innerHTML = ctl.plot({ H: 128, x0: 0, x1: T, series: [{ dt: DT, y: sim.nl, color: "var(--packet)", label: "本物 θ(t)" }, { dt: DT, y: sim.li, color: "var(--info)", label: "線形化 θ(t)", dash: "5 3" }], t, upto: t, xlabel: "時間 s(角度は°)", aria: "角度の時間変化" });
        const xs = Array.from({ length: 81 }, (_, i) => -2 + i * .05);
        ps.innerHTML = ctl.plot({ H: 116, x0: -2, x1: 2, series: [{ x: xs, y: xs.map(Math.sin), color: "var(--packet)", label: "sin θ" }, { x: xs, y: xs, color: "var(--info)", label: "θ(接線)", dash: "5 3" }], ymin: -2, ymax: 2, vlines: [{ x: Math.max(-2, Math.min(2, a)), label: "いまの角度", color: "var(--packet)" }], xlabel: "θ rad", aria: "sin θ と θ の比較" });
      };
      const note = () => {
        const small = sim.err < 1;
        cap.innerHTML = `線形モデルとの最大の差は ${ctl.n(sim.err, 1)}°。` + (small ? "ほとんど重なっています。角度が小さいので、sin θ ≈ θ の近似で十分です。" : "角度が大きいぶん、sin θ と θ の差が効いて、本物(橙)のほうがゆっくり揺れます。線形化は θ ＝ 0 の近くだけで使える近似です。") + ` 下のグラフは、sin θ と接線 θ の差(θ が小さいほど重なる)です。`;
      };
      const redo = () => { run(); note(); ply.restart(); ST.markLab("lin"); };
      ply = ctl.player($("[data-ply]"), { T, draw: t => sim && draw(t), speed: 1.3 });
      run(); note(); ply.restart();
      ctl.wireSliders(el, (id, x) => { if (id === "th0") th0 = x; else if (id === "tau") tau = x; else B = x; redo(); });
      return () => ply.stop();
    }
  });
})(window.ST);
