const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Garantindo que é o bcryptjs
const jwt = require("jsonwebtoken");

const UsuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Garante que não haverá emails duplicados
      trim: true,
      lowercase: true,
    },
    senha: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Middleware do Mongoose para criptografar a senha antes de salvar
UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("senha")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Método para comparar a senha fornecida com a senha criptografada
UsuarioSchema.methods.compararSenha = async function (senhaFornecida) {
  return await bcrypt.compare(senhaFornecida, this.senha);
};

module.exports = mongoose.model("Usuario", UsuarioSchema);