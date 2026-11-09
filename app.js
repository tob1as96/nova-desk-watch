/* NOVA desk · JEN SLEDOVÁNÍ. Žádné ovládání, žádné zápisy. Data: ntfy příloha (snímek z boxu). */
(function () {
"use strict";
/* ===== topic: #t= -> localStorage -> smazat z URL ===== */
var TOPIC = (function () {
  var K = "novadesk_topic", OK = /^[A-Za-z0-9_-]{8,64}$/, t = "";
  try { var m = /[#&]t=([^&]+)/.exec(location.hash || ""); if (m) { var c = decodeURIComponent(m[1]); if (OK.test(c)) { t = c; try { localStorage.setItem(K, c); } catch (e) {} } } } catch (e) {}
  if (!t) { try { var s = localStorage.getItem(K) || ""; if (OK.test(s)) t = s; } catch (e) {} }
  if (t && location.hash) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
  if (t) { try {
    var mf = { name: "NOVA desk (sledování)", short_name: "NOVA desk", display: "standalone", background_color: "#07090e", theme_color: "#07090e",
      start_url: location.origin + location.pathname + "#t=" + t, scope: location.origin + location.pathname.replace(/[^\/]*$/, ""),
      icons: [{ src: new URL("icon-192.png", location.href).href, sizes: "192x192", type: "image/png" }, { src: new URL("icon-512.png", location.href).href, sizes: "512x512", type: "image/png" }, { src: new URL("icon-512-maskable.png", location.href).href, sizes: "512x512", type: "image/png", purpose: "maskable" }] };
    var l = document.querySelector("link[rel=manifest]"); if (l) l.href = URL.createObjectURL(new Blob([JSON.stringify(mf)], { type: "application/manifest+json" }));
  } catch (e) {} }
  return t;
})();
var $ = function (id) { return document.getElementById(id); };
if (!TOPIC) { $("notopic").hidden = false; $("app").hidden = true; return; }
var BASE = "https://ntfy.sh/" + TOPIC;

/* ===== zapomenout kanál ===== */
$("forgetbtn").onclick = function () { var p = $("forgetpanel"); p.hidden = !p.hidden; };
$("forgetgo").onclick = function () {
  try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
  var jobs = [];
  try { if (window.caches) jobs.push(caches.keys().then(function (k) { return Promise.all(k.map(function (x) { return caches.delete(x); })); })); } catch (e) {}
  try { if (navigator.serviceWorker) jobs.push(navigator.serviceWorker.getRegistrations().then(function (r) { return Promise.all(r.map(function (x) { return x.unregister(); })); })); } catch (e) {}
  Promise.all(jobs).catch(function () {}).then(function () { location.replace(location.pathname); });
};
if ("serviceWorker" in navigator) { try { navigator.serviceWorker.register("sw.js").catch(function () {}); } catch (e) {} }

/* ===== pomocné (převzato z localhost desku /knihy.html, jen formát) ===== */
var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var NA = '<span class="zero">zatím bez dat</span>';
var usd = function (x, sign) { if (sign === undefined) sign = true; return x == null ? NA : '<span class="' + (x > 0.004 ? "pos" : x < -0.004 ? "neg" : "zero") + '">' + (sign && x > 0.004 ? "+" : x < -0.004 ? "−" : "") + "$" + Math.abs(x).toFixed(2) + "</span>"; };
var usdPlain = function (x) { return x == null ? NA : "$" + x.toFixed(2); };
var pct = function (x, d) { if (d === undefined) d = 1; return x == null ? NA : x.toFixed(d).replace(".", ",") + " %"; };
var num = function (x, d) { return x == null ? "—" : Number(x).toFixed(d == null ? 2 : d).replace(".", ","); };
var tz = "Europe/Prague";
var fmtT = function (iso) { if (!iso) return "—"; var d = new Date(iso); if (isNaN(d)) return esc(iso); return d.toLocaleString("cs-CZ", { timeZone: tz, day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }); };
var fmtMs = function (ms) { if (!ms) return "—"; return fmtT(new Date(ms).toISOString()); };
var fmtHMS = function (ms) { return new Date(ms).toLocaleTimeString("cs-CZ", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit" }); };
var ageMin = function (iso) { return iso ? Math.round((Date.now() - new Date(iso).getTime()) / 60000) : null; };
var row = function (k, val, h) { return '<div class="row"' + (h ? ' title="' + esc(h) + '"' : "") + "><span>" + k + "</span><span>" + val + "</span></div>"; };
var human = function (s) { s = Math.round(s); if (s < 90) return s + " s"; if (s < 5400) return Math.round(s / 60) + " min"; if (s < 172800) return (s / 3600).toFixed(1).replace(".", ",") + " h"; return Math.round(s / 86400) + " dní"; };
var barW = function (p) { return Math.max(0, Math.min(100, p || 0)); };

/* ===== KNIHY: renderer z localhost desku (knihy.html) ===== */
  function render(v, src) {
    const a = ageMin(v.at), trA = ageMin(v.tracker?.updatedAt);
    const s = $("src");
    if (src === "live") { s.className = "src"; s.innerHTML = `<span class="pill good">ŽIVĚ z boxu</span> <span>obnova po 15 s · tracker BTC kontroly k <b>${fmtT(v.tracker?.updatedAt)}</b> (${trA ?? "?"} min, počítá se á 10 min)</span>`; }
    else { const old = a == null || a > 75; s.className = "src " + (old ? "warn" : ""); s.innerHTML = `<span class="pill ${old ? "warn" : "acc"}">SNÍMEK z boxu</span> <span>stav k <b>${fmtT(v.at)}</b> · stáří <b>${a ?? "?"} min</b>${old ? " — <b style='color:var(--warn)'>starší než 75 min, čísla nemusí být aktuální</b>" : ""} · NOVA běží na Grok boxu, sem se kopíruje snímek (Tobirama nic nepočítá)</span>`; }
    s.innerHTML += ` <span>BTC <b>${v.tracker?.btcPrice != null ? "$" + Math.round(v.tracker.btcPrice).toLocaleString("cs-CZ") : "—"}</b> (${esc(v.tracker?.btcSource ?? "—")})</span>`;
    // system line (snapshot only)
    if (v.system && !v.system.error) { const y = v.system; $("sys").innerHTML = `<div class="src ${y.problemCount ? "bad" : ""}"><span class="pill ${y.problemCount ? "bad" : "good"}">nova status</span> <span><b>${y.okCount}</b> OK · <b>${y.expectedCount}</b> očekávaně mimo${y.expected?.length ? " (" + y.expected.map((w) => esc(w.label)).join(", ") + ")" : ""} · <b>${y.problemCount}</b> problémů${y.problems?.length ? ": " + y.problems.map((w) => esc(w.label) + " " + esc(w.state)).join(", ") : ""} · readiness ${y.readinessPct ?? "?"} %</span></div>`; } else $("sys").innerHTML = "";
    // summary
    const T = v.tracker?.totals, X = v.tracker?.totalsExCex, sp = v.split, h = v.tracker?.change1h;
    const row = (k, val) => `<div class="row"><span>${k}</span><span>${val}</span></div>`;
    $("sum").innerHTML = `
    <div class="box"><h3>Celkem vs BTC (všech ${T?.n ?? "?"} knih)</h3>
      <div class="big">${usd(T?.diff)}</div><div class="note">rozdíl knihy − BTC kontrola</div>
      ${row("knihy čistý", usd(T?.booksNet))}${row("BTC kontrola", usd(T?.btcControlNet))}${row("kapitál", usdPlain(T?.capital))}
      ${X ? row(`bez CEX makeru (${X.n})`, usd(X.diff)) : ""}${h ? row(`za 1 h (od ${esc(h.vsAtPrague?.slice(11) ?? "?")})`, `${usd(h.booksNet)} vs ${usd(h.btcControlNet)}`) : ""}</div>
    <div class="box"><h3>Knihy, které obchodovaly (${sp.traded.n})</h3>
      <div class="big">${usd(sp.traded.diffUsd)}</div><div class="note">${esc(sp.traded.names.join(" · "))}</div>
      ${row("čistý", usd(sp.traded.netUsd))}${row("BTC kontrola", usd(sp.traded.ctrlUsd))}${row("kapitál", usdPlain(sp.traded.capital))}</div>
    <div class="box"><h3>Knihy jen v hotovosti (${sp.cashOnly.n})</h3>
      <div class="big">${usd(sp.cashOnly.diffUsd)}</div><div class="note">${esc(sp.cashOnly.names.join(" · "))}</div>
      ${row("čistý", usd(sp.cashOnly.netUsd))}${row("BTC kontrola", usd(sp.cashOnly.ctrlUsd))}${row("kapitál", usdPlain(sp.cashOnly.capital))}
      <div class="note" style="color:var(--warn)">Poctivě: tento „náskok“ není výkon strategie — knihy zatím neotevřely obchod a BTC od jejich startu klesl. Bez zmražených knih (CEX maker).</div></div>`;
    // cards
    const groups = [["nove", "Nové knihy"], ["maker", "Maker knihy (CEX + DEX, papír)"], ["perp", "Perp TSMOM / M"], ["desk", "Desk"], ["frozen", "Zmražené (jen do celku)"]];
    let html = "";
    for (const [g, label] of groups) { const bs = v.books.filter((b) => b.group === g); if (!bs.length) continue; html += `<h2>${label}</h2><div class="grid">${bs.map(card).join("")}</div>`; }
    if (v.recorders?.length) html += `<h2>Nahrávání (ne knihy — nepočítá se do celku)</h2><div class="grid">${v.recorders.map(recCard).join("")}</div>`;
    if (v.retired?.length) html += `<h2>Vyřazené knihy (konečný výsledek — nepočítá se do celku)</h2><div class="box">${v.retired.map((r) => `<div class="row" title="${esc(r.reason)}"><span>${esc(r.name)}</span><span>${r.net == null ? NA : usd(r.net)}</span></div>`).join("")}</div>`;
    $("books").innerHTML = html;
    $("legend").innerHTML = `čistý = po poplatcích a fundingu (vč. nerealizovaného) · BTC kontrola = stejný kapitál v BTC od startu knihy, jedna cena pro všechny (${esc(v.tracker?.btcSource ?? "OKX")}), bez poplatků · obchody x/30 = uzavřené obchody do prvního vyhodnocení (pod 30 = malý vzorek, bez závěrů) · max DD = největší pokles od maxima · data z ${esc(v.books.length)} status souborů + btc-global-control.json`;
  }
  
  function card(b) {
    const tr = b.trades;
    const trHtml = tr ? `<b>${tr.n}/${tr.target}</b>` : NA;
    const cashPct = b.equity && b.cash != null ? Math.round(b.cash / b.equity * 100) : null;
    const dd = b.maxDdPct != null ? pct(b.maxDdPct, 2) : b.maxDdUsd != null ? `$${b.maxDdUsd.toFixed(2)}` : NA;
    let ex = "";
    const e = b.extras;
    if (e?.kind === "carry") {
      const apr = e.apr14Pct ? Object.entries(e.apr14Pct).map(([k, x]) => `<div class="row"><span>${esc(k)} funding (14 d APR)</span><span class="${x >= e.thresholdPct ? "pos" : "zero"}">${pct(x, 2)}</span></div>`).join("") : `<div class="row"><span>funding APR</span><span>${NA}</span></div>`;
      const mx = e.apr14Pct ? Math.max(...Object.values(e.apr14Pct)) : null;
      ex = `<div class="ex"><h4>Funding vs práh ${e.thresholdPct != null ? pct(e.thresholdPct, 0) : "?"}</h4>${apr}${mx != null && e.thresholdPct ? `<div class="bar" title="nejvyšší APR / práh"><i style="width:${Math.min(100, Math.max(0, mx / e.thresholdPct * 100))}%;background:${mx >= e.thresholdPct ? "var(--good)" : "var(--warn)"}"></i></div><div class="note">${mx >= e.thresholdPct ? "nad prahem → vstup možný při dalším denním close" : `pod prahem (chybí ${(e.thresholdPct - mx).toFixed(2).replace(".", ",")} p. b.) → kniha čeká v hotovosti`}</div>` : ""}</div>`;
    } else if (e?.kind === "maker") {
      const mk = (m) => m && m.n ? `${m.bps >= 0 ? "+" : "−"}${Math.abs(m.bps).toFixed(2).replace(".", ",")} bps (${m.n})` : NA;
      const fee = (x) => x == null ? NA : pct(x * 100, 3);
      ex = `<div class="ex"><h4>Maker · ${esc(e.venue)}${e.bankroll ? ` · $${esc(e.bankroll)}` : ""}</h4>${e.disclaimer ? `<div class="note" style="color:var(--warn)"><b>${esc(e.disclaimer)}</b></div>` : ""}
        <div class="row"><span>stav dat</span><span class="${e.available ? "pos" : "neg"}">${e.available ? "živě" : esc(e.state ?? "?")} · čerstvé ${e.freshSymbols ?? "?"}/${e.nSymbols ?? 3} · max ${e.maxDataAgeMs != null ? (e.maxDataAgeMs / 1000).toFixed(1).replace(".", ",") + " s" : "—"}</span></div>
        <div class="row"><span>poplatky maker / taker</span><span>${fee(e.makerFee)} / ${fee(e.takerFee)} · ${esc(e.feeBadge ?? "?")}</span></div>
        <div class="row"><span>zaplaceno maker / taker</span><span>${usd(e.makerFeesPaid == null ? null : -e.makerFeesPaid)} / ${usd(e.takerFeesPaid == null ? null : -e.takerFeesPaid)}</span></div>
        <div class="row"><span>objem · expozice</span><span>${usdPlain(e.volumeUsd)} · ${usdPlain(e.exposureUsd)}</span></div>
        <div class="row"><span>markout 5 s / 60 s</span><span>${mk(e.markout5s)} / ${mk(e.markout60s)}</span></div>
        <div class="note">Fill jen z veřejných obchodů po umístění, fronta poctivě vzadu; rebaty se nepřipisují; funding nezapočítán (přechody ${e.fundingCrossings ?? 0}).${e.kill?.met ? ` <b style="color:var(--bad)">Kill kritérium splněno: ${esc(e.kill.why.join("; "))}</b>` : ""}</div></div>`;
    } else if (e?.kind === "dl20g") {
      const gt = e.gate;
      ex = `<div class="ex"><h4>BTC gate (close vs SMA100)</h4>${gt ? `<div class="row"><span>gate</span><span class="${gt.on ? "pos" : "neg"}">${gt.on ? "ZAP — smí držet" : "VYP — vše v hotovosti"}</span></div><div class="row"><span>BTC close / SMA100</span><span>${Math.round(gt.close).toLocaleString("cs-CZ")} / ${Math.round(gt.sma100).toLocaleString("cs-CZ")} (${pct((gt.close / gt.sma100 - 1) * 100)})</span></div><div class="row"><span>denní bar</span><span>${fmtT(gt.day)}</span></div>` : `<div class="row"><span>gate</span><span>${NA}</span></div>`}
        <div class="row"><span>long signál</span><span>${e.long?.length ? esc(e.long.join(", ")) : "žádná mince nad 20d max"}</span></div>
        <div class="shadow"><b>SHADOW — není v P&amp;L:</b> hypotetický výnos z volné hotovosti ${e.shadow?.usd != null ? "$" + e.shadow.usd.toFixed(4) : "zatím bez dat"}${e.shadow?.ratePct != null ? ` (OKX Simple Earn ${pct(e.shadow.ratePct, 2)} APR)` : ""} od ${fmtT(e.shadow?.since)}. Nic se nepůjčuje; není v equity ani v čistém zisku.</div></div>`;
    } else if (e?.kind === "blend") {
      const c = e.crypto, t = e.etf;
      const hold = t?.holdings ? Object.entries(t.holdings).map(([k, x]) => `${esc(k)} $${Number(x).toFixed(2)}`).join(" · ") : "—";
      const pend = t?.pendingW ? Object.entries(t.pendingW).filter(([, w]) => w > 0).map(([k, w]) => `${esc(k)} ${Math.round(w * 100)} %`).join(" · ") : null;
      const ctl = (o) => !o ? NA : o.pending ? '<span class="zero">čeká na první US close po startu</span>' : usd(o.netUsd);
      ex = `<div class="ex"><h4>Sleeves: krypto vs ETF</h4>
        <div class="row"><span>krypto (DL20-G zrcadlo)</span><span>${c ? usdPlain(c.equity) + " · " + pct(c.pct) : NA}</span></div>
        <div class="bar"><i style="width:${c?.pct ?? 0}%"></i></div>
        <div class="row"><span>krypto drží</span><span>${c?.long?.length ? esc(c.long.join(", ")) : "nic (hotovost)"}${c?.gate ? ` · gate ${c.gate.on ? "ZAP" : "VYP"}` : ""}</span></div>
        <div class="row"><span>ETF (GTAA7)</span><span>${t ? usdPlain(t.equity) + " · " + pct(t.pct) : NA}</span></div>
        <div class="row"><span>ETF drží</span><span>${hold}</span></div>
        ${pend ? `<div class="row"><span>ETF cíl (čeká na fill)</span><span>${pend}</span></div>` : ""}
        <div class="row"><span>cílová váha krypto</span><span>${e.wTargetA != null ? pct(e.wTargetA * 100) : NA}</span></div>
        <div class="row"><span>další rebalance</span><span>${esc(e.nextRebalance ?? "—")}</span></div>
        <h4 style="margin-top:6px">Kontroly</h4>
        <div class="row"><span>BTC</span><span>${usd(b.ctrlUsd)}</span></div><div class="row"><span>SPY</span><span>${ctl(e.spy)}</span></div><div class="row"><span>60/40 SPY/IEF</span><span>${ctl(e.c6040)}</span></div>
        <div class="row"><span>ETF data (Yahoo)</span><span class="${t?.stale ? "neg" : ""}">US close ${esc(t?.lastUsClose ?? "—")} · stáří ${t?.dataAgeDays ?? "?"} d${t?.stale ? " · ZASTARALÁ" : " · v pořádku"}</span></div></div>`;
    }
    const pos = b.positions?.length ? `<table class="mini">${b.positions.slice(0, 6).map((p) => `<tr><td>${esc(p.sym)} ${esc(p.side ?? "")}</td><td>${p.notional != null ? "$" + p.notional.toFixed(2) : "—"} ${p.upnl != null ? usd(p.upnl) : ""}</td></tr>`).join("")}${b.positions.length > 6 ? `<tr><td colspan="2" class="zero">+ ${b.positions.length - 6} dalších</td></tr>` : ""}</table>` : "";
    const st = b.status || b.labelRaw;
    return `<div class="card ${b.stale ? "stale" : ""} ${b.frozen ? "frozen" : ""}">
      <div class="ct"><div><div class="id">${esc(b.id)}</div><div class="t">${esc(b.title)}</div></div>
        <div style="text-align:right">${b.everTraded ? '<span class="pill acc">obchodovala</span>' : '<span class="pill">jen hotovost</span>'}${b.stale ? ' <span class="pill warn">data stará</span>' : ""}${b.review?.flag ? ' <span class="pill bad">přezkum</span>' : ""}</div></div>
      ${st ? `<div class="status ${b.tone}">${esc(st)}</div>` : ""}
      <div class="kpi"><div><small>čistý</small><b>${usd(b.netUsd)}</b></div><div><small>BTC kontrola</small><b>${usd(b.ctrlUsd)}</b></div><div><small>rozdíl vs BTC</small><b>${usd(b.diffUsd)}</b></div>
        <div><small>obchody do 1. hodnocení</small><b>${trHtml}</b></div><div><small>hotovost / v pozicích</small><b>${b.cash != null ? (cashPct != null ? cashPct + " %" : usdPlain(b.cash)) : NA}</b><small>${b.cash != null ? `${b.cashDerived ? "≈" : ""}$${b.cash.toFixed(0)} / $${(b.inPositions ?? 0).toFixed(0)} · ${b.nPos ?? 0} poz.` : ""}</small></div><div><small>max DD</small><b>${dd}</b>${b.maxDdNote ? `<small>${esc(b.maxDdNote)}</small>` : ""}</div></div>
      ${tr ? `<div class="bar" title="${esc(tr.text ?? "")}"><i style="width:${Math.min(100, tr.n / tr.target * 100)}%"></i></div><div class="note">${esc(tr.text ?? "")}</div>` : '<div class="note">počet obchodů: zatím bez dat</div>'}
      ${ex}${pos}
      ${b.reasonCs ? `<div class="reason">${esc(b.reasonCs)}</div>` : ""}
      <div class="foot">start ${fmtT(b.startAt)} · kapitál ${b.capital != null ? "$" + b.capital : "—"} · data ${fmtT(b.updatedAt)}${b.ageSec != null ? ` (${Math.round(b.ageSec / 60)} min před trackerem)` : ""}${b.lastError ? " · chyba: " + esc(String(b.lastError).slice(0, 80)) : ""}</div>
    </div>`;
  }
  function recCard(r) {
    const row = (k, val) => `<div class="row"><span>${k}</span><span>${val}</span></div>`;
    if (r.kind === "paper-mm") {
      const o = ageMin(r.updatedAt) == null || ageMin(r.updatedAt) > 5;
      return `<div class="card ${o ? "stale" : ""}">
      <div class="ct"><div><div class="id">${esc(r.id)}</div><div class="t">${esc(r.title)}</div></div><div style="text-align:right"><span class="pill">papír</span>${o ? ' <span class="pill warn">data stará</span>' : ""}</div></div>
      <div class="status neutral">${esc(r.status)}</div>
      <div class="kpi"><div><small>fillů</small><b>${r.fills ?? "—"}</b></div><div><small>reward (odhad)</small><b>${usd(r.rewardEst)}</b></div><div><small>net (MTM+reward)</small><b>${usd(r.net)}</b></div></div>
      <div class="ex"><h4>Stav</h4>
        ${row("trhů", r.markets ?? "—")}${row("inventář", `${r.inventoryShares ?? "—"} sh`)}${row("MTM", usd(r.mtm))}${row("expozice / bankroll", `${usd(r.exposure)} / ${usd(r.bankroll)}`)}
        ${(r.marketNames || []).map((n) => row("·", esc(String(n).slice(0, 48)))).join("")}</div>
      <div class="foot">data ${fmtT(r.updatedAt)} · tick ${r.tick ?? "?"} · LIVE ${r.live ? "ZAPNUTO" : "vypnuto"}</div>
    </div>`;
    }
    const ls = r.lastScan;
    const old = ageMin(r.updatedAt) == null || ageMin(r.updatedAt) > 20;
    return `<div class="card ${old ? "stale" : ""}">
      <div class="ct"><div><div class="id">${esc(r.id)}</div><div class="t">${esc(r.title)}</div></div><div style="text-align:right"><span class="pill">nahrávání</span>${old ? ' <span class="pill warn">data stará</span>' : ""}</div></div>
      <div class="status neutral">${esc(r.status)}</div>
      <div class="kpi"><div><small>spouštěče</small><b>${r.triggers ?? "—"}</b></div><div><small>s fillem / bez</small><b>${r.filled ?? "—"} / ${r.nofill ?? "—"}</b></div><div><small>otevřené / uzavřené</small><b>${r.open ?? "—"} / ${r.closed ?? "—"}</b></div></div>
      <div class="ex"><h4>Průběh (jen informativní, verdikt až v den hodnocení)</h4>
        ${row("papír P&amp;L ($10/obchod)", usd(r.paperPnl))}${row("při 2× nákladech", usd(r.paperPnl2x))}
        ${row("nezávislé události", `${r.events ?? "—"} (min. ${r.minSample?.filledEvents ?? 100} s fillem)`)}
        ${row("hodnocení", `${esc(r.evalFirst ?? "—")} · nejpozději ${esc(r.evalHard ?? "—")}`)}
        ${row("poslední sken", ls ? `${fmtT(ls.at)} · ${ls.eligible}/${ls.marketsListed} trhů · ${ls.newTriggers} nových` : NA)}
        ${row("disk", r.diskBytes != null ? (r.diskBytes / 1e6).toFixed(2).replace(".", ",") + " MB" : NA)}</div>
      <div class="foot">start ${fmtT(r.startedAt)} · sken á ${r.scanEverySec ? Math.round(r.scanEverySec / 60) : "?"} min · data ${fmtT(r.updatedAt)}${r.error ? " · chyba: " + esc(String(r.error).slice(0, 80)) : ""}</div>
    </div>`;
  }

/* ===== záložky ===== */
var data = null, lastMsgAt = 0, hbSec = 600, deskOk = true, loadedAttach = "", curTab = "knihy";
var TABS = ["knihy", "desk", "perp", "ultron", "system", "hyperdesk", "polyprofile", "adaptivepoly"];
function showTab(t) { curTab = t; TABS.forEach(function (x) { $("tab-" + x).hidden = x !== t; $("nav-" + x).classList.toggle("on", x === t); }); try { sessionStorage.setItem("nd_tab", t); } catch (e) {} }
TABS.forEach(function (t) { $("nav-" + t).onclick = function () { showTab(t); }; });
try { var st0 = sessionStorage.getItem("nd_tab"); if (st0 && TABS.indexOf(st0) >= 0) curTab = st0; } catch (e) {}
try { var q = /[?&]tab=(\w+)/.exec(location.search); if (q && TABS.indexOf(q[1]) >= 0) curTab = q[1]; } catch (e) {}
showTab(curTab);

/* ===== DESK ===== */
function renderDesk(d, info) {
  var st = (d && d.status) || {}, f = st.fills || {}, ls = (d && d.lease) || {}, h = "";
  h += '<div class="sum">';
  h += '<div class="box"><h3>Paper desk — stav</h3><div class="big">' + usd(st.netPnl) + '</div><div class="note">čistý zisk aktuální pásky</div>' +
    row("equity", usdPlain(st.equity)) + row("hotovost", usdPlain(st.cash)) + row("kapitál · mód", esc((st.capital != null ? "$" + st.capital : "—") + " · " + (st.mode || "—"))) +
    row("loop", esc(st.loopIndex != null ? st.loopIndex + "/" + st.loopCycle : "—")) + row("pozastaveno", d && d.paused ? '<span class="neg">ANO</span>' : "ne") + row("pozice", st.position ? esc(JSON.stringify(st.position).slice(0, 80)) : "žádná") + "</div>";
  h += '<div class="box"><h3>Fills pásky</h3><div class="big">' + (f.n != null ? f.n : "—") + (f.max ? '<small>/' + f.max + "</small>" : "") + "</div>" +
    row("výhry", f.wins != null ? f.wins + "/" + f.n : "—") + row("součet net", usd(f.sumPnl)) + row("poplatky", usdPlain(f.sumFees)) + "</div>";
  h += '<div class="box"><h3>Engine</h3><div class="note" style="margin:0 0 6px">' + esc(ls.labelCz || "—") + "</div>" + row("vlastník", esc(ls.owner || "—")) + row("headless žije", ls.headlessAlive ? '<span class="pos">ano</span>' : '<span class="neg">ne</span>') +
    row("poslední heartbeat", ls.hbAgeSec != null ? "před " + human(ls.hbAgeSec) : "—") + row("LIVE", '<span class="neg">VYPNUTÝ natvrdo</span>') + "</div></div>";
  var why = st.why ? '<div class="src"><span class="pill warn">proč čeká</span> <span>' + esc(st.why) + "</span></div>" : "";
  h += why;
  var best = st.best;
  if (best) {
    h += "<h2>Nejlepší kandidát · " + esc(best.coin) + " " + esc(best.side) + " · pulse " + esc(best.pulse) + '</h2><div class="gates">' +
      (best.gates || []).map(function (g) { return '<div class="gate ' + (g.ok ? "ok" : "no") + '" title="' + esc(g.detail) + '"><b>' + (g.ok ? "✓" : "✗") + " " + esc(g.name) + '</b><small>' + esc(g.detail) + "</small></div>"; }).join("") + "</div>";
  }
  var lp = st.levProfile;
  if (lp) h += '<h2>Páka a riziko (mód ' + esc(lp.mode) + ')</h2><div class="box">' + row("limit páky", "×" + esc(lp.levCap)) + row("efektivní páka", num(lp.effLevMin, 1) + " – " + num(lp.effLevMax, 1) + "×") + row("riziko na obchod", "$" + num(lp.riskUsdMin) + " – $" + num(lp.riskUsdMax) + " (" + num(lp.riskPctMin, 1) + "–" + num(lp.riskPctMax, 1) + " %)") + row("stop", num(lp.stopPct, 2) + " %") + row("poplatky RT v R", num(lp.feeRtR, 3)) + row("likvidace při stropu", num(lp.liqDistPctAtCap, 1) + " %") + "</div>";
  if (f.last && f.last.length) h += "<h2>Poslední filly</h2><div class='box tbl'><table><tr><th>zavřeno</th><th>kdo</th><th>důvod</th><th>pnl</th><th>poplatky</th><th>nominál</th><th>páka</th><th>držení</th></tr>" +
    f.last.slice(0, 12).map(function (x) { return "<tr><td>" + fmtMs(x.closedMs) + "</td><td>" + esc(x.coin) + " " + esc(x.side) + "</td><td>" + esc(x.reason) + "</td><td>" + usd(x.pnl) + "</td><td>" + usdPlain(x.fees) + "</td><td>$" + num(x.notional, 0) + "</td><td>" + num(x.effLev, 1) + "×</td><td>" + (x.openedMs && x.closedMs ? human((x.closedMs - x.openedMs) / 1000) : "—") + "</td></tr>"; }).join("") + "</table></div>";
  if (info && info.sections) info.sections.forEach(function (s) {
    h += "<h2>" + esc(s.title) + '</h2><div class="box">' + s.rows.map(function (r) { return '<div class="row2"><span>' + esc(r.k) + "</span><span>" + esc(r.v) + "</span></div>" + (r.h ? '<div class="hint">' + esc(r.h) + "</div>" : ""); }).join("") + "</div>";
  });
  $("deskbody").innerHTML = h;
}

/* ===== PERP ===== */
function renderPerp(p) {
  if (!p) { $("perpbody").innerHTML = '<p class="note">zatím bez dat</p>'; return; }
  var rg = p.regime || {}, h = '<div class="src"><span class="pill ' + (rg.allow ? "good" : "warn") + '">režim ' + esc(rg.regime || "—") + "</span> <span>ER " + num(rg.er, 2) + " · ATR " + num(rg.atrPct, 2) + " % · brána " + (p.regimeGate ? "aktivní" : "vypnutá") + "</span> <span>alfa vs BTC kontrola <b>" + usd(p.alphaVsCtrl) + "</b></span>" +
    (p.btcCtrlTrend ? " <span>BTC kontrola " + usd(p.btcCtrlTrend.cistyZisk) + " (od " + fmtT(p.btcCtrlTrend.startAt) + ")</span>" : "") + "</div>";
  h += '<div class="grid">' + (p.books || []).map(function (b) {
    var s = b.stats || {}, retired = !!b.retired;
    return '<div class="card' + (retired ? " frozen" : "") + '"><div class="ct"><div><div class="id">' + esc(b.id) + '</div><div class="t">' + esc(b.title) + '</div></div><span class="pill ' + (retired ? "" : "acc") + '">' + (retired ? "VYŘAZENO" : "PAPER") + "</span></div>" +
      '<div class="reason">' + esc(b.what) + "</div>" +
      '<div class="kpi"><div><small>equity</small><b>' + usdPlain(b.equity) + "</b></div><div><small>čistý zisk</small><b>" + usd(b.cistyZisk) + "</b></div><div><small>max DD</small><b>" + (b.maxDdPct != null ? pct(b.maxDdPct) : "—") + "</b></div></div>" +
      row("obchody", s.n != null ? s.n + " · výhry " + (s.winRatePct != null ? num(s.winRatePct, 0) + " %" : "—") : "—") + row("součet net", usd(s.netSum)) + row("profit factor", s.profitFactor != null ? num(s.profitFactor) : "—") +
      row("otevřené pozice", esc(b.nPos || 0) + " · expozice " + num(b.exposureX, 2) + "×") + row("poplatky · funding", usdPlain(b.feesPaid) + " · " + usdPlain(b.fundingPaid)) +
      (b.sample && b.sample.text ? '<div class="note">' + esc(b.sample.text) + "</div>" : "") +
      ((b.positions || []).length ? '<table class="mini">' + b.positions.map(function (x) { return "<tr><td>" + esc(x.sym || x.symbol) + " " + esc(x.side) + "</td><td>" + (x.notional != null ? "$" + num(x.notional, 0) : "") + "</td><td>" + (x.upnl != null ? usd(x.upnl) : x.unrealized != null ? usd(x.unrealized) : "") + "</td></tr>"; }).join("") + "</table>" : "") +
      (b.coverage ? '<div class="foot">' + esc(b.coverage.label) + " · " + esc(b.dataSource || "") + "</div>" : "") + "</div>";
  }).join("") + "</div>";
  var cr = (p.corrections && p.corrections.artifacts) || [];
  if (cr.length) h += "<h2>Opravy artefaktů</h2><div class='box'>" + cr.map(function (a) { return '<div class="hint" style="margin:0 0 8px"><b>' + esc(a.book) + " · " + esc(a.symbol) + "</b> — " + esc(a.note) + "</div>"; }).join("") + "</div>";
  if ((p.findings || []).length) h += "<h2>Nálezy</h2><div class='box'>" + p.findings.map(function (f) { return '<div class="hint" style="margin:0 0 6px">' + esc(typeof f === "string" ? f : f.text || f.note || JSON.stringify(f)) + "</div>"; }).join("") + "</div>";
  $("perpbody").innerHTML = h;
}

/* ===== ULTRON ===== */
function renderUltron(w) {
  var u = w && w.ultron; if (!u) { $("ultronbody").innerHTML = '<p class="note">zatím bez dat</p>'; return; }
  var s = u.stats || {}, v = u.verdict || {}, pr = u.progress || {}, b = u.btc || {}, h = "";
  var vc = /NO-EDGE|FAIL/.test(v.code || "") ? "bad" : /PASS|EDGE/.test(v.code || "") ? "good" : "warn";
  h += '<div class="src"><span class="pill ' + vc + '">' + esc(v.label || v.code || "—") + "</span> <span>" + esc(v.note || "") + "</span> <span class='pill'>jen čte · nic nemění</span></div>";
  h += '<div class="sum"><div class="box"><h3>Kohorta ' + esc((u.cohort || {}).id) + '</h3><div class="big">' + usd(s.netUsd) + '</div><div class="note">čistý výsledek ' + s.n + " fillů od " + esc((u.cohort || {}).startLocal) + "</div>" +
    '<div class="bar"><i style="width:' + barW(pr.pct) + '%"></i></div><div class="note">' + pr.n + "/" + pr.target + " fillů (" + pr.pct + " %)</div></div>" +
    '<div class="box"><h3>Statistika</h3>' + row("průměr / fill", usd(s.avgUsd)) + row("medián", usd(s.medianUsd)) + row("úspěšnost", s.winRate != null ? pct(s.winRate * 100) + " (" + s.wins + "/" + s.n + ")" : "—") + row("profit factor", num(s.profitFactor)) + row("expectancy R", num(s.expectancyR, 3)) + row("max drawdown", usdPlain(s.maxDrawdownUsd)) + row("průměrné držení", s.avgHoldSec != null ? human(s.avgHoldSec) : "—") + (s.ci95 ? row("95% CI průměru", usd(s.ci95.lo) + " … " + usd(s.ci95.hi)) : "") + "</div>" +
    '<div class="box"><h3>Poplatky a BTC kontrola</h3>' + row("hrubý", usd(s.grossUsd)) + row("poplatky", usdPlain(s.feesUsd)) + row("funding", usd(s.fundingUsd)) + row("BTC od startu", b.retPct != null ? num(b.retPct, 2) + " %" : "—") + row("BTC kontrola ($" + (b.refCapital || "") + ")", usd(b.controlUsd)) + "</div></div>";
  if (s.exitReasons && s.exitReasons.length) h += "<h2>Důvody výstupu</h2><div class='box tbl'><table><tr><th>důvod</th><th>n</th><th>net</th><th>průměr</th><th>úspěšnost</th></tr>" + s.exitReasons.map(function (x) { return "<tr><td>" + esc(x.key) + "</td><td>" + x.n + "</td><td>" + usd(x.net) + "</td><td>" + usd(x.avg) + "</td><td>" + pct((x.winRate || 0) * 100) + "</td></tr>"; }).join("") + "</table></div>";
  if (u.wait && u.wait.reasons) h += "<h2>Proč čeká (" + (u.wait.samples || 0).toLocaleString("cs-CZ") + " vzorků)</h2><div class='box'>" + u.wait.reasons.slice(0, 8).map(function (x) { return '<div class="wr"><span>' + esc(x.key) + '</span><span>' + pct(x.pct) + '</span><div class="bar"><i style="width:' + barW(x.pct) + '%"></i></div></div>'; }).join("") + "</div>";
  if (u.hypotheses && u.hypotheses.length) h += "<h2>Hypotézy (jen návrhy)</h2>" + u.hypotheses.map(function (x) { return '<div class="box" style="margin-bottom:8px"><div class="ct"><b>' + esc(x.title) + '</b><span class="pill ' + (x.status === "PASS" ? "good" : x.status === "FAIL" ? "bad" : "warn") + '">' + esc(x.status) + '</span></div><div class="note">' + esc(x.evidence) + '</div><div class="hint">Návrh: ' + esc(x.proposal) + "<br>Test: " + esc(x.requiredTest) + "</div></div>"; }).join("");
  if (u.recent && u.recent.length) h += "<h2>Poslední fills</h2><div class='box tbl'><table><tr><th>zavřeno</th><th>kdo</th><th>důvod</th><th>pnl</th><th>R</th><th>nominál</th></tr>" + u.recent.slice(0, 15).map(function (x) { return "<tr><td>" + fmtMs(x.closedMs) + "</td><td>" + esc(x.coin) + " " + esc(x.side) + "</td><td>" + esc(x.reason) + "</td><td>" + usd(x.pnl) + "</td><td>" + num(x.r, 2) + "</td><td>$" + num(x.notional, 0) + "</td></tr>"; }).join("") + "</table></div>";
  var sk = u.skips; if (sk && sk.byReason) h += "<h2>Přeskočené signály (" + sk.n + ")</h2><div class='box'>" + row("po poplatcích kladné", pct((sk.postFeePositiveShare || 0) * 100)) + row("průměr post-fee R", num(sk.avgPostFeeR, 3)) + sk.byReason.slice(0, 6).map(function (x) { return row(esc(x.key), x.n); }).join("") + "</div>";
  (u.rules || []).concat(u.notes || []).length && (h += "<h2>Pravidla a poznámky</h2><div class='box'>" + (u.rules || []).concat(u.notes || []).map(function (x) { return '<div class="hint" style="margin:0 0 6px">' + esc(x) + "</div>"; }).join("") + "</div>");
  $("ultronbody").innerHTML = h;
}

/* ===== SYSTÉM ===== */
function renderSystem(sy, rd) {
  var h = "";
  if (sy) {
    h += '<div class="sum"><div class="box"><h3>Stav systému</h3><div class="big">' + esc(sy.okCount) + '<small> OK</small></div>' + row("očekávaně mimo", sy.expectedCount) + row("problémy", sy.problemCount ? '<span class="neg">' + sy.problemCount + "</span>" : '<span class="pos">0</span>') + row("LIVE", '<span class="neg">' + esc(sy.liveNote || "vypnutý") + "</span>") + row("build", esc((sy.build || {}).hash || "—")) + "</div>";
    if (rd) h += '<div class="box"><h3>Připravenost na LIVE (diskuse)</h3><div class="big">' + esc(rd.overallPct) + ' %</div><div class="bar"><i style="width:' + barW(rd.overallPct) + '%"></i></div><div class="note">' + esc(rd.statusCz) + " · " + esc(rd.etaRoughCz || "") + "</div>" + row("LIVE natvrdo vypnutý", rd.liveHardOff ? "ano" : "?") + "</div>";
    h += "</div>";
  }
  if (rd) {
    if (rd.summaryCz) h += '<div class="src"><span>' + esc(rd.summaryCz) + "</span></div>";
    h += "<h2>Tracky připravenosti</h2><div class='grid'>" + (rd.tracks || []).map(function (t) { return '<div class="card"><div class="ct"><b>' + esc(t.labelCz) + '</b><span class="pill ' + (t.pct >= 100 ? "good" : t.pct >= 50 ? "warn" : "bad") + '">' + t.pct + " %</span></div><div class='bar'><i style='width:" + barW(t.pct) + "%'></i></div><div class='note'>váha " + t.weight + " % · " + esc(t.detail) + "</div>" + (t.blockers || []).map(function (b) { return '<div class="status warn">' + esc(b) + "</div>"; }).join("") + "</div>"; }).join("") + "</div>";
  }
  if (sy && sy.workers) h += "<h2>Procesy (" + sy.workers.length + ')</h2><div class="grid">' + sy.workers.map(function (w) {
    var cls = w.alive === false && !w.expected ? "bad" : (w.fresh === false && !w.expected) ? "warn" : w.expected ? "" : "good";
    return '<div class="card"><div class="ct"><div><div class="id" style="font-size:14px">' + esc(w.label) + '</div><div class="t">' + esc(w.desc) + '</div></div><span class="pill ' + (cls || "") + '">' + (w.expected && !w.alive ? "ZASTAVENO" : w.alive === false ? "NEBĚŽÍ" : "OK") + "</span></div>" +
      '<div class="status ' + (cls === "bad" ? "bad" : cls === "warn" ? "warn" : "good") + '">' + esc(w.state) + (w.ageSec != null ? " · data před " + human(w.ageSec) : "") + "</div>" +
      (w.summary || []).slice(0, 8).map(function (r) { return '<div class="row2" title="' + esc(r.h || "") + '"><span>' + esc(r.k) + "</span><span>" + esc(r.v) + "</span></div>"; }).join("") + "</div>";
  }).join("") + "</div>";
  $("systembody").innerHTML = h || '<p class="note">zatím bez dat</p>';
}


function botHead(file, name, sub) {
  return '<div class="bothead"><img src="avatars/' + file + '.svg?v=3" alt=""><div class="nm">' + name + '<small>' + sub + ' · PAPER · LIVE vypnutý</small></div></div>';
}
/* ===== TRADING BOTI (HyperDesk + PolyProfile + AdaptivePoly) — jen sledování ===== */
var fmtS = function (s) { return s ? fmtMs(s * 1000) : "—"; };
var badges = '<div class="src"><span class="pill">PAPER</span> <span class="pill bad">LIVE natvrdo vypnutý</span> <span class="pill">jen sledování · schvalování jen na boxu</span></div>';
function spark(c) {
  if (!c || c.length < 2) return '<div class="note">křivka se teprve plní</div>';
  var v = c.map(function (x) { return x[1]; }), mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), W = 300, H = 60;
  var pts = v.map(function (y, i) { return (i / (v.length - 1) * W).toFixed(1) + "," + (H - (mx === mn ? H / 2 : (y - mn) / (mx - mn) * H)).toFixed(1); }).join(" ");
  return '<svg viewBox="0 0 ' + W + " " + H + '" style="width:100%;height:60px"><polyline fill="none" stroke="currentColor" stroke-width="2" points="' + pts + '"/></svg>';
}
function seatsHtml(se) {
  return '<div class="gates">' + ["strategist", "risk", "ticket", "fill"].map(function (k) { var x = (se || {})[k] || {}; return '<div class="gate ' + (x.state === "error" ? "no" : "ok") + '"><b>' + esc(k) + " · " + esc(x.state || "—") + "</b><small>" + esc(x.msg || "") + "</small></div>"; }).join("") + "</div>";
}

/* ===== dlouhý replay (jen čtení) ===== */
function lrBadge(d) { return '<span class="pill ' + (d === "KEEP" ? "good" : "bad") + '">' + esc(d || "—") + "</span>"; }
function lrCI(c) { return c ? num(c[0], 3) + " … " + num(c[1], 3) : "—"; }
function lrDate(t) { return t ? new Date(t * 1000).toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague" }) : "—"; }
function longHTML(lr, kind) {
  if (!lr) return '<h2>📚 Dlouhý replay</h2><p class="note">počítá se…</p>';
  var x = "", c = lr.coverage || {};
  if (kind === "hd") {
    x += '<h2>📚 Dlouhý replay (max historie, jen krypto)</h2><p class="note">' + (c.pairs || 0) + " krypto párů od " + lrDate(c.firstBar) + " · likvidita v čase · vstup na open další svíčky · gap stopy · funding podle skutečného intervalu · portfolio max 8 pozic, 1 na coin · " + (c.tradfiExcluded || 0) + " akcií/komodit vyřazeno</p>";
    x += "<div class='box tbl'><table><tr><th>strategie</th><th>n</th><th>čistý</th><th>95% CI Ø</th><th>Sharpe</th><th>max DD</th><th>coin flip</th><th>§8</th></tr>";
    Object.keys(lr.strategies || {}).forEach(function (k) { var s = lr.strategies[k] || {}, g = s.gate || {}; x += "<tr><td>" + esc(k) + "</td><td>" + (s.n || 0) + "</td><td>" + usd(s.net) + "</td><td>" + lrCI(s.ci) + "</td><td>" + num(s.sharpe) + "</td><td>" + pct((s.maxDD || 0) * 100) + "</td><td>" + usd((s.coinflip || {}).net) + "</td><td>" + lrBadge(g.decision) + "</td></tr>"; });
    return x + "</table></div>";
  }
  var L1 = (lr.lags || {})["1"] || {}, gs = lr.gates || {};
  x += '<h2>📚 Dlouhý replay</h2><p class="note">' + (c.rows || 0) + " krypto Up/Down trhů (" + esc((c.assets || []).join(", ")) + ") · " + lrDate(c.from) + " – " + lrDate(c.to) + " · on-chain obchody · vypořádání podle skutečného rozhodnutí · dnešní poplatky · základ = zpoždění kotace 1 min</p>";
  x += "<div class='box tbl'><table><tr><th>strategie</th><th>n</th><th>čistý</th><th>95% CI Ø</th><th>§8</th><th>0 min</th><th>2 min</th></tr>";
  Object.keys(gs).forEach(function (k) { var s = k === "FAIRCAL" ? lr.faircal : L1[k]; s = s || {}; var l0 = ((lr.lags || {})["0"] || {})[k] || {}, l2 = ((lr.lags || {})["2"] || {})[k] || {};
    x += "<tr><td>" + esc(k) + "</td><td>" + (s.n || 0) + "</td><td>" + usd(s.net) + "</td><td>" + lrCI(s.ci) + "</td><td>" + lrBadge((gs[k].edge || {}).decision) + "</td><td>" + (l0.n ? usd(l0.net) : "—") + "</td><td>" + (l2.n ? usd(l2.net) : "—") + "</td></tr>"; });
  var cf = L1.coinflip || {}; x += "<tr><td>coin flip</td><td>" + (cf.n || 0) + "</td><td>" + usd(cf.net) + "</td><td>" + lrCI(cf.ci) + "</td><td>—</td><td></td><td></td></tr>";
  return x + "</table></div>";
}
function renderHD(h) {
  if (!h) { $("hdbody").innerHTML = '<p class="note">zatím bez dat (Hyperion · HyperDesk na boxu neběží nebo ještě nic neposlal)</p>'; return; }
  var f = h.forward || {}, x = botHead("hyperion", "Hyperion", "HyperDesk");
  x += badges + '<div class="sum"><div class="box"><h3>Equity (paper)</h3><div class="big">' + usdPlain(h.equity) + '</div><div class="note">start $' + h.start + " · realizováno " + usd(h.realized) + " · otevřeno " + usd(h.unrealized) + "</div>" + spark(h.curve) + "</div>" +
    '<div class="box"><h3>Dnes a risk</h3>' + row("dnes", usd(h.dayPnl)) + row("auto-paper", h.autoPaper ? "zapnuto" : "vypnuto (čeká na Schválit)") + row("kill switch", h.killed ? '<span class="neg">AKTIVNÍ</span>' : "ne") + row("universe", esc(h.universe) + " párů") + "</div>" +
    '<div class="box"><h3>Forward paper</h3>' + row("obchody", f.n || 0) + row("čistý", usd(f.net)) + row("win", f.winRate != null ? pct(f.winRate * 100) : "—") + row("Sharpe", num(f.sharpe)) + row("max DD", f.maxDD != null ? pct(f.maxDD * 100) : "—") + row("edge ratio", num(f.edgeRatio)) + row("poplatky", usdPlain(f.fees)) + "</div></div>";
  x += "<h2>Pipeline</h2>" + seatsHtml(h.seats);
  x += "<h2>Otevřené paper pozice (" + (h.open || []).length + ")</h2><div class='box tbl'>" + ((h.open || []).length ? "<table><tr><th>id</th><th>mince</th><th>strana</th><th>strat.</th><th>vstup</th><th>teď</th><th>stop</th><th>pnl</th></tr>" + h.open.map(function (p) { return "<tr><td>" + esc(p.id) + "</td><td>" + esc(p.base) + " " + esc(p.venue) + "</td><td>" + esc(p.side) + "</td><td>" + esc(p.strategy) + "</td><td>" + num(p.entryPx, 4) + "</td><td>" + num(p.px, 4) + "</td><td>" + num(p.stop, 4) + "</td><td>" + usd(p.upnl) + "</td></tr>"; }).join("") + "</table>" : '<p class="note">žádné</p>') + "</div>";
  x += "<h2>Poslední tikety</h2><div class='box tbl'>" + ((h.tickets || []).length ? "<table><tr><th>id</th><th>mince</th><th>strana</th><th>strat.</th><th>stav</th><th>čas</th></tr>" + h.tickets.map(function (t) { return "<tr><td>" + esc(t.id) + "</td><td>" + esc(t.base) + " " + esc(t.venue) + "</td><td>" + esc(t.side) + "</td><td>" + esc(t.strategy) + "</td><td>" + esc(t.status) + "</td><td>" + fmtS(t.ts) + "</td></tr>"; }).join("") + "</table>" : '<p class="note">žádné</p>') + "</div>";
  var r = h.replay || {}, rk = Object.keys(r);
  if (rk.length) x += "<h2>Replay " + esc(h.replayDays) + " d · " + esc((h.replayCoverage || {}).pairs) + " párů</h2><div class='box tbl'><table><tr><th>strategie</th><th>n</th><th>čistý ($100/obchod)</th><th>win</th><th>Sharpe</th><th>max DD</th><th>PF</th><th>edge</th></tr>" + rk.map(function (k) { var s = r[k]; return "<tr><td>" + esc(k) + "</td><td>" + s.n + "</td><td>" + usd(s.net) + "</td><td>" + (s.winRate != null ? pct(s.winRate * 100) : "—") + "</td><td>" + num(s.sharpe) + "</td><td>" + (s.maxDD != null ? pct(s.maxDD * 100) : "—") + "</td><td>" + num(s.profitFactor) + "</td><td>" + num(s.edgeRatio) + "</td></tr>"; }).join("") + "</table></div>";
  else x += '<p class="note">replay se ještě počítá</p>';
  x += "<h2>Pokrytí dat</h2><div class='box'>" + Object.keys(h.coverage || {}).map(function (k) { var c = h.coverage[k]; return row(esc(k), c.ok ? c.liquid + " likvidních z " + c.listed : '<span class="zero">' + esc(c.err || "nedostupné") + "</span>"); }).join("") + "</div>";
  $("hdbody").innerHTML = x + longHTML(h.longReplay, "hd");
}
function renderPP(p) {
  if (!p) { $("ppbody").innerHTML = '<p class="note">zatím bez dat (Valora · PolyProfile na boxu neběží nebo ještě nic neposlal)</p>'; return; }
  var x = botHead("valora", "Valora", "PolyProfile") + badges, cv = p.coverage || {}, rp = p.replay || {};
  var names = { strategy: "VP-hold (ask+poplatek)", fair: "Fair BS/TWAP (ask+poplatek)", strategyAtMid: "VP @mid bez nákladů", coinflip: "coin flip", alwaysMid: "always-mid Up" };
  x += '<div class="sum"><div class="box"><h3>Equity (paper, VP+Fair)</h3><div class="big">' + usdPlain(p.equity) + '</div><div class="note">start $' + p.start + " · sázka $" + p.stake + "/obchod</div>" + spark(p.curve) + "</div>";
  [["VP", p.relearnVP], ["Fair", p.relearnFair]].forEach(function (a) { var r = a[1] || {}, l = r.last || {}; x += '<div class="box"><h3>Přeučování ' + a[0] + "</h3>" + row("stav", esc(r.phase === "relearning" ? "Přeučuji minulé obchody… aktualizuji prahy" : r.message || "—")) + row("aktivní", esc(JSON.stringify(r.active || {}))) + row("hash", esc(r.hash || "—")) + row("stín", r.shadow ? esc(JSON.stringify(r.shadow)) : "žádný") + row("poslední", l.decision ? esc(l.decision) + " · " + fmtS(l.ts) : "—") + (l.reason ? '<div class="hint">' + esc(l.reason) + "</div>" : "") + "</div>"; });
  x += "</div>";
  x += "<h2>Strategie vs. baseline (krátký replay 48 h = nevypovídající)</h2><div class='box tbl'><table><tr><th>zdroj</th><th>kniha</th><th>n</th><th>čistý</th><th>win</th><th>95% CI Ø</th></tr>";
  ["forward", "replay"].forEach(function (src) { var c = (p.comparison || {})[src] || {}; Object.keys(names).forEach(function (k) { var s = c[k] || {}; x += "<tr><td>" + src + "</td><td>" + names[k] + "</td><td>" + (s.n || 0) + "</td><td>" + (s.n ? usd(s.net) : "—") + "</td><td>" + (s.n ? pct(s.winRate * 100) : "—") + "</td><td>" + (s.ci ? num(s.ci[0], 3) + " … " + num(s.ci[1], 3) : "—") + "</td></tr>"; }); });
  x += "</table></div>";
  x += "<h2>Otevřené paper sázky (" + (p.open || []).length + ")</h2><div class='box tbl'>" + ((p.open || []).length ? "<table><tr><th>trh</th><th>strategie</th><th>strana</th><th>cena</th><th>konec</th></tr>" + p.open.map(function (f) { return "<tr><td>" + esc(f.asset) + " " + esc(f.tf) + "</td><td>" + (f.book === "fair" ? "Fair" : "VP") + "</td><td>" + esc(f.side) + "</td><td>" + num(f.px * 100, 1) + " ¢</td><td>" + fmtS(f.end) + "</td></tr>"; }).join("") + "</table>" : '<p class="note">žádné</p>') + "</div>";
  x += "<h2>Poslední filly</h2><div class='box tbl'>" + ((p.fills || []).length ? "<table><tr><th>čas</th><th>trh</th><th>str.</th><th>strana</th><th>cena</th><th>výsledek</th></tr>" + p.fills.map(function (f) { return "<tr><td>" + fmtS(f.ts) + "</td><td>" + esc(f.asset) + " " + esc(f.tf) + "</td><td>" + (f.book === "fair" ? "Fair" : "VP") + "</td><td>" + esc(f.side) + "</td><td>" + num(f.px * 100, 1) + " ¢</td><td>" + (f.result == null ? "čeká" : usd(f.result)) + "</td></tr>"; }).join("") + "</table>" : '<p class="note">zatím žádné</p>') + "</div>";
  x += "<h2>Aktivní trhy (" + (cv.activeMarkets || 0) + ")</h2><div class='box tbl'><table><tr><th>trh</th><th>zóna</th><th>Up ask</th><th>Down ask</th><th>konec</th></tr>" + (p.markets || []).map(function (m) { return "<tr><td>" + esc(m.asset) + " " + esc(m.tf) + "</td><td>" + esc(m.zone || "—") + "</td><td>" + (m.upAsk != null ? num(m.upAsk * 100, 1) + " ¢" : "—") + "</td><td>" + (m.downAsk != null ? num(m.downAsk * 100, 1) + " ¢" : "—") + "</td><td>" + fmtS(m.end) + "</td></tr>"; }).join("") + "</table></div>";
  x += "<h2>Pokrytí dat</h2><div class='box'>" + row("aktiva", esc((cv.assets || []).join(", "))) + row("timeframy", esc(Object.keys(cv.byTf || {}).map(function (k) { return k + " " + cv.byTf[k]; }).join(" · "))) + row("deník forward / replay", (cv.rowsForward || 0) + " / " + (cv.rowsReplay || 0)) + row("replay", esc(rp.state) + (rp.total ? " " + rp.done + "/" + rp.total : "")) + "</div>";
  $("ppbody").innerHTML = x + longHTML(p.longReplay, "poly");
}


function renderAP(p) {
  if (!p) { $("apbody").innerHTML = '<p class="note">zatím bez dat (Chiméra · AdaptivePoly na boxu neběží nebo ještě nic neposlal)</p>'; return; }
  var x = botHead("chimera", "Chiméra", "AdaptivePoly") + badges, cv = p.coverage || {}, rp = p.replay || {}, rl = p.relearn || {}, l = rl.last || {};
  x += '<div class="sum"><div class="box"><h3>Equity (paper Adaptive)</h3><div class="big">' + usdPlain(p.equity) + '</div><div class="note">start $' + p.start + " · sázka $" + p.stake + "/obchod</div>" + spark(p.curve) + "</div>";
  x += '<div class="box"><h3>Přeučování Adaptive</h3>' + row("stav", esc(rl.phase === "relearning" ? "Přeučuji…" : rl.message || "—")) + row("aktivní", esc(JSON.stringify(rl.active || {}))) + row("hash", esc(rl.hash || "—")) + row("poslední", l.decision ? esc(l.decision) + " · " + fmtS(l.ts) : "—") + (l.reason ? '<div class="hint">' + esc(l.reason) + "</div>" : "") + "</div>";
  x += '<div class="box"><h3>Bayes top</h3>' + ((p.bayes || []).slice(0, 6).map(function (b) { return row(esc(b.key), pct((b.mean || 0) * 100) + " · n≈" + num(b.n, 0)); }).join("") || '<p class="note">prior</p>') + "</div></div>";
  x += "<h2>Strategie vs. baseline (krátký replay 48 h = nevypovídající)</h2><div class='box tbl'><table><tr><th>zdroj</th><th>kniha</th><th>n</th><th>čistý</th><th>win</th></tr>";
  var names = { adaptive: "Adaptive Bayes", MOM: "MOM", MR: "MR", FAIR: "FAIR", VP: "VP", coinflip: "coin flip" };
  ["forward", "replay"].forEach(function (src) { var c = (p.comparison || {})[src] || {}; Object.keys(names).forEach(function (k) { var s = c[k] || {}; x += "<tr><td>" + src + "</td><td>" + names[k] + "</td><td>" + (s.n || 0) + "</td><td>" + (s.n ? usd(s.net) : "—") + "</td><td>" + (s.n ? pct(s.winRate * 100) : "—") + "</td></tr>"; }); });
  x += "</table></div>";
  x += "<h2>Otevřené (" + (p.open || []).length + ")</h2><div class='box tbl'>" + ((p.open || []).length ? "<table><tr><th>trh</th><th>strat</th><th>strana</th><th>cena</th><th>konec</th></tr>" + p.open.map(function (f) { return "<tr><td>" + esc(f.asset) + " " + esc(f.tf) + "</td><td>" + esc(f.strategy) + "</td><td>" + esc(f.side) + "</td><td>" + num(f.px * 100, 1) + " ¢</td><td>" + fmtS(f.end) + "</td></tr>"; }).join("") + "</table>" : '<p class="note">žádné</p>') + "</div>";
  x += "<h2>Filly</h2><div class='box tbl'>" + ((p.fills || []).length ? "<table><tr><th>čas</th><th>trh</th><th>strat</th><th>strana</th><th>cena</th><th>výsledek</th></tr>" + p.fills.map(function (f) { return "<tr><td>" + fmtS(f.ts) + "</td><td>" + esc(f.asset) + " " + esc(f.tf) + "</td><td>" + esc(f.strategy) + "</td><td>" + esc(f.side) + "</td><td>" + num(f.px * 100, 1) + " ¢</td><td>" + (f.result == null ? "čeká" : usd(f.result)) + "</td></tr>"; }).join("") + "</table>" : '<p class="note">zatím žádné</p>') + "</div>";
  x += "<h2>Pokrytí</h2><div class='box'>" + row("aktiva", esc((cv.assets || []).join(", "))) + row("timeframy", esc(Object.keys(cv.byTf || {}).map(function (k) { return k + " " + cv.byTf[k]; }).join(" · "))) + row("deník f/r", (cv.rowsForward || 0) + " / " + (cv.rowsReplay || 0)) + row("replay", esc(rp.state) + (rp.total ? " " + rp.done + "/" + rp.total : "")) + "</div>";
  $("apbody").innerHTML = x + longHTML(p.longReplay, "poly");
}

/* ===== vykreslení snímku ===== */
function renderAll() {
  if (!data) return;
  try { var b = data.books; if (b && b.kind === "nova-books-view") { render(b, "live"); } } catch (e) { $("src").textContent = "chyba vykreslení: " + e.message; }
  try { renderDesk(data.desk, data.info); } catch (e) { $("deskbody").textContent = "chyba vykreslení"; }
  try { renderPerp(data.perp); } catch (e) { $("perpbody").textContent = "chyba vykreslení"; }
  try { renderUltron(data.ultron); } catch (e) { $("ultronbody").textContent = "chyba vykreslení"; }
  try { renderSystem(data.system, data.readiness); } catch (e) { $("systembody").textContent = "chyba vykreslení"; }
  try { renderHD((data.bots || {}).hyperdesk); } catch (e) { $("hdbody").textContent = "chyba vykreslení"; }
  try { renderPP((data.bots || {}).polyprofile); } catch (e) { $("ppbody").textContent = "chyba vykreslení"; }
  try { renderAP((data.bots || {}).adaptivepoly); } catch (e) { $("apbody").textContent = "chyba vykreslení"; }
  var b2 = data.books, s = $("src"); if (b2 && b2.tracker) { s.className = "src"; s.innerHTML = '<span class="pill acc">SNÍMEK z boxu</span> <span>tracker BTC kontroly k <b>' + fmtT(b2.tracker.updatedAt) + "</b> · BTC <b>" + (b2.tracker.btcPrice != null ? "$" + Math.round(b2.tracker.btcPrice).toLocaleString("cs-CZ") : "—") + "</b> (" + esc(b2.tracker.btcSource || "—") + ")</span>"; }
  var i = data.info; $("hdrline").textContent = i && i.live ? "LIVE: " + i.live : "";
}

/* ===== stav připojení / čerstvost ===== */
function tick() {
  var el = $("fresh"), now = Date.now();
  if (!lastMsgAt) { el.className = "fresh warn"; el.innerHTML = "čekám na první data z boxu…"; return; }
  var age = (now - lastMsgAt) / 1000, limit = hbSec + 120, stale = age > limit;
  var dataAge = data ? (now - data.at) / 1000 : null;
  el.className = "fresh " + (stale ? "bad" : "good");
  el.innerHTML = "naposledy aktualizováno <b>" + fmtHMS(lastMsgAt) + "</b> (před " + human(age) + ")" + (dataAge != null && dataAge > 1500 ? " · snímek z " + fmtHMS(data.at) : "") +
    (stale ? ' <span class="pill bad">DATA ZASTARALÁ</span>' : "") + (!deskOk ? ' <span class="pill warn">desk na boxu neodpovídá</span>' : "");
}
setInterval(tick, 1000);

/* ===== příjem z ntfy ===== */
var ATT_RE = /^https:\/\/ntfy\.sh\/file\/[A-Za-z0-9_-]+(\.[A-Za-z0-9]+)?$/;
function loadAttach(m) {
  var url = m.attachment && m.attachment.url; if (!url || !ATT_RE.test(url) || url === loadedAttach) return Promise.resolve();
  return fetch(url, { cache: "no-store", referrerPolicy: "no-referrer" }).then(function (r) { if (!r.ok) throw new Error("att " + r.status); return r.json(); }).then(function (j) {
    if (!j || j.kind !== "nova-desk-watch") return;
    if (data && j.at < data.at) return;
    data = j; loadedAttach = url; deskOk = true; renderAll(); tick();
  }).catch(function () {});
}
var chain = Promise.resolve();
function handle(m) {
  if (!m || m.event !== "message") return;
  var meta; try { meta = JSON.parse(m.message); } catch (e) { return; }
  if (!meta || meta.k !== "nd") return;
  var t = (m.time || 0) * 1000; if (t > lastMsgAt) lastMsgAt = t;
  if (meta.hb) hbSec = Math.max(60, Math.min(3600, meta.hb));
  if (meta.ok === 0) { deskOk = false; tick(); return; }
  deskOk = true;
  if (m.attachment) chain = chain.then(function () { return loadAttach(m); });
  tick();
}
function backfill(since) {
  return fetch(BASE + "/json?poll=1&since=" + since, { cache: "no-store", referrerPolicy: "no-referrer" }).then(function (r) { return r.text(); }).then(function (txt) {
    var ms = txt.split("\n").filter(Boolean).map(function (l) { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);
    ms.forEach(handle); return ms.length;
  });
}
backfill("1h").then(function (n) { if (!n) return backfill("12h"); }).catch(function () { $("fresh").textContent = "nelze se připojit k ntfy"; }).then(function () { chain.then(tick); });
var es; function sse() { try { es = new EventSource(BASE + "/sse"); es.onmessage = function (e) { try { handle(JSON.parse(e.data)); } catch (x) {} }; } catch (e) {} }
sse();
document.addEventListener("visibilitychange", function () { if (!document.hidden && (Date.now() - lastMsgAt) > 60000) backfill("1h").catch(function () {}); });
setInterval(function () { if (!document.hidden && (Date.now() - lastMsgAt) > (hbSec + 60) * 1000) backfill("1h").catch(function () {}); }, 120000);
})();
