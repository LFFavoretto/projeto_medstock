const express = require('express');
const cors = require('cors');

const produtosRoutes = require('./routes/produtos');
const estoqueRoutes = require('./routes/estoque');
const unidadesRoutes = require('./routes/unidades');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/produtos',produtosRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/unidades', unidadesRoutes);
app.use('/usuarios', usuariosRoutes);

app.listen(3000, () =>{
    console.log('Servidor rodando...')
});



