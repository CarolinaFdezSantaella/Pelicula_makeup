const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzOTgxNWVjZTI4ZjcyNWJlZGRmY2Y3OGE0YzRjZGU0ZiIsIm5iZiI6MTc2MDQ1NjUxNS4xNDcsInN1YiI6IjY4ZWU2ZjQzNDYzMzQ0Yjg0MTlkZjQ3MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ejdXz4pm0dZn0OAVJvJ16R8SwNAa-MBkO_yttUiblLk';
const BASE_URL = 'https://api.themoviedb.org/3';
// Endpoint específico para "Tendencias - Hoy"
const TRENDING_URL = `${BASE_URL}/trending/movie/day?language=es-ES`;
const SEARCH_URL = `${BASE_URL}/search/multi?language=es-ES`;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/500x750?text=Sin+Imagen';

const container = document.getElementById('trending-container');
const searchResultsContainer = document.getElementById('search-results-container');
const searchResultsSection = document.getElementById('search-results-section');
const trendingSection = document.getElementById('trending-section');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
};

async function getTrendingMovies() {
    try {
        const res = await fetch(TRENDING_URL, options);
        const data = await res.json();
        showMovies(data.results);
    } catch (error) {
        console.error('Error:', error);
    }
}

function showMovies(movies) {
    container.innerHTML = '';
    movies.forEach(movie => {
        const { title, poster_path, vote_average, release_date } = movie;
        
        // Calcular porcentaje (e.g. 7.6 -> 76)
        const percent = Math.round(vote_average * 10);
        
        // Color del borde según puntuación (Lógica BI simple)
        let borderColor = '#21d07a'; // Verde
        if(percent < 70) borderColor = '#d2d531'; // Amarillo
        if(percent < 40) borderColor = '#db2360'; // Rojo

        const card = document.createElement('div');
        card.classList.add('card');
        
        // Formatear fecha (e.g. "21 nov 2025")
        const dateObj = new Date(release_date);
        const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

        card.innerHTML = `
            <div class="image-content">
                <img src="${IMAGE_URL + poster_path}" alt="${title}">
                <div class="options-icon"><i class="fas fa-ellipsis-h"></i></div>
            </div>
            <div class="percent-circle" style="border-color: ${borderColor}">
                ${percent}<sup>%</sup>
            </div>
            <div class="card-content">
                <h2>${title}</h2>
                <p>${dateStr}</p>
            </div>
        `;

        container.appendChild(card);
    });
}

// Iniciar
getTrendingMovies();

// Manejar búsqueda
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        await searchMulti(query);
    }
});

// Buscar películas y series
async function searchMulti(query) {
    try {
        const res = await fetch(`${SEARCH_URL}&query=${encodeURIComponent(query)}`, options);
        const data = await res.json();
        showSearchResults(data.results);
    } catch (error) {
        console.error('Error en búsqueda:', error);
    }
}

// Mostrar resultados de búsqueda
function showSearchResults(results) {
    // Filtrar solo películas y series
    const filteredResults = results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
    
    if (filteredResults.length === 0) {
        searchResultsContainer.innerHTML = '<p class="no-results">No se encontraron resultados.</p>';
        searchResultsSection.style.display = 'block';
        trendingSection.style.display = 'none';
        return;
    }
    
    searchResultsContainer.innerHTML = '';
    
    filteredResults.forEach(item => {
        const title = item.title || item.name; // Películas usan title, series usan name
        const poster_path = item.poster_path;
        const vote_average = item.vote_average || 0;
        const release_date = item.release_date || item.first_air_date; // Películas vs series
        const media_type = item.media_type;
        
        // Si no hay póster, usar imagen placeholder
        const posterUrl = poster_path 
            ? IMAGE_URL + poster_path 
            : PLACEHOLDER_IMAGE;
        
        // Calcular porcentaje
        const percent = Math.round(vote_average * 10);
        
        // Color del borde según puntuación
        let borderColor = '#21d07a'; // Verde
        if (percent < 70) borderColor = '#d2d531'; // Amarillo
        if (percent < 40) borderColor = '#db2360'; // Rojo
        
        const card = document.createElement('div');
        card.classList.add('card');
        
        // Formatear fecha
        let dateStr = 'Sin fecha';
        if (release_date) {
            const dateObj = new Date(release_date);
            if (!isNaN(dateObj.getTime())) {
                dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
            }
        }
        
        // Etiqueta de tipo (Película o Serie)
        const typeLabel = media_type === 'movie' ? 'Película' : 'Serie';
        
        card.innerHTML = `
            <div class="image-content">
                <img src="${posterUrl}" alt="${title}">
                <div class="options-icon"><i class="fas fa-ellipsis-h"></i></div>
                <span class="media-type-badge ${media_type}">${typeLabel}</span>
            </div>
            <div class="percent-circle" style="border-color: ${borderColor}">
                ${percent}<sup>%</sup>
            </div>
            <div class="card-content">
                <h2>${title}</h2>
                <p>${dateStr}</p>
            </div>
        `;
        
        searchResultsContainer.appendChild(card);
    });
    
    // Mostrar resultados y ocultar tendencias
    searchResultsSection.style.display = 'block';
    trendingSection.style.display = 'none';
}