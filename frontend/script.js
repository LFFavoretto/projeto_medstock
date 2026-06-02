console.log("JS carregado");

// ===== CÓDIGO DASHBOARD =====
const ctx = document.getElementById("graficoInsumos");

if (ctx) {
  let grafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["1ª semana", "2ª semana", "3ª semana", "4ª semana"],
      datasets: [
        {
          label: "Entrada",
          data: [],
          backgroundColor: "#8bc34a",
        },
        {
          label: "Saída",
          data: [],
          backgroundColor: "#f4511e",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  async function carregarDados(mes) {
    try {
      const resposta = await fetch("../dados.json");
      const dados = await resposta.json();

      const dadosMes = dados[mes];

      grafico.data.datasets[0].data = dadosMes.entrada;
      grafico.data.datasets[1].data = dadosMes.saida;

      grafico.update();
      atualizarDashboardInfo();
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
    }
  }

  const mesSelect = document.getElementById("mes");
  if (mesSelect) {
    mesSelect.addEventListener("change", function () {
      carregarDados(this.value);
    });
    carregarDados("1");
  }
}

function atualizarDashboardInfo() {
  const statUnidades = document.getElementById("statUnidades");
  const statPedidos = document.getElementById("statPedidos");
  const statProdutos = document.getElementById("statProdutos");
  const statFornecedores = document.getElementById("statFornecedores");
  const lista = document.getElementById("listaBaixoEstoque");

  if (statUnidades) statUnidades.textContent = 50;
  if (statPedidos) statPedidos.textContent = 20;
  if (statProdutos) statProdutos.textContent = 100;
  if (statFornecedores) statFornecedores.textContent = 100;

  if (lista) {
    const itens = [
      "Unidade Centro",
      "Posto São José",
      "UBS Nova Esperança",
      "Clínica Santa Maria",
      "Unidade Jardim",
    ];
    lista.innerHTML = itens.map((item) => `<li>${item}</li>`).join("");
  }
}

// ===== CÓDIGO MOVIMENTAÇÃO =====

// URLs da API
const API_URL = "http://localhost:3000";
const ESTOQUE_API = `${API_URL}/estoque`;

// Variáveis globais
let movimentacoes = [];
let paginaAtual = 1;
const itensPorPagina = 10;

// Inicializar página de movimentação
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("tabelaMovimentacoes")) {
    carregarMovimentacoes();
    carregarProdutos();
    carregarUnidades();

    // Event listeners
    document
      .getElementById("filtroTabela")
      .addEventListener("keyup", filtrarTabela);
    document
      .getElementById("filtroTipo")
      .addEventListener("change", filtrarTabela);
    document
      .getElementById("formMovimentacao")
      .addEventListener("submit", salvarMovimentacao);
  }
});

// ===== FUNÇÕES DE MOVIMENTAÇÃO =====

async function carregarMovimentacoes() {
  try {
    const response = await fetch(ESTOQUE_API);

    if (!response.ok) {
      throw new Error("Erro ao carregar movimentações");
    }

    movimentacoes = await response.json();
    exibirMovimentacoes(movimentacoes);
  } catch (erro) {
    console.error("Erro:", erro);
    exibirErro("Erro ao carregar movimentações");
  }
}

