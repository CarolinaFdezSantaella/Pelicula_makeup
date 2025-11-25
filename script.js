// Configuración de la API de TMDB
// NOTA: Para usar la API real, necesitas configurar tu API key
// En producción, usa un backend proxy para proteger la API key
const API_KEY = 'TU_API_KEY_AQUI'; // Placeholder - configurar en producción con backend proxy
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Función para escapar HTML y prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Datos de ejemplo para demostración (cuando no hay API key configurada)
const DEMO_MOVIES = [
    {
        id: 1,
        title: 'El Padrino',
        poster_path: null,
        vote_average: 9.2,
        release_date: '1972-03-14',
        overview: 'Don Vito Corleone es el respetado y temido jefe de una de las cinco familias de la mafia de Nueva York. Tiene cuatro hijos y un ahijado que lidera las operaciones de la familia.'
    },
    {
        id: 2,
        title: 'Cadena Perpetua',
        poster_path: null,
        vote_average: 9.3,
        release_date: '1994-09-23',
        overview: 'Andy Dufresne es un joven y exitoso banquero cuya vida cambia radicalmente cuando es condenado por un crimen que no cometió.'
    },
    {
        id: 3,
        title: 'El Caballero Oscuro',
        poster_path: null,
        vote_average: 9.0,
        release_date: '2008-07-18',
        overview: 'Batman se enfrenta a su mayor desafío hasta la fecha cuando el misterioso Joker siembra el caos entre los ciudadanos de Gotham.'
    },
    {
        id: 4,
        title: 'Pulp Fiction',
        poster_path: null,
        vote_average: 8.9,
        release_date: '1994-10-14',
        overview: 'Las vidas de dos mafiosos, un boxeador, una pareja de bandidos y un par de asesinos a sueldo se entrelazan en cuatro historias de violencia y redención.'
    },
    {
        id: 5,
        title: 'Forrest Gump',
        poster_path: null,
        vote_average: 8.8,
        release_date: '1994-07-06',
        overview: 'La historia de Forrest Gump, un hombre con un coeficiente intelectual bajo pero con un gran corazón, y su extraordinario viaje a través de la historia de Estados Unidos.'
    },
    {
        id: 6,
        title: 'Origen',
        poster_path: null,
        vote_average: 8.8,
        release_date: '2010-07-16',
        overview: 'Dom Cobb es un ladrón experto en el arte de la extracción: robar secretos valiosos del subconsciente durante el sueño.'
    },
    {
        id: 7,
        title: 'Matrix',
        poster_path: null,
        vote_average: 8.7,
        release_date: '1999-03-31',
        overview: 'Un programador de computadoras descubre que la realidad tal como la conocemos es una simulación creada por máquinas inteligentes.'
    },
    {
        id: 8,
        title: 'Interestelar',
        poster_path: null,
        vote_average: 8.6,
        release_date: '2014-11-07',
        overview: 'Un grupo de exploradores espaciales viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.'
    }
];

const DEMO_UPCOMING = [
    {
        id: 101,
        title: 'Avatar 3',
        poster_path: null,
        vote_average: 0,
        release_date: '2025-12-19',
        overview: 'La tercera entrega de la saga Avatar promete llevarnos a nuevos territorios de Pandora.'
    },
    {
        id: 102,
        title: 'Misión Imposible 8',
        poster_path: null,
        vote_average: 0,
        release_date: '2025-05-23',
        overview: 'Ethan Hunt regresa para una nueva misión imposible que pondrá a prueba todos sus límites.'
    },
    {
        id: 103,
        title: 'Jurassic World 4',
        poster_path: null,
        vote_average: 0,
        release_date: '2025-07-02',
        overview: 'Los dinosaurios vuelven a conquistar la gran pantalla en una nueva aventura prehistórica.'
    },
    {
        id: 104,
        title: 'Spider-Man: Nuevo Capítulo',
        poster_path: null,
        vote_average: 0,
        release_date: '2025-12-25',
        overview: 'Peter Parker enfrenta nuevos desafíos en su vida como el héroe arácnido de Nueva York.'
    }
];

// Estado de la aplicación
let favorites = JSON.parse(localStorage.getItem('movieFavorites')) || [];

