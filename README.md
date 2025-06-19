# RestoBook - Restaurant Booking System

A comprehensive restaurant reservation and management platform built with Next.js, React, and modern web technologies.

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd resto-book
yarn install

# Setup database
npx prisma generate
npx prisma migrate dev
yarn db:seed
yarn db:seed:subscriptions

# Start development
yarn dev
```

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Frontend Structure](#frontend-structure)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)

## Overview

RestoBook is a multi-tenant restaurant booking platform that serves four types of users:

- **Super Admins** - Platform management
- **Restaurant Owners** - Restaurant and staff management
- **Reception Staff** - Daily operations and guest services
- **Customers** - Restaurant discovery and bookings

## Recent Updates & Improvements

### Enhanced Customer Experience (Latest Release)

#### 🎯 **Improved Customer Journey**

- **New Landing Experience**: Customers now land on the restaurants page after login instead of dashboard
- **Public Restaurant Browsing**: Users can explore restaurants without creating an account
- **Featured Restaurants**: Landing page showcases hand-picked featured restaurants
- **Seamless Authentication Flow**: Better user experience for both guests and logged-in users

#### 🔧 **Authentication & Navigation Fixes**

- **Image Loading Fix**: Fixed middleware to allow restaurant images for unauthenticated users
- **Smart Navigation**: Added dropdown menus for easy access to customer features
- **Consistent UI**: Unified authentication status display across all pages
- **Mobile Responsive**: Full functionality on all device sizes

#### 🎨 **Enhanced Customer Dashboard**

- **Hero Restaurant Discovery**: Redesigned "Find Restaurants" card with premium gradient design
- **Improved Visual Hierarchy**: Clear distinction between primary and secondary actions
- **Better User Flow**: Streamlined access to reservations, profile, and quick booking
- **Modern Design**: Updated with smooth animations and enhanced visual appeal

#### 📱 **Public Access Features**

- **Restaurant Browsing**: Browse restaurants, view details, and see menus without login
- **Smart Booking Flow**: Prompted to sign in only when ready to make a reservation
- **Featured Content**: Showcase of top restaurants on the landing page
- **Responsive Design**: Optimized experience across all devices

#### 🗄️ **Database Migration**

- **PostgreSQL Integration**: Migrated from SQLite to PostgreSQL for better scalability
- **Production Ready**: Enhanced database performance and concurrent user support
- **Improved Data Integrity**: Better transaction handling and data consistency
- **Cloud Deployment**: Ready for production deployment with managed PostgreSQL services

## Features

### Core Features

- **User Authentication** - Role-based access with NextAuth.js
- **Restaurant Management** - Profiles, images, tables, staff
- **Reservation System** - Real-time booking with status tracking
- **Multi-role Dashboards** - Customized interfaces for each user type
- **Table Management** - Dynamic table assignment and availability
- **Staff Assignment** - Reception staff management per restaurant
- **File Uploads** - Restaurant image management
- **Analytics** - Booking statistics and performance metrics

### Business Features

- **Subscription Plans** - Tiered pricing for restaurants
- **Payment Integration** - Billing and subscription management
- **Multi-restaurant Support** - Single platform for multiple venues
- **Real-time Updates** - Live booking status and notifications
- **Search & Filtering** - Restaurant discovery by cuisine, location, etc.

## Tech Stack

**Frontend**

- Next.js 15.3.3 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 3.4.0
- Radix UI components

**Backend**

- Next.js API Routes
- NextAuth.js authentication
- Prisma ORM 6.9.0
- PostgreSQL database
- Zod validation
- bcryptjs password hashing

**Development**

- ESLint + Prettier
- Formidable file uploads
- React Hook Form
- Date-fns utilities

## User Roles

### Super Admin

**Platform oversight and management**

- Manage all users and restaurants
- Approve/reject restaurant applications
- Platform-wide analytics and reporting
- Subscription and billing management
- System configuration

### Restaurant Admin (Owner)

**Restaurant business management**

- Manage restaurant profile and details
- Configure tables and layout
- Assign and manage reception staff
- View restaurant analytics
- Handle subscription and billing

### Reception Admin (Staff)

**Daily operations and guest services**

- Handle daily reservations
- Check-in guests and manage tables
- Create manual bookings for walk-ins
- Customer support and special requests
- Update reservation statuses

### Customer

**Restaurant discovery and booking**

- Browse restaurants without account requirement
- Discover featured restaurants on landing page
- Make table reservations (requires authentication)
- Access comprehensive dashboard with enhanced navigation
- Manage personal profile and preferences
- View booking history and upcoming reservations
- Quick booking functionality for fast reservations
- Add special requests to reservations
- Mobile-optimized experience with dropdown navigation

## Database Schema

### Core Models

**User**

```typescript
{
  id: string;
  name: string;
  email: string(unique);
  password: string;
  role: SUPER_ADMIN | RESTAURANT_ADMIN | RECEPTION_ADMIN | CUSTOMER;
  createdAt: DateTime;
}
```

**Restaurant**

```typescript
{
  id: string
  name: string
  description: string
  location: string
  region: string
  district: string
  address: string
  phone: string
  email: string
  website: string
  images: string (JSON array)
  openingHours: string
  priceRange: string
  cuisine: string
  capacity: number
  isActive: boolean
  isFeatured: boolean
  ownerId: string
}
```

**Table**

```typescript
{
  id: string;
  number: string;
  capacity: number;
  restaurantId: string;
  isActive: boolean;
}
```

**Reservation**

```typescript
{
  id: string;
  userId: string;
  restaurantId: string;
  tableId: string;
  date: DateTime;
  time: string;
  partySize: number;
  status: PENDING | CONFIRMED | CHECKED_IN | COMPLETED | CANCELLED | NO_SHOW;
  specialNotes: string;
  createdAt: DateTime;
}
```

**ReceptionistAssignment**

```typescript
{
  id: string;
  userId: string;
  restaurantId: string;
  createdAt: DateTime;
}
```

### Relationships

- User → Restaurant (one-to-many, owner relationship)
- Restaurant → Table (one-to-many)
- Restaurant → Reservation (one-to-many)
- User → Reservation (one-to-many, customer relationship)
- User → ReceptionistAssignment (one-to-many)
- Restaurant → ReceptionistAssignment (one-to-many)

## API Documentation

### Authentication

```
POST /api/auth/signup        # User registration
POST /api/auth/signin        # User login
GET  /api/auth/session       # Get current session
```

### Restaurants

```
GET  /api/restaurants        # List public restaurants
GET  /api/restaurants/[id]   # Get restaurant details
POST /api/restaurants/profile # Create restaurant
PUT  /api/restaurants/profile # Update restaurant
POST /api/restaurants/upload-images # Upload images
```

### Reservations

```
GET   /api/reservations              # List reservations (role-filtered)
POST  /api/reservations              # Create reservation
GET   /api/reservations/[id]         # Get reservation details
PATCH /api/reservations/[id]/status  # Update status
GET   /api/reservations/restaurant   # Restaurant reservations
```

### Tables

```
GET    /api/tables     # List restaurant tables
POST   /api/tables     # Create table
PUT    /api/tables/[id] # Update table
DELETE /api/tables/[id] # Delete table
```

### Staff Management

```
GET    /api/staff       # List restaurant staff
POST   /api/staff       # Add staff member
DELETE /api/staff/[id]  # Remove staff
```

### Admin (Super Admin only)

```
GET    /api/admin/analytics        # Platform analytics
GET    /api/admin/users            # List all users
GET    /api/admin/users/[id]       # Get user details
PUT    /api/admin/users/[id]       # Update user
DELETE /api/admin/users/[id]       # Delete user
GET    /api/admin/restaurants      # List all restaurants
PUT    /api/admin/restaurants/[id] # Update restaurant
```

### Reception

```
GET  /api/reception/stats          # Dashboard statistics
POST /api/reception/manual-booking # Create manual booking
GET  /api/reception/restaurant-info # Restaurant info
```

## Frontend Structure

### Page Routes

```
/                          # Landing page
/login                     # Authentication
/signup                    # User registration
/restaurants               # Public restaurant listings
/restaurants/[id]          # Restaurant details
/dashboard/customer        # Customer dashboard
/dashboard/restaurant-admin # Restaurant owner dashboard
/dashboard/reception-admin  # Reception staff dashboard
/dashboard/super-admin     # Platform admin dashboard
/pricing                   # Subscription plans
/checkout                  # Payment processing
```

### Component Structure

```
components/
├── ui/                    # Base UI components (Radix UI)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx  # NEW: Account dropdown navigation
│   └── ...
├── dashboard/             # Dashboard components
│   ├── stats-card.tsx
│   ├── activity-feed.tsx
│   └── ...
├── forms/                 # Form components
│   ├── reservation-form.tsx
│   ├── restaurant-form.tsx
│   └── ...
└── restaurant/            # Restaurant components
    ├── restaurant-card.tsx
    ├── table-selector.tsx
    └── ...
