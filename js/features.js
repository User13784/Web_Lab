class Preloader {
    constructor() {
        this.createPreloader();
        this.hideOnLoad();
    }
    
    createPreloader() {
        const preloader = document.createElement('div');
        preloader.className = 'preloader';
        preloader.id = 'preloader';
        preloader.innerHTML = `
            <div class="preloader-content">
                <div class="preloader-spinner"></div>
                <div class="preloader-text">
                    <span>G</span><span>R</span><span>E</span><span>E</span><span>N</span><span>E</span><span>R</span><span>Y</span>
                </div>
            </div>
        `;
        document.body.appendChild(preloader);
    }
    
    hideOnLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const preloader = document.getElementById('preloader');
                if (preloader) {
                    preloader.classList.add('hide');
                    setTimeout(() => preloader.remove(), 500);
                }
            }, 500);
        });
    }
}

class ToastManager {
    static show(message, type = 'info', duration = 3000) {
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span>${icons[type] || 'ℹ️'}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

class BurgerMenu {
    constructor() {
        this.createBurgerMenu();
        this.init();
    }
    
    createBurgerMenu() {
        const burger = document.createElement('div');
        burger.className = 'burger-menu';
        burger.id = 'burgerMenu';
        burger.innerHTML = `
            <div class="burger-line"></div>
            <div class="burger-line"></div>
            <div class="burger-line"></div>
        `;
        document.body.appendChild(burger);
        
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.id = 'mobileOverlay';
        document.body.appendChild(overlay);
        
        this.createMobileMenu();
    }
    
    createMobileMenu() {
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.id = 'mobileMenu';
    
    const savedUser = localStorage.getItem('currentUser');
    let isLoggedIn = false;
    let userNickname = '';
    let isAdmin = false;
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        isLoggedIn = true;
        userNickname = user.nickname || user.firstName;
        isAdmin = user.role === 'admin';
    }
    
    mobileMenu.innerHTML = `
        <div class="mobile-logo">
            <img src="assets/icons/logo.png" alt="logo">
            <h2>THE PLANET</h2>
        </div>
        
        <div class="mobile-section-title">МЕНЮ</div>
        <div class="menu-item">
            <a href="#" data-section="hero">
                <img src="assets/icons/home.png" alt="home">
                <span>Home</span>
            </a>
        </div>
        <div class="menu-item">
            <a href="pages/catalog.html">
                <img src="assets/icons/shop.png" alt="shop">
                <span>Shop</span>
            </a>
        </div>
        <div class="menu-item">
            <a href="#" data-section="products">
                <img src="assets/icons/blog.png" alt="products">
                <span>Products</span>
            </a>
        </div>
        <div class="menu-item">
            <a href="#" data-section="about">
                <img src="assets/icons/about_us.png" alt="about">
                <span>About</span>
            </a>
        </div>
        <div class="menu-item">
            <a href="#" data-section="gallery">
                <img src="assets/icons/gallery.png" alt="gallery">
                <span>Gallery</span>
            </a>
        </div>
        <div class="menu-item">
            <a href="#" data-section="map-section">
                <img src="assets/icons/location.png" alt="location">
                <span>Location</span>
            </a>
        </div>
        
        <div class="mobile-section-title">АККАУНТ</div>
        ${isLoggedIn ? `
            <div class="menu-item">
                <a href="#">
                    <img src="assets/icons/human.png" alt="user">
                    <span>${userNickname}</span>
                </a>
            </div>
            <div class="menu-item" id="mobileLogoutBtn">
                <a href="#">
                    <img src="assets/icons/door.png" alt="logout">
                    <span>Logout</span>
                </a>
            </div>
        ` : `
            <div class="menu-item">
                <a href="pages/register.html">
                    <img src="assets/icons/human.png" alt="login">
                    <span>LOGIN</span>
                </a>
            </div>
            <div class="menu-item">
                <a href="pages/register.html">
                    <img src="assets/icons/door.png" alt="signup">
                    <span>SIGN UP</span>
                </a>
            </div>
        `}
        
        <div class="mobile-section-title">ИНФОРМАЦИЯ</div>
        <div class="menu-item">
            <a href="#">
                <img src="assets/icons/email.png" alt="email">
                <span>MAILING LIST</span>
            </a>
        </div>
        <div class="menu-item">
            <a href="#">
                <img src="assets/icons/symbol.png" alt="share">
                <span>SHARE <span class="red-badge" id="mobileShareCount">12K</span></span>
            </a>
        </div>
        <div class="menu-item">
            <a href="pages/cart.html">
                <img src="assets/icons/cart.png" alt="cart">
                <span>CART <span class="red-badge" id="mobileCartCount">0</span></span>
            </a>
        </div>
        
        <div class="mobile-section-title">ПОКУПАТЕЛЯМ</div>
        <div class="menu-item">
            <a href="pages/favorites.html">
                <img src="assets/icons/heart.png" alt="favorites">
                <span>Favorites</span>
            </a>
        </div>
        <div class="menu-item">
            <a href="pages/feedback.html">
                <img src="assets/icons/blog.png" alt="reviews">
                <span>Reviews</span>
            </a>
        </div>
        
        ${isAdmin ? `
            <div class="mobile-section-title">АДМИНИСТРИРОВАНИЕ</div>
            <div class="menu-item">
                <a href="pages/admin.html">
                    <img src="assets/icons/admin.png" alt="admin">
                    <span>Admin Panel</span>
                </a>
            </div>
        ` : ''}
    `;
    
    document.body.appendChild(mobileMenu);
}
    
    init() {
        const burger = document.getElementById('burgerMenu');
        const mobileMenu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileOverlay');
        
        if (!burger || !mobileMenu || !overlay) return;
        
        const closeMenu = () => {
            burger.classList.remove('active');
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('menu-open');
        };
        
        const openMenu = () => {
            burger.classList.add('active');
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.classList.add('menu-open');
            this.updateCartCountMobile();
        };
        
        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mobileMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        overlay.addEventListener('click', closeMenu);
        
        const closeBtn = document.getElementById('mobileCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }
        
        const logoutBtn = document.getElementById('mobileLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                ToastManager.show('Вы вышли из аккаунта', 'info');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
        }
        
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });
    }
    
