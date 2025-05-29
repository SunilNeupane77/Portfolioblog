import { Account, Client, Databases, ID, Permission, Query, Role, Storage } from 'appwrite';

// Create separate clients for server and client-side
const createClient = () => {
  const client = new Client();
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6835b3bd0035060dca06');
  return client;
};

// Create a new client instance
const client = createClient();

// Auth - only available client-side
const account = new Account(client);

// Database
const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const blogCollectionId = process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID || '';

// Storage
const storage = new Storage(client);
const blogImgBucketId = process.env.NEXT_PUBLIC_APPWRITE_BLOG_BUCKET_ID || '';

// Helper function for server components to create a new client
// to ensure each request gets a fresh instance
const createServerClient = () => {
  const client = createClient();
  const databases = new Databases(client);
  const storage = new Storage(client);
  
  return {
    databases,
    storage,
    databaseId,
    blogCollectionId,
    blogImgBucketId,
  };
};

export {
  account,
  blogCollectionId,
  blogImgBucketId,
  client,
  createServerClient,
  databaseId,
  databases,
  ID,
  Permission,
  Query,
  Role,
  storage
};

