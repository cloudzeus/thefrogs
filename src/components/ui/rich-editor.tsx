"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Bold, Italic, Underline, List, ListOrdered,
    Heading2, Heading3, Link2, Minus, RemoveFormatting,
} from "lucide-react";

// ── Toolbar button ────────────────────────────────────────────────────────
function ToolbarBtn({
    label, onClick, active = false, children,
}: {
    label: string; onClick: () => void; active?: boolean; children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={label}
            onMouseDown={e => { e.preventDefault(); onClick(); }}   // prevent blur before exec
            className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg text-sm transition-colors",
                active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
        >
            {children}
        </button>
    );
}

// ── Separator ─────────────────────────────────────────────────────────────
function ToolbarSep() {
    return <div className="w-px h-5 bg-border mx-1" />;
}

// ── Main component ────────────────────────────────────────────────────────
export type RichEditorProps = {
    value: string;         // HTML string
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: number;    // px
};

export function RichEditor({ value, onChange, placeholder = "Start writing…", className, minHeight = 280 }: RichEditorProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    const lastHtml = React.useRef(value);
    const [activeFormats, setActiveFormats] = React.useState<Record<string, boolean>>({});

    // Sync external value → DOM (only when it differs, to avoid cursor jump)
    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (el.innerHTML !== value) {
            el.innerHTML = value;
            lastHtml.current = value;
        }
    }, [value]);

    // Detect which formats are active at cursor
    const updateActiveFormats = () => {
        setActiveFormats({
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
            insertUnorderedList: document.queryCommandState("insertUnorderedList"),
            insertOrderedList: document.queryCommandState("insertOrderedList"),
        });
    };

    const exec = (cmd: string, value?: string) => {
        ref.current?.focus();
        document.execCommand(cmd, false, value);
        handleChange();
    };

    const handleChange = () => {
        const html = ref.current?.innerHTML ?? "";
        if (html !== lastHtml.current) {
            lastHtml.current = html;
            onChange(html === "<br>" ? "" : html);
        }
        updateActiveFormats();
    };

    const insertLink = () => {
        const url = prompt("Enter URL:", "https://");
        if (url) exec("createLink", url);
    };

    const insertHR = () => exec("insertHorizontalRule");

    const setHeading = (tag: "h2" | "h3") => exec("formatBlock", tag);

    return (
        <div className={cn("rounded-xl border border-input bg-background overflow-hidden", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/40">
                <ToolbarBtn label="Bold" onClick={() => exec("bold")} active={activeFormats.bold}><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarBtn label="Italic" onClick={() => exec("italic")} active={activeFormats.italic}><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarBtn label="Underline" onClick={() => exec("underline")} active={activeFormats.underline}><Underline className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarSep />
                <ToolbarBtn label="Heading 2" onClick={() => setHeading("h2")}><Heading2 className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarBtn label="Heading 3" onClick={() => setHeading("h3")}><Heading3 className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarSep />
                <ToolbarBtn label="Bullet list" onClick={() => exec("insertUnorderedList")} active={activeFormats.insertUnorderedList}><List className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarBtn label="Numbered list" onClick={() => exec("insertOrderedList")} active={activeFormats.insertOrderedList}><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarSep />
                <ToolbarBtn label="Insert link" onClick={insertLink}><Link2 className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarBtn label="Horizontal rule" onClick={insertHR}><Minus className="w-3.5 h-3.5" /></ToolbarBtn>
                <ToolbarSep />
                <ToolbarBtn label="Clear formatting" onClick={() => exec("removeFormat")}><RemoveFormatting className="w-3.5 h-3.5" /></ToolbarBtn>
            </div>

            {/* Editable area */}
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onInput={handleChange}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                onSelect={updateActiveFormats}
                data-placeholder={placeholder}
                style={{ minHeight }}
                className={cn(
                    "px-4 py-3 text-sm leading-relaxed outline-none focus:outline-none",
                    "prose prose-sm dark:prose-invert max-w-none",
                    // placeholder via CSS
                    "[&:empty]:before:content-[attr(data-placeholder)]",
                    "[&:empty]:before:text-muted-foreground/50",
                    "[&:empty]:before:pointer-events-none",
                    // basic heading/list styles when prose isn't available
                    "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2",
                    "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5",
                    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2",
                    "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2",
                    "[&_a]:text-primary [&_a]:underline",
                    "[&_hr]:border-border [&_hr]:my-4",
                    "[&_p]:my-1.5",
                )}
            />
        </div>
    );
}
