const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');
const Pedido = require('../models/Pedido');
const Carrinho = require('../models/Carrinho');
const Produto = require('../models/Produto');

// Webhook para receber notificações do Mercado Pago
router.post('/mercadopago', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const paymentId = data.id;
            const payment = await mercadopago.payment.findById(paymentId);
            
            if (payment.body.status === 'approved') {
                const preferenceId = payment.body.external_reference; // Você precisaria salvar o preference ID no Pedido
                
                // Exemplo: Lógica para encontrar o carrinho e criar o pedido
                // Você precisará de uma forma de vincular o preferenceId ao carrinho/usuário
                // Isso requer uma alteração na sua rota /finalizar-compra para armazenar o preferenceId
                
                // Exemplo de como seria a lógica final (após o frontend redirecionar o usuário)
                // Vamos supor que você salvou o preferenceId no modelo de Carrinho temporariamente
                const carrinho = await Carrinho.findOne({ preferenceId });

                if (carrinho) {
                    let valorTotal = 0;
                    const itensDoPedido = [];

                    for (const item of carrinho.itens) {
                        const produto = await Produto.findById(item.produtoId);
                        const precoUnitario = produto.preco;
                        valorTotal += precoUnitario * item.quantidade;
                        itensDoPedido.push({
                            produto: item.produtoId,
                            quantidade: item.quantidade,
                            precoUnitario: precoUnitario,
                        });
                        
                        // Atualiza o estoque do produto
                        await Produto.findByIdAndUpdate(item.produtoId, { $inc: { estoque: -item.quantidade } });
                    }

                    // Cria o pedido final
                    await Pedido.create({
                        usuario: carrinho.usuarioId,
                        itens: itensDoPedido,
                        valorTotal,
                        status: "aprovado",
                        // Outros dados do pedido...
                    });

                    // Limpa o carrinho do usuário
                    await Carrinho.findOneAndDelete({ _id: carrinho._id });
                }
            }
        }

        res.status(200).json({ mensagem: "Notificação recebida com sucesso." });
    } catch (err) {
        console.error("Erro ao processar notificação do Mercado Pago:", err);
        res.status(500).json({ erro: "Erro interno ao processar a notificação." });
    }
});

module.exports = router;