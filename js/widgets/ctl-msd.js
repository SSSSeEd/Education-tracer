"use strict";
/* Lab for 機械系モデル (第1回 2-1): 質量・ばね・ダンパ。時間の動きは出さず、「いま台車にどの力が、どの向きに働くか」だけを見せる。
   壁は左、台車は右。外力 f は台車を壁に向かって(左向きに)押す。壁に近づく向きを x の正(＋)とする。
   ばね −K x、ダンパ −C v は、外力と逆向き(壁から離れる右向き)。M a ＝ f − K x − C v。 */
(function (ST) {
  const ctl = ST.ctl, clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  ST.widget("msd", {
    title: "質量・ばね・ダンパ:力の向きと、運動方程式",
    group: "ctl", name: "質量・ばね・ダンパ", desc: "壁に向かって台車を押すとき、ばね・ダンパの力がどの向きに働くか。矢印から運動方程式を立てる", order: 2, tag: "運動方程式",
    formula: "$M \\frac{d^{2}x}{dt^{2}} + C \\frac{dx}{dt} + K x = f$",
    says: "壁に近づく向きを x の正とします。外力 f は台車を壁へ押します(＋)。ばねは変位に比例して元に戻そうとするので −K x、ダンパは動きを妨げるので速度と逆向きの −C dx/dt、どちらも外力と逆向きです。力の合計が質量×加速度です。",
    meaning: "式を立てるときは、①正の向きを決める ②台車にかかる力を矢印で1本ずつ書く(向きと符号をセットで) ③合計 = 質量×加速度、の順です。「変位・速度・加速度」を動かして、矢印の向きと長さが、符号と一緒に変わるのを確かめてください。",
    mount(el) {
      let M = 2, C = 2, K = 8, x = .6, v = 0, a = 0;
      el.innerHTML = `<div class="stage" style="padding:4px"><svg viewBox="0 0 340 200" style="width:100%;display:block" role="img" aria-label="壁・ばね・ダンパ・台車と、働く力の矢印" data-scene></svg></div>
        ${ctl.sliders([{ id: "x", label: "変位 x(壁に近づく向きが ＋)", min: -1, max: 1, step: .1, v: x, unit: "m" }, { id: "v", label: "速度 v = dx/dt(壁に向かう向きが ＋)", min: -2, max: 2, step: .5, v: v, unit: "m/s" }, { id: "a", label: "加速度 a(壁に向かう向きが ＋)", min: -2, max: 2, step: .5, v: a, unit: "m/s²" }, { id: "M", label: "質量 M", min: .5, max: 5, step: .5, v: M, unit: "kg" }, { id: "C", label: "ダンパ C", min: 0, max: 5, step: .5, v: C }, { id: "K", label: "ばね K", min: 1, max: 12, step: 1, v: K }])}
        <div class="hexbox" data-eq style="font-size:14px;line-height:1.9"></div>
        <p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), scene = $("[data-scene]"), eq = $("[data-eq]"), cap = $("[data-cap]");
      const draw = () => {
        const Fk = -K * x, Fc = -C * v, f = M * a + C * v + K * x;   /* 壁に向かう向きを正とした力 */
        const base = 170, sc = 55, L = base - x * sc, cw = 64, cy = 90, ch = 44, edge = L + cw;
        const len = F => clamp(F * 4, -48, 48), dx = F => -len(F);    /* 画面では、壁向き(＋)が左 */
        let s = `<line x1="0" y1="${cy + ch + 12}" x2="340" y2="${cy + ch + 12}" stroke="var(--muted)" stroke-width="1.4"/>`;
        s += `<rect x="0" y="${cy - 8}" width="9" height="${ch + 24}" fill="var(--sunken)" stroke="var(--muted)"/><text x="14" y="${cy + ch + 28}" class="svg-m" style="font-size:10px" fill="currentColor">壁</text>`;
        s += ctl.spring(9, L, cy + 8, 6, 6, "var(--info)") + ctl.damper(9, L, cy + ch - 8, "var(--ok)");
        s += `<rect x="${L.toFixed(1)}" y="${cy}" width="${cw}" height="${ch}" rx="4" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/><text x="${(L + cw / 2).toFixed(1)}" y="${cy + ch / 2 + 5}" text-anchor="middle" class="svg-t" style="font-size:15px;font-weight:700" fill="currentColor">M</text>`;
        s += `<circle cx="${(L + 14).toFixed(1)}" cy="${cy + ch + 6}" r="5.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.6"/><circle cx="${(L + cw - 14).toFixed(1)}" cy="${cy + ch + 6}" r="5.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.6"/>`;
        s += `<line x1="${base}" y1="${cy + ch + 16}" x2="${base}" y2="${cy + ch + 36}" stroke="var(--muted)" stroke-dasharray="3 2"/><text x="${base}" y="${cy + ch + 48}" text-anchor="middle" class="svg-m" style="font-size:10px" fill="currentColor">x = 0</text>`;
        /* 正の向き */
        s += ctl.arrow(330, 14, -50, "var(--muted)", 2.5) + `<text x="326" y="30" text-anchor="end" class="svg-m" style="font-size:10px" fill="currentColor">x の正(壁へ)</text>`;
        /* 外力 f(台車の右側。＋ならカベ向き=左向き) */
        const fd = dx(f), tail = fd < 0 ? edge + 3 - fd : edge + 3;
        s += ctl.arrow(tail, cy + ch / 2, fd, "var(--attack)", 4) + `<text x="${(edge + 6).toFixed(1)}" y="${cy + ch / 2 - 12}" class="svg-t" style="font-size:11px" fill="var(--attack)">外力 f</text>`;
        /* ばね・ダンパの力(台車の上に、中心から) */
        [["ばねの力 −K x", Fk, "var(--info)", 64], ["ダンパの力 −C v", Fc, "var(--ok)", 44]].forEach(([lab, F, col, y]) => {
          s += ctl.arrow(L + cw / 2, y, dx(F), col, 4) + `<circle cx="${(L + cw / 2).toFixed(1)}" cy="${y}" r="2.5" fill="${col}"/><text x="6" y="${y + 4}" class="svg-m" style="font-size:10px" fill="${col}">${lab}</text>`;
        });
        scene.innerHTML = s;
        const n = ctl.n;
        eq.innerHTML = ST.tex(String.raw`\text{質量×加速度}:\; M a = ${n(M * a, 2)}`, false) + "<br>" +
          ST.tex(String.raw`M a = f - K x - C v \;\Rightarrow\; ${n(M * a, 2)} = ${n(f, 2)} - (${n(K * x, 2)}) - (${n(C * v, 2)})`, false) + "<br>" +
          ST.tex(String.raw`M \frac{d^{2}x}{dt^{2}} + C \frac{dx}{dt} + K x = f \;\Rightarrow\; f = ${n(f, 2)}`, false);
      };
      const note = () => { cap.innerHTML = ST.md("外力 $f$ が壁へ向かう(＋)とき、ばね・ダンパの力は、壁から離れる向き(−)に働きます。矢印は、向いている向きがそのまま力の向きです。変位 $x$ が ＋ のとき、ばねの力は −、速度 $v$ が ＋ のとき、ダンパの力は −、という符号の対応を確かめます。"); };
      draw(); note();
      ctl.wireSliders(el, (id, val) => { ({ x: () => x = val, v: () => v = val, a: () => a = val, M: () => M = val, C: () => C = val, K: () => K = val })[id](); draw(); ST.markLab("msd"); });
    }
  });
})(window.ST);
