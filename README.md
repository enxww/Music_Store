# Music Store

A full-stack music-store project built for the Advanced Databases (NoSQL) course. It provides a REST API backed by MongoDB and a lightweight browser frontend for browsing products, registering, signing in, and placing orders.

## Highlights

- JWT-based authentication with protected user routes
- Product catalogue for guitars, pianos, and accessories
- Order creation and personal order history
- MongoDB persistence through Mongoose
- Health endpoint for a quick service check

## Tech stack

- Node.js and Express
- MongoDB and Mongoose
- JSON Web Tokens and bcrypt
- Vanilla HTML, CSS, and JavaScript

## Project structure

```text
backend/       Express API and MongoDB models
frontend/      Static browser client
```

## Run locally

### 1. Start MongoDB

Run MongoDB locally or create a MongoDB Atlas database.

### 2. Configure the backend

```bash
cd backend
copy .env.example .env
npm install
```

Update `MONGO_URI` and `JWT_SECRET` in `.env`. Never commit this file.

### 3. Start the API

```bash
npm run dev
```

The API starts at `http://localhost:3000`. Confirm it is running at `GET /health`.

### 4. Open the frontend

Open `frontend/index.html` in a browser. The client expects the API at `http://localhost:3000`.

## Main API routes

| Area | Routes |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login` |
| Products | `GET /products` |
| Orders | `POST /orders`, `GET /orders/my` |
| Service status | `GET /health` |

## Security note

Configuration belongs in `backend/.env`, which is intentionally ignored by Git. Use `backend/.env.example` as a setup template and rotate any credentials that were previously stored in a committed `.env` file.

## Course context

This repository is a course project for Advanced Databases (NoSQL), demonstrating document modelling, RESTful API design, authentication, and basic e-commerce workflows.
