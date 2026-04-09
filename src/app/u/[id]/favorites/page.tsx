'use client';

import { useEffect, useState, useContext } from 'react';
import { useParams } from 'next/navigation';
import { isError, useApi } from '@/lib/api';
import type { PublicTableMeta, TableMeta, World } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { UserContext } from '../UserContext';

function WorldCard({ world }: { world: World | null }) {
    if (!world) {
        return (
            <div className="relative rounded-lg overflow-hidden border bg-fd-muted aspect-[4/3]">
                <Skeleton className="w-full h-full" />
            </div>
        );
    }

    return (
        <Link href={`/w/${world.id}@${world.server}`}>
            <div className="relative rounded-lg overflow-hidden border bg-fd-muted aspect-[4/3] hover:ring-2 hover:ring-fd-primary transition-all">
                {world.thumbnail ? (
                    <img
                        src={world.thumbnail}
                        alt={world.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Icon icon="material-symbols:public-rounded" className="size-8 text-fd-muted-foreground" />
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-6 pb-1.5 px-2">
                    <span className="text-xs font-medium text-white truncate block leading-tight">{world.title}</span>
                    <span className="text-[10px] text-white/60 truncate block leading-tight">{world.id}@{world.server}</span>
                </div>
            </div>
        </Link>
    );
}

function AvatarCard({ sid }: { sid: string | null }) {
    if (!sid) {
        return (
            <div className="relative rounded-lg overflow-hidden border bg-fd-muted aspect-[4/3]">
                <Skeleton className="w-full h-full" />
            </div>
        );
    }

    return (
        <Link href={`/a/${sid}`}>
            <div className="relative rounded-lg overflow-hidden border bg-fd-muted aspect-[4/3] hover:ring-2 hover:ring-fd-primary transition-all">
                <div className="w-full h-full flex items-center justify-center">
                    <Icon icon="material-symbols:person-rounded" className="size-8 text-fd-muted-foreground" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-6 pb-1.5 px-2">
                    <span className="text-[10px] text-white/60 truncate block leading-tight">{sid}</span>
                </div>
            </div>
        </Link>
    );
}

function WorldTableSection({ table, userId, userServer, isSelf }: { table: PublicTableMeta | TableMeta; userId: string | number; userServer?: string; isSelf: boolean }) {
    const Api = useApi();
    const [label, setLabel] = useState<string | null>(null);
    const [worlds, setWorlds] = useState<(World | null)[] | null>(null);
    const [error, setError] = useState(false);
    const tableType = table.key.slice('public.'.length);

    useEffect(() => {
        if (!Api) return;
        const fetch = isSelf
            ? Api.fetchMyTable(table.key)
            : Api.fetchUserPublic(userId, tableType, userServer);
        fetch.then(async raw => {
            if (raw instanceof Error) { setError(true); return; }

            let parsed: { label?: string; values: unknown[] } | unknown;
            try { parsed = JSON.parse(raw.toString('utf-8')); } catch { setError(true); return; }

            let ids: string[] = [];
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'values' in (parsed as any))
                ids = ((parsed as any).values as unknown[]).filter((v): v is string => typeof v === 'string');
            else if (Array.isArray(parsed))
                ids = parsed.filter((v): v is string => typeof v === 'string');
            else { setError(true); return; }

            let l = (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'label' in (parsed as any)) ? (parsed as any).label : null;
            setLabel(l || null);

            if (ids.length === 0) { setWorlds([]); return; }

            setWorlds(ids.map(() => null));

            const resolved = await Promise.all(ids.map(async sid => {
                const atIdx = sid.lastIndexOf('@');
                const worldId = atIdx !== -1 ? sid.slice(0, atIdx) : sid;
                const server = atIdx !== -1 ? sid.slice(atIdx + 1) : undefined;
                const res = await Api.fetchWorld(worldId, server);
                return isError(res) ? null : res;
            }));

            setWorlds(resolved.filter((w): w is World => w !== null));
        });
    }, [tableType, userId, userServer, isSelf, Api]);

    if (error) return null;

    return (
        <section>
            <h2 className="text-lg font-semibold mb-3">
                {label || `Worlds (${tableType.split('.').slice(2).join('.') || tableType})`}
            </h2>
            {worlds === null ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[0, 1, 2].map(i => <WorldCard key={i} world={null} />)}
                </div>
            ) : worlds.length === 0 ? (
                <p className="text-sm text-fd-muted-foreground">No worlds in this list.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {worlds.map((w, i) => <WorldCard key={i} world={w} />)}
                </div>
            )}
        </section>
    );
}

