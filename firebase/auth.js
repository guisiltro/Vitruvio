/* ============================================================
   VITRUVIANO · Autenticação Firebase
   Usa CDN do Google — funciona sem bundler (Vite/Webpack)
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { firebaseConfig, PROTECTED_ROUTES } from "./firebase-config.js";

/* ============================================================
   Inicialização
   ============================================================ */
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Persistência local — usuário fica logado mesmo fechando o navegador
setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.warn("[VITRUVIANO] Persistência:", e);
});

/* ============================================================
   CADASTRO
   ============================================================ */
export async function signup(email, password, nome) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (nome) await updateProfile(cred.user, { displayName: nome });
    return { user: cred.user, error: null };
  } catch (e) {
    return { user: null, error: traduzErro(e.code) };
  }
}

/* ============================================================
   LOGIN E-MAIL/SENHA
   ============================================================ */
export async function login(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: cred.user, error: null };
  } catch (e) {
    return { user: null, error: traduzErro(e.code) };
  }
}

/* ============================================================
   LOGIN COM GOOGLE
   ============================================================ */
export async function loginGoogle() {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return { user: cred.user, error: null };
  } catch (e) {
    return { user: null, error: traduzErro(e.code) };
  }
}

/* ============================================================
   LOGOUT
   ============================================================ */
export async function logout() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (e) {
    return { error: traduzErro(e.code) };
  }
}

/* ============================================================
   RECUPERAR SENHA
   ============================================================ */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (e) {
    return { error: traduzErro(e.code) };
  }
}

/* ============================================================
   OBSERVAR ESTADO
   ============================================================ */
export function onUser(callback) {
  return onAuthStateChanged(auth, callback);
}

/* ============================================================
   PROTEÇÃO DE ROTAS
   ============================================================ */
export function protectRoute(user, currentPath = window.location.pathname) {
  const isProtected = PROTECTED_ROUTES.some((r) => currentPath.includes(r));
  if (isProtected && !user) {
    const redirect = encodeURIComponent(currentPath);
    window.location.href = `/?auth=login&redirect=${redirect}`;
    return false;
  }
  return true;
}

/* ============================================================
   TRADUÇÃO DE ERROS
   ============================================================ */
function traduzErro(code) {
  const map = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "Senha muito fraca. Use no mínimo 6 caracteres.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/popup-closed-by-user": "Login cancelado.",
    "auth/popup-blocked": "Permita popups para fazer login com Google.",
    "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
    "auth/operation-not-allowed": "Método de login desativado no Firebase.",
    "auth/unauthorized-domain": "Domínio não autorizado no Firebase. Adicione 127.0.0.1 em Authorized domains.",
    "auth/internal-error": "Erro interno. Recarregue a página."
  };
  return map[code] || "Erro: " + code;
}