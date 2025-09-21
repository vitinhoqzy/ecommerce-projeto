const express = require("express");
const router = express.Router();
const Pedido = require("../models/Pedido");
const Carrinho = require("../models/Carrinho");
const Produto = require("../models/Produto");
const authMiddleware = require('../middlewares/auth');

// Rota para finalizar a compra
router.post('/finalizar-compra', authMiddleware, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { enderecoEnvio } = req.body;

        const carrinho = await Carrinho.findOne({ usuarioId }).populate('itens.produtoId');
        if (!carrinho || carrinho.itens.length === 0) {
            return res.status(400).json({ mensagem: "O carrinho está vazio." });
        }

        // 1. Verificar disponibilidade de estoque
        for (const item of carrinho.itens) {
            const produto = item.produtoId;
            if (!produto || produto.estoque < item.quantidade) {
                return res.status(400).json({ mensagem: `Estoque insuficiente para o produto: ${produto ? produto.nome : item.produtoId}` });
            }
        }
        
        // 2. Calcular o valor total e preparar os itens para o pedido
        let valorTotal = 0;
        const itensDoPedido = [];
        for (const item of carrinho.itens) {
            const produto = item.produtoId;
            const precoUnitario = produto.preco;
            valorTotal += precoUnitario * item.quantidade;
            itensDoPedido.push({
                produto: item.produtoId,
                quantidade: item.quantidade,
                precoUnitario: precoUnitario,
            });
        }

        // 3. Criar o novo pedido
        const novoPedido = await Pedido.create({
            usuario: usuarioId,
            itens: itensDoPedido,
            valorTotal,
            enderecoEnvio,
            status: "pendente"
        });

        // 4. Atualizar o estoque dos produtos
        for (const item of carrinho.itens) {
            await Produto.findByIdAndUpdate(item.produtoId, { $inc: { estoque: -item.quantidade } });
        }
        
        // 5. Limpar o carrinho do usuário
        await Carrinho.findOneAndDelete({ usuarioId });

        res.status(201).json({ mensagem: "Compra finalizada com sucesso!", pedido: novoPedido });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro interno ao finalizar a compra." });
    }
});


// Rota para listar todos os pedidos do usuário logado
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario: req.usuario.id }).populate("itens.produto");
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar pedidos." });
  }
});


module.exports = router;