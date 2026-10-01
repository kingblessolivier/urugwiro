# URUGWIRO — Complete Redesign & Implementation Plan

**Version:** 1.0
**Date:** 2026-09-30
**Status:** Approved for execution

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Target Architecture](#3-target-architecture)
4. [Database Migration: SQLite to PostgreSQL](#4-database-migration-sqlite-to-postgresql)
5. [Deployment Architecture: Separate Frontend & Backend](#5-deployment-architecture-separate-frontend--backend)
6. [Design System](#6-design-system)
7. [Data Model Changes](#7-data-model-changes)
8. [API Design](#8-api-design)
9. [Phase-by-Phase Implementation Plan](#9-phase-by-phase-implementation-plan)
10. [Risk Assessment & Mitigation](#10-risk-assessment--mitigation)
11. [Success Criteria](#11-success-criteria)

---

## 1. Executive Summary

Urugwiro is being redesigned from a feature-heavy real-estate marketplace into a **simple-outside, powerful-inside** asset discovery and business operations platform. This plan covers:

- **Database:** Migrate from SQLite to PostgreSQL
- **Hosting:** Separate frontend (static hosting) and backend (API server) for production deployment
- **Product:** Remove escrow/Irembo/deal-pipeline complexity; add conversations, visits calendar, offers, seller financials, expenses, owner dashboard, documents, signatures
- **Design:** Mature SaaS aesthetic — clean, professional, trustworthy

---

## 2. Current State Assessment

### 2.1 Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite + TypeScript + Tailwind CSS | 19 / 8 / 6 / 4 |
| Routing | React Router | 7 |
| State | TanStack Query + React Context | 5 |
| Backend | Django + DRF + Channels | 5.1 |
| Auth | SimpleJWT | — |
| Database | SQLite (dev) | — |
| Real-time | Django Channels (InMemory) | — |
| Maps | Leaflet + Mapbox GL | — |
| Charts | Chart.js | 4 |
| 3D | Three.js | 0.186 |

### 2.2 Existing Models (48 migrations)

**Core:** `Asset` → `ResidentialSpec` / `CommercialSpec` / `LandSpec` / `HotelSpec` / `VehicleSpec`
**Listings:** `Listing`, `ListingMedia`, `RentalExtension`, `SaleExtension`, `LandExtension`, `VehicleExtension`, `ServiceExtension`
**Users:** `User` (AbstractUser), `ListingOwner`, `Seller`, `Agent`, `Owner`, `Tenant`
**Transactions:** `Offer`, `TransactionDeal`, `DealDocument`, `ContractAgreement`
**Engagement:** `SiteVisit`, `PropertyInquiry`, `ListingProposal`, `LikedProperties`, `Message`, `ChatConversation`, `ChatMessage`
**Financial:** `Payment`, `MaintenanceRequest`
**System:** `SystemLog`, `ListingAuditLog`, `Notification`, `Announcement`, `SystemSetting`
**Legacy:** `Property`, `SaleProperty`, `Lease`, `Unit`, `PropertyImage`, `Visit`, `CustomerMessage`, `CustRequest`, `Email`, `Updates`

### 2.3 Existing Roles

`Buyer`, `Seller`, `Agent`, `Admin`, `RentalManager`, `Tenant`, `Owner`

### 2.4 What Exists vs. What's Needed

| Feature | Current State | Needed |
|---------|--------------|--------|
| Conversations | Generic chat (WebSocket) | Per-property conversation entity with CRM statuses |
| Offers | Escrow %, financing type, counter pipeline | Simple offer recording |
| Visits | `SiteVisit` + agent kanban | Calendar (month/week/day) + public request form |
| Favorites | `LikedProperties` | Same + aggregate stats |
| Documents | `ContractAgreement` (OTP, QR, spousal consent) | Template-based generation, simple signing |
| Seller earnings | Agent-only ledger | Commission rules, seller payments, outstanding balances |
| Expenses | None | Full expense tracking |
| Financial reports | Basic CSV export | Revenue, expenses, seller payments, monthly performance |
| Owner dashboard | Maintenance only | Full business intelligence |
| Roles | 7 roles, per-view checks | Add Property Manager, Finance; centralized permissions |
| Audit log | `SystemLog` + `ListingAuditLog` | Unified field-level audit trail |
| Property status | Basic statuses | Full lifecycle (Draft → Submitted → Under Review → Published → Under Offer → Sold/Rented → Completed → Archived) |
| Follow-ups | None | Full follow-up system |
| Escrow/Irembo/Deals | Built and wired | **Remove/postpone** |

---

## 3. Target Architecture

### 3.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Public Web  │  │ Seller Dash  │  │  Admin/Owner │      │
│  │  (Vercel)    │  │  (Vercel)    │  │  (Vercel)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   DJANGO API SERVER                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │  REST API  │ │  WebSocket │ │  Admin     │              │
│  │  (DRF)     │ │  (Channels)│ │  Panel     │              │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘              │
│        │              │              │                       │
│  ┌─────┴──────────────┴──────────────┴─────┐                │
│  │           Django ORM + Services          │                │
│  └─────────────────┬────────────────────────┘                │
└────────────────────┼─────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│PostgreSQL│  │  Redis   │  │  S3/Cloudinary│
│(Railway) │  │(Upstash) │  │  (Media)      │
└──────────┘  └──────────┘  └──────────────┘
```

### 3.2 Technology Choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Frontend hosting | **Vercel** | Zero-config React SPA, preview deployments, CDN |
| Backend hosting | **Railway** or **Render** | Simple Django deployment, managed Postgres |
| Database | **PostgreSQL** (managed) | Production-ready, JSON support, full-text search |
| Cache/Channels | **Redis** (Upstash) | Required for Django Channels in production |
| Media storage | **Cloudinary** or **AWS S3** | Scalable image/video storage with CDN |
| Email | **SendGrid** or **Mailgun** | Reliable transactional email |
| Error tracking | **Sentry** | Production error monitoring |

### 3.3 Environment Strategy

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Local dev | `localhost:5173` | `localhost:8000` | Local Postgres |
| Preview | Vercel preview URLs | Railway preview | Shared dev DB |
| Production | `urugwiro.com` | `api.urugwiro.com` | Production Postgres |

---

## 4. Database Migration: SQLite to PostgreSQL

### 4.1 Why PostgreSQL

- **Production-ready:** Handles concurrent connections, proper locking
- **JSONField:** Native JSONB support for flexible spec data
- **Full-text search:** Built-in `tsvector` for global search
- **Array fields:** For tags, amenities, features
- **Better performance:** Proper query planner, indexes, constraints

### 4.2 Migration Steps

#### Step 1: Update Django Settings

```python
# config/settings.py
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'postgres://localhost:5432/urugwiro'),
        conn_max_age=600,
        ssl_require=not DEBUG,
    )
}
```

Add to `requirements.txt`:
```
dj-database-url
```

#### Step 2: Create PostgreSQL Database

**Local development:**
```bash
# Using Docker
docker run --name urugwiro-pg -e POSTGRES_DB=urugwiro -e POSTGRES_USER=urugwiro -e POSTGRES_PASSWORD=urugwiro -p 5432:5432 -d postgres:16

# Or using local Postgres installation
createdb urugwiro
```

**Production (Railway/Render):**
- Provision managed PostgreSQL instance
- Copy the connection string to `DATABASE_URL` env var

#### Step 3: Run Migrations

```bash
python manage.py migrate
```

#### Step 4: Migrate Existing Data (if needed)

```bash
# Dump from SQLite
python manage.py dumpdata --natural-foreign --natural-primary -o datadump.json

# Switch to Postgres, then load
python manage.py loaddata datadump.json
```

**Note:** If starting fresh (no production data), skip this step.

#### Step 5: Verify

```bash
python manage.py dbshell
# Run: \dt
# Verify all tables exist
```

### 4.3 SQLite → Postgres Gotchas

| Issue | Mitigation |
|-------|-----------|
| Case-sensitive `LIKE` | Use `__icontains` (works on both) |
| `GROUP BY` behavior | Postgres requires all non-aggregated columns in GROUP BY |
| Boolean fields | SQLite uses 0/1; Postgres uses true/false — Django handles this |
| JSONField | Django 5.1 supports JSONField on both; Postgres uses JSONB |
| `order_by` on nulls | Postgres defaults to NULLS LAST for ASC; be explicit |
| Auto-increment | Both use sequences; `BigAutoField` works identically |

### 4.4 New Models to Create

See [Section 7](#7-data-model-changes) for full model definitions.

---

## 5. Deployment Architecture: Separate Frontend & Backend

### 5.1 Frontend (Vercel)

**File:** `frontend/vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_BASE_URL": "@urugwiro_api_url"
  }
}
```

**Environment variables (Vercel):**
```
VITE_API_BASE_URL=https://api.urugwiro.com/api
VITE_BACKEND_URL=https://api.urugwiro.com
VITE_WS_URL=wss://api.urugwiro.com/ws
```

**Build output:** `frontend/dist/` — static files served by Vercel CDN.

### 5.2 Backend (Railway/Render)

**File:** `Procfile`
```
web: gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker
```

**File:** `runtime.txt`
```
python-3.12
```

**Environment variables (Railway/Render):**
```
DATABASE_URL=postgres://...
REDIS_URL=redis://...
SECRET_KEY=<generate>
DEBUG=False
ALLOWED_HOSTS=api.urugwiro.com
CORS_ALLOWED_ORIGINS=https://urugwiro.com,https://www.urugwiro.com
CLOUDINARY_URL=cloudinary://...
SENDGRID_API_KEY=...
```

**File:** `config/settings.py` (production additions)
```python
import dj_database_url

DEBUG = os.environ.get('DEBUG', 'False') == 'True'
SECRET_KEY = os.environ.get('SECRET_KEY')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=not DEBUG,
    )
}

# Redis for Channels
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [os.environ.get('REDIS_URL', 'redis://localhost:6379')],
        },
    },
}

