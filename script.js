// GameZone Store - E-commerce de Jogos (script.js - Unified)
// Autores: Felipe Zamora e João Cappeletti
// Integrando RAWG API

const RAWG_API_KEY = "db490a37529f40048c4e0ce5b7e46fc9";
let games = [];
let cart = [];
let currentPage = 1;

// --- Global Utility Functions ---

// Show/Hide Loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
}

// Show Toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// --- Cart Management Functions (Used by both pages, primarily updated on index.html) ---

// Loads cart from localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('gameZoneCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Saves cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('gameZoneCart', JSON.stringify(cart));
}

// Update Cart Display (for sidebar on index.html)
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartBody = document.getElementById('cartBody');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!cartCount || !cartTotal || !cartBody) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    cartTotal.textContent = total.toFixed(2);

    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }

    if (cart.length === 0) {
        cartBody.innerHTML = '<p class="text-gray-400 text-center py-8">Carrinho vazio</p>';
    } else {
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

// Add to Cart
function addToCart(gameId) {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const existingItem = cart.find(item => item.id === gameId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...game, quantity: 1 });
    }

    saveCartToLocalStorage(); // Salva o carrinho no localStorage
    updateCartDisplay();
    showToast(`${game.name} adicionado ao carrinho!`);
}

// Remove from Cart
function removeFromCart(gameId) {
    cart = cart.filter(item => item.id !== gameId);
    saveCartToLocalStorage(); // Salva o carrinho no localStorage
    updateCartDisplay();
}

// Toggle Cart (sidebar)
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) cartSidebar.classList.toggle('open');
}


// --- Main Page (index.html) Specific Functions ---

// Fetch RAWG games
async function fetchRawgGames(page = 1, page_size = 20) {
    const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page=${page}&page_size=${page_size}&ordering=-rating`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao buscar jogos da RAWG");
    const data = await response.json();
    return data.results;
}

// Load games from RAWG API
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

// Render Games (agora recebe uma lista de jogos para renderizar)
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
        container.innerHTML += gameCardHtml;
    });
    updateGameCount();
}

// Update Game Count
function updateGameCount() {
    const gameCountElement = document.getElementById('gameCount');
    if (gameCountElement) {
        gameCountElement.textContent = `${getFilteredGames().length} jogos encontrados`;
    }
}

// Get Filtered Games
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

// Filter Games (agora apenas aciona a renderização com os jogos filtrados)
function filterGames() {
    renderGames(getFilteredGames());
}

// Clear Filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.filter-category input[type="checkbox"]').forEach(cb => cb.checked = false);
    renderGames(games);
    updateGameCount();
}

// Load More Games
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

// Initialize for Home Page
async function initializeHomePage() {
    loadCartFromLocalStorage(); // Carrega o carrinho antes de tudo
    showLoading(true);
    await loadGames(true); // Carrega os jogos iniciais
    updateCartDisplay(); // Atualiza a exibição do carrinho
    showLoading(false);
}

// --- Payment Page (payment.html) Specific Functions ---

// Update Payment Summary
function updatePaymentSummary() {
    const paymentSummary = document.getElementById('paymentSummary');
    const paymentTotal = document.getElementById('paymentTotal');
    
    if (!paymentSummary || !paymentTotal) return;

    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    paymentTotal.textContent = total.toFixed(2);

    if (cart.length === 0) {
        paymentSummary.innerHTML = '<p class="text-gray-400 text-center py-8">Nenhum item no carrinho</p>';
    } else {
        paymentSummary.innerHTML = cart.map(item => `
            <div class="product-summary-item flex justify-between items-center py-3 border-b border-[#0f3460] last:border-b-0">
                <span class="text-white text-lg">${item.name} (x${item.quantity})</span>
                <span class="text-[#e94560] text-lg font-semibold">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }
}

// Generate QR Code
function generateQR() {
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const qrContainer = document.getElementById('qrContainer');

    if (!qrContainer) return;

    if (total === 0) {
        qrContainer.innerHTML = `
            <div class="qr-placeholder text-7xl text-[#e94560] mb-4">
                <i class="fas fa-qrcode"></i>
            </div>
            <p class="text-gray-400 text-lg">Seu carrinho está vazio para gerar o QR Code.</p>
        `;
        return;
    }

    const qrData = `GameZone Store - Total: $${total.toFixed(2)} - Items: ${cart.length}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    qrContainer.innerHTML = `
        <div class="text-center">
            <img src="${qrUrl}" alt="QR Code para pagamento" class="mx-auto mb-4 rounded-lg shadow-md" style="border: 2px solid #e94560;">
            <p class="text-green-400 text-xl font-bold">Total: $${total.toFixed(2)}</p>
            <p class="text-gray-400 text-sm">Escaneie para pagar via Pix</p>
        </div>
    `;
}

// Simulate Payment
function simulatePayment() {
    showToast('Pagamento realizado com sucesso! 🎉', 'success');
    cart = [];
    localStorage.removeItem('gameZoneCart'); // Limpa o carrinho no localStorage
    
    // Redireciona para a home após 2 segundos
    setTimeout(() => window.location.href = 'index.html', 2000); 
}

// Initialize for Payment Page
function initializePaymentPage() {
    loadCartFromLocalStorage();
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio.', 'warning');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    updatePaymentSummary();
    generateQR(); // Gera o QR Code automaticamente ao carregar a página
}

// --- Navigation Functions ---

function goToPayment() {
    if (cart.length === 0) {
        showToast('Adicione itens ao carrinho primeiro!', 'warning');
        return;
    }
    
    saveCartToLocalStorage(); // Garante que o carrinho mais recente está no localStorage
    window.location.href = 'payment.html'; // Redireciona para a página de pagamento
}

function showHome() {
    window.location.href = 'index.html';
}

// --- Event Listeners Setup ---

function setupEventListeners() {
    // Event listener for closing cart sidebar when clicking outside or pressing escape
    document.addEventListener('click', function(e) {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartButton = document.querySelector('[onclick="toggleCart()"]');
        
        if (cartSidebar && cartSidebar.classList.contains('open') && 
            !cartSidebar.contains(e.target) && 
            !cartButton.contains(e.target)) {
            toggleCart();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const cartSidebar = document.getElementById('cartSidebar');
            if (cartSidebar && cartSidebar.classList.contains('open')) {
                toggleCart();
            }
        }
    });
}

// --- Main Document Ready Logic ---
document.addEventListener('DOMContentLoaded', function() {
    // Detect which page we are on
    const currentPath = window.location.pathname;
    if (currentPath.includes('payment.html')) {
        initializePaymentPage();
    } else {
        // Assume index.html or root
        initializeHomePage();
    }
    setupEventListeners(); // Setup global event listeners for both pages
});
