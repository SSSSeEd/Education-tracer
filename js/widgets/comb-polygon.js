"use strict";
/* Lab for 演習4: triangles made from the vertices of an n-gon that use none of the polygon's sides.
   Every triangle is classified by how many polygon sides it contains (2, 1 or 0); the answer is what is left after subtracting. */
(function (ST) {
  ST.widget("polygon", {
    title: "8角形の頂点でできる三角形:辺を使わないものを数える(演習4)",
    group: "comb", name: "辺を持たない三角形", desc: "演習4:全体から「辺を2本・1本持つ三角形」を引く", order: 10,
    tag: "演習4",
    formula: "C(n,3) − n − n(n−4) ＝ n(n−4)(n−5) ÷ 6　(n＝8 なら 56 − 8 − 32 ＝ 16)",
    says: "n 角形の頂点3つを選んでできる三角形のうち、元の多角形の辺を1本も使わないものの数です。",
    meaning: "全部で C(n,3) 個。そこから、辺を2本使うもの(隣り合う3頂点・n 個)と、辺をちょうど1本使うもの(n×(n−4) 個)を引きます。引き算で数える考え方です。",
    mount(el) {
      let n = 8, flt = "all", idx = 0, step = 3, alive = true, busy = false;
      const draw = () => {
        const P = ST.ringPts(n, 150, 150, 120);
        const adj = (a, b) => (b - a + n) % n === 1 || (a - b + n) % n === 1;
        const all = ST.combIdx(n, 3).map(t => ({ t, e: [[0, 1], [0, 2], [1, 2]].filter(([x, y]) => adj(t[x], t[y])).length }));
        const cnt = { 2: all.filter(x => x.e === 2).length, 1: all.filter(x => x.e === 1).length, 0: all.filter(x => x.e === 0).length };
        const list = flt === "all" ? all : all.filter(x => x.e === +flt);
        if (idx >= list.length) idx = 0;
        const cur = list[idx], total = all.length, left = total - cnt[2] - cnt[1];
        const sides = cur.t.map((v, i) => [v, cur.t[(i + 1) % 3]]);
        let svg = `<polygon points="${P.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}" fill="var(--sunken)" stroke="var(--ink)" stroke-width="2.5"/>`;
        svg += `<polygon points="${cur.t.map(i => `${P[i].x.toFixed(1)},${P[i].y.toFixed(1)}`).join(" ")}" fill="var(--packet)" fill-opacity=".2" stroke="none"/>`;
        sides.forEach(([a, b]) => { const sh = adj(a, b); svg += `<line x1="${P[a].x}" y1="${P[a].y}" x2="${P[b].x}" y2="${P[b].y}" stroke="${sh ? "var(--attack)" : "var(--packet)"}" stroke-width="${sh ? 6 : 3.5}" stroke-linecap="round"/>`; });
        P.forEach((p, i) => { const on = cur.t.includes(i); svg += `<circle cx="${p.x}" cy="${p.y}" r="${on ? 10 : 8}" fill="${on ? "var(--packet)" : "var(--surface)"}" stroke="${on ? "var(--packet)" : "var(--ink)"}" stroke-width="2"/><text x="${p.x}" y="${p.y + 3.5}" text-anchor="middle" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="${on ? "#fff" : "var(--ink)"}">${i + 1}</text>`; });
        const row = (k, lab, val, sub, on) => `<div style="display:flex;gap:8px;align-items:baseline;padding:6px 8px;margin:3px 0;border-radius:8px;${on ? "background:var(--packet-soft);outline:2px solid var(--packet)" : ""}"><span style="flex:1">${lab}<br><span class="cap" style="margin:0">${sub}</span></span><b style="font:700 20px var(--f-mono)">${val}</b></div>`;
        el.innerHTML = `<div><p class="lab-label">何角形か</p>${ST.segHtml("n", [5, 6, 7, 8, 9, 10].map(x => [x, x + "角形"]), n)}</div>
          <div><p class="lab-label">見る三角形</p>${ST.segHtml("flt", [["all", "すべて"], [2, "辺2本"], [1, "辺1本"], [0, "辺なし"]], flt === "all" ? "all" : +flt)}</div>
          <div class="stage" style="padding:6px"><svg viewBox="0 0 300 300" style="width:100%;max-width:340px;display:block;margin:auto" role="img" aria-label="${n}角形と三角形">${svg}</svg><p class="cap" style="margin:4px 0 0">赤い太線は、多角形の辺と重なっている三角形の辺です。オレンジの線は多角形の辺ではありません。</p></div>
          <p style="margin:0;font-size:16px"><b>${idx + 1} / ${list.length} 個目</b>: 頂点 ${cur.t.map(i => i + 1).join("・")} → 多角形の辺を <b>${cur.e} 本</b>使う</p>
          <div class="btns two"><button type="button" class="btn" data-prev ${busy ? "disabled" : ""}>‹ 前の三角形</button><button type="button" class="btn" data-next ${busy ? "disabled" : ""}>次の三角形 ›</button></div>
          <div class="hexbox" style="padding:6px">
            ${row(0, "全部の三角形", `C(${n},3) ＝ ${total}`, "3つの頂点を選ぶ", step === 0)}
            ${row(2, "− 辺を2本使う", `${step >= 1 ? "− " + cnt[2] : "…"}`, "隣り合う3頂点。頂点の数 n 個", step === 1)}
            ${row(1, "− 辺をちょうど1本使う", `${step >= 2 ? "− " + cnt[1] : "…"}`, `辺 n 本 × (その両端と隣を除く ${n - 4} 頂点)`, step === 2)}
          </div>
          <div class="lab-big" aria-live="polite"><b>${step >= 3 ? left : step === 0 ? total : step === 1 ? total - cnt[2] : total - cnt[2] - cnt[1]}</b><span>${step >= 3 ? `個　<span class="cap" style="font-size:15px">${total} − ${cnt[2]} − ${cnt[1]} ＝ ${left}(辺なしの三角形は ${cnt[0]} 個で一致)</span>` : "個(途中の数)"}</span></div>
          <div class="btns"><button type="button" class="btn primary" data-sub ${busy ? "disabled" : ""}>▶ 引き算で数える</button></div>`;
        ST.wireSeg(el, "n", v => { n = +v; idx = 0; step = 3; draw(); });
        ST.wireSeg(el, "flt", v => { flt = v === "all" ? "all" : +v; idx = 0; draw(); ST.markLab("polygon"); });
        el.querySelector("[data-prev]").onclick = () => { idx = (idx + list.length - 1) % list.length; draw(); };
        el.querySelector("[data-next]").onclick = () => { idx = (idx + 1) % list.length; draw(); };
        el.querySelector("[data-sub]").onclick = async () => {
          busy = true;
          for (let s = 0; s <= 3 && alive; s++) { step = s; draw(); await ST.sleep(1100); }
          if (!alive) return; busy = false; draw(); ST.markLab("polygon");
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
