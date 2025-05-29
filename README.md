# Portfolio Blog - Next.js with Appwrite

A modern portfolio and blog website built with Next.js and Appwrite. This project includes authentication, blog post management, image uploads, and responsive design.

## Features

- 🔒 User authentication with Appwrite
- 📝 Blog post creation and management
- 🖼️ Image uploads with progress tracking
- 📱 Fully responsive design
- 🎨 Dark/light mode support
- 🚀 SEO optimized

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Appwrite (auth, database, storage)
- **UI Components**: Shadcn UI

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Appwrite Account

### Configuration

1. Create an `.env.local` file at the root of your project with the following variables:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint.com/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID=your-blog-collection-id
NEXT_PUBLIC_APPWRITE_BLOG_BUCKET_ID=your-blog-bucket-id
```

2. Set up your Appwrite database collection with the following fields:
   - `title` (string)
   - `content` (string)
   - `slug` (string)
   - `imageUrl` (string)
   - `authorName` (string)
   - `authorId` (string)
   - `createdAt` (string - ISO date)
   - `updatedAt` (string - ISO date)
   - `status` (string - "draft" or "published")

3. Set up your Appwrite storage bucket for blog images

### Running the Development Server

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Authentication Flow

1. Login/Registration with email and password
2. Session management handled by Appwrite
3. Protected routes for dashboard and administrative actions

## Blog Management

- Create, edit, and publish blog posts
- Upload images with progress tracking
- Markdown support for blog content
- SEO optimized blog posts with OpenGraph and Twitter card support

## Deployment

This project can be deployed on any platform that supports Next.js applications, such as:
- Vercel
- Netlify
- AWS Amplify
- Self-hosted servers

Make sure to configure the environment variables on your deployment platform.

## Migration Notes

This project was originally built with Firebase and has been migrated to Appwrite. For details about the migration process, see:
- [Firebase to Appwrite Migration Guide](./FIREBASE_TO_APPWRITE_MIGRATION.md)
- [Appwrite Migration Status](./APPWRITE_MIGRATION_STATUS.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
