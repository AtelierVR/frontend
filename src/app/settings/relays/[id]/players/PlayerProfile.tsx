'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApi, isError } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { Icon } from '@iconify/react';

interface PlayerProfileProps {
    playerId: string | number;
    clientId?: number;
    displayName?: string;
    instanceId: number;
    instanceAddress: string;
    userId?: string; // user ID from the client object
}

export default function PlayerProfile({ playerId, clientId, displayName, instanceId, instanceAddress, userId }: PlayerProfileProps) {
    const [user, setUser] = useState<User | null>();
    const [imageError, setImageError] = useState(false);
    const Api = useApi();

    useEffect(() => {
        async function fetchUser() {
            if (!Api || !userId) return;

            // Parse the userId (format: "id@server" or just "id")
            const [id, server] = userId.split('@');
            const parsedId = isNaN(parseInt(id)) ? id : parseInt(id);

            const res = await Api.getOrFetchUser(parsedId, server === '::' ? undefined : server || undefined);
            if (isError(res)) {
                console.error('Failed to fetch user', res.message);
                setUser(null);
                setImageError(true);
                return;
            }

            setImageError(false);
            setUser(res);
        }

        if (user === undefined) {
            fetchUser();
        }
    }, [userId, Api, user]);

    // Find profile alias URL if present
    const profileUrl = user?.alias?.find((a: any) => a.type === 'profile')?.value;

    const content = (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-fd-border bg-fd-card hover:bg-fd-accent/50 transition-colors">
            {/* Avatar */}
            <div
                className={cn(
                    'size-10 rounded-full overflow-hidden flex-shrink-0 bg-fd-accent/10',
                    !user && 'animate-pulse'
                )}
            >
                {!imageError && user?.thumbnail ? (
                    <img
                        src={user.thumbnail}
                        alt={user.display || user.username || displayName || 'Player'}
                        className="size-10 rounded-full object-cover mt-0 mb-0"
                        onError={() => setImageError(true)}
                    />
                ) : user ? (
                    <div className="size-10 rounded-full bg-fd-primary/20 flex items-center justify-center text-fd-primary font-semibold">
                        {(user.display || user.username || displayName || 'P').charAt(0).toUpperCase()}
                    </div>
                ) : displayName ? (
                    <div className="size-10 rounded-full bg-fd-primary/20 flex items-center justify-center text-fd-primary font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                ) : (
                    <div className="size-10 rounded-full bg-fd-primary/10 flex items-center justify-center">
                        <Icon icon="material-symbols:group-rounded" className="size-5 text-fd-primary" />
                    </div>
                )}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
                {!user && user !== null ? (
                    <>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                    </>
                ) : (
                    <>
                        <div className="font-semibold truncate">
                            {user?.display || user?.username || displayName || `Player #${playerId}`}
                        </div>
                        <div className="text-xs text-fd-muted-foreground mt-1">
                            <span>#{instanceId}</span>
                            {user && <span className="text-xs text-fd-muted-foreground truncate mt-0.5">
                                <span> • </span>
                                <span>{user.username}@{user.server}</span>
                            </span>}
                        </div>
                        <div className="text-xs text-fd-muted-foreground font-mono truncate">
                            {instanceAddress}
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    // If we have a profile URL, wrap the content in a link
    if (profileUrl) {
        return (
            <Link
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline"
            >
                {content}
            </Link>
        );
    }

    return content;
}
