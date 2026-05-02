const API_URL = 'http://localhost:3000';

const api = {
    async getProducts(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.search) queryParams.append('q', params.search);
        if (params.category && params.category !== 'all') queryParams.append('category', params.category);
        if (params.sort && params.order) {
            queryParams.append('_sort', params.sort);
            queryParams.append('_order', params.order);
        }
        if (params.minPrice) queryParams.append('price_gte', params.minPrice);
        if (params.maxPrice) queryParams.append('price_lte', params.maxPrice);
        if (params.inStock !== undefined && params.inStock !== 'all') queryParams.append('inStock', params.inStock === 'true');
        if (params.page && params.limit) {
            queryParams.append('_page', params.page);
            queryParams.append('_limit', params.limit);
        }
        
        const url = `${API_URL}/products?${queryParams}`;
        console.log('Запрос URL:', url);
        
        const response = await fetch(url);
        const total = response.headers.get('X-Total-Count');
        let products = await response.json();
        
        if (!Array.isArray(products)) {
            if (products && products.data && Array.isArray(products.data)) {
                products = products.data;
            } else if (products && typeof products === 'object') {
                const possibleArrays = Object.values(products).filter(v => Array.isArray(v));
                if (possibleArrays.length > 0) {
                    products = possibleArrays[0];
                } else {
                    products = [];
                }
            } else {
                products = [];
            }
        }
        
        return { 
            products: products, 
            total: total ? parseInt(total) : products.length 
        };
    },
    
    async updateProduct(id, data) {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    
    async getFavorites() {
        const response = await fetch(`${API_URL}/favorites`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    },
    
    async addToFavorites(productId, productData) {
        const favorites = await this.getFavorites();
        const exists = favorites.find(f => f.productId === productId);
        if (exists) return exists;
        
        const response = await fetch(`${API_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: Date.now(),
                productId: productId,
                name: productData.name,
                price: productData.price,
                image: productData.image,
                category: productData.category,
                rating: productData.rating
            })
        });
        return response.json();
    },
    
    async removeFromFavorites(id) {
        const response = await fetch(`${API_URL}/favorites/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    },
    
    async getCart() {
        const response = await fetch(`${API_URL}/cart`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    },
    
    async addToCart(item) {
        const cart = await this.getCart();
        const existingItem = cart.find(i => i.productId === item.productId);
        if (existingItem) {
            return this.updateCartItem(existingItem.id, existingItem.quantity + 1);
        }
        
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: Date.now(),
                ...item,
                quantity: item.quantity || 1
            })
        });
        return response.json();
    },
    
    async updateCartItem(id, quantity) {
        const response = await fetch(`${API_URL}/cart/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        return response.json();
    },
    
    async removeFromCart(id) {
        const response = await fetch(`${API_URL}/cart/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    },
    
    async clearCart() {
        const cartItems = await this.getCart();
        const deletions = cartItems.map(item => this.removeFromCart(item.id));
        await Promise.all(deletions);
        return true;
    }
};

let state = {
    products: [],
    totalProducts: 0,
    currentPage: 1,
    itemsPerPage: 6,
    filters: {
        search: '',
        category: 'all',
        sort: 'default',
        minPrice: '',
        maxPrice: '',
        inStock: 'all'
    }
};

function checkAdminAccessForMenu() {
    const savedUser = localStorage.getItem('currentUser');
    const adminMenuItem = document.getElementById('adminMenuItem');
    const profileMenuItem = document.getElementById('profileMenuItem');
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
            if (adminMenuItem) adminMenuItem.style.display = 'block';
            if (profileMenuItem) profileMenuItem.style.display = 'none';
            console.log('Админ авторизован, отображаем админ-панель');
        } else {
            if (adminMenuItem) adminMenuItem.style.display = 'none';
            if (profileMenuItem) profileMenuItem.style.display = 'block';
            console.log('Обычный пользователь, скрываем админ-панель');
        }
    } else {
        if (adminMenuItem) adminMenuItem.style.display = 'none';
        if (profileMenuItem) profileMenuItem.style.display = 'block';
        console.log('Пользователь не авторизован');
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        const uniqueCategories = [...new Set(products.map(product => product.category))];
        
        console.log('Уникальные категории из Set:', uniqueCategories);
        
        uniqueCategories.sort();
        
        const categoryContainer = document.getElementById('categoryFilter');
        if (!categoryContainer) return;
        
        categoryContainer.innerHTML = '';
        
        const allButton = document.createElement('button');
        allButton.className = `category-btn ${state.filters.category === 'all' ? 'active' : ''}`;
        allButton.dataset.category = 'all';
        allButton.textContent = 'Все';
        allButton.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            allButton.classList.add('active');
            state.filters.category = 'all';
            applyFilters();
        });
        categoryContainer.appendChild(allButton);
        
        uniqueCategories.forEach(category => {
            const button = document.createElement('button');
            button.className = `category-btn ${state.filters.category === category ? 'active' : ''}`;
            button.dataset.category = category;
            
            const categoryLabel = getCategoryLabel(category);
            button.textContent = categoryLabel;
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                state.filters.category = category;
                applyFilters();
            });
            
            categoryContainer.appendChild(button);
        });
        
        console.log(`Загружено ${uniqueCategories.length} категорий`);
        
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        showMessage('Ошибка загрузки категорий', true);
    }
}

