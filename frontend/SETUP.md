# Frontend Setup

## Prerequisites

- Node.js 20 or newer
- npm
- The backend running on `http://localhost:5011`

## Install

```bash
npm install
```

Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5011
```

## Run

```bash
npm run dev
npm run build
```

The development frontend runs at `http://localhost:5173`.

## Troubleshooting

- If bcrypt fails on Node 24, install Visual Studio Build Tools with the Desktop development with C++ workload and a Windows SDK, then run `npm install` in the repository root.
- If API calls fail, verify the backend is running on port `5011` and that `VITE_API_URL` is correct.
- If port `5173` is busy, Vite will select another port; update the frontend URL allowed by the backend if needed.
