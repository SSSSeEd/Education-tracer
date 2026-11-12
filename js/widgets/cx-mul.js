"use strict";
/* Multiplication lab: z·α scales the length by |α| and rotates by arg α (lengths multiply, angles add). Division does the opposite.
   z and α can be dragged; the play button moves z to its answer along the spiral z·α^t (t from 0 to 1). */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 5);

  ST.widget("cmul", {
    title: "掛け算は「拡大」と「回転」:長さは掛け算、角度は足し算",
    group: "cx", name: "掛け算は拡大と回転", desc: "z に α を掛けると、|α| 倍に拡大して arg α だけ回転する", order: 2,
    tag: "極形式と積",
    formula: "$|z\\alpha | = |z|\\cdot |\\alpha | \\quad \\arg (z\\alpha ) = \\arg z + \\arg \\alpha$",
    says: "複素数の掛け算は、長さを掛け合わせ、角度(偏角)を足し合わせたものです。割り算は長さを割り、角度を引きます。",
    meaning: "z に $\\alpha$ を掛けることは「原点のまわりに $\\arg \\alpha$ だけ回して、$|\\alpha |$ 倍に伸ばす」動きです。i を掛けると 90° 回転、−1 を掛けると 180° 回転(点対称)になります。",
    mount(el) {
      let z = [2, 1], a = [1, 1], op = "mul", alive = true, busy = false, t = 1;
      el.innerHTML = `<div><p class="lab-label">計算</p>${ST.segHtml("op", [["mul", "z × α"], ["div", "z ÷ α"]], op)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="掛け算の図"></svg></div>
        <div><p class="lab-label">α をすばやく選ぶ(点のドラッグでも動かせます)</p><div class="btns" data-q></div></div>
        <button type="button" class="btn primary big" data-play>▶ z を動かして答えまで</button>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]"), play = el.querySelector("[data-play]");
      const Q = [["i", [0, 1]], ["−1", [-1, 0]], ["2", [2, 0]], ["1＋i", [1, 1]], ["1−i", [1, -1]], ["½", [.5, 0]]];
      el.querySelector("[data-q]").innerHTML = Q.map(([l, v], i) => `<button type="button" class="btn small" data-qi="${i}" style="min-width:52px">${l}</button>`).join("");
      const ans = () => op === "mul" ? cx.mul(z, a) : cx.div(z, a);
      const render = () => {
        const r = ans(), sgn = op === "mul" ? 1 : -1, la = Math.log(cx.abs(a)), aa = cx.arg(a);
        const cur = busy || t < 1 ? cx.polar(cx.abs(z) * Math.exp(sgn * la * t), cx.arg(z) + sgn * aa * t) : r;
        let s = cx.grid(g);
        s += `<circle cx="${g.X(0)}" cy="${g.Y(0)}" r="${(g.s * cx.abs(z)).toFixed(1)}" fill="none" stroke="var(--packet)" stroke-dasharray="3 4" opacity=".55"/>`;
        s += `<circle cx="${g.X(0)}" cy="${g.Y(0)}" r="${(g.s * cx.abs(r)).toFixed(1)}" fill="none" stroke="var(--ok)" stroke-dasharray="3 4" opacity=".55"/>`;
        s += cx.arc(g, [0, 0], .55, 0, cx.arg(z), "var(--packet)", 2.4) + cx.arc(g, [0, 0], .8, 0, cx.arg(r), "var(--ok)", 2.4) + cx.arc(g, [0, 0], .3, 0, aa, "var(--info)", 2.4);
        if (busy || t < 1) { let tr = ""; for (let i = 0; i <= 40; i++) { const u = t * i / 40; tr += (i ? "L" : "M") + g.P(cx.polar(cx.abs(z) * Math.exp(sgn * la * u), cx.arg(z) + sgn * aa * u)); } s += `<path d="${tr}" fill="none" stroke="var(--ok)" stroke-width="2" opacity=".7"/>`; }
        s += cx.arrow(g, [0, 0], a, "var(--info)", 2.4) + cx.arrow(g, [0, 0], z, "var(--packet)", 2.6) + cx.arrow(g, [0, 0], cur, "var(--ok)", 3.4);
        s += cx.handle(g, z, "var(--packet)") + cx.handle(g, a, "var(--info)") + cx.dot(g, a, "var(--info)", "α") + cx.dot(g, z, "var(--packet)", "z") + cx.dot(g, cur, "var(--ok)", op === "mul" ? "zα" : "z/α", { dx: 8, dy: -10 });
        svg.innerHTML = s;
        const lz = cx.abs(z), lr = cx.abs(r), la2 = cx.abs(a);
        big.innerHTML = `<b>${op === "mul" ? "zα" : "z÷α"} ＝ ${cx.fmt(r)}</b><span>(${cx.fmt(z)}) ${op === "mul" ? "×" : "÷"} (${cx.fmt(a)})</span>`;
        cap.innerHTML = `長さ: |z| ＝ ${cx.num(lz)}、|α| ＝ ${cx.num(la2)}、答えは ${cx.num(lr)} ＝ ${cx.num(lz)} ${op === "mul" ? "×" : "÷"} ${cx.num(la2)}。<br>角度: arg z ＝ ${cx.deg(cx.arg(z))}、arg α ＝ ${cx.deg(aa)}、答えは ${cx.deg(cx.arg(r))} ＝ ${cx.deg(cx.arg(z))} ${op === "mul" ? "＋" : "−"} ${cx.deg(aa)}(360° の違いは同じ向き)。`;
        if (!isFinite(r[0] + r[1])) big.innerHTML = "<b>α ＝ 0 では割れません</b>";
      };
      cx.drag(svg, g, {
        snap: () => .5, handles: () => [{ id: "z", z }, { id: "a", z: a }], tap: "z",
        move: (id, p) => { if (busy) return; if (id === "a") { if (op === "div" && !p[0] && !p[1]) return; a = p; } else z = p; t = 1; render(); ST.markLab("cmul"); }
      });
      el.querySelectorAll("[data-qi]").forEach(b => b.onclick = () => { if (busy) return; a = Q[+b.dataset.qi][1]; t = 1; render(); });
      ST.wireSeg(el, "op", v => { if (busy) return; op = v; if (v === "div" && !a[0] && !a[1]) a = [1, 0]; t = 1; render(); });
      play.onclick = async () => {
        if (busy) return; busy = true; play.disabled = true;
        const k = ST.motionScale(), n = k ? Math.round(36 * Math.min(k, 2.4)) : 1;
        for (let i = 0; i <= n && alive; i++) { t = i / n; render(); if (k) await ST.sleep(40); }
        busy = false; t = 1; play.disabled = false; if (alive) { render(); ST.markLab("cmul"); }
      };
      render();
      return () => { alive = false; };
    }
  });
})(window.ST);
