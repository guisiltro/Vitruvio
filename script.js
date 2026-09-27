/* ============================================================
   VITRUVIANO · Home
   ============================================================ */
(() => {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- TEMA ---------- */
  const KEY = "vitruviano:theme";
  const root = document.documentElement;
  const setTheme = (t) => {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem(KEY, t); } catch {}
  };
  let saved;
  try { saved = localStorage.getItem(KEY); } catch {}
  setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $(".theme-toggle")?.addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ---------- LOADER ---------- */
  const loader = $(".loader");
  if (loader) {
    const hide = () => {
      loader.classList.add("is-hidden");
      setTimeout(() => loader.remove(), 800);
    };
    if (document.readyState === "complete") setTimeout(hide, 450);
    else window.addEventListener("load", () => setTimeout(hide, 400), { once: true });
    setTimeout(hide, 1800);
  }

  /* ---------- HEADER + AUTO-HIDE ---------- */
  const header  = $(".site-header");
  const menuBtn = $(".menu-toggle");
  const siteNav = $(".site-nav");

  menuBtn?.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$(".site-nav a").forEach((a) =>
    a.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuBtn?.setAttribute("aria-expanded", "false");
    })
  );

  let lastY = window.scrollY;
  let ticking = false;
  const updateHeader = () => {
    if (!header) return;
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);
    const menuOpen = siteNav?.classList.contains("is-open");
    if (menuOpen || y < 120) header.classList.remove("is-hidden");
    else if (y > lastY + 4) header.classList.add("is-hidden");
    else if (y < lastY - 4) header.classList.remove("is-hidden");
    lastY = y;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(updateHeader); ticking = true; }
  }, { passive: true });

  /* ---------- FILTROS DE PROJETO ---------- */
  const filters = $$(".filter");
  const cards   = $$(".card[data-category]");
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.toggle("is-active", b === btn));
      const cat = btn.dataset.filter;
      cards.forEach((c) => (c.hidden = !(cat === "todos" || c.dataset.category === cat)));
    })
  );

  /* ---------- FORMULÁRIO DE CONTATO ---------- */
  $("#contact-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const s = $(".form__status", f);
    if (!f.checkValidity()) { s.textContent = "Verifique os campos."; return; }
    s.textContent = "Mensagem recebida. Retornaremos em breve.";
    f.reset();
  });

  /* ---------- REVEAL ON SCROLL ---------- */
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    $$("[data-reveal]").forEach((el) => obs.observe(el));
  } else {
    $$("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
  }

  /* ============================================================
     MOTOR DE RESPOSTAS DA IA
     ============================================================ */
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const extractNumbers = (text) => {
    const nums = [];
    const re = /(\d{1,4})(?:[.,](\d{1,2}))?\s*(m2|m²|metros?|mil)?/gi;
    let m;
    while ((m = re.exec(text))) {
      let v = parseInt(m[1], 10);
      if (m[3] && /mil/i.test(m[3])) v *= 1000;
      nums.push(v);
    }
    return nums;
  };

  const detectCity = (text) => {
    const cities = ["sao paulo","rio de janeiro","belo horizonte","curitiba","porto alegre",
      "salvador","recife","fortaleza","brasilia","florianopolis","campinas","serra da mantiqueira"];
    const t = norm(text);
    return cities.find((c) => t.includes(c));
  };

  const CUB = {
    "sao paulo": { popular: 2600, medio: 3200, alto: 3900 },
    default:     { popular: 2400, medio: 3000, alto: 3700 },
  };
  const estimateCost = (area, city, padrao = "medio") => {
    const table = CUB[city] || CUB.default;
    const base = table[padrao] || table.medio;
    return {
      low:  Math.round(base * 0.92 * area),
      high: Math.round(base * 1.18 * area),
      base,
    };
  };
  const fmtBRL = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const saveContext = (data) => {
    try {
      const prev = JSON.parse(localStorage.getItem("vitruviano:ctx") || "{}");
      localStorage.setItem("vitruviano:ctx", JSON.stringify({ ...prev, ...data, updatedAt: Date.now() }));
    } catch {}
  };

  /* ============================================================
     BASE DE CONHECIMENTO
     Reply pode retornar:
       • string  → { text, follow }
       • objeto  → { text, card?, follow? }
     ============================================================ */
  const KB = [
    {
      id: "construir",
      match: [/constru/i, /\bobra\b/i, /nova casa/i, /quero (uma )?casa/i],
      reply: (ctx) => {
        const area = ctx.numbers.find((n) => n >= 40 && n <= 1000);
        const city = ctx.city;

        let text = `Ótimo, vamos tirar essa casa do papel.\n\nPara eu montar o **briefing** preciso de 3 coisas:\n\n**1.** Cidade${city ? ` — ${city} ✔` : ""}\n**2.** Área em m²${area ? ` — ${area} ✔` : ""}\n**3.** Terreno — já tem, está olhando ou não?`;

        let card = null;
        if (area) {
          const est = estimateCost(area, city, "medio");
          card = {
            title: "Pré-estimativa · padrão médio",
            rows: [
              { label: "Área", value: `${area} m²` },
              { label: "Cidade", value: city || "não informada" },
              { label: "Faixa total", value: `${fmtBRL(est.low)} – ${fmtBRL(est.high)}` },
              { label: "Por m²", value: fmtBRL(est.base) },
            ],
          };
          saveContext({ area, city, tipo: "residencial" });
        }

        return {
          text,
          card,
          follow: ["Tenho terreno", "Padrão alto", "Gerar memorial", "Ver materiais"],
        };
      },
    },
    {
      id: "materiais",
      match: [/material/i, /acabament/i, /revestiment/i, /porcelanato/i, /madeira/i, /concreto/i, /tijolo/i],
      reply: () => ({
        text: `Famílias de material que uso como ponto de partida:\n\n• **Estrutura:** concreto armado, alvenaria estrutural, steel frame, madeira laminada.\n• **Vedações:** bloco cerâmico, bloco de concreto, drywall.\n• **Pisos:** porcelanato, madeira maciça, microcimento, vinílico.\n• **Fachada:** textura, revestimento cerâmico, madeira tratada, ACM.\n• **Cobertura:** cerâmica, concreto, sanduíche, metálica.\n\nMe diz a **tipologia** e a **região** que eu recomendo combinações específicas. E depois [levo isso direto para o memorial](ia/index.html).`,
        follow: ["Casa na serra", "Apê em SP", "Econômico", "Gerar memorial"],
      }),
    },
    {
      id: "equipamentos",
      match: [/equipament/i, /maquin/i, /ferramenta/i, /betoneira/i, /andaime/i],
      reply: () => ({
        text: `Lista-base de **equipamentos e ferramentas**:\n\n• **Fundação:** retroescavadeira, betoneira 400L, vibrador, bomba.\n• **Estrutura:** andaimes, guincho, serra circular de bancada.\n• **Alvenaria:** furadeira de impacto, serra mármore, misturador.\n• **Elétrica/hidráulica:** policorte, dobradeira, testeira de pressão.\n• **Medição:** nível a laser, trena, estação total.\n• **Segurança (NR-18):** linha de vida, cinto paraquedista, EPI, tapume.\n\nPosso incluir no [memorial descritivo](ia/index.html).`,
        follow: ["Incluir no memorial", "Obra pequena", "Obra grande"],
      }),
    },
    {
      id: "custo",
      match: [/quanto custa/i, /preco/i, /custo/i, /orcament/i, /\bm2\b/i, /\bm²\b/i, /valor/i],
      reply: (ctx) => {
        const area = ctx.numbers.find((n) => n >= 40 && n <= 1000);
        const city = ctx.city;

        if (area) {
          const est = estimateCost(area, city, "medio");
          saveContext({ area, city });
          return {
            text: `Aqui está uma **estimativa inicial** para o seu projeto${city ? ` em ${city}` : ""}.\n\nQuer que eu refine com **padrão construtivo** e **etapas detalhadas**?`,
            card: {
              title: "Estimativa · padrão médio",
              rows: [
                { label: "Área", value: `${area} m²` },
                { label: "Cidade", value: city || "não informada" },
                { label: "Faixa total", value: `${fmtBRL(est.low)} – ${fmtBRL(est.high)}` },
                { label: "Custo por m²", value: fmtBRL(est.base) },
              ],
            },
            follow: ["Refinar padrão alto", "Detalhar etapas", "Gerar memorial"],
          };
        }

        return {
          text: `Valores médios no Brasil (2025):\n\n• **Popular** — R$ 2.200–2.800/m²\n• **Médio** — R$ 2.900–3.500/m²\n• **Alto** — R$ 3.600–4.500/m²\n\nMe diga **área** e **cidade** que eu monto um card detalhado.`,
          follow: ["180 m² em SP", "250 m² na serra", "Qual o padrão mais comum?"],
        };
      },
    },
    {
      id: "memorial",
      match: [/memorial/i, /descritiv/i, /documento tecnico/i, /nbr 13531/i],
      reply: () => ({
        text: `O **memorial descritivo** descreve todas as etapas construtivas conforme **NBR 13531**.\n\nNa VITRUVIANO você gera em **2 minutos**:\n\n• Dados do projeto\n• 12 seções técnicas (fundação, estrutura, acabamentos...)\n• Estimativa de custo e cronograma\n• Exportação em **.doc** e **PDF com selo VITRUVIANO**\n• Comando de voz\n\n👉 [Abrir o gerador](ia/index.html)`,
        follow: ["Abrir gerador", "Ver exemplo"],
      }),
    },
    {
      id: "reformar",
      match: [/reform/i, /renov/i, /revitaliz/i],
      reply: (ctx) => {
        const area = ctx.numbers.find((n) => n >= 20 && n <= 500);
        return {
          text: `Reformas são o tipo de projeto em que **90% do valor está na escuta**.\n\n${area ? `Anotei **${area}m²**. ` : ""}Me conta:\n\n**1.** Residencial ou comercial?\n**2.** O que mais te incomoda hoje?\n**3.** Tem prazo?`,
          follow: ["Comercial", "Mudar tudo", "Só a cozinha"],
        };
      },
    },
    {
      id: "interiores",
      match: [/interior/i, /decorac/i, /mobiliario/i, /marcenaria/i],
      reply: () => ({
        text: `Projetos de interiores partem de três perguntas:\n\n**1.** Como você usa o espaço no dia a dia?\n**2.** Qual atmosfera quer sentir?\n**3.** O que **não** pode faltar?\n\nPrazo típico: **4 a 8 semanas** para um apê completo.`,
        follow: ["Apê 90m²", "Casa praia"],
      }),
    },
    {
      id: "prazo",
      match: [/prazo/i, /demora/i, /quanto tempo/i],
      reply: () => ({
        text: `Cronograma típico:\n\n• **Briefing + estudo:** 3–4 semanas\n• **Anteprojeto:** 4–6 semanas\n• **Executivo:** 6–10 semanas\n• **Aprovações:** 4–8 semanas\n• **Obra (180m²):** 12–18 meses\n\nTotal antes da execução: **3 a 6 meses**.`,
        follow: ["Acelerar", "Reforma é mais rápido?"],
      }),
    },
    {
      id: "sustentavel",
      match: [/sustent/i, /ecolog/i, /verde/i, /energia solar/i],
      reply: () => ({
        text: `Estratégias passivas que mais importam:\n\n• **Orientação solar** — planta que segue o norte\n• **Ventilação cruzada** — reduz 40% do ar-condicionado\n• **Luz natural** — sheds, clarabóias\n• **Inércia térmica** — massa que regula\n• **Água** — reuso, captação pluvial\n• **Materiais** — madeira certificada, cimento com adição`,
        follow: ["Aplicar em SP", "Vale energia solar?"],
      }),
    },
    {
      id: "premium",
      match: [/premium/i, /plano/i, /assinatura/i],
      reply: () => ({
        text: `Três planos:\n\n**Solo — R$ 89/mês**\n5 projetos · portal · 20 memoriais IA\n\n**Studio — R$ 249/mês** ⭐\n25 projetos · white-label · 100 memoriais · propostas · CUB\n\n**Escritório — R$ 599/mês**\nIlimitado · API · SSO · onboarding\n\n→ [Ver detalhes](premium/index.html)`,
        follow: ["Testar", "Anual?"],
      }),
    },
    {
      id: "obrigado",
      match: [/obrigad/i, /valeu/i, /thanks/i],
      reply: () => ({ text: `Por nada ✦ Boa obra!`, follow: [] }),
    },
    {
      id: "oi",
      match: [/^(oi|ola|olá|ei|bom dia|boa tarde|boa noite)\b/i],
      reply: () => ({
        text: `Olá! Bem-vindo ao VITRUVIANO.\n\nPosso falar sobre **materiais, custos, equipamentos, prazos** e gerar o **memorial descritivo**.\n\nSobre o que quer falar?`,
        follow: ["Construir", "Materiais", "Equipamentos", "Custos", "Memorial"],
      }),
    },
  ];

  const DEFAULT_REPLY = {
    text: `Ainda não peguei 100%. Posso ajudar com:\n\n• **Construção** e custo por m²\n• **Materiais** e acabamentos\n• **Equipamentos** de obra\n• **Memorial descritivo** (NBR 13531)\n\nMe conta mais sobre o seu projeto?`,
    follow: [],
  };

  const answer = (text) => {
    const ctx = { numbers: extractNumbers(text), city: detectCity(text), raw: text };
    for (const entry of KB) {
      if (entry.match.some((re) => re.test(text))) {
        const out = entry.reply(ctx);
        if (typeof out === "string") {
          return { text: out, card: null, follow: entry.follow || [] };
        }
        return {
          text:   out.text   || "",
          card:   out.card   || null,
          follow: out.follow || entry.follow || [],
        };
      }
    }
    return { ...DEFAULT_REPLY };
  };

  /* ---------- Formatação markdown → HTML ---------- */
  const formatBot = (raw) => String(raw)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, "<br>");

  /* ============================================================
     CHAT INTERATIVO
     ============================================================ */
  const chat         = $("#chat");
  const messages     = $("#chatMessages");
  const form         = $("#chatForm");
  const input        = $("#chatInput");
  const suggestions  = $("#chatSuggestions");
  const chatClearBtn = $("#chatClear");

  const nowTime = () =>
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const WELCOME = `Olá ✦ Sou o **Assistente AN**.\n\nPosso te ajudar a:\n• Estimar **custos** da sua obra\n• Sugerir **materiais** e acabamentos\n• Montar a lista de **equipamentos**\n• Gerar o **memorial descritivo** (NBR 13531)\n\nMe conta: **o que você quer projetar?**`;

  /* Cria bolha com avatar, timestamp, card e botões inline */
  const addBubble = (raw, type = "bot", options = {}) => {
    const wrap = document.createElement("div");
    wrap.className = `chat__bubble chat__bubble--${type}`;

    const avatar = document.createElement("div");
    avatar.className = "chat__bubble-avatar";
    avatar.textContent = type === "bot" ? "AN" : "VC";

    const body = document.createElement("div");
    body.className = "chat__bubble-body";

    const content = document.createElement("div");
    content.className = "chat__bubble-content";
    content.innerHTML = formatBot(raw);

    if (options.card) {
      const card = document.createElement("div");
      card.className = "chat__card";
      card.innerHTML = `
        <div class="chat__card-title">${options.card.title}</div>
        ${options.card.rows.map(r => `
          <div class="chat__card-row">
            <span>${r.label}</span>
            <strong>${r.value}</strong>
          </div>
        `).join("")}
      `;
      content.appendChild(card);
    }

    const time = document.createElement("span");
    time.className = "chat__bubble-time";
    time.textContent = nowTime();

    body.appendChild(content);
    body.appendChild(time);

    if (options.follow?.length) {
      const actions = document.createElement("div");
      actions.className = "chat__bubble-actions";
      options.follow.forEach((label) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chat__bubble-action";
        btn.textContent = label;
        btn.addEventListener("click", () => send(label));
        actions.appendChild(btn);
      });
      body.appendChild(actions);
    }

    wrap.appendChild(avatar);
    wrap.appendChild(body);

    messages.appendChild(wrap);
    chat.classList.add("has-messages");
    messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
    return wrap;
  };

  const addTyping = () => {
    const wrap = document.createElement("div");
    wrap.className = "chat__bubble chat__bubble--bot";
    wrap.innerHTML = `
      <div class="chat__bubble-avatar">AN</div>
      <div class="chat__typing"><span></span><span></span><span></span></div>
    `;
    messages.appendChild(wrap);
    chat.classList.add("has-messages");
    messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
    return wrap;
  };

  const renderFollow = (list) => {
    if (!list?.length) return;
    suggestions.classList.remove("is-hidden");
    suggestions.innerHTML = list
      .map((l) => `<button data-prompt="${l.replace(/"/g, "&quot;")}">${l}</button>`)
      .join("");
    bindSuggestionButtons();
  };

  const bindSuggestionButtons = () => {
    $$("button", suggestions).forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => send(btn.dataset.prompt || btn.textContent));
    });
  };

  const send = (text) => {
    const value = (text || "").trim();
    if (!value) return;

    suggestions.classList.add("is-hidden");
    addBubble(value, "user");
    input.value = "";
    input.style.height = "auto";

    const typing = addTyping();

    setTimeout(() => {
      typing.remove();
      const res = answer(value);
      addBubble(res.text, "bot", { follow: res.follow, card: res.card });
      if (res.follow?.length) renderFollow(res.follow);
    }, 520 + Math.random() * 320);
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input.value);
    }
  });

  input?.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  });

  chatClearBtn?.addEventListener("click", () => {
    messages.innerHTML = "";
    chat.classList.remove("has-messages");
    suggestions.classList.remove("is-hidden");
    addBubble(WELCOME, "bot", {
      follow: ["Construir casa", "Ver materiais", "Estimar custo", "Gerar memorial"],
    });
  });

  bindSuggestionButtons();

  // Boas-vindas ao carregar
  setTimeout(() => {
    addBubble(WELCOME, "bot", {
      follow: ["Construir casa", "Ver materiais", "Estimar custo", "Gerar memorial"],
    });
  }, 600);

  /* ---------- VOZ NO CHAT ---------- */
  const micBtn = $("#micBtn");
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR && micBtn) {
    let rec = null;
    let listening = false;

    micBtn.addEventListener("click", () => {
      if (listening) {
        try { rec?.stop(); } catch {}
        return;
      }
      rec = new SR();
      rec.lang = "pt-BR";
      rec.continuous = false;
      rec.interimResults = true;

      let base = input.value ? input.value + " " : "";

      rec.onstart = () => {
        listening = true;
        micBtn.classList.add("is-listening");
      };
      rec.onresult = (e) => {
        let interim = "", final = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t;
          else interim += t;
        }
        input.value = base + final + interim;
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 140) + "px";
        if (final) base += final;
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed") alert("Permita o microfone nas permissões do navegador.");
      };
      rec.onend = () => {
        listening = false;
        micBtn.classList.remove("is-listening");
      };
      try { rec.start(); } catch {}
    });
  } else if (micBtn) {
    micBtn.addEventListener("click", () => alert("Use Chrome ou Edge para comando de voz."));
    micBtn.style.opacity = ".5";
  }

  /* ---------- COMMAND PALETTE ---------- */
  const commands = [
    { label: "Ir para Início",                hint: "Topo",       action: () => scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "Falar com a AN",                hint: "Assistente", action: () => input?.focus() },
    { label: "Gerar memorial descritivo",     hint: "Ferramenta", action: () => location.assign("ia/index.html") },
    { label: "Sobre materiais",               hint: "IA",         action: () => { input.value = "Quais materiais usar?"; input.focus(); } },
    { label: "Lista de equipamentos",         hint: "IA",         action: () => { input.value = "Que equipamentos preciso?"; input.focus(); } },
    { label: "Ver Projetos",                  hint: "Portfólio",  action: () => $("#projetos")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Ver Planos",                    hint: "Plataforma", action: () => $("#planos")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Ir para Contato",               hint: "Seção",      action: () => $("#contato")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Alternar tema",                 hint: "Aparência",  action: () => $(".theme-toggle")?.click() },
  ];

  const cmdk       = $("#cmdk");
  const cmdkInput  = cmdk?.querySelector("input");
  const cmdkList   = cmdk?.querySelector(".cmdk__list");

  const renderCmds = (q = "") => {
    if (!cmdkList) return;
    const query = q.trim().toLowerCase();
    const list = query ? commands.filter((c) => c.label.toLowerCase().includes(query)) : commands;
    if (!list.length) {
      cmdkList.innerHTML = `<li class="cmdk__empty">Nada encontrado para "${q}"</li>`;
      return;
    }
    cmdkList.innerHTML = list
      .map((c, i) => `
        <li class="cmdk__item" role="option" data-index="${i}" ${i === 0 ? 'aria-selected="true"' : ""}>
          <span>${c.label}</span><small>${c.hint}</small>
        </li>`).join("");
  };
  const runCmd = (idx) => {
    const q = cmdkInput?.value.trim().toLowerCase() || "";
    const list = q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
    list[idx]?.action();
    cmdk?.close();
  };
  const openCmdk = () => {
    if (!cmdk) return;
    renderCmds();
    cmdk.showModal();
    setTimeout(() => cmdkInput?.focus(), 40);
  };
  cmdkInput?.addEventListener("input", (e) => renderCmds(e.target.value));
  cmdkList?.addEventListener("click", (e) => {
    const item = e.target.closest(".cmdk__item");
    if (item) runCmd(Number(item.dataset.index));
  });
  cmdkList?.addEventListener("keydown", (e) => {
    const items = $$(".cmdk__item", cmdkList);
    if (!items.length) return;
    const cur = items.findIndex((i) => i.getAttribute("aria-selected") === "true");
    let next = cur;
    if (e.key === "ArrowDown") next = (cur + 1) % items.length;
    if (e.key === "ArrowUp") next = (cur - 1 + items.length) % items.length;
    if (e.key === "Enter") { e.preventDefault(); runCmd(cur); return; }
    if (next !== cur) {
      items[cur]?.removeAttribute("aria-selected");
      items[next].setAttribute("aria-selected", "true");
      items[next].scrollIntoView({ block: "nearest" });
    }
  });
  $(".cmdk-trigger")?.addEventListener("click", openCmdk);
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      cmdk?.open ? cmdk.close() : openCmdk();
    }
    if (e.key === "/" && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      input?.focus();
    }
  });
})();