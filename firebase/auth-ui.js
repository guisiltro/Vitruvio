/* ============================================================
   VITRUVIANO · UI de Autenticação + Perfil + Plano
   ============================================================ */
import {
  signup,
  login,
  loginGoogle,
  logout,
  onUser,
  resetPassword,
  protectRoute
} from "./auth.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const isConfigured =
  firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("COLE_AQUI");

/* ============================================================
   Iniciais para avatar
   ============================================================ */
function initials(name, email) {
  if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  if (email) return email[0].toUpperCase();
  return "U";
}

/* ============================================================
   Plano do usuário (localStorage por enquanto)
   ============================================================ */
const PLAN_KEY = "vitruviano:plan";

export function getUserPlan(uid) {
  try {
    const data = JSON.parse(localStorage.getItem(PLAN_KEY) || "{}");
    return data[uid] || { name: "Solo", label: "Plano Solo", color: "sun", since: Date.now() };
  } catch {
    return { name: "Solo", label: "Plano Solo", color: "sun", since: Date.now() };
  }
}

export function setUserPlan(uid, plan) {
  try {
    const data = JSON.parse(localStorage.getItem(PLAN_KEY) || "{}");
    data[uid] = plan;
    localStorage.setItem(PLAN_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("vitruviano:plan", { detail: { uid, plan } }));
  } catch {}
}

/* ============================================================
   Injeta o botão no navbar
   ============================================================ */
function injectAuthButton() {
  const navActions = $(".nav-actions");
  if (!navActions) return null;

  // Se já existe, não duplica
  let container = $("#authContainer");
  if (!container) {
    container = document.createElement("div");
    container.className = "auth-user";
    container.id = "authContainer";
    navActions.appendChild(container);
  }
  return container;
}

/* ============================================================
   Renderiza estado logado/deslogado
   ============================================================ */
function renderAuthUI(user) {
  const container = $("#authContainer");
  if (!container) return;

  if (!user) {
    container.innerHTML = `
      <button class="auth-nav-btn" id="openAuthModal" type="button">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Entrar
      </button>
    `;
    const btn = $("#openAuthModal");
    if (btn) {
      btn.addEventListener("click", () => {
        window.location.href = rootUrl() + "login/";
      });
    }
    return;
  }

  const name = user.displayName || user.email.split("@")[0];
  const photo = user.photoURL;
  const plan = getUserPlan(user.uid);

  const avatarHTML = photo
    ? `<img class="auth-user__avatar" src="${photo}" alt="" referrerpolicy="no-referrer">`
    : `<div class="auth-user__avatar">${initials(user.displayName, user.email)}</div>`;

  container.innerHTML = `
    <button class="auth-user__trigger" id="userMenuTrigger" type="button" aria-haspopup="true" aria-expanded="false">
      ${avatarHTML}
      <span class="auth-user__name">${escapeHTML(name)}</span>
      <svg class="auth-user__chev" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </button>
    <div class="auth-user__menu" id="userMenu" role="menu">
      <div class="auth-user__menu-head">
        <strong>${escapeHTML(name)}</strong>
        <small>${escapeHTML(user.email)}</small>
        <span class="auth-user__plan auth-user__plan--${plan.color}">
          <span class="auth-user__plan-dot"></span>
          ${escapeHTML(plan.label)}
        </span>
      </div>
      <a href="${rootUrl()}perfil/index.html" role="menuitem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="4"/><path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2"/>
        </svg>
        Meu perfil
      </a>
      <a href="${rootUrl()}ia/index.html" role="menuitem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
        </svg>
        Memorial IA
      </a>
      <a href="${rootUrl()}premium/index.html" role="menuitem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>
        </svg>
        Planos Premium
      </a>
      <a href="${rootUrl()}blog/index.html" role="menuitem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Comunidade
      </a>
      <div class="auth-user__menu-divider"></div>
      <button type="button" class="is-danger" id="logoutBtn" role="menuitem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
        Sair
      </button>
    </div>
  `;

  const trigger = $("#userMenuTrigger");
  const menu = $("#userMenu");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", () => {
    menu.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  });
  menu.addEventListener("click", (e) => e.stopPropagation());

  $("#logoutBtn")?.addEventListener("click", async () => {
    await logout();
    window.location.href = rootUrl();
  });
}

/* ============================================================
   Descobre a URL raiz a partir da pasta atual
   ============================================================ */
function rootUrl() {
  const path = window.location.pathname;
  const inSub = /\/(ia|premium|blog|projetos|perfil|login|cadastro)\//.test(path);
  return inSub ? "../" : "";
}

/* ============================================================
   Escape HTML
   ============================================================ */
function escapeHTML(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

/* ============================================================
   INIT
   ============================================================ */
export function init() {
  injectAuthButton();

  onUser((user) => {
    renderAuthUI(user);
    protectRoute(user);
    window.dispatchEvent(new CustomEvent("vitruviano:auth", { detail: { user } }));
  });

  // Se o plano mudar, re-renderiza
  window.addEventListener("vitruviano:plan", () => {
    const container = $("#authContainer");
    if (container && window.__currentUser) renderAuthUI(window.__currentUser);
  });
}

/* ============================================================
   Escuta o usuário atual globalmente (para o evento de plano)
   ============================================================ */
onUser((user) => { window.__currentUser = user; });