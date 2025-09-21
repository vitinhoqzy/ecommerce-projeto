const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

// Middlewares
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(helmet());

// Rate limiting básico
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", apiLimiter);

// Rotas
const produtoRoutes = require("./routes/produtos");
const usuarioRoutes = require("./routes/usuarios");
const carrinhoRoutes = require("./routes/carrinho");
const pedidoRoutes = require("./routes/pedidos");
// const notificacaoRoutes = require("./routes/notificacoes"); // adicionar quando existir

app.get("/", (req, res) => {
  res.send("🚀 Servidor do e-commerce rodando!");
});

app.get("/health", (req, res) => {
  const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  res.json({ ok: true, db: state });
});

// Mongo
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI ausente no ambiente");
  process.exit(1);
}
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch((err) => {
    console.error("❌ Erro ao conectar MongoDB:", err);
    process.exit(1);
  });

// Rotas API
app.use("/api/produtos", produtoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/carrinho", carrinhoRoutes);
app.use("/api/pedidos", pedidoRoutes);
// app.use("/api/notificacoes", notificacaoRoutes);

// 404
app.use((req, res, next) => res.status(404).json({ error: "Rota não encontrada" }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: "Erro interno" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

// Shutdown gracioso
const signals = ["SIGINT", "SIGTERM"];
signals.forEach((sig) =>
  process.on(sig, async () => {
    console.log(`Recebido ${sig}, encerrando...`);
    server.close(() => {
      mongoose.connection.close(false, () => process.exit(0));
    });
  })
);

module.exports = app;