    async updateCartCountMobile() {
        try {
            const response = await fetch('http://localhost:3000/cart');
            const cartItems = await response.json();
            const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            const cartBadge = document.getElementById('mobileCartCount');
            if (cartBadge) {
                cartBadge.textContent = cartCount;
            }
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
        }
    }
}

class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        const links = document.querySelectorAll('a[data-section]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                const targetSection = document.getElementById(sectionId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    history.pushState(null, null, `#${sectionId}`);
                }
            });
        });
        
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                setTimeout(() => {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        }
    }
}

class ModalManager {
    constructor() {
        this.createModalStructure();
        this.currentProduct = null;
    }
    
    createModalStructure() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'productModal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div id="modalContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
    }
    
    openProductDetail(product) {
        this.currentProduct = product;
        const modal = document.getElementById('productModal');
        const content = document.getElementById('modalContent');
        
        content.innerHTML = `
            <div class="product-detail-image">
                <img src="${product.image.startsWith('assets/') ? '../' + product.image : product.image}" 
                     alt="${product.name}" onerror="this.src='../assets/images/chair.png'">
            </div>
            <div class="product-detail-info">
                <h2 class="product-detail-name">${this.escapeHtml(product.name)}</h2>
                <div class="product-detail-price">£${product.price.toFixed(2)}</div>
                <div class="product-detail-rating">
                    ${this.generateStars(product.rating)}
                </div>
                <div class="product-detail-description">
                    ${this.escapeHtml(product.description || 'Нет описания')}
                </div>
                <span class="product-detail-stock ${product.inStock ? 'stock-in' : 'stock-out'}">
                    ${product.inStock ? '✓ В наличии' : '✗ Нет в наличии'}
                </span>
                <div class="modal-buttons" style="margin-top: 20px;">
                    <button class="modal-btn modal-btn-primary" onclick="window.addToCartFromDetail(${product.id})">
                        🛒 Добавить в корзину
                    </button>
                    <button class="modal-btn modal-btn-secondary" onclick="window.toggleFavoriteFromDetail(${product.id})">
                        ${product.isFavorite ? '❤️ В избранном' : '🤍 В избранное'}
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }
    
    openFormModal(title, fields, onSubmit) {
        const modal = document.getElementById('productModal');
        const content = document.getElementById('modalContent');
        
        let fieldsHtml = '';
        fields.forEach(field => {
            if (field.type === 'select' && field.options) {
                let optionsHtml = '';
                field.options.forEach(opt => {
                    const selected = field.value && field.value.toString() === opt.value.toString() ? 'selected' : '';
                    optionsHtml += `<option value="${opt.value}" ${selected}>${opt.text}</option>`;
                });
                fieldsHtml += `
                    <div class="form-group">
                        <label>${field.label} ${field.required ? '<span style="color:#e74c3c">*</span>' : ''}</label>
                        <select id="modal_${field.name}" ${field.required ? 'required' : ''}>
                            ${optionsHtml}
                        </select>
                    </div>
                `;
            } else if (field.type === 'textarea') {
                fieldsHtml += `
                    <div class="form-group">
                        <label>${field.label} ${field.required ? '<span style="color:#e74c3c">*</span>' : ''}</label>
                        <textarea id="modal_${field.name}" rows="4" placeholder="${field.placeholder || ''}">${field.value || ''}</textarea>
                    </div>
                `;
            } else {
                fieldsHtml += `
                    <div class="form-group">
                        <label>${field.label} ${field.required ? '<span style="color:#e74c3c">*</span>' : ''}</label>
                        <input type="${field.type}" id="modal_${field.name}" placeholder="${field.placeholder || ''}" value="${field.value || ''}" ${field.required ? 'required' : ''}>
                    </div>
                `;
            }
        });
        
        content.innerHTML = `
            <h3>${title}</h3>
            ${fieldsHtml}
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-primary" id="modalSubmitBtn">Подтвердить</button>
                <button class="modal-btn modal-btn-secondary" id="modalCancelBtn">Отмена</button>
            </div>
        `;
        
        modal.classList.add('active');
        
        document.getElementById('modalSubmitBtn').addEventListener('click', () => {
            const formData = {};
            let isValid = true;
            
            fields.forEach(field => {
                const element = document.getElementById(`modal_${field.name}`);
                if (element) {
                    const value = element.value;
                    if (field.required && !value) {
                        isValid = false;
                        element.style.borderColor = '#e74c3c';
                    } else {
                        element.style.borderColor = '#e0e8ed';
                        formData[field.name] = value;
                    }
                }
            });
            
            if (isValid && onSubmit) {
                onSubmit(formData);
                this.close();
            }
        });
        
        document.getElementById('modalCancelBtn').addEventListener('click', () => this.close());
    }
    
    openConfirmModal(title, message, onConfirm) {
        const modal = document.getElementById('productModal');
        const content = document.getElementById('modalContent');
        
        content.innerHTML = `
            <h3>${title}</h3>
            <p style="margin: 20px 0; line-height: 1.6; color: #333;">${message}</p>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-primary" id="modalConfirmBtn" style="background: #c62828;">🗑️ Удалить</button>
                <button class="modal-btn modal-btn-secondary" id="modalCancelBtn">Отмена</button>
            </div>
        `;
        
        modal.classList.add('active');
        
        document.getElementById('modalConfirmBtn').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            this.close();
        });
        
        document.getElementById('modalCancelBtn').addEventListener('click', () => this.close());
    }
    
    close() {
        const modal = document.getElementById('productModal');
        if (modal) modal.classList.remove('active');
    }
    
    generateStars(rating) {
        const full = Math.floor(rating);
        let stars = '';
        for (let i = 0; i < full; i++) stars += '★';
        for (let i = full; i < 5; i++) stars += '☆';
        return stars;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

class AnimatedCounter {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = target;
        this.duration = duration;
        this.current = 0;
        this.animated = false;
    }
    
    start() {
        if (this.animated) return;
        this.animated = true;
        const increment = this.target / (this.duration / 16);
        
        const updateCounter = () => {
            this.current += increment;
            if (this.current >= this.target) {
                this.element.textContent = Math.floor(this.target);
                return;
            }
            this.element.textContent = Math.floor(this.current);
            requestAnimationFrame(updateCounter);
        };
        
        requestAnimationFrame(updateCounter);
    }
    
    static observeCounters() {
        const counters = document.querySelectorAll('.counter-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const target = parseInt(element.dataset.target);
                    const counter = new AnimatedCounter(element, target);
                    counter.start();
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }
}

class ParallaxEffect {
    constructor() {
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => {
            const layers = document.querySelectorAll('.parallax-layer');
            const scrolled = window.pageYOffset;
            
            layers.forEach((layer, index) => {
                const speed = 0.2 + (index * 0.1);
                const yPos = -(scrolled * speed);
                if (index === 0) {
                    layer.style.transform = `translateY(${yPos * 0.3}px)`;
                } else if (index === 1) {
                    layer.style.transform = `translateY(${yPos * 0.6}px)`;
                } else if (index === 2) {
                    layer.style.transform = `translateY(${yPos * 0.9}px)`;
                }
            });
        });
    }
}

class ScrollEffects {
    constructor() {
        this.init();
    }
    
    init() {
        const elements = document.querySelectorAll('.fade-on-scroll, .scale-on-scroll, .slide-left-on-scroll, .slide-right-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
        
        elements.forEach(el => observer.observe(el));
        
        this.createScrollTopButton();
    }
    
    createScrollTopButton() {
        const btn = document.createElement('button');
        btn.className = 'scroll-top-btn';
        btn.innerHTML = '↑';
        btn.id = 'scrollTopBtn';
        document.body.appendChild(btn);
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

class MapManager {
    constructor() {
        this.initMapWithDelay();
    }
    
    initMapWithDelay() {
        const mapSection = document.getElementById('map-section');
        
        if (!mapSection) {
            console.log('Секция map-section не найдена, повторная попытка...');
            setTimeout(() => this.initMapWithDelay(), 500);
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.initMap();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(mapSection);
    }
    
    initMap() {
        if (typeof ymaps === 'undefined') {
            console.log('Яндекс карты не загружены, повторная попытка...');
            setTimeout(() => this.initMap(), 500);
            return;
        }
        
        ymaps.ready(() => {
            const mapElement = document.getElementById('map');
            if (!mapElement) {
                console.log('Элемент #map не найден');
                return;
            }
            
            mapElement.style.width = '100%';
            mapElement.style.height = '400px';
            
            const myMap = new ymaps.Map('map', {
                center: [53.893009, 27.567444],
                zoom: 16,
                controls: ['zoomControl', 'fullscreenControl']
            });
            
            const placemark = new ymaps.Placemark([53.893009, 27.567444], {
                hintContent: 'Greenery Мебельный магазин',
                balloonContent: `
                    <div style="font-family: Arial, sans-serif;">
                        <strong>Greenery Мебельный магазин</strong><br>
                        Адрес: г. Минск, ул. Немига, 5<br>
                        Телефон: +375 (29) 123-45-67<br>
                        Время работы: 10:00 - 20:00<br>
                        <a href="https://yandex.ru/maps/?rtext=~53.893009,27.567444" target="_blank">Построить маршрут</a>
                    </div>
                `
            }, {
                preset: 'islands#greenHomeIcon',
                draggable: false
            });
            
            myMap.geoObjects.add(placemark);
            
            setTimeout(() => {
                myMap.container.fitToViewport();
                console.log('Размеры карты обновлены');
            }, 300);
            
            window.addEventListener('resize', () => {
                setTimeout(() => {
                    myMap.container.fitToViewport();
                }, 200);
            });
        });
    }
}

class MediaGallery {
    constructor(images) {
        this.images = images || this.getDefaultImages();
        this.currentIndex = 0;
        this.audio = null;
        this.isPlaying = false;
        this.init();
    }
    
    getDefaultImages() {
        return [
            { src: 'assets/images/c1.jpg', sound: 'assets/sounds/sound1.mp3', name: 'Элитный диван' },
            { src: 'assets/images/c2.jpg', sound: 'assets/sounds/sound2.mp3', name: 'Современный диван' },
            { src: 'assets/images/c3.jpg', sound: 'assets/sounds/sound3.mp3', name: 'Классический диван' },
            { src: 'assets/images/c4.jpg', sound: 'assets/sounds/sound4.mp3', name: 'Журнальный столик' },
            { src: 'assets/images/c5.jpg', sound: 'assets/sounds/sound5.mp3', name: 'Обеденный стол' },
            { src: 'assets/images/c6.jpg', sound: 'assets/sounds/sound6.mp3', name: 'Кухонные стулья' },
            { src: 'assets/images/c7.jpg', sound: 'assets/sounds/sound7.mp3', name: 'Кровать двуспальная' },
            { src: 'assets/images/c8.jpg', sound: 'assets/sounds/sound8.mp3', name: 'Прикроватная тумба' },
            { src: 'assets/images/c9.jpg', sound: 'assets/sounds/sound9.mp3', name: 'Ванная полка' },
            { src: 'assets/images/c10.jpg', sound: 'assets/sounds/sound10.mp3', name: 'Зеркало в раме' },
            { src: 'assets/images/c11.jpg', sound: 'assets/sounds/sound11.mp3', name: 'Керамическая ваза' },
            { src: 'assets/images/c12.jpg', sound: 'assets/sounds/sound12.mp3', name: 'Настольная лампа' }
        ];
    }
    
    init() {
        this.createThumbnails();
        this.setupEventListeners();
        this.updateActiveThumbnail();
    }
    
    createThumbnails() {
        const container = document.getElementById('galleryThumbnails');
        if (!container) return;
        
        container.innerHTML = this.images.map((img, i) => `
            <img src="${img.src}" class="gallery-thumb ${i === this.currentIndex ? 'active' : ''}" data-index="${i}" alt="${img.name}">
        `).join('');
    }
    
    setupEventListeners() {
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');
        const randomBtn = document.getElementById('randomImageBtn');
        const playBtn = document.getElementById('audioPlayBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevImage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextImage());
        if (randomBtn) randomBtn.addEventListener('click', () => this.randomImage());
        if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());
        if (volumeSlider) volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('gallery-thumb')) {
                const index = parseInt(e.target.dataset.index);
                this.changeImage(index);
            }
        });
    }
    
    changeImage(index) {
        if (index < 0) index = this.images.length - 1;
        if (index >= this.images.length) index = 0;
        
        this.currentIndex = index;
        const mainImage = document.getElementById('galleryMainImage');
        
        mainImage.style.opacity = '0';
        setTimeout(() => {
            mainImage.src = this.images[this.currentIndex].src;
            mainImage.style.opacity = '1';
        }, 200);
        
        this.updateActiveThumbnail();
        this.playSoundForImage(this.currentIndex);
    }
    
    prevImage() {
        this.changeImage(this.currentIndex - 1);
    }
    
    nextImage() {
        this.changeImage(this.currentIndex + 1);
    }
    
    randomImage() {
        const randomIndex = Math.floor(Math.random() * this.images.length);
        this.changeImage(randomIndex);
        ToastManager.show('Случайное изображение!', 'info', 1500);
    }
    
    updateActiveThumbnail() {
        document.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
            if (i === this.currentIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
    
    playSoundForImage(index) {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        
        const soundUrl = this.images[index].sound;
        if (soundUrl) {
            try {
                this.audio = new Audio(soundUrl);
                this.audio.volume = document.getElementById('volumeSlider')?.value / 100 || 0.7;
                
                this.audio.onerror = () => {
                    console.error(`Не удалось загрузить звук: ${soundUrl}`);
                    ToastManager.show(`Звук не загружен`, 'warning', 2000);
                    this.isPlaying = false;
                    this.updatePlayButton();
                };
                
                const playPromise = this.audio.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.isPlaying = true;
                        this.updatePlayButton();
                    }).catch(error => {
                        console.log('Автовоспроизведение заблокировано:', error);
                        this.isPlaying = false;
                        this.updatePlayButton();
                        ToastManager.show('Нажмите на кнопку ▶, чтобы включить звук', 'info', 3000);
                    });
                }
            } catch (e) {
                console.error('Ошибка создания аудио:', e);
                this.isPlaying = false;
                this.updatePlayButton();
            }
        }
    }
    
    togglePlay() {
        if (this.audio) {
            if (this.isPlaying) {
                this.audio.pause();
                this.isPlaying = false;
            } else {
                const playPromise = this.audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.isPlaying = true;
                        this.updatePlayButton();
                    }).catch(error => {
                        console.log('Ошибка воспроизведения:', error);
                        ToastManager.show('Не удалось воспроизвести звук', 'error');
                    });
                }
            }
            this.updatePlayButton();
        } else {
            this.playSoundForImage(this.currentIndex);
        }
    }
    
    setVolume(value) {
        const volume = value / 100;
        if (this.audio) {
            this.audio.volume = volume;
        }
    }
    
    updatePlayButton() {
        const playBtn = document.getElementById('audioPlayBtn');
        const indicator = document.getElementById('audioPlayingIndicator');
        
        if (playBtn) {
            playBtn.textContent = this.isPlaying ? '⏸' : '▶';
        }
        if (indicator) {
            indicator.style.display = this.isPlaying ? 'flex' : 'none';
        }
    }
}

window.addToCartFromDetail = async (productId) => {
    try {
        const response = await fetch(`http://localhost:3000/products/${productId}`);
        const product = await response.json();
        
        const cartResponse = await fetch('http://localhost:3000/cart');
        const cart = await cartResponse.json();
        const existing = cart.find(item => item.productId === productId);
        
        if (existing) {
            await fetch(`http://localhost:3000/cart/${existing.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: existing.quantity + 1 })
            });
        } else {
            await fetch('http://localhost:3000/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: Date.now(),
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                })
            });
        }
        
        ToastManager.show(`"${product.name}" добавлен в корзину`, 'success');
        window.modalManager.close();
        
        const mobileCartCount = document.getElementById('mobileCartCount');
        if (mobileCartCount) {
            const cartResponse2 = await fetch('http://localhost:3000/cart');
            const newCart = await cartResponse2.json();
            const newCount = newCart.reduce((sum, item) => sum + item.quantity, 0);
            mobileCartCount.textContent = newCount;
        }
        
        const cartBadge = document.getElementById('cartCount');
        if (cartBadge) {
            const cartResponse2 = await fetch('http://localhost:3000/cart');
            const newCart = await cartResponse2.json();
            const newCount = newCart.reduce((sum, item) => sum + item.quantity, 0);
            cartBadge.textContent = newCount;
        }
    } catch (error) {
        ToastManager.show('Ошибка добавления в корзину', 'error');
    }
};

window.toggleFavoriteFromDetail = async (productId) => {
    try {
        const productResponse = await fetch(`http://localhost:3000/products/${productId}`);
        const product = await productResponse.json();
        
        const favResponse = await fetch('http://localhost:3000/favorites');
        const favorites = await favResponse.json();
        const existing = favorites.find(f => f.productId === productId);
        
        if (existing) {
            await fetch(`http://localhost:3000/favorites/${existing.id}`, { method: 'DELETE' });
            ToastManager.show(`"${product.name}" удален из избранного`, 'info');
        } else {
            await fetch('http://localhost:3000/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: Date.now(),
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category
                })
            });
            ToastManager.show(`"${product.name}" добавлен в избранное`, 'success');
        }
        
        await fetch(`http://localhost:3000/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFavorite: !existing })
        });
        
        window.modalManager.close();
    } catch (error) {
        ToastManager.show('Ошибка', 'error');
    }
};

const galleryPhotos = [
    { src: 'assets/images/c1.jpg', name: 'Элитный диван', category: 'Диваны' },
    { src: 'assets/images/c2.jpg', name: 'Современный диван', category: 'Диваны' },
    { src: 'assets/images/c3.jpg', name: 'Классический диван', category: 'Диваны' },
    { src: 'assets/images/c4.jpg', name: 'Журнальный столик', category: 'Гостиная' },
    { src: 'assets/images/c5.jpg', name: 'Обеденный стол', category: 'Кухня' },
    { src: 'assets/images/c6.jpg', name: 'Кухонные стулья', category: 'Кухня' },
    { src: 'assets/images/c7.jpg', name: 'Кровать двуспальная', category: 'Спальня' },
    { src: 'assets/images/c8.jpg', name: 'Прикроватная тумба', category: 'Спальня' },
    { src: 'assets/images/c9.jpg', name: 'Ванная полка', category: 'Ванная' },
    { src: 'assets/images/c10.jpg', name: 'Зеркало в раме', category: 'Декор' },
    { src: 'assets/images/c11.jpg', name: 'Керамическая ваза', category: 'Керамика' },
    { src: 'assets/images/c12.jpg', name: 'Настольная лампа', category: 'Декор' }
];

let currentPhotoIndex = 0;
const photosPerPage = 6;

window.renderPhotoGallery = function() {
    const start = currentPhotoIndex;
    const end = start + photosPerPage;
    const visiblePhotos = galleryPhotos.slice(start, end);
    
    const grid = document.getElementById('photoGrid');
    if (!grid) return;
    
    grid.innerHTML = visiblePhotos.map((photo, idx) => `
        <div class="photo-card" onclick="window.openProductModal(${start + idx + 1})">
            <img src="${photo.src}" alt="${photo.name}" onerror="this.src='assets/images/chair.png'">
            <div class="photo-card-info">
                <h3>${photo.name}</h3>
                <p>${photo.category}</p>
            </div>
        </div>
    `).join('');
    
    const indicator = document.getElementById('photoIndicator');
    if (indicator) {
        indicator.textContent = `Показано ${start + 1}-${Math.min(end, galleryPhotos.length)} из ${galleryPhotos.length} товаров`;
    }
    
    const prevBtn = document.getElementById('prevPhotoBtn');
    const nextBtn = document.getElementById('nextPhotoBtn');
    if (prevBtn) prevBtn.disabled = currentPhotoIndex === 0;
    if (nextBtn) nextBtn.disabled = currentPhotoIndex + photosPerPage >= galleryPhotos.length;
};

window.changePhotoPage = function(direction) {
    const newIndex = currentPhotoIndex + direction * photosPerPage;
    if (newIndex >= 0 && newIndex < galleryPhotos.length) {
        currentPhotoIndex = newIndex;
        window.renderPhotoGallery();
    }
};

window.openProductModal = (productId) => {
    if (window.modalManager) {
        fetch(`http://localhost:3000/products/${productId}`)
            .then(res => res.json())
            .then(product => window.modalManager.openProductDetail(product))
            .catch(err => console.error('Ошибка:', err));
    } else {
        alert('Модальное окно временно недоступно');
    }
};

