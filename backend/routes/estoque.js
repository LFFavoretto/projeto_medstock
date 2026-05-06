const express = require('express');
const router = express.Router();
const db = require('../db');
const Produto = require('../models/produto');
const Movimentacao = require('../models/movimentacao')

// ================= GET /estoque =================
router.get('/', async (req, res) => {
    try {
        // ================= ACESSO AO BANCO =================
        // Query que junta várias tabelas (JOIN)
        const [rows] = await db.query(`SELECT e.id, i.nome AS insumo, u.nome AS usuario, us.nome AS unidade, e.tipo_movimentacao, e.quantidade, e.data_movimentacao
            FROM estoque e
            JOIN insumos i ON e.id_insumos = i.id
            JOIN usuarios u ON e.id_usuarios = u.id
            JOIN unidade_saude us ON e.id_unidade_saude = us.id
            `);

            res.json(rows);

    } catch (erro){
        res.status(500).send(erro);
    }
});


// ================= POST /estoque =================
router.post('/', async(req, res) => {
    try {
        const {
            id_unidade_saude,
            id_insumos,
            id_usuarios,
            tipo_movimentacao,
            quantidade,
            lote,
            data_validade,
            observacoes
        } = req.body;

        // ================= LÓGICA DO SISTEMA =================
        // (Essas validações são parte da lógica do backend)
        if (!['entrada', 'saida'].includes(tipo_movimentacao)){
            return res.status(400).send('Tipo de movimentação inválida');
        }

        // Valida quantidade
        if (!quantidade || quantidade <= 0){
            return res.status(400).send('Quantidade inválida');
        }

        // Valida campos obrigatórios
        if (!id_unidade_saude || !id_insumos || !id_usuarios){
            return res.status(400).send('Dados obrigatórios não informados.');
        }

        // ================= BANCO =================
        // Busca nome do insumo
        const [produtosRows] = await db.query('SELECT nome FROM insumos Where id = ?', [id_insumos]);

        if (produtosRows.length === 0) {
            return res.status(404).send('Insumo não encontrado');
        }

        const nomeProduto = produtoRows[0].nome;

        // ================= REGRA DE NEGÓCIO =================
        // Calcula o saldo atual do estoque
        const [saldoResult] = await db.query (`
            SELECT
                SUM(
                    CASE
                        WHEN tipo_movimentacao = 'entrada' THEN quantidade
                        WHEN tipo_movimentacao = 'saida' THEN -quantidade
                    END                    
                ) AS saldo
            FROM estoque
            WHERE id_insumos = ? AND id_unidade_saude = ?
            `, [id_insumos, id_unidade_saude]);
        
        const saldoAtual = Number(saldoResult[0].saldo) || 0;;

        
        // ================= MODEL =================
        // Cria objeto Produto usando classe do models.js
        const produto = new Produto(
            id_insumos,
            nomeProduto,
            saldoAtual
        );

        // ================= MODEL =================
        // Usa métodos da classe para aplicar regra de estoque
        try {

            if (tipo_movimentacao === 'saida') {
                produto.remover_quantidade(quantidade);
            } else {
                produto.add_quantidade(quantidade);
            }

        } catch (erroModel) {
            return res.status(400).send(erroModel.message);
        }

        // ================= MODEL =================
        // Cria objeto de movimentação
        const movimentacao = new Movimentacao(
            produto,
            quantidade,
            tipo_movimentacao,
            id_usuarios,
            id_unidade_saude
        );

        // Exibe movimentação no terminal
        console.log(movimentacao.registrar());

        // ================= BANCO =================
        // Insere movimentação (histórico)
        await db.query(`INSERT INTO estoque (id_unidade_saude, id_insumos,id_usuarios, tipo_movimentacao, quantidade, lote, data_validade, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id_unidade_saude,
            id_insumos,
            id_usuarios,
            tipo_movimentacao,
            quantidade,
            lote,
            data_validade,
            observacoes
        ]);

        res.send('Movimentação realizada com sucesso')
    } catch (erro) {
        res.status(500).send(erro);
    }
})

module.exports = router;