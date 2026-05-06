const Produto = require('./produto')

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

module.exports = Medicamento