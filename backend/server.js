const express = require('express');
const cors = require('cors');

const insumosRoutes = require('./routes/insumos');
const estoqueRoutes = require('./routes/estoque');
const unidadesRoutes = require('./routes/unidades');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/insumos', insumosRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/unidades', unidadesRoutes);
app.use('/usuarios', usuariosRoutes);

app.listen(3000, () =>{
    console.log('Servidor rodando...')
});



