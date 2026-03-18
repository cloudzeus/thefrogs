/**
 * buildMetadata — Central Next.js metadata builder.
 *
 * Converts a PageMeta database row (or partial overrides) into a fully-formed
 * Next.js `Metadata` object that covers:
 *   • Google Search  (title, description, robots, canonical)
 *   • Open Graph     (og:title, og:description, og:image, og:type, og:locale)
 *   • Twitter Cards  (twitter:card, twitter:title, twitter:description)
 *   • AI discoverability  (rich description, keywords)
 *   • Structured-data hints are handled per-page with JSON-LD (see generateJsonLd)
 */

import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://frogs.wwa.gr";
const SITE_NAME = "The Frogs Guesthouse";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`; // place a 1200×630 image here

export interface PageMetaLike {
    slug?: string | null;
    metaTitleEN?: string | null;
    metaTitleEL?: string | null;
    metaDescriptionEN?: string | null;
    metaDescriptionEL?: string | null;
    keywords?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    twitterTitle?: string | null;
    twitterDescription?: string | null;
    robotsDirective?: string | null;
    canonicalHint?: string | null;
    schemaType?: string | null;
    aiSummary?: string | null;
    heroImage?: string | null;
}

/**
 * Parse a robots string like "index, follow" into the shape Next.js expects.
 * Falls back to index+follow if absent or unrecognised.
 */
function parseRobots(directive?: string | null): Metadata["robots"] {
    if (!directive) return { index: true, follow: true };
    const lower = directive.toLowerCase();
    return {
        index: !lower.includes("noindex"),
        follow: !lower.includes("nofollow"),
        googleBot: {
            index: !lower.includes("noindex"),
            follow: !lower.includes("nofollow"),
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    };
}

export function buildMetadata(
    pageMeta: PageMetaLike | null | undefined,
    /** Optional per-call overrides (e.g. for dynamic [roomId] pages) */
    overrides?: Partial<PageMetaLike> & { title?: string; description?: string }
): Metadata {
    const m = { ...pageMeta, ...overrides } as PageMetaLike & {
        title?: string;
        description?: string;
    };

    const title =
        m.title ??
        m.metaTitleEN ??
        `${SITE_NAME} — Boutique Hotel Athens`;

    const description =
        m.description ??
        m.metaDescriptionEN ??
        m.aiSummary ??
        "A boutique guesthouse in the heart of Athens with a bar downstairs and a rooftop made for golden hour. Est. 2018.";

    const canonical = m.canonicalHint
        ? `${SITE_URL}${m.canonicalHint}`
        : m.slug
            ? `${SITE_URL}/${m.slug === "home" ? "" : m.slug}`
            : SITE_URL;

    const ogImage = m.heroImage ?? DEFAULT_OG_IMAGE;

    return {
        // ── Core ──────────────────────────────────────────────────────────────
        title: {
            default: title,
            template: `%s — ${SITE_NAME}`,
        },
        description,

        // ── Keywords (still read by some AI crawlers) ─────────────────────────
        keywords: m.keywords ?? undefined,

        // ── Canonical + Alternate languages ──────────────────────────────────
        alternates: {
            canonical,
            languages: m.metaTitleEL
                ? {
                    "el-GR": canonical,
                    "en-US": canonical,
                }
                : undefined,
        },

        // ── Robots ────────────────────────────────────────────────────────────
        robots: parseRobots(m.robotsDirective),

        // ── Open Graph ────────────────────────────────────────────────────────
        openGraph: {
            title: m.ogTitle ?? title,
            description: m.ogDescription ?? description,
            url: canonical,
            siteName: SITE_NAME,
            locale: "en_US",
            type: "website",
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: m.ogTitle ?? title,
                },
            ],
        },

        // ── Twitter / X Card ──────────────────────────────────────────────────
        twitter: {
            card: "summary_large_image",
            title: m.twitterTitle ?? m.ogTitle ?? title,
            description: m.twitterDescription ?? m.ogDescription ?? description,
            images: [ogImage],
        },

        // ── Other ─────────────────────────────────────────────────────────────
        metadataBase: new URL(SITE_URL),
    };
}

// ─── JSON-LD helpers ──────────────────────────────────────────────────────────

/** Base LodgingBusiness schema — include on every public page */
export const lodgingBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: SITE_NAME,
    url: SITE_URL,
    description:
        "Boutique guesthouse in Plaka, Athens, Greece. Rooftop terrace, cocktail bar, bilingual service. Est. 2018.",
    address: {
        "@type": "PostalAddress",
        streetAddress: "Plaka",
        addressLocality: "Athens",
        addressCountry: "GR",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: 37.9721,
        longitude: 23.7294,
    },
    image: DEFAULT_OG_IMAGE,
    priceRange: "$$",
    telephone: "",
    sameAs: [SITE_URL],
};

/**
 * Build a FAQPage JSON-LD block from an array of question strings.
 * Answers are a generic invitation to visit — you can enrich per-page.
 */
export function buildFaqSchema(questions: string[]) {
    if (!questions.length) return null;
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: {
                "@type": "Answer",
                text: `For the most up-to-date information, please visit ${SITE_URL} or contact The Frogs Guesthouse directly.`,
            },
        })),
    };
}

/** BreadcrumbList JSON-LD */
export function buildBreadcrumbSchema(
    crumbs: Array<{ name: string; url: string }>
) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: c.url,
        })),
    };
}
