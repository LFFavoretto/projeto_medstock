const express = require('express');
const router = express.Router();
const db = require('../db');
const Produto = require('../models/produto')
const Insumo = require('../models/insumo')
const Medicamento = require('../models/medicamento')


// ================= GET =================
// Busca todos os produtos
router.get('/', async (req, res) => {
    try{        
        // ================= ACESSO AO BANCO =================
        // Busca todos os produtos cadastrados
        const[rows] = await db.query('SELECT * FROM produtos WHERE ativo = TRUE');

        res.json(rows);
    }

    catch (erro) {
        res.status(500).send(erro)
    }
})


// ================= POST =================
// Cria novo produto
router.post('/', async (req, res) => {
    try{
        const { nome, tipo, marca, fornecedor, dosagem, controlado, categoria_insumo, setor } = req.body;

        // ================= LÓGICA DO SISTEMA =================
        // Validação de campos obrigatórios
        if (!nome) {
            return res.status(400).send('Nome do produto obrigatório');
        }

        // Validação do tipo
        if (!['insumo', 'medicamento'].includes(tipo)) {
            return res.status(400).send('Tipo de produto inválido');
        }
        // ================= MODEL =================
        // Cria objeto baseado no tipo
        let produto;

        if (tipo === 'medicamento' ) {

            produto = new Medicamento(
                null,
                nome,
                0,
                null,
                fornecedor,
                dosagem,
                controlado,
            );
        } else {

            produto = new Insumo(
                null,
                nome,
                0,
                marca,
                categoria_insumo,
                setor
            );
        }

        if (tipo === 'medicamento' && !dosagem) {
            return res.status(400).send('Dosagem obrigatória');
        }

        if (tipo === 'insumo' && !categoria_insumo) {
            return res.status(400).send('Categoria obrigatória');
        }
        
        // ================= BANCO =================
        // Insere produto
        await db.query(`INSERT INTO produtos 
            (nome, tipo, marca, fornecedor, dosagem, controlado, categoria_insumo, setor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [produto.nome, tipo, marca, fornecedor, dosagem, controlado, categoria_insumo, setor]);
        res.send('Produto cadastrado com sucesso');
    }
    catch(erro) {
        res.status(500).send(erro);
    }
});

// ================= PUT =================
// Atualiza produto existente
router.put('/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nome,
            tipo,
            marca,
            fornecedor,
            dosagem,
            controlado,
            categoria_insumo,
            setor
        } = req.body;


        // ================= LÓGICA DO SISTEMA =================
        // Valida nome
        if (!nome) {
            return res.status(400).send(
                'Nome do produto obrigatório'
            );
        }


        // Valida tipo
        if (!['insumo', 'medicamento'].includes(tipo)) {
            return res.status(400).send(
                'Tipo de produto inválido'
            );
        }


        // ================= BANCO =================
        // Verifica se produto existe
        const [produtoExiste] = await db.query(
            'SELECT * FROM produtos WHERE id = ?',
            [id]
        );

        if (produtoExiste.length === 0) {

            return res.status(404).send(
                'Produto não encontrado'
            );
        }


        // ================= MODEL =================
        // Cria objeto baseado no tipo
        let produto;

        if (tipo === 'medicamento') {

            produto = new Medicamento(
                id,
                nome,
                0,
                null,
                fornecedor,
                dosagem,
                controlado
            );

        } else {

            produto = new Insumo(
                id,
                nome,
                0,
                marca,
                categoria_insumo,
                setor
            );
        }


        // ================= BANCO =================
        // Atualiza produto
        await db.query(`
            UPDATE produtos
            SET
                nome = ?,
                tipo = ?,
                marca = ?,
                fornecedor = ?,
                dosagem = ?,
                controlado = ?,
                categoria_insumo = ?,
                setor = ?
            WHERE id = ?
        `,
        [
            produto.nome,
            tipo,
            marca,
            fornecedor,
            dosagem,
            controlado,
            categoria_insumo,
            setor,
            id
        ]);

        res.send('Produto atualizado com sucesso');

    } catch (erro) {

        res.status(500).send(erro);

    }
});

// ================= DELETE =================
// Desativa produto existente do banco
router.delete('/:id', async (req, res) => {

    try {

        const { id } = req.params;


        // ================= BANCO =================
        // Verifica se produto existe
        const [produto] = await db.query(
            'SELECT * FROM produtos WHERE id = ?',
            [id]
        );

        if (produto.length === 0) {

            return res.status(404).send(
                'Produto não encontrado'
            );
        }


        // ================= REGRA DE NEGÓCIO =================
        // Calcula saldo atual do produto
        const [saldoResult] = await db.query(`
            SELECT
                SUM(
                    CASE
                        WHEN tipo_movimentacao = 'entrada'
                        THEN quantidade

                        WHEN tipo_movimentacao = 'saida'
                        THEN -quantidade
                    END
                ) AS saldo
            FROM estoque
            WHERE id_produtos = ?
        `, [id]);

        const saldoAtual =
            Number(saldoResult[0].saldo) || 0;


        // Não permite desativar produto com estoque
        if (saldoAtual > 0) {

            return res.status(400).send(
                'Produto ainda possui estoque disponível'
            );
        }


        // ================= BANCO =================
        // Desativa produto
        await db.query(`
            UPDATE produtos
            SET ativo = FALSE
            WHERE id = ?
        `, [id]);

        res.send('Produto desativado com sucesso');

    } catch (erro) {

        res.status(500).send(erro);

    }
});




module.exports = router;