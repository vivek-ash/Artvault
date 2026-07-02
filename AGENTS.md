# ArtVault — Digital Art Marketplace (MERN Stack)

## Problem Statement

A web-based platform enabling artists to upload, showcase, and securely sell digital
artworks to buyers worldwide through a centralized marketplace. Buyers browse, search,
and securely purchase digital art. The platform must ensure secure transactions,
ownership verification, and transparent purchase history for both artists and buyers.

## Core Modules

- Artist registration & profiles
- Artwork upload & management
- Marketplace listing & discovery
- Secure payment integration (Razorpay test mode)
- Order management
- Digital asset delivery
- Notification system
- Admin dashboard

## Unique Differentiator Features

1. **Watermarked Previews** — Full-res art is only unlocked after payment. Low-res watermarked previews on the public marketplace prevent theft.
2. **Auto-generated Certificate of Authenticity (PDF)** — Every purchase gets a unique certificate ID, buyer name, artist name/signature, artwork title, purchase timestamp.
3. **Limited Edition Artworks** — Artist sets a maximum copies count (e.g. "Edition 3 of 10"), system tracks how many have sold and blocks purchase once sold out.
4. **Resale Royalty Tracking** — If a buyer resells art on the platform, the original artist automatically gets a configurable cut of the resale price.
5. **Secure, Expiring, One-time Download Links** — Prevents sharing permanent public URLs to paid files.
6. **Auction/Bidding Mode** — Artist can choose "Buy Now" or "Auction" per artwork as an alternative to fixed pricing.
7. **Commission Requests** — Buyers request custom artwork from artists with budget and deadline; artist can accept/reject/negotiate.
8. **Artist Analytics Dashboard** — Views, sales count, revenue over time (charts via Recharts).
9. **Follow System + Activity Feed** — Buyers follow artists and get notified of new drops.
10. **Real-time Notifications (Socket.io)** — New sale, new follower, bid outbid, commission status changes.
11. **Search/Filter** — By category, art style, price range, and dominant color.
12. **Gallery "Studio Mode" Viewer** — Full-screen zoom/pan artwork viewer.
13. **Admin Moderation Queue** — Admin can flag/remove suspicious or reported artworks.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS v3 + Framer Motion + React Router v6 + Redux Toolkit + Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB with Mongoose (Atlas free tier) |
| Auth | JWT (httpOnly cookies) + bcrypt, three roles: artist, buyer, admin |
| File Storage | Cloudinary |
| Payments | Razorpay (test mode) |
| Real-time | Socket.io |
| PDF Generation | pdfkit (certificates & invoices) |
| Email | Resend |
| Deployment | Frontend → Vercel, Backend → Render |

## Design Direction

The UI must feel like a **professional art gallery**, not a generic e-commerce template.

### Theme System
- **Dark theme (default):** Deep charcoal (#121212) background, warm off-white (#faf8f5) text, muted gold/amber (#c9a84c) accent — gallery spotlight feel, artworks as visual focus.
- **Light theme:** Warm off-white (#faf8f5) background, charcoal (#1a1a1a) text, same gold accent for consistency.
- Theme toggle persisted via React Context (not localStorage).

### Typography
- **Headings:** Playfair Display (elegant serif/display font)
- **Body:** Inter (clean sans-serif)

### Visual Style
- Generous white/negative space around artwork thumbnails (real gallery wall feel)
- Smooth hover/zoom micro-interactions on artwork cards
- No generic bootstrap-looking components
- Premium creative product aesthetic (think Behance / ArtStation / Saatchi Art quality)
- Fully responsive on mobile

## Folder Structure

```
ArtVault/
├── client/               # React (Vite) frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level page components
│   │   ├── features/     # Redux slices
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # Layout wrappers (MainLayout, etc.)
│   │   ├── context/      # React Context providers (Theme, etc.)
│   │   ├── utils/        # Utility functions
│   │   └── store/        # Redux store configuration
│   ├── .env.example
│   └── package.json
├── server/               # Express.js backend
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express route definitions
│   ├── controllers/      # Route handler logic
│   ├── middleware/        # Auth, error handling, file upload
│   ├── utils/            # Helper functions, seed script
│   └── config/           # DB connection, Cloudinary, etc.
├── AGENTS.md             # This file — project specification
├── README.md             # Project documentation
└── .gitignore
```

## Environment Variables

### Server (`server/.env`)
- `PORT` — Server port (default: 5000)
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Secret for signing JWTs
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret
- `RAZORPAY_KEY_ID` — Razorpay test key ID
- `RAZORPAY_KEY_SECRET` — Razorpay test key secret
- `RESEND_API_KEY` — Resend email API key
- `CLIENT_URL` — Frontend URL for CORS (http://localhost:5173 in dev)

### Client (`client/.env`)
- `VITE_API_URL` — Backend API URL (http://localhost:5000 in dev)
- `VITE_RAZORPAY_KEY_ID` — Razorpay test key ID (public, safe for client)
