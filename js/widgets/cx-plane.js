"use strict";
/* Complex plane lab: a complex number z = x + yi is the point (x, y), i.e. the arrow from the origin.
   Views: the point and its size |z|; sum and difference as arrows (parallelogram); the conjugate as a mirror image. Drag the points. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 3.4);

  ST.widget("cplane", {
    title: "複素平面:複素数は平面の点(矢印)。足し算は矢印をつなぐ",
    group: "cx", name: "複素平面と足し算", desc: "z = x + yi は点 (x, y)。和・差・共役・絶対値を動かして見る", order: 1,
    tag: "複素平面",
    formula: "z ＝ x ＋ yi ⟷ 点 (x, y)　|z| ＝ √(x²＋y²)　z̄ ＝ x − yi",
    says: "複素数 x＋yi を、横が x(実部)・縦が y(虚部)の平面の点として表します。原点からの矢印(ベクトル)とも同じです。",
    meaning: "足し算・引き算は矢印の足し引き(平行四辺形)、共役は実軸に関する鏡写し、絶対値 |z| は原点からの距離です。点をドラッグして確かめてください。",
    mount(el) {
      let mode = "point", snap = .5, z = [2, 1], w = [-1, 2];
      el.innerHTML = `<div><p class="lab-label">見方</p>${ST.segHtml("mode", [["point", "点と大きさ"], ["sum", "和と差"], ["conj", "共役"]], mode)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="複素平面"></svg></div>
        <div><p class="lab-label">ドラッグのしかた</p>${ST.segHtml("snap", [[.5, "0.5 刻み"], [0, "なめらか"]], snap)}</div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]");
      const render = () => {
        let s = cx.grid(g), b, c;
        if (mode === "point") {
          s += `<line x1="${g.X(z[0])}" y1="${g.Y(0)}" x2="${g.X(z[0])}" y2="${g.Y(z[1])}" stroke="var(--muted)" stroke-dasharray="4 3"/><line x1="${g.X(0)}" y1="${g.Y(z[1])}" x2="${g.X(z[0])}" y2="${g.Y(z[1])}" stroke="var(--muted)" stroke-dasharray="4 3"/>`;
          s += cx.arrow(g, [0, 0], z, "var(--packet)", 3) + cx.handle(g, z, "var(--packet)") + cx.dot(g, z, "var(--packet)", "z");
          b = `<b>z ＝ ${cx.fmt(z)}</b><span>点 (${cx.num(z[0])}, ${cx.num(z[1])})　<span class="cap" style="font-size:15px">|z| ＝ ${cx.num(cx.abs(z))}</span></span>`;
          c = "実部 x は横の位置、虚部 y は縦の位置です。点を動かすと z の値と、原点からの距離 |z| (矢印の長さ)が変わります。";
        } else if (mode === "sum") {
          const sm = cx.add(z, w), df = cx.sub(z, w);
          s += `<line x1="${g.X(z[0])}" y1="${g.Y(z[1])}" x2="${g.X(sm[0])}" y2="${g.Y(sm[1])}" stroke="var(--info)" stroke-dasharray="4 3"/><line x1="${g.X(w[0])}" y1="${g.Y(w[1])}" x2="${g.X(sm[0])}" y2="${g.Y(sm[1])}" stroke="var(--packet)" stroke-dasharray="4 3"/>`;
          s += cx.arrow(g, [0, 0], z, "var(--packet)", 2.6) + cx.arrow(g, [0, 0], w, "var(--info)", 2.6) + cx.arrow(g, [0, 0], sm, "var(--ok)", 3.4);
          s += cx.handle(g, z, "var(--packet)") + cx.handle(g, w, "var(--info)") + cx.dot(g, z, "var(--packet)", "z") + cx.dot(g, w, "var(--info)", "w") + cx.dot(g, sm, "var(--ok)", "z＋w", { dx: 8, dy: -10 });
          b = `<b>z＋w ＝ ${cx.fmt(sm)}</b><span>(${cx.fmt(z)}) ＋ (${cx.fmt(w)})　<span class="cap" style="font-size:15px">z−w ＝ ${cx.fmt(df)}</span></span>`;
          c = "実部は実部どうし、虚部は虚部どうしを足します。z と w の矢印を平行四辺形の2辺にすると、対角線が z＋w です(ベクトルの和と同じ)。";
        } else {
          const cj = cx.conj(z);
          s += `<line x1="${g.X(z[0])}" y1="${g.Y(z[1])}" x2="${g.X(cj[0])}" y2="${g.Y(cj[1])}" stroke="var(--muted)" stroke-dasharray="4 3"/>`;
          s += cx.arrow(g, [0, 0], z, "var(--packet)", 2.6) + cx.arrow(g, [0, 0], cj, "var(--info)", 2.6) + cx.handle(g, z, "var(--packet)") + cx.dot(g, z, "var(--packet)", "z") + cx.dot(g, cj, "var(--info)", "z̄", { dy: 18 });
          b = `<b>z̄ ＝ ${cx.fmt(cj)}</b><span>z ＝ ${cx.fmt(z)}　<span class="cap" style="font-size:15px">|z̄| ＝ |z| ＝ ${cx.num(cx.abs(z))}</span></span>`;
          c = "共役 z̄ は虚部の符号を変えたもので、実軸に関する鏡写しです。長さ |z| は変わりません。z が実軸の上にあるとき(y＝0)だけ z̄ ＝ z です。";
        }
        svg.innerHTML = s; big.innerHTML = b; cap.textContent = c;
      };
      cx.drag(svg, g, {
        snap: () => snap, handles: () => mode === "sum" ? [{ id: "z", z }, { id: "w", z: w }] : [{ id: "z", z }], tap: "z",
        move: (id, p) => { if (id === "w") w = p; else z = p; render(); ST.markLab("cplane"); }
      });
      ST.wireSeg(el, "mode", v => { mode = v; render(); });
      ST.wireSeg(el, "snap", v => { snap = +v; });
      render();
    }
  });
})(window.ST);