function getCategoryLabel(categoryValue) {
    const categoriesMap = {
        'sofa': 'Диваны',
        'living': 'Гостиная',
        'kitchen': 'Кухня',
        'bedroom': 'Спальня',
        'bathroom': 'Ванная',
        'decor': 'Декор',
        'ceramics': 'Керамика'
    };
    return categoriesMap[categoryValue] || categoryValue;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star">★</span>';
    }
    for (let i = fullStars; i < 5; i++) {
        stars += '<span class="star">☆</span>';
    }
    return stars;
}

function showMessage(message, isError = false) {
    const existingMsg = document.querySelector('.message-popup');
    if (existingMsg) existingMsg.remove();
    
    const msg = document.createElement('div');
    msg.className = 'message-popup';
    msg.textContent = message;
    if (isError) msg.style.background = '#c62828';
    document.body.appendChild(msg);
    
    setTimeout(() => msg.remove(), 3000);
}

async function loadProducts() {
    try {
        console.log('Загрузка товаров...');
        
        const params = {};
        
        if (state.filters.search) params.search = state.filters.search;
        if (state.filters.category !== 'all') params.category = state.filters.category;
        
        if (state.filters.sort !== 'default') {
            switch(state.filters.sort) {
                case 'price-asc': params.sort = 'price'; params.order = 'asc'; break;
                case 'price-desc': params.sort = 'price'; params.order = 'desc'; break;
                case 'name-asc': params.sort = 'name'; params.order = 'asc'; break;
                case 'name-desc': params.sort = 'name'; params.order = 'desc'; break;
                case 'rating-desc': params.sort = 'rating'; params.order = 'desc'; break;
            }
        }
        
        if (state.filters.minPrice) params.minPrice = state.filters.minPrice;
        if (state.filters.maxPrice) params.maxPrice = state.filters.maxPrice;
        if (state.filters.inStock !== 'all') params.inStock = state.filters.inStock;
        
        params.page = state.currentPage;
        params.limit = state.itemsPerPage;
        
        const result = await api.getProducts(params);
        
        let products = Array.isArray(result.products) ? result.products : [];
        let total = result.total || 0;
        
        const favorites = await api.getFavorites();
        const favoriteIds = favorites.map(f => f.productId);
        
        state.products = products.map(p => ({
            ...p,
            isFavorite: favoriteIds.includes(p.id)
        }));
        state.totalProducts = total;
        
        renderProducts();
        renderPagination();
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showMessage('Ошибка загрузки товаров: ' + error.message, true);
        const container = document.getElementById('catalogContainer');
        if (container) {
            container.innerHTML = `<div class="no-results">⚠️ Ошибка загрузки товаров. Проверьте консоль для деталей.</div>`;
        }
    }
}

async function toggleFavorite(productId) {
    try {
        const product = state.products.find(p => p.id === productId);
        if (!product) return;
        
        const newFavoriteStatus = !product.isFavorite;
        
        if (newFavoriteStatus) {
            await api.addToFavorites(productId, product);
            showMessage(`✅ "${product.name}" добавлен в избранное`);
        } else {
            const favorites = await api.getFavorites();
            const favItem = favorites.find(f => f.productId === productId);
            if (favItem) await api.removeFromFavorites(favItem.id);
            showMessage(`❌ "${product.name}" удален из избранного`);
        }
        
        await api.updateProduct(productId, { isFavorite: newFavoriteStatus });
        await loadProducts();
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка при добавлении в избранное', true);
    }
}

