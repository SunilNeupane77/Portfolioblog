import { Account, Client, Databases, ID, Permission, Query, Role, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')  // Set your Appwrite endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6835b3bd0035060dca06'); // Set your project ID

// Auth
const account = new Account(client);

// Database
const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const blogCollectionId = process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID || '';

// Storage
const storage = new Storage(client);
const blogImgBucketId = process.env.NEXT_PUBLIC_APPWRITE_BLOG_BUCKET_ID || '';

export { account, blogCollectionId, blogImgBucketId, client, databaseId, databases, ID, Permission, Query, Role, storage };

