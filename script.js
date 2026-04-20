let categorias = {};
let categoriaAtual = null;
let selecionado = null;

// Inicializa os subsetores (1 a 20)
function initCategorias() {
  const grid = document.getElementById("gridCategorias");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const nome = "SUBSETOR " + i;
    categorias[nome] = [];
    const div = document.createElement("div");
    div.className = "card";
    div.innerText = nome;
    div.onclick = () => abrirCategoria(nome);
    grid.appendChild(div);
  }
}

// Controla a troca de telas e visibilidade do header
function showTela(id) {
  document.querySelectorAll(".tela").forEach((t) => t.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  const header = document.getElementById("headerPrincipal");
  if (header) {
    if (id === "home") {
      header.style.display = "flex";
      header.classList.add("header-home-absolute");
    } else {
      header.style.display = "none";
      header.classList.remove("header-home-absolute");
    }
  }
  limparDetalhes();
}

function limparDetalhes() {
  selecionado = null;
  document.getElementById("titulo").innerText = "AGUARDANDO SELEÇÃO";
  document.getElementById("qtd").innerText = "-";
  const statusEl = document.getElementById("status");
  statusEl.innerText = "-";
  statusEl.style.color = "inherit";
  const img = document.getElementById("imagem");
  img.style.display = "none";
  img.src = "";
}

function abrirCategoria(nome) {
  categoriaAtual = nome;
  document.getElementById("tituloCategoria").innerText = nome;
  showTela("categoria");
  render();
}

// Filtro de busca por nome ou ID
function filtrarBanners() {
  const termo = document.getElementById("inputBusca").value.toLowerCase();
  const itens = categorias[categoriaAtual];
  const filtrados = itens.filter(
    (b) => b.nome.toLowerCase().includes(termo) || b.id.toString().includes(termo)
  );
  render(filtrados);
}

// Renderiza a lista de itens da categoria
function render(dadosParaExibir = null) {
  const lista = document.getElementById("lista");
  const preview = document.getElementById("preview-container");
  const previewImg = document.getElementById("preview-img");
  lista.innerHTML = "";
  const banners = dadosParaExibir || categorias[categoriaAtual];

  banners.forEach((b) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerText = `LOTE: ${b.id} | ${b.nome}`;
    div.onclick = () => selecionar(b);

    div.onmouseenter = () => {
      const rect = div.getBoundingClientRect();
      previewImg.src = b.img;
      preview.style.display = "block";
      preview.style.left = rect.right + 15 + "px";
      preview.style.top = rect.top + "px";
    };
    div.onmouseleave = () => {
      preview.style.display = "none";
    };

    lista.appendChild(div);
  });
}

// --- LÓGICA DE SELEÇÃO E STATUS COM DATA/HORA ---

function obterDataHoraAtual() {
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR');
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} às ${hora}`;
}

function selecionar(b) {
  selecionado = b;
  document.getElementById("titulo").innerText = b.nome.toUpperCase();
  document.getElementById("qtd").innerText = b.qtd;
  const statusEl = document.getElementById("status");

  if (b.status === "Indisponível") {
    statusEl.innerText = `CAUTELADO POR: ${b.responsavel.toUpperCase()} EM ${b.dataHora}`;
    statusEl.style.color = "#f1c40f"; // Tom Coyote/Alerta
  } else if (b.status === "Disponível" && b.responsavel) {
    statusEl.innerText = `DESCAUTELADO POR: ${b.responsavel.toUpperCase()} EM ${b.dataHora}`;
    statusEl.style.color = "#2ecc71"; // Verde Sucesso
  } else {
    statusEl.innerText = "DISPONÍVEL";
    statusEl.style.color = "#2ecc71";
  }

  const img = document.getElementById("imagem");
  img.src = b.img;
  img.style.display = "block";
}

// --- FUNÇÕES DE AÇÃO (MODAIS) ---

function adicionarBanner() {
  const idI = document.getElementById("idInput");
  const nomeI = document.getElementById("nomeInput");
  const imgI = document.getElementById("imgInput");
  if (!idI.value || !nomeI.value || !imgI.files[0]) return alert("Preencha todos os campos.");

  const reader = new FileReader();
  reader.onload = (e) => {
    categorias[categoriaAtual].push({
      id: idI.value,
      nome: nomeI.value,
      img: e.target.result,
      qtd: 1,
      status: "Disponível",
      responsavel: null,
      dataHora: null
    });
    render();
    idI.value = "";
    nomeI.value = "";
    imgI.value = "";
  };
  reader.readAsDataURL(imgI.files[0]);
}

function cautelar() {
  if (selecionado && selecionado.status !== "Indisponível") {
    document.getElementById("modalCautelar").style.display = "flex";
  }
}

function confirmarCautelar() {
  const nome = document.getElementById("nomeCautelar").value;
  if (!nome) return alert("Informe o militar responsável.");
  
  selecionado.status = "Indisponível";
  selecionado.responsavel = nome;
  selecionado.dataHora = obterDataHoraAtual();
  
  selecionar(selecionado);
  document.getElementById("nomeCautelar").value = "";
  fecharModais();
}

function descautelar() {
  if (selecionado && selecionado.status === "Indisponível") {
    document.getElementById("modalDescautelar").style.display = "flex";
  }
}

function confirmarDescautelar() {
  const nomeRecebedor = document.getElementById("nomeDescautelar").value;
  if (!nomeRecebedor) return alert("Informe quem está recebendo o material.");

  selecionado.status = "Disponível";
  selecionado.responsavel = nomeRecebedor;
  selecionado.dataHora = obterDataHoraAtual();
  
  selecionar(selecionado);
  document.getElementById("nomeDescautelar").value = "";
  fecharModais();
}

function editar() {
  if (selecionado) {
    document.getElementById("editarId").value = selecionado.id;
    document.getElementById("editarNome").value = selecionado.nome;
    document.getElementById("modalEditar").style.display = "flex";
  }
}

function salvarEdicao() {
  selecionado.id = document.getElementById("editarId").value;
  selecionado.nome = document.getElementById("editarNome").value;
  const file = document.getElementById("editarImg").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      selecionado.img = e.target.result;
      render();
      selecionar(selecionado);
    };
    reader.readAsDataURL(file);
  } else {
    render();
    selecionar(selecionado);
  }
  fecharModais();
}

function abrirModalExcluir() {
  if (selecionado) document.getElementById("modalExcluir").style.display = "flex";
}

function confirmarExclusao() {
  categorias[categoriaAtual] = categorias[categoriaAtual].filter((b) => b !== selecionado);
  limparDetalhes();
  fecharModais();
  render();
}

function fecharModais() {
  document.querySelectorAll(".modal").forEach((m) => (m.style.display = "none"));
}

// Inicialização
initCategorias();
showTela('home');