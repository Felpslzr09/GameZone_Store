// Chave da API RAWG
const RAWG_API_KEY = "db490a37529f40048c4e0ce5b7e46fc9"

// Arrays para armazenar dados
let games = []
let cart = []
let currentPage = 1
let discount = 0
let isLoading = false


function showLoading(show) {
  const loading = document.getElementById("loading")
  if (loading) {
    if (show) {
      loading.classList.remove("hidden")
      loading.style.display = "flex"
    } else {
      loading.classList.add("hidden")
      loading.style.display = "none"
    }
  }
}

function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toastContainer")
  if (!toastContainer) return

  const toast = document.createElement("div")
  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
        ? "bg-red-600"
        : type === "warning"
          ? "bg-yellow-600"
          : "bg-blue-600"

  toast.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-lg mb-2 transform transition-all duration-300 ease-in-out opacity-0 translate-x-full`
  toast.innerHTML = `<i class="fas fa-${type === "success" ? "check" : type === "error" ? "exclamation-triangle" : "info"} mr-2"></i>${message}`

  toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.classList.remove("opacity-0", "translate-x-full")
  }, 100)

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-full")
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

// --- Cart Management Functions ---

function loadCartFromStorage() {
  try {
    const savedCart = localStorage.getItem("gameZoneCart")
    if (savedCart) {
      cart = JSON.parse(savedCart)
    }
  } catch (error) {
    console.error("Erro ao carregar carrinho:", error)
    cart = []
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem("gameZoneCart", JSON.stringify(cart))
  } catch (error) {
    console.error("Erro ao salvar carrinho:", error)
  }
}

function updateCartDisplay() {
  const cartCount = document.getElementById("cartCount")
  const cartTotal = document.getElementById("cartTotal")
  const cartBody = document.getElementById("cartBody")
  const checkoutBtn = document.getElementById("checkoutBtn")
  const floatingBtn = document.getElementById("floatingCheckoutBtn")
  const floatingTotal = document.getElementById("floatingCheckoutTotal")

  if (!cartCount) return

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  cartCount.textContent = totalItems

  if (totalItems > 0) {
    cartCount.style.display = "flex"
  } else {
    cartCount.style.display = "none"
  }

  const total = cart.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)

  if (cartTotal) {
    cartTotal.textContent = total.toFixed(2)
  }

  if (floatingBtn && floatingTotal) {
    if (totalItems > 0) {
      floatingBtn.classList.remove("hidden")
      floatingTotal.textContent = total.toFixed(2)
    } else {
      floatingBtn.classList.add("hidden")
    }
  }

  if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0
    checkoutBtn.style.opacity = cart.length === 0 ? "0.5" : "1"
  }

  if (cartBody) {
    if (cart.length === 0) {
      cartBody.innerHTML = `
                <div class="text-center text-gray-400 py-16">
                    <i class="fas fa-shopping-cart text-6xl mb-4 opacity-30"></i>
                    <p class="text-lg">Seu carrinho está vazio</p>
                    <p class="text-sm mt-2">Adicione alguns jogos incríveis!</p>
                </div>
            `
    } else {
      cartBody.innerHTML = cart
        .map(
          (item) => `
                <div class="cart-item flex items-center mb-4 p-4 bg-[#1a1a2e] rounded-lg hover:bg-[#23395d] transition duration-200">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-4">
                    <div class="flex-1">
                        <h6 class="text-white font-semibold text-sm mb-1">${item.name}</h6>
                        <p class="text-[#e94560] font-bold">R$ ${Number.parseFloat(item.price).toFixed(2)}</p>
                        <p class="text-gray-400 text-xs">${item.genre}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="decreaseQuantity(${item.id})" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition duration-200">-</button>
                        <span class="text-white font-bold px-2">${item.quantity}</span>
                        <button onclick="increaseQuantity(${item.id})" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition duration-200">+</button>
                        <button onclick="removeFromCart(${item.id})" class="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition duration-200 ml-2">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            `,
        )
        .join("")
    }
  }
}

function addToCart(gameId) {
  const game = games.find((g) => g.id === gameId)
  if (!game) return

  const existingItem = cart.find((item) => item.id === gameId)
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({ ...game, quantity: 1 })
  }

  saveCartToStorage()
  updateCartDisplay()
  showToast(`${game.name} adicionado ao carrinho!`)
}

function removeFromCart(gameId) {
  const item = cart.find((item) => item.id === gameId)
  cart = cart.filter((item) => item.id !== gameId)
  saveCartToStorage()
  updateCartDisplay()
  showToast("Item removido do carrinho!", "error")
}

function increaseQuantity(gameId) {
  const item = cart.find((item) => item.id === gameId)
  if (item) {
    item.quantity += 1
    saveCartToStorage()
    updateCartDisplay()
  }
}

function decreaseQuantity(gameId) {
  const item = cart.find((item) => item.id === gameId)
  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1
    } else {
      removeFromCart(gameId)
      return
    }
    saveCartToStorage()
    updateCartDisplay()
  }
}

function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar")
  const cartOverlay = document.getElementById("cartOverlay")

  if (cartSidebar && cartOverlay) {
    cartSidebar.classList.toggle("translate-x-full")
    cartOverlay.classList.toggle("hidden")
  }
}

function clearCart() {
  if (cart.length === 0) {
    showToast("O carrinho já está vazio!", "warning")
    return
  }

  if (confirm("Tem certeza que deseja limpar o carrinho?")) {
    cart = []
    saveCartToStorage()
    updateCartDisplay()
    showToast("Carrinho limpo!", "info")
  }
}

// --- API Functions ---

// Busca jogos famosos
async function fetchPopularGames(page = 1, page_size = 40) {
  try {
    const currentDate = new Date()
    const lastYear = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate())
    const fiveYearsAgo = new Date(currentDate.getFullYear() - 5, currentDate.getMonth(), currentDate.getDate())

    const queries = [
      // Jogos mais famosos (mais adicionados na RAWG)
      `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page=${page}&page_size=${Math.floor(page_size / 3)}&ordering=-added`,

      // Jogos famosos e bem avaliados (rating alto)
      `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page=${page}&page_size=${Math.floor(page_size / 3)}&ordering=-rating&rating=4,5`,

      // Jogos famosos lançados nos últimos 5 anos
      `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page=${page}&page_size=${Math.floor(page_size / 3)}&dates=${fiveYearsAgo.toISOString().split("T")[0]},${currentDate.toISOString().split("T")[0]}&ordering=-added`,
    ]

    const responses = await Promise.all(queries.map((url) => fetch(url)))
    const dataArray = await Promise.all(
      responses.map((response) => {
        if (!response.ok) throw new Error(`Erro na API: ${response.status}`)
        return response.json()
      }),
    )

    // Combina todos os jogos e remove duplicatas
    const allGames = dataArray.reduce((acc, data) => acc.concat(data.results), [])
    const uniqueGames = allGames.filter((game, index, self) => index === self.findIndex((g) => g.id === game.id))

    return uniqueGames.slice(0, page_size)
  } catch (error) {
    console.error("Erro ao buscar jogos:", error)
    // Fallback para busca simples
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page=${page}&page_size=${page_size}&ordering=-added`,
    )
    if (!response.ok) throw new Error("Falha ao buscar jogos")
    const data = await response.json()
    return data.results
  }
}

