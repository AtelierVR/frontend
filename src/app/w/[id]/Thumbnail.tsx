'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { World } from '@/lib/api/types';

export default function WorldThumbnail({ world }: { world: World | null }) {
    return (
        <div className={cn(
            "relative w-full",
            "border-b border-fd-border",
            "bg-fd-muted/50 dark:bg-fd-muted/30"
        )}>
            {(!world || !world.thumbnail) && (
                <div className={cn(
                    "w-full h-48",
                    "bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-fd-muted/30",
                    !world && "animate-pulse"
                )} />
            )}
            {world?.thumbnail && (
                <Image
                    src={world.thumbnail}
                    alt={world.title}
                    width={1024}
                    height={256}
                    className="object-cover w-full"
                    style={{ aspectRatio: '128 / 45' }}
                    unoptimized
                />
            )}
        </div>
    );
}
