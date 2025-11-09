document.addEventListener('DOMContentLoaded', function() {
 
  // =================================================================
  // BANCO DE DADOS DE PRODUTOS
  // =================================================================
  const catalogoProdutos = [
    { id: 1, nome: 'Fone Bluetooth JBL', preco: 249.90, categoria: 'eletronicos', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80' },
    { id: 2, nome: 'Smartwatch Xiaomi Mi Band 7', preco: 299.90, categoria: 'eletronicos', img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80' },
    { id: 3, nome: 'Camiseta Minimalista Branca', preco: 79.90, categoria: 'roupas', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' },
    { id: 4, nome: 'Tênis Nike Revolution', preco: 329.90, categoria: 'calcados', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ab?auto=format&fit=crop&w=400&q=80' },
    { id: 5, nome: 'Mochila Casual Preta', preco: 149.90, categoria: 'acessorios', img: 'https://images.unsplash.com/photo-1553062407-98eeb68c6a62?auto=format&fit=crop&w=400&q=80' },
    { id: 6, nome: 'Notebook Gamer Dell G15', preco: 5499.00, categoria: 'eletronicos', img: 'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?auto=format&fit=crop&w=400&q=80' },
    { id: 7, nome: 'Calça Jeans Skinny Masculina', preco: 189.90, categoria: 'roupas', img: 'https://images.unsplash.com/photo-1602293589914-9FF0554d6b02?auto=format&fit=crop&w=400&q=80' },
    { id: 8, nome: 'Óculos de Sol Ray-Ban Aviator', preco: 650.00, categoria: 'acessorios', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80' },
    { id: 9, nome: 'Livro "A Sutil Arte de Ligar o F*da-se"', preco: 34.90, categoria: 'livros', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80' },
    { id: 10, nome: 'Cafeteira Nespresso Essenza Mini', preco: 399.00, categoria: 'casa', img: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=400&q=80' },
    { id: 11, nome: 'Jaqueta de Couro Sintético Feminina', preco: 299.90, categoria: 'roupas', img: 'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?auto=format&fit=crop&w=400&q=80' },
    { id: 12, nome: 'Tênis Adidas Ultraboost', preco: 799.90, categoria: 'calcados', img: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=400&q=80' },
    { id: 13, nome: 'Cadeira Gamer DXRacer', preco: 1899.00, categoria: 'casa', img: 'https://images.unsplash.com/photo-1598550476439-6847785f5533?auto=format&fit=crop&w=400&q=80' },
    { id: 14, nome: 'Relógio Casio Vintage', preco: 250.00, categoria: 'acessorios', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=400&q=80' },
    { id: 15, nome: 'Kindle 11ª Geração', preco: 479.00, categoria: 'eletronicos', img: 'https://images.unsplash.com/photo-1491841573234-3321b8207f16?auto=format&fit=crop&w=400&q=80' },
    { id: 16, nome: 'Bola de Basquete Wilson NBA', preco: 149.90, categoria: 'esporte', img: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=400&q=80' },
    { id: 17, nome: 'Vestido Floral de Verão', preco: 199.90, categoria: 'roupas', img: 'https://images.unsplash.com/photo-1579974334333-e59ab60a157c?auto=format&fit=crop&w=400&q=80' },
    { id: 18, nome: 'Kit de Halteres 10kg', preco: 199.90, categoria: 'esporte', img: 'https://images.unsplash.com/photo-1581009137042-c5c57128e053?auto=format&fit=crop&w=400&q=80' },
    { id: 19, nome: 'Caixa de Som Bluetooth Anker', preco: 350.00, categoria: 'eletronicos', img: 'https://images.unsplash.com/photo-1589102422204-62bbb3f1f3a2?auto=format&fit=crop&w=400&q=80' },
    { id: 20, nome: 'Livro "O Hobbit"', preco: 49.90, categoria: 'livros', img: 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=400&q=80' }
  ];

  let carrinho = JSON.parse(localStorage.getItem('cart')) || [];

  // =================================================================
  // LÓGICA GERAL (compartilhada entre as páginas)
  // =================================================================
  function salvarCarrinho() {
    localStorage.setItem('cart', JSON.stringify(carrinho));
  }
  
  // =================================================================
  // LÓGICA DA PÁGINA PRINCIPAL (INDEX.HTML)
  // =================================================================
  if (document.body.contains(document.querySelector('.grid'))) {
    const containerProdutos = document.querySelector('.grid');
    const linksCategoria = document.querySelectorAll('.cat-link');
    const cartIcon = document.getElementById("cart-icon");
    const cartDrawer = document.getElementById("cart-drawer");
    const cartOverlay = document.getElementById("cart-overlay");
    const closeCartBtn = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElem = document.getElementById("cart-total");
    const cartBadge = document.getElementById('cart-count-badge');

    function renderizarCatalogo(produtosParaRenderizar) {
      containerProdutos.innerHTML = '';
      produtosParaRenderizar.forEach(produto => {
        containerProdutos.innerHTML += `
          <div class="card" data-id="${produto.id}">
            <img src="${produto.img}" alt="${produto.nome}">
            <div class="card-content">
              <h3 class="nome">${produto.nome}</h3>
              <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
              <button class="btn-adicionar">Adicionar ao Carrinho</button>
            </div>
          </div>
        `;
      });
      adicionarListenersAosCards();
    }

    function adicionarListenersAosCards() {
      document.querySelectorAll('.btn-adicionar').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const card = e.target.closest('.card');
          const idProduto = card.dataset.id;
          
          adicionarProdutoAoCarrinho(idProduto, btn);
        });
      });
    }

    function adicionarProdutoAoCarrinho(idProduto, btnElement) {
      const produto = catalogoProdutos.find(p => p.id == idProduto);
      if (!produto) return;

      const itemExistente = carrinho.find(item => item.id == idProduto);
      if (itemExistente) {
        itemExistente.qtd++;
      } else {
        carrinho.push({ ...produto, qtd: 1 });
      }
      
      if (btnElement) {
        btnElement.innerHTML = 'Adicionado ✓';
        btnElement.classList.add('adicionado');
        setTimeout(() => {
            btnElement.innerHTML = 'Adicionar ao Carrinho';
            btnElement.classList.remove('adicionado');
        }, 2000);
      }
      
      salvarCarrinho();
      atualizarContadorCarrinho();
      renderizarCarrinhoLateral();
      abrirCarrinho();
    }
    
    function renderizarCarrinhoLateral() {
      cartItemsContainer.innerHTML = '';
      let total = 0;
      carrinho.forEach(item => {
        total += item.preco * item.qtd;
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.nome}">
                <div class="cart-item-info">
                    <span>${item.nome}</span>
                    <span>Qtd: ${item.qtd}</span>
                </div>
                <span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
            </div>
        `;
      });
      cartTotalElem.textContent = total.toFixed(2).replace('.', ',');
    }

    function atualizarContadorCarrinho() {
        const totalItens = carrinho.reduce((total, item) => total + item.qtd, 0);
        if (totalItens > 0) {
            cartBadge.textContent = totalItens;
            cartBadge.classList.add('visible');
        } else {
            cartBadge.classList.remove('visible');
        }
    }

    function abrirCarrinho() { cartDrawer.classList.add("ativo"); cartOverlay.classList.add("ativo"); }
    function fecharCarrinho() { cartDrawer.classList.remove("ativo"); cartOverlay.classList.remove("ativo"); }
    
    if(cartIcon) cartIcon.addEventListener("click", abrirCarrinho);
    if(closeCartBtn) closeCartBtn.addEventListener("click", fecharCarrinho);
    if(cartOverlay) cartOverlay.addEventListener("click", fecharCarrinho);

    linksCategoria.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        linksCategoria.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        const categoriaSelecionada = this.dataset.categoria;
        const produtosFiltrados = categoriaSelecionada === 'todos' ? catalogoProdutos : catalogoProdutos.filter(p => p.categoria === categoriaSelecionada);
        renderizarCatalogo(produtosFiltrados);
      });
    });

    renderizarCatalogo(catalogoProdutos);
    atualizarContadorCarrinho();
    renderizarCarrinhoLateral();
  }

  // =================================================================
  // LÓGICA DA PÁGINA DE CHECKOUT (CARRINHO.HTML)
  // =================================================================
  if (document.body.contains(document.querySelector('.checkout-container'))) {
    const FRETE = 15.00;
    const containerItens = document.getElementById('checkout-itens-container');
    const subtotalElem = document.getElementById('resumo-subtotal');
    const freteElem = document.getElementById('resumo-frete');
    const totalElem = document.getElementById('resumo-total');
    const finalizarBtn = document.getElementById('finalizar-pedido-btn');
    const limparCarrinhoBtn = document.getElementById('limpar-carrinho-btn');

    function renderizarCheckout() {
      containerItens.innerHTML = '';
      if (carrinho.length === 0) {
        containerItens.innerHTML = '<p>Seu carrinho está vazio.</p>';
        finalizarBtn.disabled = true;
        limparCarrinhoBtn.style.display = 'none';
      } else {
        finalizarBtn.disabled = false;
        limparCarrinhoBtn.style.display = 'block';
      }

      let subtotal = 0;
      carrinho.forEach(item => {
        subtotal += item.preco * item.qtd;
        containerItens.innerHTML += `
          <div class="item-carrinho" data-id="${item.id}">
            <img src="${item.img}" alt="${item.nome}">
            <div class="item-detalhes">
              <strong>${item.nome}</strong>
              <p>R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
              <div class="controle-qtd">
                <button class="btn-qtd diminuir" data-id="${item.id}">-</button>
                <span>${item.qtd}</span>
                <button class="btn-qtd aumentar" data-id="${item.id}">+</button>
              </div>
            </div>
            <div class="item-acoes">
              <p><strong>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</strong></p>
              <button class="btn-remover" data-id="${item.id}" title="Remover item">🗑️</button>
            </div>
          </div>
        `;
      });

      const total = (subtotal > 0) ? subtotal + FRETE : 0;
      subtotalElem.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
      freteElem.textContent = `R$ ${(subtotal > 0 ? FRETE : 0).toFixed(2).replace('.', ',')}`;
      totalElem.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

      adicionarListenersItensCheckout();
    }
    
    function adicionarListenersItensCheckout() {
      document.querySelectorAll('.aumentar').forEach(btn => btn.addEventListener('click', () => alterarQtd(btn.dataset.id, 1)));
      document.querySelectorAll('.diminuir').forEach(btn => btn.addEventListener('click', () => alterarQtd(btn.dataset.id, -1)));
      document.querySelectorAll('.btn-remover').forEach(btn => btn.addEventListener('click', () => removerItem(btn.dataset.id)));
    }

    function alterarQtd(id, mudanca) {
      const item = carrinho.find(p => p.id == id);
      if (item) {
        item.qtd += mudanca;
        if (item.qtd <= 0) {
          removerItem(id);
        } else {
          salvarCarrinho();
          renderizarCheckout();
        }
      }
    }

    function removerItem(id) {
      carrinho = carrinho.filter(p => p.id != id);
      salvarCarrinho();
      renderizarCheckout();
    }
    
    function limparCarrinho() {
      if (confirm('Deseja remover todos os itens?')) {
        carrinho = [];
        salvarCarrinho();
        renderizarCheckout();
      }
    }
    
    if (finalizarBtn) {
      finalizarBtn.addEventListener('click', () => {
          if(carrinho.length > 0) {
            alert('Pedido finalizado com sucesso! (Simulação)');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
          }
      });
    }

    if (limparCarrinhoBtn) {
        limparCarrinhoBtn.addEventListener('click', limparCarrinho);
    }

    renderizarCheckout();
  }
});