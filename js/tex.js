"use strict";
/* LaTeX for content strings (KaTeX is bundled in vendor/katex, so this works offline).
   - Write math as $...$ inside any string rendered with ST.md (lesson text, choices, questions, explanations, term text).
   - ST.tex(src, display) renders one TeX string to HTML.
   - ST.am(html) is for text built at runtime (lab captions etc.): it finds Unicode-style math such as "M x″ ＋ C x′ ＝ f" in the text
     parts of an HTML string and renders it with KaTeX (time derivatives become dx/dt). Strings that already contain $...$ are left alone. */
(function (ST) {
  const cache = new Map();
  ST.tex = (src, display) => {
    const key = (display ? "D" : "I") + src;   // display: full-size fractions, but still inline so text around it flows
    if (cache.has(key)) return cache.get(key);
    let html;
    try { html = window.katex.renderToString(display ? "\\displaystyle " + src : src, { displayMode: false, throwOnError: false, strict: "ignore", output: "html" }); }
    catch (e) { html = `<code>${ST.esc(src)}</code>`; }
    html = `<span class="tex" role="math" aria-label="${ST.esc(src)}">${html}</span>`;
    if (cache.size > 1500) cache.clear();
    cache.set(key, html);
    return html;
  };

  const SUB = { "₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9","ₓ":"x","ₒ":"o","ᵢ":"i","ₙ":"n","ₑ":"e","ₜ":"t","ₛ":"s","ₐ":"a","ₖ":"k" };
  const SUP = { "²":"2","³":"3","¹":"1","⁰":"0","ⁿ":"n" };
  const GREEK = { "α":"\\alpha","β":"\\beta","γ":"\\gamma","δ":"\\delta","ε":"\\varepsilon","ζ":"\\zeta","η":"\\eta","θ":"\\theta","λ":"\\lambda","μ":"\\mu","π":"\\pi","ρ":"\\rho","σ":"\\sigma","τ":"\\tau","φ":"\\varphi","ω":"\\omega","Δ":"\\Delta","Σ":"\\Sigma","Ω":"\\Omega" };
  const subc = Object.keys(SUB).join(""), supc = Object.keys(SUP).join("");
  const greekc = Object.keys(GREEK).join("");
  // characters allowed inside a math run
  const MATHCH = `±A-Za-z0-9${greekc}${subc}${supc}′″＝＋−＋=+\\-×÷·/()\\[\\]{}|,.≈≦≧→∫√∞_^ 　`;
  const RUN = new RegExp(`[${MATHCH}]+`, "g");
  const TRIGGER_A = /[＝=′″²³ₓₒᵢₙₑₜ₀-₉_^√∫≈≦≧]/;
  const isTrig = t => (TRIGGER_A.test(t) || (/[A-Za-z0-9α-ωΔΣΩ]/.test(t) && /[＋−+/<>×÷|]/.test(t) && /[A-Za-zα-ωΔΣΩ]/.test(t) && /[^ 0-9.,\-−+＋]/.test(t)));

  const DER_LETTERS = "xyqθωeiv";   // time-derivative letters (f, F, z stay as f′)

  function toTex(run) {
    let s = run;
    s = s.replace(/\bd\{([^{}]*)\}/g, 'd($1)');
    // time derivatives:  T″  T′  (T = letter + optional subscripts / _x)
    const T = `([${DER_LETTERS}])((?:[${subc}]+|_[A-Za-z0-9]+)?)`;
    s = s.replace(new RegExp(T + "″", "g"), (m, l, sb) => `@D2(${l}${sb})`);
    s = s.replace(new RegExp(T + "′", "g"), (m, l, sb) => `@D1(${l}${sb})`);
    // fractions with parenthesised/atom operands
    const GRP = `(?:\\([^()]*(?:\\([^()]*\\)[^()]*)*\\)|\\{[^{}]*\\})`;
    const ATOM = `(?:@D[12]\\([^)]*\\)|${GRP}[${supc}]*|[A-Za-z0-9.${greekc}${subc}${supc}]+(?:_[A-Za-z0-9]+)?(?:${GRP})?[${supc}]*)`;
    s = s.replace(new RegExp(`(${ATOM})/(${ATOM})`, "g"), (m, a, b) => {
      const strip = x => /^[({].*[)}]$/.test(x) ? x.slice(1, -1) : x;
      return `@F(${strip(a)})(${strip(b)})`;
    });
    // simple char maps
    for (let i = s.indexOf("^("); i >= 0; i = s.indexOf("^(", i + 1)) {
      let d = 0, j = i + 1;
      for (; j < s.length; j++) { if (s[j] === "(") d++; else if (s[j] === ")" && --d === 0) break; }
      if (j < s.length) s = s.slice(0, i) + "^\uE000" + s.slice(i + 2, j) + "\uE001" + s.slice(j + 1);
    }
    s = s.replace(new RegExp(`[${subc}]+`, "g"), m => "_\uE000" + [...m].map(c => SUB[c]).join("") + "\uE001");
    s = s.replace(new RegExp(`[${supc}]+`, "g"), m => "^\uE000" + [...m].map(c => SUP[c]).join("") + "\uE001");
    s = s.replace(/＝/g, "=").replace(/＋/g, "+").replace(/−/g, "-").replace(/×/g, "\\times ").replace(/÷/g, "\\div ").replace(/·/g, "\\cdot ");
    s = s.replace(/≈/g, "\\approx ").replace(/≦/g, "\\leq ").replace(/≧/g, "\\geq ").replace(/→/g, "\\to ").replace(/∞/g, "\\infty ");
    s = s.replace(/∫/g, "\\int ").replace(/±/g, "\\pm ").replace(/√\(((?:[^()]|\([^()]*\))*)\)/g, "\\sqrt\uE000$1\uE001").replace(/√([A-Za-z0-9]+)/g, "\\sqrt\uE000$1\uE001");
    s = s.replace(new RegExp(`[${greekc}]`, "g"), c => GREEK[c] + " ");
    s = s.replace(/\b(sin|cos|tan|exp|ln|log|lim)\b/g, "\\$1 ");
    s = s.replace(/\bL\[/g, "\\mathcal\uE000L\uE001[").replace(/\b(Re|Im)\b/g, "\\operatorname\uE000$1\uE001").replace(/ at /g, "\\text\uE000 at \uE001 ").replace(/′/g, "'").replace(/″/g, "''");
    s = s.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
    // restore markers
    s = s.replace(/\uE000/g, "{").replace(/\uE001/g, "}");
    // derivative / fraction markers (after brace escape so their braces survive)
    s = s.replace(/@D2\(([^)]*)\)/g, (m, t) => `\\frac{d^{2}${t}}{dt^{2}}`);
    s = s.replace(/@D1\(([^)]*)\)/g, (m, t) => `\\frac{d${t}}{dt}`);
    s = s.replace(/@F\(((?:[^()]|\([^()]*\))*)\)\(((?:[^()]|\([^()]*\))*)\)/g, (m, a, b) => `\\frac{${a}}{${b}}`);
    s = s.replace(/　+/g, " \\quad ").replace(/ +/g, " ").trim();
    return s;
  }

  function convRun(run) {
    const t = run.trim();
    if (!t || !isTrig(t) || !/[A-Za-z0-9α-ωΔΣΩ]/.test(t)) return run;
    let lead = "", trail = "", core = run;
    let m = core.match(/^[ 　,.]+/); if (m) { lead = m[0]; core = core.slice(m[0].length); }
    m = core.match(/[ 　,.]+$/); if (m) { trail = m[0]; core = core.slice(0, -m[0].length); }
    for (;;) {
      const st = [], bad = new Set();
      [...core].forEach((c, i) => {
        if ("([{".includes(c)) st.push(i);
        else if (")]}".includes(c)) { if (st.length) st.pop(); else bad.add(i); }
      });
      st.forEach(i => bad.add(i));
      if (!bad.size) break;
      const first = Math.min(...bad), last = core.length - 1;
      if (first === 0) { lead += core[0]; core = core.slice(1); continue; }
      if (bad.has(last)) { trail = core[last] + trail; core = core.slice(0, -1); continue; }
      // unmatched bracket in the middle: split around it
      const left = core.slice(0, first), ch = core[first], right = core.slice(first + 1);
      const isOpen = "([{".includes(ch);
      return lead + convRun(left) + (isOpen ? convRun(ch + right) : ch + convRun(right)) + trail;
    }
    if (!core.trim() || !isTrig(core.trim())) return run;
    return lead + "$" + toTex(core) + "$" + trail;
  }
  function convStr(str) {
    if (/^[a-z0-9\-_.]+$/.test(str) || str.includes("$")) return str;
    const keep = [];   // unit words end a math run and stay plain text
    const t = str.replace(/\b(?:rad\/s|rad|Hz|dB|sec)\b/g, m => { keep.push(m); return "\uE002"; });
    return t.replace(RUN, convRun).replace(/\uE002/g, () => keep.shift());
  }

  /* Unicode-style math in plain text -> text with $...$ markers. */
  ST.unimath = convStr;
  /* HTML string built at runtime: render the math found in its text parts (tags are kept as they are). */
  ST.am = html => String(html).split(/(<[^>]*>)/).map((p, i) => i % 2 || !p ? p : p.indexOf("$") >= 0 ? p : convStr(p).replace(/\$([^$]+)\$/g, (m, t) => ST.tex(t))).join("");
})(window.ST = window.ST || {});
