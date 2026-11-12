"use strict";
/* Polar-form lab: drag z; the rectangular form a + bi and the polar form r(cos θ + i sin θ) update together.
   Shows r (distance), θ (angle from the positive real axis), and how a = r cos θ, b = r sin θ are the shadows of the arrow. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 3.4);
  /* θ as a multiple of π when it is a "nice" fraction (π/6, π/4, …), else decimals of π. */
  const piFrac = t => {
    const k = t / Math.PI;
    for (const d of [1, 2, 3, 4, 6, 12]) { const n = Math.round(k * d); if (Math.abs(k * d - n) < 1e-6) { if (n === 0) return "0"; const s = n < 0 ? "−" : "", a = Math.abs(n), top = a === 1 ? "π" : a + "π"; return s + (d === 1 ? top : top + "/" + d); } }
    return cx.num(k, 3) + "π";
  };

  ST.widget("cpolar", {
    title: "極形式:点を動かすと a＋bi と r(cos θ＋i sin θ) が同時に変わる",
    group: "cx", name: "極形式 (r と θ)", desc: "点を動かして、a＋bi と r(cosθ＋i sinθ) が同時に更新される様子を見る", order: 1.5,
    tag: "極形式",
    formula: "$a + bi = r(\\cos \\theta + i \\sin \\theta ) \\quad a = r \\cos \\theta$、$b = r \\sin \\theta$",
    says: "同じ点を、横と縦の位置 (a, b) で書くか、原点からの距離 r と角度 $\\theta$ で書くかの違いです。どちらも同じ複素数です。",
    meaning: "r は矢印の長さ$(= |z|)$、$\\theta$ は正の実軸から反時計回りに測った矢印の角度です。a と b は、矢印を実軸・虚軸に落とした「影」の長さで、$r \\cos \\theta$、$r \\sin \\theta$ にあたります。",
    mount(el) {
      let z = [1, 1], snap = .5, unit = "deg";
      el.innerHTML = `<div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="極形式の図"></svg></div>
        <p class="cap" style="margin:0">点 z をドラッグ(タップした場所にも動きます)</p>
        <div><p class="lab-label">すばやく選ぶ</p><div class="btns" data-q></div></div>
        <div><p class="lab-label">角度の単位</p>${ST.segHtml("unit", [["deg", "度 (°)"], ["rad", "ラジアン"]], unit)}</div>
        <div><p class="lab-label">ドラッグのしかた</p>${ST.segHtml("snap", [[.5, "0.5 刻み"], [0, "なめらか"]], snap)}</div>
        <div class="hexbox" data-card style="font-size:15px;line-height:1.9"></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), card = el.querySelector("[data-card]"), cap = el.querySelector("[data-cap]");
      const Q = [["1＋i", [1, 1]], ["−1＋i", [-1, 1]], ["−1−i", [-1, -1]], ["2i", [0, 2]], ["−2", [-2, 0]], ["2−2i", [2, -2]]];
      el.querySelector("[data-q]").innerHTML = Q.map(([l], i) => `<button type="button" class="btn small" data-qi="${i}" style="min-width:56px">${l}</button>`).join("");
      const render = () => {
        const r = cx.abs(z), t = cx.arg(z), zero = r < 1e-9;
        let s = cx.grid(g);
        s += `<circle cx="${g.X(0)}" cy="${g.Y(0)}" r="${(g.s * r).toFixed(1)}" fill="none" stroke="var(--packet)" stroke-dasharray="3 4" opacity=".6"/>`;
        s += `<line x1="${g.X(z[0])}" y1="${g.Y(0)}" x2="${g.X(z[0])}" y2="${g.Y(z[1])}" stroke="var(--muted)" stroke-dasharray="4 3"/><line x1="${g.X(0)}" y1="${g.Y(z[1])}" x2="${g.X(z[0])}" y2="${g.Y(z[1])}" stroke="var(--muted)" stroke-dasharray="4 3"/>`;
        if (!zero) s += cx.arc(g, [0, 0], Math.min(.8, r * .5), 0, t, "var(--ok)", 3);
        s += cx.arrow(g, [0, 0], z, "var(--packet)", 3.2) + cx.dot(g, [z[0], 0], "var(--info)", "a", { r: 5, dx: -4, dy: z[1] >= 0 ? 18 : -10 }) + cx.dot(g, [0, z[1]], "var(--info)", "b", { r: 5, dx: z[0] >= 0 ? -16 : 10, dy: 4 });
        s += cx.handle(g, z, "var(--packet)") + cx.dot(g, z, "var(--packet)", "z");
        if (!zero) s += `<text x="${g.X(z[0] / 2) + (z[1] >= 0 ? -10 : 8)}" y="${g.Y(z[1] / 2) + (z[0] >= 0 ? -8 : 14)}" class="svg-t" style="font-size:13px;font-weight:700" fill="var(--packet)">r</text><text x="${g.X(Math.min(.8, r * .5) * 1.35 * Math.cos(t / 2)) - 4}" y="${g.Y(Math.min(.8, r * .5) * 1.35 * Math.sin(t / 2)) + 4}" class="svg-t" style="font-size:13px;font-weight:700" fill="var(--ok)">θ</text>`;
        svg.innerHTML = s;
        if (zero) { card.innerHTML = "z ＝ 0 では、距離 r ＝ 0 で、角度 θ は決まりません。点を動かしてください。"; cap.textContent = ""; return; }
        const th = unit === "deg" ? cx.deg(t) : piFrac(t), c = cx.num(Math.cos(t), 3), sn = cx.num(Math.sin(t), 3), rr = cx.num(r, 3);
        card.innerHTML = `<span style="color:var(--info)">直交形</span>　z ＝ <b>${cx.fmt(z)}</b>　(a, b) ＝ (${cx.num(z[0])}, ${cx.num(z[1])})<br>
          <span style="color:var(--packet)">極形式</span>　z ＝ <b>${rr}(cos ${th} ＋ i sin ${th})</b><br>
          <span class="cap" style="font-size:14px">r ＝ √(${cx.num(z[0] * z[0])} ＋ ${cx.num(z[1] * z[1])}) ＝ ${rr}　cos θ ＝ ${c}、sin θ ＝ ${sn}</span><br>
          <span class="cap" style="font-size:14px">確かめ: r cos θ ＝ ${cx.num(r * Math.cos(t))}(＝ a)、r sin θ ＝ ${cx.num(r * Math.sin(t))}(＝ b)</span>`;
        cap.textContent = "点を動かすと、上の2つの書き方が同時に変わります。r は円(橙の点線)の半径で、点が同じ円の上を回っているあいだは r が変わらず、θ だけが変わります。θ は 360° の違いを無視するので、−180°〜180° で表示しています。";
      };
      cx.drag(svg, g, { snap: () => snap, handles: () => [{ id: "z", z }], tap: "z", move: (id, p) => { z = p; render(); ST.markLab("cpolar"); } });
      el.querySelectorAll("[data-qi]").forEach(b => b.onclick = () => { z = Q[+b.dataset.qi][1]; render(); ST.markLab("cpolar"); });
      ST.wireSeg(el, "unit", v => { unit = v; render(); });
      ST.wireSeg(el, "snap", v => { snap = +v; });
      render();
    }
  });
})(window.ST);
