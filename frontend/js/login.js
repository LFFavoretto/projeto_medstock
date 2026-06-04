const API_URL ="http://localhost:3000";

document.querySelector(".botao").addEventListener("click",fazerLogin);

async function fazerLogin() {
    const email = document.getElementById("email").value;

    const senha = document.getElementById("senha").value;
    try {
        const response = await fetch(`${API_URL}/usuarios/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                    "application/json"
                },
                body: JSON.stringify({
                    email,
                    senha
                })
            }
            );

        if (!response.ok) {

            const erro = await response.text();

            alert(erro);

            return;
        }

        const dados = await response.json();

        localStorage.setItem("token", dados.token);

        localStorage.setItem("tipoUsuario", dados.tipo);

        localStorage.setItem("nomeUsuario", dados.nome);

        window.location.href ="dashboard.html";

    } catch (erro) {
        console.error(erro);

        alert("Erro ao realizar login");
    }
}