"use strict";
/* Lab for 方程式の解の個数 (第5回 問1〜4): x+y+z=n counted as 重複組合せ. Modes: 0以上 / 1以上 / n以下 / 下限つき. */
(function (ST) {
  const NAMES = "xyzw";
  const sub = s => String(s).replace(/\d/g, d => "₀₁₂₃₄₅₆₇₈₉"[d]);
  const MODES = [["nonneg", "0以上"], ["pos", "1以上"], ["atmost", "n以下(≦)"], ["lower", "下限つき"]];
  const LOW = [2, 1, 0, 0];
  /* All non-negative solutions of sum(v) = total over len variables, in lexicographic order. */
  const comps = (len, total) => { if (len === 1) return [[total]]; const out = []; for (let a = 0; a <= total; a++) comps(len - 1, total - a).forEach(r => out.push([a, ...r])); return out; };

  ST.widget("heq", {
    title: "方程式の解の個数:x + y + z = n を ₖHₙ で数える",
    group: "comb", name: "方程式の解の個数", desc: "問1〜4:a+b+c+d=8 の解、1以上・以下・下限つき", order: 17, tag: "問1〜4",
    formula: "$x_{1}+$…$+x_{k} = n$ の0以上の整数解の数 $= {}_{k}H_{n} = C(n+k-1, n)$",
    says: "k 個の変数の合計が n になる0以上の整数の組の数は、k 種類から重複を許して n 個選ぶ数 ${}_{k}H_{n}$ と同じです。",
    meaning: "x, y, z が「3人がもらうコインの枚数」だと考えます。n 枚を3人で分ける方法と同じなので、仕切り棒で数えられます。条件がつくときは、先に配っておく(1以上なら1枚ずつ、下限があればその分)か、余りを表す変数を1つ足して、0以上の形に直します。",
    mount(el) {
      let k = 3, n = 8, mode = "nonneg", cur = 0, alive = true, busy = false;
      const draw = () => {
        const lows = mode === "pos" ? Array(k).fill(1) : mode === "lower" ? LOW.slice(0, k) : Array(k).fill(0);
        const m = lows.reduce((a, b) => a + b, 0);
        const slack = mode === "atmost";
        const vars = k + (slack ? 1 : 0), total = n - m;
        const sols = total >= 0 ? comps(vars, total).map(s => s.map((v, i) => v + (lows[i] || 0))) : [];
        if (cur >= sols.length) cur = 0;
        const s = sols[cur] || [];
        const eq = NAMES.slice(0, k).split("").join(" + ") + (slack ? " ≦ " : " = ") + n;
        const cond = mode === "pos" ? "(どれも1以上)" : mode === "lower" ? "(" + lows.map((l, i) => l ? NAMES[i] + "≧" + l : "").filter(Boolean).join("、") + "、他は0以上)" : mode === "atmost" ? "(0以上)" : "(0以上)";
        let how;
        if (mode === "nonneg") how = `${k}種類から ${n} 個を重複を許して選ぶ → ${sub(k)}H${sub(n)} ＝ C(${n + k - 1},${n}) ＝ <b>${ST.C(n + k - 1, n)}</b>`;
        else if (mode === "pos") how = `先に1ずつ配ると、残り ${n - k} を ${k} 人で分ける → ${sub(k)}H${sub(n - k)} ＝ C(${n - 1},${k - 1}) ＝ <b>${ST.C(n - 1, k - 1)}</b>`;
        else if (mode === "atmost") how = `余り w を足して ${NAMES.slice(0, k).split("").join(" + ")} + w = ${n}。変数は ${k + 1} 個 → ${sub(k + 1)}H${sub(n)} ＝ C(${n + k},${n}) ＝ <b>${ST.C(n + k, n)}</b>`;
        else how = `下限の合計 ${m} を先に配ると、残り ${n - m} を ${k} 人で分ける → ${sub(k)}H${sub(n - m)} ＝ C(${n - m + k - 1},${k - 1}) ＝ <b>${ST.C(n - m + k - 1, k - 1)}</b>`;
        const bars = (vals) => vals.slice(0, k).map((v, i) => {
          const base = lows[i];
          return `<span style="white-space:nowrap">${`<span style="color:var(--muted)">●</span>`.repeat(Math.min(base, v))}${`<span class="ch-chip hot" style="padding:0 5px">○</span>`.repeat(v - Math.min(base, v))}</span>`;
        }).join(`<span style="color:var(--attack);font:700 20px var(--f-mono)"> ｜ </span>`);
        const label = vals => vals.slice(0, k).map((v, i) => `${NAMES[i]}=<b>${v}</b>`).join("　") + (slack ? `　余り w=<b>${vals[k]}</b>` : "");
        el.innerHTML = `<div style="display:grid;gap:10px">
            <div><p class="lab-label">変数の数</p>${ST.segHtml("k", [[2, "2個"], [3, "3個"], [4, "4個"]], k)}</div>
            <div><p class="lab-label">右辺 n</p>${ST.segHtml("n", [[4, "4"], [6, "6"], [8, "8"], [10, "10"]], n)}</div>
            <div><p class="lab-label">条件</p>${ST.segHtml("mode", MODES, mode)}</div></div>
          <div class="stage" style="padding:10px 8px;text-align:center"><div style="font-size:17px;margin-bottom:6px"><b>${eq}</b> <span class="cap">${cond}</span></div>
            <div class="sol-bars" style="line-height:2.1">${s.length ? bars(s) : "解がありません"}</div>
            <div class="sol-label" style="font-size:16px;margin-top:4px">${s.length ? label(s) : ""}</div>
            ${mode !== "nonneg" && m ? `<div class="cap">● は先に配っておく分(下限)、○ は残りを分けた分</div>` : ""}</div>
          <div class="lab-big" aria-live="polite"><b>${sols.length}</b><span>組　<span class="cap" style="font-size:15px">${sols.length ? "(" + (cur + 1) + " 組目を表示中)" : ""}</span></span></div>
          <p class="cap">${how}</p>
          <div class="btns three"><button type="button" class="btn primary" data-run ${busy ? "disabled" : ""}>▶ 全部数える</button><button type="button" class="btn" data-prev ${busy ? "disabled" : ""}>‹ 前の解</button><button type="button" class="btn" data-next ${busy ? "disabled" : ""}>次の解 ›</button></div>`;
        ST.wireSeg(el, "k", v => { k = +v; cur = 0; draw(); });
        ST.wireSeg(el, "n", v => { n = +v; cur = 0; draw(); });
        ST.wireSeg(el, "mode", v => { mode = v; cur = 0; draw(); ST.markLab("heq"); });
        const N = sols.length;
        el.querySelector("[data-next]").onclick = () => { if (N) { cur = (cur + 1) % N; draw(); ST.markLab("heq"); } };
        el.querySelector("[data-prev]").onclick = () => { if (N) { cur = (cur - 1 + N) % N; draw(); } };
        el.querySelector("[data-run]").onclick = async () => {
          if (!N) return; busy = true;
          const ok = await ST.countRun(N, i => {
            const c = el.querySelector(".lab-big b"); if (c) c.textContent = i + 1;
            const a = el.querySelector(".sol-bars"), b = el.querySelector(".sol-label");
            if (a) a.innerHTML = bars(sols[i]); if (b) b.innerHTML = label(sols[i]);
          }, () => alive, 90);
          if (!alive) return; busy = false; cur = N - 1; draw(); if (ok) ST.markLab("heq");
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
