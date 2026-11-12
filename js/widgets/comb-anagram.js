"use strict";
/* Lab for 重複順列 P(n: n1,...,nr) = n! / (n1! ... nr!): list every distinct rearrangement of a word and compare with n!. */
(function (ST) {
  const PRESETS = [
    { k: "0", word: "BABBY", label: "BABBY", note: "資料の最初の例" },
    { k: "1", word: "BENZENE", label: "BENZENE", note: "資料 例2.5" },
    { k: "2", word: "カツコイイイカ", label: "カツコイイイカ", note: "資料 問1(Claudeが解いた)" },
    { k: "3", word: "RRRRRRDDDD", label: "RとD(格子)", note: "演習7:右6回・下4回" },
    { k: "4", word: "", label: "自分で", note: "7文字まで" }
  ];
  const sup = k => String(k).split("").map(c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c]).join("");
  const distinct = chars => {
    const cnt = new Map(); chars.forEach(c => cnt.set(c, (cnt.get(c) || 0) + 1));
    const keys = [...cnt.keys()].sort(), out = [], n = chars.length, cur = [];
    (function rec() {
      if (cur.length === n) { out.push(cur.join("")); return; }
      for (const k of keys) if (cnt.get(k) > 0) { cnt.set(k, cnt.get(k) - 1); cur.push(k); rec(); cur.pop(); cnt.set(k, cnt.get(k) + 1); }
    })();
    return out;
  };

  ST.widget("anagram", {
    title: "並べ替え(重複順列):同じ文字があると何通り減るか",
    group: "comb", name: "並べ替え(重複順列)", desc: "BENZENE など。n! を「同じものの並べ替え」で割る", order: 13, tag: "重複順列",
    formula: "P(n: $n_{1},n_{2}$,…,$n_{r}$) $= n! \\div$ ($n_{1}! \\times n_{2}! \\times$ … $\\times n_{r}!$)",
    says: "r 種類のものが、それぞれ $n_{1}, n_{2}$, …, $n_{r}$ 個あるときの並べ方の数です(合計 n 個)。",
    meaning: "全部ちがうものとして並べると $n!$ 通りですが、同じ文字どうしを入れ替えても見た目は変わりません。同じ文字が k 個あれば、見た目が同じ並べ方が $k!$ 通りずつ重なっているので、$k!$ で割ります。",
    mount(el) {
      let sel = "1", custom = "ABCAB", pos = 0, alive = true, busy = false;
      const word = () => (sel === "4" ? custom : PRESETS[+sel].word);
      const draw = () => {
        const chars = Array.from(word()), n = chars.length;
        const cnt = new Map(); chars.forEach(c => cnt.set(c, (cnt.get(c) || 0) + 1));
        const groups = [...cnt.entries()];
        const nf = ST.fact(n), den = groups.reduce((a, [, k]) => a * ST.fact(k), 1), total = n ? nf / den : 0;
        const list = n ? distinct(chars) : [];
        if (pos >= list.length) pos = 0;
        const cur = list[pos] || "";
        const denTxt = groups.map(([, k]) => k + "!").join(" × ");
        el.innerHTML = `<div><p class="lab-label">文字列</p>${ST.segHtml("w", PRESETS.map(p => [p.k, p.label]), sel)}
          ${sel === "4" ? `<input id="cw" value="${custom}" maxlength="7" aria-label="並べ替える文字列(7文字まで)" style="margin-top:8px;width:100%;font:600 18px var(--f-mono);padding:8px 10px;border:1.5px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink)">` : `<p class="cap">${PRESETS[+sel].note}</p>`}</div>
          <div class="hexbox" style="padding:8px"><div>${chars.map(c => `<span class="ch-chip">${c}</span>`).join("") || '<span class="cap">文字を入れてください</span>'}</div>
            <div class="cap" style="margin-top:4px">${groups.map(([c, k]) => `${c}：${k}個`).join("　")}</div></div>
          <div class="lab-big" aria-live="polite"><b>${total}</b><span>通り　<span class="cap" style="font-size:15px">${n ? `${n}! ÷ (${denTxt}) ＝ ${nf} ÷ ${den}` : ""}</span></span></div>
          ${n ? `<p class="cap">全部ちがう文字なら ${n}! ＝ ${nf} 通り。同じ文字の入れ替え ${den} 通りが、見た目では1つに重なります。</p>` : ""}
          <div class="stage" style="padding:10px"><p class="lab-label">いまの並べ方(${list.length ? pos + 1 : 0} / ${list.length} 番目)</p>
            <div style="font:700 26px var(--f-mono);letter-spacing:.12em;text-align:center;word-break:break-all">${cur || "—"}</div></div>
          <div class="btns three"><button type="button" class="btn primary" data-all ${busy || !n ? "disabled" : ""}>▶ 全部数える</button><button type="button" class="btn" data-prev ${busy ? "disabled" : ""}>‹ 前</button><button type="button" class="btn" data-next ${busy ? "disabled" : ""}>次 ›</button></div>
          <div class="hexbox" style="max-height:220px;overflow:auto">${list.slice(0, 160).map((s, i) => `<span class="ch-chip ${i === pos ? "hot" : ""}" style="font-size:14px;padding:2px 7px">${s}</span>`).join("")}${list.length > 160 ? `<span class="cap"> …ほか ${list.length - 160} 通り</span>` : ""}</div>`;
        ST.wireSeg(el, "w", v => { sel = v; pos = 0; draw(); ST.markLab("anagram"); });
        const inp = el.querySelector("#cw");
        if (inp) inp.onchange = () => { custom = Array.from(inp.value).slice(0, 7).join(""); pos = 0; draw(); };
        el.querySelector("[data-prev]").onclick = () => { if (list.length) { pos = (pos + list.length - 1) % list.length; draw(); } };
        el.querySelector("[data-next]").onclick = () => { if (list.length) { pos = (pos + 1) % list.length; draw(); } };
        el.querySelector("[data-all]").onclick = async () => {
          busy = true; const btn = el.querySelector("[data-all]"); btn.disabled = true;
          const ok = await ST.countRun(list.length, i => { pos = i; const c = el.querySelector(".lab-big b"); if (c) c.textContent = i + 1; const s = el.querySelector(".stage div:last-child"); if (s) s.textContent = list[i]; }, () => alive, 45);
          if (!alive) return; busy = false; if (ok) pos = list.length - 1; draw(); ST.markLab("anagram");
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
