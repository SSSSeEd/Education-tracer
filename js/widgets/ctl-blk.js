"use strict";
/* Lab for ブロック線図の結合 (第6回 4-2): cascade (G₁G₂) and parallel (G₁ ± G₂) of two first-order blocks.
   The two blocks are simulated separately; the equivalent single block is drawn from its closed-form step response, and the lines should coincide. */
(function (ST) {
  const ctl = ST.ctl, T = 10, DT = .01, n = ctl.n, E = Math.exp;
  ST.widget("blk", {
    title: "ブロック線図:直列と並列を1つにまとめる",
    group: "ctl", name: "ブロック線図の結合", desc: "2つのブロックを直列・並列につないだ結果が、まとめた1つのブロックと一致する", order: 11, tag: "ブロック線図",
    formula: "直列: $Y = G_{1}G_{2} U$　　並列: $Y = (G_{1} \\pm G_{2}) U$",
    says: "ブロックは伝達関数、矢印は信号、引き出し点は信号の分岐、加え合わせ点は足し算(または引き算)を表します。直列につながったブロックは掛け算、並列は、加え合わせ点の符号に応じた足し算(引き算)で1つにまとめられます。",
    meaning: "出力の途中経過 $W(s)=G_{1}U$、$Y=G_{2}W$ を順に代入すると、$Y=G_{2}G_{1}U$ になります(並列も同様に $Y=W\\pm V$)。下では、2つのブロックを1つずつ動かした結果(橙)と、まとめた1つのブロックの結果(緑の点線)を重ねて、一致することを確かめます。",
    mount(el) {
      let mode = "ser", K = 2, T1 = 1, T2 = 2.5, sim = null, ply = null;
      el.innerHTML = `<div><p class="lab-label">つなぎ方</p>${ST.segHtml("mode", [["ser", "直列(G₁G₂)"], ["par", "並列 ＋(G₁＋G₂)"], ["neg", "並列 −(G₁−G₂)"]], mode)}</div>
        ${ctl.sliders([{ id: "K", label: "G₁ ＝ K/(T₁s＋1) の K", min: .5, max: 3, step: .5, v: K }, { id: "T1", label: "G₁ の T₁", min: .5, max: 4, step: .5, v: T1 }, { id: "T2", label: "G₂ ＝ 1/(T₂s＋1) の T₂", min: .5, max: 4, step: .5, v: T2 }])}
        <div data-ply></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 120" style="width:100%;display:block" role="img" aria-label="ブロック線図" data-diag></svg></div>
        <div class="hexbox" data-eq style="font-size:13px"></div>
        <div class="stage" data-pt style="padding:6px"></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), diag = $("[data-diag]"), eq = $("[data-eq]"), pt = $("[data-pt]"), cap = $("[data-cap]");
      const run = () => {
        const N = Math.round(T / DT), sg = mode === "neg" ? -1 : 1;
        const r = ctl.rk4((s) => [(K - s[0]) / T1, mode === "ser" ? (s[0] - s[1]) / T2 : (1 - s[1]) / T2], [0, 0], DT, N);
        const W = ctl.col(r, 0), V2 = ctl.col(r, 1), Y = mode === "ser" ? V2 : W.map((w, i) => w + sg * V2[i]);
        const comb = W.map((_, i) => { const t = i * DT; if (mode !== "ser") return K * (1 - E(-t / T1)) + sg * (1 - E(-t / T2)); return Math.abs(T1 - T2) < 1e-9 ? K * (1 - (1 + t / T1) * E(-t / T1)) : K * (1 - (T1 * E(-t / T1) - T2 * E(-t / T2)) / (T1 - T2)); });
        sim = { W, V2, Y, comb, err: Math.max(...Y.map((y, i) => Math.abs(y - comb[i]))) };
      };
      const draw = t => {
        const g = a => ctl.at(a, DT, t), box = (x, y, l) => `<rect x="${x}" y="${y}" width="58" height="34" rx="4" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8"/><text x="${x + 29}" y="${y + 21}" text-anchor="middle" class="svg-t" style="font-size:13px;font-weight:700">${l}</text>`;
        const lab = (x, y, l, c) => `<text x="${x}" y="${y}" text-anchor="middle" class="svg-m" style="font-size:10px" fill="${c || "var(--muted)"}">${l}</text>`;
        let s = "";
        if (mode === "ser") {
          s += `<line x1="8" y1="60" x2="52" y2="60" stroke="var(--ink)" stroke-width="1.8"/>` + ctl.arrow(40, 60, 12, "var(--ink)", 1.8) + box(52, 43, "G₁(s)") + `<line x1="110" y1="60" x2="148" y2="60" stroke="var(--ink)" stroke-width="1.8"/>` + ctl.arrow(136, 60, 12, "var(--ink)", 1.8) + box(148, 43, "G₂(s)") + `<line x1="206" y1="60" x2="250" y2="60" stroke="var(--ink)" stroke-width="1.8"/>` + ctl.arrow(238, 60, 12, "var(--ink)", 1.8);
          s += lab(28, 52, "U＝1") + lab(129, 36, `W ＝ ${n(g(sim.W), 2)}`, "var(--info)") + lab(284, 52, `Y ＝ ${n(g(sim.Y), 2)}`, "var(--packet)");
          s += `<text x="8" y="104" class="svg-m" style="font-size:10px">まとめると 1つのブロック G₁(s)G₂(s)</text>`;
        } else {
          const sg = mode === "neg" ? "−" : "＋";
          s += `<line x1="8" y1="60" x2="40" y2="60" stroke="var(--ink)" stroke-width="1.8"/><circle cx="40" cy="60" r="2.6" fill="var(--ink)"/><path d="M40 60V30H70M40 60V90H70" fill="none" stroke="var(--ink)" stroke-width="1.8"/>` + box(70, 13, "G₁(s)") + box(70, 73, "G₂(s)");
          s += `<path d="M128 30H208V54M128 90H208V66" fill="none" stroke="var(--ink)" stroke-width="1.8"/><circle cx="208" cy="60" r="11" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8"/><text x="208" y="65" text-anchor="middle" class="svg-t" style="font-size:14px;font-weight:700">Σ</text><text x="220" y="48" class="svg-t" style="font-size:11px;font-weight:700">＋</text><text x="220" y="82" class="svg-t" style="font-size:12px;font-weight:700" fill="${mode === "neg" ? "var(--attack)" : "var(--ink)"}">${sg}</text><line x1="219" y1="60" x2="268" y2="60" stroke="var(--ink)" stroke-width="1.8"/>` + ctl.arrow(256, 60, 12, "var(--ink)", 1.8);
          s += lab(24, 52, "U＝1") + lab(172, 24, `W ＝ ${n(g(sim.W), 2)}`, "var(--info)") + lab(172, 112, `V ＝ ${n(g(sim.V2), 2)}`, "var(--ok)") + lab(302, 52, `Y ＝ ${n(g(sim.Y), 2)}`, "var(--packet)");
        }
        diag.innerHTML = s;
        const ser = mode === "ser" ? [{ dt: DT, y: sim.W, color: "var(--info)", dash: "5 3", w: 1.6, label: "W(途中)" }] : [{ dt: DT, y: sim.W, color: "var(--info)", dash: "5 3", w: 1.6, label: "W(G₁)" }, { dt: DT, y: sim.V2, color: "var(--ok)", dash: "5 3", w: 1.6, label: "V(G₂)" }];
        pt.innerHTML = ctl.plot({ H: 146, x0: 0, x1: T, series: [{ dt: DT, y: sim.comb, color: "var(--muted)", w: 5, label: "まとめた1ブロック" }].concat(ser, [{ dt: DT, y: sim.Y, color: "var(--packet)", label: "出力 Y" }]), t, upto: t, xlabel: "時間 t(入力はステップ U＝1)", aria: "出力の比較" });
      };
      const note = () => {
        eq.innerHTML = ST.am(mode === "ser" ? `W ＝ G₁U、Y ＝ G₂W ⇒ Y ＝ G₂G₁U ＝ {G₁G₂}U<br>G₁G₂ ＝ ${n(K)} / ((${n(T1)}s＋1)(${n(T2)}s＋1))` : `Y ＝ W ${mode === "neg" ? "−" : "＋"} V ＝ G₁U ${mode === "neg" ? "−" : "＋"} G₂U ＝ {G₁ ${mode === "neg" ? "−" : "＋"} G₂}U<br>最終値 ${n(K)} ${mode === "neg" ? "−" : "＋"} 1 ＝ ${n(mode === "neg" ? K - 1 : K + 1)}`);
        cap.innerHTML = `まとめた1つのブロックの出力(灰)と、2つを別々に動かした出力(橙)の最大の差は ${sim.err.toExponential(1)} で、重なっています。` + (mode === "neg" ? " 引き算にすると、符号の違いで、出力が負になったり山ができたりします(加え合わせ点の符号で結果が変わる)。" : "");
      };
      const redo = () => { run(); note(); ply.restart(); ST.markLab("blk"); };
      ply = ctl.player($("[data-ply]"), { T, draw: t => sim && draw(t), speed: 1.4 });
      run(); note(); ply.restart();
      ST.wireSeg(el, "mode", m => { mode = m; redo(); });
      ctl.wireSliders(el, (id, x) => { if (id === "K") K = x; else if (id === "T1") T1 = x; else T2 = x; redo(); });
      return () => ply.stop();
    }
  });
})(window.ST);
