'use client';

import { useState, useEffect } from 'react';
import { useApi, isError } from '@/lib/api';
import { parseSid, sidToUserHref } from '@/lib/platform';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import type { User } from '@/lib/api/types';
import { cn } from '@/lib/cn';

interface ContributorRowProps {
    sid: string;
    isOwner: boolean;
}

export function ContributorRow({ sid, isOwner }: ContributorRowProps) {
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

    const href = sidToUserHref(sid);
    const displayName = user ? (user.display || user.username) : null;
    const subLabel = user ? `${user.username}@${user.server}` : (sid.startsWith('u:') ? sid.slice(2) : sid);

    return (
        <Link href={href} className="flex items-center gap-3 text-sm group">
            <div className={cn('size-8 rounded-full overflow-hidden flex-shrink-0 bg-fd-muted', user === undefined && 'animate-pulse')}>
                {user === undefined ? null : !imageError && user?.thumbnail ? (
                    <img src={user.thumbnail} alt={displayName || subLabel} className="size-8 object-cover" onError={() => setImageError(true)} />
                ) : (
                    <div className="size-8 rounded-full bg-fd-primary/20 flex items-center justify-center">
                        {user ? (
                            <span className="text-xs font-semibold text-fd-primary">
                                {(displayName || subLabel).charAt(0).toUpperCase()}
                            </span>
                        ) : (
                            <Icon icon={isOwner ? 'material-symbols:star-rounded' : 'material-symbols:person-rounded'} className="size-4 text-fd-muted-foreground" />
                        )}
                    </div>
                )}
            </div>
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
                            {isOwner && <Icon icon="material-symbols:star-rounded" className="size-3.5 text-fd-muted-foreground flex-shrink-0" />}
                        </div>
                        <div className="text-xs text-fd-muted-foreground truncate font-mono">{subLabel}</div>
                    </>
                ) : (
                    <div className="flex items-center gap-1.5 font-mono text-xs truncate">
                        {isOwner && <Icon icon="material-symbols:star-rounded" className="size-3.5 text-fd-muted-foreground flex-shrink-0" />}
                        {subLabel}
                    </div>
                )}
            </div>
        </Link>
    );
}
