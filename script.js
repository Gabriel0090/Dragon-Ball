
async function carregarPersonagens() {
    try {
      const resposta = await fetch("https://db-api-br.herokuapp.com/characters");
      const personagens = await resposta.json();
      const container = document.getElementById("personagens");
      container.innerHTML = "";

      personagens.slice(0, 10).forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${p.image}" alt="${p.name}">
          <h2>${p.name}</h2>
          <p><strong>Planeta:</strong> ${p.planet}</p>
          <p><strong>Raça:</strong> ${p.race}</p>
          <p><strong>Saga:</strong> ${p.saga}</p>
        `;
        container.appendChild(card);
      });
    } catch (erro) {
      document.getElementById("personagens").innerText = "Erro ao carregar personagens.";
      console.error("Erro ao buscar dados:", erro);
    }
  }

  carregarPersonagens();
