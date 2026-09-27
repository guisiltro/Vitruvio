/* ============================================================
   VITRUVIANO · Personalização global
   Injeta nome, avatar e plano do usuário em qualquer página
   ============================================================ */
import { onUser } from "./auth.js";

const GREETINGS = {
  morning: "Bom dia",
  afternoon: "Boa tarde",
  evening: "Boa noite",
  night: "Boa noite"
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return GREETINGS.night;
  if (h < 12) return GREETINGS.morning;
  if (h < 18) return GREETINGS.afternoon;
  return GREETINGS.evening;
}

function getFirstName(name) {
  return (name || "").split(" ")[0] || "arquiteto";
}

function getPlan() {
  try {
    const raw = localStorage.getItem("vitruviano:plan") || "{}";
    const uid = window.__currentUser?.uid;
    if (!uid) return { name: "Solo", label: "Plano Solo", color: "sun" };
    return raw[uid] || { name: "Solo", label: "Plano Solo", color: "sun" };
  } catch {
    return { name: "Solo", label: "Plano Solo", color: "sun" };
  }
}

function getStats() {
  return {
    memoriais: parseInt(localStorage.getItem("vitruviano:stat:memoriais") || "0", 10),
    planejamentos: parseInt(localStorage.getItem("vitruviano:stat:planejamentos") || "0", 10),
    posts: parseInt(localStorage.getItem("vitruviano:stat:posts") || "0", 10)
  };
}

/* ============================================================
   Injeta dados em elementos com data-attributes
   ============================================================ */
function applyPersonalization(user) {
  if (!user) return;

  const name = user.displayName || user.email.split("@")[0];
  const firstName = getFirstName(name);
  const avatar = user.photoURL || null;
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const plan = getPlan();
  const stats = getStats();

  // Texto: nome completo
  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = name;
  });

  // Texto: primeiro nome
  document.querySelectorAll("[data-user-first-name]").forEach((el) => {
    el.textContent = firstName;
  });

  // Texto: saudação (Bom dia/Boa tarde)
  document.querySelectorAll("[data-user-greeting]").forEach((el) => {
    el.textContent = getGreeting();
  });

  // Texto: saudação completa
  document.querySelectorAll("[data-user-welcome]").forEach((el) => {
    el.textContent = `${getGreeting()}, ${firstName}.`;
  });

  // Texto: email
  document.querySelectorAll("[data-user-email]").forEach((el) => {
    el.textContent = user.email;
  });

  // Texto: plano
  document.querySelectorAll("[data-user-plan]").forEach((el) => {
    el.textContent = plan.label;
  });

  // Texto: iniciais (para avatar textual)
  document.querySelectorAll("[data-user-initials]").forEach((el) => {
    el.textContent = initials;
  });

  // Texto: stats
  document.querySelectorAll("[data-user-stat='memoriais']").forEach((el) => {
    el.textContent = stats.memoriais;
  });
  document.querySelectorAll("[data-user-stat='planejamentos']").forEach((el) => {
    el.textContent = stats.planejamentos;
  });
  document.querySelectorAll("[data-user-stat='posts']").forEach((el) => {
    el.textContent = stats.posts;
  });

  // Imagens: avatar
  document.querySelectorAll("[data-user-avatar]").forEach((el) => {
    if (avatar) {
      el.src = avatar;
      el.referrerPolicy = "no-referrer";
      el.alt = name;
    } else if (el.tagName === "IMG") {
      el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c9a574&color=fff&bold=true&size=160`;
    }
  });

  // Texto de fallback (iniciais) para avatares
  document.querySelectorAll("[data-user-avatar-fallback]").forEach((el) => {
    el.textContent = initials;
  });

  // Mostra elementos que só aparecem quando logado
  document.querySelectorAll("[data-auth-only]").forEach((el) => {
    el.hidden = false;
    el.classList.add("is-authenticated");
  });

  // Esconde elementos que só aparecem quando deslogado
  document.querySelectorAll("[data-guest-only]").forEach((el) => {
    el.hidden = true;
  });

  // Aplica classe de tema do plano
  document.body.classList.add(`has-plan-${plan.name.toLowerCase()}`);

  // Marca como personalizado
  document.body.classList.add("is-personalized");
}

/* ============================================================
   INIT
   ============================================================ */
export function personalize() {
  onUser((user) => {
    window.__currentUser = user;
    if (user) {
      // Espera o DOM estar pronto
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => applyPersonalization(user), { once: true });
      } else {
        applyPersonalization(user);
      }
    }
  });

  // Re-aplica se o plano mudar
  window.addEventListener("vitruviano:plan", () => {
    if (window.__currentUser) applyPersonalization(window.__currentUser);
  });
}

/* ============================================================
   API pública para páginas que precisam
   ============================================================ */
export { applyPersonalization, getPlan, getFirstName, getGreeting };