async function updateCartCount() {
    try {
        const response = await fetch('http://localhost:3000/cart');
        const cartItems = await response.json();
        const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const cartBadge = document.getElementById('cartCount');
        if (cartBadge) cartBadge.textContent = cartCount;
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    const loginLink = document.querySelector('.nav-left .nav-item-with-icon:first-child a');
    const signupLink = document.querySelector('.nav-left .nav-item-with-icon:last-child a');
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (loginLink) {
            loginLink.textContent = user.nickname;
            loginLink.href = "#";
        }
        if (signupLink) {
            signupLink.textContent = "LOGOUT";
            signupLink.href = "#";
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.reload();
            });
        }
    }
}

window.openVideoModal = () => {
    let videoModal = document.getElementById('videoModal');
    if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.className = 'video-modal';
        videoModal.id = 'videoModal';
        videoModal.innerHTML = `
            <div class="video-container">
                <span class="close-video">&times;</span>
                <video id="promoVideo" controls autoplay>
                    <source src="assets/videos/promo.mp4" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
            </div>
        `;
        document.body.appendChild(videoModal);
        
        const closeBtn = videoModal.querySelector('.close-video');
        closeBtn.addEventListener('click', () => {
            const video = document.getElementById('promoVideo');
            if (video) video.pause();
            videoModal.classList.remove('active');
        });
        
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                const video = document.getElementById('promoVideo');
                if (video) video.pause();
                videoModal.classList.remove('active');
            }
        });
    }
    
    const video = document.getElementById('promoVideo');
    if (video) {
        video.pause();
        video.currentTime = 0;
        video.load();
    }
    
    videoModal.classList.add('active');
};

document.addEventListener('DOMContentLoaded', () => {
    new Preloader();
    new BurgerMenu();
    window.modalManager = new ModalManager();
    new ParallaxEffect();
    new ScrollEffects();
    new MapManager();  
    new MediaGallery();
    new SmoothScroll();
    
    if (document.getElementById('photoGrid')) {
        window.renderPhotoGallery();
    }
    
    setTimeout(() => {
        AnimatedCounter.observeCounters();
    }, 500);
    
    updateCartCount();
    checkAuth();
});

document.addEventListener('DOMContentLoaded', () => {
    const videoPlayBtn = document.getElementById('mainVideoPlayBtn');
    const videoThumbnail = document.getElementById('videoThumbnail');
    
    if (videoPlayBtn) {
        videoPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.openVideoModal();
        });
    }
    
    if (videoThumbnail) {
        videoThumbnail.addEventListener('click', (e) => {
            if (e.target === videoThumbnail || e.target.closest('.video-thumbnail')) {
                window.openVideoModal();
            }
        });
    }
    
    const prevBtn = document.getElementById('prevPhotoBtn');
    const nextBtn = document.getElementById('nextPhotoBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', () => window.changePhotoPage(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => window.changePhotoPage(1));
});