import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // We use client-side protection primarily, but this middleware structure
    // is provided per the UI.md request requirements.
    return NextResponse.next();
}

// Optionally filter which paths trigger the middleware
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
