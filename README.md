# Node User API

Standalone Node.js REST API for **user** functionality. It uses the **same MySQL database** as the Laravel application and does not modify any Laravel code. JWT is used for authentication; password verification is compatible with Laravel's bcrypt hashes.

---

## Requirements

- Node.js 18+
- MySQL (same DB as Laravel: `users`, `wallets`, `set_amount`, `withdrawal` tables)

---

## Installation

1. **Navigate to the API folder**
   ```bash
   cd matka-laravel/user/node-user-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env` if needed.
   - Set database credentials to match your Laravel `.env`:
     - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
   - Set a strong `JWT_SECRET` in production.

4. **Start the API**
   ```bash
   npm start
   ```
   Server runs at `http://localhost:3000` by default (or the port in `PORT`).

---

## API Base URL

- Default: `http://localhost:3000`
- All user APIs are under `/api`: e.g. `http://localhost:3000/api/auth/login`

---

## Response Format

All responses use this structure:

```json
{
  "status": true,
  "message": "string",
  "data": object | null
}
```

- `status`: `true` for success, `false` for error  
- `message`: Short description  
- `data`: Payload or `null` on error  

---

## Endpoints (User Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/api/auth/register`     | No  | Register (name, mobile, password) |
| POST   | `/api/auth/login`        | No  | Login (mobile, password or 4-digit PIN) |
| POST   | `/api/auth/verify-otp`   | No  | Verify OTP (mobile + last 4 digits of mobile), approve user |
| POST   | `/api/auth/logout`       | No  | Logout (client discards token) |
| GET    | `/api/user/profile`      | JWT | Get profile |
| PUT    | `/api/user/profile`     | JWT | Update profile (name) |
| POST   | `/api/user/update-password` | JWT | Change password |
| GET    | `/api/user/user-info`   | JWT | Get user info |
| GET    | `/api/user/wallet`      | JWT | Get wallet |
| GET    | `/api/user/wallet-history` | JWT | Get wallet + withdrawal history |
| GET    | `/health`               | No  | Health check |

---

## Authentication

- **Login** and **Register** return a JWT in `data.token`.
- Send it in the header for protected routes:
  ```
  Authorization: Bearer <your-jwt-token>
  ```

---

## Postman

1. Import **Collection**: `postman/Matka_User_API.postman_collection.json`
2. Import **Environment**: `postman/Matka_User_API.postman_environment.json`
3. Set **base_url** (e.g. `http://localhost:3000`) and, after login, set **token** from the login response.

---

## Environment Variables

| Variable     | Description                    | Default     |
|-------------|--------------------------------|-------------|
| PORT        | Server port                    | 3000        |
| NODE_ENV    | development / production       | development |
| DB_HOST     | MySQL host                     | 127.0.0.1   |
| DB_PORT     | MySQL port                     | 3306        |
| DB_USERNAME | MySQL user                     | root        |
| DB_PASSWORD | MySQL password                 | (empty)     |
| DB_DATABASE | Database name (same as Laravel)| laravel     |
| DB_CHARSET  | Charset                        | utf8mb4     |
| JWT_SECRET  | Secret for signing JWTs       | (set in .env) |
| JWT_EXPIRY  | Token expiry                   | 7d          |

---

## Running Independently

This API does not depend on Laravel. You can run it on the same machine or another server as long as it can reach the same MySQL database. Laravel and this API can run at the same time without conflict.