function exibirMovimentacoes(dados) {
  const tbody = document.getElementById("corpoTabela");

  if (!dados || dados.length === 0) {
    tbody.innerHTML =
      '<tr class="linha-vazia"><td colspan="8">Nenhuma movimentação registrada</td></tr>';
    document.getElementById("paginacao").innerHTML = "";
    return;
  }

  // Paginação
  const totalPaginas = Math.ceil(dados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const dadosPaginados = dados.slice(inicio, fim);

  // Montar tabela
  tbody.innerHTML = dadosPaginados
    .map(
      (mov) => `
        <tr>
            <td>${mov.produto || "N/A"}</td>
            <td>${mov.lote || "-"}</td>
            <td>${mov.quantidade}</td>
            <td>
                <span class="badge-${mov.tipo_movimentacao}">
                    ${mov.tipo_movimentacao === "entrada" ? "📥 Entrada" : "📤 Saída"}
                </span>
            </td>
            <td>${mov.unidade || "N/A"}</td>
            <td>${mov.usuario || "N/A"}</td>
            <td>${formatarData(mov.data_movimentacao)}</td>
            <td>
                <div class="acoes">
                    <button class="btn-acao editar" title="Editar">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn-acao deletar" title="Deletar" onclick="deletarMovimentacao(${mov.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");

  // Exibir paginação
  exibirPaginacao(totalPaginas);
}

function exibirPaginacao(totalPaginas) {
  const paginacao = document.getElementById("paginacao");
  let html = "";

  if (paginaAtual > 1) {
    html += `<button class="btn-pagina" onclick="irParaPagina(${paginaAtual - 1})">← Anterior</button>`;
  }

  for (let i = 1; i <= totalPaginas; i++) {
    const classe = i === paginaAtual ? "ativo" : "";
    html += `<button class="btn-pagina ${classe}" onclick="irParaPagina(${i})">${i}</button>`;
  }

  if (paginaAtual < totalPaginas) {
    html += `<button class="btn-pagina" onclick="irParaPagina(${paginaAtual + 1})">Próxima →</button>`;
  }

  paginacao.innerHTML = html;
}

function irParaPagina(numero) {
  paginaAtual = numero;
  exibirMovimentacoes(movimentacoes);
  window.scrollTo(0, 0);
}

function filtrarTabela() {
  const busca = document.getElementById("filtroTabela").value.toLowerCase();
  const tipo = document.getElementById("filtroTipo").value;

  let filtrados = movimentacoes.filter((mov) => {
    const atendeBusca =
      !busca ||
      mov.produto?.toLowerCase().includes(busca) ||
      mov.usuario?.toLowerCase().includes(busca) ||
      mov.unidade?.toLowerCase().includes(busca);

    const atendeTipo = !tipo || mov.tipo_movimentacao === tipo;

    return atendeBusca && atendeTipo;
  });

  paginaAtual = 1;
  exibirMovimentacoes(filtrados);
}

async function carregarProdutos() {
  try {
    const response = await fetch(`${API_URL}/produtos`);
    if (response.ok) {
      const produtos = await response.json();
      const select = document.getElementById("selectProduto");
      select.innerHTML =
        '<option value="">Selecione um produto</option>' +
        produtos
          .map((p) => `<option value="${p.id}">${p.nome}</option>`)
          .join("");
    }
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

async function carregarUnidades() {
  try {
    const response = await fetch(`${API_URL}/unidades`);
    if (response.ok) {
      const unidades = await response.json();
      const select = document.getElementById("selectUnidade");
      select.innerHTML =
        '<option value="">Selecione uma unidade</option>' +
        unidades
          .map((u) => `<option value="${u.id}">${u.nome}</option>`)
          .join("");
    }
  } catch (erro) {
    console.error("Erro ao carregar unidades:", erro);
  }
}

function abrirModalNovaMovimentacao() {
  document.getElementById("modalNovaMovimentacao").classList.add("ativo");
}

function fecharModalNovaMovimentacao() {
  document.getElementById("modalNovaMovimentacao").classList.remove("ativo");
  document.getElementById("formMovimentacao").reset();
}

async function salvarMovimentacao(event) {
  event.preventDefault();

  const dados = {
    id_unidade_saude: document.getElementById("selectUnidade").value,
    id_produtos: document.getElementById("selectProduto").value,
    id_usuarios: 1, // Ajuste conforme necessário (usuário logado)
    tipo_movimentacao: document.getElementById("tipoMovimentacao").value,
    quantidade: parseInt(document.getElementById("quantidade").value),
    lote: document.getElementById("lote").value || null,
    data_validade: document.getElementById("dataValidade").value || null,
    observacoes: document.getElementById("observacoes").value || null,
  };

  try {
    const response = await fetch(ESTOQUE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    if (response.ok) {
      exibirSucesso("Movimentação registrada com sucesso!");
      fecharModalNovaMovimentacao();
      carregarMovimentacoes();
    } else {
      const erro = await response.text();
      exibirErro(erro || "Erro ao salvar movimentação");
    }
  } catch (erro) {
    console.error("Erro:", erro);
    exibirErro("Erro ao conectar com o servidor");
  }
}

async function deletarMovimentacao(id) {
  if (confirm("Deseja realmente deletar esta movimentação?")) {
    try {
      const response = await fetch(`${ESTOQUE_API}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        exibirSucesso("Movimentação deletada com sucesso!");
        carregarMovimentacoes();
      } else {
        exibirErro("Erro ao deletar movimentação");
      }
    } catch (erro) {
      console.error("Erro:", erro);
      exibirErro("Erro ao conectar com o servidor");
    }
  }
}

