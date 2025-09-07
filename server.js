const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rota inicial
app.get("/", (req, res) => {
  res.send("🚀 Servidor do e-commerce rodando!");
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch(err => console.error("❌ Erro ao conectar MongoDB:", err));

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

// no topo (já deve existir express, mongoose, etc.)
const produtoRoutes = require("./routes/produtos");

// ...depois dos middlewares (app.use(express.json()), app.use(cors()), etc.)
app.use("/produtos", produtoRoutes);
