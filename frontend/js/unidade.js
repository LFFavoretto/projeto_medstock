const API_URL = "http://localhost:3000";
const UNIDADES_API = `${API_URL}/unidades`;

let unidades = [];
let paginaAtualUnidades = 1;
let unidadeEmEdicao = null;
const itensPorPagina = 10;

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
    }  catch (erro) {
        console.error("Erro ao carregar unidades:", erro);
    }
}

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
            const response = await fetch(`${UNIDADES_API}/${id}`, { method: "DELETE", });        
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