// ===== FUNÇÕES UTILITÁRIAS =====

function formatarData(data) {
  if (!data) return "-";
  const d = new Date(data);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function exibirSucesso(mensagem) {
  alert(mensagem); // Substitua por toast/notificação melhor posteriormente
  console.log("Sucesso:", mensagem);
}

function exibirErro(mensagem) {
  alert(`Erro: ${mensagem}`);
  console.error("Erro:", mensagem);
}

// Fechar modal ao clicar fora dele
window.addEventListener("click", function (event) {
  const modal = document.getElementById("modalNovaMovimentacao");
  if (modal && event.target === modal) {
    fecharModalNovaMovimentacao();
  }
});

// ===== CÓDIGO UNIDADES =====

const UNIDADES_API = `${API_URL}/unidades`;

let unidades = [];
let paginaAtualUnidades = 1;
let unidadeEmEdicao = null;

// Inicializar página de unidades
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("tabelaUnidades")) {
    carregarUnidadesTabela();

    // Event listeners
    document
      .getElementById("filtroTabela")
      .addEventListener("keyup", filtrarTabelaUnidades);
    document
      .getElementById("formUnidade")
      .addEventListener("submit", salvarUnidade);
  }
});

// ===== FUNÇÕES DE UNIDADES =====

async function carregarUnidadesTabela() {
  try {
    const response = await fetch(UNIDADES_API);

    if (!response.ok) {
      throw new Error("Erro ao carregar unidades");
    }

    unidades = await response.json();
    exibirUnidades(unidades);
  } catch (erro) {
    console.error("Erro:", erro);
    exibirErro("Erro ao carregar unidades");
  }
}

