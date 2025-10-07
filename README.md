# Bartender Inventory System

A comprehensive inventory management solution for bars built with Next.js 14, TypeScript, Prisma, and tRPC.

## 🚀 Features

- **No Authentication Required** - Access all features immediately without login barriers
- **Type-Safe API** - Full-stack type safety with tRPC
- **Database Management** - PostgreSQL with Prisma ORM
- **Comprehensive Testing** - Unit tests for models and API routes
- **Modern UI** - Tailwind CSS with responsive design

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma ORM
- **Database**: PostgreSQL
- **Testing**: Vitest, Testing Library
- **Development**: ESLint, TypeScript

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your database:
   ```bash
   # Copy environment variables
   cp .env.example .env
   
   # Update DATABASE_URL in .env with your PostgreSQL connection string
   # Example: DATABASE_URL="postgresql://username:password@localhost:5432/bartender_inventory"
   ```

4. Generate Prisma client and run migrations:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Seed the database with sample data:
   ```bash
   npm run db:seed
   ```

## 🚀 Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

For watch mode during development:

```bash
npm run test:watch
```

## 📊 Database Schema

The system includes the following core models:

- **Ingredients** - Bar inventory items with pricing and categorization
- **Suppliers** - Vendor management with contact information
- **Locations** - Storage locations (bar, cabinet, hobbit, etc.)
- **Inventory Snapshots** - Historical inventory counts and values
- **Invoices & Invoice Lines** - Purchase tracking
- **Reorder Drafts** - Automated reorder suggestions
- **Email Templates** - Customizable supplier communications
- **Restaurant Profiles** - Business configuration

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## 🌟 Key Features Implemented

### ✅ Project Setup and Core Infrastructure
- Next.js 14+ with TypeScript configuration
- Prisma ORM with comprehensive PostgreSQL schema
- tRPC with type-safe API routes and client integration
- Tailwind CSS with responsive design system
- Complete testing infrastructure with Vitest

### ✅ Database Schema Implementation
- All core models with proper relationships and constraints
- Database indexing for optimal performance
- Seed script with sample data
- Migration system for schema changes

### ✅ Unit Tests
- Comprehensive test coverage for database models
- API route testing with mocked Prisma client
- Test utilities and factories for consistent test data
- All 22 tests passing

## 🔐 Authentication Status

**Currently**: No authentication required - all endpoints are publicly accessible for development ease.

**Future**: Authentication can be easily added back by:
1. Uncommenting Supabase configuration
2. Updating tRPC procedures to use `protectedProcedure` where needed
3. Adding User model back to Prisma schema

## 🚧 Next Steps

The foundation is complete! You can now:

1. **Implement UI Components** - Build ingredient management interfaces
2. **Add Inventory Tracking** - Create inventory snapshot forms
3. **Supplier Management** - Build supplier CRUD interfaces
4. **Reporting Features** - Add analytics and reporting
5. **Mobile Optimization** - Enhance mobile experience

## 📝 API Endpoints

All tRPC endpoints are available at `/api/trpc/`:

- `ingredients.*` - Ingredient management
- `suppliers.*` - Supplier management  
- `inventory.*` - Inventory tracking
- `locations.*` - Location management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
