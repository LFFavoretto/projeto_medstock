// URLs da API
const API_URL = "http://localhost:3000";
const ESTOQUE_API = `${API_URL}/estoque`;

// Variáveis globais
let movimentacoes = [];
let movimentacoesFiltradas = [];
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
            throw new Error("Erro ao carregar movimentações");}

        movimentacoes = await response.json();
        
        movimentacoesFiltradas = movimentacoes;
        exibirMovimentacoes(movimentacoesFiltradas);
    } catch (erro) {
    console.error("Erro:", erro);
    exibirErro("Erro ao carregar movimentações");
    }
}

async function carregarProdutos() {
    try {
        const response = await fetch("http://localhost:3000/produtos");

        const produtos = await response.json();

        const select = document.getElementById("selectProduto");

        select.innerHTML = '<option value="">Selecione um produto</option>';

        produtos.forEach(produto => {
            select.innerHTML += `<option value="${produto.id}">${produto.nome}</option>`;
        });
    } catch (erro) {
        console.error("Erro ao carregar produtos",erro);
    }
}

async function carregarUnidades() {
    try {
        const response = await fetch("http://localhost:3000/unidades");

        const unidades = await response.json();

        const select = document.getElementById("selectUnidade");

        select.innerHTML = '<option value="">Selecione uma unidade</option>';

        unidades.forEach(unidade => {
            select.innerHTML += `<option value="${unidade.id}"> ${unidade.nome}</option>`;
        });

    } catch (erro) {
        console.error("Erro ao carregar unidades", erro);
    }
}

function exibirMovimentacoes(dados) {
    console.log("Recebi para exibir:", dados.length);
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
                        ${mov.tipo_movimentacao === "entrada" ? '<i class="fa-solid fa-arrow-up" style="color: rgb(40, 176, 19);"></i> Entrada' : '<i class="fa-solid fa-arrow-down" style="color: rgb(197, 22, 40);"></i> Saída'}
                    </span>
                </td>
                <td>${mov.unidade || "N/A"}</td>
                <td>${mov.usuario || "N/A"}</td>
                <td>${formatarData(mov.data_movimentacao)}</td>
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
    exibirMovimentacoes(movimentacoesFiltradas);
    window.scrollTo(0, 0);
}

function filtrarTabela() {
    console.log("Filtro executado");
    const busca = document.getElementById("filtroTabela").value.toLowerCase();
    const tipo = document.getElementById("filtroTipo").value;

    movimentacoesFiltradas = movimentacoes.filter((mov) => {
        const atendeBusca =
            !busca ||
            mov.produto?.toLowerCase().includes(busca) ||
            mov.usuario?.toLowerCase().includes(busca) ||
            mov.unidade?.toLowerCase().includes(busca);
        
            console.log("mov:",mov.tipo_movimentacao,"| tipo:",tipo,"| iguais?",mov.tipo_movimentacao === tipo);
        const atendeTipo =  !tipo || mov.tipo_movimentacao?.trim().toLowerCase() === tipo.trim().toLowerCase();
        
        return atendeBusca && atendeTipo;
    });
    paginaAtual = 1;
    exibirMovimentacoes(movimentacoesFiltradas);
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
        id_usuarios: Number(localStorage.getItem("idUsuario")),
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
        exibirErro(erro.message);
    }
}

// Fechar modal ao clicar fora dele
window.addEventListener("click", function (event) {
    const modal = document.getElementById("modalNovaMovimentacao");
    if (modal && event.target === modal) {
        fecharModalNovaMovimentacao();
    }
});
