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
    const loading = document.getElementById('loading');
    if (loading) {
        if (show) {
            loading.classList.remove('hidden');
            loading.style.display = 'flex';
        } else {
            loading.classList.add('hidden');
            loading.style.display = 'none';
        }
    }
}

// Mostra uma mensagem de "toast" (notificação)
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-yellow-600';
    
    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-2 transform transition-all duration-300 ease-in-out opacity-0 translate-x-full`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Anima a entrada
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-x-full');
    }, 100);
    
    // Remove após 3 segundos
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// --- Cart Management Functions ---
// Funções de gerenciamento do carrinho

// Carrega o carrinho do localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('gameZoneCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Salva o carrinho no localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('gameZoneCart', JSON.stringify(cart));
}

// Atualiza a exibição do carrinho na barra lateral
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartBody = document.getElementById('cartBody');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const floatingBtn = document.getElementById('floatingCheckoutBtn');
    const floatingTotal = document.getElementById('floatingCheckoutTotal');
    
    if (!cartCount) return;

    // Calcula o total de itens no carrinho
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Mostra/esconde o badge do carrinho
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }

    // Calcula o valor total do carrinho
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    
    if (cartTotal) {
        cartTotal.textContent = total.toFixed(2);
    }

    // Atualiza botão flutuante
    if (floatingBtn && floatingTotal) {
        if (totalItems > 0) {
            floatingBtn.classList.remove('hidden');
            floatingTotal.textContent = total.toFixed(2);
        } else {
            floatingBtn.classList.add('hidden');
        }
    }

    // Habilita ou desabilita o botão de checkout
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
        checkoutBtn.style.opacity = cart.length === 0 ? '0.5' : '1';
    }

    if (cartBody) {
        // Se o carrinho estiver vazio, mostra uma mensagem
        if (cart.length === 0) {
            cartBody.innerHTML = '<p class="text-gray-400 text-center py-8">Carrinho vazio</p>';
        } else {
            // Mapeia os itens do carrinho para HTML e renderiza
            cartBody.innerHTML = cart.map(item => `
                <div class="cart-item flex items-center mb-4 p-3 bg-[#1a1a2e] rounded-lg">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded mr-3">
                    <div class="flex-1">
                        <h6 class="text-white text-sm font-semibold">${item.name}</h6>
                        <p class="text-[#e94560] font-bold">$${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="decreaseQuantity(${item.id})" class="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">-</button>
                        <span class="text-white font-bold">${item.quantity}</span>
                        <button onclick="increaseQuantity(${item.id})" class="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">+</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Adiciona um jogo ao carrinho
function addToCart(gameId) {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const existingItem = cart.find(item => item.id === gameId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...game, quantity: 1 });
    }

    saveCartToLocalStorage();
    updateCartDisplay();
    showToast(`${game.name} adicionado ao carrinho!`);
}

// Remove um jogo do carrinho completamente
function removeFromCart(gameId) {
    cart = cart.filter(item => item.id !== gameId);
    saveCartToLocalStorage();
    updateCartDisplay();
    showToast('Item removido do carrinho!', 'error');
}

// Aumenta a quantidade de um item
function increaseQuantity(gameId) {
    const item = cart.find(item => item.id === gameId);
    if (item) {
        item.quantity += 1;
        saveCartToLocalStorage();
        updateCartDisplay();
    }
}

// Diminui a quantidade de um item
function decreaseQuantity(gameId) {
    const item = cart.find(item => item.id === gameId);
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            removeFromCart(gameId);
            return;
        }
        saveCartToLocalStorage();
        updateCartDisplay();
    }
}

// Alterna a visibilidade da barra lateral do carrinho
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('translate-x-full');
    }
}

// --- Main Page (index.html) Specific Functions ---

// Busca jogos na API RAWG
async function fetchRawgGames(page = 1, page_size = 40) {
    const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page=${page}&page_size=${page_size}&ordering=-rating`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao buscar jogos da RAWG");
    const data = await response.json();
    return data.results;
}

// Carrega os jogos da API RAWG
async function loadGames(reset = false) {
    try {
        showLoading(true);
        const rawgGames = await fetchRawgGames(currentPage);
        const newGames = rawgGames.map((game) => ({
            id: game.id,
            name: game.name,
            price: (Math.random() * (70 - 10) + 10).toFixed(2),
            image: game.background_image || `https://placehold.co/400x250/0f3460/e0e0e0?text=GameZone+Store`,
            description: game.description_raw ? game.description_raw.substring(0, 100) + '...' : 'Descrição não disponível',
            genre: game.genres?.[0]?.name || 'Casual'
        }));
        
        if (reset) {
            games = [...newGames];
        } else {
            games = [...games, ...newGames];
        }
        
        renderGames(getFilteredGames());
        updateGameCount();
        showLoading(false);
    } catch (error) {
        console.error('Erro ao carregar jogos:', error);
        showToast('Não foi possível carregar os jogos. Tente novamente.', 'error');
        showLoading(false);
    }
}

