'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/lib/api';
import { isError } from '@/lib/api/utils';
import type { TableMeta } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';

const KEY_PREFIX = 'public.favorite.world.';

interface FavoriteEntry { label?: string; values: string[]; }

function parseIndex(key: string): number | null {
    if (!key.startsWith(KEY_PREFIX)) return null;
    const n = parseInt(key.slice(KEY_PREFIX.length), 10);
    return Number.isFinite(n) ? n : null;
}

function parseFavoriteEntry(raw: unknown): FavoriteEntry {
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'values' in raw) {
        const r = raw as any;
        return {
            label: typeof r.label === 'string' ? r.label : undefined,
            values: Array.isArray(r.values) ? r.values.filter((v: unknown): v is string => typeof v === 'string') : [],
        };
    }
    if (Array.isArray(raw)) return { values: raw.filter((v): v is string => typeof v === 'string') };
    return { values: [] };
}

function nextAvailableIndex(tables: TableMeta[]): number {
    const indices = tables
        .map(t => parseIndex(t.key))
        .filter((n): n is number => n !== null)
        .sort((a, b) => a - b);
    let x = 0;
    for (const i of indices) {
        if (i === x) x++;
        else break;
    }
    return x;
}

export default function FavoriteButton({ worldSid }: { worldSid: string }) {
    const Api = useApi();
    const [favTables, setFavTables] = useState<TableMeta[]>([]);
    const [primaryEntry, setPrimaryEntry] = useState<FavoriteEntry | null>(null);
    const [busy, setBusy] = useState(false);

    const primaryKey = `${KEY_PREFIX}0`;
    const isFavorited = primaryEntry !== null && primaryEntry.values.includes(worldSid);

    const loadTables = useCallback(async () => {
        if (!Api) return;
        const res = await Api.listMyTables(100, 0);
        if (!isError(res))
            setFavTables(res.items.filter(t => t.key.startsWith(KEY_PREFIX)));
    }, [Api]);

    const loadPrimary = useCallback(async () => {
        if (!Api) return;
        const res = await Api.getMyTable(primaryKey);
        if (isError(res)) { setPrimaryEntry({ values: [] }); return; }
        setPrimaryEntry(parseFavoriteEntry(res));
    }, [Api, primaryKey]);

    useEffect(() => {
        if (!Api?.currentUser) return;
        loadTables();
        loadPrimary();
    }, [Api?.currentUser, loadTables, loadPrimary]);

    const togglePrimary = async () => {
        if (!Api || busy) return;
        setBusy(true);
        const current = primaryEntry ?? { values: [] };
        const next: FavoriteEntry = {
            label: current.label,
            values: current.values.includes(worldSid)
                ? current.values.filter(s => s !== worldSid)
                : [...current.values, worldSid],
        };
        await Api.setMyTable(primaryKey, next, 'application/json+favorite');
        setPrimaryEntry(next);
        await loadTables();
        setBusy(false);
    };

    const addToTable = async (key: string) => {
        if (!Api || busy) return;
        setBusy(true);
        const res = await Api.getMyTable(key);
        const current = parseFavoriteEntry(!isError(res) ? res : null);
        if (!current.values.includes(worldSid)) {
            const next: FavoriteEntry = { label: current.label, values: [...current.values, worldSid] };
            await Api.setMyTable(key, next, 'application/json+favorite');
            if (key === primaryKey) setPrimaryEntry(next);
        }
        await loadTables();
        setBusy(false);
    };

    const createNewGroup = async () => {
        if (!Api || busy) return;
        setBusy(true);
        const idx = nextAvailableIndex(favTables);
        const key = `${KEY_PREFIX}${idx}`;
        await Api.setMyTable(key, { values: [worldSid] }, 'application/json+favorite');
        await loadTables();
        setBusy(false);
    };

    if (!Api?.currentUser) return null;

    return (
        <div className="flex items-center">
            <Button
                variant="outline"
                size="sm"
                className={cn(
                    'rounded-r-none border-r-0 gap-1.5',
                    isFavorited && 'text-yellow-500 border-yellow-500/40 hover:text-yellow-500',
                )}
                onClick={togglePrimary}
                disabled={busy}
            >
                <Icon
                    icon={isFavorited ? 'material-symbols:bookmark' : 'material-symbols:bookmark-outline-rounded'}
                    className="size-4"
                />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            'rounded-l-none px-2',
                            isFavorited && 'text-yellow-500 border-yellow-500/40 hover:text-yellow-500',
                        )}
                        disabled={busy}
                    >
                        <Icon icon="material-symbols:arrow-drop-down-rounded" className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                    {favTables.length === 0 && (
                        <DropdownMenuItem disabled className="text-fd-muted-foreground text-sm">
                            No lists yet
                        </DropdownMenuItem>
                    )}
                    {favTables.map(t => {
                        const idx = parseIndex(t.key);
                        return (
                            <DropdownMenuItem key={t.key} onClick={() => addToTable(t.key)}>
                                <Icon icon="material-symbols:bookmark-outline-rounded" className="size-4 mr-2 shrink-0" />
                                List {idx ?? t.key}
                            </DropdownMenuItem>
                        );
                    })}
                    {favTables.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={createNewGroup}>
                        <Icon icon="material-symbols:add-rounded" className="size-4 mr-2 shrink-0" />
                        New group
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
