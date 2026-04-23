const API_KEY  = import.meta.env.VITE_TMDB_API_KEY || '6ca7ff195a767bccd736e3711ea79d2b';
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
export const IMG_BASE   = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

/** Build a full image URL */
export const imgUrl = (path, size = 'w500') =>
  path ? `${IMG_BASE}/${size}${path}` : null;

/** Core fetch wrapper */
async function apiFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${res.statusText}`);
  return res.json();
}

// ── Search endpoints ──────────────────────────────────────────────────────────
export const searchMulti   = (query, page = 1) => apiFetch('/search/multi',   { query, page });
export const searchMovies  = (query, page = 1) => apiFetch('/search/movie',   { query, page });
export const searchTV      = (query, page = 1) => apiFetch('/search/tv',      { query, page });
export const searchPeople  = (query, page = 1) => apiFetch('/search/person',  { query, page });

// ── Detail endpoints ──────────────────────────────────────────────────────────
export const getMovieDetail  = (id) => apiFetch(`/movie/${id}`,  { append_to_response: 'videos,credits,similar' });
export const getTVDetail     = (id) => apiFetch(`/tv/${id}`,     { append_to_response: 'videos,credits,similar' });
export const getPersonDetail = (id) => apiFetch(`/person/${id}`, { append_to_response: 'combined_credits' });

// ── TV Seasons / Episodes ─────────────────────────────────────────────────────
export const getTVSeason = (tvId, seasonNum) => apiFetch(`/tv/${tvId}/season/${seasonNum}`);

// ── Trending / Popular ────────────────────────────────────────────────────────
export const getTrending = (timeWindow = 'week') => apiFetch(`/trending/all/${timeWindow}`);
export const getTrendingMovies = (timeWindow = 'week') => apiFetch(`/trending/movie/${timeWindow}`);
export const getTrendingTV = (timeWindow = 'week') => apiFetch(`/trending/tv/${timeWindow}`);
export const getPopularMovies = () => apiFetch('/movie/popular');
export const getPopularTV = () => apiFetch('/tv/popular');
export const getTopRatedMovies = () => apiFetch('/movie/top_rated');
export const getTopRatedTV = () => apiFetch('/tv/top_rated');
export const getUpcomingMovies = () => apiFetch('/movie/upcoming');
export const getAiringTodayTV = () => apiFetch('/tv/airing_today');
export const getNetflixOriginals = () => apiFetch('/discover/tv', { with_networks: 213 });
export const getActionMovies = () => apiFetch('/discover/movie', { with_genres: 28, sort_by: 'popularity.desc' });
export const getComedyMovies = () => apiFetch('/discover/movie', { with_genres: 35, sort_by: 'popularity.desc' });
