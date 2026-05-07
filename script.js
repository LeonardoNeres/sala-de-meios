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
import { arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
    "ORIENTAÇÃO DIURNA/NOTURNA",
    "PATRULHA",
    "ARMAMENTO",
    "EXPOSIÇÃO",
    "MISSÃO",
    "HPPS",
    "TRANSPOSIÇÃO DO CURSO D'ÁGUA",
    "TECNICAS ESPECIAIS",
    "COMUNICAÇÕES",
    "LATRINA",
    "VIATURAS",
    "ONU",
    "TOPOGRAFIA",
    "POBS",
    "MANIBILIDADE DE GC",
    "TFM",
    "CONTROLE DE RODOVIAS",
    "CUNHETE",
    "PLANO DE SEÇÃO"
    // Continue a lista aqui separando por vírgula...
  ];

  window.initDiversos = function () {
  const grid = document.getElementById("gridDiversos");
  if (!grid) return;
  grid.innerHTML = "";

  // Defina aqui as subcategorias que ficarão dentro de "Diversos"
  const nomesDiversos = [
    "ORIENTAÇÃO",
    "CAIXÃO DE AREIA",
    "IPT",
    "OUTROS"
  ];

  nomesDiversos.forEach((nome) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerText = nome;
    // Reaproveita a função de abrir categoria que você já tem
    div.onclick = () => abrirCategoria(nome); 
    grid.appendChild(div);
  });
};

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
  // Esconde todas as telas limpando a classe active
  document.querySelectorAll(".tela").forEach((t) => {
    t.classList.remove("active");
    t.style.display = "none"; // Garante o sumiço visual total
  });

  // Mostra a tela correta
  const telaAlvo = document.getElementById(id);
  if (telaAlvo) {
    telaAlvo.classList.add("active");
    telaAlvo.style.display = "flex";
  }

  // Lógica do Rodapé: Só existe na 'home'
  const footer = document.querySelector(".footer-contatos");
  if (footer) {
    footer.style.display = (id === 'home') ? "flex" : "none";
  }

  // Controle do Header
  const header = document.getElementById("headerPrincipal");
  if (header) header.style.display = (id === "home") ? "flex" : "none";
  
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
  const spanContador = document.getElementById("contadorBanners"); 
  
  if (!lista) return;
  lista.innerHTML = "<p style='padding:15px; color:white'>Carregando material...</p>";

  let banners = [];
  if (dadosManuais) {
    banners = dadosManuais;
  } else {
    try {
      let q;
      
      // Mantendo sua lógica de categorias unificadas
      if (categoriaAtual === "ARMAMENTO") {
        q = query(collection(db, "banners"), where("categoria", "in", ["ARMAMENTO", "ARMAMENTO 1", "ARMAMENTO 2", "ARMAMENTO 3"]), orderBy("idLote", "asc"));
      } else if (categoriaAtual === "EXPOSIÇÃO") {
        q = query(collection(db, "banners"), where("categoria", "in", ["EXPOSIÇÃO", "EXPOSIÇÃO 1", "EXPOSIÇÃO 2", "EXPOSIÇÃO 3"]), orderBy("idLote", "asc"));
      } else if (categoriaAtual === "TECNICAS ESPECIAIS") {
        q = query(collection(db, "banners"), where("categoria", "in", ["TECNICAS ESPECIAIS", "TECNICAS ESPECIAIS 1", "TECNICAS ESPECIAIS 2", "TECNICAS ESPECIAIS 3"]), orderBy("idLote", "asc"));
      } else if (categoriaAtual === "HPPS") {
        q = query(collection(db, "banners"), where("categoria", "in", ["HPPS", "HPPS 1"]), orderBy("idLote", "asc"));
      } else {
        q = query(collection(db, "banners"), where("categoria", "==", categoriaAtual), orderBy("idLote", "asc"));
      }

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        banners.push({ docId: docSnap.id, ...docSnap.data() });
      });
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      return alert("Erro ao carregar banners.");
    }
  }

  // Atualiza o número no círculo (badge)
  if (spanContador) {
    spanContador.innerText = banners.length;
  }

  lista.innerHTML = "";
  banners.forEach((b) => {
    const div = document.createElement("div");
    const statusAtual = b.status === "Indisponível" ? "indisponivel" : "disponivel";
    div.className = `item ${statusAtual}`;
    div.innerText = `ID: ${b.idLote} | ${b.nome}`;
    div.onclick = () => selecionar(b);
    lista.appendChild(div);
  });
};