# Media storage
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
CLOUDINARY_URL = os.environ.get('CLOUDINARY_URL')

# CORS
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOW_CREDENTIALS = True

# Security
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
```

### 5.3 WebSocket in Production

Django Channels requires Redis as the channel layer backend in production (InMemory doesn't work across multiple workers).

```python
# config/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from urugwiro.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
```

### 5.4 Media Files

**Option A: Cloudinary (recommended)**
```python
INSTALLED_APPS += ['cloudinary', 'cloudinary_storage']
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
CLOUDINARY_URL = os.environ.get('CLOUDINARY_URL')
```

**Option B: AWS S3**
```python
INSTALLED_APPS += ['storages']
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = 'af-south-1'  # Closest to Rwanda
```

### 5.5 CI/CD Pipeline

**GitHub Actions:** `.github/workflows/deploy.yml`
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railway/cli@latest
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 6. Design System

### 6.1 Principles

- **Mature SaaS, not template:** Clean, professional, trustworthy
- **Strong typography:** Clear hierarchy with purposeful font weights
- **Subtle borders:** Use borders over shadows for card definition
- **Consistent spacing:** 4px base grid (4, 8, 12, 16, 24, 32, 48, 64)
- **Meaningful empty states:** Never show blank tables
- **Responsive:** Mobile-first, excellent on all screen sizes

### 6.2 Color Palette

```css
:root {
  /* Brand */
  --color-primary: #059669;        /* Emerald 600 */
  --color-primary-hover: #047857;  /* Emerald 700 */
  --color-primary-light: #ecfdf5;  /* Emerald 50 */

  /* Neutrals */
  --color-bg: #f8fafc;             /* Slate 50 */
  --color-surface: #ffffff;
  --color-border: #e2e8f0;         /* Slate 200 */
  --color-text: #0f172a;           /* Slate 900 */
  --color-text-dim: #64748b;       /* Slate 500 */
  --color-text-muted: #94a3b8;     /* Slate 400 */

  /* Semantic */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-info: #2563eb;

  /* Dark mode (admin) */
  --color-dark-bg: #0b0f14;
  --color-dark-surface: #111827;
  --color-dark-border: #1f2937;
  --color-dark-text: #f9fafb;
  --color-dark-text-dim: #9ca3af;
}
```

### 6.3 Typography

```css
:root {
  --font-sans: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-display: 'Outfit', var(--font-sans);
  --font-mono: 'JetBrains Mono', monospace;

  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
}
```

### 6.4 Component Primitives

| Component | Style |
|-----------|-------|
| Card | `bg-white border border-slate-200 rounded-lg` |
| Button primary | `bg-emerald-600 text-white hover:bg-emerald-700 rounded-md px-4 py-2` |
| Button secondary | `bg-white border border-slate-300 hover:bg-slate-50 rounded-md px-4 py-2` |
| Button ghost | `hover:bg-slate-100 rounded-md px-4 py-2` |
| Input | `border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500` |
| Badge | `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium` |
| Table | `min-w-full divide-y divide-slate-200` |
| Status badge | Color-coded: New=blue, Active=green, Pending=amber, Completed=gray, Lost=red |

### 6.5 What to Avoid

- Excessive gradients
- Glassmorphism
- Too many floating cards
- Huge rounded containers (max `rounded-lg`)
- Excessive icons
- Random colors
- Excessive shadows
- Dense dashboards
- Decorative charts with no purpose

---

## 7. Data Model Changes

### 7.1 New Models

#### Conversation (replaces generic chat for property inquiries)

```python
class Conversation(models.Model):
    """Customer + Property + Seller = Conversation"""
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    listing = models.ForeignKey('Listing', on_delete=models.CASCADE, related_name='conversations')
    seller = models.ForeignKey('ListingOwner', on_delete=models.CASCADE, related_name='conversations')
    status = models.CharField(max_length=20, choices=[
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('talking', 'Talking'),
        ('visit_requested', 'Visit Requested'),
        ('negotiating', 'Negotiating'),
        ('offer_made', 'Offer Made'),
        ('completed', 'Completed'),
        ('lost', 'Lost'),
    ], default='new')
    interest_level = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], default='medium')
    last_interaction = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['customer', 'listing']  # One conversation per customer per property


