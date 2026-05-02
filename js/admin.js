const API_URL = 'http://localhost:3000';
let currentUser = null;

function showMessage(message, type = 'info') {
    const existingMsg = document.querySelector('.message-popup');
    if (existingMsg) existingMsg.remove();
    
    const msg = document.createElement('div');
    msg.className = `message-popup ${type === 'error' ? 'error' : (type === 'success' ? 'success' : '')}`;
    msg.textContent = message;
    document.body.appendChild(msg);
    
    setTimeout(() => msg.remove(), 3000);
}

function checkAdminAccess() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (currentUser.role === 'admin') {
            document.getElementById('accessDenied').style.display = 'none';
            document.getElementById('adminContent').style.display = 'block';
            loadProducts();
            loadProductsForSelect();
            loadUsersForFilter();
            loadReviews();
            return true;
        }
    }
    document.getElementById('accessDenied').style.display = 'block';
    document.getElementById('adminContent').style.display = 'none';
    return false;
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        let products = await response.json();
        
        const searchTerm = document.getElementById('searchProduct')?.value.toLowerCase() || '';
        if (searchTerm) {
            products = products.filter(p => p.name.toLowerCase().includes(searchTerm));
        }
        
        const container = document.getElementById('productsContainer');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = '<div class="no-data">Нет товаров</div>';
            return;
        }
        
        container.innerHTML = `
            <table class="products-table">
                <thead>
                    <tr><th>ID</th><th>Изображение</th><th>Название</th><th>Категория</th><th>Цена</th><th>Наличие</th><th>Действия</th></tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td>${product.id}</td>
                            <td><img src="../${product.image}" class="product-image" onerror="this.src='../assets/images/chair.png'"></td>
                            <td>${escapeHtml(product.name)}</td>
                            <td>${getCategoryLabel(product.category)}</td>
                            <td>${product.price} £</td>
                            <td>${product.inStock ? 'В наличии' : 'Нет в наличии'}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="edit-btn" onclick="openEditProductModal(${product.id})">Редактировать</button>
                                    <button class="delete-btn" onclick="openDeleteProductModal(${product.id}, '${escapeHtml(product.name)}')">Удалить</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showMessage('Ошибка загрузки товаров', 'error');
    }
}

async function loadProductsForSelect() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        const filterSelect = document.getElementById('adminFilterProduct');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="all">Все товары</option>' +
                products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
        }
    } catch (error) {
        console.error('Ошибка загрузки товаров для фильтра:', error);
    }
}

async function loadUsersForFilter() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();
        
        const filterSelect = document.getElementById('adminFilterUser');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="all">Все пользователи</option>' +
                users.map(u => `<option value="${u.id}">${escapeHtml(u.nickname || u.email)}</option>`).join('');
        }
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
    }
}

async function loadReviews() {
    try {
        const productFilter = document.getElementById('adminFilterProduct')?.value || 'all';
        const userFilter = document.getElementById('adminFilterUser')?.value || 'all';
        
        let url = `${API_URL}/feedback`;
        const response = await fetch(url);
        let reviews = await response.json();
        
        if (productFilter !== 'all') {
            reviews = reviews.filter(r => r.productId == productFilter);
        }
        
        if (userFilter !== 'all') {
            reviews = reviews.filter(r => r.userId == userFilter);
        }
        
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const container = document.getElementById('reviewsContainer');
        if (!container) return;
        
        if (reviews.length === 0) {
            container.innerHTML = '<div class="no-data">Нет отзывов</div>';
            return;
        }
        
        container.innerHTML = reviews.map(review => `
            <div class="review-card" data-id="${review.id}">
                <div class="review-header">
                    <div>
                        <span class="review-user">${escapeHtml(review.userNickname)}</span>
                        <span class="review-product">${escapeHtml(review.productName)}</span>
                    </div>
                    <div>
                        <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                        <button class="delete-review-btn" onclick="deleteReview(${review.id})">Удалить</button>
                    </div>
                </div>
                <div class="review-text">${escapeHtml(review.text)}</div>
                <div class="review-date">${formatDate(review.createdAt)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        showMessage('Ошибка загрузки отзывов', 'error');
    }
}

