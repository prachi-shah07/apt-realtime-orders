# APT Real-Time Order Monitor

**Assignment submission for APT (Atypical Technologies Pvt Ltd) — Backend Developer Internship**

## Overview & Objective

The objective of this project was to build a production-grade, real-time order monitoring system. The system establishes a robust backend architecture using PostgreSQL's `LISTEN/NOTIFY` mechanism coupled with Node.js and WebSockets. This ensures that any change in the database immediately triggers a notification that propagates instantly to all connected browser clients, eliminating the need for polling and minimizing latency.

## Key Features & Functionality

* **True Real-Time Data Sync**: Any `INSERT`, `UPDATE`, or `DELETE` operation on the `orders` table is pushed instantly to every open browser tab.
* **Database-Level Triggers**: By utilizing PostgreSQL's `LISTEN/NOTIFY`, the system catches every single change at the kernel level. No data mutation is missed, even if someone manually edits the data directly in the database.
* **WebSocket Integration**: Replaces inefficient HTTP polling with a persistent, full-duplex WebSocket connection for sub-millisecond updates.
* **Interactive Dashboard**: A responsive UI featuring live order status tracking, visual flash animations for row updates, and a live-streaming event log of all backend database operations.
* **Automated One-Click Startup**: The project includes automation scripts to automatically create the necessary databases, run SQL migrations, install packages, and boot the server, providing a completely frictionless testing experience.

---

## Setup & Run (One-Click Start)

We've provided automated startup scripts so evaluators can run the project immediately without having to manually execute SQL queries or set up databases.

**1. Prerequisites**
* Node.js v18 or higher
* PostgreSQL installed and running locally on port 5432

**2. Environment Variables**
The `.env` file is already configured for a default local setup:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=apt_orders
PORT=3000
```
*(If your local Postgres user or password differs, update the `.env` file before running the script.)*

**3. Start the Application**
From the root directory of the project, simply double-click or run the appropriate script for your OS:

- **Windows**: Double-click `start-windows.bat`
- **Mac/Linux**: Run `sh start-mac-linux.sh`

*(This script automatically installs all dependencies, checks/creates the database, applies the SQL migrations, and starts the Node server in one go.)*

**4. Access the Client**
Visit: `http://localhost:3000`
We recommend opening multiple browser tabs side-by-side to witness the real-time synchronization in action!

---

## API Reference

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| GET | `/api/orders` | — | Fetch all orders |
| GET | `/api/orders/:id` | — | Fetch a single order |
| POST | `/api/orders` | `{ customer_name, product_name, status? }` | Create an order |
| PATCH | `/api/orders/:id` | `{ status?, customer_name?, product_name? }` | Update an order |
| DELETE | `/api/orders/:id` | — | Delete an order |
