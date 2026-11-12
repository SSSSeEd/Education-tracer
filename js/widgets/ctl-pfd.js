"use strict";
/* Lab for 部分分数による逆ラプラス変換 (第4回 例1・例2・虚根): add the partial fractions one at a time and watch the sum become f(t).
   Each example also checks itself: the Laplace integral of the answer, computed numerically, equals F(s) at s = 2. */
(function (ST) {
  const ctl = ST.ctl, T = 8, DT = .02, E = Math.exp;
  const EX = {
    e1: { name: "例1 実根", F: "(3s ＋ 1) / (s² ＋ 4s ＋ 3) ＝ (3s ＋ 1) / ((s＋1)(s＋3))", Fv: s => (3 * s + 1) / (s * s + 4 * s + 3),
      steps: ["K₁ ＝ [(s＋1)F(s)] at s＝−1 ＝ [(3s＋1)/(s＋3)] ＝ −2/2 ＝ −1", "K₂ ＝ [(s＋3)F(s)] at s＝−3 ＝ [(3s＋1)/(s＋1)] ＝ −8/(−2) ＝ 4"],
      parts: [{ F: "−1/(s＋1)", fl: "−e^(−t)", f: t => -E(-t), c: "var(--info)" }, { F: "4/(s＋3)", fl: "4e^(−3t)", f: t => 4 * E(-3 * t), c: "var(--ok)" }], ans: "f(t) ＝ −e^(−t) ＋ 4e^(−3t)" },
    e2: { name: "例2 重根", F: "(s ＋ 2) / (s(s＋1)³) ＝ K/s ＋ M₁/(s＋1)³ ＋ M₂/(s＋1)² ＋ M₃/(s＋1)", Fv: s => (s + 2) / (s * Math.pow(s + 1, 3)),
      steps: ["K ＝ [sF(s)] at s＝0 ＝ [(s＋2)/(s＋1)³] ＝ 2", "M₁ ＝ [(s＋1)³F] at s＝−1 ＝ [(s＋2)/s] ＝ −1", "M₂ ＝ d/ds[(s＋1)³F] ＝ −2/s² ＝ −2", "M₃ ＝ (1/2!)·d²/ds²[(s＋2)/s] ＝ (1/2)·4/s³ ＝ −2"],
      parts: [{ F: "2/s", fl: "2", f: () => 2, c: "var(--ok)" }, { F: "−1/(s＋1)³", fl: "−(t²/2)e^(−t)", f: t => -t * t / 2 * E(-t), c: "var(--info)" }, { F: "−2/(s＋1)²", fl: "−2t·e^(−t)", f: t => -2 * t * E(-t), c: "var(--packet)" }, { F: "−2/(s＋1)", fl: "−2e^(−t)", f: t => -2 * E(-t), c: "var(--attack)" }], ans: "f(t) ＝ 2 − e^(−t)(t²/2 ＋ 2t ＋ 2)" },
    e3: { name: "虚根", F: "(s ＋ 2) / (s² ＋ 2²) ＝ (a₁s ＋ a₀)/(s² ＋ ω²)　a₁＝1, a₀＝2, ω＝2", Fv: s => (s + 2) / (s * s + 4),
      steps: ["K₁ ＝ a₁/2 ＋ a₀/(2jω)、K₂ ＝ a₁/2 − a₀/(2jω)(共役)", "f ＝ K₁e^(jωt) ＋ K₂e^(−jωt) ＝ a₁cos ωt ＋ (a₀/ω) sin ωt"],
      parts: [{ F: "s/(s²＋4)", fl: "cos 2t", f: t => Math.cos(2 * t), c: "var(--info)" }, { F: "2/(s²＋4)", fl: "sin 2t", f: t => Math.sin(2 * t), c: "var(--ok)" }], ans: "f(t) ＝ cos 2t ＋ sin 2t" }
  };
  ST.ctl.pfdEx = EX;
  /* ∫₀^∞ f(t)e^{−st}dt by the trapezoid rule up to t = 40. */
  ST.ctl.laplaceNum = (f, s) => { let a = 0, h = .005, prev = f(0); for (let t = h; t <= 40 + 1e-9; t += h) { const c = f(t) * Math.exp(-s * t); a += (prev + c) / 2 * h; prev = c; } return a; };
  ST.widget("pfd", {
    title: "部分分数に分けて、1項ずつ時間の波形にもどす",
    group: "ctl", name: "部分分数と逆ラプラス変換", desc: "F(s) を部分分数に分け、1項ずつ足し合わせると元の応答 f(t) になる", order: 8, tag: "逆ラプラス変換",
    formula: "$F(s) = \\frac{K_{1}}{s-s_{1}} +$ … $+ \\frac{K_{n}}{s-s_{n}} \\quad \\to \\quad f(t) = K_{1}e^{s_{1}t} +$ … $+ K_{n}e^{s_{n}t}$",
    says: "分母 $p(s) = 0$ の根(極)$s_{i}$ ごとに分けると、1項ずつ時間関数 $K_{i} e^{s_{i}t}$ にもどせます。係数は $K_{i} = [(s - s_{i})F(s)]$ を $s = s_{i}$ で計算。重根は、掛けて微分して求めます$(M_{i})$。",
    meaning: "複雑な F(s) も、極ごとの単純な指数関数の足し算です。足し合わせるほど、グレーの目標(正解の f(t))にぴったり重なっていきます。極が -1、-3 なら、$e^{-t}$ と $e^{-3t}$ の足し算、というように、極と波形が1対1で対応します。",
    mount(el) {
      let key = "e1", shown = 0;
      el.innerHTML = `<div><p class="lab-label">例題</p>${ST.segHtml("ex", Object.entries(EX).map(([k, x]) => [k, x.name]), key)}</div>
        <div class="hexbox" data-F style="font-size:13px"></div>
        <div class="btns"><button type="button" class="btn primary" data-add>＋ 1項ずつ足す</button><button type="button" class="btn" data-all>全部</button><button type="button" class="btn" data-rst>↺ 最初から</button></div>
        <div class="stage" data-pt style="padding:6px"></div>
        <div class="hexbox" data-parts style="font-size:13px"></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>
        <details><summary style="cursor:pointer;padding:8px 0;font-weight:700">ラプラス変換の表を見る(1項ずつ戻すときに使う)</summary><div data-tab></div></details>`;
      const $ = s => el.querySelector(s), pt = $("[data-pt]"), parts = $("[data-parts]"), big = $("[data-big]"), cap = $("[data-cap]");
      $("[data-tab]").innerHTML = ctl.lapTable(); ctl.wireLapTable($("[data-tab]"));
      const draw = () => {
        const ex = EX[key], N = ex.parts.length, ts = Array.from({ length: T / DT + 1 }, (_, i) => i * DT);
        $("[data-F]").innerHTML = ST.am(`F(s) ＝ ${ex.F}<br>${ex.steps.join("<br>")}`);
        const ser = [{ x: ts, y: ts.map(t => ex.parts.reduce((a, p) => a + p.f(t), 0)), color: "var(--muted)", w: 5, label: "目標 f(t)" }];
        ex.parts.slice(0, shown).forEach(p => ser.push({ x: ts, y: ts.map(p.f), color: p.c, dash: "4 3", w: 1.6 }));
        if (shown) ser.push({ x: ts, y: ts.map(t => ex.parts.slice(0, shown).reduce((a, p) => a + p.f(t), 0)), color: "var(--packet)", w: 2.6, label: "足した合計" });
        pt.innerHTML = ctl.plot({ H: 156, x0: 0, x1: T, ymin: key === "e3" ? -1.6 : undefined, ymax: key === "e3" ? 1.6 : undefined, series: ser, xlabel: "時間 t", aria: "部分分数の和と目標の波形" });
        parts.innerHTML = ST.am(ex.parts.map((p, i) => `<span style="${i < shown ? "" : "opacity:.35"};color:${p.c}">${i < shown ? "✓" : "○"} ${i + 1}. ${p.F} ⇒ ${p.fl}</span>`).join("<br>"));
        $("[data-add]").disabled = shown >= N; $("[data-all]").disabled = shown >= N;
        const f = t => ex.parts.reduce((a, p) => a + p.f(t), 0), ln = ctl.laplaceNum(f, 2), Fv = ex.Fv(2);
        big.innerHTML = ST.am(shown >= N ? `<b>${ex.ans.replace("f(t) ＝ ", "")}</b><span>${shown} 項を足すと、目標と重なりました</span>` : `<b>${shown} / ${N} 項</b><span>足した分だけ、目標に近づきます</span>`);
        cap.innerHTML = ST.am(`確かめ: 答えの f(t) を ∫f(t)e^(−st)dt で s＝2 として数値計算すると ${ctl.n(ln, 4)}、F(2) ＝ ${ctl.n(Fv, 4)}。${Math.abs(ln - Fv) < 1e-3 ? "一致しています。" : "ずれています。"}`);
      };
      ST.wireSeg(el, "ex", v => { key = v; shown = 0; draw(); ST.markLab("pfd"); });
      $("[data-add]").onclick = () => { shown++; draw(); ST.markLab("pfd"); };
      $("[data-all]").onclick = () => { shown = EX[key].parts.length; draw(); ST.markLab("pfd"); };
      $("[data-rst]").onclick = () => { shown = 0; draw(); };
      draw();
    }
  });
})(window.ST);
