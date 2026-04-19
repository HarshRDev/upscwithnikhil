# UPSC Platform - AI Agent Guidelines

An educational platform for UPSC exam preparation with courses, articles, admin features, and student performance tracking.

## Quick Start

```bash
npm install
npm run dev        # DEV: http://localhost:3000
npm run build      # PROD build
npm run lint       # Lint with ESLint (Next.js defaults)
```

**Environment**: Create `.env.local` with Supabase credentials (see `.env.local` exists but isn't committed)

## Code Style & Structure

### TypeScript & React
- **Framework**: Next.js App Router (not Pages Router) with TypeScript
- **Type safety**: Use proper types instead of `any`. Example: `articles: Article[]` not `any[]`
- **Components**: PascalCase, stored in `app/components/`
- **Path aliases**: Use `@/*` for imports pointing to `app/*`

### Styling
- **Framework**: Tailwind CSS v4 + PostCSS
- **Brand colors**: `#F5EBDD` (cream bg), `#0F172A` (dark text), gradient accents (pink/purple/cyan)
- **Responsive**: Use Tailwind breakpoints (`md:`, `lg:`, etc.)

### API Routes
- **Location**: `app/api/[feature]/route.ts`
- **Pattern**: REST methods (GET, POST) per route file
- **Style**: Comment headers for clarity
  ```typescript
  /* =========================
     GET → Fetch all courses
  ========================= */
  ```
- **Error handling**: Try-catch with Response.json for consistency
- **Query**: Supabase client from `app/lib/supabaseClient.ts`

### Forms & Validation
- **Form library**: react-hook-form
- **Validation**: zod schemas
- **HTTP client**: axios

## Database & Client

**Supabase Client**: Located in `app/lib/supabaseClient.ts`
- Queried from API routes
- Uses `.select()`, `.eq()`, `.insert()`, `.order()` chaining
- All published content filters: `.eq("is_published", true)`

**Required Database Tables**:
- `articles` - Title, content, is_published, created_at
- `courses` - Title, description, price, is_published, created_at
- `test_series` - Title, description, price, total_tests, duration, is_published, created_at
- `mcqs` - Question, option_a/b/c/d, correct_answer, explanation, test_series_id, created_at
- `student_responses` - Student_id, test_series_id, mcq_id, student_answer, is_correct, created_at
- `users` - Id, email, name, created_at (for student tracking)

## Features & Endpoints

### Admin Panel (`app/admin/page.tsx`)
Tabbed interface with:
- **Articles Tab**: Create/upload articles
- **Courses Tab**: Create courses with pricing
- **Test Series Tab**: Create test series with configurations
- **MCQs Tab**: Upload MCQs in JSON format
- **Students Tab**: View all students and their profiles

### MCQ Upload Format
Admin uploads MCQs as JSON array:
```json
[
  {
    "question": "What is the capital of India?",
    "option_a": "Mumbai",
    "option_b": "New Delhi",
    "option_c": "Kolkata",
    "option_d": "Bangalore",
    "correct_answer": "B",
    "explanation": "New Delhi is the capital of India"
  }
]
```

### Student Dashboard (`app/dashboard/page.tsx`)
- **Scorecard**: Total questions, correct, incorrect, accuracy %
- **Completion Bars**: Overall progress, correct rate, error rate
- **Test Series Performance**: Individual test breakdown

### Admin Student Profile (`app/admin/student/[id]/page.tsx`)
- View individual student stats
- See detailed answer history
- Track performance over time
- View explanations for missed questions

## Architecture Notes

**Data flow**:
1. Page component (`app/page.tsx`) fetches from API routes at build time
2. API routes (`app/api/*/route.ts`) query Supabase and return JSON
3. Components render the data with Tailwind styling

**Publish workflow**: Articles and courses marked as `is_published: true` in database

**Student tracking**:
- Student responses sent to `/api/student-responses` (POST)
- Admin views tracked in `/api/admin/students` (GET)
- Performance stats calculated in real-time

## Common Tasks

**Adding API endpoint**: Create `app/api/[feature]/route.ts` with GET/POST handlers
**Creating component**: Add PascalCase file to `app/components/`, export default React component
**Fetching data in components**: Use async server components or API routes (no client-side env vars exposed)
**Database operations**: Always use Supabase client and handle errors consistently
**Uploading MCQs**: Format as JSON array and paste into admin MCQ tab
**Viewing student performance**: Navigate to Admin Panel → Students → View Profile

## Important Files

- `package.json` - Dependencies & build scripts
- `tsconfig.json` - TypeScript config with `@/*` alias
- `tailwind.config.ts` - Tailwind customization (if needed)
- `app/lib/supabaseClient.ts` - Supabase initialization
- `app/layout.tsx` - Global layout & styles
- `app/page.tsx` - Homepage entry point
- `app/admin/page.tsx` - Admin control center (articles, courses, tests, MCQs, students)
- `app/admin/student/[id]/page.tsx` - Individual student performance tracking
- `app/dashboard/page.tsx` - Student learning dashboard
- `app/api/mcqs/route.ts` - MCQ CRUD operations
- `app/api/student-responses/route.ts` - Track student answers
- `app/api/admin/students/route.ts` - Admin student management

## Linting & Conventions

- ESLint: Next.js core-web-vitals + TypeScript rules
- Run `npm run lint` to check
- Ignored patterns: `.next/`, `out/`, `build/`, `next-env.d.ts`
