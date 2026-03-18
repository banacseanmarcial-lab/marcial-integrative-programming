// api.js - Clean, reusable Rest Countries API wrapper
// Supports multiple endpoints with caching, retries, and full error handling

class CountryAPI {
    constructor() {
        this.baseURL = 'https://restcountries.com/v3.1';
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
        this.maxRetries = 2;
    }

    // Core fetch with timeout, retry, and caching
    async _fetch(url, options = {}, retries = 0) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const cacheKey = url;
            const cached = this.cache.get(cacheKey);
            
            // Return cached data if fresh
            if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
                console.log('📦 Cache hit:', url);
                return cached.data;
            }

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    ...options.headers
                },
                ...options
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache successful response
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            console.log('✅ API Success:', data.length || 1, 'results');
            return data;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('⏰ Request timeout (5s)');
            }

            // Retry logic
            if (retries < this.maxRetries && error.message.includes('HTTP')) {
                console.log(`🔄 Retry ${retries + 1}/${this.maxRetries}:`, url);
                await new Promise(resolve => setTimeout(resolve, 500 * (retries + 1)));
                return this._fetch(url, options, retries + 1);
            }

            console.error('❌ API Error:', error.message);
            throw error;
        }
    }

    // 🔍 Search by name (partial match)
    async searchByName(name, fields = 'name,flags,capital,population,region,languages,currencies') {
        const url = `${this.baseURL}/name/${encodeURIComponent(name)}?fields=${fields}`;
        return this._fetch(url);
    }

    // 🌍 Get all countries (paginated)
    async getAllCountries(fields = 'name,flags,capital,population,region', limit = 250) {
        const url = `${this.baseURL}/all?fields=${fields}`;
        const data = await this._fetch(url);
        return data.slice(0, limit);
    }

    // 📍 Get by exact name
    async getByName(name, fields = 'name,flags,capital,population,region,languages,currencies') {
        const data = await this.searchByName(name, fields);
        return data.find(country => 
            country.name.common.toLowerCase() === name.toLowerCase()
        ) || null;
    }

    // 🗺️ Get by region
    async getByRegion(region, fields = 'name,flags,capital,population') {
        const url = `${this.baseURL}/region/${encodeURIComponent(region)}?fields=${fields}`;
        return this._fetch(url);
    }

    // 🌆 Get by capital
    async getByCapital(capital, fields = 'name,flags,capital,population') {
        const url = `${this.baseURL}/capital/${encodeURIComponent(capital)}?fields=${fields}`;
        return this._fetch(url);
    }

    // 💰 Get by currency
    async getByCurrency(currency, fields = 'name,flags,currencies') {
        const url = `${this.baseURL}/currency/${encodeURIComponent(currency)}?fields=${fields}`;
        return this._fetch(url);
    }

    // 🆔 Get by country code
    async getByCode(code, fields = 'name,flags,capital,population,region,languages,currencies') {
        const url = `${this.baseURL}/alpha/${code}?fields=${fields}`;
        return this._fetch(url);
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            ttl: this.cacheTTL / 1000 / 60 + ' minutes'
        };
    }
}

// 🏗️ Singleton instance
export const countryAPI = new CountryAPI();

// Default export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { countryAPI };
}

// Global for direct script usage
window.countryAPI = countryAPI;

console.log('🌍 CountryAPI initialized - Ready to fetch countries!');