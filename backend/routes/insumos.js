const express = require('express');
const router = express.Router();
const db = require('../db');
const {insumo} = required('models.js')


// ================= GET =================
// Busca todos os insumos
router.get('/', async (req, res) => {
    try{        
        // ================= ACESSO AO BANCO =================
        // Busca todos os insumos cadastrados
        const[rows] = await db.query('SELECT * FROM insumos');
        res.json(rows);
    }
    catch (erro) {
        res.status(500).send(erro)
    }
})


// ================= POST =================
// Cria novo insumo
router.post('/', async (req, res) => {
    try{
        const { nome, marca } = req.body;

        // ================= LÓGICA DO SISTEMA =================
        // Validação de campos obrigatórios
        if (!nome || !marca) {
            return res.status(400).send('Dados obrigatórios');
        }

        // ================= BANCO =================
        // Insere novo insumo no banco
        await db.query('INSERT INTO insumos (nome, marca) VALUES (?, ?)', [nome, marca]);
        res.send('Insumo cadastrado com sucesso');
    }
    catch(erro) {
        res.status(500).send(erro);
    }
});

module.exports = router;