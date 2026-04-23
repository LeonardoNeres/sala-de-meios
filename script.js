// 1. Importações (Mantive sua versão 10.12.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 2. Configuração (Sua chave real)
const firebaseConfig = {
  apiKey: "AIzaSyDQqDTQ28BdfqNXjec463JF3uPHsn0xsJs",
  authDomain: "sala-de-meios-4fbe0.firebaseapp.com",
  projectId: "sala-de-meios-4fbe0",
  storageBucket: "sala-de-meios-4fbe0.firebasestorage.app",
  messagingSenderId: "342231070050",
  appId: "1:342231070050:web:5b4a2a4f80ffc94ad6683b",
  measurementId: "G-MW025LZS5B",
};

// 3. Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- LOGIN (Mantido) ---
window.fazerLogin = function () {
  const email = document.getElementById("email-login").value;
  const pass = document.getElementById("pass-login").value;
  if (!email || !pass) return alert("Preencha os campos.");
  signInWithEmailAndPassword(auth, email, pass).catch(() =>
    alert("Erro no login."),
  );
};

window.fazerLogout = function () {
  signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  const loginForm = document.getElementById("login-form");
  const adminLogged = document.getElementById("admin-logged");
  if (user) {
    document.body.classList.add("logged-in");
    loginForm.style.display = "none";
    adminLogged.style.display = "block";
  } else {
    document.body.classList.remove("logged-in");
    loginForm.style.display = "block";
    adminLogged.style.display = "none";
  }
});

// --- LÓGICA DO SISTEMA ---
let categorias = {};
let categoriaAtual = null;
let selecionado = null;

window.initCategorias = function () {
  const grid = document.getElementById("gridCategorias");
  if (!grid) return;
  grid.innerHTML = "";

  // 1. Crie a lista com os nomes reais aqui (adicione quantos quiser)
  const nomesReais = [
    "PROGRESSÃO DIURNA/NOTURNA",
    "PATRULHA",
    "ARMAMENTO 1",
    "ARMAMENTO 2",
    "ARMAMENTO 3",
    "EXPOSIÇÃO 1",
    "EXPOSIÇÃO 2",
    "EXPOSIÇÃO 3",
    "MISSÃO",
    "HPPS 1",
    "TRANSPOSIÇÃO DO CURSO D'ÁGUA",
    "TECNICAS ESPECIAIS 1",
    "TECNICAS ESPECIAIS 2",
    "TECNICAS ESPECIAIS 3",
    "COMUNICAÇÕES",
    "LATRINA",
    "VIATURAS",
    "ONU",
    "TOPOGRAFIA",
    "POBS",
    "MANIBILIDADE DE GC",
    "TFM",
    "CONTROLE DE RODOVIAS"
    // Continue a lista aqui separando por vírgula...
  ];

  // 2. O código agora percorre a sua lista em vez de contar até 20
  nomesReais.forEach((nome) => {
    categorias[nome] = []; // Inicializa a categoria na memória
    const div = document.createElement("div");
    div.className = "card";
    div.innerText = nome;
    div.onclick = () => abrirCategoria(nome);
    grid.appendChild(div);
  });
};

window.showTela = function (id) {
  document.querySelectorAll(".tela").forEach((t) => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  // Pega o rodapé e decide se mostra (flex) ou esconde (none)
  const footer = document.querySelector(".footer-contatos");
  if (footer) {
    footer.style.display = (id === 'home') ? "flex" : "none";
  }

  const header = document.getElementById("headerPrincipal");
  if (header) header.style.display = id === "home" ? "flex" : "none";
  
  limparDetalhes();
};

window.abrirCategoria = async function (nome) {
  categoriaAtual = nome;
  document.getElementById("tituloCategoria").innerText = nome;
  showTela("categoria");
  await render();
};

window.render = async function (dadosManuais = null) {
  const lista = document.getElementById("lista");
  lista.innerHTML =
    "<p style='padding:15px; color:white'>Carregando material...</p>";

  let banners = [];
  if (dadosManuais) {
    banners = dadosManuais;
  } else {
    try {
      const q = query(
        collection(db, "banners"),
        where("categoria", "==", categoriaAtual),
        orderBy("idLote", "asc")
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        banners.push({ docId: docSnap.id, ...docSnap.data() });
      });
    } catch (error) {
      return alert("Erro ao carregar banners.");
    }
  }

  lista.innerHTML = "";
  banners.forEach((b) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerText = `ID: ${b.idLote} | ${b.nome}`;
    div.onclick = () => selecionar(b);
    lista.appendChild(div);
  });
};

window.selecionar = function (b) {
  selecionado = b;
  document.getElementById("titulo").innerText = b.nome.toUpperCase();
  document.getElementById("qtd").innerText = b.qtd || 1;
  const st = document.getElementById("status");
  st.innerText =
    b.status === "Indisponível" ? `CAUTELADO: ${b.responsavel}` : "DISPONÍVEL";
  st.style.color = b.status === "Indisponível" ? "#f1c40f" : "#2ecc71";
  const img = document.getElementById("imagem");
  img.src = b.img;
  img.style.display = "block";
};

