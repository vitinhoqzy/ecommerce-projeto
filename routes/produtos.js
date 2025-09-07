const express = require("express");
const mongoose = require("mongoose");
const Produto = require("../models/Produto");

const router = express.Router();

// Criar produto
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

// Listar todos
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
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ erro: "ID inválido." });
    }

    const item = await Produto.findById(id);
    if (!item) return res.status(404).json({ erro: "Produto não encontrado." });

    res.json(item);
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    res.status(500).json({ erro: "Erro interno ao buscar produto." });
  }
});

// Atualizar por ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ erro: "ID inválido." });
    }

    const atualizado = await Produto.findByIdAndUpdate(id, req.body, {
      new: true,           // retorna o documento atualizado
      runValidators: true, // respeita validações do schema
    });

    if (!atualizado) return res.status(404).json({ erro: "Produto não encontrado." });

    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    res.status(500).json({ erro: "Erro interno ao atualizar produto." });
  }
});

// Deletar por ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ erro: "ID inválido." });
    }

    const removido = await Produto.findByIdAndDelete(id);
    if (!removido) return res.status(404).json({ erro: "Produto não encontrado." });

    res.json({ mensagem: "Produto removido com sucesso." });
  } catch (err) {
    console.error("Erro ao remover produto:", err);
    res.status(500).json({ erro: "Erro interno ao remover produto." });
  }
});

module.exports = router;
