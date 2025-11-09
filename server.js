// =========================================
// server.js - Back-end do E-commerce
// =========================================

// ⚙️ Carregar dependências e middlewares principais
require("express-async-errors"); // Captura erros async automaticamente
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// =========================================
// 🔑 Configurações de ambiente (.env)
// =========================================
dotenv.config();
console.log("🔑 MONGO_URI carregado:", process.env.MONGO_URI);

// =========================================
// 🚀 Inicialização do app Express
// =========================================
const app = express();

// =========================================
// 🧩 Middlewares globais
// =========================================
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS — permite frontend acessar o backend
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);

// Logs HTTP (morgan)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Segurança com Helmet
app.use(helmet());

// Limite de requisições para evitar ataques de força bruta / DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // 300 requisições por IP
  message: { error: "Muitas requisições — tente novamente mais tarde." },
});
app.use("/api", apiLimiter);

// =========================================
// 🧠 Test Routes / Health check
// =========================================
app.get("/", (req, res) => {
  res.send("🚀 Servidor do e-commerce rodando!");
});

app.get("/health", (req, res) => {
  const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  res.json({ ok: true, dbState: state });
});

// =========================================
// 🧩 Conexão com o MongoDB
// =========================================
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ ERRO: MONGO_URI não foi definida no arquivo .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 10000, // timeout de 10s para evitar travas
  })
  .then(() => console.log("✅ Conectado ao MongoDB com sucesso"))
  .catch((err) => {
    console.error("❌ Erro ao conectar ao MongoDB:", err.message);
    process.exit(1);
  });

// =========================================
// 📦 Rotas da aplicação
// =========================================
const produtoRoutes = require("./routes/produtos");
const usuarioRoutes = require("./routes/usuarios");
const carrinhoRoutes = require("./routes/carrinho");
const pedidoRoutes = require("./routes/pedidos");
// const notificacaoRoutes = require("./routes/notificacoes"); // Ativar quando criar

app.use("/api/produtos", produtoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/carrinho", carrinhoRoutes);
app.use("/api/pedidos", pedidoRoutes);
// app.use("/api/notificacoes", notificacaoRoutes);

// =========================================
// 🧱 Middleware 404 - Rota não encontrada
// =========================================
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

// =========================================
// 🧱 Middleware de erro global
// =========================================
app.use((err, req, res, next) => {
  console.error("🔥 Erro não tratado:", err.stack || err);

  // Erros de validação (por exemplo, express-validator)
  if (err.errors) {
    return res.status(400).json({ erros: err.errors });
  }

  res
    .status(err.status || 500)
    .json({ error: err.message || "Erro interno no servidor." });
});

// =========================================
// 🚀 Inicialização do servidor
// =========================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
);

// =========================================
// 🧹 Encerramento gracioso
// =========================================
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n🛑 Recebido ${signal}, encerrando servidor...`);
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log("💤 Conexão MongoDB encerrada. Até logo!");
        process.exit(0);
      });
    });
  });
});

module.exports = app;
