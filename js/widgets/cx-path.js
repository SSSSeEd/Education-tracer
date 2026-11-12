"use strict";
/* Choosing the integration path: the start A and end B are fixed by you, but the way from A to B can be a straight line, an L-shaped route, or a free curve (drag M).
   The integral ∫ f(z)dz is computed numerically along each. When f has a primitive (z², eᶻ), all routes give the same value (end − start);
   for z̄ they differ; for 1/z they differ when the routes go around different sides of 0. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 3.4), N = 500;
  const FN = {
    sq: { name: "z²", f: z => cx.mul(z, z), prim: z => cx.div(cx.pow(z, 3), [3, 0]), note: "z² には原始関数 z³/3 があるので、どの道でも「終点での値 − 始点での値」になります。" },
    exp: { name: "eᶻ", f: z => cx.exp(z), prim: z => cx.exp(z), note: "eᶻ には原始関数 eᶻ があるので、どの道でも「終点での値 − 始点での値」になります。" },
    conj: { name: "z̄", f: z => cx.conj(z), prim: null, note: "z̄ は正則でなく、原始関数がありません。道によって値が変わります。" },
    inv: { name: "1/z", f: z => cx.div([1, 0], z), prim: null, note: "1/z は原点 0 に穴があります。原点の上側を通る道と下側を通る道では、積分の値が 2πi だけ違います(原点を1周分ちがう)。" }
  };
  const PATHS = [["line", "直線", "var(--info)"], ["elbow", "L字", "var(--ok)"], ["free", "自由な曲線", "var(--packet)"]];

  ST.widget("cpath", {
    title: "積分路の取り方:始点と終点が同じなら、道を変えても同じ値になる?",
    group: "cx", name: "積分路の取り方", desc: "直線・L字・自由な曲線で ∫f(z)dz を計算し、道による違いを比べる", order: 9,
    tag: "積分路",
    formula: "∫_C f(z) dz　（C: 始点 A から終点 B への道）",
    says: "複素数の積分は、始点から終点までの道 C を決めて、その上で f(z)dz を足したものです。道は平面の中でどんな形にもとれます。",
    meaning: "f に原始関数 F があるとき(z², eᶻ など)は、道によらず F(B) − F(A) になります。逆に原始関数がなかったり、穴(1/z の 0)のまわりを違う側から回ったりすると、道によって値が変わります。コーシーの積分定理は、この「いつ道によらないか」の答えです。",
    mount(el) {
      let key = "sq", A = [-1, .5], Bp = [1.5, 1], M = [0, -1.5], sel = "line";
      el.innerHTML = `<div><p class="lab-label">関数 f(z)</p>${ST.segHtml("fn", Object.entries(FN).map(([k, v]) => [k, v.name]), key)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="積分路"></svg></div>
        <p class="cap" style="margin:0">A(橙)・B(青)・M(緑、自由な曲線の通過点)をドラッグ</p>
        <div><p class="lab-label">強調する道</p>${ST.segHtml("sel", PATHS.map(p => [p[0], p[1]]), sel)}</div>
        <div class="hexbox" data-tab style="font-size:14px"></div><div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), tab = el.querySelector("[data-tab]"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]");
      const bez = (t, a, m, b) => { const u = 1 - t; return [u * u * a[0] + 2 * u * t * m[0] + t * t * b[0], u * u * a[1] + 2 * u * t * m[1] + t * t * b[1]]; };
      const route = id => {
        const pts = [];
        if (id === "line") for (let i = 0; i <= N; i++) pts.push([A[0] + (Bp[0] - A[0]) * i / N, A[1] + (Bp[1] - A[1]) * i / N]);
        else if (id === "elbow") { const c = [Bp[0], A[1]]; for (let i = 0; i <= N; i++) { const t = i / N * 2; pts.push(t <= 1 ? [A[0] + (c[0] - A[0]) * t, A[1]] : [c[0], c[1] + (Bp[1] - c[1]) * (t - 1)]); } }
        else { const c = [2 * M[0] - (A[0] + Bp[0]) / 2, 2 * M[1] - (A[1] + Bp[1]) / 2]; for (let i = 0; i <= N; i++) pts.push(bez(i / N, A, c, Bp)); }
        return pts;
      };
      const integ = (pts, f) => { let s = [0, 0]; for (let i = 0; i < pts.length - 1; i++) { const mid = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; s = cx.add(s, cx.mul(f(mid), cx.sub(pts[i + 1], pts[i]))); } return s; };
      const render = () => {
        const F = FN[key]; let s = cx.grid(g);
        if (key === "inv") s += `<circle cx="${g.X(0)}" cy="${g.Y(0)}" r="6" fill="var(--surface)" stroke="var(--attack)" stroke-width="3"/>`;
        const vals = PATHS.map(([id, nm, color]) => {
          const pts = route(id), bad = key === "inv" && pts.some(z => Math.hypot(z[0], z[1]) < .12), v = bad ? null : integ(pts, F.f);
          const mid = pts[Math.floor(N * .5)], nxt = pts[Math.floor(N * .5) + 6];
          s += `<path d="${pts.filter((_, i) => i % 5 === 0).map((z, i) => (i ? "L" : "M") + g.P(z)).join("")}" fill="none" stroke="${color}" stroke-width="${id === sel ? 4.4 : 2}" opacity="${id === sel ? 1 : .55}" stroke-linejoin="round"/>`;
          s += cx.arrow(g, mid, nxt, color, id === sel ? 3 : 2);
          return { id, nm, color, v, bad };
        });
        s += cx.handle(g, A, "var(--packet)") + cx.handle(g, Bp, "var(--info)") + cx.handle(g, M, "var(--ok)") + cx.dot(g, A, "var(--packet)", "A") + cx.dot(g, Bp, "var(--info)", "B") + cx.dot(g, M, "var(--ok)", "M", { r: 4 });
        svg.innerHTML = s;
        const ok = vals.filter(x => x.v), ref = ok[0], same = ok.length > 1 && ok.every(x => cx.abs(cx.sub(x.v, ref.v)) < .02 * Math.max(1, cx.abs(ref.v)));
        tab.innerHTML = vals.map(x => `<span style="color:${x.color}">━</span> ${x.nm}: ${x.bad ? "原点を通る(計算できません)" : cx.fmt(x.v, 3)}`).join("<br>") + (F.prim ? `<br>F(B) − F(A) ＝ ${cx.fmt(cx.sub(F.prim(Bp), F.prim(A)), 3)}` : "");
        const cur = vals.find(x => x.id === sel);
        big.innerHTML = `<b>${same ? "どの道でも同じ ✓" : ok.length < 2 ? "道を選び直してください" : "道によって違う ✗"}</b><span>${cur && cur.v ? "強調した道: " + cx.fmt(cur.v, 3) : ""}</span>`;
        cap.textContent = F.note + (key === "inv" && !same && ok.length > 1 ? " 道の差を計算すると、2πi ＝ 6.283i の整数倍になります。" : "") + " 積分は、道を 500 個に刻んで「f(中点)×Δz」を足した値です(区分求積法)。";
      };
      cx.drag(svg, g, { snap: () => .5, handles: () => [{ id: "A", z: A }, { id: "B", z: Bp }, { id: "M", z: M }], tap: null, move: (id, q) => { if (id === "A") A = q; else if (id === "B") Bp = q; else M = q; render(); ST.markLab("cpath"); } });
      ST.wireSeg(el, "fn", v => { key = v; render(); });
      ST.wireSeg(el, "sel", v => { sel = v; render(); });
      render();
    }
  });
})(window.ST);