async function addToCart(productId) {
    try {
        const product = state.products.find(p => p.id === productId);
        if (!product) return;
        
        if (!product.inStock) {
            showMessage('❌ Товар отсутствует в наличии', true);
            return;
        }
        
        await api.addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
        
        showMessage(`✅ "${product.name}" добавлен в корзину`);
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка при добавлении в корзину', true);
    }
}

function renderProducts() {
    const container = document.getElementById('catalogContainer');
    if (!container) {
        console.error('Контейнер catalogContainer не найден!');
        return;
    }
    
    console.log('Отрисовка товаров:', state.products.length);
    
    if (!state.products || state.products.length === 0) {
        container.innerHTML = `<div class="no-results">😕 Товары не найдены<br><small>Попробуйте изменить критерии поиска или фильтрации</small></div>`;
        const statsEl = document.getElementById('stats');
        if (statsEl) statsEl.innerHTML = `📊 Найдено: 0 товаров`;
        return;
    }
    
    container.innerHTML = state.products.map(product => `
        <article class="catalog-card" data-id="${product.id}">
            <div class="card-image">
                <img src="${product.image.startsWith('assets/') ? '../' + product.image : product.image}" alt="${product.name}" onerror="this.src='../assets/images/chair.png'">
                <button class="favorite-btn ${product.isFavorite ? 'active' : ''}" onclick="toggleFavorite(${product.id})">
                    ${product.isFavorite ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="card-info">
                <h3 class="card-title">${escapeHtml(product.name)}</h3>
                <div class="card-category">${getCategoryLabel(product.category)}</div>
                <div class="card-price">£${product.price.toFixed(2)}</div>
                <div class="card-rating">${generateStars(product.rating)}</div>
                <span class="card-stock ${product.inStock ? 'in-stock' : 'out-stock'}">
                    ${product.inStock ? '✓ В наличии' : '✗ Нет в наличии'}
                </span>
                <p class="card-description">${product.description ? product.description.substring(0, 60) : ''}${product.description && product.description.length > 60 ? '...' : ''}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                    🛒 В корзину
                </button>
            </div>
        </article>
    `).join('');
    
    const statsEl = document.getElementById('stats');
    if (statsEl) {
        statsEl.innerHTML = `📊 Найдено: ${state.totalProducts} товаров | Страница ${state.currentPage}`;
    }
}