function AvatarTableSection({ table, userId, userServer, isSelf }: { table: PublicTableMeta | TableMeta; userId: string | number; userServer?: string; isSelf: boolean }) {
    const Api = useApi();
    const [avatars, setAvatars] = useState<string[] | null>(null);
    const [label, setLabel] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const tableType = table.key.slice('public.'.length);

    useEffect(() => {
        if (!Api) return;
        const fetch = isSelf
            ? Api.fetchMyTable(table.key)
            : Api.fetchUserPublic(userId, tableType, userServer);
        fetch.then(raw => {
            if (raw instanceof Error) { setError(true); return; }
            let parsed: { label?: string; values: unknown[] } | unknown;
            try { parsed = JSON.parse(raw.toString('utf-8')); } catch { setError(true); return; }
            let l = (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'label' in (parsed as any)) ? (parsed as any).label : null;
            setLabel(l || null);
            let ids: string[] = [];
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'values' in (parsed as any))
                ids = ((parsed as any).values as unknown[]).filter((v): v is string => typeof v === 'string');
            else if (Array.isArray(parsed))
                ids = parsed.filter((v): v is string => typeof v === 'string');
            else { setError(true); return; }
            setAvatars(ids);
        });
    }, [tableType, userId, userServer, isSelf, Api]);

    if (error) return null;

    return (
        <section>
            <h2 className="text-lg font-semibold mb-3">
                {label || `Avatars (${tableType.split('.').slice(2).join('.') || tableType})`}
            </h2>
            {avatars === null ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[0, 1, 2].map(i => <AvatarCard key={i} sid={null} />)}
                </div>
            ) : avatars.length === 0 ? (
                <p className="text-sm text-fd-muted-foreground">No avatars in this list.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {avatars.map((sid, i) => <AvatarCard key={i} sid={sid} />)}
                </div>
            )}
        </section>
    );
}

function TableSection({ table, userId, userServer, isSelf }: { table: PublicTableMeta | TableMeta; userId: string | number; userServer?: string; isSelf: boolean }) {
    const tableType = table.key.slice('public.'.length);
    if (tableType.startsWith('favorite.avatar.'))
        return <AvatarTableSection table={table} userId={userId} userServer={userServer} isSelf={isSelf} />;
    if (tableType.startsWith('favorite.world.'))
        return <WorldTableSection table={table} userId={userId} userServer={userServer} isSelf={isSelf} />;
    return null;
}

export default function FavoritesPage() {
    const params = useParams();
    const id = params?.id as string;
    const Api = useApi();
    const { isSame } = useContext(UserContext);

    const [tables, setTables] = useState<(PublicTableMeta | TableMeta)[] | null>(null);
    const [loading, setLoading] = useState(true);

    let userId: string | number = id;
    let userServer: string | undefined;
    if (id?.includes('@')) {
        const atIdx = id.lastIndexOf('@');
        userId = id.slice(0, atIdx);
        userServer = id.slice(atIdx + 1);
    }

    useEffect(() => {
        if (!Api || !id) return;
        if (isSame) {
            Api.fetchMyTables(100, 0).then(res => {
                if (isError(res)) { setTables([]); setLoading(false); return; }
                setTables(res.items.filter(t => t.key.startsWith('public.favorite.')));
                setLoading(false);
            });
        } else {
            Api.fetchUserPublicList(userId, userServer, 100, 0).then(res => {
                if (isError(res)) { setTables([]); setLoading(false); return; }
                setTables(res.items.filter((t: PublicTableMeta) => t.mime === 'application/json+favorite'));
                setLoading(false);
            });
        }
    }, [id, isSame, Api]);

    if (loading) {
        return (
            <div className="space-y-6">
                <section>
                    <Skeleton className="h-6 w-32 mb-3" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[0, 1, 2].map(i => <WorldCard key={i} world={null} />)}
                    </div>
                </section>
            </div>
        );
    }

    if (!tables || tables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-fd-muted-foreground">
                <Icon icon="material-symbols:bookmark-outline-rounded" className="size-10" />
                <p className="text-sm">No public lists yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {tables.map(t => (
                <TableSection key={t.key} table={t} userId={userId} userServer={userServer} isSelf={isSame} />
            ))}
        </div>
    );
}
