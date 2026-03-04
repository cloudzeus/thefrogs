// Shared type for a HomeSection row, used across section components and admin
export type HomeSectionRow = {
    id?: string;
    key: string;
    order?: number;
    published?: boolean;
    image: string | null;
    labelEL: string | null;
    labelEN: string | null;
    titleEL: string | null;
    titleEN: string | null;
    subtitleEL: string | null;
    subtitleEN: string | null;
    bodyEL: string | null;
    bodyEN: string | null;
    ctaLabelEL: string | null;
    ctaLabelEN: string | null;
    ctaUrl: string | null;
    cta2LabelEL: string | null;
    cta2LabelEN: string | null;
    cta2Url: string | null;
    extras: Record<string, unknown>;
};
