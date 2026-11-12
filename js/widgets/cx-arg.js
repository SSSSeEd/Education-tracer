"use strict";
/* Argument quadrant trap: arctan(b/a) only knows b/a, so 1+i and −1−i (both b/a = 1) give the same 45°.
   The true angle (atan2) is 45° and 225°. Drag the point through the four quadrants; the answers turn red when arctan(b/a) is wrong. */
(function (ST) {
  const cx = ST.cx, W = 340, H = 300, g = cx.geom(W, H, 3.4);
  const d360 = t => ((t * 180 / Math.PI) % 360 + 360) % 360;
  const QN = ["", "第1象限", "第2象限", "第3象限", "第4象限"];
  const quad = z => z[0] > 0 && z[1] >= 0 ? 1 : z[0] <= 0 && z[1] > 0 ? 2 : z[0] < 0 && z[1] <= 0 ? 3 : 4;

  ST.widget("carg", {
    title: "偏角の象限ミス:arctan(b/a) が正しいのは右半分だけ",
    group: "cx", name: "偏角と象限のミス", desc: "arctan(b/a) と本当の角度がずれる象限を、赤く光らせて見つける", order: 2.5,
    tag: "偏角",
    formula: "θ ＝ arctan(b/a)(a ＞ 0 のとき)　a ＜ 0 のとき θ ＝ arctan(b/a) ＋ 180°",
    says: "arctan(b/a) は比 b/a しか見ないので、1＋i と −1−i のように比が同じ2点を区別できません。答えは必ず −90°〜90° に入ります。",
    meaning: "点が右半分(a ＞ 0、第1・第4象限)なら arctan がそのまま偏角です。左半分(第2・第3象限)では 180° ずれるので、足して直します。先に点がどの象限にあるか図で確かめるのが、ミスを防ぐ習慣です。",
    mount(el) {
      let z = [1, 1];
      el.innerHTML = `<div class="stage"><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px;display:block;margin:auto" role="img" aria-label="偏角の図"></svg></div>
        <p class="cap" style="margin:0">点 z をドラッグ。まず「どの象限か」を目で確かめてから、数字を見ます。</p>
        <div><p class="lab-label">4つの象限をすばやく見る</p><div class="btns" data-q></div></div>
        <div class="lab-big" aria-live="polite" data-big></div>
        <div class="hexbox" data-card style="font-size:15px;line-height:1.9"></div><p class="cap" data-cap></p>`;
      const svg = el.querySelector("svg"), big = el.querySelector("[data-big]"), card = el.querySelector("[data-card]"), cap = el.querySelector("[data-cap]");
      const Q = [["1＋i", [1, 1]], ["−1＋i", [-1, 1]], ["−1−i", [-1, -1]], ["1−i", [1, -1]]];
      el.querySelector("[data-q]").innerHTML = Q.map(([l], i) => `<button type="button" class="btn small" data-qi="${i}" style="min-width:64px">${l}</button>`).join("");
      const render = () => {
        const zero = !z[0] && !z[1], q = quad(z), a = z[0], b = z[1];
        let s = "";
        /* faint quadrant shading: right half is where arctan is right */
        s += `<rect x="${g.X(0)}" y="0" width="${W - g.X(0)}" height="${H}" fill="var(--ok-soft)" opacity=".55"/><rect x="0" y="0" width="${g.X(0)}" height="${H}" fill="var(--attack-soft)" opacity=".55"/>`;
        s += cx.grid(g);
        [["1", 1, 1], ["2", -1, 1], ["3", -1, -1], ["4", 1, -1]].forEach(([n, sx, sy]) => { s += `<text x="${g.X(sx * 2.7)}" y="${g.Y(sy * 2.9)}" text-anchor="middle" class="svg-m" style="font-size:12px">第${n}象限</text>`; });
        if (zero) { svg.innerHTML = s + cx.handle(g, z, "var(--packet)") + cx.dot(g, z, "var(--packet)", "z"); big.innerHTML = "<b>z ＝ 0</b>"; card.innerHTML = "原点では角度が決まりません。点を動かしてください。"; cap.textContent = ""; return; }
        const t = cx.arg(z), has = a !== 0, at = has ? Math.atan(b / a) : (b > 0 ? Math.PI / 2 : -Math.PI / 2), wrong = has && a < 0, onAxis = !has;
        /* arctan answer: arc from the +real axis to the line through z, drawn on the right half (where arctan always lands) */
        s += `<line x1="${g.X(-3.3)}" y1="${g.Y(-3.3 * (has ? b / a : 99) )}" x2="${g.X(3.3)}" y2="${g.Y(3.3 * (has ? b / a : 99))}" stroke="var(--info)" stroke-dasharray="2 5" stroke-width="1.3" opacity=".7"/>`;
        s += cx.arc(g, [0, 0], .6, 0, at, "var(--info)", 3);
        s += cx.arc(g, [0, 0], .95, 0, t > 0 ? t : t, wrong ? "var(--attack)" : "var(--ok)", 3.6);
        if (wrong) { const bad = [Math.cos(at) * Math.hypot(a, b), Math.sin(at) * Math.hypot(a, b)]; s += `<circle cx="${g.X(bad[0])}" cy="${g.Y(bad[1])}" r="7" fill="none" stroke="var(--info)" stroke-width="2" stroke-dasharray="3 3"/>`; }
        s += cx.arrow(g, [0, 0], z, wrong ? "var(--attack)" : "var(--packet)", 3.2) + cx.handle(g, z, "var(--packet)") + cx.dot(g, z, wrong ? "var(--attack)" : "var(--packet)", "z");
        if (wrong && ST.motionScale()) s += `<circle cx="${g.X(a)}" cy="${g.Y(b)}" r="12" fill="none" stroke="var(--attack)" stroke-width="3"><animate attributeName="r" values="10;26;10" dur="1.2s" repeatCount="3"/><animate attributeName="opacity" values="1;.1;1" dur="1.2s" repeatCount="3"/></circle>`;
        svg.innerHTML = s;
        const D = v => cx.num(v * 180 / Math.PI, 0) + "°", T = d360(t), ratio = has ? cx.num(b / a, 3) : "b/0";
        big.innerHTML = onAxis ? `<b style="color:var(--ok)">a ＝ 0</b><span>b/a は計算できません</span>`
          : wrong ? `<b style="color:var(--attack)">ズレた! ${D(at)} → 本当は ${cx.num(T, 0)}°</b><span>${QN[q]}: 180° 足す</span>`
          : `<b style="color:var(--ok)">一致 ✓ ${cx.num(T, 0)}°</b><span>${QN[q]}: そのままでよい</span>`;
        card.innerHTML = onAxis ? `a ＝ 0 なので arctan(b/a) は使えません。真上なら 90°、真下なら 270°(−90°)と図で決めます。`
          : `z ＝ ${cx.fmt(z)}(${QN[q]})　b/a ＝ ${ratio}<br>
          <span style="color:var(--info)">arctan(b/a) ＝ ${D(at)}</span>(青い弧)<br>
          <span style="color:${wrong ? "var(--attack)" : "var(--ok)"}">本当の偏角 ＝ ${cx.num(T, 0)}°</span>(${wrong ? "赤" : "緑"}の弧。−180°〜180° なら ${cx.deg(t)})`;
        cap.innerHTML = wrong
          ? `左半分(第2・第3象限)では、arctan の答えは必ず −90°〜90° に入るので、点の向きと 180° ずれます。直し方は <b>arctan(b/a) ＋ 180°</b>。いまなら ${D(at)} ＋ 180° ＝ ${cx.num(T, 0)}°(${cx.deg(t)} とも書く)です。点線の円は、arctan が「勘違いしている」向きの点です。`
          : "右半分(第1・第4象限)なので、arctan(b/a) がそのまま偏角です。左半分に点を動かして、1＋i と −1−i のように b/a が同じでも角度がちがうことを確かめてください。";
      };
      cx.drag(svg, g, { snap: () => .5, handles: () => [{ id: "z", z }], tap: "z", move: (id, p) => { z = p; render(); ST.markLab("carg"); } });
      el.querySelectorAll("[data-qi]").forEach(b => b.onclick = () => { z = Q[+b.dataset.qi][1]; render(); ST.markLab("carg"); });
      render();
    }
  });
})(window.ST);
