const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// Middlewares
app.use(express.json()); // Permite que a aplicação use JSON no corpo das requisições
app.use(cors()); // Habilita o CORS para permitir requisições de diferentes origens

// Imports das suas rotas
const produtoRoutes = require("./routes/produtos");
const usuarioRoutes = require("./routes/usuarios");
const carrinhoRoutes = require("./routes/carrinho");
const pedidoRoutes = require("./routes/pedidos");

// Rota inicial
app.get("/", (req, res) => {
  res.send("🚀 Servidor do e-commerce rodando!");
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch(err => console.error("❌ Erro ao conectar MongoDB:", err));

// Use as rotas
app.use("/api/produtos", produtoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/carrinho", carrinhoRoutes);
app.use("/api/pedidos", pedidoRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));