/* ============================================================
   VITRUVIANO · Configuração do Firebase
   Projeto: vitruvio-f4714
   ============================================================ */

export const firebaseConfig = {
  apiKey: "AIzaSyCqFeiisNTcDeFlO-IuThBmeuFitssMUd0",
  authDomain: "vitruvio-f4714.firebaseapp.com",
  projectId: "vitruvio-f4714",
  storageBucket: "vitruvio-f4714.firebasestorage.app",
  messagingSenderId: "298252279512",
  appId: "1:298252279512:web:44903ab6255990b3db01ad",
  measurementId: "G-9XN1TJ762E"
};

/* ============================================================
   Rotas que exigem login
   ============================================================ */
export const PROTECTED_ROUTES = ["/ia/", "/premium/", "/blog/"];

/* ============================================================
   Rotas onde usuário logado é redirecionado
   ============================================================ */
export const AUTH_ONLY_ROUTES = ["/login/", "/cadastro/"];