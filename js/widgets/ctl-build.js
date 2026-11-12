"use strict";
/* Lab for 運動方程式を立てる手順 (第1・2回 モデリング): 時間応答は扱わず、「向きを決める → 力(電圧)を1つずつ書く → 合計をとおく」を
   1段ずつ見せる。機械系(質量・ばね・ダンパ)、RLC直列、回転系、水位系。式は KaTeX で組み上がる。 */
(function (ST) {
  const ctl = ST.ctl, A = ctl.arrow;
  const C = { f: "var(--attack)", k: "var(--info)", c: "var(--ok)", m: "var(--packet)", ink: "var(--ink)", mute: "var(--muted)" };
  const txt = (x, y, t, col, anchor, sz) => `<text x="${x}" y="${y}" text-anchor="${anchor || "start"}" class="svg-m" style="font-size:${sz || 10.5}px;font-weight:700" fill="${col || C.ink}">${t}</text>`;

  /* 各モデル: steps[i] = { t: 見出し, note: 説明, eq: 組み上がる式(TeX), svg(step) } */
  const MODELS = {
    mech: {
      name: "機械系(質量・ばね・ダンパ)",
      steps: [
        { t: "① 座標と正の向きを決める", note: "台車の位置 x を、右向きを正にとります。これで、力や速度の「符号」が決まります(右向きの力は＋、左向きは−)。", eq: "x \\;(\\text{右向きが正})" },
        { t: "② 台車だけを切り離す", note: "ばねとダンパをいったん消して、台車が受ける力だけを矢印で描く準備をします(自由体図)。", eq: "" },
        { t: "③ ばねの力", note: "ばねは、伸びると引き戻します。x が正(右へ動いた)ならば、力は左向き。だから −K x です。", eq: "-K x" },
        { t: "④ ダンパの力", note: "ダンパは、動きをじゃまします。速度と逆向きの力なので −C dx/dt です。", eq: "-K x \\;\\; -C \\frac{dx}{dt}" },
        { t: "⑤ 外から加える力", note: "右向きに押す力を f とします。", eq: "-K x \\;\\; -C \\frac{dx}{dt} \\;\\; +f" },
        { t: "⑥ 合計 ＝ 質量 × 加速度", note: "力の合計を M d²x/dt² とおいて、左辺にまとめると運動方程式になります。", eq: "M \\frac{d^{2}x}{dt^{2}} = f - K x - C \\frac{dx}{dt} \\;\\Rightarrow\\; M \\frac{d^{2}x}{dt^{2}} + C \\frac{dx}{dt} + K x = f" }
      ],
      svg(s) {
        const L = 150, W = 66, cy = 70, H = 44, fade = s >= 1;
        let o = `<line x1="0" y1="${cy + H + 14}" x2="340" y2="${cy + H + 14}" stroke="${C.mute}" stroke-width="1.4"/><rect x="0" y="${cy - 14}" width="9" height="${H + 28}" fill="var(--sunken)" stroke="${C.mute}"/>`;
        o += `<g opacity="${fade ? .22 : 1}">${ctl.spring(9, L, cy + 10, 6, 6, C.k)}${ctl.damper(9, L, cy + H - 10, C.c)}</g>`;
        o += `<rect x="${L}" y="${cy}" width="${W}" height="${H}" rx="4" fill="var(--surface)" stroke="${C.ink}" stroke-width="2"/>${txt(L + W / 2, cy + H / 2 + 5, "M", C.ink, "middle", 14)}`;
        o += `<circle cx="${L + 14}" cy="${cy + H + 8}" r="5.5" fill="var(--surface)" stroke="${C.ink}" stroke-width="1.6"/><circle cx="${L + W - 14}" cy="${cy + H + 8}" r="5.5" fill="var(--surface)" stroke="${C.ink}" stroke-width="1.6"/>`;
        o += A(L + W / 2 - 10, cy + H + 40, 50, C.ink, 2.5) + txt(L + W / 2 - 14, cy + H + 44, "x", C.ink, "end", 12) + txt(L + W / 2 + 44, cy + H + 54, "正の向き", C.mute, "middle", 9.5);
        if (s >= 2) o += A(L, cy + 12, -60, C.k, 4) + txt(L - 64, cy + 6, "−K x", C.k, "end", 11);
        if (s >= 3) o += A(L, cy + H - 12, -60, C.c, 4) + txt(L - 64, cy + H - 16, "−C dx/dt", C.c, "end", 11);
        if (s >= 4) o += A(L + W, cy + H / 2, 60, C.f, 4) + txt(L + W + 4, cy + H / 2 - 8, "f", C.f, "start", 12);
        return o;
      }
    },
    elec: {
      name: "電気系(RLC直列)",
      steps: [
        { t: "① 電流の正の向きを決める", note: "電流 i が、電源から時計まわりに流れるのを正とします。", eq: "i \\;(\\text{時計まわりが正})" },
        { t: "② 抵抗 R の電圧降下", note: "電流が抵抗を通ると、R i だけ電圧が下がります。", eq: "R i" },
        { t: "③ コイル L の電圧降下", note: "コイルは、電流の変化の速さに比例して電圧が下がります。", eq: "R i + L \\frac{di}{dt}" },
        { t: "④ コンデンサ C の電圧降下", note: "コンデンサは、ためた電荷(電流を足し合わせたもの)に比例して電圧が下がります。", eq: "R i + L \\frac{di}{dt} + \\frac{1}{C} \\int i \\, dt" },
        { t: "⑤ 一周の合計 ＝ 電源電圧", note: "キルヒホッフの電圧則: 一周すると、電圧降下の合計が電源電圧 v に等しくなります。", eq: "L \\frac{di}{dt} + R i + \\frac{1}{C} \\int i \\, dt = v" }
      ],
      svg(s) {
        const x0 = 40, x1 = 300, y0 = 40, y1 = 140, hl = (k, col) => s === k ? col : C.ink;
        const ym = (y0 + y1) / 2;
        let o = ctl.wire([[x0, ym - 12], [x0, y0], [x0 + 95, y0]]) + ctl.wire([[x0 + 125, y0], [x0 + 172, y0]]) + ctl.wire([[x0 + 208, y0], [x1, y0], [x1, ym - 12]]) + ctl.wire([[x1, ym + 12], [x1, y1], [x0, y1], [x0, ym + 12]]);
        o += ctl.sym("R", x0 + 110, y0, false, "", hl(1, C.f)) + ctl.sym("L", x0 + 190, y0, false, "", hl(2, C.f)) + ctl.sym("C", x1, (y0 + y1) / 2, true, "", hl(3, C.f)) + ctl.sym("V", x0, (y0 + y1) / 2, true, "", C.m);
        o += txt(x0 + 110, y0 - 12, "R", C.ink, "middle") + txt(x0 + 190, y0 - 12, "L", C.ink, "middle") + txt(x1 + 14, (y0 + y1) / 2 + 4, "C", C.ink) + txt(x0 + 18, (y0 + y1) / 2 + 4, "v", C.m);
        o += A(x0 + 150, y0 + 16, 40, C.m, 3) + txt(x0 + 200, y0 + 30, "i(正)", C.m, "start", 10);
        if (s >= 1) o += txt(x0 + 110, y0 + 30, "R i", s === 1 ? C.f : C.mute, "middle", 11);
        if (s >= 2) o += txt(x0 + 190, y0 + 46, "L di/dt", s === 2 ? C.f : C.mute, "middle", 11);
        if (s >= 3) o += txt(x1 - 10, (y0 + y1) / 2 + 24, "(1/C)∫i dt", s === 3 ? C.f : C.mute, "end", 10.5);
        if (s >= 4) o += txt(170, y1 + 24, "電圧降下の合計 ＝ v", C.m, "middle", 12);
        return o;
      }
    },
    rot: {
      name: "回転系(発展)",
      steps: [
        { t: "① 回転の正の向きを決める", note: "角度 θ を、反時計まわりを正にとります。", eq: "\\theta \\;(\\text{反時計まわりが正})" },
        { t: "② ねじりばねのトルク", note: "ねじれて戻そうとするトルクは、θ と逆向き。−K θ です(直線のばねの −K x に対応)。", eq: "-K \\theta" },
        { t: "③ 回転ダンパのトルク", note: "回転をじゃまするトルクは、角速度と逆向き。−C dθ/dt です。", eq: "-K \\theta \\;\\; -C \\frac{d\\theta}{dt}" },
        { t: "④ 加えるトルク", note: "回そうとするトルクを τ とします。", eq: "-K \\theta \\;\\; -C \\frac{d\\theta}{dt} \\;\\; +\\tau" },
        { t: "⑤ 合計 ＝ 慣性モーメント × 角加速度", note: "直線の式の「質量 M → 慣性モーメント J」「変位 x → 角度 θ」の置き換えで、同じ形になります。", eq: "J \\frac{d^{2}\\theta}{dt^{2}} + C \\frac{d\\theta}{dt} + K \\theta = \\tau" }
      ],
      svg(s) {
        const cx = 170, cy = 80, r = 38, arc = (a0, a1, R, col, w) => { const P = a => [cx + R * Math.cos(a), cy - R * Math.sin(a)], p0 = P(a0), p1 = P(a1); return `<path d="M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}A${R} ${R} 0 0 ${a1 > a0 ? 0 : 1} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w || 4}" stroke-linecap="round"/>`; };
        const head = (a, R, col, dir) => { const t = a + dir * .12, q = [cx + R * Math.cos(a), cy - R * Math.sin(a)], u = [cx + (R + 7) * Math.cos(t), cy - (R + 7) * Math.sin(t)], v = [cx + (R - 7) * Math.cos(t), cy - (R - 7) * Math.sin(t)]; return `<path d="M${q[0].toFixed(1)} ${q[1].toFixed(1)}L${u[0].toFixed(1)} ${u[1].toFixed(1)}L${v[0].toFixed(1)} ${v[1].toFixed(1)}z" fill="${col}"/>`; };
        let o = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--surface)" stroke="${C.ink}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="4" fill="${C.ink}"/>${txt(cx, cy + 22, "J", C.ink, "middle", 13)}`;
        o += `<line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${C.m}" stroke-width="3"/>`;
        o += arc(.1, 1.0, r + 16, C.ink, 2.5) + head(1.0, r + 16, C.ink, 1) + txt(cx + r + 34, cy - 48, "θ(正)", C.ink, "start", 11);
        if (s >= 1) o += arc(-.1, -1.0, r + 26, C.k, 4) + head(-1.0, r + 26, C.k, -1) + txt(cx + r + 40, cy + 56, "−K θ", C.k, "start", 11);
        if (s >= 2) o += arc(-.1 + Math.PI, -1.0 + Math.PI, r + 26, C.c, 4) + head(-1.0 + Math.PI, r + 26, C.c, -1) + txt(cx - r - 40, cy + 56, "−C dθ/dt", C.c, "end", 11);
        if (s >= 3) o += arc(Math.PI + .1, Math.PI + 1.0, r + 26, C.f, 4) + head(Math.PI + 1.0, r + 26, C.f, 1) + txt(cx - r - 40, cy - 48, "τ", C.f, "end", 12);
        return o;
      }
    },
    water: {
      name: "水位系(発展)",
      steps: [
        { t: "① たまる量を決める", note: "タンクの水位 h(断面積 A)を考えます。水の体積は A h です。", eq: "A h" },
        { t: "② 入ってくる量", note: "上から入る流量 q_in を矢印で描きます。", eq: "q_{in}" },
        { t: "③ 出ていく量", note: "出口の流れは、水位に比例します。出口の抵抗を R として h/R。", eq: "q_{in} - \\frac{h}{R}" },
        { t: "④ たまる量 ＝ 入る量 − 出る量", note: "水位の変化の速さ(A dh/dt)が、入る量と出る量の差に等しくなります。", eq: "A \\frac{dh}{dt} = q_{in} - \\frac{h}{R} \\;\\Rightarrow\\; A \\frac{dh}{dt} + \\frac{h}{R} = q_{in}" }
      ],
      svg(s) {
        const tx = 120, tw = 100, top = 36, bot = 140, lv = 84;
        let o = `<rect x="${tx}" y="${top}" width="${tw}" height="${bot - top}" fill="none" stroke="${C.ink}" stroke-width="2"/><rect x="${tx + 1}" y="${lv}" width="${tw - 2}" height="${bot - lv - 1}" fill="var(--info)" opacity=".55"/>`;
        o += `<line x1="${tx + tw}" y1="${bot - 8}" x2="${tx + tw + 40}" y2="${bot - 8}" stroke="${C.ink}" stroke-width="2"/>`;
        o += txt(tx + tw / 2, (lv + bot) / 2 + 4, "A, 水位 h", C.ink, "middle", 12);
        if (s === 0) o += `<line x1="${tx - 14}" y1="${lv}" x2="${tx - 14}" y2="${bot}" stroke="${C.ink}" stroke-width="1.5"/>${txt(tx - 20, (lv + bot) / 2 + 4, "h", C.ink, "end", 12)}`;
        if (s >= 1) o += `<line x1="${tx + tw / 2}" y1="8" x2="${tx + tw / 2}" y2="${lv - 8}" stroke="${C.f}" stroke-width="4"/><path d="M${tx + tw / 2} ${lv - 4} l-6 -9 h12z" fill="${C.f}"/>${txt(tx + tw / 2 + 10, 22, "q_in(入る)", C.f, "start", 11)}`;
        if (s >= 2) o += A(tx + tw + 4, bot - 8, 40, C.k, 4) + txt(tx + tw + 8, bot - 18, "h/R(出る)", C.k, "start", 11);
        if (s >= 3) o += `<path d="M${tx - 22} ${lv + 20}v-34" stroke="${C.m}" stroke-width="3"/><path d="M${tx - 22} ${lv - 18} l-5 8 h10z" fill="${C.m}"/>${txt(tx - 28, lv + 6, "A dh/dt", C.m, "end", 10.5)}`;
        return o;
      }
    }
  };

  ST.widget("build", {
    title: "運動方程式を立てる:力(電圧)を1つずつ書く",
    group: "ctl", name: "運動方程式を立てる手順", desc: "向きを決めて、力や電圧を1つずつ描き、合計をおいて式を組み上げる(機械・電気・回転・水位)", order: 2.5, tag: "モデリング",
    formula: "$\\text{(慣性)} + \\text{(摩擦)} + \\text{(復元)} = \\text{(入力)}$",
    says: "どの分野でも、①正の向きを決める ②働く力(電圧・流量)を1つずつ、向きと符号をセットで書く ③合計をおく、の順で式を立てます。時間の動きはここでは見ません。",
    meaning: "矢印の向きと符号がそろえば、あとは足すだけです。機械の M・C・K は、電気の L・R・1/C、回転の J・C・K と1対1で対応します。",
    mount(el) {
      let key = "mech", step = 0;
      el.innerHTML = `<div><p class="lab-label">どのモデル?</p>${ST.segHtml("model", Object.entries(MODELS).map(([k, m]) => [k, m.name.replace(/\(.*\)/, "")]), key)}</div>
        <div class="btns"><button type="button" class="btn" data-prev>‹ 戻る</button><button type="button" class="btn primary big" data-next>次へ ›</button><button type="button" class="btn" data-rst>↺</button></div>
        <div class="card" style="padding:10px"><div class="eyebrow" data-t></div><p class="cap" style="margin:6px 0 0" data-note aria-live="polite"></p></div>
        <div class="stage" style="padding:4px"><svg viewBox="0 0 340 190" style="width:100%;display:block" role="img" aria-label="力の矢印の図" data-scene></svg></div>
        <div class="hexbox" data-eq style="font-size:15px;min-height:44px;overflow-x:auto"></div>
        <div data-corr></div>`;
      const $ = s => el.querySelector(s);
      const draw = () => {
        const m = MODELS[key], N = m.steps.length; step = Math.max(0, Math.min(N - 1, step));
        const st = m.steps[step];
        $("[data-t]").innerHTML = `<span class="chip${step === N - 1 ? " ok" : ""}">${step + 1} / ${N}</span> ${ST.esc(st.t)}`;
        $("[data-note]").innerHTML = ST.am(st.note);
        $("[data-scene]").innerHTML = m.svg(step);
        $("[data-eq]").innerHTML = st.eq ? ST.tex(st.eq, true) : `<span class="cap">(力の矢印を描く準備)</span>`;
        $("[data-prev]").disabled = step <= 0; $("[data-next]").disabled = step >= N - 1;
        $("[data-corr]").innerHTML = step === N - 1 ? `<div class="card" style="padding:10px;overflow-x:auto"><div class="eyebrow">4つのモデルの対応</div><table style="width:100%;border-collapse:collapse;font-size:12px;text-align:center">
          <tr><th></th><th>直線</th><th>電気</th><th>回転</th><th>水位</th></tr>
          <tr><td>慣性</td><td>質量 M</td><td>コイル L</td><td>慣性モーメント J</td><td>なし</td></tr>
          <tr><td>摩擦</td><td>ダンパ C</td><td>抵抗 R</td><td>回転ダンパ C</td><td>出口の抵抗 R</td></tr>
          <tr><td>復元</td><td>ばね K</td><td>1/C</td><td>ねじりばね K</td><td>断面積 A(容量)</td></tr>
          <tr><td>入力</td><td>力 f</td><td>電圧 v</td><td>トルク τ</td><td>流入量 q_in</td></tr></table>
          <p class="cap" style="margin:6px 0 0">${ST.am(key === "water" ? "水位系は、質量やコイルにあたるものがないので、1階の式になります。" : "")}</p></div>` : "";
        ST.markLab("build");
      };
      ST.wireSeg(el, "model", v => { key = v; step = 0; ST.$$("[data-seg=model] button", el).forEach(b => b.setAttribute("aria-pressed", b.dataset.v === v)); draw(); });
      $("[data-prev]").onclick = () => { step--; draw(); };
      $("[data-next]").onclick = () => { step++; draw(); };
      $("[data-rst]").onclick = () => { step = 0; draw(); };
      draw();
    }
  });
})(window.ST);
