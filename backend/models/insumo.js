const Produto = require('./produto')

class Insumo extends Produto {
    constructor(id, nome, quantidade, marca = null, tipo = null, setor = null) {
        super(id, nome, quantidade, null, null);
        this.marca = marca;
        this.tipo = tipo;
        this.setor = setor;
    }
}

module.exports = Insumo;