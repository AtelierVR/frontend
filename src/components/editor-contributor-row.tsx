'use client';

import { useState, useEffect } from 'react';
import { useApi, isError } from '@/lib/api';
import { parseSid } from '@/lib/platform';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { User } from '@/lib/api/types';
import { cn } from '@/lib/cn';

interface EditorContributorRowProps {
    sid: string;
    onRemove?: () => void;
}

export function EditorContributorRow({ sid, onRemove }: EditorContributorRowProps) {
    const Api = useApi();
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!Api) return;
        const { id, server } = parseSid(sid);
        Api.getOrFetchUser(id, server).then(res => setUser(isError(res) ? null : res));
    }, [sid, Api]);

    const bare = sid.startsWith('u:') ? sid.slice(2) : sid;
    const displayName = user ? (user.display || user.username) : null;
    const subLabel = user ? `${user.username}@${user.server}` : bare;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-fd-card hover:bg-fd-muted/50 transition-colors">
            <div className={cn('size-6 rounded-full overflow-hidden flex-shrink-0 bg-fd-muted', user === undefined && 'animate-pulse')}>
                {user !== undefined && (!imageError && user?.thumbnail ? (
                    <img src={user.thumbnail} alt={displayName || bare} className="size-6 object-cover" onError={() => setImageError(true)} />
                ) : (
                    <div className="size-6 rounded-full bg-fd-primary/20 flex items-center justify-center">
                        <Icon icon="material-symbols:person-rounded" className="size-3.5 text-fd-muted-foreground" />
                    </div>
                ))}
            </div>
            <Link href={`/u/${bare}`} className="flex-1 min-w-0 flex items-center gap-2 text-sm group">
                <span className="font-medium truncate">{displayName ?? bare}</span>
                {displayName && <span className="text-xs text-fd-muted-foreground font-mono truncate">{subLabel}</span>}
            </Link>
            {onRemove && (
                <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0 hover:bg-fd-muted flex-shrink-0">
                    <Icon icon="material-symbols:close-rounded" className="size-3.5" />
                </Button>
            )}
        </div>
    );
}
