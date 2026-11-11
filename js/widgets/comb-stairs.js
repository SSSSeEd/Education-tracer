"use strict";
/* Lab for 階段のぼり (第5回 問5〜7): count the ways to climb n stairs with allowed step sizes.
   Mode 1: build up from the bottom (recurrence, Fibonacci). Mode 2: split by how many of each step (重複順列). */
(function (ST) {
  const SETS = { "12": [1, 2], "23": [2, 3], "123": [1, 2, 3] };
  const sub = s => String(s).replace(/\d/g, d => "₀₁₂₃₄₅₆₇₈₉"[d]);
  const dp = (n, steps) => { const r = [1]; for (let i = 1; i <= n; i++) r[i] = steps.reduce((a, s) => a + (i - s >= 0 ? r[i - s] : 0), 0); return r; };
  const paths = (n, steps) => { if (n === 0) return [[]]; const out = []; steps.forEach(s => { if (s <= n) paths(n - s, steps).forEach(p => out.push([s, ...p])); }); return out; };
  /* Counts (x1, x2, ...) of each step size with sum(size * count) = n. */
  const splits = (n, steps) => { if (steps.length === 0) return n === 0 ? [[]] : []; const [s, ...rest] = steps, out = []; for (let x = 0; x * s <= n; x++) splits(n - x * s, rest).forEach(r => out.push([x, ...r])); return out; };
  const multi = xs => { let rem = xs.reduce((a, b) => a + b, 0), c = 1; xs.forEach(x => { c *= ST.C(rem, x); rem -= x; }); return c; };

  ST.widget("stairs", {
    title: "階段のぼり:1段・2段・3段のぼりで何通り?",
    group: "comb", name: "階段のぼり", desc: "問5〜7:15段を1段・2段でのぼる→987通り(フィボナッチ)", order: 18, tag: "問5〜7",
    formula: "r(n) ＝ r(n−1) ＋ r(n−2)　(1段・2段のとき)　15段 → 987 通り",
    says: "最後の1歩が1段なら残り n−1 段、2段なら残り n−2 段。だから n 段ののぼり方は、その2つの場合の合計です。",
    meaning: "1段・2段でのぼる数は 1, 2, 3, 5, 8, 13, … とフィボナッチ数列になります。別の数え方もあります。1段を x 回・2段を y 回として x+2y = n の解ごとに、並べ方 (x+y)!÷(x!y!) を足しても同じ数になります。",
    mount(el) {
      let n = 6, setKey = "12", mode = "dp", cur = 0, alive = true, busy = false;
      const draw = () => {
        const steps = SETS[setKey], r = dp(n, steps), total = r[n];
        const all = total <= 6000 ? paths(n, steps) : [];
        if (cur >= all.length) cur = 0;
        const p = all[cur] || [];
        const svg = path => {
          const sx = 324 / (n + 1), sy = 108 / n, X0 = 8 + sx, Y = 132;
          let d = `M8 ${Y} h${sx}`; for (let i = 1; i <= n; i++) d += ` v${-sy} h${sx}`;
          const pos = [0]; path.forEach(s => pos.push(pos[pos.length - 1] + s));
          const px = q => X0 + (q - 0.5) * sx, py = q => Y - q * sy - 7;
          const col = { 1: "var(--c1)", 2: "var(--c6)", 3: "var(--c3)" };
          const hops = path.map((s, i) => { const x1 = px(pos[i]), y1 = py(pos[i]), x2 = px(pos[i + 1]), y2 = py(pos[i + 1]); return `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 12 - 4 * s} ${x2} ${y2}" fill="none" stroke="${col[s]}" stroke-width="2.4"/>`; }).join("");
          const dots = pos.map(q => `<circle cx="${px(q)}" cy="${py(q)}" r="3.4" fill="var(--ink)"/>`).join("");
          return `<svg viewBox="0 0 340 150" role="img" aria-label="階段のぼりの図" style="width:100%;display:block"><path d="${d}" fill="none" stroke="var(--muted)" stroke-width="1.6"/>${hops}${dots}</svg>`;
        };
        const pathText = pp => pp.length ? pp.join("－") : "(なし)";
        let body;
        if (mode === "dp") {
          const vals = steps.map(s => n - s >= 0 ? r[n - s] : 0);
          const chips = r.slice(1).map((v, i) => `<span class="ch-chip${i + 1 === n ? " hot" : ""}" style="font-size:14px;padding:2px 7px" title="${i + 1}段">${i + 1}段:${v}</span>`).join("");
          body = `<p class="cap">下の段から順に数えます。r(${n}) ＝ ${steps.map(s => `r(${n - s})`).join(" ＋ ")} ＝ ${vals.join(" ＋ ")} ＝ <b>${total}</b>(r(0) ＝ 1 とする)。</p>
            <div class="hexbox" style="line-height:2.1">${chips}</div>`;
        } else {
          const rows = splits(n, steps).map(xs => ({ xs, c: multi(xs) }));
          const lab = xs => xs.map((x, i) => `${steps[i]}段×${x}`).join("、");
          const eqn = steps.map((s, i) => (s === 1 ? "" : s) + "xyz"[i]).join(" + ");
          body = `<p class="cap">${eqn} ＝ ${n} の0以上の整数解 ${rows.length} 組(各段をそれぞれ何回使うか)。1組ごとに、並べ方は重複順列 (回数の合計)! ÷ (各回数の階乗の積) です。</p>
            <div class="hexbox" style="max-height:230px;overflow:auto"><table style="border-collapse:collapse;width:100%;font-size:14px">${rows.map(x => `<tr><td style="padding:2px 6px 2px 0">${lab(x.xs)}</td><td style="padding:2px 0;text-align:right">${x.xs.reduce((a, b) => a + b, 0)}! ÷ (${x.xs.map(q => q + "!").join(" × ")}) ＝ <b>${x.c}</b></td></tr>`).join("")}</table></div>
            <p class="cap">合計 ${rows.map(x => x.c).join(" ＋ ")} ＝ <b>${rows.reduce((a, x) => a + x.c, 0)}</b></p>`;
        }
        el.innerHTML = `<div style="display:grid;gap:10px">
            <div><p class="lab-label">のぼり方</p>${ST.segHtml("set", [["12", "1段・2段"], ["23", "2段・3段"], ["123", "1・2・3段"]], setKey)}</div>
            <div><p class="lab-label">階段の段数</p><div style="display:flex;gap:8px;align-items:center"><button type="button" class="btn" data-dec aria-label="1段へらす" ${busy ? "disabled" : ""}>−</button><b style="font-size:22px;min-width:3.2em;text-align:center">${n} 段</b><button type="button" class="btn" data-inc aria-label="1段ふやす" ${busy ? "disabled" : ""}>＋</button></div></div>
            <div><p class="lab-label">数え方</p>${ST.segHtml("mode", [["dp", "下から順に(漸化式)"], ["split", "段の使い方で分ける"]], mode)}</div></div>
          <div class="stage" style="padding:6px 4px;text-align:center">${all.length ? svg(p) : svg([])}
            <div class="path-text" style="font-size:16px">${all.length ? `${cur + 1} 通り目:<b>${pathText(p)}</b>` : "(数が多いので図は省略)"}</div></div>
          <div class="lab-big" aria-live="polite"><b>${total}</b><span>通り　<span class="cap" style="font-size:15px">${n}段を ${steps.join("・")}段でのぼる</span></span></div>
          ${body}
          <div class="btns three"><button type="button" class="btn primary" data-run ${busy || !all.length ? "disabled" : ""}>▶ 全部数える</button><button type="button" class="btn" data-prev ${busy || !all.length ? "disabled" : ""}>‹ 前</button><button type="button" class="btn" data-next ${busy || !all.length ? "disabled" : ""}>次 ›</button></div>`;
        ST.wireSeg(el, "set", v => { setKey = v; cur = 0; draw(); });
        ST.wireSeg(el, "mode", v => { mode = v; draw(); ST.markLab("stairs"); });
        el.querySelector("[data-dec]").onclick = () => { if (n > 1) { n--; cur = 0; draw(); } };
        el.querySelector("[data-inc]").onclick = () => { if (n < 15) { n++; cur = 0; draw(); } };
        const N = all.length;
        el.querySelector("[data-next]").onclick = () => { if (N) { cur = (cur + 1) % N; draw(); ST.markLab("stairs"); } };
        el.querySelector("[data-prev]").onclick = () => { if (N) { cur = (cur - 1 + N) % N; draw(); } };
        el.querySelector("[data-run]").onclick = async () => {
          if (!N) return; busy = true;
          const stage = el.querySelector(".stage");
          const ok = await ST.countRun(N, i => {
            const c = el.querySelector(".lab-big b"); if (c) c.textContent = i + 1;
            stage.innerHTML = svg(all[i]) + `<div class="path-text" style="font-size:16px">${i + 1} 通り目:<b>${pathText(all[i])}</b></div>`;
          }, () => alive, 60);
          if (!alive) return; busy = false; cur = N - 1; draw(); if (ok) ST.markLab("stairs");
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
