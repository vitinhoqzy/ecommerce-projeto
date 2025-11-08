const express = require("express");
const mongoose = require("mongoose");
const Produto = require("../models/Produto");
const adminAuth = require("../middlewares/adminAuth"); // <-- Middleware de Admin
const { body, validationResult } = require("express-validator"); // <-- Validador

const router = express.Router();

// Função helper para tratar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ erros: errors.array() });
  }
  next();
};

// Middleware de validação de ID (o seu original, está ótimo)
const validarId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ erro: "ID inválido." });
  }
  next();
};

// --- ROTAS ---

// Rota para criar produto (PROTEGIDA + VALIDADA)
router.post(
  "/",
  adminAuth, // 1. Checa se é Admin
  [
    // 2. Valida os dados
    body("nome", "O nome é obrigatório").notEmpty().trim(),
    body("preco", "O preço deve ser um número positivo").isFloat({ gt: 0 }),
    body("estoque", "O estoque deve ser um número inteiro (0 ou mais)")
      .optional()
      .isInt({ gte: 0 }),
  ],
  handleValidationErrors, // 3. Trata os erros de validação
  async (req, res) => {
    // 4. Executa a rota
    const { nome, preco, estoque, descricao, imagemUrl } = req.body;

    const novo = await Produto.create({
      nome,
      preco,
      estoque: estoque ?? 0,
      descricao: descricao ?? "",
      imagemUrl: imagemUrl ?? "",
    });

    res.status(201).json(novo);
  }
);

// Rota para listar todos (PÚBLICA - não precisa de auth)
router.get("/", async (_req, res) => {
  const itens = await Produto.find().sort({ createdAt: -1 });
  res.json(itens);
});

// Buscar por ID (PÚBLICA - não precisa de auth)
router.get("/:id", validarId, async (req, res) => {
  const { id } = req.params;
  const item = await Produto.findById(id);
  
  if (!item) return res.status(404).json({ erro: "Produto não encontrado." });

  res.json(item);
});

// Atualizar por ID (PROTEGIDA + VALIDADA)
router.put(
  "/:id",
  adminAuth, // 1. Checa se é Admin
  validarId, // 2. Checa se o ID é válido
  [
    // 3. Valida os dados (opcionais)
    body("nome").optional().notEmpty().trim(),
    body("preco").optional().isFloat({ gt: 0 }),
    body("estoque").optional().isInt({ gte: 0 }),
  ],
  handleValidationErrors, // 4. Trata erros de validação
  async (req, res) => {
    // 5. Executa a rota
    const { id } = req.params;

    const atualizado = await Produto.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!atualizado) return res.status(404).json({ erro: "Produto não encontrado." });

    res.json(atualizado);
  }
);

// Deletar por ID (PROTEGIDA)
router.delete("/:id", adminAuth, validarId, async (req, res) => {
  const { id } = req.params;

  const removido = await Produto.findByIdAndDelete(id);
  if (!removido) return res.status(404).json({ erro: "Produto não encontrado." });

  res.json({ mensagem: "Produto removido com sucesso." });
});

module.exports = router;