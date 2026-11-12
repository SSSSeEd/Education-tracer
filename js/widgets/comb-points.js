"use strict";
/* Lab for 演習3: n points in a plane, no three on a line (drawn on a circle).
   (a) lines = pairs, (b) lines avoiding p1 and p2, (c) triangles = triples, (d) triangles with p1 as a vertex. */
(function (ST) {
  const MODES = {
    a: { name: "(a) 直線", k: 2, ok: () => true, f: n => `C(${n},2) ＝ ${n}·${n - 1} ÷ 2 ＝ ${ST.C(n, 2)}`, t: "2点を選ぶと直線が1本決まります。点の選び方 C(12,2) がそのまま直線の数です。" },
    b: { name: "(b) p1・p2 を通らない直線", k: 2, ok: s => !s.includes(0) && !s.includes(1), f: n => `C(${n - 2},2) ＝ ${ST.C(n - 2, 2)}`, t: "p1 と p2 は使えないので、残りの点だけから2点を選びます。「p1 または p2 を通らない」は「どちらも通らない」と読みました(Claudeの解釈)。" },
    c: { name: "(c) 三角形", k: 3, ok: () => true, f: n => `C(${n},3) ＝ ${ST.C(n, 3)}`, t: "3点を選ぶと三角形が1つ決まります(3点が一直線上にないので、必ず三角形になります)。" },
    d: { name: "(d) p1 を頂点にする三角形", k: 3, ok: s => s.includes(0), f: n => `C(${n - 1},2) ＝ ${ST.C(n - 1, 2)}`, t: "p1 は最初から頂点に決まっているので、残りの点から2点を選びます。" }
  };

  ST.widget("points", {
    title: "平面上の点から、直線と三角形を数える(演習3)",
    group: "comb", name: "点から直線・三角形", desc: "演習3:12個の点から作れる直線と三角形を書き出す", order: 9,
    tag: "演習3",
    formula: "直線 $= C(n,2)$　三角形 $= C(n,3)$　(p1 固定なら $C(n-1,r-1)$)",
    says: "点の中から2点を選べば直線、3点を選べば三角形が1つ決まります。だから数は、点の選び方 C(n,2)、C(n,3) と同じです。",
    meaning: "「図形を数える」問題を「点を選ぶ」問題に言い換えています。特定の点を使う・使わないは、その点を先に決めて、残りから選ぶと考えます。",
    mount(el) {
      let n = 12, mode = "a", idx = 0, alive = true, busy = false, trail = null, cnt = null;
      const draw = () => {
        const M = MODES[mode], P = ST.ringPts(n, 150, 150, 118);
        const all = ST.combIdx(n, M.k).filter(M.ok), total = all.length;
        if (idx >= total) idx = 0;
        const sel = all[idx];
        const shown = trail == null ? [] : all.slice(0, trail + 1);
        const poly = s => s.map(i => `${P[i].x.toFixed(1)},${P[i].y.toFixed(1)}`).join(" ");
        let svg = "";
        shown.forEach(s => { svg += `<line x1="${P[s[0]].x}" y1="${P[s[0]].y}" x2="${P[s[1]].x}" y2="${P[s[1]].y}" stroke="var(--info)" stroke-width="1" opacity=".55"/>`; });
        svg += M.k === 2 ? `<line x1="${P[sel[0]].x}" y1="${P[sel[0]].y}" x2="${P[sel[1]].x}" y2="${P[sel[1]].y}" stroke="var(--packet)" stroke-width="4" stroke-linecap="round"/>` : `<polygon points="${poly(sel)}" fill="var(--packet)" fill-opacity=".22" stroke="var(--packet)" stroke-width="3" stroke-linejoin="round"/>`;
        P.forEach((p, i) => {
          const on = sel.includes(i), out = (mode === "b" && i < 2);
          svg += `<circle cx="${p.x}" cy="${p.y}" r="${on ? 11 : 9}" fill="${on ? "var(--packet)" : "var(--surface)"}" stroke="${out ? "var(--muted)" : on ? "var(--packet)" : "var(--ink)"}" stroke-width="2" ${out ? 'stroke-dasharray="3 2" opacity=".6"' : ""}/>
            <text x="${p.x}" y="${p.y + 3.5}" text-anchor="middle" font-size="9.5" font-weight="700" font-family="IBM Plex Mono, monospace" fill="${on ? "#fff" : "var(--ink)"}">${i + 1}</text>`;
        });
        const counted = cnt == null ? total : cnt;
        el.innerHTML = `<div><p class="lab-label">問題</p>${ST.segHtml("mode", Object.entries(MODES).map(([k, m]) => [k, m.name]), mode)}</div>
          <div><p class="lab-label">点の数 n(授業は12)</p>${ST.segHtml("n", [5, 6, 8, 10, 12].map(x => [x, String(x)]), n)}</div>
          <div class="stage" style="padding:6px"><svg viewBox="0 0 300 300" style="width:100%;max-width:340px;display:block;margin:auto" role="img" aria-label="円周上の${n}個の点">${svg}</svg></div>
          <div class="lab-big" aria-live="polite"><b>${counted}</b><span>${cnt == null ? "通り" : `通り目まで数えた(全部で ${total})`}　<span class="cap" style="font-size:15px">${M.f(n)}</span></span></div>
          <p style="margin:0;font-size:16px"><b>${idx + 1} 番目</b>: 点 ${sel.map(i => "p" + (i + 1)).join("・")}</p>
          <div class="btns three"><button type="button" class="btn primary" data-play ${busy ? "disabled" : ""}>▶ 全部数える</button><button type="button" class="btn" data-prev ${busy ? "disabled" : ""}>‹ 前</button><button type="button" class="btn" data-next ${busy ? "disabled" : ""}>次 ›</button></div>
          <p class="cap">${M.t}${M.k === 2 ? " 「全部数える」を押すと、直線が1本ずつ増えていきます。" : ""}</p>`;
        ST.wireSeg(el, "mode", v => { mode = v; idx = 0; trail = null; cnt = null; draw(); ST.markLab("points"); });
        ST.wireSeg(el, "n", v => { n = +v; idx = 0; trail = null; cnt = null; draw(); });
        el.querySelector("[data-prev]").onclick = () => { idx = (idx + total - 1) % total; trail = null; cnt = null; draw(); };
        el.querySelector("[data-next]").onclick = () => { idx = (idx + 1) % total; trail = null; cnt = null; draw(); };
        el.querySelector("[data-play]").onclick = async () => {
          busy = true; draw();
          const ok = await ST.countRun(total, i => { idx = i; cnt = i + 1; trail = M.k === 2 ? i : null; draw(); el.querySelectorAll("button").forEach(b => b.disabled = true); }, () => alive, 60);
          if (!ok) return;
          busy = false; trail = null; cnt = null; draw(); ST.markLab("points");
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
