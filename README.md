# CSEA Event Portal

## Quick Start

Prerequisites: Node.js 20+, npm, and Docker Desktop.

```bash
cp .env.example .env
npm install
cd frontend && npm install && cd ..
npm run db:up
npm run seed -- --yes
npm run start:both
```

Open http://localhost:5173.

## Architecture

- Backend: Express and Socket.IO on port `5011`.
- Frontend: React and Vite on port `5173`.
- Admin MongoDB: `csea_admin` on port `27017`.
- Participant MongoDB: `csea_participant` on port `27018`.
- Real-time updates use Socket.IO.

## Environment Setup

Copy `.env.example` to `.env` and configure the documented database, JWT, port, client URL, and environment variables. Docker credentials use `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`.

Frontend configuration lives in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5011
```

## Folder Structure

- `routes/`, `controllers/`, `services/`, `models/`, and `schemas/`: backend API layers.
- `middlewares/` and `sockets/`: authentication, authorization, errors, and real-time events.
- `frontend/src/pages/`, `frontend/src/components/`, and `frontend/src/api/`: frontend screens, UI, and API calls.
- `scripts/`: database startup, seed, health, and environment helpers.

## Database

Run `npm run db:up` or `scripts/start-mongodb.sh` / `scripts/start-mongodb.bat`. Data persists in `mongo-admin-data/` and `mongo-participant-data/`. Stop containers with `npm run db:down` or `docker compose down`.

## Tests

```bash
npm test
RUN_INTEGRATION_TESTS=1 npm test
RUN_SOCKET_TESTS=1 npm test
cd frontend && npm run build
```

## Troubleshooting

- **bcrypt:** Node 24 source builds require Visual Studio Build Tools with C++ and a Windows SDK. Run `npm install` after installing them.
- **MongoDB:** run `npm run db:up`, then check `npm run health`.
- **Port conflict:** change `PORT` or Vite's port and update `CLIENT_URL` / `VITE_API_URL`.
- **CORS:** ensure the browser origin matches `CLIENT_URL`.

See [docs/api-contract.md](docs/api-contract.md) for endpoint details.