// Carrega jogos da API
async function loadGames(reset = false) {
  if (isLoading) return

  try {
    isLoading = true
    showLoading(true)

    const rawgGames = await fetchPopularGames(currentPage, 40)
    const newGames = rawgGames.map((game) => ({
      id: game.id,
      name: game.name,
      price: generateRealisticPrice(game),
      image:
        game.background_image ||
        `https://via.placeholder.com/400x250/0f3460/e0e0e0?text=${encodeURIComponent(game.name)}`,
      description: game.description_raw
        ? game.description_raw.substring(0, 120) + "..."
        : generateGameDescription(game),
      genre: game.genres?.[0]?.name || "Ação",
      rating: game.rating || 0,
      metacritic: game.metacritic || 0,
      released: game.released || "2024-01-01",
      platforms: game.platforms?.map((p) => p.platform.name).join(", ") || "PC",
    }))

    if (reset) {
      games = [...newGames]
      currentPage = 1
    } else {
      // Evita duplicatas ao carregar mais jogos
      const existingIds = new Set(games.map((g) => g.id))
      const uniqueNewGames = newGames.filter((g) => !existingIds.has(g.id))
      games = [...games, ...uniqueNewGames]
    }

    renderGames(getFilteredGames())
    updateGameCount()
    showLoading(false)
    isLoading = false
  } catch (error) {
    console.error("Erro ao carregar jogos:", error)
    showToast("Não foi possível carregar os jogos. Tente novamente.", "error")
    showLoading(false)
    isLoading = false
  }
}

// Gera preços realistas baseados na qualidade do jogo
function generateRealisticPrice(game) {
  let basePrice = 29.99

  // Ajusta preço baseado no Metacritic
  if (game.metacritic >= 90) basePrice = 59.99
  else if (game.metacritic >= 80) basePrice = 49.99
  else if (game.metacritic >= 70) basePrice = 39.99

  // Ajusta baseado na data de lançamento
  const releaseYear = new Date(game.released).getFullYear()
  const currentYear = new Date().getFullYear()
  const yearsOld = currentYear - releaseYear

  if (yearsOld > 5) basePrice *= 0.5
  else if (yearsOld > 3) basePrice *= 0.7
  else if (yearsOld > 1) basePrice *= 0.85

  // Adiciona variação aleatória
  const variation = (Math.random() - 0.5) * 10
  basePrice += variation

  return Math.max(9.99, basePrice).toFixed(2)
}

