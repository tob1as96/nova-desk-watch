# NOVA desk · jen sledování (PWA)

Statická PWA, která **jen zobrazuje** snímek NOVA desku z mého boxu. Žádné ovládání, žádné zápisy, žádné tajemství v repu.
Soukromý kanál (topic) je jen v odkazu `…/#t=<topic>`: stránka si ho uloží do localStorage a z adresy ho hned smaže.
Data chodí přes veřejný ntfy.sh jako příloha (snímek ~140 kB), čte se `/json?poll=1&since=1h` + `/sse`.
Tlačítko ⚙ → „Zapomenout kanál“ smaže topic, cache i service worker.
