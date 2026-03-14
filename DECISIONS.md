# Architectural Decisions (ADR)

This document outlines the key architectural decisions made during the development of the Repair Request Service.

## 1. Runtime: Node.js
**Decision:** Use Node.js as the primary runtime environment.
**Reasoning:** Node.js provides a non-blocking, event-driven architecture that is ideal for building scalable network applications. Its extensive ecosystem (npm) allows for rapid development and easy integration of testing and database libraries.

## 2. Database: SQLite
**Decision:** Use SQLite as the relational database.
**Reasoning:** SQLite is a serverless, zero-configuration database engine. It is perfect for small to medium-sized test projects because it stores the entire database in a single file, making it highly portable and easy to set up without requiring a separate database server process.

## 3. SQLite Driver: better-sqlite3
**Decision:** Use `better-sqlite3` instead of the standard `sqlite3` package.
**Reasoning:** `better-sqlite3` is synchronous, which simplifies the code by avoiding "callback hell" or complex async/await chains for simple database operations. It is also significantly faster than the asynchronous alternative and provides a cleaner API for prepared statements.

## 4. Race Condition Mitigation: Atomic SQL Updates
**Decision:** Use atomic SQL `UPDATE` statements with status checks in the `WHERE` clause.
**Reasoning:** To prevent multiple masters from "taking" the same request simultaneously, we use the following pattern:
```sql
UPDATE requests 
SET status = 'in_progress' 
WHERE id = ? AND status = 'assigned'
```
The database engine ensures this operation is atomic. If two requests arrive at the same time, only the first one will find a row where `status = 'assigned'`. The second request will result in `0` changes, allowing the server to return a `409 Conflict` response.

## 5. Frontend: Vanilla JS & HTML
**Decision:** Use a simple frontend with vanilla JavaScript and HTML (styled with Tailwind CSS).
**Reasoning:** For a small test project, a complex framework like React or Vue adds unnecessary overhead and build complexity. Vanilla JS is sufficient for handling form submissions and updating the UI via the Fetch API, keeping the project lightweight and easy to understand.

## 6. Containerization: Docker & Docker Compose
**Decision:** Provide a `Dockerfile` and `docker-compose.yml`.
**Reasoning:** Docker ensures that the application runs in a consistent environment regardless of the host machine. It packages the Node.js runtime, system dependencies (like build tools for native modules), and the application code together, simplifying deployment and local testing.

## 7. Testing Strategy: Jest & Supertest
**Decision:** Use Jest for unit/integration testing and Supertest for API testing.
**Reasoning:** Jest is a feature-rich testing framework with excellent support for ES modules. Supertest allows us to simulate HTTP requests to the Express app without needing to start the server on a real network port, making tests fast and reliable.
