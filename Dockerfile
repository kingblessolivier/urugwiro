FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    DJANGO_DEBUG=false

WORKDIR /app

COPY requirements-production.txt ./
RUN pip install --no-cache-dir -r requirements-production.txt

COPY . .

RUN DJANGO_SECRET_KEY=temporary-collectstatic-key-not-used-at-runtime-0123456789 python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && daphne -b 0.0.0.0 -p ${PORT:-8000} config.asgi:application"]
