async function listarProdutos() {

    try {

        const resposta = await fetch(
            'http://localhost:3000/produtos'
        );

        const produtos = await resposta.json();

        const tbody =
            document.getElementById(
                'lista-produtos'
            );

        tbody.innerHTML = '';

        produtos.forEach(produto => {

            tbody.innerHTML += `
                <tr>
                    <td>${produto.nome}</td>
                    <td>${produto.tipo}</td>
                    <td>-</td>
                    <td>${produto.ativo ? 'Ativo' : 'Inativo'}</td>
                    <td>-</td>
                    <td>${produto.fornecedor ?? '-'}</td>

                    <td class="acoes">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                </tr>
            `;

        });

    } catch (erro) {

        console.error(
            'Erro ao carregar produtos:',
            erro
        );

    }
}

listarProdutos();