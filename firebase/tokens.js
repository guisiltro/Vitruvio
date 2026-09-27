/* ============================================================
   VITRUVIANO · Sistema de Tokens
   Cada uso do planejamento/memorial/report custa 1 token
   Reset mensal automático
   ============================================================ */

const TOKENS_KEY = "vitruviano:tokens";

/* ---------- Limites por plano ---------- */
const PLAN_LIMITS = {
  "Solo": { limit: 3, label: "3 usos/mês" },
  "Studio": { limit: 50, label: "50 usos/mês" },
  "Escritório": { limit: -1, label: "Ilimitado" } // -1 = unlimited
};

/* ---------- Get plano do usuário ---------- */
function getUserPlanName() {
  try {
    const uid = window.__currentUser?.uid;
    if (!uid) return "Solo";
    const data = JSON.parse(localStorage.getItem("vitruviano:plan") || "{}");
    const plan = data[uid];
    return plan?.name || "Solo";
  } catch {
    return "Solo";
  }
}

/* ---------- Estado dos tokens ---------- */
export function getUserTokens() {
  const uid = window.__currentUser?.uid;
  if (!uid) return { used: 0, limit: 3, remaining: 3, unlimited: false, resetAt: null };

  const planName = getUserPlanName();
  const config = PLAN_LIMITS[planName] || PLAN_LIMITS.Solo;
  const unlimited = config.limit === -1;

  let data;
  try {
    data = JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}");
  } catch {
    data = {};
  }

  let userTokens = data[uid];

  // Primeira vez ou plano mudou
  if (!userTokens || userTokens.plan !== planName) {
    userTokens = {
      plan: planName,
      used: 0,
      limit: config.limit,
      resetAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
    data[uid] = userTokens;
    try { localStorage.setItem(TOKENS_KEY, JSON.stringify(data)); } catch {}
  }

  // Reset mensal
  if (userTokens.resetAt && Date.now() > userTokens.resetAt) {
    userTokens.used = 0;
    userTokens.resetAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    try { localStorage.setItem(TOKENS_KEY, JSON.stringify(data)); } catch {}
  }

  const remaining = unlimited ? Infinity : Math.max(0, config.limit - userTokens.used);

  return {
    used: userTokens.used,
    limit: config.limit,
    remaining: unlimited ? Infinity : remaining,
    unlimited,
    resetAt: userTokens.resetAt,
    planName
  };
}

/* ---------- Consumir token ---------- */
export function useToken(cost = 1) {
  const uid = window.__currentUser?.uid;
  if (!uid) return { success: false, reason: "not_logged" };

  const info = getUserTokens();
  if (info.unlimited) return { success: true, unlimited: true, remaining: Infinity };
  if (info.remaining < cost) return { success: false, reason: "no_tokens", remaining: info.remaining };

  try {
    const data = JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}");
    data[uid].used += cost;
    localStorage.setItem(TOKENS_KEY, JSON.stringify(data));
  } catch {
    return { success: false, reason: "storage_error" };
  }

  const updated = getUserTokens();
  window.dispatchEvent(new CustomEvent("vitruviano:tokens", { detail: updated }));
  return { success: true, remaining: updated.remaining, unlimited: false };
}

/* ---------- Verificar se pode usar ---------- */
export function canUse() {
  const info = getUserTokens();
  if (info.unlimited) return true;
  return info.remaining > 0;
}

/* ---------- Reset manual (admin) ---------- */
export function resetTokens() {
  const uid = window.__currentUser?.uid;
  if (!uid) return;
  try {
    const data = JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}");
    if (data[uid]) {
      data[uid].used = 0;
      data[uid].resetAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(TOKENS_KEY, JSON.stringify(data));
    }
  } catch {}
  window.dispatchEvent(new CustomEvent("vitruviano:tokens", { detail: getUserTokens() }));
}

/* ---------- Formatação amigável ---------- */
export function formatRemaining(info) {
  if (info.unlimited) return "∞ Ilimitado";
  return `${info.remaining} de ${info.limit}`;
}

export function getPlanLimits() {
  return PLAN_LIMITS;
}