// Gera descrição do jogo se não houver
function generateGameDescription(game) {
  const descriptions = [
    "Uma experiência de jogo incrível que vai te manter grudado na tela por horas.",
    "Gráficos impressionantes e jogabilidade viciante em uma aventura épica.",
    "Um jogo revolucionário que redefine o gênero com mecânicas inovadoras.",
    "Prepare-se para uma jornada emocionante cheia de desafios e surpresas.",
    "Uma obra-prima do entretenimento digital com história envolvente.",
  ]
  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

// --- Game Display Functions ---

function renderGames(gamesToRender) {
  const container = document.getElementById("gamesContainer")
  if (!container) return

  container.innerHTML = ""

  if (gamesToRender.length === 0) {
    container.innerHTML = `
            <div class="col-span-full text-center text-gray-400 py-16">
                <i class="fas fa-search text-6xl mb-4 opacity-30"></i>
                <h3 class="text-2xl font-semibold mb-2">Nenhum jogo encontrado</h3>
                <p class="text-lg">Tente ajustar os filtros de busca</p>
            </div>
        `
    return
  }

  gamesToRender.forEach((game) => {
    const gameCardHtml = `
            <div class="game-card bg-[#16213e] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 overflow-hidden">
                <div class="relative">
                    <img src="${game.image}" alt="${game.name}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/400x250/0f3460/e0e0e0?text=${encodeURIComponent(game.name)}'">
                    <div class="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">
                        ${game.rating > 0 ? `⭐ ${game.rating.toFixed(1)}` : "Novo"}
                    </div>
                    ${
                      game.metacritic > 0
                        ? `
                        <div class="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                            ${game.metacritic}
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold text-white mb-2 line-clamp-2">${game.name}</h3>
                    <p class="text-[#e94560] text-sm font-semibold mb-2">${game.genre}</p>
                    <p class="text-gray-300 text-sm mb-4 line-clamp-3">${game.description}</p>
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-2xl font-bold text-[#e94560]">R$ ${Number.parseFloat(game.price).toFixed(2)}</span>
                            <p class="text-xs text-gray-400">${game.platforms}</p>
                        </div>
                        <button class="bg-[#e94560] text-white px-6 py-3 rounded-xl hover:bg-[#c73a50] transition duration-200 font-semibold flex items-center shadow-lg transform hover:scale-105" onclick="addToCart(${game.id})">
                            <i class="fas fa-shopping-cart mr-2"></i>Comprar
                        </button>
                    </div>
                </div>
            </div>
        `
    container.innerHTML += gameCardHtml
  })
  updateGameCount()
}

function updateGameCount() {
  const gameCountElement = document.getElementById("gameCount")
  if (gameCountElement) {
    const filteredCount = getFilteredGames().length
    gameCountElement.textContent = `${filteredCount} jogo${filteredCount !== 1 ? "s" : ""} encontrado${filteredCount !== 1 ? "s" : ""}`
  }
}

function getFilteredGames() {
  const searchInput = document.getElementById("searchInput")?.value.toLowerCase() || ""
  const selectedGenres = Array.from(document.querySelectorAll('#genreFilters input[type="checkbox"]:checked')).map(
    (cb) => cb.value.toLowerCase(),
  )

  let filtered = games.filter(
    (game) =>
      game.name.toLowerCase().includes(searchInput) ||
      game.description.toLowerCase().includes(searchInput) ||
      game.genre.toLowerCase().includes(searchInput),
  )

  if (selectedGenres.length > 0) {
    filtered = filtered.filter((game) => selectedGenres.some((genre) => game.genre.toLowerCase().includes(genre)))
  }

  return filtered
}

function filterGames() {
  renderGames(getFilteredGames())
}

function clearFilters() {
  const searchInput = document.getElementById("searchInput")
  if (searchInput) searchInput.value = ""

  document.querySelectorAll('#genreFilters input[type="checkbox"]').forEach((cb) => (cb.checked = false))
  renderGames(games)
  updateGameCount()
}

async function loadMoreGames() {
  const loadMoreBtn = document.getElementById("loadMoreBtn")
  if (loadMoreBtn && !isLoading) {
    loadMoreBtn.disabled = true
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Carregando mais jogos...'

    currentPage++
    await loadGames(false)

    loadMoreBtn.disabled = false
    loadMoreBtn.innerHTML = '<i class="fas fa-plus-circle mr-3"></i>Descobrir Mais Jogos'
  }
}

// --- Payment Functions ---

let currentPaymentMethod = "pix"

function switchPaymentMethod(method) {
  currentPaymentMethod = method

  // Atualiza tabs
  document.querySelectorAll(".payment-tab").forEach((tab) => {
    tab.classList.remove("active", "text-[#e94560]", "border-b-2", "border-[#e94560]")
    tab.classList.add("text-gray-400")
  })

  const activeTab = document.querySelector(`[data-method="${method}"]`)
  if (activeTab) {
    activeTab.classList.add("active", "text-[#e94560]", "border-b-2", "border-[#e94560]")
    activeTab.classList.remove("text-gray-400")
  }

  // Mostra/esconde conteúdo
  document.querySelectorAll(".payment-content").forEach((content) => {
    content.classList.add("hidden")
  })

  const activeContent = document.getElementById(`${method}Payment`)
  if (activeContent) {
    activeContent.classList.remove("hidden")
  }
}

function updatePaymentSummary() {
  const paymentSummary = document.getElementById("paymentSummary")
  const subtotalElement = document.getElementById("subtotal")
  const discountElement = document.getElementById("discount")
  const paymentTotal = document.getElementById("paymentTotal")
  const emptyCartMessage = document.getElementById("emptyCartMessage")
  const paymentTabs = document.querySelector(".payment-tabs")

  if (!paymentSummary) return

  const subtotal = cart.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)
  const discountAmount = subtotal * (discount / 100)
  const total = subtotal - discountAmount

  if (subtotalElement) subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`
  if (discountElement) discountElement.textContent = `- R$ ${discountAmount.toFixed(2)}`
  if (paymentTotal) paymentTotal.textContent = `R$ ${total.toFixed(2)}`

  if (cart.length === 0) {
    if (emptyCartMessage) emptyCartMessage.classList.remove("hidden")
    if (paymentTabs) paymentTabs.classList.add("hidden")
    paymentSummary.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <i class="fas fa-shopping-cart text-4xl mb-3 opacity-30"></i>
                <p>Nenhum item no carrinho</p>
            </div>
        `
  } else {
    if (emptyCartMessage) emptyCartMessage.classList.add("hidden")
    if (paymentTabs) paymentTabs.classList.remove("hidden")

    paymentSummary.innerHTML = cart
      .map(
        (item) => `
            <div class="flex justify-between items-center py-4 border-b border-[#0f3460] last:border-b-0">
                <div class="flex items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg mr-4" onerror="this.src='https://via.placeholder.com/64x64/0f3460/e0e0e0?text=${encodeURIComponent(item.name)}'">
                    <div>
                        <h4 class="text-white font-semibold text-sm mb-1">${item.name}</h4>
                        <p class="text-gray-400 text-xs mb-1">${item.genre}</p>
                        <p class="text-gray-400 text-xs">Qtd: ${item.quantity}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-[#e94560] font-bold">R$ ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    <p class="text-gray-400 text-xs">R$ ${Number.parseFloat(item.price).toFixed(2)} cada</p>
                </div>
            </div>
        `,
      )
      .join("")
  }
}

function applyCoupon() {
  const couponInput = document.getElementById("couponInput")
  const couponMessage = document.getElementById("couponMessage")

  if (!couponInput || !couponMessage) return

  const couponCode = couponInput.value.trim().toUpperCase()
  const validCoupons = {
    ZAMORA10: { discount: 10, message: "Cupom aplicado! 10% de desconto" },
    CAPPELETTI20: { discount: 20, message: "Cupom aplicado! 20% de desconto" },
  }

  couponMessage.classList.remove("hidden")

  if (validCoupons[couponCode]) {
    discount = validCoupons[couponCode].discount
    couponMessage.textContent = validCoupons[couponCode].message
    couponMessage.className = "mt-2 text-sm text-green-400"
    showToast(`Cupom aplicado! ${discount}% de desconto`)

    // Desabilita input após aplicar cupom válido
    couponInput.disabled = true
    couponInput.classList.add("bg-gray-700")
  } else if (couponCode) {
    discount = 0
    couponMessage.textContent = "Cupom inválido"
    couponMessage.className = "mt-2 text-sm text-red-400"
    showToast("Cupom inválido", "error")
  } else {
    couponMessage.classList.add("hidden")
    discount = 0
  }

  updatePaymentSummary()
}

function removeCoupon() {
  const couponInput = document.getElementById("couponInput")
  const couponMessage = document.getElementById("couponMessage")

  if (couponInput) {
    couponInput.value = ""
    couponInput.disabled = false
    couponInput.classList.remove("bg-gray-700")
  }

  if (couponMessage) {
    couponMessage.classList.add("hidden")
  }

  discount = 0
  updatePaymentSummary()
  showToast("Cupom removido", "info")
}

// Funções de pagamento PIX
function generatePixQR() {
  const generatePixBtn = document.getElementById("generatePixBtn")
  const qrCodeContainer = document.getElementById("qrCodeContainer")
  const pixKeyInput = document.getElementById("pixKey")

  if (!generatePixBtn || !qrCodeContainer) return

  const total = calculateTotal()

  if (total === 0) {
    showToast("Carrinho vazio! Adicione itens para gerar o QR Code.", "error")
    return
  }

  // Mostra loading
  generatePixBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Gerando QR Code...'
  generatePixBtn.disabled = true

  // Gera payload PIX real seguindo padrão brasileiro
  const pixPayload = generatePixPayload(total)

  generatePixBtn.style.display = "none"
  qrCodeContainer.classList.remove("hidden")

  if (pixKeyInput) {
    pixKeyInput.value = pixPayload
  }

  // Gera QR Code profissional usando biblioteca
  generateProfessionalQRCode(pixPayload)

  showToast("QR Code PIX gerado com sucesso!")

  // Inicia verificação de pagamento melhorada
  startPaymentVerification()
}

function generatePixPayload(amount) {
  const merchantName = "GAMEZONE STORE LTDA"
  const merchantCity = "SAO PAULO"
  const pixKey = "gamezone@pix.com.br" // Chave PIX da loja
  const transactionId = `GZ${Date.now()}`

  // Constrói payload PIX seguindo especificação do Banco Central
  let payload = ""

  // Payload Format Indicator
  payload += "000201"

  // Point of Initiation Method
  payload += "010212"

  // Merchant Account Information
  const merchantInfo = `0014br.gov.bcb.pix01${String(pixKey.length).padStart(2, "0")}${pixKey}`
  payload += `26${String(merchantInfo.length).padStart(2, "0")}${merchantInfo}`

  // Merchant Category Code
  payload += "52040000"

  // Transaction Currency (BRL)
  payload += "5303986"

  // Transaction Amount
  const amountStr = amount.toFixed(2)
  payload += `54${String(amountStr.length).padStart(2, "0")}${amountStr}`

  // Country Code
  payload += "5802BR"

  // Merchant Name
  payload += `59${String(merchantName.length).padStart(2, "0")}${merchantName}`

  // Merchant City
  payload += `60${String(merchantCity.length).padStart(2, "0")}${merchantCity}`

  // Additional Data Field Template
  const additionalData = `05${String(transactionId.length).padStart(2, "0")}${transactionId}`
  payload += `62${String(additionalData.length).padStart(2, "0")}${additionalData}`

  // CRC16 (será calculado)
  payload += "6304"

  // Calcula CRC16
  const crc = calculateCRC16(payload)
  payload += crc

  return payload
}

function calculateCRC16(payload) {
  const polynomial = 0x1021
  let crc = 0xffff

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial
      } else {
        crc <<= 1
      }
      crc &= 0xffff
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0")
}

function generateProfessionalQRCode(payload) {
  const canvas = document.getElementById("qrCanvas")
  if (!canvas) return

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}&format=png&margin=10&ecc=M`

  // Create image element to load QR code
  const img = new Image()
  img.crossOrigin = "anonymous"

  img.onload = () => {
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, 200, 200)
    ctx.drawImage(img, 0, 0, 200, 200)
    console.log("QR Code gerado com sucesso!")
  }

  img.onerror = () => {
    console.error("Erro ao gerar QR Code via API")
    showToast("Erro ao gerar QR Code. Tente novamente.", "error")
    // Fallback para método local
    generateQRCodeFallback(payload)
  }

  img.src = qrApiUrl
}

function generateQRCodeFallback(data) {
  const canvas = document.getElementById("qrCanvas")
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, 200, 200)

  // Desenha QR Code mais realista
  const size = 25 // Aumentado para mais detalhes
  const cellSize = 200 / size

  // Padrão baseado nos dados do payload
  const dataHash = data.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  // Gera padrão mais complexo
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Algoritmo melhorado para padrão mais realista
      const pattern = (i * j + dataHash + i + j) % 7
      if (pattern < 3) {
        ctx.fillStyle = "#000"
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
      }
    }
  }

  // Adiciona elementos de QR Code real
  drawQRCorners(ctx, cellSize, size)
  drawQRTimingPatterns(ctx, cellSize, size)
}

function drawQRCorners(ctx, cellSize, size) {
  ctx.fillStyle = "#000"

  // Função para desenhar um canto
  function drawCorner(x, y) {
    // Quadrado externo 7x7
    for (let i = 0; i < 7; i++) {
      ctx.fillRect((x + i) * cellSize, y * cellSize, cellSize, cellSize)
      ctx.fillRect((x + i) * cellSize, (y + 6) * cellSize, cellSize, cellSize)
      ctx.fillRect(x * cellSize, (y + i) * cellSize, cellSize, cellSize)
      ctx.fillRect((x + 6) * cellSize, (y + i) * cellSize, cellSize, cellSize)
    }

    // Quadrado interno 3x3
    for (let i = 2; i < 5; i++) {
      for (let j = 2; j < 5; j++) {
        ctx.fillRect((x + i) * cellSize, (y + j) * cellSize, cellSize, cellSize)
      }
    }
  }

  // Três cantos do QR Code
  drawCorner(0, 0) // Superior esquerdo
  drawCorner(size - 7, 0) // Superior direito
  drawCorner(0, size - 7) // Inferior esquerdo
}

function drawQRTimingPatterns(ctx, cellSize, size) {
  ctx.fillStyle = "#000"

  // Linha horizontal de timing
  for (let i = 8; i < size - 8; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize)
    }
  }

  // Linha vertical de timing
  for (let i = 8; i < size - 8; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize)
    }
  }
}

