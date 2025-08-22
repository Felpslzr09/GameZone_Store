// Chave da API RAWG
const RAWG_API_KEY = "db490a37529f40048c4e0ce5b7e46fc9";
// Array para armazenar os jogos
let games = [];
// Array para armazenar os itens do carrinho
let cart = [];
// Variável para controlar a paginação
let currentPage = 1;

// --- Global Utility Functions ---
// Funções de utilidade globais

// Mostra/Esconde o "loading"
function showLoading(show) {
    // Pega o elemento de loading
    const loading = document.getElementById('loading');
    // Verifica se o elemento existe
    if (loading) {
        // Se for para mostrar, remove a classe 'hidden'
        if (show) {
            loading.classList.remove('hidden');
        } else {
            // Se for para esconder, adiciona a classe 'hidden'
            loading.classList.add('hidden');
        }
    }
}

// Mostra uma mensagem de "toast" (notificação)
function showToast(message, type = 'success') {
    // Cria um novo elemento div
    const toast = document.createElement('div');
    // Adiciona classes ao elemento
    toast.className = `toast-message ${type}`;
    // Define o texto da mensagem
    toast.textContent = message;
    // Adiciona a mensagem ao corpo do documento
    document.body.appendChild(toast);
    
    // Remove a mensagem após 3 segundos
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// --- Cart Management Functions (Used by both pages, primarily updated on index.html) ---
// Funções de gerenciamento do carrinho

// Carrega o carrinho do localStorage
function loadCartFromLocalStorage() {
    // Pega os dados salvos no localStorage
    const savedCart = localStorage.getItem('gameZoneCart');
    // Se houver dados, converte de volta para objeto e atribui ao carrinho
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Salva o carrinho no localStorage
function saveCartToLocalStorage() {
    // Converte o carrinho para string e salva no localStorage
    localStorage.setItem('gameZoneCart', JSON.stringify(cart));
}

// Atualiza a exibição do carrinho na barra lateral
function updateCartDisplay() {
    // Pega os elementos do carrinho
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartBody = document.getElementById('cartBody');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Se não encontrar os elementos, sai da função
    if (!cartCount || !cartTotal || !cartBody) return;

    // Calcula o total de itens no carrinho
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    // Atualiza o contador de itens
    cartCount.textContent = totalItems;

    // Calcula o valor total do carrinho
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    // Atualiza o valor total
    cartTotal.textContent = total.toFixed(2);

    // Habilita ou desabilita o botão de checkout
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }

    // Se o carrinho estiver vazio, mostra uma mensagem
    if (cart.length === 0) {
        cartBody.innerHTML = '<p class="text-gray-400 text-center py-8">Carrinho vazio</p>';
    } else {
        // Mapeia os itens do carrinho para HTML e renderiza
        cartBody.innerHTML = cart.map(item => `
            <div class="cart-item flex items-center mb-4 pb-4 border-b border-[#0f3460] last:border-b-0">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md mr-4">
                <div class="cart-item-details flex-grow">
                    <h6 class="text-white text-base font-semibold">${item.name}</h6>
                    <p class="text-gray-400 text-sm">Preço: $${parseFloat(item.price).toFixed(2)}</p>
                    <p class="text-gray-400 text-sm">Quantidade: ${item.quantity}</p>
                </div>
                <button class="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition duration-200" onclick="removeFromCart(${item.id})">
                    Remover
                </button>
            </div>
        `).join('');
    }
}

// Adiciona um jogo ao carrinho
function addToCart(gameId) {
    // Encontra o jogo pelo ID
    const game = games.find(g => g.id === gameId);
    // Se o jogo não for encontrado, sai
    if (!game) return;

    // Verifica se o item já existe no carrinho
    const existingItem = cart.find(item => item.id === gameId);
    // Se existir, aumenta a quantidade
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Se não existir, adiciona um novo item com quantidade 1
        cart.push({ ...game, quantity: 1 });
    }

    // Salva o carrinho e atualiza a exibição
    saveCartToLocalStorage();
    updateCartDisplay();
    // Mostra uma notificação
    showToast(`${game.name} adicionado ao carrinho!`);
}

