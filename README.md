# Brew POS ☕

A full-stack Point of Sale and Employee Management System for a coffee shop.
Built with React + Node/Express + MongoDB.

---

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Vite
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Auth**: JWT + bcrypt

---

## Project Structure

```
pos-app/
├── package.json          ← root (runs both together)
├── server/
│   ├── index.js          ← Express entry point
│   ├── .env              ← environment variables
│   ├── middleware/
│   │   └── auth.js       ← JWT middleware + role guard
│   ├── models/
│   │   ├── User.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── Inventory.js
│   │   └── Shift.js
│   └── routes/
│       ├── auth.js
│       ├── menu.js
│       ├── orders.js
│       ├── inventory.js
│       ├── employees.js
│       └── schedule.js
└── client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── index.css
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ToastContext.jsx
        ├── components/
        │   └── Layout.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── POS.jsx
            ├── Orders.jsx
            ├── Inventory.jsx
            ├── Schedule.jsx
            └── Employees.jsx
```

---

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/coffee_pos
JWT_SECRET=change_this_to_something_secret
```

### 3. Run both server and client
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 4. Seed the database
On the login page, click **"Create admin account"** to seed the first admin user:
- Email: `admin@cafe.com`
- Password: `admin123`

Then log in and use the **Seed** buttons on the POS and Inventory pages to populate sample data.

---

## Roles & Permissions

| Feature      | Admin | Manager | Barista |
|-------------|-------|---------|---------|
| Dashboard   | ✅    | ✅      | ❌      |
| POS         | ✅    | ✅      | ✅      |
| Orders      | ✅    | ✅      | ❌      |
| Inventory   | ✅    | ✅      | ❌      |
| Schedule    | ✅    | ✅      | View only |
| Employees   | ✅    | ❌      | ❌      |

---

## API Endpoints

### Auth
- `POST /api/auth/login` — login
- `GET  /api/auth/me` — current user
- `POST /api/auth/seed` — seed admin (first time only)

### Menu
- `GET    /api/menu` — list all items
- `POST   /api/menu` — create item (manager+)
- `PUT    /api/menu/:id` — update (manager+)
- `DELETE /api/menu/:id` — delete (admin)
- `POST   /api/menu/seed` — seed default menu (admin)

### Orders
- `GET   /api/orders` — list orders (optional ?status=)
- `POST  /api/orders` — create order
- `PATCH /api/orders/:id/status` — update status
- `GET   /api/orders/stats` — revenue stats (manager+)

### Inventory
- `GET    /api/inventory` — list all
- `POST   /api/inventory` — add item (manager+)
- `PUT    /api/inventory/:id` — update (manager+)
- `PATCH  /api/inventory/:id/quantity` — adjust qty (manager+)
- `DELETE /api/inventory/:id` — delete (admin)
- `POST   /api/inventory/seed` — seed defaults (admin)

### Employees
- `GET   /api/employees` — list all (manager+)
- `POST  /api/employees` — create (admin)
- `PUT   /api/employees/:id` — update (admin)
- `PATCH /api/employees/:id/toggle` — activate/deactivate (admin)

### Schedule
- `GET    /api/schedule?weekStart=YYYY-MM-DD` — week shifts
- `POST   /api/schedule` — add shift (manager+)
- `PUT    /api/schedule/:id` — update shift (manager+)
- `DELETE /api/schedule/:id` — delete shift (manager+)