let paymentCheckCount = 0
let paymentVerificationInterval = null

function startPaymentVerification() {
  paymentCheckCount = 0

  // Adiciona status de verificação se não existir
  let pixStatus = document.getElementById("pixStatus")
  if (!pixStatus) {
    pixStatus = document.createElement("div")
    pixStatus.id = "pixStatus"
    pixStatus.className = "mt-4 p-4 bg-[#0f3460] rounded-lg"
    document.getElementById("qrCodeContainer").appendChild(pixStatus)
  }

  updatePaymentStatus("checking")

  // Verifica a cada 3 segundos
  paymentVerificationInterval = setInterval(checkPixPaymentImproved, 3000)

  // Timeout após 5 minutos
  setTimeout(() => {
    if (paymentVerificationInterval) {
      clearInterval(paymentVerificationInterval)
      updatePaymentStatus("timeout")
    }
  }, 300000) // 5 minutos
}

function checkPixPaymentImproved() {
  paymentCheckCount++

  updatePaymentStatus("checking")

  // Simula verificação mais realista
  // Aumenta chance de sucesso com o tempo (simula usuário fazendo pagamento)
  const successChance = Math.min(0.15 + paymentCheckCount * 0.1, 0.8)

  if (Math.random() < successChance || paymentCheckCount >= 20) {
    clearInterval(paymentVerificationInterval)

    if (paymentCheckCount >= 20 && Math.random() > 0.3) {
      updatePaymentStatus("failed")
    } else {
      updatePaymentStatus("success")
      setTimeout(processPaymentSuccess, 1500)
    }
  }
}

