"use strict";
/* Lab: 公式の判断演習. 「順番を区別するか」「重複を許すか」の2問に答えると、4分類の表が光る。間違えると判断のサインをハイライトし、条件だけ変えた問題を並べて出す。 */
(function (ST) {
  /* 文中の ⟦o:…⟧ は「順番」のサイン、⟦r:…⟧ は「重複」のサイン。v: [順番を区別するか, 重複を許すか] */
  const SETS = {
    ice: { label: "アイス", n: 5, r: 3, items: [
      { v: [true, false], t: "5種類のアイスから3つ選び、⟦o:下から順に重ねる⟧。⟦r:同じ味は1回だけ⟧使う。" },
      { v: [false, false], t: "5種類のアイスから3つ選び、⟦o:カップに入れる(順番は関係ない)⟧。⟦r:同じ味は1回だけ⟧使う。" },
      { v: [true, true], t: "5種類のアイスから3つ選び、⟦o:下から順に重ねる⟧。⟦r:同じ味を何回使ってもよい⟧。" },
      { v: [false, true], t: "5種類のアイスから3つ選び、⟦o:カップに入れる(順番は関係ない)⟧。⟦r:同じ味を何個選んでもよい⟧。" }
    ] },
    juice: { label: "ジュース", n: 6, r: 2, items: [
      { v: [true, false], t: "6種類のジュースから2本選び、⟦o:飲む順番も決める⟧。⟦r:同じ種類は1本だけ⟧。" },
      { v: [false, false], t: "6種類のジュースから2本選び、⟦o:袋に入れる(順番は関係ない)⟧。⟦r:同じ種類は1本だけ⟧。" },
      { v: [true, true], t: "6種類のジュースから2本選び、⟦o:飲む順番も決める⟧。⟦r:同じ種類を2本選んでもよい⟧。" },
      { v: [false, true], t: "6種類のジュースから2本選び、⟦o:袋に入れる(順番は関係ない)⟧。⟦r:同じ種類を2本選んでもよい⟧。" }
    ] }
  };
  const val = (n, r, ord, rep) => ord ? (rep ? Math.pow(n, r) : ST.fact(n) / ST.fact(n - r)) : (rep ? ST.C(n + r - 1, r) : ST.C(n, r));
  const expr = (n, r, ord, rep) => ord ? (rep ? Array(r).fill(n).join(" × ") + ` ＝ ${n}${sup(r)}` : `${n}P${r} ＝ ${Array.from({ length: r }, (_, i) => n - i).join(" × ")}`) : (rep ? `${n}H${r} ＝ C(${n + r - 1},${r})` : `C(${n},${r})`);
  const sup = k => String(k).replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const NAME = { "true,false": "順列 ₙPᵣ", "false,false": "組合せ ₙCᵣ", "true,true": "重複順列 nʳ", "false,true": "重複組合せ ₙHᵣ" };
  const key = v => v.join(",");

  ST.widget("pick", {
    title: "公式の判断:2つの質問で4つに分ける",
    group: "comb", name: "公式の判断(4分類)", desc: "「順番を区別?」「重複OK?」に答えて公式を選ぶ。条件だけ変えた問題つき", order: 21, tag: "判断演習",
    formula: "順番あり・重複なし ${}_{n}P_{r}$　順番なし・重複なし ${}_{n}C_{r}$　順番あり・重複あり $n^{r}$　順番なし・重複あり ${}_{n}H_{r} = C(n+r-1, r)$",
    says: "n 種類から r 個選ぶ問題は、「順番を区別するか」「同じものを何回選んでもよいか」の2つで、使う公式が決まります。",
    meaning: "まず問題文の「判断のサイン」を探します。「順に並べる・1位2位3位」は順番を区別する、「袋に入れる・委員にする」は区別しない。「1回だけ」は重複なし、「何回でもよい」は重複あり。条件を1つ変えるだけで答えが変わります。",
    mount(el) {
      let setId = "ice", idx = 0, qo = null, qr = null, solved = false, wrong = null, seen = new Set();
      const cur = () => SETS[setId].items[idx];
      const markup = (t, hi) => t.replace(/⟦([or]):([^⟧]*)⟧/g, (_, k, s) => hi && hi.includes(k)
        ? `<mark style="background:var(--warn-soft);color:var(--ink);outline:2px solid var(--warn);border-radius:4px;padding:0 3px">${s}</mark>` : s);
          const cell = (ord, rep, lit, bad) => {
        const S = SETS[setId], v = val(S.n, S.r, ord, rep);
        const bg = lit ? "var(--ok-soft)" : bad ? "var(--attack-soft)" : "var(--surface)";
        const bd = lit ? "var(--ok)" : bad ? "var(--attack)" : "var(--line)";
        return `<div style="border:2px solid ${bd};background:${bg};border-radius:8px;padding:6px 4px;text-align:center;font-size:13px;line-height:1.35"><b>${NAME[key([ord, rep])]}</b><div class="cap" style="font-size:12px">${lit ? expr(S.n, S.r, ord, rep) : ""}</div>${lit ? `<div style="font:700 20px var(--f-mono);color:var(--ok)">${v}</div>` : ""}</div>`;
      };
      const draw = () => {
        const S = SETS[setId], it = cur(), done = qo !== null && qr !== null;
        const right = done && qo === it.v[0] && qr === it.v[1];
        wrong = done && !right ? { o: qo !== it.v[0], r: qr !== it.v[1] } : null;
        solved = right;
        const hi = wrong ? (wrong.o ? "o" : "") + (wrong.r ? "r" : "") : "";
        if (right) seen.add(setId + idx);
        const table = `<div style="display:grid;grid-template-columns:54px 1fr 1fr;gap:6px;align-items:stretch;font-size:12px">
          <div></div><div class="cap" style="text-align:center">重複<b>なし</b></div><div class="cap" style="text-align:center">重複<b>あり</b></div>
          <div class="cap" style="display:flex;align-items:center">順番<b>あり</b></div>${cell(true, false, right && it.v[0] && !it.v[1], done && !right && qo && !qr)}${cell(true, true, right && it.v[0] && it.v[1], done && !right && qo && qr)}
          <div class="cap" style="display:flex;align-items:center">順番<b>なし</b></div>${cell(false, false, right && !it.v[0] && !it.v[1], done && !right && !qo && !qr)}${cell(false, true, right && !it.v[0] && it.v[1], done && !right && !qo && qr)}</div>`;
        const variants = `<div class="hexbox" style="font-size:14px"><div class="cap" style="margin-bottom:4px">条件だけ変えた4問(文は同じで、サインの部分だけ違う)</div>${S.items.map((x, i) => `<div style="padding:6px 0;border-top:1px solid var(--line);${i === idx ? "background:var(--ok-soft);" : ""}"><button type="button" data-go="${i}" style="all:unset;cursor:pointer;display:block;width:100%"><span style="font-size:14px;line-height:1.6">${markup(x.t, "or").replace(/<mark[^>]*>/g, '<u style="text-decoration-color:var(--packet);text-underline-offset:3px">').replace(/<\/mark>/g, "</u>")}</span><br><b>${NAME[key(x.v)]} ＝ ${val(S.n, S.r, x.v[0], x.v[1])}</b></button></div>`).join("")}</div>`;
        el.innerHTML = `<div><p class="lab-label">問題セット</p>${ST.segHtml("set", Object.entries(SETS).map(([k, s]) => [k, s.label]), setId)}</div>
          <div class="card" style="padding:12px;font-size:16px;line-height:1.8"><div class="eyebrow">問題 ${idx + 1} / 4</div>${markup(it.t, hi)}<div style="margin-top:4px"><b>何通り?</b>(n＝${S.n}、r＝${S.r})</div></div>
          <div><p class="lab-label">質問1:選んだ順番を区別する?</p>${ST.segHtml("qo", [["1", "はい(区別する)"], ["0", "いいえ(区別しない)"]], qo === null ? "" : qo ? "1" : "0")}</div>
          <div><p class="lab-label">質問2:同じものを何回選んでもよい?</p>${ST.segHtml("qr", [["1", "はい(重複あり)"], ["0", "いいえ(重複なし)"]], qr === null ? "" : qr ? "1" : "0")}</div>
          ${table}
          ${!done ? `<p class="cap">2つに答えると、表の該当するマスが光ります。</p>`
            : right ? `<div class="verdict good" aria-live="polite">正解!<b> ${NAME[key(it.v)]}</b> ＝ ${expr(S.n, S.r, it.v[0], it.v[1])} ＝ <b>${val(S.n, S.r, it.v[0], it.v[1])}</b> 通り</div>${variants}<div class="btns two"><button type="button" class="btn primary" data-next>次の問題 ›</button><button type="button" class="btn" data-again>答えなおす</button></div>`
            : `<div class="verdict bad" aria-live="polite">${wrong.o ? "質問1(順番)" : ""}${wrong.o && wrong.r ? "と" : ""}${wrong.r ? "質問2(重複)" : ""}が違います。黄色でハイライトした文が判断のサインです。${wrong.o ? "<p>順番:「並べる・重ねる・順番も決める」は区別する、「袋・カップに入れる」は区別しない。</p>" : ""}${wrong.r ? "<p>重複:「1回だけ」は重複なし、「何回でもよい・2本選んでもよい」は重複あり。</p>" : ""}</div><div class="btns two"><button type="button" class="btn primary" data-again>答えなおす</button></div>`}`;
        ST.wireSeg(el, "set", v => { setId = v; idx = 0; qo = qr = null; draw(); });
        ST.wireSeg(el, "qo", v => { qo = v === "1"; draw(); });
        ST.wireSeg(el, "qr", v => { qr = v === "1"; draw(); });
        el.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { idx = +b.dataset.go; qo = qr = null; draw(); });
        const nx = el.querySelector("[data-next]"); if (nx) nx.onclick = () => { idx = (idx + 1) % 4; qo = qr = null; draw(); };
        const ag = el.querySelector("[data-again]"); if (ag) ag.onclick = () => { qo = qr = null; draw(); };
        if (right && seen.size >= 4) ST.markLab("pick");
      };
      draw();
    }
  });
})(window.ST);
