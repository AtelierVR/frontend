'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { World } from '@/lib/api/types';

export default function WorldThumbnail({ world }: { world: World | null }) {
    return (
        <div className={cn(
            "w-[8em] h-[8em]",
            "border border-fd-border",
            "rounded-xl overflow-hidden",
            "absolute -top-[4em]",
            "bg-fd-background"
        )}>
            {(!world || !world.thumbnail) && (
                <div className={cn(
                    "flex items-center justify-center",
                    "w-full h-full",
                    "bg-fd-muted",
                    world ? "" : "animate-pulse"
                )}>
                    {world && (
                        <span className="text-3xl select-none">🌍</span>
                    )}
                </div>
            )}
            {world?.thumbnail && (
                <Image
                    src={world.thumbnail}
                    alt={world.title}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                    unoptimized
                />
            )}
        </div>
    );
}
