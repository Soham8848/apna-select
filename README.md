# Modern Dropshipping E-commerce

A luxury minimalist e-commerce application built with Next.js 15, Tailwind CSS, Supabase, and Stripe.

## Project Setup

### 1. Supabase Setup

1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  Once created, go to **Project Settings** -> **API**.
3.  Copy the `Project URL` and `anon public` key.
4.  Create a `.env.local` file in the root of the project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

## Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Styling**: Tailwind CSS v4, Shadcn/UI
-   **State**: Zustand
-   **DB/Auth**: Supabase
-   **Icons**: Lucide React
-   **Design**: Luxury Minimalist (Black, White, Gold #D4AF37)
