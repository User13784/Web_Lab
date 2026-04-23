const API_URL = 'http://localhost:3000';

function getImagePath(imagePath) {
    if (!imagePath) return '../assets/images/chair.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return '../' + imagePath;
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

async function loadCart() {
    try {
        const response = await fetch(`${API_URL}/cart`);
        const cartItems = await response.json();
        
        const container = document.getElementById('cartContent');
        
        if (!cartItems.length) {
            container.innerHTML = `
                <div class="empty-cart">
                    <h2>🛍️ Корзина пуста</h2>
                    <p>Добавьте товары в корзину, чтобы оформить заказ</p>
                    <a href="catalog.html" class="back-link">Перейти в каталог</a>
                </div>
            `;
            return;
        }
        
        let total = 0;
        
        const itemsHtml = cartItems.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            return `
                <div class="cart-item">
                    <img src="${getImagePath(item.image)}" alt="${item.name}" class="cart-item-image" onerror="this.src='../assets/images/chair.png'">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">£${item.price.toFixed(2)}</div>
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <div class="cart-item-total">£${itemTotal.toFixed(2)}</div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
                </div>
            `;
        }).join('');
        
        container.innerHTML = `
            <div class="cart-table">
                <div class="cart-header">
                    <div>Товар</div>
                    <div>Название</div>
                    <div>Цена</div>
                    <div>Количество</div>
                    <div>Сумма</div>
                    <div></div>
                </div>
                ${itemsHtml}
            </div>
            <div class="cart-summary">
                <div class="cart-total">Итого: £${total.toFixed(2)}</div>
                <button class="checkout-btn" onclick="checkout()">✅ Оформить заказ</button>
            </div>
        `;
        
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        showMessage('Ошибка загрузки корзины. Убедитесь, что сервер запущен.', true);
    }
}

async function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
        await removeFromCart(cartId);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/cart/${cartId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity })
        });
        
        if (!response.ok) throw new Error('Ошибка обновления');
        
        showMessage('Количество обновлено');
        loadCart();
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка обновления количества', true);
    }
}

async function removeFromCart(cartId) {
    try {
        const response = await fetch(`${API_URL}/cart/${cartId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Ошибка удаления');
        
        showMessage('🗑️ Товар удален из корзины');
        loadCart();
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка удаления товара', true);
    }
}

async function checkout() {
    try {
        const response = await fetch(`${API_URL}/cart`);
        const cartItems = await response.json();
        
        for (const item of cartItems) {
            await fetch(`${API_URL}/cart/${item.id}`, { 
                method: 'DELETE' 
            });
        }
        
        showMessage('✅ Заказ успешно оформлен! Спасибо за покупку!');
        loadCart();
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка оформления заказа', true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница корзины загружена');
    loadCart();
});

window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;


// Добавьте эту функцию в cart.js
async function checkout() {
    try {
        const response = await fetch(`${API_URL}/cart`);
        const cartItems = await response.json();
        
        if (cartItems.length === 0) {
            showMessage('Корзина пуста', true);
            return;
        }
        
        // Получаем текущего пользователя
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            showMessage('Пожалуйста, войдите в систему для оформления заказа', true);
            setTimeout(() => {
                window.location.href = 'register.html';
            }, 2000);
            return;
        }
        
        // Создаем заказ
        const order = {
            id: Date.now(),
            userId: currentUser.id,
            userName: `${currentUser.firstName} ${currentUser.lastName}`,
            items: cartItems.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Сохраняем заказ
        await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        
        // Обновляем количество товаров
        for (const item of cartItems) {
            const productResponse = await fetch(`${API_URL}/products/${item.productId}`);
            const product = await productResponse.json();
            
            await fetch(`${API_URL}/products/${item.productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inStock: false })
            });
        }
        
        // Очищаем корзину
        for (const item of cartItems) {
            await fetch(`${API_URL}/cart/${item.id}`, { method: 'DELETE' });
        }
        
        showMessage(`✅ Заказ №${order.id} успешно оформлен! Сумма: £${order.total.toFixed(2)}`);
        loadCart();
        
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка оформления заказа', true);
    }
}