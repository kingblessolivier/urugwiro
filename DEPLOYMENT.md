# Deployment

Urugwiro is deployed as two independent services.

## Backend API

Deploy the repository root using `Dockerfile` or `render.yaml`.

Required environment variables:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG=false`
- `DJANGO_ALLOWED_HOSTS`
- `DATABASE_URL` for PostgreSQL
- `CORS_ALLOWED_ORIGINS` with the frontend origin
- `CSRF_TRUSTED_ORIGINS` with the frontend origin
- `SITE_URL`
- `REDIS_URL` for production Channels/WebSockets

Build and run locally with the production dependency set:

```powershell
pip install -r requirements-production.txt
$env:DJANGO_DEBUG = 'false'
python manage.py migrate
python manage.py collectstatic --noinput
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

The backend uses PostgreSQL when `DATABASE_URL` is present and SQLite otherwise. Keep uploads on a persistent/object-storage volume in production; local `media/` is excluded from the container build.

## Frontend SPA

Deploy `frontend/` as a Vercel project with the project root set to `frontend`.

Set:

- `VITE_API_BASE_URL=https://api.example.com/api`
- `VITE_BACKEND_URL=https://api.example.com`

The Vercel rewrite in `frontend/vercel.json` keeps React Router routes working on refresh.

## Local development

Leave `VITE_API_BASE_URL` unset to use the Vite `/api` proxy. Start Django on port `8000` and Vite on port `5173`.

Before deployment, rotate any credentials that were previously present in local settings and configure their replacement only through the hosting provider's secret manager.
