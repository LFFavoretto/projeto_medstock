const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// ================= MIDDLEWARE =================
// Verifica token JWT
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    // ================= LÓGICA DO SISTEMA =================
    // Verifica se o token foi enviado
    if (!authHeader) {
        return res.status(401).send('Token não enviado');
    }

    const token = authHeader.split(' ')[1];

    // ================= SEGURANÇA =================
    // Valida o token usando a chave secreta
    jwt.verify(token, process.env.JWT_SECRET, (erro, usuario) => {
        if (erro) {
            return res.status(403).send('Token inválido');
        }

        // Armazena dados do usuário na requisição
        req.usuario = usuario;
        next();
    })
}

// ================= MIDDLEWARE =================
// Verifica se usuário é administrador
function verificarAdmin(req, res, next) {

    // ================= REGRA DE NEGÓCIO =================
    // Apenas administradores podem acessar certas rotas
    if (req.usuario.tipo !== 'administrador') {
        return res.status(403).send('Acesso negado');
    }

    next();
}

router.get('/', autenticarToken, verificarAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                u.id,
                u.nome,
                u.email,
                u.tipo_usuario,
                u.ativo,
                us.nome AS unidade
            FROM usuarios u
            JOIN unidade_saude us
                ON u.id_unidade_saude = us.id
            ORDER BY u.nome
        `);
        res.json(rows);
    } catch (erro) {
        res.status(500).send(erro);
    }
});

// ================= GET /usuarios/:id =================
router.get('/:id', autenticarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // ================= BANCO =================
        // Busca usuário pelo id, incluindo nome da unidade
        const [rows] = await db.query(`
            SELECT 
                u.id,
                u.nome,
                u.email,
                u.tipo_usuario,
                us.nome AS unidade
            FROM usuarios u
            JOIN unidade_saude us ON u.id_unidade_saude = us.id
            WHERE u.id = ? AND u.ativo = TRUE
        `, [id]);

        // ================= LÓGICA =================
        // Verifica se o usuário existe
        if (rows.length === 0) {
            return res.status(404).send('Usuário não encontrado');
        }

        res.json(rows[0]);

    } catch (erro) {
        res.status(500).send(erro);
    }
});

// ================= POST /usuarios =================
router.post('/',autenticarToken, verificarAdmin,  async (req, res) => {
    try {
        const{ id_unidade_saude, nome, email, senha, tipo_usuario} = req.body;        
        
        // ================= LÓGICA DO SISTEMA =================
        // Valida campos obrigatórios antes de processar
        if (!nome || !email || !senha || !tipo_usuario) {
            return res.status(400).send('Dados obrigatórios não informados');
        }

        // ================= SEGURANÇA =================
        // Criptografa a senha antes de salvar no banco
        const senhaHash = await bcrypt.hash(senha, 10);


        // ================= BANCO =================
        // Insere novo usuário no banco de dados
        await db.query(`
            INSERT INTO usuarios
            (id_unidade_saude, nome, email, senha_hash, tipo_usuario)
            VALUES (?, ?, ?, ?, ?)`,
        [
            id_unidade_saude, nome, email, senhaHash, tipo_usuario
        ]);

        res.send('Usuário cadastrado com sucesso.')
    } catch (erro) {
        res.status(500).send(erro)
    }
});

// ================= PUT /usuarios/:id =================
router.put('/:id', autenticarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const {
            id_unidade_saude,
            nome,
            email,
            senha,
            tipo_usuario
        } = req.body;


        // ================= LÓGICA =================
        // Valida dados obrigatórios
        if (!nome || !email || !tipo_usuario) {
            return res.status(400).send('Dados obrigatórios não informados');
        }

        // ================= BANCO =================
        // Verifica se o usuário existe antes de atualizar
        const [rows] = await db.query(
          'SELECT * FROM usuarios WHERE id = ?',[id]
        );

        if (rows.length === 0) {
            return res.status(404).send('Usuário não encontrado');
        }


        // ================= SEGURANÇA =================
        // Mantém senha atual caso não seja enviada nova senha
        let senhaHash = rows[0].senha_hash;

        
        if (senha) {
            senhaHash = await bcrypt.hash(senha, 10);
        }


        // ================= BANCO =================
        // Atualiza dados do usuário
        await db.query(`
            UPDATE usuarios
            SET id_unidade_saude = ?, nome = ?, email = ?, senha_hash = ?, tipo_usuario = ?
            WHERE id = ?
        `, 
        [
            id_unidade_saude,
            nome,
            email,
            senhaHash,
            tipo_usuario,
            id
        ]);

        res.send('Usuário atualizado com sucesso');

    } catch (erro) {
        res.status(500).send(erro);
    }
});

// ================= DELETE /usuarios/:id =================
router.delete('/:id', autenticarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // ================= BANCO =================
        // Verifica se o usuário existe
        const [rows] = await db.query(
          'SELECT * FROM usuarios WHERE id = ?',[id]
        );

        if (rows.length === 0) {
            return res.status(404).send('Usuário não encontrado');
        }

        // ================= REGRA DE NEGÓCIO =================
        // Em vez de excluir, apenas desativa o usuário
        await db.query(
            'UPDATE usuarios SET ativo = FALSE WHERE id = ?',[id]
        );

        res.send('Usuário desativado com sucesso');

    } catch (erro) {
        res.status(500).send(erro);
    }
});

// ================= POST /usuarios/login =================
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // ================= BANCO =================
        // Busca usuário pelo email
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        // ================= LÓGICA =================
        // Verifica se o usuário existe
        if (rows.length === 0) {
            return res.status(401).send('Usuário não encontrado');
        }

        const usuario = rows[0];

        // ================= SEGURANÇA =================
        // Compara senha digitada com a senha criptografada
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            return res.status(401).send('Senha inválida');
        }

        // ================= TOKEN =================
        // Gera token JWT para autenticação do usuário
        const token = jwt.sign(
            {
                id: usuario.id,
                tipo: usuario.tipo_usuario
            },
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.json({ token,
            tipo: usuario.tipo_usuario,
            nome: usuario.nome
        })

    } catch (erro) {
        res.status(500).send(erro)
    }
})

module.exports = router;