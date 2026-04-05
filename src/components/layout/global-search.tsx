'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Icon } from '@iconify/react';
import { fetchApi } from '@/lib/api/utils';
import { resolveWellKnown } from '@/lib/api/config';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/cn';
import { buttonVariants } from '../ui/button';
import Link from 'next/link';

interface ResultPage {
    items: ResultItem[];
    total: number;
}

interface ResultItem {
    id: string | number;
    label: string;
    description?: string;
    image?: string;
    url: string;
}

function getAlias(key: string, aliases: { key: string, value: string }[]): string | undefined {
    const alias = aliases.find((a) => a.key === key);
    return alias ? alias.value : undefined;
}

// Feature config: maps API feature name → label, icon, endpoint, result array key
const FEATURE_CONFIG: Record<string, {
    label: string;
    icon: string;
    layout: 'list' | 'grid';
    texts: {
        placeholder: string;
        empty: string;
        hint: string;
    };
    search: (q: string) => Promise<ResultPage>;
}> = {
    user: {
        label: 'Users',
        icon: 'material-symbols:person-rounded',
        layout: 'list',
        texts: {
            placeholder: 'Search users by name or username…',
            empty: 'No users found',
            hint: 'Type a username or display name',
        },
        search: async (q) => {
            const url = q ? `/api/users?query=${encodeURIComponent(q)}&limit=15` : '/api/users?limit=15';
            const res = await fetchApi<any>(url);
            return {
                items: res.data?.users?.map((e: any) => ({
                    id: e.id,
                    label: e.display || e.username,
                    description: getAlias("uid", e.alias),
                    image: e.thumbnail,
                    url: getAlias("profile", e.alias) || `/u/${e.username}`,
                })) ?? [],
                total: res.data?.total ?? 0
            };
        }
    },
    avatar: {
        label: 'Avatars',
        icon: 'material-symbols:badge-rounded',
        layout: 'grid',
        texts: {
            placeholder: 'Search avatars…',
            empty: 'No avatars found',
            hint: 'Type an avatar name',
        },
        search: async (q) => {
            const url = q ? `/api/avatars?query=${encodeURIComponent(q)}&limit=15` : '/api/avatars?limit=15';
            const res = await fetchApi<any>(url);
            return {
                items: res.data?.avatars?.map((e: any) => ({
                    id: e.id,
                    label: e.title || `Avatar ${e.id}`,
                    description: getAlias("iid", e.alias),
                    image: e.thumbnail,
                    url: getAlias("profile", e.alias) || `/a/${e.id}`,
                })) ?? [],
                total: res.data?.total ?? 0
            };
        },
    },
    world: {
        label: 'Worlds',
        icon: 'material-symbols:travel-explore-rounded',
        layout: 'grid',
        texts: {
            placeholder: 'Search worlds…',
            empty: 'No worlds found',
            hint: 'Type a world name',
        },
        search: async (q) => {
            const url = q ? `/api/worlds?query=${encodeURIComponent(q)}&limit=15` : '/api/worlds?limit=15';
            const res = await fetchApi<any>(url);
            return { 
                items: res.data?.worlds?.map((e: any) => ({
                    id: e.id,
                    label: e.title || `World ${e.id}`,
                    description: getAlias("iid", e.alias),
                    image: e.thumbnail,
                    url: getAlias("profile", e.alias) || `/w/${e.id}`,
                })) ?? [], 
                total: res.data?.total ?? 0
            };
        }
    },
    instance: {
        label: 'Instances',
        icon: 'material-symbols:grid-view-rounded',
        layout: 'grid',
        texts: {
            placeholder: 'Search instances…',
            empty: 'No instances found',
            hint: 'Type a world name or instance ID',
        },
        search: async (q) => {
            const url = q ? `/api/instances?query=${encodeURIComponent(q)}&limit=15` : '/api/instances?limit=15';
            const res = await fetchApi<any>(url);
            return { 
                items: res.data?.instances?.map((e: any) => ({
                    id: e.id,
                    label: e.title || `Instance ${e.name || e.id}`,
                    description: getAlias("iid", e.alias),
                    image: e.thumbnail,
                    url: getAlias("profile", e.alias) || `/i/${e.id}`,
                })) ?? [], 
                total: res.data?.total ?? 0
            };
        }
    },
    server: {
        label: 'Servers',
        icon: 'material-symbols:storage-rounded',
        layout: 'list',
        texts: {
            placeholder: 'Search servers by name or address…',
            empty: 'No servers found',
            hint: 'Type a server name or address',
        },
        search: async (q) => {
            const url = q ? `/api/servers?query=${encodeURIComponent(q)}&limit=15` : '/api/servers?limit=15';
            const res = await fetchApi<any>(url);
            return { 
                items: res.data?.servers?.map((e: any) => ({
                    id: e.id,
                    label: e.title || e.address,
                    description: e.address,
                    image: e.icon,
                    url: getAlias("profile", e.alias) || `/s/${e.id}`,
                })) ?? [], 
                total: res.data?.total ?? 0
            };
        }
    },
};

