'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { useApi } from '@/lib/api';
import { fetchApi, isResponseError } from '@/lib/api/utils';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/api/hooks/useSocket';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/cn';

interface ActivityEvent {
    id: number;
    type: string;
    message: string;
    details: unknown | null;
    author: string | null;
    created_at: string;
}

interface ActivityResponse {
    total: number;
    limit: number;
    offset: number;
    items: ActivityEvent[];
}

const TYPE_HUES: Record<string, number> = {
    user: 142,   // green
    world: 270,  // purple
    relay: 25,   // orange
    auth: 210,   // blue
    admin: 0,    // red
    node: 215,   // slate-blue
    avatar: 310, // pink-magenta
};

function typeHue(type: string): number {
    const prefix = type.split('.')[0];
    if (prefix in TYPE_HUES) return TYPE_HUES[prefix];
    // deterministic hash for unknown prefixes
    let hash = 0;
    for (let i = 0; i < prefix.length; i++)
        hash = prefix.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 360;
}

function typeStyle(type: string): React.CSSProperties {
    const h = typeHue(type);
    return {
        background: `hsl(${h} 70% 50% / 0.1)`,
        color: `hsl(${h} 60% 40%)`,
        borderColor: `hsl(${h} 70% 50% / 0.3)`,
    };
}

function typeIcon(type: string): string {
    const prefix = type.split('.')[0];
    const icons: Record<string, string> = {
        user: 'material-symbols:person-rounded',
        world: 'material-symbols:public-rounded',
        relay: 'material-symbols:dns-rounded',
        auth: 'material-symbols:lock-rounded',
        admin: 'material-symbols:shield-rounded',
        node: 'material-symbols:memory-rounded',
    };
    return icons[prefix] ?? 'material-symbols:bolt-rounded';
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' });
}

