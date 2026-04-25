const demoVideoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const mockCatalog = [
  {
    id: 9001,
    media_type: 'movie',
    title: 'Midnight Runway',
    release_date: '2024-11-08',
    genre_ids: [28, 53],
    vote_average: 8.4,
    runtime: 118,
    overview:
      'A retired getaway driver is pulled into one last cross-country escape after a covert ledger puts an entire city in danger.',
    backdropUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=900&q=80',
    trailerKey: 'dQw4w9WgXcQ',
    demoVideoUrl,
    cast: [{ name: 'Elena Cruz' }, { name: 'Marcus Vale' }, { name: 'Tariq Stone' }],
    genresDetailed: [{ id: 28, name: 'Action' }, { id: 53, name: 'Thriller' }],
  },
  {
    id: 9002,
    media_type: 'tv',
    title: 'Harbor 9',
    first_air_date: '2025-02-14',
    genre_ids: [18, 80],
    vote_average: 8.8,
    runtime: 52,
    overview:
      'Inside a storm-battered port city, a rookie investigator uncovers a smuggling ring tied to the people sworn to protect it.',
    backdropUrl:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80',
    trailerKey: 'ysz5S6PUM-U',
    demoVideoUrl,
    cast: [{ name: 'Nina Hart' }, { name: 'David Saye' }, { name: 'Riko Ames' }],
    genresDetailed: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
    seasons: [
      {
        season_number: 1,
        episodes: [
          { id: 91001, name: 'Low Tide', overview: 'A missing cargo manifest starts a chain reaction.', still_path: '' },
          { id: 91002, name: 'Night Shift', overview: 'An informant disappears before making contact.', still_path: '' },
        ],
      },
      {
        season_number: 2,
        episodes: [
          { id: 92001, name: 'Signal Fire', overview: 'A coded broadcast points to a new conspiracy.', still_path: '' },
        ],
      },
    ],
  },
  {
    id: 9003,
    media_type: 'movie',
    title: 'Paper Moons',
    release_date: '2023-09-21',
    genre_ids: [10749, 18],
    vote_average: 7.9,
    runtime: 106,
    overview:
      'Two rival journalists fake an engagement for a career-making story and discover that their best lies sound a lot like the truth.',
    backdropUrl:
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1600&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    trailerKey: 'aqz-KE-bpKQ',
    demoVideoUrl,
    cast: [{ name: 'Mia Lorca' }, { name: 'Aiden Cole' }],
    genresDetailed: [{ id: 10749, name: 'Romance' }, { id: 18, name: 'Drama' }],
  },
  {
    id: 9004,
    media_type: 'movie',
    title: 'Zero Signal',
    release_date: '2025-01-17',
    genre_ids: [878, 53],
    vote_average: 8.1,
    runtime: 124,
    overview:
      'When satellites go dark across the world, a small repair crew becomes humanity’s last line between silence and collapse.',
    backdropUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
    trailerKey: '21X5lGlDOfg',
    demoVideoUrl,
    cast: [{ name: 'Leah Stone' }, { name: 'Noah Pierce' }],
    genresDetailed: [{ id: 878, name: 'Sci-Fi' }, { id: 53, name: 'Thriller' }],
  },
  {
    id: 9005,
    media_type: 'tv',
    title: 'Laugh Track',
    first_air_date: '2024-06-02',
    genre_ids: [35],
    vote_average: 7.6,
    runtime: 28,
    overview:
      'A washed-up sitcom writer starts over at a chaotic community radio station where every live show becomes a small disaster.',
    backdropUrl:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    trailerKey: 'M7lc1UVf-VE',
    demoVideoUrl,
    cast: [{ name: 'Jules Ortega' }, { name: 'Priya Dean' }],
    genresDetailed: [{ id: 35, name: 'Comedy' }],
    seasons: [
      {
        season_number: 1,
        episodes: [
          { id: 95001, name: 'Dead Air', overview: 'The new host starts with a broadcast blackout.', still_path: '' },
        ],
      },
    ],
  },
  {
    id: 9006,
    media_type: 'movie',
    title: 'Ashes of Autumn',
    release_date: '2022-10-28',
    genre_ids: [27],
    vote_average: 7.4,
    runtime: 101,
    overview:
      'A remote mountain town prepares for winter while a string of eerie sightings suggests something ancient has returned.',
    backdropUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=900&q=80',
    trailerKey: 'ScMzIvxBSi4',
    demoVideoUrl,
    cast: [{ name: 'Kara Wynn' }, { name: 'Milo Hart' }],
    genresDetailed: [{ id: 27, name: 'Horror' }],
  },
  {
    id: 9007,
    media_type: 'movie',
    title: 'Quiet Revolution',
    release_date: '2024-04-19',
    genre_ids: [99],
    vote_average: 8.9,
    runtime: 95,
    overview:
      'An intimate documentary following three neighborhoods that transformed abandoned blocks into thriving public spaces.',
    backdropUrl:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    trailerKey: 'ysz5S6PUM-U',
    demoVideoUrl,
    cast: [{ name: 'Ava Greene' }],
    genresDetailed: [{ id: 99, name: 'Documentary' }],
  },
  {
    id: 9008,
    media_type: 'tv',
    title: 'Skyline FC',
    first_air_date: '2025-03-09',
    genre_ids: [18, 10759],
    vote_average: 8.2,
    runtime: 47,
    overview:
      'A second-division football club with no budget and too much pride tries to rebuild around a controversial new manager.',
    backdropUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80',
    trailerKey: 'aqz-KE-bpKQ',
    demoVideoUrl,
    cast: [{ name: 'Theo Lane' }, { name: 'Imani Brooks' }],
    genresDetailed: [{ id: 18, name: 'Drama' }, { id: 10759, name: 'Action & Adventure' }],
    seasons: [
      {
        season_number: 1,
        episodes: [
          { id: 98001, name: 'Kickoff', overview: 'A struggling club gambles on a risky appointment.', still_path: '' },
        ],
      },
    ],
  },
];

const mockRowMap = {
  trending: [9002, 9001, 9004, 9003, 9008, 9005],
  popular: [9001, 9004, 9008, 9003, 9006, 9007],
  'top-rated': [9007, 9002, 9001, 9008, 9004, 9003],
  action: [9001, 9004, 9008],
  comedy: [9005],
  scifi: [9004],
  docs: [9007],
  romance: [9003],
  horror: [9006],
  anime: [],
  originals: [9002, 9005, 9008],
};

export { mockCatalog, mockRowMap };
