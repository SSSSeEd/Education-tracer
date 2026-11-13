"use strict";
/* Lab: 伝達関数を求める解法ステッパー。時間では流れず、「次へ」「戻る」で1コマずつ進む。
   順番: ① 部品間の入出力 → ② 部品ごとの関係式 → ③ 全体の関係式 → ④ 式変形(ラプラス変換・整理)。
   式変形では、いま何をしたかを色と括弧で示す(橙 = 代入した/変えた部分、青 = 前の式から受け継いだ部分、緑 = 答え)。 */
(function (ST) {
  const O = s => String.raw`\textcolor{#e8590c}{${s}}`, B = s => String.raw`\textcolor{#1c7ed6}{${s}}`, G = s => String.raw`\textcolor{#2f9e44}{${s}}`;
  const STAGES = ["① 入出力", "② 部品の式", "③ 全体の式", "④ 式変形"];
  const EX = {
    mech: { name: "ばね・ダンパ・質量(f → x)", steps: [
      { st: 0, note: "まず、部品どうしが何をやり取りするかを決めます。入力は外力 $f$、出力は変位 $x$。ばねとダンパは、台車の動きを受けて力を返します。",
        lines: [String.raw`f \;\to\; [\text{質量 } M] \;\to\; x`, String.raw`x \;\to\; [\text{ばね } K] \;\to\; f_{K} \qquad \frac{dx}{dt} \;\to\; [\text{ダンパ } C] \;\to\; f_{C}`] },
      { st: 1, note: "部品ごとに、入力と出力の関係を1本ずつ式にします。ばねは変位に比例、ダンパは速度に比例。",
        lines: [String.raw`f_{K} = K x`, String.raw`f_{C} = C \frac{dx}{dt}`] },
      { st: 1, note: "質量は、「力の合計 = 質量 × 加速度」。台車に働く力は、外力 $f$ と、逆向きのばね・ダンパの力です。",
        lines: [String.raw`M \frac{d^{2}x}{dt^{2}} = f - f_{K} - f_{C}`] },
      { st: 2, note: "代入: $f_{K}$ と $f_{C}$ を、②の式でおきかえます。おきかえた部分を括弧でくくって、橙で示します。",
        lines: [String.raw`M \frac{d^{2}x}{dt^{2}} = f - ${O(String.raw`\left( K x \right)`)} - ${O(String.raw`\left( C \frac{dx}{dt} \right)`)}`] },
      { st: 2, note: "移項: 出力 $x$ の項を左へ、入力 $f$ を右へ集めます。移した項が橙です。",
        lines: [String.raw`M \frac{d^{2}x}{dt^{2}} + ${O(String.raw`C \frac{dx}{dt} + K x`)} = f`] },
      { st: 3, note: "ラプラス変換(初期値 0): $\\frac{d}{dt} \\to s$、$\\frac{d^{2}}{dt^{2}} \\to s^{2}$、$x \\to X$、$f \\to F$。変わった部分が橙です。",
        lines: [String.raw`M ${O(String.raw`s^{2}X`)} + C ${O(String.raw`s X`)} + K ${O("X")} = ${O("F")}`] },
      { st: 3, note: "$X$ をくくり出します。$X$ を含む3項を、括弧でまとめます。",
        lines: [String.raw`${O(String.raw`\left( M s^{2} + C s + K \right)`)} X = F`] },
      { st: 3, note: "出力 / 入力 = $\\frac{X}{F}$ にするため、両辺を $F$ と括弧の中身で割ります。これが伝達関数です。",
        lines: [String.raw`G(s) = \frac{X}{F} = ${G(String.raw`\frac{1}{M s^{2} + C s + K}`)}`] }
    ] },
    rc: { name: "RC直列回路(eᵢ → eₒ)", steps: [
      { st: 0, note: "入力は電源の電圧 $e_{i}$、出力はコンデンサの電圧 $e_{o}$。直列なので、抵抗とコンデンサに同じ電流 $i$ が流れます。",
        lines: [String.raw`e_{i} \;\to\; [\text{抵抗 } R] \;\to\; e_{R} \;\to\; [\text{コンデンサ } C] \;\to\; e_{o}`, String.raw`\text{どちらにも、同じ電流 } i \text{ が流れる}`] },
      { st: 1, note: "部品ごとに、電流と電圧の関係を式にします。",
        lines: [String.raw`e_{R} = R i`, String.raw`e_{o} = \frac{1}{C} \int i \, dt`] },
      { st: 2, note: "キルヒホッフの第2法則: 電源の電圧は、抵抗の電圧降下とコンデンサの電圧の和です。",
        lines: [String.raw`e_{i} = e_{R} + e_{o}`] },
      { st: 2, note: "代入: $e_{R}$ を、②の式でおきかえます(括弧と橙)。",
        lines: [String.raw`e_{i} = ${O(String.raw`\left( R i \right)`)} + e_{o}`] },
      { st: 2, note: "電流 $i$ を出力 $e_{o}$ で表します。②の式の両辺を微分すると $i = C \\frac{de_{o}}{dt}$ なので、これを代入します。",
        lines: [String.raw`e_{i} = R ${O(String.raw`\left( C \frac{de_{o}}{dt} \right)`)} + e_{o}`, String.raw`e_{i} = ${B("RC")} \frac{de_{o}}{dt} + e_{o}`] },
      { st: 3, note: "ラプラス変換(初期値 0): $\\frac{d}{dt} \\to s$、$e \\to E$。変わった部分が橙です。",
        lines: [String.raw`${O("E_{i}")} = RC ${O(String.raw`s E_{o}`)} + ${O("E_{o}")}`] },
      { st: 3, note: "$E_{o}$ をくくり出します。",
        lines: [String.raw`E_{i} = ${O(String.raw`\left( RC s + 1 \right)`)} E_{o}`] },
      { st: 3, note: "出力 / 入力 = $\\frac{E_{o}}{E_{i}}$ にするため、両辺を $E_{i}$ と括弧の中身で割ります。これが伝達関数です。",
        lines: [String.raw`G(s) = \frac{E_{o}}{E_{i}} = ${G(String.raw`\frac{1}{RC s + 1}`)}`] }
    ] }
  };

  ST.widget("tfstep", {
    title: "伝達関数を求める:入出力 → 部品の式 → 全体の式 → 式変形",
    group: "ctl", name: "伝達関数を求める手順", desc: "「次へ」で1コマずつ。入出力、部品ごとの式、全体の式、式変形(代入・ラプラス変換)を、色と括弧で示す", order: 3, tag: "伝達関数",
    formula: "$G(s) = \\frac{X(s)}{F(s)}$(出力 / 入力、初期値 0)",
    says: "伝達関数を求めるには、「式を立てる」と「ラプラス変換する」の2つが要ります。式は、①部品どうしの入出力 → ②部品ごとの関係式 → ③全体の関係式 の順で立て、④で式変形(代入・ラプラス変換・整理)をします。",
    meaning: "1コマごとに、何をしたかを一言で添えてあります。橙は、そのコマで変わった(代入した・変換した)部分、緑は答えです。前のコマに戻って、見直せます。",
    mount(el) {
      let key = "mech", step = 0;
      el.innerHTML = `<div><p class="lab-label">例題</p>${ST.segHtml("ex", Object.entries(EX).map(([k, x]) => [k, x.name]), key)}</div>
        <div class="stagechips" data-stages style="display:flex;gap:4px;flex-wrap:wrap"></div>
        <div class="card" style="padding:10px"><div class="eyebrow" data-t></div><p class="cap" style="margin:6px 0 0" data-note aria-live="polite"></p></div>
        <div class="hexbox" data-eq style="font-size:16px;min-height:60px;overflow-x:auto;line-height:2.1"></div>
        <div class="btns"><button type="button" class="btn" data-prev>‹ 戻る</button><button type="button" class="btn primary big" data-next>次へ ›</button><button type="button" class="btn" data-rst>↺</button></div>`;
      const $ = s => el.querySelector(s);
      const draw = () => {
        const ex = EX[key], N = ex.steps.length; step = Math.max(0, Math.min(N - 1, step));
        const cur = ex.steps[step];
        $("[data-stages]").innerHTML = STAGES.map((s, i) => `<span class="chip${i === cur.st ? " ok" : ""}" style="${i > cur.st ? "opacity:.45" : ""}">${s}</span>`).join("");
        $("[data-t]").innerHTML = `<span class="chip">${step + 1} / ${N}</span> ${ST.esc(STAGES[cur.st])}`;
        $("[data-note]").innerHTML = ST.md(cur.note);
        const rows = [];
        for (let i = 0; i <= step; i++) {
          const s = ex.steps[i], last = i === step, sameStage = s.st === cur.st;
          if (sameStage) s.lines.forEach((l, j) => rows.push(`<div style="${last && j === s.lines.length - 1 ? "" : "opacity:.5"}">${ST.tex(l, true)}</div>`));
        }
        /* 前の段階の、最後の式(いま使っている式)を薄く添える */
        const prev = ex.steps.slice(0, step).filter(s => s.st < cur.st).pop();
        const carried = prev ? `<div class="cap" style="margin:0 0 4px">前の段階の結果</div><div style="opacity:.45">${ST.tex(prev.lines[prev.lines.length - 1], true)}</div><hr style="border:0;border-top:1px dashed var(--muted);margin:6px 0">` : "";
        $("[data-eq]").innerHTML = carried + rows.join("");
        $("[data-prev]").disabled = step <= 0; $("[data-next]").disabled = step >= N - 1;
        ST.markLab("tfstep");
      };
      ST.wireSeg(el, "ex", v => { key = v; step = 0; ST.$$("[data-seg=ex] button", el).forEach(b => b.setAttribute("aria-pressed", b.dataset.v === v)); draw(); });
      $("[data-prev]").onclick = () => { step--; draw(); };
      $("[data-next]").onclick = () => { step++; draw(); };
      $("[data-rst]").onclick = () => { step = 0; draw(); };
      draw();
    }
  });
})(window.ST);
