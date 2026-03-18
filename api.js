// Get DOM elements
const countryInput = document.getElementById('countryInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const errorDiv = document.getElementById('error');
const countryCard = document.getElementById('countryCard');

// Add event listeners
searchBtn.addEventListener('click', searchCountry);
countryInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchCountry();
    }
});

// Main search function with TIMEOUT
async function searchCountry() {
    const query = countryInput.value.trim();
    
    if (!query) {
        showError('Please enter a country name');
        return;
    }

    hideAll();
    showLoading();

    // TIMEOUT PROTECTION - 5 seconds max
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const countries = await fetchCountry(query, controller.signal);
        clearTimeout(timeoutId);
        
        if (countries.length === 0) {
            throw new Error('No country found');
        }
        
        displayCountry(countries[0]);
        
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error:', error);
        
        if (error.name === 'AbortError') {
            showError('Request timeout. Check internet or try simpler name');
        } else {
            showError(`Error: ${error.message}`);
        }
    }
}

// FIXED API function with better error handling
async function fetchCountry(name, signal) {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,flags,capital,population,region,languages,currencies`;
    
    console.log('🌐 API URL:', url);
    
    const response = await fetch(url, { 
        signal: signal,
        headers: {
            'Accept': 'application/json',
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Success:', data.length, 'results');
    return data;
}

// Display function with integrated save button
function displayCountry(country) {
    const name = country.name.common;
    const flag = country.flags?.png || '';
    const capital = country.capital?.[0] || 'No capital';
    const population = formatPopulation(country.population);
    const region = country.region || 'N/A';
    const languages = getLanguages(country.languages);
    const currencies = getCurrencies(country.currencies);

    countryCard.innerHTML = `
        <img src="${flag}" alt="${name} flag" class="flag" onerror="this.src='https://via.placeholder.com/100x70/4facfe/ffffff?text=🇺🇳'">
        <div class="country-name">${name}</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">🏛️ Capital</div>
                <div class="info-value">${capital}</div>
            </div>
            <div class="info-item">
                <div class="info-label">👥 Population</div>
                <div class="info-value">${population}</div>
            </div>
            <div class="info-item">
                <div class="info-label">🌎 Region</div>
                <div class="info-value">${region}</div>
            </div>
            <div class="info-item">
                <div class="info-label">🗣️ Languages</div>
                <div class="info-value">${languages}</div>
            </div>
            <div class="info-item">
                <div class="info-label">💰 Currency</div>
                <div class="info-value">${currencies}</div>
            </div>
        </div>
        <button class="save-btn" onclick="saveCountry('${name}', '${capital}', '${region}', '${flag}', '${population}')">
            💾 Save Country
        </button>
    `;
    
    result.style.display = 'block';
    countryInput.value = '';
}

// Save country to localStorage
function saveCountry(name, capital, region, flag, population) {
    let saved = JSON.parse(localStorage.getItem("savedCountries")) || [];

    // Prevent duplicates
    if (saved.some(item => item.name === name)) {
        alert("Country already saved!");
        return;
    }

    saved.push({ name, capital, region, flag, population });
    localStorage.setItem("savedCountries", JSON.stringify(saved));
    alert("✅ Saved successfully!");
}

// Helper functions
function formatPopulation(num) {
    if (!num) return 'N/A';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
}

function getLanguages(languages) {
    if (!languages) return 'N/A';
    return Object.values(languages).join(', ');
}

function getCurrencies(currencies) {
    if (!currencies) return 'N/A';
    const currency = Object.values(currencies)[0];
    return currency?.name || 'N/A';
}

// UI functions
function showLoading() {
    loading.style.display = 'block';
}

function hideAll() {
    loading.style.display = 'none';
    result.style.display = 'none';
    errorDiv.style.display = 'none';
}

function showError(message) {
    hideAll();
    errorDiv.innerHTML = `
        <h3>❌ ${message}</h3>
        <button onclick="countryInput.focus(); countryInput.value='United States';">Try "United States"</button>
    `;
    errorDiv.style.display = 'block';
}

// Auto-test on load
window.addEventListener('load', function() {
    console.log('🚀 App loaded!');
    countryInput.focus();
    countryInput.placeholder = 'Try "United States" first...';
});