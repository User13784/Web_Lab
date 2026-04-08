price, rating, inStock, description, image, oldPrice
const products = [
    { id: 1, name: "Элитный диван", category: "sofa", price: 899, rating: 5, inStock: true, description: "Роскошный диван из велюра премиум-класса", image: "c1.jpg", oldPrice: 1120 },
    { id: 2, name: "Современный диван", category: "sofa", price: 650, rating: 4, inStock: true, description: "Диван для гостиной в современном стиле", image: "c2.jpg", oldPrice: 780 },
    { id: 3, name: "Классический диван", category: "sofa", price: 720, rating: 4.5, inStock: false, description: "Диван в классическом стиле с мягкими подушками", image: "c3.jpg", oldPrice: 850 },
    { id: 4, name: "Журнальный столик", category: "living", price: 250, rating: 4, inStock: true, description: "Журнальный столик с металлическими ножками", image: "c4.jpg", oldPrice: 310 },
    { id: 5, name: "Обеденный стол", category: "kitchen", price: 450, rating: 4.5, inStock: true, description: "Дубовый обеденный стол на 6 персон", image: "c5.jpg", oldPrice: 550 },
    { id: 6, name: "Кухонные стулья", category: "kitchen", price: 180, rating: 4, inStock: true, description: "Набор из мягких стульев для кухни", image: "c6.jpg", oldPrice: 230 },
    { id: 7, name: "Кровать двуспальная", category: "bedroom", price: 1200, rating: 5, inStock: true, description: "Ортопедическая кровать с подъемным механизмом", image: "c7.jpg", oldPrice: 1500 },
    { id: 8, name: "Прикроватная тумба", category: "bedroom", price: 150, rating: 3.5, inStock: true, description: "Тумба из массива дерева с мягкой обивкой", image: "c8.jpg", oldPrice: 190 },
    { id: 9, name: "Ванная полка", category: "bathroom", price: 85, rating: 4, inStock: true, description: "Настенная полка для ванной из нержавеющей стали", image: "c9.jpg", oldPrice: 110 },
    { id: 10, name: "Зеркало в раме", category: "decor", price: 120, rating: 4.5, inStock: true, description: "Декоративное зеркало в раме", image: "c10.jpg", oldPrice: 160 },
    { id: 11, name: "Керамическая ваза", category: "ceramics", price: 65, rating: 4, inStock: false, description: "Керамическая ваза ручной работы", image: "c11.jpg", oldPrice: 85 },
    { id: 12, name: "Настольная лампа", category: "decor", price: 95, rating: 4, inStock: true, description: "Светодиодная настольная лампа с диммером", image: "c12.jpg", oldPrice: 120 },
    { id: 13, name: "Шкаф-купе", category: "bedroom", price: 850, rating: 4.5, inStock: true, description: "Вместительный шкаф-купе с зеркальными дверями", image: "c13.jpg", oldPrice: 1050 },
    { id: 14, name: "Барный стул", category: "kitchen", price: 110, rating: 3.5, inStock: true, description: "Барный стул с металлическим каркасом", image: "c14.jpg", oldPrice: 140 },
    { id: 15, name: "Пуф мягкий", category: "living", price: 75, rating: 4, inStock: true, description: "Мягкий пуф для отдыха в гостиной", image: "c15.jpg", oldPrice: 95 }
];

const categories = [
    { value: "all", label: "Все" },
    { value: "sofa", label: "Диваны" },
    { value: "living", label: "Гостиная" },
    { value: "kitchen", label: "Кухня" },
    { value: "bedroom", label: "Спальня" },
    { value: "bathroom", label: "Ванная" },
    { value: "decor", label: "Декор" },
    { value: "ceramics", label: "Керамика" }
];

let currentProducts = [...products];
let currentCategory = "all";
let currentSearchTerm = "";
let currentSortMethod = "default";
let originalProducts = [...products];


function getCategoryLabel(categoryValue) {
    const cat = categories.find(c => c.value === categoryValue);
    return cat ? cat.label : categoryValue;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star">★</span>';
    }
    if (hasHalfStar) {
        stars += '<span class="star">½</span>';
    }
    for (let i = stars.length / 12; i < 5; i++) {
        stars += '<span class="star">☆</span>';
    }
    return stars;
}

function showMessage(message) {
    const existingMsg = document.querySelector('.message-popup');
    if (existingMsg) existingMsg.remove();
    
    const msg = document.createElement('div');
    msg.className = 'message-popup';
    msg.textContent = message;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.remove();
    }, 3000);
}

