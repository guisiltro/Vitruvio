/* ============================================================
   VITRUVIANO · Sistema de Tokens
   Cada uso do planejamento/memorial/report custa 1 token
   Reset mensal automático (30 dias)
   ============================================================ */

const TOKENS_KEY = "vitruviano:tokens";
const PLAN_KEY = "vitruviano:plan";

/* ---------- Limites por plano ---------- */
const PLAN_LIMITS = {
  "Solo":        { limit: 3,  label: "3 usos/mês",     unlimited: false },
  "Studio":      { limit: 50, label: "50 usos/mês",    unlimited: false },
  "Escritório":  { limit: -1, label: "Uso ilimitado",  unlimited: true  }
};

/* ---------- Plano atual ---------- */
function getUserPlanName() {
  try {
    const uid = window.__currentUser?.uid;
    if (!uid) return "Solo";
    const data = JSON.parse(localStorage.getItem(PLAN_KEY) || "{}");
    return (data[uid] && data[uid].name) || "Solo";
  } catch {
    return "Solo";
  }
}

/* ---------- Estado dos tokens ---------- */
export function getUserTokens() {
  const uid = window.__currentUser?.uid;
  if (!uid) {
    return { used: 0, limit: 3, remaining: 3, unlimited: false, resetAt: null, planName: "Solo" };
  }

  const planName = getUserPlanName();
  const config = PLAN_LIMITS[planName] || PLAN_LIMITS.Solo;

  let data;
  try { data = JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}"); }
  catch { data = {}; }

  let t = data[uid];

  // Se nunca teve ou trocou de plano, reinicia
  if (!t || t.plan !== planName) {
    t = {
      plan: planName,
      used: 0,
      limit: config.limit,
      resetAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
    data[uid] = t;
    try { localStorage.setItem(TOKENS_KEY, JSON.stringify(data)); } catch {}
  }

  // Reset mensal
  if (t.resetAt && Date.now() > t.resetAt) {
    t.used = 0;
    t.resetAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    try { localStorage.setItem(TOKENS_KEY, JSON.stringify(data)); } catch {}
  }

  const unlimited = config.unlimited;
  const remaining = unlimited ? Infinity : Math.max(0, config.limit - t.used);

  return {
    used: t.used,
    limit: config.limit,
    remaining: unlimited ? Infinity : remaining,
    unlimited,
    resetAt: t.resetAt,
    planName
  };
}

/* ---------- Consumir token ---------- */
export function useToken(cost = 1) {
  const uid = window.__currentUser?.uid;
  if (!uid) return { success: false, reason: "not_logged" };

  const info = getUserTokens();
  if (info.unlimited) {
    window.dispatchEvent(new CustomEvent("vitruviano:tokens", { detail: info }));
    return { success: true, unlimited: true, remaining: Infinity };
  }

  if (info.remaining < cost) {
    return { success: false, reason: "no_tokens", remaining: info.remaining };
  }

  try {
    const data = JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}");
    if (!data[uid]) return { success: false, reason: "no_data" };
    data[uid].used += cost;
    localStorage.setItem(TOKENS_KEY, JSON.stringify(data));
  } catch {
    return { success: false, reason: "storage_error" };
  }

  const updated = getUserTokens();
  window.dispatchEvent(new CustomEvent("vitruviano:tokens", { detail: updated }));
  return { success: true, remaining: updated.remaining, unlimited: false };
}

/* ---------- Verificar ---------- */
export function canUse() {
  const info = getUserTokens();
  if (info.unlimited) return true;
  return info.remaining > 0;
}

/* ---------- Reset manual ---------- */
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

/* ---------- Helpers ---------- */
export function formatRemaining(info) {
  if (info.unlimited) return "∞ Ilimitado";
  return info.remaining + " de " + info.limit;
}

export function getPlanLimits() {
  return PLAN_LIMITS;
}

export function getPlanInfo(planName) {
  return PLAN_LIMITS[planName] || PLAN_LIMITS.Solo;
}