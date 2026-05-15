# dea.fm

A personalized music diary and social feed centered around Dea, combining elements of Spotify, Tumblr, Pinterest, and Letterboxd.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database)
- **Integrations**: Spotify Web API
- **Animations**: Framer Motion

## Features

- Spotify OAuth authentication
- Create music posts with song details, ratings, mood tags, and captions
- Chronological feed of posts
- Comment and like system
- Customizable themes, layouts, and aesthetics
- Search and filter posts
- Privacy settings for posts

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```
4. Set up Supabase project and run the schema in `src/sql/schema.sql`
5. Run the development server: `npm run dev`

## Database Schema

Run the SQL in `src/sql/schema.sql` to set up the database tables.

## Deployment

Deploy on Vercel or your preferred platform. Ensure environment variables are set.
