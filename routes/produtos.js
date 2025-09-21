const express = require("express");
const mongoose = require("mongoose");
const Produto = require("../models/Produto");

const router = express.Router();

// AQUI ESTÁ A FUNÇÃO DO MIDDLEWARE, antes de qualquer rota
const validarId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    // Se o ID não for válido, ele para aqui e envia a resposta de erro
    return res.status(400).json({ erro: "ID inválido." });
  }
  // Se o ID for válido, ele chama a próxima função (a rota em si)
  next();
};

// Rota para criar produto (não precisa do middleware de ID)
router.post("/", async (req, res) => {
  try {
    const { nome, preco, estoque, descricao, imagemUrl } = req.body;

    if (!nome || preco == null) {
      return res.status(400).json({ erro: "Campos 'nome' e 'preco' são obrigatórios." });
    }

    const novo = await Produto.create({
      nome,
      preco,
      estoque: estoque ?? 0,
      descricao: descricao ?? "",
      imagemUrl: imagemUrl ?? "",
    });

    res.status(201).json(novo);
  } catch (err) {
    console.error("Erro ao criar produto:", err);
    res.status(500).json({ erro: "Erro interno ao criar produto." });
  }
});

// Rota para listar todos (não precisa do middleware de ID)
router.get("/", async (_req, res) => {
  try {
    const itens = await Produto.find().sort({ createdAt: -1 });
    res.json(itens);
  } catch (err) {
    console.error("Erro ao listar produtos:", err);
    res.status(500).json({ erro: "Erro interno ao listar produtos." });
  }
});

// Buscar por ID
// Colocamos o middleware 'validarId' AQUI, antes da função assíncrona da rota
router.get("/:id", validarId, async (req, res) => {
  try {
    const { id } = req.params; // O ID já foi validado pelo middleware

    const item = await Produto.findById(id);
    if (!item) return res.status(404).json({ erro: "Produto não encontrado." });

    res.json(item);
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    res.status(500).json({ erro: "Erro interno ao buscar produto." });
  }
});

// Atualizar por ID
// Colocamos o middleware 'validarId' AQUI, antes da função da rota
router.put("/:id", validarId, async (req, res) => {
  try {
    const { id } = req.params; // O ID já foi validado pelo middleware

    const atualizado = await Produto.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!atualizado) return res.status(404).json({ erro: "Produto não encontrado." });

    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    res.status(500).json({ erro: "Erro interno ao atualizar produto." });
  }
});

// Deletar por ID
// Colocamos o middleware 'validarId' AQUI, antes da função da rota
router.delete("/:id", validarId, async (req, res) => {
  try {
    const { id } = req.params; // O ID já foi validado pelo middleware

    const removido = await Produto.findByIdAndDelete(id);
    if (!removido) return res.status(404).json({ erro: "Produto não encontrado." });

    res.json({ mensagem: "Produto removido com sucesso." });
  } catch (err) {
    console.error("Erro ao remover produto:", err);
    res.status(500).json({ erro: "Erro interno ao remover produto." });
  }
});

module.exports = router;