# NITC Appointments Backend (Local)

## Quickstart

1. Copy `.env.example` to `.env` and edit values (MONGO_URI, PORT, optionally email creds).
2. Install dependencies:
   ```
   npm install
   ```
3. Start MongoDB locally (mongod / service).
4. Run server:
   ```
   npm run dev
   ```
5. For testing without auth, include these headers in requests:
   - `x-user-id`: any string (will be used to create a temporary user if not found)
   - `x-user-role`: one of `internal user`, `external user`, `admin`

This backend uses a simple mock auth middleware for testing. Replace with real auth (JWT/OAuth) later.
