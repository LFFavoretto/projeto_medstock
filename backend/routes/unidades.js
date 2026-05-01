const express = require('express');
const router = express.Router();
const db = require('../db');


// ================= GET =================
router.get('/', async (req, res) => {
    try {
        // ================= ACESSO AO BANCO =================
        // Busca todas as unidades de saúde
        const [rows] = await db.query('SELECT * FROM unidade_saude');
        res.json(rows);
    } catch (erro) {
        res.status(500).send(erro);
    }
});

// ================= POST =================
router.post('/', async (req, res) => {
    try {
        const { nome, logradouro, bairro, numero } = req.body;

        // ================= LÓGICA DO SISTEMA =================
        // Validação de dados obrigatórios
        if (!nome || !logradouro || !bairro || !numero) {
            return res.status(400).send('Preencha todos os campos');
        }

        // ================= BANCO =================
        // Insere nova unidade de saúde
        await db.query(
            `INSERT INTO unidade_saude (nome, logradouro, bairro, numero)
            VALUES (?, ?, ?, ?)`,
            [nome, logradouro, bairro, numero]
        );

        res.send('Unidade cadastrada com sucesso')

    } catch (erro) {
        res.status(500).send(erro)
    }
});

// ================= PUT /unidades/:id =================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, logradouro, bairro, numero } = req.body;

        // ================= LÓGICA DO SISTEMA =================
        // Validação de dados
        if (!nome || !logradouro || !bairro || !numero) {
            return res.status(400).send('Preencha todos os campos');
        }

        // ================= BANCO =================
        // Atualiza dados da unidade
        const [result] = await db.query(
            `UPDATE unidade_saude
            SET nome = ?, logradouro = ?, bairro = ?, numero = ?
            WHERE id = ?`,
            [nome, logradouro, bairro, numero, id]
        );

        // ================= VERIFICAÇÃO =================
        // Verifica se a unidade existe
        if (result.affectedRows === 0) {
            return res.status(404).send('Unidade não encontrada');
        }

        res.send('Unidade atualizada com sucesso');

    } catch (erro) {
        res.status(500).send(erro);
    }
});


// ================= DELETE /unidades/:id =================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // ================= REGRA DE NEGÓCIO =================
        // Verifica se a unidade está sendo usada        
        const [usuarios] = await db.query(
            'SELECT id FROM usuarios WHERE id_unidade_saude = ?',
            [id]
        );
        
        const [estoque] = await db.query(
            'SELECT id FROM estoque WHERE id_unidade_saude = ?',
            [id]
        );

        // Não permite exclusão se houver vínculo
        if (usuarios.length > 0 || estoque.length > 0) {
            return res.status(400).send('Unidade em uso, não pode ser removida');
        }

        // ================= BANCO =================
        // Remove unidade do banco
        const [result] = await db.query(
            'DELETE FROM unidade_saude WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('Unidade não encontrada');
        }

        res.send('Unidade removida com sucesso');

    } catch (erro) {
        res.status(500).send(erro);
    }
});

module.exports = router;