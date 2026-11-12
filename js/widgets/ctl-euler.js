"use strict";
/* Lab for 複素根とオイラーの公式 (第4回 虚根の発展): F(s) ＝ 1/(s² ＋ p s ＋ q) の根が a ± jb になるとき。
   2つの項 K₁e^(s₁t) と K₂e^(s₂t) は共役な複素数で、虚部が打ち消し合い、実部だけが残って e^(at) sin(bt)/b になる。
   近道: 分母を平方完成して (s − a)² ＋ b² にすれば、表の e^(at) sin bt の行にそのまま合う。 */
(function (ST) {
  const ctl = ST.ctl, T = 6, DT = .02, n = ctl.n;
  const shift = a => a === 0 ? "s" : a < 0 ? `(s ＋ ${n(-a, 2)})` : `(s − ${n(a, 2)})`;
  ST.widget("euler", {
    title: "複素数の根:虚部が打ち消し合って、cos と sin が残る",
    group: "ctl", name: "複素根とオイラーの公式", desc: "根が a±jb のとき、2つの項の虚部が打ち消し合う様子と、平方完成の近道", order: 13, tag: "オイラーの公式",
    formula: "$e^{j\\omega t} = \\cos \\omega t + j \\sin \\omega t \\quad K_{1}e^{(a+jb)t} + K_{2}e^{(a-jb)t} = e^{at}[(K_{1}+K_{2})\\cos bt + j(K_{1}-K_{2}) \\sin bt]$",
    says: "根が複素数 a ± jb のとき、部分分数の2つの項は互いに共役です。オイラーの公式で cos と sin に分けると、虚部は逆向きで足すと 0、実部は同じ値で2倍になります。",
    meaning: "右の図で、青と橙の矢印(2つの項)は実軸について対称に回り、足すと必ず実軸の上(緑)に乗ります。つまり、実数の入力に対する応答は実数の波形 $e^{at}\\cdot \\sin bt$ になります。a が負なら矢印が縮みながら回ります。",
    mount(el) {
      let a = -.5, b = 2, ply = null;
      el.innerHTML = `${ctl.sliders([{ id: "a", label: "根の実部 a(0 のとき純粋な振動)", min: -2, max: 0, step: .5, v: a }, { id: "b", label: "根の虚部 b(振動の速さ)", min: 1, max: 4, step: .5, v: b }])}
        <div class="hexbox" data-F style="font-size:13px"></div>
        <div data-ply></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 196" style="width:100%;display:block" role="img" aria-label="2つの項の複素平面での動きと足し算" data-sv></svg></div>
        <div class="stage" data-pi style="padding:6px"></div><div class="stage" data-pr style="padding:6px"></div>
        <div class="hexbox" data-way style="font-size:12.5px"></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), sv = $("[data-sv]"), pi = $("[data-pi]"), pr = $("[data-pr]");
      /* 項 z₁(t) ＝ K₁e^((a+jb)t),  K₁ ＝ 1/(2jb) ＝ −j/(2b):  z₁ ＝ e^(at)/(2b)·(sin bt − j cos bt) */
      const z1 = t => { const m = Math.exp(a * t) / (2 * b); return [m * Math.sin(b * t), -m * Math.cos(b * t)]; };
      const ts = () => Array.from({ length: Math.round(T / DT) + 1 }, (_, i) => i * DT);
      const info = () => {
        const p = -2 * a, q = a * a + b * b;
        $("[data-F]").innerHTML = ST.am(`F(s) ＝ 1/(s² ＋ ${n(p, 2)}s ＋ ${n(q, 2)})　根: s ＝ ${n(a, 2)} ± j${n(b, 2)}`);
        const w1 = `K₁ ＝ 1/(s₁ − s₂) ＝ 1/(2jb) ＝ −j/${n(2 * b, 1)}、K₂ ＝ ＋j/${n(2 * b, 1)}(共役)`;
        $("[data-way]").innerHTML = ST.am(`<b>遠回り(根とオイラー)</b><br>${w1}<br>f ＝ K₁e^(s₁t) ＋ K₂e^(s₂t) ＝ e^(${n(a, 2)}t)[(K₁＋K₂)cos ${n(b, 1)}t ＋ j(K₁−K₂) sin ${n(b, 1)}t]<br>K₁＋K₂ ＝ 0、j(K₁−K₂) ＝ 1/${n(b, 1)} → <b>f ＝ (1/${n(b, 1)}) e^(${n(a, 2)}t) sin ${n(b, 1)}t</b><br><b>近道(平方完成)</b><br>s² ＋ ${n(p, 2)}s ＋ ${n(q, 2)} ＝ ${shift(a)}² ＋ ${n(b, 1)}²<br>F ＝ (1/${n(b, 1)}) · ${n(b, 1)}/(${shift(a)}² ＋ ${n(b, 1)}²) ← 表の e^(at) sin bt の行(a ＝ ${n(a, 2)}、b ＝ ${n(b, 1)})<br>→ 同じ答え <b>f ＝ (1/${n(b, 1)}) e^(${n(a, 2)}t) sin ${n(b, 1)}t</b>`);
        const f = t => Math.exp(a * t) * Math.sin(b * t) / b, ln = ctl.laplaceNum(f, 2), Fv = 1 / (4 + p * 2 + q);
        $("[data-cap]").innerHTML = ST.am(`確かめ: 答えを数値でラプラス変換して s＝2 とすると ${n(ln, 4)}、F(2) ＝ ${n(Fv, 4)}。${Math.abs(ln - Fv) < 1e-3 ? "一致しています。" : "ずれています。"}　a ＝ 0 にすると、授業の虚根の例(s² ＋ ω²)と同じ純粋な振動になります。`);
      };
      const draw = t => {
        const R = 70, cx = 170, cy = 98, sc = R * 2 * b, v1 = z1(t), v2 = [v1[0], -v1[1]], X = c => cx + c[0] * sc, Y = c => cy - c[1] * sc;
        let s = `<line x1="14" y1="${cy}" x2="326" y2="${cy}" stroke="var(--muted)"/><line x1="${cx}" y1="14" x2="${cx}" y2="182" stroke="var(--muted)"/><text x="324" y="${cy - 5}" text-anchor="end" class="svg-m" style="font-size:9.5px">実部</text><text x="${cx + 4}" y="22" class="svg-m" style="font-size:9.5px">虚部</text>`;
        const sum = [v1[0] * 2, 0];
        s += `<line x1="${X(v1).toFixed(1)}" y1="${Y(v1).toFixed(1)}" x2="${X(sum).toFixed(1)}" y2="${Y(sum).toFixed(1)}" stroke="var(--info)" stroke-dasharray="3 3"/><line x1="${X(v2).toFixed(1)}" y1="${Y(v2).toFixed(1)}" x2="${X(sum).toFixed(1)}" y2="${Y(sum).toFixed(1)}" stroke="var(--packet)" stroke-dasharray="3 3"/>`;
        const vec = (c, col, lab) => `<line x1="${cx}" y1="${cy}" x2="${X(c).toFixed(1)}" y2="${Y(c).toFixed(1)}" stroke="${col}" stroke-width="3" stroke-linecap="round"/><circle cx="${X(c).toFixed(1)}" cy="${Y(c).toFixed(1)}" r="4.5" fill="${col}"/><text x="${(X(c) + 7).toFixed(1)}" y="${(Y(c) + (c[1] >= 0 ? -6 : 13)).toFixed(1)}" class="svg-t" style="font-size:10.5px;font-weight:700" fill="${col}">${lab}</text>`;
        s += vec(v1, "var(--info)", "項1") + vec(v2, "var(--packet)", "項2");
        s += `<line x1="${cx}" y1="${cy + 1}" x2="${X(sum).toFixed(1)}" y2="${cy + 1}" stroke="var(--ok)" stroke-width="5" stroke-linecap="round" opacity=".9"/><text x="${Math.min(300, Math.max(30, X(sum))).toFixed(1)}" y="${cy + 80}" text-anchor="middle" class="svg-t" style="font-size:10.5px;font-weight:700" fill="var(--ok)">足すと実軸の上: ${n(sum[0] * 1, 2)}</text>`;
        sv.innerHTML = s;
        const tt = ts(), c = tt.map(z1);
        const hs = { H: 100, x0: 0, x1: T, t, upto: t, xlabel: "時間 s" };
        pi.innerHTML = ctl.plot({ ...hs, series: [{ x: tt, y: c.map(v => v[1]), color: "var(--info)", label: "項1の虚部" }, { x: tt, y: c.map(v => -v[1]), color: "var(--packet)", label: "項2の虚部", dash: "5 3" }, { x: tt, y: c.map(() => 0), color: "var(--ok)", w: 3.5, label: "和＝0" }], ymin: -1 / (2 * b) * 1.1, ymax: 1 / (2 * b) * 1.1, aria: "虚部は打ち消し合う" });
        pr.innerHTML = ctl.plot({ ...hs, series: [{ x: tt, y: c.map(v => v[0]), color: "var(--info)", label: "各項の実部(同じ)", w: 1.6, dash: "4 3" }, { x: tt, y: c.map(v => 2 * v[0]), color: "var(--ok)", w: 3, label: "和 ＝ f(t)" }], ymin: -1 / b * 1.05, ymax: 1 / b * 1.05, aria: "実部だけが残る" });
        $("[data-big]").innerHTML = ST.am(`<b>虚部の和 ＝ 0</b><span>実部が 2 倍になって f(t) ＝ e^(at) sin bt / b に</span>`);
      };
      ply = ctl.player($("[data-ply]"), { T, draw });
      info(); ply.restart();
      ctl.wireSliders(el, (id, v) => { if (id === "a") a = v; else b = v; info(); ply.restart(); ST.markLab("euler"); });
      return () => ply.stop();
    }
  });
})(window.ST);
