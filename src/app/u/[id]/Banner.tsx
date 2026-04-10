'use client';

import { cn } from '@/lib/cn';
import { useApi } from '@/lib/api';
import Image from 'next/image';
import { useState } from 'react';
import type { User } from '@/lib/api/types';
import { getSIDById } from '@/lib/api/utils';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function Banner({ user }: { user: User | null }) {
    const [hover, setHover] = useState(false);
    const [error, setError] = useState(false);
    const Api = useApi();
    const isSame = Api && Api.currentUser && user && getSIDById(Api.currentUser.id, Api.currentUser.server) === getSIDById(user.id, user.server);

    return (
        <div 
            onMouseOut={() => setHover(false)}
            onMouseOver={() => setHover(true)}
            className={cn(
                "relative flex items-center",
                "bg-fd-muted/50 dark:bg-fd-muted/30",
                "border-b border-fd-border",
                "rounded-b-lg",
            )}
        >
            {(error || !user?.banner) && (
                <div className="w-full h-48 bg-gradient-to-br from-fd-primary/10 to-fd-primary/5" />
            )}

            {!error && user?.banner && (
                <Image
                    className={cn(
                        "object-cover",
                        "w-full relative",
                        "rounded-b-lg"
                    )}
                    style={{ aspectRatio: '128 / 45' }}
                    src={user?.banner}
                    alt={user?.display || 'Banner'}
                    width={1024}
                    height={512}
                    priority
                    onError={() => setError(true)}
                />
            )}

            {isSame && (
                <Link
                    href="/settings/profile#banner"
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
