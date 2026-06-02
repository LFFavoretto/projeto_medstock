const express = require("express");
const cors = require("cors");
const path = require("path");

const produtosRoutes = require("./routes/produtos");
const estoqueRoutes = require("./routes/estoque");
const unidadesRoutes = require("./routes/unidades");
const usuariosRoutes = require("./routes/usuarios");
const dadosRoutes = require("./routes/dados");

const app = express();

app.use(express.json());
app.use(cors());

// Servir frontend estático
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/produtos", produtosRoutes);
app.use("/estoque", estoqueRoutes);
app.use("/unidades", unidadesRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/dados", dadosRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000...");
});