function renderPagination() {
    const totalPages = Math.ceil(state.totalProducts / state.itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let pagesHtml = `<button class="page-btn" onclick="changePage(${state.currentPage - 1})" ${state.currentPage === 1 ? 'disabled' : ''}>← Назад</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
            pagesHtml += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
            pagesHtml += `<span class="page-dots">...</span>`;
        }
    }
    
    pagesHtml += `<button class="page-btn" onclick="changePage(${state.currentPage + 1})" ${state.currentPage === totalPages ? 'disabled' : ''}>Вперед →</button>`;
    paginationContainer.innerHTML = pagesHtml;
}

function changePage(page) {
    const totalPages = Math.ceil(state.totalProducts / state.itemsPerPage);
    if (page < 1 || page > totalPages) return;
    state.currentPage = page;
    loadProducts();
}

function applyFilters() {
    state.currentPage = 1;
    loadProducts();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let allProductsCache = [];

async function loadAllProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        allProductsCache = Array.isArray(products) ? products : [];
        console.log('Загружено товаров для методов:', allProductsCache.length);
        return allProductsCache;
    } catch (error) {
        console.error('Ошибка загрузки товаров для методов:', error);
        return [];
    }
}

async function applyMap() {
    await loadAllProducts();
    const newPrices = allProductsCache.map(product => ({
        ...product,
        price: +(product.price * 1.1).toFixed(2)
    }));
    state.products = newPrices;
    state.totalProducts = newPrices.length;
    renderProducts();
    showMessage('✅ map() - Цены увеличены на 10% (только для просмотра)');
    setTimeout(() => { 
        loadProducts(); 
        showMessage('🔄 Каталог восстановлен к исходному состоянию');
    }, 5000);
}

async function applyFilter() {
    await loadAllProducts();
    const inStockOnly = allProductsCache.filter(p => p.inStock);
    state.products = inStockOnly;
    state.totalProducts = inStockOnly.length;
    renderProducts();
    showMessage(`✅ filter() - Показано только ${inStockOnly.length} товаров в наличии`);
    setTimeout(() => { 
        loadProducts(); 
        showMessage('🔄 Каталог восстановлен к исходному состоянию');
    }, 5000);
}

async function applyReduce() {
    await loadAllProducts();
    const totalValue = allProductsCache.reduce((sum, product) => sum + product.price, 0);
    showMessage(`💰 reduce() - Общая стоимость всех товаров: £${totalValue.toFixed(2)}`);
}

async function applyIndexOf() {
    await loadAllProducts();
    const userInput = prompt("🔍 Введите название товара для поиска:", "Элитный диван");
    if (!userInput || userInput.trim() === "") {
        showMessage("⚠️ Поиск отменён или введено пустое значение");
        return;
    }
    const searchName = userInput.trim();
    const index = allProductsCache.findIndex(p => p.name.toLowerCase() === searchName.toLowerCase());
    if (index !== -1) {
        showMessage(`🔍 indexOf() - Товар "${allProductsCache[index].name}" найден на позиции ${index + 1} (индекс ${index})`);
    } else {
        const similar = allProductsCache.filter(p => p.name.toLowerCase().includes(searchName.toLowerCase()));
        if (similar.length > 0) {
            showMessage(`❌ Товар "${searchName}" не найден. Возможно, вы искали: ${similar.map(p => p.name).join(", ")}`);
        } else {
            showMessage(`❌ indexOf() - Товар "${searchName}" не найден в каталоге`);
        }
    }
}

async function applyFind() {
    await loadAllProducts();
    const expensiveProduct = allProductsCache.find(p => p.price > 800);
    if (expensiveProduct) {
        showMessage(`🔍 find() - Найден дорогой товар: "${expensiveProduct.name}" за £${expensiveProduct.price}`);
    } else {
        showMessage('🔍 find() - Товаров дороже £800 не найдено');
    }
}

async function applySome() {
    await loadAllProducts();
    const hasExpensive = allProductsCache.some(p => p.price > 500);
    showMessage(`❓ some() - ${hasExpensive ? 'Есть' : 'Нет'} товары дороже £500`);
}

async function applyEvery() {
    await loadAllProducts();
    const allInStock = allProductsCache.every(p => p.inStock);
    showMessage(`❓ every() - ${allInStock ? 'Все' : 'Не все'} товары в наличии`);
}

async function applyForEach() {
    await loadAllProducts();
    let namesList = '';
    allProductsCache.forEach((p, index) => {
        namesList += `${index + 1}. ${p.name}\n`;
    });
    showMessage(`📝 forEach() - Список товаров (${allProductsCache.length} шт.)`);
    alert(`Список всех товаров (${allProductsCache.length} шт.):\n\n${namesList}`);
}

async function applySlice() {
    await loadAllProducts();
    const top3 = allProductsCache.slice(0, 3);
    state.products = top3;
    state.totalProducts = top3.length;
    renderProducts();
    showMessage('🎯 slice() - Показаны первые 3 товара');
    setTimeout(() => { 
        loadProducts(); 
        showMessage('🔄 Каталог восстановлен к исходному состоянию');
    }, 5000);
}

async function applyValues() {
    await loadAllProducts();
    const valuesArray = [...allProductsCache.values()];
    const productNames = valuesArray.map(p => p.name).join(', ');
    showMessage(`💎 values() - Всего товаров: ${valuesArray.length}`);
    alert(`Все товары в каталоге (${valuesArray.length} шт.):\n\n${productNames}`);
}

function resetCatalog() {
    loadProducts();
    showMessage('🔄 Каталог сброшен к исходному состоянию');
}

function initMethodButtons() {
    const methods = {
        'map': applyMap,
        'filter': applyFilter,
        'reduce': applyReduce,
        'indexOf': applyIndexOf,
        'find': applyFind,
        'some': applySome,
        'every': applyEvery,
        'forEach': applyForEach,
        'slice': applySlice,
        'values': applyValues
    };
    
    const buttons = document.querySelectorAll('[data-method]');
    console.log('Найдено кнопок методов:', buttons.length);
    
    buttons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const method = btn.dataset.method;
            console.log('Нажата кнопка метода:', method);
            if (methods[method]) {
                await methods[method]();
            } else {
                console.warn('Метод не найден:', method);
            }
        });
    });
    
    const methodButtonsContainer = document.getElementById('methodButtons');
    if (methodButtonsContainer && !document.getElementById('resetCatalogBtn')) {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'resetCatalogBtn';
        resetBtn.textContent = '🔄 Сбросить каталог';
        resetBtn.className = 'method-btn';
        resetBtn.style.background = '#264A51';
        resetBtn.style.color = 'white';
        resetBtn.addEventListener('click', resetCatalog);
        methodButtonsContainer.appendChild(resetBtn);
    }
}

function initFilters() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.filters.search = e.target.value;
                applyFilters();
            }, 500);
        });
    }
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.filters.sort = e.target.value;
            applyFilters();
        });
    }
    
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    if (minPriceInput) minPriceInput.addEventListener('input', (e) => { state.filters.minPrice = e.target.value; applyFilters(); });
    if (maxPriceInput) maxPriceInput.addEventListener('input', (e) => { state.filters.maxPrice = e.target.value; applyFilters(); });
    
    const stockSelect = document.getElementById('stockFilter');
    if (stockSelect) stockSelect.addEventListener('change', (e) => { state.filters.inStock = e.target.value; applyFilters(); });
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Каталог загружен, инициализация...');
    
    checkAdminAccessForMenu();
    
    initFilters();
    initMethodButtons();
    
    await loadCategories();
    await loadProducts();
});

window.toggleFavorite = toggleFavorite;
window.addToCart = addToCart;
window.changePage = changePage;

// Открытие модального окна с деталями товара при клике на карточку
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const cards = document.querySelectorAll('.catalog-card');
        cards.forEach(card => {
            card.addEventListener('click', async (e) => {
                if (e.target.classList.contains('add-to-cart-btn') || 
                    e.target.classList.contains('favorite-btn') ||
                    e.target.closest('.add-to-cart-btn') ||
                    e.target.closest('.favorite-btn')) {
                    return;
                }
                
                const productId = parseInt(card.dataset.id);
                if (productId && window.modalManager) {
                    try {
                        const response = await fetch(`http://localhost:3000/products/${productId}`);
                        const product = await response.json();
                        window.modalManager.openProductDetail(product);
                    } catch (error) {
                        console.error('Ошибка загрузки товара:', error);
                    }
                }
            });
        });
    }, 500);
});

