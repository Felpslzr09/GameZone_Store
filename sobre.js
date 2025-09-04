// JavaScript específico para a página Sobre da GameZone Store

// Configurações do mapa
const MAP_CONFIG = {
    center: [-30.0346, -51.2177], // Coordenadas de Porto Alegre, Rio Grande do Sul
    zoom: 15,
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
};

// Dados da empresa
const COMPANY_DATA = {
    name: 'GameZone Store',
    address: 'Rua dos Andradas, 1234 - Centro Histórico, Porto Alegre - RS',
    phone: '(51) 3026-8922',
    email: 'contato@gamezone.com.br',
    coordinates: [-30.0346, -51.2177]
};

// Variáveis globais
let map = null;
let marker = null;

// Inicialização da página
function initAboutPage() {
    console.log('Inicializando página Sobre...');
    
    // Inicializa o mapa
    initMap();
    
    // Configura animações
    setupAnimations();
    
    // Configura contadores animados
    setupCounters();
    
    // Configura eventos de scroll
    setupScrollEvents();
    
    console.log('Página Sobre inicializada com sucesso!');
}

// Inicializa o mapa com Leaflet
function initMap() {
    try {
        console.log('Inicializando mapa...');
        
        // Cria o mapa
        map = L.map('map').setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
        
        // Adiciona a camada de tiles
        L.tileLayer(MAP_CONFIG.tileLayer, {
            attribution: MAP_CONFIG.attribution,
            maxZoom: 19
        }).addTo(map);
        
        // Cria marcador customizado
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="bg-[#e94560] w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <i class="fas fa-gamepad text-white text-lg"></i>
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 48],
            popupAnchor: [0, -48]
        });
        
        // Adiciona marcador no mapa
        marker = L.marker(COMPANY_DATA.coordinates, { 
            icon: customIcon 
        }).addTo(map);
        
        // Configura popup do marcador
        const popupContent = `
            <div class="text-center p-2">
                <div class="flex items-center justify-center mb-2">
                    <div class="w-8 h-8 bg-gradient-to-r from-[#e94560] to-[#c73a50] rounded-lg flex items-center justify-center mr-2">
                        <i class="fas fa-gamepad text-white"></i>
                    </div>
                    <h3 class="font-bold text-white">${COMPANY_DATA.name}</h3>
                </div>
                <p class="text-gray-300 text-sm mb-3">${COMPANY_DATA.address}</p>
                <div class="space-y-1 text-sm">
                    <p class="text-gray-300">
                        <i class="fas fa-phone text-[#e94560] mr-2"></i>
                        ${COMPANY_DATA.phone}
                    </p>
                    <p class="text-gray-300">
                        <i class="fas fa-envelope text-[#e94560] mr-2"></i>
                        ${COMPANY_DATA.email}
                    </p>
                </div>
                <div class="mt-3">
                    <button onclick="openDirections()" class="bg-[#e94560] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#c73a50] transition duration-300">
                        <i class="fas fa-directions mr-1"></i>Como chegar
                    </button>
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-popup'
        });
        
        // Abre o popup automaticamente
        marker.openPopup();
        
        // Configura eventos do mapa
        map.on('click', function(e) {
            console.log('Clique no mapa:', e.latlng);
        });
        
        // Adiciona controles customizados
        addMapControls();
        
        console.log('Mapa inicializado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
        showMapError();
    }
}

// Adiciona controles customizados ao mapa
function addMapControls() {
    // Botão para centralizar no marcador
    const centerControl = L.control({position: 'topright'});
    
    centerControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.innerHTML = '<button class="bg-white hover:bg-gray-100 p-2 rounded shadow cursor-pointer" title="Centralizar"><i class="fas fa-crosshairs text-gray-700"></i></button>';
        
        div.onclick = function() {
            map.setView(COMPANY_DATA.coordinates, MAP_CONFIG.zoom);
            marker.openPopup();
            showToast('Mapa centralizado na GameZone Store!', 'info');
        };
        
        return div;
    };
    
    centerControl.addTo(map);
    
    // Botão para mudar visualização
    const viewControl = L.control({position: 'topright'});
    
    viewControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.innerHTML = '<button class="bg-white hover:bg-gray-100 p-2 rounded shadow cursor-pointer" title="Vista Satélite"><i class="fas fa-satellite text-gray-700"></i></button>';
        
        let isSatellite = false;
        
        div.onclick = function() {
            if (!isSatellite) {
                // Muda para vista satélite (usando outro provider)
                map.eachLayer(function(layer) {
                    if (layer instanceof L.TileLayer) {
                        map.removeLayer(layer);
                    }
                });
                
                L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                }).addTo(map);
                
                div.innerHTML = '<button class="bg-white hover:bg-gray-100 p-2 rounded shadow cursor-pointer" title="Vista Mapa"><i class="fas fa-map text-gray-700"></i></button>';
                isSatellite = true;
            } else {
                // Volta para vista normal
                map.eachLayer(function(layer) {
                    if (layer instanceof L.TileLayer) {
                        map.removeLayer(layer);
                    }
                });
                
                L.tileLayer(MAP_CONFIG.tileLayer, {
                    attribution: MAP_CONFIG.attribution
                }).addTo(map);
                
                div.innerHTML = '<button class="bg-white hover:bg-gray-100 p-2 rounded shadow cursor-pointer" title="Vista Satélite"><i class="fas fa-satellite text-gray-700"></i></button>';
                isSatellite = false;
            }
        };
        
        return div;
    };
    
    viewControl.addTo(map);
}

// Mostra erro do mapa
function showMapError() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="flex items-center justify-center h-full bg-[#0f3460] rounded-2xl">
                <div class="text-center p-8">
                    <i class="fas fa-exclamation-triangle text-[#e94560] text-4xl mb-4"></i>
                    <h3 class="text-white text-xl font-bold mb-2">Erro ao Carregar Mapa</h3>
                    <p class="text-gray-300 mb-4">Não foi possível carregar o mapa interativo.</p>
                    <button onclick="initMap()" class="bg-[#e94560] text-white px-4 py-2 rounded-lg hover:bg-[#c73a50] transition duration-300">
                        <i class="fas fa-redo mr-2"></i>Tentar Novamente
                    </button>
                </div>
            </div>
        `;
    }
}

