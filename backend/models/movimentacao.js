class Movimentacao {
    constructor(produto, quantidade, tipo, responsavel, unidade) {
        this.produto = produto; // Instância de Produto/Insumo/Medicamento
        this.quantidade = quantidade;
        this.tipo = tipo; // "entrada" ou "saida"
        this.responsavel = responsavel;
        this.unidade = unidade;
        this.data = new Date();
    }

    registrar() {
        return `${this.tipo.toUpperCase()} - ${this.produto.nome} (${this.quantidade} un) na unidade [${this.unidade}] por [${this.responsavel}]`;
    }
}

module.exports = Movimentacao;