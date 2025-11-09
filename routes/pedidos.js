const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Pedido = require("../models/Pedido");
const Carrinho = require("../models/Carrinho");
const Produto = require("../models/Produto");
const Usuario = require("../models/Usuario");
const authMiddleware = require("../middlewares/auth");
const adminAuthMiddleware = require("../middlewares/adminAuth");

// ===============================
// Configuração do Mercado Pago (SDK v2.9.0)
// ===============================
const { MercadoPagoConfig, Preference } = require("mercadopago");

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// ===============================
// ROTA: Finalizar compra (Mercado Pago)
// ===============================
router.post("/finalizar-compra", authMiddleware, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { enderecoEnvio } = req.body;

    // Busca o carrinho do usuário
    const carrinho = await Carrinho.findOne({ usuarioId }).populate("itens.produtoId");
    if (!carrinho || carrinho.itens.length === 0) {
      return res.status(400).json({ mensagem: "O carrinho está vazio." });
    }

    // 1️⃣ Verificar disponibilidade de estoque
    for (const item of carrinho.itens) {
      const produto = item.produtoId;
      if (!produto || produto.estoque < item.quantidade) {
        return res.status(400).json({
          mensagem: `Estoque insuficiente para o produto: ${
            produto ? produto.nome : "desconhecido"
          }.`,
        });
      }
    }

    // 2️⃣ Calcular o valor total e preparar os itens para o Mercado Pago
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

    // 3️⃣ Pega os dados do usuário para o pagamento
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    // 4️⃣ Criar preferência de pagamento no Mercado Pago
    const preference = {
      items: itensParaMP,
      payer: {
        name: usuario.nome,
        email: usuario.email,
      },
      metadata: {
        usuarioId: usuario._id.toString(),
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
        failure: `${process.env.FRONTEND_URL}/pagamento/erro`,
        pending: `${process.env.FRONTEND_URL}/pagamento/pendente`,
      },
      auto_return: "approved",
    };

    const preferenceInstance = new Preference(mp);
    const result = await preferenceInstance.create({ body: preference });

    // 5️⃣ Retorna dados da preferência para o frontend redirecionar
    res.status(200).json({
      mensagem: "Preferência de pagamento criada com sucesso.",
      id: result.id,
      init_point: result.init_point,
    });
  } catch (err) {
    console.error("Erro ao processar a compra:", err);
    res.status(500).json({ erro: "Erro interno ao processar a compra." });
  }
});

// ===============================
// ROTA: Listar pedidos do usuário logado
// ===============================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario: req.usuario.id }).populate(
      "itens.produto",
      "nome preco imagemUrl"
    );
    res.status(200).json(pedidos);
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    res.status(500).json({ erro: "Erro interno ao buscar pedidos." });
  }
});

// ===============================
// ROTA: Buscar pedido específico
// ===============================
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ erro: "ID do pedido inválido." });
    }

    const pedido = await Pedido.findOne({ _id: id, usuario: usuarioId }).populate(
      "itens.produto",
      "nome preco imagemUrl"
    );

    if (!pedido) {
      return res.status(404).json({ mensagem: "Pedido não encontrado." });
    }

    res.status(200).json(pedido);
  } catch (err) {
    console.error("Erro ao buscar pedido:", err);
    res.status(500).json({ erro: "Erro interno ao buscar pedido." });
  }
});

// ===============================
// ROTAS ADMINISTRATIVAS
// ===============================

// 📦 Listar todos os pedidos (admin)
router.get("/admin", adminAuthMiddleware, async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate("usuario", "nome email")
      .populate("itens.produto", "nome preco imagemUrl");

    res.status(200).json(pedidos);
  } catch (err) {
    console.error("Erro ao listar todos os pedidos:", err);
    res.status(500).json({ erro: "Erro interno ao listar todos os pedidos." });
  }
});

// 🔄 Atualizar status do pedido (admin)
router.put("/admin/:id/status", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ erro: "ID do pedido inválido." });
    }

    const pedido = await Pedido.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!pedido) {
      return res.status(404).json({ mensagem: "Pedido não encontrado." });
    }

    res
      .status(200)
      .json({ mensagem: `Status do pedido atualizado para '${status}'.`, pedido });
  } catch (err) {
    console.error("Erro ao atualizar o status do pedido:", err);
    res.status(500).json({ erro: "Erro interno ao atualizar o status do pedido." });
  }
});

module.exports = router;
