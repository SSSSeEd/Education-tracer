"use strict";
/* Lab for 直流サーボモータ (第2回 例2-6): voltage e1 → current i → torque K i → angular velocity ω → back-EMF e2 = K ω.
   L di/dt + R i = e1 − K ω,  J dω/dt + B ω = K i.  (K stands for both K_e and K_t, which are equal in SI units.) */
(function (ST) {
  const ctl = ST.ctl, T = 8, DT = .005, T0 = .5;
  ST.widget("motor", {
    title: "直流サーボモータ:電圧をかけて、電流と回転を見る",
    group: "ctl", name: "直流サーボモータ", desc: "電圧をかけると、電流・トルク・回転・逆起電力がどう動くか", order: 4, tag: "電気系と機械系",
    formula: "L di/dt ＋ R i ＝ e₁ − K ω　　J dω/dt ＋ B ω ＝ K i",
    says: "電気側では、電圧 e₁ から、抵抗とコイルの電圧降下と、回転が生む逆起電力 e₂ ＝ K ω を引いた分が電流を流します。機械側では、トルク K i が、慣性 J と粘性抵抗 B のつり合いで角速度 ω を決めます。",
    meaning: "電圧をかけた瞬間は、まだ回っていないので逆起電力が 0。電流がどっと流れてトルクが大きく出ます。回り始めると逆起電力が増えて電流が減り、ω は一定値に落ち着きます。電気の式と機械の式が、i と ω でつながっています。",
    mount(el) {
      let E = 5, R = 1, L = .2, K = 1, J = 1, B = .3, sim = null, ply = null;
      el.innerHTML = `${ctl.sliders([{ id: "E", label: "かける電圧 e₁", min: 1, max: 10, step: 1, v: E, unit: "V" }, { id: "R", label: "抵抗 R", min: .5, max: 5, step: .5, v: R }, { id: "L", label: "インダクタンス L", min: .05, max: 1, step: .05, v: L }, { id: "K", label: "モーター定数 K(Kₑ ＝ Kₜ)", min: .2, max: 2, step: .1, v: K }, { id: "J", label: "慣性モーメント J", min: .2, max: 3, step: .2, v: J }, { id: "B", label: "粘性抵抗 B", min: 0, max: 2, step: .1, v: B }])}
        <div data-ply></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 128" style="width:100%;display:block" role="img" aria-label="モーターの回転と各量" data-scene></svg></div>
        <div class="stage" data-pi style="padding:6px"></div><div class="stage" data-pw style="padding:6px"></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), scene = $("[data-scene]"), pi = $("[data-pi]"), pw = $("[data-pw]"), cap = $("[data-cap]");
      const e1 = t => t >= T0 ? E : 0;
      const run = () => {
        const n = Math.round(T / DT), r = ctl.rk4((s, t) => [(e1(t) - R * s[0] - K * s[1]) / L, (K * s[0] - B * s[1]) / J, s[1]], [0, 0, 0], DT, n);
        sim = { i: ctl.col(r, 0), w: ctl.col(r, 1), th: ctl.col(r, 2) };
        sim.imax = Math.max(.1, ...sim.i.map(Math.abs)); sim.wmax = Math.max(.1, ...sim.w.map(Math.abs));
      };
      const draw = t => {
        const g = a => ctl.at(a, DT, t), i = g(sim.i), w = g(sim.w), th = g(sim.th), cx0 = 56, cy0 = 64, r0 = 42;
        let s = `<circle cx="${cx0}" cy="${cy0}" r="${r0}" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/>`;
        for (let k = 0; k < 4; k++) { const a = th + k * Math.PI / 2; s += `<line x1="${cx0}" y1="${cy0}" x2="${(cx0 + r0 * .92 * Math.cos(a)).toFixed(1)}" y2="${(cy0 - r0 * .92 * Math.sin(a)).toFixed(1)}" stroke="${k ? "var(--muted)" : "var(--packet)"}" stroke-width="${k ? 2 : 4}" stroke-linecap="round"/>`; }
        s += `<circle cx="${cx0}" cy="${cy0}" r="4" fill="var(--ink)"/><text x="${cx0}" y="${cy0 + r0 + 14}" text-anchor="middle" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--packet)">ω ＝ ${ctl.n(w, 2)} rad/s</text>`;
        const bx = 196, bw = 100, sv = bw / 2 / Math.max(E, K * sim.wmax, .1), si = bw / 2 / sim.imax, sq = bw / 2 / (K * sim.imax);
        s += ctl.bar(bx, 8, bw, e1(t), sv, "var(--info)", "電圧 e₁", ctl.n(e1(t), 2)) + ctl.bar(bx, 36, bw, K * w, sv, "var(--attack)", "逆起電力 e₂", ctl.n(K * w, 2)) + ctl.bar(bx, 68, bw, i, si, "var(--ok)", "電流 i", ctl.n(i, 2)) + ctl.bar(bx, 96, bw, K * i, sq, "var(--packet)", "トルク K·i", ctl.n(K * i, 2));
        scene.innerHTML = s;
        pi.innerHTML = ctl.plot({ H: 104, x0: 0, x1: T, series: [{ dt: DT, y: sim.i, color: "var(--ok)", label: "電流 i(t)" }], hlines: [{ y: E / R, label: "E/R(回転前の最大)", color: "var(--muted)" }], t, upto: t, xlabel: "時間 s", aria: "電流" });
        pw.innerHTML = ctl.plot({ H: 104, x0: 0, x1: T, series: [{ dt: DT, y: sim.w, color: "var(--packet)", label: "角速度 ω(t)" }], hlines: [{ y: K * E / (R * B + K * K), label: "最終値", color: "var(--ok)" }], t, upto: t, xlabel: "時間 s", aria: "角速度" });
      };
      const note = () => { cap.innerHTML = `最終的な角速度は ω ＝ K e₁ /(R B ＋ K²) ＝ ${ctl.n(K * E / (R * B + K * K), 2)} rad/s、そのときの電流は i ＝ B ω/K ＝ ${ctl.n(B * K * E / (R * B + K * K) / K, 2)} A。電圧をかけた直後は電流が大きく(最大 E/R)、回り出すと逆起電力のぶんだけ減ります。これが「逆起電力」のはたらきです。B を 0 にすると、負荷がなく逆起電力が電圧に近づくまで回ります。`; };
      const redo = () => { run(); note(); ply.restart(); ST.markLab("motor"); };
      ply = ctl.player($("[data-ply]"), { T, draw: t => sim && draw(t), speed: 1.2 });
      run(); note(); ply.restart();
      ctl.wireSliders(el, (id, x) => { ({ E: () => E = x, R: () => R = x, L: () => L = x, K: () => K = x, J: () => J = x, B: () => B = x })[id](); redo(); });
      return () => ply.stop();
    }
  });
})(window.ST);
