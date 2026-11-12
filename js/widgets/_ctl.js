"use strict";
/* Shared helpers for the control-engineering labs (制御工学): RK4 integrator, a time player with a scrub bar,
   a small line-plot (inline SVG), sliders, and drawing helpers for springs, dampers, resistors and so on.
   Everything is computed in the browser; nothing is sent anywhere. */
(function (ST) {
  const ctl = ST.ctl = {};
  const esc = ST.esc;

  /* Number for display: rounded, no trailing zeros, proper minus sign (U+2212). */
  ctl.n = (v, d) => {
    d = d == null ? 2 : d;
    let s = (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toString();
    if (s === "-0") s = "0";
    return s.replace("-", "−");
  };

  /* Fixed-step RK4. f(x, t) returns dx/dt (array). Returns {dt, x: [state at 0, dt, 2dt, …]} with n+1 samples. */
  ctl.rk4 = (f, x0, dt, n) => {
    let x = x0.slice(); const out = [x.slice()], k = (a, b, s) => a.map((v, i) => v + b[i] * s);
    for (let i = 0; i < n; i++) {
      const t = i * dt, k1 = f(x, t), k2 = f(k(x, k1, dt / 2), t + dt / 2), k3 = f(k(x, k2, dt / 2), t + dt / 2), k4 = f(k(x, k3, dt), t + dt);
      x = x.map((v, j) => v + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
      out.push(x.slice());
    }
    return { dt, x: out };
  };
  /* Column j of a simulation as a plain array, and linear interpolation of an array sampled every dt. */
  ctl.col = (sim, j) => sim.x.map(r => r[j]);
  ctl.at = (arr, dt, t) => { const f = Math.max(0, Math.min(arr.length - 1, t / dt)), i = Math.floor(f), r = f - i; return i >= arr.length - 1 ? arr[arr.length - 1] : arr[i] + (arr[i + 1] - arr[i]) * r; };

  /* Sliders: defs [{id, label, min, max, step, v, unit}] → html; wireSliders(el, (id, value) => …). */
  ctl.sliders = defs => `<div class="ctl-sl">${defs.map(d => `<label class="ctl-s"><span class="lab-label">${esc(d.label)}　<b data-o="${d.id}">${ctl.n(d.v, 2)}</b>${d.unit ? " " + esc(d.unit) : ""}</span><input type="range" class="input" style="padding:0" data-p="${d.id}" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.v}" aria-label="${esc(d.label)}"></label>`).join("")}</div>`;
  ctl.wireSliders = (el, fn) => ST.$$("[data-p]", el).forEach(inp => inp.addEventListener("input", () => {
    const o = el.querySelector(`[data-o="${inp.dataset.p}"]`); if (o) o.textContent = ctl.n(+inp.value, 2);
    fn(inp.dataset.p, +inp.value);
  }));

  /* Time player: ▶ / ↺ and a scrub bar. o: {T, draw(t), speed}. draw is called with the current time whenever it changes.
     Returns {restart(), redraw(), setT(T), stop()}. With the motion setting "off", play jumps straight to the end. */
  ctl.player = (el, o) => {
    el.innerHTML = `<div class="ctl-ply"><button class="btn primary" type="button" data-play>▶ 再生</button><button class="btn" type="button" data-reset>↺ 最初から</button><b class="mono" data-time>0.0 s</b></div>
      <input type="range" class="input" data-scrub min="0" max="1000" value="0" aria-label="時刻(動かすと戻したり進めたりできる)" style="padding:0">`;
    let T = o.T, t = 0, playing = false, last = 0, raf = 0, alive = true;
    const play = el.querySelector("[data-play]"), scrub = el.querySelector("[data-scrub]"), tm = el.querySelector("[data-time]");
    const draw = () => { tm.textContent = ctl.n(t, 1) + " s"; scrub.value = Math.round(t / T * 1000); play.textContent = playing ? "⏸ 一時停止" : t >= T - 1e-9 ? "▶ もう一度" : "▶ 再生"; o.draw(t); };
    const tick = now => {
      if (!alive || !playing) return;
      if (!el.isConnected) { alive = false; return; }
      t = Math.min(T, t + (now - last) / 1000 * (o.speed || 1) * (ST.motion === "slow" ? 0.4 : 1)); last = now;
      if (t >= T) playing = false;
      draw();
      if (playing) raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (ST.motionScale() === 0) { t = T; playing = false; draw(); return; }
      if (t >= T - 1e-9) t = 0;
      playing = true; last = performance.now(); draw(); raf = requestAnimationFrame(tick);
    };
    play.onclick = () => { if (playing) { playing = false; draw(); } else start(); };
    el.querySelector("[data-reset]").onclick = () => { playing = false; t = 0; draw(); };
    scrub.oninput = () => { playing = false; t = +scrub.value / 1000 * T; draw(); };
    draw();
    return {
      restart() { cancelAnimationFrame(raf); playing = false; t = 0; start(); },
      redraw() { draw(); },
      setT(v) { T = v; t = Math.min(t, T); },
      stop() { alive = false; playing = false; cancelAnimationFrame(raf); }
    };
  };

  const niceStep = r => { const p = Math.pow(10, Math.floor(Math.log10(r))), m = r / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; };
  /* Line plot (inline SVG). o: {W, H, x0, x1, ymin, ymax, series:[{x?, y, dt?, color, label, dash, marks}], t (cursor), upto, hlines:[{y,label,color}], vlines:[{x,label}], xlabel, ylabel, aria}.
     A series gives either x:[…] with y:[…], or y sampled every dt from 0. y values outside [ymin, ymax] are clipped. */
  ctl.plot = o => {
    const W = o.W || 340, H = o.H || 130, pl = 38, pr = 10, pt = 18, pb = 22, x0 = o.x0 || 0;
    const xs = s => s.x || s.y.map((_, i) => i * (s.dt || 1));
    let x1 = o.x1; if (x1 == null) x1 = Math.max(...o.series.map(s => xs(s)[s.y.length - 1]));
    let lo = o.ymin, hi = o.ymax;
    if (lo == null || hi == null) {
      let a = 0, b = 0; o.series.forEach(s => s.y.forEach(v => { if (isFinite(v)) { a = Math.min(a, v); b = Math.max(b, v); } })); (o.hlines || []).forEach(h => { a = Math.min(a, h.y); b = Math.max(b, h.y); });
      const pad = (b - a || 1) * 0.1; if (lo == null) lo = a < 0 ? a - pad : 0; if (hi == null) hi = b + pad;
    }
    if (hi - lo < 1e-9) hi = lo + 1;
    const X = v => pl + (W - pl - pr) * (v - x0) / (x1 - x0), Y = v => pt + (H - pt - pb) * (1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo));
    let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block" role="img" aria-label="${esc(o.aria || "グラフ")}">`;
    const sy = niceStep((hi - lo) / 4), tk = (v, st) => Math.abs(v) >= 10000 ? v.toExponential(0).replace("e+", "e") : ctl.n(v, st < 1 ? 1 : 0);
    for (let v = Math.ceil(lo / sy) * sy; v <= hi + 1e-9; v += sy) s += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="var(--line)" stroke-width="${Math.abs(v) < 1e-9 ? 1.6 : 1}"/><text x="${pl - 4}" y="${(Y(v) + 3).toFixed(1)}" text-anchor="end" class="svg-m" style="font-size:9px">${tk(v, sy)}</text>`;
    const sx = niceStep((x1 - x0) / 5);
    for (let v = Math.ceil(x0 / sx) * sx; v <= x1 + 1e-9; v += sx) s += `<line y1="${pt}" y2="${H - pb}" x1="${X(v).toFixed(1)}" x2="${X(v).toFixed(1)}" stroke="var(--line)" stroke-width=".6"/><text x="${X(v).toFixed(1)}" y="${H - pb + 12}" text-anchor="middle" class="svg-m" style="font-size:9px">${ctl.n(v, sx < 1 ? 1 : 0)}</text>`;
    if (o.xlabel) s += `<text x="${W - pr}" y="${H - 2}" text-anchor="end" class="svg-m" style="font-size:9px">${esc(o.xlabel)}</text>`;
    (o.hlines || []).forEach(h => { s += `<line x1="${pl}" x2="${W - pr}" y1="${Y(h.y).toFixed(1)}" y2="${Y(h.y).toFixed(1)}" stroke="${h.color || "var(--muted)"}" stroke-dasharray="4 3" stroke-width="1.2"/>`; if (h.label) s += `<text x="${W - pr - 2}" y="${(Y(h.y) - 3).toFixed(1)}" text-anchor="end" class="svg-m" style="font-size:9px" fill="${h.color || "var(--muted)"}">${esc(h.label)}</text>`; });
    (o.vlines || []).filter(v => v.x >= x0 - 1e-9 && v.x <= x1 + 1e-9).forEach(v => { s += `<line y1="${pt}" y2="${H - pb}" x1="${X(v.x).toFixed(1)}" x2="${X(v.x).toFixed(1)}" stroke="${v.color || "var(--muted)"}" stroke-dasharray="4 3" stroke-width="1.2"/>`; if (v.label) s += `<text x="${(X(v.x) + (X(v.x) > W - 60 ? -3 : 3)).toFixed(1)}" y="${pt + 9}" text-anchor="${X(v.x) > W - 60 ? "end" : "start"}" class="svg-m" style="font-size:9px" fill="${v.color || "var(--muted)"}">${esc(v.label)}</text>`; });
    const upto = o.upto == null ? Infinity : o.upto;
    let lx = pl;
    o.series.forEach(se => {
      const X0 = xs(se), pts = []; let last = -1;
      for (let i = 0; i < se.y.length && X0[i] <= upto + 1e-9; i++) { pts.push([X0[i], se.y[i]]); last = i; }
      if (last >= 0 && last < se.y.length - 1 && isFinite(upto)) { const r = (upto - X0[last]) / (X0[last + 1] - X0[last]); pts.push([upto, se.y[last] + (se.y[last + 1] - se.y[last]) * r]); }
      const stride = Math.max(1, Math.floor(pts.length / 420)), q = pts.filter((_, i) => i % stride === 0 || i === pts.length - 1);
      if (q.length > 1) s += `<polyline points="${q.map(p => X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1)).join(" ")}" fill="none" stroke="${se.color || "var(--info)"}" stroke-width="${se.w || 2}"${se.dash ? ` stroke-dasharray="${se.dash}"` : ""} stroke-linejoin="round"/>`;
      if (se.marks) q.forEach(p => { s += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="3.2" fill="${se.color || "var(--info)"}"/>`; });
      if (o.t != null && q.length) { const e = q[q.length - 1]; s += `<circle cx="${X(e[0]).toFixed(1)}" cy="${Y(e[1]).toFixed(1)}" r="3.6" fill="${se.color || "var(--info)"}" stroke="var(--surface)" stroke-width="1.5"/>`; }
      if (se.label) { s += `<text x="${lx}" y="11" class="svg-t" style="font-size:10px;font-weight:600" fill="${se.color || "var(--info)"}">${esc(se.label)}</text>`; lx += 14 + se.label.length * 10.5; }
    });
    if (o.t != null) s += `<line y1="${pt}" y2="${H - pb}" x1="${X(o.t).toFixed(1)}" x2="${X(o.t).toFixed(1)}" stroke="var(--ink)" stroke-width=".8" opacity=".5"/>`;
    if (o.ylabel) s += `<text x="${pl + 2}" y="${pt - 6}" class="svg-m" style="font-size:9px" opacity="0">${esc(o.ylabel)}</text>`;
    return s + "</svg>";
  };

  /* ---------- Drawing helpers (all return SVG fragments) ---------- */
  /* Zig-zag spring from (x1,y) to (x2,y) with n turns and half-height h. */
  ctl.spring = (x1, x2, y, n, h, color) => {
    const L = x2 - x1, e = Math.min(10, L * .2); let d = `M${x1} ${y}L${x1 + e} ${y}`; const w = (L - 2 * e) / (2 * n);
    for (let i = 0; i < 2 * n; i++) d += `L${(x1 + e + w * (i + .5)).toFixed(1)} ${y + (i % 2 ? h : -h)}`;
    return `<path d="${d}L${x2 - e} ${y}L${x2} ${y}" fill="none" stroke="${color || "var(--ink)"}" stroke-width="1.8" stroke-linejoin="round"/>`;
  };
  /* Damper: cylinder fixed to the left end, piston rod to the right end. */
  ctl.damper = (x1, x2, y, color) => {
    const c = color || "var(--ink)", mid = x1 + (x2 - x1) * .45;
    return `<line x1="${x1}" y1="${y}" x2="${x1 + 6}" y2="${y}" stroke="${c}" stroke-width="1.8"/><path d="M${x1 + 6 + 22} ${y - 8}H${x1 + 6}V${y + 8}H${x1 + 6 + 22}" fill="none" stroke="${c}" stroke-width="1.8"/><line x1="${Math.min(mid, x2 - 4)}" y1="${y}" x2="${x2}" y2="${y}" stroke="${c}" stroke-width="1.8"/><line x1="${Math.min(mid, x2 - 4)}" y1="${y - 6}" x2="${Math.min(mid, x2 - 4)}" y2="${y + 6}" stroke="${c}" stroke-width="2.4"/>`;
  };
  /* Horizontal arrow of signed length (px) starting at (x,y). */
  ctl.arrow = (x, y, len, color, w) => {
    if (Math.abs(len) < 2) return "";
    const d = len > 0 ? 1 : -1, e = x + len, h = Math.min(8, Math.abs(len) * .6);
    return `<line x1="${x}" y1="${y}" x2="${e - d * h * .7}" y2="${y}" stroke="${color}" stroke-width="${w || 3}"/><path d="M${e} ${y} l${-d * h} -${h * .55} v${h * 1.1}z" fill="${color}"/>`;
  };
  /* Circuit symbols. kind: R | L | C | V. Centre (x,y); vertical flips the orientation. */
  ctl.sym = (kind, x, y, vertical, label, color) => {
    const c = color || "var(--ink)", T = vertical ? `translate(${x} ${y}) rotate(90)` : `translate(${x} ${y})`;
    let b = "";
    if (kind === "R") b = `<rect x="-15" y="-6" width="30" height="12" fill="var(--surface)" stroke="${c}" stroke-width="1.8"/>`;
    else if (kind === "L") b = `<path d="M-18 0a6 6 0 0 1 12 0a6 6 0 0 1 12 0a6 6 0 0 1 12 0" fill="none" stroke="${c}" stroke-width="1.8"/>`;
    else if (kind === "C") b = `<line x1="-3" y1="-10" x2="-3" y2="10" stroke="${c}" stroke-width="2.4"/><line x1="3" y1="-10" x2="3" y2="10" stroke="${c}" stroke-width="2.4"/>`;
    else if (kind === "V") b = `<circle r="12" fill="var(--surface)" stroke="${c}" stroke-width="1.8"/><path d="M-6 0c2-6 4-6 6 0s4 6 6 0" fill="none" stroke="${c}" stroke-width="1.5"/>`;
    const lx = vertical ? x + 16 : x, ly = vertical ? y + 4 : y - 13;
    return `<g transform="${T}">${b}</g>` + (label ? `<text x="${lx}" y="${ly}" text-anchor="${vertical ? "start" : "middle"}" class="svg-t" style="font-size:11px;font-weight:600" fill="${c}">${esc(label)}</text>` : "");
  };
  /* Dots carried along a polyline (pts: [[x,y],…]); phase is a real number (dots shift by it; wraps). */
  ctl.flow = (pts, phase, color, spacing) => {
    const seg = [], tot = pts.slice(1).reduce((a, p, i) => { const d = Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]); seg.push(d); return a + d; }, 0);
    const sp = spacing || 18, n = Math.max(1, Math.floor(tot / sp)); let s = "";
    for (let k = 0; k < n; k++) {
      let d = (((k + phase) % n) + n) % n / n * tot, i = 0;
      while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
      const r = seg[i] ? d / seg[i] : 0;
      s += `<circle cx="${(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r).toFixed(1)}" cy="${(pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r).toFixed(1)}" r="2.6" fill="${color}"/>`;
    }
    return s;
  };
  ctl.wire = (pts, color) => `<polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="${color || "var(--muted)"}" stroke-width="1.6" stroke-linejoin="round"/>`;
  /* A labelled horizontal bar centred on a zero line (value v, scale px per unit). */
  ctl.bar = (x, y, w, v, scale, color, label, val) => {
    const len = Math.max(-w / 2, Math.min(w / 2, v * scale)), cx0 = x + w / 2;
    return `<rect x="${x}" y="${y}" width="${w}" height="14" rx="3" fill="var(--sunken)"/><rect x="${(len >= 0 ? cx0 : cx0 + len).toFixed(1)}" y="${y}" width="${Math.abs(len).toFixed(1)}" height="14" rx="3" fill="${color}" opacity=".85"/><line x1="${cx0}" y1="${y - 2}" x2="${cx0}" y2="${y + 16}" stroke="var(--ink)" stroke-width="1"/><text x="${x - 4}" y="${y + 11}" text-anchor="end" class="svg-t" style="font-size:10.5px;font-weight:600" fill="${color}">${esc(label)}</text><text x="${x + w + 4}" y="${y + 11}" class="svg-m" style="font-size:10px">${esc(val)}</text>`;
  };
})(window.ST);