// Remove um jogo do carrinho
function removeFromCart(gameId) {
    // Filtra o carrinho para remover o item com o ID
    cart = cart.filter(item => item.id !== gameId);
    // Salva o carrinho e atualiza a exibição
    saveCartToLocalStorage();
    updateCartDisplay();
}

// Alterna a visibilidade da barra lateral do carrinho
function toggleCart() {
    // Pega o elemento da barra lateral
    const cartSidebar = document.getElementById('cartSidebar');
    // Alterna a classe 'open'
    if (cartSidebar) cartSidebar.classList.toggle('open');
}


// --- Main Page (index.html) Specific Functions ---
// Funções específicas da página principal (index.html)

// Busca jogos na API RAWG
async function fetchRawgGames(page = 1, page_size = 20) {
    // Monta a URL da API
    const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page=${page}&page_size=${page_size}&ordering=-rating`;
    // Faz a requisição
    const response = await fetch(url);
    // Se a resposta não for OK, lança um erro
    if (!response.ok) throw new Error("Falha ao buscar jogos da RAWG");
    // Converte a resposta para JSON
    const data = await response.json();
    // Retorna os resultados da busca
    return data.results;
}

// Carrega os jogos da API RAWG
async function loadGames(reset = false) {
    try {
        // Mostra o loading
        showLoading(true);
        // Busca os jogos na API
        const rawgGames = await fetchRawgGames(currentPage);
        // Mapeia os dados da API para um formato mais simples
        const newGames = rawgGames.map((game) => ({
            id: game.id,
            name: game.name,
            // Gera um preço aleatório
            price: (Math.random() * (70 - 10) + 10).toFixed(2),
            // Pega a imagem ou usa um placeholder
            image: game.background_image || `https://placehold.co/400x250/0f3460/e0e0e0?text=GameZone+Store`,
            // Pega a descrição, limitando o tamanho
            description: game.description_raw ? game.description_raw.substring(0, 100) + '...' : 'Descrição não disponível',
            // Pega o gênero
            genre: game.genres?.[0]?.name || 'Casual'
        }));
        
        // Se for para resetar, substitui a lista de jogos
        if (reset) {
            games = [...newGames];
        } else {
            // Se não, adiciona os novos jogos à lista existente
            games = [...games, ...newGames];
        }
        
        // Renderiza os jogos filtrados
        renderGames(getFilteredGames());
        // Atualiza a contagem de jogos
        updateGameCount();
        // Esconde o loading
        showLoading(false);
    } catch (error) {
        // Em caso de erro, exibe uma mensagem
        console.error('Erro ao carregar jogos:', error);
        showToast('Não foi possível carregar os jogos. Tente novamente.', 'error');
        showLoading(false);
    }
}

