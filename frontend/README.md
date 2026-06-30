# GitHub Profile Analyzer — Frontend

React + Tailwind frontend for the Profile Analyzer API.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # edit VITE_API_URL if your backend isn't on localhost:5000
npm run dev
```

Open http://localhost:5173.

## Pages

- `/` — terminal-style prompt, enter a username, calls `POST /analyze`
- `/profiles` — list of all analyzed profiles (`GET /profiles`)
- `/profiles/:username` — single profile detail with stats and derived
  insights (`GET /profiles/:username`)

## Expected API shapes

`GET /profiles` → array of:
```json
{ "username": "...", "avatar": "...", "bio": "...", "repos": 0, "followers": 0, "following": 0 }
```

`GET /profiles/:username` and the response of `POST /analyze` → same shape,
plus `location` and `created_at`.

If your backend wraps the array/object (e.g. `{ profiles: [...] }` or
`{ profile: {...} }`), the frontend already unwraps both shapes, so it should
work either way — but double check field names match (`repos`, `followers`,
`following`, `avatar`, `created_at`).

## Notes

- Tailwind config and color tokens live in `tailwind.config.js`.
- `src/api.js` is the only file talking to the backend — change `BASE_URL`
  behavior or error handling there if your API differs.
