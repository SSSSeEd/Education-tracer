"use strict";
/* Complex derivative lab: the difference quotient Q = (f(a+h) − f(a)) / h for h = ε·e^{iθ}, with the direction θ going once around.
   If f is complex-differentiable at a, the curve shrinks to a single point (f'(a)) as ε → 0. If not, it stays a loop. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 4);
  const FN = {
    sq: { name: "z²", f: z => cx.mul(z, z), d: a => cx.mul([2, 0], a), at: () => true, note: "どの a でも、Q は 2a＋h になります。h を小さくすると、どの方向でも 2a に集まります。" },
    exp: { name: "eᶻ", f: z => cx.exp(z), d: a => cx.exp(a), at: () => true, note: "eᶻ は f′ ＝ eᶻ。h を小さくすると、輪は点 eᵃ に縮みます。" },
    conj: { name: "z̄", f: z => cx.conj(z), d: () => null, at: () => false, note: "Q ＝ h̄/h ＝ e^(−2iθ) なので、ε をどれだけ小さくしても、半径1の円をぐるぐる回ったままです。どの a でも微分できません。" },
    abs2: { name: "|z|²", f: z => [z[0] * z[0] + z[1] * z[1], 0], d: a => (a[0] === 0 && a[1] === 0) ? [0, 0] : null, at: a => a[0] === 0 && a[1] === 0, note: "|z|² は a＝0 のときだけ Q ＝ h̄ が 0 に縮みます。a≠0 では、小さな円(中心 ā、半径 |a|)のままで、1点に集まりません。" },
    re: { name: "Re z", f: z => [z[0], 0], d: () => null, at: () => false, note: "Re z ＝ x です。Q ＝ (1＋e^(−2iθ))/2 は、h→0 でも半径 ½ の円のままです。実部だけを取る関数は微分できません。" }
  };
  const APTS = { "0": [0, 0], "1": [1, 0], "1+i": [1, 1] };

  ST.widget("cdir", {
    title: "複素微分:どの向きから近づいても、同じ値に集まるか",
    group: "cx", name: "微分は向きによらない", desc: "差分商を h の向きごとに描く。1点に縮めば複素微分可能", order: 6,
    tag: "複素微分",
    formula: "f′(a) ＝ lim (f(a＋h)−f(a))/h",
    says: "複素数の h は、平面のあらゆる向きから 0 に近づけます。そのどの向きでも、差分商が同じ値に近づくとき、f は a で複素微分可能です。",
    meaning: "差分商 Q を h の向き θ(0〜360°)ごとに描くと輪になります。ε(h の長さ)を小さくしたとき、輪が1点に縮めば微分可能、縮まなければ微分できません。実数の微分(右からと左からの2方向)より条件がずっと強い、ということです。",
    mount(el) {
      let key = "sq", ak = "1+i", v = 0, th = 40, alive = true, busy = false;
      el.innerHTML = `<div><p class="lab-label">関数 f(z)</p>${ST.segHtml("fn", Object.entries(FN).map(([k, x]) => [k, x.name]), key)}</div>
        <div><p class="lab-label">点 a</p>${ST.segHtml("a", Object.keys(APTS).map(k => [k, k === "0" ? "0" : k === "1" ? "1" : "1＋i"]), ak)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="差分商の輪"></svg></div>
        <div><p class="lab-label">h の長さ ε を小さくする(スライダー)</p><input type="range" min="0" max="100" value="0" class="input" data-e aria-label="h の長さ" style="padding:0"></div>
        <div><p class="lab-label">いま調べる向き θ</p><input type="range" min="0" max="360" value="40" class="input" data-th aria-label="h の向き" style="padding:0"></div>
        <button type="button" class="btn primary big" data-play>▶ ε を 1 から 0.01 まで縮める</button>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]"), se = el.querySelector("[data-e]"), st = el.querySelector("[data-th]"), play = el.querySelector("[data-play]");
      const eps = () => Math.pow(10, -2 * v / 100);
      const Q = (a, e, t) => { const h = cx.polar(e, t); return cx.div(cx.sub(FN[key].f(cx.add(a, h)), FN[key].f(a)), h); };
      const render = () => {
        const fn = FN[key], a = APTS[ak], e = eps(), N = 120; let s = cx.grid(g), d = "", mn = [1e9, 1e9], mx = [-1e9, -1e9];
        for (let i = 0; i <= N; i++) { const q = Q(a, e, 2 * Math.PI * i / N); d += (i ? "L" : "M") + g.P(q); mn = [Math.min(mn[0], q[0]), Math.min(mn[1], q[1])]; mx = [Math.max(mx[0], q[0]), Math.max(mx[1], q[1])]; }
        const spread = Math.hypot(mx[0] - mn[0], mx[1] - mn[1]);
        s += `<path d="${d}Z" fill="var(--info-soft)" fill-opacity=".5" stroke="var(--info)" stroke-width="2.2"/>`;
        const dv = fn.d(a); if (dv && fn.at(a)) s += cx.dot(g, dv, "var(--ok)", "f′(a)", { r: 5, dy: -10 });
        const q = Q(a, e, th * Math.PI / 180); s += cx.arrow(g, [0, 0], q, "var(--packet)", 1.6, "4 3") + cx.dot(g, q, "var(--packet)", "Q", { r: 6 });
        svg.innerHTML = s;
        const tiny = spread < .06 * Math.max(1, cx.abs(Q(a, e, 0)));
        big.innerHTML = `<b>${tiny ? "1点に集まった" : "輪のまま"}</b><span>ε ＝ ${cx.num(e, 3)}　輪の広がり ${cx.num(spread, 3)}　<span class="cap" style="font-size:15px">Q(θ＝${th}°) ＝ ${cx.fmt(q)}</span></span>`;
        cap.innerHTML = `${fn.note}<br>${fn.at(a) ? `この a では複素微分可能で、f′(${cx.fmt(a)}) ＝ <b>${cx.fmt(dv)}</b>。` : "この a では、輪がどこまで縮めても1点に集まらないので、複素微分できません。"}${e > .5 ? " ε を小さくして(スライダー)、輪の変化を見てください。" : ""}`;
      };
      se.oninput = () => { if (busy) return; v = +se.value; render(); ST.markLab("cdir"); };
      st.oninput = () => { th = +st.value; render(); };
      ST.wireSeg(el, "fn", x => { if (busy) return; key = x; render(); });
      ST.wireSeg(el, "a", x => { if (busy) return; ak = x; render(); });
      play.onclick = async () => {
        if (busy) return; busy = true; play.disabled = true;
        const k = ST.motionScale(), n = k ? Math.round(50 * Math.min(k, 2.4)) : 1;
        for (let i = 0; i <= n && alive; i++) { v = 100 * i / n; se.value = v; render(); if (k) await ST.sleep(45); }
        busy = false; play.disabled = false; if (alive) ST.markLab("cdir");
      };
      render();
      return () => { alive = false; };
    }
  });
})(window.ST);
