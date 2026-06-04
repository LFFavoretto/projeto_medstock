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

async function atualizarDashboardInfo() {
    try {
        const [unidadesRes, produtosRes, estoqueRes] =
            await Promise.all([
                fetch('http://localhost:3000/unidades'),
                fetch('http://localhost:3000/produtos'),
                fetch('http://localhost:3000/estoque')
            ]);
        if (
            !unidadesRes.ok ||
            !produtosRes.ok ||
            !estoqueRes.ok
        ) {
            throw new Error("Erro ao carregar dados do dashboard");
        }       

        const unidades = await unidadesRes.json();
        const produtos = await produtosRes.json();
        const estoque = await estoqueRes.json();
        const fornecedores = new Set(produtos.map(p => p.fornecedor));

        const statUnidades = document.getElementById("statUnidades");
        const statProdutos = document.getElementById("statProdutos");
        const statPedidos = document.getElementById("statPedidos");
        const statFornecedores = document.getElementById("statFornecedores")

        if (statUnidades) statUnidades.textContent = unidades.length;
        if (statProdutos) statProdutos.textContent = produtos.length;
        if (statPedidos) statPedidos.textContent = estoque.length;
        if (statFornecedores) statFornecedores.textContent = fornecedores.size;

    } catch (erro) {
        console.error(
            "Erro ao atualizar dashboard",
            erro
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        atualizarDashboardInfo();
    }
);
