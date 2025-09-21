const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Pedido = require("../models/Pedido");
const Carrinho = require("../models/Carrinho");
const Produto = require("../models/Produto");
const Usuario = require("../models/Usuario");
const authMiddleware = require('../middlewares/auth');

// Configuração do Mercado Pago (certifique-se de ter a dependência instalada)
const mercadopago = require('mercadopago');
mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Rota para finalizar a compra com Mercado Pago
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
                return res.status(400).json({ mensagem: `Estoque insuficiente para o produto: ${produto ? produto.nome : 'desconhecido'}.` });
            }
        }
        
        // 2. Calcular o valor total e preparar os itens para o pedido
        let valorTotal = 0;
        const itensParaMP = [];
        for (const item of carrinho.itens) {
            const produto = item.produtoId;
            const precoUnitario = produto.preco;
            valorTotal += precoUnitario * item.quantidade;
            itensParaMP.push({
                title: produto.nome,
                unit_price: parseFloat(produto.preco.toFixed(2)),
                quantity: item.quantidade,
            });
        }
        
        // Pega os dados do usuário para o pagamento
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        // 3. Criar a preferência de pagamento no Mercado Pago
        const preference = {
            items: itensParaMP,
            payer: {
                name: usuario.nome,
                email: usuario.email,
            },
            // Você pode adicionar mais informações aqui, como uma rota de notificação
            // para que o Mercado Pago informe o backend sobre o status do pagamento.
        };

        const result = await mercadopago.preferences.create(preference);
        
        // Em vez de criar o pedido aqui, você devolve os dados para o frontend
        // para que ele possa redirecionar para a página de pagamento do Mercado Pago.
        res.status(200).json({
            mensagem: "Preferência de pagamento criada.",
            id: result.body.id,
            init_point: result.body.init_point,
            // A lógica de criação do pedido será movida para um webhook
        });

    } catch (err) {
        console.error("Erro ao processar a compra:", err);
        res.status(500).json({ erro: "Erro interno ao processar a compra." });
    }
});


// Rota para listar todos os pedidos do usuário logado
router.get("/", authMiddleware, async (req, res) => {
    try {
        const pedidos = await Pedido.find({ usuario: req.usuario.id }).populate("itens.produto");
        res.json(pedidos);
    } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        res.status(500).json({ erro: "Erro interno ao buscar pedidos." });
    }
});

// Rota para buscar um pedido específico por ID do usuário logado
router.get("/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario.id;
  
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ erro: "ID do pedido inválido." });
      }
  
      const pedido = await Pedido.findOne({ _id: id, usuario: usuarioId })
        .populate("itens.produto", "nome preco imagemUrl");
  
      if (!pedido) {
        return res.status(404).json({ mensagem: "Pedido não encontrado." });
      }
  
      res.status(200).json(pedido);
    } catch (err) {
      console.error("Erro ao buscar pedido:", err);
      res.status(500).json({ erro: "Erro interno ao buscar pedido." });
    }
});


// Rotas de administração (apenas para administradores)
// Rota para listar TODOS os pedidos (apenas para administradores)
router.get("/admin", adminAuthMiddleware, async (req, res) => {
    try {
        const pedidos = await Pedido.find()
            .populate("usuario", "nome email")
            .populate("itens.produto", "nome preco imagemUrl");
        res.json(pedidos);
    } catch (err) {
        console.error("Erro ao listar todos os pedidos:", err);
        res.status(500).json({ erro: "Erro interno ao listar todos os pedidos." });
    }
});

// Rota para atualizar o status de um pedido (apenas para administradores)
router.put("/admin/:id/status", adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const pedido = await Pedido.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!pedido) {
            return res.status(404).json({ mensagem: "Pedido não encontrado." });
        }

        res.status(200).json({ mensagem: `Status do pedido ${id} atualizado para ${status}.`, pedido });
    } catch (err) {
        console.error("Erro ao atualizar o status do pedido:", err);
        res.status(500).json({ erro: "Erro interno ao atualizar o status do pedido." });
    }
});

module.exports = router;