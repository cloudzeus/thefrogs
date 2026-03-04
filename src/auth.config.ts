import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
    trustHost: true,
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/admin");
            const isOnLogin = nextUrl.pathname === "/admin/login";
            if (isOnDashboard && !isOnLogin) {
                if (!isLoggedIn) return false;
                return true;
            }
            return true;
        },
    },
    providers: [],
};
