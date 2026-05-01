const express = require('express');
const router = express.Router();
const db = require('../db');

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

        if (!quantidade || quantidade <= 0){
            return res.status(400).send('Quantidade inválida');
        }

        if (!id_unidade_saude || !id_insumos || !id_usuarios){
            return res.status(400).send('Dados obrigatórios não informados.');
        }

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

        
        // ================= REGRA IMPORTANTE =================
        // Não permitir saída maior que o estoque
        if (tipo_movimentacao ==='saida' && quantidade > saldoAtual){
            return res.status(400).send('Estoque insuficiente nesta unidade')
        }


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