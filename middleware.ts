import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // We can't access localStorage in middleware, we rely on cookies.
    // BUT the current implementation stores token in localStorage.
    // So true protection happens on client-side or we must move to cookies.
    // For now, this is a simplified middleware that might not fully work without cookies.

    // Strategy:
    // Since we are using an internal API and client-side auth in this plan (localStorage),
    // Middleware can't see the token if it's not in a cookie.
    // So we will rely on client-side checks in a ProtectedRoute wrapper or similar, 
    // OR we just skip middleware for now and do it in the components (useEffect).

    // However, I can implement a check for a "token" cookie if we decide to set one.
    // Let's stick to the plan: The user "Auth" section said:
    // "Custom JWT handling (stored in HTTP-only cookies or localStorage initially)"
    // If we used localStorage, middleware is useless for auth checks.

    // Let's implement a client-side wrapper instead? No, that's tedious.
    // Let's just create a basic layout for (protected) that checks auth.

    return NextResponse.next()
}

export const config = {
    matcher: '/:path*',
}
