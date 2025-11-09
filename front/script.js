document.addEventListener("DOMContentLoaded", async function () {
  const API_URL = "http://localhost:5000/api"; // seu backend
  const usuarioId = "123"; // simulação até ter login real

  // =================================================================
  // CATÁLOGO DE PRODUTOS
  // =================================================================
  const catalogoProdutos = [
    { id: 1, nome: "Fone Bluetooth JBL", preco: 249.9, categoria: "eletronicos", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80" },
    { id: 2, nome: "Smartwatch Xiaomi Mi Band 7", preco: 299.9, categoria: "eletronicos", img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80" },
    { id: 3, nome: "Camiseta Minimalista Branca", preco: 79.9, categoria: "roupas", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80" },
    { id: 4, nome: "Tênis Nike Revolution", preco: 329.9, categoria: "calcados", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ab?auto=format&fit=crop&w=400&q=80" },
    { id: 5, nome: "Mochila Casual Preta", preco: 149.9, categoria: "acessorios", img: "https://images.unsplash.com/photo-1553062407-98eeb68c6a62?auto=format&fit=crop&w=400&q=80" },
    { id: 6, nome: "Notebook Gamer Dell G15", preco: 5499.0, categoria: "eletronicos", img: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?auto=format&fit=crop&w=400&q=80" },
    { id: 7, nome: "Calça Jeans Skinny Masculina", preco: 189.9, categoria: "roupas", img: "https://images.unsplash.com/photo-1602293589914-9FF0554d6b02?auto=format&fit=crop&w=400&q=80" },
    { id: 8, nome: "Óculos de Sol Ray-Ban Aviator", preco: 650.0, categoria: "acessorios", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80" },
    { id: 9, nome: 'Livro "A Sutil Arte de Ligar o F*da-se"', preco: 34.9, categoria: "livros", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80" },
    { id: 10, nome: "Cafeteira Nespresso Essenza Mini", preco: 399.0, categoria: "casa", img: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=400&q=80" }
  ];

  let carrinho = JSON.parse(localStorage.getItem("cart")) || [];

  function salvarCarrinho() {
    localStorage.setItem("cart", JSON.stringify(carrinho));
  }

  // =================================================================
  // LÓGICA DA PÁGINA PRINCIPAL (INDEX.HTML)
  // =================================================================
  if (document.querySelector(".grid")) {
    const containerProdutos = document.querySelector(".grid");
    const linksCategoria = document.querySelectorAll(".cat-link");
    const cartIcon = document.getElementById("cart-icon");
    const cartDrawer = document.getElementById("cart-drawer");
    const cartOverlay = document.getElementById("cart-overlay");
    const closeCartBtn = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElem = document.getElementById("cart-total");
    const cartBadge = document.getElementById("cart-count-badge");

    function renderizarCatalogo(produtos) {
      containerProdutos.innerHTML = "";
      produtos.forEach((produto) => {
        containerProdutos.innerHTML += `
          <div class="card" data-id="${produto.id}">
            <img src="${produto.img}" alt="${produto.nome}">
            <div class="card-content">
              <h3>${produto.nome}</h3>
              <p class="preco">R$ ${produto.preco.toFixed(2).replace(".", ",")}</p>
              <button class="btn-adicionar">Adicionar ao Carrinho</button>
            </div>
          </div>
        `;
      });
      adicionarListenersAosCards();
    }

    function adicionarListenersAosCards() {
      document.querySelectorAll(".btn-adicionar").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const card = e.target.closest(".card");
          adicionarProdutoAoCarrinho(card.dataset.id, btn);
        });
      });
    }

    function adicionarProdutoAoCarrinho(idProduto, btn) {
      const produto = catalogoProdutos.find((p) => p.id == idProduto);
      if (!produto) return;

      const itemExistente = carrinho.find((item) => item.id == idProduto);
      if (itemExistente) {
        itemExistente.qtd++;
      } else {
        carrinho.push({ ...produto, qtd: 1 });
      }

      salvarCarrinho();
      atualizarContadorCarrinho();
      renderizarCarrinhoLateral();

      if (btn) {
        btn.textContent = "Adicionado ✓";
        btn.classList.add("adicionado");
        setTimeout(() => {
          btn.textContent = "Adicionar ao Carrinho";
          btn.classList.remove("adicionado");
        }, 2000);
      }
    }

    function renderizarCarrinhoLateral() {
      cartItemsContainer.innerHTML = "";
      let total = 0;

      carrinho.forEach((item) => {
        total += item.preco * item.qtd;
        cartItemsContainer.innerHTML += `
          <div class="cart-item">
            <img src="${item.img}" alt="${item.nome}">
            <div class="cart-item-info">
              <span>${item.nome}</span>
              <span>Qtd: ${item.qtd}</span>
            </div>
            <span>R$ ${(item.preco * item.qtd).toFixed(2).replace(".", ",")}</span>
          </div>
        `;
      });

      cartTotalElem.textContent = total.toFixed(2).replace(".", ",");
    }

    function atualizarContadorCarrinho() {
      const totalItens = carrinho.reduce((t, i) => t + i.qtd, 0);
      if (totalItens > 0) {
        cartBadge.textContent = totalItens;
        cartBadge.classList.add("visible");
      } else {
        cartBadge.classList.remove("visible");
      }
    }

    // Ações do carrinho
    const abrirCarrinho = () => cartDrawer.classList.add("ativo");
    const fecharCarrinho = () => cartDrawer.classList.remove("ativo");

    cartIcon?.addEventListener("click", abrirCarrinho);
    closeCartBtn?.addEventListener("click", fecharCarrinho);
    cartOverlay?.addEventListener("click", fecharCarrinho);

    // Filtro por categoria
    linksCategoria.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        linksCategoria.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        const categoria = link.dataset.categoria;
        const filtrados = categoria === "todos" ? catalogoProdutos : catalogoProdutos.filter((p) => p.categoria === categoria);
        renderizarCatalogo(filtrados);
      });
    });

    renderizarCatalogo(catalogoProdutos);
    atualizarContadorCarrinho();
    renderizarCarrinhoLateral();
  }

  // =================================================================
  // LÓGICA DA PÁGINA DE CHECKOUT (checkout.html)
  // =================================================================
  if (document.querySelector(".checkout-container")) {
    const FRETE = 15.0;
    const containerItens = document.getElementById("checkout-itens-container");
    const subtotalElem = document.getElementById("resumo-subtotal");
    const freteElem = document.getElementById("resumo-frete");
    const totalElem = document.getElementById("resumo-total");
    const finalizarBtn = document.getElementById("finalizar-pedido-btn");
    const limparCarrinhoBtn = document.getElementById("limpar-carrinho-btn");

    function renderizarCheckout() {
      containerItens.innerHTML = "";

      if (carrinho.length === 0) {
        containerItens.innerHTML = "<p>Seu carrinho está vazio.</p>";
        finalizarBtn.disabled = true;
        limparCarrinhoBtn.style.display = "none";
        return;
      }

      let subtotal = 0;
      carrinho.forEach((item) => {
        subtotal += item.preco * item.qtd;
        containerItens.innerHTML += `
          <div class="item-carrinho" data-id="${item.id}">
            <img src="${item.img}" alt="${item.nome}">
            <div class="item-detalhes">
              <strong>${item.nome}</strong>
              <p>R$ ${item.preco.toFixed(2).replace(".", ",")}</p>
              <div class="controle-qtd">
                <button class="btn-qtd diminuir" data-id="${item.id}">-</button>
                <span>${item.qtd}</span>
                <button class="btn-qtd aumentar" data-id="${item.id}">+</button>
              </div>
            </div>
            <div class="item-acoes">
              <p><strong>R$ ${(item.preco * item.qtd).toFixed(2).replace(".", ",")}</strong></p>
              <button class="btn-remover" data-id="${item.id}">🗑️</button>
            </div>
          </div>
        `;
      });

      const total = subtotal + (subtotal > 0 ? FRETE : 0);
      subtotalElem.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
      freteElem.textContent = `R$ ${FRETE.toFixed(2).replace(".", ",")}`;
      totalElem.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;

      adicionarListenersItensCheckout();
    }

    function adicionarListenersItensCheckout() {
      document.querySelectorAll(".aumentar").forEach((b) => b.addEventListener("click", () => alterarQtd(b.dataset.id, 1)));
      document.querySelectorAll(".diminuir").forEach((b) => b.addEventListener("click", () => alterarQtd(b.dataset.id, -1)));
      document.querySelectorAll(".btn-remover").forEach((b) => b.addEventListener("click", () => removerItem(b.dataset.id)));
    }

    function alterarQtd(id, delta) {
      const item = carrinho.find((p) => p.id == id);
      if (!item) return;
      item.qtd += delta;
      if (item.qtd <= 0) removerItem(id);
      salvarCarrinho();
      renderizarCheckout();
    }

    function removerItem(id) {
      carrinho = carrinho.filter((p) => p.id != id);
      salvarCarrinho();
      renderizarCheckout();
    }

    function limparCarrinho() {
      if (confirm("Deseja remover todos os itens?")) {
        carrinho = [];
        salvarCarrinho();
        renderizarCheckout();
      }
    }

    async function finalizarPedido() {
      if (carrinho.length === 0) return alert("Seu carrinho está vazio.");

      try {
        const pedido = {
          usuarioId,
          itens: carrinho.map((item) => ({
            produtoId: item.id,
            quantidade: item.qtd,
            precoUnitario: item.preco
          })),
          total: carrinho.reduce((s, i) => s + i.preco * i.qtd, 0) + FRETE
        };

        const resp = await fetch(`${API_URL}/pedidos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pedido)
        });

        if (!resp.ok) throw new Error("Erro ao enviar pedido");

        alert("Pedido enviado com sucesso!");
        localStorage.removeItem("cart");
        window.location.href = "index.html";
      } catch (err) {
        console.error(err);
        alert("Erro ao finalizar o pedido. Verifique o servidor.");
      }
    }

    finalizarBtn.addEventListener("click", finalizarPedido);
    limparCarrinhoBtn.addEventListener("click", limparCarrinho);

    renderizarCheckout();
  }
});
