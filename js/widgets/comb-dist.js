"use strict";
/* Lab: 配り方のアニメーション. 区別できる10個のプレゼント → 10! と 10^10。同じ10個 → 星と棒(棒をドラッグ)で 12C2 = 66。 */
(function (ST) {
  const N = 10, PEOPLE = 10, SLOTS = 12, NB = 2;
  const fmt = v => v.toLocaleString("en-US");
  const NAMES = "ABC";

  ST.widget("dist", {
    title: "配り方を動かして数える:区別できる?できない?",
    group: "comb", name: "配り方(区別あり・なし)", desc: "10個を配る:10! と 10¹⁰、同じ物は星と棒をドラッグで 66 通り", order: 20, tag: "配り方",
    formula: "区別できる: 1人1個 10! ＝ 3,628,800　何個でも 10¹⁰　／　同じ物: C(12,2) ＝ 66",
    says: "プレゼントを区別できるなら、1個ずつ「誰に渡すか」を選ぶ積の法則で数えます。区別できないなら、「誰が何個か」だけが違いなので、星と棒の並びで数えます。",
    meaning: "区別できる場合は、渡す相手の選び方を 1個目、2個目…と掛けます。1人1個までなら残りの人が減るので 10×9×…×1 ＝ 10!、何個でもよければ毎回 10 人から選べるので 10×10×…×10 ＝ 10¹⁰ です。区別できない場合は、10個の★と2本の｜を並べる方法が C(12,2) ＝ 66 通りです。",
    mount(root) {
      const el = document.createElement("div");
      el.style.cssText = "display:grid;gap:12px";
      let kind = "diff", rule = "one", assign = [], bars = [3, 7], alive = true, busy = false, drag = -1;

      /* ---------- 区別できる:1個ずつ渡す ---------- */
      const choices = (i) => rule === "one" ? PEOPLE - i : PEOPLE;
      const drawDiff = () => {
        const done = assign.length;
        const total = rule === "one" ? ST.fact(N) : Math.pow(PEOPLE, N);
        const chain = Array.from({ length: Math.min(done + 1, N) }, (_, i) => choices(i));
        const factors = Array.from({ length: N }, (_, i) => choices(i));
        const prod = chain.slice(0, done).reduce((a, x) => a * x, 1);
        const gifts = Array.from({ length: N }, (_, i) => {
          const st = i < done ? "hot" : "";
          return `<span class="ch-chip ${st}" style="padding:2px 8px;font-size:14px;${i === done && busy ? "outline:2px solid var(--packet)" : ""}">P${i + 1}</span>`;
        }).join("");
        const people = Array.from({ length: PEOPLE }, (_, p) => {
          const mine = assign.map((a, i) => a === p ? "P" + (i + 1) : null).filter(Boolean);
          return `<div style="border:1.5px solid ${mine.length ? "var(--packet)" : "var(--line)"};border-radius:8px;padding:4px;min-height:54px;background:${mine.length ? "var(--packet-soft)" : "var(--surface)"};font:600 12px var(--f-mono);text-align:center"><div style="color:var(--muted)">${p + 1}人目</div><div style="line-height:1.4">${mine.join(" ") || "·"}</div></div>`;
        }).join("");
        el.innerHTML = `<div><p class="lab-label">配り方のルール</p>${ST.segHtml("rule", [["one", "1人に1個ずつ"], ["any", "何個もらってもよい"]], rule)}</div>
          <p class="cap">10個のちがうプレゼント P₁〜P₁₀ を、10人に配ります。${rule === "one" ? "全員がちょうど1個もらいます。" : "1人が何個もらっても、0個でもかまいません。"}</p>
          <div>${gifts}</div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">${people}</div>
          <div class="hexbox" aria-live="polite">${done === 0 ? "「▶ 配っていく」で、1個ずつ渡す相手を選びます。" : `P${done} の渡し方: <b>${choices(done - 1)}</b> 通り`}<br>選び方の積: <b>${factors.slice(0, Math.max(done, 1)).join(" × ")}${done < N ? " × …" : ""}</b>${done ? " ＝ " + fmt(prod) : ""}</div>
          <div class="lab-big" aria-live="polite"><b>${done === N ? fmt(total) : "?"}</b><span>通り　<span class="cap" style="font-size:15px">${rule === "one" ? "10 × 9 × 8 × … × 1 ＝ 10!" : "10 を 10 回掛ける ＝ 10¹⁰"}</span></span></div>
          <div class="btns two"><button type="button" class="btn primary" data-run ${busy ? "disabled" : ""}>▶ 配っていく</button><button type="button" class="btn" data-reset ${busy ? "disabled" : ""}>最初から</button></div>
          <p class="cap">${rule === "one" ? "1個目は10人から、2個目は残りの9人から…と選ぶ人が減るので、全部で 10! 通りです。" : "どのプレゼントも毎回 10 人から選べるので、10 を 10 回掛けた 10¹⁰ 通りです。(1人1個の配り方 10! も、この中に含まれます。)"}</p>`;
        ST.wireSeg(el, "rule", v => { rule = v; assign = []; draw(); ST.markLab("dist"); });
        el.querySelector("[data-reset]").onclick = () => { assign = []; draw(); };
        el.querySelector("[data-run]").onclick = async () => {
          assign = []; busy = true; draw();
          const free = Array.from({ length: PEOPLE }, (_, p) => p);
          for (let i = 0; i < N; i++) {
            if (!alive) return;
            const pool = rule === "one" ? free : Array.from({ length: PEOPLE }, (_, p) => p);
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (rule === "one") free.splice(free.indexOf(pick), 1);
            assign.push(pick); draw();
            await ST.sleep(420);
          }
          if (!alive) return;
          busy = false; draw(); ST.markLab("dist");
        };
      };

      /* ---------- 同じ物:星と棒 ---------- */
      const sortedBars = () => bars.slice().sort((a, b) => a - b);
      const amounts = () => { const b = [-1, ...sortedBars(), SLOTS]; return b.slice(1).map((x, i) => x - b[i] - 1); };
      const rankOf = () => ST.combIdx(SLOTS, NB).findIndex(c => c[0] === sortedBars()[0] && c[1] === sortedBars()[1]) + 1;
      const rowHtml = () => Array.from({ length: SLOTS }, (_, i) => bars.includes(i)
        ? `<div data-slot="${i}" style="flex:1;text-align:center;font:700 26px/42px var(--f-mono);color:var(--attack);background:var(--attack-soft);border-radius:6px;touch-action:none;cursor:grab;user-select:none" role="slider" aria-label="仕切り棒" aria-valuenow="${i}">｜</div>`
        : `<div data-slot="${i}" style="flex:1;text-align:center;font:600 20px/42px var(--f-mono);color:var(--packet);user-select:none">★</div>`).join("");
      const infoHtml = () => { const a = amounts(); return `<div style="font-size:16px;margin-top:6px">${a.map((x, i) => `<b>${NAMES[i]}</b> ${x}個`).join("　")}</div><div class="cap">この分け方は 66 通り中 ${rankOf()} 番目</div>`; };
      const drawSame = () => {
        el.innerHTML = `<p class="cap">10個の<b>同じ</b>プレゼントを、A・B・C の3人に配ります(0個の人がいてもよい)。区別できるのは「誰が何個か」だけです。★が10個、｜が2本。<b>｜をドラッグ</b>(または★をタップ)して分け方を変えましょう。</p>
          <div class="stage" style="padding:10px 6px;text-align:center"><div data-row style="display:flex;gap:2px;touch-action:none">${rowHtml()}</div><div data-info>${infoHtml()}</div></div>
          <div class="lab-big" aria-live="polite"><b data-count>66</b><span>通り　<span class="cap" style="font-size:15px">12個の並びから｜の場所を2つ選ぶ ＝ C(12,2)</span></span></div>
          <div class="btns two"><button type="button" class="btn primary" data-run ${busy ? "disabled" : ""}>▶ 全部数える</button><button type="button" class="btn" data-reset ${busy ? "disabled" : ""}>最初の位置に戻す</button></div>
          <p class="cap">区別できるプレゼントなら、1個ずつ3人から選んで 3¹⁰ ＝ ${fmt(Math.pow(3, 10))} 通りでした。同じ物だと、入れ替えただけの配り方が1つにまとまり、66 通りになります。</p>`;
        const row = el.querySelector("[data-row]"), info = el.querySelector("[data-info]");
        const refresh = () => { row.innerHTML = rowHtml(); info.innerHTML = infoHtml(); };
        const slotAt = x => { const r = row.getBoundingClientRect(); return Math.max(0, Math.min(SLOTS - 1, Math.floor((x - r.left) / r.width * SLOTS))); };
        row.onpointerdown = ev => {
          if (busy) return;
          const s = slotAt(ev.clientX);
          if (bars.includes(s)) drag = s;
          else { /* 近い棒を、タップした場所へ */
            const near = bars.reduce((best, b) => Math.abs(b - s) < Math.abs(best - s) ? b : best, bars[0]);
            bars[bars.indexOf(near)] = s; drag = s; refresh(); ST.markLab("dist");
          }
          try { row.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
          ev.preventDefault();
        };
        row.onpointermove = ev => {
          if (drag < 0) return;
          const s = slotAt(ev.clientX);
          if (s !== drag && !bars.includes(s)) { bars[bars.indexOf(drag)] = s; drag = s; refresh(); }
        };
        const end = () => { if (drag >= 0) { drag = -1; ST.markLab("dist"); } };
        row.onpointerup = end; row.onpointercancel = end;
        el.querySelector("[data-reset]").onclick = () => { bars = [3, 7]; drawSame(); };
        el.querySelector("[data-run]").onclick = async () => {
          busy = true; drawSame();
          const L = ST.combIdx(SLOTS, NB), row2 = el.querySelector("[data-row]"), info2 = el.querySelector("[data-info]"), cnt = el.querySelector("[data-count]");
          const ok = await ST.countRun(L.length, i => { bars = L[i]; row2.innerHTML = rowHtml(); info2.innerHTML = infoHtml(); cnt.textContent = i + 1; }, () => alive, 140);
          if (!alive) return;
          busy = false; drawSame(); if (ok) ST.markLab("dist");
        };
      };

      const draw = () => { if (kind === "diff") drawDiff(); else drawSame(); };
      root.innerHTML = `<div><p class="lab-label">プレゼントは?</p>${ST.segHtml("kind", [["diff", "区別できる"], ["same", "全部同じ"]], kind)}</div>`;
      root.style.cssText = "display:grid;gap:12px";
      root.appendChild(el);
      ST.wireSeg(root, "kind", v => { kind = v; assign = []; bars = [3, 7]; busy = false; draw(); ST.markLab("dist"); });
      draw();
      return () => { alive = false; };
    }
  });
})(window.ST);
