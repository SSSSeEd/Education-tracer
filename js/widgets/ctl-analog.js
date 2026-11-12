"use strict";
/* Lab for 4つのモデルの対応 (第3回 アナロジー・第1回 機械系・第2回 電気系・回転系・水位系): 同じ形の式 m x″ ＋ c x′ ＋ k x ＝ u で、
   機械系(質量・ばね・ダンパ)、電気系(RLC直列)、回転系、水位系(U字管・発展)を同じ応答で見せ、対応表の行を順に光らせる。
   質量相当 ＝ 2、ばね相当 ＝ 8 にそろえてあり、ωₙ ＝ 2 rad/s。減衰 c ＝ 2ζ√(mk) ＝ 8ζ。 */
(function (ST) {
  const ctl = ST.ctl, n = ctl.n, T = 10, DT = .005, T0 = .5, M = 2, K = 8;
  const MODELS = [
    { id: "mech", name: "機械系", eq: "M x″ ＋ C x′ ＋ K x ＝ f", col: ["力 f", "変位 x", "質量 M", "ダンパ C", "ばね K"], unit: "m" },
    { id: "elec", name: "電気系", eq: "L q″ ＋ R q′ ＋ (1/C) q ＝ e", col: ["電圧 e", "電荷 q", "コイル L", "抵抗 R", "コンデンサ 1/C"], unit: "C(クーロン)" },
    { id: "rot", name: "回転系", eq: "J θ″ ＋ B θ′ ＋ K θ ＝ τ", col: ["トルク τ", "角度 θ", "慣性 J", "粘性 B", "ねじりばね K"], unit: "rad" },
    { id: "water", name: "水位系(発展)", eq: "ρAL x″ ＋ r x′ ＋ 2ρgA x ＝ ΔP·A", col: ["圧力差 ΔP", "水位 x", "水の質量 ρAL", "管の抵抗 r", "重力 2ρgA"], unit: "m" }
  ];
  const ROLES = [["入力", "var(--attack)"], ["出力", "var(--ink)"], ["慣性(動きにくさ)", "var(--packet)"], ["摩擦(エネルギーを逃がす)", "var(--ok)"], ["復元(ためて戻す)", "var(--info)"]];
  const sym = (kind, x, y, v, lab) => ctl.sym(kind, x, y, v, lab);

  /* 各シーンは 340×196 の箱。xn: 出力(0〜1)、un: 入力(0か1)。big: 文字を出すか。 */
  const SCENE = {
    mech(xn, un, big) {
      const L = 100 + xn * 120, cy = 62;
      let s = `<line x1="0" y1="156" x2="340" y2="156" stroke="var(--muted)" stroke-width="1.4"/><rect x="0" y="44" width="9" height="112" fill="var(--sunken)" stroke="var(--muted)"/>`;
      s += ctl.spring(9, L, cy + 12, 6, 7, "var(--info)") + ctl.damper(9, L, cy + 40, "var(--ok)");
      s += `<rect x="${L.toFixed(1)}" y="${cy}" width="64" height="52" rx="4" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/><circle cx="${(L + 14).toFixed(1)}" cy="${cy + 58}" r="5.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.6"/><circle cx="${(L + 50).toFixed(1)}" cy="${cy + 58}" r="5.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.6"/>`;
      s += ctl.arrow(L + 68, cy + 26, 36 * un, "var(--attack)", 4);
      if (big) s += `<text x="${(L + 32).toFixed(1)}" y="${cy + 31}" text-anchor="middle" class="svg-t" style="font-size:14px;font-weight:700">M</text><text x="${(L + 70).toFixed(1)}" y="${cy + 10}" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--attack)">${un ? "力 f" : ""}</text><text x="40" y="${cy - 2}" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--info)">ばね K</text><text x="40" y="${cy + 70}" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--ok)">ダンパ C</text>`;
      return s;
    },
    elec(xn, un, big) {
      const x0 = 50, x1 = 290, y0 = 44, y1 = 148, ym = 96, xm = 170;
      let s = ctl.wire([[x0, y0], [xm - 20, y0]]) + ctl.wire([[xm + 20, y0], [x1, y0]]) + ctl.wire([[x1, y0], [x1, ym - 6]]) + ctl.wire([[x1, ym + 6], [x1, y1]]) + ctl.wire([[x1, y1], [xm + 17, y1]]) + ctl.wire([[xm - 17, y1], [x0, y1]]) + ctl.wire([[x0, y1], [x0, ym + 13]]) + ctl.wire([[x0, ym - 13], [x0, y0]]);
      s += ctl.flow([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], xn * 7, "var(--packet)", 18);
      s += sym("V", x0, ym, true, big ? (un ? "電圧 e" : "") : "") + sym("L", xm, y0, false, big ? "L" : "") + sym("C", x1, ym, true, big ? "C" : "") + sym("R", xm, y1, false, big ? "R" : "");
      s += `<rect x="304" y="${(150 - 56).toFixed(1)}" width="10" height="56" rx="2" fill="var(--sunken)"/><rect x="304" y="${(150 - 56 * xn).toFixed(1)}" width="10" height="${(56 * xn).toFixed(1)}" rx="2" fill="var(--info)"/>`;
      if (big) s += `<text x="309" y="168" text-anchor="middle" class="svg-t" style="font-size:10.5px;font-weight:700" fill="var(--info)">電荷 q</text><text x="170" y="186" text-anchor="middle" class="svg-m" style="font-size:9.5px">電流 i ＝ dq/dt(点の速さ)</text>`;
      return s;
    },
    rot(xn, un, big) {
      const cx = 170, cy = 98, r = 46, th = xn * 80 * Math.PI / 180, P = a => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
      let s = `<line x1="${cx}" y1="${cy}" x2="${cx + 90}" y2="${cy}" stroke="var(--muted)" stroke-dasharray="3 3"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/>`;
      for (let k = 0; k < 3; k++) { const a = th + k * 2.0944, q = [cx + (r - 6) * Math.cos(a), cy - (r - 6) * Math.sin(a)]; s += `<line x1="${cx}" y1="${cy}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="var(--muted)" stroke-width="1.4"/>`; }
      const e = P(th), R2 = r + 14, a2 = [cx + R2, cy], b2 = [cx + R2 * Math.cos(th), cy - R2 * Math.sin(th)];
      s += `<line x1="${cx}" y1="${cy}" x2="${e[0].toFixed(1)}" y2="${e[1].toFixed(1)}" stroke="var(--packet)" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="4" fill="var(--ink)"/>`;
      if (th > .02) s += `<path d="M${a2[0]} ${a2[1]}A${R2} ${R2} 0 0 0 ${b2[0].toFixed(1)} ${b2[1].toFixed(1)}" fill="none" stroke="var(--info)" stroke-width="3" stroke-dasharray="1 4" stroke-linecap="round"/>`;
      if (un) { const ta = [cx + 76 * Math.cos(.35), cy - 76 * Math.sin(.35)], tb = [cx + 76 * Math.cos(1.2), cy - 76 * Math.sin(1.2)]; s += `<path d="M${ta[0].toFixed(1)} ${ta[1].toFixed(1)}A76 76 0 0 0 ${tb[0].toFixed(1)} ${tb[1].toFixed(1)}" fill="none" stroke="var(--attack)" stroke-width="4" stroke-linecap="round"/><path d="M${tb[0].toFixed(1)} ${tb[1].toFixed(1)} l7 8 l-14 1z" fill="var(--attack)"/>`; }
      if (big) s += `<text x="${cx - 62}" y="${cy + 70}" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--ok)">粘性 B(軸受)</text><text x="${cx + 52}" y="${cy + 70}" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--info)">ねじりばね K</text><text x="${cx}" y="${cy + 4}" dy="18" text-anchor="middle" class="svg-t" style="font-size:12px;font-weight:700">J</text><text x="${cx + 80}" y="${cy - 80}" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--attack)">${un ? "トルク τ" : ""}</text><text x="${cx + 94}" y="${cy - 4}" class="svg-m" style="font-size:9.5px">θ ＝ 0</text>`;
      return s;
    },
    water(xn, un, big) {
      const base = 96, amp = 38, yl = base + amp * xn, yr = base - amp * xn;
      let s = `<rect x="108" y="30" width="38" height="140" fill="var(--sunken)" stroke="var(--ink)" stroke-width="1.6"/><rect x="194" y="30" width="38" height="140" fill="var(--sunken)" stroke="var(--ink)" stroke-width="1.6"/><rect x="108" y="140" width="124" height="30" fill="var(--sunken)" stroke="var(--ink)" stroke-width="1.6"/><rect x="146" y="141" width="48" height="28" fill="var(--sunken)"/>`;
      s += `<rect x="109" y="${yl.toFixed(1)}" width="36" height="${(169 - yl).toFixed(1)}" fill="var(--info)" opacity=".75"/><rect x="195" y="${yr.toFixed(1)}" width="36" height="${(169 - yr).toFixed(1)}" fill="var(--info)" opacity=".75"/><rect x="146" y="141" width="48" height="28" fill="var(--info)" opacity=".75"/>`;
      s += `<line x1="100" y1="${base}" x2="240" y2="${base}" stroke="var(--muted)" stroke-dasharray="3 3"/>`;
      if (un) s += `<line x1="127" y1="${(yl - 40).toFixed(1)}" x2="127" y2="${(yl - 8).toFixed(1)}" stroke="var(--attack)" stroke-width="4" stroke-linecap="round"/><path d="M127 ${(yl - 3).toFixed(1)} l-6 -9 h12z" fill="var(--attack)"/>`;
      if (big) s += `<text x="127" y="${(yl - 46).toFixed(1)}" text-anchor="middle" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--attack)">${un ? "圧力差 ΔP" : ""}</text><text x="170" y="190" text-anchor="middle" class="svg-m" style="font-size:9.5px">左を押すと左が下がり、右が上がる(U字管)</text><text x="246" y="${base - 4}" class="svg-m" style="font-size:9.5px">x ＝ 0</text><text x="170" y="158" text-anchor="middle" class="svg-t" style="font-size:10.5px;font-weight:700" fill="var(--ok)">管の抵抗 r</text>`;
      return s;
    }
  };

  ST.widget("analog", {
    title: "4つのモデル:同じ形の式、同じ動き",
    group: "ctl", name: "4つのモデルの対応表", desc: "機械・電気・回転・水位が同じ形の式になる様子と、対応表を順に光らせるアニメーション", order: 14, tag: "アナログ",
    formula: "$m \\frac{d^{2}x}{dt^{2}} + c \\frac{dx}{dt} + k x = u \\quad$(質量相当 m、摩擦相当 c、復元相当 k、入力 u、出力 x)",
    says: "どの分野でも、立て方は同じです。①基準(出力にする量)を決める ②動きにくさ(慣性)・摩擦・復元の3つの力を書く ③それらの和が入力、とする。分野が変わるのは、量の名前と単位だけです。",
    meaning: "機械の質量 M ↔ コイル L ↔ 慣性モーメント J ↔ 水の質量、のように1対1で対応します。ζ を変えると、4つの動きがそろって揺れたり揺れなくなったりします。「4つ重ねる」では、4本の曲線が完全に重なります。",
    mount(el) {
      let zeta = .3, mode = "mech", sim = null, ply = null;
      el.innerHTML = `<div><p class="lab-label">どのモデルを見る?</p>${ST.segHtml("mode", [["mech", "機械系"], ["elec", "電気系"], ["rot", "回転系"], ["water", "水位系(発展)"], ["all", "4つ重ねる"]], mode)}</div>
        ${ctl.sliders([{ id: "z", label: "減衰の強さ ζ(0.3 だと揺れる、1 以上で揺れない)", min: .1, max: 1.5, step: .1, v: zeta }])}
        <div class="hexbox" data-eq style="font-size:13px"></div>
        <div data-ply></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 196" style="width:100%;display:block" role="img" aria-label="モデルの動き" data-scene></svg></div>
        <div class="stage" data-pl style="padding:6px"></div>
        <div class="stage" style="padding:6px"><table class="ctl-tab" data-tab style="width:100%;border-collapse:collapse;font-size:11px;text-align:center"></table></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), scene = $("[data-scene]"), pl = $("[data-pl]"), tab = $("[data-tab]"), big = $("[data-big]");
      const run = () => {
        const c = 2 * zeta * Math.sqrt(M * K), f = t => t >= T0 ? 1 : 0, r = ctl.rk4((s, t) => [s[1], (f(t) - c * s[1] - K * s[0]) / M], [0, 0], DT, Math.round(T / DT));
        const xs = ctl.col(r, 0), mx = Math.max(...xs.map(Math.abs), 1e-6); sim = { xs, mx, c };
      };
      const render = (t, row) => {
        const all = mode === "all", x = ctl.at(sim.xs, DT, t) / sim.mx, u = t >= T0 ? 1 : 0;
        if (all) scene.innerHTML = MODELS.map((m, i) => `<g transform="translate(${(i % 2) * 170} ${Math.floor(i / 2) * 98}) scale(.5)">${SCENE[m.id](x, u, false)}</g><text x="${(i % 2) * 170 + 6}" y="${Math.floor(i / 2) * 98 + 12}" class="svg-t" style="font-size:10.5px;font-weight:700" fill="var(--muted)">${m.name}</text>`).join("");
        else scene.innerHTML = SCENE[mode](x, u, true);
        const colors = ["var(--packet)", "var(--info)", "var(--ok)", "var(--attack)"], ser = all
          ? MODELS.map((m, i) => ({ dt: DT, y: sim.xs.map(v => v / sim.mx), color: colors[i], w: 4 - i * .8, dash: i ? "6 3" : "", label: m.name }))
          : [{ dt: DT, y: sim.xs.map(v => v / sim.mx), color: "var(--packet)", label: "出力(最大を 1 とした割合)" }];
        pl.innerHTML = ctl.plot({ H: 110, x0: 0, x1: T, ymin: 0, ymax: 1.15, series: ser, t, upto: t, hlines: [{ y: 1 / K / sim.mx, label: "最終値 u/k", color: "var(--ok)" }], xlabel: "時間 s", aria: "4つのモデルの応答" });
        const hl = all ? row : -1;
        tab.innerHTML = `<tr><th style="padding:3px;text-align:left">役割</th>${MODELS.map((m, i) => `<th style="padding:3px;${(all || m.id === mode) ? "color:var(--packet)" : "color:var(--muted)"}">${m.name}</th>`).join("")}</tr>` +
          ROLES.map((ro, k) => `<tr style="${hl === k ? "background:var(--sunken);outline:2px solid " + ro[1] : ""}"><td style="padding:3px;text-align:left;color:${ro[1]};font-weight:700">${ro[0]}</td>${MODELS.map(m => `<td style="padding:3px;${(all || m.id === mode) ? "" : "opacity:.35"}${hl === k ? ";font-weight:700" : ""}">${m.col[k]}</td>`).join("")}</tr>`).join("");
        big.innerHTML = ST.am(all ? `<b>${hl >= 0 ? ROLES[hl][0] + "の行" : ""}</b><span>${hl >= 0 ? "4つの分野で、同じ役割の量が並びます" : ""}</span>` : `<b>${MODELS.find(m => m.id === mode).name}: ${MODELS.find(m => m.id === mode).eq}</b><span>${n(sim.xs[Math.round(t / DT)] || 0, 3)} ${MODELS.find(m => m.id === mode).unit}(出力の現在値、入力 1)</span>`);
      };
      const draw = t => { if (sim) render(t, mode === "all" ? Math.min(4, Math.floor(t / 2)) : -1); };
      const eq = () => {
        const w = Math.sqrt(K / M);
        $("[data-eq]").innerHTML = ST.am((mode === "all" ? MODELS.map(m => `${m.name}: ${m.eq}`).join("<br>") : MODELS.find(m => m.id === mode).eq) + `<br>どれも m＝${M}、k＝${K}、c＝${n(2 * zeta * Math.sqrt(M * K), 2)} に相当。ωₙ ＝ √(k/m) ＝ ${n(w, 2)} rad/s、ζ ＝ ${n(zeta, 1)}`);
        $("[data-cap]").innerHTML = mode === "water" ? "U字管は、水位系を2次の式で扱う発展のモデルです。授業の1タンク(水位系)は慣性を無視した1次の式で、RC回路と同じ形でした。ρ は水の密度、A は管の断面積、L は水の柱の長さ、g は重力加速度です。" : mode === "all" ? "時間がたつと、表の行が上から順に光ります。同じ役割の量が、どの分野でも同じ位置に並びます。" : "▶ で動かします。時間のスライダーで、途中の様子を見られます。";
      };
      const redo = () => { run(); eq(); ply.restart(); ST.markLab("analog"); };
      ply = ctl.player($("[data-ply]"), { T, draw });
      run(); eq(); ply.restart();
      ST.wireSeg(el, "mode", v => { mode = v; redo(); });
      ctl.wireSliders(el, (id, v) => { zeta = v; redo(); });
      return () => ply.stop();
    }
  });
})(window.ST);
