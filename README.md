# 🗺️ Employee Map Tracker

> Real-time employee location tracking — **Telegram → Supabase → Next.js 16 + Leaflet/OSM**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/effdjonik-star/employee-map-tracker)

## ✨ Features

- 📡 **Telegram Webhook** — parses name, address, coordinates, status from channel messages
- 🌍 **Geocoding** — Nominatim/OpenStreetMap, no API key required
- 🗺️ **Interactive Map** — Leaflet + CartoDB Dark tiles + marker clustering
- ⚡ **Real-time** — Supabase Realtime WebSocket, instant updates
- 📊 **Dashboard** — active/idle/offline counters, search, filter
- 🕰️ **History** — full location timeline per employee
- 🧹 **Auto Cleanup** — Vercel Cron daily, 7-day retention
- 📱 **Mobile-First** — dark theme, glassmorphism, Tailwind CSS v4 + Shadcn UI

## 🚀 Quick Start

```bash
git clone https://github.com/effdjonik-star/employee-map-tracker
cd employee-map-tracker
npm install
cp .env.example .env.local
# Fill in .env.local, then:
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 🛠️ Setup

### Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in SQL Editor
3. Copy URL + keys into `.env.local`

### Telegram Bot
1. Create bot via [@BotFather](https://t.me/BotFather)
2. Add bot as admin to your channel/group
3. Register webhook:
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-app.vercel.app/api/telegram-webhook","secret_token":"YOUR_SECRET"}'
```

## 📨 Message Format

```
👤 John Smith
📍 123 Main Street, New York
Status: active
```

```
Name: Alice
Address: Москва, Арбат
Coords: 55.7520, 37.5928
Status: idle
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Shadcn UI (base-ui) |
| Database | Supabase (PostgreSQL + Realtime) |
| Map | Leaflet 1.9 + markercluster |
| Tiles | CartoDB Dark Matter |
| Geocoding | Nominatim (OSM) |
| Hosting | Vercel + Cron |

## 📁 Structure

```
src/
├── app/
│   ├── api/ (telegram-webhook, employees, geocode, cron)
│   ├── dashboard/     ← main map view
│   └── history/       ← location timeline
├── components/
│   ├── map/           ← Leaflet map + clustering
│   ├── employees/     ← cards, list, stats, badges
│   └── layout/        ← header
├── hooks/           ← useEmployeeLocations, useMapMarkers
├── lib/
│   ├── supabase/      ← client/server/admin
│   ├── telegram/      ← message parser
│   ├── geocoding/     ← Nominatim
│   └── actions/       ← Server Actions
├── types/           ← TypeScript interfaces
└── utils/           ← status helpers
```

## 📄 License

MIT
