const API_URL = 'http://localhost:3000';

const api = {
    async getProducts(params = {}) {
        const queryParams = new URLSearchParams();
        
        if (params.search) {
            queryParams.append('q', params.search);
        }
        
        if (params.category && params.category !== 'all') {
            queryParams.append('category', params.category);
        }
        
        if (params.sort && params.order) {
            queryParams.append('_sort', params.sort);
            queryParams.append('_order', params.order);
        }
        
        if (params.minPrice) {
            queryParams.append('price_gte', params.minPrice);
        }
        
        if (params.maxPrice) {
            queryParams.append('price_lte', params.maxPrice);
        }
        
        if (params.inStock !== undefined && params.inStock !== 'all') {
            queryParams.append('inStock', params.inStock === 'true');
        }
        
        if (params.page && params.limit) {
            queryParams.append('_page', params.page);
            queryParams.append('_limit', params.limit);
        }
        
        const response = await fetch(`${API_URL}/products?${queryParams}`);
        const total = response.headers.get('X-Total-Count');
        const products = await response.json();
        
        return { products, total: total ? parseInt(total) : products.length };
    },
    
    async getProduct(id) {
        const response = await fetch(`${API_URL}/products/${id}`);
        return response.json();
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
        return response.json();
    },
    
    async addToFavorites(productId, productData) {
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
        return response.json();
    },
    
    async addToCart(item) {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: Date.now(),
                ...item
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