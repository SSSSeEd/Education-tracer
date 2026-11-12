"use strict";
/* Lab for 制御とフィードバック (第1回 1-1): a static plant y = P u whose real P differs from the designed P = 4.
   Without feedback (feedforward) the output misses the target; with feedback u = K(r − y) the error shrinks by the factor (1 − P K) each step. */
(function (ST) {
  const ctl = ST.ctl, R = 20;
  ST.widget("fbk", {
    title: "フィードバック制御:目標値 20 に近づけるか",
    group: "ctl", name: "フィードバック制御", desc: "プラントが設計とずれても、フィードバックで目標値に近づくか", order: 1, tag: "制御",
    formula: "$u = K (r - y)$　　出力は y ← $y + P u$",
    says: "出力 y を目標値 r と比べ、ずれ $e = r - y$ に比例した入力 u を作って、ずれを小さくしていく制御です。ずれは1回ごとに $(1 - P K)$ 倍になります。",
    meaning: "設計では $P=4$ としたので $K=\\frac{1}{4}$。でも本当のプラントは $P=5$ かもしれません。フィードバックなしだと 25 のままずれますが、ありなら、ずれを見て直していくので 20 に近づきます。P をもっと大きくして $|1 - P K|$ が 1 を超えると、逆に振れが大きくなって発散します。",
    mount(el) {
      let P = 5, K = .25, fb = true;
      el.innerHTML = `<div><p class="lab-label">制御の方式</p>${ST.segHtml("mode", [["fb", "フィードバックあり"], ["ff", "なし(フィードフォワード)"]], "fb")}</div>
        ${ctl.sliders([{ id: "P", label: "本当のプラントの値 P", min: 1, max: 10, step: .5, v: P }, { id: "K", label: "制御ゲイン K(設計は 1/4 ＝ 0.25)", min: .05, max: .5, step: .01, v: K }])}
        <div class="stage" data-plot style="padding:6px"></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>
        <div class="hexbox" data-tab></div>`;
      const plot = el.querySelector("[data-plot]"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]"), tab = el.querySelector("[data-tab]");
      const draw = () => {
        const N = 10, ys = [0], rows = [];
        for (let t = 1; t <= N; t++) {
          if (fb) { const y0 = ys[t - 1], e = R - y0, u = K * e, d = P * u; ys.push(y0 + d); rows.push({ t, e, u, d, y: y0 + d }); }
          else { const u = K * R, y = P * u; ys.push(y); rows.push({ t, e: R - ys[t - 1], u, d: y - ys[t - 1], y }); }
        }
        plot.innerHTML = ctl.plot({ H: 150, x0: 0, x1: N, series: [{ x: ys.map((_, i) => i), y: ys, color: fb ? "var(--info)" : "var(--packet)", marks: true, label: "出力 y" }], hlines: [{ y: R, label: "目標 r ＝ 20", color: "var(--ok)" }], xlabel: "回 t", aria: "出力 y の変化" });
        const last = ys[N], rho = Math.abs(1 - P * K), ok = Math.abs(last - R) < .5;
        if (fb) {
          big.innerHTML = ST.am(`<b>${ok ? "収束" : rho > 1 ? "発散" : "まだ近づいている"}</b><span>ずれは毎回 ${ctl.n(1 - P * K, 3)} 倍(|1 − P K| ＝ ${ctl.n(rho, 3)})</span>`);
          cap.innerHTML = rho < 1 ? "|1 − P K| が 1 より小さいので、ずれがだんだん小さくなり、y は 20 に近づきます。P が設計値からずれても、ずれを見て直すので目標に届きます。" : "|1 − P K| が 1 より大きいので、ずれが毎回大きくなって、y は目標のまわりを大きく振れながら離れていきます(発散)。ゲイン K が大きすぎるか、P が大きすぎます。K を小さくすると収まります。";
        } else {
          big.innerHTML = ST.am(`<b>y ＝ ${ctl.n(P * K * R, 2)}</b><span>目標 ${R} との差 ${ctl.n(P * K * R - R, 2)}</span>`);
          cap.innerHTML = ST.am("フィードバックがないと、u ＝ K r ＝ 5 を入れ続けるだけです。本当の P が 4 でなければ、y ＝ P·u は目標からずれたままで、自分では直せません。");
        }
        tab.innerHTML = "t　　e　　　u　　　Δy　　 y<br>" + rows.slice(0, 5).map(r => [r.t, ctl.n(r.e, 3), ctl.n(r.u, 3), ctl.n(r.d, 3), ctl.n(r.y, 3)].map((s, i) => String(s).padEnd(i ? 8 : 3, " ")).join("")).join("<br>");
      };
      ST.wireSeg(el, "mode", v => { fb = v === "fb"; draw(); ST.markLab("fbk"); });
      ctl.wireSliders(el, (id, v) => { if (id === "P") P = v; else K = v; draw(); ST.markLab("fbk"); });
      draw();
    }
  });
})(window.ST);