class ConversationEvent(models.Model):
    """Timeline of interactions within a conversation"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=30, choices=[
        ('viewed', 'Viewed property'),
        ('contacted', 'Contacted seller'),
        ('called', 'Phone call'),
        ('whatsapp', 'WhatsApp message'),
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('note', 'Internal note'),
        ('visit_requested', 'Visit requested'),
        ('visit_scheduled', 'Visit scheduled'),
        ('visit_completed', 'Visit completed'),
        ('offer_made', 'Offer made'),
        ('offer_accepted', 'Offer accepted'),
        ('offer_declined', 'Offer declined'),
        ('status_changed', 'Status changed'),
    ])
    description = models.TextField()
    source = models.CharField(max_length=20, choices=[
        ('website', 'Website'),
        ('call', 'Call'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('internal', 'Internal'),
    ], default='website')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class FollowUp(models.Model):
    """Follow-up reminders for staff/sellers"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='follow_ups')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_ups')
    note = models.TextField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)


class CommissionRule(models.Model):
    """Configurable commission rules"""
    name = models.CharField(max_length=100)
    rule_type = models.CharField(max_length=20, choices=[
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed amount'),
        ('category', 'Category-specific'),
        ('seller', 'Seller-specific'),
        ('custom', 'Custom agreement'),
    ])
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    fixed_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    category = models.CharField(max_length=50, null=True, blank=True)  # house, land, car, etc.
    seller = models.ForeignKey('ListingOwner', on_delete=models.CASCADE, null=True, blank=True, related_name='commission_rules')
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0)  # Higher = evaluated first
    created_at = models.DateTimeField(auto_now_add=True)


