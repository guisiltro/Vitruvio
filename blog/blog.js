/* ============================================================
   VITRUVIANO · Blog / Comunidade
   ============================================================ */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------- TEMA ---------- */
  (function () {
    var KEY = "vitruviano:theme";
    var root = document.documentElement;
    var theme;
    try { theme = localStorage.getItem(KEY); } catch (e) {}
    if (!theme) theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    var btn = $(".theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
      });
    }
  })();

  /* ---------- MENU ---------- */
  (function () {
    var mt = $(".menu-toggle");
    var nav = $(".site-nav");
    if (mt && nav) {
      mt.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        mt.setAttribute("aria-expanded", String(open));
      });
    }
  })();

  /* ============================================================
     STORAGE
     ============================================================ */
  var STORE_KEY = "vitruviano:posts";
  var LIKE_KEY = "vitruviano:likes";
  var SAVED_KEY = "vitruviano:saved";
  var FOLLOW_KEY = "vitruviano:following";
  var USER_KEY = "vitruviano:me";

  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key) || "null"); return v !== null ? v : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function getMe() {
    if (window.__currentUser) {
      return {
        name: window.__currentUser.displayName || window.__currentUser.email.split("@")[0],
        email: window.__currentUser.email,
        avatar: window.__currentUser.photoURL,
        uid: window.__currentUser.uid
      };
    }
    return { name: "Você", avatar: null, uid: "guest" };
  }

  /* ============================================================
     POSTS INICIAIS (SEED)
     ============================================================ */
  var SEED_POSTS = [
    {
      id: "seed-1",
      author: { name: "Mariana Souza", role: "Arquiteta · SP", avatar: "https://i.pravatar.cc/80?img=12", email: "mariana@exemplo.com" },
      text: "Terminei o estudo preliminar da Casa Vale 🌲\n\nA implantação seguiu o eixo leste-oeste pra captar sol da manhã e evitar o da tarde. Aprendizado enorme — alguém já testou essa orientação em serra com inverno rigoroso?",
      images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"],
      tags: ["Projeto", "Bioclimático"],
      likes: 128,
      comments: [
        { id: "c1", author: { name: "Rafael Lima", avatar: "https://i.pravatar.cc/80?img=32" }, text: "Uso sempre em Campos. Funciona muito bem, só cuidado com o vento sul no inverno.", createdAt: Date.now() - 3600000 }
      ],
      createdAt: Date.now() - 7200000
    },
    {
      id: "seed-2",
      author: { name: "Rafael Lima", role: "Arquiteto · MG", avatar: "https://i.pravatar.cc/80?img=32", email: "rafael@exemplo.com" },
      text: "Comparativo rápido entre madeira maciça e laminada pra fachada:\n\n• Maciça → melhor aceitação, manutenção anual\n• Laminada → mais estável, custo maior, aceita grandes vãos\n\nEm BH uso laminada tratada e nunca tive problema. Alguém tem experiência com madeira plástica?",
      images: [
        "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80"
      ],
      tags: ["Materiais", "Referência"],
      likes: 54,
      comments: [],
      createdAt: Date.now() - 14400000
    },
    {
      id: "seed-3",
      author: { name: "Camila Reis", role: "Estudante · RS", avatar: "https://i.pravatar.cc/80?img=45", email: "camila@exemplo.com" },
      text: "Usei a IA do VITRUVIANO pra gerar um memorial descritivo pro meu TCC e ficou impressionante. Depois editei poucas coisas e entregou no prazo. Recomendo demais!",
      images: [],
      tags: ["IA", "Referência"],
      likes: 210,
      comments: [
        { id: "c2", author: { name: "Pedro Alves", avatar: "https://i.pravatar.cc/80?img=22" }, text: "Sério? Vou testar hoje mesmo. Quanto tempo levou?", createdAt: Date.now() - 3600000 }
      ],
      createdAt: Date.now() - 28800000
    },
    {
      id: "seed-4",
      author: { name: "Diego Torres", role: "Urbanista · BA", avatar: "https://i.pravatar.cc/80?img=15", email: "diego@exemplo.com" },
      text: "Alguém aqui já projetou com tijolo ecológico (solo-cimento)? Estou estudando a viabilidade pra uma casa em Salvador. Aceito referências e contatos de fornecedores.",
      images: [],
      tags: ["Dúvida", "Materiais"],
      likes: 34,
      comments: [],
      createdAt: Date.now() - 43200000
    },
    {
      id: "seed-5",
      author: { name: "Helena Marques", role: "Interiores · RJ", avatar: "https://i.pravatar.cc/80?img=48", email: "helena@exemplo.com" },
      text: "Terminei hoje o projeto de interiores do apartamento da família P em Ipanema. Foram 4 meses de trabalho, muito diálogo e algumas decisões difíceis. O resultado tá aí 👇",
      images: [
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80"
      ],
      tags: ["Interiores", "Projeto"],
      likes: 187,
      comments: [],
      createdAt: Date.now() - 86400000
    }
  ];

  var posts = load(STORE_KEY, null) || SEED_POSTS;
  var liked = new Set(load(LIKE_KEY, []));
  var saved = new Set(load(SAVED_KEY, []));
  var following = new Set(load(FOLLOW_KEY, []));
  var feedAtual = "recentes";

  /* ============================================================
     HELPERS
     ============================================================ */
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts;
    var m = Math.floor(diff / 60000);
    if (m < 1) return "agora";
    if (m < 60) return "há " + m + " min";
    var h = Math.floor(m / 60);
    if (h < 24) return "há " + h + "h";
    var d = Math.floor(h / 24);
    if (d < 7) return "há " + d + "d";
    return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  function linkify(text) {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  function initials(name) {
    if (!name) return "?";
    return name.split(" ").map(function (n) { return n[0]; }).join("").slice(0, 2).toUpperCase();
  }

  function avatarHTML(user, size) {
    var cls = size || "post-card__avatar";
    if (user.avatar) {
      return '<div class="' + cls + '"><img src="' + esc(user.avatar) + '" alt="" referrerpolicy="no-referrer"></div>';
    }
    return '<div class="' + cls + '">' + initials(user.name) + '</div>';
  }

  /* ============================================================
     COMPOSER
     ============================================================ */
  var composer = $("#composer");
  var composerText = $("#composerText");
  var composerFiles = $("#composerFiles");
  var composerPreview = $("#composerPreview");
  var composerTags = $("#composerTags");
  var composerSubmit = $("#composerSubmit");
  var tagToggle = $("#tagToggle");
  var tagPicker = $("#tagPicker");
  var tagCount = $("#tagCount");
  var quickPrompts = $("#quickPrompts");

  var attachedImages = [];
  var selectedTags = [];

  function updateSubmit() {
    var hasContent = composerText.value.trim().length > 0;
    composerSubmit.disabled = !hasContent && attachedImages.length === 0;
  }

  if (composerText) {
    composerText.addEventListener("input", function () {
      composerText.style.height = "auto";
      composerText.style.height = Math.min(composerText.scrollHeight, 240) + "px";
      updateSubmit();
    });
  }

  function renderPreview() {
    if (!composerPreview) return;
    composerPreview.innerHTML = attachedImages.map(function (src, i) {
      return '<div class="composer__preview-item"><img src="' + src + '" alt="" /><button type="button" class="composer__preview-remove" data-idx="' + i + '" aria-label="Remover">×</button></div>';
    }).join("");

    $$(".composer__preview-remove", composerPreview).forEach(function (b) {
      b.addEventListener("click", function () {
        attachedImages.splice(Number(b.dataset.idx), 1);
        renderPreview();
        updateSubmit();
      });
    });
  }

  if (composerFiles) {
    composerFiles.addEventListener("change", function (e) {
      var files = [].slice.call(e.target.files);
      var remaining = 4 - attachedImages.length;
      var accepted = files.slice(0, remaining);

      Promise.all(accepted.map(function (file) {
        if (file.size > 3 * 1024 * 1024) {
          alert('"' + file.name + '" é maior que 3MB.');
          return null;
        }
        return new Promise(function (res, rej) {
          var fr = new FileReader();
          fr.onload = function () { res(fr.result); };
          fr.onerror = rej;
          fr.readAsDataURL(file);
        });
      })).then(function (results) {
        results.forEach(function (r) { if (r) attachedImages.push(r); });
        e.target.value = "";
        renderPreview();
        updateSubmit();
      });
    });
  }

  function renderTags() {
    if (!composerTags) return;
    composerTags.innerHTML = selectedTags.map(function (t, i) {
      return '<span class="composer__tag">#' + esc(t) + '<button type="button" data-idx="' + i + '" aria-label="Remover">×</button></span>';
    }).join("");

    $$(".composer__tag button", composerTags).forEach(function (b) {
      b.addEventListener("click", function () {
        selectedTags.splice(Number(b.dataset.idx), 1);
        renderTags();
        syncTagPicker();
      });
    });

    if (tagCount) tagCount.textContent = selectedTags.length ? "· " + selectedTags.length : "";
  }

  function syncTagPicker() {
    $$("button", tagPicker).forEach(function (b) {
      b.classList.toggle("is-active", selectedTags.indexOf(b.dataset.tag) >= 0);
    });
  }

  if (tagToggle) {
    tagToggle.addEventListener("click", function () {
      tagPicker.classList.toggle("is-open");
      tagToggle.classList.toggle("is-active", tagPicker.classList.contains("is-open"));
    });
  }

  $$("button", tagPicker).forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.dataset.tag;
      var idx = selectedTags.indexOf(t);
      if (idx >= 0) selectedTags.splice(idx, 1);
      else if (selectedTags.length < 5) selectedTags.push(t);
      renderTags();
      syncTagPicker();
    });
  });

  if (quickPrompts) {
    $$("button", quickPrompts).forEach(function (b) {
      b.addEventListener("click", function () {
        composerText.value = b.dataset.prompt;
        composerText.focus();
        composerText.dispatchEvent(new Event("input"));
      });
    });
  }

  if (composer) {
    composer.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = composerText.value.trim();
      if (!text && attachedImages.length === 0) return;

      var me = getMe();
      var newPost = {
        id: "p-" + Date.now(),
        author: { name: me.name, avatar: me.avatar, email: me.email, uid: me.uid },
        text: text,
        images: attachedImages.slice(),
        tags: selectedTags.slice(),
        likes: 0,
        comments: [],
        createdAt: Date.now(),
        mine: true
      };

      posts.unshift(newPost);
      save(STORE_KEY, posts);

      // Incrementa stats
      try {
        var curPosts = parseInt(localStorage.getItem("vitruviano:stat:posts") || "0", 10);
        localStorage.setItem("vitruviano:stat:posts", String(curPosts + 1));
      } catch (e) {}

      // Reset
      composerText.value = "";
      composerText.style.height = "auto";
      attachedImages = [];
      selectedTags = [];
      renderPreview();
      renderTags();
      syncTagPicker();
      updateSubmit();
      tagPicker.classList.remove("is-open");
      tagToggle.classList.remove("is-active");

      renderFeed();
      window.scrollTo({ top: composer.offsetTop - 100, behavior: "smooth" });
    });
  }

  /* ============================================================
     RENDERIZAÇÃO DO FEED
     ============================================================ */
  var feed = $("#feed");

  function renderFeed() {
    if (!feed) return;

    var lista = posts.slice();
    var me = getMe();

    // Filtro por aba
    if (feedAtual === "populares") {
      lista.sort(function (a, b) {
        var scoreA = (a.likes || 0) + (a.comments || []).length * 3;
        var scoreB = (b.likes || 0) + (b.comments || []).length * 3;
        return scoreB - scoreA;
      });
    } else if (feedAtual === "seguindo") {
      lista = lista.filter(function (p) { return following.has(p.author.name); });
    } else if (feedAtual === "salvos") {
      lista = lista.filter(function (p) { return saved.has(p.id); });
    } else {
      // Recentes (default)
      lista.sort(function (a, b) { return b.createdAt - a.createdAt; });
    }

    if (!lista.length) {
      var msg = feedAtual === "seguindo"
        ? "Você ainda não segue ninguém. Explore os posts e clique em Seguir nos autores."
        : feedAtual === "salvos"
        ? "Nenhum post salvo ainda. Clique no ícone de marcador para salvar."
        : "Nenhum post ainda. Seja o primeiro a compartilhar!";
      feed.innerHTML = '<div class="feed__empty">' + msg + '</div>';
      return;
    }

    feed.innerHTML = lista.map(function (p) { return renderPostCard(p); }).join("");
    bindFeedEvents();
    updateStatsSidebar();
  }

  function renderPostCard(post) {
    var isLiked = liked.has(post.id);
    var isSaved = saved.has(post.id);
    var likeCount = post.likes + (isLiked ? 1 : 0);
    var comments = post.comments || [];
    var tags = post.tags || [];
    var images = post.images || [];
    var me = getMe();
    var isMine = post.author.email && me.email && post.author.email === me.email;

    return '<article class="post-card' + (isMine ? " post-card--mine" : "") + '" data-id="' + post.id + '">' +
      '<header class="post-card__head">' +
        avatarHTML(post.author) +
        '<div class="post-card__info">' +
          '<strong>' + esc(post.author.name) +
            (isMine ? '<span class="post-card__mine-badge">Seu post</span>' : "") +
          '</strong>' +
          '<small>' + esc(post.author.role || "Membro") + ' · ' + timeAgo(post.createdAt) + '</small>' +
        '</div>' +
        (isMine ? '<button class="post-card__delete" type="button" data-action="delete" aria-label="Excluir">×</button>' : "") +
      '</header>' +

      (post.text ? '<div class="post-card__text">' + linkify(esc(post.text)) + '</div>' : "") +

      (images.length ? '<div class="post-card__images" data-count="' + images.length + '">' +
        images.map(function (src) { return '<img src="' + esc(src) + '" alt="" loading="lazy" data-action="zoom" />'; }).join("") +
      '</div>' : "") +

      (tags.length ? '<div class="post-card__tags">' +
        tags.map(function (t) { return '<button class="post-card__tag" type="button" data-tag="' + esc(t) + '">#' + esc(t) + '</button>'; }).join("") +
      '</div>' : "") +

      '<footer class="post-card__actions">' +
        '<button class="post-card__action' + (isLiked ? " is-liked" : "") + '" data-action="like" type="button">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="' + (isLiked ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-linejoin="round"/></svg>' +
          '<span>' + likeCount + '</span>' +
        '</button>' +
        '<button class="post-card__action" data-action="comments" type="button">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-linejoin="round"/></svg>' +
          '<span>' + comments.length + '</span>' +
        '</button>' +
        '<button class="post-card__action" data-action="share" type="button" aria-label="Compartilhar">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>' +
        '</button>' +
        '<button class="post-card__action' + (isSaved ? " is-saved" : "") + '" data-action="save" type="button" aria-label="Salvar">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="' + (isSaved ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</footer>' +

      '<div class="post-card__comments">' +
        comments.map(function (c) { return renderCommentItem(c); }).join("") +
        '<form class="comment-form" data-comment-form>' +
          avatarHTML(me, "comment-form__avatar") +
          '<div class="comment-form__inner">' +
            '<input type="text" placeholder="Escreva um comentário..." aria-label="Comentar" />' +
            '<button class="comment-form__send" type="submit" aria-label="Enviar">' +
              '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>' +
            '</button>' +
          '</div>' +
        '</form>' +
      '</div>' +
    '</article>';
  }

  function renderCommentItem(c) {
    return '<div class="comment-item">' +
      avatarHTML(c.author, "comment-item__avatar") +
      '<div class="comment-item__body">' +
        '<div class="comment-item__head">' +
          '<span class="comment-item__name">' + esc(c.author.name) + '</span>' +
          '<span class="comment-item__time">' + timeAgo(c.createdAt) + '</span>' +
        '</div>' +
        '<div class="comment-item__text">' + linkify(esc(c.text)) + '</div>' +
      '</div>' +
    '</div>';
  }

  /* ============================================================
     EVENTOS DO FEED
     ============================================================ */
  function bindFeedEvents() {
    $$(".post-card", feed).forEach(function (card) {
      var id = card.dataset.id;
      var post = posts.find(function (p) { return p.id === id; });
      if (!post) return;

      // Like
      var likeBtn = card.querySelector('[data-action="like"]');
      if (likeBtn) {
        likeBtn.addEventListener("click", function () {
          if (liked.has(id)) {
            liked.delete(id);
            post.likes = Math.max(0, post.likes - 1);
          } else {
            liked.add(id);
          }
          save(LIKE_KEY, [].concat(Array.from(liked)));
          save(STORE_KEY, posts);
          updateCard(card, post);
        });
      }

      // Save
      var saveBtn = card.querySelector('[data-action="save"]');
      if (saveBtn) {
        saveBtn.addEventListener("click", function () {
          if (saved.has(id)) saved.delete(id);
          else saved.add(id);
          save(SAVED_KEY, [].concat(Array.from(saved)));
          updateCard(card, post);
        });
      }

      // Comments toggle
      var commentBtn = card.querySelector('[data-action="comments"]');
      if (commentBtn) {
        commentBtn.addEventListener("click", function () {
          var box = card.querySelector(".post-card__comments");
          if (!box) return;
          box.classList.toggle("is-open");
          if (box.classList.contains("is-open")) {
            var inp = box.querySelector("input");
            if (inp) inp.focus();
          }
        });
      }

      // Share
      var shareBtn = card.querySelector('[data-action="share"]');
      if (shareBtn) {
        shareBtn.addEventListener("click", function () {
          abrirShareModal(id);
        });
      }

      // Delete
      var delBtn = card.querySelector('[data-action="delete"]');
      if (delBtn) {
        delBtn.addEventListener("click", function () {
          if (!confirm("Excluir este post?")) return;
          posts = posts.filter(function (p) { return p.id !== id; });
          save(STORE_KEY, posts);
          renderFeed();
        });
      }

      // Comment form
      var form = card.querySelector("[data-comment-form]");
      if (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var input = form.querySelector("input");
          var text = input.value.trim();
          if (!text) return;
          post.comments = post.comments || [];
          post.comments.push({
            id: "c-" + Date.now(),
            author: getMe(),
            text: text,
            createdAt: Date.now()
          });
          save(STORE_KEY, posts);
          updateCard(card, post);
          var box = card.querySelector(".post-card__comments");
          if (box) box.classList.add("is-open");
        });
      }

      // Zoom
      card.querySelectorAll('[data-action="zoom"]').forEach(function (img) {
        img.addEventListener("click", function () { openLightbox(img.src); });
      });

      // Tag click
      card.querySelectorAll(".post-card__tag").forEach(function (t) {
        t.addEventListener("click", function () {
          var tag = t.dataset.tag;
          // Filtra feed por tag
          feedAtual = "recentes";
          $$(".feed-tab").forEach(function (ft) { ft.classList.toggle("is-active", ft.dataset.feed === "recentes"); });
          // Simples: apenas destaca na busca
          alert("Filtrando por #" + tag + " — em breve");
        });
      });
    });
  }

  function updateCard(card, post) {
    var parent = card.parentNode;
    var wrapper = document.createElement("div");
    wrapper.innerHTML = renderPostCard(post);
    var newCard = wrapper.firstElementChild;
    parent.replaceChild(newCard, card);
    bindFeedEvents();
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  var lightbox = $("#lightbox");
  var lightboxImg = $("#lightboxImg");
  function openLightbox(src) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lightbox__close")) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("is-open")) closeLightbox();
  });

  /* ============================================================
     SHARE
     ============================================================ */
  var shareModal = $("#shareModal");
  var shareUrl = $("#shareUrl");
  function abrirShareModal(postId) {
    if (!shareModal) return;
    shareUrl.value = window.location.origin + window.location.pathname + "#post-" + postId;
    shareModal.classList.add("is-open");
  }
  $("#shareClose").addEventListener("click", function () {
    shareModal.classList.remove("is-open");
  });
  $("#copyShareUrl").addEventListener("click", function () {
    shareUrl.select();
    document.execCommand("copy");
    this.textContent = "Copiado!";
    var btn = this;
    setTimeout(function () { btn.textContent = "Copiar link"; }, 1500);
  });
  if (shareModal) {
    shareModal.addEventListener("click", function (e) {
      if (e.target === shareModal) shareModal.classList.remove("is-open");
    });
  }

  /* ============================================================
     FEED TABS
     ============================================================ */
  $$(".feed-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      $$(".feed-tab").forEach(function (t) { t.classList.toggle("is-active", t === tab); });
      $$(".side-nav").forEach(function (n) { n.classList.toggle("is-active", n.dataset.feed === tab.dataset.feed); });
      feedAtual = tab.dataset.feed;
      renderFeed();
    });
  });

  $$(".side-nav").forEach(function (nav) {
    nav.addEventListener("click", function () {
      $$(".feed-tab").forEach(function (t) { t.classList.toggle("is-active", t.dataset.feed === nav.dataset.feed); });
      $$(".side-nav").forEach(function (n) { n.classList.toggle("is-active", n === nav); });
      feedAtual = nav.dataset.feed;
      renderFeed();
    });
  });

  /* ============================================================
     TREND LIST
     ============================================================ */
  function renderTrends() {
    var list = $("#trendList");
    if (!list) return;
    var counts = {};
    posts.forEach(function (p) {
      (p.tags || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    });
    var sorted = Object.entries(counts).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);
    var data = sorted.length ? sorted : [["Projeto", 24], ["Materiais", 18], ["IA", 14], ["Bioclimático", 12], ["Reforma", 9], ["Interiores", 7]];

    list.innerHTML = data.map(function (item) {
      return '<button class="trend-item" type="button" data-tag="' + esc(item[0]) + '">' +
        '<span>#' + esc(item[0]) + '</span>' +
        '<small>' + item[1] + ' posts</small>' +
      '</button>';
    }).join("");

    $$(".trend-item", list).forEach(function (b) {
      b.addEventListener("click", function () {
        alert("Em breve: filtro por #" + b.dataset.tag);
      });
    });
  }

  /* ============================================================
     RANKING
     ============================================================ */
  function renderRanking() {
    var el = $("#ranking");
    if (!el) return;
    var contributors = {};
    posts.forEach(function (p) {
      var n = p.author.name;
      if (!contributors[n]) contributors[n] = { name: n, avatar: p.author.avatar, points: 0 };
      contributors[n].points += (p.likes || 0) + (p.comments || []).length * 5 + 10;
    });
    var sorted = Object.values(contributors).sort(function (a, b) { return b.points - a.points; }).slice(0, 5);
    var data = sorted.length ? sorted : [
      { name: "Mariana Souza", avatar: "https://i.pravatar.cc/80?img=12", points: 840 },
      { name: "Rafael Lima", avatar: "https://i.pravatar.cc/80?img=32", points: 720 },
      { name: "Camila Reis", avatar: "https://i.pravatar.cc/80?img=45", points: 615 },
      { name: "Diego Torres", avatar: "https://i.pravatar.cc/80?img=15", points: 480 },
      { name: "Helena Marques", avatar: "https://i.pravatar.cc/80?img=48", points: 412 }
    ];

    el.innerHTML = data.map(function (u, i) {
      var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1) + "º";
      return '<div class="rank-item">' +
        '<span class="rank-item__num' + (i < 3 ? " rank-item__num--" + (i + 1) : "") + '">' + medal + '</span>' +
        (u.avatar ? '<img class="rank-item__avatar" src="' + esc(u.avatar) + '" alt="" />' : '<div class="rank-item__avatar">' + initials(u.name) + '</div>') +
        '<div class="rank-item__info"><strong>' + esc(u.name) + '</strong><small>contribuidor</small></div>' +
        '<span class="rank-item__pts">' + u.points + '</span>' +
      '</div>';
    }).join("");
  }

  /* ============================================================
     PESSOAS
     ============================================================ */
  var PEOPLE = [
    { name: "Mariana Souza", role: "Arquiteta · SP", avatar: "https://i.pravatar.cc/80?img=12" },
    { name: "Rafael Lima", role: "Arquiteto · MG", avatar: "https://i.pravatar.cc/80?img=32" },
    { name: "Camila Reis", role: "Estudante · RS", avatar: "https://i.pravatar.cc/80?img=45" },
    { name: "Diego Torres", role: "Urbanista · BA", avatar: "https://i.pravatar.cc/80?img=15" },
    { name: "Helena Marques", role: "Interiores · RJ", avatar: "https://i.pravatar.cc/80?img=48" }
  ];

  function renderPeople() {
    var list = $("#peopleList");
    if (!list) return;
    list.innerHTML = PEOPLE.map(function (p) {
      var isFollowing = following.has(p.name);
      return '<div class="person">' +
        '<img src="' + p.avatar + '" alt="" />' +
        '<div class="person__info"><strong>' + esc(p.name) + '</strong><small>' + esc(p.role) + '</small></div>' +
        '<button class="person__follow' + (isFollowing ? " is-following" : "") + '" type="button" data-name="' + esc(p.name) + '">' + (isFollowing ? "Seguindo" : "Seguir") + '</button>' +
      '</div>';
    }).join("");

    $$(".person__follow", list).forEach(function (b) {
      b.addEventListener("click", function () {
        var n = b.dataset.name;
        if (following.has(n)) following.delete(n);
        else following.add(n);
        save(FOLLOW_KEY, [].concat(Array.from(following)));
        renderPeople();
      });
    });
  }

  /* ============================================================
     SIDEBAR STATS
     ============================================================ */
  function updateStatsSidebar() {
    var totalLikes = posts.reduce(function (sum, p) { return sum + (p.likes || 0); }, 0);
    var statPosts = $("#statPosts");
    var statMembros = $("#statMembros");
    if (statPosts) statPosts.textContent = (1293 + posts.length).toLocaleString("pt-BR");
    if (statMembros) statMembros.textContent = (2847 + posts.length).toLocaleString("pt-BR");
  }

  /* ============================================================
     INIT
     ============================================================ */
  renderFeed();
  renderTrends();
  renderRanking();
  renderPeople();
  updateSubmit();

  // Atualiza avatar do composer quando o usuário logar
  window.addEventListener("vitruviano:auth", function () {
    var me = getMe();
    var av = $(".composer__avatar");
    if (av && me.avatar) {
      av.innerHTML = '<img src="' + me.avatar + '" alt="" referrerpolicy="no-referrer">';
    } else if (av && me.name) {
      av.textContent = initials(me.name);
    }
  });

  // Se já tiver usuário
  setTimeout(function () {
    var me = getMe();
    var av = $(".composer__avatar");
    if (av) {
      if (me.avatar) av.innerHTML = '<img src="' + me.avatar + '" alt="" referrerpolicy="no-referrer">';
      else if (me.name && me.name !== "Você") av.textContent = initials(me.name);
    }
  }, 600);

})();