// src/app/dashboard/blog/new/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, PlusCircle, UploadCloud } from 'lucide-react';
import Image from 'next/image';

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
      const storageRef = ref(storage, `blog_images/${uniqueFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          toast({ variant: "destructive", title: "Upload Error", description: error.message });
          setIsLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(db, 'posts'), {
            title: data.title,
            content: data.content,
            slug: slug,
            imageUrl: downloadURL,
            authorName: user.displayName || "Anonymous",
            authorId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: "draft", // Default status
          });

          toast({ title: "Blog Post Created", description: "Your new post has been saved as a draft." });
          reset();
          setPreviewImage(null);
          router.push('/dashboard/blog'); 
        }
      );
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