function exibirUnidades(dados) {
  const tbody = document.getElementById("corpoTabela");

  if (!dados || dados.length === 0) {
    tbody.innerHTML =
      '<tr class="linha-vazia"><td colspan="5">Nenhuma unidade de saúde registrada</td></tr>';
    document.getElementById("paginacao").innerHTML = "";
    return;
  }

  // Paginação
  const totalPaginas = Math.ceil(dados.length / itensPorPagina);
  const inicio = (paginaAtualUnidades - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const dadosPaginados = dados.slice(inicio, fim);

  // Montar tabela
  tbody.innerHTML = dadosPaginados
    .map(
      (unidade) => `
        <tr>
            <td><strong>${unidade.nome}</strong></td>
            <td>${unidade.logradouro || "-"}</td>
            <td>${unidade.bairro || "-"}</td>
            <td>${unidade.numero || "-"}</td>
            <td>
                <div class="acoes">
                    <button class="btn-acao editar" title="Editar" onclick="editarUnidade(${unidade.id}, '${unidade.nome}', '${unidade.logradouro}', '${unidade.bairro}', '${unidade.numero}')">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn-acao deletar" title="Deletar" onclick="deletarUnidade(${unidade.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");

  // Exibir paginação
  exibirPaginacaoUnidades(totalPaginas);
}

function exibirPaginacaoUnidades(totalPaginas) {
  const paginacao = document.getElementById("paginacao");
  let html = "";

  if (paginaAtualUnidades > 1) {
    html += `<button class="btn-pagina" onclick="irParaPaginaUnidades(${paginaAtualUnidades - 1})">← Anterior</button>`;
  }

  for (let i = 1; i <= totalPaginas; i++) {
    const classe = i === paginaAtualUnidades ? "ativo" : "";
    html += `<button class="btn-pagina ${classe}" onclick="irParaPaginaUnidades(${i})">${i}</button>`;
  }

  if (paginaAtualUnidades < totalPaginas) {
    html += `<button class="btn-pagina" onclick="irParaPaginaUnidades(${paginaAtualUnidades + 1})">Próxima →</button>`;
  }

  paginacao.innerHTML = html;
}

function irParaPaginaUnidades(numero) {
  paginaAtualUnidades = numero;
  exibirUnidades(unidades);
  window.scrollTo(0, 0);
}

function filtrarTabelaUnidades() {
  const busca = document.getElementById("filtroTabela").value.toLowerCase();

  let filtrados = unidades.filter((unidade) => {
    return (
      !busca ||
      unidade.nome?.toLowerCase().includes(busca) ||
      unidade.logradouro?.toLowerCase().includes(busca) ||
      unidade.bairro?.toLowerCase().includes(busca) ||
      unidade.numero?.toLowerCase().includes(busca)
    );
  });

  paginaAtualUnidades = 1;
  exibirUnidades(filtrados);
}

function abrirModalNovaUnidade() {
  unidadeEmEdicao = null;
  document.getElementById("unidadeId").value = "";
  document.getElementById("formUnidade").reset();
  document.getElementById("tituloModal").textContent = "Nova Unidade de Saúde";
  document.getElementById("modalNovaUnidade").classList.add("ativo");
}

function fecharModalNovaUnidade() {
  document.getElementById("modalNovaUnidade").classList.remove("ativo");
  document.getElementById("formUnidade").reset();
  unidadeEmEdicao = null;
}

function editarUnidade(id, nome, logradouro, bairro, numero) {
  unidadeEmEdicao = id;
  document.getElementById("unidadeId").value = id;
  document.getElementById("nome").value = nome;
  document.getElementById("logradouro").value = logradouro;
  document.getElementById("bairro").value = bairro;
  document.getElementById("numero").value = numero;
  document.getElementById("tituloModal").textContent =
    "Editar Unidade de Saúde";
  document.getElementById("modalNovaUnidade").classList.add("ativo");
}

async function salvarUnidade(event) {
  event.preventDefault();

  const dados = {
    nome: document.getElementById("nome").value,
    logradouro: document.getElementById("logradouro").value,
    bairro: document.getElementById("bairro").value,
    numero: document.getElementById("numero").value,
  };

  try {
    let response;
    const id = document.getElementById("unidadeId").value;

    if (id) {
      // Editar
      response = await fetch(`${UNIDADES_API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });
    } else {
      // Criar
      response = await fetch(UNIDADES_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });
    }

    if (response.ok) {
      exibirSucesso(
        id ? "Unidade atualizada com sucesso!" : "Unidade criada com sucesso!",
      );
      fecharModalNovaUnidade();
      carregarUnidadesTabela();
    } else {
      const erro = await response.text();
      exibirErro(erro || "Erro ao salvar unidade");
    }
  } catch (erro) {
    console.error("Erro:", erro);
    exibirErro("Erro ao conectar com o servidor");
  }
}

async function deletarUnidade(id) {
  if (confirm("Deseja realmente deletar esta unidade?")) {
    try {
      const response = await fetch(`${UNIDADES_API}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        exibirSucesso("Unidade deletada com sucesso!");
        carregarUnidadesTabela();
      } else {
        const erro = await response.text();
        exibirErro(erro || "Erro ao deletar unidade");
      }
    } catch (erro) {
      console.error("Erro:", erro);
      exibirErro("Erro ao conectar com o servidor");
    }
  }
}

// Fechar modal ao clicar fora dele
window.addEventListener("click", function (event) {
  const modal = document.getElementById("modalNovaUnidade");
  if (modal && event.target === modal) {
    fecharModalNovaUnidade();
  }
});
