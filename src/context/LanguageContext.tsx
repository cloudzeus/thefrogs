"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "EN" | "GR";

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    /** Convenience: returns the EL value when GR is active, EN otherwise */
    t: (en: string | null | undefined, el: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
    language: "EN",
    setLanguage: () => { },
    t: (en, el) => en ?? el ?? "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("EN");

    // Persist to localStorage
    useEffect(() => {
        const stored = localStorage.getItem("lang") as Language | null;
        if (stored === "EN" || stored === "GR") {
            setLanguageState(stored);
            document.documentElement.lang = stored === "GR" ? "el" : "en";
        } else {
            document.documentElement.lang = "en";
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("lang", lang);
        document.documentElement.lang = lang === "GR" ? "el" : "en";
    };

    const t = (en: string | null | undefined, el: string | null | undefined) => {
        if (language === "GR") return el ?? en ?? "";
        return en ?? el ?? "";
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