function updatePaymentStatus(status) {
  const pixStatus = document.getElementById("pixStatus")
  if (!pixStatus) return

  switch (status) {
    case "checking":
      pixStatus.innerHTML = `
                <div class="text-center text-blue-400">
                    <div class="flex items-center justify-center mb-3">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    </div>
                    <p class="font-semibold">Verificando pagamento...</p>
                    <p class="text-sm text-gray-400 mt-1">Tentativa ${paymentCheckCount}/20</p>
                    <div class="w-full bg-[#1a1a2e] rounded-full h-2 mt-3">
                        <div class="bg-blue-400 h-2 rounded-full transition-all duration-300" 
                             style="width: ${(paymentCheckCount / 20) * 100}%"></div>
                    </div>
                </div>
            `
      break

    case "success":
      pixStatus.innerHTML = `
                <div class="text-center text-green-400">
                    <i class="fas fa-check-circle text-3xl mb-3"></i>
                    <p class="font-semibold">Pagamento confirmado!</p>
                    <p class="text-sm text-gray-400 mt-1">Processando compra...</p>
                </div>
            `
      break

    case "failed":
      pixStatus.innerHTML = `
                <div class="text-center text-red-400">
                    <i class="fas fa-times-circle text-3xl mb-3"></i>
                    <p class="font-semibold">Pagamento não detectado</p>
                    <p class="text-sm text-gray-400 mt-1">Verifique se o pagamento foi realizado</p>
                    <button onclick="retryPixPayment()" 
                            class="bg-[#e94560] text-white px-4 py-2 rounded-lg mt-3 hover:bg-[#c73a50] transition duration-300">
                        <i class="fas fa-redo mr-2"></i>Tentar Novamente
                    </button>
                </div>
            `
      break

    case "timeout":
      pixStatus.innerHTML = `
                <div class="text-center text-yellow-400">
                    <i class="fas fa-clock text-3xl mb-3"></i>
                    <p class="font-semibold">Tempo esgotado</p>
                    <p class="text-sm text-gray-400 mt-1">Gere um novo QR Code para continuar</p>
                    <button onclick="regeneratePixQR()" 
                            class="bg-[#e94560] text-white px-4 py-2 rounded-lg mt-3 hover:bg-[#c73a50] transition duration-300">
                        <i class="fas fa-qrcode mr-2"></i>Gerar Novo QR Code
                    </button>
                </div>
            `
      break
  }
}

