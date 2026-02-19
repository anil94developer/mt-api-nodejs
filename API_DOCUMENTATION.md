# API Documentation

Base URL: `{{base_url}}` (e.g. `http://localhost:3000`)

All protected APIs require: `Authorization: Bearer <token>`

---

## 1. Add Amount (Add Fund to Wallet)

**Endpoint:** `POST /api/wallet/add-amount`  
**Auth:** Required (Token)

Add funds to user's wallet. Creates a deposit record and updates wallet balance.

**Request Body:**
```json
{
  "amount": 500,
  "payment_method": "upi",
  "transaction_id": "TXN123456"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Amount to add (must be > 0) |
| payment_method | string | No | e.g. "upi", "bank", "manual" (default: "manual") |
| transaction_id | string | No | Payment reference/transaction ID |

**Response (201):**
```json
{
  "status": true,
  "message": "Amount added to wallet successfully.",
  "data": {
    "wallet": { "id": 1, "user_id": 1, "balance": 600, "created_at": "...", "updated_at": "..." },
    "amount_added": 500
  }
}
```

---

## 2. Send Withdraw

**Endpoint:** `POST /api/wallet/send-withdraw`  
**Auth:** Required (Token)

Submit a withdrawal request using a saved bank. Deducts amount from wallet. Validates against `set_amount` limits.

**Request Body:**
```json
{
  "amount": 2000,
  "bankId": "1"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Withdrawal amount (must be > 0) |
| bankId | string/number | Yes | Bank ID from bank table (must belong to user) |

**Validations (from `set_amount` table):**
- `min_withdrawal` ≤ amount ≤ `max_withdrawal`
- Current time must be within `withdrawal_start_time` – `withdrawal_end_time`
- Wallet balance must be ≥ amount

**Response (201):**
```json
{
  "status": true,
  "message": "Withdrawal request submitted successfully.",
  "data": {
    "withdrawal": {
      "id": 1,
      "user_id": 1,
      "amount": 2000,
      "payout": "phone",
      "number": "99888776655",
      "status": "pending",
      "withdrawal_date": "..."
    }
  }
}
```

**Errors:**
- 404: Bank not found or does not belong to user
- 400: Insufficient wallet balance
- 400: Outside withdrawal time window
- 422: Amount below min or above max

---

## 3. Get Bid History

**Endpoint:** `GET /api/bid/get-bid-history`  
**Auth:** Required (Token)

Get user's bet/bid history.

**Query Params:**
| Param | Type | Default | Description |
|-------|------|--------|-------------|
| limit | number | 50 | Max records to return |

**Example:** `GET /api/bid/get-bid-history?limit=20`

**Response (200):**
```json
{
  "status": true,
  "message": "Bid history retrieved successfully.",
  "data": {
    "bids": [
      {
        "id": 1,
        "user_id": 1,
        "market_id": 11,
        "market_name": "KALYAN",
        "game_type": "single",
        "number": "123",
        "amount": 10,
        "bid_date": "2025-02-17",
        "status": "pending",
        "created_at": "..."
      }
    ]
  }
}
```

---

## 4. Get Deposit History

**Endpoint:** `GET /api/wallet/get-deposit-history`  
**Auth:** Required (Token)

Get user's deposit history.

**Query Params:**
| Param | Type | Default | Description |
|-------|------|--------|-------------|
| limit | number | 50 | Max records to return |

**Example:** `GET /api/wallet/get-deposit-history?limit=20`

**Response (200):**
```json
{
  "status": true,
  "message": "Deposit history retrieved successfully.",
  "data": {
    "deposits": [
      {
        "id": 1,
        "user_id": 1,
        "amount": 500,
        "status": "completed",
        "payment_method": "upi",
        "transaction_id": "TXN123",
        "created_at": "..."
      }
    ]
  }
}
```

---

## 5. Get Game Chart

**Endpoint:** `GET /api/game/get-game-chart`  
**Auth:** Not required

Get game/chart data for a market (open, close, result history).

**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| market_id | number | Yes | Market ID |
| limit | number | 30 | Max records |

**Example:** `GET /api/game/get-game-chart?market_id=11&limit=30`

**Response (200):**
```json
{
  "status": true,
  "message": "Game chart retrieved successfully.",
  "data": {
    "charts": [
      {
        "id": 1,
        "market_id": 11,
        "chart_date": "2025-02-16",
        "open": "123",
        "close": "456",
        "result": "789"
      }
    ]
  }
}
```

---

## 6. Get Game Rate

**Endpoint:** `GET /api/game/get-game-rate`  
**Auth:** Not required

Get game rates (single, jodi, panna, etc.) for markets.

**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| market_id | number | No | Filter by market; omit for all |

**Example:** `GET /api/game/get-game-rate` or `GET /api/game/get-game-rate?market_id=11`

**Response (200):**
```json
{
  "status": true,
  "message": "Game rates retrieved successfully.",
  "data": {
    "rates": [
      {
        "id": 1,
        "market_id": 11,
        "game_type": "single",
        "rate": 9.5
      }
    ]
  }
}
```

---

## 7. Get Withdraw List

**Endpoint:** `GET /api/withdraw/get-withdraw-list`  
**Auth:** Required (Token)

Get user's withdrawal history.

**Query Params:**
| Param | Type | Default | Description |
|-------|------|--------|-------------|
| limit | number | 50 | Max records |

**Example:** `GET /api/withdraw/get-withdraw-list?limit=20`

**Response (200):**
```json
{
  "status": true,
  "message": "Withdrawal list retrieved successfully.",
  "data": {
    "withdrawals": [
      {
        "id": 1,
        "user_id": 1,
        "amount": 100,
        "status": "pending",
        "withdrawal_date": "..."
      }
    ]
  }
}
```

---

## 8. Get Slider

**Endpoint:** `GET /api/slider/get-slider`  
**Auth:** Not required

Get slider/banner list for app home/carousel.

**Response (200):**
```json
{
  "status": true,
  "message": "Sliders retrieved successfully.",
  "data": {
    "sliders": [
      {
        "id": 1,
        "image": "https://example.com/banner1.jpg",
        "title": "Banner 1",
        "link": "https://example.com",
        "sort_order": 1
      }
    ]
  }
}
```

---

## 9. Get Wallet History

**Endpoint:** `GET /api/wallet/get-wallet-history`  
**Auth:** Required (Token)

Get combined wallet history: user info, deposits, withdrawals, and bids.

**Response (200):**
```json
{
  "status": true,
  "message": "Wallet history retrieved successfully.",
  "data": {
    "userData": { "name": "User", "number": "9876543210", "balance": 500 },
    "deposits": [],
    "withdrawals": [],
    "bids": []
  }
}
```

---

## 10. Update Bank

**Endpoint:** `POST /api/bank/update-bank`  
**Auth:** Required (Token)

Update or add user's bank details for withdrawals.

**Request Body:**
```json
{
  "bank_name": "HDFC Bank",
  "account_number": "1234567890",
  "ifsc_code": "HDFC0001234",
  "account_holder": "John Doe"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bank_name | string | Yes | Bank name |
| account_number | string | Yes | Account number |
| ifsc_code | string | Yes | IFSC code |
| account_holder | string | Yes | Account holder name |

**Response (200):**
```json
{
  "status": true,
  "message": "Bank details updated successfully.",
  "data": {
    "bank": {
      "id": 1,
      "user_id": 1,
      "bank_name": "HDFC Bank",
      "account_number": "1234567890",
      "ifsc_code": "HDFC0001234",
      "account_holder": "John Doe"
    }
  }
}
```

---

## 11. Kalyan Bet Place

**Endpoint:** `POST /api/bid/kalyan-bet-place`  
**Auth:** Required (Token)

Place a bet on a market (e.g. Kalyan). Deducts amount from wallet. Market must be open.

**Request Body:**
```json
{
  "market_id": 11,
  "game_type": "single",
  "number": "123",
  "amount": 10,
  "bid_date": "2025-02-17"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| market_id | number | Yes | Market ID |
| game_type | string | Yes | e.g. "single", "jodi", "panna" |
| number | string | Yes | Bet number |
| amount | number | Yes | Bet amount (must be > 0) |
| bid_date | string | No | Date (YYYY-MM-DD); default: today |

**Response (201):**
```json
{
  "status": true,
  "message": "Bet placed successfully.",
  "data": {
    "bid": {
      "id": 1,
      "user_id": 1,
      "market_id": 11,
      "game_type": "single",
      "number": "123",
      "amount": 10,
      "bid_date": "2025-02-17",
      "status": "pending"
    }
  }
}
```

**Errors:**
- 400: Market is closed
- 400: Insufficient wallet balance
- 404: Market not found

---

## Database Tables Required

Create these tables if they don't exist (adjust to match your Laravel schema):

```sql
-- deposits
CREATE TABLE deposits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- bids
CREATE TABLE bids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  market_id INT NOT NULL,
  game_type VARCHAR(50),
  number VARCHAR(20),
  amount DECIMAL(12,2) NOT NULL,
  bid_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- game_charts
CREATE TABLE game_charts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  market_id INT NOT NULL,
  chart_date DATE,
  open VARCHAR(20),
  close VARCHAR(20),
  result VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- game_rates
CREATE TABLE game_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  market_id INT NOT NULL,
  game_type VARCHAR(50),
  rate DECIMAL(10,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- sliders
CREATE TABLE sliders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image VARCHAR(255),
  title VARCHAR(255),
  link VARCHAR(255),
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- bank_details
CREATE TABLE bank_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  account_holder VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Quick Reference

| # | API | Method | Path | Auth |
|---|-----|--------|------|------|
| 1 | Add Amount | POST | /api/wallet/add-amount | Yes |
| 2 | Send Withdraw | POST | /api/wallet/send-withdraw | Yes |
| 3 | Get Bid History | GET | /api/bid/get-bid-history | Yes |
| 4 | Get Deposit History | GET | /api/wallet/get-deposit-history | Yes |
| 5 | Get Game Chart | GET | /api/game/get-game-chart?market_id=X | No |
| 6 | Get Game Rate | GET | /api/game/get-game-rate | No |
| 7 | Get Withdraw List | GET | /api/withdraw/get-withdraw-list | Yes |
| 8 | Get Slider | GET | /api/slider/get-slider | No |
| 9 | Get Wallet History | GET | /api/wallet/get-wallet-history | Yes |
| 10 | Update Bank | POST | /api/bank/update-bank | Yes |
| 11 | Kalyan Bet Place | POST | /api/bid/kalyan-bet-place | Yes |
