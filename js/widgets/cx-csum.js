"use strict";
/* Riemann sums (区分求積法): cut the interval (or the path) into n small pieces, multiply "value × width" on each piece and add.
   Real mode: ∫ f(x)dx as rectangles. Complex mode: Σ f(z_k)(z_{k+1} − z_k) along the segment 0 → 1+i, drawn as a chain of arrows that approaches ∫ f(z)dz. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 230;
  const RF = {
    sq: { name: "x²", f: x => x * x, b: 1, exact: 1 / 3, ex: "1/3" },
    lin: { name: "x", f: x => x, b: 1, exact: .5, ex: "1/2" },
    sin: { name: "sin x", f: x => Math.sin(x), b: Math.PI, exact: 2, ex: "2" }
  };
  const CF = {
    sq: { name: "z²", f: z => cx.mul(z, z), exact: [-2 / 3, 2 / 3], ex: "(1＋i)³/3 ＝ (−2＋2i)/3" },
    exp: { name: "eᶻ", f: z => cx.exp(z), exact: cx.sub(cx.exp([1, 1]), [1, 0]), ex: "e^(1＋i) − 1" },
    conj: { name: "z̄", f: z => cx.conj(z), exact: [1, 0], ex: "1" }
  };
  const END = [1, 1];

  ST.widget("csum", {
    title: "区分求積法:細かく刻んで「値×幅」を足すと積分になる",
    group: "cx", name: "区分求積法", desc: "区間・道を n 個に刻んで足す。n を増やすと積分の値に近づく", order: 8,
    tag: "区分求積法",
    formula: "$\\int f(x)dx \\approx \\Sigma f(x_{k})\\cdot \\Delta x \\quad \\int f(z)dz \\approx \\Sigma f(z_{k})\\cdot \\Delta z$",
    says: "積分は、区間(または道)を細かく刻んで、「その場所の値 × 刻みの幅」を足し合わせた和の極限です。複素数の積分でも同じで、幅 $\\Delta z$ が複素数(矢印)になるところだけが違います。",
    meaning: "実数のときの長方形は、複素数では「矢印 $f(z_{k})\\Delta z$」になります。n 個の矢印を先頭と末尾でつなぐと折れ線になり、n を増やすと、その終点が積分の値に近づきます。",
    mount(el) {
      let mode = "real", rk = "sq", ck = "sq", rule = "L", n = 6;
      el.innerHTML = `<div><p class="lab-label">調べること</p>${ST.segHtml("mode", [["real", "実数の積分"], ["cplx", "複素数の積分"]], mode)}</div>
        <div data-fnrow></div><div data-rulerow><p class="lab-label">刻みの中の、どこの値を使うか</p>${ST.segHtml("rule", [["L", "左端"], ["M", "中点"], ["R", "右端"]], rule)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" data-a role="img" aria-label="刻んだ図"></svg></div>
        <div class="stage" data-bstage><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" data-b role="img" aria-label="矢印をつなぐ"></svg></div>
        <div><p class="lab-label">刻みの数 n</p><input type="range" min="1" max="40" value="6" class="input" data-n aria-label="刻みの数" style="padding:0"></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const fr = el.querySelector("[data-fnrow]"), A = el.querySelector("[data-a]"), B = el.querySelector("[data-b]"), bs = el.querySelector("[data-bstage]"), rr = el.querySelector("[data-rulerow]"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]"), sn = el.querySelector("[data-n]");
      const fnRow = () => { fr.innerHTML = `<p class="lab-label">関数</p>${ST.segHtml("fn", Object.entries(mode === "real" ? RF : CF).map(([k, v]) => [k, v.name]), mode === "real" ? rk : ck)}`; ST.wireSeg(fr, "fn", v => { if (mode === "real") rk = v; else ck = v; render(); }); };
      const render = () => {
        bs.hidden = mode === "real"; rr.hidden = mode !== "real";
        if (mode === "real") {
          const F = RF[rk], g = cx.geom(W, H, 1, 0, 0), a = 0, b = F.b, X = x => 28 + (W - 44) * x / (b * 1.02), ymax = Math.max(1, ...Array.from({ length: 60 }, (_, i) => F.f(b * i / 59))) * 1.1, Y = y => H - 22 - (H - 40) * y / ymax;
          let s = `<line x1="24" y1="${Y(0)}" x2="${W - 6}" y2="${Y(0)}" stroke="var(--muted)" stroke-width="1.4"/><line x1="24" y1="${Y(0)}" x2="24" y2="8" stroke="var(--muted)" stroke-width="1.4"/>`;
          const w = b / n; let sum = 0;
          for (let i = 0; i < n; i++) { const x0 = a + w * i, xs = rule === "L" ? x0 : rule === "R" ? x0 + w : x0 + w / 2, v = F.f(xs); sum += v * w; s += `<rect x="${X(x0).toFixed(1)}" y="${Y(Math.max(v, 0)).toFixed(1)}" width="${(X(x0 + w) - X(x0)).toFixed(1)}" height="${Math.abs(Y(0) - Y(v)).toFixed(1)}" fill="var(--info)" fill-opacity=".35" stroke="var(--info)" stroke-width="1"/>`; }
          let d = ""; for (let i = 0; i <= 80; i++) { const x = b * i / 80; d += (i ? "L" : "M") + `${X(x).toFixed(1)},${Y(F.f(x)).toFixed(1)}`; }
          s += `<path d="${d}" fill="none" stroke="var(--packet)" stroke-width="2.6"/><text x="${W - 8}" y="22" text-anchor="end" class="svg-t" style="font-size:13px;font-weight:700" fill="var(--packet)">f(x) ＝ ${F.name}</text>`;
          A.innerHTML = s;
          big.innerHTML = `<b>${cx.num(sum, 4)}</b><span>n ＝ ${n}　<span class="cap" style="font-size:15px">正確な値 ${F.ex} ＝ ${cx.num(F.exact, 4)}、差 ${cx.num(Math.abs(sum - F.exact), 4)}</span></span>`;
          cap.textContent = `0 から ${b === 1 ? "1" : "π"} までを ${n} 等分した長方形(幅 ${cx.num(w, 3)}、高さは${rule === "L" ? "左端" : rule === "R" ? "右端" : "中点"}の値)の面積の合計です。n を大きくすると、長方形がだんだん細くなり、合計が ${cx.num(F.exact, 3)} に近づきます。`;
        } else {
          const F = CF[ck], dz = [END[0] / n, END[1] / n];
          const chain = [[0, 0]], pts = [[0, 0]];
          for (let i = 0; i < n; i++) { const zk = [END[0] * i / n, END[1] * i / n]; pts.push([END[0] * (i + 1) / n, END[1] * (i + 1) / n]); chain.push(cx.add(chain[i], cx.mul(F.f(zk), dz))); }
          const sum = chain[n], m = Math.max(1.3, cx.abs(F.exact) * 1.25, ...chain.map(cx.abs)) * 1.1;
          const g1 = cx.geom(W, H, 1.7 * W / H * .75), g2 = cx.geom(W, H, m * W / H * .8, -m * .35 * 0, 0);
          let s = cx.grid(g1, { ticks: false }), t = cx.grid(g2, { ticks: false });
          s += `<path d="${pts.map((z, i) => (i ? "L" : "M") + g1.P(z)).join("")}" fill="none" stroke="var(--packet)" stroke-width="2.6"/>`;
          pts.forEach((z, i) => { s += cx.dot(g1, z, i === 0 || i === n ? "var(--ink)" : "var(--packet)", i === 0 ? "0" : i === n ? "1＋i" : "", { r: i === 0 || i === n ? 5 : 3.5, fs: 12 }); });
          A.innerHTML = s + `<text x="8" y="${H - 8}" class="svg-m" style="font-size:10px">道: 0 から 1＋i まで(n 個に刻む。左端の値を使う)</text>`;
          chain.slice(1).forEach((q, i) => { t += cx.arrow(g2, chain[i], q, i % 2 ? "var(--info)" : "var(--packet)", 2); });
          t += cx.dot(g2, F.exact, "var(--ok)", "正確な値", { r: 7, dy: -11 }) + cx.dot(g2, sum, "var(--attack)", "和", { r: 5, dx: 8, dy: 14 });
          B.innerHTML = t + `<text x="8" y="${H - 8}" class="svg-m" style="font-size:10px">矢印 f(zₖ)Δz を つないだ折れ線 と その終点</text>`;
          big.innerHTML = `<b>${cx.fmt(sum, 3)}</b><span>n ＝ ${n}　<span class="cap" style="font-size:15px">正確な値 ${F.ex} ＝ ${cx.fmt(F.exact, 3)}、差 ${cx.num(cx.abs(cx.sub(sum, F.exact)), 3)}</span></span>`;
          cap.textContent = "道を n 個に刻み、各区間で「f(左端) × Δz(その区間の矢印)」を足します。下の図は、その n 個の矢印をつないだものです。n を増やすと、赤い点(和)が緑の点(積分の正確な値)に近づきます。";
        }
      };
      sn.oninput = () => { n = +sn.value; render(); ST.markLab("csum"); };
      ST.wireSeg(el, "mode", v => { mode = v; fnRow(); render(); });
      ST.wireSeg(el, "rule", v => { rule = v; render(); });
      fnRow(); render();
    }
  });
})(window.ST);