function retryPixPayment() {
  paymentCheckCount = 0
  startPaymentVerification()
}

function regeneratePixQR() {
  const generatePixBtn = document.getElementById("generatePixBtn")
  const qrCodeContainer = document.getElementById("qrCodeContainer")

  if (generatePixBtn && qrCodeContainer) {
    generatePixBtn.style.display = "block"
    generatePixBtn.innerHTML = '<i class="fas fa-qrcode mr-3"></i>Gerar QR Code PIX'
    generatePixBtn.disabled = false
    qrCodeContainer.classList.add("hidden")
  }

  // Limpa interval se existir
  if (paymentVerificationInterval) {
    clearInterval(paymentVerificationInterval)
  }
}

function copyPixKey() {
  const pixKeyInput = document.getElementById("pixKey")
  if (pixKeyInput) {
    pixKeyInput.select()
    pixKeyInput.setSelectionRange(0, 99999)

    navigator.clipboard
      .writeText(pixKeyInput.value)
      .then(() => {
        showToast("Código PIX copiado para área de transferência!", "success")

        // Feedback visual no botão
        const copyBtn = event.target.closest("button")
        if (copyBtn) {
          const originalHTML = copyBtn.innerHTML
          copyBtn.innerHTML = '<i class="fas fa-check"></i>'
          copyBtn.classList.add("bg-green-500")

          setTimeout(() => {
            copyBtn.innerHTML = originalHTML
            copyBtn.classList.remove("bg-green-500")
          }, 2000)
        }
      })
      .catch(() => {
        // Fallback para browsers mais antigos
        try {
          document.execCommand("copy")
          showToast("Código PIX copiado!", "success")
        } catch (err) {
          showToast("Erro ao copiar. Selecione e copie manualmente.", "error")
        }
      })
  }
}

// Funções de pagamento cartão
function setupCardValidation() {
  // Máscara para número do cartão
  const cardNumberInputs = document.querySelectorAll("#cardNumber, #debitCardNumber")
  cardNumberInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
      const formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
      if (formattedValue.length <= 19) {
        e.target.value = formattedValue
      }

      // Detecta bandeira do cartão
      detectCardBrand(value, e.target)
    })
  })

  // Máscara para data de validade
  const expiryInputs = document.querySelectorAll("#cardExpiry, #debitCardExpiry")
  expiryInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4)
      }
      e.target.value = value
    })
  })

  // Validação CVV
  const cvvInputs = document.querySelectorAll("#cardCvv, #debitCardCvv")
  cvvInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "").substring(0, 4)
    })
  })

  // Validação nome
  const nameInputs = document.querySelectorAll("#cardName, #debitCardName")
  nameInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "").toUpperCase()
    })
  })
}

function detectCardBrand(cardNumber, inputElement) {
  const brands = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    elo: /^(?:4011|4312|4389|4514|4573|6362|6363)/,
  }

  const brandIconContainer = inputElement.parentElement.querySelector(".card-brand-icon")
  if (!brandIconContainer) return

  let detectedBrand = ""
  for (const [brand, pattern] of Object.entries(brands)) {
    if (pattern.test(cardNumber)) {
      detectedBrand = brand
      break
    }
  }

  if (detectedBrand) {
    brandIconContainer.innerHTML = `<i class="fab fa-cc-${detectedBrand} text-2xl"></i>`
    brandIconContainer.classList.remove("hidden")
  } else {
    brandIconContainer.classList.add("hidden")
  }
}

function validateCardForm(isCredit = true) {
  const prefix = isCredit ? "card" : "debitCard"
  const number = document.getElementById(`${prefix}Number`)?.value.replace(/\s/g, "")
  const expiry = document.getElementById(`${prefix}Expiry`)?.value
  const cvv = document.getElementById(`${prefix}Cvv`)?.value
  const name = document.getElementById(`${prefix}Name`)?.value

  if (!number || number.length < 16) {
    showToast("Número do cartão inválido", "error")
    return false
  }

  if (!expiry || expiry.length < 5) {
    showToast("Data de validade inválida", "error")
    return false
  }

  // Valida se a data não está expirada
  const [month, year] = expiry.split("/")
  const expDate = new Date(2000 + Number.parseInt(year), Number.parseInt(month) - 1)
  const today = new Date()
  if (expDate < today) {
    showToast("Cartão expirado", "error")
    return false
  }

  if (!cvv || cvv.length < 3) {
    showToast("CVV inválido", "error")
    return false
  }

  if (!name || name.trim().length < 2) {
    showToast("Nome do titular inválido", "error")
    return false
  }

  // Validação básica do algoritmo de Luhn
  if (!validateLuhn(number)) {
    showToast("Número do cartão inválido", "error")
    return false
  }

  return true
}

