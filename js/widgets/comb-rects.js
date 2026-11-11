"use strict";
/* Lab for 演習6: rectangles in a grid. A rectangle is fixed by choosing 2 of the vertical lines and 2 of the horizontal lines,
   so the count is C(cols+1,2) x C(rows+1,2). */
(function (ST) {
  ST.widget("rects", {
    title: "格子の中の長方形:縦の線2本と横の線2本を選ぶ(演習6)",
    group: "comb", name: "格子の中の長方形", desc: "演習6:線を2本ずつ選ぶと長方形が1つ決まる", order: 11,
    tag: "演習6",
    formula: "C(横の線の数, 2) × C(縦の線の数, 2)　(5×3マスなら C(6,2) × C(4,2) ＝ 90)",
    says: "格子の中の長方形の数は、縦線から2本、横線から2本を選ぶ選び方の数に等しい。",
    meaning: "長方形は、左右の辺(縦線2本)と上下の辺(横線2本)で決まります。縦線と横線は独立に選べるので、掛け算です。",
    mount(el) {
      let cols = 5, rows = 3, idx = 0, alive = true, busy = false, cnt = null;
      const draw = () => {
        const vs = ST.combIdx(cols + 1, 2), hs = ST.combIdx(rows + 1, 2);
        const all = []; vs.forEach(v => hs.forEach(h => all.push({ v, h })));
        const total = all.length;
        if (idx >= total) idx = 0;
        const cur = all[idx], cw = Math.min(46, 270 / cols), ch = Math.min(40, 150 / rows), W = cw * cols, H = ch * rows, ox = 15, oy = 15;
        let svg = `<rect x="${ox + cur.v[0] * cw}" y="${oy + cur.h[0] * ch}" width="${(cur.v[1] - cur.v[0]) * cw}" height="${(cur.h[1] - cur.h[0]) * ch}" fill="var(--packet)" fill-opacity=".3"/>`;
        for (let i = 0; i <= cols; i++) { const on = cur.v.includes(i); svg += `<line x1="${ox + i * cw}" y1="${oy}" x2="${ox + i * cw}" y2="${oy + H}" stroke="${on ? "var(--packet)" : "var(--ink)"}" stroke-width="${on ? 4 : 1.5}"/><text x="${ox + i * cw}" y="${oy + H + 14}" text-anchor="middle" font-size="10" font-family="IBM Plex Mono, monospace" fill="${on ? "var(--packet)" : "var(--muted)"}">${i + 1}</text>`; }
        for (let j = 0; j <= rows; j++) { const on = cur.h.includes(j); svg += `<line x1="${ox}" y1="${oy + j * ch}" x2="${ox + W}" y2="${oy + j * ch}" stroke="${on ? "var(--info)" : "var(--ink)"}" stroke-width="${on ? 4 : 1.5}"/><text x="${ox - 5}" y="${oy + j * ch + 3.5}" text-anchor="end" font-size="10" font-family="IBM Plex Mono, monospace" fill="${on ? "var(--info)" : "var(--muted)"}">${String.fromCharCode(97 + j)}</text>`; }
        el.innerHTML = `<div><p class="lab-label">横のマス数</p>${ST.segHtml("cols", [2, 3, 4, 5, 6].map(x => [x, String(x)]), cols)}</div>
          <div><p class="lab-label">縦のマス数</p>${ST.segHtml("rows", [1, 2, 3, 4].map(x => [x, String(x)]), rows)}</div>
          <div class="stage" style="padding:8px 4px"><svg viewBox="0 0 ${W + 40} ${H + 36}" style="width:100%;max-width:360px;display:block;margin:auto" role="img" aria-label="${cols}×${rows}の格子と、選んだ長方形">${svg}</svg>
            <p class="cap" style="margin:4px 0 0;text-align:center">縦線(数字)は<span style="color:var(--packet)">オレンジ</span>、横線(文字)は<span style="color:var(--info)">青</span>の太線が選ばれています。</p></div>
          <p style="margin:0;font-size:16px"><b>${idx + 1} 番目</b>: 縦線 ${cur.v.map(i => i + 1).join("と")} ・ 横線 ${cur.h.map(i => String.fromCharCode(97 + i)).join("と")}</p>
          <div class="lab-big" aria-live="polite"><b>${cnt == null ? total : cnt}</b><span>${cnt == null ? "個" : `個目まで数えた(全部で ${total})`}　<span class="cap" style="font-size:15px">C(${cols + 1},2) × C(${rows + 1},2) ＝ ${vs.length} × ${hs.length} ＝ ${total}</span></span></div>
          <div class="btns three"><button type="button" class="btn primary" data-play ${busy ? "disabled" : ""}>▶ 全部数える</button><button type="button" class="btn" data-prev ${busy ? "disabled" : ""}>‹ 前</button><button type="button" class="btn" data-next ${busy ? "disabled" : ""}>次 ›</button></div>
          <p class="cap">授業の図は 5×3 マス(縦線6本・横線4本)。同じ大きさでも位置が違えば「別の長方形」として数えます。</p>`;
        ST.wireSeg(el, "cols", v => { cols = +v; idx = 0; cnt = null; draw(); });
        ST.wireSeg(el, "rows", v => { rows = +v; idx = 0; cnt = null; draw(); });
        el.querySelector("[data-prev]").onclick = () => { idx = (idx + total - 1) % total; cnt = null; draw(); };
        el.querySelector("[data-next]").onclick = () => { idx = (idx + 1) % total; cnt = null; draw(); };
        el.querySelector("[data-play]").onclick = async () => {
          busy = true; draw();
          const ok = await ST.countRun(total, i => { idx = i; cnt = i + 1; draw(); el.querySelectorAll("button").forEach(b => b.disabled = true); }, () => alive, 60);
          if (!ok) return;
          busy = false; cnt = null; draw(); ST.markLab("rects");
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
