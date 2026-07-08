# RentNest 🏠

**Find & List Rental Properties with Ease**

RentNest is a backend REST API for a rental property marketplace. Landlords list properties and manage rental requests. Tenants browse listings, submit requests, and leave reviews. Admins oversee the platform.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API framework |
| TypeScript | Type safety |
| PostgreSQL + Prisma | Database & ORM |
| JWT | Authentication |
| Zod | Input validation |
| Swagger | API documentation |

## Project Structure (Modular Pattern)

```
src/
├── config/          # Environment, database, Swagger
├── middleware/      # Auth, validation, error handling
├── modules/
│   ├── auth/        # Register, login, profile
│   ├── categories/  # Property categories
│   ├── properties/  # Public browse + landlord CRUD
│   ├── rentals/     # Rental requests
│   ├── reviews/     # Tenant reviews
│   ├── admin/       # Admin management
│   └── payments/    # Stripe payment integration
├── routes/          # Route aggregator
├── types/           # Shared TypeScript types
└── utils/           # Helpers (ApiError, responses)
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd rentnest-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (admin, demo users, categories)
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `ADMIN_EMAIL` | Admin email for seeding |
| `ADMIN_PASSWORD` | Admin password for seeding |
| `STRIPE_SECRET_KEY` | Stripe secret key (required) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (returned in payment create response) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (for `/api/payments/webhook/stripe`) |

## Admin Credentials

| Field | Value |
|---|---|
| Email | `admin@rentnest.com` |
| Password | `admin123` |

## Demo Accounts (Seeded)

| Role | Email | Password |
|---|---|---|
| Landlord | `landlord@rentnest.com` | `landlord123` |
| Tenant | `tenant@rentnest.com` | `tenant123` |

## API Documentation

- **Swagger UI**: `http://localhost:5000/api-docs`
- **Postman Collection**: Import `postman/RentNest.postman_collection.json`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register (TENANT/LANDLORD) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user profile |

### Properties (Public)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/properties` | Browse with filters |
| GET | `/api/properties/:id` | Property details |
| GET | `/api/categories` | All categories |

### Landlord
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/landlord/properties` | Create listing |
| GET | `/api/landlord/properties` | My listings |
| PUT | `/api/landlord/properties/:id` | Update listing |
| DELETE | `/api/landlord/properties/:id` | Delete listing |
| GET | `/api/landlord/requests` | Rental requests |
| PATCH | `/api/landlord/requests/:id` | Approve/reject |

### Rentals (Tenant)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rentals` | Submit request |
| GET | `/api/rentals` | My requests |
| GET | `/api/rentals/:id` | Request details |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reviews` | Create review |
| GET | `/api/reviews/property/:propertyId` | Property reviews |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Platform stats |
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/users/:id` | Ban/unban user |
| GET | `/api/admin/properties` | All properties |
| GET | `/api/admin/rentals` | All rental requests |

### Payments (Stripe)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/create` | Create Stripe PaymentIntent for approved rental |
| POST | `/api/payments/confirm` | Verify payment status after Stripe confirmation |
| POST | `/api/payments/webhook/stripe` | Stripe webhook (payment_intent.succeeded / failed) |
| GET | `/api/payments` | Payment history |
| GET | `/api/payments/:id` | Payment details |

#### Stripe Payment Flow
1. Tenant submits rental request → Landlord approves
2. `POST /api/payments/create` with `{ rentalRequestId, provider: "STRIPE" }`
3. Response includes `clientSecret` — use with Stripe.js or test cards in dashboard
4. After payment succeeds, call `POST /api/payments/confirm` with `{ paymentId, transactionId }`
5. Rental status moves to `ACTIVE`; property status becomes `RENTED`

**Test card:** `4242 4242 4242 4242` (any future expiry, any CVC)

## Error Response Format

All errors return structured JSON:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorDetails": [{ "path": ["email"], "message": "Invalid email address" }]
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Properties retrieved successfully",
  "data": {}
}
```

## Rental Request Flow

```
PENDING → APPROVED → (Payment) → ACTIVE → COMPLETED
       ↘ REJECTED
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Deployment

Deploy to Vercel or Render. Set environment variables in your hosting dashboard.

## License

ISC
