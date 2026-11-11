"use strict";
/* Lab for 演習7: shortest paths from S to T on a grid (6 steps right, 4 steps down).
   A path is the choice of WHICH 6 of the 10 steps are "right", so there are C(10,6) = 210 of them; through A it is C(6,2) x C(4,2) = 90. */
(function (ST) {
  const W = 6, H = 4, A = { x: 4, y: 2 };
  const circ = k => String.fromCharCode(0x2460 + k - 1);
  const allPaths = (x, y, s) => (x === W && y === H) ? [s] : [...(x < W ? allPaths(x + 1, y, s + "R") : []), ...(y < H ? allPaths(x, y + 1, s + "D") : [])];
  const PATHS = allPaths(0, 0, "");
  const throughA = p => { let x = 0, y = 0; for (const c of p.slice(0, A.x + A.y)) { if (c === "R") x++; else y++; } return x === A.x && y === A.y; };
  const VIA = PATHS.filter(throughA);

  ST.widget("lattice", {
    title: "格子の最短経路:右に6回・下に4回、どの順番にするか(演習7)",
    group: "comb", name: "格子の最短経路", desc: "演習7:10歩のうち「右」にする6歩を選ぶ。A を通る道も数える", order: 12,
    tag: "演習7",
    formula: "S→T ＝ C(10,6) ＝ 210　A を通る ＝ C(6,2) × C(4,2) ＝ 90",
    says: "最短の道は、右に6回・下に4回の合計10歩。10歩のうち、どの6歩を「右」にするかを選べば道が1つ決まります。",
    meaning: "資料の例では、右にする歩が {1,3,5,8,9,10} 番目の道です。A を通る道は、S→A(右4・下2)の選び方と A→T(右2・下2)の選び方の掛け算になります。",
    mount(el) {
      let path = "RDRDRDDRRR", only = "all", alive = true, busy = false, run = null;
      const list = () => only === "A" ? VIA : PATHS;
      const draw = () => {
        const cw = 44, ox = 20, oy = 24, pos = [{ x: 0, y: 0 }];
        for (const c of path) { const q = pos[pos.length - 1]; pos.push(c === "R" ? { x: q.x + 1, y: q.y } : { x: q.x, y: q.y + 1 }); }
        const shown = run == null ? pos.length : run + 1, P = pos.slice(0, shown);
        const X = x => ox + x * cw, Y = y => oy + y * cw;
        let svg = "";
        for (let i = 0; i <= W; i++) svg += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(H)}" stroke="var(--line)" stroke-width="1.5"/>`;
        for (let j = 0; j <= H; j++) svg += `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(W)}" y2="${Y(j)}" stroke="var(--line)" stroke-width="1.5"/>`;
        svg += `<polyline points="${P.map(p => `${X(p.x)},${Y(p.y)}`).join(" ")}" fill="none" stroke="var(--packet)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
        P.slice(1).forEach((p, i) => { const q = P[i], c = path[i]; svg += `<text x="${(X(p.x) + X(q.x)) / 2 + (c === "D" ? 11 : 0)}" y="${(Y(p.y) + Y(q.y)) / 2 + (c === "R" ? -7 : 4)}" text-anchor="middle" font-size="11" font-weight="700" font-family="IBM Plex Mono, monospace" fill="${c === "R" ? "var(--packet)" : "var(--info)"}">${circ(i + 1)}</text>`; });
        const last = P[P.length - 1];
        svg += `<circle cx="${X(A.x)}" cy="${Y(A.y)}" r="9" fill="var(--surface)" stroke="var(--attack)" stroke-width="2.5"/><text x="${X(A.x)}" y="${Y(A.y) + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--attack)">A</text>`;
        svg += `<circle cx="${X(0)}" cy="${Y(0)}" r="11" fill="var(--ink)"/><text x="${X(0)}" y="${Y(0) + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--surface)">S</text>`;
        svg += `<circle cx="${X(W)}" cy="${Y(H)}" r="11" fill="var(--ink)"/><text x="${X(W)}" y="${Y(H) + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--surface)">T</text>`;
        svg += `<circle cx="${X(last.x)}" cy="${Y(last.y)}" r="6" fill="var(--packet)" stroke="var(--surface)" stroke-width="2"/>`;
        const full = path.length === W + H, rs = [], ds = [], rc = path.split("R").length - 1, dc = path.split("D").length - 1;
        [...path].forEach((c, i) => (c === "R" ? rs : ds).push(i + 1));
        const L = list(), at = L.indexOf(path), via = full && throughA(path);
        const step = path.split("").map((c, i) => `<span class="ch-chip ${c === "R" ? "hot" : ""}" style="${i < shown - 1 ? "" : "opacity:.3"}">${c === "R" ? "右" : "下"}</span>`).join("");
        el.innerHTML = `<div><p class="lab-label">数える道</p>${ST.segHtml("only", [["all", "S→T のすべて"], ["A", "A を通る道だけ"]], only)}</div>
          <div class="stage" style="padding:8px 2px"><svg viewBox="0 0 ${W * cw + 40} ${H * cw + 40}" style="width:100%;max-width:380px;display:block;margin:auto" role="img" aria-label="格子の最短経路">${svg}</svg></div>
          <div class="hexbox" style="padding:8px" aria-live="polite"><div>${step || '<span class="cap">下のボタンで道を作ってください</span>'}</div>
            <div style="margin-top:4px">${full ? `「右」にした歩の番号: <b>{${rs.join(", ")}}</b>(${rs.length}個)<br>${via ? "この道は A を通ります。" : "この道は A を通りません。"}` : `あと 右${W - rc}回・下${H - dc}回`}</div></div>
          <div class="btns three"><button type="button" class="btn primary" data-r ${busy ? "disabled" : ""}>右 →</button><button type="button" class="btn primary" data-d ${busy ? "disabled" : ""}>下 ↓</button><button type="button" class="btn" data-undo ${busy ? "disabled" : ""}>戻す</button></div>
          <div class="btns three"><button type="button" class="btn" data-walk ${busy || !full ? "disabled" : ""}>▶ 歩く</button><button type="button" class="btn" data-next ${busy ? "disabled" : ""}>別の道 ›</button><button type="button" class="btn" data-clear ${busy ? "disabled" : ""}>最初から</button></div>
          <div class="lab-big" aria-live="polite"><b>${L.length}</b><span>通り${only === "A" ? "(A を通る)" : ""}　<span class="cap" style="font-size:15px">${only === "A" ? "C(6,2) × C(4,2) ＝ 15 × 6 ＝ 90" : "C(10,6) ＝ C(10,4) ＝ 210"}${at >= 0 ? `　いまの道は ${at + 1} 番目` : ""}</span></span></div>
          <p class="cap">${only === "A" ? "S から A までは右4・下2(6歩のうち右にする4歩を選ぶ=C(6,2)=15通り)、A から T までは右2・下2(C(4,2)=6通り)。両方つなぐので 15×6 です。" : "10歩のうち、右にする6歩の選び方が道の数です。下にする4歩を選んでも同じ C(10,4) になります。"}</p>`;
        ST.wireSeg(el, "only", v => { only = v; path = list()[0]; draw(); });
        el.querySelector("[data-r]").onclick = () => { if (path.split("R").length - 1 < W && path.length < W + H) { path += "R"; draw(); } };
        el.querySelector("[data-d]").onclick = () => { if (path.split("D").length - 1 < H && path.length < W + H) { path += "D"; draw(); } };
        el.querySelector("[data-undo]").onclick = () => { path = path.slice(0, -1); draw(); };
        el.querySelector("[data-clear]").onclick = () => { path = ""; draw(); };
        el.querySelector("[data-next]").onclick = () => { const i = L.indexOf(path); path = L[(i + 1) % L.length]; draw(); ST.markLab("lattice"); };
        el.querySelector("[data-walk]").onclick = async () => {
          busy = true;
          for (let k = 0; k <= path.length && alive; k++) { run = k; draw(); await ST.sleep(450); }
          if (!alive) return; busy = false; run = null; draw(); ST.markLab("lattice");
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
