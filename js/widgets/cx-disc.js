"use strict";
/* The definition of a region with a "small circle": a set S is open if every point p of S has some small disc around it that lies completely inside S.
   Mode 1 shrinks the disc (radius ε) at a point you choose. Mode 2 checks "connected": can two points of S be joined by a path that stays inside S? */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 3.4);
  const dist = (z, c) => Math.hypot(z[0] - c[0], z[1] - c[1]);
  /* edge(z): signed distance to the boundary (positive = inside). comp(z): connected-component id of the set containing z (or null). */
  const SH = {
    open: { name: "開円板", edge: z => 2 - dist(z, [1, 0]), closed: false, comp: z => 0 },
    closed: { name: "閉円板", edge: z => 2 - dist(z, [1, 0]), closed: true, comp: z => 0 },
    ring: { name: "円環", edge: z => Math.min(dist(z, [0, 0]) - 1, 2 - dist(z, [0, 0])), closed: false, comp: z => 0, ring: true },
    two: { name: "2つの円板", edge: z => Math.max(1 - dist(z, [-1.5, 0]), 1 - dist(z, [1.5, 0])), closed: false, comp: z => dist(z, [-1.5, 0]) < 1 ? 0 : dist(z, [1.5, 0]) < 1 ? 1 : null }
  };
  const draw = k => {
    const f = 'fill="var(--info-soft)" stroke="var(--info)" stroke-width="2.4"';
    if (k === "open") return `<circle cx="${g.X(1)}" cy="${g.Y(0)}" r="${2 * g.s}" ${f} stroke-dasharray="6 4"/>`;
    if (k === "closed") return `<circle cx="${g.X(1)}" cy="${g.Y(0)}" r="${2 * g.s}" ${f}/>`;
    if (k === "ring") return `<path fill-rule="evenodd" d="M${g.X(2)} ${g.Y(0)}A${2 * g.s} ${2 * g.s} 0 1 0 ${g.X(-2)} ${g.Y(0)}A${2 * g.s} ${2 * g.s} 0 1 0 ${g.X(2)} ${g.Y(0)}ZM${g.X(1)} ${g.Y(0)}A${g.s} ${g.s} 0 1 1 ${g.X(-1)} ${g.Y(0)}A${g.s} ${g.s} 0 1 1 ${g.X(1)} ${g.Y(0)}Z" ${f} stroke-dasharray="6 4"/>`;
    return `<circle cx="${g.X(-1.5)}" cy="${g.Y(0)}" r="${g.s}" ${f} stroke-dasharray="6 4"/><circle cx="${g.X(1.5)}" cy="${g.Y(0)}" r="${g.s}" ${f} stroke-dasharray="6 4"/>`;
  };

  ST.widget("cdisc", {
    title: "領域の定義:小さな円で調べる(開集合)・道でつなぐ(連結)",
    group: "cx", name: "小円と領域の定義", desc: "どの点にも「全部集合に入る小さな円」があるか。2点を道でつなげるか", order: 4.5,
    tag: "領域の定義",
    formula: "開集合: どの点 p にも $\\varepsilon$>0 があって $|z-p|$<$\\varepsilon$ ⊂ 集合　連結: 2点を集合内の道でつなげる",
    says: "開集合とは、集合の中のどの点についても、その点を中心とする小さな円板で、全部集合に入るものがとれる集合です。連結とは、集合の中の2点が、集合から出ない道でつなげることです。",
    meaning: "小円の半径 $\\varepsilon$ をどれだけ小さくしてもよいのがポイントです。境界の点は、$\\varepsilon$ をどんなに小さくしても円板が外へはみ出してしまいます。開集合で連結なものが領域で、微分の話はこの領域の上で進めます。",
    mount(el) {
      let key = "open", mode = "circle", p = [1, 0], eps = 12, A = [-1.5, 0], B = [1.5, 0.5];
      el.innerHTML = `<div><p class="lab-label">集合</p>${ST.segHtml("shape", Object.entries(SH).map(([k, v]) => [k, v.name]), key)}</div>
        <div><p class="lab-label">調べること</p>${ST.segHtml("mode", [["circle", "小円(開集合か)"], ["path", "道(連結か)"]], mode)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="小円と道"></svg></div>
        <div data-epsrow><p class="lab-label">小円の半径 ε(小さくしてみる)</p><input type="range" min="1" max="30" value="12" class="input" data-eps aria-label="小円の半径" style="padding:0"></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]"), er = el.querySelector("[data-epsrow]"), se = el.querySelector("[data-eps]");
      const inS = (z, sh) => { const d = sh.edge(z); return sh.closed ? d > -1e-9 : d > 1e-9; };
      /* A path from a to b inside the set (straight line, or along an arc for the ring), or null. */
      const route = (a, b, sh) => {
        const N = 80, mk = fn => { const pts = []; for (let i = 0; i <= N; i++) pts.push(fn(i / N)); return pts; };
        const line = mk(t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        if (line.every(z => inS(z, sh))) return line;
        if (sh.ring) {
          const ra = cx.abs(a), rb = cx.abs(b); let da = cx.arg(b) - cx.arg(a); while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
          const arc = mk(t => cx.polar(ra + (rb - ra) * t, cx.arg(a) + da * t)); if (arc.every(z => inS(z, sh))) return arc;
        }
        return null;
      };
      const render = () => {
        const sh = SH[key]; let s = cx.grid(g) + draw(key), b, c;
        er.hidden = mode !== "circle";
        if (mode === "circle") {
          const d = sh.edge(p), inside = inS(p, sh), e = eps / 10, fits = inside && d >= e - 1e-9, onB = Math.abs(d) < 1e-9;
          s += `<circle cx="${g.X(p[0])}" cy="${g.Y(p[1])}" r="${(e * g.s).toFixed(1)}" fill="${fits ? "var(--ok)" : "var(--attack)"}" fill-opacity=".2" stroke="${fits ? "var(--ok)" : "var(--attack)"}" stroke-width="2"/>`;
          s += cx.handle(g, p, "var(--packet)") + cx.dot(g, p, onB ? "var(--attack)" : inside ? "var(--ok)" : "var(--muted)", "p");
          b = `<b>${!inside && !onB ? "集合の外" : onB && !sh.closed ? "境界(集合に入らない)" : fits ? "小円が入る ✓" : "はみ出す ✗"}</b><span>ε ＝ ${cx.num(e, 1)}　p ＝ ${cx.fmt(p)}</span>`;
          c = !inside && !onB ? "p は集合の外です。小円を考えるのは、集合の中の点だけです。" : onB && sh.closed ? "p は閉円板の円周の上(集合の中の点)です。ε をどんなに小さくしても、円の外側へはみ出します。だから閉円板は開集合ではありません。" : onB ? "p は境界の上で、集合に入っていません。" : fits ? `この ε の円は全部集合に入っています。p から境界までの距離は ${cx.num(d)} なので、ε がそれ以下なら必ず入ります。どの点でもこうなるのが開集合です。` : `この ε は大きすぎて、境界を越えてはみ出しています。ε を ${cx.num(d)} 以下に小さくすると、入ります。「十分小さな ε があればよい」のが開集合の条件です。`;
        } else {
          const ca = sh.comp(A), cb = sh.comp(B), okA = ca != null && inS(A, sh), okB = cb != null && inS(B, sh);
          let path = null; if (okA && okB && ca === cb) path = route(A, B, sh);
          if (path) s += `<path d="${path.map((z, i) => (i ? "L" : "M") + g.P(z)).join("")}" fill="none" stroke="var(--ok)" stroke-width="3.2" stroke-linecap="round"/>`;
          s += cx.handle(g, A, "var(--packet)") + cx.handle(g, B, "var(--info)") + cx.dot(g, A, okA ? "var(--packet)" : "var(--muted)", "A") + cx.dot(g, B, okB ? "var(--info)" : "var(--muted)", "B");
          b = `<b>${!okA || !okB ? "点が集合の外" : path ? "つながる ✓" : "つながらない ✗"}</b><span>A と B を、集合から出ない道で</span>`;
          c = !okA || !okB ? "A と B をどちらも集合の中へ動かしてください(2点とも集合の中の点であることが必要です)。" : path ? (path.length && key === "ring" && !route(A, B, { ...sh, ring: false }) ? "まっすぐ結ぶと穴を通ってしまうので、輪に沿って回り込む道をとりました。穴があっても、道でつなげるので「連結」です。" : "A と B を結ぶ道(緑)が、集合から出ずにとれます。どの2点でもこうできれば「連結」です。") : "A と B は別々の円板にいて、集合から出ずにつなぐ道がありません。2つに切り離せるので、連結ではなく、領域ではありません。";
        }
        svg.innerHTML = s; big.innerHTML = b; cap.textContent = c;
      };
      cx.drag(svg, g, { snap: () => .5, handles: () => mode === "circle" ? [{ id: "p", z: p }] : [{ id: "A", z: A }, { id: "B", z: B }], tap: null, move: (id, q) => { if (id === "p") p = q; else if (id === "A") A = q; else B = q; render(); ST.markLab("cdisc"); } });
      se.oninput = () => { eps = +se.value; render(); };
      ST.wireSeg(el, "shape", v => { key = v; render(); });
      ST.wireSeg(el, "mode", v => { mode = v; render(); });
      render();
    }
  });
})(window.ST);
