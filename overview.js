/* NOVA · Přehled (2026-11-12 live5, Petr t239u/t240u) — JEN SLEDOVÁNÍ, žádná tlačítka, nic nemění.
   Data: sekce "ov" ve snímku z boxu (overview.py) + boti/knihy ze stejného snímku. */
(function () {
"use strict";
var TZ = "Europe/Prague";
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function t(s) { if (!s) return "—"; return new Date(s * 1000).toLocaleString("cs-CZ", { timeZone: TZ, day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }); }
function hm(s) { if (!s) return "—"; return new Date(s * 1000).toLocaleTimeString("cs-CZ", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }); }
function ago(s) { if (!s) return ""; var a = Math.max(0, Date.now() / 1000 - s); return a < 90 ? Math.round(a) + " s" : a < 5400 ? Math.round(a / 60) + " min" : a < 172800 ? (a / 3600).toFixed(1).replace(".", ",") + " h" : Math.round(a / 86400) + " dní"; }
function usd(x) { if (x == null || isNaN(x)) return '<span class="zero">—</span>'; return '<span class="' + (x > 0.004 ? "pos" : x < -0.004 ? "neg" : "zero") + '">' + (x > 0.004 ? "+" : x < -0.004 ? "−" : "") + "$" + Math.abs(x).toFixed(2) + "</span>"; }
function money(x) { return x == null || isNaN(x) ? "—" : "$" + Number(x).toFixed(2); }
function bar(p, cls) { p = Math.max(0, Math.min(100, p || 0)); return '<div class="bar"><i class="' + (cls || "") + '" style="width:' + p + '%"></i></div>'; }
var ST = { working: ["pracuje", "acc"], idle: ["nečinný", ""], waiting: ["čeká na Petra", "warn"], dead: ["MRTVÝ", "bad"] };
var VC = function (v) { return /KILL|FAIL/.test(v) ? "bad" : /PASS|KEEP/.test(v) ? "good" : "warn"; };

function agentsHTML(ov) {
  if (!ov || !ov.agents) return '<p class="note">přehled agentů zatím nedorazil (přijde s další publikací z boxu)</p>';
  var cnt = { working: 0, idle: 0, waiting: 0, dead: 0 }; ov.agents.forEach(function (a) { cnt[a.state] = (cnt[a.state] || 0) + 1; });
  var h = '<h2 class="ovh">👥 Kdo na čem pracuje <small>' + cnt.working + " pracuje · " + cnt.waiting + " čeká na Petra · " + cnt.idle + " nečinných" + (cnt.dead ? ' · <span class="neg">' + cnt.dead + " mrtvých</span>" : "") + " · z log.md, procesů a kanceláře</small></h2><div class='ovagents'>";
  ov.agents.forEach(function (a) {
    var s = ST[a.state] || ["?", ""];
    h += '<div class="ova st-' + a.state + '"><div class="ct"><div><b>' + esc(a.name) + '</b> <span class="zero">' + esc(a.team) + '</span></div><span class="pill ' + s[1] + '">' + s[0] + "</span></div>" +
      '<div class="ovline"><span class="k">teď</span><span>' + (a.current ? esc(a.current) + ' <span class="zero">· od ' + t(a.currentTs) + "</span>" : '<span class="zero">nic rozdělaného</span>') + "</span></div>" +
      '<div class="ovline"><span class="k">hotovo</span><span>' + (a.lastDone ? esc(a.lastDone) + ' <span class="zero">· ' + t(a.lastDoneTs) + "</span>" : '<span class="zero">—</span>') + "</span></div>" +
      (a.office ? '<div class="ovline"><span class="k">kancelář</span><span>' + esc(a.office.ev) + " · " + esc(a.office.msg) + ' <span class="zero">' + t(a.office.ts) + "</span></span></div>" : "") +
      ((a.procs || []).length ? '<div class="chips">' + a.procs.map(function (p) { return '<span class="pill ' + (p.ok ? "good" : "bad") + '">' + (p.ok ? "● " : "✕ ") + esc(p.name) + "</span>"; }).join(" ") + "</div>" : "") + "</div>";
  });
  return h + "</div>";
}

function healthHTML(ov) {
  if (!ov || !ov.services) return "";
  var bad = ov.services.filter(function (s) { return !s.ok; });
  var h = '<div class="ovverdict ' + (ov.allOk ? "ok" : "fail") + '"><div class="big">' + (ov.allOk ? "✅ VŠE BĚŽÍ" : "❌ NĚCO NEBĚŽÍ") + '</div><div>' +
    (ov.allOk ? ov.services.length + " služeb OK · kontrola na boxu " + hm(ov.at) : bad.map(function (s) { return "<b>" + esc(s.name) + "</b>" + (s.stale ? " (data zastaralá, poslední " + t(s.hb) + ")" : " (neběží)"); }).join(" · ")) +
    ' · <span class="pill bad">LIVE vypnutý</span> <span class="pill">jen paper</span></div></div>';
  return h;
}
function servicesHTML(ov) {
  if (!ov || !ov.services) return "";
  var g = { desk: "Desk", boti: "Paper boti", data: "Sběr dat", infra: "Infrastruktura" };
  return "<h2>🩺 Služby a procesy na boxu</h2><div class='box tbl'><table><tr><th>stav</th><th>služba</th><th>skupina</th><th>PID</th><th>poslední heartbeat</th><th>poznámka</th></tr>" +
    ov.services.map(function (s) { return "<tr><td>" + '<span class="pill ' + (s.ok ? "good" : "bad") + '">' + (s.ok ? "OK" : "FAIL") + "</span></td><td>" + esc(s.name) + "</td><td>" + esc(g[s.group] || s.group) + "</td><td>" + (s.pid || "—") + "</td><td>" + t(s.hb) + (s.hb ? ' <span class="zero">(před ' + ago(s.hb) + ")</span>" : "") + (s.stale ? ' <span class="pill warn">ZASTARALÉ</span>' : "") + "</td><td>" + esc(s.note || "") + "</td></tr>"; }).join("") + "</table></div>";
}
function botsHTML(d) {
  var b = d.bots || {}, ov = d.ov || {}, rc = {}; ((ov.verdicts || {}).realcap || []).forEach(function (r) { rc[r.who] = r; });
  var V = {}; ((ov.verdicts || {}).items || []).forEach(function (x) { if (!V[x.who]) V[x.who] = x; });
  var rows = [
    ["⚡ Hyperion", "Hyperion", b.hyperdesk, function (x) { return [x.equity, x.start, (x.open || []).length, x.dayPnl, x.killed ? "KILL aktivní" : x.autoPaper ? "auto-paper" : "čeká na signál"]; }],
    ["🎯 Valora", "Valora", b.polyprofile, function (x) { return [x.equity, x.start, (x.open || []).length, null, "dobíhá (KILL)"]; }],
    ["🧬 Chiméra", "Chiméra", b.adaptivepoly, function (x) { return [x.equity, x.start, (x.open || []).length, null, x.bookC === "PAUSED" ? "kniha C PAUSED" : "běží"]; }],
    ["CARRY-H", "CARRY-H", b.carryh, function (x) { return [x.equity, x.start, (x.open || []).length, null, "sbírá data (KILL jako strategie)"]; }],
    ["AP-BAND", "AP-BAND", b.apband, function (x) { var r = x.risk || {}; return [x.equity, x.startEquity, x.nOpen || 0, x.dayPnl, r.killed ? "KILL" : r.dayHalt ? "denní stop" : "obchoduje"]; }]];
  var h = "<h2>🤖 Paper boti — souhrn</h2><div class='box tbl'><table><tr><th>bot</th><th>stav</th><th>equity</th><th>P&amp;L od startu</th><th>otevřené</th><th>dnes</th><th>verdikt</th><th>reálně 250/500 $</th></tr>";
  rows.forEach(function (r) {
    var x = r[2]; if (!x) { h += "<tr><td>" + r[0] + '</td><td colspan="7"><span class="neg">bez dat</span></td></tr>'; return; }
    var v = r[3](x), vd = V[r[1]] || {}, c = rc[r[1]] || {};
    h += "<tr><td><b>" + r[0] + "</b></td><td>" + esc(v[4]) + "</td><td>" + money(v[0]) + "</td><td>" + usd(v[0] != null && v[1] != null ? v[0] - v[1] : null) + "</td><td>" + v[2] + "</td><td>" + (v[3] != null ? usd(v[3]) : "—") + "</td><td>" + (vd.v ? '<span class="pill ' + VC(vd.v) + '">' + esc(vd.v) + "</span>" : "—") + "</td><td>" + (c.v250 ? '<span class="pill ' + (c.ok || "warn") + '">' + esc(c.v250) + "</span> " + esc(c.pnl250 || "") : "—") + "</td></tr>";
  });
  return h + "</table></div>";
}
function gatesHTML(ov) {
  if (!ov || !ov.gates) return "";
  return "<h2>📈 Progres a brány</h2><div class='grid'>" + ov.gates.map(function (g) {
    var p = g.target ? 100 * g.n / g.target : null, danger = g.money && p >= 80;
    return '<div class="card"><div class="ct"><b>' + esc(g.who) + '</b><span class="pill ' + (danger ? "bad" : "") + '">' + esc(g.label) + "</span></div>" +
      '<div class="big">' + (g.money ? "$" + Number(g.n).toFixed(2) + "<small> / $" + g.target + "</small>" : g.n + (g.target ? "<small> / " + g.target + "</small>" : "")) + "</div>" + (p != null ? bar(p, danger ? "red" : "") : "") + '<div class="note">' + esc(g.note) + "</div></div>";
  }).join("") + "</div>";
}
function deskHTML(d) {
  var bk = (d.books || {}).books || [], sy = d.system || {}, tot = 0, pos = 0, best = null, worst = null;
  bk.forEach(function (x) { var n = x.netUsd; if (n == null) return; tot += n; if (x.nPos) pos += x.nPos; if (!best || n > best.netUsd) best = x; if (!worst || n < worst.netUsd) worst = x; });
  var h = "<h2>📚 NOVA desk — knihy</h2><div class='sum'>" +
    '<div class="box"><h3>Knihy celkem</h3><div class="big">' + bk.length + '</div><div class="note">otevřených pozic ' + pos + " · detail v záložce Knihy</div></div>" +
    '<div class="box"><h3>Součet čistého P&amp;L</h3><div class="big">' + usd(tot) + "</div>" + (best ? '<div class="note">nejlepší ' + esc(best.id) + " " + usd(best.netUsd) + " · nejhorší " + esc(worst.id) + " " + usd(worst.netUsd) + "</div>" : "") + "</div>" +
    '<div class="box"><h3>Workery desku</h3><div class="big">' + (sy.okCount != null ? sy.okCount : "—") + '<small> OK</small></div><div class="note">problémy ' + (sy.problemCount || 0) + " · očekávaně mimo " + (sy.expectedCount || 0) + "</div></div></div>";
  return h;
}
function dataHTML(ov) {
  if (!ov || !ov.collectors) return "";
  var h = "<h2>🛰️ Sběr dat</h2><div class='box tbl'><table><tr><th>sběr</th><th>poslední zápis</th><th>dnes řádků</th><th>na disku</th><th>poslední mezery</th></tr>";
  ov.collectors.forEach(function (c) {
    var rows = Object.keys(c.rows || {}).map(function (k) { return k + " " + (c.rows[k].today || 0).toLocaleString("cs-CZ"); }).join(" · ");
    var mb = Object.keys(c.rows || {}).reduce(function (a, k) { return a + (c.rows[k].mb || 0); }, 0);
    h += "<tr><td><b>" + esc(c.name) + "</b></td><td>" + t(c.lastWrite) + ' <span class="zero">(před ' + ago(c.lastWrite) + ")</span></td><td>" + rows + "</td><td>" + mb.toFixed(1).replace(".", ",") + " MB</td><td>" + ((c.gaps || []).slice(-2).map(function (g) { return t(g.from) + "–" + hm(g.to) + " (" + Math.round(g.s / 60) + " min)"; }).join("<br>") || "—") + "</td></tr>";
  });
  h += "</table></div>";
  if ((ov.pauses || []).length) h += '<div class="src warn"><span class="pill warn">pauzy boxu</span> <span>platforma občas pozastaví box VM; v těch oknech se nesbírá nic: ' + ov.pauses.slice(-5).map(function (p) { return t(p.from) + "–" + hm(p.to) + " (" + Math.round(p.s / 60) + " min)"; }).join(" · ") + "</span></div>";
  return h;
}
function verdictsHTML(ov) {
  var v = ov && ov.verdicts; if (!v) return "";
  return "<h2>🧪 Testy a hypotézy — verdikty</h2><div class='box tbl'><table><tr><th>kdo</th><th>co</th><th>verdikt</th><th>proč</th></tr>" +
    (v.items || []).map(function (x) { return "<tr><td>" + esc(x.who) + "</td><td>" + esc(x.what) + '</td><td><span class="pill ' + VC(x.v) + '">' + esc(x.v) + "</span></td><td>" + esc(x.why) + "</td></tr>"; }).join("") + "</table></div><p class='note'>" + esc(v.note) + " (souhrn k " + esc(v.updated) + ")</p>";
}
function timelineHTML(ov) {
  if (!ov || !ov.timeline) return "";
  return "<h2>🕒 Poslední události (log.md)</h2><div class='box tl'>" + ov.timeline.map(function (e) {
    return '<div class="tlr"><span class="zero">' + t(e.ts) + '</span><span class="pill ' + (e.kind === "DONE" || e.kind === "VERIFY" ? "good" : e.kind === "INTENT" || e.kind === "START" ? "acc" : e.kind === "PAUZA" || e.kind === "REMAINING" ? "warn" : "") + '">' + esc(e.kind) + "</span><b>" + esc(e.who) + "</b><span>" + esc(e.txt) + "</span></div>";
  }).join("") + "</div>";
}
function render(d, el) {
  if (!el) return;
  if (!d) { el.innerHTML = '<p class="note">čekám na data z boxu…</p>'; return; }
  var ov = d.ov;
  el.innerHTML = healthHTML(ov) + agentsHTML(ov) + botsHTML(d) + gatesHTML(ov) + servicesHTML(ov) + dataHTML(ov) + deskHTML(d) + verdictsHTML(ov) + timelineHTML(ov) +
    '<p class="note">Přehled se skládá na boxu (overview.py) a posílá se s každou publikací (á 5 min, v noci 01–07 h á 30 min). Stránka je jen ke čtení.</p>';
}
window.OV = { render: render, agentsHTML: agentsHTML, healthHTML: healthHTML };
})();
