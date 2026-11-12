"use strict";
/* Multivalued functions: z goes around the origin and comes back to the same point, but the continuously followed log z (or √z, ∛z) does not come back to the same value.
   Left: z on a circle (angle θ from the slider). Right: all values of the function; the continuously followed one is the big dot. */
(function (ST) {
  const cx = ST.cx, W = 340, HL = 230, HR = 250, gl = cx.geom(W, HL, 2.2 * W / HL), R0 = 1.5;
  const RT = { sqrt: { n: 2, name: "√z" }, cbrt: { n: 3, name: "∛z" } };

  ST.widget("clog", {
    title: "多価関数:同じ点に戻ってきても、log z の値は戻らない",
    group: "cx", name: "log などの多価性", desc: "z が原点を1周すると、log z は 2πi ずれ、√z は符号が変わる", order: 5.5,
    tag: "多価性",
    formula: "log z ＝ ln|z| ＋ i(arg z ＋ 2πk)　(k は整数)",
    says: "偏角は 2π の違いを区別できないので、log z の値は1つに決まらず、2πi ずつずれた無数の値をもちます。√z なら2つ、∛z なら3つです。",
    meaning: "z が原点のまわりを1周して同じ点に戻ると、続けて追いかけた log z は 2πi だけ上にずれます(値が戻らない)。だから、ふつうは偏角を −π<θ≤π に制限した主値 Log z を使い、負の実軸を切れ目にします。",
    mount(el) {
      let key = "log", th = 0, alive = true, busy = false;
      el.innerHTML = `<div><p class="lab-label">関数</p>${ST.segHtml("fn", [["log", "log z"], ["sqrt", "√z"], ["cbrt", "∛z"]], key)}</div>
        <p class="cap" style="margin:0">左: z(原点のまわりを動く)　右: 関数の値(すべて)</p>
        <div class="stage"><svg viewBox="0 0 ${W} ${HL}" style="width:100%;max-width:420px;display:block;margin:auto" data-l role="img" aria-label="z の動き"></svg></div>
        <div class="stage"><svg viewBox="0 0 ${W} ${HR}" style="width:100%;max-width:420px;display:block;margin:auto" data-r role="img" aria-label="関数の値"></svg></div>
        <div><p class="lab-label">z の回転角 θ(−360° 〜 720°)</p><input type="range" min="-360" max="720" value="0" class="input" data-t aria-label="回転角" style="padding:0"></div>
        <button type="button" class="btn primary big" data-play>▶ z を2周させる</button>
        <div class="lab-big" aria-live="polite" data-big></div><p class="cap" data-cap></p>`;
      const L = el.querySelector("[data-l]"), Rr = el.querySelector("[data-r]"), big = el.querySelector("[data-big]"), cap = el.querySelector("[data-cap]"), sl = el.querySelector("[data-t]"), play = el.querySelector("[data-play]");
      const wrap = d => { d = ((d + 180) % 360 + 360) % 360 - 180; return d === -180 ? 180 : d; };
      const render = () => {
        const rad = th * Math.PI / 180, z = cx.polar(R0, rad), z0 = [R0, 0], turns = th / 360;
        let s = cx.grid(gl, { ticks: false }) + `<circle cx="${gl.X(0)}" cy="${gl.Y(0)}" r="${(R0 * gl.s).toFixed(1)}" fill="none" stroke="var(--muted)" stroke-dasharray="3 4"/>`;
        s += `<line x1="0" y1="${gl.Y(0)}" x2="${gl.X(0)}" y2="${gl.Y(0)}" stroke="var(--attack)" stroke-width="3" opacity=".6"/>`;
        s += cx.arc(gl, [0, 0], R0, 0, rad, "var(--packet)", 3.2) + cx.arrow(gl, [0, 0], z, "var(--packet)", 2) + cx.dot(gl, z0, "var(--ink)", "出発点", { r: 4, dy: 16, dx: -8 }) + cx.dot(gl, z, "var(--packet)", "z");
        L.innerHTML = s;
        let b, c, r = "";
        if (key === "log") {
          const hh = HR, yy = d => hh / 2 - d * (hh / 1900), x0 = 170;
          r += `<line x1="${x0}" y1="0" x2="${x0}" y2="${hh}" stroke="var(--muted)" stroke-width="1.4"/>`;
          for (let d = -900; d <= 900; d += 180) { const k = d / 180; r += `<line x1="${x0 - 70}" y1="${yy(d)}" x2="${x0 + 70}" y2="${yy(d)}" stroke="var(--line)" stroke-width="${k % 2 ? .6 : 1}"/>` + (k && k % 2 === 0 ? `<text x="${x0 - 76}" y="${yy(d) + 3}" text-anchor="end" class="svg-m" style="font-size:10px">${k / 2 === 1 ? "2πi" : k / 2 === -1 ? "−2πi" : (k / 2) + "·2πi"}</text>` : ""); }
          r += `<text x="${W - 4}" y="12" text-anchor="end" class="svg-m" style="font-size:10px">縦: Im w(横は Re w ＝ ln|z| で固定)</text>`;
          const pr = wrap(th);
          for (let k = -3; k <= 3; k++) { const d = pr + 360 * k; if (Math.abs(d) <= 900) r += `<circle cx="${x0}" cy="${yy(d)}" r="5" fill="var(--muted)" opacity=".7"/>`; }
          r += `<circle cx="${x0}" cy="${yy(pr)}" r="9" fill="none" stroke="var(--ok)" stroke-width="2.4"/><text x="${x0 + 14}" y="${yy(pr) + 4}" class="svg-t" style="font-size:12px" fill="var(--ok)">主値 Log z</text>`;
          let tr = ""; for (let i = 0; i <= 60; i++) tr += (i ? "L" : "M") + `${x0},${yy(th * i / 60).toFixed(1)}`;
          r += `<path d="${tr}" stroke="var(--packet)" stroke-width="3" fill="none" opacity=".8"/><circle cx="${x0}" cy="${yy(th)}" r="7" fill="var(--packet)" stroke="var(--surface)" stroke-width="2"/><text x="${x0 + 14}" y="${yy(th) - 8}" class="svg-t" style="font-size:12px" fill="var(--packet)">いまの値(連続)</text>`;
          b = `<b>log z ＝ ${cx.num(Math.log(R0), 2)} ＋ ${cx.num(th * Math.PI / 180, 2)}i</b><span>z は ${Math.abs(turns) < .01 ? "出発点" : cx.num(turns, 2) + " 周した所"}　<span class="cap" style="font-size:15px">主値 ＝ ${cx.num(Math.log(R0), 2)} ＋ ${cx.num(pr * Math.PI / 180, 2)}i</span></span>`;
          c = Math.abs(turns - Math.round(turns)) < .005 && Math.round(turns) !== 0 ? `z は出発点とまったく同じ点に戻りました。でも続けて追いかけた log z は、${Math.round(turns)} × 2πi ＝ ${cx.num(Math.round(turns) * 2 * Math.PI, 2)}i だけずれています。同じ z に、log z の値が無数にある(多価)ということです。` : "θ を動かすか ▶ を押して、z を1周(360°)させてください。右の灰色の点は、どれも同じ z に対する log z の値で、2πi ずつ離れています。緑の輪が、偏角を −180°〜180° にした主値です。";
        } else {
          const n = RT[key].n, gr = cx.geom(W, HR, 1.6 * W / HR), rr = Math.pow(R0, 1 / n);
          r += cx.grid(gr, { ticks: false }) + `<circle cx="${gr.X(0)}" cy="${gr.Y(0)}" r="${(rr * gr.s).toFixed(1)}" fill="none" stroke="var(--muted)" stroke-dasharray="3 4"/>`;
          for (let j = 0; j < n; j++) r += cx.dot(gr, cx.polar(rr, (rad + 2 * Math.PI * j) / n), "var(--muted)", "", { r: 5 });
          const cur = cx.polar(rr, rad / n);
          r += cx.arc(gr, [0, 0], rr, 0, rad / n, "var(--packet)", 3.2) + cx.dot(gr, [rr, 0], "var(--ink)", "出発", { r: 4, dy: 16, dx: -6 }) + cx.dot(gr, cur, "var(--packet)", "いまの値", { r: 7 });
          b = `<b>${RT[key].name} ＝ ${cx.fmt(cur, 2)}</b><span>z は ${Math.abs(turns) < .01 ? "出発点" : cx.num(turns, 2) + " 周した所"}　<span class="cap" style="font-size:15px">値は全部で ${n} 個</span></span>`;
          const tn = Math.round(turns);
          c = Math.abs(turns - tn) < .005 && tn !== 0 ? (tn % n === 0 ? `z を ${n} の倍数周まわしたので、値も出発点に戻りました。` : `z は出発点に戻りましたが、${RT[key].name} の値は出発の値とは別の根に移りました(${tn} 周 → ${n} 個ある根のうちの別のもの)。1周ごとに根が1つずつ入れ替わるのが「多価」の正体です。`) : "θ を動かすか ▶ を押してください。灰色の点が、同じ z に対する他の根です。z が1周すると、いまの値(橙)は別の根の位置に移ります。";
        }
        Rr.innerHTML = r; big.innerHTML = b; cap.textContent = c;
      };
      sl.oninput = () => { if (busy) return; th = +sl.value; render(); ST.markLab("clog"); };
      ST.wireSeg(el, "fn", v => { if (busy) return; key = v; render(); });
      play.onclick = async () => {
        if (busy) return; busy = true; play.disabled = true; th = 0;
        const k = ST.motionScale(), n = k ? Math.round(90 * Math.min(k, 2.4)) : 1;
        for (let i = 0; i <= n && alive; i++) { th = Math.round(720 * i / n); sl.value = th; render(); if (k) await ST.sleep(40); }
        busy = false; play.disabled = false; if (alive) ST.markLab("clog");
      };
      render();
      return () => { alive = false; };
    }
  });
})(window.ST);
