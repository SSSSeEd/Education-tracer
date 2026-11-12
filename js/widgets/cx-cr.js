"use strict";
/* Cauchy–Riemann lab: f = u + iv at a point a. The four partial derivatives are computed numerically from f.
   f is complex-differentiable exactly when the Jacobian [[u_x, u_y], [v_x, v_y]] has the "rotate and scale" form [[p, −q], [q, p]],
   i.e. u_x = v_y and u_y = −v_x (Cauchy–Riemann equations; here assuming u, v are smooth). */
(function (ST) {
  const cx = ST.cx, W = 340, H = 220, g = cx.geom(W, H, 3.4);
  const FN = {
    id: { name: "z", f: z => z, u: "x", v: "y" },
    sq: { name: "z²", f: z => cx.mul(z, z), u: "x² − y²", v: "2xy" },
    cube: { name: "z³", f: z => cx.pow(z, 3), u: "x³ − 3xy²", v: "3x²y − y³" },
    exp: { name: "eᶻ", f: z => cx.exp(z), u: "eˣ cos y", v: "eˣ sin y" },
    inv: { name: "1/z", f: z => cx.div([1, 0], z), u: "x/(x²+y²)", v: "−y/(x²+y²)" },
    conj: { name: "z̄", f: z => cx.conj(z), u: "x", v: "−y" },
    abs2: { name: "|z|²", f: z => [z[0] * z[0] + z[1] * z[1], 0], u: "x² + y²", v: "0" },
    re: { name: "Re z", f: z => [z[0], 0], u: "x", v: "0" }
  };

  ST.widget("ccr", {
    title: "コーシー・リーマンの方程式:4つの偏微分で正則かどうか確かめる",
    group: "cx", name: "CR方程式の確認", desc: "f ＝ u＋iv の偏微分 uₓ, u_y, vₓ, v_y を計算して、CR方程式が成り立つか見る", order: 7,
    tag: "CR方程式",
    formula: "$u_{x} = v_y \\quad u_y = -v_{x}$",
    says: "実部 u(x,y) と虚部 v(x,y) の偏微分に、$u_{x} = v_y$ と $u_y = -v_{x}$ の関係があれば、f は複素微分可能(正則)です。逆に、正則なら必ずこの関係が成り立ちます。",
    meaning: "平面の点の動きとして見ると、f は a のまわりで小さな正方形を動かします。CR方程式が成り立つとき、正方形は「回って拡大する」だけ(形は正方形のまま)。成り立たないとき、ゆがんだり裏返ったりします。",
    mount(el) {
      let key = "sq", a = [1, 1];
      el.innerHTML = `<div><p class="lab-label">関数 f(z)</p>${ST.segHtml("fn", Object.entries(FN).map(([k, x]) => [k, x.name]), key)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="点 a の位置" data-plane></svg></div>
        <p class="cap" style="margin:0">点 a(青)をドラッグして動かします。</p>
        <div class="hexbox" data-tab style="font-size:14px"></div>
        <div class="stage"><svg viewBox="0 0 ${W} 190" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="正方形の行き先" data-sq></svg></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const sv = el.querySelector("[data-plane]"), sq = el.querySelector("[data-sq]"), tab = el.querySelector("[data-tab]"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]");
      const D = (f, p) => { const h = 1e-5, fx = cx.div(cx.sub(f([p[0] + h, p[1]]), f([p[0] - h, p[1]])), [2 * h, 0]), fy = cx.div(cx.sub(f([p[0], p[1] + h]), f([p[0], p[1] - h])), [2 * h, 0]); return { ux: fx[0], vx: fx[1], uy: fy[0], vy: fy[1] }; };
      const render = () => {
        const fn = FN[key], bad = key === "inv" && !a[0] && !a[1];
        sv.innerHTML = cx.grid(g) + cx.handle(g, a, "var(--info)") + cx.dot(g, a, "var(--info)", "a ＝ " + cx.fmt(a));
        if (bad) { tab.innerHTML = "a ＝ 0 では 1/z は定義されません。a を動かしてください。"; sq.innerHTML = ""; big.innerHTML = "<b>定義されない点</b>"; cap.textContent = ""; return; }
        const d = D(fn.f, a), tol = 1e-3, e1 = Math.abs(d.ux - d.vy) < tol, e2 = Math.abs(d.uy + d.vx) < tol, ok = e1 && e2, n = v => cx.num(v, 3);
        tab.innerHTML = `u ＝ ${fn.u}　v ＝ ${fn.v}<br>
          <span style="color:var(--info)">uₓ ＝ ${n(d.ux)}</span>　<span style="color:var(--info)">v_y ＝ ${n(d.vy)}</span>　${e1 ? "✓ 等しい" : "✗ 違う"}<br>
          <span style="color:var(--packet)">u_y ＝ ${n(d.uy)}</span>　<span style="color:var(--packet)">−vₓ ＝ ${n(-d.vx)}</span>　${e2 ? "✓ 等しい" : "✗ 違う"}`;
        /* Where the two unit steps (right, up) go: the columns of the Jacobian. */
        const r = [d.ux, d.vx], u = [d.uy, d.vy], c = [r[0] + u[0], r[1] + u[1]], m = 1.2 * Math.max(1.2, ...[r, u, c].flatMap(q => [Math.abs(q[0]), Math.abs(q[1]) * W / 190])), g2 = cx.geom(W, 190, m);
        let s = cx.grid(g2, { ticks: false });
        s += `<path d="M${g2.P([0, 0])}L${g2.P(r)}L${g2.P(c)}L${g2.P(u)}Z" fill="${ok ? "var(--ok-soft)" : "var(--attack-soft)"}" fill-opacity=".7" stroke="${ok ? "var(--ok)" : "var(--attack)"}" stroke-width="1.6"/>`;
        s += `<path d="M${g2.P([0, 0])}L${g2.P([1, 0])}L${g2.P([1, 1])}L${g2.P([0, 1])}Z" fill="none" stroke="var(--muted)" stroke-dasharray="4 3"/>`;
        s += cx.arrow(g2, [0, 0], r, "var(--info)", 2.6) + cx.arrow(g2, [0, 0], u, "var(--packet)", 2.6);
        sq.innerHTML = s + `<text x="8" y="184" class="svg-m" style="font-size:10px">点線: もとの正方形(1×1)　色つき: f が動かした先</text>`;
        big.innerHTML = `<b>${ok ? "CR方程式 ○" : "CR方程式 ×"}</b><span>${ok ? `f′(a) ＝ uₓ ＋ i vₓ ＝ ${cx.fmt([d.ux, d.vx], 3)}` : "この点では正則(複素微分可能)ではありません"}</span>`;
        cap.innerHTML = ok ? "右向きの1歩(青)と上向きの1歩(橙)の行き先が、「長さが同じで90°ずれている」ままです。つまり正方形は回って拡大しただけ。これは複素数を掛ける動き(拡大と回転)と同じなので、複素微分できます。" : "青と橙の矢印の長さが違ったり、90°でなかったり、向きが裏返ったりしています。回転と拡大だけでは表せない動きなので、複素微分はできません。";
        if (key === "abs2" && !a[0] && !a[1]) cap.innerHTML += "<br>|z|² は原点では CR方程式が成り立ちますが、原点以外では成り立ちません。1点だけでは「正則」とは呼びません(まわりの開集合のすべての点で微分できる必要があります)。";
      };
      cx.drag(sv, g, { snap: () => .5, handles: () => [{ id: "a", z: a }], tap: "a", move: (id, p) => { a = p; render(); ST.markLab("ccr"); } });
      ST.wireSeg(el, "fn", v => { key = v; render(); });
      render();
    }
  });
})(window.ST);