```

### Dashboard Features by Role

**Customer Dashboard**

- **Enhanced Restaurant Discovery**: Premium-designed hero card with gradient background
- Personal profile management with easy access via dropdown menu
- Reservation history and upcoming bookings with improved layout
- Quick booking interface for fast reservations
- **Improved Navigation**: Account dropdown with Dashboard, Reservations, Profile, and Quick Book
- **Bidirectional Access**: Easy navigation between dashboard and restaurant browsing
- **Mobile-Responsive Design**: Optimized for all screen sizes
- Visual hierarchy emphasizing primary restaurant discovery action

**Restaurant Admin Dashboard**

- Restaurant profile management
- Table configuration and layout
- Staff management and assignments
- Reservation overview and management
- Analytics and performance metrics
- Subscription and billing

**Reception Admin Dashboard**

- Today's reservations overview
- Real-time table status
- Guest check-in interface
- Manual booking creation
- Quick actions and notifications

**Super Admin Dashboard**

- Platform overview and metrics
- User management interface
- Restaurant approval and management
- System analytics and reporting
- Subscription oversight

## Installation Guide

### Prerequisites

- Node.js 18 or higher
- Yarn package manager
- PostgreSQL 12 or higher
- Git

### Step-by-Step Setup

1. **Clone Repository**

```bash
git clone <repository-url>
cd resto-book
```

2. **Install Dependencies**

```bash
yarn install
```

3. **Environment Setup**
   Create `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/restobook"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. **Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed with demo data
