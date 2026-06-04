console.log("script carregado")
document.addEventListener("DOMContentLoaded", () => {

  const tipoUsuario =localStorage.getItem("tipoUsuario");
  if (tipoUsuario === "operador") {
    const menuUsuarios = document.getElementById("menuUsuarios");
    const menuUnidades = document.getElementById("menuUnidades");
    const menuDashboard = document.getElementById("menuDashboard")
    if (menuUsuarios) {
      menuUsuarios.style.display = "none";
    }
    if (menuUnidades) {
        menuUnidades.style.display = "none";
    }
    if (menuDashboard) {
      menuDashboard.style.display = "none"
    }
  }

  
});

const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
    }

function logout() {

    localStorage.clear();
    window.location.href ="login.html";
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


