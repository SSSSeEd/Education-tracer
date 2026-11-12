"use strict";
/* Lab for 例2: distribute 10 distinct gifts to A(4), B(2), C(2), D(2). Three ways to count, same answer 18,900. */
(function (ST) {
  const PRE = [
    { k: "0", label: "授業:10個を 4・2・2・2", sizes: [4, 2, 2, 2] },
    { k: "1", label: "小さな例:4個を 2・1・1", sizes: [2, 1, 1] },
    { k: "2", label: "5個を 2・2・1", sizes: [2, 2, 1] }
  ];
  const NAMES = "ABCD";
  const fact = ST.fact;

  ST.widget("gifts", {
    title: "プレゼントを配る:3通りの解き方で、同じ答えになる",
    group: "comb", name: "プレゼントを配る", desc: "例2:10個を 4・2・2・2 個ずつ。3つの解き方を比べる", order: 14, tag: "例2",
    formula: "$10! \\div (4! 2! 2! 2!) = C(10,4) \\times C(6,2) \\times C(4,2) \\times C(2,2) = 18,900$",
    says: "区別できる10個のプレゼントを、A に4個・B に2個・C に2個・D に2個と、個数を決めて配る方法は 18,900 通りです。",
    meaning: "どの解き方でも同じ数になります。(解1)プレゼントを1列に並べて先頭から配る。(解2) AAAABBCCDD の並べ替えで考える。(解3) 1人ずつ「誰に何個」と選んでいく。",
    mount(el) {
      let pre = "0", way = "1", sample = null;
      const draw = () => {
        const sizes = PRE[+pre].sizes, n = sizes.reduce((a, b) => a + b, 0);
        const den = sizes.reduce((a, k) => a * fact(k), 1), total = fact(n) / den;
        const letters = sizes.map((k, i) => NAMES[i].repeat(k)).join("");
        let rest = n; const cs = sizes.map(k => { const c = ST.C(rest, k); const t = `C(${rest},${k})`; rest -= k; return { c, t }; });
        const prod = cs.reduce((a, x) => a * x.c, 1);
        let body;
        if (way === "1") {
          body = `<p class="cap">プレゼント P₁〜P${n} を1列に並べ、先頭から A に ${sizes[0]} 個、${sizes.slice(1).map((k, i) => NAMES[i + 1] + " に " + k + " 個").join("、")} と配ります。並べ方は ${n}! ＝ ${fact(n)} 通り。ただし同じ人がもらう個数の中で並べ替えても、配り方は同じです。</p>
            <div class="hexbox">${sizes.map((k, i) => `<div>${NAMES[i]}さん ${k}個 → 中の並べ替え ${k}! ＝ ${fact(k)} 通りは同じ配り方</div>`).join("")}</div>
            <p class="cap">だから ${n}! ÷ (${sizes.map(k => k + "!").join(" × ")}) ＝ ${fact(n)} ÷ ${den} ＝ <b>${total}</b></p>`;
        } else if (way === "2") {
          body = `<p class="cap">${letters} の並べ替え(重複順列)を考えます。左から i 番目の文字が、プレゼント Pᵢ をもらう人です。</p>
            <div class="hexbox" style="font-size:18px">${Array.from(letters).map((c, i) => `<span class="ch-chip" style="padding:2px 8px">${c}</span>`).join("")}</div>
            <p class="cap">文字列と配り方が1対1に対応するので、P(${n}: ${sizes.join(",")}) ＝ ${n}! ÷ (${sizes.map(k => k + "!").join(" × ")}) ＝ <b>${total}</b></p>`;
        } else {
          body = `<p class="cap">1人ずつ順に「残りのプレゼントから何個もらうか」を選びます。選ぶ順序は気にしないので組合せです。</p>
            <div class="hexbox">${cs.map((x, i) => `<div>${NAMES[i]}さん: ${x.t} ＝ ${x.c}</div>`).join("")}</div>
            <p class="cap">積の法則で ${cs.map(x => x.c).join(" × ")} ＝ <b>${prod}</b>${prod === total ? "(解1・解2と同じ)" : ""}</p>`;
        }
        let smp = "";
        if (sample) { const ids = Array.from({ length: n }, (_, i) => i), str = sample; smp = `<div class="hexbox">${sizes.map((_, i) => `${NAMES[i]}さん: {${ids.filter(j => str[j] === NAMES[i]).map(j => "P" + (j + 1)).join(", ")}}`).join("<br>")}<div class="cap" style="margin-top:4px">文字列 ${str}</div></div>`; }
        el.innerHTML = `<div><p class="lab-label">問題</p>${ST.segHtml("pre", PRE.map(p => [p.k, p.label]), pre)}</div>
          <div><p class="lab-label">解き方</p>${ST.segHtml("way", [["1", "解1 並べる"], ["2", "解2 文字列"], ["3", "解3 順に配る"]], way)}</div>
          <div class="lab-big" aria-live="polite"><b>${total}</b><span>通り　<span class="cap" style="font-size:15px">${n}個を ${sizes.join("・")} 個ずつ</span></span></div>
          ${body}
          <div class="btns two"><button type="button" class="btn primary" data-rand>配り方を1つ作る</button><button type="button" class="btn" data-all>${n <= 5 ? "全部書き出す" : "(個数が多いので省略)"}</button></div>
          ${smp}`;
        ST.wireSeg(el, "pre", v => { pre = v; sample = null; draw(); });
        ST.wireSeg(el, "way", v => { way = v; draw(); ST.markLab("gifts"); });
        el.querySelector("[data-rand]").onclick = () => { const a = Array.from(letters); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } sample = a.join(""); draw(); };
        el.querySelector("[data-all]").onclick = () => {
          if (n > 5) return;
          const seen = new Set(), rec = (cur, left) => { if (cur.length === n) { seen.add(cur); return; } Array.from(new Set(left)).forEach(c => { const i = left.indexOf(c); rec(cur + c, left.slice(0, i) + left.slice(i + 1)); }); };
          rec("", letters);
          const all = [...seen];
          el.querySelector("[data-all]").insertAdjacentHTML("afterend", "");
          let box = el.querySelector(".all-box"); if (!box) { box = document.createElement("div"); box.className = "hexbox all-box"; box.style.cssText = "max-height:220px;overflow:auto;margin-top:8px"; el.appendChild(box); }
          box.innerHTML = `<div class="cap">${all.length} 通り(文字の i 番目 = Pᵢ をもらう人)</div>` + all.map(s => `<span class="ch-chip" style="font-size:14px;padding:2px 7px">${s}</span>`).join("");
          ST.markLab("gifts");
        };
      };
      draw();
    }
  });
})(window.ST);