window.openAddProductModal = () => {
    if (window.modalManager) {
        window.modalManager.openFormModal(
            'Добавление товара',
            [
                { name: 'name', label: 'Название товара', type: 'text', required: true, placeholder: 'Введите название' },
                { name: 'price', label: 'Цена (£)', type: 'number', required: true, placeholder: '0.00' },
                { 
                    name: 'category', 
                    label: 'Категория', 
                    type: 'select', 
                    required: true,
                    options: [
                        { value: 'sofa', text: 'Диваны' },
                        { value: 'living', text: 'Гостиная' },
                        { value: 'kitchen', text: 'Кухня' },
                        { value: 'bedroom', text: 'Спальня' },
                        { value: 'bathroom', text: 'Ванная' },
                        { value: 'decor', text: 'Декор' },
                        { value: 'ceramics', text: 'Керамика' }
                    ]
                },
                { name: 'description', label: 'Описание', type: 'textarea', required: true, placeholder: 'Введите описание товара...' },
                { name: 'image', label: 'URL изображения', type: 'text', required: true, placeholder: 'assets/images/chair.png' },
                { 
                    name: 'stock', 
                    label: 'Наличие', 
                    type: 'select', 
                    required: true,
                    options: [
                        { value: 'true', text: 'В наличии' },
                        { value: 'false', text: 'Нет в наличии' }
                    ]
                },
                { 
                    name: 'rating', 
                    label: 'Рейтинг', 
                    type: 'select', 
                    required: false,
                    value: '5',
                    options: [
                        { value: '5', text: '★★★★★ (5)' },
                        { value: '4.5', text: '★★★★☆ (4.5)' },
                        { value: '4', text: '★★★★☆ (4)' },
                        { value: '3.5', text: '★★★☆☆ (3.5)' },
                        { value: '3', text: '★★★☆☆ (3)' },
                        { value: '2.5', text: '★★☆☆☆ (2.5)' },
                        { value: '2', text: '★★☆☆☆ (2)' },
                        { value: '1.5', text: '★☆☆☆☆ (1.5)' },
                        { value: '1', text: '★☆☆☆☆ (1)' }
                    ]
                }
            ],
            async (data) => {
                try {
                    const response = await fetch(`${API_URL}/products`);
                    const products = await response.json();
                    const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
                    
                    const newProduct = {
                        id: maxId + 1,
                        name: data.name,
                        price: parseFloat(data.price),
                        category: data.category,
                        description: data.description,
                        image: data.image,
                        inStock: data.stock === 'true',
                        rating: parseFloat(data.rating) || 5,
                        isFavorite: false
                    };
                    
                    await fetch(`${API_URL}/products`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newProduct)
                    });
                    
                    showMessage('Товар успешно добавлен', 'success');
                    loadProducts();
                    loadProductsForSelect();
                } catch (error) {
                    console.error('Ошибка:', error);
                    showMessage('Ошибка при добавлении товара', 'error');
                }
            }
        );
    }
};