window.openAddProductModal = () => {
    if (window.modalManager) {
        window.modalManager.openFormModal(
            'Добавление товара',
            [
                { name: 'name', label: 'Название товара', type: 'text', required: true, placeholder: 'Введите название' },
                { name: 'price', label: 'Цена (£)', type: 'number', required: true, placeholder: '0.00' },
                { name: 'category', label: 'Категория', type: 'select', required: true },
                { name: 'description', label: 'Описание', type: 'textarea', required: true, placeholder: 'Введите описание' },
                { name: 'image', label: 'URL изображения', type: 'text', required: true, placeholder: '../assets/images/chair.png' },
                { name: 'stock', label: 'В наличии', type: 'select', required: true }
            ],
            async (data) => {
                try {
                    const response = await fetch('http://localhost:3000/products');
                    const products = await response.json();
                    const maxId = Math.max(...products.map(p => p.id), 0);
                    
                    const newProduct = {
                        id: maxId + 1,
                        name: data.name,
                        price: parseFloat(data.price),
                        category: data.category,
                        description: data.description,
                        image: data.image,
                        inStock: data.stock === 'true',
                        rating: 5,
                        isFavorite: false
                    };
                    
                    await fetch('http://localhost:3000/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newProduct)
                    });
                    
                    ToastManager.show('Товар успешно добавлен', 'success');
                    location.reload();
                } catch (error) {
                    ToastManager.show('Ошибка добавления товара', 'error');
                }
            }
        );
    }
};

window.openEditProductModal = (product) => {
    if (window.modalManager) {
        window.modalManager.openFormModal(
            'Редактирование товара',
            [
                { name: 'name', label: 'Название товара', type: 'text', required: true, value: product.name },
                { name: 'price', label: 'Цена (£)', type: 'number', required: true, value: product.price },
                { name: 'description', label: 'Описание', type: 'textarea', required: true, value: product.description },
                { name: 'image', label: 'URL изображения', type: 'text', required: true, value: product.image }
            ],
            async (data) => {
                try {
                    await fetch(`http://localhost:3000/products/${product.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: data.name,
                            price: parseFloat(data.price),
                            description: data.description,
                            image: data.image
                        })
                    });
                    
                    ToastManager.show('Товар успешно обновлен', 'success');
                    location.reload();
                } catch (error) {
                    ToastManager.show('Ошибка обновления', 'error');
                }
            }
        );
    }
};