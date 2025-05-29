// src/app/dashboard/blog/edit/[id]/page.tsx
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { blogCollectionId, blogImgBucketId, databaseId, databases, ID, storage } from '@/lib/appwrite';
import type { Post } from '@/types/blog';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import * as z from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const postSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  content: z.string().min(50, { message: "Content must be at least 50 characters" }),
  status: z.enum(["draft", "published"]),
  image: z
    .custom<FileList>()
    .optional()
    .refine((files) => !files || files.length === 0 || (files && files.length === 1), "You can only upload one image.")
    .refine((files) => !files || files.length === 0 || (files && files?.[0]?.size <= MAX_FILE_SIZE), `Max file size is 5MB.`)
    .refine(
      (files) => !files || files.length === 0 || (files && ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type)),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

type PostFormInputs = z.infer<typeof postSchema>;

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPost, setIsFetchingPost] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);

  const { register, handleSubmit, watch, formState: { errors }, reset, control } = useForm<PostFormInputs>({
    resolver: zodResolver(postSchema),
    defaultValues: {
        title: '',
        content: '',
        status: 'draft',
    }
  });

  const imageFile = watch("image");

  // Fetch post data when component mounts
  useEffect(() => {
    if (!postId) return;
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to edit posts." });
      router.push('/login');
      return;
    }
    
    setIsFetchingPost(true);
    const fetchPost = async () => {
      try {
        const postData = await databases.getDocument(
          databaseId,
          blogCollectionId,
          postId
        );
        
        // Verify that the current user is the author of this post
        if (postData.authorId !== user.$id) {
          toast({ variant: "destructive", title: "Authorization Error", description: "You don't have permission to edit this post." });
          router.push('/dashboard/blog');
          return;
        }

        if (postData) {
          const post = {
            id: postData.$id,
            title: postData.title,
            content: postData.content,
            slug: postData.slug,
            imageUrl: postData.imageUrl,
            authorName: postData.authorName,
            authorId: postData.authorId,
            createdAt: new Date(postData.createdAt),
            updatedAt: new Date(postData.updatedAt),
            status: postData.status
          } as Post;
          
          setOriginalPost(post);
          reset({ 
            title: postData.title,
            content: postData.content,
            status: postData.status,
          });
          
          if (postData.imageUrl) {
            setPreviewImage(postData.imageUrl);
            setExistingImageUrl(postData.imageUrl);
          }
        } else {
          toast({ variant: "destructive", title: "Error", description: "Post not found." });
          router.push('/dashboard/blog');
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch post details." });
      } finally {
        setIsFetchingPost(false);
      }
    };
    
    fetchPost();
  }, [postId, reset, router, toast]);

  // Handle image preview
  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (existingImageUrl) {
        // If no new file is selected, and there was an existing image, keep showing it.
        setPreviewImage(existingImageUrl);
    } else {
        setPreviewImage(null);
    }
  }, [imageFile, existingImageUrl]);

  const onSubmit: SubmitHandler<PostFormInputs> = async (data) => {
    if (!user || !originalPost) {
      toast({ variant: "destructive", title: "Error", description: "User not authenticated or post data missing." });
      return;
    }
    
    // Check that current user is the author of the post for additional security
    if (originalPost.authorId !== user.$id) {
      toast({ variant: "destructive", title: "Authorization Error", description: "You don't have permission to edit this post." });
      router.push('/dashboard/blog');
      return;
    }
    
    setIsLoading(true);
    setUploadProgress(0);

    try {
      let imageUrl = originalPost.imageUrl; // Keep existing image URL by default

      // If a new image is selected, upload it
      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        
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
        imageUrl = await uploadPromise;
        setUploadProgress(100);
      }

      // Import permission helpers
      const { generateDocPermissions, generateDraftPermissions } = require("@/lib/permissions");
      
      // Choose permissions based on status (draft vs published)
      const permissions = data.status === 'published' 
        ? generateDocPermissions(user.$id)
        : generateDraftPermissions(user.$id);
      
      // Update the blog post document in database with appropriate permissions
      await databases.updateDocument(
        databaseId,
        blogCollectionId,
        postId,
        {
          title: data.title,
          content: data.content,
          imageUrl: imageUrl, // Updated or existing URL
          status: data.status,
          updatedAt: new Date().toISOString(),
          // slug remains unchanged
        },
        permissions // Add permissions to ensure proper access control
      );

      toast({ title: "Blog Post Updated", description: "Your post has been successfully updated." });
      router.push('/dashboard/blog');
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast({ variant: "destructive", title: "Update Failed", description: error.message || "Could not update the post." });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetchingPost) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading post details...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
       <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl text-primary">Edit Blog Post</CardTitle>
          <CardDescription>Update the details for your blog post.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
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
              rows={10}
              className={errors.content ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.status ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
          </div>


          <div className="space-y-2">
            <Label htmlFor="image">Cover Image (Optional: replace existing)</Label>
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
                <Image src={previewImage} alt="Preview" fill style={{ objectFit: 'cover' }} data-ai-hint="blog post image"/>
              </div>
            )}
          </div>
          
          {isLoading && uploadProgress > 0 && (
            <ProgressBar progress={uploadProgress} labelText="Upload Progress" />
          )}

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading || isFetchingPost} className="min-w-[150px]">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isLoading ? (uploadProgress < 1 && uploadProgress !== 0 ? "Processing..." : "Saving...") : "Save Changes"}
            </Button>
             <Button type="button" variant="outline" onClick={() => router.push('/dashboard/blog')} disabled={isLoading}>
                Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