window.openEditProductModal = async (productId) => {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const product = await response.json();
        
        if (window.modalManager) {
            window.modalManager.openFormModal(
                'Редактирование товара',
                [
                    { name: 'name', label: 'Название товара', type: 'text', required: true, value: product.name, placeholder: 'Введите название' },
                    { name: 'price', label: 'Цена (£)', type: 'number', required: true, value: product.price, placeholder: '0.00' },
                    { 
                        name: 'category', 
                        label: 'Категория', 
                        type: 'select', 
                        required: true,
                        value: product.category,
                        options: [
                            { value: 'sofa', text: 'Диваны' },
                            { value: 'living', text: 'Гостиная' },
                            { value: 'kitchen', text: 'Кухня' },
                            { value: 'bedroom', text: 'Спальня' },
                            { value: 'bathroom', text: 'Ванная' },
                            { value: 'decor', text: 'Декор' },
                            { value: 'ceramics', text: 'Керамика' }
                        ]
                    },
                    { name: 'description', label: 'Описание', type: 'textarea', required: true, value: product.description, placeholder: 'Введите описание товара...' },
                    { name: 'image', label: 'URL изображения', type: 'text', required: true, value: product.image, placeholder: 'assets/images/chair.png' },
                    { 
                        name: 'stock', 
                        label: 'Наличие', 
                        type: 'select', 
                        required: true,
                        value: product.inStock ? 'true' : 'false',
                        options: [
                            { value: 'true', text: 'В наличии' },
                            { value: 'false', text: 'Нет в наличии' }
                        ]
                    },
                    { 
                        name: 'rating', 
                        label: 'Рейтинг', 
                        type: 'select', 
                        required: false,
                        value: product.rating,
                        options: [
                            { value: '5', text: '★★★★★ (5)' },
                            { value: '4.5', text: '★★★★☆ (4.5)' },
                            { value: '4', text: '★★★★☆ (4)' },
                            { value: '3.5', text: '★★★☆☆ (3.5)' },
                            { value: '3', text: '★★★☆☆ (3)' },
                            { value: '2.5', text: '★★☆☆☆ (2.5)' },
                            { value: '2', text: '★★☆☆☆ (2)' },
                            { value: '1.5', text: '★☆☆☆☆ (1.5)' },
                            { value: '1', text: '★☆☆☆☆ (1)' }
                        ]
                    }
                ],
                async (data) => {
                    try {
                        await fetch(`${API_URL}/products/${productId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...product,
                                name: data.name,
                                price: parseFloat(data.price),
                                category: data.category,
                                description: data.description,
                                image: data.image,
                                inStock: data.stock === 'true',
                                rating: parseFloat(data.rating) || product.rating
                            })
                        });
                        
                        showMessage('Товар успешно обновлен', 'success');
                        loadProducts();
                        loadProductsForSelect();
                    } catch (error) {
                        console.error('Ошибка:', error);
                        showMessage('Ошибка при обновлении товара', 'error');
                    }
                }
            );
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка загрузки товара для редактирования', 'error');
    }
};

window.openDeleteProductModal = (productId, productName) => {
    if (window.modalManager) {
        window.modalManager.openConfirmModal(
            'Подтверждение удаления',
            `Вы уверены, что хотите удалить товар "${productName}"? Это действие нельзя отменить.`,
            async () => {
                try {
                    await fetch(`${API_URL}/products/${productId}`, {
                        method: 'DELETE'
                    });
                    
                    showMessage(`Товар "${productName}" успешно удален`, 'success');
                    loadProducts();
                    loadProductsForSelect();
                } catch (error) {
                    console.error('Ошибка:', error);
                    showMessage('Ошибка при удалении товара', 'error');
                }
            }
        );
    }
};

async function deleteReview(id) {
    if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
        try {
            await fetch(`${API_URL}/feedback/${id}`, { method: 'DELETE' });
            showMessage('Отзыв успешно удален', 'success');
            loadReviews();
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage('Ошибка при удалении отзыва', 'error');
        }
    }
}

function getCategoryLabel(categoryValue) {
    const categories = {
        'sofa': 'Диваны',
        'living': 'Гостиная',
        'kitchen': 'Кухня',
        'bedroom': 'Спальня',
        'bathroom': 'Ванная',
        'decor': 'Декор',
        'ceramics': 'Керамика'
    };
    return categories[categoryValue] || categoryValue;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function initEventListeners() {
    const searchInput = document.getElementById('searchProduct');
    if (searchInput) {
        searchInput.addEventListener('input', () => loadProducts());
    }
    
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', loadReviews);
    }
    
    const addProductBtn = document.getElementById('openAddProductModalBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => openAddProductModal());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Админ-панель загружена');
    
    if (checkAdminAccess()) {
        initEventListeners();
    }
});

window.deleteReview = deleteReview;