const menu = document.querySelector(".page-menu");
const links = document.querySelector(".page-links");
const loadingScreen = document.createElement("div");
loadingScreen.className = "loading-screen";
loadingScreen.setAttribute("role", "status");
loadingScreen.setAttribute("aria-label", "Carregando VITRUVIANO");
loadingScreen.innerHTML = '<div class="loading-brand"><img src="../img/logo.png" alt=""><strong>VITRUVIANO</strong></div><div class="loading-track"><span></span></div><p>ARQUITETURA · INTELIGÊNCIA · PRÁTICA</p>';
document.body.prepend(loadingScreen);
const dismissLoadingScreen = () =>
  window.setTimeout(() => {
    loadingScreen.classList.add("is-loaded");
    loadingScreen.style.opacity = "0";
    loadingScreen.style.visibility = "hidden";
    loadingScreen.style.pointerEvents = "none";
  }, 600);

if (document.readyState === "complete") {
  dismissLoadingScreen();
} else {
  window.addEventListener("load", dismissLoadingScreen, { once: true });
}
window.setTimeout(() => {
  loadingScreen.classList.add("is-loaded");
  loadingScreen.style.opacity = "0";
  loadingScreen.style.visibility = "hidden";
  loadingScreen.style.pointerEvents = "none";
}, 1600);
const pageType =
  window.location.pathname.split("/").filter(Boolean).slice(-2, -1)[0] ||
  "home";
document.body.classList.add(`page-${pageType}`);
if (links) {
  links.innerHTML =
    '<a href="../projetos/index.html">Projetos</a><a href="../biblioteca/index.html">Biblioteca</a><a href="../conteudos/index.html">Conteúdos</a><a href="../ia/index.html">IA / Memorial</a><a href="../premium/index.html">Premium</a><a href="../suporte/index.html">Suporte</a>';
  const currentPage = window.location.pathname
    .split("/")
    .filter(Boolean)
    .slice(-2, -1)[0];
  links.querySelectorAll("a").forEach((link) => {
    if (link.href.includes(`/${currentPage}/`)) link.classList.add("active");
  });
}

document.querySelectorAll(".page-brand").forEach((brand) => {
  brand.innerHTML =
    '<img src="../img/logo.png" alt=""> <span class="brand-name">VITRUVIANO</span>';
});
const fixedHeaderStyles = document.createElement("style");
fixedHeaderStyles.textContent =
  ".page-header{position:fixed;top:0;left:0;right:0;z-index:20}.page-hero{padding-top:180px!important}.page-brand img{width:42px;height:42px;object-fit:cover;object-position:center;display:block}.page-brand .brand-name{border:0!important;margin:0!important;width:auto!important;height:auto!important;display:inline!important;font:800 13px Manrope,sans-serif;letter-spacing:.12em}@media(max-width:700px){.page-hero{padding-top:145px!important}}";
document.head.appendChild(fixedHeaderStyles);

document.querySelectorAll(".page-footer").forEach((footer) => {
  footer.innerHTML =
    '<div class="footer-main"><a class="brand" href="../index.html"><span><img src="../img/logo.png" alt=""></span> VITRUVIANO</a><p>Arquitetura, inteligência e prática para transformar ideias em espaços possíveis.</p><a class="footer-cta" href="../premium/index.html">Conheça o Plano Premium ↗</a></div><div class="footer-columns"><div><strong>Explorar</strong><a href="../projetos/index.html">Projetos</a><a href="../biblioteca/index.html">Biblioteca</a><a href="../conteudos/index.html">Conteúdos</a></div><div><strong>Ferramentas</strong><a href="../ia/index.html">IA / Memorial</a><a href="../premium/index.html">Plano Premium</a><a href="../suporte/index.html">Comunidade</a></div><div><strong>Contato</strong><a href="mailto:contato@vitruviano.com">contato@vitruviano.com</a><a href="../suporte/index.html">Suporte</a><a href="../index.html">Voltar ao topo ↑</a></div></div><div class="footer-bottom"><span>© 2025 VITRUVIANO</span><span>Feito para quem projeta o futuro.</span><span>Brasil · São Paulo</span></div>';
});

