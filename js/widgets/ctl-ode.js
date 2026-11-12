"use strict";
/* Lab for ラプラス変換で微分方程式を解く (第4回 例3・例4): differential equation → Laplace transform → solve for Y(s) (algebra) → partial fractions → inverse transform.
   The last step checks the formula against a direct numerical solution (RK4) of the original equation. */
(function (ST) {
  const ctl = ST.ctl, n = ctl.n, E = Math.exp;
  const sgn = (v, d) => (v < 0 ? "− " : "＋ ") + n(Math.abs(v), d == null ? 2 : d);
  const MODES = {
    ex3: { name: "例3 1階", T: 6 }, ex4: { name: "例4 2階", T: 6 }
  };
  const build = (key, a, b, c) => {
    if (key === "ex3") {
      const K1 = b / a, K2 = c - b / a;
      return {
        steps: [
          { t: "微分方程式", l: [`y′(t) ＋ ${n(a)}·y(t) ＝ ${n(b)}　 y(0) ＝ ${n(c)}`, "一般形: y′ ＋ a y ＝ b、y(0) ＝ c"], note: "まず、解きたい式と初期値を書きます。" },
          { t: "両辺をラプラス変換", l: [`s Y(s) − y(0) ＋ ${n(a)} Y(s) ＝ ${n(b)}/s`, "(微分は s Y − y(0)、定数 b は b/s)"], note: "時間微分 y′ が、s をかけて初期値を引く形になり、微分方程式が代数の式に変わります。" },
          { t: "Y(s) について解く(代数)", l: [`(s ＋ ${n(a)}) Y(s) ＝ ${n(b)}/s ＋ ${n(c)}`, `Y(s) ＝ (${n(b)} ＋ ${n(c)}s)/(s(s ＋ ${n(a)}))`], note: "Y(s) の式を、ふつうの代数で整理します。" },
          { t: "部分分数に分ける", l: [`K₁ ＝ [sY]ₛ₌₀ ＝ b/a ＝ ${n(K1, 3)}`, `K₂ ＝ [(s＋a)Y]ₛ₌₋ₐ ＝ c − b/a ＝ ${n(K2, 3)}`, `Y(s) ＝ ${n(K1, 3)}/s ${sgn(K2, 3)}/(s ＋ ${n(a)})`], note: "極は s＝0 と s＝−a の2つ。それぞれの係数を求めます。" },
          { t: "逆ラプラス変換", l: [`y(t) ＝ b/a ＋ (c − b/a) e^(−at)`, `　　 ＝ ${n(K1, 3)} ${sgn(K2, 3)}·e^(−${n(a)}t)`], note: "1/s は定数 1、1/(s＋a) は e^(−at)。これが答えです。" }
        ],
        f: t => b / a + (c - b / a) * E(-a * t), ode: (s) => [-a * s[0] + b], x0: [c], eqs: "y′ ＋ a y ＝ b"
      };
    }
    return {
      steps: [
        { t: "微分方程式", l: ["y″ ＋ 4y′ ＋ 4y ＝ sin 2t", "y(0) ＝ y′(0) ＝ 1"], note: "強制項が sin 2t の、2階の式です。" },
        { t: "両辺をラプラス変換", l: ["s²Y − s·y(0) − y′(0) ＋ 4{sY − y(0)} ＋ 4Y ＝ 2/(s² ＋ 2²)"], note: "2階微分は s²Y − s y(0) − y′(0)、1階微分は sY − y(0)。sin 2t は 2/(s²＋2²)。" },
        { t: "整理して Y(s) を求める", l: ["(s² ＋ 4s ＋ 4) Y − s − 5 ＝ 2/(s² ＋ 4)", "(s＋2)² Y ＝ 2/(s²＋4) ＋ s ＋ 5", "Y ＝ 2/((s＋2)²(s²＋4)) ＋ (s＋5)/(s＋2)² ＝ Y₁ ＋ Y₂"], note: "初期値の効果が (s＋5) の項、入力 sin 2t の効果が 2/(…) の項として現れます。" },
        { t: "Y₁ を部分分数に", l: ["Y₁ ＝ M₁/(s＋2)² ＋ M₂/(s＋2) ＋ K₁/(s−2j) ＋ K₂/(s＋2j)", "M₁ ＝ 1/4、M₂ ＝ 1/8、K₁ ＝ K₂ ＝ −1/16", "y₁ ＝ (1/4)t e^(−2t) ＋ (1/8)e^(−2t) − (1/8)cos 2t"], note: "重根 −2 と虚根 ±2j が混ざった例です。虚根の2つは cos になります。" },
        { t: "Y₂ を部分分数に", l: ["Y₂ ＝ M₃/(s＋2)² ＋ M₄/(s＋2)　M₃ ＝ 3、M₄ ＝ 1", "y₂ ＝ 3t e^(−2t) ＋ e^(−2t)"], note: "初期値に由来する部分です。" },
        { t: "足し合わせて答え", l: ["y ＝ y₁ ＋ y₂ ＝ (13/4) t e^(−2t) ＋ (9/8) e^(−2t) − (1/8) cos 2t"], note: "これが答えです。t＝0 を入れると 9/8 − 1/8 ＝ 1 で、初期値 y(0)＝1 を満たしています。" }
      ],
      f: t => 13 / 4 * t * E(-2 * t) + 9 / 8 * E(-2 * t) - Math.cos(2 * t) / 8, ode: (s, t) => [s[1], Math.sin(2 * t) - 4 * s[1] - 4 * s[0]], x0: [1, 1], eqs: "y″ ＋ 4y′ ＋ 4y ＝ sin 2t"
    };
  };
  ST.ctl.odeBuild = build;
  ST.widget("ode", {
    title: "ラプラス変換で微分方程式を解く(1段ずつ)",
    group: "ctl", name: "微分方程式をラプラス変換で解く", desc: "微分方程式 → ラプラス変換 → 代数で解く → 部分分数 → 逆変換を、1段ずつ進める", order: 9, tag: "微分方程式の解法",
    formula: "微分方程式 → L変換 → Y(s) を代数で解く → 部分分数 → 逆変換 → y(t)",
    says: "ラプラス変換は、微分を「s をかける」操作に変えます$(\\mathcal{L}[\\frac{dy}{dt}] = sY - y(0))$。すると微分方程式が、Y(s) についての代数の式になって、ふつうに解けます。最後に逆変換で時間の関数にもどします。",
    meaning: "初期値は、変換した式の中に自動的に入ります。解いたあとは、本当にその y(t) が元の式を満たすか、数値計算の結果と重ねて確かめられます。",
    mount(el) {
      let key = "ex3", a = 2, b = 6, c = 1, k = 1;
      el.innerHTML = `<div><p class="lab-label">例題</p>${ST.segHtml("ex", Object.entries(MODES).map(([q, m]) => [q, m.name]), key)}</div>
        <div data-sl></div>
        <div class="btns"><button type="button" class="btn" data-prev>‹ 戻る</button><button type="button" class="btn primary big" data-next>次へ ›</button><button type="button" class="btn" data-rst>↺</button></div>
        <div data-body class="card" style="padding:12px;display:grid;gap:8px" aria-live="polite"></div>
        <div class="stage" data-pt style="padding:6px"></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), body = $("[data-body]"), pt = $("[data-pt]"), cap = $("[data-cap]");
      const controls = () => {
        $("[data-sl]").innerHTML = key === "ex3" ? ctl.sliders([{ id: "a", label: "a(0 は使えない)", min: -1.5, max: 4, step: .5, v: a }, { id: "b", label: "b", min: -6, max: 6, step: 1, v: b }, { id: "c", label: "初期値 y(0) ＝ c", min: -4, max: 4, step: 1, v: c }]) : "";
        ctl.wireSliders($("[data-sl]"), (id, v) => { if (id === "a") a = v; else if (id === "b") b = v; else c = v; k = Math.min(k, 5); draw(); ST.markLab("ode"); });
      };
      const draw = () => {
        if (key === "ex3" && a === 0) { body.innerHTML = ST.am("<p>a ＝ 0 のときは、この解き方の対象外です(y′ ＝ b の積分になります)。a を 0 以外にしてください。</p>"); pt.innerHTML = ""; cap.innerHTML = ""; return; }
        const B = build(key, a, b, c), N = B.steps.length, T = MODES[key].T;
        k = Math.max(1, Math.min(N, k));
        body.innerHTML = ST.am(B.steps.slice(0, k).map((s, i) => `<div style="${i === k - 1 ? "" : "opacity:.6"}"><div class="eyebrow"><span class="chip${i === k - 1 ? " ok" : ""}">${i + 1} / ${N}</span> ${s.t}</div><div class="hexbox" style="font-size:13px;margin-top:4px">${s.l.join("<br>")}</div>${i === k - 1 ? `<p class="cap" style="margin:6px 0 0">${s.note}</p>` : ""}</div>`).join(""));
        $("[data-prev]").disabled = k <= 1; $("[data-next]").disabled = k >= N;
        if (k >= N) {
          const r = ctl.rk4(B.ode, B.x0, .005, T / .005), num = ctl.col(r, 0), an = num.map((_, i) => B.f(i * .005));
          const err = Math.max(...num.map((v, i) => Math.abs(v - an[i])));
          pt.innerHTML = ctl.plot({ H: 140, x0: 0, x1: T, ymin: key === "ex3" ? undefined : undefined, series: [{ dt: .005, y: num, color: "var(--muted)", w: 5, label: "数値計算(元の式)" }, { dt: .005, y: an, color: "var(--packet)", label: "求めた y(t)" }], xlabel: "時間 t", aria: "求めた解と数値計算" });
          cap.innerHTML = `確かめ: 元の微分方程式を数値で解いた線(灰)と、求めた y(t)(橙)の最大の差は ${err.toExponential(1)}。重なっています。`;
        } else { pt.innerHTML = ""; cap.innerHTML = "最後の段まで進むと、答えと数値計算を重ねたグラフが出ます。"; }
      };
      ST.wireSeg(el, "ex", v => { key = v; k = 1; controls(); draw(); ST.markLab("ode"); });
      $("[data-next]").onclick = () => { k++; draw(); ST.markLab("ode"); };
      $("[data-prev]").onclick = () => { k--; draw(); };
      $("[data-rst]").onclick = () => { k = 1; draw(); };
      controls(); draw();
    }
  });
})(window.ST);
