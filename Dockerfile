FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    DJANGO_DEBUG=false \
    DJANGO_SECRET_KEY=build-only-secret

WORKDIR /app

COPY requirements-production.txt ./
RUN pip install --no-cache-dir -r requirements-production.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && daphne -b 0.0.0.0 -p ${PORT} config.asgi:application"]
