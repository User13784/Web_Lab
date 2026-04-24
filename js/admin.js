const API_URL = 'http://localhost:3000';
let currentUser = null;
let editMode = false;

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
            container.innerHTML = '<div class="no-data">📦 Нет товаров</div>';
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
                            <td>£${product.price}</td>
                            <td>${product.inStock ? '✅ В наличии' : '❌ Нет'}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="edit-btn" onclick="editProduct(${product.id})">✏️ Ред.</button>
                                    <button class="delete-btn" onclick="deleteProduct(${product.id})">🗑️ Удал.</button>
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
            container.innerHTML = '<div class="no-data">💬 Нет отзывов</div>';
            return;
        }
        
        container.innerHTML = reviews.map(review => `
            <div class="review-card" data-id="${review.id}">
                <div class="review-header">
                    <div>
                        <span class="review-user">👤 ${escapeHtml(review.userNickname)}</span>
                        <span class="review-product">📦 ${escapeHtml(review.productName)}</span>
                    </div>
                    <div>
                        <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                        <button class="delete-review-btn" onclick="deleteReview(${review.id})">🗑️ Удалить</button>
                    </div>
                </div>
                <div class="review-text">${escapeHtml(review.text)}</div>
                <div class="review-date">📅 ${formatDate(review.createdAt)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        showMessage('Ошибка загрузки отзывов', 'error');
    }
}

function validateProductForm() {
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value;
    const image = document.getElementById('productImage').value;
    
    let isValid = true;
    
    const nameError = document.getElementById('productNameError');
    if (!name.trim()) {
        nameError.textContent = 'Введите название товара';
        nameError.classList.add('show');
        document.getElementById('productName').classList.add('error');
        isValid = false;
    } else if (name.length < 3) {
        nameError.textContent = 'Название должно содержать минимум 3 символа';
        nameError.classList.add('show');
        document.getElementById('productName').classList.add('error');
        isValid = false;
    } else {
        nameError.classList.remove('show');
        document.getElementById('productName').classList.remove('error');
    }
    
    const categoryError = document.getElementById('productCategoryError');
    if (!category) {
        categoryError.textContent = 'Выберите категорию';
        categoryError.classList.add('show');
        document.getElementById('productCategory').classList.add('error');
        isValid = false;
    } else {
        categoryError.classList.remove('show');
        document.getElementById('productCategory').classList.remove('error');
    }
    
    const priceError = document.getElementById('productPriceError');
    if (!price || parseFloat(price) <= 0) {
        priceError.textContent = 'Введите корректную цену (больше 0)';
        priceError.classList.add('show');
        document.getElementById('productPrice').classList.add('error');
        isValid = false;
    } else {
        priceError.classList.remove('show');
        document.getElementById('productPrice').classList.remove('error');
    }
    
    const descriptionError = document.getElementById('productDescriptionError');
    if (!description.trim()) {
        descriptionError.textContent = 'Введите описание товара';
        descriptionError.classList.add('show');
        document.getElementById('productDescription').classList.add('error');
        isValid = false;
    } else if (description.length < 20) {
        descriptionError.textContent = 'Описание должно содержать минимум 20 символов';
        descriptionError.classList.add('show');
        document.getElementById('productDescription').classList.add('error');
        isValid = false;
    } else {
        descriptionError.classList.remove('show');
        document.getElementById('productDescription').classList.remove('error');
    }
    
    const imageError = document.getElementById('productImageError');
    if (!image.trim()) {
        imageError.textContent = 'Введите URL изображения';
        imageError.classList.add('show');
        document.getElementById('productImage').classList.add('error');
        isValid = false;
    } else {
        imageError.classList.remove('show');
        document.getElementById('productImage').classList.remove('error');
    }
    
    const saveBtn = document.getElementById('saveProductBtn');
    if (saveBtn) {
        saveBtn.disabled = !isValid;
    }
    
    return isValid;
}

async function addProduct() {
    const isValid = validateProductForm();
    if (!isValid) return;
    
    const products = await fetch(`${API_URL}/products`).then(r => r.json());
    const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
    
    const productData = {
        id: maxId + 1,
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        rating: parseFloat(document.getElementById('productRating').value),
        inStock: document.getElementById('productStock').value === 'true',
        description: document.getElementById('productDescription').value.trim(),
        image: document.getElementById('productImage').value.trim(),
        oldPrice: document.getElementById('productOldPrice').value ? parseFloat(document.getElementById('productOldPrice').value) : null,
        isFavorite: false
    };
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) throw new Error('Ошибка добавления');
        
        showMessage('✅ Товар успешно добавлен', 'success');
        clearProductForm();
        loadProducts();
        loadProductsForSelect();
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка при добавлении товара', 'error');
    }
}

async function updateProduct() {
    const isValid = validateProductForm();
    if (!isValid) return;
    
    const productId = parseInt(document.getElementById('editProductId').value);
    
    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        rating: parseFloat(document.getElementById('productRating').value),
        inStock: document.getElementById('productStock').value === 'true',
        description: document.getElementById('productDescription').value.trim(),
        image: document.getElementById('productImage').value.trim(),
        oldPrice: document.getElementById('productOldPrice').value ? parseFloat(document.getElementById('productOldPrice').value) : null
    };
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) throw new Error('Ошибка обновления');
        
        showMessage('✅ Товар успешно обновлен', 'success');
        clearProductForm();
        loadProducts();
        loadProductsForSelect();
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка при обновлении товара', 'error');
    }
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const product = await response.json();
        
        document.getElementById('formTitle').textContent = '✏️ Редактировать товар';
        document.getElementById('editProductId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productRating').value = product.rating;
        document.getElementById('productStock').value = product.inStock;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productOldPrice').value = product.oldPrice || '';
        
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        editMode = true;
        
        validateProductForm();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка загрузки товара для редактирования', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Ошибка удаления');
        
        showMessage('✅ Товар успешно удален', 'success');
        loadProducts();
        loadProductsForSelect();
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка при удалении товара', 'error');
    }
}

async function deleteReview(id) {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;
    
    try {
        const response = await fetch(`${API_URL}/feedback/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Ошибка удаления');
        
        showMessage('✅ Отзыв успешно удален', 'success');
        loadReviews();
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка при удалении отзыва', 'error');
    }
}

