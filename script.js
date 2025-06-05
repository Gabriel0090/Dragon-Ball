// Variáveis globais para controle da paginação
let currentPage = 1;
let totalPages = 1; // Inicializa totalPages
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
    window.onclick = function (event) {
        if (event.target == modal) {
            fecharModal();
        }
    }
}
// --- Fim dos elementos e funções do Modal ---

async function carregarPersonagens(pageNumber = 1) {
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
        console.log('DADOS REAIS DA API:', dados); // Adicionado para depurar a estrutura da resposta da API

        let personagensRecebidos; // Variável para armazenar os personagens da resposta
        let metaInfoApi = null;     // Variável para armazenar as meta informações da API

        if (Array.isArray(dados)) {
            // Cenário: API retornou um array direto
            personagensRecebidos = dados;
            // Tenta inferir totalPages se a API não fornecer meta informações
            if (currentPage === 1 && personagensRecebidos.length === 0) {
                totalPages = 0; // Nenhum item na primeira página significa nenhum item para este filtro
            } else if (personagensRecebidos.length < limitPorPagina) {
                totalPages = currentPage; // Esta deve ser a última página
            } else if (personagensRecebidos.length === limitPorPagina) {
                // Temos uma página cheia; pode haver mais. Apenas aumenta se currentPage for >= totalPages atual.
                if (currentPage >= totalPages) {
                    totalPages = currentPage + 1; // Suposição otimista
                }
            }
            // Garante que totalPages seja pelo menos 1 se houver itens e era 0.
            if (personagensRecebidos.length > 0 && totalPages === 0) {
                totalPages = 1;
            }

        } else if (dados && typeof dados === 'object' && dados.items) {
            // Cenário: API retornou a estrutura de objeto documentada { items: [], meta: {} }
            personagensRecebidos = dados.items; //
            metaInfoApi = dados.meta; //

            if (metaInfoApi && typeof metaInfoApi.totalPages !== 'undefined') {
                totalPages = metaInfoApi.totalPages; // Confia no totalPages da API
            } else {
                // Fallback se meta ou totalPages estiver ausente, mas temos um array de items
                if (currentPage === 1 && personagensRecebidos.length === 0) {
                    totalPages = 0;
                } else if (personagensRecebidos.length < limitPorPagina) {
                    totalPages = currentPage;
                } else if (personagensRecebidos.length === limitPorPagina) {
                    if (currentPage >= totalPages) {
                        totalPages = currentPage + 1; // Suposição otimista
                    }
                }
            }
        } else {
            // Estrutura inesperada ou resposta inválida/vazia
            console.error("Estrutura de dados da API inesperada ou inválida:", dados);
            personagensRecebidos = [];
            totalPages = (currentPage === 1) ? 0 : currentPage - 1; // Trata como sem dados para páginas atuais/futuras
        }

        // Limpa a mensagem de carregando ou conteúdo anterior
        container.innerHTML = "";

        if (!personagensRecebidos || personagensRecebidos.length === 0) {
            container.innerHTML = '<p class="status-message">Nenhum personagem encontrado com esses filtros.</p>'; //
            // Se nenhum personagem foi encontrado e estamos na página 1, totalPages deve ser 0.
            // A lógica anterior para definir totalPages já deve ter lidado com isso.
            if (currentPage === 1) {
                // totalPages = 0; // Redundante se a lógica acima estiver correta
            }
        } else {
            personagensRecebidos.forEach(personagem => {
                const card = document.createElement("div");
                card.className = "card"; //

                card.innerHTML = `
              <img src="${personagem.image}" alt="${personagem.name}">
              <h2>${personagem.name}</h2>
              <p><strong>Raça:</strong> ${personagem.race || 'N/A'}</p>
              <p><strong>KI Base:</strong> ${personagem.ki || 'N/A'}</p>
              <p><strong>KI Máximo:</strong> ${personagem.maxKi || 'N/A'}</p>
              <p><strong>Afiliação:</strong> ${personagem.affiliation || 'N/A'}</p>
            `; //

                // Lógica do Modal
                if (modal && personagem.id) { //
                    card.addEventListener('click', async () => {
                        const modalImage = document.getElementById("modal-image");
                        const modalName = document.getElementById("modal-name");
                        const modalRace = document.getElementById("modal-race");
                        const modalKi = document.getElementById("modal-ki");
                        const modalMaxKi = document.getElementById("modal-maxKi");
                        const modalAffiliation = document.getElementById("modal-affiliation");

                        if (modalImage) modalImage.src = personagem.image; //
                        if (modalName) modalName.textContent = personagem.name; //
                        if (modalRace) modalRace.textContent = personagem.race || 'N/A'; //
                        if (modalKi) modalKi.textContent = personagem.ki || 'N/A'; //
                        if (modalMaxKi) modalMaxKi.textContent = personagem.maxKi || 'N/A'; //
                        if (modalAffiliation) modalAffiliation.textContent = personagem.affiliation || 'N/A'; //

                        if (modal) modal.style.display = "block"; //
                    });
                }
                // --- Fim da Lógica do Modal ---
                container.appendChild(card);
            });
        }

        atualizarControlesPaginacao();

    } catch (erro) {
        container.innerHTML = `<p class="status-message">Erro ao carregar personagens. Tente novamente mais tarde.</p>`; //
        console.error("Erro ao buscar dados:", erro); //
        // Em caso de erro, garante que a paginação reflita um estado de erro ou sem dados.
        totalPages = 0;
        currentPage = 1; // Reseta para um estado conhecido.
        atualizarControlesPaginacao(); // Atualiza a UI.
    }
}

function atualizarControlesPaginacao() {
    if (infoPagina) {
        infoPagina.textContent = totalPages > 0 ? `Página ${currentPage} de ${totalPages}` : "Página 0 de 0"; //
    }

    if (btnAnterior) {
        btnAnterior.disabled = (currentPage <= 1); //
    }
    if (btnProxima) {
        btnProxima.disabled = (currentPage >= totalPages || totalPages === 0); //
    }
}

// Event Listeners para os botões de paginação
if (btnAnterior) {
    btnAnterior.addEventListener('click', () => {
        if (currentPage > 1) {
            carregarPersonagens(currentPage - 1); //
        }
    });
}

if (btnProxima) {
    btnProxima.addEventListener('click', () => {
        if (currentPage < totalPages) {
            carregarPersonagens(currentPage + 1); //
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
carregarPersonagens(1); //