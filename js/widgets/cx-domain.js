"use strict";
/* Regions lab: circles and discs written with |z − α|, open sets, connectedness, and "領域" (a connected open set).
   Drag the test point: inside / on the boundary / outside. For an open set, a small disc around an inside point always fits inside. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 3.4);
  /* inside(z): true/false. edge(z): signed distance to the boundary (positive = inside). */
  const dist = (z, c) => Math.hypot(z[0] - c[0], z[1] - c[1]);
  const SHAPES = {
    open: { name: "開円板", eq: "|z − 1| < 2", open: true, conn: true, edge: z => 2 - dist(z, [1, 0]), note: "境界(円周)を含まない円板です。どの点も、少し動かしても円板の中に残るので「開集合」。ひとつながりなので「領域」です。" },
    closed: { name: "閉円板", eq: "|z − 1| ≤ 2", open: false, conn: true, edge: z => 2 - dist(z, [1, 0]), closed: true, note: "境界(円周)を含む円板です。円周上の点は、どれだけ少し動かしても外にはみ出す向きがあるので「開集合ではない」。だから領域ではありません。" },
    ring: { name: "円環", eq: "1 < |z| < 2", open: true, conn: true, edge: z => Math.min(dist(z, [0, 0]) - 1, 2 - dist(z, [0, 0])), note: "真ん中に穴のあるドーナツ形です。穴があっても「ひとつながり」なので領域です(穴があるかどうかは別の話)。" },
    half: { name: "上半平面", eq: "Im z > 0", open: true, conn: true, edge: z => z[1], note: "実軸より上の全部です。実軸そのものは含まないので開集合で、ひとつながりなので領域です。" },
    two: { name: "2つの円板", eq: "|z + 1.5| < 1  または  |z − 1.5| < 1", open: true, conn: false, edge: z => Math.max(1 - dist(z, [-1.5, 0]), 1 - dist(z, [1.5, 0])), note: "2つの円板が離れています。ひとつなぎではなく「2つに切り離せる」ので連結ではなく、領域ではありません(それぞれの円板は領域)。" }
  };
  const yn = (b, t, f) => `<span class="chip ${b ? "ok" : "warn"}">${b ? "○ " + t : "× " + f}</span>`;

  ST.widget("cdomain", {
    title: "円・開円板・領域:「開いている」「ひとつながり」を点で確かめる",
    group: "cx", name: "円と領域", desc: "|z−α|＝r、開集合、連結、領域をテスト点で確かめる", order: 4,
    tag: "領域",
    formula: "|z − α| ＝ r　領域 ＝ 開 かつ 連結",
    says: "|z − α| は z と α の距離なので、|z − α| ＝ r は α を中心とする半径 r の円です。「開集合」「連結」をあわせた集合を領域と呼びます。",
    meaning: "開集合は「どの点でも、まわりを少し丸く囲んでも全部集合の中に入る」集合(境界を含まない)。連結は「2つに切り離せない」こと。微分を考える正則関数は、領域の上で扱います。",
    mount(el) {
      let key = "open", p = [1.5, 0];
      el.innerHTML = `<div><p class="lab-label">図形を選ぶ</p>${ST.segHtml("shape", Object.entries(SHAPES).map(([k, v]) => [k, v.name]), key)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="領域の図"></svg></div>
        <div class="lab-big" aria-live="polite" data-big></div><div data-chips></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), big = el.querySelector("[data-big]"), chips = el.querySelector("[data-chips]"), cap = el.querySelector("[data-cap]");
      const shapeSvg = k => {
        const f = 'fill="var(--info-soft)" stroke="var(--info)" stroke-width="2.4"', op = 'stroke-dasharray="6 4"', cl = "";
        if (k === "open") return `<circle cx="${g.X(1)}" cy="${g.Y(0)}" r="${2 * g.s}" ${f} ${op}/>`;
        if (k === "closed") return `<circle cx="${g.X(1)}" cy="${g.Y(0)}" r="${2 * g.s}" ${f} ${cl}/>`;
        if (k === "ring") return `<path fill-rule="evenodd" d="M${g.X(2)} ${g.Y(0)}A${2 * g.s} ${2 * g.s} 0 1 0 ${g.X(-2)} ${g.Y(0)}A${2 * g.s} ${2 * g.s} 0 1 0 ${g.X(2)} ${g.Y(0)}ZM${g.X(1)} ${g.Y(0)}A${g.s} ${g.s} 0 1 1 ${g.X(-1)} ${g.Y(0)}A${g.s} ${g.s} 0 1 1 ${g.X(1)} ${g.Y(0)}Z" ${f} ${op}/>`;
        if (k === "half") return `<rect x="0" y="0" width="${W}" height="${g.Y(0)}" ${f} ${op}/>`;
        return `<circle cx="${g.X(-1.5)}" cy="${g.Y(0)}" r="${g.s}" ${f} ${op}/><circle cx="${g.X(1.5)}" cy="${g.Y(0)}" r="${g.s}" ${f} ${op}/>`;
      };
      const render = () => {
        const sh = SHAPES[key], d = sh.edge(p), eps = 1e-9, onB = Math.abs(d) < eps, inside = sh.closed ? d > -eps : d > eps, free = Math.max(0, d);
        let s = cx.grid(g) + shapeSvg(key);
        if (inside && !onB && free > .02) s += `<circle cx="${g.X(p[0])}" cy="${g.Y(p[1])}" r="${(Math.min(free, 3) * g.s).toFixed(1)}" fill="var(--ok)" fill-opacity=".18" stroke="var(--ok)" stroke-width="1.6"/>`;
        s += cx.handle(g, p, "var(--packet)") + cx.dot(g, p, onB ? "var(--attack)" : inside ? "var(--ok)" : "var(--muted)", "p");
        svg.innerHTML = s;
        big.innerHTML = `<b>${onB ? "境界の上" : inside ? "中" : "外"}</b><span>p ＝ ${cx.fmt(p)}　${sh.eq}${inside || onB ? "" : "(あてはまらない)"}</span>`;
        chips.innerHTML = `<div style="margin:6px 0">${yn(sh.open, "開集合", "開集合ではない")} ${yn(sh.conn, "連結", "連結ではない")} ${yn(sh.open && sh.conn, "領域", "領域ではない")}</div>`;
        cap.innerHTML = `${sh.note}<br>${inside && !onB && sh.open ? `点 p のまわりに、半径 ${cx.num(Math.min(free, 99))} までの円板(緑)なら全部この集合に入ります。` : onB ? (sh.closed ? "p は円周の上です。どんなに小さな円板で囲んでも、外にはみ出してしまいます(これが「開集合でない」理由)。" : "p は境界の上で、この集合には含まれません。") : (inside ? `p は集合の中です。この集合は開集合ではないので、境界の円周上の点に注意しましょう(点を円周の上へドラッグしてみてください)。` : "p は集合の外です。点をドラッグして、中・境界・外を確かめてください。")}`;
      };
      cx.drag(svg, g, { snap: () => .5, handles: () => [{ id: "p", z: p }], tap: "p", move: (id, q) => { p = q; render(); ST.markLab("cdomain"); } });
      ST.wireSeg(el, "shape", v => { key = v; render(); });
      render();
    }
  });
})(window.ST);