// Abre direções no Google Maps
function openDirections() {
    const destination = encodeURIComponent(COMPANY_DATA.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
    showToast('Abrindo direções no Google Maps...', 'info');
}

// Configura animações de entrada
function setupAnimations() {
    // Observer para animar elementos quando entram na tela
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Adiciona observer aos elementos animáveis
    const animatedElements = document.querySelectorAll('.stats-card, .timeline-item, h2, h3');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Configura contadores animados para estatísticas
function setupCounters() {
    const counters = [
        { element: document.querySelector('.stats-card:nth-child(1) .text-3xl'), target: 500, suffix: 'K+' },
        { element: document.querySelector('.stats-card:nth-child(2) .text-3xl'), target: 10, suffix: 'K+' },
        { element: document.querySelector('.stats-card:nth-child(3) .text-3xl'), target: 4.9, suffix: '', isDecimal: true },
        { element: document.querySelector('.stats-card:nth-child(4) .text-3xl'), target: 50, suffix: '+' }
    ];
    
    const animateCounter = (counter) => {
        let current = 0;
        const increment = counter.target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= counter.target) {
                current = counter.target;
                clearInterval(timer);
            }
            
            if (counter.isDecimal) {
                counter.element.textContent = current.toFixed(1);
            } else {
                counter.element.textContent = Math.floor(current);
            }
            
            // Adiciona sufixo apenas no final
            if (current >= counter.target && counter.suffix) {
                counter.element.textContent = Math.floor(counter.target) + counter.suffix;
                if (counter.isDecimal) {
                    counter.element.textContent = counter.target.toFixed(1);
                }
            }
        }, 50);
    };
    
    // Observer para iniciar contadores quando visíveis
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = counters.find(c => c.element === entry.target);
                if (counter) {
                    animateCounter(counter);
                    counterObserver.unobserve(entry.target);
                }
            }
        });
    });
    
    counters.forEach(counter => {
        if (counter.element) {
            counter.element.textContent = '0';
            counterObserver.observe(counter.element);
        }
    });
}

