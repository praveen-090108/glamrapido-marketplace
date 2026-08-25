# Glam Rapido Salon Marketplace

Full-stack salon marketplace scaffold based on the requested architecture:

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query
- Backend: Node.js 22 LTS, Express 5, TypeScript
- ORM/database: Prisma with MySQL
- Auth: JWT access tokens, refresh tokens, RBAC
- Cloud-ready: AWS EC2/RDS/S3/CloudFront/SES friendly configuration
- DevOps: Docker, Nginx, PM2, GitHub Actions
- Documentation: Swagger/OpenAPI 3

## Quick Start

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:generate
pnpm dev
```

The web app runs on `http://localhost:5173`, and the API runs on `http://localhost:4000`.
Swagger docs are available at `http://localhost:4000/docs`.

## Docker

```bash
docker compose up --build
```

## Main Routes

- `/` home
- `/salons` salon listing
- `/salons/glam-studio` salon details
- `/salons/glam-studio/services`
- `/salons/glam-studio/stylists`
- `/salons/glam-studio/offers`
- `/salons/glam-studio/reviews`
- `/stylists/emma-wilson`
- `/booking`
- `/profile`
- `/booking-history`
- `/login`
- `/signup`