if (window.location.pathname.includes("/projetos/")) {
  const caseStyles = document.createElement("style");
  caseStyles.textContent =
    '.case-study-block{border-top:1px solid #d8d8d0;margin-top:100px;padding-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:10%}.case-study-block h2{font-size:clamp(36px,5vw,62px);line-height:1;letter-spacing:-.06em;margin:40px 0 0}.case-study-list article{border-top:2px solid #f47721;padding:18px 0 25px}.case-study-list strong{font:10px "DM Mono",monospace;color:#f47721}.case-study-list h3{font-size:19px;margin:28px 0 10px}.case-study-list p{font-size:13px;line-height:1.7}@media(max-width:700px){.case-study-block{display:block}.case-study-list{margin-top:50px}}';
  document.head.appendChild(caseStyles);
  const cases = document.createElement("section");
  cases.className = "case-study-block";
  cases.innerHTML =
    '<div><span class="page-kicker">Estudos de caso</span><h2>Decisões que<br><em>fazem diferença.</em></h2></div><div class="case-study-list"><article><strong>Casa Vale / 01</strong><h3>Como a luz organizou a planta</h3><p>A implantação priorizou a orientação solar e a ventilação cruzada. O resultado foi uma casa com menos dependência de iluminação artificial e uma transição mais fluida entre interior e jardim.</p></article><article><strong>Estúdio 27 / 02</strong><h3>Materialidade para um espaço de trabalho</h3><p>Madeira, pedra e vegetação foram combinadas para criar um ambiente de concentração sem perder acolhimento. Cada acabamento foi escolhido considerando durabilidade e manutenção.</p></article></div>';
  document.querySelector(".page-content").appendChild(cases);

  const inspiration = document.createElement("section");
  inspiration.className = "visual-inspiration";
  inspiration.innerHTML =
    '<div class="visual-label">Caderno de referências / 2025</div><div class="visual-images"><img src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=85" alt="Fachada de concreto e linhas geométricas"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85" alt="Interior iluminado com materiais naturais"><img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85" alt="Detalhe de escada e arquitetura contemporânea"></div>';
  document.querySelector(".page-content").prepend(inspiration);

  const projectNotes = document.createElement("section");
  projectNotes.className = "project-notes";
  projectNotes.innerHTML =
    '<div><span class="page-kicker">Como ler um projeto</span><h2>Forma, uso e<br><em>tempo.</em></h2></div><div class="project-note-grid"><div><strong>01 / CONTEXTO</strong><p>Todo projeto começa pelo território: orientação solar, topografia, vizinhança e modos de vida.</p></div><div><strong>02 / DECISÕES</strong><p>As escolhas de implantação, estrutura e materialidade são registradas para tornar o processo legível.</p></div><div><strong>03 / RESULTADO</strong><p>O que importa é a experiência final: conforto, permanência e uma arquitetura que continua fazendo sentido.</p></div></div>';
  document.querySelector(".page-content").appendChild(projectNotes);
  document.querySelector(".project-list article:last-child")?.remove();
}

if (pageType === "biblioteca") {
  const libraryPanel = document.createElement("section");
  libraryPanel.className = "library-index";
  libraryPanel.innerHTML =
    '<div><span class="page-kicker">Índice técnico</span><h2>Encontre o arquivo<br>certo para a etapa.</h2></div><div class="library-lines"><div><b>DWG</b><span>Detalhes construtivos / 24 arquivos</span><i>→</i></div><div><b>BIM</b><span>Famílias Revit / 18 componentes</span><i>→</i></div><div><b>PLANILHAS</b><span>Custos e quantitativos / 06 modelos</span><i>→</i></div></div>';
  document.querySelector(".page-content").prepend(libraryPanel);

  const standards = document.createElement("section");
  standards.className = "standards-panel";
  standards.innerHTML =
    '<div><span class="page-kicker">Guia rápido</span><h2>Antes de baixar,<br><em>confira a base.</em></h2><p>Uma documentação confiável começa pela revisão das referências que orientam cada decisão.</p></div><div class="standards-table"><div><b>NBR 6492</b><span>Representação de projetos de arquitetura</span><i>PRANCHA</i></div><div><b>NBR 9050</b><span>Acessibilidade a edificações e espaços</span><i>ACESSO</i></div><div><b>NBR 15575</b><span>Desempenho de edificações habitacionais</span><i>DESEMPENHO</i></div><div><b>LEGISLAÇÃO LOCAL</b><span>Zoneamento, recuos e parâmetros urbanos</span><i>CIDADE</i></div></div>';
  document.querySelector(".page-content").appendChild(standards);
  document
    .querySelectorAll(".resource-page-grid article:nth-child(n+4)")
    .forEach((article) => article.remove());
}

if (pageType === "conteudos") {
  const editorialImage = document.createElement("section");
  editorialImage.className = "editorial-feature";
  editorialImage.innerHTML =
    '<img src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85" alt="Fachada de concreto e linhas geométricas">';
  document.querySelector(".page-content").prepend(editorialImage);

  const editorialExtras = document.createElement("section");
  editorialExtras.className = "editorial-extras";
  editorialExtras.innerHTML =
    '<div class="topic-pills"><span>Arquitetura</span><span>Tecnologia</span><span>Materiais</span><span>Clima</span></div><div class="reading-note"><span class="page-kicker">Carta do estúdio</span><h2>Construir também é escolher o que merece permanecer.</h2><p>Publicamos ideias, referências e aprendizados do canteiro para aproximar o desenho da vida real. Uma curadoria mensal para quem projeta, constrói e observa os espaços.</p><form class="newsletter-form"><input type="email" required placeholder="Seu melhor e-mail" aria-label="Seu melhor e-mail"><button type="submit">Receber novidades ↗</button><small class="newsletter-status"></small></form></div>';
  document.querySelector(".page-content").appendChild(editorialExtras);
  editorialExtras.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    editorialExtras.querySelector(".newsletter-status").textContent =
      "Cadastro realizado. Obrigado por acompanhar.";
    event.target.reset();
  });
  document.querySelector(".article-list article:last-child")?.remove();
}
if (menu)
  menu.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });

document.querySelectorAll(".contact-form").forEach((form) =>
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");
    status.textContent = "Recebemos sua mensagem. Retornaremos em breve.";
    form.reset();
  }),
);

const footerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("footer-visible");
        footerObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);

document.querySelectorAll(".page-footer").forEach((footer) =>
  footerObserver.observe(footer),
);

const pageRevealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        pageRevealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document
  .querySelectorAll(
    ".page-section, .project-list article, .resource-page-grid article, .library-index, .standards-panel, .article-list article, .editorial-extras, .project-notes, .case-study-block, .support-story, .forum-box, .premium-intro, .plans, .premium-details, .signup-panel",
  )
  .forEach((section) => {
    section.classList.add("page-reveal");
    pageRevealObserver.observe(section);
  });
