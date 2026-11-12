"use strict";
/* Lab for ラプラス変換表の使い方 (第3回・第4回): F(s) を表の行に合わせて逆変換する。
   表は教科書の左右2列の表を、グループごとに色分け・折りたたみにした(_lap.js)。威圧感を減らすため、最初は閉じていて、
   使う行のグループだけが開いて行が光る。① F(s) を出す → ② 該当する行が光る → ③ 係数を整えて表の形にする → ④ 答え。
   答えは数値でも確かめる(答えの f(t) を数値でラプラス変換して s＝2 の F と比べる)。 */
(function (ST) {
  const ctl = ST.ctl, E = Math.exp;
  /* row: _lap.js の行のキー。表は e^(−at) ↔ 1/(s＋a) の形(教科書の表)で引く。 */
  const EX = {
    e1: { name: "例A 係数をくくる", F: "\\frac{6}{2s+4}", Fv: s => 6 / (2 * s + 4), row: "exp",
      steps: ["分母から 2 をくくる: $\\frac{6}{2(s+2)} = \\frac{3}{s+2}$", "表の $\\frac{1}{s+a}$ と比べて、$a = 2$。3 はそのまま前に出る"], ans: "3e^{-2t}", f: t => 3 * E(-2 * t) },
    e2: { name: "例B 分子を ω にそろえる", F: "\\frac{5}{s^{2}+9}", Fv: s => 5 / (s * s + 9), row: "sin",
      steps: ["$9 = 3^{2}$ なので $\\omega = 3$。表の分子は $\\omega = 3$ なのに、いまは 5", "$5 = \\frac{5}{3} \\cdot 3$ と分けて、$\\frac{5}{s^{2}+9} = \\frac{5}{3} \\cdot \\frac{3}{s^{2}+3^{2}}$"], ans: "\\frac{5}{3}\\sin 3t", f: t => 5 / 3 * Math.sin(3 * t) },
    e3: { name: "例C s が分子にある", F: "\\frac{4s}{s^{2}+16}", Fv: s => 4 * s / (s * s + 16), row: "cos",
      steps: ["分子に s があるので cos の行。$16 = 4^{2}$ なので $\\omega = 4$", "$\\frac{4s}{s^{2}+4^{2}} = 4 \\cdot \\frac{s}{s^{2}+4^{2}}$。4 はそのまま前に出る"], ans: "4\\cos 4t", f: t => 4 * Math.cos(4 * t) },
    e4: { name: "例D 分母が2乗", F: "\\frac{2}{s^{2}+6s+9}", Fv: s => 2 / (s * s + 6 * s + 9), row: "texp",
      steps: ["分母を因数分解: $s^{2}+6s+9 = (s+3)^{2}$", "表の $\\frac{1}{(s+a)^{2}}$ と比べて、$a = 3$。2 はそのまま前に出る"], ans: "2t e^{-3t}", f: t => 2 * t * E(-3 * t) }
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  ST.widget("ltab", {
    title: "ラプラス変換の表を引く:該当する行が光り、係数をととのえる",
    group: "ctl", name: "ラプラス変換の表を引く", desc: "F(s) を表の行に合わせる流れ(行が光る→係数をととのえる→答え)。表は色分け・折りたたみ", order: 12, tag: "逆ラプラス変換",
    formula: "$F(s) = k \\times$(表の F)　⇒　$f(t) = k \\times$(表の f)",
    says: "逆変換は表を逆に引きます。F(s) の形に合う行を見つけ、係数(定数倍)を表の形にそろえます。定数 k は、変換しても逆変換しても、そのまま前に出ます。",
    meaning: "「分母の形で行を決める → 分子や分母の係数を表の形にそろえる(定数倍を前に出す)」の2段です。表は全部を覚える必要はなく、色のグループ(基本・べき・指数・振動)を知っていれば、使う行だけ開けば十分です。",
    mount(el) {
      let key = "e1", setActive = null;
      el.innerHTML = `<div><p class="lab-label">例題</p>${ST.segHtml("ex", Object.entries(EX).map(([k, x]) => [k, x.name]), key)}</div>
        <div class="card" style="padding:10px"><div class="eyebrow">① 逆変換したい F(s)</div><div data-F style="font-size:18px;margin-top:4px"></div></div>
        <div><p class="lab-label">② 表(色のグループをタップすると開きます)</p><div data-tab></div></div>
        <div class="hexbox" data-steps style="font-size:14px;min-height:40px;line-height:1.9"></div>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const $ = s => el.querySelector(s), st = $("[data-steps]"), big = $("[data-big]"), cap = $("[data-cap]");
      $("[data-tab]").innerHTML = ctl.lapTable();
      setActive = ctl.wireLapTable($("[data-tab]"));
      const draw = () => {
        const ex = EX[key];
        setActive(ex.row);
        $("[data-F]").innerHTML = `${ST.tex("F(s) = " + ex.F, true)}`;
        st.innerHTML = ex.steps.map((x, i) => `③${i + 1}. ${ST.md(x)}`).join("<br>");
        big.innerHTML = `<b>${ST.tex("f(t) = " + ex.ans, true)}</b><span>表の行に合わせて逆変換しました</span>`;
      };
      const check = () => {
        const ex = EX[key], ln = ctl.laplaceNum(ex.f, 2), Fv = ex.Fv(2);
        cap.innerHTML = ST.md(`確かめ: 答えの f(t) を数値でラプラス変換して $s = 2$ とすると ${ctl.n(ln, 4)}、$F(2) = ${ctl.n(Fv, 4)}$。${Math.abs(ln - Fv) < 1e-3 ? "一致しています。" : "ずれています。"}`);
      };
      draw(); check();
      ST.wireSeg(el, "ex", v => { key = v; draw(); check(); ST.markLab("ltab"); });
    }
  });
})(window.ST);
