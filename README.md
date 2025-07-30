<a id="readme-top"></a>

<div align="center">
  <h2 align="center">💰 Auric POS – Gold Business Point of Sale System</h2>

  <p align="center">
    A full-stack web application designed to streamline gold trading and inventory management for jewelers.
    <br />
    <br />
  </p>
</div>

---

## 📦 About The Project

[![Product Screenshot][product-screenshot]](https://github.com/shareen-faisal/auric-gold-pos)

**Auric POS** is a robust point of sale system tailored for **gold and jewelry businesses**. It offers tools for managing sales, customers, inventory, and daily gold price fluctuations — all through a sleek and responsive web interface.

The platform is ideal for shops needing transparent, real-time control over their operations, with built-in authentication, role-based access, and detailed reporting.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🛠️ Built With

- ![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61dafb)
- ![Node.js](https://img.shields.io/badge/Node.js-43853d?style=for-the-badge&logo=node.js&logoColor=white)
- ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
- ![MongoDB](https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white)
- ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🧪 Getting Started

To run the project locally, follow these steps:

### Prerequisites

- Node.js and npm
- MongoDB installed or MongoDB Atlas account

### Installation

1. Clone the repository

```bash
git clone https://github.com/shareen-faisal/auric-gold-pos.git
cd goldPOS
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd goldPOS
npm install
```

4. Create a `.env` file in `backend/` with your environment variables:

```env
MONGO_URI=your_mongo_db_url
JWT_SECRET=your_jwt_secret
```

5. Create a `.env` file in `goldPOS/` with your environment variables:

```env
VITE_API_BASE_URL=base_url
```

6. Start the backend server

```bash
cd ../backend
nodemon server.js
```

7. Start the frontend app

```bash
cd ../goldPOS
npm run dev
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🔐 Authentication

- Login with registered credentials
- JWT-based authentication and route protection
- Admin/staff role separation

---

## 📌 Deployment

Auric POS is live at:  
👉 [**http://www.auricpos.com/**](http://www.auricpos.com/)

---

## 📧 Contact

**Shareen Faisal**  
🔗 [GitHub](https://github.com/shareen-faisal)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
