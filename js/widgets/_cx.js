"use strict";
/* Shared helpers for the complex-analysis labs (複素解析): complex arithmetic on [re, im] pairs,
   a coordinate frame for an SVG complex plane (grid, axes, arrows, dots), and a drag helper for pointer/touch.
   Everything is computed in the browser; nothing is sent anywhere. */
(function (ST) {
  const cx = ST.cx = {};
  cx.add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  cx.sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  cx.mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  cx.div = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
  cx.conj = a => [a[0], -a[1]];
  cx.abs = a => Math.hypot(a[0], a[1]);
  cx.arg = a => Math.atan2(a[1], a[0]);
  cx.polar = (r, t) => [r * Math.cos(t), r * Math.sin(t)];
  cx.exp = a => cx.polar(Math.exp(a[0]), a[1]);
  cx.pow = (a, n) => { let r = [1, 0]; for (let i = 0; i < n; i++) r = cx.mul(r, a); return r; };
  const num = (v, d) => { const s = (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toString(); return s === "-0" ? "0" : s; };
  cx.num = (v, d) => num(v, d == null ? 2 : d);
  /* "3 + 2i", "−1.5i", "2" (minus sign is the proper U+2212). */
  cx.fmt = (z, d) => {
    d = d == null ? 2 : d;
    const re = +num(z[0], d), im = +num(z[1], d), f = v => num(Math.abs(v), d).replace(/^-/, "");
    if (im === 0) return (re < 0 ? "−" : "") + f(re);
    const iPart = (Math.abs(im) === 1 ? "" : f(im)) + "i";
    if (re === 0) return (im < 0 ? "−" : "") + iPart;
    return (re < 0 ? "−" : "") + f(re) + (im < 0 ? " − " : " + ") + iPart;
  };
  /* Angle in degrees for display, normalised to (-180, 180]. */
  cx.deg = t => { let d = t * 180 / Math.PI; d = ((d + 180) % 360 + 360) % 360 - 180; if (d === -180) d = 180; return num(d, 0) + "°"; };

  /* Coordinate frame: width W, height H, half-width R (in plane units); origin at the centre unless shifted by (ox, oy). */
  cx.geom = (W, H, R, ox, oy) => {
    const s = W / (2 * R), cx0 = W / 2 + (ox || 0) * s, cy0 = H / 2 + (oy || 0) * s;
    return {
      W, H, R, s,
      X: x => cx0 + x * s, Y: y => cy0 - y * s,
      P: z => `${(cx0 + z[0] * s).toFixed(1)},${(cy0 - z[1] * s).toFixed(1)}`,
      inv: (px, py) => [(px - cx0) / s, (cy0 - py) / s]
    };
  };
  /* Grid lines every `step` units, thicker axes with arrows, tick numbers at integers. */
  cx.grid = (g, o) => {
    o = o || {};
    const step = o.step || 1, x0 = Math.ceil(-g.W / 2 / g.s - 5), x1 = Math.floor(g.W / 2 / g.s + 5);
    let s = "";
    const lo = g.inv(0, g.H), hi = g.inv(g.W, 0);
    for (let x = Math.ceil(lo[0] / step) * step; x <= hi[0] + 1e-9; x += step) s += `<line x1="${g.X(x)}" y1="0" x2="${g.X(x)}" y2="${g.H}" stroke="var(--line)" stroke-width="${Math.abs(x) < 1e-9 ? 0 : 1}"/>`;
    for (let y = Math.ceil(lo[1] / step) * step; y <= hi[1] + 1e-9; y += step) s += `<line x1="0" y1="${g.Y(y)}" x2="${g.W}" y2="${g.Y(y)}" stroke="var(--line)" stroke-width="${Math.abs(y) < 1e-9 ? 0 : 1}"/>`;
    s += `<line x1="0" y1="${g.Y(0)}" x2="${g.W - 4}" y2="${g.Y(0)}" stroke="var(--muted)" stroke-width="1.5"/><path d="M${g.W - 2} ${g.Y(0)} l-8 -4 v8z" fill="var(--muted)"/>`;
    s += `<line x1="${g.X(0)}" y1="${g.H}" x2="${g.X(0)}" y2="4" stroke="var(--muted)" stroke-width="1.5"/><path d="M${g.X(0)} 2 l-4 8 h8z" fill="var(--muted)"/>`;
    s += `<text x="${g.W - 6}" y="${g.Y(0) - 7}" text-anchor="end" class="svg-m" style="font-size:11px">実軸 Re</text><text x="${g.X(0) + 7}" y="12" class="svg-m" style="font-size:11px">虚軸 Im</text>`;
    if (o.ticks !== false) {
      for (let x = Math.ceil(lo[0]); x <= hi[0]; x++) if (x) s += `<text x="${g.X(x)}" y="${Math.min(g.H - 3, Math.max(12, g.Y(0) + 13))}" text-anchor="middle" class="svg-m" style="font-size:10px">${x}</text>`;
      for (let y = Math.ceil(lo[1]); y <= hi[1]; y++) if (y) s += `<text x="${Math.max(10, Math.min(g.W - 14, g.X(0) - 5))}" y="${g.Y(y) + 3}" text-anchor="end" class="svg-m" style="font-size:10px">${y}i</text>`;
    }
    return s;
  };
  /* Arrow from complex a to b. */
  cx.arrow = (g, a, b, color, w, dash) => {
    const x1 = g.X(a[0]), y1 = g.Y(a[1]), x2 = g.X(b[0]), y2 = g.Y(b[1]), L = Math.hypot(x2 - x1, y2 - y1);
    if (L < 2) return "";
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L, h = Math.min(10, L * .45), ex = x2 - ux * h * .8, ey = y2 - uy * h * .8;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${color}" stroke-width="${w || 2.2}"${dash ? ` stroke-dasharray="${dash}"` : ""}/><path d="M${x2.toFixed(1)} ${y2.toFixed(1)} L${(x2 - ux * h - uy * h * .45).toFixed(1)} ${(y2 - uy * h + ux * h * .45).toFixed(1)} L${(x2 - ux * h + uy * h * .45).toFixed(1)} ${(y2 - uy * h - ux * h * .45).toFixed(1)}z" fill="${color}"/>`;
  };
  cx.dot = (g, z, color, label, o) => {
    o = o || {};
    const x = g.X(z[0]), y = g.Y(z[1]);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${o.r || 6}" fill="${color}" stroke="var(--surface)" stroke-width="2"/>` +
      (label ? `<text x="${(x + (o.dx == null ? 9 : o.dx)).toFixed(1)}" y="${(y + (o.dy == null ? -9 : o.dy)).toFixed(1)}" class="svg-t" style="font-size:${o.fs || 13}px;font-weight:700" fill="${color}">${ST.esc(label)}</text>` : "");
  };
  /* Dashed ring handle that tells the reader a point can be dragged. */
  cx.handle = (g, z, color) => `<circle cx="${g.X(z[0]).toFixed(1)}" cy="${g.Y(z[1]).toFixed(1)}" r="13" fill="none" stroke="${color}" stroke-width="1.6" stroke-dasharray="3 3" opacity=".85"/>`;
  /* Arc of radius r (plane units) around the origin from angle a0 to a1 (radians, counter-clockwise on screen). */
  cx.arc = (g, c, r, a0, a1, color, w) => {
    const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / .1));
    let d = "";
    for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n; d += (i ? "L" : "M") + g.P([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); }
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w || 2}"/>`;
  };
  /* Make points on an <svg> draggable (mouse and touch). Attach once; the svg's innerHTML may be redrawn freely.
     opts: { snap: () => step or 0, handles: () => [{id, z}], move: (id, z) => void, radius: px (grab distance) }.
     Returns a function that detaches nothing (listeners live on the svg, which is removed with the lab). */
  cx.drag = (svg, g, opts) => {
    let cur = null;
    const toZ = e => { const r = svg.getBoundingClientRect(), k = g.W / r.width; return g.inv((e.clientX - r.left) * k, (e.clientY - r.top) * k); };
    svg.style.touchAction = "none"; svg.style.cursor = "crosshair";
    svg.addEventListener("pointerdown", e => {
      const z = toZ(e), hs = opts.handles(); let best = null, bd = (opts.radius || 26) / g.s;
      hs.forEach(h => { const d = Math.hypot(h.z[0] - z[0], h.z[1] - z[1]); if (d < bd) { bd = d; best = h.id; } });
      if (best == null && opts.tap) best = opts.tap; /* tap on empty plane: move this handle there */
      if (best == null) return;
      cur = best; try { svg.setPointerCapture(e.pointerId); } catch (_) { }
      e.preventDefault(); upd(e);
    });
    const upd = e => {
      let z = toZ(e); const st = opts.snap ? opts.snap() : 0;
      if (st) z = [Math.round(z[0] / st) * st, Math.round(z[1] / st) * st];
      const m = g.R * .96; z = [Math.max(-m, Math.min(m, z[0])), Math.max(-m * g.H / g.W, Math.min(m * g.H / g.W, z[1]))];
      opts.move(cur, z);
    };
    svg.addEventListener("pointermove", e => { if (cur != null) { e.preventDefault(); upd(e); } });
    const end = () => { cur = null; };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
  };
})(window.ST);