function renderProducts() {
    const container = document.getElementById('catalogContainer');
    if (!container) return;

    let filtered = [...originalProducts];
    
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
 
    if (currentSearchTerm.trim() !== '') {
        const term = currentSearchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.description.toLowerCase().includes(term)
        );
    }
    
    if (currentSortMethod !== 'default') {
        switch(currentSortMethod) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'rating-desc':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
        }
    }
    
    currentProducts = filtered;
    
    if (filtered.length === 0) {
        container.innerHTML = `<div class="no-results">😕 Товары не найдены. Попробуйте изменить критерии поиска.</div>`;
        document.getElementById('stats').innerHTML = `📊 Найдено: 0 товаров`;
        return;
    }
    
    container.innerHTML = filtered.map(product => `
        <article class="catalog-card">
            <div class="card-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='chair.png'">
            </div>
            <div class="card-info">
                <h3 class="card-title">${product.name}</h3>
                <div class="card-category">${getCategoryLabel(product.category)}</div>
                <div class="card-price">£${product.price.toFixed(2)}</div>
                <div class="card-rating">
                    ${generateStars(product.rating)}
                </div>
                <span class="card-stock ${product.inStock ? 'in-stock' : 'out-stock'}">
                    ${product.inStock ? '✓ В наличии' : '✗ Нет в наличии'}
                </span>
                <p style="font-size: 12px; color: #5a7c85; margin-top: 10px;">${product.description}</p>
            </div>
        </article>
    `).join('');
    
    document.getElementById('stats').innerHTML = `📊 Найдено: ${filtered.length} товаров из ${products.length}`;
}


    
    const searchName = userInput.trim();
    const index = products.findIndex(p => p.name.toLowerCase() === searchName.toLowerCase());
    
    if (index !== -1) {
        showMessage(`🔍 indexOf() - Товар "${products[index].name}" найден на позиции ${index + 1} (индекс ${index})`);
    } else {
        // Показываем похожие товары, если точное совпадение не найдено
        const similar = products.filter(p => p.name.toLowerCase().includes(searchName.toLowerCase()));
        if (similar.length > 0) {
            showMessage(`❌ Товар "${searchName}" не найден. Возможно, вы искали: ${similar.map(p => p.name).join(", ")}`);
        } else {
            showMessage(`❌ indexOf() - Товар "${searchName}" не найден в каталоге`);
        }
    }
}



function resetToOriginal() {
    originalProducts = [...products];
    currentCategory = "all";
    currentSearchTerm = "";
    currentSortMethod = "default";
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        }
    });
    
    document.getElementById('searchInput').value = '';
    
    // Сбрасываем select
    document.getElementById('sortSelect').value = 'default';
    
    renderProducts();
    showMessage('🔄 Каталог сброшен к исходному состоянию');
}



// Поисковая строка - динамическое обновление при вводе
function initSearchListener() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value;
            renderProducts();
        });
    }
}

function initSortListener() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSortMethod = e.target.value;
            renderProducts();
        });
    }
}

function initCategoryListeners() {
    const categoryContainer = document.getElementById('categoryFilter');
    if (categoryContainer) {
        // Очищаем и добавляем кнопки категорий
        categoryContainer.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `category-btn ${cat.value === 'all' ? 'active' : ''}`;
            btn.dataset.category = cat.value;
            btn.textContent = cat.label;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = cat.value;
                renderProducts();
            });
            categoryContainer.appendChild(btn);
        });
    }
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
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const method = btn.dataset.method;
            if (methods[method]) {
                methods[method]();
            }
        });
    });
}

function addResetButton() {
    const methodsSection = document.querySelector('.methods-section');
    if (methodsSection) {
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 Сбросить каталог';
        resetBtn.className = 'method-btn';
        resetBtn.style.background = '#264A51';
        resetBtn.style.color = 'white';
        resetBtn.addEventListener('click', resetToOriginal);
        
        const buttonContainer = document.getElementById('methodButtons');
        if (buttonContainer) {
            const separator = document.createElement('span');
            separator.style.width = '1px';
            separator.style.height = '30px';
            separator.style.background = '#e0e8ed';
            separator.style.margin = '0 5px';
            buttonContainer.appendChild(separator);
            buttonContainer.appendChild(resetBtn);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Каталог загружен');
    
    initCategoryListeners();
    initSearchListener();
    initSortListener();
    initMethodButtons();
    addResetButton();
    
    renderProducts();
});