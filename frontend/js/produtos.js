// ============ MODAL FUNCTIONS ============
const modal = document.getElementById("modalProduto");
const btnNovo = document.querySelector(".btn-novo");
const fecharBtn = document.querySelector(".fechar");
const formProduto = document.getElementById("formProduto");
const tipoProduto = document.getElementById("tipo");
let produtos = [];
let produtoEmEdicao = null;
const tipoUsuario = localStorage.getItem("tipoUsuario");
    if (tipoUsuario === "operador" && btnNovo) {
        btnNovo.style.display = "none";
    }

// Abrir modal
btnNovo.addEventListener("click", () => {
    modal.style.display = "flex";
    formProduto.reset();
});

// Fechar modal ao clicar no X
fecharBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

// Fechar modal ao clicar fora
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Mostrar/esconder campos conforme o tipo
tipoProduto.addEventListener("change", (event) => {
    const tipo = event.target.value;
    const dosagemInput = document.getElementById("dosagem");
    const labelControlado = document.getElementById("labelControlado");
    const categoriaInput = document.getElementById("categoria_insumo");
    const setorInput = document.getElementById("setor");

    if (tipo === "medicamento") {
        dosagemInput.style.display = "block";
        labelControlado.style.display = "block";
        categoriaInput.style.display = "none";
        setorInput.style.display = "none";
    } else if (tipo === "insumo") {
        dosagemInput.style.display = "none";
        labelControlado.style.display = "none";
        categoriaInput.style.display = "block";
        setorInput.style.display = "block";
    } else {
        dosagemInput.style.display = "none";
        labelControlado.style.display = "none";
        categoriaInput.style.display = "none";
        setorInput.style.display = "none";
    }
});

// Submeter formulário
formProduto.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const tipo = document.getElementById("tipo").value;
    const marca = document.getElementById("marca").value || null;
    const fornecedor = document.getElementById("fornecedor").value || null;
    const dosagem = document.getElementById("dosagem").value || null;
    const controlado = document.getElementById("controlado").checked || false;
    const categoria_insumo = document.getElementById("categoria_insumo").value || null;
    const setor = document.getElementById("setor").value || null;

  // Validação básica
    if (!nome || !tipo) {
        alert("Por favor, preencha os campos obrigatórios");
        return;
    }

    if (tipo === "medicamento" && !dosagem) {
        alert("Dosagem é obrigatória para medicamentos");
        return;
    }

    if (tipo === "insumo" && !categoria_insumo) {
        alert("Categoria é obrigatória para insumos");
        return;
    }

    try {
        const url = produtoEmEdicao ? `http://localhost:3000/produtos/${produtoEmEdicao}` : "http://localhost:3000/produtos";

        const metodo = produtoEmEdicao ? "PUT" : "POST"

        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nome,
                tipo,
                marca,
                fornecedor,
                dosagem,
                controlado,
                categoria_insumo,
                setor,
            }),
        });

    if (resposta.ok) {
        alert("Produto cadastrado com sucesso!");
        modal.style.display = "none";
        produtoEmEdicao = null;
        listarProdutos();
    } else {
        const erro = await resposta.text();
        alert("Erro ao cadastrar: " + erro);
    }
    } catch (erro) {
    console.error("Erro ao enviar formulário:", erro);
    alert("Erro ao cadastrar produto");
    }
});

// ============ LISTAR PRODUTOS ============
async function listarProdutos() {
    try {
        const resposta = await fetch("http://localhost:3000/produtos");

        produtos = await resposta.json();

        atualizarCards(produtos);

        const tbody = document.getElementById("lista-produtos");

        tbody.innerHTML = "";

        produtos.forEach((produto) => {
            tbody.innerHTML += `
                    <tr>
                        <td>${produto.nome}</td>
                        <td>${produto.tipo}</td>
                        <td>${produto.marca ?? "-"}</td>
                        <td>${produto.ativo ? "Ativo" : "Inativo"}</td>
                        <td>${produto.quantidade}</td>
                        <td>${produto.dosagem ?? produto.categoria_insumo ?? "-"}</td>
                        <td>${tipoUsuario === "administrador"? `
                            <div class="acoes">
                                <button class="btn-acao editar" title="Editar" onclick="editarProduto(
                                    ${produto.id},
                                    '${produto.nome}',
                                    '${produto.tipo}',
                                    '${produto.marca ?? ""}',
                                    '${produto.fornecedor ?? ""}',
                                    '${produto.dosagem ?? ""}',
                                    '${produto.categoria_insumo ?? ""}',
                                    '${produto.setor ?? ""}',
                                    '${produto.controlado}'
                                )">
                                    <i class="fa-solid fa-pencil"></i></button>
                                <button class="btn-acao deletar" title="Excluir" onclick="deletarProduto(${produto.id})"><i class="fa-solid fa-trash"></i></button></div>`: ""}
                        </td>
                    </tr>
                `;
        });
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    } 
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