// Renderiza os cards dos jogos
function renderGames(gamesToRender) {
    const container = document.getElementById('gamesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (gamesToRender.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Nenhum jogo encontrado com os filtros aplicados.</div>';
        return;
    }

    gamesToRender.forEach(game => {
        const gameCardHtml = `
            <div class="game-card bg-[#16213e] rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:-translate-y-2">
                <img src="${game.image}" alt="${game.name}" class="w-full h-48 object-cover rounded-t-xl">
                <div class="game-card-body p-5">
                    <h3 class="game-card-title text-lg font-bold text-white mb-2">${game.name}</h3>
                    <p class="game-card-genre text-gray-400 text-sm mb-2">${game.genre}</p>
                    <p class="text-gray-300 text-xs mb-4">${game.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="game-card-price text-xl font-extrabold text-[#e94560]">$${parseFloat(game.price).toFixed(2)}</span>
                        <button class="add-to-cart-btn bg-[#e94560] text-white px-4 py-2 rounded-lg hover:bg-[#c73a50] transition duration-200 flex items-center" onclick="addToCart(${game.id})">
                            <i class="fas fa-shopping-cart mr-2"></i>Adicionar
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += gameCardHtml;
    });
    updateGameCount();
}

// Atualiza a contagem de jogos na página
function updateGameCount() {
    const gameCountElement = document.getElementById('gameCount');
    if (gameCountElement) {
        gameCountElement.textContent = `${getFilteredGames().length} jogos encontrados`;
    }
}

// Retorna a lista de jogos filtrados
function getFilteredGames() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const selectedGenres = Array.from(document.querySelectorAll('.filter-category input[type="checkbox"]:checked'))
        .map(cb => cb.value.toLowerCase());
    
    let filtered = games.filter(game => 
        game.name.toLowerCase().includes(searchInput) ||
        game.description.toLowerCase().includes(searchInput)
    );
    
    if (selectedGenres.length > 0) {
        filtered = filtered.filter(game => 
            selectedGenres.some(genre => game.genre.toLowerCase().includes(genre))
        );
    }
    return filtered;
}

// Aplica os filtros e renderiza os jogos
function filterGames() {
    renderGames(getFilteredGames());
}

// Limpa todos os filtros
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.filter-category input[type="checkbox"]').forEach(cb => cb.checked = false);
    renderGames(games);
    updateGameCount();
}

// Carrega mais jogos
async function loadMoreGames() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Carregando...';
    }
    
    currentPage++;
    await loadGames(false);
    
    if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus-circle mr-2"></i>Carregar Mais Jogos';
    }
}

// Inicializa a página principal (index.html)
async function initializeHomePage() {
    loadCartFromLocalStorage();
    showLoading(true);
    await loadGames(true);
    updateCartDisplay();
    showLoading(false);
}

// --- Payment Page (payment.html) Specific Functions ---

// Atualiza o resumo do pagamento
function updatePaymentSummary() {
    const paymentSummary = document.getElementById('paymentSummary');
    const paymentTotal = document.getElementById('paymentTotal');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const paymentButtonContainer = document.getElementById('paymentButtonContainer');
    
    if (!paymentSummary || !paymentTotal) return;

    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    paymentTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    if (cart.length === 0) {
        if (emptyCartMessage) {
            emptyCartMessage.classList.remove('hidden');
        }
        if (paymentButtonContainer) {
            paymentButtonContainer.classList.add('hidden');
        }
        paymentSummary.innerHTML = '<p class="text-gray-400 text-center py-8">Nenhum item no carrinho</p>';
    } else {
        if (emptyCartMessage) {
            emptyCartMessage.classList.add('hidden');
        }
        if (paymentButtonContainer) {
            paymentButtonContainer.classList.remove('hidden');
        }
        paymentSummary.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center py-3 border-b border-[#0f3460] last:border-b-0">
                <div class="flex items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded mr-3">
                    <div>
                        <span class="text-white text-sm font-semibold">${item.name}</span>
                        <p class="text-gray-400 text-xs">Quantidade: ${item.quantity}</p>
                    </div>
                </div>
                <span class="text-[#e94560] font-semibold">R$ ${(parseFloat(item.price) * item.quantity).toFixed(2).replace('.', ',')}</span>
            </div>
        `).join('');
    }
}

