const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Carrinho = require('../models/Carrinho');
const Produto = require('../models/Produto');

// Rota para adicionar um item ao carrinho (protegida)
router.post('/adicionar', authMiddleware, async (req, res) => {
    try {
        const { produtoId, quantidade } = req.body;
        const usuarioId = req.usuario.id;

        let carrinho = await Carrinho.findOne({ usuarioId });

        if (!carrinho) {
            carrinho = new Carrinho({ usuarioId, itens: [] });
        }

        const itemExistente = carrinho.itens.find(item => item.produtoId.toString() === produtoId);

        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            carrinho.itens.push({ produtoId, quantidade });
        }

        await carrinho.save();
        res.status(200).json(carrinho);

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao adicionar produto ao carrinho." });
    }
});

// Rota para visualizar o carrinho do usuário (protegida)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const carrinho = await Carrinho.findOne({ usuarioId }).populate('itens.produtoId');

        if (!carrinho) {
            return res.status(404).json({ mensagem: "Carrinho não encontrado." });
        }

        res.status(200).json(carrinho);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar o carrinho." });
    }
});

// Rota para atualizar a quantidade de um item no carrinho (protegida)
router.put('/atualizar/:produtoId', authMiddleware, async (req, res) => {
    try {
        const { produtoId } = req.params;
        const { quantidade } = req.body;
        const usuarioId = req.usuario.id;

        if (quantidade == null || quantidade < 1) {
            return res.status(400).json({ erro: "A quantidade deve ser um número maior que zero." });
        }

        const carrinho = await Carrinho.findOne({ usuarioId });
        if (!carrinho) {
            return res.status(404).json({ mensagem: "Carrinho não encontrado." });
        }
        
        const item = carrinho.itens.find(item => item.produtoId.toString() === produtoId);
        if (!item) {
            return res.status(404).json({ mensagem: "Item não encontrado no carrinho." });
        }

        item.quantidade = quantidade;
        await carrinho.save();

        res.status(200).json(carrinho);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao atualizar item do carrinho." });
    }
});

// Rota para remover um item do carrinho (protegida)
router.delete('/remover/:produtoId', authMiddleware, async (req, res) => {
    try {
        const { produtoId } = req.params;
        const usuarioId = req.usuario.id;

        let carrinho = await Carrinho.findOne({ usuarioId });
        if (!carrinho) {
            return res.status(404).json({ mensagem: "Carrinho não encontrado." });
        }

        carrinho.itens = carrinho.itens.filter(item => item.produtoId.toString() !== produtoId);
        await carrinho.save();

        res.status(200).json({ mensagem: "Item removido do carrinho com sucesso.", carrinho });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao remover item do carrinho." });
    }
});

module.exports = router;