// --- ADICIONAR (Base64) ---
window.adicionarBanner = async function () {
  const idI = document.getElementById("idInput");
  const nomeI = document.getElementById("nomeInput");
  const imgI = document.getElementById("imgInput");

  if (!idI.value || !nomeI.value || !imgI.files[0])
    return alert("Preencha tudo!");

  const loadingBtn = document.querySelector(".btn-add");
  loadingBtn.innerText = "Processando...";
  loadingBtn.disabled = true;

  const reader = new FileReader();
  reader.readAsDataURL(imgI.files[0]);

  reader.onload = async function () {
    try {
      await addDoc(collection(db, "banners"), {
        idLote: idI.value,
        nome: nomeI.value,
        img: reader.result,
        categoria: categoriaAtual,
        qtd: 1,
        status: "Disponível",
        dataCriacao: new Date(),
      });
      alert("Salvo no Firestore!");
      idI.value = "";
      nomeI.value = "";
      imgI.value = "";
      await render();
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      loadingBtn.innerText = "Adicionar";
      loadingBtn.disabled = false;
    }
  };
};

// --- EDITAR (No Banco de Dados) ---
window.editar = function () {
  if (selecionado) {
    document.getElementById("editarId").value = selecionado.idLote;
    document.getElementById("editarNome").value = selecionado.nome;
    document.getElementById("modalEditar").style.display = "flex";
  }
};

window.salvarEdicao = async function () {
  if (!selecionado.docId) return alert("Erro: ID do documento não encontrado.");

  const novoId = document.getElementById("editarId").value;
  const novoNome = document.getElementById("editarNome").value;
  const novaImgFile = document.getElementById("editarImg").files[0];

  const btn = document.querySelector("#modalEditar button");
  btn.innerText = "Salvando...";

  try {
    const dadosAtualizados = {
      idLote: novoId,
      nome: novoNome,
      dataEdicao: new Date(),
    };

    if (novaImgFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        dadosAtualizados.img = e.target.result;
        await updateDoc(
          doc(db, "banners", selecionado.docId),
          dadosAtualizados,
        );
        finalizarEdicaoFirebase();
      };
      reader.readAsDataURL(novaImgFile);
    } else {
      await updateDoc(doc(db, "banners", selecionado.docId), dadosAtualizados);
      finalizarEdicaoFirebase();
    }
  } catch (error) {
    alert("Erro ao atualizar.");
    btn.innerText = "Salvar";
  }
};

async function finalizarEdicaoFirebase() {
  alert("Atualizado com sucesso!");
  fecharModais();
  await render();
  limparDetalhes();
}

// --- EXCLUIR (No Banco de Dados) ---
window.abrirModalExcluir = function () {
  if (selecionado)
    document.getElementById("modalExcluir").style.display = "flex";
};

window.confirmarExclusao = async function () {
  if (!selecionado.docId) return alert("Erro: ID não encontrado.");

  try {
    await deleteDoc(doc(db, "banners", selecionado.docId));
    alert("Excluído com sucesso!");
    fecharModais();
    limparDetalhes();
    await render();
  } catch (error) {
    alert("Erro ao excluir.");
  }
};

// --- CAUTELA (Local/Firestore) ---
window.confirmarCautelar = async function () {
  const nome = document.getElementById("nomeCautelar").value;
  if (!nome) return alert("Identifique o militar.");

  await updateDoc(doc(db, "banners", selecionado.docId), {
    status: "Indisponível",
    responsavel: nome,
  });

  fecharModais();
  await render();
  limparDetalhes();
};

window.confirmarDescautelar = async function () {
  const recebedor = document.getElementById("nomeDescautelar").value;
  if (!recebedor) return alert("Identifique quem recebeu.");

  await updateDoc(doc(db, "banners", selecionado.docId), {
    status: "Disponível",
    responsavel: null,
  });

  fecharModais();
  await render();
  limparDetalhes();
};

// --- UTILITÁRIOS ---
window.fecharModais = function () {
  document
    .querySelectorAll(".modal")
    .forEach((m) => (m.style.display = "none"));
};

window.limparDetalhes = function () {
  selecionado = null;
  document.getElementById("titulo").innerText = "AGUARDANDO SELEÇÃO";
  document.getElementById("qtd").innerText = "-";
  document.getElementById("status").innerText = "-";
  document.getElementById("imagem").style.display = "none";
};

window.filtrarBanners = async function () {
  const termo = document.getElementById("inputBusca").value.toLowerCase();
  const q = query(
    collection(db, "banners"),
    where("categoria", "==", categoriaAtual),
    orderBy("idLote", "asc")
  );
  const snap = await getDocs(q);
  let lista = [];
  snap.forEach((d) => {
    const data = d.data();
    if (
      data.nome.toLowerCase().includes(termo) ||
      data.idLote.includes(termo)
    ) {
      lista.push({ docId: d.id, ...data });
    }
  });
  render(lista);
};

window.cautelar = () =>
  selecionado &&
  (document.getElementById("modalCautelar").style.display = "flex");
window.descautelar = () =>
  selecionado?.status === "Indisponível" &&
  (document.getElementById("modalDescautelar").style.display = "flex");

initCategorias();
showTela("home");