// Module-level cache to avoid re-fetching on every open
let cachedFeatures: string[] | null = null;

async function loadFeatures(): Promise<string[]> {
    if (cachedFeatures) return cachedFeatures;
    const wk = await resolveWellKnown();
    if (!wk) return ['user'];
    cachedFeatures = wk.features.filter((f) => f in FEATURE_CONFIG);
    if (cachedFeatures.length === 0) cachedFeatures = ['user'];
    return cachedFeatures;
}

function ResultRow({ item, config, onClose }: {
    item: ResultItem;
    config: typeof FEATURE_CONFIG[string];
    onClose: () => void;
}) {
    const name = item.label || `Item ${item.id}`;
    const sub = item.description;
    const href = item.url;
    const thumbnail = item.image;

    const inner = config.layout === 'grid' ? (
        <div className="relative rounded-lg overflow-hidden border bg-fd-muted aspect-[4/3] hover:ring-2 hover:ring-fd-primary transition-all">
            {thumbnail ? (
                <img
                    src={thumbnail}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Icon icon={config.icon} className="size-8 text-fd-muted-foreground" />
                </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-6 pb-1.5 px-2">
                <span className="text-xs font-medium text-white truncate block leading-tight">{name}</span>
                {sub && <span className="text-[10px] text-white/60 truncate block leading-tight">{sub}</span>}
            </div>
        </div>
    ) : (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-fd-accent hover:text-fd-accent-foreground transition-colors">
            {thumbnail ? (
                <img
                    src={thumbnail}
                    alt={name}
                    className="size-9 rounded-md object-cover shrink-0 bg-fd-muted"
                />
            ) : (
                <div className="size-9 rounded-md bg-fd-muted flex items-center justify-center shrink-0">
                    <Icon icon={config.icon} className="size-5 text-fd-muted-foreground" />
                </div>
            )}
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{name}</span>
                {sub && <span className="text-xs text-fd-muted-foreground truncate">{sub}</span>}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block" onClick={onClose}>
                {inner}
            </Link>
        );
    }
    return inner;
}

export function GlobalSearch({ sm }: { sm?: boolean }) {
    const [open, setOpen] = useState(false);
    const [features, setFeatures] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<string>(
        () => (typeof window !== 'undefined' ? localStorage.getItem('search:tab') ?? '' : '')
    );
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load features when dialog opens, then trigger initial search
    useEffect(() => {
        if (!open) return;
        loadFeatures().then((f) => {
            setFeatures(f);
            setActiveTab((prev) => {
                const tab = prev && f.includes(prev) ? prev : f[0] ?? 'user';
                performSearch(query, tab);
                return tab;
            });
        });
    }, [open]);

    const performSearch = useCallback(async (q: string, tab: string) => {
        if (!tab) {
            setResults([]);
            return;
        }
        const config = FEATURE_CONFIG[tab];
        if (!config) return;

        setLoading(true);
        const page = await config.search(q.trim());
        setLoading(false);
        setResults(page.items);
    }, []);

    const handleQueryChange = useCallback(
        (value: string) => {
            setQuery(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                performSearch(value, activeTab);
            }, 300);
        },
        [activeTab, performSearch]
    );

    const handleTabChange = useCallback(
        (tab: string) => {
            setActiveTab(tab);
            localStorage.setItem('search:tab', tab);
            setResults([]);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                performSearch(query, tab);
            }, 0);
        },
        [query, performSearch]
    );

    const handleOpen = (v: boolean) => {
        setOpen(v);
        if (!v) {
            // setQuery('');
            setResults([]);
        }
    };

    // Ctrl+K / ⌘+K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const activeConfig = activeTab ? FEATURE_CONFIG[activeTab] : null;
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

    return (
        <>
            {sm ? (
                <button
                    type="button"
                    data-search=""
                    aria-label="Open Search"
                    className={cn(buttonVariants({ size: 'icon-sm', color: 'ghost' }), 'p-2')}
                    onClick={() => setOpen(true)}
                >
                    <Icon icon="material-symbols:search-rounded" />
                </button>
            ) : (
                <button
                    type="button"
                    data-search-full=""
                    className="inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground w-full rounded-full ps-2.5 max-w-[240px]"
                    onClick={() => setOpen(true)}
                >
                    <Icon icon="material-symbols:search-rounded" className="size-4" />
                    Search
                    <div className="ms-auto inline-flex gap-0.5">
                        <kbd className="rounded-md border bg-fd-background px-1.5">
                            {isMac ? '⌘' : 'Ctrl'}
                        </kbd>
                        <kbd className="rounded-md border bg-fd-background px-1.5">K</kbd>
                    </div>
                </button>
            )}

            <Dialog open={open} onOpenChange={handleOpen}>
                <DialogContent
                    showCloseButton={false}
                    className="!top-[8vh] !translate-y-0 sm:max-w-[560px] p-0 gap-0 overflow-hidden"
                >
                    {/* Search input */}
                    <div className="flex items-center border-b px-3 gap-2">
                        <Icon
                            icon="material-symbols:search-rounded"
                            className="size-4 text-fd-muted-foreground shrink-0"
                        />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => handleQueryChange(e.target.value)}
                            placeholder={activeConfig?.texts.placeholder ?? 'Search…'}
                            className="flex-1 py-3.5 text-sm bg-transparent outline-none placeholder:text-fd-muted-foreground"
                        />
                        {loading && (
                            <Icon
                                icon="material-symbols:progress-activity"
                                className="size-4 text-fd-muted-foreground animate-spin shrink-0"
                            />
                        )}
                    </div>

                    {/* Feature tabs */}
                    {features.length > 1 && (
                        <div className="border-b px-3 py-1.5 flex gap-1 flex-wrap">
                            {features.map((f) => {
                                const c = FEATURE_CONFIG[f];
                                if (!c) return null;
                                return (
                                    <button
                                        key={f}
                                        onClick={() => handleTabChange(f)}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                                            activeTab === f
                                                ? 'bg-fd-primary text-fd-primary-foreground'
                                                : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'
                                        )}
                                    >
                                        <Icon icon={c.icon} className="size-3.5" />
                                        {c.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Results area */}
                    <div className="max-h-80 overflow-y-auto p-2">
                        {loading && results.length === 0 && (
                            <div className="space-y-1">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                                        <Skeleton className="size-9 rounded-md shrink-0" />
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <Skeleton className="h-3.5 w-32 rounded" />
                                            <Skeleton className="h-3 w-20 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && results.length === 0 && (
                            <p className="text-sm text-fd-muted-foreground text-center py-8">
                                {query
                                    ? <>{activeConfig?.texts.empty ?? 'No results'} for &quot;{query}&quot;</>
                                    : (activeConfig?.texts.hint ?? 'Type to search')
                                }
                            </p>
                        )}

                        {results.length > 0 && activeConfig && (
                            <div className={activeConfig.layout === 'grid'
                                ? 'grid grid-cols-3 gap-2'
                                : 'space-y-0.5'
                            }>
                                {results.map((item, i) => (
                                    <ResultRow
                                        key={item.id ?? i}
                                        item={item}
                                        config={activeConfig}
                                        onClose={() => handleOpen(false)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
