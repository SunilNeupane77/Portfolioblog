# Firebase to Appwrite Migration

This document provides guidance for migrating from Firebase to Appwrite in this project.

## Completed Migration Steps

1. Removed Firebase dependencies and added Appwrite SDK
2. Created Appwrite configuration file (`src/lib/appwrite.ts`)
3. Updated authentication hook to use Appwrite instead of Firebase
4. Updated the new blog post page to use Appwrite storage and database
5. Created environment variables template for Appwrite configuration

## Steps to Complete Migration

1. **Set Up Appwrite Project**
   - Create an account at [Appwrite Cloud](https://cloud.appwrite.io) or set up a self-hosted instance
   - Create a new project
   - Create a new database and collection for blog posts
   - Create a storage bucket for blog images
   - Set up authentication methods (email/password, social providers, etc.)
   - Configure appropriate security rules for database and storage access

2. **Update Environment Variables**
   - Update the `.env.local` file with your actual Appwrite project details:
     ```
     NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
     NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
     NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID=your-blog-collection-id
     NEXT_PUBLIC_APPWRITE_BLOG_BUCKET_ID=your-blog-bucket-id
     ```

3. **Database Schema Setup**
   - Create a collection in your Appwrite database with these fields:
     - `title` (string)
     - `content` (string)
     - `slug` (string)
     - `imageUrl` (string)
     - `authorName` (string)
     - `authorId` (string)
     - `createdAt` (string)
     - `updatedAt` (string) 
     - `status` (string)

4. **Data Migration**
   - If you have existing blog posts in Firebase, create a migration script to move data to Appwrite

5. **Update Remaining Firebase References**
   - Check all files for Firebase imports and replace them with Appwrite equivalents
   - Common areas to check:
     - Authentication flows (login, signup, password reset)
     - Blog listing pages
     - Profile management
     - Admin functionality
   
6. **Testing**
   - Test all functionality to ensure the migration is complete and working correctly
   - Test user authentication flows
   - Test creating, reading, updating, and deleting blog posts
   - Test image uploads and retrieval

## Appwrite vs Firebase Equivalents

| Firebase Feature   | Appwrite Equivalent           | Notes                                     |
|--------------------|-------------------------------|-------------------------------------------|
| Authentication     | Account API                   | `account` from Appwrite client            |
| Firestore          | Databases API                 | `databases` from Appwrite client          |
| Storage            | Storage API                   | `storage` from Appwrite client            |
| Firebase Functions | Appwrite Functions            | Server-side functions in Appwrite         |
| Realtime Database  | Appwrite Realtime             | Use `client.subscribe()` for realtime     |

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Account API](https://appwrite.io/docs/client/account)
- [Appwrite Database API](https://appwrite.io/docs/client/databases)
- [Appwrite Storage API](https://appwrite.io/docs/client/storage)
