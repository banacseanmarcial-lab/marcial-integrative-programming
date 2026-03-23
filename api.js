// 🌍 Country Explorer API Module
// Uses Rest Countries API v3.1 (PERFECT) + Optional Weather

const API_CONFIG = {
    COUNTRIES_BASE: 'https://restcountries.com/v3.1',
    WEATHER_API_KEY: 'YOUR_API_KEY_HERE', // Replace with your OpenWeatherMap key OR leave as-is
    WEATHER_BASE: 'https://api.openweathermap.org/data/2.5'
};

/**
 * Fetch country data from Rest Countries API
 * @param {string} name - Country name to search
 * @param {AbortSignal} signal - Abort controller signal
 * @returns {Promise<Array>} Country data
 */
export async function fetchCountry(name, signal) {
    const url = `${API_CONFIG.COUNTRIES_BASE}/name/${encodeURIComponent(name)}?fields=name,flags,capital,population,region,languages,currencies`;
    
    console.log('🌐 Countries API:', url);
    
    const response = await fetch(url, { 
        signal, 
        headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Country not found`);
    }
    
    const data = await response.json();
    console.log('✅ Country found:', data[0]?.name?.common);
    return data;
}

/**
 * Fetch weather data for a city (Optional - graceful fallback)
 * @param {string} city - Capital city name
 * @param {AbortSignal} signal - Abort controller signal
 * @returns {Promise<Object|null>} Weather data or null
 */
export async function fetchWeather(city, signal) {
    // Skip if no API key
    if (!API_CONFIG.WEATHER_API_KEY || API_CONFIG.WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        console.log('⏭️ Skipping weather (no API key)');
        return null;
    }
    
    const url = `${API_CONFIG.WEATHER_BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_CONFIG.WEATHER_API_KEY}&units=metric`;
    
    console.log('🌤️ Weather API:', url);
    
    try {
        const response = await fetch(url, { signal });
        if (!response.ok) {
            console.warn(`Weather unavailable for ${city}: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.warn('Weather fetch failed:', error.message);
        return null;
    }
}

/**
 * Search country + weather in parallel
 * @param {string} countryName - Country to search
 * @param {AbortController} controller - Timeout controller
 * @returns {Promise<{country: Object, weather: Object|null}>}
 */
export async function searchCountryFull(countryName, controller) {
    const [countries, weatherPromise] = await Promise.allSettled([
        fetchCountry(countryName, controller.signal),
        (async () => {
            if (countries?.length > 0) {
                const capital = countries[0].capital?.[0];
                return capital ? fetchWeather(capital, controller.signal) : null;
            }
            return null;
        })()
    ]);

    if (countries.status === 'rejected' || !countries.value?.length) {
        throw new Error('No country found');
    }

    const weatherResult = await weatherPromise;
    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;

    return {
        country: countries.value[0],
        weather: weather
    };
}

// Export for direct use
export default {
    fetchCountry,
    fetchWeather,
    searchCountryFull
};