class SellerPayment(models.Model):
    """Payment records for sellers"""
    seller = models.ForeignKey('ListingOwner', on_delete=models.CASCADE, related_name='payments')
    listing = models.ForeignKey('Listing', on_delete=models.CASCADE, related_name='seller_payments')
    transaction = models.ForeignKey('Transaction', on_delete=models.SET_NULL, null=True, blank=True)
    gross_amount = models.DecimalField(max_digits=15, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=15, decimal_places=2)
    seller_amount = models.DecimalField(max_digits=15, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    remaining_balance = models.DecimalField(max_digits=15, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=[
        ('momo', 'MTN MoMo'),
        ('airtel', 'Airtel Money'),
        ('bank', 'Bank Transfer'),
        ('cash', 'Cash'),
    ])
    payment_reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('processing', 'Processing'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'),
        ('disputed', 'Disputed'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)


class BusinessExpense(models.Model):
    """Business expense tracking"""
    category = models.CharField(max_length=30, choices=[
        ('marketing', 'Marketing'),
        ('advertising', 'Advertising'),
        ('transport', 'Transport'),
        ('photography', 'Photography'),
        ('video', 'Video'),
        ('staff', 'Staff'),
        ('hosting', 'Hosting'),
        ('office', 'Office'),
        ('other', 'Other'),
    ])
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField()
    description = models.TextField()
    reference = models.CharField(max_length=100, blank=True)
    vendor = models.CharField(max_length=100, blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class DocumentTemplate(models.Model):
    """Templates for document generation"""
    name = models.CharField(max_length=100)
    template_type = models.CharField(max_length=30, choices=[
        ('seller_agreement', 'Seller Agreement'),
        ('listing_authorization', 'Listing Authorization'),
        ('visit_form', 'Visit Form'),
        ('offer_form', 'Offer Form'),
        ('commission_agreement', 'Commission Agreement'),
        ('payment_confirmation', 'Payment Confirmation'),
        ('payment_receipt', 'Seller Payment Receipt'),
        ('handover_form', 'Property Handover Form'),
        ('customer_form', 'Customer Form'),
        ('other', 'Other'),
    ])
    content = models.TextField()  # HTML template with {{placeholders}}
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class GeneratedDocument(models.Model):
    """Generated documents with signature tracking"""
    template = models.ForeignKey(DocumentTemplate, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=200)
    content = models.TextField()  # Final rendered HTML
    listing = models.ForeignKey('Listing', on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    seller = models.ForeignKey('ListingOwner', on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('pending_signature', 'Pending Signature'),
        ('partially_signed', 'Partially Signed'),
        ('completed', 'Completed'),
        ('voided', 'Voided'),
    ], default='draft')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class DocumentSignature(models.Model):
    """Signature tracking for generated documents"""
    document = models.ForeignKey(GeneratedDocument, on_delete=models.CASCADE, related_name='signatures')
    signer_name = models.CharField(max_length=100)
    signer_email = models.EmailField()
    signer_role = models.CharField(max_length=50)  # seller, customer, witness
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('signed', 'Signed'),
        ('declined', 'Declined'),
    ], default='pending')
    signed_at = models.DateTimeField(null=True, blank=True)
    signature_data = models.TextField(blank=True)  # Base64 signature image
    created_at = models.DateTimeField(auto_now_add=True)


class Transaction(models.Model):
    """Simplified transaction record (no escrow, no deal pipeline)"""
    listing = models.ForeignKey('Listing', on_delete=models.CASCADE, related_name='transactions')
    seller = models.ForeignKey('ListingOwner', on_delete=models.CASCADE, related_name='transactions')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    offer = models.OneToOneField('Offer', on_delete=models.SET_NULL, null=True, blank=True)
    agreed_price = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='RWF')
    commission_rule = models.ForeignKey(CommissionRule, on_delete=models.SET_NULL, null=True)
    commission_amount = models.DecimalField(max_digits=15, decimal_places=2)
    seller_entitlement = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], default='pending')
    completed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class AuditLog(models.Model):
    """Unified field-level audit trail"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)  # create, update, delete, status_change
    model_name = models.CharField(max_length=50)
    object_id = models.CharField(max_length=50)
    field_changed = models.CharField(max_length=100, blank=True)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
```

### 7.2 Model Changes to Existing Models

#### Listing — add status lifecycle

```python
# Add to Listing model
status = models.CharField(max_length=20, choices=[
    ('draft', 'Draft'),
    ('submitted', 'Submitted'),
    ('under_review', 'Under Review'),
    ('published', 'Published'),
    ('under_offer', 'Under Offer'),
    ('sold', 'Sold'),
    ('rented', 'Rented'),
    ('completed', 'Completed'),
    ('archived', 'Archived'),
], default='draft')
```

#### Offer — simplify

```python
# Remove: escrow_proposed_percent, financing_type, counter_amount, proposed_closing_date
# Keep: listing, buyer, amount, message, status, created_at
# New status choices: new, reviewing, negotiating, accepted, declined, withdrawn
```

#### User — add roles

```python
# Add to User model
role = models.CharField(max_length=20, choices=[
    ('buyer', 'Buyer'),
    ('seller', 'Seller'),
    ('agent', 'Sales/Agent'),
    ('admin', 'Administrator'),
    ('property_manager', 'Property Manager'),
    ('finance', 'Finance'),
    ('owner', 'Owner'),
    ('tenant', 'Tenant'),
], default='buyer')
```

### 7.3 Models to Deprecate (not delete yet)

| Model | Action |
|-------|--------|
| `TransactionDeal` | Keep table, stop using. Remove from admin/views. |
| `DealDocument` | Keep table, stop using. |
| `ContractAgreement` | Keep table, stop using. Replaced by `GeneratedDocument`. |
| `Property` (legacy) | Keep table, stop using. |
| `SaleProperty` (legacy) | Keep table, stop using. |
| `Lease` | Keep table, stop using. |
| `Unit` | Keep table, stop using. |
| `PropertyImage` (legacy) | Keep table, stop using. |
| `Visit` (legacy) | Keep table, stop using. |
| `CustomerMessage` | Keep table, stop using. |
| `CustRequest` | Keep table, stop using. |
| `Email` | Keep table, stop using. |

---

## 8. API Design

### 8.1 API Structure

```
/api/
├── auth/
│   ├── POST /login/
│   ├── POST /register/
│   ├── POST /logout/
│   ├── GET  /me/
│   └── POST /token/refresh/
├── public/
│   ├── GET  /listings/              # Discovery search
│   ├── GET  /listings/:id/          # Listing detail
│   ├── GET  /categories/
│   ├── GET  /updates/
│   ├── POST /contact/
│   └── POST /inquiries/             # Property inquiry
├── conversations/
│   ├── GET  /conversations/         # List (filtered by role)
│   ├── GET  /conversations/:id/     # Detail + timeline
│   ├── POST /conversations/         # Create
│   ├── PATCH /conversations/:id/    # Update status
│   ├── POST /conversations/:id/events/  # Add timeline event
│   └── POST /conversations/:id/follow-ups/  # Create follow-up
├── visits/
│   ├── GET  /visits/                # Calendar view
│   ├── POST /visits/                # Request visit
│   ├── PATCH /visits/:id/           # Update status
│   └── GET  /visits/today/
├── offers/
│   ├── GET  /offers/
│   ├── POST /offers/
│   └── PATCH /offers/:id/           # Update status
├── properties/
│   ├── GET  /properties/
│   ├── POST /properties/
│   ├── GET  /properties/:id/
│   ├── PATCH /properties/:id/
│   └── DELETE /properties/:id/      # Archive
├── sellers/
│   ├── GET  /sellers/
│   ├── GET  /sellers/:id/
│   ├── GET  /sellers/:id/earnings/
│   └── GET  /sellers/:id/payments/
├── admin/
│   ├── GET  /admin/dashboard/
│   ├── GET  /admin/users/
│   ├── GET  /admin/audit-log/
│   ├── GET  /admin/expenses/
│   ├── POST /admin/expenses/
│   ├── GET  /admin/reports/revenue/
│   ├── GET  /admin/reports/seller-payments/
│   └── GET  /admin/reports/expenses/
├── documents/
│   ├── GET  /documents/
│   ├── POST /documents/generate/
│   ├── GET  /documents/:id/
│   ├── POST /documents/:id/send/
│   └── POST /documents/:id/sign/
└── search/
    └── GET  /search/?q=             # Global search
```

### 8.2 Permission Classes

```python
# urugwiro/permissions.py
from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'owner'

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'owner']

class IsPropertyManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'owner', 'property_manager']

class IsFinance(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'owner', 'finance']

class IsSeller(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'seller'

class IsAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'agent'

class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'owner', 'property_manager', 'finance', 'agent']
```

---

## 9. Phase-by-Phase Implementation Plan

### Phase 0: Infrastructure & Database (Week 1)

**Goal:** PostgreSQL running, separate frontend/backend deployable.

| Task | Details |
|------|---------|
| 0.1 | Add `dj-database-url` to requirements |
| 0.2 | Update `config/settings.py` for Postgres + env vars |
| 0.3 | Create local Postgres (Docker or native) |
| 0.4 | Run all 48 migrations on Postgres |
| 0.5 | Add `Procfile` + `runtime.txt` for Railway/Render |
| 0.6 | Add `vercel.json` for frontend |
| 0.7 | Set up Redis (Upstash) for Channels |
| 0.8 | Set up Cloudinary for media |
| 0.9 | Configure CORS for production domains |
| 0.10 | Set up Sentry for error tracking |
| 0.11 | Create GitHub Actions CI/CD pipeline |
| 0.12 | Test full deploy: push to main → auto-deploy |

**Deliverable:** `main` branch deploys to production automatically.

---

### Phase 1: Foundation (Week 2)

**Goal:** Design system, roles, status lifecycle, remove escrow/Irembo.

| Task | Details |
|------|---------|
| 1.1 | Create design tokens CSS (colors, typography, spacing) |
| 1.2 | Build UI primitives: Button, Badge, Card, Input, Table, Modal |
| 1.3 | Add `property_manager` and `finance` roles to User model |
| 1.4 | Create `urugwiro/permissions.py` with centralized permission classes |
| 1.5 | Update all API views to use permission classes |
| 1.6 | Update Listing status to full lifecycle |
| 1.7 | Remove escrow fields from Offer model |
| 1.8 | Remove Irembo references from frontend |
| 1.9 | Remove deal pipeline from seller/agent dashboards |
| 1.10 | Create migration for all model changes |
| 1.11 | Update navigation types for new roles |

**Deliverable:** Clean foundation, new roles work, escrow gone.

---

### Phase 2: Public Experience (Week 3-4)

**Goal:** Redesigned home, discovery, listing detail, listing card.

| Task | Details |
|------|---------|
| 2.1 | Redesign HomePage: hero, search, featured, categories |
| 2.2 | Redesign DiscoveryPage: filters, sorting, grid/list toggle |
| 2.3 | Build dynamic FilterPane (changes per asset type) |
| 2.4 | Add map view to discovery |
| 2.5 | Redesign ListingCard: image, price, location, specs, favorite |
| 2.6 | Redesign ListingDetail: gallery, overview, specs, features, location, seller |
| 2.7 | Add property actions: Contact, Call, WhatsApp, Visit, Offer, Save, Share |
| 2.8 | Build contact/inquiry capture form |
| 2.9 | Add favorites functionality |
| 2.10 | Mobile-responsive polish for all public pages |
| 2.11 | Add empty states everywhere |

**Deliverable:** Public site matches spec §§4-10.

---

### Phase 3: Conversations & CRM (Week 5-6)

**Goal:** Conversation entity, timeline, follow-ups, customer profiles.

| Task | Details |
|------|---------|
| 3.1 | Create Conversation + ConversationEvent models |
| 3.2 | Create FollowUp model |
| 3.3 | Build conversation API (CRUD, timeline, follow-ups) |
| 3.4 | Build ConversationList page (for sellers/admins) |
| 3.5 | Build ConversationDetail page with timeline |
| 3.6 | Add "Log interaction" action |
| 3.7 | Build CustomerProfile page |
| 3.8 | Add customer activity timeline |
| 3.9 | Add follow-up reminders to seller dashboard |
| 3.10 | Auto-create conversation on inquiry/contact |

**Deliverable:** Full conversation CRM per spec §§11-15.

---

### Phase 4: Visits & Offers (Week 7)

**Goal:** Visits calendar, simplified offers.

| Task | Details |
|------|---------|
| 4.1 | Build Visits calendar page (month/week/day views) |
| 4.2 | Add visit request form (public) |
| 4.3 | Add visit management (admin/seller) |
| 4.4 | Simplify Offer model + API |
| 4.5 | Build Offers page (admin/seller) |
| 4.6 | Add offer form (public) |
| 4.7 | Add offer status management |

**Deliverable:** Visits calendar + simple offers per spec §§16-18.

---

### Phase 5: Money (Week 8-9)

**Goal:** Commission rules, seller payments, expenses, financial reports.

| Task | Details |
|------|---------|
| 5.1 | Create CommissionRule model + admin |
| 5.2 | Create SellerPayment model + API |
| 5.3 | Create BusinessExpense model + API |
| 5.4 | Create Transaction model (simplified) |
| 5.5 | Build commission calculator service |
| 5.6 | Build Seller Earnings page |
| 5.7 | Build Seller Payments page (admin) |
| 5.8 | Build Expenses page (admin/finance) |
| 5.9 | Build Financial Reports page |
| 5.10 | Add CSV/Excel/PDF export |
| 5.11 | Add audit logging for all financial actions |

**Deliverable:** Full financial management per spec §§26-30.

---

### Phase 6: Owner Dashboard (Week 10)

**Goal:** Executive business overview.

| Task | Details |
|------|---------|
| 6.1 | Build OwnerDashboard layout |
| 6.2 | Business overview cards (properties, sellers, customers, leads, visits, offers) |
| 6.3 | Financial overview (revenue, earnings, obligations, paid, outstanding, expenses, net) |
| 6.4 | Revenue over time chart |
| 6.5 | Properties added/completed chart |
| 6.6 | Leads/offers/visits over time charts |
| 6.7 | Seller financial summary table |
| 6.8 | Recent activity feed |

**Deliverable:** Owner can answer all spec questions per §25.

---

### Phase 7: Documents & Signatures (Week 11)

**Goal:** Template-based document generation, simple signing.

| Task | Details |
|------|---------|
| 7.1 | Create DocumentTemplate model + admin |
| 7.2 | Create GeneratedDocument + DocumentSignature models |
| 7.3 | Build template editor (admin) |
| 7.4 | Build document generator service |
| 7.5 | Build Documents page (admin) |
| 7.6 | Build signature workflow (send → sign → store) |
| 7.7 | Add signature pad component |
| 7.8 | Seed default templates (seller agreement, offer form, etc.) |

**Deliverable:** Document generation + signing per spec §§31-32.

---

### Phase 8: Polish (Week 12)

**Goal:** Empty states, mobile, notifications, audit log, analytics.

| Task | Details |
|------|---------|
| 8.1 | Audit all pages for empty states |
| 8.2 | Mobile responsiveness audit |
| 8.3 | Notification system polish |
| 8.4 | Unified audit log page |
| 8.5 | Property analytics (views, saves, contacts, etc.) |
| 8.6 | Business analytics dashboard |
| 8.7 | Global search (properties, customers, sellers, conversations) |
| 8.8 | Performance audit (lazy loading, image optimization) |
| 8.9 | Security audit (permissions, data exposure) |
| 8.10 | End-to-end testing of all major workflows |

**Deliverable:** Production-ready polish.

---

## 10. Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during SQLite → Postgres migration | High | Backup SQLite DB first; test migration on staging |
| WebSocket doesn't work in production | Medium | Use Redis (Upstash); test locally with Docker Redis |
| Media files break after deploy | Medium | Use Cloudinary/S3; never serve from local disk in production |
| CORS issues between frontend/backend | Low | Configure `CORS_ALLOWED_ORIGINS` properly; test with curl |
| Scope creep | High | Follow phases strictly; don't skip ahead |
| Existing data doesn't fit new models | Medium | Write data migration scripts; test on copy of DB |
| Performance degradation with many listings | Medium | Add database indexes; use `select_related`/`prefetch_related` |
| Role-based access holes | High | Centralized permission classes; test every endpoint with every role |

---

## 11. Success Criteria

The redesign is complete when:

- [ ] PostgreSQL is the only database (SQLite removed)
- [ ] Frontend and backend deploy separately (Vercel + Railway/Render)
- [ ] CI/CD pipeline deploys on every push to main
- [ ] Customer can: find → understand → save → contact → talk → visit → offer → track
- [ ] Seller can: create listing → manage → see conversations → manage visits → see offers → track earnings
- [ ] Staff can: manage properties, customers, sellers, conversations, visits, offers, documents
- [ ] Owner can: see everything — properties, owners, interest, conversations, offers, transactions, revenue, obligations, payments, expenses, performance
- [ ] No escrow, no Irembo, no deal pipeline in the UI
- [ ] All pages have meaningful empty states
- [ ] Mobile experience is excellent
- [ ] Design system is consistent and professional

---

## Appendix A: Environment Variables Reference

### Backend (.env)

```
# Database
DATABASE_URL=postgres://user:pass@host:5432/urugwiro

# Redis
REDIS_URL=redis://:pass@host:6379

# Django
SECRET_KEY=<generate-with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
ALLOWED_HOSTS=api.urugwiro.com,localhost,127.0.0.1

# CORS
CORS_ALLOWED_ORIGINS=https://urugwiro.com,https://www.urugwiro.com

# Media
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Email
SENDGRID_API_KEY=SG.xxxx
DEFAULT_FROM_EMAIL=noreply@urugwiro.com

# Sentry
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz

# AI (optional)
ANTHROPIC_API_KEY=sk-ant-xxx
```

### Frontend (.env)

```
VITE_API_BASE_URL=https://api.urugwiro.com/api
VITE_BACKEND_URL=https://api.urugwiro.com
VITE_WS_URL=wss://api.urugwiro.com/ws
```

---

## Appendix B: Database Index Strategy

```python
# Add to models for performance

class Listing(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['status', 'category']),
            models.Index(fields=['price']),
            models.Index(fields=['district', 'sector']),
            models.Index(fields=['created_at']),
            models.Index(fields=['owner', 'status']),
        ]

class Conversation(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['seller', 'status']),
            models.Index(fields=['customer', 'listing']),
            models.Index(fields=['last_interaction']),
        ]

class ListingMedia(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['listing', 'order']),
        ]
```

---

*End of plan.*
