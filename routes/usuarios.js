const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario"); // Corrigido o caminho
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/auth");

// Função helper para tratar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ erros: errors.array() });
  }
  next();
};

// Rota de registro de usuário (COM VALIDAÇÃO)
router.post(
  "/registrar",
  [
    // Regras de validação
    body("nome", "O nome é obrigatório").notEmpty().trim(),
    body("email", "Forneça um email válido").isEmail().normalizeEmail(),
    body("senha", "A senha deve ter no mínimo 6 caracteres").isLength({
      min: 6,
    }),
  ],
  handleValidationErrors, // Middleware que checa os erros
  async (req, res) => {
    const { nome, email, senha } = req.body;

    let usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        erros: [{ msg: "Este email já está cadastrado." }],
      });
    }

    const novoUsuario = new Usuario({ nome, email, senha });
    await novoUsuario.save();

    res.status(201).json({ mensagem: "Usuário registrado com sucesso." });
  }
);

// Rota de login de usuário (COM VALIDAÇÃO)
router.post(
  "/login",
  [
    body("email", "Forneça um email válido").isEmail().normalizeEmail(),
    body("senha", "A senha é obrigatória").notEmpty(),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensagem: "Credenciais inválidas." });
    }

    const isMatch = await usuario.compararSenha(senha);
    if (!isMatch) {
      return res.status(400).json({ mensagem: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: usuario._id, isAdmin: usuario.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Retorna mais dados para o Front-end
    res.status(200).json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        isAdmin: usuario.isAdmin,
      },
      mensagem: "Login bem-sucedido.",
    });
  }
);

// Rota para buscar dados do usuário logado (NOVA ROTA)
router.get("/perfil", authMiddleware, async (req, res) => {
  // req.usuario.id foi adicionado pelo middleware de auth
  const usuario = await Usuario.findById(req.usuario.id).select("-senha");

  if (!usuario) {
    return res.status(404).json({ mensagem: "Usuário não encontrado." });
  }

  res.status(200).json(usuario);
});

module.exports = router;