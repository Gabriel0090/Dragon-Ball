// Variáveis globais para controle da paginação
let currentPage = 1;
let totalPages = 1;
const limitPorPagina = 12; 

// Seletores para os elementos de paginação
const btnAnterior = document.getElementById('btn-anterior');
const btnProxima = document.getElementById('btn-proxima');
const infoPagina = document.getElementById('info-pagina');

// Seletores para os filtros
const inputFiltroNome = document.getElementById('filtro-nome');
const selectFiltroRaca = document.getElementById('filtro-raca');
const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');


// --- Elementos do Modal (copie sua configuração de modal para cá) ---
const modal = document.getElementById("character-modal");
// ... (resto dos seletores do modal: modalImage, modalName, etc.)
const closeModalButton = document.querySelector(".modal-close-button");

function fecharModal() {
  if (modal) modal.style.display = "none";
}
if (closeModalButton) closeModalButton.onclick = fecharModal;
if (modal) {
  window.onclick = function(event) {
    if (event.target == modal) {
      fecharModal();
    }
  }
}
// --- Fim dos elementos e funções do Modal ---

async function carregarPersonagens(pageNumber = 1) { // Default para pageNumber = 1
  currentPage = pageNumber; 
  const container = document.getElementById("personagens");
  container.innerHTML = '<p class="status-message">Carregando personagens...</p>';

  // Pega os valores dos filtros
  const nomeFiltro = inputFiltroNome ? inputFiltroNome.value : '';
  const racaFiltro = selectFiltroRaca ? selectFiltroRaca.value : '';
  
  let queryParams = [];
  if (nomeFiltro) {
    queryParams.push(`name=${encodeURIComponent(nomeFiltro)}`);
  }
  if (racaFiltro) {
    queryParams.push(`race=${encodeURIComponent(racaFiltro)}`);
  }
  
  let filtroString = queryParams.join('&');
  if (filtroString) {
    filtroString = `&${filtroString}`; // Adiciona '&' na frente se houver filtros
  }
  // Se não houver filtros, filtroString será "" (vazio)

  try {
    const apiUrl = `https://dragonball-api.com/api/characters?page=${currentPage}&limit=${limitPorPagina}${filtroString}`;
    console.log("Chamando API:", apiUrl); // Para depuração
    const resposta = await fetch(apiUrl);

    if (!resposta.ok) {
      // Se a API retornar 404 com filtros, pode ser que não haja personagens com essa combinação
      if (resposta.status === 404 && filtroString) {
          container.innerHTML = '<p class="status-message">Nenhum personagem encontrado com esses filtros.</p>';
          totalPages = 0; // Ajusta para que a paginação mostre 0 ou 1 página
          currentPage = 1; // Reseta para a página 1
          atualizarControlesPaginacao();
          return; // Interrompe aqui
      }
      throw new Error(`Erro na requisição: ${resposta.status} ${resposta.statusText}`);
    }

    const dados = await resposta.json();
    const personagens = dados.items;
    const metaInfo = dados.meta;

    // A API pode não retornar metaInfo se não houver itens (ex: filtro resultou em 0 personagens)
    totalPages = metaInfo ? metaInfo.totalPages || 1 : 1; 

    container.innerHTML = ""; 

    if (!personagens || personagens.length === 0) {
        container.innerHTML = '<p class="status-message">Nenhum personagem encontrado com esses filtros.</p>';
    } else {
        personagens.forEach(personagem => {
          const card = document.createElement("div");
          card.className = "card"; //
          
          card.innerHTML = `
              <img src="${personagem.image}" alt="${personagem.name}">
              <h2>${personagem.name}</h2>
              <p><strong>Raça:</strong> ${personagem.race || 'N/A'}</p>
              <p><strong>KI Base:</strong> ${personagem.ki || 'N/A'}</p>
              <p><strong>KI Máximo:</strong> ${personagem.maxKi || 'N/A'}</p>
              <p><strong>Afiliação:</strong> ${personagem.affiliation || 'N/A'}</p>
            `;
          
          // Lógica do Modal (copie sua lógica de modal para cá)
          // Exemplo:
          if (modal && personagem.id) {
            card.addEventListener('click', async () => {
              // ... (seu código para buscar detalhes e mostrar o modal)
              // Lembre-se de buscar os detalhes do personagem (incluindo transformações, se implementado)
              // e preencher os campos corretos do modal
              const modalImage = document.getElementById("modal-image"); // Garanta que esses seletores estão corretos
              const modalName = document.getElementById("modal-name");
              const modalRace = document.getElementById("modal-race");
              const modalKi = document.getElementById("modal-ki");
              const modalMaxKi = document.getElementById("modal-maxKi");
              const modalAffiliation = document.getElementById("modal-affiliation");

              if (modalImage) modalImage.src = personagem.image;
              if (modalName) modalName.textContent = personagem.name;
              if (modalRace) modalRace.textContent = personagem.race || 'N/A';
              if (modalKi) modalKi.textContent = personagem.ki || 'N/A';
              if (modalMaxKi) modalMaxKi.textContent = personagem.maxKi || 'N/A';
              if (modalAffiliation) modalAffiliation.textContent = personagem.affiliation || 'N/A';
              // Adicione aqui a lógica para buscar e mostrar transformações se já tiver implementado
              
              if (modal) modal.style.display = "block";
            });
          }
          // --- Fim da Lógica do Modal ---
          container.appendChild(card);
        });
    }
    
    atualizarControlesPaginacao();

  } catch (erro) {
    container.innerHTML = `<p class="status-message">Erro ao carregar personagens. Tente novamente mais tarde.</p>`;
    console.error("Erro ao buscar dados:", erro);
    if (btnAnterior) btnAnterior.disabled = true;
    if (btnProxima) btnProxima.disabled = true;
    if (infoPagina) infoPagina.textContent = "Erro";
  }
}

function atualizarControlesPaginacao() {
  if (infoPagina) {
    // Ajusta a mensagem se não houver páginas (ex: nenhum resultado de filtro)
    infoPagina.textContent = totalPages > 0 ? `Página ${currentPage} de ${totalPages}` : "Página 0 de 0";
  }
  
  if (btnAnterior) {
    btnAnterior.disabled = (currentPage <= 1);
  }
  if (btnProxima) {
    btnProxima.disabled = (currentPage >= totalPages || totalPages === 0);
  }
}

// Event Listeners para os botões de paginação
if (btnAnterior) {
  btnAnterior.addEventListener('click', () => {
    if (currentPage > 1) {
      carregarPersonagens(currentPage - 1);
    }
  });
}

if (btnProxima) {
  btnProxima.addEventListener('click', () => {
    if (currentPage < totalPages) {
      carregarPersonagens(currentPage + 1);
    }
  });
}

// Event Listener para o botão de aplicar filtros
if (btnAplicarFiltros) {
  btnAplicarFiltros.addEventListener('click', () => {
    carregarPersonagens(1); // Sempre volta para a página 1 ao aplicar novos filtros
  });
}

// Carrega a primeira página de personagens ao iniciar
carregarPersonagens(1);