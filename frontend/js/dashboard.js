console.log("JS carregado");

// pega o canvas
const ctx = document.getElementById("graficoInsumos");

function getChartColors() {
  const styles = getComputedStyle(document.documentElement);
  const entrada = styles.getPropertyValue("--chart-entrada") || "#8bc34a";
  const saida = styles.getPropertyValue("--chart-saida") || "#f4511e";
  return { entrada: entrada.trim(), saida: saida.trim() };
}

const cores = getChartColors();

// cria o gráfico
let grafico = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["1ª semana", "2ª semana", "3ª semana", "4ª semana"],
    datasets: [
      {
        label: "Entrada",
        data: [],
        backgroundColor: cores.entrada,
      },
      {
        label: "Saída",
        data: [],
        backgroundColor: cores.saida,
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

// função para carregar dados do backend
async function carregarDados(mes) {
  try {
    const resposta = await fetch(`/dados`);
    const dados = await resposta.json();

    const dadosMes = dados[mes];

    grafico.data.datasets[0].data = dadosMes.entrada;
    grafico.data.datasets[1].data = dadosMes.saida;

    grafico.update();
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}

// troca de mês
document.getElementById("mes").addEventListener("change", function () {
  carregarDados(this.value);
});

// carrega inicial
carregarDados("1");
