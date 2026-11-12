"use strict";
/* Lab for 機械系モデル (第1回 2-1, 例2-2, 第2回 演習2.1, 第5回 解説): mass–spring–damper.
   Mode "force": push the cart with f(t), see x(t) and the balance  M a + C v + K x = f.
   Mode "wall": move the left end x_i(t); spring and damper pull the cart:  M a = K (x_i − x) + C (v_i − v). */
(function (ST) {
  const ctl = ST.ctl, T = 8, DT = .005, T0 = .5;
  const sm = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u), dsm = u => u <= 0 || u >= 1 ? 0 : 6 * u * (1 - u);

  ST.widget("msd", {
    title: "質量・ばね・ダンパ:力を加えて、変位を見る",
    group: "ctl", name: "質量・ばね・ダンパ", desc: "力を加える(または壁側を動かす)と、台車の変位とつり合いの式がどう動くか", order: 2, tag: "運動方程式",
    formula: "$M \\frac{d^{2}x}{dt^{2}} + C \\frac{dx}{dt} + K x = f(t)$",
    says: "台車に働く力の合計が質量×加速度、という運動方程式です。ばねは変位 x に比例(K x)、ダンパは速度 $\\frac{dx}{dt}$ に比例$(C \\frac{dx}{dt})$、質量は加速度 $\\frac{d^{2}x}{dt^{2}}$ に比例$(M \\frac{d^{2}x}{dt^{2}})$する力を出します。",
    meaning: "式の左の3つは「台車が自分で出している力」(慣性・粘性・ばね)で、合計が外から加えた力 f に等しくなります(つり合い式)。下のバーで、3つの力を足すと f になっていく様子が見えます。",
    mount(el) {
      let M = 2, C = 2, K = 8, A = 5, mode = "force", inp = "step", sim = null, ply = null;
      el.innerHTML = `<div><p class="lab-label">何を動かす?</p>${ST.segHtml("mode", [["force", "台車に力 f を加える"], ["wall", "左端(入力 xᵢ)を動かす"]], mode)}</div>
        <div><p class="lab-label">入力のかたち</p>${ST.segHtml("inp", [["step", "押し続ける"], ["pulse", "ポンと押す"], ["sine", "ゆらす"]], inp)}</div>
        ${ctl.sliders([{ id: "A", label: "入力の大きさ(力 N / 距離 m)", min: 0, max: 10, step: .5, v: A }, { id: "M", label: "質量 M", min: .5, max: 5, step: .5, v: M, unit: "kg" }, { id: "C", label: "粘性抵抗 C(ダンパ)", min: 0, max: 10, step: .5, v: C }, { id: "K", label: "ばね定数 K", min: 1, max: 20, step: 1, v: K }])}
        <div data-ply></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 176" style="width:100%;display:block" role="img" aria-label="台車・ばね・ダンパの動き" data-scene></svg></div>
        <div class="hexbox" data-eq style="font-size:13px"></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 92" style="width:100%;display:block" role="img" aria-label="力のつり合い" data-bars></svg></div>
        <p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), scene = $("[data-scene]"), bars = $("[data-bars]"), eq = $("[data-eq]"), cap = $("[data-cap]");
      const fIn = t => inp === "step" ? (t >= T0 ? A : 0) : inp === "pulse" ? (t >= T0 && t < T0 + .5 ? A : 0) : (t >= T0 ? A * Math.sin(2 * (t - T0)) : 0);
      const xiF = t => { const u = (t - T0) / .4; return inp === "step" ? A * sm(u) : inp === "pulse" ? A * (sm(u) - sm((t - T0 - .5) / .4)) : (t >= T0 ? A * Math.sin(2 * (t - T0)) : 0); };
      const viF = t => { const u = (t - T0) / .4; return inp === "step" ? A * dsm(u) / .4 : inp === "pulse" ? A * (dsm(u) - dsm((t - T0 - .5) / .4)) / .4 : (t >= T0 ? 2 * A * Math.cos(2 * (t - T0)) : 0); };
      const run = () => {
        const n = Math.round(T / DT), w = mode === "wall";
        const f = (s, t) => [s[1], w ? (K * (xiF(t) - s[0]) + C * (viF(t) - s[1])) / M : (fIn(t) - C * s[1] - K * s[0]) / M];
        const r = ctl.rk4(f, [0, 0], DT, n), xs = ctl.col(r, 0), vs = ctl.col(r, 1);
        const as = xs.map((x, i) => f([x, vs[i]], i * DT)[1]), us = xs.map((_, i) => w ? xiF(i * DT) : fIn(i * DT));
        const mx = Math.max(.2, ...xs.map(Math.abs), ...(w ? us.map(Math.abs) : [0]));
        const bm = Math.max(.5, ...xs.map((x, i) => Math.max(Math.abs(M * as[i]), Math.abs(C * vs[i]), Math.abs(K * x), Math.abs(w ? K * (us[i] - x) : us[i]))));
        sim = { xs, vs, as, us, mx, bm };
      };
      const draw = t => {
        const w = mode === "wall", x = ctl.at(sim.xs, DT, t), v = ctl.at(sim.vs, DT, t), a = ctl.at(sim.as, DT, t), u = ctl.at(sim.us, DT, t);
        const sc = (w ? 55 : 95) / sim.mx, base = 150, L = base + x * sc, ax = w ? 62 + u * sc : 14, cw = 64, cy = 60, ch = 44;
        let s = `<line x1="0" y1="${cy + ch + 12}" x2="340" y2="${cy + ch + 12}" stroke="var(--muted)" stroke-width="1.4"/>`;
        if (w) s += `<rect x="${(ax - 8).toFixed(1)}" y="${cy - 4}" width="8" height="${ch + 8}" rx="2" fill="var(--info)"/><text x="${(ax - 4).toFixed(1)}" y="${cy - 10}" text-anchor="middle" class="svg-t" style="font-size:10.5px;font-weight:700" fill="var(--info)">入力 xᵢ</text>`;
        else s += `<rect x="0" y="${cy - 8}" width="9" height="${ch + 24}" fill="var(--sunken)" stroke="var(--muted)"/>`;
        const sx = Math.max(ax + 4, ax), ex = Math.max(sx + 14, L);
        s += ctl.spring(sx, ex, cy + 8, 6, 6, "var(--info)") + ctl.damper(sx, ex, cy + ch - 8, "var(--ok)");
        s += `<rect x="${L.toFixed(1)}" y="${cy}" width="${cw}" height="${ch}" rx="4" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/><text x="${(L + cw / 2).toFixed(1)}" y="${cy + ch / 2 + 5}" text-anchor="middle" class="svg-t" style="font-size:14px;font-weight:700">M</text>`;
        s += `<circle cx="${(L + 14).toFixed(1)}" cy="${cy + ch + 6}" r="5.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.6"/><circle cx="${(L + cw - 14).toFixed(1)}" cy="${cy + ch + 6}" r="5.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.6"/>`;
        s += `<line x1="${base}" y1="${cy + ch + 16}" x2="${base}" y2="${cy + ch + 36}" stroke="var(--muted)" stroke-dasharray="3 2"/><text x="${base}" y="${cy + ch + 47}" text-anchor="middle" class="svg-m" style="font-size:9.5px">x ＝ 0</text>`;
        s += `<line x1="${L.toFixed(1)}" y1="${cy + ch + 30}" x2="${base}" y2="${cy + ch + 30}" stroke="var(--packet)" stroke-width="1.5"/><text x="${((L + base) / 2).toFixed(1)}" y="${cy + ch + 27}" text-anchor="middle" class="svg-t" style="font-size:10.5px;font-weight:700" fill="var(--packet)">x ＝ ${ctl.n(x, 2)}</text>`;
        if (!w) { s += ctl.arrow(L + cw + 3, cy + ch / 2, A ? u / A * 60 : 0, "var(--attack)", 4); s += `<text x="${(L + cw + 6).toFixed(1)}" y="${cy + ch / 2 - 10}" class="svg-t" style="font-size:10.5px;font-weight:700" fill="var(--attack)">f ＝ ${ctl.n(u, 1)}</text>`; }
        {
          const k = 50 / sim.bm, ay = [cy - 16, cy - 32], fs = w ? [["ばね K(xᵢ−x)", K * (u - x), "var(--info)"], ["ダンパ C(vᵢ−v)", C * (ctl.at(sim.us.map((_, i) => viF(i * DT)), DT, t) - v), "var(--ok)"]] : [["ばね −K x", -K * x, "var(--info)"], ["ダンパ −C v", -C * v, "var(--ok)"]];
          fs.forEach(([lab, F, col], i) => {
            const y = ay[i], d = F * k;
            s += ctl.arrow(L + cw / 2, y, d, col, 4) + `<circle cx="${(L + cw / 2).toFixed(1)}" cy="${y}" r="2.5" fill="${col}"/><text x="6" y="${y + 3}" text-anchor="start" class="svg-m" style="font-size:9.5px" fill="${col}">${lab} = ${ctl.n(F, 1)}</text>`;
          });
        }
        scene.innerHTML = s;
        const Ma = M * a, Cv = C * v, Kx = w ? K * (u - x) : K * x, bw = 190, bx = 70, k = bw / 2 / sim.bm;
        if (w) {
          const Kk = K * (u - x), Cc = C * (ctl.at(sim.us.map((_, i) => viF(i * DT)), DT, t) - v);
          bars.innerHTML = ctl.bar(bx, 8, bw, Kk, k, "var(--info)", "ばねの力", ctl.n(Kk, 2)) + ctl.bar(bx, 32, bw, Cc, k, "var(--ok)", "ダンパの力", ctl.n(Cc, 2)) + ctl.bar(bx, 62, bw, Ma, k, "var(--packet)", "M·a", ctl.n(Ma, 2));
          eq.innerHTML = ST.am(`M a ＝ K(xᵢ − x) ＋ C(vᵢ − v)<br>${ctl.n(Ma, 2)} ＝ ${ctl.n(Kk, 2)} ＋ ${ctl.n(Cc, 2)}`);
        } else {
          bars.innerHTML = ctl.bar(bx, 4, bw, Ma, k, "var(--packet)", "慣性 M·a", ctl.n(Ma, 2)) + ctl.bar(bx, 24, bw, Cv, k, "var(--ok)", "粘性 C·v", ctl.n(Cv, 2)) + ctl.bar(bx, 44, bw, Kx, k, "var(--info)", "ばね K·x", ctl.n(Kx, 2)) + ctl.bar(bx, 70, bw, u, k, "var(--attack)", "入力 f", ctl.n(u, 2));
          eq.innerHTML = ST.am(`M a ＋ C v ＋ K x ＝ f<br>${ctl.n(Ma, 2)} ＋ ${ctl.n(Cv, 2)} ＋ ${ctl.n(Kx, 2)} ＝ ${ctl.n(Ma + Cv + Kx, 2)}(f ＝ ${ctl.n(u, 2)})`);
        }
      };
      const note = () => {
        const z = C / (2 * Math.sqrt(M * K)), wn = Math.sqrt(K / M);
        cap.innerHTML = ST.am(mode === "wall" ? "左端を動かすと、ばねとダンパが台車を引きます。台車が受ける力は、左端と台車の「差」(相対変位・相対速度)で決まります。" : "矢印は台車が受けている力です。ばね −K x は変位と逆向き、ダンパ −C dx/dt は速度と逆向き、外力 f は加えた向きです。この合計が M d²x/dt² です。");
      };
      const redo = () => { run(); note(); ply.setT(T); ply.restart(); ST.markLab("msd"); };
      ply = ctl.player($("[data-ply]"), { T, draw: t => sim && draw(t) });
      run(); note(); ply.restart();
      ST.wireSeg(el, "mode", v => { mode = v; redo(); });
      ST.wireSeg(el, "inp", v => { inp = v; redo(); });
      ctl.wireSliders(el, (id, v) => { if (id === "A") A = v; else if (id === "M") M = v; else if (id === "C") C = v; else K = v; redo(); });
      return () => ply.stop();
    }
  });
})(window.ST);