// Configura eventos de scroll
function setupScrollEvents() {
    let ticking = false;
    
    function updateScrollElements() {
        const scrollY = window.scrollY;
        
        // Paralaxe suave no hero
        const hero = document.querySelector('.hero-gradient');
        if (hero) {
            hero.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
        
        // Efeito nos cards de estatísticas
        const statsCards = document.querySelectorAll('.stats-card');
        statsCards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                const progress = (window.innerHeight - rect.top) / window.innerHeight;
                card.style.transform = `translateY(${Math.max(0, (1 - progress) * 50)}px)`;
                card.style.opacity = Math.min(1, progress * 2);
            }
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollElements);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Funcionalidades de contato
function callPhone() {
    window.location.href = `tel:${COMPANY_DATA.phone.replace(/[^0-9]/g, '')}`;
    showToast('Iniciando chamada...', 'info');
}

function sendEmail() {
    window.location.href = `mailto:${COMPANY_DATA.email}?subject=Contato%20GameZone%20Store`;
    showToast('Abrindo cliente de email...', 'info');
}

// Compartilhamento social
function shareOnSocial(platform) {
    const url = window.location.href;
    const text = 'Conheça a GameZone Store - Sua loja de jogos favorita!';
    
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        showToast(`Compartilhando no ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`, 'info');
    }
}

// Feedback do usuário
function submitFeedback(rating, message) {
    // Simula envio de feedback
    console.log('Feedback enviado:', { rating, message, page: 'about' });
    
    showToast('Obrigado pelo seu feedback! Sua opinião é muito importante para nós.', 'success');
    
    // Limpa formulário se existir
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.reset();
    }
}

// Newsletter signup
function subscribeNewsletter(email) {
    if (!email || !email.includes('@')) {
        showToast('Por favor, digite um e-mail válido.', 'error');
        return;
    }
    
    // Simula cadastro na newsletter
    console.log('Newsletter subscription:', email);
    showToast('Cadastro realizado! Você receberá nossas novidades em breve.', 'success');
    
    // Limpa campo
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.value = '';
    }
}

// Funcionalidades de acessibilidade
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    const isActive = document.body.classList.contains('high-contrast');
    localStorage.setItem('highContrast', isActive);
    showToast(isActive ? 'Alto contraste ativado' : 'Alto contraste desativado', 'info');
}

function increaseFontSize() {
    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    document.documentElement.style.fontSize = (currentSize + 2) + 'px';
    showToast('Fonte aumentada', 'info');
}

function decreaseFontSize() {
    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (currentSize > 12) {
        document.documentElement.style.fontSize = (currentSize - 2) + 'px';
        showToast('Fonte diminuída', 'info');
    }
}

// Busca de endereço para direções
function searchAddress() {
    const address = prompt('Digite seu endereço para obter direções:');
    if (address && address.trim()) {
        const origin = encodeURIComponent(address);
        const destination = encodeURIComponent(COMPANY_DATA.address);
        const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
        window.open(url, '_blank');
        showToast('Abrindo direções personalizadas...', 'info');
    }
}

// Inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutPage);
} else {
    initAboutPage();
}

// Exporta funções para uso global
window.openDirections = openDirections;
window.callPhone = callPhone;
window.sendEmail = sendEmail;
window.shareOnSocial = shareOnSocial;
window.submitFeedback = submitFeedback;
window.subscribeNewsletter = subscribeNewsletter;
window.toggleHighContrast = toggleHighContrast;
window.increaseFontSize = increaseFontSize;
window.decreaseFontSize = decreaseFontSize;
window.searchAddress = searchAddress;

// Log de inicialização
console.log('Script sobre.js carregado com sucesso!');