function validateLuhn(cardNumber) {
  let sum = 0
  let isEven = false

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(cardNumber[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

function processCardPayment(isCredit = true) {
  if (!validateCardForm(isCredit)) return

  showProcessingModal()

  // Simula processamento (90% de sucesso)
  setTimeout(() => {
    hideProcessingModal()
    if (Math.random() < 0.9) {
      processPaymentSuccess()
    } else {
      showToast("Erro no processamento. Verifique os dados e tente novamente.", "error")
    }
  }, 3000)
}

// Funções de modal
function showProcessingModal() {
  const modal = document.getElementById("processingModal")
  if (modal) {
    modal.classList.remove("hidden")
    modal.classList.add("flex")

    // Animação de carregamento
    let progress = 0
    const progressBar = document.getElementById("processingProgress")
    const progressText = document.getElementById("processingText")

    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress > 100) progress = 100

      if (progressBar) {
        progressBar.style.width = `${progress}%`
      }

      if (progressText) {
        if (progress < 30) {
          progressText.textContent = "Validando dados..."
        } else if (progress < 70) {
          progressText.textContent = "Processando pagamento..."
        } else if (progress < 100) {
          progressText.textContent = "Finalizando transação..."
        } else {
          progressText.textContent = "Concluído!"
          clearInterval(interval)
        }
      }
    }, 200)
  }
}

function hideProcessingModal() {
  const modal = document.getElementById("processingModal")
  if (modal) {
    modal.classList.add("hidden")
    modal.classList.remove("flex")
  }
}

function processPaymentSuccess() {
  hideProcessingModal()

  // Salva dados da compra para o recibo ANTES de limpar o carrinho
  const purchaseData = {
    id: `GZ${Date.now()}`,
    date: new Date().toISOString(),
    total: calculateTotal(),
    subtotal: cart.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0),
    discount: discount,
    method: currentPaymentMethod,
    items: [...cart], // Copia o array antes de limpar
  }

  try {
    localStorage.setItem("lastPurchase", JSON.stringify(purchaseData))
  } catch (error) {
    console.error("Erro ao salvar dados da compra:", error)
  }

  const successModal = document.getElementById("successModal")
  if (successModal) {
    successModal.classList.remove("hidden")
    successModal.classList.add("flex")

    // Atualiza informações do modal de sucesso
    const purchaseId = document.getElementById("purchaseId")
    const purchaseAmount = document.getElementById("purchaseAmount")

    if (purchaseId) {
      purchaseId.textContent = purchaseData.id
    }

    if (purchaseAmount) {
      purchaseAmount.textContent = `R$ ${purchaseData.total.toFixed(2)}`
    }
  }

  showToast("Pagamento realizado com sucesso!")

  // Limpa carrinho e atualiza displays
  cart = []
  saveCartToStorage()
  updateCartDisplay()
  updatePaymentSummary()

  // Reseta cupom
  discount = 0
  const couponInput = document.getElementById("couponInput")
  const couponMessage = document.getElementById("couponMessage")
  if (couponInput) {
    couponInput.value = ""
    couponInput.disabled = false
    couponInput.classList.remove("bg-gray-700")
  }
  if (couponMessage) {
    couponMessage.classList.add("hidden")
  }
}

function calculateTotal() {
  const subtotal = cart.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)
  const discountAmount = subtotal * (discount / 100)
  return subtotal - discountAmount
}

function closeSuccessModal() {
  const successModal = document.getElementById("successModal")
  if (successModal) {
    successModal.classList.add("hidden")
    successModal.classList.remove("flex")
  }
}

function downloadReceipt() {
  const purchaseData = JSON.parse(localStorage.getItem("lastPurchase") || "{}")

  if (!purchaseData.items || purchaseData.items.length === 0) {
    showToast("Dados da compra não encontrados", "error")
    return
  }

  const receiptContent = `
GAMEZONE STORE - RECIBO DE COMPRA
================================
ID da Compra: ${purchaseData.id}
Data: ${new Date(purchaseData.date).toLocaleString("pt-BR")}
Método de Pagamento: ${purchaseData.method?.toUpperCase()}

ITENS COMPRADOS:
${purchaseData.items
  .map(
    (item) =>
      `${item.name}
    Gênero: ${item.genre}
    Preço unitário: R$ ${Number.parseFloat(item.price).toFixed(2)}
    Quantidade: ${item.quantity}
    Subtotal: R$ ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
    ---`,
  )
  .join("\n")}

RESUMO FINANCEIRO:
Subtotal: R$ ${purchaseData.subtotal?.toFixed(2)}
Desconto (${purchaseData.discount}%): - R$ ${(purchaseData.subtotal * (purchaseData.discount / 100)).toFixed(2)}
TOTAL PAGO: R$ ${purchaseData.total?.toFixed(2)}

Obrigado pela sua compra!
GameZone Store - Sua loja de jogos favorita
    `.trim()

  const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `recibo-gamezonstore-${purchaseData.id}.txt`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)

  showToast("Recibo baixado com sucesso!")
}

