const Produto = require('./produto')

class Insumo extends Produto {
    constructor(id, nome, quantidade, marca = null, categoria_insumo = null, setor = null) {
        super(id, nome, quantidade, null, null);
        this.marca = marca;
        this.categoria_insumo = categoria_insumo;
        this.setor = setor;
    }
}

module.exports = Insumo;