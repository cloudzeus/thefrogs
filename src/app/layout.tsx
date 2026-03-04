import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { Inter, Roboto, Roboto_Condensed } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--ff-all",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin", "greek"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--ff-heading",
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin", "greek"],
  weight: ["700"],
  variable: "--ff-display",
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
      className={`${inter.variable} ${roboto.variable} ${robotoCondensed.variable}`}
    >
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
