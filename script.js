const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzOTgxNWVjZTI4ZjcyNWJlZGRmY2Y3OGE0YzRjZGU0ZiIsIm5iZiI6MTc2MDQ1NjUxNS4xNDcsInN1YiI6IjY4ZWU2ZjQzNDYzMzQ0Yjg0MTlkZjQ3MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ejdXz4pm0dZn0OAVJvJ16R8SwNAa-MBkO_yttUiblLk';
const BASE_URL = 'https://api.themoviedb.org/3';
// Endpoint específico para "Tendencias - Hoy"
const TRENDING_URL = `${BASE_URL}/trending/movie/day?language=es-ES`;
const SEARCH_URL = `${BASE_URL}/search/multi?language=es-ES`;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const IMAGE_URL_ORIGINAL = 'https://image.tmdb.org/t/p/original';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/500x750?text=Sin+Imagen';
const PLACEHOLDER_PROFILE = 'https://via.placeholder.com/140x175?text=Sin+Foto';

const container = document.getElementById('trending-container');
const searchResultsContainer = document.getElementById('search-results-container');
const searchResultsSection = document.getElementById('search-results-section');
const trendingSection = document.getElementById('trending-section');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('detail-modal');
const detailContainer = document.getElementById('detail-container');
const closeModal = document.querySelector('.close-modal');

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
        const { id, title, poster_path, vote_average, release_date } = movie;
        
        // Calcular porcentaje (e.g. 7.6 -> 76)
        const percent = Math.round(vote_average * 10);
        
        // Color del borde según puntuación (Lógica BI simple)
        let borderColor = '#21d07a'; // Verde
        if(percent < 70) borderColor = '#d2d531'; // Amarillo
        if(percent < 40) borderColor = '#db2360'; // Rojo

        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = id;
        card.dataset.mediaType = 'movie';
        
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

        // Agregar evento click para mostrar detalles
        card.addEventListener('click', () => showDetail(id, 'movie'));

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
        const id = item.id;
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
        card.dataset.id = id;
        card.dataset.mediaType = media_type;
        
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
        
        // Agregar evento click para mostrar detalles
        card.addEventListener('click', () => showDetail(id, media_type));
        
        searchResultsContainer.appendChild(card);
    });
    
    // Mostrar resultados y ocultar tendencias
    searchResultsSection.style.display = 'block';
    trendingSection.style.display = 'none';
}

// Mostrar detalles de película o serie
async function showDetail(id, mediaType) {
    try {
        // Obtener detalles y créditos en paralelo
        const [detailRes, creditsRes] = await Promise.all([
            fetch(`${BASE_URL}/${mediaType}/${id}?language=es-ES`, options),
            fetch(`${BASE_URL}/${mediaType}/${id}/credits?language=es-ES`, options)
        ]);
        
        const detail = await detailRes.json();
        const credits = await creditsRes.json();
        
        renderDetail(detail, credits, mediaType);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Evitar scroll del body
    } catch (error) {
        console.error('Error al obtener detalles:', error);
    }
}

// Renderizar contenido del modal
function renderDetail(detail, credits, mediaType) {
    const title = detail.title || detail.name;
    const releaseDate = detail.release_date || detail.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
    const genres = detail.genres ? detail.genres.map(g => g.name).join(', ') : '';
    const runtime = detail.runtime || (detail.episode_run_time && detail.episode_run_time[0]) || 0;
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    const runtimeStr = runtime ? `${hours}h ${minutes}m` : '';
    const percent = Math.round((detail.vote_average || 0) * 10);
    const posterUrl = detail.poster_path ? IMAGE_URL + detail.poster_path : PLACEHOLDER_IMAGE;
    const backdropUrl = detail.backdrop_path ? IMAGE_URL_ORIGINAL + detail.backdrop_path : '';
    
    // Color del rating
    let ratingColor = '#21d07a';
    if (percent < 70) ratingColor = '#d2d531';
    if (percent < 40) ratingColor = '#db2360';
    
    // Obtener director/creador
    let creators = [];
    if (mediaType === 'movie') {
        creators = credits.crew ? credits.crew.filter(c => c.job === 'Director').slice(0, 3) : [];
    } else {
        creators = detail.created_by ? detail.created_by.slice(0, 3) : [];
    }
    
    // Obtener escritores principales
    const writers = credits.crew ? credits.crew.filter(c => c.job === 'Writer' || c.job === 'Screenplay').slice(0, 2) : [];
    
    // Combinar crew para mostrar
    const crewToShow = [...creators.map(c => ({ name: c.name, job: mediaType === 'movie' ? 'Director' : 'Creador' })), 
                        ...writers.map(w => ({ name: w.name, job: w.job }))];
    
    // Formatear fecha
    let dateStr = '';
    if (releaseDate) {
        const dateObj = new Date(releaseDate);
        dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    
    // Obtener reparto principal (primeros 10)
    const cast = credits.cast ? credits.cast.slice(0, 10) : [];
    
    detailContainer.innerHTML = `
        <div class="detail-header" style="background-image: url('${backdropUrl}');">
            <img src="${posterUrl}" alt="${title}" class="detail-poster">
            <div class="detail-info">
                <h1 class="detail-title">${title} ${year ? `<span>(${year})</span>` : ''}</h1>
                <div class="detail-meta">
                    ${dateStr ? `<span>${dateStr} (ES)</span>` : ''}
                    ${genres ? `<span class="genres">${genres}</span>` : ''}
                    ${runtimeStr ? `<span>${runtimeStr}</span>` : ''}
                </div>
                <div class="detail-rating">
                    <div class="rating-circle" style="border-color: ${ratingColor}">
                        ${percent}<sup>%</sup>
                    </div>
                    <span class="rating-label">Puntuación<br>de usuarios</span>
                </div>
                ${detail.tagline ? `<p class="detail-tagline">${detail.tagline}</p>` : ''}
                <div class="detail-overview">
                    <h3>Vista general</h3>
                    <p>${detail.overview || 'Sin descripción disponible.'}</p>
                </div>
                ${crewToShow.length > 0 ? `
                <div class="detail-crew">
                    ${crewToShow.map(c => `
                        <div class="crew-member">
                            <h4>${c.name}</h4>
                            <p>${c.job}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        </div>
        ${cast.length > 0 ? `
        <div class="detail-cast-section">
            <h3>Reparto principal</h3>
            <div class="cast-scroller">
                ${cast.map(actor => `
                    <div class="cast-card">
                        <img src="${actor.profile_path ? IMAGE_URL + actor.profile_path : PLACEHOLDER_PROFILE}" alt="${actor.name}">
                        <div class="cast-info">
                            <p class="cast-name">${actor.name}</p>
                            <p class="cast-character">${actor.character || ''}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
}

// Cerrar modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Cerrar modal al hacer clic fuera del contenido
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});