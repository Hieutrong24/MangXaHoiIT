# notification-service

Starter service for notifications with Express, MongoDB, RabbitMQ, and Socket.IO.

## Run

1. Copy `.env.example` to `.env`
2. Install dependencies
3. Start service

```bash
npm install
npm run dev
```

## Main APIs

- `GET /health`
- `GET /api/notifications`
- `POST /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:id/read`
- `DELETE /api/notifications/:id`
- `GET /api/preferences`
- `PUT /api/preferences`
