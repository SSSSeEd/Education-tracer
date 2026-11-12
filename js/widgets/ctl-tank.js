"use strict";
/* Lab for プロセス系モデル (第3回 2-3, 例2-7): one tank with an outlet resistance R and cross-section A.
   A dh/dt + h/R = q_i.  Same form as an RC circuit (analogy table in the lesson): h ↔ e_o, q ↔ i, R ↔ R, A ↔ C. */
(function (ST) {
  const ctl = ST.ctl, T = 14, DT = .01, T0 = .5;
  ST.widget("tank", {
    title: "1タンク系:流入量を変えて、水位を見る",
    group: "ctl", name: "1タンク(水位系)", desc: "流入量を変えると、水位が時定数 A·R でゆっくり追いつく。RC回路と同じ形", order: 5, tag: "プロセス系",
    formula: "$A \\frac{dh}{dt} + \\frac{h}{R} = q_{i}$",
    says: "流入量 $q_{i}$ と流出量 $q_o$ の差が、水位の変化(断面積 $A \\times \\frac{dh}{dt}$)になります。出口の流れ $q_o$ は水位 h に比例して $\\frac{h}{R}$。",
    meaning: "水位が低いうちは流出が少なく、水がたまって水位が上がります。水位が上がるほど流出が増えて、やがて流入と流出が等しくなり、水位は $R\\cdot q_{i}$ で止まります。この「追いつく速さ」が時定数 A·R。RC回路の $e_{0}(t)$ と、まったく同じ形の動きです。",
    mount(el) {
      let A = 2, R = 1.5, Q = 1, sim = null, ply = null;
      el.innerHTML = `${ctl.sliders([{ id: "Q", label: "流入量 qᵢ(0.5秒後に増やす)", min: .2, max: 3, step: .1, v: Q }, { id: "A", label: "タンクの断面積 A", min: .5, max: 4, step: .5, v: A }, { id: "R", label: "出口の抵抗 R", min: .5, max: 4, step: .5, v: R }])}
        <div data-ply></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 172" style="width:100%;display:block" role="img" aria-label="タンクの水位" data-scene></svg></div>
        <div class="hexbox" data-eq style="font-size:13px"></div>
        <div class="stage" data-ph style="padding:6px"></div>
        <div class="hexbox" data-an style="font-size:12.5px"></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), scene = $("[data-scene]"), eq = $("[data-eq]"), ph = $("[data-ph]"), an = $("[data-an]"), cap = $("[data-cap]");
      const qi = t => t >= T0 ? Q : 0;
      const run = () => {
        const n = Math.round(T / DT), r = ctl.rk4((s, t) => [(qi(t) - s[0] / R) / A], [0], DT, n);
        sim = { h: ctl.col(r, 0), hmax: Math.max(.5, R * Q) * 1.15 };
      };
      const draw = t => {
        const h = ctl.at(sim.h, DT, t), q = qi(t), qo = h / R, top = 34, bot = 148, H = bot - top, lv = Math.min(1, h / sim.hmax) * (H - 4);
        const qin = Q * Math.max(0, t - T0), qout = qin - A * h;
        let s = `<rect x="76" y="${(bot - lv).toFixed(1)}" width="100" height="${lv.toFixed(1)}" fill="var(--info)" opacity=".35"/><path d="M76 ${top}V${bot}H176V${top}" fill="none" stroke="var(--ink)" stroke-width="2.4"/>`;
        s += `<line x1="76" y1="${(bot - lv).toFixed(1)}" x2="176" y2="${(bot - lv).toFixed(1)}" stroke="var(--info)" stroke-width="2.4"/>`;
        s += `<path d="M118 4V22H134" fill="none" stroke="var(--muted)" stroke-width="3"/>`;
        if (q > 0) s += ctl.flow([[134, 22], [134, bot - lv]], qin * 1.6, "var(--info)", 12);
        s += `<line x1="176" y1="${bot - 12}" x2="268" y2="${bot - 12}" stroke="var(--muted)" stroke-width="3"/><rect x="214" y="${bot - 22}" width="10" height="20" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.6"/>`;
        if (h > .005) s += ctl.flow([[176, bot - 12], [268, bot - 12]], Math.max(0, qout) * 1.6, "var(--info)", 12);
        s += `<text x="144" y="14" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--info)">流入 qᵢ ＝ ${ctl.n(q, 2)}</text><text x="184" y="${bot - 36}" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--info)">流出 q_o ＝ ${ctl.n(qo, 2)}</text>`;
        s += `<text x="126" y="${(bot - lv / 2 + 4).toFixed(1)}" text-anchor="middle" class="svg-t" style="font-size:13px;font-weight:700">水位 h ＝ ${ctl.n(h, 2)}</text><text x="126" y="${bot + 16}" text-anchor="middle" class="svg-m" style="font-size:10px">断面積 A ＝ ${A}</text>`;
        s += `<text x="219" y="${bot + 14}" text-anchor="middle" class="svg-m" style="font-size:10px">抵抗 R</text>`;
        scene.innerHTML = s;
        const dh = (q - h / R) / A;
        eq.innerHTML = ST.am(`A·dh/dt ＋ h/R ＝ qᵢ<br>${A}×${ctl.n(dh, 3)} ＋ ${ctl.n(h / R, 3)} ＝ ${ctl.n(q, 2)}　(dh/dt ＝ ${ctl.n(dh, 3)})`);
        const hf = R * Q, tau = A * R;
        ph.innerHTML = ctl.plot({ H: 126, x0: 0, x1: T, series: [{ dt: DT, y: sim.h, color: "var(--info)", label: "水位 h(t)(RC回路なら eₒ(t))" }], hlines: [{ y: hf, label: "最終値 R·qᵢ ＝ " + ctl.n(hf, 2), color: "var(--ok)" }, { y: hf * .632, label: "63.2%", color: "var(--muted)" }], vlines: [{ x: T0 + tau, label: "t＝τ", color: "var(--packet)" }], t, upto: t, xlabel: "時間 s", aria: "水位の時間変化" });
        void qout;
      };
      const note = () => {
        const tau = A * R;
        an.innerHTML = ST.am(`<b>アナログ(類似性)</b><br>水位 h ↔ 電圧 eₒ　流量 q ↔ 電流 i<br>出口の抵抗 R ↔ 抵抗 R　断面積 A ↔ 容量 C<br>RC回路 C·deₒ/dt ＋ eₒ/R ＝ eᵢ/R と同じ形(qᵢ ↔ eᵢ/R)`);
        cap.innerHTML = ST.am(`時定数 τ ＝ A·R ＝ ${ctl.n(tau, 2)} 秒。流入を変えてから τ 秒後に、水位は最終値の約 63% まで届きます(オレンジの線)。A や R を大きくすると、追いつくのが遅くなります。`);
      };
      const redo = () => { run(); note(); ply.restart(); ST.markLab("tank"); };
      ply = ctl.player($("[data-ply]"), { T, draw: t => sim && draw(t), speed: 1.4 });
      run(); note(); ply.restart();
      ctl.wireSliders(el, (id, x) => { if (id === "Q") Q = x; else if (id === "A") A = x; else R = x; redo(); });
      return () => ply.stop();
    }
  });
})(window.ST);
