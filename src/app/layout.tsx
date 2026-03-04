import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--ff-all",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Frogs Guesthouse — Athens Boutique Hotel",
  description:
    "A boutique guesthouse in the heart of Athens with a bar downstairs and a rooftop made for golden hour. Est. 2018.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable}`}
    >
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
