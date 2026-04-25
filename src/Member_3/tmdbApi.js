import { mockCatalog, mockRowMap } from './mockCatalog';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const API_KEY_ERROR = 'Missing VITE_TMDB_API_KEY. Add it to your environment to load TMDB content.';
const AUTH_ERROR =
  'TMDB authentication failed. Set VITE_TMDB_ACCESS_TOKEN or use a valid VITE_TMDB_API_KEY.';

const genreMap = {
  12: 'Adventure',
  16: 'Animation',
  18: 'Drama',
  27: 'Horror',
  28: 'Action',
  35: 'Comedy',
  36: 'History',
  53: 'Thriller',
  80: 'Crime',
  99: 'Documentary',
  878: 'Sci-Fi',
  9648: 'Mystery',
  10402: 'Music',
  10749: 'Romance',
  10751: 'Family',
  10752: 'War',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10765: 'Sci-Fi & Fantasy',
  10768: 'War & Politics',
  10770: 'TV Movie',
};

function matchesGenres(item, genreFilter) {
  if (!genreFilter) {
    return true;
  }

  const requiredGenres = genreFilter
    .split(',')
    .map((value) => Number(value.trim()))
    .filter(Boolean);

  if (requiredGenres.length === 0) {
    return true;
  }

  return requiredGenres.some((genreId) => item.genre_ids?.includes(genreId));
}

function fallbackSearch(query = '', mediaType = 'all') {
  const normalizedQuery = query.trim().toLowerCase();

  return mockCatalog.filter((item) => {
    if (mediaType !== 'all' && item.media_type !== mediaType) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [item.title, item.overview]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

function fallbackDiscover(params = {}) {
  return mockCatalog.filter((item) => {
    if (params.with_genres && !matchesGenres(item, params.with_genres)) {
      return false;
    }

    if (params.with_networks === '213') {
      return item.media_type === 'tv';
    }

    return true;
  });
}

function fallbackResponse(path, params = {}) {
  if (path.startsWith('/search/')) {
    const mediaType = path === '/search/movie' ? 'movie' : path === '/search/tv' ? 'tv' : 'all';
    return {
      results: path === '/search/person'
        ? []
        : fallbackSearch(params.query, mediaType),
    };
  }

  if (path === '/discover/movie' || path === '/discover/tv') {
    return {
      results: fallbackDiscover(params).filter((item) =>
        path === '/discover/tv' ? item.media_type === 'tv' : item.media_type === 'movie'
      ),
    };
  }

  if (path === '/trending/all/week') {
    return {
      results: (mockRowMap.trending || [])
        .map((id) => mockCatalog.find((item) => item.id === id))
        .filter(Boolean),
    };
  }

  if (path === '/movie/popular') {
    return {
      results: fallbackDiscover().filter((item) => item.media_type === 'movie'),
    };
  }

  if (path === '/movie/top_rated') {
    return {
      results: [...fallbackDiscover().filter((item) => item.media_type === 'movie')].sort(
        (left, right) => (right.vote_average || 0) - (left.vote_average || 0)
      ),
    };
  }

  return { results: [] };
}

export function getImageUrl(path, size = 'w780') {
  if (!path) {
    return 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80';
  }

  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function formatRuntime(runtime) {
  if (!runtime) {
    return '1h 45m';
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours}h ${minutes}m`;
}

export function getGenreNames(genreIds = []) {
  return genreIds.map((id) => genreMap[id]).filter(Boolean);
}

export function getTrailerKey(videos = []) {
  const trailer = videos.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer'
  );

  return trailer?.key || videos[0]?.key || '';
}

export async function tmdbFetch(path, params = {}) {
  if (!API_KEY && !ACCESS_TOKEN) {
    return fallbackResponse(path, params);
  }

  const url = new URL(`${BASE_URL}${path}`);
  if (API_KEY && !ACCESS_TOKEN) {
    url.searchParams.set('api_key', API_KEY);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  let response;

  try {
    response = await fetch(url.toString(), {
      headers: {
        accept: 'application/json',
        ...(ACCESS_TOKEN ? { Authorization: `Bearer ${ACCESS_TOKEN}` } : {}),
      },
    });
  } catch {
    return fallbackResponse(path, params);
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(AUTH_ERROR);
  }

  if (!response.ok) {
    return fallbackResponse(path, params);
  }

  return response.json();
}

export function normalizeTitle(item) {
  return {
    ...item,
    media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
    title: item.title || item.name || 'Untitled',
    year: (item.release_date || item.first_air_date || '').slice(0, 4) || '2024',
    genreNames: item.genreNames || getGenreNames(item.genre_ids || []),
    matchScore: item.matchScore || Math.floor(Math.random() * 25) + 75,
    runtimeLabel:
      item.runtimeLabel || formatRuntime(item.runtime || item.episode_run_time?.[0] || 105),
    backdropUrl:
      item.backdropUrl || getImageUrl(item.backdrop_path || item.poster_path, 'w1280'),
    posterUrl: item.posterUrl || getImageUrl(item.poster_path || item.backdrop_path, 'w500'),
  };
}

export async function fetchDetails(id, mediaType = 'movie') {
  const localMatch = mockCatalog.find(
    (item) => String(item.id) === String(id) && item.media_type === mediaType
  );

  if (localMatch) {
    return normalizeTitle({
      ...localMatch,
      videos: localMatch.trailerKey
        ? [{ key: localMatch.trailerKey, site: 'YouTube', type: 'Trailer' }]
        : [],
      similar: mockCatalog
        .filter((item) => item.id !== localMatch.id && item.genre_ids.some((genreId) => localMatch.genre_ids.includes(genreId)))
        .slice(0, 6)
        .map(normalizeTitle),
      number_of_seasons: localMatch.seasons?.length || 0,
      images: { logos: [] },
    });
  }

  const data = await tmdbFetch(`/${mediaType}/${id}`, {
    append_to_response: 'videos,credits,images,similar',
  });

  return normalizeTitle({
    ...data,
    logoPath: data.images?.logos?.[0]?.file_path
      ? getImageUrl(data.images.logos[0].file_path, 'w500')
      : '',
    videos: data.videos?.results || [],
    cast: data.credits?.cast || [],
    similar: (data.similar?.results || []).map(normalizeTitle),
    genresDetailed: data.genres || [],
    runtime: data.runtime || data.episode_run_time?.[0] || 105,
    overview: data.overview,
    seasons: data.seasons || [],
    number_of_seasons: data.number_of_seasons || 0,
  });
}

export async function fetchSeasonEpisodes(showId, seasonNumber) {
  const localShow = mockCatalog.find(
    (item) => String(item.id) === String(showId) && item.media_type === 'tv'
  );

  if (localShow) {
    const season =
      localShow.seasons?.find((entry) => entry.season_number === Number(seasonNumber)) || {};
    return {
      episodes: season.episodes || [],
    };
  }

  return tmdbFetch(`/tv/${showId}/season/${seasonNumber}`);
}

export { genreMap };
export { API_KEY_ERROR };
export { AUTH_ERROR };
