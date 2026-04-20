const API_URL = 'http://localhost:3000';

function getImagePath(imagePath) {
    if (!imagePath) return '../assets/images/chair.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return '../' + imagePath;
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

function showMessage(message, isError = false) {
    const existingMsg = document.querySelector('.message-popup');
    if (existingMsg) existingMsg.remove();
    
    const msg = document.createElement('div');
    msg.className = 'message-popup';
    msg.textContent = message;
    if (isError) {
        msg.style.background = '#c62828';
    }
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadFavorites() {
    try {
        const container = document.getElementById('favoritesContainer');
        if (!container) return;
        
        container.innerHTML = '<div class="empty-favorites"><h2>⏳ Загрузка...</h2></div>';
        
        const response = await fetch(`${API_URL}/favorites`);
        const favorites = await response.json();
        
        if (!favorites || favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-favorites">
                    <h2>😔 В избранном пока пусто</h2>
                    <p>Добавляйте товары в избранное, чтобы они появились здесь</p>
                    <a href="catalog.html" class="back-link">Перейти в каталог</a>
                </div>
            `;
            return;
        }
        
        const productPromises = favorites.map(fav => 
            fetch(`${API_URL}/products/${fav.productId}`).then(res => {
                if (!res.ok) throw new Error(`Товар ${fav.productId} не найден`);
                return res.json();
            })
        );
        
        const products = await Promise.all(productPromises);
        
        container.innerHTML = products.map(product => `
            <div class="favorite-card" data-id="${product.id}">
                <div class="card-image">
                    <img src="${getImagePath(product.image)}" alt="${product.name}" onerror="this.src='../assets/images/chair.png'">
                    <button class="remove-fav-btn" onclick="removeFromFavorites(${product.id})" title="Удалить из избранного">
                        🗑️
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
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
        showMessage('Ошибка загрузки избранного. Проверьте подключение к серверу.', true);
        
        const container = document.getElementById('favoritesContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-favorites">
                    <h2>⚠️ Ошибка загрузки</h2>
                    <p>Не удалось загрузить избранное. Убедитесь, что сервер запущен.</p>
                    <a href="catalog.html" class="back-link">Перейти в каталог</a>
                </div>
            `;
        }
    }
}

async function removeFromFavorites(productId) {
    try {
        const favResponse = await fetch(`${API_URL}/favorites`);
        const favorites = await favResponse.json();
        
        const favItem = favorites.find(f => f.productId === productId);
        
        if (!favItem) {
            showMessage('Товар не найден в избранном', true);
            return;
        }
        
        await fetch(`${API_URL}/favorites/${favItem.id}`, { 
            method: 'DELETE' 
        });
        
        await fetch(`${API_URL}/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFavorite: false })
        });
        
        showMessage('❤️ Товар удален из избранного');
        loadFavorites();
        
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showMessage('Ошибка при удалении товара', true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница избранного загружена');
    loadFavorites();
});

window.removeFromFavorites = removeFromFavorites;