class Produto {
    constructor(id, nome, quantidade = 0, validade = null, fornecedor = null) {
        this.id = id;
        this.nome = nome;
        this.quantidade = Number(quantidade);
        this.validade = validade;
        this.fornecedor = fornecedor;
    }

    add_quantidade(qtd) {
        this.quantidade += Number(qtd);
        return `${this.nome}: +${qtd} unidades (Total: ${this.quantidade})`;
    }

    remover_quantidade(qtd) {
        if (Number(qtd) > this.quantidade) {
            throw new Error(`Estoque insuficiente de ${this.nome}. Disponível: ${this.quantidade}`);
        }
        this.quantidade -= Number(qtd);
        return `${this.nome}: -${qtd} unidades (Total: ${this.quantidade})`;
    }

    verificar_quantidade() {
        return `${this.nome} possui ${this.quantidade} unidades em estoque`;
    }
}

module.exports = Produto;