window.selecionar = function (b) {
  selecionado = b;

  // 1. LIMPEZA VISUAL: Remove o destaque de todos os itens da lista[cite: 2]
  document.querySelectorAll("#lista .item").forEach(item => {
    item.classList.remove("item-selecionado");
  });

  // 2. APLICAÇÃO DO DESTAQUE: Procura o item clicado/selecionado e ativa a cor[cite: 2]
  const itensNaTela = Array.from(document.querySelectorAll("#lista .item"));
  const itemAlvo = itensNaTela.find(i => i.innerText.includes(b.idLote));
  if (itemAlvo) {
    itemAlvo.classList.add("item-selecionado");
  }

  // 3. ATUALIZAÇÃO DOS DETALHES (Seu código original)[cite: 2]
  document.getElementById("titulo").innerText = b.nome.toUpperCase();
  const st = document.getElementById("status");
  st.innerText = b.status === "Indisponível" ? `${b.responsavel}` : "DISPONÍVEL";
  st.style.color = b.status === "Indisponível" ? "#e74c3c" : "#2ecc71";
  
  const img = document.getElementById("imagem");
  img.src = b.img;
  img.style.display = "block";

  const listaHist = document.getElementById("historico-lista");
  if (listaHist) {
    listaHist.innerHTML = ""; 
    if (b.historico && Array.isArray(b.historico)) {
      b.historico.slice(-6).reverse().forEach(item => {
        const p = document.createElement("p");
        p.style.marginBottom = "3px";
        p.innerText = "• " + item;
        listaHist.appendChild(p);
      });
    } else {
      listaHist.innerHTML = "<span style='opacity:0.5'>Sem registros antigos.</span>";
    }
  }
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

  const agora = new Date();
  const registro = `Cautelado por ${nome} em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;

  let hist = selecionado.historico || [];
  hist.push(registro);
  if (hist.length > 5) hist.shift(); // Apaga o 6º mais antigo

  await updateDoc(doc(db, "banners", selecionado.docId), {
    status: "Indisponível",
    responsavel: registro,
    historico: hist
  });
  fecharModais(); await render(); limparDetalhes();
};

window.confirmarDescautelar = async function () {
  const recebedor = document.getElementById("nomeDescautelar").value;
  if (!recebedor) return alert("Identifique quem recebeu.");

  const agora = new Date();
  const registro = `Descautelado por ${recebedor} em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;

  let hist = selecionado.historico || [];
  hist.push(registro);
  if (hist.length > 5) hist.shift(); // Mantém só os últimos 5

  await updateDoc(doc(db, "banners", selecionado.docId), {
    status: "Disponível",
    responsavel: null,
    historico: hist
  });
  fecharModais(); await render(); limparDetalhes();
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
initDiversos();
showTela('home');

// LÓGICA DE MENU - COPIE E SUBSTITUA O FINAL DO SEU JS
const tratarMenu = () => {
  const btn = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay-menu");

  if (!btn || !sidebar || !overlay) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  });

  // Fecha ao clicar nos links da sidebar
  sidebar.addEventListener("click", (e) => {
    if (e.target.tagName === 'BUTTON') {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    }
  });
};

// Força a execução mesmo em módulos
setTimeout(tratarMenu, 500);

// ESCUTADOR DAS SETAS DO TECLADO[cite: 2]
document.addEventListener('keydown', (e) => {
  // Só executa se a tela de categorias/banners estiver visível[cite: 1]
  const telaCategoria = document.getElementById("categoria");
  if (!telaCategoria || !telaCategoria.classList.contains("active")) return;

  const itens = Array.from(document.querySelectorAll("#lista .item"));
  if (itens.length === 0) return;

  // Descobre em qual posição estamos na lista agora[cite: 2]
  let index = itens.findIndex(i => selecionado && i.innerText.includes(selecionado.idLote));

  if (e.key === "ArrowDown") {
    e.preventDefault(); // Evita que a página role para baixo[cite: 3]
    index = (index + 1 < itens.length) ? index + 1 : 0; // Vai para o próximo ou volta ao início
    itens[index].click(); // Simula o clique (dispara a função selecionar acima)[cite: 2]
    itens[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Segue o item com o scroll[cite: 3]
  } 
  else if (e.key === "ArrowUp") {
    e.preventDefault();
    index = (index - 1 >= 0) ? index - 1 : itens.length - 1; // Volta um ou vai para o fim
    itens[index].click();
    itens[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});