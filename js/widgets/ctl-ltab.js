"use strict";
/* Lab for ラプラス変換表の使い方 (第3回・第4回): F(s) を表の行に合わせて逆変換する。
   時間とともに ① F(s) を出す → ② 該当する行へ線が伸びる → ③ 係数を整えて表の形にする → ④ 答え。
   答えは数値でも確かめる(答えの f(t) を数値でラプラス変換して s＝2 の F と比べる)。 */
(function (ST) {
  const ctl = ST.ctl, T = 5, E = Math.exp;
  /* 表: 行ごとの f(t) と F(s) */
  const ROWS = [
    { f: "1", F: "1/s" }, { f: "t", F: "1/s²" }, { f: "eᵃᵗ", F: "1/(s − a)" }, { f: "t·eᵃᵗ", F: "1/(s − a)²" },
    { f: "sin ωt", F: "ω/(s² ＋ ω²)" }, { f: "cos ωt", F: "s/(s² ＋ ω²)" }
  ];
  const EX = {
    e1: { name: "例A 係数をくくる", F: "6 / (2s ＋ 4)", Fv: s => 6 / (2 * s + 4), row: 2,
      steps: ["分母から 2 をくくる: 6/(2(s ＋ 2)) ＝ 3/(s ＋ 2)", "表の 1/(s − a) と比べて、a ＝ −2(s ＋ 2 ＝ s − (−2))"], ans: "3e^(−2t)", f: t => 3 * E(-2 * t) },
    e2: { name: "例B 分子を ω にそろえる", F: "5 / (s² ＋ 9)", Fv: s => 5 / (s * s + 9), row: 4,
      steps: ["9 ＝ 3² なので ω ＝ 3。表の分子は ω ＝ 3 なのに、いまは 5", "5 ＝ (5/3)·3 と分けて、5/(s²＋9) ＝ (5/3)·3/(s²＋3²)"], ans: "(5/3) sin 3t", f: t => 5 / 3 * Math.sin(3 * t) },
    e3: { name: "例C s が分子にある", F: "4s / (s² ＋ 16)", Fv: s => 4 * s / (s * s + 16), row: 5,
      steps: ["分子に s があるので cos の行。16 ＝ 4² なので ω ＝ 4", "4s/(s²＋4²) ＝ 4·s/(s²＋4²)。4 はそのまま前に出る"], ans: "4 cos 4t", f: t => 4 * Math.cos(4 * t) },
    e4: { name: "例D 分母が2乗", F: "2 / (s² ＋ 6s ＋ 9)", Fv: s => 2 / (s * s + 6 * s + 9), row: 3,
      steps: ["分母を因数分解: s² ＋ 6s ＋ 9 ＝ (s ＋ 3)²", "表の 1/(s − a)² と比べて、a ＝ −3。2 はそのまま前に出る"], ans: "2t·e^(−3t)", f: t => 2 * t * E(-3 * t) }
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  ST.widget("ltab", {
    title: "ラプラス変換の表を引く:該当行へ線がのび、係数をととのえる",
    group: "ctl", name: "ラプラス変換の表を引く", desc: "F(s) を表の行に合わせる流れ(線がのびる→係数をととのえる→答え)", order: 12, tag: "逆ラプラス変換",
    formula: "$F(s) = k \\times$(表の F)　⇒　$f(t) = k \\times$(表の f)",
    says: "逆変換は表を逆に引きます。F(s) の形に合う行を見つけ、係数(定数倍)を表の形にそろえます。定数 k は、変換しても逆変換しても、そのまま前に出ます。",
    meaning: "「分母の形で行を決める → 分子や分母の係数を表の形にそろえる(定数倍を前に出す)」の2段です。表に合わない形は、部分分数に分ければ、各項が表の行に合います。",
    mount(el) {
      let key = "e1", ply = null;
      el.innerHTML = `<div><p class="lab-label">例題</p>${ST.segHtml("ex", Object.entries(EX).map(([k, x]) => [k, x.name]), key)}</div>
        <div data-ply></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 196" style="width:100%;display:block" role="img" aria-label="F(s) から表の該当行へ線がのびる図" data-sv></svg></div>
        <div class="hexbox" data-steps style="font-size:13px;min-height:40px"></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), sv = $("[data-sv]"), st = $("[data-steps]"), big = $("[data-big]"), cap = $("[data-cap]");
      const draw = t => {
        const ex = EX[key], p = clamp(t - 1, 0, 1.4) / 1.4, fx = 126, fy = 98, rx = 188, ry = i => 28 + i * 25;
        let s = `<text x="8" y="14" class="svg-m" style="font-size:10px">① F(s)</text><text x="${rx}" y="14" class="svg-m" style="font-size:10px">表(f(t) → F(s))</text>`;
        s += `<rect x="6" y="${fy - 24}" width="120" height="48" rx="6" fill="var(--surface)" stroke="var(--info)" stroke-width="2"/><text x="66" y="${fy + 5}" text-anchor="middle" class="svg-t" style="font-size:${ex.F.length > 14 ? 11.5 : 14}px;font-weight:700">${ST.esc(ex.F)}</text>`;
        ROWS.forEach((r, i) => {
          const hit = i === ex.row && p >= 1;
          s += `<rect x="${rx}" y="${ry(i) - 10}" width="146" height="22" rx="4" fill="${hit ? "var(--packet)" : "var(--sunken)"}" opacity="${hit ? ".9" : "1"}" stroke="${hit ? "var(--ink)" : "var(--line)"}"/><text x="${rx + 6}" y="${ry(i) + 5}" class="svg-t" style="font-size:10.5px;font-weight:${hit ? 700 : 500}" fill="${hit ? "var(--ink)" : "var(--muted)"}">${ST.esc(r.f)} → ${ST.esc(r.F)}</text>`;
        });
        if (p > 0) { const tx = fx + (rx - fx) * p, ty = fy + (ry(ex.row) - fy) * p; s += `<line x1="${fx}" y1="${fy}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="var(--packet)" stroke-width="3" stroke-linecap="round"/><circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="4" fill="var(--packet)"/>`; }
        s += `<text x="8" y="188" class="svg-m" style="font-size:10px">${p >= 1 ? "② 該当する行が決まりました" : t < 1 ? "まず F(s) を表と見比べます" : "② 表の行を探しています…"}</text>`;
        sv.innerHTML = s;
        const n = ex.steps.length, shown = clamp(Math.floor((t - 2.4) / 1.1) + 1, 0, n);
        st.innerHTML = ST.am(ex.steps.map((x, i) => `<span style="${i < shown ? "" : "opacity:.18"}">③${i + 1}. ${x}</span>`).join("<br>"));
        const done = t >= 4.6;
        big.innerHTML = ST.am(done ? `<b>f(t) ＝ ${ex.ans}</b><span>表の行に合わせて逆変換しました</span>` : `<b>${shown ? "係数をととのえ中…" : "行を探し中…"}</b><span>▶ で最初から動かせます</span>`);
      };
      const check = () => {
        const ex = EX[key], ln = ctl.laplaceNum(ex.f, 2), Fv = ex.Fv(2);
        cap.innerHTML = ST.am(`確かめ: 答えの f(t) を ∫f(t)e^(−st)dt で s＝2 として数値計算すると ${ctl.n(ln, 4)}、F(2) ＝ ${ctl.n(Fv, 4)}。${Math.abs(ln - Fv) < 1e-3 ? "一致しています。" : "ずれています。"}`);
      };
      ply = ctl.player($("[data-ply]"), { T, draw });
      check(); ply.restart();
      ST.wireSeg(el, "ex", v => { key = v; check(); ply.restart(); ST.markLab("ltab"); });
      return () => ply.stop();
    }
  });
})(window.ST);
