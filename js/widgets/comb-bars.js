"use strict";
/* Lab for お金を分ける問題 (stars and bars) and 重複組合せ: n coins to k people, with or without "at least one each". */
(function (ST) {
  ST.widget("bars", {
    title: "お金を分ける:仕切り棒で数える(重複組合せの入口)",
    group: "comb", name: "お金を分ける(仕切り棒)", desc: "100円玉を何人かで分ける。棒を置く場所を選ぶ", order: 15, tag: "例3・例4",
    formula: "1枚以上: $C(n-1, k-1) \\quad 0$枚もOK: $C(n+k-1, k-1) = {}_{k}H_{n}$",
    says: "100円玉 n 枚を k 人で分ける方法は、仕切りの棒を $k-1$ 本置く場所の選び方で決まります。",
    meaning: "お金は区別できないので、「誰が何枚か」だけが違いです。1枚以上ずつ渡すなら、コインの間の $n-1$ か所から棒の場所を選びます。0枚も許すなら、コインと棒を合わせた $n+k-1$ 個の並びから棒の位置を選びます。",
    mount(el) {
      let n = 5, k = 3, mode = "one", cur = null, alive = true, busy = false;
      const slots = () => mode === "one" ? n - 1 : n + k - 1;
      const all = () => ST.combIdx(slots(), k - 1);
      const amounts = bars => {
        if (mode === "one") { const b = [-1, ...bars, n - 1]; return b.slice(1).map((x, i) => x - b[i]); }
        const b = [-1, ...bars, n + k - 1]; return b.slice(1).map((x, i) => x - b[i] - 1);
      };
      const draw = () => {
        const L = all(), total = L.length;
        if (!cur) cur = L[0];
        const full = cur.length === k - 1, am = full ? amounts(cur) : null;
        const barBtn = i => `<button type="button" data-slot="${i}" style="all:unset;cursor:pointer;padding:6px 4px;font:700 22px var(--f-mono);color:${cur.includes(i) ? "var(--attack)" : "var(--muted)"}" aria-label="${i + 1}番目の場所 ${cur.includes(i) ? "棒あり" : "棒なし"}">${cur.includes(i) ? "｜" : "·"}</button>`;
        const coin = `<span class="ch-chip hot" style="padding:2px 9px">○</span>`;
        let row = "";
        if (mode === "one") for (let i = 0; i < n; i++) row += coin + (i < n - 1 ? barBtn(i) : "");
        else for (let i = 0; i < n + k - 1; i++) row += cur.includes(i) ? barBtn(i) : `<button type="button" data-slot="${i}" style="all:unset;cursor:pointer">${coin}</button>`;
        const formula = mode === "one" ? `C(${n}−1, ${k}−1) ＝ C(${n - 1},${k - 1})` : `C(${n}+${k}−1, ${k}−1) ＝ C(${n + k - 1},${k - 1}) ＝ ${k}H${n}`;
        el.innerHTML = `<div style="display:grid;gap:10px">
          <div><p class="lab-label">100円玉の枚数</p>${ST.segHtml("n", [[3, "3"], [4, "4"], [5, "5"], [6, "6"]], n)}</div>
          <div><p class="lab-label">人数</p>${ST.segHtml("k", [[2, "2人"], [3, "3人"], [4, "4人"]], k)}</div>
          <div><p class="lab-label">もらえない人</p>${ST.segHtml("mode", [["one", "いない(1枚以上)"], ["zero", "いてもよい(0円OK)"]], mode)}</div></div>
          <div class="stage" style="padding:10px 4px;text-align:center"><div style="line-height:2.2">${row}</div>
            <div style="margin-top:6px;font-size:16px">${full ? am.map((a, i) => `<b>${"ABCD"[i]}</b> ${a * 100}円`).join("　") : `あと棒 ${k - 1 - cur.length} 本(｜を置く場所をタップ)`}</div></div>
          <div class="lab-big" aria-live="polite"><b>${total}</b><span>通り　<span class="cap" style="font-size:15px">${formula}</span></span></div>
          <div class="btns three"><button type="button" class="btn primary" data-run ${busy ? "disabled" : ""}>▶ 全部数える</button><button type="button" class="btn" data-next ${busy ? "disabled" : ""}>別の分け方 ›</button><button type="button" class="btn" data-clear ${busy ? "disabled" : ""}>棒を外す</button></div>
          <p class="cap">${mode === "one" ? "コインとコインの間は " + (n - 1) + " か所。そこから棒 " + (k - 1) + " 本の場所を選びます。" : "0円を許すと、「人数分のコインを足して1枚以上で分け、最後に1人1枚ずつ返す」と考えても同じ数(" + (n + k) + " 枚 → C(" + (n + k) + "−1," + (k - 1) + "))になります。「" + k + "種類のお菓子から " + n + " 個を重複を許して選ぶ」(重複組合せ)と同じ問題です。"}</p>`;
        ST.wireSeg(el, "n", v => { n = +v; cur = null; draw(); });
        ST.wireSeg(el, "k", v => { k = +v; cur = null; draw(); });
        ST.wireSeg(el, "mode", v => { mode = v; cur = null; draw(); ST.markLab("bars"); });
        el.querySelectorAll("[data-slot]").forEach(b => b.onclick = () => {
          const i = +b.dataset.slot;
          if (cur.includes(i)) cur = cur.filter(x => x !== i); else if (cur.length < k - 1) cur = [...cur, i].sort((a, b2) => a - b2);
          draw();
        });
        el.querySelector("[data-clear]").onclick = () => { cur = []; draw(); };
        el.querySelector("[data-next]").onclick = () => { const key = cur.join(","); const i = L.findIndex(c => c.join(",") === key); cur = L[(i + 1) % L.length]; draw(); ST.markLab("bars"); };
        el.querySelector("[data-run]").onclick = async () => {
          busy = true;
          const ok = await ST.countRun(total, i => { cur = L[i]; const c = el.querySelector(".lab-big b"); if (c) c.textContent = i + 1; const st = el.querySelector(".stage"); if (st) { const a = amounts(cur); st.querySelector("div div").textContent = a.map((x, j) => "ABCD"[j] + " " + x * 100 + "円").join("　"); } }, () => alive, 120);
          if (!alive) return; busy = false; draw(); if (ok) ST.markLab("bars");
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
