// ============ MODAL FUNCTIONS ============
const modal = document.getElementById("modalProduto");
const btnNovo = document.querySelector(".btn-novo");
const fecharBtn = document.querySelector(".fechar");
const formProduto = document.getElementById("formProduto");
const tipoProduto = document.getElementById("tipo");

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
        const resposta = await fetch("http://localhost:3000/produtos", {
            method: "POST",
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

        const produtos = await resposta.json();

        const tbody = document.getElementById("lista-produtos");

        tbody.innerHTML = "";

        produtos.forEach((produto) => {
            tbody.innerHTML += `
                    <tr>
                        <td>${produto.nome}</td>
                        <td>${produto.tipo}</td>
                        <td>-</td>
                        <td>${produto.ativo ? "Ativo" : "Inativo"}</td>
                        <td>-</td>
                        <td>${produto.fornecedor ?? "-"}</td>

                        <td class="acoes">
                            <i class="fa-solid fa-ellipsis-vertical"></i>
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

listarProdutos();