// --- Search and Filter Functions ---

function setupSearch() {
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    let searchTimeout
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        filterGames()
      }, 300) // Debounce de 300ms
    })

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        filterGames()
      }
    })
  }
}

function sortGames(criteria) {
  const sortedGames = [...getFilteredGames()]

  switch (criteria) {
    case "name":
      sortedGames.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "price-low":
      sortedGames.sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price))
      break
    case "price-high":
      sortedGames.sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price))
      break
    case "rating":
      sortedGames.sort((a, b) => b.rating - a.rating)
      break
    case "newest":
      sortedGames.sort((a, b) => new Date(b.released) - new Date(a.released))
      break
    case "oldest":
      sortedGames.sort((a, b) => new Date(a.released) - new Date(b.released))
      break
    default:
      break
  }

  renderGames(sortedGames)
  showToast(
    `Jogos ordenados por ${criteria === "name" ? "nome" : criteria === "price-low" ? "menor preço" : criteria === "price-high" ? "maior preço" : criteria === "rating" ? "avaliação" : criteria === "newest" ? "mais recentes" : "mais antigos"}`,
    "info",
  )
}

// --- Navigation Functions ---

function goToPayment() {
  if (cart.length === 0) {
    showToast("Adicione itens ao carrinho primeiro!", "error")
    return
  }

  saveCartToStorage()
  window.location.href = "payment.html"
}

function goToHome() {
  window.location.href = "index.html"
}

function goBack() {
  window.history.back()
}

// --- Utility Functions ---

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR")
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// --- Event Listeners Setup ---

function setupEventListeners() {
  // Carrinho lateral
  document.addEventListener("click", (e) => {
    const cartSidebar = document.getElementById("cartSidebar")
    const cartOverlay = document.getElementById("cartOverlay")

    if (cartOverlay && !cartOverlay.classList.contains("hidden") && e.target === cartOverlay) {
      toggleCart()
    }
  })

  // ESC para fechar modals e carrinho
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const cartSidebar = document.getElementById("cartSidebar")
      const cartOverlay = document.getElementById("cartOverlay")
      const successModal = document.getElementById("successModal")
      const processingModal = document.getElementById("processingModal")

      if (cartSidebar && !cartSidebar.classList.contains("translate-x-full")) {
        toggleCart()
      }

      if (successModal && !successModal.classList.contains("hidden")) {
        closeSuccessModal()
      }

      if (processingModal && !processingModal.classList.contains("hidden")) {
        hideProcessingModal()
      }
    }
  })

  // Forms de pagamento
  const creditForm = document.getElementById("creditForm")
  const debitForm = document.getElementById("debitForm")

  if (creditForm) {
    creditForm.addEventListener("submit", (e) => {
      e.preventDefault()
      processCardPayment(true)
    })
  }

  if (debitForm) {
    debitForm.addEventListener("submit", (e) => {
      e.preventDefault()
      processCardPayment(false)
    })
  }

  // PIX
  const generatePixBtn = document.getElementById("generatePixBtn")
  if (generatePixBtn) {
    generatePixBtn.addEventListener("click", generatePixQR)
  }

  // Cupom
  const couponInput = document.getElementById("couponInput")
  const applyCouponBtn = document.getElementById("applyCouponBtn")

  if (couponInput) {
    couponInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        applyCoupon()
      }
    })
  }

  if (applyCouponBtn) {
    applyCouponBtn.addEventListener("click", applyCoupon)
  }

  // Sort dropdown
  const sortSelect = document.getElementById("sortSelect")
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      sortGames(this.value)
    })
  }

  // Filtros de gênero
  const genreCheckboxes = document.querySelectorAll('#genreFilters input[type="checkbox"]')
  genreCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", filterGames)
  })

  setupSearch()
  setupCardValidation()
}

// --- Initialization ---

function initializeApp() {
  // Carrega carrinho do storage
  loadCartFromStorage()

  // Atualiza displays
  updateCartDisplay()
  updatePaymentSummary()

  // Carrega jogos se estiver na página principal
  if (document.getElementById("gamesContainer")) {
    loadGames(true)
  }

  if (document.getElementById("salesChart") || document.getElementById("ratingsChart")) {
    gameAnalytics.init()
  }

  // Configura event listeners
  setupEventListeners()

  // Configura método de pagamento padrão
  if (document.getElementById("pixPayment")) {
    switchPaymentMethod("pix")
  }
}

// Aguarda DOM carregar
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp)
} else {
  initializeApp()
}

// --- Export functions for global access ---
window.addToCart = addToCart
window.removeFromCart = removeFromCart
window.increaseQuantity = increaseQuantity
window.decreaseQuantity = decreaseQuantity
window.toggleCart = toggleCart
window.clearCart = clearCart
window.filterGames = filterGames
window.clearFilters = clearFilters
window.loadMoreGames = loadMoreGames
window.switchPaymentMethod = switchPaymentMethod
window.applyCoupon = applyCoupon
window.removeCoupon = removeCoupon
window.generatePixQR = generatePixQR
window.copyPixKey = copyPixKey
window.processCardPayment = processCardPayment
window.goToPayment = goToPayment
window.goToHome = goToHome
window.goBack = goBack
window.downloadReceipt = downloadReceipt
window.closeSuccessModal = closeSuccessModal
window.sortGames = sortGames
window.retryPixPayment = retryPixPayment
window.regeneratePixQR = regeneratePixQR
window.gameAnalytics = gameAnalytics
