"use strict";
/* ラプラス変換表(教科書の左右2列の表)を、威圧感が出ないようにグループごとに色分け・折りたたみにした部品。
   ST.ctl.lapTable() -> html。ST.ctl.wireLapTable(root) が返す関数 setActive(key) で、使う行を光らせる(そのグループは自動で開く)。
   グループの見出し(色つき)をタップすると、行が開く。 */
(function (ST) {
  const ctl = ST.ctl;
  const GROUPS = [
    { id: "basic", name: "基本(定数・単位ステップ)", color: "var(--info)", hint: "1 \\to \\frac{1}{s}", rows: [
      ["delta", "\\delta(t)", "1"], ["one", "1", "\\frac{1}{s}"], ["step", "u(t)", "\\frac{1}{s}"], ["const", "a", "\\frac{a}{s}"]] },
    { id: "power", name: "t のべき(ランプなど)", color: "var(--ok)", hint: "t \\to \\frac{1}{s^{2}}", rows: [
      ["t", "t", "\\frac{1}{s^{2}}"], ["t2", "t^{2}", "\\frac{2}{s^{3}}"], ["tn", "t^{n}", "\\frac{n!}{s^{n+1}}"]] },
    { id: "exp", name: "指数(減っていく)", color: "var(--attack)", hint: "e^{-at} \\to \\frac{1}{s+a}", rows: [
      ["exp", "e^{-at}", "\\frac{1}{s+a}"], ["texp", "t e^{-at}", "\\frac{1}{(s+a)^{2}}"], ["tnexp", "t^{n} e^{-at}", "\\frac{n!}{(s+a)^{n+1}}"]] },
    { id: "trig", name: "sin・cos(振動)", color: "var(--packet)", hint: "\\sin \\omega t \\to \\frac{\\omega}{s^{2}+\\omega^{2}}", rows: [
      ["sin", "\\sin \\omega t", "\\frac{\\omega}{s^{2}+\\omega^{2}}"], ["cos", "\\cos \\omega t", "\\frac{s}{s^{2}+\\omega^{2}}"],
      ["sinp", "\\sin(\\omega t+\\theta)", "\\frac{\\omega \\cos\\theta + s \\sin\\theta}{s^{2}+\\omega^{2}}"], ["cosp", "\\cos(\\omega t+\\theta)", "\\frac{s \\cos\\theta - \\omega \\sin\\theta}{s^{2}+\\omega^{2}}"],
      ["sin2", "\\sin^{2} \\omega t", "\\frac{2\\omega^{2}}{s(s^{2}+4\\omega^{2})}"], ["cos2", "\\cos^{2} \\omega t", "\\frac{s^{2}+2\\omega^{2}}{s(s^{2}+4\\omega^{2})}"]] },
    { id: "damp", name: "減りながら振動(指数 × sin・cos)", color: "var(--muted)", hint: "e^{-at}\\sin \\omega t", rows: [
      ["esin", "e^{-at}\\sin \\omega t", "\\frac{\\omega}{(s+a)^{2}+\\omega^{2}}"], ["ecos", "e^{-at}\\cos \\omega t", "\\frac{s+a}{(s+a)^{2}+\\omega^{2}}"]] },
    { id: "more", name: "その他(t × 三角、sinh・cosh)", color: "var(--ink)", hint: "必要になったら見る", rows: [
      ["tsin", "t \\sin \\omega t", "\\frac{2\\omega s}{(s^{2}+\\omega^{2})^{2}}"], ["tcos", "t \\cos \\omega t", "\\frac{s^{2}-\\omega^{2}}{(s^{2}+\\omega^{2})^{2}}"],
      ["sinh", "\\sinh \\omega t", "\\frac{\\omega}{s^{2}-\\omega^{2}}"], ["cosh", "\\cosh \\omega t", "\\frac{s}{s^{2}-\\omega^{2}}"]] }
  ];
  ctl.LAP_GROUPS = GROUPS;
  const mix = c => `color-mix(in srgb, ${c} 14%, var(--surface))`;
  ctl.lapTable = () => `<div class="lap">${GROUPS.map(g => `<div class="lap-g" data-g="${g.id}" style="border-left:5px solid ${g.color}">
      <button type="button" class="lap-h" aria-expanded="false" style="background:${mix(g.color)}"><span><b>${g.name}</b><span class="lap-hint">${g.id === "more" ? g.hint : ST.tex(g.hint)}</span></span><span class="lap-c" aria-hidden="true">＋</span></button>
      <div class="lap-rows" hidden>${g.rows.map(r => `<div class="lap-r" data-k="${r[0]}"><span>${ST.tex(r[1])}</span><span class="lap-ar">⇄</span><span>${ST.tex(r[2])}</span></div>`).join("")}</div></div>`).join("")}</div>`;
  ctl.wireLapTable = root => {
    const set = (g, open) => { g.querySelector(".lap-h").setAttribute("aria-expanded", open); g.querySelector(".lap-rows").hidden = !open; g.querySelector(".lap-c").textContent = open ? "－" : "＋"; };
    ST.$$(".lap-g", root).forEach(g => g.querySelector(".lap-h").onclick = () => set(g, g.querySelector(".lap-rows").hidden));
    return active => {
      ST.$$(".lap-r", root).forEach(r => r.classList.toggle("on", r.dataset.k === active));
      ST.$$(".lap-g", root).forEach(g => { const has = active && g.querySelector(`[data-k="${active}"]`); g.classList.toggle("dim", !!active && !has); if (active) set(g, !!has); });
    };
  };
})(window.ST);