// Elementos del DOM
const movieGrid = document.getElementById('movieGrid');
const upcomingGrid = document.getElementById('upcomingGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const modal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadPopularMovies();
    loadUpcomingMovies();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
}

// Cargar películas populares
async function loadPopularMovies() {
    showLoading(movieGrid);
    
    if (API_KEY === 'TU_API_KEY_AQUI') {
        // Usar datos de demostración
        displayMovies(DEMO_MOVIES, movieGrid);
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`);
        const data = await response.json();
        displayMovies(data.results, movieGrid);
    } catch (error) {
        console.error('Error al cargar películas populares:', error);
        displayMovies(DEMO_MOVIES, movieGrid);
    }
}

// Cargar próximos estrenos
async function loadUpcomingMovies() {
    showLoading(upcomingGrid);
    
    if (API_KEY === 'TU_API_KEY_AQUI') {
        // Usar datos de demostración
        displayMovies(DEMO_UPCOMING, upcomingGrid);
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=es-ES&page=1`);
        const data = await response.json();
        displayMovies(data.results.slice(0, 8), upcomingGrid);
    } catch (error) {
        console.error('Error al cargar próximos estrenos:', error);
        displayMovies(DEMO_UPCOMING, upcomingGrid);
    }
}

// Manejar búsqueda
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    showLoading(movieGrid);
    
    if (API_KEY === 'TU_API_KEY_AQUI') {
        // Filtrar datos de demostración
        const filtered = DEMO_MOVIES.filter(movie => 
            movie.title.toLowerCase().includes(query.toLowerCase())
        );
        if (filtered.length > 0) {
            displayMovies(filtered, movieGrid);
        } else {
            showNoResults(movieGrid, query);
        }
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=1`);
        const data = await response.json();
        
        if (data.results.length > 0) {
            displayMovies(data.results, movieGrid);
        } else {
            showNoResults(movieGrid, query);
        }
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        showNoResults(movieGrid, query);
    }
}

// Mostrar películas en la cuadrícula
function displayMovies(movies, container) {
    container.innerHTML = '';
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        container.appendChild(card);
    });
}

// Crear tarjeta de película
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const safeTitle = escapeHtml(movie.title);
    const posterUrl = movie.poster_path 
        ? `${IMG_BASE_URL}${movie.poster_path}` 
        : createPlaceholderImage(movie.title);
    
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    // Crear elementos de forma segura
    const img = document.createElement('img');
    img.src = posterUrl;
    img.alt = movie.title;
    img.onerror = function() { this.src = createPlaceholderImage(movie.title); };
    
    const movieInfo = document.createElement('div');
    movieInfo.className = 'movie-info';
    
    const h4 = document.createElement('h4');
    h4.textContent = movie.title;
    
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'rating';
    ratingDiv.innerHTML = `⭐ ${rating} <span>/ 10</span>`;
    
    const yearP = document.createElement('p');
    yearP.className = 'year';
    yearP.textContent = year;
    
    movieInfo.appendChild(h4);
    movieInfo.appendChild(ratingDiv);
    movieInfo.appendChild(yearP);
    
    card.appendChild(img);
    card.appendChild(movieInfo);
    
    card.addEventListener('click', () => showMovieDetails(movie));
    return card;
}

// Crear imagen placeholder con SVG
function createPlaceholderImage(title) {
    const safeTitle = title || '';
    const initials = safeTitle.split(' ')
        .filter(word => word && word.length > 0)
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'NA';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
            <rect width="500" height="750" fill="#1a1a2e"/>
            <text x="250" y="375" font-family="Arial" font-size="120" fill="#e50914" text-anchor="middle" dominant-baseline="middle">${initials}</text>
            <text x="250" y="480" font-family="Arial" font-size="24" fill="#666" text-anchor="middle">Sin imagen</text>
        </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Mostrar detalles de la película
async function showMovieDetails(movie) {
    let movieDetails = movie;
    
    // Intentar obtener más detalles si hay API key
    if (API_KEY !== 'TU_API_KEY_AQUI') {
        try {
            const response = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=es-ES`);
            movieDetails = await response.json();
        } catch (error) {
            console.error('Error al obtener detalles:', error);
        }
    }
    
    const posterUrl = movieDetails.poster_path 
        ? `${IMG_BASE_URL}${movieDetails.poster_path}` 
        : createPlaceholderImage(movieDetails.title);
    
    const year = movieDetails.release_date ? movieDetails.release_date.split('-')[0] : 'N/A';
    const rating = movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A';
    const runtime = movieDetails.runtime ? `${movieDetails.runtime} min` : 'N/A';
    const isFavorite = favorites.includes(movieDetails.id);
    
    // Crear contenido del modal de forma segura (prevenir XSS)
    modalBody.innerHTML = '';
    
    const modalBodyDiv = document.createElement('div');
    modalBodyDiv.className = 'modal-body';
    
    // Poster
    const posterDiv = document.createElement('div');
    posterDiv.className = 'modal-poster';
    const posterImg = document.createElement('img');
    posterImg.src = posterUrl;
    posterImg.alt = movieDetails.title;
    posterImg.onerror = function() { this.src = createPlaceholderImage(movieDetails.title); };
    posterDiv.appendChild(posterImg);
    
    // Detalles
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'modal-details';
    
    const titleH2 = document.createElement('h2');
    titleH2.textContent = movieDetails.title;
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'meta';
    metaDiv.innerHTML = `
        <span>📅 ${escapeHtml(year)}</span>
        <span>⏱️ ${escapeHtml(runtime)}</span>
        <span>⭐ ${escapeHtml(rating)}/10</span>
    `;
    
    const genresDiv = document.createElement('div');
    genresDiv.className = 'genres';
    if (movieDetails.genres && movieDetails.genres.length > 0) {
        movieDetails.genres.forEach(g => {
            const genreSpan = document.createElement('span');
            genreSpan.className = 'genre-tag';
            genreSpan.textContent = g.name;
            genresDiv.appendChild(genreSpan);
        });
    } else {
        const defaultGenre = document.createElement('span');
        defaultGenre.className = 'genre-tag';
        defaultGenre.textContent = 'Drama';
        genresDiv.appendChild(defaultGenre);
    }
    
    const overviewP = document.createElement('p');
    overviewP.className = 'overview';
    overviewP.textContent = movieDetails.overview || 'Sin descripción disponible.';
    
    const favBtn = document.createElement('button');
    favBtn.className = `favorite-btn ${isFavorite ? 'active' : ''}`;
    favBtn.dataset.id = movieDetails.id;
    favBtn.textContent = isFavorite ? '❤️ En Favoritos' : '🤍 Añadir a Favoritos';
    favBtn.addEventListener('click', () => toggleFavorite(movieDetails.id, favBtn));
    
    detailsDiv.appendChild(titleH2);
    detailsDiv.appendChild(metaDiv);
    detailsDiv.appendChild(genresDiv);
    detailsDiv.appendChild(overviewP);
    detailsDiv.appendChild(favBtn);
    
    modalBodyDiv.appendChild(posterDiv);
    modalBodyDiv.appendChild(detailsDiv);
    modalBody.appendChild(modalBodyDiv);
    
    modal.style.display = 'block';
}

// Alternar favorito
function toggleFavorite(movieId, button) {
    const index = favorites.indexOf(movieId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        button.classList.remove('active');
        button.innerHTML = '🤍 Añadir a Favoritos';
    } else {
        favorites.push(movieId);
        button.classList.add('active');
        button.innerHTML = '❤️ En Favoritos';
    }
    
    localStorage.setItem('movieFavorites', JSON.stringify(favorites));
}

// Mostrar loading
function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Cargando películas...</p>
        </div>
    `;
}

// Mostrar mensaje de sin resultados
function showNoResults(container, query) {
    container.innerHTML = '';
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    
    const h4 = document.createElement('h4');
    h4.textContent = 'No se encontraron resultados';
    
    const p = document.createElement('p');
    p.textContent = `No hay películas que coincidan con "${query}"`;
    
    noResults.appendChild(h4);
    noResults.appendChild(p);
    container.appendChild(noResults);
}

// Navegación suave (respeta preferencia de movimiento reducido)
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const section = document.querySelector(href);
            if (section) {
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            }
        }
    });
});
