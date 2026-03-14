# Repair Request Service

A minimal, full-stack repair request management system built with Node.js, Express, and SQLite. This project demonstrates atomic database operations to safely handle concurrent requests in a multi-user environment.

## 🚀 Features

- **Client Portal**: Submit repair requests with contact details and problem descriptions.
- **Dispatcher Dashboard**: Filter requests, assign them to masters, or cancel them.
- **Master Panel**: View assigned tasks, "take" them into progress, and mark them as finished.
- **Race-Condition Safety**: Uses atomic SQL `UPDATE` statements to ensure only one master can take a request, even if multiple try simultaneously.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite (`better-sqlite3`)
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS
- **Testing**: Jest, Supertest

## 🏃 How to Run

### 1. Local Installation
```bash
# Install dependencies
npm install

# Seed the database with test users and requests
npm run seed

# Start the server
npm start
```
The app will be available at `http://localhost:3000`.

### 2. Using Docker
```bash
docker compose up --build
```

## 👥 Test Users

The `npm run seed` command creates the following test accounts:

| Username | Role |
| :--- | :--- |
| `dispatcher` | Dispatcher |
| `master1` | Repair Master |
| `master2` | Repair Master |

## 🧪 Testing Race Conditions

This project is specifically designed to handle race conditions when two masters try to "Take" the same assigned request at the exact same time.

### How it Works
The `POST /requests/:id/take` endpoint uses an **atomic SQL update**:
```sql
UPDATE requests 
SET status = 'in_progress' 
WHERE id = ? AND status = 'assigned'
```
The database engine ensures that only one concurrent request will find the row with status `assigned`. The first request to arrive updates the row, and the second request finds 0 matching rows, resulting in a `409 Conflict`.

### Manual Bash Test
Run the provided bash script to simulate two parallel masters clicking "Take request":
```bash
bash race_test.sh
```

**Expected Output**:
```text
Step 1: Creating a fresh request...
Created Request ID: 15
Step 2: Setting request 15 to 'assigned' status...
Step 3: Firing two parallel 'take' requests...
Request A Result: 200
Request B Result: 409
---------------------------
Expected: One 200 (Success) and one 409 (Conflict).
```
*   **200 OK**: The "winner" of the race who successfully took the request.
*   **409 Conflict**: The "loser" who was informed that the request is no longer available.

### Automated Jest Test
Run the Jest test suite:
```bash
npm test
```
The `Test 2: Race condition for take request` in `tests/api.test.js` programmatically verifies this behavior using `Promise.all` to fire simultaneous requests.

## 📂 Project Structure

- `server/app.js`: Express server and API routes.
- `server/db.js`: SQLite database initialization and atomic queries.
- `server/seed.js`: Database seeding script.
- `public/`: Frontend assets (HTML, JS).
- `tests/`: API and race condition tests.
- `race_test.sh`: Bash script for manual race condition verification.
