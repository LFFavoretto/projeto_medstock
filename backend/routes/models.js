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

class Medicamento extends Produto {
    constructor(id, nome, quantidade, validade, fornecedor = null, dosagem = null, controlado = false, lote = null) {
        super(id, nome, quantidade, validade, fornecedor);
        this.dosagem = dosagem;
        this.controlado = controlado;
        this.lote = lote;
    }

    verificar_validade() {
        if (!this.validade) return "Sem data de validade cadastrada";
        const hoje = new Date();
        const dataValidade = new Date(this.validade);

        if (dataValidade < hoje) {
            return `${this.nome} (Lote: ${this.lote}) está VENCIDO!`;
        }
        return `${this.nome} está dentro da validade`;
    }
}

class Insumo extends Produto {
    constructor(id, nome, quantidade, marca = null, tipo = null, setor = null) {
        super(id, nome, quantidade, null, null);
        this.marca = marca;
        this.tipo = tipo;
        this.setor = setor;
    }
}

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

module.exports = { Produto, Medicamento, Insumo, Movimentacao };