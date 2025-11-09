// checkout.js

document.addEventListener("DOMContentLoaded", async function () {
  const API_URL = "http://localhost:5000/api";
  const carrinho = JSON.parse(localStorage.getItem("cart")) || [];
  const FRETE = 15.0;

  const containerItens = document.getElementById("checkout-itens-container");
  const subtotalElem = document.getElementById("resumo-subtotal");
  const freteElem = document.getElementById("resumo-frete");
  const totalElem = document.getElementById("resumo-total");
  const finalizarBtn = document.getElementById("finalizar-pedido-btn");
  const limparCarrinhoBtn = document.getElementById("limpar-carrinho-btn");

  // ===========================
  // Renderizar itens do carrinho
  // ===========================
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
        <div class="item-carrinho">
          <img src="${item.img}" alt="${item.nome}">
          <div class="item-detalhes">
            <strong>${item.nome}</strong>
            <p>R$ ${item.preco.toFixed(2).replace(".", ",")}</p>
            <p>Qtd: ${item.qtd}</p>
          </div>
        </div>
      `;
    });

    const total = subtotal + FRETE;
    subtotalElem.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
    freteElem.textContent = `R$ ${FRETE.toFixed(2).replace(".", ",")}`;
    totalElem.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  }

  // ===========================
  // Limpar carrinho
  // ===========================
  limparCarrinhoBtn.addEventListener("click", () => {
    if (confirm("Deseja limpar o carrinho?")) {
      localStorage.removeItem("cart");
      window.location.reload();
    }
  });

  // ===========================
  // Finalizar pedido -> Backend
  // ===========================
  finalizarBtn.addEventListener("click", async () => {
    if (carrinho.length === 0) return alert("Carrinho vazio!");

    const token = localStorage.getItem("token"); // caso já tenha login
    const enderecoEnvio = prompt("Digite seu endereço de entrega:");

    if (!enderecoEnvio) return alert("Informe um endereço válido!");

    try {
      const resposta = await fetch(`${API_URL}/pedidos/finalizar-compra`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ enderecoEnvio }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        console.error("Erro:", dados);
        alert(dados.mensagem || "Erro ao finalizar compra.");
        return;
      }

      // Redireciona para o Mercado Pago
      alert("Redirecionando para o pagamento...");
      window.location.href = dados.init_point;
    } catch (erro) {
      console.error("Erro ao enviar pedido:", erro);
      alert("Erro interno ao finalizar compra.");
    }
  });

  renderizarCheckout();
});
