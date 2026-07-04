# 🎨 ArtVault — Digital Art Marketplace

A full-stack MERN web application enabling artists to upload, showcase, and securely sell digital artworks. Buyers can browse, discover, and purchase art through a professional gallery-themed interface with secure payments.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Backend](https://img.shields.io/badge/Node.js-Express-green) ![Database](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![Payments](https://img.shields.io/badge/Razorpay-Test%20Mode-purple)

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **🎨 Frontend** | [https://client-five-psi-40.vercel.app](https://client-five-psi-40.vercel.app) |
| **⚙️ Backend API** | [https://artvault-api-48h5.onrender.com](https://artvault-api-48h5.onrender.com/api/health) |

> **Note:** Render free tier may cold-start (~30s) on first request.

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@artvault.com` | `Admin@123` |
| Artist | `artist1@artvault.com` | `Artist@123` |
| Buyer | `buyer1@artvault.com` | `Buyer@123` |

---

## ✨ Key Features

### Core
- **Artist Registration & Profiles** — Portfolio showcase with social links and verification badges
- **Artwork Upload & Management** — Cloudinary-powered image storage with auto-watermarking
- **Marketplace Discovery** — Search, filter by category/price/style/color, sort & pagination
- **Secure Payments** — Razorpay integration with cryptographic signature verification
- **Order Management** — Full order lifecycle tracking with download management

### Unique Differentiators
1. **Watermarked Previews** — Full-res art unlocked only after payment
2. **Certificate of Authenticity (PDF)** — Auto-generated with unique certificate ID, buyer/artist names, timestamp
3. **Limited Edition Artworks** — Edition tracking (e.g., "Edition 3 of 10"), auto-blocks when sold out
4. **Resale Royalty Tracking** — Original artist gets a configurable cut of resale price
5. **Secure, Expiring Download Links** — One-time use, 72-hour expiry, max 3 downloads
6. **Auction/Bidding Mode** — Real-time bidding with outbid notifications
7. **Commission Requests** — Buyers request custom artwork with budget/deadline; artists accept/reject/negotiate
8. **Artist Analytics Dashboard** — Revenue, sales, and views charts (Recharts)
9. **Follow System + Activity Feed** — Followers/following with real-time new follower notifications
10. **Real-time Notifications (Socket.io)** — New sale, follower, bid outbid, commission status changes
11. **Search/Filter** — By category, art style, price range, dominant color
12. **Admin Moderation Dashboard** — User management (suspend/unsuspend), artist verification tags, artwork moderation, platform stats
13. **Three User Roles** — Artist, Buyer, Admin with role-based access control (including cross-role purchases and wishlist support for artists)
14. **Interactive Studio Sketchpad** — Draw and download custom commission drafts/concept doodles directly in the dashboard
15. **Creative Aura Identity** — Morphing ambient liquid gradient visualization reflecting the user's artistic personality
16. **Artistic Watercolor Cursor & Spotlight Ambient Glow Backdrop** — Premium fluid paint droplet trailing effects and slowly flowing spotlight blobs

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React (Vite) + Tailwind CSS v3 + Framer Motion + React Router v6 + Redux Toolkit + Recharts |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB with Mongoose (Atlas) |
| **Auth** | JWT (httpOnly cookies) + bcrypt, three roles: artist, buyer, admin |
| **File Storage** | Cloudinary (auto watermark for previews) |
| **Payments** | Razorpay (test mode) |
| **Real-time** | Socket.io |
| **PDF Generation** | pdfkit |
| **Deployment** | Frontend → Vercel, Backend → Render |

---

## 📁 Project Structure

```
ArtVault/
├── client/                    # React (Vite) frontend
│   ├── src/
│   │   ├── components/        # Reusable UI (ProtectedRoute, ArtistAnalytics)
│   │   ├── context/           # ThemeContext
│   │   ├── features/          # Redux slices (auth, artwork, order)
│   │   ├── hooks/             # Custom hooks (useRazorpay)
│   │   ├── layouts/           # MainLayout (auth-aware navbar + footer)
│   │   ├── pages/             # All route pages
│   │   ├── store/             # Redux store
│   │   └── utils/             # API instance
│   └── package.json
├── server/                    # Express.js backend
│   ├── config/                # DB connection, Cloudinary
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth, error handling, upload
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routes
│   └── utils/                 # Helpers (seed, certificate, ErrorResponse)
├── AGENTS.md
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Razorpay account (test mode, free)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/ArtVault.git
cd ArtVault

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` in both `server/` and `client/` directories and fill in your credentials.

**Server (`server/.env`):**
```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

**Client (`client/.env`):**
```
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### 3. Seed Test Data

```bash
cd server
node utils/seed.js
```

This creates 5 test users (see credentials below).

### 4. Run Development Servers

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

- **Server**: http://localhost:5000
- **Client**: http://localhost:5173

---

## 👤 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@artvault.com` | `Admin@123` |
| Artist | `artist1@artvault.com` | `Artist@123` |
| Artist | `artist2@artvault.com` | `Artist@123` |
| Buyer | `buyer1@artvault.com` | `Buyer@123` |
| Buyer | `buyer2@artvault.com` | `Buyer@123` |

---

## 🎨 Design

- **Dark theme (default):** Deep charcoal `#121212`, warm off-white `#faf8f5` text, muted gold `#c9a84c` accent
- **Light theme:** Warm off-white background, charcoal text, same gold accent
- **Typography:** Playfair Display (headings) + Inter (body)
- **Style:** Professional art gallery aesthetic with generous whitespace, smooth hover animations, glassmorphism navbar

---

## 📄 License

This project is for educational purposes.
