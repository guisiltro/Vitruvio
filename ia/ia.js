/* ============================================================
   VITRUVIANO · Memorial IA
   ============================================================ */
(function () {
  "use strict";

  var LOG = function () { console.log.apply(console, ["[VITRUVIANO]"].concat([].slice.call(arguments))); };
  var ERR = function () { console.error.apply(console, ["[VITRUVIANO]"].concat([].slice.call(arguments))); };
  LOG("Script iniciado");

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };

  /* ============================================================
     TOAST
     ============================================================ */
  function toast(msg, type) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.className = "mem-toast is-show" + (type ? " is-" + type : "");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.className = "mem-toast"; }, 3200);
  }

  /* ============================================================
     TEMA
     ============================================================ */
  (function () {
    var TKEY = "vitruviano:theme";
    var root = document.documentElement;
    var theme;
    try { theme = localStorage.getItem(TKEY); } catch (e) {}
    if (!theme) theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    var btn = $(".theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem(TKEY, next); } catch (e) {}
      });
    }
  })();

  /* ============================================================
     MENU
     ============================================================ */
  (function () {
    var menuBtn = $(".menu-toggle");
    var nav = $(".site-nav");
    if (menuBtn && nav) {
      menuBtn.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        menuBtn.setAttribute("aria-expanded", String(open));
      });
    }
  })();

  /* ============================================================
     ESTADO
     ============================================================ */
  var state = {
    nome: "", cliente: "", local: "",
    area: null, pav: 1,
    tipo: "residencial", padrao: "medio",
    secoes: [], obs: ""
  };

  /* ============================================================
     INPUTS
     ============================================================ */
  (function () {
    var map = {
      "f-nome": "nome", "f-cliente": "cliente", "f-local": "local",
      "f-area": "area", "f-pav": "pav", "f-obs": "obs"
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var key = map[id];
      el.addEventListener("input", function () {
        if (el.type === "number") state[key] = parseFloat(el.value) || null;
        else state[key] = el.value.trim();
        updateProgress();
      });
    });
  })();

  /* ============================================================
     CHIPS
     ============================================================ */
  function bindChips(id, key) {
    var c = document.getElementById(id);
    if (!c) return;
    $$("button", c).forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$("button", c).forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-checked", String(b === btn));
        });
        state[key] = btn.dataset.value;
        updateProgress();
      });
    });
  }
  bindChips("f-tipo", "tipo");
  bindChips("f-padrao", "padrao");

  /* ============================================================
     CHECKBOXES
     ============================================================ */
  var secContainer = document.getElementById("f-secoes");
  function syncSecoes() {
    if (!secContainer) return;
    state.secoes = $$("input[type=checkbox]:checked", secContainer).map(function (i) { return i.value; });
    updateProgress();
  }
  if (secContainer) {
    $$("input[type=checkbox]", secContainer).forEach(function (i) {
      i.addEventListener("change", syncSecoes);
    });
    syncSecoes();
  }
  $$("[data-toggle-sections]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.dataset.toggleSections;
      $$("input[type=checkbox]", secContainer).forEach(function (i) { i.checked = mode === "all"; });
      syncSecoes();
    });
  });

  /* ============================================================
     PROGRESSO
     ============================================================ */
  var progressBar = document.getElementById("progressBar");
  var progressText = document.getElementById("progressText");
  var generateBtn = document.getElementById("generateBtn");
  var imagemBtn = document.getElementById("imagemBtn");

  function requiredCount() {
    var n = 0;
    if (state.nome) n++;
    if (state.cliente) n++;
    if (state.local) n++;
    if (state.area) n++;
    return n;
  }

  function updateProgress() {
    var filled = requiredCount();
    if (progressBar) progressBar.style.width = (filled / 4) * 100 + "%";
    if (progressText) progressText.textContent = filled + " de 4 campos essenciais · " + state.secoes.length + " seções";
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.removeAttribute("disabled");
    }
    if (imagemBtn) {
      imagemBtn.disabled = !state.area || !state.local;
    }
  }

  /* ============================================================
     VOZ — mic por campo
     ============================================================ */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var voiceSupported = !!SR;
  LOG("SpeechRecognition disponível?", voiceSupported);

  function startFieldVoice(targetEl, buttonEl) {
    if (!voiceSupported) { toast("Voz indisponível. Use Chrome ou Edge.", "error"); return; }
    var rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = false;
    rec.interimResults = true;
    var base = targetEl.value ? targetEl.value + " " : "";

    rec.onstart = function () { buttonEl.classList.add("is-listening"); };
    rec.onresult = function (e) {
      var interim = "", final = "";
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      targetEl.value = (base + final + interim).trim();
      targetEl.dispatchEvent(new Event("input", { bubbles: true }));
      if (final) base += final;
    };
    rec.onerror = function (e) {
      if (e.error === "not-allowed") toast("Permita o microfone.", "error");
    };
    rec.onend = function () { buttonEl.classList.remove("is-listening"); };
    try { rec.start(); } catch (e) {}
  }

  $$("[data-voice-for]").forEach(function (mic) {
    mic.addEventListener("click", function () {
      var target = document.getElementById(mic.dataset.voiceFor);
      if (target) startFieldVoice(target, mic);
    });
  });

  /* ---------- Botão ditar observações ---------- */
  (function () {
    var voiceBtn = document.getElementById("voiceBtn");
    var voiceStatus = document.getElementById("voiceStatus");
    if (!voiceBtn) return;
    voiceBtn.addEventListener("click", function () {
      var ta = document.getElementById("f-obs");
      if (!ta || !voiceSupported) { toast("Voz indisponível.", "error"); return; }
      var rec = new SR();
      rec.lang = "pt-BR";
      rec.continuous = true;
      rec.interimResults = true;
      var base = ta.value ? ta.value + " " : "";

      rec.onstart = function () {
        voiceBtn.classList.add("is-listening");
        if (voiceStatus) { voiceStatus.textContent = "🎙 Ouvindo..."; voiceStatus.className = "voice-status is-listening"; }
      };
      rec.onresult = function (e) {
        var interim = "", final = "";
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t + " ";
          else interim += t;
        }
        ta.value = (base + final + interim).trim();
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        if (final) base += final;
      };
      rec.onend = function () {
        voiceBtn.classList.remove("is-listening");
        if (voiceStatus) {
          voiceStatus.textContent = "✓ Ditado finalizado";
          voiceStatus.className = "voice-status is-success";
          setTimeout(function () { voiceStatus.textContent = ""; voiceStatus.className = "voice-status"; }, 2200);
        }
      };
      rec.onerror = function () { voiceBtn.classList.remove("is-listening"); };
      try { rec.start(); } catch (e) {}
    });
  })();

  /* ============================================================
     COMANDO DE VOZ PRINCIPAL
     ============================================================ */
  (function () {
    var cmdBtn = document.getElementById("voiceCommandBtn");
    var cmdTitle = document.getElementById("voiceCommandTitle");
    var cmdHint = document.getElementById("voiceCommandHint");
    var cmdLive = document.getElementById("voiceCommandLive");
    var viz = document.getElementById("voiceVisualizer");

    if (!cmdBtn) return;

    if (!voiceSupported) {
      cmdBtn.addEventListener("click", function () {
        if (cmdLive) cmdLive.textContent = "Navegador sem suporte. Use Chrome ou Edge.";
        toast("Use Chrome ou Edge para voz", "error");
      });
      cmdBtn.style.opacity = "0.6";
      return;
    }

    var rec = null;
    var wantOn = false;
    var isRunning = false;
    var audioCtx = null;
    var analyser = null;
    var micStream = null;
    var rafId = null;

    function startViz() {
      if (!viz) return;
      var ctx = viz.getContext("2d");
      (function loop() {
        if (!analyser) return;
        var data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        var w = viz.width = viz.offsetWidth * 2;
        var h = viz.height = viz.offsetHeight * 2;
        ctx.clearRect(0, 0, w, h);
        var bars = 48, gap = 3;
        var bw = (w - gap * (bars - 1)) / bars;
        for (var i = 0; i < bars; i++) {
          var lvl = (data[i * 2] || 0) / 255;
          var bh = Math.max(6, lvl * h * 0.92);
          ctx.fillStyle = lvl > 0.05
            ? "rgba(201,165,116," + (0.5 + lvl * 0.5) + ")"
            : "rgba(201,165,116,0.18)";
          ctx.fillRect(i * (bw + gap), (h - bh) / 2, bw, bh);
        }
        rafId = requestAnimationFrame(loop);
      })();
    }

    function stopViz() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (micStream) { micStream.getTracks().forEach(function (t) { t.stop(); }); micStream = null; }
      if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
      analyser = null;
      if (viz) { var c = viz.getContext("2d"); c.clearRect(0, 0, viz.width, viz.height); }
    }

    function openMic() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve();
      return navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
          micStream = stream;
          var Ctx = window.AudioContext || window.webkitAudioContext;
          audioCtx = new Ctx();
          var src = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          src.connect(analyser);
          startViz();
        })
        .catch(function (e) { LOG("Visualizador falhou:", e.message); });
    }

    function setOnUI(on) {
      cmdBtn.classList.toggle("is-listening", on);
      if (cmdTitle) cmdTitle.textContent = on ? "Ouvindo..." : "Comando de voz";
      if (cmdHint) cmdHint.textContent = on
        ? "Fale agora. Clique de novo para parar."
        : 'Diga: "nome Casa Vale", "área 180", "gerar memorial"';
    }

    function shutdown() {
      wantOn = false;
      isRunning = false;
      if (rec) { try { rec.abort(); } catch (e) {} rec = null; }
      stopViz();
      setOnUI(false);
    }

    function startOneSession() {
      if (!wantOn || isRunning) return;
      isRunning = true;

      rec = new SR();
      rec.lang = "pt-BR";
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      var got = false;

      rec.onstart = function () {
        if (cmdLive) cmdLive.innerHTML = '<strong style="color:var(--caramel-deep)">🎙 Pode falar.</strong>';
      };

      rec.onresult = function (e) {
        var interim = "", final = "";
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t;
          else interim += t;
        }
        if (interim && cmdLive) cmdLive.innerHTML = '<strong style="color:var(--caramel-deep)">🎙 Ouvindo:</strong> ' + interim;
        if (final) {
          got = true;
          if (cmdLive) cmdLive.innerHTML = '<strong style="color:#4d804d">🎙 Ouvido:</strong> "' + final.trim() + '"';
          handleCommand(final.trim());
        }
      };

      rec.onerror = function (e) {
        if (e.error === "no-speech" || e.error === "aborted") return;
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          if (cmdLive) cmdLive.textContent = "Permissão negada. Permita o microfone.";
          toast("Permita o microfone", "error");
          shutdown();
          return;
        }
        if (e.error === "network") {
          if (cmdLive) cmdLive.textContent = "Erro de rede.";
          toast("Erro de rede na voz", "error");
          shutdown();
          return;
        }
      };

      rec.onend = function () {
        isRunning = false;
        if (wantOn) {
          var delay = got ? 500 : 250;
          setTimeout(function () {
            if (wantOn && !isRunning) startOneSession();
          }, delay);
        } else {
          setOnUI(false);
        }
      };

      try { rec.start(); }
      catch (e) {
        isRunning = false;
        if (wantOn) setTimeout(startOneSession, 700);
      }
    }

    cmdBtn.addEventListener("click", function () {
      if (wantOn) {
        shutdown();
        if (cmdLive) cmdLive.textContent = "Parado.";
        return;
      }
      wantOn = true;
      setOnUI(true);
      toast("🎙 Pode falar!", "success");
      if (cmdLive) cmdLive.innerHTML = "🎙 Iniciando...";
      openMic().then(function () {
        if (wantOn) startOneSession();
      });
    });

    function handleCommand(text) {
      var clean = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (/(gerar|gera|fazer|faz|cria|criar)\s+memorial/.test(clean) || /^gerar$/.test(clean)) {
        if (cmdLive) cmdLive.textContent = "▶ Gerando memorial...";
        setTimeout(gerarMemorial, 250);
        shutdown();
        return;
      }
      if (/\bpdf\b/.test(clean)) {
        if (cmdLive) cmdLive.textContent = "▶ Abrindo PDF...";
        setTimeout(baixarPDF, 250);
        shutdown();
        return;
      }
      if (/(limpar|resetar)/.test(clean)) {
        if (confirm("Limpar tudo?")) location.reload();
        return;
      }

      var patterns = [
        { re: /(?:nome|projeto|nome do projeto)\s*(?:e|:)?\s*(.+)/, field: "f-nome", label: "Nome" },
        { re: /(?:cliente|proprietario)\s*(?:e|:)?\s*(.+)/, field: "f-cliente", label: "Cliente" },
        { re: /(?:local|localizacao|cidade|localizado)\s*(?:e|:)?\s*(?:em\s+)?(.+)/, field: "f-local", label: "Local" },
        { re: /(?:area|metros?|m2)\s*(?:e|:)?\s*(\d+)/, field: "f-area", label: "Área" },
        { re: /(?:pavimentos?|andares?|piso)\s*(?:e|:)?\s*(\d+)/, field: "f-pav", label: "Pavimentos" },
        { re: /(?:observacoes?|obs)\s*(?:e|:)?\s*(.+)/, field: "f-obs", label: "Observações" }
      ];

      for (var i = 0; i < patterns.length; i++) {
        var p = patterns[i];
        var m = clean.match(p.re);
        if (m) {
          var el = document.getElementById(p.field);
          if (el) {
            el.value = m[1].trim();
            el.dispatchEvent(new Event("input", { bubbles: true }));
            if (cmdLive) cmdLive.innerHTML = '<strong style="color:#4d804d">✓ ' + p.label + ':</strong> ' + m[1].trim();
            toast(p.label + " preenchido", "success");
            return;
          }
        }
      }
      if (cmdLive) cmdLive.innerHTML = '<strong style="color:#b34040">Não entendi.</strong>';
    }
  })();

  /* ============================================================
     CUB
     ============================================================ */
  var CUB = {
    sp: { popular: 2600, medio: 3200, alto: 3900 },
    rj: { popular: 2500, medio: 3100, alto: 3800 },
    mg: { popular: 2400, medio: 3000, alto: 3700 },
    default: { popular: 2400, medio: 3000, alto: 3700 }
  };
  var fmt = function (n) { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); };
  var detectState = function (local) {
    var t = (local || "").toLowerCase();
    if (/sp|sao paulo|são paulo|campinas|jordao|jordão|mantiqueira/.test(t)) return "sp";
    if (/rj|rio de janeiro/.test(t)) return "rj";
    if (/mg|minas|belo horizonte/.test(t)) return "mg";
    return "default";
  };

  /* ============================================================
     SEÇÕES TÉCNICAS
     ============================================================ */
  var SECOES = {
    preliminares: { title: "Serviços Preliminares", items: [
      "Limpeza e remoção de vegetação rasteira e entulhos existentes no terreno.",
      "Locação da obra com gabarito de madeira conforme projeto executivo aprovado.",
      "Instalação de canteiro de obras provisório conforme NR-18.",
      "Execução de tapumes e sinalização de segurança.",
      "Providências junto às concessionárias para ligações provisórias."
    ]},
    infra: { title: "Infraestrutura", items: [
      "Escavação manual ou mecanizada para sapatas e blocos.",
      "Sapatas em concreto armado fck ≥ 25 MPa, armadura em aço CA-50.",
      "Vigas baldrame impermeabilizadas com manta asfáltica ou argamassa polimérica.",
      "Aterro e compactação em camadas de 20 cm com controle de umidade.",
      "Contrapiso em concreto simples, espessura mínima de 5 cm."
    ]},
    supra: { title: "Superestrutura", items: [
      "Pilares e vigas em concreto armado fck ≥ 25 MPa.",
      "Lajes maciças ou pré-moldadas conforme cálculo estrutural.",
      "Escadas em concreto armado com guarda-corpos metálicos.",
      "Concreto compatível com NBR 6118.",
      "Controle tecnológico por ensaios de rompimento."
    ]},
    vedacoes: { title: "Vedações", items: [
      "Alvenaria de vedação em bloco cerâmico ou de concreto.",
      "Argamassa de assentamento traço 1:2:8 (cimento, cal e areia média).",
      "Encunhamento com argamassa expansiva no topo das alvenarias.",
      "Vergas e contravergas em concreto armado sobre vãos.",
      "Chapisco, emboço e reboco com argamassa industrializada."
    ]},
    cobertura: { title: "Cobertura", items: [
      "Estrutura de madeira tratada ou metálica dimensionada em projeto.",
      "Telhas cerâmicas, de concreto ou metálicas.",
      "Subcobertura com manta de alumínio para isolamento térmico.",
      "Calhas, rufos e condutores em chapa galvanizada ou alumínio.",
      "Mãos-francesas e telhas de vidro quando especificado."
    ]},
    impermeab: { title: "Impermeabilização", items: [
      "Impermeabilização de baldrames com argamassa polimérica flexível.",
      "Áreas molhadas com manta asfáltica ou membrana líquida.",
      "Reservatórios com argamassa impermeabilizante e aditivos.",
      "Varandas, terraços e coberturas com manta asfáltica.",
      "Teste de estanqueidade após cura da impermeabilização."
    ]},
    esquadrias: { title: "Esquadrias", items: [
      "Portas internas em madeira semissólida com batentes e ferragens.",
      "Porta de entrada em madeira maciça ou alumínio com fechadura de segurança.",
      "Janelas e portas externas em alumínio linha Gold ou Suprema.",
      "Vidros conforme NBR 7199, espessura mínima de 8 mm para temperados.",
      "Guarda-corpos em vidro laminado ou metálico."
    ]},
    revest: { title: "Revestimentos", items: [
      "Pisos internos em porcelanato nas áreas sociais.",
      "Áreas molhadas com porcelanato antiderrapante PEI 4 ou superior.",
      "Revestimento de banheiros em porcelanato até altura de projeto.",
      "Fachada em textura acrílica ou revestimento cerâmico.",
      "Rodapés em poliestireno ou madeira com 10 cm de altura."
    ]},
    pintura: { title: "Pintura", items: [
      "Paredes internas: massa corrida PVA, lixamento e tinta acrílica premium (2 demãos).",
      "Paredes externas: selador, massa acrílica e tinta acrílica resistente a intempéries.",
      "Tetos: massa corrida e tinta acrílica fosca branca.",
      "Superfícies metálicas: fundo antiferrugem e esmalte sintético.",
      "Madeira: stain ou verniz conforme projeto."
    ]},
    loucas: { title: "Louças e Metais", items: [
      "Louças sanitárias em porcelana de primeira linha.",
      "Metais em liga de latão cromado ou aço inoxidável.",
      "Bacias com descarga econômica (caixa acoplada ou fluxo reduzido).",
      "Chuveiros e torneiras com arejadores.",
      "Cubas em aço inox ou louça para cozinha e áreas de serviço."
    ]},
    eletrica: { title: "Instalações Elétricas", items: [
      "Entrada de energia subterrânea ou aérea conforme concessionária.",
      "Quadro de distribuição geral com disjuntores e DR.",
      "Circuitos independentes para iluminação e tomadas.",
      "Tomadas conforme NBR 14136 (padrão brasileiro de 3 pinos).",
      "Aterramento com haste de cobre e malha de terra."
    ]},
    hidraulica: { title: "Instalações Hidráulicas", items: [
      "Água fria em PVC soldável ou PPR embutida nas paredes.",
      "Água quente em CPVC ou PPR com isolamento térmico.",
      "Reservatório para no mínimo 2 dias de consumo.",
      "Esgoto em PVC com caixas de inspeção e gordura.",
      "Ventilação de esgoto com coluna e terminal adequados."
    ]}
  };

  /* ============================================================
     CONSTRUÇÃO DO DOCUMENTO
     ============================================================ */
  function buildDocument() {
    var s = state;
    var today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    var secoes = s.secoes.filter(function (k) { return k !== "custo" && k !== "cronograma"; });
    var html = "";

    html += '<div class="mdoc__page">';
    html += '<header class="mdoc__header"><h1>Memorial Descritivo</h1>';
    html += '<p>' + (s.nome || "Projeto sem título") + ' · Conforme NBR 13531</p></header>';

    html += '<dl class="mdoc__meta">';
    html += '<div><dt>Cliente</dt><dd>' + (s.cliente || "—") + '</dd></div>';
    html += '<div><dt>Localização</dt><dd>' + (s.local || "—") + '</dd></div>';
    html += '<div><dt>Tipologia</dt><dd>' + s.tipo + '</dd></div>';
    html += '<div><dt>Padrão</dt><dd>' + s.padrao + '</dd></div>';
    html += '<div><dt>Área</dt><dd>' + (s.area ? s.area + " m²" : "—") + '</dd></div>';
    html += '<div><dt>Pavimentos</dt><dd>' + (s.pav || "—") + '</dd></div>';
    html += '</dl>';

    html += '<section class="mdoc__section"><h2>Apresentação</h2>';
    html += '<p>O presente memorial descritivo especifica os materiais, técnicas e serviços para a execução do projeto <strong>' + (s.nome || "referido") + '</strong>, localizado em <strong>' + (s.local || "local a definir") + '</strong>, conforme ABNT NBR 13531.</p></section>';

    var n = 1;
    secoes.forEach(function (k) {
      var sec = SECOES[k];
      if (!sec) return;
      html += '<section class="mdoc__section"><h2>' + (n++) + '. ' + sec.title + '</h2><ul>';
      sec.items.forEach(function (it) { html += '<li>' + it + '</li>'; });
      html += '</ul></section>';
    });

    if (s.secoes.indexOf("custo") >= 0 && s.area) {
      var table = CUB[detectState(s.local)] || CUB.default;
      var base = table[s.padrao] || table.medio;
      var low = Math.round(base * 0.92 * s.area);
      var high = Math.round(base * 1.18 * s.area);
      html += '<section class="mdoc__section"><h2>' + (n++) + '. Estimativa de Custo</h2>';
      html += '<p>Base CUB, não inclui terreno, projeto, decoração ou taxas.</p><ul>';
      html += '<li>Faixa total estimada: <strong>' + fmt(low) + ' – ' + fmt(high) + '</strong></li>';
      html += '<li>Valor por m²: <strong>' + fmt(base) + '</strong></li>';
      html += '<li>Margem de confiança: ± 12%</li></ul></section>';
    }

    if (s.secoes.indexOf("cronograma") >= 0) {
      var meses = Math.max(6, Math.round((s.area || 180) / 22));
      html += '<section class="mdoc__section"><h2>' + (n++) + '. Cronograma Estimado</h2>';
      html += '<p>Prazo total estimado: <strong>' + meses + ' meses</strong>.</p><ul>';
      html += '<li>Projetos e aprovações: ' + Math.max(1, Math.round(meses * 0.25)) + ' meses</li>';
      html += '<li>Fundação: ' + Math.max(1, Math.round(meses * 0.15)) + ' meses</li>';
      html += '<li>Estrutura: ' + Math.max(1, Math.round(meses * 0.20)) + ' meses</li>';
      html += '<li>Vedações e cobertura: ' + Math.max(1, Math.round(meses * 0.20)) + ' meses</li>';
      html += '<li>Instalações e acabamentos: ' + Math.max(1, Math.round(meses * 0.25)) + ' meses</li>';
      html += '</ul></section>';
    }

    if (s.obs) {
      html += '<section class="mdoc__section"><h2>' + (n++) + '. Observações Complementares</h2>';
      html += '<p>' + s.obs.replace(/\n/g, "<br>") + '</p></section>';
    }

    html += '<footer class="mdoc__footer"><span>VITRUVIANO · ' + (s.nome || "Projeto") + '</span>';
    html += '<span>Emitido em ' + today + '</span></footer>';
    html += '</div>';
    return html;
  }

    /* ============================================================
     GERAR MEMORIAL — com consumo de token
     ============================================================ */
  var isGenerating = false;

  async function gerarMemorial() {
    if (isGenerating) return;

    var mdoc = document.getElementById("mdoc");
    if (!mdoc) return;

    if (!state.nome && !state.area) {
      toast("Preencha pelo menos nome e área.", "error");
      var el = document.getElementById("f-nome");
      if (el) el.focus();
      return;
    }

    /* ---------- VERIFICA TOKEN ---------- */
    var tokens;
    try {
      tokens = await import("../firebase/tokens.js");
    } catch (err) {
      ERR("Não foi possível carregar módulo de tokens:", err);
      toast("Erro ao validar tokens.", "error");
      return;
    }

    if (!tokens.canUse()) {
      toast("Sem usos disponíveis. Faça upgrade para continuar.", "error");
      setTimeout(function () {
        if (confirm("Você usou todos os usos disponíveis este mês.\n\nDeseja ver os planos para fazer upgrade?")) {
          window.location.href = "../assinar/index.html";
        }
      }, 300);
      return;
    }

    var spend = tokens.useToken(1);
    if (!spend.success) {
      toast("Sem usos disponíveis. Faça upgrade para continuar.", "error");
      setTimeout(function () {
        if (confirm("Você usou todos os usos disponíveis este mês.\n\nDeseja ver os planos para fazer upgrade?")) {
          window.location.href = "../assinar/index.html";
        }
      }, 300);
      return;
    }

    // Feedback visual do gasto
    if (generateBtn) {
      var rect = generateBtn.getBoundingClientRect();
      var anim = document.createElement("div");
      anim.className = "token-spend";
      anim.textContent = spend.unlimited ? "-∞ ◆" : "-1 ◆";
      anim.style.left = (rect.left + rect.width / 2) + "px";
      anim.style.top = rect.top + "px";
      document.body.appendChild(anim);
      setTimeout(function () { anim.remove(); }, 1300);
    }

    /* ---------- GERA O MEMORIAL ---------- */
    var originalHTML = generateBtn ? generateBtn.innerHTML : "";
    isGenerating = true;

    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.style.pointerEvents = "none";
      generateBtn.innerHTML = '<span class="spinner"></span> Gerando...';
    }

    setTimeout(function () {
      try {
        var html = buildDocument();
        mdoc.innerHTML = html;

        ["copyBtn", "docxBtn", "pdfBtn"].forEach(function (id) {
          var b = document.getElementById(id);
          if (b) { b.disabled = false; b.removeAttribute("disabled"); }
        });

        var status = document.getElementById("previewStatus");
        if (status) {
          status.classList.add("is-ready");
          var txt = status.querySelector("span:last-child");
          if (txt) txt.textContent = "Memorial pronto · " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        }

        // Incrementa stats
        try {
          var cur = parseInt(localStorage.getItem("vitruviano:stat:memoriais") || "0", 10);
          localStorage.setItem("vitruviano:stat:memoriais", String(cur + 1));
        } catch (e) {}

        // Mensagem diferente pra unlimited
        var msg = spend.unlimited ? "Memorial gerado ✦ (uso ilimitado)" : "Memorial gerado ✦ (" + spend.remaining + " usos restantes)";
        toast(msg, "success");

        if (window.innerWidth > 1180) {
          mdoc.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (err) {
        ERR("Erro ao gerar:", err);
        toast("Erro ao gerar documento.", "error");
        // Devolve o token se deu erro
        try {
          var data = JSON.parse(localStorage.getItem("vitruviano:tokens") || "{}");
          var uid = window.__currentUser?.uid;
          if (uid && data[uid] && data[uid].used > 0) {
            data[uid].used -= 1;
            localStorage.setItem("vitruviano:tokens", JSON.stringify(data));
            window.dispatchEvent(new CustomEvent("vitruviano:tokens"));
          }
        } catch (e) {}
      } finally {
        isGenerating = false;
        if (generateBtn) {
          generateBtn.disabled = false;
          generateBtn.style.pointerEvents = "auto";
          generateBtn.innerHTML = originalHTML;
        }
      }
    }, 500);
  }
    /* ============================================================
     BOTÃO GERAR MEMORIAL
     ============================================================ */
  if (generateBtn) {
    generateBtn.addEventListener("click", function (e) {
      e.preventDefault();

      LOG("Botão Gerar Memorial clicado");

      if (isGenerating) {
        LOG("Geração já está em andamento");
        return;
      }

      gerarMemorial();
    });

    LOG("Botão Gerar Memorial conectado ✓");
  } else {
    ERR("Botão #generateBtn não encontrado no HTML.");
  }
  /* ============================================================
     PDF
     ============================================================ */
  function baixarPDF() {
    var mdoc = document.getElementById("mdoc");
    if (!mdoc || !mdoc.querySelector(".mdoc__page")) {
      toast("Gere o memorial primeiro.", "error");
      return;
    }

    var logoUrl = new URL("../img/logo.png", window.location.href).href;
    var dataHoje = new Date().toLocaleDateString("pt-BR");

    var iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;left:-10000px;top:0;width:210mm;height:297mm;border:0;";
    document.body.appendChild(iframe);

    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write('<!doctype html><html><head><meta charset="utf-8"><title>Memorial Descritivo · VITRUVIANO</title><style>' +
      '@page { size: A4; margin: 14mm 12mm 18mm 12mm; }' +
      '* { box-sizing: border-box; }' +
      'body { font-family: Manrope, Arial, sans-serif; color: #3d2f24; margin: 0; font-size: 11pt; line-height: 1.55; }' +
      '.pdf-header { display: flex; align-items: center; gap: 14px; padding-bottom: 6mm; border-bottom: 2px solid #3d2f24; margin-bottom: 8mm; }' +
      '.pdf-logo { width: 20mm; height: 20mm; object-fit: contain; }' +
      '.pdf-brand { flex: 1; }' +
      '.pdf-brand strong { font-size: 15pt; font-weight: 800; letter-spacing: 3px; display: block; }' +
      '.pdf-brand span { font-size: 8pt; letter-spacing: 2px; color: #8f6b42; text-transform: uppercase; }' +
      '.pdf-meta { text-align: right; font-size: 8pt; letter-spacing: 1.5px; color: #8f6b42; text-transform: uppercase; }' +
      '.pdf-meta span { display: block; }' +
      '.mdoc__header { text-align: center; padding-bottom: 5mm; border-bottom: 2px solid #3d2f24; margin-bottom: 6mm; }' +
      '.mdoc__header h1 { font-size: 22pt; margin: 0 0 4pt; font-family: Georgia, serif; }' +
      '.mdoc__header p { font-size: 10pt; letter-spacing: 2pt; text-transform: uppercase; color: #8f6b42; margin: 0; }' +
      '.mdoc__meta { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #ebe1cf; margin-bottom: 8mm; }' +
      '.mdoc__meta > div { display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid #ebe1cf; font-size: 10pt; }' +
      '.mdoc__meta dt { font-size: 8pt; letter-spacing: 1pt; text-transform: uppercase; color: #a89687; }' +
      '.mdoc__meta dd { margin: 0; font-weight: 700; }' +
      '.mdoc__section { margin-bottom: 6mm; page-break-inside: avoid; }' +
      '.mdoc__section h2 { font-size: 12pt; margin: 0 0 3mm; padding-bottom: 2mm; border-bottom: 1px solid #c9a574; }' +
      '.mdoc__section p { margin: 0 0 3mm; font-size: 10pt; }' +
      '.mdoc__section ul { margin: 0; padding-left: 6mm; }' +
      '.mdoc__section li { font-size: 10pt; margin-bottom: 1.5mm; line-height: 1.5; }' +
      '.mdoc__footer { margin-top: 10mm; padding-top: 3mm; border-top: 1px solid #ebe1cf; display: flex; justify-content: space-between; font-size: 8pt; color: #8f6b42; text-transform: uppercase; letter-spacing: 1px; }' +
      '.pdf-footer-brand { position: fixed; bottom: 4mm; left: 0; right: 0; text-align: center; font-size: 7.5pt; letter-spacing: 2px; color: #8f6b42; text-transform: uppercase; }' +
      '.pdf-footer-brand img { width: 5mm; height: 5mm; vertical-align: middle; margin-right: 4px; }' +
      '</style></head><body>' +
      '<header class="pdf-header">' +
      '<img class="pdf-logo" src="' + logoUrl + '" alt="VITRUVIANO">' +
      '<div class="pdf-brand"><strong>VITRUVIANO</strong><span>Arquitetura · Inteligência · Prática</span></div>' +
      '<div class="pdf-meta"><span>Memorial Descritivo</span><span>' + dataHoje + '</span></div>' +
      '</header>' +
      '<main>' + mdoc.innerHTML + '</main>' +
      '<div class="pdf-footer-brand"><img src="' + logoUrl + '" alt=""> Documento gerado por VITRUVIANO</div>' +
      '<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},500);};<\/script>' +
      '</body></html>');
    doc.close();

    toast("Abrindo impressão → escolha 'Salvar como PDF'", "success");
    setTimeout(function () { try { document.body.removeChild(iframe); } catch (e) {} }, 60000);
  }

  var pdfBtn = document.getElementById("pdfBtn");
  if (pdfBtn) pdfBtn.addEventListener("click", baixarPDF);

  /* ============================================================
     COPIAR
     ============================================================ */
  var copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var mdoc = document.getElementById("mdoc");
      if (!mdoc || !mdoc.querySelector(".mdoc__page")) return;
      var txt = mdoc.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { toast("Texto copiado", "success"); })
          .catch(function () { toast("Não foi possível copiar.", "error"); });
      } else {
        var ta = document.createElement("textarea");
        ta.value = txt; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); toast("Texto copiado", "success"); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }

  /* ============================================================
     .DOC
     ============================================================ */
  var docxBtn = document.getElementById("docxBtn");
  if (docxBtn) {
    docxBtn.addEventListener("click", function () {
      var mdoc = document.getElementById("mdoc");
      if (!mdoc || !mdoc.querySelector(".mdoc__page")) {
        toast("Gere o memorial primeiro.", "error");
        return;
      }
      var styles = 'body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.55;color:#3d2f24;margin:2cm;}' +
        'h1{font-family:Georgia,serif;font-size:22pt;text-align:center;}' +
        'h2{font-size:13pt;margin-top:20pt;border-bottom:1px solid #c9a574;padding-bottom:4pt;}' +
        'p{margin:6pt 0;} ul{margin:6pt 0 6pt 22pt;padding:0;} li{margin:3pt 0;}' +
        '.mdoc__header{text-align:center;padding-bottom:12pt;border-bottom:2px solid #3d2f24;margin-bottom:18pt;}' +
        '.mdoc__meta > div{padding:4pt 0;border-bottom:1px solid #ebe1cf;}' +
        '.mdoc__meta dt{display:inline-block;font-size:9pt;color:#a89687;width:40%;}' +
        '.mdoc__meta dd{display:inline-block;font-weight:bold;width:55%;text-align:right;margin:0;}' +
        '.mdoc__footer{margin-top:30pt;padding-top:10pt;border-top:1pt solid #ebe1cf;font-size:8pt;color:#a89687;text-align:center;}';
      var d = '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Memorial</title><style>' + styles + '</style></head><body>' + mdoc.innerHTML + '</body></html>';
      var blob = new Blob(["\ufeff", d], { type: "application/msword" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "memorial-" + (state.nome || "vitruviano").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") + ".doc";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast("Download .doc iniciado", "success");
    });
  }

  /* ============================================================
     GERAÇÃO DE IMAGENS COM IA (Pollinations)
     ============================================================ */
  var imagemView = document.getElementById("imagemView");
  var imagemGrid = document.getElementById("imagemGrid");
  var closeImagemView = document.getElementById("closeImagemView");
  var regenerateBtn = document.getElementById("regenerateImagens");
  var imagemTipoAtual = "fachada";

  function gerarPromptImagem(state, tipo) {
    var estilos = {
      popular: "simple contemporary",
      medio: "modern elegant",
      alto: "luxury minimalist"
    };

    var materiais = [];
    var obs = (state.obs || "").toLowerCase();
    if (obs.indexOf("madeira") >= 0) materiais.push("wood cladding");
    if (obs.indexOf("concreto") >= 0) materiais.push("exposed concrete");
    if (obs.indexOf("vidro") >= 0) materiais.push("floor to ceiling glass");
    if (obs.indexOf("tijolo") >= 0) materiais.push("exposed brick");
    if (obs.indexOf("pedra") >= 0) materiais.push("natural stone");
    if (obs.indexOf("aço") >= 0 || obs.indexOf("metal") >= 0) materiais.push("steel accents");
    if (obs.indexOf("branco") >= 0) materiais.push("white walls");
    if (obs.indexOf("preto") >= 0) materiais.push("dark facade");
    var matText = materiais.length ? materiais.join(", ") : "mixed modern materials";

    var local = (state.local || "").toLowerCase();
    var ambiente = "suburban Brazilian setting, tropical vegetation";
    if (local.indexOf("serra") >= 0 || local.indexOf("montanha") >= 0 || local.indexOf("jordão") >= 0)
      ambiente = "mountain setting with pine trees, misty atmosphere";
    else if (local.indexOf("praia") >= 0 || local.indexOf("litoral") >= 0)
      ambiente = "coastal setting, ocean view, palm trees";
    else if (local.indexOf("jardim") >= 0 || local.indexOf("campo") >= 0 || local.indexOf("chácara") >= 0)
      ambiente = "rural setting, green fields, garden";
    else if (local.indexOf("são paulo") >= 0 || local.indexOf("sao paulo") >= 0)
      ambiente = "urban São Paulo context, Brazilian metropolis";

    var tipoMap = {
      residencial: "modern residential house",
      comercial: "modern commercial building",
      reforma: "renovated contemporary house",
      interiores: "modern interior space"
    };

    var base = tipoMap[state.tipo] || "modern house";
    var estilo = estilos[state.padrao] || "modern";
    var area = state.area || 180;
    var pav = state.pav > 1 ? ", " + state.pav + " floors" : "";

    var prompts = {
      fachada: estilo + " " + base + ", " + area + "m², " + matText + pav + ", " + ambiente + ", architectural photography, golden hour, ultra realistic, cinematic lighting, 4k highly detailed render",
      interior: estilo + " interior of " + base + ", " + matText + ", spacious living room, large windows, natural lighting, warm tones, minimalist Brazilian design, architectural digest photography, 4k",
      aerea: "aerial drone view of " + estilo + " " + base + ", " + area + "m², " + matText + pav + ", " + ambiente + ", drone photography, golden hour, architectural visualization, ultra realistic 4k",
      planta3d: "isometric 3D floor plan of " + estilo + " " + base + ", " + area + "m²" + pav + ", cutaway view, furniture layout visible, architectural visualization, clean white background, colorful accents, 4k render"
    };

    return prompts[tipo] || prompts.fachada;
  }

  function urlImagem(prompt, seed, width, height) {
    var s = seed || Math.floor(Math.random() * 999999);
    width = width || 1024;
    height = height || 768;
    return "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) + "?width=" + width + "&height=" + height + "&seed=" + s + "&nologo=true&model=flux";
  }

  function renderizarImagens(tipo) {
    if (!imagemGrid) return;
    var prompt = gerarPromptImagem(state, tipo);

    // Cria os placeholders
    imagemGrid.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      var fig = document.createElement('figure');
      fig.className = 'imagem-item';
      fig.innerHTML = `
        <div class="imagem-item__loading"><span></span><span></span><span></span></div>
        <img alt="Imagem ${i + 1}" />
        <figcaption>
          <button type="button" class="imagem-item__download" aria-label="Baixar">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v13M6 12l6 6 6-6M4 21h16" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </figcaption>
      `;
      imagemGrid.appendChild(fig);
    }

    // Gera as imagens com Puter.js
    var imageElements = imagemGrid.querySelectorAll('.imagem-item');
    imageElements.forEach(function (fig, i) {
      var img = fig.querySelector('img');
      var dlBtn = fig.querySelector('.imagem-item__download');

      puter.ai.txt2img(prompt, {
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        width: 1024,
        height: 768
      })
      .then(function (img) {
        fig.querySelector('.imagem-item__loading').style.display = 'none';
        fig.classList.add('is-loaded');
        img.src = img.src;
        
        img.onload = function() {
          // Download
          dlBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            baixarImagem(img.src, tipo);
          });

          // Lightbox
          fig.addEventListener('click', function () {
            abrirLightboxImagem(img.src);
          });
        };
      })
      .catch(function (err) {
        console.error('Erro na geração:', err);
        fig.querySelector('.imagem-item__loading').innerHTML = 
          '<p style="color:#b34040;font-size:12px;padding:20px;text-align:center">Falhou. Clique em "Gerar outras variações".</p>';
      });
    });
  }

  function baixarImagem(url, tipo) {
    fetch(url)
      .then(function (r) { return r.blob(); })
      .then(function (blob) {
        var blobUrl = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = blobUrl;
        a.download = "vitruviano-" + (state.nome || "projeto").toLowerCase().replace(/\s+/g, "-") + "-" + tipo + ".jpg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        toast("Imagem baixada ✦", "success");
      })
      .catch(function () {
        window.open(url, "_blank");
      });
  }

  function abrirLightboxImagem(src) {
    var lb = document.createElement("div");
    lb.className = "img-lightbox";
    lb.innerHTML = '<button class="img-lightbox__close" aria-label="Fechar">×</button><img src="' + src + '" alt="" />';
    document.body.appendChild(lb);
    document.body.style.overflow = "hidden";

    function close() {
      lb.remove();
      document.body.style.overflow = "";
    }
    lb.querySelector(".img-lightbox__close").addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
    });
  }

  if (imagemBtn) {
    imagemBtn.addEventListener("click", function () {
      if (!state.area) { toast("Preencha a área primeiro.", "error"); return; }
      if (!state.local) { toast("Preencha a localização primeiro.", "error"); return; }
      imagemView.hidden = false;
      imagemView.scrollIntoView({ behavior: "smooth", block: "start" });
      renderizarImagens(imagemTipoAtual);
    });
  }

  if (closeImagemView) {
    closeImagemView.addEventListener("click", function () { imagemView.hidden = true; });
  }

  if (regenerateBtn) {
    regenerateBtn.addEventListener("click", function () { renderizarImagens(imagemTipoAtual); });
  }

  document.querySelectorAll(".imagem-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".imagem-tab").forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
      });
      imagemTipoAtual = tab.dataset.view;
      renderizarImagens(imagemTipoAtual);
    });
  });

  /* ============================================================
     TEMPLATES
     ============================================================ */
  var TEMPLATES = {
    "residencial-simples": {
      nome: "Casa Simples", area: 90, pav: 1, tipo: "residencial", padrao: "popular",
      secoes: ["preliminares","infra","supra","vedacoes","cobertura","revest","pintura","eletrica","hidraulica"]
    },
    "residencial-completo": {
      nome: "Casa Completa", area: 240, pav: 2, tipo: "residencial", padrao: "medio",
      secoes: ["preliminares","infra","supra","vedacoes","cobertura","impermeab","esquadrias","revest","pintura","loucas","eletrica","hidraulica","custo","cronograma"]
    },
    "comercial": {
      nome: "Espaço Comercial", area: 150, pav: 1, tipo: "comercial", padrao: "medio",
      secoes: ["preliminares","infra","supra","vedacoes","cobertura","esquadrias","revest","pintura","eletrica","hidraulica","custo"]
    },
    "reforma": {
      nome: "Reforma", area: 80, pav: 1, tipo: "reforma", padrao: "medio",
      secoes: ["preliminares","vedacoes","revest","pintura","loucas","eletrica","hidraulica","custo","cronograma"]
    }
  };

  $$(".tpl").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.tpl;
      if (key === "limpar") {
        if (confirm("Limpar tudo?")) location.reload();
        return;
      }
      var t = TEMPLATES[key];
      if (!t) return;

      function fill(id, val) {
        var el = document.getElementById(id);
        if (!el) return;
        el.value = val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (!state.nome) fill("f-nome", t.nome);
      if (!state.area) fill("f-area", t.area);
      fill("f-pav", t.pav);

      var t1 = document.querySelector('#f-tipo button[data-value="' + t.tipo + '"]');
      if (t1) t1.click();
      var t2 = document.querySelector('#f-padrao button[data-value="' + t.padrao + '"]');
      if (t2) t2.click();

      $$("#f-secoes input[type=checkbox]").forEach(function (i) {
        i.checked = t.secoes.indexOf(i.value) >= 0;
        i.dispatchEvent(new Event("change", { bubbles: true }));
      });

      toast("Modelo aplicado ✦", "success");
    });
  });

  /* ============================================================
     CONTEXTO DO PLANEJADOR
     ============================================================ */
  function loadContext() {
    try {
      var raw = localStorage.getItem("vitruviano:ctx");
      if (!raw) return;
      var ctx = JSON.parse(raw);
      if (ctx.updatedAt && Date.now() - ctx.updatedAt > 6 * 60 * 60 * 1000) return;

      var applied = [];

      if (ctx.area) {
        var elArea = document.getElementById("f-area");
        if (elArea && !elArea.value) {
          elArea.value = ctx.area;
          elArea.dispatchEvent(new Event("input", { bubbles: true }));
          applied.push("Área: " + ctx.area + " m²");
        }
      }
      if (ctx.pav) {
        var elPav = document.getElementById("f-pav");
        if (elPav) {
          elPav.value = ctx.pav;
          elPav.dispatchEvent(new Event("input", { bubbles: true }));
          applied.push("Pavimentos: " + ctx.pav);
        }
      }
      if (ctx.city) {
        var elLocal = document.getElementById("f-local");
        if (elLocal && !elLocal.value) {
          elLocal.value = ctx.city;
          elLocal.dispatchEvent(new Event("input", { bubbles: true }));
          applied.push("Local: " + ctx.city);
        }
      }
      if (ctx.tipo) {
        var chipTipo = document.querySelector('#f-tipo button[data-value="' + ctx.tipo + '"]');
        if (chipTipo && !chipTipo.classList.contains("is-active")) {
          chipTipo.click();
          applied.push("Tipologia: " + ctx.tipo);
        }
      }
      if (ctx.padrao) {
        var chipPadrao = document.querySelector('#f-padrao button[data-value="' + ctx.padrao + '"]');
        if (chipPadrao && !chipPadrao.classList.contains("is-active")) {
          chipPadrao.click();
          applied.push("Padrão: " + ctx.padrao);
        }
      }
      if (!state.nome) {
        var elNome = document.getElementById("f-nome");
        if (elNome && !elNome.value) {
          var nomeSugerido = ctx.tipo === "reforma" ? "Reforma " + (ctx.city || "") : "Residência " + (ctx.city || "");
          elNome.value = nomeSugerido;
          elNome.dispatchEvent(new Event("input", { bubbles: true }));
          applied.push("Nome: " + nomeSugerido);
        }
      }

      if (applied.length) {
        toast("Dados carregados do planejador ✦", "success");
      }
    } catch (e) { ERR("Erro contexto:", e); }
  }

  /* ============================================================
     INIT
     ============================================================ */
  updateProgress();
  setTimeout(loadContext, 400);
  LOG("Script carregado com sucesso ✓");
})();