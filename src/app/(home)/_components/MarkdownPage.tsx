'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Skeleton } from '@/components/ui/skeleton';
import { resolveApiConfig } from '@/lib/api/config';

interface Frontmatter {
    title?: string;
    description?: string;
    version?: number;
    date?: string;
}

interface ParsedDoc {
    frontmatter: Frontmatter;
    content: string;
}

function parseFrontmatter(raw: string): ParsedDoc {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { frontmatter: {}, content: raw };

    const frontmatter: Frontmatter = {};
    for (const line of match[1].split('\n')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx + 1).trim();
        if (key === 'title') frontmatter.title = value;
        else if (key === 'description') frontmatter.description = value;
        else if (key === 'version') frontmatter.version = parseFloat(value);
        else if (key === 'date') frontmatter.date = value;
    }
    return { frontmatter, content: match[2] };
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface MarkdownPageProps {
    src: string | null;
    fallbackTitle?: string;
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <div className="pt-4 space-y-3">
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="pt-4 space-y-3">
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    );
}

export default function MarkdownPage({ src, fallbackTitle }: MarkdownPageProps) {
    const [doc, setDoc] = useState<ParsedDoc | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!src) return;
        resolveApiConfig().then(config => {
            fetch(new URL(src, config.baseUrl))
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.text();
                })
                .then(raw => setDoc(parseFrontmatter(raw)))
                .catch(() => setError('Impossible de charger le document. Veuillez réessayer plus tard.'));
        });
    }, [src]);

    const fm = doc?.frontmatter;
    const displayTitle = fm?.title ?? fallbackTitle;

    return (
        <main className="container mx-auto max-w-4xl px-4 py-12">
            <div className="mb-8 space-y-1">
                {displayTitle
                    ? <h1 className="text-3xl font-bold tracking-tight">{displayTitle}</h1>
                    : <Skeleton className="h-10 w-2/3" />
                }
                {fm?.description && (
                    <p className="text-fd-muted-foreground">{fm.description}</p>
                )}
                {(fm?.version != null || fm?.date) && (
                    <p className="text-xs text-fd-muted-foreground/70 pt-1 flex gap-3">
                        {fm.version != null && <span>Version {fm.version}</span>}
                        {fm.date && <span>Mise à jour le {formatDate(fm.date)}</span>}
                    </p>
                )}
            </div>

            {error && (
                <div className="rounded-lg border border-fd-destructive/40 bg-fd-destructive/10 px-4 py-3 text-fd-destructive text-sm">
                    {error}
                </div>
            )}

            {!doc && !error && <LoadingSkeleton />}

            {doc && (
                <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {doc.content}
                    </ReactMarkdown>
                </div>
            )}
        </main>
    );
}