yarn db:seed
```

5. **Start Development Server**

```bash
yarn dev
```

Visit `http://localhost:3000` to access the application.

### Demo Accounts (After Seeding)

- **Super Admin**: `super@demo.com` / `password123`
- **Restaurant Admin**: `admin@demo.com` / `password123`
- **Reception Admin**: `reception@demo.com` / `password123`
- **Customer**: `customer@demo.com` / `password123`

## Configuration

### Required Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/restobook"  # PostgreSQL connection
NEXTAUTH_URL="http://localhost:3000"      # App URL
NEXTAUTH_SECRET="your-secret-here"        # JWT secret
```

### Optional Environment Variables

```env
UPLOADTHING_SECRET=""                     # File upload service
UPLOADTHING_APP_ID=""                     # File upload app ID
SMTP_HOST=""                              # Email service
SMTP_PORT=""                              # Email port
SMTP_USER=""                              # Email username
SMTP_PASS=""                              # Email password
```

### Database Configuration

The system uses PostgreSQL as the primary database. Make sure you have PostgreSQL installed and running:

**Local Development Setup:**

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb restobook

# Update your .env.local with the connection string
DATABASE_URL="postgresql://username:password@localhost:5432/restobook"
```

**Production Setup:**

- Use managed PostgreSQL services like AWS RDS, Google Cloud SQL, or Supabase
- Update the `DATABASE_URL` with your production database credentials

## Development

### Project Structure

```
resto-book/
├── app/                   # Next.js App Router
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Auth pages
│   └── restaurants/      # Public pages
├── components/           # React components
├── lib/                  # Utilities
├── prisma/              # Database schema
├── services/            # Business logic
├── types/               # TypeScript types
└── public/              # Static assets
```

### Development Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
yarn db:seed      # Seed database with demo data
```

### Code Standards

- **TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Functional components** with React hooks
- **Server-side validation** with Zod schemas
- **Error handling** with try-catch blocks
- **Responsive design** with Tailwind CSS

### Authentication Flow

1. User submits credentials via login form
2. NextAuth.js validates credentials against database
3. JWT token created with user ID and role
4. Middleware protects routes based on user role
5. Session data available throughout application

### File Upload System

Restaurant images are stored in `public/uploads/restaurants/` with the following structure:

```
public/uploads/restaurants/
├── restaurant-id-1/
│   ├── image1.jpg
│   └── image2.jpg
└── restaurant-id-2/
    └── image1.jpg
```

## Deployment

### Production Build

```bash
yarn build
yarn start
```

### Environment Setup

Update environment variables for production:

```env
DATABASE_URL="postgresql://username:password@your-db-host:5432/restobook"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="strong-production-secret"
```

### Database Migration

```bash
npx prisma migrate deploy
```

### Recommended Hosting

- **Vercel** - Optimal for Next.js applications
- **Railway** - Good for full-stack apps with database
- **DigitalOcean** - VPS deployment option

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] File upload directories created
- [ ] SSL certificate configured
- [ ] Error monitoring setup
- [ ] Backup strategy implemented

## Support

For questions and support:

1. Check the documentation
2. Review the demo accounts and sample data
3. Examine the API endpoints and responses
4. Contact: dbabokhonov@gmail.com 

---

**Built with ❤️ using Next.js, React, and modern web technologies**
