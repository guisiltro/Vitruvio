/* ============================================================
   VITRUVIANO · Página Premium — Planejamento completo
   ============================================================ */
(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var fmt = function (n) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  };

  /* ============================================================
     TEMA
     ============================================================ */
  (function () {
    var TKEY = "vitruviano:theme";
    var root = document.documentElement;
    var saved;
    try { saved = localStorage.getItem(TKEY); } catch (e) {}
    if (!saved) saved = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.setAttribute("data-theme", saved);
    var themeBtn = $(".theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(TKEY, next); } catch (e) {}
    });
  })();

  /* ============================================================
     MENU + HEADER
     ============================================================ */
  (function () {
    var menuBtn = $(".menu-toggle");
    var siteNav = $(".site-nav");
    if (menuBtn && siteNav) {
      menuBtn.addEventListener("click", function () {
        var open = siteNav.classList.toggle("is-open");
        menuBtn.setAttribute("aria-expanded", String(open));
      });
      $$(".site-nav a").forEach(function (a) {
        a.addEventListener("click", function () {
          siteNav.classList.remove("is-open");
          menuBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
    var header = $(".site-header");
    var lastY = window.scrollY;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        if (header) {
          var y = window.scrollY;
          header.classList.toggle("is-scrolled", y > 8);
          var menuOpen = siteNav && siteNav.classList.contains("is-open");
          if (menuOpen || y < 120) header.classList.remove("is-hidden");
          else if (y > lastY + 4) header.classList.add("is-hidden");
          else if (y < lastY - 4) header.classList.remove("is-hidden");
          lastY = y;
        }
        ticking = false;
      });
    }, { passive: true });
  })();

  /* ============================================================
     REVEAL
     ============================================================ */
  (function () {
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      $$("[data-reveal]").forEach(function (el) { obs.observe(el); });
    }
  })();

  /* ============================================================
     TOGGLE MENSAL / ANUAL
     ============================================================ */
  (function () {
    var toggleBtns = $$(".pr-toggle__btn");
    var priceEls = $$(".plan__price");
    toggleBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        toggleBtns.forEach(function (x) { x.classList.toggle("is-active", x === b); });
        var cycle = b.dataset.cycle;
        priceEls.forEach(function (el) {
          var val = cycle === "anual" ? el.dataset.anual : el.dataset.mensal;
          if (val) {
            el.style.opacity = "0";
            setTimeout(function () { el.textContent = val; el.style.opacity = ""; }, 120);
          }
        });
      });
    });
  })();

  /* ============================================================
     CENTRAL DE PLANEJAMENTO
     ============================================================ */
  var CUB = {
    sp: { popular: 2600, medio: 3200, alto: 3900 },
    rj: { popular: 2500, medio: 3100, alto: 3800 },
    mg: { popular: 2400, medio: 3000, alto: 3700 },
    pr: { popular: 2450, medio: 3050, alto: 3750 },
    sc: { popular: 2500, medio: 3100, alto: 3800 },
    rs: { popular: 2400, medio: 3000, alto: 3700 },
    ba: { popular: 2200, medio: 2800, alto: 3500 },
    pe: { popular: 2250, medio: 2850, alto: 3550 },
    ce: { popular: 2150, medio: 2750, alto: 3450 },
    df: { popular: 2700, medio: 3300, alto: 4000 }
  };
  var TIPO_FATOR = { nova: 1, reforma: 0.62, ampliacao: 0.85 };

  var inputs = {
    state: $("#plState"),
    padrao: $("#plPadrao"),
    tipo: $("#plTipo"),
    area: $("#plArea"),
    pav: $("#plPav"),
    quartos: $("#plQuartos")
  };
  if (!inputs.state) return;

  function updateAll() {
    var s = inputs.state.value;
    var p = inputs.padrao.value;
    var t = inputs.tipo.value;
    var area = parseFloat(inputs.area.value) || 180;
    var pav = parseInt(inputs.pav.value, 10) || 1;
    var quartos = parseInt(inputs.quartos.value, 10) || 3;

    var baseCUB = CUB[s][p];
    var fator = TIPO_FATOR[t] || 1;
    var baseEfetivo = Math.round(baseCUB * fator);

    updateCusto(area, baseEfetivo, baseCUB);
    updateCronograma(area, t);
    updateMateriais(area, pav, quartos);
    updateMao(area, t);
    updateEnergia(area);
    updateFinanciamento(area, baseEfetivo);
    updateSustentabilidade(area, p, t);
  }

  /* ---------- CUSTO ---------- */
  function updateCusto(area, baseEfetivo, baseCUB) {
    var low = Math.round(baseEfetivo * 0.92 * area);
    var high = Math.round(baseEfetivo * 1.18 * area);
    var total = baseEfetivo * area;

    var el = $("#plTotal"); if (el) el.textContent = fmt(low) + " – " + fmt(high);
    el = $("#plPerM2"); if (el) el.textContent = fmt(baseEfetivo);
    el = $("#plBase"); if (el) el.textContent = fmt(baseCUB);

    var etapas = [
      { nome: "Projetos e aprovações", pct: 6 },
      { nome: "Fundação", pct: 14 },
      { nome: "Estrutura", pct: 20 },
      { nome: "Vedações", pct: 11 },
      { nome: "Cobertura", pct: 8 },
      { nome: "Instalações", pct: 16 },
      { nome: "Acabamentos", pct: 25 }
    ];
    var barsEl = $("#plCustoBars");
    if (barsEl) {
      barsEl.innerHTML = etapas.map(function (e) {
        var valor = Math.round(total * (e.pct / 100));
        return '<div class="pl-bar">' +
          '<span class="pl-bar__name">' + e.nome + '</span>' +
          '<div class="pl-bar__track"><div class="pl-bar__fill" style="width:' + (e.pct * 3) + '%"></div></div>' +
          '<span class="pl-bar__val">' + fmt(valor) + '</span>' +
          '</div>';
      }).join("");
    }
  }

  /* ---------- CRONOGRAMA ---------- */
  function updateCronograma(area, tipo) {
    var fator = tipo === "reforma" ? 0.55 : (tipo === "ampliacao" ? 0.75 : 1);
    var baseMeses = Math.max(6, Math.round(area / 20)) * fator;
    var totalMeses = Math.round(baseMeses);

    var etapas = [
      { nome: "Projetos e aprovações", icon: "📐", pct: 0.20 },
      { nome: "Fundação", icon: "⛏", pct: 0.12 },
      { nome: "Estrutura", icon: "🏗", pct: 0.18 },
      { nome: "Vedações e cobertura", icon: "🧱", pct: 0.15 },
      { nome: "Instalações", icon: "⚡", pct: 0.15 },
      { nome: "Acabamentos", icon: "🎨", pct: 0.20 }
    ];

    var gantt = $("#plGantt");
    if (gantt) {
      var cursor = 0;
      gantt.innerHTML = etapas.map(function (e) {
        var dur = Math.max(1, Math.round(baseMeses * e.pct));
        var leftPct = (cursor / totalMeses) * 100;
        var widthPct = (dur / totalMeses) * 100;
        cursor += dur;
        return '<div class="pl-gantt-row">' +
          '<span class="pl-gantt-row__name"><em>' + e.icon + '</em>' + e.nome + '</span>' +
          '<div class="pl-gantt-row__track">' +
            '<div class="pl-gantt-row__bar" style="left:' + leftPct + '%;width:' + widthPct + '%">' + dur + 'm</div>' +
          '</div>' +
          '<span class="pl-gantt-row__dur">' + dur + ' meses</span>' +
          '</div>';
      }).join("");
    }

    var el = $("#plCronoTotal"); if (el) el.textContent = totalMeses + " meses";
    el = $("#plCronoEnd");
    if (el) {
      var end = new Date();
      end.setMonth(end.getMonth() + totalMeses);
      el.textContent = end.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    }
  }

  /* ---------- MATERIAIS ---------- */
  function updateMateriais(area, pav, quartos) {
    var dados = [
      { icon: "🪨", name: "Concreto", val: (area * 0.35).toFixed(1), unit: "m³" },
      { icon: "🔩", name: "Aço CA-50", val: (area * 0.008).toFixed(2), unit: "ton" },
      { icon: "🧱", name: "Tijolos", val: Math.round(area * 25).toLocaleString("pt-BR"), unit: "un" },
      { icon: "🏠", name: "Telhas", val: Math.round(area * 1.15), unit: "m² cobertura" },
      { icon: "🪵", name: "Porcelanato", val: Math.round(area * 0.75), unit: "m² piso" },
      { icon: "🎨", name: "Tinta acrílica", val: Math.round(area * 2.5), unit: "litros" },
      { icon: "🚪", name: "Portas internas", val: quartos + Math.max(2, Math.round(area / 80)), unit: "un" },
      { icon: "🪟", name: "Janelas", val: quartos + Math.max(1, Math.round(area / 120)), unit: "un" },
      { icon: "💡", name: "Pontos elétricos", val: Math.round(area * 0.22), unit: "pontos" }
    ];
    var grid = $("#plMateriais");
    if (grid) {
      grid.innerHTML = dados.map(function (m) {
        return '<div class="pl-mat">' +
          '<span class="pl-mat__icon">' + m.icon + '</span>' +
          '<span class="pl-mat__name">' + m.name + '</span>' +
          '<strong class="pl-mat__val">' + m.val + '</strong>' +
          '<span class="pl-mat__unit">' + m.unit + '</span>' +
          '</div>';
      }).join("");
    }
  }

  /* ---------- MÃO DE OBRA ---------- */
  function updateMao(area, tipo) {
    var fatorTipo = tipo === "reforma" ? 0.55 : (tipo === "ampliacao" ? 0.75 : 1);
    var mesesBase = Math.max(6, Math.round(area / 20)) * fatorTipo;

    var funcoes = [
      { icon: "👷", name: "Encarregado", mensal: 6500, qtd: 1, meses: mesesBase },
      { icon: "🧱", name: "Pedreiros", mensal: 3800, qtd: 3, meses: mesesBase * 0.9 },
      { icon: "🪣", name: "Serventes", mensal: 2400, qtd: 4, meses: mesesBase },
      { icon: "⚡", name: "Eletricista", mensal: 4200, qtd: 1, meses: mesesBase * 0.35 },
      { icon: "🚰", name: "Encanador", mensal: 4000, qtd: 1, meses: mesesBase * 0.30 },
      { icon: "🎨", name: "Pintor", mensal: 3500, qtd: 2, meses: mesesBase * 0.25 },
      { icon: "🪚", name: "Carpinteiro", mensal: 3800, qtd: 1, meses: mesesBase * 0.5 },
      { icon: "💎", name: "Azulejista", mensal: 4200, qtd: 2, meses: mesesBase * 0.35 }
    ];

    var total = 0;
    var list = $("#plMaoList");
    if (list) {
      list.innerHTML = funcoes.map(function (f) {
        var sub = Math.round(f.mensal * f.qtd * f.meses);
        total += sub;
        return '<div class="pl-mao-item">' +
          '<span class="pl-mao-item__avatar">' + f.icon + '</span>' +
          '<div class="pl-mao-item__info">' +
            '<strong>' + f.name + (f.qtd > 1 ? " · " + f.qtd + " prof." : "") + '</strong>' +
            '<small>' + Math.round(f.meses) + ' meses · ' + fmt(f.mensal) + '/mês</small>' +
          '</div>' +
          '<span class="pl-mao-item__val">' + fmt(sub) + '</span>' +
          '</div>';
      }).join("");
    }
    var el = $("#plMaoTotal"); if (el) el.textContent = fmt(total);
  }

  /* ---------- ENERGIA ---------- */
  function updateEnergia(area) {
    var consumoAnual = Math.round(area * 35);
    var tarifa = 0.85;
    var custoAnual = consumoAnual * tarifa;
    var geracao = consumoAnual * 0.30;
    var economia = geracao * tarifa;
    var paineis = Math.ceil(geracao / 480);
    var investimento = paineis * 2500;
    var payback = Math.max(1, Math.round(investimento / Math.max(1, economia)));

    var el = $("#plEnConsumo"); if (el) el.textContent = consumoAnual.toLocaleString("pt-BR") + " kWh";
    el = $("#plEnEconomia"); if (el) el.textContent = fmt(economia);
    el = $("#plEnPaineis"); if (el) el.textContent = paineis + " placas";
    el = $("#plEnPayback"); if (el) el.textContent = payback + " anos";

    var chart = $("#plEnChart");
    if (!chart) return;
    var anos = [1, 2, 3, 5, 10, 15, 20, 25];
    var maxVal = custoAnual * 25;
    chart.innerHTML = '<h4>Economia acumulada em 25 anos</h4><div class="pl-en__bars">' +
      anos.map(function (a) {
        var poupanca = economia * a;
        var hPct = Math.max(4, (poupanca / maxVal) * 100);
        return '<div class="pl-en__bar-wrap">' +
          '<span class="pl-en__bar-val">' + Math.round(poupanca / 1000) + 'k</span>' +
          '<div class="pl-en__bar" style="height:' + hPct + '%"></div>' +
          '<span class="pl-en__bar-label">' + a + 'a</span>' +
          '</div>';
      }).join("") + '</div>';
  }

  /* ---------- FINANCIAMENTO ---------- */
  function updateFinanciamento(area, baseEfetivo) {
    var valor = baseEfetivo * area;
    var entradaEl = $("#plFinEntrada");
    var prazoEl = $("#plFinPrazo");
    var taxaEl = $("#plFinTaxa");
    if (!entradaEl) return;

    var entradaPct = parseInt(entradaEl.value, 10);
    var prazoAnos = parseInt(prazoEl.value, 10);
    var taxaAnual = parseFloat(taxaEl.value);

    var entradaLabel = $("#plFinEntradaVal");
    var prazoLabel = $("#plFinPrazoVal");
    var taxaLabel = $("#plFinTaxaVal");
    if (entradaLabel) entradaLabel.textContent = entradaPct + "%";
    if (prazoLabel) prazoLabel.textContent = prazoAnos + " anos";
    if (taxaLabel) taxaLabel.textContent = taxaAnual + "% a.a.";

    var entrada = valor * (entradaPct / 100);
    var financiado = valor - entrada;
    var n = prazoAnos * 12;
    var i = taxaAnual / 100 / 12;
    var amortizacao = financiado / n;
    var primeira = amortizacao + financiado * i;
    var ultima = amortizacao + amortizacao * i;
    var media = (primeira + ultima) / 2;
    var jurosTotais = ((financiado + amortizacao) * n / 2) * i;
    var totalPago = financiado + jurosTotais;

    var prestEl = $("#plFinPrestacao"); if (prestEl) prestEl.textContent = fmt(media) + "/mês";
    var valorEl = $("#plFinValor"); if (valorEl) valorEl.textContent = fmt(financiado);
    var totalEl = $("#plFinTotal"); if (totalEl) totalEl.textContent = fmt(totalPago);
    var jurosEl = $("#plFinJuros"); if (jurosEl) jurosEl.textContent = fmt(jurosTotais);
  }

  /* ---------- SUSTENTABILIDADE ---------- */
  function updateSustentabilidade(area, padrao, tipo) {
    var scores = {
      popular: { energia: 62, agua: 55, materiais: 70, mobilidade: 60, residuos: 55 },
      medio: { energia: 70, agua: 65, materiais: 65, mobilidade: 68, residuos: 62 },
      alto: { energia: 75, agua: 70, materiais: 60, mobilidade: 72, residuos: 68 }
    };
    var base = scores[padrao] || scores.medio;
    if (tipo === "reforma") base = { energia: 78, agua: 72, materiais: 82, mobilidade: 68, residuos: 80 };

    var media = Math.round((base.energia + base.agua + base.materiais + base.mobilidade + base.residuos) / 5);

    var ring = $("#plScoreRing");
    if (ring) {
      var circ = 2 * Math.PI * 55;
      var offset = circ - (media / 100) * circ;
      ring.innerHTML =
        '<svg viewBox="0 0 130 130">' +
          '<circle class="track" cx="65" cy="65" r="55"></circle>' +
          '<circle class="fill" cx="65" cy="65" r="55" stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '"></circle>' +
        '</svg>' +
        '<strong>' + media + '</strong><span>/100</span>';
    }
    var label = $("#plScoreLabel");
    if (label) {
      label.textContent = media >= 75 ? "Excelente performance" :
                          media >= 65 ? "Boa performance" :
                          media >= 55 ? "Performance razoável" : "Há espaço para melhorar";
    }

    var items = [
      { icon: "⚡", name: "Energia", desc: "Orientação solar, ventilação cruzada", score: base.energia },
      { icon: "💧", name: "Água", desc: "Reuso de cinzas, captação pluvial", score: base.agua },
      { icon: "🌳", name: "Materiais", desc: "Madeira certificada, materiais locais", score: base.materiais },
      { icon: "🚲", name: "Mobilidade", desc: "Bicicletário, transporte próximo", score: base.mobilidade },
      { icon: "♻️", name: "Resíduos", desc: "Gestão de obra, separação, reciclagem", score: base.residuos }
    ];

    var list = $("#plSustList");
    if (list) {
      list.innerHTML = items.map(function (it) {
        var cls = it.score >= 75 ? "a" : (it.score >= 60 ? "b" : "c");
        var txt = it.score >= 75 ? "Ótimo" : (it.score >= 60 ? "Bom" : "Melhorar");
        return '<div class="pl-sust-item">' +
          '<span class="pl-sust-item__icon">' + it.icon + '</span>' +
          '<div class="pl-sust-item__info"><strong>' + it.name + '</strong><small>' + it.desc + '</small></div>' +
          '<span class="pl-sust-item__badge pl-sust-item__badge--' + cls + '">' + txt + '</span>' +
          '</div>';
      }).join("");
    }
  }

  /* ---------- TABS ---------- */
  $$(".pl-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.dataset.tab;
      $$(".pl-tab").forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      $$(".pl-panel").forEach(function (p) {
        p.classList.toggle("is-active", p.dataset.panel === target);
      });
    });
  });

  /* ---------- LISTENERS ---------- */
  Object.keys(inputs).forEach(function (k) {
    if (inputs[k]) {
      inputs[k].addEventListener("input", updateAll);
      inputs[k].addEventListener("change", updateAll);
    }
  });
  ["plFinEntrada", "plFinPrazo", "plFinTaxa"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", updateAll);
  });

  /* ============================================================
     TOKEN SPEND ANIMATION
     ============================================================ */
  function showTokenSpend(el) {
    var rect = el.getBoundingClientRect();
    var anim = document.createElement("div");
    anim.className = "token-spend";
    anim.textContent = "-1 ◆";
    anim.style.left = (rect.left + rect.width / 2) + "px";
    anim.style.top = (rect.top + 6) + "px";
    document.body.appendChild(anim);
    setTimeout(function () { anim.remove(); }, 1400);
  }

  function openUpgradeModal() {
    var modal = document.getElementById("upgradeModal");
    if (modal) {
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
  }

  /* ---------- PDF COM VERIFICAÇÃO DE TOKEN ---------- */
  var pdfBtn = $("#plPdfBtn");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", async function () {
      var mod = await import("../firebase/tokens.js");
      if (!mod.canUse()) {
        openUpgradeModal();
        return;
      }

      var result = mod.useToken(1);
      if (!result.success) {
        alert("Sem tokens disponíveis. Faça upgrade para continuar.");
        openUpgradeModal();
        return;
      }

      showTokenSpend(pdfBtn);

      var s = inputs.state.value;
      var p = inputs.padrao.value;
      var t = inputs.tipo.value;
      var area = parseFloat(inputs.area.value) || 180;
      var baseCUB = CUB[s][p];
      var baseEfetivo = Math.round(baseCUB * (TIPO_FATOR[t] || 1));

      var win = window.open("", "_blank");
      if (!win) {
        alert("Permita popups para baixar o relatório.");
        return;
      }

      var logoUrl = new URL("../img/logo.png", window.location.href).href;
      var hoje = new Date().toLocaleDateString("pt-BR");

      win.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Relatório · VITRUVIANO</title>');
      win.document.write('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono&family=Manrope:wght@400;600;700;800&display=swap">');
      win.document.write('<style>' +
        '@page{margin:14mm 12mm;}' +
        'body{font-family:Manrope,Arial,sans-serif;color:#3d2f24;margin:0;line-height:1.5;font-size:11pt;}' +
        '.h{display:flex;align-items:center;gap:12px;padding-bottom:6mm;border-bottom:2px solid #3d2f24;margin-bottom:8mm;}' +
        '.h img{width:18mm;height:18mm;}' +
        '.h h1{font-size:20pt;margin:0;letter-spacing:-0.02em;}' +
        '.h small{font-size:9pt;color:#8f6b42;text-transform:uppercase;letter-spacing:2px;}' +
        'h2{font-size:13pt;margin:8mm 0 3mm;border-bottom:1px solid #c9a574;padding-bottom:2mm;}' +
        '.grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm;}' +
        '.card{padding:4mm;background:#fbf5d9;border-radius:2mm;border-left:3px solid #c9a574;}' +
        '.card span{font-size:8pt;text-transform:uppercase;letter-spacing:1px;color:#8f6b42;}' +
        '.card strong{display:block;font-size:14pt;margin-top:1mm;}' +
        '.foot{margin-top:10mm;padding-top:3mm;border-top:1px solid #ebe1cf;text-align:center;font-size:8pt;color:#8f6b42;text-transform:uppercase;letter-spacing:2px;}' +
        '</style></head><body>');
      win.document.write('<div class="h"><img src="' + logoUrl + '"><div><h1>Relatório de Planejamento</h1><small>VITRUVIANO · ' + hoje + '</small></div></div>');
      win.document.write('<h2>Dados do projeto</h2><div class="grid">');
      win.document.write('<div class="card"><span>Área</span><strong>' + area + ' m²</strong></div>');
      win.document.write('<div class="card"><span>Padrão</span><strong>' + p + '</strong></div>');
      win.document.write('<div class="card"><span>Tipologia</span><strong>' + t + '</strong></div>');
      win.document.write('<div class="card"><span>Estado</span><strong>' + s.toUpperCase() + '</strong></div>');
      win.document.write('</div>');
      var low = Math.round(baseEfetivo * 0.92 * area);
      var high = Math.round(baseEfetivo * 1.18 * area);
      win.document.write('<h2>Estimativa de custo</h2>');
      win.document.write('<p>Faixa estimada: <strong>' + fmt(low) + ' – ' + fmt(high) + '</strong> (por m²: ' + fmt(baseEfetivo) + ')</p>');
      win.document.write('<h2>Cronograma</h2>');
      var meses = Math.round(Math.max(6, Math.round(area / 20)));
      win.document.write('<p>Prazo total estimado: <strong>' + meses + ' meses</strong></p>');
      win.document.write('<div class="foot">Documento gerado por VITRUVIANO · vitruviano.com</div>');
      win.document.write('<script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script>');
      win.document.write('</body></html>');
      win.document.close();
    });
  }

  /* ---------- IR PARA MEMORIAL COM TOKEN ---------- */
  var goMemorialBtn = document.getElementById("plGoMemorial");
  if (goMemorialBtn) {
    goMemorialBtn.addEventListener("click", async function (e) {
      e.preventDefault();

      var mod = await import("../firebase/tokens.js");
      if (!mod.canUse()) {
        openUpgradeModal();
        return;
      }

      var result = mod.useToken(1);
      if (!result.success) {
        alert("Sem tokens disponíveis. Faça upgrade para continuar.");
        openUpgradeModal();
        return;
      }

      showTokenSpend(goMemorialBtn);

      var s = inputs.state.value;
      var p = inputs.padrao.value;
      var t = inputs.tipo.value;
      var area = parseFloat(inputs.area.value) || 180;
      var pav = parseInt(inputs.pav.value, 10) || 1;
      var quartos = parseInt(inputs.quartos.value, 10) || 3;

      var cidades = {
        sp: "São Paulo", rj: "Rio de Janeiro", mg: "Belo Horizonte",
        pr: "Curitiba", sc: "Florianópolis", rs: "Porto Alegre",
        ba: "Salvador", pe: "Recife", ce: "Fortaleza", df: "Brasília"
      };
      var tipoMemorial = { nova: "residencial", reforma: "reforma", ampliacao: "residencial" };
      var padraoMemorial = { popular: "popular", medio: "medio", alto: "alto" };

      var ctx = {
        area: area,
        city: cidades[s] || "São Paulo",
        tipo: tipoMemorial[t] || "residencial",
        padrao: padraoMemorial[p] || "medio",
        pav: pav,
        quartos: quartos,
        origem: "premium",
        updatedAt: Date.now()
      };

      try {
        localStorage.setItem("vitruviano:ctx", JSON.stringify(ctx));
      } catch (err) {}

      goMemorialBtn.style.pointerEvents = "none";
      var original = goMemorialBtn.textContent;
      goMemorialBtn.textContent = "✓ Abrindo memorial...";

      setTimeout(function () {
        window.location.href = "../ia/index.html";
      }, 350);
    });
  }

  /* ---------- FAQ: fecha outros ao abrir ---------- */
  var faqItems = $$(".faq__item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  /* ---------- INIT ---------- */
  updateAll();
})();