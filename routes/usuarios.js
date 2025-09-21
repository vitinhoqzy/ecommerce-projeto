const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");

// Rota de registro de usuário
router.post("/registrar", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    // Verifica se o usuário já existe
    let usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensagem: "Email já cadastrado." });
    }

    const novoUsuario = new Usuario({ nome, email, senha });
    await novoUsuario.save();

    res.status(201).json({ mensagem: "Usuário registrado com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Rota de login de usuário
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensagem: "Credenciais inválidas." });
    }

    const isMatch = await usuario.compararSenha(senha);
    if (!isMatch) {
      return res.status(400).json({ mensagem: "Credenciais inválidas." });
    }

    // Gerar o JWT. É crucial ter uma variável de ambiente JWT_SECRET!
    const token = jwt.sign(
      { id: usuario._id, isAdmin: usuario.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    res.status(200).json({ token, mensagem: "Login bem-sucedido." });
  } catch (err) {
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

module.exports = router;