function clearProductForm() {
    document.getElementById('formTitle').textContent = 'Добавить товар';
    document.getElementById('editProductId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productRating').value = '5';
    document.getElementById('productStock').value = 'true';
    document.getElementById('productDescription').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productOldPrice').value = '';
    
    document.getElementById('cancelEditBtn').style.display = 'none';
    editMode = false;
    
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => el.classList.remove('error'));
    
    validateProductForm();
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
    const saveBtn = document.getElementById('saveProductBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (editMode) {
                updateProduct();
            } else {
                addProduct();
            }
        });
    }
    
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', clearProductForm);
    }
    
    const searchInput = document.getElementById('searchProduct');
    if (searchInput) {
        searchInput.addEventListener('input', () => loadProducts());
    }
    
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', loadReviews);
    }
    
    const fields = ['productName', 'productCategory', 'productPrice', 'productDescription', 'productImage'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => validateProductForm());
            field.addEventListener('change', () => validateProductForm());
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Админ-панель загружена');
    
    if (checkAdminAccess()) {
        initEventListeners();
    }
});

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.deleteReview = deleteReview;
window.clearProductForm = clearProductForm;

function checkAdminMenu() {
    const savedUser = localStorage.getItem('currentUser');
    const adminMenuItem = document.getElementById('adminMenuItem');
    const profileMenuItem = document.getElementById('profileMenuItem');
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
            if (adminMenuItem) adminMenuItem.style.display = 'block';
            if (profileMenuItem) profileMenuItem.style.display = 'none';
        } else {
            if (adminMenuItem) adminMenuItem.style.display = 'none';
            if (profileMenuItem) profileMenuItem.style.display = 'block';
        }
    } else {
        if (adminMenuItem) adminMenuItem.style.display = 'none';
        if (profileMenuItem) profileMenuItem.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdminMenu();
    if (checkAdminAccess()) {
        initEventListeners();
    }
});