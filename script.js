async function carregarPersonagens() {
  try {
    // Nova URL da API (vamos testar sem proxy primeiro)
    // A API usa paginação, ?page=1&limit=10 para pegar a primeira página com 10 itens.
    // Você pode ajustar 'limit' para pegar mais, ou implementar a lógica de paginação.
    // Para pegar todos os personagens iniciais (até o limite padrão da API por página, que é 10):
    const apiUrl = "https://dragonball-api.com/api/characters?page=1&limit=50"; // Pega 20 personagens

    const resposta = await fetch(apiUrl);

    if (!resposta.ok) {
      throw new Error(`Erro na requisição: ${resposta.status} ${resposta.statusText}`);
    }

    const dados = await resposta.json();
    // A estrutura da resposta desta API é um objeto com uma chave 'items' que contém o array de personagens
    // e 'meta' para informações de paginação.
    const personagens = dados.items;
    const container = document.getElementById("personagens");
    container.innerHTML = ""; // Limpa a mensagem "Carregando personagens..."

    if (!personagens || personagens.length === 0) {
        container.innerText = "Nenhum personagem encontrado.";
        return;
    }

    // Slice não é mais necessário aqui se você controlar o limite na URL da API.
    personagens.forEach(p => {
      const card = document.createElement("div");
      card.className = "card"; //
      // Ajuste os nomes dos campos conforme a nova API:
      // Verifique a estrutura exata de um personagem no console.log(p) se necessário.
      // Com base na documentação e exemplos, os campos podem ser: name, race, gender, ki, maxKi, image, affiliation, planetDestroyed
      card.innerHTML = `
          <img src="${p.image}" alt="${p.name}">
          <h2>${p.name}</h2>
          <p><strong>Raça:</strong> ${p.race || 'N/A'}</p>
          <p><strong>KI Base:</strong> ${p.ki || 'N/A'}</p>
          <p><strong>KI Máximo:</strong> ${p.maxKi || 'N/A'}</p>
          <p><strong>Afiliação:</strong> ${p.affiliation || 'N/A'}</p>
        `;
      container.appendChild(card);
    });

  } catch (erro) {
    document.getElementById("personagens").innerText = "Erro ao carregar personagens. Verifique o console para mais detalhes.";
    console.error("Erro ao buscar dados:", erro);
    // Se o erro for de CORS, a mensagem no console será similar à anterior.
  }
}

carregarPersonagens();