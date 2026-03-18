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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://frogs.wwa.gr"),
  title: {
    default: "The Frogs Guesthouse — Boutique Hotel in Athens, Greece",
    template: "%s — The Frogs Guesthouse",
  },
  description:
    "A boutique guesthouse in the heart of Athens — Plaka neighbourhood — with a cocktail bar downstairs and a rooftop made for golden hour. Est. 2018.",
  keywords: "Athens boutique hotel, Plaka guesthouse, Athens accommodation, boutique hotel Greece, rooftop Athens",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "el_GR",
    siteName: "The Frogs Guesthouse",
    title: "The Frogs Guesthouse — Boutique Hotel in Athens",
    description:
      "Boutique guesthouse in Plaka, Athens. Rooftop terrace, cocktail bar, and warm hospitality. Book direct for the best rate.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "The Frogs Guesthouse Athens" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Frogs Guesthouse — Athens",
    description: "Boutique guesthouse in Plaka, Athens. Rooftop terrace, cocktail bar, warm hospitality.",
    images: ["/og-default.jpg"],
  },
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
