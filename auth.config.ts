import type { NextAuthConfig, DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession['user'];
    }
}

export const authConfig = {
    pages: {
        signIn: '/admin/login',
    },
    providers: [],
    session: { strategy: "jwt" },
    trustHost: true,
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string
                session.user.id = (token.id as string) || (token.sub as string)
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isLoginPage = nextUrl.pathname === '/admin/login';

            if (isOnAdmin && !isLoginPage) {
                if (isLoggedIn) return true;
                return false; // Redirects to signIn page automatically
            }
            if (isLoginPage && isLoggedIn) {
                return Response.redirect(new URL('/admin/dashboard', nextUrl));
            }
            return true;
        },
    },
} satisfies NextAuthConfig;
