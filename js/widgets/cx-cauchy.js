"use strict";
/* Closed-circle integral lab (コーシーの積分定理): go once around a circle |z − c| = ρ and add up the small arrows f(z)dz.
   z² (holomorphic everywhere) returns to the start: total 0. 1/z around the hole at 0 leaves 2πi. Reversing the direction flips the sign.
   Numeric: 720 midpoint pieces on z(t) = c + ρe^{it}, dz = iρe^{it}dt; the picture groups them into 24 arrows. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 250, g = cx.geom(W, H, 3.4), N = 720, GROUPS = 24, PER = N / GROUPS;
  const FN = {
    sq: { name: "z²", f: z => cx.mul(z, z), hole: false, note: "z² はどこでも正則(穴なし)なので、一周して足すと矢印がちょうど閉じて、合計は 0。コーシーの積分定理どおりです。" },
    inv: { name: "1/z", f: z => cx.div([1, 0], z), hole: true, note: "1/z は原点に穴があります。円が原点を囲んでいれば、矢印は閉じずに 2πi だけ残ります。円が原点を囲まなければ(円の中が穴なしの領域なら)、0 に戻ります。" },
    inv2: { name: "1/z²", f: z => cx.div([1, 0], cx.mul(z, z)), hole: true, note: "1/z² にも原点に穴がありますが、一周すると 0 に戻ります。穴があっても、いつも 2πi が残るわけではありません(原始関数 −1/z があるため)。" },
    conj: { name: "z̄", f: z => cx.conj(z), hole: false, note: "z̄ は正則ではありません(穴はなくても、コーシーの積分定理の前提を満たさない)。一周しても 0 に戻りません。" }
  };

  ST.widget("ccauchy", {
    title: "閉じた道を一周:z² は 0 に戻り、1/z は 2πi が残る",
    group: "cx", name: "円周を一周する積分", desc: "円周上で f(z)dz の小矢印を足す。z² は 0、1/z は 2πi。向きを変えると符号が反対", order: 9.5,
    tag: "コーシーの積分定理",
    formula: "$\\oint_C f(z)dz$　(C: 閉じた道、反時計回りが正)",
    says: "閉じた道を一周して f(z)dz を足した値です。f がその道の内側すべてで正則なら 0 になります(コーシーの積分定理)。内側に穴(極)があると、0 にならないことがあります。",
    meaning: "右の図は、道を 24 個に刻んだ小矢印 f(z)dz を、先頭と末尾でつないだものです。一周して始点に戻れば合計 0、戻らなければ、その差が積分の値です。進む向きを逆にすると、合計は −1 倍になります。",
    mount(el) {
      let key = "inv", c = [0, 0], rho = 1.5, dir = 1, k = GROUPS, alive = true, busy = false;
      el.innerHTML = `<div><p class="lab-label">関数 f(z)</p>${ST.segHtml("fn", Object.entries(FN).map(([x, v]) => [x, v.name]), key)}</div>
        <div><p class="lab-label">進む向き</p>${ST.segHtml("dir", [[1, "反時計回り(＋)"], [-1, "時計回り(−)"]], dir)}</div>
        <p class="cap" style="margin:0">左: 円の道(中心 c を動かすと、原点の穴を囲む/囲まないを切り替えられます)</p>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" data-a role="img" aria-label="円の道"></svg></div>
        <div><p class="lab-label">半径 ρ(スライダー)</p><input type="range" min="2" max="9" value="6" class="input" data-r aria-label="半径" style="padding:0"></div>
        <p class="cap" style="margin:0">右: 小矢印 f(z)dz をつないだもの</p>
        <div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" data-b role="img" aria-label="矢印をつなぐ"></svg></div>
        <button type="button" class="btn primary big" data-play>▶ 一周しながら足す</button>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const A = el.querySelector("[data-a]"), B = el.querySelector("[data-b]"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]"), sr = el.querySelector("[data-r]"), play = el.querySelector("[data-play]");
      const zt = t => cx.add(c, cx.polar(rho, dir * t));
      const render = () => {
        const F = FN[key], hit = Math.abs(Math.hypot(c[0], c[1]) - rho) < .06, enclose = Math.hypot(c[0], c[1]) < rho, bad = F.hole && hit;
        let sa = cx.grid(g, { ticks: false });
        if (F.hole) sa += `<circle cx="${g.X(0)}" cy="${g.Y(0)}" r="6" fill="var(--surface)" stroke="var(--attack)" stroke-width="3"/><text x="${g.X(0) + 9}" y="${g.Y(0) + 16}" class="svg-m" style="font-size:11px">穴(0)</text>`;
        sa += `<circle cx="${g.X(c[0])}" cy="${g.Y(c[1])}" r="${(g.s * rho).toFixed(1)}" fill="${enclose && F.hole ? "var(--attack-soft)" : "var(--info-soft)"}" fill-opacity=".45" stroke="var(--info)" stroke-width="2.4"/>`;
        for (let i = 0; i < 4; i++) { const t = i * Math.PI / 2 + Math.PI / 4; sa += cx.arrow(g, zt(t - .05), zt(t + .02), "var(--info)", 2.6); }
        sa += cx.handle(g, c, "var(--packet)") + cx.dot(g, c, "var(--packet)", "c", { r: 4 }) + cx.dot(g, zt(0), "var(--ink)", "始点", { r: 4, dx: 7, dy: -7, fs: 11 });
        const chain = [[0, 0]];
        let acc = [0, 0], tot = [0, 0];
        for (let i = 0; i < N && !bad; i++) {
          const t = (i + .5) / N * 2 * Math.PI, z = zt(t), dz = cx.mul([0, dir * rho], cx.polar(1, dir * t)), step = cx.mul(F.f(z), [dz[0] * 2 * Math.PI / N, dz[1] * 2 * Math.PI / N]);
          acc = cx.add(acc, step); tot = acc;
          if ((i + 1) % PER === 0) chain.push(acc);
        }
        if (bad) { A.innerHTML = sa; B.innerHTML = ""; big.innerHTML = "<b>道が穴(0)を通っています</b>"; cap.textContent = "円が原点を通ると 1/z が計算できません。中心 c か半径 ρ を少し動かしてください。"; return; }
        const m = Math.max(.6, ...chain.map(cx.abs)) * 1.3, g2 = cx.geom(W, H, m * W / H * .75);
        let sb = cx.grid(g2, { ticks: false });
        for (let i = 0; i < k; i++) sb += cx.arrow(g2, chain[i], chain[i + 1], i % 2 ? "var(--info)" : "var(--packet)", 2.4);
        sb += cx.dot(g2, [0, 0], "var(--ink)", "始点", { r: 4, dx: -34, dy: 14, fs: 11 });
        if (k > 0) sb += cx.dot(g2, chain[k], k === GROUPS ? "var(--attack)" : "var(--ok)", k === GROUPS ? "合計" : "", { r: 5, dx: 8, dy: -8, fs: 12 });
        A.innerHTML = sa + (k < GROUPS ? cx.dot(g, zt(2 * Math.PI * k / GROUPS), "var(--ok)", "", { r: 6 }) : "");
        B.innerHTML = sb;
        const small = cx.abs(tot) < .02, twopi = Math.abs(tot[1] - dir * 2 * Math.PI) < .05 && Math.abs(tot[0]) < .05 && key === "inv";
        big.innerHTML = k < GROUPS ? `<b>${k} / ${GROUPS} 個たした</b><span>いまの和: ${cx.fmt(chain[k], 2)}</span>` : `<b>∮ ＝ ${small ? "0" : twopi ? (dir > 0 ? "2πi" : "−2πi") : cx.fmt(tot, 3)}</b><span>${cx.fmt(tot, 3)}${twopi ? "　(2π ＝ 6.283)" : ""}</span>`;
        cap.innerHTML = F.note + (key === "inv" && !enclose ? " いまは円が原点を囲んでいないので、0 です。中心 c を原点に近づけて、穴を囲んでみてください。" : "") + (key === "inv" && enclose ? ` いまは円が原点を囲んでいます(${dir > 0 ? "反時計回り" : "時計回り"} → ${dir > 0 ? "＋" : "−"}2πi)。` : "") + " 向きを逆にすると、合計は −1 倍になります。";
      };
      const stop = () => { busy = false; play.disabled = false; };
      cx.drag(A, g, { snap: () => .5, handles: () => [{ id: "c", z: c }], tap: null, move: (id, p) => { if (busy) return; c = p; k = GROUPS; render(); ST.markLab("ccauchy"); } });
      ST.wireSeg(el, "fn", v => { if (busy) return; key = v; k = GROUPS; render(); ST.markLab("ccauchy"); });
      ST.wireSeg(el, "dir", v => { if (busy) return; dir = +v; k = GROUPS; render(); ST.markLab("ccauchy"); });
      sr.oninput = () => { if (busy) return; rho = +sr.value / 4; k = GROUPS; render(); ST.markLab("ccauchy"); };
      play.onclick = async () => {
        if (busy) return; busy = true; play.disabled = true;
        const sc = ST.motionScale(); k = 0; render();
        for (let i = 1; i <= GROUPS && alive; i++) { k = i; render(); if (sc) await ST.sleep(120 * sc); }
        stop(); if (alive) ST.markLab("ccauchy");
      };
      render();
      return () => { alive = false; };
    }
  });
})(window.ST);
