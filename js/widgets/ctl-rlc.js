"use strict";
/* Lab for 電気系モデル (第2回 2-2, 例2-3 RLC, 例2-4 ハイパス, 例2-5 ローパス): apply a voltage e_i and watch the current (moving dots)
   and the output voltage e_o. Equations are solved with RK4 from Kirchhoff's laws; the dots move with the charge ∫ i dt, so the scrub bar works. */
(function (ST) {
  const ctl = ST.ctl, T = 12, DT = .01, T0 = 1;
  const MODES = {
    rlc: { name: "RLC直列(例2-3)", p: [["R", "抵抗 R", .2, 6, .2, 1], ["L", "コイル L", .2, 3, .1, 1], ["C", "コンデンサ C", .2, 3, .1, 1]], eq: "L C eₒ″ ＋ R C eₒ′ ＋ eₒ ＝ eᵢ" },
    low: { name: "ローパス(例2-5)", p: [["R1", "抵抗 R₁", .5, 6, .5, 2], ["R2", "抵抗 R₂", .5, 6, .5, 2], ["C", "コンデンサ C", .2, 3, .1, 1]], eq: "(R₁/R₂){ C R₂ eₒ′ ＋ (1 ＋ R₂/R₁) eₒ } ＝ eᵢ" },
    high: { name: "ハイパス(例2-4)", p: [["R1", "抵抗 R₁", .5, 6, .5, 2], ["R2", "抵抗 R₂", .5, 6, .5, 2], ["C", "コンデンサ C", .2, 3, .1, 1]], eq: "C R₂ eₒ′ ＋ (1 ＋ R₂/R₁) eₒ ＝ C R₂ eᵢ′ ＋ (R₂/R₁) eᵢ" }
  };
  ST.widget("rlc", {
    title: "電気回路:電圧をかけて、電流と出力電圧を見る",
    group: "ctl", name: "RLC・フィルタ回路", desc: "電圧 eᵢ をかけると、電流(流れる点)と出力電圧 eₒ がどう動くか", order: 3, tag: "キルヒホッフの法則",
    formula: "$e_{i} - e_{o} = R i + L \\frac{di}{dt} \\quad e_{o} = (\\frac{1}{C}) \\int i dt$",
    says: "第1法則は「接続点に入る電流の合計 ＝ 出る電流の合計」、第2法則は「閉回路を1周すると、電源電圧の合計 ＝ 各要素の電圧降下の合計」です。抵抗は $e = R i$、コイルは $e = L \\frac{di}{dt}$、コンデンサは $e = (\\frac{1}{C})\\int i dt$。",
    meaning: "回路の入出力関係式は、電流 i を文字で置いて電圧降下を足し合わせ、i を消して作ります。下の図では、流れている点の速さが電流の大きさ。コンデンサに電気がたまるにつれて、出力電圧が上がり、電流は減っていきます。",
    mount(el, opts) {
      let mode = MODES[opts && opts.mode] ? opts.mode : "rlc", E = 1, inp = "step", v = { R: 1, L: 1, C: 1, R1: 2, R2: 2 }, sim = null, ply = null;
      el.innerHTML = `<div><p class="lab-label">回路</p>${ST.segHtml("mode", Object.entries(MODES).map(([k, m]) => [k, m.name]), mode)}</div>
        <div><p class="lab-label">入力電圧 eᵢ</p>${ST.segHtml("inp", [["step", "ステップ(つなぐ)"], ["sq", "矩形波(入り切り)"]], inp)}</div>
        <div data-sl></div><div data-ply></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 150" style="width:100%;display:block" role="img" aria-label="回路と電流の流れ" data-ckt></svg></div>
        <div class="hexbox" data-eq style="font-size:13px"></div>
        <div class="stage" data-pv style="padding:6px"></div><div class="stage" data-pi style="padding:6px"></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), ckt = $("[data-ckt]"), eq = $("[data-eq]"), pv = $("[data-pv]"), pi = $("[data-pi]"), cap = $("[data-cap]");
      const ei = t => t < T0 ? 0 : inp === "step" ? E : ((t - T0) % 6) < 3 ? E : 0;
      const run = () => {
        const n = Math.round(T / DT);
        let r, eo, ii, q1 = null, q2 = null, qi;
        if (mode === "rlc") {
          r = ctl.rk4((s, t) => [s[1], (ei(t) - v.R * s[1] - s[0] / v.C) / v.L], [0, 0], DT, n);
          eo = r.x.map(s => s[0] / v.C); ii = r.x.map(s => s[1]); qi = ctl.col(r, 0);
        } else if (mode === "low") {
          r = ctl.rk4((s, t) => [((ei(t) - s[0]) / v.R1 - s[0] / v.R2) / v.C, (ei(t) - s[0]) / v.R1, s[0] / v.R2], [0, 0, 0], DT, n);
          eo = ctl.col(r, 0); qi = ctl.col(r, 1); q1 = ctl.col(r, 2); q2 = eo.map(e => v.C * e); ii = eo.map((e, k) => (ei(k * DT) - e) / v.R1);
        } else {
          r = ctl.rk4((s, t) => { const i = (ei(t) - s[0]) / v.R2, i1 = s[0] / v.R1; return [(i - i1) / v.C, i, i1]; }, [0, 0, 0], DT, n);
          const vc = ctl.col(r, 0); eo = vc.map((c, k) => ei(k * DT) - c); qi = ctl.col(r, 1); q1 = ctl.col(r, 2); q2 = vc.map(c => v.C * c); ii = vc.map((c, k) => (ei(k * DT) - c) / v.R2);
        }
        const im = Math.max(1e-6, ...ii.map(Math.abs));
        sim = { eo, ii, qi, q1, q2, ei: eo.map((_, k) => ei(k * DT)), kq: 3.2 / im, im };
      };
      const draw = t => {
        const g = a => ctl.at(a, DT, t), kq = sim.kq, col = "var(--packet)", W = "var(--muted)";
        let s = "";
        const bk = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--surface)"/>`;
        if (mode === "rlc") {
          const loop = [[28, 80], [28, 36], [250, 36], [250, 124], [28, 124], [28, 80]];
          s += ctl.wire(loop, W) + bk(70, 28, 40, 16) + bk(130, 28, 40, 16) + bk(240, 62, 20, 36) + bk(18, 66, 20, 28);
          s += ctl.sym("V", 28, 80, true, "eᵢ") + ctl.sym("R", 90, 36, false, "R") + ctl.sym("L", 150, 36, false, "L") + ctl.sym("C", 250, 80, true, "C");
          s += ctl.flow(loop, g(sim.qi) * kq, col) + `<text x="270" y="108" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--packet)">eₒ ＝ ${ctl.n(g(sim.eo), 2)} V</text>`;
        } else if (mode === "low") {
          s += ctl.wire([[28, 80], [28, 36], [250, 36], [250, 124], [28, 124], [28, 80]], W) + ctl.wire([[150, 36], [150, 124]], W) + bk(70, 28, 40, 16) + bk(140, 62, 20, 36) + bk(240, 62, 20, 36) + bk(18, 66, 20, 28);
          s += ctl.sym("V", 28, 80, true, "eᵢ") + ctl.sym("R", 90, 36, false, "R₁") + ctl.sym("R", 150, 80, true, "R₂") + ctl.sym("C", 250, 80, true, "C");
          s += ctl.flow([[28, 80], [28, 36], [150, 36]], g(sim.qi) * kq, col) + ctl.flow([[150, 36], [150, 124]], g(sim.q1) * kq, col) + ctl.flow([[150, 36], [250, 36], [250, 124]], g(sim.q2) * kq, col) + ctl.flow([[250, 124], [150, 124]], g(sim.q2) * kq, col) + ctl.flow([[150, 124], [28, 124], [28, 80]], g(sim.qi) * kq, col);
          s += `<text x="266" y="108" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--packet)">eₒ ＝ ${ctl.n(g(sim.eo), 2)} V</text>`;
        } else {
          s += ctl.wire([[28, 90], [28, 54], [230, 54], [230, 130], [28, 130], [28, 90]], W) + ctl.wire([[70, 54], [70, 18], [170, 18], [170, 54]], W) + bk(100, 46, 40, 16) + bk(112, 8, 16, 20) + bk(220, 76, 20, 34) + bk(18, 76, 20, 28);
          s += ctl.sym("V", 28, 90, true, "eᵢ") + ctl.sym("R", 120, 54, false, "R₁") + ctl.sym("C", 120, 18, false, "") + `<text x="136" y="22" class="svg-t" style="font-size:11px;font-weight:600">C</text>` + ctl.sym("R", 230, 92, true, "R₂");
          s += ctl.flow([[28, 90], [28, 54], [70, 54]], g(sim.qi) * kq, col) + ctl.flow([[70, 54], [170, 54]], g(sim.q1) * kq, col) + ctl.flow([[70, 54], [70, 18], [170, 18], [170, 54]], g(sim.q2) * kq, col) + ctl.flow([[170, 54], [230, 54], [230, 130], [28, 130], [28, 90]], g(sim.qi) * kq, col);
          s += `<text x="250" y="122" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--packet)">eₒ ＝ ${ctl.n(g(sim.eo), 2)} V</text>`;
        }
        s += `<text x="8" y="144" class="svg-m" style="font-size:10px">電流 i ＝ ${ctl.n(g(sim.ii), 3)} A(点の速さが電流の大きさ)　入力 eᵢ ＝ ${ctl.n(ei(t), 1)} V</text>`;
        ckt.innerHTML = s;
        pv.innerHTML = ctl.plot({ H: 118, x0: 0, x1: T, series: [{ dt: DT, y: sim.ei, color: "var(--info)", label: "入力 eᵢ", dash: "5 3", w: 1.6 }, { dt: DT, y: sim.eo, color: "var(--packet)", label: "出力 eₒ" }], t, upto: t, xlabel: "時間 s", aria: "入力電圧と出力電圧" });
        pi.innerHTML = ctl.plot({ H: 84, x0: 0, x1: T, series: [{ dt: DT, y: sim.ii, color: "var(--ok)", label: "電流 i" }], t, upto: t, xlabel: "時間 s", aria: "電流" });
      };
      const note = () => {
        eq.innerHTML = ST.am(`入出力の関係式<br>${MODES[mode].eq}`);
        if (mode === "rlc") { const z = v.R / 2 * Math.sqrt(v.C / v.L); cap.innerHTML = ST.am(`ωₙ ＝ 1/√(LC) ＝ ${ctl.n(1 / Math.sqrt(v.L * v.C), 2)} rad/s、ζ ＝ (R/2)√(C/L) ＝ ${ctl.n(z, 2)}。` + (z < 1 ? "ζ が小さいので、eₒ は行き過ぎて揺れます(コイルとコンデンサの間で電気がゆすり合う)。R を大きくすると揺れが減ります。" : "ζ が 1 以上なので、揺れずにゆっくり上がります。")); }
        else if (mode === "low") cap.innerHTML = "ローパスフィルタ:ゆっくりした変化は通し、すばやい変化はなまらせます。最終値は eᵢ·R₂/(R₁＋R₂)。矩形波にして、角がなまる様子を見てください。";
        else cap.innerHTML = ST.am(`ハイパスフィルタ(位相進み回路):つないだ瞬間はコンデンサが素通りなので eₒ ＝ eᵢ(すばやい変化は通す)。やがてコンデンサに電気がたまると、R₁ と R₂ で分ける形になり、eₒ は eᵢ·R₂/(R₁＋R₂) ＝ ${ctl.n(E * v.R2 / (v.R1 + v.R2), 2)} V まで下がります。矩形波にすると、立ち上がりの山が見えます。`);
      };
      const controls = () => {
        $("[data-sl]").innerHTML = ctl.sliders([{ id: "E", label: "入力電圧 eᵢ の大きさ", min: .5, max: 5, step: .5, v: E, unit: "V" }].concat(MODES[mode].p.map(([id, label, min, max, step]) => ({ id, label, min, max, step, v: v[id] }))));
        ctl.wireSliders($("[data-sl]"), (id, x) => { if (id === "E") E = x; else v[id] = x; redo(); });
      };
      const redo = () => { run(); note(); ply.restart(); ST.markLab("rlc"); };
      ply = ctl.player($("[data-ply]"), { T, draw: t => sim && draw(t), speed: 1.2 });
      controls(); run(); note(); ply.restart();
      ST.wireSeg(el, "mode", m => { mode = m; controls(); redo(); });
      ST.wireSeg(el, "inp", m => { inp = m; redo(); });
      return () => ply.stop();
    }
  });
})(window.ST);
