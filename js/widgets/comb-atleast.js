"use strict";
/* Lab for 演習1・2: "at least k people" = all subsets (2^n) minus the ones that are too small.
   A bar for each group size r shows C(n,r); the too-small bars are crossed out one by one. */
(function (ST) {
  const PRESET = { e1: [6, 1], e2: [12, 3] };

  ST.widget("atleast", {
    title: "「k 人以上」を数える:全体 2ⁿ から少なすぎる分を引く",
    group: "comb", name: "k 人以上の選び方", desc: "演習1・2:全部(2ⁿ)から「少なすぎる」組を引いて数える", order: 8,
    tag: "演習1・2",
    formula: "k 人以上 ＝ 2ⁿ − (C(n,0) ＋ … ＋ C(n,k−1))",
    says: "n 人の中から k 人以上を選ぶ数は、全部の選び方 2ⁿ から、k 人より少ない選び方を引いた数です。",
    meaning: "人数ごとの選び方(棒の長さ)を足していくのが直接の数え方。少ない側が短いときは、全体から引くほうが楽です。",
    mount(el) {
      let n = 6, k = 1, step = 0, alive = true, busy = false;
      const draw = () => {
        const rs = Array.from({ length: n + 1 }, (_, r) => r), cs = rs.map(r => ST.C(n, r)), max = Math.max(...cs), total = 2 ** n;
        const small = cs.slice(0, k), smallSum = small.reduce((a, b) => a + b, 0), ans = total - smallSum;
        const crossed = r => r < k && r < step;   /* step = how many of the too-small bars are already crossed out */
        const bars = rs.map(r => {
          const tooSmall = r < k, x = crossed(r);
          return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0;${x ? "opacity:.55" : ""}"><span style="min-width:3.6em;font:600 14px var(--f-mono)">${r}人</span>
            <span style="flex:1;height:22px;position:relative"><span style="display:block;height:100%;width:${Math.max(3, cs[r] / max * 100)}%;border-radius:6px;background:${tooSmall ? (x ? "var(--muted)" : "var(--attack)") : "var(--packet)"}"></span></span>
            <span style="min-width:6.2em;text-align:right;font:600 14px var(--f-mono);${x ? "text-decoration:line-through" : ""}">${cs[r]}</span></div>`;
        }).join("");
        const done = step >= k;
        el.innerHTML = `<div><p class="lab-label">授業の問題</p>${ST.segHtml("pre", [["e1", "演習1(6人・1人以上)"], ["e2", "演習2(12人・3人以上)"]], n === 6 && k === 1 ? "e1" : n === 12 && k === 3 ? "e2" : "")}</div>
          <div><p class="lab-label">人数 n</p>${ST.segHtml("n", [4, 5, 6, 8, 10, 12].map(x => [x, String(x)]), n)}</div>
          <div><p class="lab-label">k 人以上(k)</p>${ST.segHtml("k", [1, 2, 3, 4].map(x => [x, String(x)]), k)}</div>
          <div class="stage" style="padding:10px 8px"><p class="cap" style="margin:0 0 6px"><span style="color:var(--packet)">■</span> 数える人数　<span style="color:var(--attack)">■</span> ${k}人より少ない(引く)。棒の右の数は C(${n},r) です。</p>${bars}</div>
          <div class="lab-big" aria-live="polite"><b>${done ? ans : total}</b><span>${done ? `通り　<span class="cap" style="font-size:15px">2<sup>${n}</sup> − ${small.join(" − ")} ＝ ${total} − ${smallSum} ＝ ${ans}</span>` : `通り(全部)　<span class="cap" style="font-size:15px">2<sup>${n}</sup> ＝ ${total}。${k}人より少ない ${smallSum} 通りを引いていきます</span>`}</span></div>
          <div class="btns"><button type="button" class="btn primary" data-play ${busy ? "disabled" : ""}>▶ 引いていくアニメーション</button><button type="button" class="btn" data-next ${busy || done ? "disabled" : ""}>1つ引く ›</button><button type="button" class="btn" data-reset ${busy ? "disabled" : ""}>最初から</button></div>
          <p class="cap">直接数えるなら、${rs.filter(r => r >= k).map(r => cs[r]).join(" ＋ ")} ＝ ${ans}。全体から引いても同じ ${ans} 通りになります。</p>`;
        ST.wireSeg(el, "pre", v => { [n, k] = PRESET[v]; step = 0; draw(); });
        ST.wireSeg(el, "n", v => { n = +v; step = 0; draw(); });
        ST.wireSeg(el, "k", v => { k = +v; step = 0; draw(); });
        el.querySelector("[data-next]").onclick = () => { step = Math.min(k, step + 1); draw(); if (step >= k) ST.markLab("atleast"); };
        el.querySelector("[data-reset]").onclick = () => { step = 0; draw(); };
        el.querySelector("[data-play]").onclick = async () => {
          busy = true; step = 0; draw();
          for (let s = 1; s <= k && alive; s++) { await ST.sleep(900); if (!alive) return; step = s; draw(); }
          busy = false; if (alive) { draw(); ST.markLab("atleast"); }
        };
      };
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
