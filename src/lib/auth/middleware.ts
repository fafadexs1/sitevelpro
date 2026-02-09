import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_change_in_production'
);

const COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

export interface SessionPayload extends JWTPayload {
    userId: string;
    email: string;
    role: string;
}

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
}

/**
 * Create a signed JWT session token
 */
export async function createSessionToken(user: AuthUser): Promise<string> {
    const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION}s`)
        .sign(JWT_SECRET);

    return token;
}

/**
 * Verify a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

/**
 * Set the session cookie after successful login
 */
export function setSessionCookie(response: NextResponse, token: string): void {
    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION,
        path: '/',
    });
}

/**
 * Clear the session cookie on logout
 */
export function clearSessionCookie(response: NextResponse): void {
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });
}

/**
 * Get the current session from cookies and validate it
 * Returns the authenticated user or null if not authenticated
 */
export async function getAuthenticatedUser(request: Request): Promise<AuthUser | null> {
    try {
        // Get token from cookie header
        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) return null;

        // Parse cookies
        const cookies = Object.fromEntries(
            cookieHeader.split(';').map(c => {
                const [key, ...val] = c.trim().split('=');
                return [key, val.join('=')];
            })
        );

        const token = cookies[COOKIE_NAME];
        if (!token) return null;

        // Verify token
        const payload = await verifySessionToken(token);
        if (!payload || !payload.userId) return null;

        // Validate user still exists and is active admin
        const result = await db
            .select({
                id: users.id,
                email: users.email,
                full_name: users.full_name,
                role: users.role,
                is_active: users.is_active,
            })
            .from(users)
            .where(eq(users.id, payload.userId))
            .limit(1);

        const user = result[0];

        if (!user || !user.is_active || user.role !== 'admin') {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
        };
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}

/**
 * Middleware helper to require authentication
 * Returns a 401 response if not authenticated, or the user if authenticated
 */
export async function requireAuth(request: Request): Promise<{ user: AuthUser } | { error: NextResponse }> {
    const user = await getAuthenticatedUser(request);

    if (!user) {
        return {
            error: NextResponse.json(
                { error: { message: 'Unauthorized' } },
                { status: 401 }
            )
        };
    }

    return { user };
}
