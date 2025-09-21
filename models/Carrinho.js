const mongoose = require('mongoose');

const ItemCarrinhoSchema = new mongoose.Schema({
    produtoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Produto', // Referencia o modelo de Produto
        required: true 
    },
    quantidade: { 
        type: Number, 
        required: true, 
        min: 1 
    }
});

const CarrinhoSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', // Referencia o modelo de Usuario
        required: true,
        unique: true // Garante que cada usuário tem apenas um carrinho
    },
    itens: [ItemCarrinhoSchema]
}, { timestamps: true });

module.exports = mongoose.model('Carrinho', CarrinhoSchema);