let categorias = {};
let categoriaAtual = null;
let selecionado = null;

/* INIT */
function initCategorias() {
  const grid = document.getElementById("gridCategorias");
  for (let i = 1; i <= 8; i++) {
    const nome = "Banners " + i;
    categorias[nome] = [];
    const div = document.createElement("div");
    div.className = "card";
    div.innerText = nome;
    div.onclick = () => abrirCategoria(nome);
    grid.appendChild(div);
  }
}

/* TELAS */
function showTela(id) {
  document.querySelectorAll(".tela").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  limparDetalhes();
  if(document.getElementById("inputBusca")) document.getElementById("inputBusca").value = "";
}

function limparDetalhes() {
  selecionado = null;
  document.getElementById("titulo").innerText = "Selecione";
  document.getElementById("qtd").innerText = "-";
  document.getElementById("status").innerText = "-";
  const img = document.getElementById("imagem");
  img.style.display = "none";
  img.src = "";
}

/* ABRIR */
function abrirCategoria(nome) {
  categoriaAtual = nome;
  document.getElementById("tituloCategoria").innerText = nome;
  showTela("categoria");
  render();
}

/* PESQUISA */
function filtrarBanners() {
  const termo = document.getElementById("inputBusca").value.toLowerCase();
  const itens = categorias[categoriaAtual];
  
  const filtrados = itens.filter(b => 
    b.nome.toLowerCase().includes(termo) || 
    b.id.toString().includes(termo)
  );
  
  render(filtrados);
}

/* RENDER */
function render(dadosParaExibir = null) {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
  
  const banners = dadosParaExibir || categorias[categoriaAtual];

  banners.forEach(b => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerText = `#${b.id} - ${b.nome}`;
    div.onclick = () => selecionar(b);
    lista.appendChild(div);
  });
}

function selecionar(b) {
  selecionado = b;
  document.getElementById("titulo").innerText = b.nome;
  document.getElementById("qtd").innerText = b.qtd;
  const statusEl = document.getElementById("status");
  
  if (b.status === "Indisponível") {
    statusEl.innerText = "Cautelado por: " + b.responsavel;
  } else {
    statusEl.innerText = "Disponível";
  }

  const img = document.getElementById("imagem");
  img.src = b.img;
  img.style.display = "block";
}

/* ADD */
function adicionarBanner() {
  const id = idInput.value;
  const nome = nomeInput.value;
  const file = imgInput.files[0];

  if (!id || !nome || !file) return alert("Preencha tudo");

  const reader = new FileReader();
  reader.onload = e => {
    categorias[categoriaAtual].push({
      id, nome, img: e.target.result, qtd: 1, status: "Disponível", responsavel: null
    });
    document.getElementById("inputBusca").value = ""; // Limpa busca ao add
    render();
    idInput.value = ""; nomeInput.value = ""; imgInput.value = "";
  };
  reader.readAsDataURL(file);
}

/* CAUTELAR / DESCAUTELAR */
function cautelar() {
  if (!selecionado || selecionado.status === "Indisponível") return;
  document.getElementById("modalCautelar").style.display = "flex";
}

function confirmarCautelar() {
  const nome = document.getElementById("nomeCautelar").value;
  if (!nome || !selecionado) return;
  selecionado.status = "Indisponível";
  selecionado.responsavel = nome;
  selecionar(selecionado);
  fecharModais();
}

function descautelar() {
  if (!selecionado || selecionado.status === "Disponível") return;
  selecionado.status = "Disponível";
  selecionado.responsavel = null;
  selecionar(selecionado);
}

/* EDITAR */
function editar() {
  if (!selecionado) return;
  editarId.value = selecionado.id;
  editarNome.value = selecionado.nome;
  document.getElementById("modalEditar").style.display = "flex";
}

function salvarEdicao() {
  selecionado.id = editarId.value;
  selecionado.nome = editarNome.value;
  const file = editarImg.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
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

/* EXCLUIR */
function abrirModalExcluir() {
  if (!selecionado) return;
  document.getElementById("modalExcluir").style.display = "flex";
}

function confirmarExclusao() {
  categorias[categoriaAtual] = categorias[categoriaAtual].filter(b => b !== selecionado);
  limparDetalhes();
  fecharModais();
  render();
}

/* MODAIS */
function fecharModais() {
  document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
  if(document.getElementById("nomeCautelar")) document.getElementById("nomeCautelar").value = "";
}

initCategorias();