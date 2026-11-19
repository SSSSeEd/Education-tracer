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

  const SUB = { "ₘ":"m","ᵣ":"r","ⱼ":"j","₊":"+","₋":"-","ₗ":"l","₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9","ₓ":"x","ₒ":"o","ᵢ":"i","ₙ":"n","ₑ":"e","ₜ":"t","ₛ":"s","ₐ":"a","ₖ":"k" };
  const SUP = { "²":"2","³":"3","¹":"1","⁰":"0","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","ⁿ":"n","ᶻ":"z","ᵗ":"t","ˡ":"l","ⁱ":"i","ʳ":"r","ˣ":"x","ᵏ":"k","ᵐ":"m","⁺":"+","⁻":"-" };
  const SETS = { "ℂ":"\\mathbb{C}","ℝ":"\\mathbb{R}","ℤ":"\\mathbb{Z}","ℕ":"\\mathbb{N}","ℚ":"\\mathbb{Q}" };
  const SYM = { "↦":"\\mapsto ","⇔":"\\Leftrightarrow ","⇒":"\\Rightarrow ","≅":"\\cong ","≠":"\\neq ","≤":"\\leq ","≥":"\\geq ","∈":"\\in ","∂":"\\partial ","∮":"\\oint ","∠":"\\angle ","⊂":"\\subset ","∅":"\\emptyset ","∑":"\\sum ","∏":"\\prod " };
  const GREEK = { "α":"\\alpha","β":"\\beta","γ":"\\gamma","δ":"\\delta","ε":"\\varepsilon","ζ":"\\zeta","η":"\\eta","θ":"\\theta","λ":"\\lambda","μ":"\\mu","π":"\\pi","ρ":"\\rho","σ":"\\sigma","τ":"\\tau","φ":"\\varphi","ω":"\\omega","Δ":"\\Delta","Σ":"\\Sigma","Ω":"\\Omega" };
  const subc = Object.keys(SUB).join(""), supc = Object.keys(SUP).join("");
  const greekc = Object.keys(GREEK).join("");
  const setc = Object.keys(SETS).join(""), symc = Object.keys(SYM).join("");
  // characters allowed inside a math run
  const MATHCH = `${setc}${symc}±A-Za-z0-9${greekc}${subc}${supc}′″＝＋−＋=+\\-×÷·/()\\[\\]{}|,.≈≦≧→∫√∞_^!° 　\u0304`;
  const RUN = new RegExp(`[${MATHCH}]+`, "g");
  const TRIGGER_A = new RegExp(`[＝=′″_^√∫≈≦≧${subc}${supc}α-ωΔΣΩ∞${setc}${symc}]|(?<![A-Za-z])[A-Za-z]\\((?:[A-Za-z0-9α-ωΔ ,.+\\-−×·/]+)\\)|\\(\\s*[A-Za-z0-9α-ω]+\\s*[,，]\\s*[A-Za-z0-9α-ω ,]+\\)|(?<![A-Za-z])(?:sin|cos|tan|log|ln|exp)(?![A-Za-z])|[A-Za-z0-9α-ω)]\\s*[→↦]\\s*[A-Za-z0-9α-ω(]|\\b(?:Re|Im)\\s[A-Za-zα-ω]|[A-Za-z0-9)\\]]!|[A-Za-z0-9)!]\\s*[×÷]\\s*[A-Za-z0-9(]|[A-Za-z]\u0304`);
  const isTrig = t => (TRIGGER_A.test(t) || (/[A-Za-z0-9α-ωΔΣΩ]/.test(t) && /[＋−+/<>×÷|]/.test(t) && /[A-Za-zα-ωΔΣΩ]/.test(t) && /[^ 0-9.,\-−+＋]/.test(t)));

  const DER_LETTERS = "xyqθωeiv";   // time-derivative letters (f, F, z stay as f′)

  function toTex(run) {
    let s = run;
    s = s.replace(/([A-Za-z])\u0304/g, "\\bar\uE000$1\uE001").replace(/°/g, "^\uE000\\circ\uE001");
    s = s.replace(/\bd\{([^{}]*)\}/g, 'd($1)');
    // time derivatives:  T″  T′  (T = letter + optional subscripts / _x)
    const T = `([${DER_LETTERS}])((?:[${subc}]+|_[A-Za-z0-9]+)?)`;
    s = s.replace(new RegExp(T + "″", "g"), (m, l, sb) => `@D2(${l}${sb})`);
    s = s.replace(new RegExp(T + "′", "g"), (m, l, sb) => `@D1(${l}${sb})`);
    // fractions with parenthesised/atom operands
    const GRP = `(?:\\([^()]*(?:\\([^()]*\\)[^()]*)*\\)|\\{[^{}]*\\})`;
    const ATOM = `(?:@D[12]\\([^)]*\\)|${GRP}[${supc}]*!*|[A-Za-z0-9.${greekc}${subc}${supc}]+(?:_[A-Za-z0-9]+)?(?:${GRP})?[${supc}]*!*)`;
    s = s.replace(new RegExp(`(?<![·×＋+−\\-A-Za-z0-9.])(${ATOM}) ?/ ?(${ATOM})`, "g"), (m, a, b) => {
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
    s = s.replace(new RegExp(`[${greekc}]`, "g"), c => GREEK[c] + " ").replace(new RegExp(`[${setc}]`, "g"), c => "\\mathbb\uE000" + SETS[c].charAt(8) + "\uE001").replace(new RegExp(`[${symc}]`, "g"), c => SYM[c]);
    s = s.replace(/(?<![A-Za-z\\])(sin|cos|tan|exp|ln|log|lim|arg)(?![A-Za-z])/g, "\\$1 ").replace(/\bLog\b/g, "\\operatorname\uE000Log\uE001");
    s = s.replace(/\bL\[/g, "\\mathcal\uE000L\uE001[").replace(/\b(Re|Im)\b/g, "\\operatorname\uE000$1\uE001").replace(/ at /g, "\\text\uE000 at \uE001 ").replace(/′/g, "'").replace(/″/g, "''");
    s = s.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
    // restore markers
    s = s.replace(/\uE000/g, "{").replace(/\uE001/g, "}");
    // derivative / fraction markers (after brace escape so their braces survive)
    s = s.replace(/@D2\(([^)]*)\)/g, (m, t) => `\\frac{d^{2}${t}}{dt^{2}}`);
    s = s.replace(/@D1\(([^)]*)\)/g, (m, t) => `\\frac{d${t}}{dt}`);
    s = s.replace(/@F\(((?:[^()]|\([^()]*\))*)\)\(((?:[^()]|\([^()]*\))*)\)/g, (m, a, b) => `\\frac{${a}}{${b}}`);
    s = s.replace(/(^|[^A-Za-z0-9}])_\{/g, "$1{}_{");
    s = s.replace(/　+/g, " \\quad ").replace(/ +/g, " ").trim();
    return s;
  }

  function convRun(run) {
    const t = run.trim();
    if (!t || !isTrig(t) || !new RegExp(`[A-Za-z0-9α-ωΔΣΩ${setc}]`).test(t)) return run;
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
    const keep = [];   // unit words and [[term]] links end a math run and stay plain text
    const t = str.replace(/\[\[[a-z0-9-]+(?:\|[^\]]+)?\]\]|\b(?:rad\/s|rad|Hz|dB|sec)\b/g, m => { keep.push(m); return "\uE002"; })
      .replace(/\bm\/s(²?)/g, (m, sq) => { keep.push("$\\mathrm{m/s" + (sq ? "^{2}" : "") + "}$"); return "\uE002"; });
    return t.replace(RUN, (run, off) => {
      const lab = /[ぁ-んァ-ヶ一-龥]$/.test(t.slice(0, off)) && run.match(/^[0-9]+/);   // "例2", "問1": the number is a label, not math
      return lab ? lab[0] + convRun(run.slice(lab[0].length)) : convRun(run);
    }).replace(/\uE002/g, () => keep.shift());
  }

  /* Unicode-style math in plain text -> text with $...$ markers. */
  ST.unimath = convStr;
  /* HTML string built at runtime: render the math found in its text parts (tags are kept as they are). */
  ST.am = html => String(html).split(/(<[^>]*>)/).map((p, i) => i % 2 || !p ? p : p.indexOf("$") >= 0 ? p : convStr(p).replace(/\$([^$]+)\$/g, (m, t) => ST.tex(t))).join("");

  /* Text nodes under `root` (not SVG, code, form fields or math already rendered): render Unicode-style math with KaTeX. */
  const SKIP = "svg, code, pre, input, textarea, select, script, style, .tex, .katex";
  ST.amTree = root => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), hits = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement;
      if (!el || el.closest(SKIP) || !n.nodeValue.trim()) continue;
      const out = convStr(n.nodeValue);
      if (out !== n.nodeValue) hits.push([n, out]);
    }
    hits.forEach(([n, out]) => {
      const f = document.createDocumentFragment();
      out.split(/\$([^$]+)\$/).forEach((part, i) => {
        if (i % 2) { const sp = document.createElement("span"); sp.innerHTML = ST.tex(part); f.appendChild(sp.firstChild); }
        else if (part) f.appendChild(document.createTextNode(part));
      });
      n.parentNode.replaceChild(f, n);
    });
  };
  /* SVG <text> that holds math: the original element stays (hidden), and a <foreignObject> with KaTeX is placed at the same spot.
     The widget may keep updating the <text> (textContent = ...); the next run re-renders the foreignObject from the new text. */
  const SVGNS = "http://www.w3.org/2000/svg", XHTML = "http://www.w3.org/1999/xhtml";
  function svgTexify(t) {
    if (t.closest(".katex, .tex, foreignObject") || t.children.length) return;
    const src = t.textContent;
    if (t._texSrc === src && t._texFO && t._texFO.isConnected) return;
    const out = src.trim() ? convStr(src) : src;
    if (out === src || out.indexOf("$") < 0) {
      if (t._texFO) { t._texFO.remove(); t._texFO = null; t.style.visibility = ""; }
      t._texSrc = src; return;
    }
    const svg = t.ownerSVGElement; if (!svg) return;
    const cs = getComputedStyle(t), fs = parseFloat(cs.fontSize) || 12;
    let fo = t._texFO;
    if (!fo || !fo.isConnected) {
      fo = document.createElementNS(SVGNS, "foreignObject");
      fo.setAttribute("data-tex", ""); fo.style.overflow = "visible"; fo.style.pointerEvents = "none";
      t.parentNode.insertBefore(fo, t.nextSibling);
      t._texFO = fo;
    }
    const div = document.createElementNS(XHTML, "div");
    div.style.cssText = `display:inline-block;white-space:nowrap;line-height:1.2;font-size:${fs}px;color:${cs.fill && cs.fill !== "none" ? cs.fill : "currentColor"};font-weight:${cs.fontWeight}`;
    div.innerHTML = out.split(/\$([^$]+)\$/).map((part, i) => i % 2 ? ST.tex(part) : ST.esc(part)).join("");
    fo.replaceChildren(div);
    fo.setAttribute("x", "0"); fo.setAttribute("y", "0"); fo.setAttribute("width", "600"); fo.setAttribute("height", "100");
    const k = (svg.getScreenCTM() || { a: 1 }).a || 1, r = div.getBoundingClientRect();
    const w = r.width / k, h = r.height / k;
    if (!(w > 0) || !(h > 0)) { fo.remove(); t._texFO = null; return; }   // not laid out yet (hidden): try again on the next change
    const x = parseFloat(t.getAttribute("x")) || 0, y = parseFloat(t.getAttribute("y")) || 0, dx = parseFloat(t.getAttribute("dx")) || 0, dy = parseFloat(t.getAttribute("dy")) || 0;
    const anchor = t.getAttribute("text-anchor") || cs.textAnchor || "start";
    const left = x + dx - (anchor === "middle" ? w / 2 : anchor === "end" ? w : 0);
    fo.setAttribute("x", left.toFixed(1)); fo.setAttribute("y", (y + dy - fs * 0.35 - h / 2).toFixed(1));
    fo.setAttribute("width", Math.ceil(w + 2)); fo.setAttribute("height", Math.ceil(h + 1));
    if (t.getAttribute("transform")) fo.setAttribute("transform", t.getAttribute("transform")); else fo.removeAttribute("transform");
    t.style.visibility = "hidden"; t._texSrc = src;
  }
  ST.svgTex = root => root.querySelectorAll("svg text").forEach(svgTexify);

  /* Keep a lab's text rendered as it is redrawn (labs rewrite their captions with innerHTML / textContent). */
  ST.watchTree = root => {
    let busy = false;
    const run = () => { if (busy) return; busy = true; try { ST.amTree(root); ST.svgTex(root); } finally { busy = false; } };
    const mo = new MutationObserver(muts => { if (!busy && muts.some(m => { const tg = m.target.nodeType === 1 ? m.target : m.target.parentElement; return !(tg && tg.closest && tg.closest(".tex, foreignObject")); })) { mo.disconnect(); run(); mo.observe(root, { childList: true, subtree: true, characterData: true }); } });
    run(); mo.observe(root, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  };
})(window.ST = window.ST || {});
