"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/lib/actions";

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined
    );

    return (
        <div className="admin-theme min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 mb-4">
                        <svg viewBox="0 0 100 100" className="w-10 h-10 text-white">
                            <polygon
                                points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <text x="50" y="40" textAnchor="middle" fill="currentColor" fontSize="14" fontFamily="sans-serif" fontWeight="bold">THE</text>
                            <text x="50" y="62" textAnchor="middle" fill="currentColor" fontSize="20" fontFamily="sans-serif" fontWeight="bold">FROGS</text>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Admin Dashboard</h1>
                    <p className="text-zinc-500 text-sm mt-1">The Frog House Guesthouse</p>
                </div>

                {/* Form */}
                <form action={formAction} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-5 shadow-2xl">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="gkozyris@i4ria.com"
                            className="w-full h-12 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full h-12 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                        />
                    </div>

                    {errorMessage && (
                        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-12 rounded-xl bg-white text-zinc-900 font-black text-sm uppercase tracking-widest hover:bg-zinc-100 transition-colors disabled:opacity-50"
                    >
                        {isPending ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