// Renderiza os cards dos jogos
function renderGames(gamesToRender) {
    // Pega o contêiner dos jogos
    const container = document.getElementById('gamesContainer');
    // Se o contêiner não existir, sai
    if (!container) return;
    
    // Limpa o conteúdo atual
    container.innerHTML = '';
    
    // Se não houver jogos para renderizar, mostra uma mensagem
    if (gamesToRender.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Nenhum jogo encontrado com os filtros aplicados.</div>';
        return;
    }

    // Itera sobre a lista de jogos e cria o HTML para cada um
    gamesToRender.forEach(game => {
        const gameCardHtml = `
            <div class="game-card bg-[#0f3460] rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:-translate-y-2">
                <img src="${game.image}" alt="${game.name}" class="w-full h-48 object-cover rounded-t-xl">
                <div class="game-card-body p-5">
                    <h3 class="game-card-title text-xl font-bold text-white mb-2">${game.name}</h3>
                    <p class="game-card-genre text-gray-400 text-sm mb-4">${game.genre}</p>
                    <div class="flex justify-between items-center">
                        <span class="game-card-price text-2xl font-extrabold text-[#e94560]">$${parseFloat(game.price).toFixed(2)}</span>
                        <button class="add-to-cart-btn bg-[#e94560] text-white px-5 py-2 rounded-full hover:bg-[#c73a50] transition duration-200" onclick="addToCart(${game.id})">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        // Adiciona o HTML ao contêiner
        container.innerHTML += gameCardHtml;
    });
    // Atualiza a contagem de jogos
    updateGameCount();
}

// Atualiza a contagem de jogos na página
function updateGameCount() {
    // Pega o elemento de contagem
    const gameCountElement = document.getElementById('gameCount');
    // Se existir, atualiza o texto com o número de jogos filtrados
    if (gameCountElement) {
        gameCountElement.textContent = `${getFilteredGames().length} jogos encontrados`;
    }
}

// Retorna a lista de jogos filtrados
function getFilteredGames() {
    // Pega o valor da busca e os gêneros selecionados
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const selectedGenres = Array.from(document.querySelectorAll('.filter-category input[type="checkbox"]:checked'))
        .map(cb => cb.value.toLowerCase());
    
    // Filtra os jogos pelo nome ou descrição
    let filtered = games.filter(game => 
        game.name.toLowerCase().includes(searchInput) ||
        game.description.toLowerCase().includes(searchInput)
    );
    
    // Se houver gêneros selecionados, filtra também por gênero
    if (selectedGenres.length > 0) {
        filtered = filtered.filter(game => 
            selectedGenres.some(genre => game.genre.toLowerCase().includes(genre))
        );
    }
    // Retorna a lista filtrada
    return filtered;
}

// Aplica os filtros e renderiza os jogos
function filterGames() {
    renderGames(getFilteredGames());
}

// Limpa todos os filtros
function clearFilters() {
    // Limpa o campo de busca
    document.getElementById('searchInput').value = '';
    // Desmarca todos os checkboxes de filtro
    document.querySelectorAll('.filter-category input[type="checkbox"]').forEach(cb => cb.checked = false);
    // Renderiza todos os jogos (sem filtro)
    renderGames(games);
    // Atualiza a contagem
    updateGameCount();
}

// Carrega mais jogos
async function loadMoreGames() {
    // Pega o botão de "carregar mais"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    // Desabilita o botão e mostra um spinner
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Carregando...';
    }
    
    // Incrementa o número da página
    currentPage++;
    // Carrega os novos jogos
    await loadGames(false);
    
    // Reabilita o botão e restaura o texto original
    if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus-circle mr-2"></i>Carregar Mais Jogos';
    }
}

// Inicializa a página principal (index.html)
async function initializeHomePage() {
    // Carrega o carrinho do localStorage
    loadCartFromLocalStorage();
    // Mostra o loading
    showLoading(true);
    // Carrega os jogos iniciais
    await loadGames(true);
    // Atualiza a exibição do carrinho
    updateCartDisplay();
    // Esconde o loading
    showLoading(false);
}

// --- Payment Page (payment.html) Specific Functions ---
// Funções específicas da página de pagamento (payment.html)

// Atualiza o resumo do pagamento
function updatePaymentSummary() {
    // Pega os elementos do resumo
    const paymentSummary = document.getElementById('paymentSummary');
    const paymentTotal = document.getElementById('paymentTotal');
    
    // Se os elementos não existirem, sai
    if (!paymentSummary || !paymentTotal) return;

    // Calcula o valor total do carrinho
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    // Atualiza o valor total
    paymentTotal.textContent = total.toFixed(2);

    // Se o carrinho estiver vazio, mostra uma mensagem
    if (cart.length === 0) {
        paymentSummary.innerHTML = '<p class="text-gray-400 text-center py-8">Nenhum item no carrinho</p>';
    } else {
        // Mapeia os itens do carrinho para o HTML do resumo
        paymentSummary.innerHTML = cart.map(item => `
            <div class="product-summary-item flex justify-between items-center py-3 border-b border-[#0f3460] last:border-b-0">
                <span class="text-white text-lg">${item.name} (x${item.quantity})</span>
                <span class="text-[#e94560] text-lg font-semibold">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }
}

// Gera o QR Code para pagamento
function generateQR() {
    // Calcula o valor total
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    // Pega o contêiner do QR Code
    const qrContainer = document.getElementById('qrContainer');

    // Se o contêiner não existir, sai
    if (!qrContainer) return;

    // Se o total for zero, mostra um placeholder
    if (total === 0) {
        qrContainer.innerHTML = `
            <div class="qr-placeholder text-7xl text-[#e94560] mb-4">
                <i class="fas fa-qrcode"></i>
            </div>
            <p class="text-gray-400 text-lg">Seu carrinho está vazio para gerar o QR Code.</p>
        `;
        return;
    }

    // Monta os dados para o QR Code
    const qrData = `GameZone Store - Total: $${total.toFixed(2)} - Items: ${cart.length}`;
    // Monta a URL da API de QR Code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    // Renderiza o QR Code
    qrContainer.innerHTML = `
        <div class="text-center">
            <img src="${qrUrl}" alt="QR Code para pagamento" class="mx-auto mb-4 rounded-lg shadow-md" style="border: 2px solid #e94560;">
            <p class="text-green-400 text-xl font-bold">Total: $${total.toFixed(2)}</p>
            <p class="text-gray-400 text-sm">Escaneie para pagar via Pix</p>
        </div>
    `;
}

// Simula o pagamento
function simulatePayment() {
    // Mostra uma notificação de sucesso
    showToast('Pagamento realizado com sucesso! 🎉', 'success');
    // Esvazia o carrinho
    cart = [];
    // Remove o carrinho do localStorage
    localStorage.removeItem('gameZoneCart');
    
    // Redireciona para a página principal após 2 segundos
    setTimeout(() => window.location.href = 'index.html', 2000); 
}

// Inicializa a página de pagamento (payment.html)
function initializePaymentPage() {
    // Carrega o carrinho
    loadCartFromLocalStorage();
    // Se o carrinho estiver vazio, mostra um aviso e redireciona
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio.', 'warning');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    // Atualiza o resumo do pagamento
    updatePaymentSummary();
    // Gera o QR Code
    generateQR();
}

// --- Navigation Functions ---
// Funções de navegação

// Navega para a página de pagamento
function goToPayment() {
    // Se o carrinho estiver vazio, mostra um aviso
    if (cart.length === 0) {
        showToast('Adicione itens ao carrinho primeiro!', 'warning');
        return;
    }
    
    // Garante que o carrinho mais recente está salvo
    saveCartToLocalStorage();
    // Redireciona para a página de pagamento
    window.location.href = 'payment.html';
}

// Navega para a página principal
function showHome() {
    window.location.href = 'index.html';
}

// --- Event Listeners Setup ---
// Configuração dos "Event Listeners"

// Configura os ouvintes de eventos
function setupEventListeners() {
    // Ouve o clique no documento
    document.addEventListener('click', function(e) {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartButton = document.querySelector('[onclick="toggleCart()"]');
        
        // Fecha a barra lateral se o clique for fora dela
        if (cartSidebar && cartSidebar.classList.contains('open') && 
            !cartSidebar.contains(e.target) && 
            !cartButton.contains(e.target)) {
            toggleCart();
        }
    });

    // Ouve o pressionar de tecla no documento
    document.addEventListener('keydown', function(e) {
        // Se a tecla for "Escape", fecha a barra lateral
        if (e.key === 'Escape') {
            const cartSidebar = document.getElementById('cartSidebar');
            if (cartSidebar && cartSidebar.classList.contains('open')) {
                toggleCart();
            }
        }
    });
}

// --- Main Document Ready Logic ---
// Lógica principal ao carregar o documento
document.addEventListener('DOMContentLoaded', function() {
    // Detecta em qual página estamos
    const currentPath = window.location.pathname;
    // Se for a página de pagamento, inicializa-a
    if (currentPath.includes('payment.html')) {
        initializePaymentPage();
    } else {
        // Caso contrário, inicializa a página principal
        initializeHomePage();
    }
    // Configura os ouvintes de eventos globais
    setupEventListeners();
});