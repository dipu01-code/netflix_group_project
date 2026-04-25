# Netflix Clone

A React + Vite Netflix-style UI with:

- landing page
- browse page with TMDB-powered rows
- search page
- genre page
- watchlist
- video player page
- fallback mock catalog when TMDB content is unavailable

## Tech Stack

- React 18
- Vite 5
- React Router DOM 6
- CSS modules by feature folder

## Project Structure

```text
src/
  App.jsx
  main.jsx
  index.css
  Member_1/
    LandingPage.jsx
    AuthModal.jsx
  Member_2/
    Navbar.jsx
    HeroBillboard.jsx
    CategoryRow.jsx
    MovieCard.jsx
    GenrePage.jsx
    MyList.jsx
  Member_3/
    SearchPage.jsx
    DetailModal.jsx
    VideoPlayer.jsx
    tmdbApi.js
    mockCatalog.js
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env
```

3. Add your TMDB credentials to `.env`:

```env
VITE_TMDB_API_KEY=your_tmdb_v3_api_key
VITE_TMDB_ACCESS_TOKEN=your_tmdb_v4_read_access_token
```

You can use either:

- `VITE_TMDB_API_KEY`
- `VITE_TMDB_ACCESS_TOKEN`

If both are present, the app can use the bearer token flow.

4. Start the dev server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

6. Preview the production build:

```bash
npm run preview
```

## Routes

- `#/` landing page
- `#/browse` main browse experience
- `#/genre/:genreName` genre listing
- `#/mylist` saved watchlist
- `#/search` title/person search
- `#/watch/:id` player page

## TMDB Notes

- Live content is fetched from TMDB in `src/Member_3/tmdbApi.js`.
- If TMDB is unreachable, some screens can fall back to local mock content.
- If TMDB returns `401` or `403`, check your API key or access token.

## Watchlist

- Watchlist data is stored in `localStorage`.
- The app syncs watchlist updates through a custom `watchlist-updated` browser event.

## Hook Constraint

This project was simplified to rely on:

- `useState`
- `useEffect`

Extra React hooks were intentionally removed from the app code to match the current project requirement.

## Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## Notes

- The UI uses remote images and video sources for demo/fallback content.
- If a live trailer cannot be embedded, the app can fall back to a local demo video flow for mock content.
