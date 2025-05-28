// src/types/blog.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  imageUrl: string;
  authorName: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "published";
  excerpt?: string; // Optional: if you generate excerpts
}
