// ============================================================
// FIREBASE-INIT.JS
// ============================================================
// Este arquivo é o "motor" que fala com o banco de dados.
// Você não precisa mexer neste arquivo — ele já vem pronto.
// Cada uma das suas 4 páginas de cálculo vai importar as funções
// daqui para: (1) exigir login, (2) salvar um acerto, (3) listar
// os acertos já salvos.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --------------------------------------------------------------
// checkConnection()
// Só testa se a configuração está preenchida corretamente.
// Usado na página inicial para mostrar a bolinha verde/vermelha.
// --------------------------------------------------------------
export async function checkConnection() {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "COLE_AQUI";
}

// --------------------------------------------------------------
// login(email, senha)
// Faz login. Use uma conta que você mesmo cria no painel do
// Firebase (passo 5 do README.md) — não é a sua conta do Google.
// --------------------------------------------------------------
export function login(email, senha) {
  return signInWithEmailAndPassword(auth, email, senha);
}

export function logout() {
  return signOut(auth);
}

// --------------------------------------------------------------
// exigirLogin(callback)
// Coloque isso no topo de cada página de cálculo. Se ninguém
// estiver logado, ela redireciona para a tela de login.
// Se estiver logado, executa o callback com o usuário.
// --------------------------------------------------------------
export function exigirLogin(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "../login.html";
    } else {
      callback(user);
    }
  });
}

// --------------------------------------------------------------
// salvarAcerto(tipo, dados)
// tipo: uma string fixa identificando o módulo, por exemplo:
//   "brigadista" | "comissionado_sem_vinculo" |
//   "comissionado_com_vinculo" | "efetivo"
// dados: um objeto JS comum com os campos do cálculo
//   (ex: { matricula, nome, competencia, valores: {...} })
//
// Retorna o ID do documento salvo.
// --------------------------------------------------------------
export async function salvarAcerto(tipo, dados) {
  const ref = await addDoc(collection(db, "acertos"), {
    tipo,
    dados,
    criadoEm: serverTimestamp(),
    criadoPor: auth.currentUser ? auth.currentUser.email : "desconhecido"
  });
  return ref.id;
}

// --------------------------------------------------------------
// listarAcertos(tipo)
// Devolve todos os acertos salvos de um tipo específico,
// mais recentes primeiro.
// --------------------------------------------------------------
export async function listarAcertos(tipo) {
  const q = query(
    collection(db, "acertos"),
    where("tipo", "==", tipo),
    orderBy("criadoEm", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function listarTodos() { 
  const q = query(collection(db, "acertos"), orderBy("criadoEm", "desc")); 
  const snap = await getDocs(q); 
  return snap.docs.map(d => ({ id: d.id, ...d.data() })); 
}
export function observarLogin(callback) { onAuthStateChanged(auth, callback); } 
export async function excluirAcerto(id) { await deleteDoc(doc(db, "acertos", id)); }
export async function buscarAcerto(id) { 
  const snap = await getDoc(doc(db, "acertos", id)); 
  return snap.exists() ? { id: snap.id, ...snap.data() } : null; } 
export async function atualizarAcerto(id, tipo, dados) { 
  await setDoc(doc(db, "acertos", id), { tipo, dados, atualizadoEm: serverTimestamp() }, { merge: true }); }
