const API_URL = "http://localhost:3000";
const USUARIOS_API = `${API_URL}/usuarios`;

let usuarios = [];
let paginaAtualUsuarios = 1;
const itensPorPagina = 10;
let usuarioEmEdicao = null

// Inicializar página
document.addEventListener("DOMContentLoaded", function () {

    const tipoUsuario = localStorage.getItem( "tipoUsuario");

    if (tipoUsuario !== "administrador") {
        window.location.href = "produto.html"

}

if (document.getElementById("lista-usuarios")) {
    carregarUsuarios();
    carregarUnidades();

    document.querySelector(".pesquisa_usuario input").addEventListener("keyup", filtrarTabelaUsuarios);
    document.getElementById("formUsuario").addEventListener("submit", salvarUsuario);
}

});

// ======================
// CARREGAR USUÁRIOS
// ======================

async function carregarUsuarios() {
try {
    const token = localStorage.getItem("token");

    const response = await fetch
        (USUARIOS_API,
            {
                headers: {Authorization:`Bearer ${token}`}
            }
        );

    if (!response.ok) {
        throw new Error("Erro ao carregar usuários");
    }
    usuarios = await response.json();

    exibirUsuarios(usuarios);
    atualizarCards();

} catch (erro) {
    console.error(erro);
    exibirErro(
        "Erro ao carregar usuários"
    );

}
}

// ======================
// EXIBIR USUÁRIOS
// ======================

function exibirUsuarios(dados) {
dados = dados.filter(usuario => usuario.ativo);

const tbody = document.getElementById("lista-usuarios");

if (!dados || dados.length === 0) {
    tbody.innerHTML = `
        <tr>
            <td colspan="6"> Nenhum usuário cadastrado </td>
        </tr>
    `;
    return;
}

const totalPaginas = Math.ceil(dados.length / itensPorPagina);

const inicio = (paginaAtualUsuarios - 1) * itensPorPagina;

const fim = inicio + itensPorPagina;

const usuariosPaginados = dados.slice(inicio, fim);

tbody.innerHTML =
    usuariosPaginados
        .map(
            usuario => `
            <tr>
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.tipo_usuario}</td>
                <td>${usuario.unidade}</td>
                <td>${usuario.ativo ? "Ativo" : "Inativo"}</td>
                <td class="col-acoes">
                    <div class="acoes">
                        <button class="btn-acao editar" title="Editar" onclick="editarUsuario(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo_usuario}', '${usuario.unidade}')">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button class="btn-acao deletar" title="Deletar" onclick="deletarUsuario(${usuario.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div></td>
            </tr>`
        ).join("");
}

// ======================
// CARDS
// ======================

function atualizarCards() {
const usuariosAtivos = usuarios.filter(u => u.ativo);

const total = usuariosAtivos.length;

const admins =usuariosAtivos.filter(u => u.tipo_usuario === "administrador").length;

const operadores =usuariosAtivos.filter(u => u.tipo_usuario === "operador").length;

document.querySelectorAll(".card_usuario strong")[0].textContent = total;

document.querySelectorAll(".card_usuario strong")[1].textContent = admins;

document.querySelectorAll(".card_usuario strong")[2].textContent = operadores;
}

// ======================
// BUSCAR
// ======================

function filtrarTabelaUsuarios() {
const busca =document.querySelector(".pesquisa_usuario input").value.toLowerCase();

const filtrados =
    usuarios.filter(
        usuario =>
            usuario.nome
                ?.toLowerCase()
                .includes(busca)
            ||
            usuario.email
                ?.toLowerCase()
                .includes(busca)
    );

paginaAtualUsuarios = 1;

exibirUsuarios(filtrados);

}

// ======================
// MODAL
// ======================

function abrirModalNovoUsuario() {
document.getElementById("modalUsuario").classList.add("ativo");
}

function fecharModalNovoUsuario() {
document.getElementById("modalUsuario").classList.remove("ativo");
document.getElementById("formUsuario").reset();
}

// ======================
// CARREGAR UNIDADES
// ======================

async function carregarUnidades() {
try {
    const response = await fetch(`${API_URL}/unidades`);

    const unidades = await response.json();

    const select = document.getElementById("id_unidade_saude");

    select.innerHTML ='<option value="">Selecione uma unidade</option>';

    unidades.forEach(unidade => { select.innerHTML += `<option value="${unidade.id}">${unidade.nome}</option>`;});

} catch (erro) {
    console.error(erro);
}
}

// ======================
// SALVAR USUÁRIO
// ======================

async function salvarUsuario(event) {

event.preventDefault();

const token = localStorage.getItem("token");
    if(!token){
        window.location.href="login.html"
    }

const dados = {
    id_unidade_saude: document.getElementById("id_unidade_saude").value,
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
    tipo_usuario: document.getElementById("tipo_usuario").value
};

try {
    const url = usuarioEmEdicao ? `${USUARIOS_API}/${usuarioEmEdicao}`: USUARIOS_API;

    const metodo = usuarioEmEdicao ? "PUT" : "POST";
    const response = await fetch(url,{
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dados)
            }
        );
    if (response.ok) {
        usuarioEmEdicao = null
        fecharModalNovoUsuario();
        carregarUsuarios();

    } else {
        const erro = await response.text();
        exibirErro(erro);
    }
} catch (erro) {
    console.error(erro);
    exibirErro(
        "Erro ao cadastrar usuário"
    );
}
}

// ======================
// UTILITÁRIOS
// ======================

function exibirErro(msg) {
alert(msg);
}

window.addEventListener("click",
function (event) {
    const modal =
        document.getElementById(
            "modalUsuario"
        );
    if (
        modal &&
        event.target === modal
    ) {
        fecharModalNovoUsuario();
    }
}
);

function editarUsuario(id, nome, email, tipo_usuario, unidade){
    usuarioEmEdicao = id;

    document.getElementById("nome").value = nome;
    document.getElementById("email").value = email;
    document.getElementById("tipo_usuario").value = tipo_usuario;
    const select = document.getElementById("id_unidade_saude");
    for (let option of select.options){
        if (option.text.trim() === unidade.trim()){
            select.value = option.value;
            break;
        }
    }
    abrirModalNovoUsuario();
}

async function deletarUsuario(id) {
    if (!confirm("Deseja desativar este usuário?")) {
        return
    }

    const token = localStorage.getItem("token")

    try {
        const response = await fetch(`${USUARIOS_API}/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.ok) {
            carregarUsuarios();
        } else {
            const erro = await response.text();

            alert(erro);
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao desativar usuário.")
    }
}