function ActivityCard({ event }: { event: ActivityEvent }) {
    const hasDetails = event.details !== null && event.details !== undefined;
    return (
        <div className={cn('rounded-lg border border-fd-border', 'bg-fd-accent/10')}>
            <Accordion type="single" collapsible>
                <AccordionItem value="details" className="border-0">
                    <AccordionTrigger className="px-4 hover:no-underline hover:bg-fd-accent/50 transition-colors">
                        <div className="flex items-center gap-3 w-full min-w-0">
                            <div className="size-10 rounded-full flex items-center justify-center flex-shrink-0 border" style={typeStyle(event.type)}>
                                <Icon icon={typeIcon(event.type)} className="size-5" />
                            </div>
                            <div className="flex flex-col items-start text-left min-w-0 flex-1">
                                <div className="font-medium text-sm truncate w-full">{event.message}</div>
                                <div className="text-xs text-fd-muted-foreground">
                                    {formatDate(event.created_at)}
                                    {event.author && <> · <span className="font-mono">{event.author}</span></>}
                                </div>
                            </div>
                            <span className="shrink-0 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono font-semibold" style={typeStyle(event.type)}>
                                {event.type}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 mt-2 mb-2">
                        <div className="rounded-md bg-fd-muted/50 p-3 space-y-1.5 text-sm mb-3">
                            <div className="flex justify-between gap-4">
                                <span className="text-fd-muted-foreground">ID</span>
                                <span className="font-mono text-xs">{event.id}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-fd-muted-foreground">Type</span>
                                <span className="font-mono text-xs">{event.type}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-fd-muted-foreground">Author</span>
                                <span className="font-mono text-xs">{event.author ?? '—'}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-fd-muted-foreground">Date</span>
                                <span className="font-mono text-xs">{formatDate(event.created_at)}</span>
                            </div>
                        </div>
                        {hasDetails && (
                            <DynamicCodeBlock
                                lang="json"
                                code={JSON.stringify(event.details, null, 2)}
                            />
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

const LIMIT = 50;

export default function ActivitiesPage() {
    const Api = useApi();
    const router = useRouter();

    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [total, setTotal] = useState(-1);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [error, setError] = useState<string>();
    const [typeFilter, setTypeFilter] = useState('');
    const [pendingFilter, setPendingFilter] = useState('');

    const loadPage = useCallback(async (newOffset: number, filter: string, append: boolean) => {
        if (!Api) return;
        if (append) setLoadingMore(true); else setLoading(true);
        setError(undefined);
        const params = new URLSearchParams({ limit: String(LIMIT), offset: String(newOffset) });
        if (filter.trim()) params.set('q', filter.trim());
        const res = await fetchApi<ActivityResponse>(`/activity?${params}`);
        if (append) setLoadingMore(false); else setLoading(false);
        if (isResponseError(res)) {
            if (res.error.status === 403) { router.push('/settings'); return; }
            setError(res.error.message);
            return;
        }
        setTotal(res.data.total);
        setOffset(newOffset);
        setEvents(prev => {
            if (!append) return res.data.items;
            const existing = new Set(prev.map(e => e.id));
            return [...prev, ...res.data.items.filter(e => !existing.has(e.id))];
        });
    }, [Api, router]);

    useEffect(() => {
        if (!hasLoaded && Api) { loadPage(0, '', false); setHasLoaded(true); }
    }, [hasLoaded, Api, loadPage]);

    useSocket('activity', (event: ActivityEvent) => {
        setEvents(prev => {
            if (prev.some(e => e.id === event.id)) return prev;
            return [event, ...prev];
        });
        setTotal(t => t === -1 ? 1 : t + 1);
    }, true);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setTypeFilter(pendingFilter);
        setEvents([]);
        setTotal(-1);
        setOffset(0);
        loadPage(0, pendingFilter, false);
    };

    const handleClearFilter = () => {
        setPendingFilter('');
        setTypeFilter('');
        setEvents([]);
        setTotal(-1);
        setOffset(0);
        loadPage(0, '', false);
    };

    const hasMore = total > -1 && events.length < total;

    const skeletons = (
        <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-fd-border rounded-lg p-4 bg-fd-accent/10">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <DocsPage toc={[]} footer={{ enabled: false }}>
            <DocsTitle>Activities</DocsTitle>
            <DocsDescription>Real-time activity event log. Admin only.</DocsDescription>
            <DocsBody>
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <Icon icon="material-symbols:error-circle-rounded" className="size-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <form onSubmit={handleFilter} className="flex gap-2 flex-1 max-w-sm">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Search type or message…"
                                    value={pendingFilter}
                                    onChange={e => setPendingFilter(e.target.value)}
                                    className="pr-8"
                                />
                                {pendingFilter && (
                                    <button
                                        type="button"
                                        onClick={handleClearFilter}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground"
                                    >
                                        <Icon icon="material-symbols:close-rounded" className="size-4" />
                                    </button>
                                )}
                            </div>
                            <Button type="submit" variant="outline" size="sm">Search</Button>
                        </form>
                        <div className="flex items-center gap-3">
                            {total > -1 && (
                                <span className="text-sm text-fd-muted-foreground">{total} events</span>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => { setEvents([]); setTotal(-1); setOffset(0); loadPage(0, typeFilter, false); }}>
                                <Icon icon="material-symbols:refresh-rounded" className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {loading && skeletons}

                    {!loading && events.length === 0 && !error && (
                        <div className="text-center py-16 text-fd-muted-foreground text-sm border border-dashed border-fd-border rounded-lg">
                            No activity events found.
                        </div>
                    )}

                    {events.length > 0 && (
                        <div className="space-y-2">
                            {events.map(ev => <ActivityCard key={ev.id} event={ev} />)}
                        </div>
                    )}

                    {hasMore && (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                disabled={loadingMore}
                                onClick={() => loadPage(offset + LIMIT, typeFilter, true)}
                            >
                                {loadingMore
                                    ? <><Icon icon="material-symbols:refresh-rounded" className="size-4 mr-2 animate-spin" />Loading…</>
                                    : <><Icon icon="material-symbols:expand-more-rounded" className="size-4 mr-2" />Load next</>}
                            </Button>
                        </div>
                    )}
                </div>
            </DocsBody>
        </DocsPage>
    );
}
