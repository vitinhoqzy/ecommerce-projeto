const mongoose = require("mongoose");

const ProdutoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    preco: { type: Number, required: true, min: 0 },
    estoque: { type: Number, required: true, min: 0, default: 0 },
    descricao: { type: String, default: "" },
    imagemUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Produto", ProdutoSchema);