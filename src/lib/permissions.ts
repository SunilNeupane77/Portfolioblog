// src/lib/permissions.ts
import { Permission, Role } from 'appwrite';

/**
 * Helper function to create document permissions
 * This ensures consistent permissions across the application
 */
export function generateDocPermissions(userId: string) {
  return [
    // The document owner has full control
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
    
    // Only published documents are readable by the public
    Permission.read(Role.any()),
  ];
}

/**
 * Helper function to create permissions for draft documents
 * Drafts should only be visible to their author
 */
export function generateDraftPermissions(userId: string) {
  return [
    // Only the owner can read, update and delete drafts
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

/**
 * Helper function to create file permissions
 */
export function generateFilePermissions(userId: string) {
  return [
    // The file owner has full control
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
    
    // Public can read files (e.g., images in blog posts)
    Permission.read(Role.any()),
  ];
}
