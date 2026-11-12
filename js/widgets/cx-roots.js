"use strict";
/* Powers and roots lab (de Moivre): z^k has length |z|^k and angle k·arg z. The n-th roots of z are n points
   evenly spaced on a circle (a regular n-gon), with length |z|^(1/n) and angles (arg z + 2πk)/n. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 3.4);

  ST.widget("croots", {
    title: "累乗とn乗根:角度が n 倍になる、根は正 n 角形に並ぶ",
    group: "cx", name: "累乗とn乗根", desc: "zⁿ は長さがn乗・角度がn倍。n乗根は円周上に等間隔に並ぶ", order: 3,
    tag: "ド・モアブルの公式",
    formula: "$z^{n} = r^{n}(\\cos n\\theta + i \\sin n\\theta )$",
    says: "$z = r(\\cos \\theta + i \\sin \\theta )$ のとき、n 乗すると長さは $r^{n}$、角度は $n\\theta$ になります。逆に n 乗根は n 個あり、角度が $\\frac{2\\pi }{n}$ ずつずれて並びます。",
    meaning: "掛け算が「回転」なので、n 乗は「n 回回転」です。逆に、角度 $\\theta$ の点の n 乗根は、$\\frac{\\theta }{n}$ から出発して $360^{\\circ}/n$ ずつ回した n 個の点で、正 n 角形をつくります。",
    mount(el) {
      let z = [1, 1], n = 3, mode = "pow";
      el.innerHTML = `<div><p class="lab-label">見方</p>${ST.segHtml("mode", [["pow", "z の累乗 z, z², z³…"], ["root", "z の n 乗根"]], mode)}</div>
        <div><p class="lab-label">n</p>${ST.segHtml("n", [[2, "2"], [3, "3"], [4, "4"], [5, "5"], [6, "6"]], n)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="累乗と根"></svg></div>
        <div class="btns"><button type="button" class="btn small" data-one>z ＝ 1 にする</button><button type="button" class="btn small" data-i>z ＝ i にする</button></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]");
      const sup = k => String(k).replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
      const render = () => {
        const r = cx.abs(z), th = cx.arg(z);
        let s = cx.grid(g), b, c;
        if (r < .05) { svg.innerHTML = s + cx.dot(g, [0, 0], "var(--packet)", "z ＝ 0"); big.innerHTML = "<b>z ＝ 0</b>"; cap.textContent = "0 は何乗しても 0 です。z を原点から離して動かしてください。"; return; }
        if (mode === "pow") {
          const pts = []; for (let k = 1; k <= n; k++) pts.push(cx.pow(z, k));
          let path = ""; pts.forEach((p, i) => { path += (i ? "L" : "M") + g.P(p); });
          s += `<circle cx="${g.X(0)}" cy="${g.Y(0)}" r="${g.s}" fill="none" stroke="var(--muted)" stroke-dasharray="3 4" opacity=".6"/>`;
          s += `<path d="${path}" fill="none" stroke="var(--info)" stroke-width="1.6" stroke-dasharray="4 3"/>`;
          pts.forEach((p, i) => { if (Math.abs(p[0]) < g.R * 1.2 && Math.abs(p[1]) < g.R * 1.2 * H / W) { s += cx.arrow(g, [0, 0], p, i === n - 1 ? "var(--ok)" : "var(--packet)", i === n - 1 ? 3 : 1.6); s += cx.dot(g, p, i === n - 1 ? "var(--ok)" : "var(--packet)", i ? "z" + sup(i + 1) : "z", { r: 5, fs: 12 }); } });
          s += cx.handle(g, z, "var(--packet)");
          const zn = pts[n - 1];
          b = `<b>z${sup(n)} ＝ ${cx.fmt(zn)}</b><span>|z|${sup(n)} ＝ ${cx.num(Math.pow(r, n))}　<span class="cap" style="font-size:15px">角度 ${n}×${cx.deg(th)} ＝ ${cx.deg(n * th)}</span></span>`;
          c = r > 1.02 ? "|z| が 1 より大きいので、掛けるたびに外へ広がっていきます。" : r < .98 ? "|z| が 1 より小さいので、掛けるたびに中心へ縮んでいきます。" : "|z| ＝ 1 なので、単位円の上で回転するだけです(長さは変わらない)。";
          c += " 画面からはみ出す点は描いていません。";
        } else {
          const rr = Math.pow(r, 1 / n), pts = []; for (let k = 0; k < n; k++) pts.push(cx.polar(rr, (th + 2 * Math.PI * k) / n));
          s += `<circle cx="${g.X(0)}" cy="${g.Y(0)}" r="${(g.s * rr).toFixed(1)}" fill="none" stroke="var(--muted)" stroke-dasharray="3 4" opacity=".7"/>`;
          s += `<path d="${pts.map((p, i) => (i ? "L" : "M") + g.P(p)).join("")}Z" fill="var(--ok-soft)" fill-opacity=".6" stroke="var(--ok)" stroke-width="1.8"/>`;
          pts.forEach((p, i) => { s += cx.arrow(g, [0, 0], p, "var(--ok)", 1.4) + cx.dot(g, p, "var(--ok)", "w" + (i ? String(i) : "₀").replace(/\d/g, d => "₀₁₂₃₄₅₆₇₈₉"[d]), { r: 5, fs: 12 }); });
          s += cx.arrow(g, [0, 0], z, "var(--packet)", 2.6) + cx.handle(g, z, "var(--packet)") + cx.dot(g, z, "var(--packet)", "z");
          b = `<b>${n} 個の根</b><span>長さ ${cx.num(rr, 3)}、角度 ${cx.deg(th / n)} から ${cx.deg(2 * Math.PI / n)} ずつ</span>`;
          c = `根 w₀ をひとつ ${n} 乗すると ${cx.fmt(cx.pow(pts[0], n))} で、z ＝ ${cx.fmt(z)} に戻ります(丸め誤差あり)。どの根も同じ円の上に等間隔で、正 ${n} 角形になります。`;
        }
        svg.innerHTML = s; big.innerHTML = b; cap.textContent = c;
      };
      cx.drag(svg, g, { snap: () => .5, handles: () => [{ id: "z", z }], tap: "z", move: (id, p) => { z = p; render(); ST.markLab("croots"); } });
      ST.wireSeg(el, "mode", v => { mode = v; render(); });
      ST.wireSeg(el, "n", v => { n = +v; render(); });
      el.querySelector("[data-one]").onclick = () => { z = [1, 0]; render(); };
      el.querySelector("[data-i]").onclick = () => { z = [0, 1]; render(); };
      render();
    }
  });
})(window.ST);
