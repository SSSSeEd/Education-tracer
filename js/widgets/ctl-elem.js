"use strict";
/* Lab for 基本要素の伝達関数 (第6回 3-1): proportional, derivative, integral, dead-time, first-order lag, second-order lag.
   Feed the element a step (or a sine) and see the output. G(s) = Y(s)/U(s) is shown with the current numbers. */
(function (ST) {
  const ctl = ST.ctl, T = 12, DT = .01, T0 = 1, RISE = .15, n = ctl.n;
  const sm = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u), dsm = u => u <= 0 || u >= 1 ? 0 : 6 * u * (1 - u);
  const EL = {
    p: { name: "比例", par: [["K", "比例定数 K_P", .5, 3, .5, 2]], G: v => `G(s) ＝ K_P ＝ ${n(v.K)}`, eq: "y(t) ＝ K_P x(t)", say: "入力を定数倍するだけ。形はそのままで、大きさだけ変わります。" },
    d: { name: "微分", par: [["mu", "微分定数 K_D(＝粘性抵抗 μ)", .2, 2, .2, 1]], G: v => `G(s) ＝ μ s ＝ ${n(v.mu)} s`, eq: "y(t) ＝ μ dx/dt", say: "入力の変化の速さを出力します。入力が変わっている間だけ出力が出て、変わらなければ 0。ステップの立ち上がりで山ができます。" },
    i: { name: "積分", par: [["KI", "積分定数 K_I(＝1/A)", .2, 2, .2, .5]], G: v => `G(s) ＝ K_I / s ＝ ${n(v.KI)} / s`, eq: "y(t) ＝ (1/A) ∫ x dτ", say: "入力をためこんでいきます。ステップ入力なら、出力は一定の傾きで増え続けます(ランプ)。" },
    l: { name: "むだ時間", par: [["L", "むだ時間 L", .5, 4, .5, 2]], G: v => `G(s) ＝ e^(−Ls) ＝ e^(−${n(v.L)}s)`, eq: "y(t) ＝ x(t − L)", say: "入力と同じ形が、L 秒おくれて出てきます。形は変わりません。" },
    f: { name: "1次遅れ", par: [["Tc", "時定数 T", .3, 4, .1, 1.5]], G: v => `G(s) ＝ 1 / (T s ＋ 1) ＝ 1 / (${n(v.Tc)} s ＋ 1)`, eq: "T dy/dt ＋ y ＝ x", say: "ゆっくり追いかけます。ステップ入力に対して、T 秒で最終値の約 63%、4T 秒でほぼ 98% に届きます。" },
    s: { name: "2次遅れ", par: [["z", "減衰係数 ζ", 0, 2, .1, .4], ["wn", "固有角周波数 ωₙ", .5, 4, .5, 2]], G: v => `G(s) ＝ ωₙ² / (s² ＋ 2ζωₙ s ＋ ωₙ²) ＝ ${n(v.wn * v.wn)} / (s² ＋ ${n(2 * v.z * v.wn)} s ＋ ${n(v.wn * v.wn)})`, eq: "y″ ＋ 2ζωₙ y′ ＋ ωₙ² y ＝ ωₙ² x", say: "質量・ばね・ダンパの形です。ζ が小さいと行き過ぎて揺れ、ζ が 1 以上なら揺れずに追いつきます。" }
  };
  ST.widget("elem", {
    title: "基本要素の伝達関数:入力を入れて、出力を見る",
    group: "ctl", name: "基本要素の応答", desc: "比例・微分・積分・むだ時間・1次遅れ・2次遅れに、ステップや正弦波を入れて出力を見る", order: 10, tag: "伝達関数",
    formula: "G(s) ＝ Y(s) / U(s)　(入力と出力のラプラス変換の比)",
    says: "システムを、入力 U(s) から出力 Y(s) への「掛け算 G(s)」として表したものが伝達関数です(初期値は 0)。どんな複雑なシステムも、比例・微分・積分・むだ時間・1次遅れ・2次遅れの組み合わせで表せます。",
    meaning: "G(s) の形を見れば、そのシステムが入力に対してどう振る舞うかが分かります。1次遅れは T、2次遅れは ζ と ωₙ が、応答の速さと揺れを決めます。下で6つを切り替えて、同じ入力への出力の違いを見比べます。",
    mount(el, opts) {
      let key = EL[opts && opts.el] ? opts.el : "f", inp = "step", v = { K: 2, mu: 1, KI: .5, L: 2, Tc: 1.5, z: .4, wn: 2 };
      el.innerHTML = `<div><p class="lab-label">要素</p>${ST.segHtml("el", Object.entries(EL).map(([k, e]) => [k, e.name]), key)}</div>
        <div><p class="lab-label">入力 x(t)</p>${ST.segHtml("inp", [["step", "ステップ"], ["sin", "正弦波"]], inp)}</div>
        <div data-sl></div><div class="hexbox" data-g style="font-size:13px"></div>
        <div class="stage" data-pt style="padding:6px"></div><div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), pt = $("[data-pt]"), big = $("[data-big]"), cap = $("[data-cap]");
      const u = t => inp === "step" ? sm((t - T0) / RISE) : Math.sin(2 * t), du = t => inp === "step" ? dsm((t - T0) / RISE) / RISE : 2 * Math.cos(2 * t);
      const out = () => {
        const N = Math.round(T / DT), ts = Array.from({ length: N + 1 }, (_, i) => i * DT);
        let ys;
        if (key === "p") ys = ts.map(t => v.K * u(t));
        else if (key === "d") ys = ts.map(t => v.mu * du(t));
        else if (key === "l") ys = ts.map(t => t - v.L < 0 && inp === "sin" ? 0 : u(t - v.L));
        else if (key === "i") ys = ctl.col(ctl.rk4((s, t) => [v.KI * u(t)], [0], DT, N), 0);
        else if (key === "f") ys = ctl.col(ctl.rk4((s, t) => [(u(t) - s[0]) / v.Tc], [0], DT, N), 0);
        else ys = ctl.col(ctl.rk4((s, t) => [s[1], v.wn * v.wn * u(t) - 2 * v.z * v.wn * s[1] - v.wn * v.wn * s[0]], [0, 0], DT, N), 0);
        return { ts, ys };
      };
      const draw = () => {
        const e = EL[key], { ts, ys } = out(), us = ts.map(u);
        $("[data-g]").innerHTML = `${e.G(v)}<br>${e.eq}`;
        const hl = [], vl = [];
        if (key === "f" && inp === "step") { hl.push({ y: .632, label: "63.2%", color: "var(--muted)" }); vl.push({ x: T0 + v.Tc, label: "t＝T後", color: "var(--packet)" }); }
        if (key === "s" && inp === "step") hl.push({ y: 1, label: "最終値 1", color: "var(--ok)" });
        pt.innerHTML = ctl.plot({ H: 150, x0: 0, x1: T, series: [{ x: ts, y: us, color: "var(--info)", dash: "5 3", w: 1.6, label: "入力 x(t)" }, { x: ts, y: ys, color: "var(--packet)", label: "出力 y(t)" }], hlines: hl, vlines: vl, xlabel: "時間 t", aria: "入力と出力" });
        let b = "", c = e.say;
        if (key === "s") {
          const z = v.z, wn = v.wn, mp = z < 1 ? 100 * Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)) : 0;
          b = `<b>${z === 0 ? "ずっと振動" : z < 1 ? "揺れながら収まる" : z === 1 ? "臨界減衰" : "揺れずに追いつく"}</b><span>ζ ＝ ${n(z, 2)}、ωₙ ＝ ${n(wn, 2)}${z < 1 && z > 0 ? `、行き過ぎ量 約 ${n(mp, 0)}%` : ""}</span>`;
          c += ` 極は s ＝ ${z < 1 ? `${n(-z * wn, 2)} ± j${n(wn * Math.sqrt(1 - z * z), 2)}` : `${n(-z * wn + wn * Math.sqrt(z * z - 1), 2)}, ${n(-z * wn - wn * Math.sqrt(z * z - 1), 2)}`}。`;
        } else if (key === "f") b = `<b>T ＝ ${n(v.Tc, 1)} 秒</b><span>${n(v.Tc, 1)} 秒で 63%、${n(4 * v.Tc, 1)} 秒で 98%</span>`;
        else b = `<b>${e.name}要素</b><span>${key === "p" ? "出力 ＝ " + n(v.K) + " × 入力" : key === "l" ? "出力は " + n(v.L) + " 秒おくれ" : ""}</span>`;
        big.innerHTML = b; cap.innerHTML = c;
      };
      const controls = () => {
        $("[data-sl]").innerHTML = ctl.sliders(EL[key].par.map(([id, label, min, max, step]) => ({ id, label, min, max, step, v: v[id] })));
        ctl.wireSliders($("[data-sl]"), (id, x) => { v[id] = x; draw(); ST.markLab("elem"); });
      };
      ST.wireSeg(el, "el", k => { key = k; controls(); draw(); ST.markLab("elem"); });
      ST.wireSeg(el, "inp", k => { inp = k; draw(); });
      controls(); draw();
    }
  });
})(window.ST);
