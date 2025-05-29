// src/middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// This middleware helps with route protection
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /dashboard, /blog, etc.)
  const path = request.nextUrl.pathname

  // Define paths that are always accessible
  const publicPaths = ['/', '/blog', '/login']
  
  // Check if the current path is public by looking at its prefix
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  )
  
  // Get the session cookie from the request
  const sessionCookie = request.cookies.get('appwrite-session')?.value
  
  // Check if there's a valid AppWrite session
  const isAuthenticated = !!sessionCookie

  // If the user tries to access /dashboard pages without being authenticated
  if (path.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Continue with the request if allowed
  return NextResponse.next()
}

// Configure middleware to run only for specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}