function atualizarCards(produtos) {

    console.table(produtos.map(p => ({
        nome: p.nome,
        quantidade: p.quantidade,
        numero: Number(p.quantidade)
    }))
);

    const estoqueTotal = produtos.reduce((total, produto) => total + Number(produto.quantidade), 0);

    const estoqueBaixo = produtos.filter(produto => produto.quantidade > 0 && produto.quantidade < 200).length;

    const semEstoque = produtos.filter(produto => Number(produto.quantidade) === 0).length;
    console.log("Sem estoque:", semEstoque);

    const medicamento = produtos.filter( produto => produto.tipo === "medicamento" && !produto.controlado).length;

    const controlado = produtos.filter(produto => produto.tipo === "medicamento" && produto.controlado).length;

    const insumo = produtos.filter(produto => produto.tipo === "insumo").length;

    const ativos = produtos.filter(p => p.ativo).length;

    document.getElementById("estoqueTotal").textContent = estoqueTotal;

    document.getElementById("estoqueBaixo").textContent = estoqueBaixo;

    document.getElementById("semEstoque").textContent = semEstoque;

    document.getElementById("medicamento").textContent = medicamento;

    document.getElementById("controlado").textContent = controlado;

    document.getElementById("insumo").textContent = insumo;

    document.getElementById("ativo").textContent = ativos;

    console.log(produtos);
}

function editarProduto (id, nome, tipo, marca, fornecedor, dosagem, categoria_insumo, setor, controlado) {
    produtoEmEdicao = id;
    modal.style.display = "flex";

    document.getElementById("nome").value = nome;
    document.getElementById("tipo").value = tipo;
    document.getElementById("marca").value = marca;
    document.getElementById("fornecedor").value = fornecedor;
    document.getElementById("dosagem").value = dosagem;
    document.getElementById("categoria_insumo").value = categoria_insumo;
    document.getElementById("setor").value = setor;
    document.getElementById("controlado").checked = controlado;

    tipoProduto.dispatchEvent(
        new Event("change")
    );
}

async function deletarProduto(id) {
    if (!confirm("Deseja excluir este produto?")){
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/produtos/${id}`,{
            method: "DELETE"
        });

        if (response.ok) {
            alert("Produto removido com sucesso");
            listarProdutos();
        }
        else {
            const erro = await response.text();
            alert(erro);
        }
    } catch (erro){
        console.error(erro)
    }
}

function filtrarProdutos() {
    const busca = document.getElementById("filtroProduto").value.toLowerCase();

    const filtrados = produtos.filter(produto => produto.nome.toLowerCase().includes(busca));

    atualizarTabela(filtrados);
}

function atualizarTabela(lista) {
    const tbody = document.getElementById("lista-produtos");

    tbody.innerHTML = "";

    lista.forEach(produto => {
        tbody.innerHTML += `
                    <tr>
                        <td>${produto.nome}</td>
                        <td>${produto.tipo}</td>
                        <td>${produto.marca ?? "-"}</td>
                        <td>${produto.ativo ? "Ativo" : "Inativo"}</td>
                        <td>${produto.quantidade}</td>
                        <td>${produto.dosagem ?? produto.categoria_insumo ?? "-"}</td>
                        <td>${tipoUsuario === "administrador"? `
                            <div class="acoes">
                                <button class="btn-acao editar" title="Editar" onclick="editarProduto(
                                    ${produto.id},
                                    '${produto.nome}',
                                    '${produto.tipo}',
                                    '${produto.marca ?? ""}',
                                    '${produto.fornecedor ?? ""}',
                                    '${produto.dosagem ?? ""}',
                                    '${produto.categoria_insumo ?? ""}',
                                    '${produto.setor ?? ""}',
                                    '${produto.controlado}'
                                )">
                                    <i class="fa-solid fa-pencil"></i></button>
                                <button class="btn-acao deletar" title="Excluir" onclick="deletarProduto(${produto.id})"><i class="fa-solid fa-trash"></i></button></div>`: ""}
                        </td>
                    </tr>
                `;
    });
}

document.getElementById("filtroProduto").addEventListener("keyup", filtrarProdutos);
listarProdutos();
