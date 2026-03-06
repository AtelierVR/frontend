'use client';

import { cn } from '@/lib/cn';
import { useApi } from '@/lib/api';
import Image from 'next/image';
import { useState } from 'react';
import type { User } from '@/lib/api/types';
import { getSIDById } from '@/lib/api/utils';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function Thumbnail({ user }: { user: User | null }) {
    const [hover, setHover] = useState(false);
    const [error, setError] = useState(false);
    const Api = useApi();
    const isSame = Api && Api.currentUser && user && getSIDById(Api.currentUser.id, Api.currentUser.server) === getSIDById(user.id, user.server);

    return (
        <div 
            onMouseOut={() => setHover(false)}
            onMouseOver={() => setHover(true)}
            className={cn(
                "w-[8em] h-[8em]",
                "border border-fd-border",
                "rounded-xl overflow-hidden",
                "absolute -top-[4em]",
                "bg-fd-background"
            )}
        >
            {(!user || error) && (
                <div className={cn(
                    "flex items-center justify-center",
                    "w-full h-full",
                    "bg-fd-muted",
                    "animate-pulse"
                )} />
            )}

            {!error && user?.thumbnail && (
                <Image
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: '1 / 1' }}
                    src={user?.thumbnail}
                    alt={user?.display || 'Thumbnail'}
                    width={256}
                    height={256}
                    priority
                    onError={() => setError(true)}
                />
            )}

            {isSame && (
                <Link
                    href="/settings/profile#thumbnail"
                    className={cn(
                        "absolute inset-0",
                        "bg-black/25",
                        "transition-opacity",
                        "opacity-0",
                        "hover:opacity-100",
                        "flex items-center justify-center"
                    )}
                >
                    <Icon icon="material-symbols:edit-rounded" className={cn("size-11 text-white", hover && "block")} />
                </Link>
            )}
        </div>
    );
}
