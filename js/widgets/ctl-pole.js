"use strict";
/* Lab for ラプラス変換と極 (第3回 ラプラス変換, 第4回 逆ラプラス変換, 第6回 2次遅れ): drag a pole on the s-plane and see the time function.
   One pole σ on the real axis ↔ e^{σt}  (L[e^{at}] = 1/(s−a));  a pair σ ± jω ↔ e^{σt} cos ωt  ((s−σ)/((s−σ)²+ω²)). Needs ST.cx (_cx.js). */
(function (ST) {
  const cx = ST.cx, ctl = ST.ctl, W = 340, H = 200, g = cx.geom(W, H, 3), T = 8, DT = .02;
  ST.widget("pole", {
    title: "s平面の極と、時間の波形",
    group: "ctl", name: "極の位置と応答", desc: "s平面で極をドラッグすると、時間 t の波形(収束・発散・振動)がその場で変わる", order: 7, tag: "ラプラス変換",
    formula: "L[eᵃᵗ] ＝ 1/(s − a)　　L[sin ωt] ＝ ω/(s² ＋ ω²)",
    says: "ラプラス変換は、時間 t の関数を s の関数に写します。分母が 0 になる s(極)の位置で、元の時間関数の形が決まります。極が左にあれば収束、右にあれば発散、虚軸の上なら振動が続きます。",
    meaning: "変換そのものは計算ですが、結果は「極の位置を見れば応答の形が分かる」ことが大事です。実軸の極 a は eᵃᵗ(a が負なら減っていく)。複素数の極 σ ± jω は、eˢᵗ·cos ωt(減りながら振動)。a や σ の大きさが速さ、ω が振動の細かさです。",
    mount(el) {
      let p = [-1, 1];
      el.innerHTML = `<div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="s平面の極" data-plane></svg></div>
        <p class="cap" style="margin:0">青い点(極)をドラッグします。縦(虚部)を 0 にすると実軸上の1つの極になります。</p>
        <div class="hexbox" data-tab style="font-size:13.5px"></div>
        <div class="stage" data-pt style="padding:6px"></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const sv = el.querySelector("[data-plane]"), tab = el.querySelector("[data-tab]"), pt = el.querySelector("[data-pt]"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]");
      const render = () => {
        const sg = p[0], w = Math.abs(p[1]), real = w < 1e-9;
        let s = `<rect x="${g.X(0)}" y="0" width="${W - g.X(0)}" height="${H}" fill="var(--attack-soft)" opacity=".55"/><rect x="0" y="0" width="${g.X(0)}" height="${H}" fill="var(--ok-soft)" opacity=".55"/>` + cx.grid(g);
        s += `<text x="8" y="${H - 8}" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--ok)">左側:収束</text><text x="${W - 8}" y="${H - 8}" text-anchor="end" class="svg-t" style="font-size:11px;font-weight:700" fill="var(--attack)">右側:発散</text>`;
        if (!real) { s += cx.dot(g, [sg, -w], "var(--info)", "", { r: 5 }); s += cx.dot(g, [sg, w], "var(--info)", "", { r: 6 }) + cx.handle(g, [sg, w], "var(--info)"); s += `<text x="${(g.X(sg) + 10).toFixed(1)}" y="${(g.Y(w) - 8).toFixed(1)}" class="svg-t" style="font-size:12px;font-weight:700" fill="var(--info)">× σ＋jω</text>`; }
        else s += cx.dot(g, [sg, 0], "var(--info)", "", { r: 6 }) + cx.handle(g, [sg, 0], "var(--info)") + `<text x="${(g.X(sg) + 10).toFixed(1)}" y="${(g.Y(0) - 12).toFixed(1)}" class="svg-t" style="font-size:12px;font-weight:700" fill="var(--info)">× a</text>`;
        sv.innerHTML = s;
        const f = real ? t => Math.exp(sg * t) : t => Math.exp(sg * t) * Math.cos(w * t), Te = sg > 1e-9 ? Math.max(.4, Math.min(T, Math.log(12) / sg)) : T, ts = Array.from({ length: Math.round(Te / DT) + 1 }, (_, i) => i * DT), ys = ts.map(f);
        const env = real ? [] : [{ x: ts, y: ts.map(t => Math.exp(sg * t)), color: "var(--muted)", dash: "4 3", w: 1.2 }, { x: ts, y: ts.map(t => -Math.exp(sg * t)), color: "var(--muted)", dash: "4 3", w: 1.2 }];
        pt.innerHTML = ctl.plot({ H: 150, x0: 0, x1: Te, ymin: real ? 0 : undefined, series: env.concat([{ x: ts, y: ys, color: "var(--packet)", label: real ? "f(t) ＝ e^(" + ctl.n(sg, 2) + "t)" : "f(t) ＝ e^(" + ctl.n(sg, 2) + "t)·cos(" + ctl.n(w, 2) + "t)" }]), xlabel: sg > 1e-9 && Te < T ? "時間 t(増え方が大きいので、途中までを表示)" : "時間 t", aria: "時間応答" });
        tab.innerHTML = real ? `F(s) ＝ 1/(s − a)　a ＝ ${ctl.n(sg, 2)}<br>　　　 ＝ 1/(s ${sg < 0 ? "＋ " + ctl.n(-sg, 2) : sg > 0 ? "− " + ctl.n(sg, 2) : ""})<br>f(t) ＝ e^(at) ＝ e^(${ctl.n(sg, 2)}·t)`
          : `F(s) ＝ (s − σ)/((s − σ)² ＋ ω²)　σ ＝ ${ctl.n(sg, 2)}、ω ＝ ${ctl.n(w, 2)}<br>f(t) ＝ e^(σt)·cos(ωt)`;
        big.innerHTML = `<b>${sg < -1e-9 ? "収束(安定)" : sg > 1e-9 ? "発散(不安定)" : real ? "一定のまま" : "振動が続く"}</b><span>${sg < -1e-9 ? "約 " + ctl.n(1 / -sg, 2) + " 秒で 37%(1/e)に減る" : sg > 1e-9 ? "約 " + ctl.n(1 / sg, 2) + " 秒ごとに e 倍(2.7倍)に増える" : real ? "極が原点: 1/s(ステップ関数)" : "振幅が変わらず振動(虚軸上の極)"}</span>`;
        const wn = Math.hypot(sg, w), z = wn ? -sg / wn : 0;
        cap.innerHTML = (real ? "実軸上の1つの極は、指数関数(増える・減る)。左へ動かすほど速く 0 に近づき、右へ動かすほど速く増えます。" : "極の実部 σ が、振動の大きさの増減(包絡線)を決め、虚部 ω が振動の速さを決めます。") + (!real && sg < 0 ? ` 第6回の2次遅れとして見ると、固有角周波数 ωₙ ＝ 極の原点からの距離 ＝ ${ctl.n(wn, 2)}、減衰係数 ζ ＝ −σ/ωₙ ＝ ${ctl.n(z, 2)}。` : "");
      };
      cx.drag(sv, g, { snap: () => .25, handles: () => [{ id: "p", z: [p[0], Math.abs(p[1]) < 1e-9 ? 0 : Math.abs(p[1])] }], tap: "p", move: (id, z) => { p = [z[0], Math.abs(z[1])]; render(); ST.markLab("pole"); } });
      render();
    }
  });
})(window.ST);
