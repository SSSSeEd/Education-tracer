"use strict";
/* Lab for 演習2.16 / 2.17: choose from two groups (men/women, blue/red socks).
   Every selection is listed; "count them all" runs through them with a running counter, so the answer is a number you watched grow. */
(function (ST) {
  const SET = {
    class: { who: "クラスの10人(男6・女4)", a: "男", b: "女", na: 6, nb: 4, mark: "👤" },
    socks: { who: "靴下14足(青8・赤6)", a: "青", b: "赤", na: 8, nb: 6, mark: "🧦" }
  };
  const MODES = {
    class: [
      ["a", "(a) 4人選ぶ", () => ST.combIdx(10, 4), "C(10,4) ＝ 10·9·8·7 ÷ 4·3·2·1 ＝ 210", "男女を問わず4人。選ぶだけで順序は区別しないので、組合せ C(10,4) です。"],
      ["b", "(b) 男2・女2", () => { const m = ST.combIdx(6, 2), w = ST.combIdx(4, 2), o = []; m.forEach(x => w.forEach(y => o.push([...x, ...y.map(i => i + 6)]))); return o; }, "C(6,2) × C(4,2) ＝ 15 × 6 ＝ 90", "「男子2人を選ぶ」かつ「女子2人を選ぶ」。男子の選び方15通りのそれぞれに、女子の選び方6通りが組み合わさるので、掛け算です。"],
      ["c", "(c) 委員長・副・会計", () => ST.permIdx(10, 3), "P(10,3) ＝ 10 × 9 × 8 ＝ 720", "同じ3人でも、役が違えば別の決め方です。順序を区別するので順列 P(10,3) です。"]
    ],
    socks: [
      ["a", "(a) 色を問わず2足", () => ST.combIdx(14, 2), "C(14,2) ＝ 14·13 ÷ 2·1 ＝ 91", "14足から2足を選ぶだけ。色は気にしないので C(14,2) です。"],
      ["b", "(b) 同じ色の2足", () => [...ST.combIdx(8, 2), ...ST.combIdx(6, 2).map(c => c.map(i => i + 8))], "C(8,2) ＋ C(6,2) ＝ 28 ＋ 15 ＝ 43", "「青を2足」または「赤を2足」。どちらか一方なので、場合ごとに数えて足し算です(両方同時にはなりません)。"]
    ]
  };

  ST.widget("committee", {
    title: "グループから選ぶ:委員会と靴下(演習2.16・2.17)",
    group: "comb", name: "グループから選ぶ", desc: "委員・靴下の選び方を全部書き出して、掛け算・足し算を確かめる", order: 7,
    tag: "演習2.16・2.17",
    formula: "かつ → C(6,2) × C(4,2)　または → C(8,2) ＋ C(6,2)　役つき → P(10,3)",
    says: "2つのグループから選ぶときは、「両方から選ぶ」なら掛け算、「どちらか一方」なら足し算。役を決めるなら順列です。",
    meaning: "選び方の全部を書き出して、1つずつ数えています。式の答えと、数えた数が一致することを確かめてください。",
    mount(el) {
      let set = "class", mode = "a", idx = 0, alive = true, busy = false, counted = null;
      const draw = () => {
        const S = SET[set], modes = MODES[set];
        if (!modes.find(m => m[0] === mode)) mode = modes[0][0];
        const M = modes.find(m => m[0] === mode), all = M[2](), total = all.length;
        if (idx >= total) idx = 0;
        const sel = all[idx], n = S.na + S.nb;
        const label = i => i < S.na ? `${S.a}${i + 1}` : `${S.b}${i - S.na + 1}`;
        const dots = Array.from({ length: n }, (_, i) => {
          const k = sel.indexOf(i), on = k >= 0, col = i < S.na ? "var(--info)" : "var(--attack)";
          const role = on && mode === "c" ? `<span style="display:block;font:700 11px var(--f-mono)">${["長", "副", "会"][k]}</span>` : "";
          return `<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:46px;height:50px;margin:3px;border-radius:12px;border:2.5px solid ${col};background:${on ? col : "var(--surface)"};color:${on ? "var(--surface)" : col};font:700 14px var(--f-mono);${on ? "" : "opacity:.5"}">${label(i)}${role}</span>`;
        }).join("");
        const chosen = sel.map((i, k) => (mode === "c" ? ["委員長", "副委員長", "会計係"][k] + "=" : "") + label(i)).join(mode === "c" ? "、" : " ・ ");
        el.innerHTML = `<div><p class="lab-label">場面</p>${ST.segHtml("set", [["class", "委員会(2.16)"], ["socks", "靴下(2.17)"]], set)}</div>
          <div><p class="lab-label">問題</p>${ST.segHtml("mode", modes.map(m => [m[0], m[1]]), mode)}</div>
          <div class="stage" style="padding:8px 6px"><p class="cap" style="margin:0 0 4px">${S.who}。色のついた丸が、いま選ばれている人(靴下)です。</p><div>${dots}</div></div>
          <div class="lab-big" aria-live="polite"><b>${counted == null ? total : counted}</b><span>${counted == null ? "通り" : `通り目まで数えた(全部で ${total})`}　<span class="cap" style="font-size:15px">${M[3]}</span></span></div>
          <p style="margin:0;font-size:16px"><b>${idx + 1} 番目</b>の選び方: ${chosen}</p>
          <div class="btns three"><button type="button" class="btn primary" data-play ${busy ? "disabled" : ""}>▶ 全部数える</button><button type="button" class="btn" data-prev ${busy ? "disabled" : ""}>‹ 前</button><button type="button" class="btn" data-next ${busy ? "disabled" : ""}>次 ›</button></div>
          <p class="cap">${M[4]}</p>`;
        ST.wireSeg(el, "set", v => { set = v; mode = "a"; idx = 0; counted = null; draw(); });
        ST.wireSeg(el, "mode", v => { mode = v; idx = 0; counted = null; draw(); ST.markLab("committee"); });
        el.querySelector("[data-prev]").onclick = () => { idx = (idx + total - 1) % total; counted = null; draw(); };
        el.querySelector("[data-next]").onclick = () => { idx = (idx + 1) % total; counted = null; draw(); };
        el.querySelector("[data-play]").onclick = async () => {
          busy = true; counted = 1; draw();
          const ok = await ST.countRun(total, i => { idx = i; counted = i + 1; draw(); busy = true; el.querySelectorAll("button").forEach(b => b.disabled = true); }, () => alive);
          if (!ok) return;
          busy = false; counted = null; draw(); ST.markLab("committee");
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
