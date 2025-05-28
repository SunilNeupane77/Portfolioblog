// src/app/dashboard/blog/new/page.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { blogCollectionId, blogImgBucketId, databaseId, databases, ID, storage } from '@/lib/appwrite';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import * as z from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const postSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  content: z.string().min(50, { message: "Content must be at least 50 characters" }),
  image: z
    .custom<FileList>()
    .refine((files) => files && files.length === 1, "Blog post image is required.")
    .refine((files) => files && files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => files && ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

type PostFormInputs = z.infer<typeof postSchema>;

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<PostFormInputs>({
    resolver: zodResolver(postSchema),
  });

  const imageFile = watch("image");

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  }, [imageFile]);

  const onSubmit: SubmitHandler<PostFormInputs> = async (data) => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a post." });
      return;
    }
    setIsLoading(true);
    setUploadProgress(0);

    try {
      const file = data.image[0];
      const slug = slugify(data.title);
      const uniqueFileName = `${slug}-${Date.now()}-${file.name}`;

      // Create a promise to track upload progress
      const uploadPromise = new Promise<string>((resolve, reject) => {
        // Create File ID
        const fileId = ID.unique();
        
        // Upload progress tracking function
        const trackProgress = (progress: number) => {
          setUploadProgress(progress);
        };

        // Start file upload
        storage.createFile(
          blogImgBucketId, 
          fileId, 
          file
        ).then(() => {
          // Get file view URL
          const fileUrl = storage.getFileView(blogImgBucketId, fileId);
          resolve(fileUrl);
        }).catch(error => {
          reject(error);
        });

        // Track progress by checking file status periodically
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 5; // Increment by 5%
          if (progress >= 95) {
            clearInterval(progressInterval);
          } else {
            trackProgress(progress);
          }
        }, 300);
      });

      // Wait for the file to upload
      const fileUrl = await uploadPromise;
      setUploadProgress(100);
      
      // Create the blog post document in database
      const docId = ID.unique();
      await databases.createDocument(
        databaseId,
        blogCollectionId,
        docId,
        {
          title: data.title,
          content: data.content,
          slug: slug,
          imageUrl: fileUrl,
          authorName: user.name || "Anonymous",
          authorId: user.$id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "draft", // Default status
        }
      );

      toast({ title: "Blog Post Created", description: "Your new post has been saved as a draft." });
      reset();
      setPreviewImage(null);
      router.push('/dashboard/blog'); 
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({ variant: "destructive", title: "Post Creation Failed", description: error.message });
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Create New Blog Post</CardTitle>
        <CardDescription>Fill in the details for your new blog post and upload a cover image.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Your Awesome Blog Post Title"
              className={errors.title ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Write your blog post content here... (Markdown is supported on display)"
              rows={10}
              className={errors.content ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Cover Image</Label>
            <Input
              id="image"
              type="file"
              {...register("image")}
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 ${errors.image ? "border-destructive" : ""}`}
              disabled={isLoading}
            />
            {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
             {previewImage && (
              <div className="mt-4 relative w-full h-64 rounded-md overflow-hidden border">
                <Image src={previewImage} alt="Preview" fill style={{ objectFit: 'cover' }} />
              </div>
            )}
          </div>
          
          {isLoading && uploadProgress > 0 && (
            <div className="space-y-1">
              <Label>Upload Progress</Label>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}% uploaded</p>
            </div>
          )}


          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading} className="min-w-[150px]">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {isLoading ? (uploadProgress < 1 ? "Preparing..." : "Uploading...") : "Create Post"}
            </Button>
            <Button type="button" variant="outline" onClick={() => { reset(); setPreviewImage(null); }} disabled={isLoading}>
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
