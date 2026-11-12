"use strict";
/* Complex function as a map: every point z of a grid is moved to f(z). The slider (or the play button) moves each point
   from z to f(z) along a straight line, so the grid visibly bends. Holomorphic maps keep the grid lines crossing at right angles
   (apart from special points such as z = 0 for z²); z̄ flips the picture over. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 4.5);
  const FN = {
    lin: { name: "(1＋i)z", f: z => cx.mul([1, 1], z), dom: [-1.5, 1.5, -1.5, 1.5], hol: true, note: "(1＋i) を掛けるので、全体が 45° 回って √2 倍に広がります。格子は格子のまま(形は変わらない)。" },
    sq: { name: "z²", f: z => cx.mul(z, z), dom: [-1.5, 1.5, -1.5, 1.5], hol: true, note: "z² は角度を2倍・長さを2乗にします。格子の線は曲がりますが、交わる角は直角のまま(原点を除く)。原点では角度が2倍に開いてしまいます。" },
    inv: { name: "1/z", f: z => cx.div([1, 0], z), dom: [-2, 2, -2, 2], hol: true, skip: z => cx.abs(z) < .2, note: "1/z は原点付近を外へ、外側を原点へ裏返します。まっすぐな線が円になりますが、直角に交わる性質は保たれます(原点では定義されません)。" },
    exp: { name: "eᶻ", f: z => cx.exp(z), dom: [-1.5, 1, -3, 3], hol: true, note: "縦の線は円(半径 eˣ)、横の線は原点から出る半直線(角度 y)になります。この2種類の線は、いつも直角に交わります。" },
    conj: { name: "z̄", f: z => cx.conj(z), dom: [-2, 2, -2, 2], hol: false, note: "z̄ は実軸で裏返すだけです。格子の形は保たれますが、向きが逆になります(右回りが左回りに)。これは正則ではない関数の例です。" }
  };
  const STEP = { lin: .5, sq: .5, inv: .5, exp: .5, conj: .5 };

  ST.widget("cmap", {
    title: "複素関数の図示:格子がどう動くかで f を見る",
    group: "cx", name: "関数で格子を動かす", desc: "w ＝ f(z) で、平面の格子がどう変形するかをアニメーションで見る", order: 5,
    tag: "複素関数",
    formula: "$w = f(z)$",
    says: "複素関数は、入力 z も出力 w も平面の点なので、グラフは描けません。かわりに「平面の点がどこへ動くか」を見ます。",
    meaning: "格子の縦線($x=$一定)と横線($y=$一定)が、f によってどんな曲線になるか観察します。正則な関数は、直角に交わる線が直角のまま移ります(等角性)。$\\bar{z}$ のように向きが裏返る関数は正則ではありません。",
    mount(el) {
      let key = "sq", t = 1, p = [1, .5], alive = true, busy = false;
      el.innerHTML = `<div><p class="lab-label">関数 f(z)</p>${ST.segHtml("fn", Object.entries(FN).map(([k, v]) => [k, v.name]), key)}</div>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="関数による格子の変形"></svg></div>
        <div><p class="lab-label">z から f(z) へ(スライダー)</p><input type="range" min="0" max="100" value="100" class="input" data-t aria-label="変形の進み具合" style="padding:0"></div>
        <button type="button" class="btn primary big" data-play>▶ 格子を動かす</button>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]"), sl = el.querySelector("[data-t]"), play = el.querySelector("[data-play]");
      const lines = fn => {
        const [x0, x1, y0, y1] = fn.dom, out = [], n = 48;
        for (let x = x0; x <= x1 + 1e-9; x += STEP[key]) out.push({ v: true, pts: Array.from({ length: n + 1 }, (_, i) => [x, y0 + (y1 - y0) * i / n]) });
        for (let y = y0; y <= y1 + 1e-9; y += STEP[key]) out.push({ v: false, pts: Array.from({ length: n + 1 }, (_, i) => [x0 + (x1 - x0) * i / n, y]) });
        return out;
      };
      const render = () => {
        const fn = FN[key], lim = g.R * 1.15;
        let s = cx.grid(g, { ticks: false });
        const draw = (pts, color, w, op) => {
          let d = "", pen = false;
          pts.forEach(z => {
            const q = fn.skip && fn.skip(z) ? null : cx.add(cx.mul([1 - t, 0], z), cx.mul([t, 0], fn.f(z)));
            if (!q || Math.abs(q[0]) > lim || Math.abs(q[1]) > lim * H / W) { pen = false; return; }
            d += (pen ? "L" : "M") + g.P(q); pen = true;
          });
          return d ? `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" opacity="${op}" stroke-linejoin="round"/>` : "";
        };
        if (t > 0) lines(fn).forEach(l => { s += `<path d="${l.pts.filter(z => !(fn.skip && fn.skip(z))).map((z, i) => (i ? "L" : "M") + g.P(z)).join("")}" fill="none" stroke="var(--muted)" stroke-width=".8" opacity=".35"/>`; });
        lines(fn).forEach(l => { s += draw(l.pts, l.v ? "var(--info)" : "var(--packet)", 1.7, .95); });
        const fp = fn.f(p), cur = cx.add(cx.mul([1 - t, 0], p), cx.mul([t, 0], fp));
        s += cx.handle(g, p, "var(--ok)") + `<circle cx="${g.X(p[0])}" cy="${g.Y(p[1])}" r="5" fill="none" stroke="var(--ok)" stroke-width="2"/>`;
        s += cx.arrow(g, p, cur, "var(--ok)", 1.6, "4 3") + cx.dot(g, cur, "var(--ok)", t > .99 ? "f(z)" : "", { r: 6 });
        svg.innerHTML = s;
        big.innerHTML = `<b>f(${cx.fmt(p)}) ＝ ${cx.fmt(fp)}</b><span>${fn.name}　<span class="cap" style="font-size:15px">緑の点 z をドラッグ</span></span>`;
        cap.textContent = fn.note + "　青い線は x＝一定、橙の線は y＝一定の線の行き先です。";
      };
      cx.drag(svg, g, { snap: () => .5, handles: () => [{ id: "p", z: p }], tap: "p", move: (id, q) => { const d = FN[key].dom; p = [Math.max(d[0], Math.min(d[1], q[0])), Math.max(d[2], Math.min(d[3], q[1]))]; if (FN[key].skip && FN[key].skip(p)) p = [d[1] / 2, 0]; render(); ST.markLab("cmap"); } });
      ST.wireSeg(el, "fn", v => { if (busy) return; key = v; const d = FN[key].dom; p = [Math.max(d[0], Math.min(d[1], p[0])), Math.max(d[2], Math.min(d[3], p[1]))]; if (FN[key].skip && FN[key].skip(p)) p = [1, 1]; t = 1; sl.value = 100; render(); });
      sl.oninput = () => { if (busy) return; t = +sl.value / 100; render(); ST.markLab("cmap"); };
      play.onclick = async () => {
        if (busy) return; busy = true; play.disabled = true;
        const k = ST.motionScale(), n = k ? Math.round(50 * Math.min(k, 2.4)) : 1;
        for (let i = 0; i <= n && alive; i++) { t = i / n; sl.value = Math.round(t * 100); render(); if (k) await ST.sleep(40); }
        busy = false; play.disabled = false; if (alive) ST.markLab("cmap");
      };
      render();
      return () => { alive = false; };
    }
  });
})(window.ST);
