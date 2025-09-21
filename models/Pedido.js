const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario", // Referencia o modelo de Usuario
      required: true,
    },
    itens: [
      {
        produto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Produto", // Referencia o modelo de Produto
          required: true,
        },
        quantidade: {
          type: Number,
          required: true,
          min: 1,
        },
        precoUnitario: {
          type: Number,
          required: true,
        },
      },
    ],
    valorTotal: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pendente",
    },
    enderecoEnvio: {
      // Você pode definir um sub-schema ou um objeto simples
      rua: String,
      cidade: String,
      estado: String,
      cep: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pedido", PedidoSchema);