// Função chamada pelo botão "Gerar QR Code PIX"
function generatePixQR() {
    const payButton = document.getElementById('payButton');
    const qrContainer = document.getElementById('qrContainer');
    const qrTotal = document.getElementById('qrTotal');
    
    if (!qrContainer || !payButton) return;
    
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    
    if (total === 0) {
        showToast('Carrinho vazio! Adicione itens para gerar o QR Code.', 'error');
        return;
    }
    
    // Esconde o botão de pagamento
    payButton.parentElement.style.display = 'none';
    
    // Atualiza o total no QR
    if (qrTotal) {
        qrTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
    
    // Gera o QR Code usando a biblioteca QRCode.js
    const canvas = document.getElementById('qrCanvas');
    if (canvas && typeof QRCode !== 'undefined') {
        const qrData = `PIX - GameZone Store - Total: R$ ${total.toFixed(2)} - Itens: ${cart.length}`;
        QRCode.toCanvas(canvas, qrData, {
            width: 256,
            height: 256,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, function (error) {
            if (error) {
                console.error(error);
                // Fallback para API externa se a biblioteca não funcionar
                generateQRFallback();
            }
        });
    } else {
        // Fallback para API externa
        generateQRFallback();
    }
    
    // Mostra o container do QR Code
    qrContainer.classList.remove('hidden');
    
    showToast('QR Code PIX gerado com sucesso!', 'success');
}

// Fallback para gerar QR Code com API externa
function generateQRFallback() {
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const qrData = `PIX - GameZone Store - Total: R$ ${total.toFixed(2)} - Itens: ${cart.length}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;
    
    const canvas = document.getElementById('qrCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, 256, 256);
        };
        img.src = qrUrl;
    }
}

// Gera novo QR Code
function generateNewQR() {
    const canvas = document.getElementById('qrCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    showToast('Gerando novo QR Code...', 'info');
    
    setTimeout(() => {
        generatePixQR();
    }, 1000);
}

// Simula o pagamento
function simulatePayment() {
    const successModal = document.getElementById('successModal');
    
    if (successModal) {
        successModal.classList.remove('hidden');
        successModal.classList.add('flex');
    }
    
    showToast('Pagamento realizado com sucesso! 🎉', 'success');
    
    // Limpa o carrinho
    cart = [];
    localStorage.removeItem('gameZoneCart');
}

// Vai para home após pagamento
function goToHome() {
    window.location.href = 'index.html';
}

// Inicializa a página de pagamento (payment.html)
function initializePaymentPage() {
    loadCartFromLocalStorage();
    updatePaymentSummary();
    
    // Adiciona event listener para o botão de pagamento
    const payButton = document.getElementById('payButton');
    if (payButton) {
        payButton.onclick = generatePixQR;
    }
}

// --- Navigation Functions ---

// Navega para a página de pagamento
function goToPayment() {
    if (cart.length === 0) {
        showToast('Adicione itens ao carrinho primeiro!', 'error');
        return;
    }
    
    saveCartToLocalStorage();
    window.location.href = 'payment.html';
}

// Navega para a página principal
function showHome() {
    window.location.href = 'index.html';
}

// --- Event Listeners Setup ---

function setupEventListeners() {
    // Fecha carrinho ao clicar fora
    document.addEventListener('click', function(e) {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartButton = document.querySelector('[onclick="toggleCart()"]');
        
        if (cartSidebar && !cartSidebar.classList.contains('translate-x-full') && 
            !cartSidebar.contains(e.target) && 
            cartButton && !cartButton.contains(e.target)) {
            toggleCart();
        }
    });

    // Fecha carrinho com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const cartSidebar = document.getElementById('cartSidebar');
            if (cartSidebar && !cartSidebar.classList.contains('translate-x-full')) {
                toggleCart();
            }
        }
    });
}

// --- Main Document Ready Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('payment.html')) {
        initializePaymentPage();
    } else {
        initializeHomePage();
    }
    setupEventListeners();
});