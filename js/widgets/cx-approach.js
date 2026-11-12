"use strict";
/* "Approach from every direction": h goes to 0 along 8 different rays (left plane); the images Δw = f(a+h) − f(a) are drawn in the right plane.
   For a holomorphic f every image ray is the same ray, rotated and stretched by f′(a), so the quotient Δw/h is the same complex number in every direction.
   For z̄ the picture is mirrored, so the quotient changes with the direction. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 210;
  const A = [1, 1];
  const FN = {
    sq: { name: "z²", f: z => cx.mul(z, z) },
    exp: { name: "eᶻ", f: z => cx.exp(z) },
    cube: { name: "z³", f: z => cx.pow(z, 3) },
    conj: { name: "z̄", f: z => cx.conj(z) }
  };
  const DIR = Array.from({ length: 8 }, (_, i) => i * Math.PI / 4), col = i => `hsl(${i * 45},72%,50%)`;

  ST.widget("capproach", {
    title: "あらゆる方向から近づく:h を8方向から 0 へ、行き先も同じ向きに揃うか",
    group: "cx", name: "あらゆる方向から近づく", desc: "h を8方向から 0 に近づけ、f(a+h)−f(a) の行き先を比べる", order: 6.5,
    tag: "複素微分",
    formula: "(f(a＋h) − f(a)) / h が、h の向きによらず同じ値",
    says: "複素微分は、h を平面のどの向きから 0 に近づけても、差分商が同じ値になることを求めます。8方向の行き先(右)が、同じ向きに揃えば合格です。",
    meaning: "左の h の8本の道が、右では f によって8本の道に移ります。正則な f では、右の道も「全部同じ角度だけ回って、同じ倍率で伸び縮み」した形(＝ f′(a) を掛けた形)になります。z̄ では右の道が裏返ってしまい、向きごとに倍率・角度がばらばらです。",
    mount(el) {
      let key = "sq", v = 100, alive = true, busy = false;
      el.innerHTML = `<div><p class="lab-label">関数 f(z)(点 a ＝ 1＋i)</p>${ST.segHtml("fn", Object.entries(FN).map(([k, x]) => [k, x.name]), key)}</div>
        <p class="cap" style="margin:0">左: h の動き(a のまわり)　右: 行き先 f(a＋h) − f(a)</p>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" data-l role="img" aria-label="h の8方向"></svg></div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" data-r role="img" aria-label="行き先"></svg></div>
        <div><p class="lab-label">h の長さ ε(スライダー)</p><input type="range" min="2" max="100" value="100" class="input" data-e aria-label="h の長さ" style="padding:0"></div>
        <button type="button" class="btn primary big" data-play>▶ 8方向から a に近づける</button>
        <div class="hexbox" data-tab style="font-size:13px"></div><p class="cap" data-cap></p>`;
      const L = el.querySelector("[data-l]"), R = el.querySelector("[data-r]"), tab = el.querySelector("[data-tab]"), cap = el.querySelector("[data-cap]"), se = el.querySelector("[data-e]"), play = el.querySelector("[data-play]");
      const render = () => {
        const f = FN[key].f, e = v / 100, E = 1, fa = f(A);
        const r0 = 1.45;
        const g1 = cx.geom(W, H, r0 * W / H);
        const max = Math.max(...DIR.map(t => cx.abs(cx.sub(f(cx.add(A, cx.polar(E, t))), fa)))) * 1.15;
        const g2 = cx.geom(W, H, max * W / H);
        let s1 = cx.grid(g1, { ticks: false }), s2 = cx.grid(g2, { ticks: false });
        DIR.forEach((t, i) => {
          const tip = cx.polar(e, t), q = cx.sub(f(cx.add(A, tip)), fa);
          s1 += `<line x1="${g1.X(0)}" y1="${g1.Y(0)}" x2="${g1.X(Math.cos(t) * E)}" y2="${g1.Y(Math.sin(t) * E)}" stroke="${col(i)}" stroke-width="1" opacity=".35"/>`;
          let tr = ""; for (let k = 0; k <= 30; k++) { const h = cx.polar(E * k / 30, t); tr += (k ? "L" : "M") + g2.P(cx.sub(f(cx.add(A, h)), fa)); }
          s2 += `<path d="${tr}" fill="none" stroke="${col(i)}" stroke-width="1.4" opacity=".4"/>`;
          s1 += cx.dot(g1, tip, col(i), "", { r: 6 }); s2 += cx.dot(g2, q, col(i), "", { r: 6 });
        });
        s1 += cx.dot(g1, [0, 0], "var(--ink)", "a", { r: 4 }); s2 += cx.dot(g2, [0, 0], "var(--ink)", "f(a)", { r: 4 });
        L.innerHTML = s1; R.innerHTML = s2;
        const qs = DIR.map(t => { const h = cx.polar(Math.max(e, .005), t); return cx.div(cx.sub(f(cx.add(A, h)), fa), h); });
        const qt = DIR.map(t => { const h = cx.polar(.01, t); return cx.div(cx.sub(f(cx.add(A, h)), fa), h); }), sp = Math.max(...qt.map(q => cx.abs(cx.sub(q, qt[0]))));
        tab.innerHTML = DIR.map((t, i) => `<span style="color:${col(i)}">●</span> ${i * 45}°: ${cx.fmt(qs[i], 2)}`).join("<br>");
        const same = sp < .12 * Math.max(1, cx.abs(qt[0]));
        cap.innerHTML = (same ? "ε を十分小さくすると、8方向とも差分商がほぼ同じ値(これが f′(a))に集まります。いまの ε が大きいと、表の値は少しずれます。右の8本の道は、同じ角度だけ回り、同じ倍率で伸び縮みした形です。" : "ε をどれだけ小さくしても、8方向で差分商がばらばらのままです。右の道が裏返っていて、向きごとに倍率・角度が違います。1つの値には決まらないので、複素微分できません。") + "　ε を小さくすると、点が a(左)・f(a)(右)に集まります。";
      };
      se.oninput = () => { if (busy) return; v = +se.value; render(); ST.markLab("capproach"); };
      ST.wireSeg(el, "fn", x => { if (busy) return; key = x; render(); });
      play.onclick = async () => {
        if (busy) return; busy = true; play.disabled = true;
        const k = ST.motionScale(), n = k ? Math.round(50 * Math.min(k, 2.4)) : 1;
        for (let i = 0; i <= n && alive; i++) { v = Math.round(100 - 98 * i / n); se.value = v; render(); if (k) await ST.sleep(45); }
        busy = false; play.disabled = false; if (alive) ST.markLab("capproach");
      };
      render();
      return () => { alive = false; };
    }
  });
})(window.ST);
