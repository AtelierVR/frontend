'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApi, isError } from '@/lib/api';
import type { World, User } from '@/lib/api/types';
import { cn } from '@/lib/cn';

function parseSid(sid: string): { id: number | string; server?: string } {
    const bare = sid.startsWith('u:') ? sid.slice(2) : sid;
    const atIdx = bare.lastIndexOf('@');
    if (atIdx === -1) return { id: bare };
    const id = bare.slice(0, atIdx);
    const server = bare.slice(atIdx + 1);
    return {
        id: isNaN(parseInt(id, 10)) ? id : parseInt(id, 10),
        server: server === '::' ? undefined : server || undefined,
    };
}

function userHref(sid: string): string {
    const bare = sid.startsWith('u:') ? sid.slice(2) : sid;
    return `/u/${bare}`;
}

function ContributorRow({ sid, isOwner }: { sid: string; isOwner: boolean }) {
    const Api = useApi();
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!Api) return;
        const { id, server } = parseSid(sid);
        Api.getOrFetchUser(id, server).then(res => {
            setUser(isError(res) ? null : res);
        });
    }, [sid, Api]);

    const href = userHref(sid);
    const displayName = user ? (user.display || user.username) : null;
    const subLabel = user ? `${user.username}@${user.server}` : (sid.startsWith('u:') ? sid.slice(2) : sid);

    return (
        <Link href={href} className="flex items-center gap-3 text-sm group">
            {/* Avatar */}
            <div className={cn(
                'size-8 rounded-full overflow-hidden flex-shrink-0 bg-fd-muted',
                user === undefined && 'animate-pulse'
            )}>
                {user === undefined ? null : !imageError && user?.thumbnail ? (
                    <img
                        src={user.thumbnail}
                        alt={displayName || subLabel}
                        className="size-8 object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="size-8 rounded-full bg-fd-primary/20 flex items-center justify-center">
                        {user ? (
                            <span className="text-xs font-semibold text-fd-primary">
                                {(displayName || subLabel)}
                            </span>
                        ) : (
                            <Icon
                                icon={isOwner ? 'material-symbols:star-rounded' : 'material-symbols:person-rounded'}
                                className="size-4 text-fd-muted-foreground"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Names */}
            <div className="flex-1 min-w-0">
                {user === undefined ? (
                    <>
                        <Skeleton className="h-3.5 w-28 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </>
                ) : displayName ? (
                    <>
                        <div className="flex items-center gap-1.5 font-medium truncate group-hover:underline">
                            {displayName}
                            {isOwner && (
                                <Icon icon="material-symbols:star-rounded" className="size-3.5 text-fd-muted-foreground flex-shrink-0" />
                            )}
                        </div>
                        <div className="text-xs text-fd-muted-foreground truncate font-mono">{subLabel}</div>
                    </>
                ) : (
                    <div className="flex items-center gap-1.5 font-mono text-xs truncate">
                        {isOwner && (
                            <Icon icon="material-symbols:star-rounded" className="size-3.5 text-fd-muted-foreground flex-shrink-0" />
                        )}
                        {subLabel}
                    </div>
                )}
            </div>
        </Link>
    );
}

export default function WorldContributors({ world }: { world: World | null }) {
    if (!world) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Contributors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="size-8 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-3.5 w-28" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    const all = [
        { sid: world.owner, isOwner: true },
        ...world.contributors
            .filter(c => c !== world.owner)
            .map(c => ({ sid: c, isOwner: false })),
    ];

    if (all.length === 0) return null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-fd-muted-foreground uppercase tracking-wide">Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {all.map(({ sid, isOwner }) => (
                    <ContributorRow key={sid} sid={sid} isOwner={isOwner} />
                ))}
            </CardContent>
        </Card>
    );
}
