// src/types/blog.ts
import type { Timestamp } from 'firebase/firestore';

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  imageUrl: string;
  authorName: string;
  authorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: "draft" | "published";
  excerpt?: string; // Optional: if you generate excerpts
}
